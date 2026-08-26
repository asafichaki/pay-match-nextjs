"""AEO answer blocks for pages that have none.

Comparisons and pricing pages first. Gemini Flash drafts a 40-60 word answer
from the page's own table and verdict; Gemini Pro checks that every number
exists on the page; rules.py checks claims and figures again; the RPC writes
`aeo_answer` and the component emits the Speakable node with it.
`expert_quote_id` is chosen from `seo_expert_quotes` by topic match only.
A quote is never generated. 5 pages a day.
"""
from __future__ import annotations

import json
import sys
from typing import Any, Dict, List, Optional

import changes
import config
import pages
import rules as rules_mod
from ctx import Ctx


def candidates(ctx: Ctx, limit: int) -> List[Dict[str, Any]]:
    """Pages without `.aeo-answer`, comparisons + pricing first, refresh queue first of all."""
    queue = ctx.supa.setting("aeo_refresh_queue", []) or []
    ordered: List[str] = [q["path"] for q in queue if isinstance(q, dict) and q.get("path")]
    rest = [p for p in ctx.article_paths() if p not in ordered]
    rest.sort(key=lambda p: (0 if p.startswith("/comparisons/") else (1 if config.is_pricing_page(p) else 2),
                             -ctx.page_metrics(p)["impressions"], p))
    out: List[Dict[str, Any]] = []
    for p in ordered + rest:
        if len(out) >= limit:
            break
        if p in ctx.holdout or p in config.LOSER_PATHS or ctx.locked(p):
            continue
        forced = p in ordered
        if not forced and ctx.override(p).get("aeo_answer"):
            continue
        got = ctx.cache.get(p)
        if not got.ok:
            continue
        page = pages.Page(got.text, p)
        if page.has_aeo and not forced:
            continue
        if not page.tables and not page.verdict_line():
            continue  # nothing on the page to draft from
        out.append({"path": p, "page": page, "forced": forced})
    return out


def _prompt(page: pages.Page, path: str, rules: rules_mod.Rules) -> str:
    return (
        "Write the answer block that sits under the H1 of this myPayAdvisor page. It must answer the "
        "page's question in 40 to 60 words using ONLY facts and numbers that appear below.\n"
        f"URL: {config.to_url(path)}\nH1: {page.h1}\n"
        f"Comparison table (first rows):\n{page.table_text() or '(none)'}\n"
        f"Verdict paragraph: {page.verdict_line() or '(none)'}\n"
        f"Opening paragraphs: {' '.join(page.paragraphs[:3])[:1200]}\n\n"
        f"Rules: no em-dash, no exclamation mark; no words from: {', '.join(rules.list('banned_words'))}; "
        f"no claims like {', '.join(rules.list('forbidden_claims'))}; every percentage or dollar figure must "
        "be copied exactly from the material above; name the cheaper or better-fit option and the condition "
        "(volume, channel, risk) under which it wins; plain operator tone.\n"
        'Reply with JSON only: {"answer": "..."}'
    )


def pick_quote(ctx: Ctx, path: str) -> Optional[int]:
    """expert_quote_id from seo_expert_quotes by topic match; None when no match."""
    rows = ctx.supa.safe_get("seo_expert_quotes", {"select": "id,topic,topics,tags,quote,source_url"})
    if not rows:
        return None
    toks = config.slug_tokens(path)
    best: Optional[Dict[str, Any]] = None
    best_n = 0
    for r in rows:
        topics: List[str] = []
        for k in ("topic", "topics", "tags"):
            v = r.get(k)
            if isinstance(v, list):
                topics += [str(x).lower() for x in v]
            elif v:
                topics += str(v).lower().replace(",", " ").split()
        n = len(set(topics) & toks)
        if n > best_n and r.get("source_url"):
            best, best_n = r, n
    return int(best["id"]) if best else None


def run(ctx: Ctx, info: Dict[str, Any]) -> None:
    if not ctx.gemini.configured:
        info["skip"] = "GEMINI_API_KEY missing"
        return
    if not ctx.run.spend_ok(0.5):
        info["skip"] = "spend cap reached"
        return
    budget = ctx.cap(config.CAP_AEO_PER_DAY)
    cands = candidates(ctx, budget * 3)
    info["candidates"] = len(cands)
    handled = 0
    queue = ctx.supa.setting("aeo_refresh_queue", []) or []
    for c in cands:
        if handled >= budget:
            break
        path, page = c["path"], c["page"]
        try:
            out = ctx.gemini.generate_json(_prompt(page, path, ctx.rules), note=f"aeo {path}")
        except Exception as exc:  # noqa: BLE001
            print(f"   flash failed for {path}: {exc}", file=sys.stderr)
            continue
        answer = str((out or {}).get("answer", "")).strip() if isinstance(out, dict) else ""
        page_nums = rules_mod.page_numbers(page.text)
        res = rules_mod.validate_answer(ctx.rules, answer, page_nums)
        if not res.ok:
            print(f"   answer rejected for {path}: {res.reasons[:3]}", file=sys.stderr)
            continue
        verdict = ctx.gemini.judge(
            f"Page text (truncated): {page.text[:6000]}\n\nProposed answer block: {answer}\n\n"
            "Check every number, percentage and dollar figure in the answer appears verbatim in the page "
            "text; the answer does not add a provider, product or claim the page does not make; "
            "no guarantee or best-rate wording.", note=f"judge aeo {path}")
        if not verdict["ok"]:
            print(f"   judge rejected answer for {path}: {verdict['reasons'][:2]}", file=sys.stderr)
            continue
        kind, slug = config.kind_slug(path)
        status = changes.propose_or_apply(
            ctx, kind, slug, "aeo_answer", page.aeo_text or None, answer,
            "aeo block: drafted from the page table and verdict, judged, rules-checked"
            + (" (refresh)" if c["forced"] else ""),
            "loop:aeo", extra_revalidate=["/llms.txt", "/llms-full.txt"])
        if status in ("applied", "proposed"):
            handled += 1
            qid = pick_quote(ctx, path)
            if qid and not ctx.override(path).get("expert_quote_id"):
                changes.propose_or_apply(ctx, kind, slug, "expert_quote_id", None, str(qid),
                                         "expert quote: topic match in seo_expert_quotes", "loop:aeo")
            if c["forced"]:
                queue = [q for q in queue if not (isinstance(q, dict) and q.get("path") == path)]
    if not ctx.dry_run:
        ctx.supa.set_setting("aeo_refresh_queue", queue)
    info["proposals"] = handled
    info["note"] = f"{len(cands)} pages without an answer block, {handled} handled"


def queue_refresh(ctx: Ctx, path: str, reason: str) -> None:
    """Put a page at the head of the answer-refresh queue (weekly + escalation)."""
    queue = ctx.supa.setting("aeo_refresh_queue", []) or []
    if any(isinstance(q, dict) and q.get("path") == path for q in queue):
        return
    queue.insert(0, {"path": path, "reason": reason, "at": ctx.run_date.isoformat()})
    if ctx.dry_run:
        print(f"dry-run: would queue aeo refresh for {path} ({reason})", file=sys.stderr)
        return
    ctx.supa.set_setting("aeo_refresh_queue", queue)

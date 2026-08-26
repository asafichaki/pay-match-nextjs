"""Title lane.

Batch 1 (deterministic, no LLM): the over-length titles trimmed by rule.
Keep the money query first, drop the suffix via title_absolute=true, fit
60 chars on desktop and 52 when the page is more than 30% mobile, keep the
brand tokens on vs pages. Two waves three days apart, a 21-page holdout
matched on position band that no lane touches. Skipped entirely when
Check 1 found Google already rewrites >= 70% of them.

Batch 2 (LLM, from week 3): query x page scoring with site-derived p90 CTR
targets, Gemini Flash proposes 3, Gemini Pro judges, rules.py validates,
the RPC applies, then async verification.
"""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import re
import sys
from typing import Any, Dict, List, Optional, Set, Tuple

import changes
import config
import pages
import rules as rules_mod
from ctx import Ctx
from gsc import page_stats

# "A: B", "A | B", "A - B" (a hyphen inside a word never splits)
SEP_RE = re.compile(r"(?:\s+\|\s+|:\s+|\s+-\s+|\s+\u2013\s+|\s+\u2014\s+)")
YEAR_PAREN_RE = re.compile(r"\s*\((?:20\d\d(?:\s+(?:guide|update|edition))?)\)\s*", re.I)
SUFFIX_RE = re.compile(r"\s*[|\-\u2013\u2014]\s*myPayAdvisor\s*$", re.I)
BANDS: List[Tuple[float, float, str]] = [(0, 3, "1-3"), (3, 10, "4-10"), (10, 20, "11-20"),
                                         (20, 50, "21-50"), (50, 10_000, "50+")]


def band_of(position: float) -> str:
    for lo, hi, name in BANDS:
        if lo < position <= hi:
            return name
    return "50+" if position > 50 else "1-3"


def _tokens(text: str) -> Set[str]:
    return {t for t in re.findall(r"[a-z0-9]+", text.lower()) if t not in config.SLUG_STOPWORDS}


def strip_suffix(title: str) -> str:
    return SUFFIX_RE.sub("", title).strip()


def _contains_query(text: str, query: str) -> bool:
    if not query:
        return True
    q = _tokens(query)
    return bool(q) and q <= _tokens(text)


def trim_title(title: str, money_query: str, brand_tokens: Set[str], max_len: int) -> Optional[str]:
    """Deterministic trim. Returns None when no honest trim exists.

    Order of operations: strip the suffix; drop a year parenthetical; put the
    segment carrying the money query first and add segments while they fit;
    as a last resort cut the primary segment at a word boundary, but only if
    the money query and the brand tokens survive.
    """
    base = strip_suffix(title or "")
    base = re.sub(r"\s+", " ", base).strip()
    if not base:
        return None

    def ok(t: str) -> bool:
        low = t.lower()
        return (20 <= len(t) <= max_len and _contains_query(t, money_query)
                and all(b in low for b in brand_tokens))

    if ok(base):
        return base
    no_year = YEAR_PAREN_RE.sub(" ", base).strip()
    no_year = re.sub(r"\s+", " ", no_year)
    if ok(no_year):
        return no_year
    segments = [s.strip(" ,.") for s in SEP_RE.split(no_year) if s.strip(" ,.")]
    if not segments:
        return None
    primary_i = next((i for i, s in enumerate(segments) if _contains_query(s, money_query)), None)
    if primary_i is None:
        primary_i = next((i for i, s in enumerate(segments)
                          if all(b in s.lower() for b in brand_tokens)), 0)
    ordered = [segments[primary_i]] + [s for i, s in enumerate(segments) if i != primary_i]
    built = ordered[0]
    for seg in ordered[1:]:
        candidate = f"{built}: {seg}"
        if len(candidate) <= max_len:
            built = candidate
        else:
            break
    if ok(built):
        return built
    # last resort: cut the primary segment at a word boundary
    words = ordered[0].split()
    while len(words) > 3:
        words.pop()
        cut = " ".join(words).rstrip(",:;-")
        if ok(cut):
            return cut
    return None


# ------------------------------------------------------------ current titles
def current_titles(ctx: Ctx, paths: List[str]) -> Dict[str, str]:
    """path -> current title from the build manifest or the live page."""
    out: Dict[str, str] = {}
    manifest = pages.fetch(f"{config.SITE_BASE}/seo-manifest.json")
    if manifest.ok:
        try:
            data = json.loads(manifest.text)
            routes = data.get("routes") if isinstance(data, dict) else data
            for entry in routes or []:
                route = entry.get("route") or entry.get("path")
                title = entry.get("base_title") or entry.get("title")
                if route and title:
                    out[config.to_path(route)] = title
        except ValueError:
            pass
    for p in paths:
        if p in out:
            continue
        got = ctx.cache.get(p)
        if got.ok:
            out[p] = pages.Page(got.text, p).title
    return out


# ------------------------------------------------------------ holdout
def choose_holdout(candidates: Dict[str, float], size: int = config.HOLDOUT_SIZE,
                   seed: str = "mpa-seo-holdout-2026") -> List[str]:
    """Deterministic, position-band matched sample of `size` pages.

    Proportional allocation per band with at least one page from every
    non-empty band; inside a band the order is a hash so nobody can steer it.
    """
    by_band: Dict[str, List[str]] = {}
    for path, pos in candidates.items():
        by_band.setdefault(band_of(pos), []).append(path)
    total = sum(len(v) for v in by_band.values())
    if total == 0:
        return []
    size = min(size, total)
    alloc: Dict[str, int] = {}
    for b, paths in by_band.items():
        alloc[b] = max(1, int(round(size * len(paths) / total)))
    while sum(alloc.values()) > size:
        big = max(alloc, key=lambda k: alloc[k])
        alloc[big] -= 1
    while sum(alloc.values()) < size:
        room = {b: len(by_band[b]) - alloc[b] for b in alloc if len(by_band[b]) > alloc[b]}
        if not room:
            break
        alloc[max(room, key=lambda k: room[k])] += 1
    chosen: List[str] = []
    for b, paths in by_band.items():
        ordered = sorted(paths, key=lambda p: hashlib.sha1(f"{seed}:{p}".encode()).hexdigest())
        chosen.extend(ordered[:alloc[b]])
    return sorted(chosen)


def ensure_holdout(ctx: Ctx, candidates: Dict[str, float]) -> Set[str]:
    stored = ctx.supa.setting("holdout", None)
    if stored and stored.get("pages"):
        return set(stored["pages"])
    chosen = choose_holdout(candidates)
    if chosen and not ctx.dry_run:
        ctx.supa.set_setting("holdout", {"pages": chosen, "chosen_at": ctx.run_date.isoformat(),
                                         "bands": {p: band_of(candidates[p]) for p in chosen}})
    elif chosen:
        print(f"dry-run: holdout of {len(chosen)} pages not stored", file=sys.stderr)
    return set(chosen)


# ------------------------------------------------------------ batch 1
def h1_needs_move(h1: str, money_query: str) -> bool:
    """Day-0 amendment 2: the H1, not the length, is Google's rewrite trigger.

    The H1 moves with the title whenever it is longer than 60 chars or does
    not carry the money query.
    """
    h = (h1 or "").strip()
    return (not h) or len(h) > 60 or not _contains_query(h, money_query)


def overlength_candidates(ctx: Ctx, paths: List[str]) -> List[Dict[str, Any]]:
    """Every article page whose current title is over its limit.

    Pages whose index state is not confirmed are not candidates (amendment
    3); they are queued in seo_settings['inspect_extra'] so tomorrow's index
    watch resolves them.
    """
    out: List[Dict[str, Any]] = []
    unconfirmed: List[str] = []
    for p in paths:
        title = ctx.titles.get(p)
        if not title or p in config.LOSER_PATHS:
            continue
        pm = ctx.page_metrics(p)
        st = page_stats(ctx.idx, p)
        max_len = 52 if pm["mobile_share"] > config.MOBILE_SHARE_GUIDE else 60
        if len(title) <= max_len:
            continue
        if not ctx.is_indexed(p):
            unconfirmed.append(p)
            continue
        kind, slug = config.kind_slug(p)
        brand = {t for t in config.slug_tokens(p) if t in config.BRAND_TOKENS} if "-vs-" in slug else set()
        h1 = ""
        got = ctx.cache.get(p)
        if got.ok:
            h1 = pages.Page(got.text, p).h1
        out.append({"path": p, "kind": kind, "slug": slug, "title": title, "max_len": max_len,
                    "mobile_share": pm["mobile_share"], "money_query": st["money_query"],
                    "human_impr": st["human_impr"], "position": st["position"] or pm["position"],
                    "brand": brand, "h1": h1, "h1_move": h1_needs_move(h1, st["money_query"])})
    out.sort(key=lambda c: -c["human_impr"])
    if unconfirmed:
        print(f"   {len(unconfirmed)} over-length titles wait for index confirmation", file=sys.stderr)
        if not ctx.dry_run:
            ctx.supa.set_setting("inspect_extra", unconfirmed[:120])
    ctx.report_bits["titles_unconfirmed"] = len(unconfirmed)
    return out


def wave_state(ctx: Ctx) -> Dict[str, Any]:
    return ctx.supa.setting("title_waves", {}) or {}


def wave_may_apply(ctx: Ctx, wave: str, waves: Dict[str, Any]) -> bool:
    """Wave A from day 8 (or `title_wave_a_from`), wave B >= 3 days after A applied."""
    a_from = ctx.supa.setting("title_wave_a_from", None) or (config.DAY0 + dt.timedelta(days=8)).isoformat()
    if wave == "A":
        return ctx.run_date.isoformat() >= a_from
    a_applied = (waves.get("A") or {}).get("applied_on")
    if not a_applied:
        return False
    return ctx.run_date >= dt.date.fromisoformat(a_applied) + dt.timedelta(days=config.TITLE_WAVE_GAP_DAYS)


def batch1(ctx: Ctx, info: Dict[str, Any]) -> None:
    """Deterministic trims with holdout and two waves."""
    if ctx.check1_rewrite_rate >= config.CHECK1_REWRITE_SKIP:
        info["skip"] = f"Check 1: Google rewrites {ctx.check1_rewrite_rate:.0%} of titles, lane demoted"
        return
    paths = ctx.article_paths()
    cands = overlength_candidates(ctx, paths)
    info["candidates"] = len(cands)
    if not cands:
        info["note"] = "no over-length titles"
        return
    positions = {c["path"]: c["position"] for c in cands}
    ctx.holdout = ensure_holdout(ctx, positions) or ctx.holdout
    live = [c for c in cands if c["path"] not in ctx.holdout]
    half = (len(live) + 1) // 2
    waves = wave_state(ctx)
    plan = {"A": [c["path"] for c in live[:half]], "B": [c["path"] for c in live[half:]]}
    if not waves.get("A"):
        waves = {"A": {"pages": plan["A"]}, "B": {"pages": plan["B"]}}
    done = proposed = 0
    budget = ctx.cap(config.CAP_TITLES_PER_DAY)
    for c in live:
        if done >= budget:
            break
        p = c["path"]
        if ctx.locked(p) or p in ctx.citation_lock:
            continue
        wave = "A" if p in waves["A"]["pages"] else "B"
        new = trim_title(c["title"], c["money_query"], c["brand"], c["max_len"])
        if not new:
            print(f"   no honest trim for {p}", file=sys.stderr)
            continue
        res = rules_mod.validate_title(ctx.rules, new, absolute=True, mobile_share=c["mobile_share"])
        if not res.ok:
            print(f"   trim rejected for {p}: {res.reasons}", file=sys.stderr)
            continue
        may_apply = wave_may_apply(ctx, wave, waves)
        reason = (f"batch1 trim wave {wave}: {len(c['title'])} > {c['max_len']} chars, "
                  f"money query '{c['money_query']}' kept first")
        status = changes.propose_or_apply(
            ctx, c["kind"], c["slug"], "meta_title", c["title"], new, reason,
            "loop:titles_b1", may_apply=may_apply)
        if status in ("applied", "proposed"):
            # The RPC takes one field per call, so the bundle is three calls
            # back to back under the same reason; a composite field would need
            # a signature change (noted in the README).
            changes.propose_or_apply(ctx, c["kind"], c["slug"], "title_absolute", "false", "true",
                                     reason + " (suffix dropped)", "loop:titles_b1", may_apply=may_apply)
            if c.get("h1_move"):
                changes.propose_or_apply(ctx, c["kind"], c["slug"], "h1_override", c.get("h1") or None, new,
                                         reason + " (H1 moves with the title)", "loop:titles_b1",
                                         may_apply=may_apply)
        if status == "applied":
            waves[wave].setdefault("applied_on", ctx.run_date.isoformat())
            done += 1
        elif status == "proposed":
            proposed += 1
            done += 1
    if not ctx.dry_run:
        ctx.supa.set_setting("title_waves", waves)
    info["proposals"] = proposed + len([a for a in ctx.applied if a["source"] == "loop:titles_b1"])
    info["note"] = f"{len(cands)} over-length, holdout {len(ctx.holdout)}, {done} handled today"


# ------------------------------------------------------------ batch 2
def p90_targets(idx: Dict[str, List[Dict[str, Any]]], min_impr: int = 20) -> Dict[str, float]:
    """Site-derived p90 CTR per position band over query x page rows."""
    by_band: Dict[str, List[float]] = {}
    for rows in idx.values():
        for r in rows:
            if r["bot"] or r["impressions"] < min_impr:
                continue
            by_band.setdefault(band_of(r["position"]), []).append(r["ctr"])
    out: Dict[str, float] = {}
    for b, vals in by_band.items():
        vals.sort()
        out[b] = vals[min(len(vals) - 1, int(0.9 * (len(vals) - 1)))] if vals else 0.0
    return out


def llm_candidates(ctx: Ctx, exclusions: Set[str]) -> List[Dict[str, Any]]:
    targets = p90_targets(ctx.idx)
    lo, hi = config.LLM_TITLE_POSITION_BAND
    scored: List[Dict[str, Any]] = []
    for path, rows in ctx.idx.items():
        if not path.startswith(("/comparisons/", "/insights/")) or path in exclusions:
            continue
        if path in ctx.holdout or path in config.LOSER_PATHS or path in ctx.citation_lock or ctx.locked(path):
            continue
        if not ctx.is_indexed(path):
            continue
        st = page_stats(ctx.idx, path)
        if st["human_impr"] < config.MIN_HUMAN_IMPR_28D or st["bot_share"] > config.BOT_SHARE_EXCLUDE:
            continue
        score = 0.0
        best_q = ""
        for r in rows:
            if r["bot"] or not (lo <= r["position"] <= hi):
                continue
            gap = targets.get(band_of(r["position"]), 0.0) - r["ctr"]
            if gap > 0:
                score += r["impressions"] * gap
                if not best_q:
                    best_q = r["query"]
        if score > 0:
            scored.append({"path": path, "score": round(score, 2), "money_query": best_q or st["money_query"],
                           "human_impr": st["human_impr"], "position": st["position"]})
    scored.sort(key=lambda c: -c["score"])
    return scored


def _prompt(page: pages.Page, path: str, queries: List[Dict[str, Any]], serp_titles: List[str],
            aio: bool, max_len: int, rules: rules_mod.Rules) -> str:
    qlines = "\n".join(f"- {q['query']} ({q['impressions']} impressions, position {q['position']:.1f})"
                       for q in queries[:6] if not q["bot"])
    return (
        "You write page titles for myPayAdvisor.com, an independent payment-processor advisory site.\n"
        f"Page: {config.to_url(path)}\nH1: {page.h1}\nCurrent title: {page.title}\n"
        f"Lead numbers on the page (the only figures you may use): {', '.join(page.lead_numbers())}\n"
        f"Search queries that reach this page (put the first one's words first):\n{qlines}\n"
        f"Top SERP titles for the first query:\n" + "\n".join(f"- {t}" for t in serp_titles[:10]) + "\n"
        f"Google shows an AI Overview for this query: {'yes' if aio else 'no'}\n\n"
        f"Rules: at most {max_len} characters including spaces; no site suffix; no em-dash, no exclamation "
        f"mark; no words from this list: {', '.join(rules.list('banned_words'))}; no claims like "
        f"{', '.join(rules.list('forbidden_claims'))}; numbers only if they appear in the lead numbers above; "
        "plain operator tone, no clickbait. Propose 3 distinct titles.\n"
        'Reply with JSON only: {"titles": ["...", "...", "..."]}'
    )


def batch2(ctx: Ctx, info: Dict[str, Any]) -> None:
    """LLM titles on scored candidates. Off until LLM_TITLES_FROM (week 3)."""
    start = ctx.supa.setting("llm_titles_from", None) or config.LLM_TITLES_FROM.isoformat()
    if ctx.run_date.isoformat() < start:
        info["skip"] = f"LLM titles start {start}"
        return
    if not ctx.gemini.configured:
        info["skip"] = "GEMINI_API_KEY missing"
        return
    if not ctx.run.spend_ok(0.5):
        info["skip"] = "spend cap reached"
        return
    import llm
    cands = llm_candidates(ctx, set())
    info["candidates"] = len(cands)
    budget = ctx.cap(config.CAP_TITLES_PER_DAY)
    handled = 0
    for c in cands:
        if handled >= budget:
            break
        path = c["path"]
        got = ctx.cache.get(path)
        if not got.ok:
            continue
        page = pages.Page(got.text, path)
        pm = ctx.page_metrics(path)
        max_len = 52 if pm["mobile_share"] > config.MOBILE_SHARE_GUIDE else 60
        serp = llm.dataforseo_serp(c["money_query"], spend_cb=ctx.run.add_spend, depth=30, advanced=True)
        serp_titles = [it["title"] for it in serp.get("items", []) if it.get("title")]
        prompt = _prompt(page, path, ctx.idx.get(path, []), serp_titles, serp.get("ai_overview", False),
                         max_len, ctx.rules)
        try:
            out = ctx.gemini.generate_json(prompt, note=f"title {path}")
        except Exception as exc:  # noqa: BLE001
            print(f"   flash failed for {path}: {exc}", file=sys.stderr)
            continue
        titles = [str(t).strip() for t in (out.get("titles") if isinstance(out, dict) else out) or []]
        page_nums = rules_mod.page_numbers(page.text)
        chosen = None
        for t in titles:
            res = rules_mod.validate_title(ctx.rules, t, absolute=True, mobile_share=pm["mobile_share"])
            if not res.ok:
                continue
            nums = rules_mod.extract_numbers(t)
            if any(n not in page_nums for n in nums):
                continue
            if not _contains_query(t, c["money_query"]):
                continue
            verdict = ctx.gemini.judge(
                f"Page H1: {page.h1}\nPage lead numbers: {', '.join(page.lead_numbers())}\n"
                f"Money query: {c['money_query']}\nProposed title: {t}\n"
                "Check: every fact and number in the title appears on the page; the money query's words are "
                "present; no guarantee, best-rate, cheapest-always or approval-odds claim; no clickbait.",
                note=f"judge {path}")
            if verdict["ok"]:
                chosen = t
                break
            print(f"   judge rejected {t!r}: {verdict['reasons'][:2]}", file=sys.stderr)
        if not chosen:
            continue
        reason = f"llm title: score {c['score']} on '{c['money_query']}' at pos {c['position']:.1f}"
        kind, slug = config.kind_slug(path)
        status = changes.propose_or_apply(ctx, kind, slug, "meta_title", page.title, chosen, reason,
                                          "loop:titles_llm")
        if status in ("applied", "proposed"):
            changes.propose_or_apply(ctx, kind, slug, "title_absolute", "false", "true",
                                     reason + " (suffix dropped)", "loop:titles_llm")
            if h1_needs_move(page.h1, c["money_query"]):
                changes.propose_or_apply(ctx, kind, slug, "h1_override", page.h1 or None, chosen,
                                         reason + " (H1 moves with the title)", "loop:titles_llm")
            handled += 1
    info["proposals"] = handled
    info["note"] = f"{len(cands)} scored candidates, {handled} handled"

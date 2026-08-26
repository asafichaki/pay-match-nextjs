"""Weekly (Monday): probes, citation-loss handling, competitor watch, Bing
index count, monthly backlinks summary, cannibalization detector.

Probe rule: a parse failure is `unknown`, never `not cited`. A citation lost
on any engine schedules an `aeo_answer` refresh for that page within 24h; the
title is never touched. Pages cited in the last two rounds get
`citation_lock` (kept in seo_settings and honoured by the title lane).
"""
from __future__ import annotations

import datetime as dt
import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

import requests

import aeo
import config
import links
import llm
import pages
from ctx import Ctx

DATA = config.PACKAGE_DIR / "data"


def _load(name: str) -> List[Dict[str, Any]]:
    return json.loads((DATA / name).read_text(encoding="utf-8"))["queries"]


def _our_hit(sources: List[Dict[str, str]]) -> Optional[Dict[str, Any]]:
    for i, s in enumerate(sources):
        blob = f"{s.get('uri', '')} {s.get('title', '')}".lower()
        if "mypayadvisor" in blob:
            return {"rank": i + 1, "url": s.get("uri", ""), "title": s.get("title", "")}
    return None


def _domain(uri: str) -> str:
    m = re.match(r"^https?://([^/]+)", uri or "")
    return m.group(1).lower().replace("www.", "") if m else (uri or "")[:60]


# ------------------------------------------------------------ probes
def probes(ctx: Ctx, info: Dict[str, Any]) -> Dict[str, Any]:
    queries = _load("probe-queries.json")
    if ctx.limit:
        queries = queries[:ctx.limit]
    engines = ["gemini"]
    if config.env("ANTHROPIC_API_KEY"):
        engines.append("claude")
    if config.env("OPENAI_API_KEY"):
        engines.append("openai")
    if not ctx.gemini.configured:
        info["skip"] = "GEMINI_API_KEY missing"
        return {}
    if not ctx.run.spend_ok(1.0):
        info["skip"] = "spend cap reached"
        return {}
    previous = ctx.supa.safe_get("seo_probe_results", {"order": "date.desc", "select": "date,query_id,engine,cited,url"},
                                 limit=400)
    prev_dates = sorted({r["date"] for r in previous}, reverse=True)[:2]
    prev_by_q: Dict[str, Dict[str, Any]] = {}
    for r in previous:
        if r["date"] in prev_dates[:1]:
            d = prev_by_q.setdefault(r["query_id"], {"cited": False, "url": None})
            if r.get("cited"):
                d["cited"] = True
                d["url"] = d["url"] or r.get("url")
    rows: List[Dict[str, Any]] = []
    per_bucket: Dict[str, Dict[str, int]] = {}
    cited_any: Set[str] = set()
    for q in queries:
        b = per_bucket.setdefault(q["bucket"], {"n": 0, "cited": 0})
        b["n"] += 1
        any_hit = False
        for engine in engines:
            if engine == "gemini":
                res = ctx.gemini.grounded(q["query"], note=f"probe {q['id']}")
            elif engine == "claude":
                res = llm.anthropic_search(q["query"], spend_cb=ctx.run.add_spend)
            else:
                res = llm.openai_search(q["query"], spend_cb=ctx.run.add_spend)
            hit = _our_hit(res.get("sources", [])) if res.get("parsed") else None
            cited: Optional[bool] = (hit is not None) if res.get("parsed") else None
            if cited:
                any_hit = True
            rows.append({
                "date": ctx.run_date.isoformat(), "query_id": q["id"], "query": q["query"],
                "bucket": q["bucket"], "engine": engine, "cited": cited,
                "rank": hit["rank"] if hit else None, "url": hit["url"] if hit else None,
                "sources": [_domain(s.get("uri", "")) or s.get("title", "") for s in res.get("sources", [])][:10],
                "error": res.get("error"),
            })
            print(f"   {engine:7} {q['id']:3} {q['query'][:45]:45} -> "
                  f"{'CITED #' + str(hit['rank']) if hit else ('unknown' if cited is None else 'no')}", file=sys.stderr)
        if any_hit:
            b["cited"] += 1
            cited_any.add(q["id"])
    ctx.supa.safe_upsert("seo_probe_results", rows, on_conflict="date,query_id,engine")
    retained = gained = lost = 0
    lost_pages: List[str] = []
    for q in queries:
        was = prev_by_q.get(q["id"], {}).get("cited", False)
        now = q["id"] in cited_any
        if was and now:
            retained += 1
        elif now and not was:
            gained += 1
        elif was and not now:
            lost += 1
            url = prev_by_q[q["id"]].get("url")
            if url:
                lost_pages.append(config.to_path(url))
    for p in dict.fromkeys(lost_pages):
        if p.startswith(("/comparisons/", "/insights/")):
            aeo.queue_refresh(ctx, p, "citation lost in weekly probe")
    # citation_lock: pages cited in the last 2 rounds (this one + previous)
    lock: Set[str] = set()
    cited_now = {config.to_path(r["url"]) for r in rows if r.get("cited") and r.get("url")}
    cited_prev = {config.to_path(r["url"]) for r in previous if r.get("cited") and r.get("url")
                  and r["date"] in prev_dates[:1]}
    lock = {p for p in cited_now | cited_prev if p.startswith(("/comparisons/", "/insights/"))}
    if not ctx.dry_run:
        ctx.supa.set_setting("citation_lock", {"pages": sorted(lock), "at": ctx.run_date.isoformat()})
    headline_buckets = {k: v for k, v in per_bucket.items() if k != "brand"}
    summary = {
        "date": ctx.run_date.isoformat(), "engines": engines, "total": sum(v["n"] for v in headline_buckets.values()),
        "cited": sum(v["cited"] for v in headline_buckets.values()), "buckets": per_bucket,
        "retained": retained, "gained": gained, "lost": lost, "lost_pages": lost_pages,
        "citation_lock": sorted(lock), "unknown": sum(1 for r in rows if r["cited"] is None),
    }
    if not ctx.dry_run:
        ctx.supa.set_setting("probe_summary", summary)
    ctx.report_bits["citations"] = summary
    info["note"] = (f"cited {summary['cited']}/{summary['total']} on {len(engines)} engines, "
                    f"retained {retained} gained {gained} lost {lost}")
    return summary


# ------------------------------------------------------------ competitor watch
def competitor_watch(ctx: Ctx, info: Dict[str, Any]) -> List[str]:
    if not (config.env("DATAFORSEO_LOGIN") and config.env("DATAFORSEO_PASSWORD")):
        info["skip"] = "DataForSEO creds missing"
        return []
    if not ctx.run.spend_ok(0.2):
        info["skip"] = "spend cap reached"
        return []
    queries = _load("money-queries.json")
    if ctx.limit:
        queries = queries[:ctx.limit]
    stored: Dict[str, Any] = ctx.supa.setting("competitor_hashes", {}) or {}
    changes_out: List[str] = []
    presence_rows: List[Dict[str, Any]] = []
    for n, q in enumerate(queries, start=1):
        # depth 100, ONE task per call (day-0 amendment): the same response
        # feeds the top-3 hash watch and the live-SERP presence check that
        # tells "GSC says 18.8" apart from "not in the top 99 on desktop".
        serp = llm.dataforseo_serp(q["query"], spend_cb=ctx.run.add_spend, depth=100, advanced=True)
        top3 = [it for it in serp.get("items", []) if it.get("url")][:3]
        prev = stored.get(q["query"], {})
        entry: Dict[str, Any] = {"checked": ctx.run_date.isoformat(), "pages": {}}
        ours = [it for it in serp.get("items", []) if "mypayadvisor" in (it.get("domain") or "")]
        our_rank = ours[0]["rank"] if ours else None
        entry["our_rank"] = our_rank
        presence_rows.append({
            "date": ctx.run_date.isoformat(), "query_id": f"M{n}", "query": q["query"],
            "bucket": q.get("kind", "money"), "engine": "google_desktop",
            "cited": (our_rank is not None) if not serp.get("error") else None,
            "rank": our_rank, "url": ours[0]["url"] if ours else None,
            "sources": [it.get("domain") or "" for it in serp.get("items", [])[:10]],
            "error": serp.get("error"),
        })
        print(f"   google  {q['query'][:45]:45} -> {'#' + str(our_rank) if our_rank else 'not in top 100'}",
              file=sys.stderr)
        for it in top3:
            got = pages.fetch(it["url"], timeout=20)
            h = pages.content_hash(got.text) if got.ok else f"http-{got.status}"
            entry["pages"][it["url"]] = {"rank": it["rank"], "hash": h, "title": (it.get("title") or "")[:120]}
            old = (prev.get("pages") or {}).get(it["url"])
            if old and old.get("hash") != h and got.ok:
                changes_out.append(f"{q['query']}: #{it['rank']} {_domain(it['url'])} changed content")
        old_urls = set((prev.get("pages") or {}).keys())
        new_urls = set(entry["pages"].keys())
        for u in new_urls - old_urls:
            if prev:
                changes_out.append(f"{q['query']}: new in top 3: {_domain(u)}")
        stored[q["query"]] = entry
    ctx.supa.safe_upsert("seo_probe_results", presence_rows, on_conflict="date,query_id,engine")
    if not ctx.dry_run:
        ctx.supa.set_setting("competitor_hashes", stored)
    ctx.report_bits["competitor_changes"] = changes_out
    ctx.report_bits["money_ranks"] = {q["query"]: stored.get(q["query"], {}).get("our_rank") for q in queries}
    in_top100 = sum(1 for r in presence_rows if r["cited"])
    ctx.report_bits["money_presence"] = {"in_top100": in_top100, "total": len(presence_rows)}
    info["note"] = f"{len(queries)} queries, {len(changes_out)} changes, in top 100 on {in_top100}"
    return changes_out


# ------------------------------------------------------------ bing + backlinks
def bing_indexed(ctx: Ctx, info: Dict[str, Any]) -> Optional[int]:
    key = config.env("BING_WEBMASTER_API_KEY")
    if not key:
        info["skip"] = "BING_WEBMASTER_API_KEY missing"
        return None
    try:
        r = requests.get("https://ssl.bing.com/webmaster/api.svc/json/GetCrawlStats",
                         params={"siteUrl": config.SITE_BASE + "/", "apikey": key}, timeout=30)
        data = r.json()
        stats = data.get("d") or []
        latest = stats[-1] if stats else {}
        count = latest.get("InIndex")
    except (requests.RequestException, ValueError, AttributeError, IndexError) as exc:
        info["note"] = f"bing error {str(exc)[:80]}"
        return None
    if not ctx.dry_run:
        ctx.supa.set_setting("bing_index", {"in_index": count, "at": ctx.run_date.isoformat()})
    ctx.report_bits["bing_indexed"] = count
    info["note"] = f"Bing InIndex {count}"
    return count


def backlinks_summary(ctx: Ctx, info: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Monthly, on the first weekly run of the month."""
    last = ctx.supa.setting("backlinks_summary", {}) or {}
    if (last.get("at") or "")[:7] == ctx.run_date.isoformat()[:7]:
        info["skip"] = "already pulled this month"
        return None
    login, password = config.env("DATAFORSEO_LOGIN"), config.env("DATAFORSEO_PASSWORD")
    if not (login and password):
        info["skip"] = "DataForSEO creds missing"
        return None
    if ctx.dry_run:
        info["skip"] = "dry-run: paid call skipped"
        return None
    try:
        r = requests.post("https://api.dataforseo.com/v3/backlinks/summary/live",
                          json=[{"target": config.SITE_HOST, "include_subdomains": True}],
                          auth=(login, password), timeout=60)
        data = r.json()
    except (requests.RequestException, ValueError) as exc:
        info["note"] = f"error {str(exc)[:80]}"
        return None
    ctx.run.add_spend(float(data.get("cost") or 0), "dataforseo backlinks summary")
    res = ((data.get("tasks") or [{}])[0].get("result") or [{}])[0]
    summary = {"at": ctx.run_date.isoformat(), "backlinks": res.get("backlinks"),
               "referring_domains": res.get("referring_domains"), "rank": res.get("rank"),
               "referring_domains_nofollow": res.get("referring_domains_nofollow")}
    ctx.supa.set_setting("backlinks_summary", summary)
    ctx.report_bits["backlinks"] = summary
    info["note"] = f"{summary['referring_domains']} ref domains, rank {summary['rank']}"
    return summary


def cannibalization(ctx: Ctx, info: Dict[str, Any]) -> List[List[str]]:
    pairs = links.slug_pairs_cannibal(list(ctx.sitemap.keys()))
    ctx.report_bits["cannibal_pairs"] = pairs
    info["note"] = f"{len(pairs)} slug groups share a brand set (308 proposed, never applied)"
    return pairs

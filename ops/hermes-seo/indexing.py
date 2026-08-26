"""Indexing lane: IndexNow batch, sitemap submit, index watch, escalation
ladder, and the day-0 baseline import.

Honest framing carried into every report line: IndexNow reaches Bing and
Copilot only; Google ignores it. There is no "request indexing" API, so the
ladder escalates through things Google does react to: links from recently
crawled pages, then a content-class change (answer block + lastmod bump),
then a human decision with the diagnosis attached.
"""
from __future__ import annotations

import datetime as dt
import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

import requests

import config
import pages
from supa import Supa

INDEXED_STATES = ("submitted and indexed", "indexed, not submitted in sitemap", "indexed")
NOT_INDEXED_HINTS = ("not indexed", "excluded", "discovered", "alternate page", "duplicate",
                     "blocked", "soft 404", "not found", "redirect")


# ------------------------------------------------------------ sitemap
def load_sitemap(state: Path) -> Dict[str, Optional[str]]:
    """Live sitemap, cached to the state dir; last good copy on failure."""
    cache = state / "sitemap.xml"
    got = pages.fetch(f"{config.SITE_BASE}/sitemap.xml")
    if got.ok and "<urlset" in got.text:
        try:
            cache.write_text(got.text, encoding="utf-8")
        except OSError:
            pass
        return config.parse_sitemap(got.text)
    if cache.exists():
        print(f"warn: live sitemap failed ({got.status}), using cached copy", file=sys.stderr)
        return config.parse_sitemap(cache.read_text(encoding="utf-8"))
    print(f"warn: sitemap unavailable ({got.status} {got.error})", file=sys.stderr)
    return {}


def changed_urls_7d(sitemap: Dict[str, Optional[str]], supa: Supa, run_date: dt.date) -> List[str]:
    """URLs whose sitemap lastmod moved in 7 days, plus content-class overrides."""
    since = run_date - dt.timedelta(days=7)
    urls: List[str] = []
    for path, lm in sitemap.items():
        if lm and lm[:10] >= since.isoformat() and lm[:10] <= run_date.isoformat():
            urls.append(config.to_url(path))
    rows = supa.safe_get("seo_changes", {
        "status": "in.(applied,verification_pending,verified)",
        "field": "in.(aeo_answer,expert_quote_id,restore)",
        "applied_at": f"gte.{since.isoformat()}", "select": "kind,slug"})
    for r in rows:
        u = config.to_url(config.path_of(r["kind"], r["slug"]))
        if u not in urls:
            urls.append(u)
    return sorted(set(urls))


# ------------------------------------------------------------ indexnow
def indexnow_batch(urls: List[str], dry_run: bool) -> List[Dict[str, Any]]:
    """One POST per endpoint with the whole URL list. Bing/Copilot only."""
    urls = [u for u in urls if config.SITE_HOST in u]
    if not urls:
        return []
    body = {"host": config.SITE_HOST, "key": config.INDEXNOW_KEY,
            "keyLocation": f"{config.SITE_BASE}/{config.INDEXNOW_KEY}.txt", "urlList": urls[:10000]}
    results: List[Dict[str, Any]] = []
    for endpoint in config.INDEXNOW_ENDPOINTS:
        if dry_run:
            print(f"dry-run: skip IndexNow POST {endpoint} ({len(urls)} urls)", file=sys.stderr)
            results.append({"endpoint": endpoint, "status": 0, "ok": True, "skipped": True})
            continue
        try:
            resp = requests.post(endpoint, json=body, timeout=30,
                                 headers={"Content-Type": "application/json; charset=utf-8",
                                          "User-Agent": config.LOOP_UA})
            results.append({"endpoint": endpoint, "status": resp.status_code,
                            "ok": resp.status_code in (200, 202)})
        except requests.RequestException as exc:
            results.append({"endpoint": endpoint, "status": 0, "ok": False, "error": str(exc)[:120]})
    return results


# ------------------------------------------------------------ index watch
def classify(row: Optional[Dict[str, Any]]) -> str:
    """'indexed' | 'not_indexed' | 'unknown' from a seo_index_status row."""
    if not row or not row.get("checked_at"):
        return "unknown"
    verdict = (row.get("verdict") or "").upper()
    state = (row.get("coverage_state") or "").lower()
    if verdict == "PASS" or any(state.startswith(s) for s in INDEXED_STATES):
        return "indexed"
    if any(h in state for h in NOT_INDEXED_HINTS) or verdict in ("FAIL", "NEUTRAL"):
        return "not_indexed"
    return "unknown"


def diagnosis(row: Dict[str, Any], crawled_7d: bool) -> str:
    """The most likely cause, in one clause, from the diagnostic fields."""
    url = row.get("url", "")
    gc = row.get("google_canonical") or ""
    if gc and gc.rstrip("/") != url.rstrip("/"):
        return f"canonical fight: Google chose {config.to_path(gc)}"
    fetch_state = (row.get("page_fetch_state") or "").upper()
    if fetch_state and fetch_state != "SUCCESSFUL":
        return f"fetch problem: {fetch_state}"
    state = (row.get("coverage_state") or "").lower()
    if "discovered" in state:
        return "discovered, never crawled: no link/crawl signal"
    if not row.get("last_crawl") and not crawled_7d:
        return "no crawl signal: not fetched by Googlebot"
    if "crawled" in state and "not indexed" in state:
        return "crawled, not indexed: quality or duplicate signal"
    return state or "unknown"


def index_watch(supa: Supa, gsc_client: Any, tracked: Dict[str, Set[str]], limit: int,
                dry_run: bool, state: Path, run_date: dt.date) -> Dict[str, Any]:
    """Inspect up to `limit` URLs: never-inspected first, then oldest.

    The queue is the tracked set plus `seo_settings['inspect_extra']`, the
    title candidates the title lane could not touch yesterday because their
    index state was unknown (day-0 amendment 3).
    """
    existing = {r["url"]: r for r in supa.safe_get("seo_index_status")}
    extra = supa.setting("inspect_extra", []) or []
    queue: List[str] = list(tracked) + [p for p in extra if isinstance(p, str) and p not in tracked]
    order: List[Tuple[int, str, str]] = []
    for path in queue:
        url = config.to_url(path)
        row = existing.get(url)
        if not row or not row.get("checked_at"):
            order.append((0, "", url))
        else:
            order.append((1, row["checked_at"], url))
    order.sort()
    todo = [u for _, _, u in order[:limit]]
    now = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
    results: List[Dict[str, Any]] = []
    rows: List[Dict[str, Any]] = []
    for url in todo:
        rec = gsc_client.inspect(url)
        results.append(rec)
        if rec.get("error"):
            print(f"   inspect {config.to_path(url)}: error {rec['error'][:80]}", file=sys.stderr)
            continue
        rows.append({
            "url": url, "verdict": rec.get("verdict"), "coverage_state": rec.get("coverage_state"),
            "google_canonical": rec.get("google_canonical"), "user_canonical": rec.get("user_canonical"),
            "page_fetch_state": rec.get("page_fetch_state"), "crawled_as": rec.get("crawled_as"),
            "referring_urls": rec.get("referring_urls") or [], "last_crawl": rec.get("last_crawl"),
            "checked_at": now,
        })
        print(f"   inspect {config.to_path(url)}: {rec.get('coverage_state')} last={rec.get('last_crawl')}",
              file=sys.stderr)
    # full diagnostics (rich results, mobile, robots) live in the state dir
    try:
        (state / f"inspect-{run_date.isoformat()}.json").write_text(json.dumps(results, indent=1))
    except OSError:
        pass
    written = supa.safe_upsert("seo_index_status", rows, on_conflict="url")
    merged = dict(existing)
    for r in rows:
        merged[r["url"]] = {**existing.get(r["url"], {}), **r}
    return {"inspected": len(todo), "written": written, "rows": merged, "errors": [r for r in results if r.get("error")]}


def crawl_hits_7d(supa: Supa, run_date: dt.date) -> Dict[str, int]:
    """url -> Googlebot fetch count in the last 7 days, from seo_crawl_hits."""
    since = (run_date - dt.timedelta(days=7)).isoformat()
    rows = supa.safe_get("seo_crawl_hits", {"ts": f"gte.{since}", "ua_class": "eq.googlebot",
                                            "select": "url,ts"})
    out: Dict[str, int] = {}
    for r in rows:
        u = config.to_path(r.get("url") or "")
        out[u] = out.get(u, 0) + 1
    return out


def index_summary(rows: Dict[str, Dict[str, Any]], tracked: Dict[str, Set[str]],
                  previous: Dict[str, str]) -> Dict[str, Any]:
    """Counts for the report plus the newly indexed list vs `previous` classes."""
    counts = {"tracked": len(tracked), "indexed": 0, "not_indexed": 0, "unknown": 0}
    newly: List[str] = []
    classes: Dict[str, str] = {}
    for path in tracked:
        url = config.to_url(path)
        c = classify(rows.get(url))
        classes[path] = c
        counts[c] += 1
        if c == "indexed" and previous.get(path) not in (None, "indexed"):
            newly.append(path)
    return {**counts, "newly_indexed": newly, "classes": classes}


# ------------------------------------------------------------ escalation
def recently_crawled_in_section(rows: Dict[str, Dict[str, Any]], hits: Dict[str, int],
                                section: str, exclude: str, n: int = 2) -> List[str]:
    """The `n` most recently Googlebot-fetched pages in a section."""
    scored: List[Tuple[str, str]] = []
    for url, row in rows.items():
        path = config.to_path(url)
        if path == exclude or config.section_of(path) != section or path in config.LOSER_PATHS:
            continue
        if classify(row) != "indexed":
            continue
        key = row.get("last_crawl") or ""
        if hits.get(path):
            key = "9999-" + key  # a real crawl hit this week beats any inspection date
        scored.append((key, path))
    scored.sort(reverse=True)
    return [p for _, p in scored[:n]]


def escalate(supa: Supa, rows: Dict[str, Dict[str, Any]], tracked: Dict[str, Set[str]],
             hits: Dict[str, int], run_date: dt.date, dry_run: bool,
             propose_link_cb: Any, refresh_cb: Any) -> Dict[str, Any]:
    """Advance every not-indexed tracked URL one rung when its day arrives.

    State in seo_settings['escalation']: path -> {first_seen, stage, actions}.
    Rungs: 0 IndexNow (day 0, Bing only) -> 1 link from the two most recently
    crawled pages in the section (day 2) -> 2 aeo_answer refresh + lastmod
    bump (day 5) -> 3 "needs a content decision" with the diagnosis (day 10).
    Returns {indexnow: [urls], lines: [...], resolved: [...]}.
    """
    state: Dict[str, Any] = supa.setting("escalation", {}) or {}
    today = run_date.isoformat()
    indexnow: List[str] = []
    lines: List[str] = []
    resolved: List[str] = []
    for path in tracked:
        url = config.to_url(path)
        row = rows.get(url)
        cls = classify(row)
        if cls == "indexed":
            if path in state:
                days = (run_date - dt.date.fromisoformat(state[path]["first_seen"])).days
                resolved.append(f"{path} indexed after {days}d at rung {state[path].get('stage', 0)}")
                del state[path]
            continue
        if cls == "unknown" and not row:
            continue  # never inspected yet; the watch will get to it
        entry = state.setdefault(path, {"first_seen": today, "stage": -1, "actions": []})
        days = (run_date - dt.date.fromisoformat(entry["first_seen"])).days
        stage = int(entry.get("stage", -1))
        diag = diagnosis(row or {"url": url}, bool(hits.get(path)))
        if stage < 0:
            indexnow.append(url)
            entry["stage"] = 0
            entry["actions"].append({"day": today, "rung": 0, "action": "indexnow (Bing only)"})
        if stage < 1 and days >= 2:
            sources = recently_crawled_in_section(rows, hits, config.section_of(path), path)
            done = []
            for src in sources:
                if propose_link_cb(src, path, f"escalation rung 1 for {path}"):
                    done.append(src)
            entry["stage"] = 1
            entry["actions"].append({"day": today, "rung": 1, "action": f"links from {done or 'none available'}"})
        if stage < 2 and days >= 5:
            refresh_cb(path, "escalation rung 2: answer refresh + lastmod bump")
            entry["stage"] = 2
            entry["actions"].append({"day": today, "rung": 2, "action": "aeo_answer refresh queued"})
        if days >= 10:
            entry["stage"] = max(entry.get("stage", 0), 3)
            lines.append(f"{path}: needs a content decision, day {days}, {diag}")
        elif entry.get("stage", 0) >= 0:
            lines.append(f"{path}: rung {entry['stage']}, day {days}, {diag}")
    if not dry_run:
        supa.set_setting("escalation", state)
    else:
        print(f"dry-run: escalation state for {len(state)} urls not stored", file=sys.stderr)
    return {"indexnow": indexnow, "lines": lines, "resolved": resolved, "state": state}


# ------------------------------------------------------------ baseline
def import_baseline(path: str, supa: Supa) -> Dict[str, Any]:
    """Load the day-0 URL Inspection JSON into seo_index_status.

    The file may not exist yet (Check 2 runs on day 0); that is a warning,
    not a crash.
    """
    p = Path(path)
    if not p.exists():
        return {"ok": False, "note": f"baseline file not found: {p}", "rows": 0}
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except ValueError as exc:
        return {"ok": False, "note": f"baseline unreadable: {exc}", "rows": 0}
    checked_at = data.get("checked_at") or dt.datetime.now(dt.timezone.utc).isoformat()
    rows: List[Dict[str, Any]] = []
    for rec in data.get("urls", []):
        if rec.get("error") and not rec.get("coverageState"):
            continue
        rows.append({
            "url": rec.get("url") or config.to_url(rec.get("path", "/")),
            "verdict": rec.get("verdict"), "coverage_state": rec.get("coverageState"),
            "google_canonical": rec.get("googleCanonical"), "user_canonical": rec.get("userCanonical"),
            "page_fetch_state": rec.get("pageFetchState"), "crawled_as": rec.get("crawledAs"),
            "referring_urls": rec.get("referringUrls") or [], "last_crawl": rec.get("lastCrawlTime"),
            "checked_at": checked_at,
        })
    written = supa.safe_upsert("seo_index_status", rows, on_conflict="url")
    # Day-0 Check 1 result: Google rewrites 45% of our over-length titles,
    # below the 70% gate, so the title lane is live. Seed once, never overwrite.
    if supa.setting("check1_rewrite_rate", None) is None:
        supa.set_setting("check1_rewrite_rate", 0.45)
    if supa.setting("loop_start_date", None) is None:
        supa.set_setting("loop_start_date", config.DAY0.isoformat())
    return {"ok": True, "note": f"{len(rows)} rows from {p.name}, check1_rewrite_rate seeded 0.45", "rows": written,
            "tracked_count": data.get("tracked_count"), "checked_at": checked_at}

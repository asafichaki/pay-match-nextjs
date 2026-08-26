"""Health: every check in the plan's Health row.

sitemap 200 + count + 0 today + 0 duplicates; llms.txt and llms-full.txt
reflect the overrides; robots; JSON-LD parses on the 13 shells + changed
pages; no banned bylines; live title length; revalidate returns 401 on a
bad token; RULES parity with the live manifest; the citation-worthiness
score (6 binary checks) over the 60 focus pages, reported as `n/60 at 6/6`.
Two consecutive failures of sitemap/robots turn apply off in seo_settings.
"""
from __future__ import annotations

import datetime as dt
import json
import re
import sys
from typing import Any, Dict, List, Optional, Set

import requests

import config
import pages
from ctx import Ctx


def _dt_recent(value: Optional[str], run_date: dt.date, days: int = 90) -> bool:
    if not value:
        return False
    try:
        d = dt.date.fromisoformat(str(value)[:10])
    except ValueError:
        return False
    return (run_date - d).days <= days and d <= run_date


def worthiness(page: pages.Page, run_date: dt.date) -> Dict[str, bool]:
    """The 6 binary checks."""
    return {
        "answer_block": page.has_aeo,
        "table_first": page.table_first(),
        "verdict_line": bool(page.verdict_line()),
        "date_modified_90d": _dt_recent(page.date_modified(), run_date),
        "sources_3": page.external_sources() >= 3,
        "reviewed_by": page.reviewed_by(),
    }


def rules_parity(rules_version: str) -> Dict[str, Any]:
    """Compare rules.json version with live /seo-manifest.json rules_version."""
    got = pages.fetch(f"{config.SITE_BASE}/seo-manifest.json")
    if not got.ok:
        return {"ok": False, "missing": True, "note": f"seo-manifest.json {got.status}: override layer not live yet"}
    try:
        live = json.loads(got.text).get("rules_version")
    except (ValueError, AttributeError):
        return {"ok": False, "missing": False, "note": "seo-manifest.json unreadable"}
    return {"ok": live == rules_version, "missing": False, "live": live, "local": rules_version,
            "note": "" if live == rules_version else f"rules {rules_version} vs live {live}"}


def run(ctx: Ctx, info: Dict[str, Any]) -> Dict[str, Any]:
    failures: List[str] = []
    checks: Dict[str, Any] = {}
    run_date = ctx.run_date
    today = run_date.isoformat()

    # sitemap
    sm = pages.fetch(f"{config.SITE_BASE}/sitemap.xml")
    sitemap_ok = sm.ok and "<urlset" in sm.text
    locs = [config.to_path(l) for l in re.findall(r"<loc>(.*?)</loc>", sm.text)] if sm.ok else []
    dupes = len(locs) - len(set(locs))
    lastmods = re.findall(r"<lastmod>(.*?)</lastmod>", sm.text) if sm.ok else []
    today_count = sum(1 for lm in lastmods if lm[:10] == today)
    future = sum(1 for lm in lastmods if lm[:10] > today)
    checks["sitemap"] = {"status": sm.status, "count": len(locs), "duplicates": dupes,
                         "today": today_count, "future": future}
    if not sitemap_ok:
        failures.append(f"sitemap {sm.status or sm.error}")
    if dupes:
        failures.append(f"sitemap {dupes} duplicate loc")
    if today_count or future:
        failures.append(f"sitemap lastmod today={today_count} future={future}")

    # robots
    rb = pages.fetch(f"{config.SITE_BASE}/robots.txt")
    robots_ok = rb.ok and "sitemap" in rb.text.lower() and "disallow: /\n" not in (rb.text.lower() + "\n").replace("\r", "")
    checks["robots"] = {"status": rb.status, "ok": robots_ok}
    if not robots_ok:
        failures.append(f"robots.txt {rb.status} or missing Sitemap line")

    # llms.txt files reflect overrides
    applied_titles = [a for a in ctx.supa.safe_get(
        "seo_overrides", {"select": "kind,slug,meta_title,aeo_answer", "meta_title": "not.is.null"}, limit=5)]
    for name in ("/llms.txt", "/llms-full.txt"):
        got = pages.fetch(config.SITE_BASE + name)
        ok = got.ok and len(got.text) > 200
        slugish = sum(1 for line in got.text.splitlines()[:200]
                      if line.startswith("- ") and "-" in line.split("]")[0] and " " not in line.split("]")[0].strip("- [")) if got.ok else 0
        reflected = True
        for row in applied_titles:
            if row.get("meta_title") and row["meta_title"] not in got.text:
                reflected = False
        checks[name] = {"status": got.status, "ok": ok, "reflects_overrides": reflected, "slug_titles": slugish}
        if not ok:
            failures.append(f"{name} {got.status}")
        elif not reflected:
            failures.append(f"{name} does not reflect applied titles")
        elif slugish > 5:
            failures.append(f"{name} shows {slugish} slug-like titles")

    # revalidate rejects a bad token
    try:
        r = requests.post(f"{config.SITE_BASE}/api/autopilot/revalidate", json={"kind": "insights", "slug": "x"},
                          headers={"Authorization": "Bearer not-the-secret", "User-Agent": config.LOOP_UA},
                          timeout=20)
        checks["revalidate_401"] = r.status_code
        if r.status_code != 401:
            failures.append(f"revalidate returned {r.status_code} on a bad token")
    except requests.RequestException as exc:
        checks["revalidate_401"] = str(exc)[:80]
        failures.append("revalidate route unreachable")

    # parity
    parity = rules_parity(ctx.rules.version)
    checks["rules_parity"] = parity
    if not parity["ok"]:
        ctx.gates.block_apply(parity["note"])
        if not parity.get("missing"):
            failures.append(parity["note"])

    # shells + changed pages: JSON-LD, bylines, title length
    shells = [f"/comparisons/{s}" for s in config.COMPARISON_SHELLS]
    changed = [config.path_of(a["kind"], a["slug"]) for a in ctx.applied]
    jsonld_bad: List[str] = []
    byline_bad: List[str] = []
    long_titles: List[str] = []
    banned = ctx.rules.list("banned_bylines") + ctx.rules.list("banned_image_names")
    for p in dict.fromkeys(shells + changed):
        got = ctx.cache.get(p)
        if not got.ok:
            failures.append(f"{p} returned {got.status}")
            continue
        page = pages.Page(got.text, p)
        if page.jsonld_errors:
            jsonld_bad.append(p)
        if page.byline_hits(banned):
            byline_bad.append(p)
        if p in changed and len(page.title) > int(ctx.rules.title.get("absolute_max", 60)):
            long_titles.append(p)
    checks["jsonld_bad"], checks["byline_bad"], checks["long_titles"] = jsonld_bad, byline_bad, long_titles
    if jsonld_bad:
        failures.append(f"JSON-LD does not parse on {len(jsonld_bad)} pages: {jsonld_bad[:3]}")
    if byline_bad:
        failures.append(f"banned byline on {byline_bad[:3]}")
    if long_titles:
        failures.append(f"live title over limit on {long_titles[:3]}")

    # citation-worthiness over the focus pages
    focus = config.focus_paths(ctx.sitemap)
    if ctx.limit:
        focus = focus[:ctx.limit]
    at6 = 0
    per_check: Dict[str, int] = {}
    scored = 0
    for p in focus:
        got = ctx.cache.get(p)
        if not got.ok:
            continue
        w = worthiness(pages.Page(got.text, p), run_date)
        scored += 1
        if all(w.values()):
            at6 += 1
        for k, v in w.items():
            per_check[k] = per_check.get(k, 0) + (1 if v else 0)
    checks["worthiness"] = {"at6": at6, "scored": scored, "total": len(focus), "per_check": per_check}

    # consecutive failure streak on sitemap/robots -> apply off
    streak = int(ctx.supa.setting("health_fail_streak", 0) or 0)
    core_fail = (not sitemap_ok) or (not robots_ok)
    streak = streak + 1 if core_fail else 0
    if not ctx.dry_run:
        ctx.supa.set_setting("health_fail_streak", streak)
    if streak >= 2:
        failures.append(f"sitemap/robots failed {streak} runs in a row: apply switched off")
        ctx.gates.block_apply("health: two consecutive sitemap/robots failures")
        if not ctx.dry_run:
            ctx.supa.set_setting("apply_enabled", False)
            ctx.supa.set_setting("apply_disabled_reason", f"{today}: sitemap/robots failed twice")

    result = {"ok": not failures, "failures": failures, "checks": checks,
              "parity_ok": parity["ok"], "worthiness": checks["worthiness"]}
    ctx.report_bits["health"] = result
    info["note"] = (f"{'green' if not failures else str(len(failures)) + ' failures'}, "
                    f"worthiness {at6}/{len(focus)} at 6/6, parity {'ok' if parity['ok'] else parity['note']}")
    print(f"   {info['note']}", file=sys.stderr)
    for f in failures:
        print(f"   FAIL {f}", file=sys.stderr)
    return result

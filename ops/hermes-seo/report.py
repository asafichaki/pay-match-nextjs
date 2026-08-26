"""The report JSON: the contract for the morning mail.

`build()` assembles the day's numbers from the ledger, seo_metrics,
seo_index_status, seo_changes, the probe summary and the health result,
then writes `{SEO_STATE_DIR}/report-YYYY-MM-DD.json` and upserts
`seo_reports`. The `report` subcommand (07:40 IL) rebuilds it from the
database and raises the red line when today's `daily` run is missing or
not ok, so a cron that silently stopped is still reported.

JSON shape (every key present, values may be null):
{
  date, generated_at, code_version, mode, spend_mtd, run: {...},
  traffic: {d3, w7, w28, device_ctr, canada}, index: {...}, changes: {...},
  cohort: {...}, citations: {...}, drafts: [...], competitor_changes: [...],
  health: {...}, red_lines: [...]
}
"""
from __future__ import annotations

import datetime as dt
import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

import config
import gsc as gsc_mod
import indexing
from supa import Supa

BLANK_RUN = {"status": "missing", "steps": {}, "spend_usd": 0.0, "started_at": None, "finished_at": None}


def _sum(rows: List[Dict[str, Any]], a: dt.date, b: dt.date, country: Optional[str] = None,
         device: Optional[str] = None) -> Dict[str, Any]:
    clicks = impr = bots = 0
    for r in rows:
        d = str(r.get("date"))[:10]
        if not (a.isoformat() <= d <= b.isoformat()):
            continue
        if country and (r.get("country") or "").lower() != country:
            continue
        if device and (r.get("device") or "").lower() != device:
            continue
        clicks += int(r.get("clicks") or 0)
        impr += int(r.get("impressions") or 0)
        bots += int(r.get("bot_impressions") or 0)
    human = max(0, impr - bots)
    return {"clicks": clicks, "impressions": impr, "human_impressions": human,
            "ctr": round(clicks / human, 4) if human else 0.0}


def traffic_block(metrics: List[Dict[str, Any]], run_date: dt.date) -> Dict[str, Any]:
    w = gsc_mod.windows(run_date)
    d3 = run_date - dt.timedelta(days=3)
    return {
        "d3": {"date": d3.isoformat(), **_sum(metrics, d3, d3)},
        "w7": {**_sum(metrics, *w["7d"]), "prior": _sum(metrics, *w["prior7d"])},
        "w28": {**_sum(metrics, *w["28d"]), "prior": _sum(metrics, *w["prior28d"])},
        "device_ctr": {"desktop": _sum(metrics, *w["7d"], device="desktop")["ctr"],
                       "mobile": _sum(metrics, *w["7d"], device="mobile")["ctr"]},
        "canada": _sum(metrics, *w["28d"], country="can"),
    }


def changes_block(supa: Supa, run_date: dt.date, bits: Dict[str, Any]) -> Dict[str, Any]:
    rows = supa.safe_get("seo_changes", {"order": "change_id.desc",
                                         "select": "kind,slug,field,old,new,status,applied_at,source"}, limit=40)
    lines: List[Dict[str, Any]] = []
    seen = set()
    for r in rows:
        if r.get("field") in ("title_absolute",):
            continue
        key = (r["kind"], r["slug"], r["field"])
        if key in seen:
            continue
        seen.add(key)
        lines.append({"slug": r["slug"], "field": r["field"], "old": (r.get("old") or "")[:80],
                      "new": (r.get("new") or "")[:80], "status": r.get("status")})
        if len(lines) >= 5:
            break
    pending = supa.setting("verification", {}) or {}
    advisory = supa.safe_get("seo_changes", {"status": "eq.advisory_regression", "select": "slug"})
    return {"lines": lines, "verification_pending": len(pending),
            "advisory_regressions": len(bits.get("advisory_flags") or advisory),
            "rollbacks": bits.get("rollbacks") or [],
            "proposed_today": len(bits.get("proposals") or []), "applied_today": len(bits.get("applied") or [])}


def index_block(supa: Supa, sitemap: Dict[str, Optional[str]], run_date: dt.date,
                bits: Dict[str, Any]) -> Dict[str, Any]:
    rows = {r["url"]: r for r in supa.safe_get("seo_index_status")}
    tracked = config.tracked_paths(sitemap) if sitemap else {}
    previous = (supa.setting("index_classes", {}) or {})
    summary = indexing.index_summary(rows, tracked, previous) if tracked else \
        {"tracked": 0, "indexed": 0, "not_indexed": 0, "unknown": 0, "newly_indexed": [], "classes": {}}
    hits = indexing.crawl_hits_7d(supa, run_date)
    pillar_row = rows.get(config.to_url(config.PILLAR))
    return {
        "tracked": summary["tracked"], "indexed": summary["indexed"], "not_indexed": summary["not_indexed"],
        "unknown": summary["unknown"], "newly_indexed": summary["newly_indexed"][:5],
        "pillar": {"state": (pillar_row or {}).get("coverage_state"), "last_crawl": (pillar_row or {}).get("last_crawl"),
                   "googlebot_hits_7d": hits.get(config.PILLAR, 0)},
        "bing_indexed": bits.get("bing_indexed", (supa.setting("bing_index", {}) or {}).get("in_index")),
        "escalation": (bits.get("escalation_lines") or [])[:4],
        "classes": summary["classes"],
    }


def drafts_block(supa: Supa) -> List[Dict[str, str]]:
    """Drafts this loop wrote and is asking a human to publish.

    Two guards, both learned the hard way on 2026-08-26, when the first real
    digest offered a one-click publish on `stripe-vs-square-2026` and
    `stripe-vs-helcim-2026`: the two duplicate rows that had been merged into
    their winners and 308-redirected hours earlier. Publishing either would
    have resurrected the cannibalisation and put a live page behind a
    redirect.

    1. A retired slug is never offered. `config.RETIRED_SLUGS` mirrors the
       redirect registries in the repo.
    2. `is_autopilot` is not enough: the engine that was closed on 2026-07-13
       left its own unpublished rows behind and they carry that flag too. A
       draft only counts when it was created after the loop went live.
    """
    rows = supa.safe_get("blog_articles",
                         {"published": "eq.false", "is_autopilot": "eq.true",
                          "created_at": f"gte.{config.LOOP_EPOCH}",
                          "select": "slug,title,kind,created_at",
                          "order": "created_at.desc"}, limit=10)
    out: List[Dict[str, str]] = []
    for r in rows:
        if (r.get("slug") or "") in config.RETIRED_SLUGS:
            continue
        out.append({"title": r.get("title") or r.get("slug"),
                    "admin_url": f"{config.SITE_BASE}/admin/articles"})
        if len(out) == 5:
            break
    return out


def build(supa: Supa, run_date: dt.date, run_summary: Optional[Dict[str, Any]], mode: str,
          spend_mtd: float, metrics: List[Dict[str, Any]], sitemap: Dict[str, Optional[str]],
          bits: Dict[str, Any], state: Path, dry_run: bool, red_lines: Optional[List[str]] = None) -> Dict[str, Any]:
    run_summary = run_summary or dict(BLANK_RUN)
    health = bits.get("health") or {"ok": None, "failures": [], "worthiness": {}}
    citations = bits.get("citations") or (supa.setting("probe_summary", {}) or {})
    reds: List[str] = list(red_lines or [])
    if run_summary.get("status") == "missing":
        reds.insert(0, "daily run did not finish today (no seo_runs row)")
    elif run_summary.get("status") not in ("ok",):
        failed = [n for n, s in (run_summary.get("steps") or {}).items() if s.get("status") == "fail"]
        reds.insert(0, f"daily run status {run_summary.get('status')}: failed steps {failed or run_summary.get('notes', [])}")
    for f in health.get("failures", []):
        if f not in reds:
            reds.append(f)
    report = {
        "date": run_date.isoformat(),
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "code_version": config.code_version(),
        "mode": mode,
        "spend_mtd": round(spend_mtd, 3),
        "run": {"status": run_summary.get("status"), "steps": {n: s.get("status") for n, s in (run_summary.get("steps") or {}).items()},
                "spend_usd": run_summary.get("spend_usd"), "started_at": run_summary.get("started_at"),
                "finished_at": run_summary.get("finished_at"), "notes": run_summary.get("notes", [])},
        "traffic": traffic_block(metrics, run_date),
        "index": index_block(supa, sitemap, run_date, bits),
        "changes": changes_block(supa, run_date, bits),
        "cohort": bits.get("cohort") or {"available": False, "reason": "no measurement this run"},
        "citations": {
            "cited": citations.get("cited"), "total": citations.get("total"),
            "buckets": citations.get("buckets", {}), "retained": citations.get("retained"),
            "gained": citations.get("gained"), "lost": citations.get("lost"),
            "engines": len(citations.get("engines", []) or []), "date": citations.get("date"),
            "worthiness": health.get("worthiness") or {},
            "money_presence": bits.get("money_presence"),
        },
        "drafts": drafts_block(supa),
        "competitor_changes": (bits.get("competitor_changes") or [])[:5],
        "health": {"ok": health.get("ok"), "failures": health.get("failures", [])},
        "red_lines": reds,
        "dry_run": dry_run,
    }
    out = state / f"report-{run_date.isoformat()}.json"
    try:
        out.write_text(json.dumps(report, indent=1, default=str), encoding="utf-8")
        print(f"report written: {out}", file=sys.stderr)
    except OSError as exc:
        print(f"warn: cannot write {out}: {exc}", file=sys.stderr)
    supa.safe_upsert("seo_reports", [{"date": run_date.isoformat(), "json": report}], on_conflict="date")
    return report


def today_run(supa: Supa, run_date: dt.date, kind: str = "daily") -> Optional[Dict[str, Any]]:
    rows = supa.safe_get("seo_runs", {"run_date": f"eq.{run_date.isoformat()}", "kind": f"eq.{kind}"}, limit=1)
    if not rows:
        return None
    r = rows[0]
    return {"status": r.get("status"), "steps": r.get("step_status") or {}, "spend_usd": r.get("spend_usd"),
            "started_at": r.get("started_at"), "finished_at": r.get("finished_at"), "notes": []}

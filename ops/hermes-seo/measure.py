"""Measurement: cohort read against the holdout, advisory page flags, and
the (rare) real rollback.

Per-page CTR at this site's volumes is noise, so:
* the cohort read compares the changed set with the holdout matched on
  position band: impressions and position are the fast signals, CTR the
  slow one; the after-window ends at D-4 and the frozen bot list is used;
* per-page flags are advisory for ADVISORY_ONLY_DAYS with a floor of
  CLICK_FLOOR combined clicks;
* a real rollback needs the cohort read AND the page flag to agree; it
  restores from seo_overrides_history through the RPC (field `restore`)
  and locks the page for 30 days.

The pure functions take plain rows so tests can feed synthetic cohorts.
"""
from __future__ import annotations

import datetime as dt
import sys
from typing import Any, Dict, Iterable, List, Optional, Set, Tuple

import changes
import config
from ctx import Ctx
from titles import band_of

Row = Dict[str, Any]


def _agg(rows: Iterable[Row]) -> Dict[str, float]:
    clicks = impr = human = 0
    pos_w = 0.0
    days: Set[str] = set()
    for r in rows:
        i = int(r.get("impressions") or 0)
        clicks += int(r.get("clicks") or 0)
        impr += i
        human += i - int(r.get("bot_impressions") or 0)
        pos_w += float(r.get("position") or 0.0) * i
        days.add(str(r.get("date")))
    n = max(1, len(days))
    return {"clicks": clicks, "impressions": impr, "human_impr": human,
            "impr_per_day": human / n, "ctr": (clicks / human) if human else 0.0,
            "position": (pos_w / impr) if impr else 0.0, "days": len(days)}


def _rel(after: float, before: float) -> Optional[float]:
    if not before:
        return None
    return (after - before) / before


def cohort_read(metrics: List[Row], changed: Dict[str, str], holdout: Set[str],
                run_date: dt.date, bands: Optional[Dict[str, str]] = None,
                window_days: int = 14) -> Dict[str, Any]:
    """Changed set vs holdout, before/after, matched on position band.

    `changed` maps path -> applied date (ISO). Before = `window_days` ending
    the day before the earliest change; after = day after the change up to
    D-4. Difference-in-differences per metric relative to the holdout.
    """
    if not changed or not holdout:
        return {"available": False, "reason": "no changed pages or no holdout"}
    first = min(dt.date.fromisoformat(d[:10]) for d in changed.values())
    after_end = run_date - dt.timedelta(days=4)
    after_start = first + dt.timedelta(days=1)
    if after_end < after_start:
        return {"available": False, "reason": "after-window not open yet"}
    before_end = first - dt.timedelta(days=1)
    before_start = before_end - dt.timedelta(days=window_days - 1)
    after_end = min(after_end, after_start + dt.timedelta(days=window_days - 1))

    def in_window(r: Row, a: dt.date, b: dt.date) -> bool:
        d = str(r.get("date"))[:10]
        return a.isoformat() <= d <= b.isoformat()

    # match: only holdout pages in bands that the changed set occupies
    if bands:
        changed_bands = {bands.get(p) for p in changed if bands.get(p)}
        hold = {p for p in holdout if bands.get(p) in changed_bands} or holdout
    else:
        hold = holdout
    groups = {"changed": set(changed), "holdout": hold}
    out: Dict[str, Any] = {"available": True, "before": [before_start.isoformat(), before_end.isoformat()],
                           "after": [after_start.isoformat(), after_end.isoformat()],
                           "n_changed": len(changed), "n_holdout": len(hold)}
    stats: Dict[str, Dict[str, Dict[str, float]]] = {}
    for g, paths in groups.items():
        rows = [r for r in metrics if r.get("page") in paths]
        stats[g] = {"before": _agg([r for r in rows if in_window(r, before_start, before_end)]),
                    "after": _agg([r for r in rows if in_window(r, after_start, after_end)])}
    out["stats"] = stats
    combined_clicks = sum(stats[g][w]["clicks"] for g in stats for w in ("before", "after"))
    out["combined_clicks"] = combined_clicks
    days_after = stats["changed"]["after"]["days"]
    out["days_after"] = days_after
    diffs: Dict[str, Any] = {}
    for metric in ("impr_per_day", "position", "ctr"):
        c = _rel(stats["changed"]["after"][metric], stats["changed"]["before"][metric])
        h = _rel(stats["holdout"]["after"][metric], stats["holdout"]["before"][metric])
        if metric == "position":  # absolute delta, lower is better
            c = stats["changed"]["after"][metric] - stats["changed"]["before"][metric]
            h = stats["holdout"]["after"][metric] - stats["holdout"]["before"][metric]
        diffs[metric] = {"changed": c, "holdout": h,
                         "did": (None if c is None or h is None else c - h)}
    out["diff"] = diffs
    if days_after < 7 or combined_clicks < config.CLICK_FLOOR:
        out["verdict"] = "inconclusive"
        out["why"] = f"{days_after} days after, {combined_clicks} clicks"
        return out
    did_impr = diffs["impr_per_day"]["did"]
    did_pos = diffs["position"]["did"]
    did_ctr = diffs["ctr"]["did"]
    if (did_impr is not None and did_impr <= -0.15) or (did_pos is not None and did_pos >= 1.0):
        out["verdict"] = "negative"
    elif (did_impr is not None and did_impr >= 0.15) or (did_pos is not None and did_pos <= -1.0) \
            or (did_ctr is not None and did_ctr >= 0.20):
        out["verdict"] = "positive"
    else:
        out["verdict"] = "flat"
    return out


def page_flags(metrics: List[Row], changed: Dict[str, str], holdout_delta: Dict[str, Optional[float]],
               run_date: dt.date, window_days: int = 14) -> List[Dict[str, Any]]:
    """Per-page advisory regression flags with the click floor.

    A page is flagged when, relative to the holdout's own before/after move,
    its human impressions fell 30% or more AND its position worsened by 2 or
    more, with at least CLICK_FLOOR combined clicks across both windows.
    """
    flags: List[Dict[str, Any]] = []
    after_end = run_date - dt.timedelta(days=4)
    h_impr = holdout_delta.get("impr_per_day") or 0.0
    h_pos = holdout_delta.get("position") or 0.0
    for path, applied in changed.items():
        day = dt.date.fromisoformat(applied[:10])
        a0, a1 = day + dt.timedelta(days=1), min(after_end, day + dt.timedelta(days=window_days))
        b1 = day - dt.timedelta(days=1)
        b0 = b1 - dt.timedelta(days=window_days - 1)
        if a1 < a0:
            continue
        rows = [r for r in metrics if r.get("page") == path]
        before = _agg([r for r in rows if b0.isoformat() <= str(r["date"])[:10] <= b1.isoformat()])
        after = _agg([r for r in rows if a0.isoformat() <= str(r["date"])[:10] <= a1.isoformat()])
        combined = before["clicks"] + after["clicks"]
        rel_impr = _rel(after["impr_per_day"], before["impr_per_day"])
        d_pos = after["position"] - before["position"] if before["position"] and after["position"] else 0.0
        if rel_impr is None or combined < config.CLICK_FLOOR:
            continue
        adj_impr = rel_impr - h_impr
        adj_pos = d_pos - h_pos
        if adj_impr <= -0.30 and adj_pos >= 2.0:
            flags.append({"path": path, "applied": applied, "impr_delta": round(adj_impr, 3),
                          "position_delta": round(adj_pos, 2), "combined_clicks": combined})
    return flags


# ------------------------------------------------------------ orchestration
def changed_pages(ctx: Ctx) -> Dict[str, str]:
    """path -> earliest applied date for title/meta changes still live."""
    rows = ctx.supa.safe_get("seo_changes", {
        "status": "in.(applied,verification_pending,verified)",
        "field": "in.(meta_title,meta_description)", "select": "kind,slug,applied_at"})
    out: Dict[str, str] = {}
    for r in rows:
        p = config.path_of(r["kind"], r["slug"])
        d = (r.get("applied_at") or "")[:10]
        if d and (p not in out or d < out[p]):
            out[p] = d
    return out


def restore_from_history(ctx: Ctx, path: str, reason: str) -> bool:
    """Real rollback: RPC field `restore` with the last history version, lock 30d."""
    kind, slug = config.kind_slug(path)
    hist = ctx.supa.safe_get("seo_overrides_history", {"kind": f"eq.{kind}", "slug": f"eq.{slug}",
                                                       "order": "version.desc"}, limit=1)
    if not hist:
        ctx.supa.warn(f"no history for {path}, cannot restore")
        return False
    version = hist[0].get("version")
    payload = {"version": version, "lock_until": changes.lock_days_iso(ctx.run_date, config.LOCK_DAYS_ROLLBACK)}
    status = changes.propose_or_apply(ctx, kind, slug, "restore", None, payload, reason, "loop:measure")
    return status == "applied"


def run(ctx: Ctx, info: Dict[str, Any]) -> None:
    changed = changed_pages(ctx)
    holdout_meta = ctx.supa.setting("holdout", {}) or {}
    bands = holdout_meta.get("bands") or {}
    # bands for the changed pages from the 28d position
    for p in changed:
        if p not in bands:
            bands[p] = band_of(ctx.page_metrics(p)["position"] or 50)
    cohort = cohort_read(ctx.metrics, changed, ctx.holdout, ctx.run_date, bands)
    holdout_delta = {m: (cohort.get("diff", {}).get(m, {}) or {}).get("holdout") for m in
                     ("impr_per_day", "position")} if cohort.get("available") else {}
    flags = page_flags(ctx.metrics, changed, holdout_delta, ctx.run_date) if changed else []
    loop_start = ctx.supa.setting("loop_start_date", None) or config.DAY0.isoformat()
    days_running = (ctx.run_date - dt.date.fromisoformat(loop_start)).days
    advisory_only = days_running < config.ADVISORY_ONLY_DAYS
    rollbacks: List[str] = []
    for f in flags:
        try:
            ctx.supa.patch("seo_changes", {"slug": config.kind_slug(f["path"])[1], "status": "verified"},
                           {"status": "advisory_regression", "outcome": f})
        except Exception:  # noqa: BLE001
            pass
        if not advisory_only and cohort.get("verdict") == "negative":
            if restore_from_history(ctx, f["path"], f"rollback: cohort negative and page flag {f}"):
                rollbacks.append(f["path"])
    ctx.report_bits["cohort"] = cohort
    ctx.report_bits["advisory_flags"] = flags
    ctx.report_bits["rollbacks"] = rollbacks
    info["note"] = (f"{len(changed)} changed pages, cohort {cohort.get('verdict', cohort.get('reason'))}, "
                    f"{len(flags)} advisory flags, {len(rollbacks)} rollbacks"
                    + (" (advisory period)" if advisory_only else ""))
    print(f"   {info['note']}", file=sys.stderr)

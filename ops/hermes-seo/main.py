#!/usr/bin/env python3
"""myPayAdvisor SEO loop, Hermes entry point.

  python3 main.py daily   [--dry-run] [--limit N] [--date YYYY-MM-DD] [--force]
  python3 main.py weekly  [...]
  python3 main.py measure | probe | health | report
  python3 main.py import-baseline <json>

Modes:
  dry-run  no network write at all (default until SEO_APPLY_ENABLED=1 and
           --dry-run is absent); reads, proposals in memory, local report.
  shadow   SEO_LOOP_ENABLED=1 and SEO_APPLY_ENABLED=1 in the env but
           seo_settings.apply_enabled is false (the starting state): all
           bookkeeping writes happen, overrides are never touched.
  apply    env AND seo_settings.apply_enabled true AND rules self-test clean
           AND RULES parity AND health green: overrides through the RPC.

Kill switches are checked at start and before every override write.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

import config

config.load_env_file()

import aeo  # noqa: E402
import changes  # noqa: E402
import gsc as gsc_mod  # noqa: E402
import health as health_mod  # noqa: E402
import indexing  # noqa: E402
import links as links_mod  # noqa: E402
import measure as measure_mod  # noqa: E402
import report as report_mod  # noqa: E402
import rules as rules_mod  # noqa: E402
import titles as titles_mod  # noqa: E402
import weekly as weekly_mod  # noqa: E402
from ctx import Ctx  # noqa: E402
from ledger import Gates, Run, maybe_promote  # noqa: E402
from llm import Gemini  # noqa: E402
from pages import PageCache  # noqa: E402
from supa import Supa  # noqa: E402

BASELINE_DEFAULT = ("/private/tmp/claude-501/-Users-user-Desktop/e66172db-b709-41da-ae0b-fcd6f01c2d1d/"
                    "scratchpad/mpa-audit/day0/index-baseline-2026-08-26.json")


def log(msg: str) -> None:
    print(msg, file=sys.stderr)


def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    ap = argparse.ArgumentParser(description="myPayAdvisor SEO loop")
    ap.add_argument("command", choices=["daily", "weekly", "measure", "probe", "health", "report", "import-baseline"])
    ap.add_argument("arg", nargs="?", help="import-baseline: path to the day-0 JSON")
    ap.add_argument("--dry-run", action="store_true", help="no network writes at all")
    ap.add_argument("--limit", type=int, default=None, help="cap candidates per lane")
    ap.add_argument("--date", default=None, help="run date YYYY-MM-DD (default today)")
    ap.add_argument("--force", action="store_true", help="take over a running/finished lock")
    return ap.parse_args(argv)


def effective_dry_run(flag: bool) -> bool:
    """Dry-run is ON unless SEO_APPLY_ENABLED=1 and --dry-run is absent."""
    return flag or not config.env_flag("SEO_APPLY_ENABLED")


# ---------------------------------------------------------------- setup
def build_ctx(args: argparse.Namespace, kind: str) -> Ctx:
    dry_run = effective_dry_run(args.dry_run)
    run_date = config.today(args.date)
    state = config.state_dir()
    supa = Supa(dry_run=dry_run)
    gates = Gates(supa, dry_run)
    run = Run(supa, kind, run_date, dry_run, force=args.force)
    rules = rules_mod.load_rules()
    gemini = Gemini(spend_cb=run.add_spend)
    cache = PageCache(state / "cache")
    ctx = Ctx(supa=supa, gates=gates, run=run, rules=rules, run_date=run_date, dry_run=dry_run,
              limit=args.limit, state=state, cache=cache, gemini=gemini)
    log(f"mode={gates.mode()} date={run_date} kind={kind} rules={rules.version}"
        f"{' (fallback)' if rules.is_fallback else ''} state={state} version={config.code_version()}")
    if not supa.configured:
        log("warn: Supabase not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)")
    return ctx


def preflight(ctx: Ctx) -> bool:
    """Kill switches, rules self-test, spend. False = do not run."""
    if not ctx.gates.loop_enabled():
        log("loop disabled (SEO_LOOP_ENABLED / seo_settings.loop_enabled), exiting")
        return False
    if ctx.rules.is_fallback:
        ctx.gates.block_apply("rules.json not found in the repo, fallback in use")
    ok, details = rules_mod.self_test(ctx.rules)
    for d in details:
        log(f"   self-test {d}")
    ctx.report_bits["rules_self_test"] = ok
    if not ok:
        ctx.gates.block_apply("rules self-test: a planted failure passed")
        if not ctx.dry_run:
            ctx.supa.set_setting("apply_enabled", False)
            ctx.supa.set_setting("apply_disabled_reason", f"{ctx.run_date}: rules self-test failed")
    if not ctx.run.spend_ok():
        ctx.gates.block_apply(f"monthly spend over ${config.SPEND_CAP_USD}")
    return True


def load_shared(ctx: Ctx, with_gsc: bool = True) -> None:
    """Sitemap, tracked set, metrics, query index, overrides, holdout, locks."""
    ctx.sitemap = indexing.load_sitemap(ctx.state)
    ctx.tracked = config.tracked_paths(ctx.sitemap)
    w = gsc_mod.windows(ctx.run_date)
    ctx.metrics = ctx.supa.safe_get("seo_metrics", {"date": f"gte.{w['prior28d'][0].isoformat()}",
                                                    "select": "date,page,device,country,clicks,impressions,ctr,position,bot_impressions"})
    ctx.bot_queries = set(ctx.supa.setting("bot_queries", {}).get("queries", []) if isinstance(
        ctx.supa.setting("bot_queries", {}), dict) else [])
    qfile = ctx.state / "queries-28d.json"
    if qfile.exists():
        try:
            ctx.idx = json.loads(qfile.read_text(encoding="utf-8"))
        except ValueError:
            ctx.idx = {}
    for r in ctx.supa.safe_get("seo_overrides"):
        ctx.overrides[config.path_of(r["kind"], r["slug"])] = r
    for r in ctx.supa.safe_get("seo_index_status"):
        ctx.index_status[config.to_path(r["url"])] = r
    hold = ctx.supa.setting("holdout", {}) or {}
    ctx.holdout = set(hold.get("pages", []))
    lock = ctx.supa.setting("citation_lock", {}) or {}
    ctx.citation_lock = set(lock.get("pages", []))
    ctx.check1_rewrite_rate = float(ctx.supa.setting("check1_rewrite_rate", 0.0) or 0.0)


# ---------------------------------------------------------------- steps
def step_gsc(ctx: Ctx, info: Dict[str, Any]) -> None:
    client = gsc_mod.Gsc()
    if not client.configured:
        info["skip"] = "GSC_SA_JSON missing"
        return
    w = gsc_mod.windows(ctx.run_date)
    page_rows = client.pull_page_device_country(*w["trailing10"])
    dpq_rows = client.pull_date_page_query(*w["trailing10"])
    qp_rows = client.pull_query_page(*w["28d"])
    frozen = ctx.supa.setting("bot_queries", {}) or {}
    stale = not frozen or (ctx.run_date - dt.date.fromisoformat(frozen.get("frozen_at", "2000-01-01"))).days >= 7
    if stale or ctx.run.kind == "weekly":
        bots = gsc_mod.freeze_bot_queries(qp_rows)
        frozen = {"queries": bots, "frozen_at": ctx.run_date.isoformat()}
        if not ctx.dry_run:
            ctx.supa.set_setting("bot_queries", frozen)
        else:
            log(f"dry-run: bot list of {len(bots)} queries not frozen")
    ctx.bot_queries = set(frozen.get("queries", []))
    rows = gsc_mod.metrics_rows(page_rows, dpq_rows, ctx.bot_queries)
    written = ctx.supa.safe_upsert("seo_metrics", rows, on_conflict="date,page,device,country")
    ctx.idx = gsc_mod.page_query_index(qp_rows, ctx.bot_queries)
    try:
        (ctx.state / "queries-28d.json").write_text(json.dumps(ctx.idx), encoding="utf-8")
    except OSError:
        pass
    # refresh in-memory metrics with what we just pulled
    fresh = {(r["date"], r["page"], r["device"], r["country"]): r for r in rows}
    ctx.metrics = [m for m in ctx.metrics if (m["date"], m["page"], m["device"], m["country"]) not in fresh] + rows
    human = gsc_mod.human_impr(qp_rows, ctx.bot_queries)
    info["note"] = (f"{len(page_rows)} page-day rows, {len(qp_rows)} query-page rows, {len(ctx.bot_queries)} bot queries, "
                    f"human impr 28d {human}, {client.calls} calls, {written} rows written")
    client.submit_sitemap(dry_run=ctx.dry_run)


def step_index(ctx: Ctx, info: Dict[str, Any]) -> None:
    client = gsc_mod.Gsc()
    if not client.configured:
        info["skip"] = "GSC_SA_JSON missing"
        return
    previous = (ctx.supa.setting("index_classes", {}) or {})
    res = indexing.index_watch(ctx.supa, client, ctx.tracked, ctx.cap(config.CAP_INSPECTIONS_PER_DAY),
                               ctx.dry_run, ctx.state, ctx.run_date)
    for url, row in res["rows"].items():
        ctx.index_status[config.to_path(url)] = row
    summary = indexing.index_summary(res["rows"], ctx.tracked, previous)
    if not ctx.dry_run:
        ctx.supa.set_setting("index_classes", summary["classes"])
    ctx.report_bits["index_summary"] = summary
    info["note"] = (f"inspected {res['inspected']}, indexed {summary['indexed']}/{summary['tracked']}, "
                    f"not indexed {summary['not_indexed']}, unknown {summary['unknown']}, "
                    f"newly indexed {len(summary['newly_indexed'])}")


def step_escalation(ctx: Ctx, info: Dict[str, Any]) -> None:
    hits = indexing.crawl_hits_7d(ctx.supa, ctx.run_date)
    rows = {config.to_url(p): r for p, r in ctx.index_status.items()}

    def propose_link(src: str, target: str, reason: str) -> bool:
        cur = ctx.override(src).get("related_links")
        new = links_mod.append_link(cur, target, ctx.titles.get(target) or links_mod.humanize(target))
        if not new:
            return False
        kind, slug = config.kind_slug(src)
        return changes.propose_or_apply(ctx, kind, slug, "related_links", cur, new, reason,
                                        "loop:escalation") in ("applied", "proposed")

    res = indexing.escalate(ctx.supa, rows, ctx.tracked, hits, ctx.run_date, ctx.dry_run,
                            propose_link, lambda p, why: aeo.queue_refresh(ctx, p, why))
    ctx.report_bits["escalation_lines"] = res["lines"] + res["resolved"]
    ctx.report_bits["escalation_indexnow"] = res["indexnow"]
    info["note"] = f"{len(res['lines'])} urls on the ladder, {len(res['resolved'])} resolved, {len(res['indexnow'])} new to IndexNow"


def step_indexnow(ctx: Ctx, info: Dict[str, Any]) -> None:
    urls = indexing.changed_urls_7d(ctx.sitemap, ctx.supa, ctx.run_date)
    urls = sorted(set(urls) | set(ctx.report_bits.get("escalation_indexnow", [])))
    if not urls:
        info["note"] = "nothing changed in 7 days"
        return
    results = indexing.indexnow_batch(urls, ctx.dry_run)
    bad = [r for r in results if not r.get("ok")]
    if bad:
        raise RuntimeError(f"IndexNow failed: {bad}")
    info["note"] = f"{len(urls)} urls, {len(results)} endpoints (Bing/Copilot only)"


def step_titles(ctx: Ctx, info: Dict[str, Any]) -> None:
    ctx.titles = titles_mod.current_titles(ctx, ctx.article_paths())
    titles_mod.batch1(ctx, info)


def step_links(ctx: Ctx, info: Dict[str, Any]) -> None:
    universe = [p for p in ctx.article_paths()] + ["/calculator"]
    queries = {p: {r["query"] for r in rows[:20] if not r["bot"]} for p, rows in ctx.idx.items()}
    clicks = {p: ctx.page_metrics(p)["clicks"] for p in universe}
    human = {p: ctx.page_metrics(p)["human_impr"] for p in universe}
    corner = set(config.CORNERSTONES)
    todo = links_mod.choose_pages(universe, ctx.overrides, ctx.holdout, human, ctx.cap(config.CAP_LINKS_PER_DAY))
    info["candidates"] = len(todo)
    handled = 0
    for p in todo:
        if ctx.locked(p):
            continue
        new = links_mod.pick_links(p, universe, queries, corner, clicks, ctx.titles)
        if len(new) < 3:
            continue
        cur = ctx.override(p).get("related_links")
        if links_mod.links_equal(cur, new):
            continue
        kind, slug = config.kind_slug(p)
        status = changes.propose_or_apply(ctx, kind, slug, "related_links", cur, new,
                                          "related links: plan scoring, one cornerstone", "loop:links")
        if status in ("applied", "proposed"):
            handled += 1
    info["proposals"] = handled
    info["note"] = f"{len(todo)} pages, {handled} handled"


def step_report(ctx: Ctx, red_lines: Optional[List[str]] = None) -> Dict[str, Any]:
    bits = dict(ctx.report_bits)
    bits["proposals"], bits["applied"] = ctx.proposals, ctx.applied
    return report_mod.build(ctx.supa, ctx.run_date, ctx.run.summary(), ctx.gates.mode(), ctx.run.month_spend(),
                            ctx.metrics, ctx.sitemap, bits, ctx.state, ctx.dry_run, red_lines)


# ---------------------------------------------------------------- commands
def cmd_daily(args: argparse.Namespace) -> int:
    ctx = build_ctx(args, "daily")
    if not preflight(ctx):
        return 0
    if not ctx.run.acquire():
        log("another daily run holds the lock, exiting")
        return 2
    load_shared(ctx)
    with ctx.run.step("gsc") as info:
        step_gsc(ctx, info)
    with ctx.run.step("index_watch") as info:
        step_index(ctx, info)
    with ctx.run.step("escalation") as info:
        step_escalation(ctx, info)
    with ctx.run.step("indexnow") as info:
        step_indexnow(ctx, info)
    with ctx.run.step("titles_b1") as info:
        step_titles(ctx, info)
    with ctx.run.step("titles_llm") as info:
        titles_mod.batch2(ctx, info)
    with ctx.run.step("verify") as info:
        res = changes.verify_pending(ctx)
        ctx.report_bits["verification"] = res
        info["note"] = f"{res['pending']} pending, {len(res['verified'])} verified, {len(res['stalled'])} stalled"
    with ctx.run.step("links") as info:
        step_links(ctx, info)
    with ctx.run.step("aeo") as info:
        aeo.run(ctx, info)
    with ctx.run.step("measure") as info:
        measure_mod.run(ctx, info)
    with ctx.run.step("health") as info:
        health_mod.run(ctx, info)
    promoted = maybe_promote(ctx.supa, ctx.gates, ctx.run, bool((ctx.report_bits.get("health") or {}).get("ok")),
                             bool((ctx.report_bits.get("health") or {}).get("parity_ok")),
                             bool(ctx.report_bits.get("rules_self_test")))
    if promoted:
        ctx.run.notes.append(promoted)
        log(promoted)
    status = ctx.run.finish()
    with ctx.run.step("report") as info:
        rep = step_report(ctx, ctx.gates.run_blocks)
        info["note"] = f"{len(rep['red_lines'])} red lines"
    ctx.run.finish()
    print_summary(ctx, status)
    return 0 if status == "ok" else 1


def cmd_weekly(args: argparse.Namespace) -> int:
    ctx = build_ctx(args, "weekly")
    if not preflight(ctx):
        return 0
    if not ctx.run.acquire():
        return 2
    load_shared(ctx)
    with ctx.run.step("probes") as info:
        weekly_mod.probes(ctx, info)
    with ctx.run.step("competitor_watch") as info:
        weekly_mod.competitor_watch(ctx, info)
    with ctx.run.step("bing_index") as info:
        weekly_mod.bing_indexed(ctx, info)
    with ctx.run.step("backlinks") as info:
        weekly_mod.backlinks_summary(ctx, info)
    with ctx.run.step("cannibalization") as info:
        weekly_mod.cannibalization(ctx, info)
    status = ctx.run.finish()
    print_summary(ctx, status)
    return 0 if status == "ok" else 1


def cmd_probe(args: argparse.Namespace) -> int:
    ctx = build_ctx(args, "probe")
    if not preflight(ctx):
        return 0
    if not ctx.run.acquire():
        return 2
    load_shared(ctx)
    with ctx.run.step("probes") as info:
        weekly_mod.probes(ctx, info)
    status = ctx.run.finish()
    print_summary(ctx, status)
    return 0 if status == "ok" else 1


def cmd_measure(args: argparse.Namespace) -> int:
    ctx = build_ctx(args, "measure")
    if not preflight(ctx):
        return 0
    if not ctx.run.acquire():
        return 2
    load_shared(ctx)
    with ctx.run.step("measure") as info:
        measure_mod.run(ctx, info)
    status = ctx.run.finish()
    print(json.dumps(ctx.report_bits.get("cohort"), indent=1, default=str))
    print_summary(ctx, status)
    return 0 if status == "ok" else 1


def cmd_health(args: argparse.Namespace) -> int:
    ctx = build_ctx(args, "health")
    if not preflight(ctx):
        return 0
    if not ctx.run.acquire():
        return 2
    load_shared(ctx)
    with ctx.run.step("health") as info:
        res = health_mod.run(ctx, info)
    status = ctx.run.finish()
    print(json.dumps({"ok": res["ok"], "failures": res["failures"], "worthiness": res["worthiness"],
                      "parity": res["checks"].get("rules_parity")}, indent=1))
    print_summary(ctx, status)
    return 0 if res["ok"] else 1


def cmd_report(args: argparse.Namespace) -> int:
    """Rebuild today's report from the database; red line if daily is missing."""
    ctx = build_ctx(args, "report")
    load_shared(ctx, with_gsc=False)
    run_summary = report_mod.today_run(ctx.supa, ctx.run_date, "daily")
    reds: List[str] = []
    if run_summary is None:
        reds.append("daily run missing: no seo_runs row for today (cron dead, lock, or Supabase down)")
    elif run_summary.get("status") == "started":
        reds.append("daily run still 'started' at report time: crashed or hung")
    ctx.report_bits["health"] = None
    # the health result from the daily run lives in its report file; reuse it
    prior = ctx.state / f"report-{ctx.run_date.isoformat()}.json"
    if prior.exists():
        try:
            saved = json.loads(prior.read_text(encoding="utf-8"))
            ctx.report_bits["health"] = {"ok": saved.get("health", {}).get("ok"),
                                         "failures": saved.get("health", {}).get("failures", []),
                                         "worthiness": saved.get("citations", {}).get("worthiness", {})}
            for k in ("cohort", "competitor_changes", "escalation_lines"):
                if saved.get(k):
                    ctx.report_bits[k] = saved[k] if k != "escalation_lines" else saved.get("index", {}).get("escalation", [])
        except ValueError:
            pass
    if not ctx.report_bits.get("health"):
        ctx.report_bits["health"] = {"ok": None, "failures": [], "worthiness": {}}
    month = ctx.run.month_spend()
    rep = report_mod.build(ctx.supa, ctx.run_date, run_summary, ctx.gates.mode(), month, ctx.metrics,
                           ctx.sitemap, ctx.report_bits, ctx.state, ctx.dry_run, reds)
    print(json.dumps({"date": rep["date"], "mode": rep["mode"], "run": rep["run"]["status"],
                      "red_lines": rep["red_lines"], "traffic_d3": rep["traffic"]["d3"],
                      "index": {k: rep["index"][k] for k in ("tracked", "indexed", "not_indexed", "unknown")}},
                     indent=1, default=str))
    return 1 if reds else 0


def cmd_import_baseline(args: argparse.Namespace) -> int:
    dry_run = effective_dry_run(args.dry_run)
    supa = Supa(dry_run=dry_run)
    res = indexing.import_baseline(args.arg or BASELINE_DEFAULT, supa)
    print(json.dumps(res, indent=1))
    return 0 if res["ok"] else 1


def print_summary(ctx: Ctx, status: str) -> None:
    s = ctx.run.summary()
    lines = [f"run {s['kind']} {s['run_date']}: {status} mode={ctx.gates.mode()} spend=${s['spend_usd']:.4f} "
             f"candidates={s['candidates']} proposals={s['proposals']} applied={len(ctx.applied)}"]
    for name, st in s["steps"].items():
        lines.append(f"  {name:16} {st.get('status'):5} {st.get('ms', 0):>6}ms  {st.get('note') or st.get('error') or ''}")
    if ctx.supa.missing_tables:
        lines.append(f"  missing tables: {sorted(ctx.supa.missing_tables)}")
    if ctx.gates.run_blocks:
        lines.append(f"  apply blocked: {ctx.gates.run_blocks}")
    if ctx.supa.skipped_writes:
        n = len(ctx.supa.skipped_writes)
        lines.append(f"  dry-run: {n} writes skipped")
    print("\n".join(lines))


def main(argv: Optional[List[str]] = None) -> int:
    args = parse_args(argv)
    handlers = {"daily": cmd_daily, "weekly": cmd_weekly, "measure": cmd_measure, "probe": cmd_probe,
                "health": cmd_health, "report": cmd_report, "import-baseline": cmd_import_baseline}
    return handlers[args.command](args)


if __name__ == "__main__":
    sys.exit(main())

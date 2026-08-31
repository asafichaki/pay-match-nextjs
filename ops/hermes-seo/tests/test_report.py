"""report contract -> digest HTML (render_seo_section), stale and red-line rules."""
from __future__ import annotations

import datetime as dt
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

import report

PKG = Path(__file__).resolve().parent.parent
RENDER = PKG.parent / "portfolio-digest" / "render_seo_section.py"
spec = importlib.util.spec_from_file_location("render_seo_section", RENDER)
render = importlib.util.module_from_spec(spec)
spec.loader.exec_module(render)  # type: ignore[union-attr]

NOW = dt.datetime(2026, 9, 10, 6, 30, tzinfo=dt.timezone.utc)


def sample(**over) -> dict:
    base = {
        "date": "2026-09-10", "generated_at": "2026-09-10T04:20:00+00:00", "code_version": "abc1234",
        "mode": "shadow", "spend_mtd": 1.234,
        "run": {"status": "ok", "steps": {"gsc": "ok", "titles_b1": "ok"}, "spend_usd": 0.1},
        "traffic": {"d3": {"date": "2026-09-07", "clicks": 4, "impressions": 1500, "human_impressions": 1200, "ctr": 0.0033},
                    "w7": {"clicks": 25, "human_impressions": 8000, "prior": {"clicks": 20, "human_impressions": 7000}},
                    "w28": {"clicks": 95, "human_impressions": 30000, "prior": {"clicks": 80, "human_impressions": 28000}},
                    "device_ctr": {"desktop": 0.004, "mobile": 0.002},
                    "canada": {"clicks": 2, "impressions": 300}},
        "index": {"tracked": 72, "indexed": 50, "not_indexed": 15, "unknown": 7,
                  "newly_indexed": ["/insights/gaming-merchant-account"],
                  "pillar": {"state": "Crawled - currently not indexed", "last_crawl": "2026-09-01T00:00:00Z", "googlebot_hits_7d": 3},
                  "bing_indexed": 140, "escalation": ["/insights/x: rung 1, day 3, no crawl signal"]},
        "changes": {"lines": [{"slug": "square-vs-stripe", "field": "meta_title", "old": "Long old title", "new": "Short new title", "status": "applied"}],
                    "verification_pending": 1, "advisory_regressions": 0, "rollbacks": [], "proposed_today": 4, "applied_today": 1},
        "cohort": {"available": True, "verdict": "inconclusive", "n_changed": 5, "n_holdout": 21, "days_after": 4,
                   "diff": {"impr_per_day": {"did": 0.12}, "position": {"did": -0.4}, "ctr": {"did": None}}},
        "citations": {"cited": 7, "total": 20, "buckets": {"comparison": {"n": 8, "cited": 5}, "fees": {"n": 6, "cited": 0},
                                                             "high-risk": {"n": 6, "cited": 0}, "brand": {"n": 4, "cited": 4}},
                      "retained": 5, "gained": 1, "lost": 1, "engines": 1, "date": "2026-09-08",
                      "worthiness": {"at6": 12, "total": 60}, "money_presence": {"in_top100": 3, "total": 14}},
        "drafts": [{"title": "Fee calculator guide", "admin_url": "https://www.mypayadvisor.com/admin/articles"}],
        "competitor_changes": ["stripe vs square: #2 nerdwallet.com changed content"],
        "health": {"ok": True, "failures": []},
        "red_lines": [],
    }
    base.update(over)
    return base


class Render(unittest.TestCase):
    def test_full_block_under_25_lines_and_no_em_dash(self) -> None:
        lines = render.render_lines(sample(), NOW)
        self.assertLessEqual(len(lines), 25)
        joined = "\n".join(lines)
        self.assertNotIn("\u2014", joined)
        self.assertIn("Status: shadow | run ok | code abc1234 | spend MTD $1.23", lines[0])
        self.assertTrue(any("Index: tracked 72 | indexed 50" in l for l in lines))
        self.assertTrue(any("cited 7/20" in l and "brand 4/4" in l for l in lines))
        self.assertTrue(any("Citation-worthiness 12/60 at 6/6" in l for l in lines))
        self.assertTrue(any("Drafts waiting" in l for l in lines))
        self.assertTrue(any("Cohort (5 changed vs 21 holdout" in l for l in lines))

    def test_failures_first_in_red(self) -> None:
        rep = sample(health={"ok": False, "failures": ["sitemap 503"]}, red_lines=["rules parity mismatch"])
        lines = render.render_lines(rep, NOW)
        self.assertTrue(lines[0].startswith("RED rules parity mismatch"))
        self.assertTrue(lines[1].startswith("RED sitemap 503"))
        html_out = render.render_seo_section.__globals__["_line"]("x", render.RED, True)
        self.assertIn("#B42318", html_out)

    def test_stale_report_is_one_line(self) -> None:
        rep = sample(generated_at="2026-09-08T04:00:00+00:00")
        lines = render.render_lines(rep, NOW)
        self.assertEqual(len(lines), 1)
        self.assertTrue(lines[0].startswith("RED no report"))

    def test_missing_report_is_one_line(self) -> None:
        lines = render.render_lines(None, NOW)
        self.assertEqual(len(lines), 1)
        self.assertIn("36h", lines[0])

    def test_missing_daily_run_only_red(self) -> None:
        rep = sample(run={"status": "missing", "steps": {}}, red_lines=["daily run did not finish today"])
        lines = render.render_lines(rep, NOW)
        self.assertTrue(all(l.startswith("RED") for l in lines))

    def test_html_from_state_dir(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            (Path(d) / "report-2026-09-10.json").write_text(json.dumps(sample()))
            html_out = render.render_seo_section(d, NOW)
            self.assertIn("myPayAdvisor SEO", html_out)
            self.assertIn("Status: shadow", html_out)
            self.assertNotIn("\u2014", html_out)
            self.assertIn("report 2026-09-10", html_out)

    def test_html_no_report(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            html_out = render.render_seo_section(d, NOW)
            self.assertIn("no report", html_out)


if __name__ == "__main__":
    unittest.main()


class DraftsBlock(unittest.TestCase):
    """A retired page must never be offered for a one-click publish.

    On 2026-08-26 the first real digest listed `stripe-vs-square-2026` and
    `stripe-vs-helcim-2026`, the two duplicates that had been merged into
    their winners and 308-redirected that morning. Both carry `is_autopilot`
    because the engine closed on 2026-07-13 created them.
    """

    class FakeSupa:
        def __init__(self, rows):
            self.rows = rows
            self.params = None

        def safe_get(self, table, params, limit=None):
            self.params = params
            return self.rows

    def test_retired_slugs_are_never_offered(self) -> None:
        supa = self.FakeSupa([
            {"slug": "stripe-vs-square-2026", "title": "Stripe vs Square 2026", "kind": "comparisons"},
            {"slug": "stripe-vs-helcim-2026", "title": "Stripe vs Helcim 2026", "kind": "comparisons"},
            {"slug": "stax-vs-helcim-2026", "title": "Stax vs Helcim 2026", "kind": "comparisons"},
        ])
        out = report.drafts_block(supa)
        self.assertEqual([d["title"] for d in out], ["Stax vs Helcim 2026"])

    def test_query_is_scoped_to_this_loop(self) -> None:
        supa = self.FakeSupa([])
        report.drafts_block(supa)
        self.assertEqual(supa.params["published"], "eq.false")
        self.assertEqual(supa.params["is_autopilot"], "eq.true")
        self.assertTrue(supa.params["created_at"].startswith("gte.2026-08-26"))

    def test_caps_at_five(self) -> None:
        supa = self.FakeSupa([{"slug": f"s{i}", "title": f"T{i}", "kind": "comparisons"} for i in range(9)])
        self.assertEqual(len(report.drafts_block(supa)), 5)


class ChangesCounters(unittest.TestCase):
    """`report` runs as its own cron 85 minutes after `daily`.

    The counters must come from the database, or every single morning the
    summary reads "proposed today 0" directly above a list of that morning's
    proposals.
    """

    class FakeSupa:
        def __init__(self, proposed=0, applied=0):
            self.proposed, self.applied = proposed, applied

        def safe_get(self, table, params=None, limit=None):
            p = params or {}
            if p.get("status") == "eq.proposed":
                return [{"change_id": i} for i in range(self.proposed)]
            if str(p.get("status", "")).startswith("in.(applied"):
                return [{"change_id": i} for i in range(self.applied)]
            if p.get("status") == "eq.advisory_regression":
                return []
            return []

        def setting(self, key, default=None): return default

    def test_counts_come_from_the_db_when_the_process_is_fresh(self) -> None:
        supa = self.FakeSupa(proposed=5, applied=2)
        out = report.changes_block(supa, dt.date(2026, 8, 26), {})
        self.assertEqual(out["proposed_today"], 5)
        self.assertEqual(out["applied_today"], 2)

    def test_in_memory_wins_when_larger(self) -> None:
        supa = self.FakeSupa(proposed=0, applied=0)
        out = report.changes_block(supa, dt.date(2026, 8, 26),
                                   {"proposals": [1, 2, 3], "applied": [1]})
        self.assertEqual(out["proposed_today"], 3)
        self.assertEqual(out["applied_today"], 1)


class GoogleIndexLine(unittest.TestCase):
    """The mail must say "asked", never "indexed".

    Google returns 200 for any URL on a property the service account owns and
    promises nothing about an article. Only a later URL Inspection verdict
    means the page is in the index.
    """

    def _render(self, index_extra):
        import tempfile, json as _json
        with tempfile.TemporaryDirectory() as d:
            payload = {
                "date": "2026-08-26", "generated_at": "2026-08-26T05:00:00+00:00",
                "code_version": "test", "mode": "shadow", "spend_mtd": 0.01,
                "run": {"status": "ok", "steps": {}},
                "traffic": {"d3": {"date": "2026-08-23", "clicks": 0, "impressions": 1,
                                   "human_impressions": 1, "ctr": 0.0},
                            "w7": {"clicks": 0, "human_impressions": 1, "prior": {"clicks": 0, "human_impressions": 1}},
                            "w28": {"clicks": 0, "human_impressions": 1, "prior": {"clicks": 0, "human_impressions": 1}},
                            "device_ctr": {"desktop": 0.0, "mobile": 0.0},
                            "canada": {"clicks": 0, "human_impressions": 0}},
                "index": {"tracked": 1, "indexed": 0, "not_indexed": 1, "unknown": 0,
                          "newly_indexed": [], "pillar": {}, "escalation": [], **index_extra},
                "changes": {"lines": [], "proposed_today": 0, "applied_today": 0,
                            "verification_pending": 0, "advisory_regressions": 0, "rollbacks": []},
                "cohort": {}, "citations": {}, "drafts": [], "competitor_changes": [],
                "health": {"ok": True, "failures": [], "worthiness": {}}, "red_lines": [],
            }
            Path(d, "report-2026-08-26.json").write_text(_json.dumps(payload), encoding="utf-8")
            # `now` is pinned to the report's own day. Without it the renderer
            # would call the fixture stale from 2026-08-29 onwards and these
            # assertions would start failing on a calendar date, not on a code
            # change. That is exactly what happened.
            return render.render_seo_section(d, now=dt.datetime(2026, 8, 26, 6, 0, tzinfo=dt.timezone.utc))

    def test_says_asked_not_indexed(self) -> None:
        html = self._render({"google_index": {"asked": 22, "failed": 0}})
        self.assertIn("Google recrawl asked for 22 urls", html)
        self.assertNotIn("Google indexed 22", html)

    def test_reports_the_skip_reason(self) -> None:
        html = self._render({"google_index": {"asked": 0, "skipped": "no indexing key at /x"}})
        self.assertIn("Google recrawl skipped: no indexing key at /x", html)

    def test_silent_when_there_is_nothing_to_say(self) -> None:
        html = self._render({})
        self.assertNotIn("Google recrawl", html)


class GoogleIndexPersistence(unittest.TestCase):
    """`report` is its own cron 85 minutes after `daily`.

    Anything kept only in memory is invisible to the morning mail, and a
    value saved on a previous day must never be shown as if it happened
    this morning.
    """

    class FakeSupa:
        def __init__(self, saved): self.saved = saved
        def safe_get(self, *a, **k): return []
        def setting(self, key, default=None):
            return self.saved if key == "google_index_last" else default

    def test_todays_saved_push_is_used(self) -> None:
        supa = self.FakeSupa({"asked": 22, "failed": 0, "date": "2026-08-26"})
        out = report.index_block(supa, {}, dt.date(2026, 8, 26), {})
        self.assertEqual(out["google_index"]["asked"], 22)

    def test_yesterdays_push_is_not_shown_as_todays(self) -> None:
        supa = self.FakeSupa({"asked": 22, "failed": 0, "date": "2026-08-25"})
        out = report.index_block(supa, {}, dt.date(2026, 8, 26), {})
        self.assertEqual(out["google_index"], {})

    def test_in_process_value_wins(self) -> None:
        supa = self.FakeSupa({"asked": 1, "date": "2026-08-26"})
        out = report.index_block(supa, {}, dt.date(2026, 8, 26), {"google_index": {"asked": 60}})
        self.assertEqual(out["google_index"]["asked"], 60)

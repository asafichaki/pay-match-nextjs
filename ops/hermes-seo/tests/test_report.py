"""report contract -> digest HTML (render_seo_section), stale and red-line rules."""
from __future__ import annotations

import datetime as dt
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

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

"""The designed morning mail.

Guards the three things that actually break an email: it must render from
the report JSON alone, it must survive a half-empty report, and it must stay
inside the HTML subset Gmail keeps.
"""
from __future__ import annotations

import re
import unittest

import mail_html


def report(**over):
    r = {
        "date": "2026-08-31", "generated_at": "2026-08-31T04:40:04+00:00",
        "code_version": "1d874b9", "mode": "apply", "spend_mtd": 0.406,
        "run": {"status": "ok", "steps": {"gsc": "ok", "titles_llm": "skip"},
                "spend_usd": 0.0072, "started_at": "2026-08-31T03:15:03+00:00",
                "finished_at": "2026-08-31T03:22:56+00:00", "notes": []},
        "traffic": {"d3": {"date": "2026-08-28", "clicks": 0, "impressions": 579,
                           "human_impressions": 333, "ctr": 0.0},
                    "w7": {"clicks": 1, "human_impressions": 2628, "ctr": 0.0004,
                           "prior": {"clicks": 3, "human_impressions": 2205, "ctr": 0.0014}},
                    "w28": {"clicks": 4, "human_impressions": 4833, "ctr": 0.0008,
                            "prior": {"clicks": 0, "human_impressions": 0}},
                    "device_ctr": {"desktop": 0.0, "mobile": 0.0023},
                    "canada": {"clicks": 2, "impressions": 373}},
        "index": {"tracked": 55, "indexed": 39, "not_indexed": 16, "unknown": 0,
                  "newly_indexed": [], "pillar": {"state": "Crawled - currently not indexed",
                                                  "last_crawl": "2026-05-16T08:09:59+00:00",
                                                  "googlebot_hits_7d": 0},
                  "bing_indexed": None, "google_index": {"asked": 60, "failed": 0},
                  "escalation": [], "classes": {"/a": "indexed", "/b": "not_indexed"}},
        "changes": {"lines": [{"slug": "glossary/vamp-ratio", "field": "aeo_answer", "old": "",
                               "new": "The VAMP ratio is the metric.", "status": "verification_pending"}],
                    "verification_pending": 14, "advisory_regressions": 0, "rollbacks": [],
                    "proposed_today": 0, "applied_today": 8},
        "cohort": {"available": False, "reason": "no changed pages or no holdout"},
        "citations": {"cited": 1, "total": 20, "date": "2026-08-31",
                      "buckets": {"fees": {"n": 6, "cited": 0}, "brand": {"n": 4, "cited": 2},
                                  "high-risk": {"n": 6, "cited": 0},
                                  "comparison": {"n": 8, "cited": 1}},
                      "retained": 0, "gained": 3, "lost": 0, "engines": 1,
                      "worthiness": {"at6": 11, "scored": 60, "total": 60,
                                     "per_check": {"answer_block": 20, "table_first": 45,
                                                   "verdict_line": 60, "date_modified_90d": 32,
                                                   "sources_3": 51, "reviewed_by": 59}},
                      "money_presence": None},
        "drafts": [], "competitor_changes": [],
        "health": {"ok": False, "failures": []}, "red_lines": [], "dry_run": False,
    }
    r.update(over)
    return r


class Renders(unittest.TestCase):
    def test_nothing_to_render_returns_none(self) -> None:
        self.assertIsNone(mail_html.render(None))
        self.assertIsNone(mail_html.render({}))
        self.assertIsNone(mail_html.render("not a report"))

    def test_the_numbers_reach_the_page(self) -> None:
        html = mail_html.render(report())
        for needle in ("Monday, 31 August 2026", "2,628", "39", "4,833", "1d874b9",
                       "glossary/vamp-ratio", "11 of 60"):
            self.assertIn(needle, html, needle)

    def test_a_half_empty_report_still_renders(self) -> None:
        html = mail_html.render({"date": "2026-08-31", "run": {"status": "ok"}})
        self.assertIn("31 August", html)
        self.assertGreater(len(html), 500)

    def test_a_missing_run_says_so_and_shows_no_numbers(self) -> None:
        html = mail_html.render(report(run={"status": "missing", "steps": {}},
                                       red_lines=["daily run did not finish today"]))
        self.assertIn("did not finish", html)
        self.assertNotIn("Traffic", html)


class Alerts(unittest.TestCase):
    def test_red_lines_are_shown(self) -> None:
        html = mail_html.render(report(red_lines=["sitemap 500"]))
        self.assertIn("sitemap 500", html)
        self.assertIn("Needs a human", html)

    def test_health_failures_are_added_without_duplicating(self) -> None:
        html = mail_html.render(report(red_lines=["sitemap 500"],
                                       health={"ok": False, "failures": ["sitemap 500", "robots 404"]}))
        self.assertEqual(html.count("sitemap 500"), 1)
        self.assertIn("robots 404", html)

    def test_a_python_list_in_a_failure_is_made_readable(self) -> None:
        html = mail_html.render(report(red_lines=["live title over limit on ['/a-2026', '/b-2026']"]))
        self.assertIn("/a-2026, /b-2026", html)
        self.assertNotIn("&#x27;/a-2026&#x27;", html)
        self.assertNotIn("[&#x27;", html)

    def test_a_green_morning_says_so(self) -> None:
        html = mail_html.render(report(health={"ok": True, "failures": []}))
        self.assertIn("All checks green", html)
        self.assertNotIn("Needs a human", html)


class EmailSafety(unittest.TestCase):
    """What Gmail, Outlook and Apple Mail will not forgive."""

    def setUp(self) -> None:
        self.html = mail_html.render(report(red_lines=["one red line"],
                                            drafts=[{"title": "A draft", "admin_url": "https://x/admin"}],
                                            competitor_changes=["someone shipped a page"]))

    def test_no_style_block_and_no_script(self) -> None:
        self.assertNotIn("<style", self.html.lower())
        self.assertNotIn("<script", self.html.lower())
        self.assertNotIn("@media", self.html)

    def test_no_flex_and_no_grid(self) -> None:
        self.assertNotIn("display:flex", self.html.replace(" ", ""))
        self.assertNotIn("display:grid", self.html.replace(" ", ""))

    def test_no_remote_assets(self) -> None:
        self.assertNotIn("<img", self.html.lower())
        self.assertNotIn("background-image", self.html)
        self.assertNotIn("fonts.googleapis", self.html)

    def test_no_em_dashes(self) -> None:
        self.assertNotIn("—", self.html)
        self.assertNotIn("–", self.html)

    def test_hostile_content_is_escaped(self) -> None:
        html = mail_html.render(report(
            changes={"lines": [{"slug": "<script>alert(1)</script>", "field": "meta_title",
                                "old": "", "new": "x", "status": "applied"}],
                     "verification_pending": 0, "advisory_regressions": 0, "rollbacks": [],
                     "proposed_today": 0, "applied_today": 1}))
        self.assertNotIn("<script>alert", html)
        self.assertIn("&lt;script&gt;", html)

    def test_tags_are_balanced(self) -> None:
        for tag in ("table", "tr", "td", "div"):
            opens = len(re.findall(rf"<{tag}[\s>]", self.html))
            closes = len(re.findall(rf"</{tag}>", self.html))
            self.assertEqual(opens, closes, f"{tag}: {opens} open, {closes} closed")


class Formatting(unittest.TestCase):
    def test_a_small_rate_keeps_its_digits(self) -> None:
        self.assertEqual(mail_html.pct(0.0004), "0.04%")
        self.assertEqual(mail_html.pct(0.0023), "0.23%")
        self.assertEqual(mail_html.pct(0.12), "12.0%")

    def test_a_missing_prior_window_is_not_a_hundred_percent(self) -> None:
        text, _ = mail_html.delta(4, 0)
        self.assertEqual(text, "no prior window")

    def test_a_drop_is_red_and_a_rise_is_green(self) -> None:
        self.assertEqual(mail_html.delta(1, 3)[1], mail_html.RED)
        self.assertEqual(mail_html.delta(2628, 2205)[1], mail_html.GREEN)

    def test_the_bar_never_leaves_its_track(self) -> None:
        for value in (-1.0, 0.0, 0.5, 1.0, 4.2):
            html = mail_html.bar(value)
            widths = [int(w) for w in re.findall(r'<td width="(\d+)%"', html)]
            self.assertEqual(sum(widths), 100, value)


if __name__ == "__main__":
    unittest.main()

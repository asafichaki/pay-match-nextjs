"""The SEO mail goes to Assaf, from the mypayadvisor domain, and its subject
tells the truth before the mail is opened."""
from __future__ import annotations

import datetime as dt
import json
import tempfile
import unittest
from pathlib import Path

import mailer

D = dt.date(2026, 8, 27)


def base(**over):
    r = {"mode": "shadow", "index": {"tracked": 55, "indexed": 39, "newly_indexed": []},
         "changes": {"applied_today": 0}, "health": {"failures": []}, "red_lines": []}
    r.update(over)
    return r


class Subject(unittest.TestCase):
    def test_red_lines_come_first(self) -> None:
        s = mailer.subject_for(base(red_lines=["daily did not finish"],
                                    health={"failures": ["sitemap 500"]}), D)
        self.assertIn("1 red line", s)

    def test_health_failures_beat_good_news(self) -> None:
        s = mailer.subject_for(base(health={"failures": ["a", "b"]},
                                    index={"tracked": 55, "indexed": 40, "newly_indexed": ["/x"]}), D)
        self.assertIn("2 health failures", s)

    def test_newly_indexed_is_the_headline_when_all_is_well(self) -> None:
        s = mailer.subject_for(base(index={"tracked": 55, "indexed": 41, "newly_indexed": ["/a", "/b"]}), D)
        self.assertIn("2 newly indexed", s)

    def test_quiet_day_still_says_the_state(self) -> None:
        s = mailer.subject_for(base(), D)
        self.assertIn("shadow", s)
        self.assertIn("39/55 indexed", s)


class Recipients(unittest.TestCase):
    def test_assaf_and_barak(self) -> None:
        self.assertEqual(mailer.DEFAULT_TO,
                         ["assaf.ichaki@gmail.com", "barak@mypayadvisor.com"])

    def test_barak_is_on_the_company_mailbox_not_a_personal_gmail(self) -> None:
        barak = [t for t in mailer.DEFAULT_TO if "barak" in t.lower()]
        self.assertEqual(barak, ["barak@mypayadvisor.com"])
        self.assertFalse([t for t in mailer.DEFAULT_TO
                          if "barak" in t.lower() and t.lower().endswith("gmail.com")])

    def test_dror_is_not_a_recipient(self) -> None:
        # He is a Renology and Golden Yards partner. This is a different business.
        self.assertNotIn("drorgigi11@gmail.com", mailer.DEFAULT_TO)

    def test_sends_from_the_mypayadvisor_domain(self) -> None:
        self.assertIn("@mypayadvisor.com", mailer.DEFAULT_FROM)
        self.assertNotIn("therenology", mailer.DEFAULT_FROM)


class Sending(unittest.TestCase):
    def test_no_report_means_no_mail(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            out = mailer.send(Path(d), D, dry_run=False)
            self.assertFalse(out["sent"])
            self.assertIn("no report", out["skipped"])

    def test_dry_run_never_sends(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            Path(d, f"report-{D.isoformat()}.json").write_text(json.dumps(base()), encoding="utf-8")
            out = mailer.send(Path(d), D, dry_run=True)
            self.assertFalse(out["sent"])
            self.assertEqual(out["skipped"], "dry-run")

class Body(unittest.TestCase):
    """The designed mail is the body; the digest block is only the safety net."""

    def test_the_designed_renderer_is_the_body(self) -> None:
        with tempfile.TemporaryDirectory() as d:
            html = mailer.build_html(Path(d), base(date="2026-08-27", red_lines=["sitemap 500"]))
            self.assertIn("Needs a human", html)
            self.assertIn("sitemap 500", html)

    def test_a_broken_renderer_falls_back_instead_of_losing_the_morning(self) -> None:
        import mail_html

        original = mail_html.render
        mail_html.render = lambda report: (_ for _ in ()).throw(RuntimeError("boom"))
        try:
            with tempfile.TemporaryDirectory() as d:
                html = mailer.build_html(Path(d), base())
        finally:
            mail_html.render = original
        # No report file in the state dir, so the fallback reports the outage
        # rather than pretending the loop ran.
        self.assertIsNotNone(html)
        self.assertIn("myPayAdvisor SEO", html)


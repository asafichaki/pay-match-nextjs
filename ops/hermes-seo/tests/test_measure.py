"""measure.py on synthetic cohorts: verdicts, inconclusive floors, page flags."""
from __future__ import annotations

import datetime as dt
import unittest
from typing import Dict, List

import measure

RUN = dt.date(2026, 9, 20)
CHANGE = "2026-09-03"


def rows(page: str, start: dt.date, days: int, impr: int, clicks: int, pos: float,
         bots: int = 0) -> List[Dict]:
    out = []
    for i in range(days):
        d = start + dt.timedelta(days=i)
        out.append({"date": d.isoformat(), "page": page, "device": "desktop", "country": "usa",
                    "clicks": clicks, "impressions": impr, "position": pos, "bot_impressions": bots})
    return out


def cohort(changed_after_impr: int, changed_after_pos: float, clicks: int = 6) -> List[Dict]:
    before = dt.date(2026, 8, 20)
    after = dt.date(2026, 9, 4)
    m: List[Dict] = []
    for p in ("/c1", "/c2", "/c3"):
        m += rows(p, before, 14, 100, clicks, 12.0)
        m += rows(p, after, 14, changed_after_impr, clicks, changed_after_pos)
    for p in ("/h1", "/h2", "/h3"):
        m += rows(p, before, 14, 100, clicks, 12.0)
        m += rows(p, after, 14, 100, clicks, 12.0)
    return m


CHANGED = {"/c1": CHANGE, "/c2": CHANGE, "/c3": CHANGE}
HOLDOUT = {"/h1", "/h2", "/h3"}


class CohortRead(unittest.TestCase):
    def test_positive_when_changed_gains_impressions_vs_flat_holdout(self) -> None:
        out = measure.cohort_read(cohort(140, 10.0), CHANGED, HOLDOUT, RUN)
        self.assertTrue(out["available"])
        self.assertEqual(out["verdict"], "positive")
        self.assertGreater(out["diff"]["impr_per_day"]["did"], 0.15)

    def test_negative_when_changed_loses_and_position_slides(self) -> None:
        out = measure.cohort_read(cohort(70, 15.0), CHANGED, HOLDOUT, RUN)
        self.assertEqual(out["verdict"], "negative")

    def test_flat(self) -> None:
        out = measure.cohort_read(cohort(104, 12.2), CHANGED, HOLDOUT, RUN)
        self.assertEqual(out["verdict"], "flat")

    def test_inconclusive_under_click_floor(self) -> None:
        out = measure.cohort_read(cohort(140, 10.0, clicks=0), CHANGED, HOLDOUT, RUN)
        self.assertEqual(out["verdict"], "inconclusive")

    def test_window_not_open(self) -> None:
        out = measure.cohort_read(cohort(140, 10.0), CHANGED, HOLDOUT, dt.date(2026, 9, 5))
        self.assertFalse(out["available"])

    def test_after_window_ends_d_minus_4(self) -> None:
        out = measure.cohort_read(cohort(140, 10.0), CHANGED, HOLDOUT, dt.date(2026, 9, 12))
        self.assertEqual(out["after"][1], "2026-09-08")

    def test_bot_impressions_excluded_from_human_signal(self) -> None:
        m = cohort(100, 12.0)
        # bots on the changed pages after the change only: raw impressions triple
        # while the human signal stays flat, so the verdict must not turn positive.
        for r in m:
            if r["page"].startswith("/c") and r["date"] >= "2026-09-04":
                r["impressions"] = 300
                r["bot_impressions"] = 200
        out = measure.cohort_read(m, CHANGED, HOLDOUT, RUN)
        changed = out["stats"]["changed"]
        # impr_per_day is cohort wide (3 changed pages), so 3 x 100 human per day.
        self.assertAlmostEqual(changed["after"]["impr_per_day"], 300.0, places=1)
        self.assertAlmostEqual(changed["after"]["impr_per_day"],
                               changed["before"]["impr_per_day"], places=1)
        # raw impressions per day did triple, which is the trap being guarded
        self.assertAlmostEqual(
            changed["after"]["impressions"] / changed["after"]["days"], 900.0, places=1)
        self.assertLess(abs(out["diff"]["impr_per_day"]["did"]), 0.01)
        self.assertEqual(out["verdict"], "flat")


class PageFlags(unittest.TestCase):
    def test_flag_requires_both_signals_and_floor(self) -> None:
        m = cohort(60, 15.0)
        flags = measure.page_flags(m, CHANGED, {"impr_per_day": 0.0, "position": 0.0}, RUN)
        self.assertEqual({f["path"] for f in flags}, set(CHANGED))
        flags = measure.page_flags(cohort(60, 12.5), CHANGED, {"impr_per_day": 0.0, "position": 0.0}, RUN)
        self.assertEqual(flags, [])
        flags = measure.page_flags(cohort(60, 15.0, clicks=1), CHANGED, {"impr_per_day": 0.0, "position": 0.0}, RUN)
        self.assertEqual(flags, [])

    def test_holdout_move_is_subtracted(self) -> None:
        # the whole site fell 40%, so the changed pages are not flagged
        m = cohort(60, 15.0)
        flags = measure.page_flags(m, CHANGED, {"impr_per_day": -0.40, "position": 3.0}, RUN)
        self.assertEqual(flags, [])


if __name__ == "__main__":
    unittest.main()

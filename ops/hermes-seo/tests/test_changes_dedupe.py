"""A page and field with work already queued must not be queued again.

Shadow day one drafted ten `aeo_answer` proposals across only seven pages:
three were generated and paid for twice, because a lane decides what a page
needs from the live page and the override row, and in shadow mode neither
ever changes. The value-hash idempotency key does not catch it, since the
model phrases the answer differently on every run.
"""
from __future__ import annotations

import datetime as dt
import unittest
from pathlib import Path
from typing import Any, Dict, List

import changes
import config
from ctx import Ctx


class FakeSupa:
    configured = True

    def __init__(self) -> None:
        self.inserted: List[Dict[str, Any]] = []
        self.settings: Dict[str, Any] = {}

    def safe_get(self, table, params=None, limit=None): return []
    def insert(self, table, rows): self.inserted.extend(rows)
    def patch(self, *a, **k): pass
    def warn(self, msg): pass
    def setting(self, key, default=None): return self.settings.get(key, default)
    def set_setting(self, key, value): self.settings[key] = value


class FakeGates:
    def apply_allowed(self): return False
    def block_apply(self, reason): pass
    def mode(self): return "shadow"


def make_ctx(supa: FakeSupa) -> Ctx:
    return Ctx(supa=supa, gates=FakeGates(), run=None, rules=None,
               run_date=dt.date(2026, 8, 26), dry_run=False, limit=None,
               state=Path("/tmp"), cache=None, gemini=None)


class OpenChangeGuard(unittest.TestCase):
    def test_second_proposal_for_the_same_field_is_a_duplicate(self) -> None:
        supa = FakeSupa(); ctx = make_ctx(supa)
        first = changes.propose_or_apply(ctx, "comparisons", "stripe-vs-adyen-2026",
                                         "aeo_answer", None, "First wording of the answer.",
                                         "test", "unit")
        second = changes.propose_or_apply(ctx, "comparisons", "stripe-vs-adyen-2026",
                                          "aeo_answer", None, "Completely different wording.",
                                          "test", "unit")
        self.assertEqual(first, "proposed")
        self.assertEqual(second, "duplicate")
        self.assertEqual(len(supa.inserted), 1)

    def test_a_different_field_on_the_same_page_still_goes_through(self) -> None:
        supa = FakeSupa(); ctx = make_ctx(supa)
        changes.propose_or_apply(ctx, "comparisons", "s", "aeo_answer", None, "A", "t", "u")
        out = changes.propose_or_apply(ctx, "comparisons", "s", "meta_title", None, "B", "t", "u")
        self.assertEqual(out, "proposed")
        self.assertEqual(len(supa.inserted), 2)

    def test_a_change_carried_in_from_a_previous_run_blocks_it(self) -> None:
        supa = FakeSupa(); ctx = make_ctx(supa)
        ctx.open_changes.add("/comparisons/stripe-vs-adyen-2026|aeo_answer")
        out = changes.propose_or_apply(ctx, "comparisons", "stripe-vs-adyen-2026",
                                       "aeo_answer", None, "Anything at all.", "t", "u")
        self.assertEqual(out, "duplicate")
        self.assertEqual(supa.inserted, [])

    def test_a_retired_page_is_always_blocked(self) -> None:
        supa = FakeSupa(); ctx = make_ctx(supa)
        for slug in ("stripe-vs-square-2026", "stripe-vs-helcim-2026"):
            out = changes.propose_or_apply(ctx, "comparisons", slug, "meta_title", None, "X", "t", "u")
            self.assertEqual(out, "blocked", slug)
        self.assertEqual(supa.inserted, [])


if __name__ == "__main__":
    unittest.main()

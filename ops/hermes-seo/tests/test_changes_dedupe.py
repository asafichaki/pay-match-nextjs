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
        self.patched: List[Any] = []
        self.applied: List[Any] = []

    def safe_get(self, table, params=None, limit=None): return []
    def insert(self, table, rows): self.inserted.extend(rows)
    def patch(self, table, match, values): self.patched.append((match, values))
    def apply_change(self, *a): self.applied.append(a)
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


class ProposalMustNotBlockTheApply(unittest.TestCase):
    """A queued proposal blocks a second proposal, never the apply.

    The guard used to sit in front of the apply branch, so a page proposed
    while its wave was shut, or during the shadow days, answered "duplicate"
    on every later run and the RPC was never called. Nothing promotes a
    proposal on its own, so 35 `loop:aeo` pages were stuck for good.
    """

    class Applying(FakeGates):
        def apply_allowed(self): return True

    def _ctx(self, supa, gates, open_marker=None, in_flight_marker=None):
        ctx = make_ctx(supa)
        ctx.gates = gates
        # The apply branch calls revalidate_lean, which POSTs to the live site
        # when AUTOPILOT_SECRET is in the environment. A unit test must never
        # depend on that being unset.
        ctx.dry_run = True
        if open_marker:
            ctx.open_changes.add(open_marker)
        if in_flight_marker:
            ctx.open_changes.add(in_flight_marker)
            ctx.in_flight.add(in_flight_marker)
        return ctx

    def test_the_apply_goes_through_over_a_queued_proposal(self) -> None:
        supa = FakeSupa()
        ctx = self._ctx(supa, self.Applying(), open_marker="/insights/pci-compliance-fees|title_absolute")
        out = changes.propose_or_apply(ctx, "insights", "pci-compliance-fees", "title_absolute",
                                       "false", "true", "reason", "loop:titles_b1")
        self.assertEqual(out, "applied")
        self.assertEqual(len(supa.applied), 1)

    def test_a_second_proposal_is_still_refused(self) -> None:
        supa = FakeSupa()
        ctx = self._ctx(supa, FakeGates(), open_marker="/insights/p|aeo_answer")
        out = changes.propose_or_apply(ctx, "insights", "p", "aeo_answer", None, "Another wording.",
                                       "reason", "loop:aeo")
        self.assertEqual(out, "duplicate")
        self.assertEqual(supa.inserted, [])

    def test_a_change_in_flight_blocks_even_an_apply(self) -> None:
        # Written to the override row, not yet observed live: the page still
        # looks untouched, so a lane would redo it.
        supa = FakeSupa()
        ctx = self._ctx(supa, self.Applying(), in_flight_marker="/insights/p|aeo_answer")
        out = changes.propose_or_apply(ctx, "insights", "p", "aeo_answer", None, "A wording.",
                                       "reason", "loop:aeo")
        self.assertEqual(out, "duplicate")
        self.assertEqual(len(supa.applied), 0)

    def test_the_apply_closes_the_proposal_it_answered(self) -> None:
        supa = FakeSupa()
        ctx = self._ctx(supa, self.Applying(), open_marker="/insights/p|aeo_answer")
        changes.propose_or_apply(ctx, "insights", "p", "aeo_answer", None, "A wording.",
                                 "reason", "loop:aeo")
        self.assertIn(({"kind": "insights", "slug": "p", "field": "aeo_answer", "status": "proposed"},
                       {"status": "superseded"}), supa.patched)

    def test_the_page_is_in_flight_for_the_rest_of_the_run(self) -> None:
        supa = FakeSupa()
        ctx = self._ctx(supa, self.Applying())
        changes.propose_or_apply(ctx, "insights", "p", "aeo_answer", None, "A wording.",
                                 "reason", "loop:aeo")
        self.assertTrue(ctx.change_in_flight("/insights/p", "aeo_answer"))
        second = changes.propose_or_apply(ctx, "insights", "p", "aeo_answer", None, "Reworded.",
                                          "reason", "loop:aeo")
        self.assertEqual(second, "duplicate")
        self.assertEqual(len(supa.applied), 1)

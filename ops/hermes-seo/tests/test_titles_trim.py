"""titles.py: the deterministic trim, holdout selection, H1 rule, p90 targets."""
from __future__ import annotations

import unittest

import titles


class Trim(unittest.TestCase):
    def test_drops_suffix_when_that_is_enough(self) -> None:
        t = "Stripe vs Square Fees Compared for Small Business 2026 | myPayAdvisor"
        out = titles.trim_title(t, "stripe vs square fees", {"stripe", "square"}, 60)
        self.assertEqual(out, "Stripe vs Square Fees Compared for Small Business 2026")
        self.assertLessEqual(len(out), 60)

    def test_money_query_segment_moves_first(self) -> None:
        t = "The Complete Guide to Choosing a Processor: Helcim vs Stripe Pricing Explained | myPayAdvisor"
        out = titles.trim_title(t, "helcim vs stripe pricing", {"helcim", "stripe"}, 60)
        self.assertIsNotNone(out)
        self.assertTrue(out.lower().startswith("helcim vs stripe pricing"))
        self.assertLessEqual(len(out), 60)

    def test_year_parenthetical_dropped_first(self) -> None:
        t = "Best Payment Processors for Nonprofits Compared Side by Side (2026 Guide)"
        out = titles.trim_title(t, "best payment processors for nonprofits", set(), 60)
        self.assertEqual(out, "Best Payment Processors for Nonprofits Compared Side by Side")

    def test_mobile_limit_52(self) -> None:
        t = "PayPal vs Square Fees for Small Business: Which Is Cheaper in 2026"
        out = titles.trim_title(t, "paypal vs square fees", {"paypal", "square"}, 52)
        self.assertIsNotNone(out)
        self.assertLessEqual(len(out), 52)
        self.assertIn("paypal", out.lower())
        self.assertIn("square", out.lower())

    def test_refuses_to_drop_brand_tokens(self) -> None:
        # the only way to fit would lose a brand, so no honest trim exists
        t = "An Extremely Long Editorial Preamble About Card Acceptance Economics: Adyen vs Stripe"
        out = titles.trim_title(t, "adyen vs stripe", {"adyen", "stripe"}, 60)
        self.assertTrue(out is None or ("adyen" in out.lower() and "stripe" in out.lower()))

    def test_none_when_query_cannot_survive(self) -> None:
        t = "A very long title without the query words at all that keeps going and going for a while"
        self.assertIsNone(titles.trim_title(t, "kratom merchant account", set(), 60))

    def test_short_titles_pass_through(self) -> None:
        self.assertEqual(titles.trim_title("Gaming Merchant Account Guide", "gaming merchant account", set(), 60),
                         "Gaming Merchant Account Guide")


class Holdout(unittest.TestCase):
    def test_deterministic_and_band_matched(self) -> None:
        cands = {f"/insights/p{i}": float(i) for i in range(1, 80)}
        a = titles.choose_holdout(cands, 21)
        b = titles.choose_holdout(cands, 21)
        self.assertEqual(a, b)
        self.assertEqual(len(a), 21)
        bands = {titles.band_of(cands[p]) for p in a}
        self.assertTrue({"1-3", "4-10", "11-20", "21-50", "50+"} <= bands)

    def test_small_candidate_set(self) -> None:
        self.assertEqual(len(titles.choose_holdout({"/a": 5.0, "/b": 7.0}, 21)), 2)
        self.assertEqual(titles.choose_holdout({}, 21), [])


class H1Rule(unittest.TestCase):
    def test_h1_moves_when_long_or_missing_query(self) -> None:
        self.assertTrue(titles.h1_needs_move("x" * 61, "stripe vs square"))
        self.assertTrue(titles.h1_needs_move("A guide to card fees", "stripe vs square"))
        self.assertFalse(titles.h1_needs_move("Stripe vs Square Fees in 2026", "stripe vs square"))
        self.assertTrue(titles.h1_needs_move("", "stripe vs square"))


class P90(unittest.TestCase):
    def test_site_derived_targets_per_band(self) -> None:
        idx = {"/p": [{"query": f"q{i}", "impressions": 50, "ctr": i / 100, "position": 5.0, "bot": False,
                       "clicks": 1} for i in range(1, 11)]}
        t = titles.p90_targets(idx)
        self.assertIn("4-10", t)
        self.assertAlmostEqual(t["4-10"], 0.09, places=2)
        self.assertEqual(titles.p90_targets({"/p": [{"query": "q", "impressions": 5, "ctr": 0.5, "position": 5.0,
                                                     "bot": False, "clicks": 0}]}), {})


if __name__ == "__main__":
    unittest.main()


class RenderedLength(unittest.TestCase):
    """The lane must measure the string Google truncates.

    The manifest hands out `base_title`, the text before the root layout
    appends " | myPayAdvisor". Comparing that against 60 made the lane blind
    to 55 of the 73 article pages whose live title was actually over the
    limit on 2026-08-31, and it wrote nothing at all for six days.
    """

    def setUp(self) -> None:
        import datetime as dt
        from pathlib import Path
        from ctx import Ctx
        import rules as rules_mod
        self.rules = rules_mod.load_rules()
        self.ctx = Ctx(supa=None, gates=None, run=None, rules=self.rules,
                       run_date=dt.date(2026, 8, 31), dry_run=True, limit=None,
                       state=Path("/tmp"), cache=None, gemini=None)

    def test_the_suffix_counts_when_the_layout_still_appends_it(self) -> None:
        base = "Best Payment Processors for Healthcare Practices 2026"   # 53
        self.ctx.suffix_on = {"/p": True}
        self.assertEqual(titles.rendered_length(self.ctx, "/p", base), len(base) + 15)
        self.assertGreater(titles.rendered_length(self.ctx, "/p", base), 60)

    def test_an_absolute_page_is_measured_bare(self) -> None:
        base = "Best Payment Processors for Healthcare Practices 2026"
        self.ctx.suffix_on = {"/p": False}
        self.assertEqual(titles.rendered_length(self.ctx, "/p", base), len(base))
        self.assertLessEqual(titles.rendered_length(self.ctx, "/p", base), 60)

    def test_an_unknown_page_is_assumed_to_carry_the_suffix(self) -> None:
        self.ctx.suffix_on = {}
        self.assertEqual(titles.rendered_length(self.ctx, "/unknown", "A title"), len("A title") + 15)


class WavePlanning(unittest.TestCase):
    """Wave A must be re-planned while it is empty.

    `title_waves` was stored on day one as {"A": {"pages": []}, ...} because
    there were no live candidates yet. The old guard tested the key, which is
    truthy for that dict, so the plan was discarded on every later run, every
    candidate fell to wave B, and wave B only opens three days after wave A
    applies. Nothing could reach wave A, so the lane deadlocked.
    """

    @staticmethod
    def replan(stored, plan):
        # Mirrors the guard in batch1.
        waves = dict(stored)
        if not (waves.get("A") or {}).get("pages"):
            waves = {"A": {"pages": plan["A"]}, "B": {"pages": plan["B"]}}
        return waves

    def test_an_empty_wave_a_is_replanned(self) -> None:
        out = self.replan({"A": {"pages": []}, "B": {"pages": []}},
                          {"A": ["/a"], "B": ["/b"]})
        self.assertEqual(out["A"]["pages"], ["/a"])

    def test_a_planned_wave_a_is_left_alone(self) -> None:
        out = self.replan({"A": {"pages": ["/old"], "applied_on": "2026-09-01"}, "B": {"pages": []}},
                          {"A": ["/new"], "B": []})
        self.assertEqual(out["A"]["pages"], ["/old"])
        self.assertEqual(out["A"]["applied_on"], "2026-09-01")

    def test_wave_b_stays_shut_until_wave_a_has_applied(self) -> None:
        import datetime as dt
        from pathlib import Path
        from ctx import Ctx

        class Supa:
            def setting(self, key, default=None): return default

        ctx = Ctx(supa=Supa(), gates=None, run=None, rules=None,
                  run_date=dt.date(2026, 9, 20), dry_run=True, limit=None,
                  state=Path("/tmp"), cache=None, gemini=None)
        shut = {"A": {"pages": ["/a"]}, "B": {"pages": ["/b"]}}
        self.assertFalse(titles.wave_may_apply(ctx, "B", shut))
        opened = {"A": {"pages": ["/a"], "applied_on": "2026-09-10"}, "B": {"pages": ["/b"]}}
        self.assertTrue(titles.wave_may_apply(ctx, "B", opened))
        self.assertTrue(titles.wave_may_apply(ctx, "A", shut))


class HoldoutSizing(unittest.TestCase):
    """The control group must leave pages behind to treat."""

    def test_never_the_whole_candidate_set(self) -> None:
        for n in (1, 2, 3, 8, 21, 45, 70, 200):
            held = titles.holdout_size(n)
            self.assertLess(held, n, f"{n} candidates")
            self.assertLessEqual(held, 21)

    def test_the_two_sets_that_deadlocked_the_lane(self) -> None:
        # 8 of 8 on day one, then 21 of 21 once the length check was fixed.
        self.assertEqual(titles.holdout_size(8), 2)
        self.assertEqual(titles.holdout_size(21), 7)

    def test_full_size_once_the_universe_is_big_enough(self) -> None:
        self.assertEqual(titles.holdout_size(70), 21)
        self.assertEqual(titles.holdout_size(500), 21)


class HoldoutFreeze(unittest.TestCase):
    """Redrawn while nothing has been treated, frozen the moment one is."""

    def _ctx(self, holdout, waves, dry_run=True):
        import datetime as dt
        from pathlib import Path
        from ctx import Ctx

        class Supa:
            def __init__(self): self.written = {}
            def setting(self, key, default=None):
                return {"holdout": holdout, "title_waves": waves}.get(key, default)
            def set_setting(self, key, value): self.written[key] = value

        return Ctx(supa=Supa(), gates=None, run=None, rules=None,
                   run_date=dt.date(2026, 9, 5), dry_run=dry_run, limit=None,
                   state=Path("/tmp"), cache=None, gemini=None)

    @staticmethod
    def _candidates(n):
        return {f"/insights/p{i}": float(i % 60) + 1 for i in range(n)}

    def test_a_small_holdout_is_redrawn_while_nothing_has_been_applied(self) -> None:
        ctx = self._ctx({"pages": ["/insights/p1", "/insights/p2"]}, {"A": {"pages": []}})
        out = ensure = titles.ensure_holdout(ctx, self._candidates(70))
        self.assertEqual(len(out), 21)
        self.assertNotEqual(out, {"/insights/p1", "/insights/p2"})
        self.assertIs(ensure, out)

    def test_it_freezes_once_a_title_has_been_applied(self) -> None:
        ctx = self._ctx({"pages": ["/insights/p1", "/insights/p2"]},
                        {"A": {"pages": ["/insights/p3"], "applied_on": "2026-09-03"}})
        out = titles.ensure_holdout(ctx, self._candidates(70))
        self.assertEqual(out, {"/insights/p1", "/insights/p2"})

    def test_a_holdout_at_target_is_left_alone(self) -> None:
        pages = [f"/insights/p{i}" for i in range(21)]
        ctx = self._ctx({"pages": pages}, {"A": {"pages": []}})
        self.assertEqual(titles.ensure_holdout(ctx, self._candidates(70)), set(pages))

    def test_it_is_stored_on_a_real_run(self) -> None:
        ctx = self._ctx(None, {}, dry_run=False)
        out = titles.ensure_holdout(ctx, self._candidates(70))
        self.assertEqual(len(out), 21)
        self.assertEqual(set(ctx.supa.written["holdout"]["pages"]), out)

    def test_too_few_candidates_means_no_holdout_and_no_crash(self) -> None:
        ctx = self._ctx(None, {}, dry_run=False)
        self.assertEqual(titles.ensure_holdout(ctx, self._candidates(2)), set())
        self.assertNotIn("holdout", ctx.supa.written)

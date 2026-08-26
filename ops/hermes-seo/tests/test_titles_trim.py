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

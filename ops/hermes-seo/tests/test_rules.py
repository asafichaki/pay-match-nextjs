"""rules.py: self-test, validators, number extraction."""
from __future__ import annotations

import copy
import unittest
from pathlib import Path

import rules

PKG = Path(__file__).resolve().parent.parent


class SelfTest(unittest.TestCase):
    def setUp(self) -> None:
        self.rules = rules.load_rules(str(PKG / "rules.fallback.json"))

    def test_fallback_loads_with_shape(self) -> None:
        self.assertEqual(self.rules.version, "2026-08-26.1")
        self.assertEqual(self.rules.title["absolute_max"], 60)
        self.assertIn("Hannah Sutton", self.rules.list("banned_bylines"))
        self.assertIn("delve", self.rules.list("banned_words"))
        self.assertIn("\u2014", self.rules.list("forbidden_chars"))

    def test_self_test_passes_on_good_rules(self) -> None:
        ok, details = rules.self_test(self.rules)
        self.assertTrue(ok, details)
        self.assertEqual(sum(1 for d in details if d.startswith("planted")), 6)

    def test_self_test_catches_permissive_rules(self) -> None:
        broken = copy.deepcopy(self.rules)
        broken.data["forbidden_chars"] = []  # em-dash would pass through
        ok, details = rules.self_test(broken)
        self.assertFalse(ok)
        self.assertTrue(any("PLANTED FAILURE PASSED: em-dash" in d for d in details))

    def test_self_test_catches_missing_claims(self) -> None:
        broken = copy.deepcopy(self.rules)
        broken.data["forbidden_claims"] = []
        ok, _ = rules.self_test(broken)
        self.assertFalse(ok)


class Validators(unittest.TestCase):
    def setUp(self) -> None:
        self.rules = rules.load_rules(str(PKG / "rules.fallback.json"))

    def test_title_absolute_limits(self) -> None:
        self.assertTrue(rules.validate_title(self.rules, "x" * 60, True, 0.0).ok)
        self.assertFalse(rules.validate_title(self.rules, "x" * 61, True, 0.0).ok)

    def test_title_body_limit_with_suffix(self) -> None:
        self.assertTrue(rules.validate_title(self.rules, "x" * 45, False, 0.0).ok)
        self.assertFalse(rules.validate_title(self.rules, "x" * 46, False, 0.0).ok)

    def test_title_mobile_guide(self) -> None:
        t = "x" * 55
        self.assertTrue(rules.validate_title(self.rules, t, True, 0.2).ok)
        res = rules.validate_title(self.rules, t, True, 0.5)
        self.assertFalse(res.ok)
        self.assertTrue(any("mobile guide" in r for r in res.reasons))

    def test_title_rejects_exclamation_and_banned_word(self) -> None:
        self.assertFalse(rules.validate_title(self.rules, "Seamless Stripe vs Square fees compared", True).ok)
        self.assertFalse(rules.validate_title(self.rules, "Stripe vs Square fees compared now!", True).ok)

    def test_meta_bounds(self) -> None:
        self.assertFalse(rules.validate_meta(self.rules, "too short").ok)
        self.assertTrue(rules.validate_meta(self.rules, "a" * 100).ok)
        self.assertFalse(rules.validate_meta(self.rules, "a" * 156).ok)

    def test_answer_numbers_must_be_on_page(self) -> None:
        page = rules.page_numbers("Stripe charges 2.9% plus 30 cents; Square 2.6% plus 10 cents. Break-even $10,000.")
        good = ("Stripe charges 2.9% plus 30 cents per online payment while Square charges 2.6% plus 10 cents "
                "in person, so a store near $10,000 a month in card volume pays less with Square and an online "
                "seller pays less with Stripe once the mix tilts to card-not-present sales and larger tickets.")
        self.assertTrue(rules.validate_answer(self.rules, good, page).ok, rules.validate_answer(self.rules, good, page).reasons)
        bad = good.replace("$10,000", "$12,000")
        res = rules.validate_answer(self.rules, bad, page)
        self.assertFalse(res.ok)
        self.assertTrue(any("not on page" in r for r in res.reasons))

    def test_answer_word_bounds(self) -> None:
        page = rules.page_numbers("")
        self.assertFalse(rules.validate_answer(self.rules, "too few words here", page).ok)
        self.assertFalse(rules.validate_answer(self.rules, " ".join(["word"] * 61), page).ok)

    def test_extract_numbers_normalizes(self) -> None:
        got = rules.extract_numbers("$ 2,500.00 and 2.9 % and 30 cents and $10K")
        self.assertIn("$2500.00", got)
        self.assertIn("2.9%", got)
        self.assertIn("30cents", got)
        self.assertIn("$10k", got)

    def test_banned_byline_anywhere(self) -> None:
        self.assertFalse(rules.validate_meta(self.rules, "Reviewed by noah briggs for accuracy, this guide covers processing fees in detail.").ok)


if __name__ == "__main__":
    unittest.main()

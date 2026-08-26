"""The one rules source, read from `src/lib/seo/rules.json`.

The TypeScript side (`src/lib/seo/rules.ts`) and this module read the same
file, so a rule changed in one place changes in both. `self_test()` plants
six failures that MUST all fail; if any passes through, the validator is
broken in the permissive direction and the caller turns apply off.

No text is ever "cleaned" here. A candidate either passes or is rejected
with reasons; the writer proposes again or gives up.
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

import config

EM_DASH = "\u2014"
EN_DASH = "\u2013"

# $1,234.56 / $10K / 2.9% / 30 cents / 0.30 per transaction
MONEY_RE = re.compile(r"\$\s?\d[\d,]*(?:\.\d+)?\s?(?:[kKmM]\b)?")
PCT_RE = re.compile(r"\d[\d,]*(?:\.\d+)?\s?%")
CENTS_RE = re.compile(r"\b\d+(?:\.\d+)?\s?(?:cents?|¢)")


@dataclass
class Result:
    ok: bool
    reasons: List[str] = field(default_factory=list)

    def __bool__(self) -> bool:  # pragma: no cover - convenience
        return self.ok


@dataclass
class Rules:
    """Parsed rules.json plus where it came from."""
    data: Dict[str, Any]
    path: str
    is_fallback: bool

    @property
    def version(self) -> str:
        return str(self.data.get("rules_version", "unknown"))

    @property
    def title(self) -> Dict[str, Any]:
        return self.data.get("title", {})

    @property
    def meta(self) -> Dict[str, Any]:
        return self.data.get("meta", {})

    @property
    def answer(self) -> Dict[str, Any]:
        return self.data.get("answer", {})

    @property
    def suffix(self) -> str:
        return str(self.title.get("suffix", " | myPayAdvisor"))

    def list(self, key: str) -> List[str]:
        return [str(x) for x in self.data.get(key, [])]


def load_rules(path: Optional[str] = None) -> Rules:
    """Load rules.json from RULES_JSON_PATH / repo / fallback."""
    if path:
        p, fallback = Path(path), False
    else:
        p, fallback = config.rules_json_path()
    data = json.loads(p.read_text(encoding="utf-8"))
    for key in ("rules_version", "title", "meta", "answer", "forbidden_chars",
                "banned_bylines", "forbidden_claims", "banned_words"):
        if key not in data:
            raise ValueError(f"rules.json missing key {key!r} ({p})")
    return Rules(data=data, path=str(p), is_fallback=fallback)


# ------------------------------------------------------------ primitives
def _contains_phrase(text: str, phrase: str) -> bool:
    return re.search(r"(?<![\w-])" + re.escape(phrase.lower()) + r"(?![\w-])", text.lower()) is not None


def forbidden_char_hits(rules: Rules, text: str) -> List[str]:
    return [c for c in rules.list("forbidden_chars") if c and c in text]


def banned_word_hits(rules: Rules, text: str) -> List[str]:
    return [w for w in rules.list("banned_words") if _contains_phrase(text, w)]


def forbidden_claim_hits(rules: Rules, text: str) -> List[str]:
    return [c for c in rules.list("forbidden_claims") if _contains_phrase(text, c)]


def banned_byline_hits(rules: Rules, text: str) -> List[str]:
    low = text.lower()
    hits = [b for b in rules.list("banned_bylines") if b.lower() in low]
    hits += [n for n in rules.list("banned_image_names") if n.lower() in low]
    return hits


def _common(rules: Rules, text: str, reasons: List[str]) -> None:
    """Checks shared by every field."""
    for c in forbidden_char_hits(rules, text):
        reasons.append(f"forbidden char {c!r}")
    for w in banned_word_hits(rules, text):
        reasons.append(f"banned word {w!r}")
    for c in forbidden_claim_hits(rules, text):
        reasons.append(f"forbidden claim {c!r}")
    for b in banned_byline_hits(rules, text):
        reasons.append(f"banned byline {b!r}")
    if re.search(r"\s{2,}", text.strip()):
        reasons.append("double space")


def rendered_title_length(rules: Rules, text: str, absolute: bool) -> int:
    """Length as a browser tab would show it: body + suffix unless absolute."""
    if absolute or text.endswith(rules.suffix.strip()):
        return len(text)
    return len(text) + len(rules.suffix)


# -------------------------------------------------------------- validators
def validate_title(rules: Rules, text: str, absolute: bool, mobile_share: float = 0.0) -> Result:
    """Title rules.

    absolute=False: the layout appends the suffix, so the body must fit
    `title.body_max`. absolute=True: the text is the whole title, `absolute_max`.
    When the page's mobile share is above the guide threshold the rendered
    length must also fit `title.mobile_guide`.
    """
    reasons: List[str] = []
    t = (text or "").strip()
    if not t:
        return Result(False, ["empty title"])
    body_max = int(rules.title.get("body_max", 45))
    absolute_max = int(rules.title.get("absolute_max", 60))
    mobile_guide = int(rules.title.get("mobile_guide", 52))
    if absolute:
        if len(t) > absolute_max:
            reasons.append(f"absolute title {len(t)} > {absolute_max}")
    else:
        if len(t) > body_max:
            reasons.append(f"title body {len(t)} > {body_max} (suffix is appended)")
    rendered = rendered_title_length(rules, t, absolute)
    if mobile_share > config.MOBILE_SHARE_GUIDE and rendered > mobile_guide:
        reasons.append(f"rendered {rendered} > mobile guide {mobile_guide} at {mobile_share:.0%} mobile")
    if len(t) < 20:
        reasons.append(f"title too short ({len(t)} < 20)")
    if t != t.rstrip("|:-, "):
        reasons.append("trailing separator")
    _common(rules, t, reasons)
    return Result(not reasons, reasons)


def validate_meta(rules: Rules, text: str) -> Result:
    reasons: List[str] = []
    t = (text or "").strip()
    if not t:
        return Result(False, ["empty meta"])
    mx = int(rules.meta.get("max", 155))
    mn = int(rules.meta.get("min", 70))
    if len(t) > mx:
        reasons.append(f"meta {len(t)} > {mx}")
    if len(t) < mn:
        reasons.append(f"meta {len(t)} < {mn}")
    _common(rules, t, reasons)
    return Result(not reasons, reasons)


def normalize_number(token: str) -> str:
    """'$ 2,500.00' -> '$2500.00'; '2.9 %' -> '2.9%'; '30 cents' -> '30cents'."""
    return re.sub(r"[\s,]", "", token.lower()).replace("¢", "cents")


def extract_numbers(text: str) -> Set[str]:
    """Every $ / % / cents figure in `text`, normalized."""
    found: Set[str] = set()
    for rx in (MONEY_RE, PCT_RE, CENTS_RE):
        for m in rx.findall(text or ""):
            found.add(normalize_number(m))
    return found


def page_numbers(page_text: str) -> Set[str]:
    """Numbers a page really shows, in every normalization an answer may use."""
    nums = extract_numbers(page_text)
    widened: Set[str] = set(nums)
    for n in nums:
        # $2500.00 -> also $2500 ; 2.90% -> also 2.9%
        if n.endswith(".00"):
            widened.add(n[:-3])
        if "." in n and n.endswith("0%"):
            widened.add(n.rstrip("%").rstrip("0").rstrip(".") + "%")
    return widened


def validate_answer(rules: Rules, text: str, page_numbers_set: Set[str]) -> Result:
    """AEO answer rules: 40-60 words, every %/$ figure present on the page."""
    reasons: List[str] = []
    t = re.sub(r"\s+", " ", (text or "")).strip()
    if not t:
        return Result(False, ["empty answer"])
    words = len(t.split())
    mn = int(rules.answer.get("min_words", 40))
    mx = int(rules.answer.get("max_words", 60))
    if words < mn:
        reasons.append(f"{words} words < {mn}")
    if words > mx:
        reasons.append(f"{words} words > {mx}")
    for n in sorted(extract_numbers(t)):
        alt = n[:-3] if n.endswith(".00") else n
        if n not in page_numbers_set and alt not in page_numbers_set:
            reasons.append(f"figure {n} not on page")
    _common(rules, t, reasons)
    return Result(not reasons, reasons)


# ---------------------------------------------------------------- self-test
def self_test(rules: Rules) -> Tuple[bool, List[str]]:
    """Six planted failures that MUST fail, plus two controls that must pass.

    Returns (ok, details). ok=False means the validator is broken; the caller
    turns apply off for the run.
    """
    details: List[str] = []
    ok = True
    good_title = "Stripe vs Square Fees: Which Costs Less in 2026"
    good_answer = ("Stripe charges 2.9% plus 30 cents per online card payment while Square "
                   "charges 2.6% plus 10 cents in person. For a store doing $10,000 a month "
                   "mostly in person, Square is cheaper by about $30 a month. Online-only "
                   "sellers usually pay less with Stripe once volume passes $15,000 a month.")
    page = page_numbers("2.9% 30 cents 2.6% 10 cents $10,000 $30 $15,000")

    planted = [
        ("em-dash", validate_title(rules, f"Stripe vs Square {EM_DASH} fees compared for 2026", True, 0.0)),
        ("61-char absolute", validate_title(rules, "x" * 61, True, 0.0)),
        ("banned byline", validate_meta(rules, "Written by Hannah Sutton, this guide compares Stripe and Square fees for small merchants in 2026."),),
        ("forbidden claim", validate_answer(rules, good_answer.replace("Square is cheaper", "Square is guaranteed cheaper"), page)),
        ("number not on page", validate_answer(rules, good_answer.replace("$30", "$45"), page)),
        ("empty title", validate_title(rules, "", True, 0.0)),
    ]
    for name, res in planted:
        if res.ok:
            ok = False
            details.append(f"PLANTED FAILURE PASSED: {name}")
        else:
            details.append(f"planted {name}: rejected ({'; '.join(res.reasons[:2])})")

    controls = [
        ("good title", validate_title(rules, good_title, True, 0.0)),
        ("good answer", validate_answer(rules, good_answer, page)),
    ]
    for name, res in controls:
        if not res.ok:
            ok = False
            details.append(f"CONTROL FAILED: {name}: {'; '.join(res.reasons)}")
        else:
            details.append(f"control {name}: ok")
    return ok, details

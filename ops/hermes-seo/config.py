"""Configuration for the myPayAdvisor SEO loop.

Everything the loop needs to know that is not data lives here: env names,
caps, lock windows, the cornerstone list, the two 308'd losers that must never
be linked, and the tracked URL set builder (live sitemap + fixed lists).

Env names are exactly those in the plan. Nothing here performs a write.
"""
from __future__ import annotations

import datetime as dt
import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

PACKAGE_DIR = Path(__file__).resolve().parent
REPO_DIR = PACKAGE_DIR.parent.parent

# ----------------------------------------------------------------- env file
def load_env_file(path: Optional[str] = None) -> Dict[str, str]:
    """Load KEY=VALUE lines from SEO_ENV_FILE (or `path`) into os.environ.

    Existing environment variables win, so a cron line can override the file.
    Missing file is not an error: on Hermes the env comes from the cron file.
    """
    target = path or os.environ.get("SEO_ENV_FILE") or str(PACKAGE_DIR / ".env")
    loaded: Dict[str, str] = {}
    p = Path(target)
    if not p.exists():
        return loaded
    for line in p.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value
            loaded[key] = value
    return loaded


def env(name: str, default: str = "") -> str:
    """Read one env var with a default; never raises."""
    return os.environ.get(name, default)


def env_flag(name: str) -> bool:
    """True only for an explicit truthy value ("1", "true", "yes", "on")."""
    return env(name, "").strip().lower() in ("1", "true", "yes", "on")


# ------------------------------------------------------------- site + env
SITE_BASE = env("SITE_BASE", "https://www.mypayadvisor.com").rstrip("/")
SITE_HOST = re.sub(r"^https?://", "", SITE_BASE)
GSC_SITE = env("GSC_SITE", "sc-domain:mypayadvisor.com")
INDEXNOW_KEY = env("INDEXNOW_KEY", "ececeafbb53f493babf094ce355c8b7f")
INDEXNOW_ENDPOINTS = ("https://api.indexnow.org/indexnow", "https://www.bing.com/indexnow")


def state_dir() -> Path:
    """SEO_STATE_DIR, created on demand.

    Default is the Hermes path. When that is not writable (a Mac dry-run) the
    loop falls back to a per-user cache dir and says so on stderr, so the
    report step still has somewhere to write.
    """
    wanted = Path(env("SEO_STATE_DIR", "/var/lib/mypayadvisor-seo"))
    try:
        wanted.mkdir(parents=True, exist_ok=True)
        probe = wanted / ".write-test"
        probe.write_text("ok")
        probe.unlink()
        return wanted
    except OSError:
        fallback = Path.home() / ".cache" / "mypayadvisor-seo"
        fallback.mkdir(parents=True, exist_ok=True)
        print(f"warn: SEO_STATE_DIR {wanted} not writable, using {fallback}", file=sys.stderr)
        return fallback


def rules_json_path() -> Tuple[Path, bool]:
    """(path, is_fallback) for rules.json.

    RULES_JSON_PATH env, else ../../src/lib/seo/rules.json relative to the
    package, else the committed fallback with the same shape.
    """
    configured = env("RULES_JSON_PATH", "")
    candidates = [Path(configured)] if configured else []
    candidates.append(PACKAGE_DIR.parent.parent / "src" / "lib" / "seo" / "rules.json")
    for c in candidates:
        if c.is_file():
            return c, False
    return PACKAGE_DIR / "rules.fallback.json", True


# ------------------------------------------------------------------ caps
CAP_TITLES_PER_DAY = 5
CAP_LINKS_PER_DAY = 10
CAP_AEO_PER_DAY = 5
CAP_INSPECTIONS_PER_DAY = 60
HOLDOUT_SIZE = 21
LOCK_DAYS_CHANGE = 14
LOCK_DAYS_ROLLBACK = 30
SPEND_CAP_USD = 30.0
STALE_LOCK_HOURS = 2
CHECK1_REWRITE_SKIP = 0.7
TITLE_WAVE_GAP_DAYS = 3
ADVISORY_ONLY_DAYS = 30
CLICK_FLOOR = 100
MOBILE_SHARE_GUIDE = 0.30
BOT_SHARE_EXCLUDE = 0.30
MIN_HUMAN_IMPR_28D = 100
LLM_TITLE_POSITION_BAND = (3.0, 15.0)
STALE_REPORT_HOURS = 36
DAY0 = dt.date(2026, 8, 26)
LLM_TITLES_FROM = dt.date(2026, 9, 9)

# ---------------------------------------------------------- fixed lists
PILLAR = "/insights/high-risk-payment-processing-guide"
CORNERSTONES: List[str] = [
    "/insights/high-risk-payment-processing-guide",
    "/insights/payment-processor-fees-guide",
    "/insights/best-payment-gateway-ecommerce",
    "/comparisons/best-payment-processors-2026",
]
# 308'd duplicate losers (PR 1). Never link to them, never change them.
LOSERS: Set[str] = {"stripe-vs-square-2026", "stripe-vs-helcim-2026"}
LOSER_PATHS: Set[str] = {f"/comparisons/{s}" for s in LOSERS}

COMPARISON_SHELLS: List[str] = [
    "best-payment-processors-100k-250k-monthly-2026",
    "best-payment-processors-10k-25k-monthly-2026",
    "best-payment-processors-2026",
    "best-payment-processors-25k-50k-monthly-2026",
    "best-payment-processors-500k-1m-monthly-2026",
    "best-payment-processors-50k-100k-monthly-2026",
    "helcim-vs-stripe",
    "paymentcloud-vs-durango",
    "paymentcloud-vs-easy-pay-direct",
    "paypal-vs-square",
    "square-vs-stripe",
    "stripe-high-risk-alternatives",
    "stripe-vs-paypal",
]
WAVE2_PAGES: List[str] = [
    "/insights/gaming-merchant-account",
    "/insights/travel-merchant-account",
    "/insights/nutra-supplement-merchant-account",
]
HIGH_RISK_EXTRA: List[str] = [
    "/comparisons/paymentcloud-vs-durango",
    "/comparisons/stripe-high-risk-alternatives",
    "/comparisons/best-high-risk-friendly-payment-processors-2026",
    "/comparisons/paymentcloud-vs-easy-pay-direct",
    "/insights/high-risk-instant-approval-reality",
]
HUBS: List[str] = ["/", "/comparisons", "/insights", "/glossary"]
TOP20_CLICKS: List[str] = [
    "/comparisons/square-vs-helcim-2026",
    "/comparisons/best-payment-processors-with-same-day-deposit-2026",
    "/comparisons/best-payment-processors-2026",
    "/comparisons/square-vs-toast-2026",
    "/insights/pci-compliance-fees",
    "/insights/payment-processor-fees-guide",
    "/comparisons/stripe-vs-adyen-2026",
    "/insights/cpacharge-vs-stripe-comparison-2026-choosing-the-right-payment-processor-for-pro",
    "/comparisons/best-pos-systems-for-small-business-2026",
    "/insights/lowest-transaction-fees-for-merchant-payment-apps-2026-a-mypayadvisor-guide",
    "/insights/best-pos-systems-for-small-business-2026-niche-comparison-expert-picks",
    "/comparisons",
    "/comparisons/stripe-vs-stax-2026",
    "/comparisons/stripe-vs-worldpay-2026",
    "/comparisons/best-payment-processors-for-nonprofits-2026",
    "/comparisons/helcim-vs-stripe",
    "/comparisons/ai-subscription-billing-tools-2026",
    "/insights/pin-debit-routing",
    "/insights/ic-pricing-breakdown",
    "/insights/best-payment-gateway-ecommerce",
]

BRAND_TOKENS: Set[str] = {
    "stripe", "square", "paypal", "helcim", "adyen", "stax", "worldpay", "toast",
    "clover", "braintree", "authorize", "paymentcloud", "durango", "easy", "shopify",
    "fiserv", "chase", "cpacharge", "lawpay", "payoneer", "wise", "checkout", "klarna",
    "affirm", "quickbooks", "gocardless", "mollie", "payline", "paysafe", "nmi",
    "elavon", "tsys", "north", "dharma", "corepay", "soar", "paykings", "amex",
    "venmo", "zelle", "lightspeed", "clearent", "payanywhere", "sumup", "tilled",
}
SLUG_STOPWORDS: Set[str] = {
    "vs", "2026", "2025", "best", "for", "and", "the", "a", "of", "in", "to", "with",
    "your", "guide", "how", "what", "is", "on", "by", "an", "or",
}
PRICING_TOKENS: Set[str] = {"fees", "fee", "pricing", "cost", "costs", "rates", "rate", "cheapest", "lowest"}

# Googlebot desktop UA for the verification poll (never used for crawling
# anything but our own pages).
GOOGLEBOT_UA = ("Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; "
                "Googlebot/2.1; +http://www.google.com/bot.html) Chrome/120.0.0.0 Safari/537.36")
LOOP_UA = "mypayadvisor-seo-loop/1.0 (+https://www.mypayadvisor.com)"


# ------------------------------------------------------------ helpers
def kind_slug(path: str) -> Tuple[str, str]:
    """Map a site path to the override (kind, slug) pair.

    /comparisons/<slug> -> ("comparisons", slug); /insights/<slug> ->
    ("insights", slug); anything else -> ("pages", path-without-leading-slash
    or "home").
    """
    p = path.split("?")[0].rstrip("/") or "/"
    m = re.match(r"^/(comparisons|insights)/([^/]+)$", p)
    if m:
        return m.group(1), m.group(2)
    return "pages", (p.strip("/") or "home")


def path_of(kind: str, slug: str) -> str:
    """Inverse of kind_slug."""
    if kind in ("comparisons", "insights"):
        return f"/{kind}/{slug}"
    return "/" if slug == "home" else f"/{slug}"


def to_url(path: str) -> str:
    return SITE_BASE + path


def to_path(url: str) -> str:
    return re.sub(r"^https?://[^/]+", "", url).split("?")[0] or "/"


def section_of(path: str) -> str:
    """Top-level section used by the link scorer and the escalation ladder."""
    parts = path.strip("/").split("/")
    return parts[0] if parts and parts[0] else "home"


def is_pricing_page(path: str) -> bool:
    toks = set(re.split(r"[-/]", path.lower()))
    return bool(toks & PRICING_TOKENS)


def slug_tokens(path: str) -> Set[str]:
    _, slug = kind_slug(path)
    return {t for t in re.split(r"[-_]", slug.lower()) if t and t not in SLUG_STOPWORDS}


def parse_sitemap(xml: str) -> Dict[str, Optional[str]]:
    """path -> lastmod (or None) from a sitemap document."""
    out: Dict[str, Optional[str]] = {}
    for loc, lm in re.findall(r"<url>\s*<loc>(.*?)</loc>(?:\s*<lastmod>(.*?)</lastmod>)?", xml, re.S):
        out[to_path(loc.strip())] = (lm.strip() or None)
    return out


def tracked_paths(sitemap: Dict[str, Optional[str]]) -> Dict[str, Set[str]]:
    """The tracked URL set: fixed lists plus the sitemap-derived rules.

    Mirrors the day-0 baseline definition so the loop and the baseline count
    the same 72-ish URLs. Returns path -> tags.
    """
    tracked: Dict[str, Set[str]] = {}

    def add(p: str, tag: str) -> None:
        if p in LOSER_PATHS:
            return
        tracked.setdefault(p, set()).add(tag)

    for s in COMPARISON_SHELLS:
        add(f"/comparisons/{s}", "comparison-shell")
    for p in CORNERSTONES:
        add(p, "cornerstone")
    for p in WAVE2_PAGES:
        add(p, "wave2")
    add("/calculator", "calculator")
    glossary = [p for p in sitemap if p.startswith("/glossary/")]
    for p in glossary[-11:]:
        add(p, "glossary-wave2")
    for p in sitemap:
        if (p.startswith("/insights/") and "merchant-account" in p) or (
                p.startswith("/comparisons/") and "high-risk" in p):
            add(p, "high-risk-cluster")
    for p in HIGH_RISK_EXTRA:
        if p in sitemap:
            add(p, "high-risk-cluster")
    for p in HUBS:
        add(p, "hub")
    for p in TOP20_CLICKS:
        add(p, "top20-clicks")
    return tracked


def focus_paths(sitemap: Dict[str, Optional[str]], limit: int = 60) -> List[str]:
    """The 60 focus pages for the citation-worthiness score.

    Article pages from the tracked set first (comparison shells, cornerstones,
    wave-2, high-risk cluster, top-20), then more comparison pages from the
    sitemap until `limit`. Hubs, glossary and tools are not scored.
    """
    tracked = tracked_paths(sitemap)
    ordered: List[str] = []
    for p, tags in tracked.items():
        if p.startswith(("/comparisons/", "/insights/")):
            ordered.append(p)
    for p in sitemap:
        if p.startswith("/comparisons/") and p not in ordered and p not in LOSER_PATHS:
            ordered.append(p)
    for p in sitemap:
        if p.startswith("/insights/") and p not in ordered:
            ordered.append(p)
    return ordered[:limit]


def today(date_override: Optional[str] = None) -> dt.date:
    if date_override:
        return dt.date.fromisoformat(date_override)
    return dt.date.today()


def code_version() -> str:
    """Short git hash of the checkout the package runs from, or 'unknown'."""
    try:
        import subprocess
        out = subprocess.run(["git", "-C", str(PACKAGE_DIR), "rev-parse", "--short", "HEAD"],
                             capture_output=True, text=True, timeout=10)
        return out.stdout.strip() or "unknown"
    except Exception:
        return "unknown"

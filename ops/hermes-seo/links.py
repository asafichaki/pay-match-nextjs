"""Related-links lane.

score = 3 x shared slug tokens (brand tokens count double)
      + 2 x shared 28d queries
      + 2 x same section
      + 1 if candidate is a cornerstone
      + 1 if candidate has clicks

3-4 links per page including one cornerstone; the two 308'd losers are
never linked; 10 pages a day; written as `related_links` through the RPC.
Holdout pages are never modified (they may still be linked to).
"""
from __future__ import annotations

import hashlib
import json
import re
from typing import Any, Dict, List, Optional, Set

import config


def humanize(path: str) -> str:
    _, slug = config.kind_slug(path)
    words = [w for w in slug.split("-") if w]
    return " ".join(w.capitalize() if w not in ("vs", "and", "for", "of") else w for w in words)


def score(candidate: str, page: str, queries: Dict[str, Set[str]], cornerstones: Set[str],
          clicks: Dict[str, int]) -> float:
    """The plan's formula, exactly."""
    ct, pt = config.slug_tokens(candidate), config.slug_tokens(page)
    shared = ct & pt
    token_points = sum(2 if t in config.BRAND_TOKENS else 1 for t in shared)
    s = 3.0 * token_points
    s += 2.0 * len(queries.get(candidate, set()) & queries.get(page, set()))
    if config.section_of(candidate) == config.section_of(page):
        s += 2.0
    if candidate in cornerstones:
        s += 1.0
    if clicks.get(candidate, 0) > 0:
        s += 1.0
    return s


def pick_links(page: str, universe: List[str], queries: Dict[str, Set[str]],
               cornerstones: Set[str], clicks: Dict[str, int], titles: Dict[str, str],
               n: int = 3) -> List[Dict[str, str]]:
    """Top `n` scored links plus a cornerstone when none made the cut."""
    ranked: List[Any] = []
    for cand in universe:
        if cand == page or cand in config.LOSER_PATHS or cand in config.HUBS:
            continue
        if not cand.startswith(("/comparisons/", "/insights/", "/calculator")):
            continue
        ranked.append((score(cand, page, queries, cornerstones, clicks), cand))
    ranked.sort(key=lambda x: (-x[0], x[1]))
    chosen = [c for _, c in ranked[:n]]
    if not any(c in cornerstones for c in chosen):
        best_c = next((c for _, c in ranked if c in cornerstones), None)
        if best_c:
            chosen.append(best_c)
    return [{"href": c, "title": titles.get(c) or humanize(c)} for c in chosen]


def links_equal(a: Any, b: List[Dict[str, str]]) -> bool:
    try:
        cur = [x.get("href") for x in (a if isinstance(a, list) else json.loads(a or "[]"))]
    except (ValueError, AttributeError):
        return False
    return cur == [x["href"] for x in b]


def choose_pages(universe: List[str], overrides: Dict[str, Dict[str, Any]], holdout: Set[str],
                 human_impr: Dict[str, int], limit: int) -> List[str]:
    """Which pages get links today: no override yet, comparisons and pricing
    first, then the least-seen pages (near-orphans have the least to lose)."""
    def key(p: str) -> Any:
        has = 1 if (overrides.get(p) or {}).get("related_links") else 0
        pricing = 0 if (p.startswith("/comparisons/") or config.is_pricing_page(p)) else 1
        return (has, pricing, human_impr.get(p, 0), p)
    cands = [p for p in universe if p not in holdout and p not in config.LOSER_PATHS
             and p.startswith(("/comparisons/", "/insights/"))]
    cands.sort(key=key)
    return cands[:limit]


def idem_key(kind: str, slug: str, links: List[Dict[str, str]]) -> str:
    digest = hashlib.sha1(json.dumps([l["href"] for l in links]).encode()).hexdigest()[:10]
    return f"links:{kind}:{slug}:{digest}"


def append_link(existing: Any, target: str, title: str, cap: int = 4) -> Optional[List[Dict[str, str]]]:
    """For the escalation ladder: add `target` to a page's related_links.

    Returns the new list, or None when the link is already there or the list
    is full and nothing may be dropped.
    """
    try:
        cur = existing if isinstance(existing, list) else json.loads(existing or "[]")
    except ValueError:
        cur = []
    cur = [x for x in cur if isinstance(x, dict) and x.get("href")]
    if any(x["href"] == target for x in cur):
        return None
    if target in config.LOSER_PATHS:
        return None
    if len(cur) >= cap:
        cur = cur[:cap - 1]
    return cur + [{"href": target, "title": title}]


def slug_pairs_cannibal(paths: List[str]) -> List[List[str]]:
    """Weekly cannibalization detector: same sorted brand set, different slugs.

    Proposes a 308 in the report; never applies one.
    """
    groups: Dict[str, List[str]] = {}
    for p in paths:
        if not p.startswith("/comparisons/"):
            continue
        toks = sorted(t for t in config.slug_tokens(p) if t in config.BRAND_TOKENS)
        if len(toks) >= 2:
            groups.setdefault("|".join(toks), []).append(p)
    return [v for v in groups.values() if len(v) > 1]


def normalize_pair_slug(a: str, b: str) -> str:
    """The content lane's slug rule: sorted(brandA, brandB), no year."""
    x, y = sorted([re.sub(r"[^a-z0-9]+", "-", a.lower()).strip("-"),
                   re.sub(r"[^a-z0-9]+", "-", b.lower()).strip("-")])
    return f"{x}-vs-{y}"

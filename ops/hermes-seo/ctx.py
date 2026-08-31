"""The per-run context every lane reads from.

Built once by main.py after the GSC and index steps so titles, links, aeo,
measure and health all see the same query index, metrics, holdout, index
status and override rows.
"""
from __future__ import annotations

import datetime as dt
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

import config
from ledger import Gates, Run
from llm import Gemini
from pages import PageCache
from rules import Rules
from supa import Supa

INDEXED_STATE = "submitted and indexed"


@dataclass
class Ctx:
    supa: Supa
    gates: Gates
    run: Run
    rules: Rules
    run_date: dt.date
    dry_run: bool
    limit: Optional[int]
    state: Path
    cache: PageCache
    gemini: Gemini
    sitemap: Dict[str, Optional[str]] = field(default_factory=dict)
    tracked: Dict[str, Set[str]] = field(default_factory=dict)
    idx: Dict[str, List[Dict[str, Any]]] = field(default_factory=dict)
    metrics: List[Dict[str, Any]] = field(default_factory=list)
    bot_queries: Set[str] = field(default_factory=set)
    holdout: Set[str] = field(default_factory=set)
    overrides: Dict[str, Dict[str, Any]] = field(default_factory=dict)  # path -> row
    index_status: Dict[str, Dict[str, Any]] = field(default_factory=dict)  # path -> row
    titles: Dict[str, str] = field(default_factory=dict)  # path -> base title, no suffix
    # path -> does the root layout still append " | myPayAdvisor"? The
    # rendered title is what Google truncates, so length checks need both.
    suffix_on: Dict[str, bool] = field(default_factory=dict)
    proposals: List[Dict[str, Any]] = field(default_factory=list)
    applied: List[Dict[str, Any]] = field(default_factory=list)
    report_bits: Dict[str, Any] = field(default_factory=dict)
    check1_rewrite_rate: float = 0.0
    citation_lock: Set[str] = field(default_factory=set)
    open_changes: Set[str] = field(default_factory=set)  # "<path>|<field>" still awaiting an outcome

    def cap(self, n: int) -> int:
        """Apply --limit on top of a lane's daily cap."""
        return min(n, self.limit) if self.limit else n

    def override(self, path: str) -> Dict[str, Any]:
        return self.overrides.get(path) or {}

    def has_open_change(self, path: str, field_name: str) -> bool:
        """Is there already a change for this page and field awaiting an outcome?

        A lane must not re-propose work that is already queued. Every lane
        decides what to do next from the CURRENT state of the page or the
        override row, and in shadow mode neither ever changes, so the same
        page is picked every single run: the first shadow day produced ten
        `aeo_answer` proposals across only seven pages, three of them drafted
        twice, each one a paid Gemini call and another line in the digest.

        The same guard matters in apply mode: a change sitting in
        `verification_pending` has not landed on the live page yet, so the
        page still looks untouched to the next run.
        """
        return f"{path}|{field_name}" in self.open_changes

    def locked(self, path: str) -> bool:
        lu = self.override(path).get("locked_until")
        return bool(lu and str(lu)[:10] >= self.run_date.isoformat())

    def article_paths(self) -> List[str]:
        return [p for p in self.sitemap if p.startswith(("/comparisons/", "/insights/"))
                and p not in config.LOSER_PATHS]

    def is_indexed(self, path: str) -> bool:
        """Day-0 amendment: the title lane only touches confirmed-indexed pages.

        A seo_index_status row decides ('Submitted and indexed'). A page never
        inspected counts as indexed only on GSC evidence: at least one click
        or 50 human impressions in the 28d window, which cannot happen to a
        page that is not in the index. Such pages are queued for inspection.
        """
        row = self.index_status.get(path)
        if row and row.get("checked_at"):
            return (row.get("coverage_state") or "").lower().startswith(INDEXED_STATE)
        pm = self.page_metrics(path)
        if pm["clicks"] >= 1 or pm["human_impr"] >= 50:
            return True
        rows = self.idx.get(path, [])
        clicks = sum(int(r.get("clicks") or 0) for r in rows)
        human = sum(int(r.get("impressions") or 0) for r in rows if not r.get("bot"))
        return clicks >= 1 or human >= 50

    def page_metrics(self, path: str) -> Dict[str, Any]:
        """Sum of the 28d seo_metrics rows for one path plus mobile share."""
        clicks = impr = mobile = bots = 0
        pos_w = 0.0
        for r in self.metrics:
            if r.get("page") != path:
                continue
            i = int(r.get("impressions") or 0)
            clicks += int(r.get("clicks") or 0)
            impr += i
            bots += int(r.get("bot_impressions") or 0)
            pos_w += float(r.get("position") or 0.0) * i
            if (r.get("device") or "").lower() == "mobile":
                mobile += i
        return {"clicks": clicks, "impressions": impr, "human_impr": max(0, impr - bots),
                "mobile_share": (mobile / impr) if impr else 0.0,
                "position": (pos_w / impr) if impr else 0.0}

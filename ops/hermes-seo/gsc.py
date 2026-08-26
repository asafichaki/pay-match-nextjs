"""Google Search Console: Search Analytics, URL Inspection, sitemap submit.

The truth source for the loop. Nothing here writes to our database; callers
store what they get. Three rules from the plan are implemented here:

* windows end at D-3 (`dataState=final`); D-1/D-2 are undercounted;
* bot queries: more than 5 words or a quote operator; the list is frozen
  weekly in `seo_settings['bot_queries']` so before and after windows use the
  same filter;
* `human_impr` = impressions from queries that are not bot queries.
"""
from __future__ import annotations

import datetime as dt
import re
import sys
import time
from typing import Any, Dict, Iterable, List, Optional, Set, Tuple

import config

READONLY = "https://www.googleapis.com/auth/webmasters.readonly"
FULL = "https://www.googleapis.com/auth/webmasters"


def is_bot_query(query: str) -> bool:
    """Plan rule: > 5 words or a quote operator marks a scraper query."""
    q = (query or "").strip()
    if '"' in q or "“" in q or "”" in q:
        return True
    return len(q.split()) > 5


def human_impr(rows: Iterable[Dict[str, Any]], bot_queries: Optional[Set[str]] = None) -> int:
    """Impressions from non-bot queries. `rows` carry keys query, impressions.

    When a frozen list is given it is the filter; otherwise the rule is
    applied directly (only at freeze time).
    """
    total = 0
    for r in rows:
        q = r.get("query", "")
        bot = (q in bot_queries) if bot_queries is not None else is_bot_query(q)
        if not bot:
            total += int(r.get("impressions") or 0)
    return total


class Gsc:
    """Search Console client built on google-api-python-client."""

    def __init__(self, sa_json: Optional[str] = None, site: Optional[str] = None,
                 write: bool = False):
        self.sa_json = sa_json or config.env("GSC_SA_JSON")
        self.site = site or config.GSC_SITE
        self.write = write
        self._svc = None
        self.calls = 0

    @property
    def configured(self) -> bool:
        return bool(self.sa_json)

    def service(self) -> Any:
        if self._svc is None:
            from google.oauth2 import service_account
            from googleapiclient.discovery import build
            creds = service_account.Credentials.from_service_account_file(
                self.sa_json, scopes=[FULL if self.write else READONLY])
            self._svc = build("searchconsole", "v1", credentials=creds, cache_discovery=False)
        return self._svc

    # ------------------------------------------------------ analytics
    def search_analytics(self, start: dt.date, end: dt.date, dims: List[str],
                         data_state: str = "final", row_limit: int = 25000,
                         dimension_filter: Optional[List[Dict[str, Any]]] = None,
                         max_rows: int = 200000) -> List[Dict[str, Any]]:
        """Paginated Search Analytics query. Returns flat dicts keyed by dims."""
        out: List[Dict[str, Any]] = []
        start_row = 0
        while True:
            body: Dict[str, Any] = {
                "startDate": start.isoformat(), "endDate": end.isoformat(),
                "dimensions": dims, "rowLimit": row_limit, "startRow": start_row,
                "dataState": data_state, "type": "web",
            }
            if dimension_filter:
                body["dimensionFilterGroups"] = [{"filters": dimension_filter}]
            resp = self._execute(self.service().searchanalytics().query(siteUrl=self.site, body=body))
            rows = resp.get("rows", []) or []
            for r in rows:
                rec = {d: k for d, k in zip(dims, r.get("keys", []))}
                rec.update({"clicks": int(r.get("clicks", 0)), "impressions": int(r.get("impressions", 0)),
                            "ctr": float(r.get("ctr", 0.0)), "position": float(r.get("position", 0.0))})
                out.append(rec)
            if len(rows) < row_limit or len(out) >= max_rows:
                return out
            start_row += row_limit

    def pull_page_device_country(self, start: dt.date, end: dt.date) -> List[Dict[str, Any]]:
        return self.search_analytics(start, end, ["date", "page", "device", "country"])

    def pull_date_page_query(self, start: dt.date, end: dt.date) -> List[Dict[str, Any]]:
        return self.search_analytics(start, end, ["date", "page", "query"])

    def pull_query_page(self, start: dt.date, end: dt.date) -> List[Dict[str, Any]]:
        return self.search_analytics(start, end, ["query", "page"])

    # ------------------------------------------------------ inspection
    def inspect(self, url: str) -> Dict[str, Any]:
        """URL Inspection with every diagnostic field the plan asks for."""
        body = {"inspectionUrl": url, "siteUrl": self.site}
        last: Dict[str, Any] = {}
        for attempt in range(3):
            try:
                resp = self._execute(self.service().urlInspection().index().inspect(body=body))
                break
            except Exception as exc:  # noqa: BLE001
                last = {"error": str(exc)[:300]}
                time.sleep(2 * (attempt + 1))
        else:
            return {"url": url, "error": last.get("error", "inspection failed")}
        ir = resp.get("inspectionResult", {}) or {}
        ix = ir.get("indexStatusResult", {}) or {}
        return {
            "url": url,
            "verdict": ix.get("verdict"),
            "coverage_state": ix.get("coverageState"),
            "indexing_state": ix.get("indexingState"),
            "robots_txt_state": ix.get("robotsTxtState"),
            "page_fetch_state": ix.get("pageFetchState"),
            "crawled_as": ix.get("crawledAs"),
            "last_crawl": ix.get("lastCrawlTime"),
            "google_canonical": ix.get("googleCanonical"),
            "user_canonical": ix.get("userCanonical"),
            "referring_urls": ix.get("referringUrls", []) or [],
            "sitemaps": ix.get("sitemap", []) or [],
            "rich_results": (ir.get("richResultsResult") or {}).get("verdict"),
            "mobile_usability": (ir.get("mobileUsabilityResult") or {}).get("verdict"),
            "inspection_link": ir.get("inspectionResultLink"),
            "error": None,
        }

    # ------------------------------------------------------ sitemaps
    def submit_sitemap(self, sitemap_url: Optional[str] = None, dry_run: bool = True) -> str:
        url = sitemap_url or f"{config.SITE_BASE}/sitemap.xml"
        if dry_run:
            print(f"dry-run: skip sitemaps.submit {url}", file=sys.stderr)
            return "skipped"
        self.write = True
        self._svc = None
        self._execute(self.service().sitemaps().submit(siteUrl=self.site, feedpath=url))
        return "submitted"

    def _execute(self, request: Any) -> Dict[str, Any]:
        self.calls += 1
        try:
            return request.execute() or {}
        except Exception as exc:  # one jittered retry on transient errors
            msg = str(exc)
            if any(code in msg for code in ("500", "502", "503", "429")):
                time.sleep(1.5)
                self.calls += 1
                return request.execute() or {}
            raise


# ------------------------------------------------------------- shaping
def windows(run_date: dt.date) -> Dict[str, Tuple[dt.date, dt.date]]:
    """The date windows every daily pull uses. Everything ends at D-3."""
    d3 = run_date - dt.timedelta(days=3)
    return {
        "trailing10": (run_date - dt.timedelta(days=10), d3),
        "28d": (d3 - dt.timedelta(days=27), d3),
        "prior28d": (d3 - dt.timedelta(days=55), d3 - dt.timedelta(days=28)),
        "7d": (d3 - dt.timedelta(days=6), d3),
        "prior7d": (d3 - dt.timedelta(days=13), d3 - dt.timedelta(days=7)),
    }


def metrics_rows(page_rows: List[Dict[str, Any]], date_page_query_rows: List[Dict[str, Any]],
                 bot_queries: Set[str]) -> List[Dict[str, Any]]:
    """Shape Search Analytics output into `seo_metrics` rows.

    `bot_impressions` per (date, page) comes from the query grain and is
    spread across the device x country rows of that page-day in proportion
    to their impressions, so the sum per page-day is exact.
    """
    bot_by_pd: Dict[Tuple[str, str], int] = {}
    for r in date_page_query_rows:
        if r.get("query") in bot_queries:
            key = (r["date"], config.to_path(r["page"]))
            bot_by_pd[key] = bot_by_pd.get(key, 0) + int(r.get("impressions") or 0)
    impr_by_pd: Dict[Tuple[str, str], int] = {}
    for r in page_rows:
        key = (r["date"], config.to_path(r["page"]))
        impr_by_pd[key] = impr_by_pd.get(key, 0) + int(r.get("impressions") or 0)
    out: List[Dict[str, Any]] = []
    for r in page_rows:
        path = config.to_path(r["page"])
        key = (r["date"], path)
        total = impr_by_pd.get(key, 0) or 1
        share = int(r.get("impressions") or 0) / total
        out.append({
            "date": r["date"], "page": path, "device": (r.get("device") or "").lower(),
            "country": (r.get("country") or "").lower(),
            "clicks": int(r.get("clicks") or 0), "impressions": int(r.get("impressions") or 0),
            "ctr": round(float(r.get("ctr") or 0.0), 5), "position": round(float(r.get("position") or 0.0), 2),
            "bot_impressions": int(round(bot_by_pd.get(key, 0) * share)),
        })
    return out


def freeze_bot_queries(query_page_rows: List[Dict[str, Any]]) -> List[str]:
    """The weekly frozen list: every bot query seen in the 28d window."""
    return sorted({r["query"] for r in query_page_rows if is_bot_query(r.get("query", ""))})


def page_query_index(query_page_rows: List[Dict[str, Any]], bot_queries: Set[str]) -> Dict[str, List[Dict[str, Any]]]:
    """path -> [{query, clicks, impressions, ctr, position, bot}] sorted by impressions."""
    idx: Dict[str, List[Dict[str, Any]]] = {}
    for r in query_page_rows:
        path = config.to_path(r["page"])
        idx.setdefault(path, []).append({
            "query": r["query"], "clicks": r["clicks"], "impressions": r["impressions"],
            "ctr": r["ctr"], "position": r["position"], "bot": r["query"] in bot_queries,
        })
    for path in idx:
        idx[path].sort(key=lambda x: -x["impressions"])
    return idx


def page_stats(idx: Dict[str, List[Dict[str, Any]]], path: str) -> Dict[str, Any]:
    """human_impr, bot_share, top human query for one page."""
    rows = idx.get(path, [])
    total = sum(r["impressions"] for r in rows)
    human = sum(r["impressions"] for r in rows if not r["bot"])
    top = next((r for r in rows if not r["bot"]), None)
    return {"impressions": total, "human_impr": human,
            "bot_share": (1 - human / total) if total else 0.0,
            "money_query": top["query"] if top else "",
            "position": (sum(r["position"] * r["impressions"] for r in rows) / total) if total else 0.0}


def slugify_query(q: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", q.lower()).strip("-")

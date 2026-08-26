"""Fetching and parsing our own pages.

One place for every live-page read the loop does: the daily fetch cache,
the Googlebot-UA no-cache poll used by verification, and the small HTML
extractors (title, H1, JSON-LD, tables, verdict line, sources, numbers) that
titles, aeo, health and weekly share. stdlib html.parser only.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
import time
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import requests

import config

_session = requests.Session()
_session.headers.update({"User-Agent": config.LOOP_UA, "Accept": "text/html,application/xhtml+xml"})


class Fetched:
    """One HTTP response, kept small."""

    def __init__(self, url: str, status: int, text: str, headers: Dict[str, str], error: str = ""):
        self.url = url
        self.status = status
        self.text = text
        self.headers = headers
        self.error = error

    @property
    def ok(self) -> bool:
        return self.status == 200 and not self.error


def fetch(url: str, nocache: bool = False, googlebot: bool = False, timeout: int = 25,
          allow_redirects: bool = True) -> Fetched:
    """GET a page. `nocache` + `googlebot` is the verification poll shape."""
    headers: Dict[str, str] = {}
    if nocache:
        headers["Cache-Control"] = "no-cache"
        headers["Pragma"] = "no-cache"
    if googlebot:
        headers["User-Agent"] = config.GOOGLEBOT_UA
    try:
        resp = _session.get(url, headers=headers, timeout=timeout, allow_redirects=allow_redirects)
        return Fetched(url, resp.status_code, resp.text or "", dict(resp.headers))
    except requests.RequestException as exc:
        return Fetched(url, 0, "", {}, error=str(exc)[:200])


class PageCache:
    """Per-run cache of live HTML so 4 steps do not fetch the same 60 pages."""

    def __init__(self, cache_dir: Optional[Path] = None, ttl_s: int = 6 * 3600):
        self.mem: Dict[str, Fetched] = {}
        self.dir = cache_dir
        self.ttl = ttl_s
        if self.dir:
            self.dir.mkdir(parents=True, exist_ok=True)

    def get(self, path: str) -> Fetched:
        if path in self.mem:
            return self.mem[path]
        url = config.to_url(path)
        key = hashlib.sha1(url.encode()).hexdigest()
        if self.dir:
            f = self.dir / f"{key}.html"
            if f.exists() and time.time() - f.stat().st_mtime < self.ttl:
                got = Fetched(url, 200, f.read_text(encoding="utf-8", errors="replace"), {})
                self.mem[path] = got
                return got
        got = fetch(url)
        if got.ok and self.dir:
            try:
                (self.dir / f"{key}.html").write_text(got.text, encoding="utf-8")
            except OSError:
                pass
        self.mem[path] = got
        return got


# ------------------------------------------------------------------ parsing
class _Extractor(HTMLParser):
    """Single pass over the document collecting what the loop needs."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.h1 = ""
        self.meta_description = ""
        self.canonical = ""
        self.robots = ""
        self.jsonld_raw: List[str] = []
        self.tables: List[List[List[str]]] = []
        self.paragraphs: List[str] = []
        self.links: List[Tuple[str, str]] = []
        self.text_parts: List[str] = []
        self.has_aeo = False
        self.aeo_text = ""
        self._stack: List[str] = []
        self._in_title = self._in_h1 = self._in_script_ld = False
        self._in_p = self._in_aeo = False
        self._aeo_depth = 0
        self._table: Optional[List[List[str]]] = None
        self._row: Optional[List[str]] = None
        self._cell: Optional[List[str]] = None
        self._link_href: Optional[str] = None
        self._link_text: List[str] = []
        self._p_buf: List[str] = []
        self._aeo_buf: List[str] = []
        self._skip_depth = 0

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, Optional[str]]]) -> None:
        a = {k: (v or "") for k, v in attrs}
        if tag in ("script", "style", "noscript", "svg"):
            if tag == "script" and a.get("type", "") == "application/ld+json":
                self._in_script_ld = True
            else:
                self._skip_depth += 1
            return
        if self._skip_depth:
            return
        if tag == "title":
            self._in_title = True
        elif tag == "h1" and not self.h1:
            self._in_h1 = True
        elif tag == "meta":
            name = a.get("name", "").lower()
            if name == "description":
                self.meta_description = a.get("content", "")
            elif name == "robots":
                self.robots = a.get("content", "")
        elif tag == "link" and a.get("rel", "").lower() == "canonical":
            self.canonical = a.get("href", "")
        elif tag == "table":
            self._table = []
        elif tag == "tr" and self._table is not None:
            self._row = []
        elif tag in ("td", "th") and self._row is not None:
            self._cell = []
        elif tag == "p":
            self._in_p = True
            self._p_buf = []
        elif tag == "a":
            self._link_href = a.get("href", "")
            self._link_text = []
        if "aeo-answer" in a.get("class", "").split():
            self.has_aeo = True
            self._in_aeo = True
            self._aeo_depth = 0
        if self._in_aeo:
            self._aeo_depth += 1

    def handle_endtag(self, tag: str) -> None:
        if tag in ("script", "style", "noscript", "svg"):
            if tag == "script" and self._in_script_ld:
                self._in_script_ld = False
            elif self._skip_depth:
                self._skip_depth -= 1
            return
        if self._skip_depth:
            return
        if tag == "title":
            self._in_title = False
        elif tag == "h1":
            self._in_h1 = False
        elif tag in ("td", "th") and self._cell is not None and self._row is not None:
            self._row.append(" ".join(self._cell).strip())
            self._cell = None
        elif tag == "tr" and self._row is not None and self._table is not None:
            if self._row:
                self._table.append(self._row)
            self._row = None
        elif tag == "table" and self._table is not None:
            if self._table:
                self.tables.append(self._table)
            self._table = None
        elif tag == "p" and self._in_p:
            txt = re.sub(r"\s+", " ", " ".join(self._p_buf)).strip()
            if txt:
                self.paragraphs.append(txt)
            self._in_p = False
        elif tag == "a" and self._link_href is not None:
            self.links.append((self._link_href, re.sub(r"\s+", " ", " ".join(self._link_text)).strip()))
            self._link_href = None
        if self._in_aeo:
            self._aeo_depth -= 1
            if self._aeo_depth <= 0:
                self._in_aeo = False
                self.aeo_text = re.sub(r"\s+", " ", " ".join(self._aeo_buf)).strip()

    def handle_data(self, data: str) -> None:
        if self._in_script_ld:
            self.jsonld_raw.append(data)
            return
        if self._skip_depth:
            return
        if self._in_title:
            self.title += data
        if self._in_h1:
            self.h1 += data
        if self._cell is not None:
            self._cell.append(data)
        if self._in_p:
            self._p_buf.append(data)
        if self._link_href is not None:
            self._link_text.append(data)
        if self._in_aeo:
            self._aeo_buf.append(data)
        self.text_parts.append(data)


class Page:
    """Parsed view of one HTML document."""

    def __init__(self, html_text: str, path: str = ""):
        self.path = path
        ex = _Extractor()
        try:
            ex.feed(html_text or "")
        except Exception:  # noqa: BLE001 - html.parser can throw on garbage
            pass
        self.title = re.sub(r"\s+", " ", ex.title).strip()
        self.h1 = re.sub(r"\s+", " ", ex.h1).strip()
        self.meta_description = ex.meta_description.strip()
        self.canonical = ex.canonical
        self.robots = ex.robots
        self.tables = ex.tables
        self.paragraphs = ex.paragraphs
        self.links = ex.links
        self.has_aeo = ex.has_aeo
        self.aeo_text = ex.aeo_text
        self.text = re.sub(r"\s+", " ", " ".join(ex.text_parts)).strip()
        self.jsonld: List[Any] = []
        self.jsonld_errors: List[str] = []
        for raw in ex.jsonld_raw:
            try:
                self.jsonld.append(json.loads(raw))
            except ValueError as exc:
                self.jsonld_errors.append(str(exc)[:120])

    # ---------------------------------------------------------- helpers
    def jsonld_nodes(self) -> List[Dict[str, Any]]:
        out: List[Dict[str, Any]] = []

        def walk(node: Any) -> None:
            if isinstance(node, dict):
                out.append(node)
                for v in node.values():
                    walk(v)
            elif isinstance(node, list):
                for v in node:
                    walk(v)
        for doc in self.jsonld:
            walk(doc)
        return out

    def jsonld_value(self, key: str) -> Optional[Any]:
        for node in self.jsonld_nodes():
            if key in node:
                return node[key]
        return None

    def verdict_line(self) -> str:
        rx = re.compile(r"\b(verdict|bottom line|our pick|winner|recommend|cheaper for|choose)\b", re.I)
        for p in self.paragraphs:
            if rx.search(p) and 40 <= len(p) <= 600:
                return p
        return ""

    def table_first(self) -> bool:
        """A table appears in the first 40% of the visible text."""
        if not self.tables:
            return False
        first = " ".join(self.tables[0][0])[:40]
        if not first:
            return False
        idx = self.text.find(first)
        return 0 <= idx <= max(1, int(len(self.text) * 0.4))

    def external_sources(self) -> int:
        hosts = set()
        for href, _ in self.links:
            m = re.match(r"^https?://([^/]+)", href)
            if m and config.SITE_HOST not in m.group(1):
                hosts.add(m.group(1).lower())
        return len(hosts)

    def date_modified(self) -> Optional[str]:
        v = self.jsonld_value("dateModified")
        return str(v) if v else None

    def reviewed_by(self) -> bool:
        v = self.jsonld_value("reviewedBy")
        if v:
            return True
        return bool(re.search(r"reviewed by", self.text, re.I))

    def byline_hits(self, names: List[str]) -> List[str]:
        low = self.text.lower()
        return [n for n in names if n.lower() in low]

    def lead_numbers(self, limit: int = 12) -> List[str]:
        from rules import MONEY_RE, PCT_RE
        found: List[str] = []
        for rx in (PCT_RE, MONEY_RE):
            for m in rx.findall(self.text):
                m = m.strip()
                if m not in found:
                    found.append(m)
        return found[:limit]

    def table_text(self, max_rows: int = 12) -> str:
        if not self.tables:
            return ""
        rows = self.tables[0][:max_rows]
        return "\n".join(" | ".join(c for c in r) for r in rows)


def live_title(path: str, nocache: bool = True) -> Tuple[Optional[str], int]:
    """(title, status) as Googlebot would see it right now (no CDN cache)."""
    got = fetch(config.to_url(path), nocache=nocache, googlebot=True)
    if not got.ok:
        return None, got.status
    return Page(got.text, path).title, got.status


def content_hash(html_text: str) -> str:
    """Stable hash of the visible text, for the competitor watch."""
    page = Page(html_text)
    return hashlib.sha256(page.text.encode("utf-8", "replace")).hexdigest()[:16]


def log(msg: str) -> None:
    print(msg, file=sys.stderr)

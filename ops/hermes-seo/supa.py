"""PostgREST client for the loop's nine tables and the one write RPC.

Only `requests` is used (no supabase client on Hermes). Reads always run.
Writes are skipped and logged when `dry_run` is True. A table or RPC that
does not exist yet (PostgREST 404 with PGRST2xx) raises `TableMissing`, and
the `safe_*` helpers turn that into a warning plus an empty result so a
dry-run before the migration reports instead of crashing.

Override writes go ONLY through `apply_change()` (RPC `seo_apply_change`).
"""
from __future__ import annotations

import json
import random
import sys
import time
from typing import Any, Dict, Iterable, List, Optional

import requests

from config import env

TIMEOUT = 30
ROW_CAP = 1000  # PostgREST default max rows per response


class SupaError(RuntimeError):
    """Any non-2xx response that is not a missing table."""


class TableMissing(SupaError):
    """The table, view or RPC does not exist (migration not applied yet)."""


class Supa:
    """Thin PostgREST wrapper. One instance per run."""

    def __init__(self, url: Optional[str] = None, key: Optional[str] = None,
                 dry_run: bool = True):
        self.url = (url or env("SUPABASE_URL")).rstrip("/")
        self.key = key or env("SUPABASE_SERVICE_ROLE_KEY")
        self.dry_run = dry_run
        self.missing_tables: set = set()
        self.warnings: List[str] = []
        self.skipped_writes: List[Dict[str, Any]] = []
        self.session = requests.Session()
        self.session.headers.update({
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "User-Agent": "mypayadvisor-seo-loop/1.0",
        })

    @property
    def configured(self) -> bool:
        return bool(self.url and self.key)

    # ------------------------------------------------------------ plumbing
    def _request(self, method: str, path: str, params: Optional[Dict[str, Any]] = None,
                 body: Any = None, headers: Optional[Dict[str, str]] = None) -> Any:
        if not self.configured:
            raise SupaError("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing")
        full = f"{self.url}/rest/v1/{path}"
        data = json.dumps(body) if body is not None else None
        last_err: Optional[Exception] = None
        for attempt in range(2):
            try:
                resp = self.session.request(method, full, params=params, data=data,
                                            headers=headers or {}, timeout=TIMEOUT)
            except requests.RequestException as exc:
                last_err = exc
                if attempt == 0:
                    time.sleep(0.5 + random.random())
                    continue
                raise SupaError(f"{method} {path}: {exc}") from exc
            if resp.status_code >= 500 and attempt == 0:
                time.sleep(0.5 + random.random())  # one jittered retry on 5xx
                continue
            if resp.status_code == 404 or resp.status_code == 400:
                text = resp.text or ""
                if ("PGRST2" in text or "Could not find" in text
                        or "does not exist" in text or "42P01" in text):
                    name = path.split("?")[0]
                    self.missing_tables.add(name)
                    raise TableMissing(f"{name}: {text[:200]}")
            if resp.status_code >= 400:
                raise SupaError(f"{method} {path} {resp.status_code}: {resp.text[:300]}")
            if not resp.text:
                return None
            try:
                return resp.json()
            except ValueError:
                return resp.text
        raise SupaError(f"{method} {path}: {last_err}")

    # --------------------------------------------------------------- reads
    def get(self, table: str, params: Optional[Dict[str, Any]] = None,
            limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """GET rows. Paginates past the 1000-row cap unless `limit` is set."""
        params = dict(params or {})
        if limit is not None:
            params["limit"] = limit
            rows = self._request("GET", table, params=params)
            return rows or []
        out: List[Dict[str, Any]] = []
        offset = 0
        while True:
            page = self._request("GET", table, params=params,
                                 headers={"Range-Unit": "items",
                                          "Range": f"{offset}-{offset + ROW_CAP - 1}"}) or []
            out.extend(page)
            if len(page) < ROW_CAP:
                return out
            offset += ROW_CAP

    def safe_get(self, table: str, params: Optional[Dict[str, Any]] = None,
                 limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """GET that degrades to [] with a warning on a missing table or error."""
        if not self.configured:
            self.warn(f"{table}: Supabase not configured, read skipped")
            return []
        try:
            return self.get(table, params, limit)
        except TableMissing:
            self.warn(f"{table}: table missing (migration not applied yet)")
            return []
        except SupaError as exc:
            self.warn(f"{table}: read failed: {exc}")
            return []

    def setting(self, key: str, default: Any = None) -> Any:
        rows = self.safe_get("seo_settings", {"key": f"eq.{key}", "select": "value"}, limit=1)
        if rows:
            return rows[0].get("value")
        return default

    # -------------------------------------------------------------- writes
    def _write(self, method: str, table: str, body: Any, params: Optional[Dict[str, Any]] = None,
               prefer: str = "return=representation") -> Any:
        if self.dry_run:
            self.skipped_writes.append({"method": method, "table": table,
                                        "rows": (len(body) if isinstance(body, list) else 1)})
            print(f"dry-run: skip {method} {table} "
                  f"{json.dumps(body)[:160]}", file=sys.stderr)
            return None
        return self._request(method, table, params=params, body=body,
                             headers={"Prefer": prefer})

    def insert(self, table: str, rows: Any) -> Any:
        return self._write("POST", table, rows)

    def upsert(self, table: str, rows: Any, on_conflict: Optional[str] = None) -> Any:
        params = {"on_conflict": on_conflict} if on_conflict else None
        return self._write("POST", table, rows, params=params,
                           prefer="resolution=merge-duplicates,return=representation")

    def patch(self, table: str, match: Dict[str, Any], values: Dict[str, Any]) -> Any:
        params = {k: f"eq.{v}" for k, v in match.items()}
        return self._write("PATCH", table, values, params=params)

    def set_setting(self, key: str, value: Any) -> None:
        """Upsert one seo_settings row (warning, not crash, when missing)."""
        try:
            self.upsert("seo_settings", [{"key": key, "value": value}], on_conflict="key")
        except TableMissing:
            self.warn("seo_settings: table missing, setting not stored")
        except SupaError as exc:
            self.warn(f"seo_settings[{key}]: {exc}")

    def safe_upsert(self, table: str, rows: Iterable[Dict[str, Any]],
                    on_conflict: Optional[str] = None, chunk: int = 500) -> int:
        """Upsert in chunks; warns instead of raising. Returns rows attempted."""
        rows = list(rows)
        if not rows:
            return 0
        done = 0
        for i in range(0, len(rows), chunk):
            part = rows[i:i + chunk]
            try:
                self.upsert(table, part, on_conflict=on_conflict)
                done += len(part)
            except TableMissing:
                self.warn(f"{table}: table missing, {len(rows)} rows not written")
                return done
            except SupaError as exc:
                self.warn(f"{table}: upsert failed: {exc}")
                return done
        return done

    # ----------------------------------------------------------------- RPC
    def rpc(self, name: str, args: Dict[str, Any]) -> Any:
        """POST /rest/v1/rpc/<name>. Writes are gated by dry_run."""
        if self.dry_run:
            self.skipped_writes.append({"method": "RPC", "table": name, "rows": 1})
            print(f"dry-run: skip rpc {name} {json.dumps(args)[:200]}", file=sys.stderr)
            return None
        return self._request("POST", f"rpc/{name}", body=args)

    def apply_change(self, idempotency_key: str, kind: str, slug: str, field: str,
                     new: Any, reason: str, source: str) -> Any:
        """The ONLY path that writes seo_overrides. One RPC, one transaction."""
        if kind not in ("insights", "comparisons", "pages"):
            raise ValueError(f"invalid kind {kind!r}")
        new_value = new if isinstance(new, str) else json.dumps(new)
        return self.rpc("seo_apply_change", {
            "p_idempotency_key": idempotency_key,
            "p_kind": kind,
            "p_slug": slug,
            "p_field": field,
            "p_new": new_value,
            "p_reason": reason,
            "p_source": source,
        })

    # ------------------------------------------------------------- misc
    def warn(self, message: str) -> None:
        if message not in self.warnings:
            self.warnings.append(message)
        print(f"warn: {message}", file=sys.stderr)

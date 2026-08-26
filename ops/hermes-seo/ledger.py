"""Run lifecycle, step timing, spend accounting, kill switches.

One `Run` per invocation. The run lock is the `seo_runs` row itself: unique
(run_date, kind), status 'started'; a 'started' row older than
STALE_LOCK_HOURS is treated as abandoned and taken over. Every step is
recorded in `seo_runs.step_status` as it finishes, so a crash mid-run leaves
a readable trail. `status='ok'` only when every step is ok AND (proposals >= 1
when candidates existed).

`Gates` holds the kill switches: env SEO_LOOP_ENABLED / SEO_APPLY_ENABLED AND
`seo_settings` rows `loop_enabled` / `apply_enabled`; any false = off. It is
re-read before every override write.
"""
from __future__ import annotations

import datetime as dt
import sys
import time
import traceback
from contextlib import contextmanager
from typing import Any, Dict, Iterator, List, Optional

import config
from supa import Supa, SupaError, TableMissing


def now_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")


def parse_ts(value: Optional[str]) -> Optional[dt.datetime]:
    if not value:
        return None
    try:
        v = value.replace("Z", "+00:00")
        parsed = dt.datetime.fromisoformat(v)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=dt.timezone.utc)
        return parsed
    except ValueError:
        return None


class Gates:
    """Kill switches and apply preconditions.

    `apply_allowed()` is the single question every writer asks right before an
    RPC. It re-reads seo_settings each time (a GET per write, at most ~25 a
    day) so a switch flipped mid-run stops the very next write.
    """

    def __init__(self, supa: Supa, dry_run: bool):
        self.supa = supa
        self.dry_run = dry_run
        self.env_loop = config.env_flag("SEO_LOOP_ENABLED")
        self.env_apply = config.env_flag("SEO_APPLY_ENABLED")
        self.run_blocks: List[str] = []  # reasons apply is off for this run
        self._settings_cache: Dict[str, Any] = {}
        self._settings_at = 0.0

    def block_apply(self, reason: str) -> None:
        if reason not in self.run_blocks:
            self.run_blocks.append(reason)
            print(f"apply off: {reason}", file=sys.stderr)

    def _setting(self, key: str, default: Any = None, max_age: float = 0.0) -> Any:
        """Read a seo_settings value; a missing table reads as `default`."""
        if max_age and time.time() - self._settings_at < max_age and key in self._settings_cache:
            return self._settings_cache[key]
        value = self.supa.setting(key, default)
        self._settings_cache[key] = value
        self._settings_at = time.time()
        return value

    def loop_enabled(self) -> bool:
        """Checked once at start. Dry-run may proceed without the env flag."""
        db = self._setting("loop_enabled", True)
        if db is False:
            return False
        if self.dry_run:
            return True
        return self.env_loop

    def db_apply_enabled(self) -> bool:
        return self._setting("apply_enabled", False) is True

    def mode(self) -> str:
        """'dry-run' | 'shadow' | 'apply' for the status line."""
        if self.dry_run:
            return "dry-run"
        if self.env_apply and self.db_apply_enabled() and not self.run_blocks:
            return "apply"
        return "shadow"

    def apply_allowed(self) -> bool:
        """Re-check everything right before an override write."""
        if self.dry_run or not self.env_loop or not self.env_apply:
            return False
        if self.run_blocks:
            return False
        if self._setting("loop_enabled", True) is False:
            return False
        return self._setting("apply_enabled", False) is True


class Run:
    """One row in seo_runs plus in-memory step and spend bookkeeping."""

    def __init__(self, supa: Supa, kind: str, run_date: dt.date, dry_run: bool,
                 force: bool = False):
        self.supa = supa
        self.kind = kind
        self.run_date = run_date
        self.dry_run = dry_run
        self.force = force
        self.step_status: Dict[str, Dict[str, Any]] = {}
        self.spend_usd = 0.0
        self.started_at = now_iso()
        self.finished_at: Optional[str] = None
        self.status = "started"
        self.candidates = 0
        self.proposals = 0
        self.notes: List[str] = []
        self.locked = False
        self.row_written = False

    # -------------------------------------------------------------- lock
    def acquire(self) -> bool:
        """Insert the seo_runs row as the run lock. False = another run holds it."""
        if self.dry_run:
            self.locked = True
            return True
        try:
            rows = self.supa.get("seo_runs", {"run_date": f"eq.{self.run_date.isoformat()}",
                                              "kind": f"eq.{self.kind}"}, limit=1)
        except TableMissing:
            self.supa.warn("seo_runs: table missing, running without a lock")
            self.locked = True
            return True
        except SupaError as exc:
            self.supa.warn(f"seo_runs lock read failed: {exc}")
            return False
        if rows:
            row = rows[0]
            started = parse_ts(row.get("started_at"))
            age_h = ((dt.datetime.now(dt.timezone.utc) - started).total_seconds() / 3600
                     if started else 999)
            if row.get("status") == "started" and age_h < config.STALE_LOCK_HOURS and not self.force:
                print(f"lock: {self.kind} {self.run_date} started {age_h:.1f}h ago, still running",
                      file=sys.stderr)
                return False
            if not self.force and row.get("status") in ("ok", "failed") and self.kind == "daily":
                self.notes.append(f"re-run of a finished {self.kind} run (status {row.get('status')})")
        try:
            self.supa.upsert("seo_runs", [{
                "run_date": self.run_date.isoformat(), "kind": self.kind,
                "step_status": {}, "spend_usd": 0, "status": "started",
                "started_at": self.started_at, "finished_at": None,
            }], on_conflict="run_date,kind")
            self.row_written = True
        except TableMissing:
            self.supa.warn("seo_runs: table missing, running without a lock")
        except SupaError as exc:
            self.supa.warn(f"seo_runs lock write failed: {exc}")
            return False
        self.locked = True
        return True

    def _flush(self) -> None:
        if self.dry_run or not self.row_written:
            return
        try:
            self.supa.patch("seo_runs",
                            {"run_date": self.run_date.isoformat(), "kind": self.kind},
                            {"step_status": self.step_status, "spend_usd": round(self.spend_usd, 4),
                             "status": self.status, "finished_at": self.finished_at})
        except SupaError as exc:
            self.supa.warn(f"seo_runs flush failed: {exc}")

    # -------------------------------------------------------------- steps
    @contextmanager
    def step(self, name: str) -> Iterator[Dict[str, Any]]:
        """Wrap one step. Sets status ok/fail/skip, records ms and a note.

        Inside the block, set `info['note']`, `info['skip']=reason`,
        `info['candidates']`, `info['proposals']` as needed.
        """
        t0 = time.time()
        info: Dict[str, Any] = {"status": "running", "started_at": now_iso()}
        self.step_status[name] = info
        print(f"== step {name}", file=sys.stderr)
        try:
            yield info
            if info.get("skip"):
                info["status"] = "skip"
                info["note"] = info.get("skip")
            else:
                info["status"] = "ok"
        except Exception as exc:  # noqa: BLE001 - every step is isolated on purpose
            info["status"] = "fail"
            info["error"] = f"{type(exc).__name__}: {exc}"[:500]
            print(traceback.format_exc(), file=sys.stderr)
        finally:
            info["ms"] = int((time.time() - t0) * 1000)
            info.pop("skip", None)
            self.candidates += int(info.get("candidates") or 0)
            self.proposals += int(info.get("proposals") or 0)
            print(f"   {name}: {info['status']} {info['ms']}ms {info.get('note') or info.get('error') or ''}",
                  file=sys.stderr)
            self._flush()

    def steps_ok(self) -> bool:
        return all(s.get("status") in ("ok", "skip") for s in self.step_status.values())

    def failed_steps(self) -> List[str]:
        return [n for n, s in self.step_status.items() if s.get("status") == "fail"]

    # -------------------------------------------------------------- spend
    def add_spend(self, usd: float, note: str = "") -> None:
        self.spend_usd += float(usd)
        if note:
            self.notes.append(f"spend {usd:.4f} {note}")

    def month_spend(self) -> float:
        """Sum of seo_runs.spend_usd this month plus the current run."""
        first = self.run_date.replace(day=1).isoformat()
        rows = self.supa.safe_get("seo_runs", {"run_date": f"gte.{first}", "select": "spend_usd,run_date,kind"})
        total = 0.0
        for r in rows:
            if r.get("run_date") == self.run_date.isoformat() and r.get("kind") == self.kind:
                continue
            total += float(r.get("spend_usd") or 0)
        return total + self.spend_usd

    def spend_ok(self, upcoming: float = 0.0) -> bool:
        """False when this month's spend plus `upcoming` would pass the cap."""
        return self.month_spend() + upcoming <= config.SPEND_CAP_USD

    # -------------------------------------------------------------- finish
    def finish(self) -> str:
        self.finished_at = now_iso()
        ok = self.steps_ok()
        if ok and self.candidates > 0 and self.proposals < 1:
            ok = False
            self.notes.append(f"{self.candidates} candidates but 0 proposals")
        self.status = "ok" if ok else "failed"
        self._flush()
        return self.status

    def summary(self) -> Dict[str, Any]:
        return {
            "run_date": self.run_date.isoformat(), "kind": self.kind, "status": self.status,
            "started_at": self.started_at, "finished_at": self.finished_at,
            "spend_usd": round(self.spend_usd, 4), "candidates": self.candidates,
            "proposals": self.proposals, "steps": self.step_status, "notes": self.notes,
            "dry_run": self.dry_run,
        }


def last_runs(supa: Supa, kind: str, n: int = 3) -> List[Dict[str, Any]]:
    """Most recent `n` runs of a kind, newest first."""
    return supa.safe_get("seo_runs", {"kind": f"eq.{kind}", "order": "run_date.desc"}, limit=n)


def maybe_promote(supa: Supa, gates: Gates, run: Run, health_ok: bool, parity_ok: bool,
                  rules_ok: bool) -> Optional[str]:
    """Shadow -> apply, automatic, no human.

    Flips seo_settings.apply_enabled to true when the last 3 daily runs
    (including this one, which must be ok) all finished ok with every step ok,
    rules self-test is clean, health is green, RULES parity holds and >= 5
    proposals were generated across them. Returns a note or None.
    """
    if gates.dry_run or gates.db_apply_enabled():
        return None
    if supa.setting("auto_promote", True) is False:
        return None
    if not (health_ok and parity_ok and rules_ok and run.steps_ok()):
        return None
    prior = [r for r in last_runs(supa, "daily", 4) if r.get("run_date") != run.run_date.isoformat()][:2]
    if len(prior) < 2:
        return None
    if any(r.get("status") != "ok" for r in prior):
        return None
    proposals = run.proposals
    for r in prior:
        steps = r.get("step_status") or {}
        if any(s.get("status") not in ("ok", "skip") for s in steps.values()):
            return None
        proposals += sum(int(s.get("proposals") or 0) for s in steps.values())
    if proposals < 5:
        return None
    supa.set_setting("apply_enabled", True)
    supa.set_setting("apply_enabled_at", now_iso())
    return f"promoted to apply: 3 consecutive ok runs, {proposals} proposals"

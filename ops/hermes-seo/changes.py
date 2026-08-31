"""The one path every lane uses to change a page.

propose_or_apply():
  1. idempotency key from (field, kind, slug, sha1(new));
  2. skip when a change with that key is already applied/pending/verified;
  3. if the gates allow: RPC `seo_apply_change` -> lean revalidate ->
     register async verification;
  4. otherwise (shadow / dry-run / gate off): record a proposal row in
     seo_changes with a `proposed:` key so the apply later uses a fresh key.

verify_pending(): poll each pending change with Cache-Control: no-cache and a
Googlebot UA; two consecutive matches -> `verified`; a mismatch resets the
streak; a non-200 is "stale, try again". NEVER reverts anything.
"""
from __future__ import annotations

import datetime as dt
import hashlib
import json
import sys
from typing import Any, Dict, List, Optional

import requests

import config
import pages
from ctx import Ctx
from supa import SupaError, TableMissing

ACTIVE = ("applied", "verification_pending", "verified")


def idem_key(field: str, kind: str, slug: str, new: Any) -> str:
    raw = new if isinstance(new, str) else json.dumps(new, sort_keys=True)
    return f"{field}:{kind}:{slug}:{hashlib.sha1(raw.encode()).hexdigest()[:10]}"


def existing_change(ctx: Ctx, key: str) -> Optional[Dict[str, Any]]:
    rows = ctx.supa.safe_get("seo_changes", {"idempotency_key": f"in.({key},proposed:{key})",
                                             "select": "idempotency_key,status"}, limit=2)
    for r in rows:
        if r.get("status") in ACTIVE:
            return r
    for r in rows:
        if r.get("idempotency_key") == f"proposed:{key}" and r.get("status") == "proposed":
            return r
    return None


def _supersede_proposals(ctx: Ctx, kind: str, slug: str, field: str) -> None:
    """Close any `proposed` row this apply just answered.

    The apply writes its own row under the real key, so a proposal left at
    `proposed` would keep (path, field) in the open set on every later run.
    That no longer blocks an apply, which is the point of the fix, but it
    would then let a lane re-apply the same field run after run with a
    slightly reworded value: exactly the waste the open-change guard was
    added to stop. `superseded` says what happened. It is deliberately not
    one of the statuses the sitemap treats as landed.
    """
    try:
        ctx.supa.patch("seo_changes",
                       {"kind": kind, "slug": slug, "field": field, "status": "proposed"},
                       {"status": "superseded"})
    except (SupaError, TableMissing) as exc:
        ctx.supa.warn(f"supersede {field} {kind}/{slug}: {exc}")


def revalidate_lean(kind: str, slug: str, dry_run: bool, extra_paths: Optional[List[str]] = None) -> Dict[str, Any]:
    """POST {SITE_BASE}/api/autopilot/revalidate with lean:true."""
    secret = config.env("AUTOPILOT_SECRET")
    body: Dict[str, Any] = {"kind": kind, "slug": slug, "lean": True}
    if extra_paths:
        body["paths"] = extra_paths
    if dry_run:
        print(f"dry-run: skip revalidate {json.dumps(body)}", file=sys.stderr)
        return {"ok": True, "skipped": True}
    if not secret:
        return {"ok": False, "error": "AUTOPILOT_SECRET missing"}
    try:
        resp = requests.post(f"{config.SITE_BASE}/api/autopilot/revalidate", json=body, timeout=30,
                             headers={"Authorization": f"Bearer {secret}", "User-Agent": config.LOOP_UA})
        return {"ok": resp.status_code == 200, "status": resp.status_code, "body": resp.text[:200]}
    except requests.RequestException as exc:
        return {"ok": False, "error": str(exc)[:200]}


def _register_verification(ctx: Ctx, key: str, kind: str, slug: str, field: str, expected: Any) -> None:
    pending: Dict[str, Any] = ctx.supa.setting("verification", {}) or {}
    pending[key] = {"kind": kind, "slug": slug, "field": field, "expected": expected,
                    "matches": 0, "checks": 0, "since": ctx.run_date.isoformat()}
    ctx.supa.set_setting("verification", pending)


def propose_or_apply(ctx: Ctx, kind: str, slug: str, field: str, old: Any, new: Any,
                     reason: str, source: str, may_apply: bool = True,
                     extra_revalidate: Optional[List[str]] = None) -> str:
    """Returns 'applied' | 'proposed' | 'duplicate' | 'blocked'."""
    path = config.path_of(kind, slug)
    if path in config.LOSER_PATHS:
        return "blocked"
    if path in ctx.holdout:
        return "blocked"
    key = idem_key(field, kind, slug, new)
    prior = existing_change(ctx, key)
    if prior and prior.get("status") in ACTIVE:
        return "duplicate"
    # A page and field with work already queued is skipped even when the new
    # value differs from the queued one. The key above is a hash of the value,
    # so it only catches an identical re-proposal; anything the model phrases
    # differently on the next run slips past it. A lane decides what a page
    # needs from the live page and the override row, and in shadow mode
    # neither changes, so the same page comes back every run: day one produced
    # ten aeo_answer proposals over seven pages, three of them drafted and
    # paid for twice.
    #
    # The question is asked AFTER working out whether this call may apply,
    # because a proposal must not block the apply it was queued for. Asking
    # first is what left 35 shadow-day proposals unreachable: nothing
    # promotes a proposal on its own, so those pages answered "duplicate"
    # every run and the RPC was never called.
    can_apply = bool(may_apply and ctx.gates.apply_allowed())
    if ctx.work_is_blocked(path, field, can_apply):
        return "duplicate"
    record = {"kind": kind, "slug": slug, "field": field, "old": old, "new": new,
              "reason": reason, "source": source, "key": key}
    if can_apply:
        try:
            ctx.supa.apply_change(key, kind, slug, field, new, reason, source)
        except (SupaError, TableMissing) as exc:
            ctx.supa.warn(f"apply {field} {kind}/{slug} failed: {exc}")
            ctx.gates.block_apply(f"RPC failure: {str(exc)[:80]}")
            return "blocked"
        rv = revalidate_lean(kind, slug, ctx.dry_run, extra_revalidate)
        if not rv.get("ok"):
            ctx.supa.warn(f"revalidate {kind}/{slug}: {rv}")
        try:
            ctx.supa.patch("seo_changes", {"idempotency_key": key},
                           {"status": "verification_pending"})
        except (SupaError, TableMissing):
            pass
        _register_verification(ctx, key, kind, slug, field, new)
        _supersede_proposals(ctx, kind, slug, field)
        ctx.open_changes.add(f"{path}|{field}")
        ctx.in_flight.add(f"{path}|{field}")
        record["status"] = "applied"
        ctx.applied.append(record)
        print(f"   APPLIED {field} {path}: {str(new)[:70]}", file=sys.stderr)
        return "applied"
    if prior and prior.get("status") == "proposed":
        record["status"] = "proposed"
        ctx.proposals.append(record)
        return "proposed"
    try:
        ctx.supa.insert("seo_changes", [{
            "idempotency_key": f"proposed:{key}", "kind": kind, "slug": slug, "field": field,
            "old": (old if isinstance(old, str) or old is None else json.dumps(old)),
            "new": (new if isinstance(new, str) else json.dumps(new)),
            "reason": reason, "source": source, "status": "proposed",
        }])
    except TableMissing:
        ctx.supa.warn("seo_changes: table missing, proposal kept in the report only")
    except SupaError as exc:
        ctx.supa.warn(f"seo_changes insert: {exc}")
    ctx.open_changes.add(f"{path}|{field}")
    record["status"] = "proposed"
    ctx.proposals.append(record)
    print(f"   proposed {field} {path}: {str(new)[:70]}", file=sys.stderr)
    return "proposed"


# ------------------------------------------------------------ verification
def observe(field: str, page: pages.Page, expected: Any) -> bool:
    """Does the live page show the expected value for `field`?"""
    if field in ("meta_title", "title_absolute"):
        want = expected if field == "meta_title" else None
        return (page.title == want) if want else True
    if field == "h1_override":
        return page.h1.strip() == str(expected).strip()
    if field == "meta_description":
        return page.meta_description.strip() == str(expected).strip()
    if field == "aeo_answer":
        head = " ".join(str(expected).split()[:8])
        return page.has_aeo and head in page.aeo_text
    if field == "related_links":
        try:
            want = expected if isinstance(expected, list) else json.loads(expected)
        except ValueError:
            return False
        hrefs = {h.split("?")[0].replace(config.SITE_BASE, "") for h, _ in page.links}
        return all(l.get("href") in hrefs for l in want)
    if field == "restore":
        return True  # restores are verified by the next title/meta read
    return True


def verify_pending(ctx: Ctx) -> Dict[str, Any]:
    """Advance the verification state machine for every pending change."""
    pending: Dict[str, Any] = ctx.supa.setting("verification", {}) or {}
    verified: List[str] = []
    stalled: List[str] = []
    for key, v in list(pending.items()):
        path = config.path_of(v["kind"], v["slug"])
        got = pages.fetch(config.to_url(path), nocache=True, googlebot=True)
        v["checks"] = int(v.get("checks", 0)) + 1
        if not got.ok:
            v["last"] = f"http {got.status}: stale read, no decision"
            continue
        page = pages.Page(got.text, path)
        if observe(v["field"], page, v["expected"]):
            v["matches"] = int(v.get("matches", 0)) + 1
        else:
            v["matches"] = 0
            v["last"] = f"mismatch: saw {page.title[:60]!r}" if v["field"] == "meta_title" else "mismatch"
        if v["matches"] >= 2:
            verified.append(path)
            try:
                ctx.supa.patch("seo_changes", {"idempotency_key": key},
                               {"status": "verified",
                                "verified_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")})
            except (SupaError, TableMissing):
                pass
            del pending[key]
        elif v["checks"] >= 20:
            stalled.append(f"{path} {v['field']} ({v.get('last', '')})")
    if not ctx.dry_run:
        ctx.supa.set_setting("verification", pending)
    return {"pending": len(pending), "verified": verified, "stalled": stalled}


def lock_days_iso(run_date: dt.date, days: int) -> str:
    return (run_date + dt.timedelta(days=days)).isoformat()

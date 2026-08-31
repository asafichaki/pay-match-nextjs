"""The myPayAdvisor SEO morning mail.

Its own mail, deliberately, and not a block inside the portfolio digest.
That digest covers Renology, Golden Yards and CCC, it is sent from
hello@therenology.com, and it goes to Assaf AND to Dror. myPayAdvisor is a
different business with a different partner, so its SEO internals, its
traffic and its lead-adjacent numbers have no business landing in Dror's
inbox. Barak is on it because it is his business too.

The one-morning-mail rule is about not flooding Assaf with engine noise; it
was never a reason to mix audiences.

From `seo@mypayadvisor.com` (the domain is verified in Resend), to Assaf
and Barak, at 07:50 IL so it lands with the morning batch.

The body is `mail_html.render(report)`: the same report JSON, laid out as
cards instead of the 25 flat lines the portfolio digest needs. If that
renderer returns nothing the mail falls back to the digest block, so a
morning is never lost to a presentation bug.

Never raises: a mail failure must not fail the run, it is reported instead.
"""
from __future__ import annotations

import datetime as dt
import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests

import config
import mail_html

RESEND_ENDPOINT = "https://api.resend.com/emails"
DEFAULT_FROM = "myPayAdvisor SEO <seo@mypayadvisor.com>"
# Assaf and Barak. Barak on the company mailbox, not a personal Gmail, per
# `renology_company_mailboxes_for_internal_copies`; it is also the address
# that already receives lead notifications on this project. Dror is
# deliberately absent: he is a Renology and Golden Yards partner and this is
# a different business.
DEFAULT_TO = ["assaf.ichaki@gmail.com", "barak@mypayadvisor.com"]


def _renderer():
    """Load render_seo_section.py from the repo checkout next to this package."""
    import importlib.util
    here = Path(__file__).resolve().parent
    path = here.parent / "portfolio-digest" / "render_seo_section.py"
    if not path.exists():
        return None
    spec = importlib.util.spec_from_file_location("render_seo_section", path)
    if not spec or not spec.loader:
        return None
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def subject_for(report: Dict[str, Any], run_date: dt.date) -> str:
    """Say the state in the subject line, so a bad morning is visible unopened."""
    reds = report.get("red_lines") or []
    health = (report.get("health") or {}).get("failures") or []
    idx = report.get("index") or {}
    newly = idx.get("newly_indexed") or []
    mode = report.get("mode", "?")
    day = run_date.strftime("%b %-d")
    if reds:
        return f"myPayAdvisor SEO {day}: {len(reds)} red line{'s' if len(reds) != 1 else ''}"
    if health:
        return f"myPayAdvisor SEO {day}: {len(health)} health failure{'s' if len(health) != 1 else ''}"
    if newly:
        return f"myPayAdvisor SEO {day}: {len(newly)} newly indexed"
    ch = report.get("changes") or {}
    applied = ch.get("applied_today") or 0
    if applied:
        return f"myPayAdvisor SEO {day}: {applied} applied, {idx.get('indexed', 0)}/{idx.get('tracked', 0)} indexed"
    return f"myPayAdvisor SEO {day}: {mode}, {idx.get('indexed', 0)}/{idx.get('tracked', 0)} indexed"


def legacy_html(state_dir: Path) -> Optional[str]:
    """The portfolio-digest block in a minimal shell. Fallback only."""
    mod = _renderer()
    if mod is None:
        return None
    block = mod.render_seo_section(str(state_dir))
    if not block or not block.strip():
        return None
    return (
        '<div style="background:#FAF9F6;padding:28px 0;">'
        '<div style="max-width:640px;margin:0 auto;padding:28px 24px;background:#ffffff;'
        'font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;color:#2D2A26;">'
        f"{block}"
        '<div style="margin-top:32px;padding-top:18px;border-top:1px solid #E7E2D7;'
        'font-size:11px;color:#9ca3af;letter-spacing:1px;">'
        "myPayAdvisor SEO loop on Hermes. Reply to this mail and nobody reads it; "
        "tell Claude instead.</div></div></div>"
    )


def build_html(state_dir: Path, report: Optional[Dict[str, Any]] = None) -> Optional[str]:
    """The designed mail, with the digest block as the safety net."""
    try:
        html = mail_html.render(report)
    except Exception as exc:  # noqa: BLE001  presentation must never kill the mail
        print(f"warn: mail_html failed, falling back to the digest block: {exc}", file=sys.stderr)
        html = None
    return html or legacy_html(state_dir)


def send(state_dir: Path, run_date: dt.date, dry_run: bool) -> Dict[str, Any]:
    """Send the morning mail. Returns a result dict, never raises."""
    out: Dict[str, Any] = {"sent": False}
    report_path = state_dir / f"report-{run_date.isoformat()}.json"
    if not report_path.exists():
        out["skipped"] = f"no report at {report_path.name}"
        return out
    try:
        report = json.loads(report_path.read_text(encoding="utf-8"))
    except ValueError as exc:
        out["skipped"] = f"unreadable report: {exc}"
        return out
    html = build_html(state_dir, report)
    if not html:
        out["skipped"] = "renderer unavailable or empty block"
        return out
    subject = subject_for(report, run_date)
    to: List[str] = [t.strip() for t in config.env("SEO_MAIL_TO", ",".join(DEFAULT_TO)).split(",") if t.strip()]
    sender = config.env("SEO_MAIL_FROM", DEFAULT_FROM)
    out["subject"] = subject
    out["to"] = to
    if dry_run:
        out["skipped"] = "dry-run"
        return out
    key = config.env("RESEND_API_KEY")
    if not key:
        out["skipped"] = "RESEND_API_KEY missing"
        return out
    try:
        resp = requests.post(RESEND_ENDPOINT, timeout=30,
                             headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                             json={"from": sender, "to": to, "subject": subject, "html": html})
        out["status"] = resp.status_code
        out["sent"] = resp.status_code in (200, 201)
        if not out["sent"]:
            out["error"] = resp.text[:200]
    except requests.RequestException as exc:
        out["error"] = str(exc)[:200]
    return out


if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser(description="Send the myPayAdvisor SEO morning mail")
    ap.add_argument("--state", default=None)
    ap.add_argument("--date", default=None)
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()
    sd = Path(a.state) if a.state else config.state_dir()
    d = config.today(a.date)
    print(json.dumps(send(sd, d, a.dry_run), indent=1), file=sys.stderr)

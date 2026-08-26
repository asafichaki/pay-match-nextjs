"""The "myPayAdvisor SEO" block for the 08:30 portfolio digest.

render_seo_section(state_dir) -> str returns at most 25 lines of HTML built
from `{state_dir}/report-YYYY-MM-DD.json` (today's, else yesterday's). No
PII, no em-dashes. Rules from the plan:

* report older than 36h (or missing): ONE line, nothing else about SEO;
* health failures and red lines come first, in red;
* status, traffic, index, changes, cohort, citations, drafts, competitors.

stdlib only, so it drops into /opt/portfolio-digest unchanged.
"""
from __future__ import annotations

import datetime as dt
import html
import json
from pathlib import Path
from typing import Any, Dict, List, Optional

STALE_HOURS = 36
MAX_LINES = 25
RED = "#B42318"
INK = "#2D2A26"
MUTED = "#6b7280"
ACCENT = "#B58A43"


def _load_latest(state_dir: Path, now: dt.datetime) -> Optional[Dict[str, Any]]:
    for days in (0, 1, 2):
        d = (now.date() - dt.timedelta(days=days)).isoformat()
        p = state_dir / f"report-{d}.json"
        if p.exists():
            try:
                return json.loads(p.read_text(encoding="utf-8"))
            except ValueError:
                continue
    return None


def _age_hours(report: Dict[str, Any], now: dt.datetime) -> float:
    try:
        gen = dt.datetime.fromisoformat(str(report.get("generated_at")).replace("Z", "+00:00"))
        if gen.tzinfo is None:
            gen = gen.replace(tzinfo=dt.timezone.utc)
        return (now - gen).total_seconds() / 3600
    except (TypeError, ValueError):
        return 10_000


def _pct(a: Optional[float], b: Optional[float]) -> str:
    if not b:
        return "n/a"
    return f"{(a or 0) / b - 1:+.0%}"


def _line(text: str, color: str = INK, bold: bool = False) -> str:
    weight = "font-weight:600;" if bold else ""
    return (f'<div style="font-size:13px;line-height:1.5;color:{color};{weight}">'
            f"{html.escape(text)}</div>")


def render_lines(report: Optional[Dict[str, Any]], now: Optional[dt.datetime] = None) -> List[str]:
    """The block as plain text lines (tested), before HTML wrapping."""
    now = now or dt.datetime.now(dt.timezone.utc)
    if report is None:
        return ["RED no report: the SEO loop has not written a report in 36h (cron dead or Supabase down)"]
    age = _age_hours(report, now)
    if age > STALE_HOURS:
        return [f"RED no report: last SEO report is {age / 24:.1f} days old ({report.get('date')}); the loop did not run"]
    lines: List[str] = []
    run = report.get("run") or {}
    if run.get("status") == "missing" or (run.get("status") not in ("ok",) and not report.get("red_lines")):
        lines.append(f"RED daily run {run.get('status') or 'missing'}")
    for r in (report.get("red_lines") or [])[:4]:
        lines.append(f"RED {r}")
    for f in (report.get("health") or {}).get("failures") or []:
        if f"RED {f}" not in lines and len(lines) < 6:
            lines.append(f"RED {f}")
    if run.get("status") == "missing":
        return lines[:MAX_LINES]

    t = report.get("traffic") or {}
    d3, w7, w28 = t.get("d3") or {}, t.get("w7") or {}, t.get("w28") or {}
    dev = t.get("device_ctr") or {}
    ca = t.get("canada") or {}
    lines.append(f"Status: {report.get('mode', '?')} | run {run.get('status', '?')} | "
                 f"code {report.get('code_version', '?')} | spend MTD ${float(report.get('spend_mtd') or 0):.2f}")
    lines.append(f"Traffic {d3.get('date', 'D-3')}: {d3.get('clicks', 0)} clicks / "
                 f"{d3.get('human_impressions', 0)} human impr (CTR {float(d3.get('ctr') or 0):.1%})")
    lines.append(f"7d: {w7.get('clicks', 0)} clicks ({_pct(w7.get('clicks'), (w7.get('prior') or {}).get('clicks'))}), "
                 f"{w7.get('human_impressions', 0)} impr ({_pct(w7.get('human_impressions'), (w7.get('prior') or {}).get('human_impressions'))}) | "
                 f"28d: {w28.get('clicks', 0)} clicks ({_pct(w28.get('clicks'), (w28.get('prior') or {}).get('clicks'))}), "
                 f"{w28.get('human_impressions', 0)} impr")
    lines.append(f"CTR desktop {float(dev.get('desktop') or 0):.1%} / mobile {float(dev.get('mobile') or 0):.1%} | "
                 f"Canada 28d: {ca.get('clicks', 0)} clicks / {ca.get('impressions', 0)} impr")

    ix = report.get("index") or {}
    pillar = ix.get("pillar") or {}
    lines.append(f"Index: tracked {ix.get('tracked', 0)} | indexed {ix.get('indexed', 0)} | "
                 f"not indexed {ix.get('not_indexed', 0)} | unknown {ix.get('unknown', 0)} | "
                 f"Bing indexed {ix.get('bing_indexed') if ix.get('bing_indexed') is not None else 'n/a'}")
    newly = ix.get("newly_indexed") or []
    if newly:
        lines.append(f"Newly indexed: {', '.join(newly[:4])}")
    lines.append(f"Pillar: {pillar.get('state') or 'not inspected'} | Googlebot hits 7d: {pillar.get('googlebot_hits_7d', 0)}"
                 + (f" | last crawl {str(pillar.get('last_crawl'))[:10]}" if pillar.get("last_crawl") else ""))
    for e in (ix.get("escalation") or [])[:2]:
        lines.append(f"Ladder: {e}")

    ch = report.get("changes") or {}
    for c in (ch.get("lines") or [])[:5]:
        arrow = " -> "
        lines.append(f"{c.get('status', '?')} {c.get('field', '')} {c.get('slug', '')}: "
                     f"{(c.get('old') or '(none)')[:45]}{arrow}{(c.get('new') or '')[:45]}")
    lines.append(f"Changes: proposed today {ch.get('proposed_today', 0)}, applied {ch.get('applied_today', 0)}, "
                 f"verification pending {ch.get('verification_pending', 0)}, advisory regressions "
                 f"{ch.get('advisory_regressions', 0)}, rollbacks {len(ch.get('rollbacks') or [])}")

    co = report.get("cohort") or {}
    if co.get("available"):
        diff = co.get("diff") or {}
        def did(m: str) -> str:
            v = (diff.get(m) or {}).get("did")
            return "n/a" if v is None else (f"{v:+.0%}" if m != "position" else f"{v:+.1f}")
        lines.append(f"Cohort ({co.get('n_changed', 0)} changed vs {co.get('n_holdout', 0)} holdout, "
                     f"{co.get('days_after', 0)}d): {co.get('verdict', '?')} | impressions {did('impr_per_day')} | "
                     f"position {did('position')} | CTR {did('ctr')}")

    ci = report.get("citations") or {}
    b = ci.get("buckets") or {}
    def bk(name: str) -> str:
        v = b.get(name) or {}
        return f"{v.get('cited', 0)}/{v.get('n', 0)}"
    w = ci.get("worthiness") or {}
    if ci.get("total"):
        lines.append(f"Citations ({ci.get('date', '')}): cited {ci.get('cited', 0)}/{ci.get('total', 0)} | "
                     f"comp {bk('comparison')} fees {bk('fees')} hi-risk {bk('high-risk')} | brand {bk('brand')} | "
                     f"retained {ci.get('retained', 0)} gained {ci.get('gained', 0)} lost {ci.get('lost', 0)} | "
                     f"engines {ci.get('engines', 0)}/3")
    mp = ci.get("money_presence") or {}
    lines.append(f"Citation-worthiness {w.get('at6', 0)}/{w.get('total', 60)} at 6/6"
                 + (f" | in Google top 100 on {mp.get('in_top100')}/{mp.get('total')} money queries" if mp else ""))

    drafts = report.get("drafts") or []
    if drafts:
        lines.append(f"Drafts waiting for a click ({len(drafts)}): "
                     + "; ".join(f"{d.get('title', '')[:40]} ({d.get('admin_url', '')})" for d in drafts[:2]))
    comp = report.get("competitor_changes") or []
    if comp:
        lines.append("Competitors: " + " | ".join(str(c)[:60] for c in comp[:3]))
    return lines[:MAX_LINES]


def render_seo_section(state_dir: str, now: Optional[dt.datetime] = None) -> str:
    """HTML block for the digest. Always returns something; never raises."""
    now = now or dt.datetime.now(dt.timezone.utc)
    try:
        report = _load_latest(Path(state_dir), now)
    except Exception:  # noqa: BLE001
        report = None
    lines = render_lines(report, now)
    body = ""
    for line in lines:
        if line.startswith("RED "):
            body += _line(line[4:], RED, bold=True)
        else:
            body += _line(line)
    return (
        '<div style="margin-bottom:36px;">'
        f'<div style="border-bottom:2px solid {ACCENT};padding-bottom:8px;margin-bottom:12px;">'
        f'<div style="font-size:11px;letter-spacing:6px;color:{ACCENT};text-transform:uppercase;">myPayAdvisor SEO</div>'
        f'<div style="font-size:13px;color:{MUTED};margin-top:4px;">daily loop, report {html.escape(str((report or {}).get("date", "none")))}</div>'
        "</div>"
        f"{body}"
        "</div>"
    )


if __name__ == "__main__":
    import sys
    print(render_seo_section(sys.argv[1] if len(sys.argv) > 1 else "/var/lib/mypayadvisor-seo"))

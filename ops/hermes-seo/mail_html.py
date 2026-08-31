"""The morning mail as a designed page, not a list of lines.

`render(report)` turns one `report-YYYY-MM-DD.json` into the HTML that
Resend sends at 07:50 IL. It reads the same JSON the digest block reads,
so nothing upstream changes; only the presentation does.

Why this exists: `portfolio-digest/render_seo_section.py` builds at most 25
plain lines because it is one section inside somebody else's mail. Reusing
it for the standalone mypayadvisor mail meant Assaf and Barak opened a wall
of 20 identical grey sentences every morning and had to parse the numbers
themselves. Same data, ranked and grouped: what is broken, then traffic,
indexation, what the loop changed, citations, and last the run itself.

Email rules obeyed here, learned from the Renology and CCC mails:
* tables only, no flex and no grid; Gmail drops both
* every style inline; Gmail strips <style> in most clients
* no media queries, so the layout is fluid and never more than 3 cells wide
* no background images, no web fonts, no scripts
* everything HTML-escaped, no PII, no em-dashes

Never raises: `mailer` falls back to the digest block if this returns None.
"""
from __future__ import annotations

import datetime as dt
import html
import re
from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple

PAPER = "#F5F3EE"
CARD = "#FFFFFF"
INK = "#2D2A26"
SOFT = "#57534E"
MUTED = "#8A8378"
LINE = "#E7E2D7"
GOLD = "#B58A43"
RED = "#B42318"
RED_BG = "#FDF3F2"
GREEN = "#1B7F5A"
GREEN_BG = "#F0F8F4"
AMBER = "#B45309"
AMBER_BG = "#FEF8EC"
SLATE_BG = "#F7F6F2"

FONT = ("-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,"
        "'Helvetica Neue',sans-serif")
MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace"

FIELD_LABEL = {
    "meta_title": "title",
    "meta_description": "description",
    "title_absolute": "title suffix",
    "h1_override": "H1",
    "related_links": "related links",
    "aeo_answer": "answer block",
    "expert_quote_id": "expert quote",
    "restore": "restore",
}
STATUS_TONE = {
    "applied": (GREEN, GREEN_BG),
    "verified": (GREEN, GREEN_BG),
    "verification_pending": (AMBER, AMBER_BG),
    "proposed": (SOFT, SLATE_BG),
    "superseded": (MUTED, SLATE_BG),
    "advisory_regression": (RED, RED_BG),
    "rolled_back": (RED, RED_BG),
}
STEP_TONE = {"ok": (GREEN, GREEN_BG), "skip": (MUTED, SLATE_BG), "fail": (RED, RED_BG)}


# ----------------------------------------------------------------- helpers
LIST_REPR_RE = re.compile(r"\[\s*(?:['\"][^'\"]*['\"]\s*,?\s*)+\]")


def humanize(text: Any) -> str:
    """Turn a Python list repr inside a message into something readable.

    `health.py` builds its failures with an f-string over a list, so the mail
    used to show ["/a", "/b"] brackets, quotes and all. Cleaning it here
    keeps the report JSON exactly as every other consumer already reads it.
    """
    def unlist(match: "re.Match[str]") -> str:
        return ", ".join(re.findall(r"['\"]([^'\"]*)['\"]", match.group(0)))

    return LIST_REPR_RE.sub(unlist, str(text if text is not None else ""))


def esc(value: Any) -> str:
    return html.escape(str(value if value is not None else ""), quote=True)


def num(value: Any) -> str:
    try:
        return f"{int(value or 0):,}"
    except (TypeError, ValueError):
        return "0"


def pct(value: Any, places: Optional[int] = None) -> str:
    """A rate as a percentage. Small rates keep the digits that matter."""
    try:
        v = float(value or 0)
    except (TypeError, ValueError):
        return "0%"
    if places is None:
        places = 2 if 0 < v < 0.01 else 1
    return f"{v * 100:.{places}f}%"


def delta(now: Any, prior: Any) -> Tuple[str, str]:
    """(text, colour) for a change against the prior window."""
    try:
        a, b = float(now or 0), float(prior or 0)
    except (TypeError, ValueError):
        return "", MUTED
    if not b:
        return ("no prior window", MUTED)
    change = a / b - 1
    colour = GREEN if change > 0.005 else RED if change < -0.005 else MUTED
    return (f"{change:+.0%} vs prior", colour)


def short_date(value: Any) -> str:
    try:
        return dt.date.fromisoformat(str(value)[:10]).strftime("%b %-d")
    except (TypeError, ValueError):
        return str(value or "")[:10]


def duration(start: Any, end: Any) -> str:
    try:
        a = dt.datetime.fromisoformat(str(start).replace("Z", "+00:00"))
        b = dt.datetime.fromisoformat(str(end).replace("Z", "+00:00"))
    except (TypeError, ValueError):
        return ""
    secs = int((b - a).total_seconds())
    return f"{secs // 60}m {secs % 60}s" if secs >= 60 else f"{secs}s"


def chip(text: str, fg: str = SOFT, bg: str = SLATE_BG, mono: bool = False) -> str:
    family = f"font-family:{MONO};" if mono else ""
    return (f'<span style="display:inline-block;padding:3px 9px;margin:0 6px 6px 0;'
            f'border-radius:11px;background:{bg};color:{fg};font-size:11px;'
            f'line-height:16px;font-weight:600;{family}">{esc(text)}</span>')


def bar(fraction: float, fill: str = GOLD, track: str = LINE, height: int = 6) -> str:
    """A progress bar as two table cells. Gmail renders this everywhere."""
    filled = max(0, min(100, round(fraction * 100)))
    left = (f'<td width="{filled}%" style="background:{fill};height:{height}px;'
            f'font-size:0;line-height:0;border-radius:3px;">&nbsp;</td>') if filled else ""
    right = (f'<td width="{100 - filled}%" style="background:{track};height:{height}px;'
             f'font-size:0;line-height:0;border-radius:3px;">&nbsp;</td>') if filled < 100 else ""
    return ('<table role="presentation" cellpadding="0" cellspacing="0" border="0" '
            f'width="100%" style="border-collapse:separate;border-spacing:0;table-layout:fixed;">'
            f"<tr>{left}{right}</tr></table>")


def section(title: str, body: str, note: str = "") -> str:
    """A titled white card."""
    if not body:
        return ""
    tail = (f'<span style="float:right;font-size:11px;color:{MUTED};font-weight:400;'
            f'letter-spacing:0;text-transform:none;">{esc(note)}</span>') if note else ""
    return (
        f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" '
        f'style="background:{CARD};border:1px solid {LINE};border-radius:10px;margin:0 0 14px 0;">'
        f'<tr><td style="padding:18px 20px 20px 20px;">'
        f'<div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;'
        f'color:{GOLD};font-weight:700;margin:0 0 14px 0;">{esc(title)}{tail}</div>'
        f"{body}</td></tr></table>"
    )


def kpis(cells: Sequence[Tuple[str, str, str, str]]) -> str:
    """Up to three big numbers side by side: (label, value, foot, colour)."""
    if not cells:
        return ""
    width = f"{100 // len(cells)}%"
    tds = ""
    for i, (label, value, foot, colour) in enumerate(cells):
        pad = "0 14px 0 0" if i == 0 else ("0 0 0 14px" if i == len(cells) - 1 else "0 14px")
        border = f"border-left:1px solid {LINE};" if i else ""
        tds += (
            f'<td width="{width}" valign="top" style="padding:{pad};{border}">'
            f'<div style="font-size:10px;line-height:14px;min-height:28px;letter-spacing:1px;'
            f'text-transform:uppercase;color:{MUTED};font-weight:600;">{esc(label)}</div>'
            f'<div style="font-size:26px;line-height:34px;font-weight:700;color:{INK};'
            f'padding:2px 0 1px 0;">{esc(value)}</div>'
            f'<div style="font-size:11px;line-height:16px;color:{colour};">{esc(foot)}</div></td>'
        )
    return ('<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" '
            f'style="table-layout:fixed;"><tr>{tds}</tr></table>')


def facts(rows: Iterable[Tuple[str, str]], mono_values: bool = False) -> str:
    """Label on the left, value on the right, one thin rule between rows."""
    rows = [r for r in rows if r and r[1] not in ("", None)]
    if not rows:
        return ""
    out = ""
    for i, (label, value) in enumerate(rows):
        top = f"border-top:1px solid {LINE};" if i else ""
        family = f"font-family:{MONO};" if mono_values else ""
        out += (
            f'<tr><td style="padding:8px 12px 8px 0;{top}font-size:12px;color:{MUTED};'
            f'line-height:18px;" valign="top" width="42%">{esc(label)}</td>'
            f'<td style="padding:8px 0;{top}font-size:12px;color:{INK};line-height:18px;'
            f'{family}" valign="top">{value}</td></tr>'
        )
    return ('<table role="presentation" cellpadding="0" cellspacing="0" border="0" '
            f'width="100%">{out}</table>')


def note(text: str) -> str:
    return (f'<div style="font-size:11px;line-height:17px;color:{MUTED};'
            f'margin:12px 0 0 0;">{esc(text)}</div>')


# ---------------------------------------------------------------- sections
def headline(report: Dict[str, Any]) -> Tuple[str, str, str]:
    """(verdict, colour, background) for the banner under the date."""
    reds = report.get("red_lines") or []
    run = report.get("run") or {}
    if run.get("status") == "missing":
        return ("The daily run did not finish today", RED, RED_BG)
    if reds:
        n = len(reds)
        return (f"{n} red line{'s' if n != 1 else ''} to clear", RED, RED_BG)
    newly = (report.get("index") or {}).get("newly_indexed") or []
    if newly:
        return (f"{len(newly)} newly indexed, nothing red", GREEN, GREEN_BG)
    return ("All checks green", GREEN, GREEN_BG)


def head_block(report: Dict[str, Any]) -> str:
    verdict, colour, background = headline(report)
    day = report.get("date") or ""
    try:
        pretty = dt.date.fromisoformat(str(day)[:10]).strftime("%A, %-d %B %Y")
    except (TypeError, ValueError):
        pretty = str(day)
    run = report.get("run") or {}
    meta = [
        chip(f"mode {report.get('mode', '?')}",
             GOLD if report.get("mode") == "apply" else SOFT, SLATE_BG),
        chip(f"run {run.get('status', '?')}", *STEP_TONE.get(run.get("status") or "", (SOFT, SLATE_BG))),
        chip(f"code {report.get('code_version', '?')}", SOFT, SLATE_BG, mono=True),
        chip(f"spend MTD ${float(report.get('spend_mtd') or 0):.2f}", SOFT, SLATE_BG),
    ]
    if report.get("dry_run"):
        meta.insert(0, chip("DRY RUN, nothing was written", AMBER, AMBER_BG))
    return (
        f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" '
        f'style="background:{CARD};border:1px solid {LINE};border-radius:10px;margin:0 0 14px 0;">'
        f'<tr><td style="padding:22px 20px 18px 20px;">'
        f'<div style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:{GOLD};'
        f'font-weight:700;">myPayAdvisor SEO</div>'
        f'<div style="font-size:20px;line-height:28px;font-weight:700;color:{INK};'
        f'padding:6px 0 0 0;">{esc(pretty)}</div>'
        f'<div style="display:inline-block;margin:10px 0 12px 0;padding:5px 12px;border-radius:6px;'
        f'background:{background};color:{colour};font-size:13px;font-weight:700;'
        f'line-height:19px;">{esc(verdict)}</div>'
        f"<div>{''.join(meta)}</div>"
        "</td></tr></table>"
    )


def alerts_block(report: Dict[str, Any]) -> str:
    reds = list(report.get("red_lines") or [])
    for failure in (report.get("health") or {}).get("failures") or []:
        if failure not in reds:
            reds.append(failure)
    if not reds:
        return ""
    items = ""
    for line in reds[:6]:
        items += (
            f'<tr><td width="18" valign="top" style="padding:5px 0 5px 0;font-size:13px;'
            f'line-height:20px;color:{RED};">&#9679;</td>'
            f'<td style="padding:5px 0;font-size:13px;line-height:20px;color:{RED};'
            f'font-weight:600;">{esc(humanize(line))}</td></tr>'
        )
    more = (f'<div style="font-size:11px;color:{MUTED};padding:6px 0 0 18px;">'
            f'and {len(reds) - 6} more</div>') if len(reds) > 6 else ""
    return (
        f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" '
        f'style="background:{RED_BG};border:1px solid #F3C9C4;border-left:4px solid {RED};'
        f'border-radius:10px;margin:0 0 14px 0;">'
        f'<tr><td style="padding:16px 20px;">'
        f'<div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:{RED};'
        f'font-weight:700;margin:0 0 8px 0;">Needs a human</div>'
        f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">'
        f"{items}</table>{more}</td></tr></table>"
    )


def traffic_block(report: Dict[str, Any]) -> str:
    t = report.get("traffic") or {}
    d3, w7, w28 = t.get("d3") or {}, t.get("w7") or {}, t.get("w28") or {}
    prior7 = w7.get("prior") or {}
    dev, ca = t.get("device_ctr") or {}, t.get("canada") or {}
    clicks_delta, clicks_colour = delta(w7.get("clicks"), prior7.get("clicks"))
    impr_delta, impr_colour = delta(w7.get("human_impressions"), prior7.get("human_impressions"))
    ctr_delta, ctr_colour = delta(w7.get("ctr"), prior7.get("ctr"))
    body = kpis([
        ("clicks 7d", num(w7.get("clicks")), clicks_delta, clicks_colour),
        ("impressions 7d", num(w7.get("human_impressions")), impr_delta, impr_colour),
        ("CTR 7d", pct(w7.get("ctr")), ctr_delta, ctr_colour),
    ])
    body += '<div style="height:16px;line-height:16px;font-size:0;">&nbsp;</div>'
    body += facts([
        (f"Last final day ({short_date(d3.get('date'))})",
         f"{num(d3.get('clicks'))} clicks, {num(d3.get('human_impressions'))} impressions, "
         f"CTR {pct(d3.get('ctr'))}"),
        ("28 days",
         f"{num(w28.get('clicks'))} clicks, {num(w28.get('human_impressions'))} impressions, "
         f"CTR {pct(w28.get('ctr'))}"),
        ("CTR by device", f"desktop {pct(dev.get('desktop'))}, mobile {pct(dev.get('mobile'))}"),
        ("Canada, 28d", f"{num(ca.get('clicks'))} clicks, {num(ca.get('impressions'))} impressions"),
    ])
    body += note("Human impressions are Search Console impressions minus the queries the loop "
                 "classifies as bot traffic, so they read lower than the Search Console screen.")
    return section("Traffic", body, note="Search Console, final data to D-3")


def index_block(report: Dict[str, Any]) -> str:
    ix = report.get("index") or {}
    tracked = int(ix.get("tracked") or 0)
    indexed = int(ix.get("indexed") or 0)
    pillar = ix.get("pillar") or {}
    google = ix.get("google_index") or {}
    share = indexed / tracked if tracked else 0
    body = (
        f'<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">'
        f'<tr><td style="font-size:26px;line-height:32px;font-weight:700;color:{INK};">'
        f"{indexed}<span style=\"color:{MUTED};font-weight:600;font-size:18px;\"> / {tracked}</span></td>"
        f'<td align="right" style="font-size:12px;color:{MUTED};line-height:32px;">'
        f"{pct(share, 0)} of the tracked set indexed</td></tr></table>"
        f'<div style="padding:8px 0 14px 0;">{bar(share)}</div>'
    )
    pillar_state = pillar.get("state") or "not inspected"
    pillar_colour = RED if "not indexed" in str(pillar_state).lower() else INK
    pillar_text = (f'<span style="color:{pillar_colour};font-weight:600;">{esc(pillar_state)}</span>'
                   f'<span style="color:{MUTED};">, {int(pillar.get("googlebot_hits_7d") or 0)} '
                   f"Googlebot hits in 7d")
    if pillar.get("last_crawl"):
        pillar_text += f", last crawl {esc(str(pillar['last_crawl'])[:10])}"
    pillar_text += "</span>"
    if google.get("asked"):
        recrawl = f"{google['asked']} urls submitted to the Indexing API"
        if google.get("failed"):
            recrawl += f", {google['failed']} failed"
    elif google.get("skipped"):
        recrawl = f"skipped, {google['skipped']}"
    else:
        recrawl = "not submitted today"
    newly = ix.get("newly_indexed") or []
    classes = ix.get("classes") or {}
    waiting = [p for p, state in classes.items() if state != "indexed"]
    body += facts([
        ("Not indexed", f"{ix.get('not_indexed', 0)} pages, {ix.get('unknown', 0)} unknown"),
        ("Bing", esc(ix.get("bing_indexed")) if ix.get("bing_indexed") is not None
         else "not counted this run"),
        ("Google recrawl", esc(recrawl)),
        ("Newly indexed", ", ".join(esc(p) for p in newly[:4]) if newly else "none today"),
        ("High-risk pillar", pillar_text),
    ])
    if waiting:
        shown = ", ".join(esc(p) for p in sorted(waiting)[:8])
        rest = f" and {len(waiting) - 8} more" if len(waiting) > 8 else ""
        body += ('<div style="margin:14px 0 0 0;padding:12px 14px;background:'
                 f'{SLATE_BG};border-radius:8px;">'
                 f'<div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;'
                 f'color:{MUTED};font-weight:600;margin-bottom:6px;">Waiting on Google '
                 f"({len(waiting)})</div>"
                 f'<div style="font-size:11px;line-height:18px;color:{SOFT};'
                 f'font-family:{MONO};">{shown}{rest}</div></div>')
    for line in (ix.get("escalation") or [])[:3]:
        body += note(f"Ladder: {line}")
    return section("Indexation", body)


def changes_block(report: Dict[str, Any]) -> str:
    ch = report.get("changes") or {}
    counters = [
        ("proposed", ch.get("proposed_today", 0), SOFT),
        ("applied", ch.get("applied_today", 0), GREEN if ch.get("applied_today") else SOFT),
        ("verifying", ch.get("verification_pending", 0), AMBER if ch.get("verification_pending") else SOFT),
        ("regressed", ch.get("advisory_regressions", 0),
         RED if ch.get("advisory_regressions") else SOFT),
        ("rollbacks", len(ch.get("rollbacks") or []), RED if ch.get("rollbacks") else SOFT),
    ]
    tds = ""
    for i, (label, value, colour) in enumerate(counters):
        border = f"border-left:1px solid {LINE};" if i else ""
        tds += (f'<td width="20%" align="center" style="{border}padding:2px 4px;">'
                f'<div style="font-size:19px;line-height:25px;font-weight:700;color:{colour};">'
                f"{esc(value)}</div>"
                f'<div style="font-size:9px;line-height:12px;letter-spacing:0;'
                f'text-transform:uppercase;color:{MUTED};font-weight:600;'
                f'word-break:normal;">{esc(label)}</div></td>')
    body = ('<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" '
            f'style="table-layout:fixed;"><tr>{tds}</tr></table>')

    lines = ch.get("lines") or []
    if lines:
        rows = ""
        for c in lines[:5]:
            status = str(c.get("status") or "")
            fg, bg = STATUS_TONE.get(status, (SOFT, SLATE_BG))
            field = FIELD_LABEL.get(str(c.get("field") or ""), str(c.get("field") or ""))
            old = (c.get("old") or "").strip()
            new = (c.get("new") or "").strip()
            before = (f'<span style="color:{MUTED};text-decoration:line-through;">{esc(old[:60])}</span>'
                      '<span style="color:#C7C1B6;"> &rarr; </span>') if old else \
                     f'<span style="color:{MUTED};">was empty &rarr; </span>'
            rows += (
                f'<tr><td style="padding:11px 0;border-top:1px solid {LINE};">'
                f'<div style="font-size:12px;line-height:18px;color:{INK};font-weight:600;">'
                f'<span style="font-family:{MONO};">/{esc(c.get("slug"))}</span>'
                f'<span style="color:{MUTED};font-weight:400;"> &middot; {esc(field)}</span></div>'
                f'<div style="font-size:12px;line-height:18px;padding:3px 0 5px 0;">'
                f'{before}<span style="color:{INK};">{esc(new[:70])}</span></div>'
                f"{chip(status.replace('_', ' '), fg, bg)}</td></tr>"
            )
        body += ('<div style="height:6px;line-height:6px;font-size:0;">&nbsp;</div>'
                 '<table role="presentation" cellpadding="0" cellspacing="0" border="0" '
                 f'width="100%">{rows}</table>')
        if len(lines) > 5:
            body += note(f"{len(lines) - 5} more changes are in the report JSON.")
    else:
        body += note("No page was rewritten today.")
    return section("What the loop changed", body)


def citations_block(report: Dict[str, Any]) -> str:
    ci = report.get("citations") or {}
    if not ci.get("total") and not (ci.get("worthiness") or {}).get("total"):
        return ""
    body = ""
    total = int(ci.get("total") or 0)
    if total:
        cited = int(ci.get("cited") or 0)
        brand = (ci.get("buckets") or {}).get("brand") or {}
        body += kpis([
            ("cited, non brand", f"{cited} / {total}", f"probed {short_date(ci.get('date'))}", MUTED),
            ("brand queries", f"{brand.get('cited', 0)} / {brand.get('n', 0)}",
             "our own name", MUTED),
            ("engines", f"{ci.get('engines', 0)} / 3",
             "Gemini, Claude, OpenAI", MUTED),
        ])
        rows = ""
        for name, label in (("comparison", "Comparisons"), ("fees", "Fees"),
                            ("high-risk", "High risk"), ("brand", "Brand")):
            b = (ci.get("buckets") or {}).get(name) or {}
            n = int(b.get("n") or 0)
            if not n:
                continue
            hit = int(b.get("cited") or 0)
            fill = GREEN if hit else LINE
            rows += (
                f'<tr><td width="30%" style="padding:6px 10px 6px 0;font-size:12px;color:{SOFT};" '
                f'valign="middle">{esc(label)}</td>'
                f'<td style="padding:6px 10px 6px 0;" valign="middle">{bar(hit / n, fill)}</td>'
                f'<td width="16%" align="right" style="padding:6px 0;font-size:12px;color:{INK};'
                f'font-weight:600;" valign="middle">{hit} / {n}</td></tr>'
            )
        if rows:
            body += ('<div style="height:14px;line-height:14px;font-size:0;">&nbsp;</div>'
                     '<table role="presentation" cellpadding="0" cellspacing="0" border="0" '
                     f'width="100%">{rows}</table>')
        body += facts([("Movement since the last probe",
                        f"{ci.get('gained', 0)} gained, {ci.get('retained', 0)} retained, "
                        f"{ci.get('lost', 0)} lost")])
        body += note("Cited and the bucket bars count a query as won when any engine names the "
                     "site. The headline fraction excludes the brand bucket; movement counts "
                     "every query, brand included.")

    w = ci.get("worthiness") or {}
    if w.get("total"):
        checks = w.get("per_check") or {}
        scored = int(w.get("total") or 0)
        labels = {"answer_block": "Answer block", "table_first": "Table above the fold",
                  "verdict_line": "Verdict line", "date_modified_90d": "Updated in 90d",
                  "sources_3": "Three or more sources", "reviewed_by": "Reviewed by a person"}
        rows = ""
        for key, label in labels.items():
            got = int(checks.get(key) or 0)
            fill = GREEN if got >= scored * 0.8 else AMBER if got >= scored * 0.4 else RED
            rows += (
                f'<tr><td width="42%" style="padding:5px 10px 5px 0;font-size:12px;color:{SOFT};" '
                f'valign="middle">{esc(label)}</td>'
                f'<td style="padding:5px 10px 5px 0;" valign="middle">{bar(got / scored, fill)}</td>'
                f'<td width="14%" align="right" style="padding:5px 0;font-size:12px;color:{INK};'
                f'font-weight:600;" valign="middle">{got}</td></tr>'
            )
        body += (f'<div style="margin:18px 0 0 0;padding-top:16px;border-top:1px solid {LINE};">'
                 f'<div style="font-size:12px;color:{INK};font-weight:700;margin-bottom:4px;">'
                 f"Citation worthiness: {w.get('at6', 0)} of {scored} pages pass all six checks</div>"
                 f'<div style="font-size:11px;color:{MUTED};margin-bottom:10px;">'
                 f"How many of the {scored} focus pages pass each check</div>"
                 '<table role="presentation" cellpadding="0" cellspacing="0" border="0" '
                 f'width="100%">{rows}</table></div>')
    mp = ci.get("money_presence") or {}
    if mp:
        body += facts([("Google top 100",
                        f"{mp.get('in_top100')} of {mp.get('total')} money queries")])
    return section("AI citations", body, note="weekly probe")


def cohort_block(report: Dict[str, Any]) -> str:
    co = report.get("cohort") or {}
    if not co.get("available"):
        reason = co.get("reason") or "not measured this run"
        return section("Cohort test", note(f"No read yet: {reason}."))
    diff = co.get("diff") or {}

    def did(metric: str, position: bool = False) -> str:
        v = (diff.get(metric) or {}).get("did")
        if v is None:
            return "n/a"
        return f"{v:+.1f}" if position else f"{v:+.0%}"

    body = kpis([
        ("impressions", did("impr_per_day"), "vs holdout", MUTED),
        ("position", did("position", position=True), "vs holdout", MUTED),
        ("CTR", did("ctr"), "vs holdout", MUTED),
    ])
    body += '<div style="height:14px;line-height:14px;font-size:0;">&nbsp;</div>'
    body += facts([
        ("Verdict", esc(co.get("verdict", "?"))),
        ("Sample", f"{co.get('n_changed', 0)} changed against {co.get('n_holdout', 0)} held back, "
                   f"{co.get('days_after', 0)} days after"),
    ])
    return section("Cohort test", body)


def drafts_block(report: Dict[str, Any]) -> str:
    drafts = report.get("drafts") or []
    if not drafts:
        return ""
    rows = ""
    for d in drafts[:5]:
        rows += (f'<tr><td style="padding:7px 0;border-top:1px solid {LINE};font-size:12px;'
                 f'line-height:18px;color:{INK};">{esc(d.get("title", ""))}</td></tr>')
    url = drafts[0].get("admin_url") or ""
    button = (f'<div style="padding:16px 0 0 0;"><a href="{esc(url)}" '
              f'style="display:inline-block;padding:10px 18px;background:{INK};color:#FFFFFF;'
              f'border-radius:6px;font-size:13px;font-weight:600;text-decoration:none;">'
              "Open the drafts</a></div>") if url else ""
    return section("Drafts waiting for a click",
                   '<table role="presentation" cellpadding="0" cellspacing="0" border="0" '
                   f'width="100%">{rows}</table>{button}',
                   note=f"{len(drafts)} waiting")


def competitors_block(report: Dict[str, Any]) -> str:
    comp = report.get("competitor_changes") or []
    if not comp:
        return ""
    rows = ""
    for c in comp[:5]:
        rows += (f'<tr><td style="padding:7px 0;border-top:1px solid {LINE};font-size:12px;'
                 f'line-height:18px;color:{INK};">{esc(str(c)[:140])}</td></tr>')
    return section("Competitors",
                   '<table role="presentation" cellpadding="0" cellspacing="0" border="0" '
                   f'width="100%">{rows}</table>')


def run_block(report: Dict[str, Any]) -> str:
    run = report.get("run") or {}
    steps = run.get("steps") or {}
    order = ["gsc", "index_watch", "escalation", "indexnow", "titles_b1", "titles_llm",
             "verify", "links", "aeo", "measure", "health", "report"]
    ordered = [s for s in order if s in steps] + [s for s in steps if s not in order]
    body = "".join(chip(f"{s} {steps[s]}", *STEP_TONE.get(str(steps[s]), (SOFT, SLATE_BG)),
                        mono=True) for s in ordered)
    took = duration(run.get("started_at"), run.get("finished_at"))
    body += facts([
        ("Ran", f"{esc(str(run.get('started_at'))[11:16])} UTC"
                + (f", took {esc(took)}" if took else "")),
        ("Cost of this run", f"${float(run.get('spend_usd') or 0):.4f}"),
        ("Notes", ", ".join(esc(n) for n in (run.get("notes") or [])) or "none"),
    ])
    return section("The run", body)


def footer() -> str:
    return (
        f'<div style="padding:18px 4px 0 4px;font-size:11px;line-height:17px;color:{MUTED};">'
        "myPayAdvisor SEO loop, one daily run on Hermes. Numbers come from Search Console, "
        "the URL Inspection API and the loop ledger, never from a model.<br>"
        "Nobody reads a reply to this address. Tell Claude instead."
        "</div>"
    )


# ------------------------------------------------------------------- render
def render(report: Optional[Dict[str, Any]]) -> Optional[str]:
    """The whole mail. Returns None when there is nothing to render."""
    if not isinstance(report, dict) or not report:
        return None
    verdict = headline(report)[0]
    blocks: List[str] = [head_block(report), alerts_block(report)]
    if (report.get("run") or {}).get("status") != "missing":
        blocks += [
            traffic_block(report),
            index_block(report),
            changes_block(report),
            citations_block(report),
            cohort_block(report),
            drafts_block(report),
            competitors_block(report),
        ]
    blocks.append(run_block(report))
    inner = "".join(b for b in blocks if b)
    preheader = (f'<div style="display:none;max-height:0;overflow:hidden;opacity:0;">'
                 f'{esc(verdict)}. {esc(report.get("date", ""))}</div>')
    return (
        f'<div style="background:{PAPER};padding:24px 12px;font-family:{FONT};'
        f'color:{INK};-webkit-font-smoothing:antialiased;">{preheader}'
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" '
        'style="max-width:640px;margin:0 auto;">'
        f'<tr><td>{inner}{footer()}</td></tr></table></div>'
    )


if __name__ == "__main__":
    import json
    import sys

    with open(sys.argv[1], encoding="utf-8") as fh:
        print(render(json.load(fh)) or "")

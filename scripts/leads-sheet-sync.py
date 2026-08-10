#!/usr/bin/env python3
"""
myPayAdvisor -> Google Sheet lead export.

Pulls quiz_leads + newsletter_subscribers from prod Supabase and publishes a
shareable Google Sheet owned by Assaf.

  python3 scripts/leads-sheet-sync.py create   # first run: build + upload
  python3 scripts/leads-sheet-sync.py sync     # refresh data, keep manual edits

Four tabs: Dashboard, Leads, Newsletter, Legend.

On the Leads tab, columns A-L come from the database and are rewritten on every
sync. Columns M-P (Status, Owner, Last contacted, Next step) belong to whoever
is working the sheet: sync reads them back, keys them to the lead id in the
hidden column Q, and writes them to wherever that lead ended up. Formatting for
BUFFER_ROWS rows is banked at creation time so new leads land pre-styled.
"""

import json
import os
import re
import sys
import datetime as dt
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import openpyxl
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import CellIsRule, FormulaRule

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_FILE = os.path.join(REPO, ".env.local")
TOKEN_FILE = os.path.expanduser("~/.credentials/google-sheets-token.json")
STATE_FILE = os.path.join(REPO, "scripts", ".leads-sheet-state.json")
XLSX_FILE = os.path.join(REPO, "scripts", ".leads-sheet.xlsx")
SHEET_TITLE = "myPayAdvisor — Leads"

HEADER_ROW = 4
FIRST_DATA_ROW = HEADER_ROW + 1
LEAD_BUFFER_ROWS = 400
NEWS_BUFFER_ROWS = 200

# ---------------------------------------------------------------- label maps
# Mirrored from src/lib/funnel/types.ts so the sheet reads in plain English.
BUSINESS_TYPE_LABELS = {
    "physical_goods": "Physical goods / E-commerce",
    "saas_digital": "SaaS or digital product",
    "subscription": "Membership or subscription",
    "retail_inperson": "Retail with in-person payments",
    "restaurant_hospitality": "Restaurant or hospitality",
    "field_services": "Field services or mobile payments",
    "financial_services": "Financial services or money transfers",
    "health_wellness": "Health, wellness or lifestyle products",
    "gaming_entertainment": "Gaming or entertainment",
    "other": "Other / Not sure",
}

VOLUME_TIER_LABELS = {
    "under_50k": "Under $50K / mo",
    "50k_to_250k": "$50K - $250K / mo",
    "250k_to_1m": "$250K - $1M / mo",
    "over_1m": "Over $1M / mo",
    "pre_launch": "Pre-launch / not live yet",
}

# Revenue potential for an advisory commission model. Monthly volume is the real
# signal, so it drives call order rather than the DB lead_score column.
VOLUME_PRIORITY = {
    "over_1m": ("1 - Hot", 1),
    "250k_to_1m": ("2 - High", 2),
    "50k_to_250k": ("3 - Medium", 3),
    "under_50k": ("4 - Low", 4),
    "pre_launch": ("5 - Early", 5),
}
PRIORITY_ORDER = ["1 - Hot", "2 - High", "3 - Medium", "4 - Low", "5 - Early"]

PAIN_POINT_LABELS = {
    "funds_frozen": "Provider is freezing funds / applying reserves",
    "approval_rates": "Approval rates underperforming, losing revenue at checkout",
    "long_onboarding": "Onboarding took months, can't repeat it",
    "new_markets": "Needs to expand into new markets",
    "failed_recurring": "Too many failed recurring payments",
    "in_person_costs": "In-person transaction costs too high",
    "needs_approval": "Launching, needs a provider that will approve them",
}

TRACK_LABELS = {
    "A": "A - Online / growth",
    "B": "B - In-person",
    "C": "C - Complex / high-risk",
    "MANUAL": "Manual",
}

SOURCE_LABELS = {
    "sorting_hat": "Sorting Hat (site quiz)",
    "quiz": "Payment quiz",
    "newsletter": "Newsletter",
    "footer": "Newsletter - footer form",
    "exit_intent": "Newsletter - exit popup",
}

STATUS_OPTIONS = ["New", "Emailed", "Call booked", "In conversation",
                  "Proposal sent", "Won", "Lost", "Not a fit"]

TRAFFIC_BUCKETS = ["ChatGPT (AI search)", "Google (organic)", "Perplexity (AI search)",
                   "Gemini (AI search)", "Claude (AI search)", "Direct / unknown"]

# --------------------------------------------------------------- style tokens
NAVY, SLATE, LINE, BAND = "0F2740", "44566C", "D8DEE6", "F5F8FB"
EDIT_BG, HOT, WARM, COOL = "FFF8E6", "FDE7E7", "FFF3E0", "EAF4EC"

HEAD_FILL = PatternFill("solid", fgColor=NAVY)
EDIT_HEAD_FILL = PatternFill("solid", fgColor="8A6D1F")
EDIT_FILL = PatternFill("solid", fgColor=EDIT_BG)
HEAD_FONT = Font(name="Inter", size=10, bold=True, color="FFFFFF")
BODY_FONT = Font(name="Inter", size=10, color="1B2733")
MUTED_FONT = Font(name="Inter", size=10, color=SLATE)
TITLE_FONT = Font(name="Inter", size=16, bold=True, color=NAVY)
THIN = Side(style="thin", color=LINE)
CELL_BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)


# ------------------------------------------------------------------- plumbing
def read_env(path):
    env = {}
    with open(path) as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def supabase_get(url, key, table, query):
    req = Request(f"{url}/rest/v1/{table}?{query}",
                  headers={"apikey": key, "Authorization": f"Bearer {key}"})
    with urlopen(req) as resp:
        return json.loads(resp.read())


def google_access_token():
    with open(TOKEN_FILE) as fh:
        tok = json.load(fh)
    body = urlencode({
        "client_id": tok["client_id"], "client_secret": tok["client_secret"],
        "refresh_token": tok["refresh_token"], "grant_type": "refresh_token",
    }).encode()
    req = Request(tok["token_uri"], data=body,
                  headers={"Content-Type": "application/x-www-form-urlencoded"})
    with urlopen(req) as resp:
        return json.loads(resp.read())["access_token"]


def google_json(token, url, method="GET", payload=None):
    data = json.dumps(payload).encode() if payload is not None else None
    req = Request(url, data=data, method=method, headers={
        "Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    with urlopen(req) as resp:
        raw = resp.read()
    return json.loads(raw) if raw else {}


# ------------------------------------------------------------- data shaping
def traffic_source(row):
    """Where the lead actually came from, in words."""
    blob = " ".join([(row.get("utm_source") or ""), (row.get("referrer") or ""),
                     (row.get("landing_page_url") or "")]).lower()
    for needle, label in [("chatgpt", "ChatGPT (AI search)"),
                          ("perplexity", "Perplexity (AI search)"),
                          ("gemini", "Gemini (AI search)"),
                          ("bard", "Gemini (AI search)"),
                          ("claude", "Claude (AI search)"),
                          ("google", "Google (organic)"),
                          ("bing", "Bing"), ("linkedin", "LinkedIn")]:
        if needle in blob:
            return label
    ref = row.get("referrer") or ""
    if ref:
        return re.sub(r"^https?://(www\.)?", "", ref).split("/")[0] or "Referral"
    return "Direct / unknown"


def parse_ts(value):
    """Postgres timestamps carry 1-6 fractional digits; fromisoformat on
    Python < 3.11 only accepts exactly 3 or 6, so normalise to 6 first."""
    if not value:
        return None
    v = value.replace("Z", "+00:00")
    v = re.sub(r"\.(\d{1,6})(?=[+-]\d{2}:?\d{2}$|$)",
               lambda m: "." + m.group(1).ljust(6, "0"), v)
    try:
        parsed = dt.datetime.fromisoformat(v)
    except ValueError:
        return None
    if parsed.tzinfo is not None:
        parsed = parsed.astimezone(dt.timezone.utc).replace(tzinfo=None)
    return parsed


def build_leads(rows):
    """DB rows -> display rows, newest first. Newest submission of a repeated
    email stays clean; the earlier ones get flagged so nobody works a stale row."""
    seen, out = {}, []
    for row in sorted(rows, key=lambda r: r.get("created_at") or "", reverse=True):
        email = (row.get("email") or "").strip().lower()
        seen[email] = seen.get(email, 0) + 1
        vol = row.get("volume_tier") or row.get("monthly_volume") or ""
        priority, _ = VOLUME_PRIORITY.get(vol, ("4 - Low", 4))
        out.append({
            "id": row["id"],
            "received": parse_ts(row.get("created_at")),
            "name": row.get("full_name") or "",
            "email": row.get("email") or "",
            "phone": row.get("phone") or "",
            "business": BUSINESS_TYPE_LABELS.get(row.get("business_type") or "",
                                                 row.get("industry") or ""),
            "volume": VOLUME_TIER_LABELS.get(vol, vol),
            "priority": priority,
            "pain": PAIN_POINT_LABELS.get(row.get("pain_point") or "", ""),
            "track": TRACK_LABELS.get(row.get("track") or "", row.get("track") or ""),
            "came_from": traffic_source(row),
            "landing": (row.get("landing_page_url") or "").split("?")[0],
            "dup": "earlier dup" if seen[email] > 1 else "",
        })
    return out


def build_newsletter(rows):
    return [{
        "id": row["id"],
        "subscribed": parse_ts(row.get("subscribed_at")),
        "email": row.get("email") or "",
        "source": SOURCE_LABELS.get(row.get("source") or "",
                                    row.get("source") or "Newsletter"),
        "active": "Yes" if row.get("active") is not False else "Unsubscribed",
    } for row in sorted(rows, key=lambda r: r.get("subscribed_at") or "", reverse=True)]


def lead_row_values(lead):
    return [lead["received"], lead["name"], lead["email"], lead["phone"],
            lead["business"], lead["volume"], lead["priority"], lead["pain"],
            lead["track"], lead["came_from"], lead["landing"], lead["dup"]]


def news_row_values(sub):
    return [sub["subscribed"], sub["email"], sub["source"], sub["active"]]


# ------------------------------------------------------------ sheet building
LEAD_COLS = [("Received", 17), ("Name", 16), ("Email", 30), ("Phone", 14),
             ("Business", 30), ("Monthly volume", 19), ("Priority", 12),
             ("What they need help with", 46), ("Track", 22), ("Came from", 20),
             ("Landing page", 42), ("Flag", 11)]
LEAD_EDIT_COLS = [("Status", 16), ("Owner", 13), ("Last contacted", 16),
                  ("Next step / notes", 42)]
NEWS_COLS = [("Subscribed", 17), ("Email", 34), ("Signed up at", 24), ("Active", 14)]
NEWS_EDIT_COLS = [("Status", 16), ("Notes", 40)]

N_LEAD_DATA = len(LEAD_COLS)                       # A..L
N_LEAD_TOTAL = N_LEAD_DATA + len(LEAD_EDIT_COLS)   # ..P
LEAD_ID_COL = N_LEAD_TOTAL + 1                     # Q, hidden
N_NEWS_DATA = len(NEWS_COLS)
N_NEWS_TOTAL = N_NEWS_DATA + len(NEWS_EDIT_COLS)
NEWS_ID_COL = N_NEWS_TOTAL + 1


def style_header(ws, cols, edit_cols, id_col):
    for i, (label, width) in enumerate(cols + edit_cols, start=1):
        cell = ws.cell(row=HEADER_ROW, column=i, value=label)
        cell.fill = EDIT_HEAD_FILL if i > len(cols) else HEAD_FILL
        cell.font = HEAD_FONT
        cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
        cell.border = CELL_BORDER
        ws.column_dimensions[get_column_letter(i)].width = width
    idc = ws.cell(row=HEADER_ROW, column=id_col, value="id")
    idc.fill = HEAD_FILL
    idc.font = HEAD_FONT
    ws.column_dimensions[get_column_letter(id_col)].hidden = True
    ws.row_dimensions[HEADER_ROW].height = 30


def style_body_cell(ws, r, c, n_data, total, wrap_cols, date_cols, id_col):
    cell = ws.cell(row=r, column=c)
    cell.font = BODY_FONT
    cell.border = CELL_BORDER
    cell.alignment = Alignment(vertical="center", wrap_text=(c in wrap_cols))
    if c > n_data and c <= total:
        cell.fill = EDIT_FILL
    if c in date_cols:
        cell.number_format = "yyyy-mm-dd hh:mm" if c == 1 else "yyyy-mm-dd"
    return cell


def write_leads_tab(wb, leads):
    ws = wb.create_sheet("Leads")
    ws.sheet_properties.tabColor = NAVY
    ws["A1"] = "myPayAdvisor — Leads"
    ws["A1"].font = TITLE_FONT
    ws["A2"] = ("Everyone who left their details on mypayadvisor.com, newest first. "
                "The yellow columns on the right are yours to fill in — a data "
                "refresh never overwrites them.")
    ws["A2"].font = MUTED_FONT
    ws.merge_cells("A1:H1")
    ws.merge_cells("A2:L2")
    ws.row_dimensions[2].height = 18

    style_header(ws, LEAD_COLS, LEAD_EDIT_COLS, LEAD_ID_COL)

    wrap_cols, date_cols = {5, 8, 11, N_LEAD_TOTAL}, {1, N_LEAD_DATA + 3}
    for i in range(LEAD_BUFFER_ROWS):
        r = FIRST_DATA_ROW + i
        lead = leads[i] if i < len(leads) else None
        values = lead_row_values(lead) if lead else [None] * N_LEAD_DATA
        for c in range(1, N_LEAD_TOTAL + 1):
            cell = style_body_cell(ws, r, c, N_LEAD_DATA, N_LEAD_TOTAL,
                                   wrap_cols, date_cols, LEAD_ID_COL)
            if c <= N_LEAD_DATA:
                cell.value = values[c - 1]
            elif c == N_LEAD_DATA + 1 and lead:
                cell.value = "New"
        if lead:
            ws.cell(row=r, column=LEAD_ID_COL, value=lead["id"])
        ws.row_dimensions[r].height = 30

    last = FIRST_DATA_ROW + LEAD_BUFFER_ROWS - 1
    ws.auto_filter.ref = f"A{HEADER_ROW}:{get_column_letter(N_LEAD_TOTAL)}{last}"

    prio = f"G{FIRST_DATA_ROW}:G{last}"
    ws.conditional_formatting.add(prio, CellIsRule(
        operator="equal", formula=['"1 - Hot"'], fill=PatternFill("solid", fgColor=HOT),
        font=Font(bold=True, color="9B1C1C")))
    ws.conditional_formatting.add(prio, CellIsRule(
        operator="equal", formula=['"2 - High"'], fill=PatternFill("solid", fgColor=WARM),
        font=Font(bold=True, color="8A4B00")))

    status_col = get_column_letter(N_LEAD_DATA + 1)
    status_range = f"{status_col}{FIRST_DATA_ROW}:{status_col}{last}"
    ws.conditional_formatting.add(status_range, CellIsRule(
        operator="equal", formula=['"Won"'], fill=PatternFill("solid", fgColor=COOL),
        font=Font(bold=True, color="1B5E20")))
    ws.conditional_formatting.add(status_range, CellIsRule(
        operator="equal", formula=['"Lost"'], font=Font(color="9AA5B1", italic=True)))
    ws.conditional_formatting.add(
        f"A{FIRST_DATA_ROW}:{get_column_letter(N_LEAD_DATA)}{last}",
        FormulaRule(formula=[f'$L{FIRST_DATA_ROW}="earlier dup"'],
                    font=Font(color="9AA5B1", italic=True)))

    dv = DataValidation(type="list", formula1='"' + ",".join(STATUS_OPTIONS) + '"',
                        allow_blank=True, showDropDown=False)
    ws.add_data_validation(dv)
    dv.add(status_range)

    ws.freeze_panes = f"D{FIRST_DATA_ROW}"


def write_newsletter_tab(wb, subs):
    ws = wb.create_sheet("Newsletter")
    ws.sheet_properties.tabColor = "3E6E8E"
    ws["A1"] = "Newsletter signups"
    ws["A1"].font = TITLE_FONT
    ws["A2"] = ("Email-only signups from the footer form and the exit popup. "
                "No business details captured, so treat these as colder than Leads.")
    ws["A2"].font = MUTED_FONT
    ws.merge_cells("A2:D2")

    style_header(ws, NEWS_COLS, NEWS_EDIT_COLS, NEWS_ID_COL)

    for i in range(NEWS_BUFFER_ROWS):
        r = FIRST_DATA_ROW + i
        sub = subs[i] if i < len(subs) else None
        values = news_row_values(sub) if sub else [None] * N_NEWS_DATA
        for c in range(1, N_NEWS_TOTAL + 1):
            cell = style_body_cell(ws, r, c, N_NEWS_DATA, N_NEWS_TOTAL,
                                   {N_NEWS_TOTAL}, {1}, NEWS_ID_COL)
            if c <= N_NEWS_DATA:
                cell.value = values[c - 1]
            elif c == N_NEWS_DATA + 1 and sub:
                cell.value = "New"
        if sub:
            ws.cell(row=r, column=NEWS_ID_COL, value=sub["id"])
        ws.row_dimensions[r].height = 22

    last = FIRST_DATA_ROW + NEWS_BUFFER_ROWS - 1
    ws.auto_filter.ref = f"A{HEADER_ROW}:{get_column_letter(N_NEWS_TOTAL)}{last}"
    ws.freeze_panes = f"A{FIRST_DATA_ROW}"


def write_dashboard_tab(wb):
    ws = wb.create_sheet("Dashboard", 0)
    ws.sheet_properties.tabColor = "1B5E20"
    ws["A1"] = "Overview"
    ws["A1"].font = TITLE_FONT
    ws["A2"] = "Live formulas. Updates itself as the Leads tab changes."
    ws["A2"].font = MUTED_FONT
    for col, width in [("A", 34), ("B", 14), ("C", 4), ("D", 34), ("E", 14)]:
        ws.column_dimensions[col].width = width

    lo, hi = FIRST_DATA_ROW, FIRST_DATA_ROW + LEAD_BUFFER_ROWS - 1
    nlo, nhi = FIRST_DATA_ROW, FIRST_DATA_ROW + NEWS_BUFFER_ROWS - 1

    def block(lc, vc, start, title, pairs):
        head = ws[f"{lc}{start}"]
        head.value = title
        head.font = Font(name="Inter", size=11, bold=True, color=NAVY)
        head.fill = PatternFill("solid", fgColor=BAND)
        ws[f"{vc}{start}"].fill = PatternFill("solid", fgColor=BAND)
        for i, (label, formula) in enumerate(pairs, start=start + 1):
            ws[f"{lc}{i}"] = label
            ws[f"{lc}{i}"].font = BODY_FONT
            cell = ws[f"{vc}{i}"]
            cell.value = formula
            cell.font = Font(name="Inter", size=10, bold=True, color=NAVY)
            cell.alignment = Alignment(horizontal="right")

    block("A", "B", 4, "Totals", [
        ("Leads (full details)", f"=COUNTA(Leads!$C${lo}:$C${hi})"),
        ("Newsletter signups", f"=COUNTA(Newsletter!$B${nlo}:$B${nhi})"),
        ("Unique lead emails",
         f'=SUMPRODUCT((Leads!$L${lo}:$L${hi}<>"earlier dup")*(Leads!$C${lo}:$C${hi}<>""))'),
        ("Newest lead", f'=IFERROR(TEXT(MAX(Leads!$A${lo}:$A${hi}),"yyyy-mm-dd"),"-")'),
    ])
    block("A", "B", 10, "By priority", [
        (p, f'=COUNTIF(Leads!$G${lo}:$G${hi},"{p}")') for p in PRIORITY_ORDER])
    block("A", "B", 17, "By status", [
        (s, f'=COUNTIF(Leads!$M${lo}:$M${hi},"{s}")') for s in STATUS_OPTIONS])
    block("D", "E", 4, "Where they came from", [
        (s, f'=COUNTIF(Leads!$J${lo}:$J${hi},"{s}")') for s in TRAFFIC_BUCKETS])
    block("D", "E", 12, "By track", [
        (TRACK_LABELS[k], f'=COUNTIF(Leads!$I${lo}:$I${hi},"{TRACK_LABELS[k]}")')
        for k in ("A", "B", "C")])
    block("D", "E", 17, "By monthly volume", [
        (v, f'=COUNTIF(Leads!$F${lo}:$F${hi},"{v}")')
        for v in VOLUME_TIER_LABELS.values()])


def write_legend_tab(wb):
    ws = wb.create_sheet("Legend")
    ws.sheet_properties.tabColor = SLATE
    ws.column_dimensions["A"].width = 26
    ws.column_dimensions["B"].width = 82
    ws["A1"] = "How to read this sheet"
    ws["A1"].font = TITLE_FONT

    rows = [
        ("", ""),
        ("SECTION", "Tabs"),
        ("Leads", "Anyone who completed the Sorting Hat on the site. Name, email, "
                  "business type, monthly volume and the problem they described."),
        ("Newsletter", "Email-only signups from the footer form or the exit popup. "
                       "No business details, so treat as colder."),
        ("Dashboard", "Auto-calculating counts. Nothing to fill in."),
        ("", ""),
        ("SECTION", "Priority — who to call first"),
        ("1 - Hot", "Over $1M monthly volume. Biggest residual if they switch."),
        ("2 - High", "$250K - $1M monthly."),
        ("3 - Medium", "$50K - $250K monthly."),
        ("4 - Low", "Under $50K monthly."),
        ("5 - Early", "Pre-launch, not processing yet. Long game."),
        ("", ""),
        ("SECTION", "Track — which funnel routed them"),
        (TRACK_LABELS["A"], "Online, e-commerce or SaaS. Standard growth advisory."),
        (TRACK_LABELS["B"], "In-person: retail, restaurant, field services. "
                            "Hardware and per-location costs matter most."),
        (TRACK_LABELS["C"], "Complex or high-risk: financial, health, gaming, or "
                            "anyone with frozen funds, approval or onboarding "
                            "problems. Usually the highest advisory value."),
        ("", ""),
        ("SECTION", "Columns you fill in (yellow)"),
        ("Status", "Dropdown. Drives the Dashboard 'By status' counts."),
        ("Owner", "Who is handling this lead."),
        ("Last contacted", "Date of the last outreach."),
        ("Next step / notes", "Anything worth remembering before the next call."),
        ("", ""),
        ("SECTION", "Housekeeping"),
        ("Flag = earlier dup", "Same email submitted more than once. The earlier "
                               "attempts are greyed out. The clean row at the top "
                               "is the current one — work that."),
        ("Refresh", "New leads are inserted at the top of the Leads tab. The yellow "
                    "columns follow their lead to the new row and are never lost."),
    ]
    for i, (label, text) in enumerate(rows, start=2):
        if label == "SECTION":
            cell = ws.cell(row=i, column=1, value=text)
            cell.font = Font(name="Inter", size=11, bold=True, color="FFFFFF")
            cell.fill = HEAD_FILL
            ws.cell(row=i, column=2).fill = HEAD_FILL
            continue
        a = ws.cell(row=i, column=1, value=label)
        a.font = Font(name="Inter", size=10, bold=True, color=NAVY)
        a.alignment = Alignment(vertical="top")
        b = ws.cell(row=i, column=2, value=text)
        b.font = BODY_FONT
        b.alignment = Alignment(vertical="top", wrap_text=True)
        if text and len(text) > 70:
            ws.row_dimensions[i].height = 30


def build_workbook(leads, subs, path):
    wb = openpyxl.Workbook()
    wb.remove(wb.active)
    write_leads_tab(wb, leads)
    write_newsletter_tab(wb, subs)
    write_dashboard_tab(wb)
    write_legend_tab(wb)
    wb.save(path)
    return path


# --------------------------------------------------------------- drive/sheets
def upload_new(token, path):
    meta = {"name": SHEET_TITLE, "mimeType": "application/vnd.google-apps.spreadsheet"}
    boundary = "==mpa-leads-boundary=="
    with open(path, "rb") as fh:
        blob = fh.read()
    body = b"".join([
        f"--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n".encode(),
        json.dumps(meta).encode(), b"\r\n",
        f"--{boundary}\r\nContent-Type: application/vnd.openxmlformats-"
        f"officedocument.spreadsheetml.sheet\r\n\r\n".encode(),
        blob, f"\r\n--{boundary}--\r\n".encode(),
    ])
    req = Request("https://www.googleapis.com/upload/drive/v3/files"
                  "?uploadType=multipart&fields=id,webViewLink",
                  data=body, method="POST",
                  headers={"Authorization": f"Bearer {token}",
                           "Content-Type": f"multipart/related; boundary={boundary}"})
    with urlopen(req) as resp:
        return json.loads(resp.read())


def fmt_cell(value):
    if value is None:
        return ""
    if isinstance(value, dt.datetime):
        return value.strftime("%Y-%m-%d %H:%M")
    return value


def sync_tab(token, sheet_id, tab, items, row_values, n_data, n_total, id_col,
             buffer_rows):
    """Rewrite DB columns, carry manual columns across by row id."""
    end_col = get_column_letter(id_col)
    last = FIRST_DATA_ROW + buffer_rows - 1
    rng = f"{tab}!A{FIRST_DATA_ROW}:{end_col}{last}"
    existing = google_json(
        token,
        f"https://sheets.googleapis.com/v4/spreadsheets/{sheet_id}/values/{rng}"
    ).get("values", [])

    # id -> manual column values as currently typed in the sheet
    manual = {}
    for row in existing:
        padded = row + [""] * (id_col - len(row))
        rid = padded[id_col - 1]
        if rid:
            manual[rid] = padded[n_data:n_total]

    grid = []
    for item in items:
        kept = manual.get(item["id"], [])
        kept = (kept + [""] * (n_total - n_data))[: n_total - n_data]
        if not kept[0]:
            kept[0] = "New"
        grid.append([fmt_cell(v) for v in row_values(item)] + kept + [item["id"]])
    # blank out the tail so deleted rows do not linger
    grid += [[""] * id_col for _ in range(buffer_rows - len(items))]

    google_json(
        token,
        f"https://sheets.googleapis.com/v4/spreadsheets/{sheet_id}/values/{rng}"
        "?valueInputOption=USER_ENTERED",
        method="PUT", payload={"range": rng, "majorDimension": "ROWS", "values": grid},
    )
    return len(items)


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "sync"
    env = read_env(ENV_FILE)
    url, key = env["NEXT_PUBLIC_SUPABASE_URL"], env["SUPABASE_SERVICE_ROLE_KEY"]

    leads = build_leads(supabase_get(url, key, "quiz_leads",
                                     "select=*&order=created_at.desc"))
    subs = build_newsletter(supabase_get(url, key, "newsletter_subscribers",
                                         "select=*&order=subscribed_at.desc"))
    print(f"pulled {len(leads)} leads, {len(subs)} newsletter signups")

    if len(leads) > LEAD_BUFFER_ROWS or len(subs) > NEWS_BUFFER_ROWS:
        sys.exit("buffer exceeded — raise LEAD_BUFFER_ROWS / NEWS_BUFFER_ROWS "
                 "and re-run 'create'")

    token = google_access_token()
    state = {}
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE) as fh:
            state = json.load(fh)

    if mode == "create" or not state.get("spreadsheet_id"):
        build_workbook(leads, subs, XLSX_FILE)
        info = upload_new(token, XLSX_FILE)
        state = {"spreadsheet_id": info["id"],
                 "url": info.get("webViewLink") or
                 f"https://docs.google.com/spreadsheets/d/{info['id']}/edit"}
        with open(STATE_FILE, "w") as fh:
            json.dump(state, fh, indent=2)
        print(f"created {state['url']}")
    else:
        sid = state["spreadsheet_id"]
        sync_tab(token, sid, "Leads", leads, lead_row_values,
                 N_LEAD_DATA, N_LEAD_TOTAL, LEAD_ID_COL, LEAD_BUFFER_ROWS)
        sync_tab(token, sid, "Newsletter", subs, news_row_values,
                 N_NEWS_DATA, N_NEWS_TOTAL, NEWS_ID_COL, NEWS_BUFFER_ROWS)
        print(f"synced {state['url']}")

    print(json.dumps({"leads": len(leads), "newsletter": len(subs),
                      "url": state.get("url")}, indent=2))


if __name__ == "__main__":
    main()

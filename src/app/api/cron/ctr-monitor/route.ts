/**
 * Weekly CTR monitor cron.
 *
 * Runs every Monday 09:00 UTC. Compares last 7d GSC data for the 8 priority pages
 * shipped 2026-05-22 against the pre-rewrite baseline (data/seo/ctr-baseline-2026-05-22.json).
 *
 * Alerts via Resend email if any page:
 *   - dropped more than 5 positions, OR
 *   - lost more than 30% of impressions
 *
 * Always sends a weekly digest (regression or not) so the loop stays visible.
 *
 * Env required:
 *   GOOGLE_SERVICE_ACCOUNT  JSON-stringified GCP service account creds with
 *                           webmasters.readonly scope, granted Read access on the
 *                           GSC property `sc-domain:mypayadvisor.com`.
 *   RESEND_API_KEY          for email
 *   CTR_MONITOR_TO          comma-separated email list (default: assaf.ichaki@gmail.com)
 *   CRON_SECRET             Vercel-provided; verified to gate calls
 */
import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import { getResend, FUNNEL_FROM } from "@/lib/funnel/resend-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE = "sc-domain:mypayadvisor.com";

interface BaselineRow {
  impressions: number;
  clicks: number;
  ctr_pct: number;
  position: number;
}

interface Baseline {
  captured_at: string;
  priority_pages: Record<string, BaselineRow>;
  regression_thresholds: { position_drop_alert: number; impressions_drop_pct_alert: number };
}

function loadBaseline(): Baseline {
  const p = path.join(process.cwd(), "data", "seo", "ctr-baseline-2026-05-22.json");
  return JSON.parse(fs.readFileSync(p, "utf8")) as Baseline;
}

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT env not set");
  const credentials = JSON.parse(raw);
  return new GoogleAuth({ credentials, scopes: ["https://www.googleapis.com/auth/webmasters.readonly"] });
}

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

async function pullCurrent(baseline: Baseline) {
  const auth = getAuth();
  const svc = google.searchconsole({ version: "v1", auth });
  const start = isoDaysAgo(8); // last 7d, excluding today (GSC lag)
  const end = isoDaysAgo(1);
  const r = await svc.searchanalytics.query({
    siteUrl: SITE,
    requestBody: { startDate: start, endDate: end, dimensions: ["page"], rowLimit: 200 },
  });
  const rows = r.data.rows || [];

  const byPath: Record<string, BaselineRow> = {};
  for (const row of rows) {
    const fullUrl = (row.keys || [""])[0];
    const urlPath = fullUrl.replace(/^https?:\/\/(www\.)?mypayadvisor\.com/, "") || "/";
    byPath[urlPath] = {
      impressions: row.impressions ?? 0,
      clicks: row.clicks ?? 0,
      ctr_pct: (row.ctr ?? 0) * 100,
      position: row.position ?? 0,
    };
  }

  type Comparison = {
    page: string;
    baseline: BaselineRow;
    current: BaselineRow | null;
    position_delta: number | null;
    impressions_delta_pct: number | null;
    ctr_delta_pct: number | null;
    regression: boolean;
    regression_reason: string | null;
  };
  const comparisons: Comparison[] = [];

  for (const [pathKey, baseRow] of Object.entries(baseline.priority_pages)) {
    const cur = byPath[pathKey] ?? null;
    let positionDelta: number | null = null;
    let impressionsDeltaPct: number | null = null;
    let ctrDeltaPct: number | null = null;
    let regression = false;
    let regressionReason: string | null = null;

    if (cur) {
      // GSC position: smaller is better, so delta = current - baseline.
      // Positive delta = page dropped further down SERP.
      positionDelta = cur.position - baseRow.position;
      // 7d impressions vs 28d baseline; normalize baseline to 7d before compare.
      const baseline7dImpr = baseRow.impressions / 4;
      impressionsDeltaPct = baseline7dImpr > 0 ? ((cur.impressions - baseline7dImpr) / baseline7dImpr) * 100 : null;
      ctrDeltaPct = cur.ctr_pct - baseRow.ctr_pct;

      if (positionDelta >= baseline.regression_thresholds.position_drop_alert) {
        regression = true;
        regressionReason = `position dropped ${positionDelta.toFixed(1)} (baseline ${baseRow.position.toFixed(1)} to current ${cur.position.toFixed(1)})`;
      } else if (impressionsDeltaPct !== null && impressionsDeltaPct <= -baseline.regression_thresholds.impressions_drop_pct_alert) {
        regression = true;
        regressionReason = `impressions dropped ${Math.abs(impressionsDeltaPct).toFixed(0)}% vs normalized baseline`;
      }
    }

    comparisons.push({
      page: pathKey,
      baseline: baseRow,
      current: cur,
      position_delta: positionDelta,
      impressions_delta_pct: impressionsDeltaPct,
      ctr_delta_pct: ctrDeltaPct,
      regression,
      regression_reason: regressionReason,
    });
  }

  return { window_start: start, window_end: end, comparisons };
}

function renderEmail(report: { window_start: string; window_end: string; comparisons: Array<{ page: string; baseline: BaselineRow; current: BaselineRow | null; position_delta: number | null; impressions_delta_pct: number | null; ctr_delta_pct: number | null; regression: boolean; regression_reason: string | null }> }): { subject: string; html: string; text: string } {
  const regressions = report.comparisons.filter((c) => c.regression);
  const subject = regressions.length > 0
    ? `[CTR Monitor] ${regressions.length} page(s) regressed on mypayadvisor.com`
    : `[CTR Monitor] Weekly digest: all 8 pages healthy`;

  const rowsHtml = report.comparisons.map((c) => {
    const cur = c.current;
    const pos = cur ? cur.position.toFixed(1) : "N/A";
    const baselinePos = c.baseline.position.toFixed(1);
    const posDeltaStr = c.position_delta !== null ? (c.position_delta >= 0 ? `+${c.position_delta.toFixed(1)}` : c.position_delta.toFixed(1)) : "N/A";
    const imprDeltaStr = c.impressions_delta_pct !== null ? `${c.impressions_delta_pct >= 0 ? "+" : ""}${c.impressions_delta_pct.toFixed(0)}%` : "N/A";
    const ctrCur = cur ? cur.ctr_pct.toFixed(2) : "N/A";
    const ctrBase = c.baseline.ctr_pct.toFixed(2);
    const flag = c.regression ? "ALERT" : "OK";
    const bg = c.regression ? "#fee" : "#fff";
    return `<tr style="background:${bg}"><td style="padding:6px 8px;font-family:monospace;font-size:11px">${c.page}</td><td style="padding:6px 8px">${baselinePos} to ${pos} (${posDeltaStr})</td><td style="padding:6px 8px">${imprDeltaStr}</td><td style="padding:6px 8px">${ctrBase}% to ${ctrCur}%</td><td style="padding:6px 8px"><b>${flag}</b>${c.regression_reason ? ` ${c.regression_reason}` : ""}</td></tr>`;
  }).join("");

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:900px">
      <h2>mypayadvisor.com CTR Monitor &mdash; ${report.window_start} to ${report.window_end}</h2>
      <p>Comparing last 7d vs pre-rewrite baseline (2026-05-22, 28d window). Impressions normalized to 7d.</p>
      <p><b>${regressions.length}</b> regression(s) detected. Thresholds: position drop &gt;= 5, impressions drop &gt;= 30%.</p>
      <table style="border-collapse:collapse;width:100%;font-size:12px;border:1px solid #ccc">
        <thead style="background:#f3f4f6"><tr>
          <th style="padding:6px 8px;text-align:left">Page</th>
          <th style="padding:6px 8px;text-align:left">Position (base to now)</th>
          <th style="padding:6px 8px;text-align:left">Impr delta vs 7d-normalized</th>
          <th style="padding:6px 8px;text-align:left">CTR (base to now)</th>
          <th style="padding:6px 8px;text-align:left">Status</th>
        </tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
      <p style="margin-top:24px;font-size:12px;color:#666">If a page regresses, candidate rollbacks: revert the commit listed in the Batch 1 ship report (Avi swarm 2026-05-22), or pull the prior body_html from the Supabase audit log for the DB-backed pages.</p>
    </div>
  `;

  const text = `mypayadvisor.com CTR Monitor: ${report.window_start} to ${report.window_end}\n${regressions.length} regression(s) detected.\n\n${report.comparisons.map((c) => `${c.page}: pos ${c.baseline.position.toFixed(1)}->${c.current?.position?.toFixed(1) ?? "N/A"} (${c.position_delta?.toFixed(1) ?? "N/A"}), impr delta ${c.impressions_delta_pct?.toFixed(0) ?? "N/A"}%, ${c.regression ? `REGRESSION: ${c.regression_reason}` : "OK"}`).join("\n")}`;

  return { subject, html, text };
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const provided = req.headers.get("authorization");
  if (secret && provided !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const baseline = loadBaseline();
    const report = await pullCurrent(baseline);
    const { subject, html, text } = renderEmail(report);

    const to = (process.env.CTR_MONITOR_TO || "assaf.ichaki@gmail.com").split(",").map((s) => s.trim());
    const resend = getResend();
    const send = await resend.emails.send({ from: FUNNEL_FROM, to, subject, html, text });

    return NextResponse.json({
      ok: true,
      window: { start: report.window_start, end: report.window_end },
      regressions: report.comparisons.filter((c) => c.regression).map((c) => ({ page: c.page, reason: c.regression_reason })),
      email_id: send.data?.id || null,
      page_count: report.comparisons.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

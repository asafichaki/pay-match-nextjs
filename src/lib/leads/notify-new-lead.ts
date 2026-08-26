import "server-only";

import { getResend } from "@/lib/funnel/resend-client";

/**
 * Internal admin notification — emails assaf.ichaki@gmail.com for every new lead.
 *
 * Hard contract:
 *   - This function MUST NEVER throw. Any error is swallowed + console.error'd.
 *   - It is intentionally fire-and-forget: callers should NOT `await` it on the
 *     critical user-response path. Use `.catch()` if you want belt-and-suspenders
 *     logging, otherwise just call without await.
 *   - Failure here must not block the lead from being saved or the user from
 *     seeing a success state.
 *
 * Uses the same verified `mypayadvisor.com` domain as the funnel email flow.
 */

// mypayadvisor.com is verified in Resend (confirmed 2026-05-30), so notifications
// send from the real domain and deliver to BOTH Assaf and Barak. Every captured
// lead reaches them directly and Barak follows up with the merchant personally.
// This is the conversion mechanism (lead handoff), replacing the booking link.
// Override recipients via LEADS_NOTIFY_TO_EMAIL (comma-separated) if they change.
const ADMIN_TO = (
  process.env.LEADS_NOTIFY_TO_EMAIL ||
  "assaf.ichaki@gmail.com,barak@mypayadvisor.com,Barak.bachar1@gmail.com"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const FROM =
  process.env.LEADS_NOTIFY_FROM_EMAIL ||
  "myPayAdvisor Leads <leads@mypayadvisor.com>";
const ADMIN_URL = "https://www.mypayadvisor.com/admin/leads";

export type LeadSource =
  | "newsletter"
  | "quiz"
  | "sorting_hat"
  | "exit_intent"
  | "rate_brief";

export interface NotifyNewLeadArgs {
  source: LeadSource;
  lead: {
    email: string;
    name?: string | null;
    phone?: string | null;
    [k: string]: unknown;
  };
  funnel?: {
    track?: string;
    track_variant?: string;
    volume_tier?: string;
    pain_point?: string;
    lead_source?: string;
  } | null;
  thank_you_slug?: string;
  page_url?: string;
  /** Appended to the subject so a follow-up notification about an existing
   *  lead does not look like a duplicate of the original one. */
  subject_note?: string;
}

function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatIL(date: Date): string {
  try {
    return new Intl.DateTimeFormat("he-IL", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jerusalem",
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

function trackBadgeColor(track?: string): { bg: string; fg: string } {
  switch ((track || "").toUpperCase()) {
    case "A":
      return { bg: "#dbeafe", fg: "#1e3a8a" };
    case "B":
      return { bg: "#dcfce7", fg: "#14532d" };
    case "C":
      return { bg: "#fef3c7", fg: "#78350f" };
    case "MANUAL":
      return { bg: "#fce7f3", fg: "#831843" };
    default:
      return { bg: "#e5e7eb", fg: "#1f2937" };
  }
}

function renderKeyValueRows(obj: Record<string, unknown>): string {
  const skip = new Set(["email", "name", "full_name", "phone", "honeypot"]);
  const rows: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (skip.has(k)) continue;
    if (v === null || v === undefined || v === "") continue;
    const valStr =
      typeof v === "object" ? JSON.stringify(v) : String(v);
    rows.push(
      `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(
        k,
      )}</td><td style="padding:4px 0;font-size:13px;color:#111827;word-break:break-word;">${escapeHtml(
        valStr,
      )}</td></tr>`,
    );
  }
  return rows.join("");
}

function buildSubject(args: NotifyNewLeadArgs): string {
  const tag = args.funnel?.track
    ? `track ${args.funnel.track}`
    : args.funnel?.volume_tier || args.source;
  const note = args.subject_note ? ` · ${args.subject_note}` : "";
  return `[Lead] ${args.source} · ${args.lead.email} · ${tag}${note}`;
}

function buildHtml(args: NotifyNewLeadArgs): string {
  const now = new Date();
  const when = formatIL(now);
  const lead = args.lead;
  const email = String(lead.email || "");
  const name = (lead.name as string) || (lead.full_name as string) || null;
  const phone = (lead.phone as string) || null;
  const track = args.funnel?.track;
  const badge = trackBadgeColor(track);

  const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
    "Re: your inquiry on myPayAdvisor",
  )}`;

  const funnelBlock = args.funnel
    ? `<div style="margin:12px 0 16px 0;">
         ${
           track
             ? `<span style="display:inline-block;background:${badge.bg};color:${badge.fg};padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;margin-right:6px;">Track ${escapeHtml(track)}${
                 args.funnel.track_variant && args.funnel.track_variant !== "default"
                   ? ` · ${escapeHtml(args.funnel.track_variant)}`
                   : ""
               }</span>`
             : ""
         }
         ${
           args.funnel.volume_tier
             ? `<span style="display:inline-block;background:#f3f4f6;color:#374151;padding:3px 10px;border-radius:999px;font-size:12px;margin-right:6px;">${escapeHtml(args.funnel.volume_tier)}</span>`
             : ""
         }
         ${
           args.funnel.pain_point
             ? `<span style="display:inline-block;background:#f3f4f6;color:#374151;padding:3px 10px;border-radius:999px;font-size:12px;">${escapeHtml(args.funnel.pain_point)}</span>`
             : ""
         }
       </div>`
    : "";

  const kvRows = renderKeyValueRows({
    ...lead,
    ...(args.funnel || {}),
    page_url: args.page_url,
    thank_you_slug: args.thank_you_slug,
  });

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;max-width:600px;">
        <tr><td style="padding:24px 28px 8px 28px;">
          <h2 style="margin:0 0 4px 0;font-size:18px;color:#111827;">${args.subject_note ? "Lead updated" : "New lead"} · <span style="text-transform:capitalize;">${escapeHtml(args.source)}</span></h2>
          <div style="color:#6b7280;font-size:13px;">${escapeHtml(when)} · Asia/Jerusalem</div>
        </td></tr>
        <tr><td style="padding:8px 28px 4px 28px;">
          ${funnelBlock}
          <div style="font-size:15px;color:#111827;margin:0 0 6px 0;">
            ${name ? `<strong>${escapeHtml(name)}</strong> · ` : ""}
            <a href="mailto:${escapeHtml(email)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(email)}</a>
            ${phone ? ` · <a href="tel:${escapeHtml(phone)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(phone)}</a>` : ""}
          </div>
        </td></tr>
        ${
          kvRows
            ? `<tr><td style="padding:8px 28px 16px 28px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #f3f4f6;padding-top:12px;">
                  ${kvRows}
                </table>
              </td></tr>`
            : ""
        }
        <tr><td style="padding:8px 28px 24px 28px;">
          <a href="${ADMIN_URL}" style="display:inline-block;background:#111827;color:#ffffff;padding:10px 16px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;margin-right:8px;">View in admin</a>
          <a href="${mailto}" style="display:inline-block;background:#ffffff;color:#111827;padding:10px 16px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;border:1px solid #d1d5db;">Reply to lead</a>
        </td></tr>
        <tr><td style="padding:0 28px 20px 28px;border-top:1px solid #f3f4f6;">
          <div style="font-size:11px;color:#9ca3af;padding-top:12px;">Internal admin notification · <a href="${ADMIN_URL}" style="color:#9ca3af;">${ADMIN_URL}</a></div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function buildText(args: NotifyNewLeadArgs): string {
  const lead = args.lead;
  const lines = [
    `New lead, ${args.source}`,
    `Time: ${formatIL(new Date())} (Asia/Jerusalem)`,
    `Email: ${lead.email}`,
  ];
  const name = (lead.name as string) || (lead.full_name as string);
  if (name) lines.push(`Name: ${name}`);
  if (lead.phone) lines.push(`Phone: ${lead.phone}`);
  if (args.funnel?.track) lines.push(`Track: ${args.funnel.track}${args.funnel.track_variant ? ` (${args.funnel.track_variant})` : ""}`);
  if (args.funnel?.volume_tier) lines.push(`Volume: ${args.funnel.volume_tier}`);
  if (args.funnel?.pain_point) lines.push(`Pain point: ${args.funnel.pain_point}`);
  if (args.page_url) lines.push(`Page: ${args.page_url}`);
  for (const [k, v] of Object.entries(lead)) {
    if (["email", "name", "full_name", "phone", "honeypot"].includes(k)) continue;
    if (v === null || v === undefined || v === "") continue;
    lines.push(`${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`);
  }
  lines.push("", `View in admin: ${ADMIN_URL}`);
  return lines.join("\n");
}

export async function notifyNewLead(args: NotifyNewLeadArgs): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("[notifyNewLead] RESEND_API_KEY not set, skipping", {
        source: args.source,
      });
      return;
    }
    const resend = getResend();
    const subject = buildSubject(args);
    const html = buildHtml(args);
    const text = buildText(args);

    const result = await resend.emails.send({
      from: FROM,
      to: ADMIN_TO,
      subject,
      html,
      text,
      headers: {
        "X-Lead-Source": args.source,
        ...(args.funnel?.track ? { "X-Lead-Track": args.funnel.track } : {}),
      },
    });
    if (result.error) {
      console.error("[notifyNewLead] Resend returned error", {
        source: args.source,
        error: result.error,
      });
    }
  } catch (err) {
    console.error("[notifyNewLead] unexpected exception (swallowed)", {
      err,
      source: args.source,
      email: args.lead?.email,
    });
  }
}

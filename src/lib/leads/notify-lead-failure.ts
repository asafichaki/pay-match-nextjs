import "server-only";

import { getResend } from "@/lib/funnel/resend-client";

/**
 * CRITICAL admin notification — sent when a primary lead-write fails and the
 * lead has been rescued into `lead_capture_failures`. Filters separately from
 * normal `[Lead] ...` notifications via the `[CRITICAL]` subject prefix.
 *
 * Hard contract: same as notifyNewLead — must never throw.
 */

// See notify-new-lead.ts for the address-form rationale (Resend sandbox limits).
const ADMIN_TO = process.env.LEADS_NOTIFY_TO_EMAIL || "asafichaki@gmail.com";
const FROM =
  process.env.LEADS_NOTIFY_FROM_EMAIL ||
  "myPayAdvisor Leads <onboarding@resend.dev>"; // TODO: verify mypayadvisor.com in Resend, then switch to leads@mypayadvisor.com
const ADMIN_URL = "https://www.mypayadvisor.com/admin/leads";

export interface NotifyLeadFailureArgs {
  source: string;
  payload: Record<string, unknown>;
  error_code?: string | null;
  error_message?: string | null;
  page_url?: string | null;
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

function previewPayload(payload: Record<string, unknown>): string {
  try {
    const clone = { ...payload } as Record<string, unknown>;
    delete clone.honeypot;
    const json = JSON.stringify(clone, null, 2);
    return json.length > 4000 ? json.slice(0, 4000) + "\n... (truncated)" : json;
  } catch {
    return "(payload not serializable)";
  }
}

export async function notifyLeadFailure(
  args: NotifyLeadFailureArgs,
): Promise<void> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("[notifyLeadFailure] RESEND_API_KEY not set, skipping", {
        source: args.source,
      });
      return;
    }
    const resend = getResend();
    const email =
      typeof args.payload?.email === "string"
        ? (args.payload.email as string)
        : "unknown";
    const subject = `[CRITICAL] Lead nearly lost · ${args.source} · ${email}`;
    const when = formatIL(new Date());
    const payloadPreview = previewPayload(args.payload);

    const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#fef2f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;border:2px solid #dc2626;max-width:600px;">
        <tr><td style="padding:24px 28px 8px 28px;">
          <h2 style="margin:0 0 4px 0;font-size:18px;color:#991b1b;">CRITICAL · Lead nearly lost</h2>
          <div style="color:#6b7280;font-size:13px;">${escapeHtml(when)} · Asia/Jerusalem</div>
        </td></tr>
        <tr><td style="padding:8px 28px 8px 28px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;">
            <tr><td style="padding:4px 12px 4px 0;color:#6b7280;white-space:nowrap;">Source</td><td style="color:#111827;"><strong>${escapeHtml(args.source)}</strong></td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#6b7280;white-space:nowrap;">Email</td><td style="color:#111827;">${escapeHtml(email)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#6b7280;white-space:nowrap;">Error code</td><td style="color:#111827;font-family:ui-monospace,monospace;">${escapeHtml(args.error_code || "(none)")}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#6b7280;white-space:nowrap;vertical-align:top;">Error message</td><td style="color:#111827;font-family:ui-monospace,monospace;font-size:12px;">${escapeHtml(args.error_message || "(none)")}</td></tr>
            ${args.page_url ? `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;white-space:nowrap;">Page</td><td style="color:#111827;">${escapeHtml(args.page_url)}</td></tr>` : ""}
          </table>
        </td></tr>
        <tr><td style="padding:8px 28px 16px 28px;">
          <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">Payload preview</div>
          <pre style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;font-size:12px;font-family:ui-monospace,monospace;color:#111827;white-space:pre-wrap;word-break:break-word;margin:0;">${escapeHtml(payloadPreview)}</pre>
        </td></tr>
        <tr><td style="padding:0 28px 20px 28px;">
          <div style="font-size:12px;color:#374151;">The lead has been rescued into <code>lead_capture_failures</code>. Recover it manually from admin or the table directly.</div>
          <div style="margin-top:12px;">
            <a href="${ADMIN_URL}" style="display:inline-block;background:#dc2626;color:#ffffff;padding:10px 16px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">Open admin</a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

    const text = [
      `[CRITICAL] Lead nearly lost`,
      `Time: ${when} (Asia/Jerusalem)`,
      `Source: ${args.source}`,
      `Email: ${email}`,
      `Error code: ${args.error_code || "(none)"}`,
      `Error message: ${args.error_message || "(none)"}`,
      args.page_url ? `Page: ${args.page_url}` : "",
      ``,
      `Payload preview:`,
      payloadPreview,
      ``,
      `Lead rescued into lead_capture_failures. Open admin: ${ADMIN_URL}`,
    ]
      .filter(Boolean)
      .join("\n");

    const result = await resend.emails.send({
      from: FROM,
      to: ADMIN_TO,
      subject,
      html,
      text,
      headers: {
        "X-Lead-Source": args.source,
        "X-Lead-Severity": "critical",
      },
    });
    if (result.error) {
      console.error("[notifyLeadFailure] Resend returned error", {
        source: args.source,
        error: result.error,
      });
    }
  } catch (err) {
    console.error("[notifyLeadFailure] unexpected exception (swallowed)", {
      err,
      source: args.source,
    });
  }
}

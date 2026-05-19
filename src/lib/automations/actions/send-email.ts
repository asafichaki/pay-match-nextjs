import { getResend, FUNNEL_FROM, FUNNEL_REPLY_TO } from "@/lib/funnel/resend-client";
import type {
  AutomationActionResult,
  AutomationEventPayload,
  AutomationRow,
} from "../types";

function interpolate(template: string, payload: AutomationEventPayload): string {
  return template.replace(/\{\{lead\.([a-zA-Z_]+)\}\}/g, (_, key) => {
    const v = (payload.lead as Record<string, unknown> | undefined)?.[key];
    return v == null ? "" : String(v);
  });
}

export async function sendEmail(
  automation: AutomationRow,
  payload: AutomationEventPayload
): Promise<AutomationActionResult> {
  const cfg = automation.action_config || {};
  const toRaw = typeof cfg.to === "string" ? cfg.to : "";
  const subjectRaw = typeof cfg.subject === "string" ? cfg.subject : "";
  const bodyRaw = typeof cfg.body === "string" ? cfg.body : "";

  if (!toRaw || !subjectRaw || !bodyRaw) {
    return { ok: false, error: "send_email requires to, subject, body" };
  }

  const to = interpolate(toRaw, payload).trim();
  const subject = interpolate(subjectRaw, payload);
  const body = interpolate(bodyRaw, payload);

  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { ok: false, error: `Resolved recipient is not a valid email: "${to}"` };
  }

  if (!process.env.RESEND_API_KEY) {
    // Soft-fail in environments without Resend (CI / preview).
    return {
      ok: true,
      result: { simulated: true, to, subject, reason: "RESEND_API_KEY not set" },
    };
  }

  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from: FUNNEL_FROM,
    to,
    replyTo: FUNNEL_REPLY_TO,
    subject,
    text: body,
  });

  if (error) {
    return { ok: false, error: error.message || "Resend error" };
  }
  return { ok: true, result: { id: data?.id ?? null, to, subject } };
}

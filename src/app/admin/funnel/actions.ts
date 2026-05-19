"use server";

import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/integrations/supabase/types";

import { getAdminSupabase } from "@/lib/funnel/admin-supabase";
import { getEmail, type EmailKey } from "@/lib/funnel/email-registry";
import {
  getResend,
  FUNNEL_FROM,
  FUNNEL_REPLY_TO,
  CALENDLY_URL,
  SHORTLIST_URL_BASE,
  AFFILIATE_URL_BASE,
} from "@/lib/funnel/resend-client";
import { trackLeadFailure } from "@/lib/leads/track-failure";
import {
  PAIN_POINT_SHORT,
  VOLUME_TIER_LABELS,
  BUSINESS_TYPE_LABELS,
  type PainPoint,
  type VolumeTier,
  type BusinessType,
} from "@/lib/funnel/types";

/**
 * Admin server actions for the Funnel email-lifecycle UI.
 *
 * Capabilities (admin role only):
 *   - sendFunnelEmail({ leadId, emailKey })  — send a specific module
 *   - resendLastFunnelEmail({ leadId })       — resend whatever was last sent
 *   - markEmailFlag({ leadId, emailKey, flag }) — mark opened/clicked for testing
 *
 * Shared rules:
 *   - Admin-only (assertCallerIsAdmin), throws "Forbidden" otherwise
 *   - Reuses the singleton Resend client (getResend)
 *   - Fire-and-forget: schedules the send + updates quiz_leads.email_state +
 *     writes lead_activities row, but does NOT await Resend latency in the
 *     critical path. The UI gets `{ ok: true }` once the activity row is queued.
 *   - On send failure, trackLeadFailure writes lead_capture_failures with
 *     source="manualFunnelSend".
 */

// ─── Auth ────────────────────────────────────────────────────────────

async function getCallerSession() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createServerClient<Database>(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // read-only in actions
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { user, supabase };
}

async function assertCallerIsAdmin(): Promise<{ userId: string; userEmail: string | null }> {
  const { user, supabase } = await getCallerSession();
  if (!user) throw new Error("Not authenticated");
  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (roleRow?.role !== "admin") throw new Error("Forbidden — admin role required");
  return { userId: user.id, userEmail: user.email ?? null };
}

// ─── Types ───────────────────────────────────────────────────────────

export type FunnelActionResult =
  | { ok: true; emailKey?: string; message?: string }
  | { ok: false; error: string };

interface FunnelLeadRow {
  id: string;
  email: string;
  full_name: string | null;
  track: string | null;
  track_variant: string | null;
  pain_point: string | null;
  volume_tier: string | null;
  business_type: string | null;
  funnel_state: string | null;
  email_state: Record<string, Record<string, unknown>> | null;
}

const LEAD_COLUMNS =
  "id, email, full_name, track, track_variant, pain_point, volume_tier, business_type, funnel_state, email_state";

// ─── Helpers ─────────────────────────────────────────────────────────

function buildSharedProps(lead: FunnelLeadRow): Record<string, unknown> {
  const businessLabel = lead.business_type
    ? BUSINESS_TYPE_LABELS[lead.business_type as BusinessType] ?? lead.business_type
    : "";
  const volumeLabel = lead.volume_tier
    ? VOLUME_TIER_LABELS[lead.volume_tier as VolumeTier] ?? lead.volume_tier
    : "";
  const painLabel = lead.pain_point
    ? PAIN_POINT_SHORT[lead.pain_point as PainPoint] ?? lead.pain_point
    : "";

  return {
    name: lead.full_name || lead.email.split("@")[0] || "there",
    businessType: businessLabel,
    volumeTier: volumeLabel,
    painPoint: painLabel,
    shortlistUrl: SHORTLIST_URL_BASE,
    calendlyUrl: CALENDLY_URL,
    affiliateUrl: AFFILIATE_URL_BASE,
  };
}

function findLastSentKey(
  state: Record<string, Record<string, unknown>> | null
): string | null {
  if (!state) return null;
  let latestKey: string | null = null;
  let latestTs = 0;
  for (const [k, v] of Object.entries(state)) {
    const ts = typeof v?.sent_at === "string" ? Date.parse(v.sent_at as string) : 0;
    if (ts && ts > latestTs) {
      latestTs = ts;
      latestKey = k;
    }
  }
  return latestKey;
}

async function fetchLead(leadId: string): Promise<FunnelLeadRow | null> {
  const admin = getAdminSupabase();
  const { data, error } = await admin
    .from("quiz_leads")
    .select(LEAD_COLUMNS)
    .eq("id", leadId)
    .maybeSingle();
  if (error || !data) return null;
  return data as unknown as FunnelLeadRow;
}

async function logActivity(args: {
  leadId: string;
  userId: string;
  title: string;
  description: string;
}) {
  const admin = getAdminSupabase();
  await admin.from("lead_activities").insert({
    lead_id: args.leadId,
    activity_type: "email_sent_manual",
    title: args.title,
    description: args.description,
    created_by: args.userId,
    completed: true,
  });
}

/**
 * Fire the actual Resend send + update email_state, asynchronously.
 * Errors are swallowed into trackLeadFailure(source="manualFunnelSend").
 * Never awaited by the caller's critical path.
 */
async function dispatchSendBackground(args: {
  lead: FunnelLeadRow;
  emailKey: EmailKey;
  triggeredByEmail: string | null;
}) {
  const { lead, emailKey } = args;
  try {
    const mod = getEmail(emailKey);
    if (!mod) throw new Error(`Email module not found: ${emailKey}`);

    const props = buildSharedProps(lead);
    const subject = mod.subject(props);
    const react = mod.default(props);

    const resend = getResend();
    const sendResult = await resend.emails.send({
      from: FUNNEL_FROM,
      replyTo: FUNNEL_REPLY_TO,
      to: lead.email,
      subject,
      react,
      headers: {
        "X-Funnel-Track": lead.track || "",
        "X-Funnel-Manual": "true",
        "X-Funnel-Email-Key": emailKey,
      },
    });

    if (sendResult.error) {
      throw new Error(
        `Resend error: ${sendResult.error.name || ""} ${sendResult.error.message || ""}`.trim()
      );
    }

    // Update email_state — merge into existing JSON
    const nowIso = new Date().toISOString();
    const current = lead.email_state || {};
    const prior = (current[emailKey] || {}) as Record<string, unknown>;
    const nextState: Record<string, Record<string, unknown>> = {
      ...current,
      [emailKey]: {
        ...prior,
        sent_at: nowIso,
        manual: true,
        triggered_by: args.triggeredByEmail || "admin",
        resend_id: sendResult.data?.id ?? null,
      },
    };

    const admin = getAdminSupabase();
    await admin
      .from("quiz_leads")
      .update({ email_state: nextState } as unknown as Record<string, unknown>)
      .eq("id", lead.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[funnel/actions] manual send failed", {
      leadId: lead.id,
      emailKey,
      message,
    });
    trackLeadFailure({
      source: "manualFunnelSend",
      payload: {
        lead_id: lead.id,
        email: lead.email,
        email_key: emailKey,
        triggered_by: args.triggeredByEmail,
      },
      error_code: "MANUAL_FUNNEL_SEND_FAILED",
      error_message: message,
    }).catch(() => {
      /* swallowed in trackLeadFailure */
    });
  }
}

// ─── Public actions ──────────────────────────────────────────────────

export async function sendFunnelEmail(input: {
  leadId: string;
  emailKey: string;
}): Promise<FunnelActionResult> {
  const { userId, userEmail } = await assertCallerIsAdmin();

  const mod = getEmail(input.emailKey);
  if (!mod) return { ok: false, error: `Unknown email module: ${input.emailKey}` };

  const lead = await fetchLead(input.leadId);
  if (!lead) return { ok: false, error: "Lead not found" };

  // Log first (so admin can always see attempt), then fire-and-forget send.
  await logActivity({
    leadId: lead.id,
    userId,
    title: `Manual email: ${input.emailKey}`,
    description: `Triggered by ${userEmail || userId} (manual funnel send)`,
  });

  // fire-and-forget — UI returns immediately
  void dispatchSendBackground({
    lead,
    emailKey: input.emailKey as EmailKey,
    triggeredByEmail: userEmail,
  });

  return { ok: true, emailKey: input.emailKey, message: "Send queued" };
}

export async function resendLastFunnelEmail(input: {
  leadId: string;
}): Promise<FunnelActionResult> {
  await assertCallerIsAdmin();
  const lead = await fetchLead(input.leadId);
  if (!lead) return { ok: false, error: "Lead not found" };

  const lastKey = findLastSentKey(lead.email_state);
  if (!lastKey) {
    return { ok: false, error: "No prior email to resend for this lead" };
  }
  return sendFunnelEmail({ leadId: input.leadId, emailKey: lastKey });
}

export async function markEmailFlag(input: {
  leadId: string;
  emailKey: string;
  flag: "opened" | "clicked";
}): Promise<FunnelActionResult> {
  const { userId, userEmail } = await assertCallerIsAdmin();
  const lead = await fetchLead(input.leadId);
  if (!lead) return { ok: false, error: "Lead not found" };

  const current = lead.email_state || {};
  const prior = (current[input.emailKey] || {}) as Record<string, unknown>;
  const nowIso = new Date().toISOString();
  const tsKey = input.flag === "opened" ? "opened_at" : "clicked_at";
  const nextState: Record<string, Record<string, unknown>> = {
    ...current,
    [input.emailKey]: {
      ...prior,
      [input.flag]: true,
      [tsKey]: prior[tsKey] || nowIso,
      manual_test_flag: true,
    },
  };

  const admin = getAdminSupabase();
  const { error } = await admin
    .from("quiz_leads")
    .update({ email_state: nextState } as unknown as Record<string, unknown>)
    .eq("id", lead.id);
  if (error) return { ok: false, error: error.message };

  await logActivity({
    leadId: lead.id,
    userId,
    title: `Test flag: ${input.flag} on ${input.emailKey}`,
    description: `Manually flagged by ${userEmail || userId} (testing)`,
  });

  return { ok: true, message: `Marked ${input.flag} on ${input.emailKey}` };
}

/**
 * Returns the catalog of email-module keys available for the Send dropdown,
 * filtered to the lead's track when possible. Falls back to all keys.
 */
export async function listFunnelEmailKeys(input: {
  leadId?: string;
}): Promise<{ keys: string[] }> {
  await assertCallerIsAdmin();
  // Import here to avoid pulling registry types into a client bundle
  const { EMAIL_REGISTRY } = await import("@/lib/funnel/email-registry");
  const all = Object.keys(EMAIL_REGISTRY);
  if (!input.leadId) return { keys: all };
  const lead = await fetchLead(input.leadId);
  if (!lead || !lead.track) return { keys: all };
  const prefix =
    lead.track === "B" ? "track-b/" : lead.track === "C" ? "track-c/" : "track-a/";
  const filtered = all.filter((k) => k.startsWith(prefix));
  return { keys: filtered.length > 0 ? filtered : all };
}

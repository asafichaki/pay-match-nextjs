"use server";

import { createSupabaseServerClient } from "@/integrations/supabase/server";

interface FailureRow {
  id: string;
  source: string;
  payload: Record<string, unknown> | null;
  retry_count: number;
}

/**
 * Retry a previously-failed lead capture by replaying the insert against the
 * appropriate primary table. On success, mark the failure row as resolved and
 * stamp resolved_at + resolved_note. On failure, bump retry_count.
 *
 * Scoped narrowly: this server action lives under /admin/leads/failed/ and only
 * touches lead_capture_failures + the three lead tables it routes to. It does
 * not call src/lib/leads/* (notify-leads territory) and does not import the
 * primary action functions (src/app/actions/*) — it replays the underlying
 * insert directly so the retry path stays decoupled from rate-limiting,
 * honeypot, and Day0-email side effects of the original action.
 */
export async function retryFailedCapture(
  failureId: string
): Promise<{ success: true; movedTo: string } | { success: false; error: string }> {
  // Cast to any: lead_capture_failures is not yet in the generated types.ts.
  // The runtime table exists (see Supabase migration log) and RLS allows
  // service-role only — we go through the SSR client which carries the
  // authenticated admin user's JWT (admin role bypasses RLS via policy).
  const supabase = (await createSupabaseServerClient()) as any;

  // 1. Read the failure row
  const { data: failure, error: readError } = await supabase
    .from("lead_capture_failures")
    .select("id, source, payload, retry_count")
    .eq("id", failureId)
    .single();
  const typedFailure = failure as FailureRow | null;

  if (readError || !typedFailure) {
    return { success: false, error: readError?.message || "Failure row not found" };
  }

  const payload = (typedFailure.payload || {}) as Record<string, any>;
  const nextRetryCount = (typedFailure.retry_count || 0) + 1;

  // 2. Dispatch by source
  let insertError: { code?: string; message: string } | null = null;
  let movedTo = "";

  if (typedFailure.source === "subscribeNewsletter") {
    const email = typeof payload.email === "string" ? payload.email.toLowerCase().trim() : "";
    if (!email) {
      insertError = { code: "BAD_PAYLOAD", message: "No email in payload" };
    } else {
      const { error } = await supabase.from("newsletter_subscribers").insert({
        email,
        source: typeof payload.source === "string" ? payload.source : "homepage",
        active: true,
        subscribed_at: new Date().toISOString(),
      });
      if (error) {
        // Duplicate email — treat as already-resolved (the lead exists)
        if (error.code === "23505") {
          insertError = null;
          movedTo = "newsletter_subscribers (already existed)";
        } else {
          insertError = { code: error.code, message: error.message };
        }
      } else {
        movedTo = "newsletter_subscribers";
      }
    }
  } else if (typedFailure.source === "submitQuizLead") {
    const insertPayload: Record<string, unknown> = {
      full_name: payload.full_name || payload.fullName || "Unknown",
      email: payload.email,
      phone: payload.phone || null,
      monthly_volume: payload.monthly_volume || payload.monthlyVolume || null,
      business_type: payload.business_type || payload.businessType || null,
      industry: payload.industry || null,
      international_payments:
        payload.international_payments || payload.internationalPayments || null,
      average_transaction: payload.average_transaction || payload.averageTransaction || null,
      integration_needs: Array.isArray(payload.priority)
        ? payload.priority.join(", ")
        : payload.integration_needs || null,
      recommended_provider: payload.recommended_provider || payload.recommendedProvider || null,
      status: "track_a",
      lead_source: "legacy_quiz",
      track: "A",
      track_variant: "default",
      funnel_state: "day0",
      volume_tier: payload.monthly_volume || payload.monthlyVolume || null,
    };
    const { error } = await supabase.from("quiz_leads").insert(insertPayload as any);
    if (error) {
      insertError = { code: error.code, message: error.message };
    } else {
      movedTo = "quiz_leads";
    }
  } else if (typedFailure.source === "submitSortingHatLead") {
    const insertPayload: Record<string, unknown> = {
      full_name: payload.full_name || payload.fullName || "Unknown",
      email: payload.email,
      phone: payload.phone || null,
      monthly_volume: payload.volume_tier || payload.volumeTier || null,
      business_type: payload.business_type || payload.businessType || null,
      industry: payload.industry || null,
      integration_needs: payload.integration_needs || null,
      status: `track_${(payload.track || "A").toString().toLowerCase()}`,
      track: payload.track || "A",
      track_variant: payload.track_variant || payload.trackVariant || "default",
      volume_tier: payload.volume_tier || payload.volumeTier || null,
      pain_point: payload.pain_point || payload.painPoint || null,
      lead_source: "sorting_hat",
      funnel_state: "day0",
    };
    const { error } = await supabase.from("quiz_leads").insert(insertPayload as any);
    if (error) {
      insertError = { code: error.code, message: error.message };
    } else {
      movedTo = "quiz_leads";
    }
  } else {
    insertError = {
      code: "UNKNOWN_SOURCE",
      message: `Unknown source: ${typedFailure.source}`,
    };
  }

  // 3. Update the failure row
  if (insertError) {
    await supabase
      .from("lead_capture_failures")
      .update({ retry_count: nextRetryCount })
      .eq("id", failureId);
    return {
      success: false,
      error: `Retry #${nextRetryCount} failed: ${insertError.message}`,
    };
  }

  await supabase
    .from("lead_capture_failures")
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_note: `auto-retry-${nextRetryCount}`,
      retry_count: nextRetryCount,
    })
    .eq("id", failureId);

  return { success: true, movedTo };
}

/**
 * Mark a failure row as resolved manually (admin reviewed it but doesn't want
 * to retry — e.g. it's a bot submission or a duplicate that landed via a
 * different path).
 */
export async function markFailureResolved(
  failureId: string,
  note: string
): Promise<{ success: true } | { success: false; error: string }> {
  // Cast to any: lead_capture_failures is not yet in the generated types.ts.
  // The runtime table exists (see Supabase migration log) and RLS allows
  // service-role only — we go through the SSR client which carries the
  // authenticated admin user's JWT (admin role bypasses RLS via policy).
  const supabase = (await createSupabaseServerClient()) as any;
  const { error } = await supabase
    .from("lead_capture_failures")
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_note: note || "manual",
    })
    .eq("id", failureId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

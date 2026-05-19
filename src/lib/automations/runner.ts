import { getAutomationsAdminClient } from "./admin-supabase";
import { evaluateTrigger } from "./triggers";
import { sendEmail } from "./actions/send-email";
import { setLeadField } from "./actions/set-lead-field";
import { postWebhook } from "./actions/webhook";
import type {
  AutomationActionResult,
  AutomationEventPayload,
  AutomationRow,
} from "./types";

/**
 * Core engine entrypoint.
 *
 * Call this from any layer that wants to fire an event (server action,
 * API route, future Supabase trigger drain). Pure orchestration —
 * persistence + error handling kept here, business logic lives in
 * triggers.ts + actions/*.
 *
 * Errors in individual automations are caught and logged to automation_runs;
 * one bad automation never blocks the others.
 */
export async function runAutomationsForEvent(
  eventType: string,
  payload: AutomationEventPayload
): Promise<{ matched: number; ran: number; failed: number }> {
  const supabase = getAutomationsAdminClient();

  const { data: candidates, error } = await supabase
    .from("automations")
    .select("*")
    .eq("enabled", true)
    .eq("trigger_type", eventType);

  if (error) {
    console.error("[automations] failed to load automations:", error.message);
    return { matched: 0, ran: 0, failed: 0 };
  }

  const rows = (candidates || []) as AutomationRow[];
  let matched = 0;
  let ran = 0;
  let failed = 0;

  for (const automation of rows) {
    const evalResult = evaluateTrigger(automation, eventType, payload);

    if (!evalResult.matched) {
      // Skipped — don't write a run row to avoid noise on cold rules.
      continue;
    }
    matched += 1;

    const actionResult = await runActionSafely(automation, payload);
    ran += 1;
    if (!actionResult.ok) failed += 1;

    await recordRun(automation, payload, actionResult);
  }

  return { matched, ran, failed };
}

async function runActionSafely(
  automation: AutomationRow,
  payload: AutomationEventPayload
): Promise<AutomationActionResult> {
  try {
    switch (automation.action_type) {
      case "send_email":
        return await sendEmail(automation, payload);
      case "set_lead_field":
        return await setLeadField(automation, payload);
      case "webhook":
        return await postWebhook(automation, payload);
      default:
        return { ok: false, error: `unknown action_type ${automation.action_type}` };
    }
  } catch (e) {
    return { ok: false, error: `action threw: ${(e as Error).message}` };
  }
}

async function recordRun(
  automation: AutomationRow,
  payload: AutomationEventPayload,
  result: AutomationActionResult
): Promise<void> {
  const supabase = getAutomationsAdminClient();

  const leadId = (payload.lead && typeof payload.lead.id === "string") ? payload.lead.id : null;

  const { error: insertError } = await supabase.from("automation_runs").insert({
    automation_id: automation.id,
    lead_id: leadId,
    status: result.ok ? "success" : "failed",
    error_message: result.ok ? null : result.error,
    trigger_payload: payload as Record<string, unknown>,
    action_result: result.ok ? result.result : { error: result.error },
  } as never);

  if (insertError) {
    console.error("[automations] failed to record run:", insertError.message);
  }

  // Bump aggregates on the parent automation. Single update; ignore failure.
  const { error: bumpError } = await supabase.rpc(
    "increment_automation_run" as never,
    { p_automation_id: automation.id } as never
  );
  if (bumpError) {
    // Fallback: two-step update if RPC missing.
    const { data: cur } = await supabase
      .from("automations")
      .select("run_count")
      .eq("id", automation.id)
      .single();
    const currentCount = (cur as { run_count?: number } | null)?.run_count ?? 0;
    await supabase
      .from("automations")
      .update({
        last_run_at: new Date().toISOString(),
        run_count: currentCount + 1,
      } as never)
      .eq("id", automation.id);
  }
}

/**
 * Run a single automation manually (admin "Test" button). Bypasses
 * enabled/trigger checks — the admin explicitly chose to fire it.
 */
export async function runAutomationManually(
  automationId: string,
  payload: AutomationEventPayload
): Promise<AutomationActionResult> {
  const supabase = getAutomationsAdminClient();
  const { data, error } = await supabase
    .from("automations")
    .select("*")
    .eq("id", automationId)
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message || "automation not found" };
  }
  const automation = data as AutomationRow;
  const result = await runActionSafely(automation, payload);
  await recordRun(automation, payload, result);
  return result;
}

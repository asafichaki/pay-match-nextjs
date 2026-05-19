import { getAutomationsAdminClient } from "../admin-supabase";
import type {
  AutomationActionResult,
  AutomationEventPayload,
  AutomationRow,
} from "../types";

const ALLOWED_FIELDS = new Set([
  "priority",
  "status",
  "assigned_to",
  "funnel_state",
  "deal_value",
  "follow_up_date",
]);

export async function setLeadField(
  automation: AutomationRow,
  payload: AutomationEventPayload
): Promise<AutomationActionResult> {
  const cfg = automation.action_config || {};
  const field = typeof cfg.field === "string" ? cfg.field : "";
  const rawValue = cfg.value;

  if (!ALLOWED_FIELDS.has(field)) {
    return { ok: false, error: `field ${field} not in allowlist` };
  }

  const leadId = payload.lead?.id;
  if (!leadId) {
    return { ok: false, error: "payload has no lead.id" };
  }

  // Coerce deal_value to number; others stay strings.
  let value: unknown = rawValue;
  if (field === "deal_value") {
    const n = Number(rawValue);
    if (!Number.isFinite(n)) {
      return { ok: false, error: `deal_value must be numeric, got ${rawValue}` };
    }
    value = n;
  }

  const supabase = getAutomationsAdminClient();
  const { error } = await supabase
    .from("quiz_leads")
    // @ts-expect-error dynamic column update
    .update({ [field]: value })
    .eq("id", leadId);

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, result: { lead_id: leadId, field, value } };
}

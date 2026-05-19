import type {
  AutomationEvaluationResult,
  AutomationEventPayload,
  AutomationRow,
} from "./types";
import { tierRank } from "./registry";

/**
 * Evaluate whether an automation should fire for a given event.
 * Pure function — no DB access.
 */
export function evaluateTrigger(
  automation: AutomationRow,
  eventType: string,
  payload: AutomationEventPayload
): AutomationEvaluationResult {
  if (automation.trigger_type !== eventType) {
    return { matched: false, reason: `trigger_type mismatch (${automation.trigger_type} vs ${eventType})` };
  }

  const cfg = automation.trigger_config || {};

  switch (automation.trigger_type) {
    case "lead_inserted": {
      const expectedSource = typeof cfg.source === "string" ? cfg.source.trim() : "";
      if (expectedSource && payload.lead?.source !== expectedSource) {
        return { matched: false, reason: `source ${payload.lead?.source} != ${expectedSource}` };
      }
      return { matched: true };
    }
    case "funnel_state_changed": {
      const target = typeof cfg.to_state === "string" ? cfg.to_state.trim() : "";
      if (target && payload.nextState !== target) {
        return { matched: false, reason: `nextState ${payload.nextState} != ${target}` };
      }
      return { matched: true };
    }
    case "volume_tier_above": {
      const min = typeof cfg.min_tier === "string" ? cfg.min_tier : "";
      const minRank = tierRank(min);
      const leadRank = tierRank(payload.lead?.monthly_volume);
      if (minRank === 0) {
        return { matched: false, reason: "min_tier not configured" };
      }
      if (leadRank < minRank) {
        return { matched: false, reason: `tier ${payload.lead?.monthly_volume} (rank ${leadRank}) < min ${min} (rank ${minRank})` };
      }
      return { matched: true };
    }
    default:
      return { matched: false, reason: `unknown trigger_type ${automation.trigger_type}` };
  }
}

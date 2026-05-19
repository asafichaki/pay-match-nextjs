/**
 * Types for the automations engine.
 *
 * The engine is intentionally narrow for MVP:
 *   - trigger_type / action_type are loose strings on the DB so we can add new
 *     ones without a migration; the runner validates them against the registry
 *     in `triggers.ts` / `actions.ts`.
 *   - trigger_config / action_config are jsonb — each handler validates its
 *     own shape at runtime.
 */

export type TriggerType =
  | "lead_inserted"
  | "funnel_state_changed"
  | "volume_tier_above";

export type ActionType = "send_email" | "set_lead_field" | "webhook";

export interface AutomationRow {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  trigger_type: string;
  trigger_config: Record<string, unknown>;
  action_type: string;
  action_config: Record<string, unknown>;
  created_at: string;
  created_by: string | null;
  last_run_at: string | null;
  run_count: number;
}

export interface AutomationRunRow {
  id: string;
  automation_id: string;
  lead_id: string | null;
  status: "success" | "failed" | "skipped";
  error_message: string | null;
  trigger_payload: Record<string, unknown> | null;
  action_result: Record<string, unknown> | null;
  ran_at: string;
}

export interface AutomationInput {
  name: string;
  description?: string | null;
  enabled?: boolean;
  trigger_type: string;
  trigger_config?: Record<string, unknown>;
  action_type: string;
  action_config?: Record<string, unknown>;
}

export interface LeadLike {
  id: string;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  monthly_volume?: string | null;
  funnel_state?: string | null;
  source?: string | null;
  [key: string]: unknown;
}

export interface AutomationEventPayload {
  lead?: LeadLike;
  previousState?: string | null;
  nextState?: string | null;
  [key: string]: unknown;
}

export type AutomationEvaluationResult =
  | { matched: true }
  | { matched: false; reason: string };

export type AutomationActionResult =
  | { ok: true; result: Record<string, unknown> }
  | { ok: false; error: string };

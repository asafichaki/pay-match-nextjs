"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/integrations/supabase/server";
import { getAutomationsAdminClient } from "@/lib/automations/admin-supabase";
import { runAutomationManually } from "@/lib/automations/runner";
import { TRIGGER_TYPES, ACTION_TYPES } from "@/lib/automations/registry";
import type {
  AutomationInput,
  AutomationRow,
  AutomationRunRow,
} from "@/lib/automations/types";

/**
 * All admin-facing server actions for the Automations panel.
 *
 * Auth: we require an admin user via the SSR client (cookie-bound), but the
 * DB writes go through the service-role client so we control exactly which
 * columns are touched. This mirrors the pattern in admin/leads/failed/actions.ts.
 */

async function assertAdmin(): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not authenticated" };
  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (!roleRow || (roleRow as { role?: string }).role !== "admin") {
    return { ok: false, error: "not authorized" };
  }
  return { ok: true, userId: user.id };
}

function validateInput(input: AutomationInput): string | null {
  if (!input.name?.trim()) return "name required";
  if (!TRIGGER_TYPES.has(input.trigger_type)) return `unknown trigger_type ${input.trigger_type}`;
  if (!ACTION_TYPES.has(input.action_type)) return `unknown action_type ${input.action_type}`;
  return null;
}

export async function listAutomations(): Promise<AutomationRow[]> {
  const auth = await assertAdmin();
  if (!auth.ok) throw new Error(auth.error);
  const supabase = getAutomationsAdminClient();
  const { data, error } = await supabase
    .from("automations")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []) as AutomationRow[];
}

export async function createAutomation(input: AutomationInput): Promise<{ id: string }> {
  const auth = await assertAdmin();
  if (!auth.ok) throw new Error(auth.error);
  const v = validateInput(input);
  if (v) throw new Error(v);

  const supabase = getAutomationsAdminClient();
  const { data, error } = await supabase
    .from("automations")
    .insert({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      enabled: input.enabled ?? true,
      trigger_type: input.trigger_type,
      trigger_config: input.trigger_config || {},
      action_type: input.action_type,
      action_config: input.action_config || {},
      created_by: auth.userId,
    } as never)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/automations");
  return { id: (data as { id: string }).id };
}

export async function updateAutomation(
  id: string,
  input: AutomationInput
): Promise<void> {
  const auth = await assertAdmin();
  if (!auth.ok) throw new Error(auth.error);
  const v = validateInput(input);
  if (v) throw new Error(v);

  const supabase = getAutomationsAdminClient();
  const { error } = await supabase
    .from("automations")
    .update({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      enabled: input.enabled ?? true,
      trigger_type: input.trigger_type,
      trigger_config: input.trigger_config || {},
      action_type: input.action_type,
      action_config: input.action_config || {},
    } as never)
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/automations");
}

export async function deleteAutomation(id: string): Promise<void> {
  const auth = await assertAdmin();
  if (!auth.ok) throw new Error(auth.error);
  const supabase = getAutomationsAdminClient();
  const { error } = await supabase.from("automations").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/automations");
}

export async function toggleAutomationEnabled(
  id: string,
  enabled: boolean
): Promise<void> {
  const auth = await assertAdmin();
  if (!auth.ok) throw new Error(auth.error);
  const supabase = getAutomationsAdminClient();
  const { error } = await supabase
    .from("automations")
    // @ts-expect-error dynamic typed table
    .update({ enabled })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/automations");
}

/**
 * Manually fire an automation against the most recent lead (or a specific one).
 * Used by the "Test now" button in the admin UI.
 */
export async function runAutomationNow(
  id: string,
  leadId?: string
): Promise<{ ok: true; result: Record<string, unknown> } | { ok: false; error: string }> {
  const auth = await assertAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };

  const supabase = getAutomationsAdminClient();
  let leadRow: Record<string, unknown> | null = null;
  if (leadId) {
    const { data } = await supabase.from("quiz_leads").select("*").eq("id", leadId).single();
    leadRow = (data as unknown as Record<string, unknown>) || null;
  } else {
    const { data } = await supabase
      .from("quiz_leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    leadRow = (data as unknown as Record<string, unknown>) || null;
  }

  if (!leadRow) {
    return { ok: false, error: "no lead found to test against" };
  }

  const result = await runAutomationManually(id, { lead: leadRow as never });
  revalidatePath("/admin/automations");
  return result;
}

export async function listRecentRuns(limit = 50): Promise<AutomationRunRow[]> {
  const auth = await assertAdmin();
  if (!auth.ok) throw new Error(auth.error);
  const supabase = getAutomationsAdminClient();
  const { data, error } = await supabase
    .from("automation_runs")
    .select("*")
    .order("ran_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data || []) as AutomationRunRow[];
}

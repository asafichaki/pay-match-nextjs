// Daily Claude API budget cap. Reads cap from live_settings.claude_daily_budget_usd.
// Each Claude call accumulates estimated cost into cron_health.cost_usd_estimate
// for the same UTC day. If today's spend > cap -> shouldRunClaude() returns false.

import { getAdminSupabase } from "@/lib/funnel/admin-supabase";

interface BudgetState {
  cap_usd: number;
  spent_usd_today: number;
  blocked: boolean;
}

export async function getBudgetState(): Promise<BudgetState> {
  const supabase = getAdminSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: settings } = await (supabase as any)
    .from("live_settings")
    .select("value")
    .eq("key", "claude_daily_budget_usd")
    .single();

  const cap = Number(settings?.value || 5);
  const startOfUtcDay = new Date();
  startOfUtcDay.setUTCHours(0, 0, 0, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("cron_health")
    .select("cost_usd_estimate")
    .gte("ran_at", startOfUtcDay.toISOString());

  const spent = (data || []).reduce(
    (sum: number, r: { cost_usd_estimate: number | null }) =>
      sum + (Number(r.cost_usd_estimate) || 0),
    0,
  );

  return { cap_usd: cap, spent_usd_today: spent, blocked: spent >= cap };
}

export async function shouldRunClaude(): Promise<boolean> {
  const s = await getBudgetState();
  return !s.blocked;
}

// Rough estimate: $3/M input, $15/M output for Claude Sonnet 4.6.
export function estimateCostUsd(inputTokens: number, outputTokens: number): number {
  return (inputTokens * 3) / 1_000_000 + (outputTokens * 15) / 1_000_000;
}

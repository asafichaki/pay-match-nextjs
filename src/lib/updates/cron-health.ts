// Cron heartbeat helper. Every cron job MUST call recordRun() exactly once.
// Pattern adapted from Renology autopilot 3-layer fail-safe + BestAI sentinel
// row pattern.

import { getAdminSupabase } from "@/lib/funnel/admin-supabase";

export interface RunReport {
  job_name: string;
  status: "success" | "partial" | "failed";
  items_processed?: number;
  items_published?: number;
  items_rejected?: number;
  errors?: Array<{ where: string; message: string }>;
  duration_ms?: number;
  cost_usd_estimate?: number;
}

export async function recordRun(report: RunReport) {
  try {
    const supabase = getAdminSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("cron_health").insert({
      job_name: report.job_name,
      status: report.status,
      items_processed: report.items_processed ?? 0,
      items_published: report.items_published ?? 0,
      items_rejected: report.items_rejected ?? 0,
      errors: report.errors ?? [],
      duration_ms: report.duration_ms ?? null,
      cost_usd_estimate: report.cost_usd_estimate ?? null,
    });
  } catch (err) {
    // Best-effort — never throw from inside the cron lifecycle
    console.error("[cron-health] recordRun failed:", err);
  }
}

export function authorizedCron(req: Request): boolean {
  const secret = process.env.UPDATES_CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  if (req.headers.get("x-vercel-cron") === "1") return true;
  return false;
}

// Lead distribution to agents — fires when a lead qualifies (Calendly booked
// OR Day 4 email opened/clicked). Matches against funnel_agents criteria
// and posts to the agent's webhook + logs to lead_distributions.
//
// Auth: Bearer token from FUNNEL_CRON_SECRET, OR Vercel cron header.
// Cron: scheduled in vercel.json to run hourly.

import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/funnel/admin-supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AgentRow {
  id: string;
  name: string;
  email: string | null;
  webhook_url: string | null;
  active: boolean;
  criteria_track: string[] | null;
  criteria_volume_tier: string[] | null;
  price_per_lead: number | null;
}

interface LeadRow {
  id: string;
  email: string;
  full_name: string | null;
  track: string | null;
  pain_point: string | null;
  volume_tier: string | null;
  business_type: string | null;
  funnel_state: string | null;
  email_state: Record<string, Record<string, unknown>> | null;
  calendly_booked_at: string | null;
  created_at: string;
}

function authorized(req: NextRequest): boolean {
  const secret = process.env.FUNNEL_CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  if (req.headers.get("x-vercel-cron") === "1") return true;
  return false;
}

function leadQualifies(lead: LeadRow): boolean {
  if (lead.calendly_booked_at) return true;
  const state = lead.email_state || {};
  // Day 4 email opened or clicked counts as qualified
  const day4 = state.day4 as Record<string, unknown> | undefined;
  if (day4 && (day4.opened || day4.clicked)) return true;
  // Day 1 click also counts
  const day1 = state.day1 as Record<string, unknown> | undefined;
  if (day1 && day1.clicked) return true;
  return false;
}

function matches(agent: AgentRow, lead: LeadRow): boolean {
  if (!agent.active) return false;
  if (agent.criteria_track && agent.criteria_track.length > 0) {
    if (!lead.track || !agent.criteria_track.includes(lead.track)) return false;
  }
  if (agent.criteria_volume_tier && agent.criteria_volume_tier.length > 0) {
    if (!lead.volume_tier || !agent.criteria_volume_tier.includes(lead.volume_tier)) return false;
  }
  return true;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let supabase;
  try {
    supabase = getAdminSupabase();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  // Pull qualified leads
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: leads } = await (supabase as any)
    .from("quiz_leads")
    .select(
      "id, email, full_name, track, pain_point, volume_tier, business_type, funnel_state, email_state, calendly_booked_at, created_at"
    )
    .not("track", "is", null)
    .limit(500);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: agents } = await (supabase as any)
    .from("funnel_agents")
    .select("*")
    .eq("active", true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from("lead_distributions")
    .select("lead_id, agent_name");

  const distributedSet = new Set<string>(
    (existing || []).map((d: { lead_id: string; agent_name: string }) => `${d.lead_id}|${d.agent_name}`)
  );

  const results: Array<{ leadId: string; agent: string; action: string; detail?: string }> = [];

  for (const lead of (leads || []) as LeadRow[]) {
    if (!leadQualifies(lead)) continue;
    for (const agent of (agents || []) as AgentRow[]) {
      const key = `${lead.id}|${agent.name}`;
      if (distributedSet.has(key)) continue;
      if (!matches(agent, lead)) continue;

      let deliveryStatus = "pending";
      let deliveryDetail = "";

      // Webhook delivery
      if (agent.webhook_url) {
        try {
          const res = await fetch(agent.webhook_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              source: "mypayadvisor",
              lead: {
                id: lead.id,
                full_name: lead.full_name,
                email: lead.email,
                track: lead.track,
                pain_point: lead.pain_point,
                volume_tier: lead.volume_tier,
                business_type: lead.business_type,
                created_at: lead.created_at,
                calendly_booked: !!lead.calendly_booked_at,
              },
              price: agent.price_per_lead || null,
            }),
          });
          deliveryStatus = res.ok ? "delivered" : "failed";
          deliveryDetail = `webhook ${res.status}`;
        } catch (err) {
          deliveryStatus = "failed";
          deliveryDetail = `webhook error: ${(err as Error).message}`;
        }
      } else if (agent.email) {
        // CSV digest path — for now just log "queued for digest"
        deliveryStatus = "queued";
        deliveryDetail = "in CSV digest queue";
      } else {
        deliveryStatus = "skipped";
        deliveryDetail = "no delivery method";
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("lead_distributions").insert({
        lead_id: lead.id,
        agent_name: agent.name,
        delivery_method: agent.webhook_url ? "webhook" : agent.email ? "csv_digest" : "none",
        delivery_status: deliveryStatus,
        delivered_at: deliveryStatus === "delivered" ? new Date().toISOString() : null,
        price: agent.price_per_lead || null,
      });

      distributedSet.add(key);
      results.push({ leadId: lead.id, agent: agent.name, action: deliveryStatus, detail: deliveryDetail });
    }
  }

  return NextResponse.json({ ok: true, processed: results.length, results });
}

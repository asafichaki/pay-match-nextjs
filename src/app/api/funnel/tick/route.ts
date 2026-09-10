// Funnel v4.1 tick — advances leads when an authorized scheduler invokes it
// through the email sequence based on (track, current_state, age, engagement).
//
// Auth: Bearer token from `FUNNEL_CRON_SECRET` env var.

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getAdminSupabase } from "@/lib/funnel/admin-supabase";
import {
  chooseEmail,
  expectedStateForAge,
} from "@/lib/funnel/email-dispatch";
import { getEmail } from "@/lib/funnel/email-registry";
import {
  FUNNEL_FROM,
  FUNNEL_REPLY_TO,
  CALENDLY_URL,
  SHORTLIST_URL_BASE,
  AFFILIATE_URL_BASE,
} from "@/lib/funnel/resend-client";
import type {
  Track,
  TrackVariant,
  PainPoint,
  VolumeTier,
  BusinessType,
  FunnelState,
} from "@/lib/funnel/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

interface LeadRow {
  id: string;
  email: string;
  full_name: string;
  track: string | null;
  track_variant: string | null;
  pain_point: string | null;
  volume_tier: string | null;
  business_type: string | null;
  funnel_state: string | null;
  email_state: Record<string, unknown> | null;
  calendly_booked_at: string | null;
  created_at: string;
  status: string | null;
  tags: string[] | null;
}

function authorized(req: NextRequest): boolean {
  const secret = process.env.FUNNEL_CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let supabase, resend;
  try {
    supabase = getAdminSupabase();
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY missing");
    resend = new Resend(process.env.RESEND_API_KEY);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: leads, error } = await (supabase as any)
    .from("quiz_leads")
    .select(
      "id, email, full_name, track, track_variant, pain_point, volume_tier, business_type, funnel_state, email_state, calendly_booked_at, created_at, status, tags"
    )
    .not("track", "is", null)
    .not("funnel_state", "in", "(complete,unsubscribed,booked)")
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: Array<{ id: string; action: string; detail?: string }> = [];

  for (const lead of (leads || []) as unknown as LeadRow[]) {
    try {
      const excluded = [lead.status, ...(Array.isArray(lead.tags) ? lead.tags : [])]
        .some((value) => ["test", "spam", "invalid"].includes(String(value).toLowerCase()));
      if (excluded) {
        results.push({ id: lead.id, action: "excluded" });
        continue;
      }
      const created = new Date(lead.created_at).getTime();
      const ageDays = (Date.now() - created) / (1000 * 60 * 60 * 24);
      const expectedState = expectedStateForAge(ageDays);
      const currentState = (lead.funnel_state || "day0") as FunnelState;

      // If lead has booked, jump to complete and stop
      if (lead.calendly_booked_at) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("quiz_leads")
          .update({ funnel_state: "booked" })
          .eq("id", lead.id);
        results.push({ id: lead.id, action: "marked_booked" });
        continue;
      }

      // If we are not yet at the next state due time, skip
      if (expectedState && stateOrder(expectedState) <= stateOrder(currentState)) {
        results.push({ id: lead.id, action: "wait", detail: `${currentState} -> ${expectedState}` });
        continue;
      }

      // Day 13 fires only if no click + no booking
      if (currentState === "day9" && expectedState === "day13") {
        const engagement = lead.email_state || {};
        const hasClick = Object.values(engagement).some(
          (v) => typeof v === "object" && v !== null && (v as Record<string, unknown>).clicked
        );
        if (hasClick) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from("quiz_leads")
            .update({ funnel_state: "day17" })
            .eq("id", lead.id);
          results.push({ id: lead.id, action: "skip_day13_click", detail: "had click, jumped to day17" });
          continue;
        }
      }

      const choice = chooseEmail({
        track: (lead.track || "A") as Track,
        trackVariant: (lead.track_variant || "default") as TrackVariant,
        painPoint: (lead.pain_point || "approval_rates") as PainPoint,
        volumeTier: (lead.volume_tier || "50k_to_250k") as VolumeTier,
        businessType: (lead.business_type || "physical_goods") as BusinessType,
        funnelState: currentState,
        name: lead.full_name?.split(" ")[0] || "there",
        shortlistUrl: SHORTLIST_URL_BASE,
        calendlyUrl: CALENDLY_URL,
        affiliateUrl: AFFILIATE_URL_BASE,
      });

      if (!choice.emailKey) {
        results.push({ id: lead.id, action: "no_email" });
        continue;
      }

      const mod = getEmail(choice.emailKey);
      if (!mod) {
        results.push({ id: lead.id, action: "error", detail: `email key not found: ${choice.emailKey}` });
        continue;
      }

      const subject = mod.subject(choice.props);
      const react = mod.default(choice.props);

      const delivery = await resend.emails.send({
        from: FUNNEL_FROM,
        replyTo: FUNNEL_REPLY_TO,
        to: lead.email,
        subject,
        react,
        tags: [
          { name: "lead_id", value: lead.id },
          { name: "funnel_state", value: currentState },
        ],
        headers: {
          "X-Funnel-Track": lead.track || "",
          "X-Funnel-State": currentState,
          "X-Funnel-Lead-Id": lead.id,
        },
      }, { idempotencyKey: `funnel/${lead.id}/${currentState}` });
      if (delivery.error || !delivery.data?.id) {
        throw new Error(`Email not accepted: ${delivery.error?.message || "missing email id"}`);
      }

      // Advance only after provider acceptance. The signed webhook owns
      // email_state so this stale snapshot cannot erase delivery/click events.
      const newState = choice.nextState;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: advanced, error: advanceError } = await (supabase as any)
        .from("quiz_leads")
        .update({
          funnel_state: newState,
        })
        .eq("id", lead.id)
        .eq("funnel_state", currentState)
        .select("id");
      if (advanceError || !advanced?.length) {
        results.push({ id: lead.id, action: "state_update_failed", detail: "Email accepted; state not advanced" });
        continue;
      }

      results.push({ id: lead.id, action: "sent", detail: `${currentState} -> ${newState}` });
    } catch (err) {
      console.error("[funnel-tick] lead error", lead.id, err);
      results.push({ id: lead.id, action: "error", detail: (err as Error).message });
    }
  }

  const ok = !results.some((result) => ["error", "state_update_failed"].includes(result.action));
  return NextResponse.json({ ok, processed: results.length, results }, { status: ok ? 200 : 500 });
}

function stateOrder(s: FunnelState): number {
  const order: Record<FunnelState, number> = {
    day0: 0,
    day1: 1,
    day4: 2,
    day9: 3,
    day13: 4,
    day17: 5,
    complete: 6,
    booked: 6,
    unsubscribed: 7,
  };
  return order[s] ?? 0;
}

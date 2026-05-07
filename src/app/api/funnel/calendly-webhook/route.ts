// Calendly webhook — fires when a merchant books a call with Barak.
// We match by invitee.email -> quiz_leads.email and mark the lead booked.

import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/funnel/admin-supabase";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CalendlyPayload {
  event: string;
  payload: {
    event?: { uri?: string };
    invitee?: { email?: string; name?: string; uri?: string };
    scheduled_event?: { start_time?: string; end_time?: string };
    tracking?: { utm_source?: string; utm_campaign?: string; utm_content?: string };
  };
}

function verifyCalendly(req: NextRequest, raw: string): boolean {
  const secret = process.env.CALENDLY_WEBHOOK_SECRET;
  if (!secret) return true; // skip in dev
  const sig = req.headers.get("calendly-webhook-signature");
  if (!sig) return false;
  // Calendly format: t=timestamp,v1=hmac
  const parts = Object.fromEntries(
    sig.split(",").map((p) => p.trim().split("="))
  );
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${t}.${raw}`)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verifyCalendly(req, raw)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let body: CalendlyPayload;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const inviteeEmail = body.payload?.invitee?.email?.toLowerCase();
  if (!inviteeEmail) {
    return NextResponse.json({ ok: true, ignored: "no invitee email" });
  }

  let supabase;
  try {
    supabase = getAdminSupabase();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  if (body.event === "invitee.created") {
    const startTime = body.payload?.scheduled_event?.start_time;
    const inviteeUri = body.payload?.invitee?.uri || null;

    // Match by email — find the most recent matching lead
    const { data: lead } = await supabase
      .from("quiz_leads")
      .select("id")
      .ilike("email", inviteeEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (lead?.id) {
      await supabase
        .from("quiz_leads")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({
          calendly_booking_id: inviteeUri,
          calendly_booked_at: startTime || new Date().toISOString(),
          funnel_state: "booked",
        } as any)
        .eq("id", lead.id);
      return NextResponse.json({ ok: true, leadId: lead.id, action: "booked" });
    }

    return NextResponse.json({ ok: true, action: "no_match", email: inviteeEmail });
  }

  if (body.event === "invitee.canceled") {
    await supabase
      .from("quiz_leads")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ calendly_booked_at: null, calendly_booking_id: null } as any)
      .ilike("email", inviteeEmail);
    return NextResponse.json({ ok: true, action: "canceled" });
  }

  return NextResponse.json({ ok: true, ignored: body.event });
}

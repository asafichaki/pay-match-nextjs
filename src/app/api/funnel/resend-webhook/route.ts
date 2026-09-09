// Resend webhook handler — captures email.opened, email.clicked, email.bounced
// for funnel leads, by reading the X-Funnel-Lead-Id custom header we set when
// we send each email.

import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/funnel/admin-supabase";
import { getResend } from "@/lib/funnel/resend-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ResendEvent {
  type: string;
  data: {
    email_id?: string;
    headers?: Array<{ name: string; value: string }>;
    to?: string[];
    subject?: string;
    tags?: Record<string, string>;
  };
}

function verifySignature(payload: string, headers: Headers): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return false;
  try {
    getResend().webhooks.verify({
      payload,
      webhookSecret: secret,
      headers: {
        id: headers.get("svix-id") || "",
        timestamp: headers.get("svix-timestamp") || "",
        signature: headers.get("svix-signature") || "",
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!process.env.RESEND_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }
  if (!verifySignature(raw, req.headers)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  // Resend sends events like: email.sent, email.delivered, email.opened, email.clicked, email.bounced
  const headers = event.data?.headers || [];
  const leadIdHeader = headers.find(
    (h) => h.name.toLowerCase() === "x-funnel-lead-id"
  );
  const stateHeader = headers.find(
    (h) => h.name.toLowerCase() === "x-funnel-state"
  );
  const leadId = event.data?.tags?.lead_id || leadIdHeader?.value;
  const state = event.data?.tags?.funnel_state || stateHeader?.value || "unknown";

  if (!leadId) {
    return NextResponse.json({ ok: true, ignored: "no lead id" });
  }

  let supabase;
  try {
    supabase = getAdminSupabase();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  const { data: leadRaw } = await supabase
    .from("quiz_leads")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .select("email_state" as any)
    .eq("id", leadId)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lead = leadRaw as any;
  const current = (lead?.email_state || {}) as Record<string, Record<string, unknown>>;
  const stateBucket = current[state] || {};

  const action = event.type.replace("email.", ""); // sent | opened | clicked | bounced | delivered

  current[state] = {
    ...stateBucket,
    [`${action}_at`]: new Date().toISOString(),
    [action]: true,
  };

  const { error: updateError } = await supabase
    .from("quiz_leads")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ email_state: current } as any)
    .eq("id", leadId);

  if (updateError) {
    return NextResponse.json({ error: "delivery state could not be saved" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, leadId, state, action });
}

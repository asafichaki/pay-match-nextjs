// Resend webhook handler — captures email.opened, email.clicked, email.bounced
// for funnel leads, by reading the X-Funnel-Lead-Id custom header we set when
// we send each email.

import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/funnel/admin-supabase";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ResendEvent {
  type: string;
  data: {
    email_id?: string;
    headers?: Array<{ name: string; value: string }>;
    to?: string[];
    subject?: string;
  };
}

function verifySignature(payload: string, signature: string | null): boolean {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return true; // skip verify if not configured (dev)
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature.replace(/^sha256=/, ""))
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("svix-signature") || req.headers.get("resend-signature");
  if (!verifySignature(raw, sig)) {
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
  const leadId = leadIdHeader?.value;
  const state = stateHeader?.value || "unknown";

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

  await supabase
    .from("quiz_leads")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update({ email_state: current } as any)
    .eq("id", leadId);

  return NextResponse.json({ ok: true, leadId, state, action });
}

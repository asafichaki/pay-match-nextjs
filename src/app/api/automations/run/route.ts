import { NextRequest, NextResponse } from "next/server";
import { runAutomationsForEvent } from "@/lib/automations/runner";

/**
 * Internal endpoint to fire automations from any layer that can't import the
 * runner directly (e.g. cross-package callers, future Supabase webhook drain).
 *
 * Auth: shared secret in `AUTOMATIONS_INTERNAL_TOKEN`. If unset, the endpoint
 * refuses all requests (fail-closed). This is intentionally NOT public.
 *
 * Body shape:
 *   { event_type: "lead_inserted", payload: { lead: {...} } }
 */
export async function POST(req: NextRequest) {
  const expected = process.env.AUTOMATIONS_INTERNAL_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: "automations engine not configured" },
      { status: 503 }
    );
  }
  const got = req.headers.get("x-automations-token");
  if (got !== expected) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: { event_type?: string; payload?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const eventType = body.event_type;
  if (typeof eventType !== "string") {
    return NextResponse.json({ error: "event_type required" }, { status: 400 });
  }

  const result = await runAutomationsForEvent(
    eventType,
    (body.payload || {}) as Parameters<typeof runAutomationsForEvent>[1]
  );
  return NextResponse.json({ ok: true, ...result });
}

export const runtime = "nodejs";

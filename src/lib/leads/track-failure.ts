import "server-only";

import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { headers } from "next/headers";
import { notifyLeadFailure } from "@/lib/leads/notify-lead-failure";

/**
 * Defensive lead-capture failure tracker.
 *
 * Whenever a primary lead-write to Supabase fails (newsletter, quiz, sorting hat, etc.),
 * we mirror the failed payload into `lead_capture_failures` so the lead is never lost
 * silently. This is the LAYER 2 fallback of the 3-layer pattern.
 *
 * Hard contract:
 *   - This function MUST NOT throw. Any error here is swallowed + console.error'd.
 *     A failure in the failure-tracker can never bubble up to the caller.
 *   - Uses the service-role key directly (not the cookie-bearing server client) so
 *     it bypasses RLS. RLS on lead_capture_failures denies all anon/authenticated
 *     access; only the service role can write.
 *   - server-only import ensures this can never be bundled into client code.
 */

export interface TrackLeadFailureArgs {
  source: string; // e.g. "subscribeNewsletter", "submitQuizLead", "submitSortingHatLead"
  payload: Record<string, unknown>;
  error_code?: string | null;
  error_message?: string | null;
  page_url?: string | null;
}

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function scrubPayload(p: Record<string, unknown>): Record<string, unknown> {
  // Strip internal/honeypot fields before persisting
  const { honeypot, ...rest } = p as { honeypot?: unknown; [k: string]: unknown };
  void honeypot;
  return rest;
}

export async function trackLeadFailure(args: TrackLeadFailureArgs): Promise<void> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      console.error("[trackLeadFailure] missing SUPABASE_URL or SERVICE_ROLE_KEY env, failure NOT persisted", {
        source: args.source,
      });
      return;
    }

    // Best-effort: pull UA + IP off the request headers. If we're not inside a
    // request context this will throw — we catch it and continue without them.
    let user_agent: string | null = null;
    let ip_hash: string | null = null;
    try {
      const h = await headers();
      user_agent = h.get("user-agent");
      const fwd = h.get("x-forwarded-for");
      const rawIp = fwd?.split(",")[0]?.trim() || null;
      if (rawIp && rawIp !== "unknown") ip_hash = sha256(rawIp);
    } catch {
      // not in request context; that's fine
    }

    const admin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: writeErr } = await admin.from("lead_capture_failures").insert({
      source: args.source,
      payload: scrubPayload(args.payload),
      error_code: args.error_code ?? null,
      error_message: args.error_message ?? null,
      user_agent,
      ip_hash,
      page_url: args.page_url ?? null,
    });

    if (writeErr) {
      // Last-ditch — log only. Do not throw.
      console.error("[trackLeadFailure] FALLBACK WRITE FAILED, lead may be lost", {
        source: args.source,
        write_error: writeErr,
        payload_email: (args.payload as { email?: unknown }).email,
      });
    }

    // Always fire the CRITICAL admin email (fire-and-forget, never awaited for
    // critical-path return). This runs whether or not the failures-row write
    // succeeded — if the row write failed, the email is the only signal Assaf
    // gets that a lead is at risk.
    notifyLeadFailure({
      source: args.source,
      payload: args.payload,
      error_code: args.error_code,
      error_message: args.error_message,
      page_url: args.page_url,
    }).catch((err) => {
      console.error("[trackLeadFailure] notifyLeadFailure threw (swallowed)", { err });
    });
  } catch (err) {
    // Absolute last resort. Never let this throw upward.
    console.error("[trackLeadFailure] unexpected exception (swallowed)", {
      err,
      source: args.source,
      payload_email: (args.payload as { email?: unknown })?.email,
    });
  }
}

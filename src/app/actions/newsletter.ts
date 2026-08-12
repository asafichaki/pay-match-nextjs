"use server";

import { createSupabaseServerClient } from "@/integrations/supabase/server";
import { getAdminSupabase } from "@/lib/funnel/admin-supabase";
import { trackLeadFailure } from "@/lib/leads/track-failure";
import { notifyNewLead, type LeadSource } from "@/lib/leads/notify-new-lead";
import {
  ATTRIBUTION_COOKIE,
  attributionColumns,
  parseAttributionCookie,
} from "@/lib/attribution";
import { z } from "zod";
import { headers, cookies } from "next/headers";

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address").max(320),
  source: z.enum(["homepage", "footer", "exit_intent"]).default("homepage"),
  honeypot: z.string().max(0).optional(),
});

/** How long after signing up the optional details step stays open. */
const ENRICH_WINDOW_MS = 60 * 60 * 1000;

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxRequests = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

export async function subscribeNewsletter(formData: {
  email: string;
  source?: string;
  honeypot?: string;
}) {
  try {
    // Rate limiting
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(ip)) {
      return { success: false, error: "Too many requests. Please try again later." };
    }

    // Honeypot check
    if (formData.honeypot) {
      return { success: true };
    }

    // Validate
    const result = newsletterSchema.safeParse(formData);
    if (!result.success) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const data = result.data;
    const supabase = await createSupabaseServerClient();

    // First-touch attribution: where this visitor actually came from. The
    // cookie is written for every visitor on their first page load, so it was
    // already there on every signup — this path just used to discard it, which
    // is why these leads read as "Direct / unknown" on the sheet.
    const cookieStore = await cookies();
    const attribution = attributionColumns(
      parseAttributionCookie(cookieStore.get(ATTRIBUTION_COOKIE)?.value),
      headersList.get("referer"),
    );

    // Plain INSERT — RLS allows anon INSERT but not UPDATE, so upsert is blocked.
    // Duplicate emails surface as Postgres 23505 (unique violation), treated as
    // silent success below since the user is already on the list.
    // Bare on purpose: no .select(). anon holds INSERT and nothing else here,
    // so RETURNING would fail the whole write with 42501 and lose the signup.
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email: data.email.toLowerCase().trim(),
        source: data.source,
        active: true,
        subscribed_at: new Date().toISOString(),
        ...attribution,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

    if (error) {
      // Duplicate email — already subscribed. Treat as success, and still hand
      // back the id so someone re-submitting in a second tab can complete the
      // optional step. `enrichableSubscriberId` refuses anything already
      // enriched or older than the window, so an old row simply returns null
      // and the caller shows the plain thank-you.
      if (error.code === "23505") {
        return {
          success: true,
          subscriberId: await enrichableSubscriberId(data.email.toLowerCase().trim()),
        };
      }
      // LAYER 1: real log line
      console.error("[subscribeNewsletter] insert failed", {
        error,
        payload_email: data.email,
        source: data.source,
      });
      // LAYER 2: mirror to lead_capture_failures so the lead is not lost
      await trackLeadFailure({
        source: "subscribeNewsletter",
        payload: {
          email: data.email.toLowerCase().trim(),
          source: data.source,
        },
        error_code: error.code,
        error_message: error.message,
      });
      // LAYER 3: honest response to caller
      return { success: false, error: "We couldn't save your details. Please try again." };
    }

    // Fire-and-forget admin notification — never awaited, never throws
    const notifySource: LeadSource =
      data.source === "exit_intent"
        ? "exit_intent"
        : data.source === "footer"
          ? "newsletter"
          : "newsletter";
    notifyNewLead({
      source: notifySource,
      lead: { email: data.email.toLowerCase().trim() },
      page_url: headersList.get("referer") || undefined,
    }).catch((err) => {
      console.error("[subscribeNewsletter] notify failed (swallowed)", err);
    });

    return {
      success: true,
      // Null if the lookup fails, in which case the optional step simply
      // doesn't appear. The signup is already saved either way.
      subscriberId: await enrichableSubscriberId(data.email.toLowerCase().trim()),
    };
  } catch (error) {
    console.error("[subscribeNewsletter] unexpected error", error);
    // Best-effort: still try to mirror what we have
    await trackLeadFailure({
      source: "subscribeNewsletter",
      payload: {
        email: typeof formData?.email === "string" ? formData.email : "unknown",
        source: typeof formData?.source === "string" ? formData.source : "homepage",
      },
      error_code: "UNEXPECTED",
      error_message: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * Id of the row we just wrote, looked up rather than returned.
 *
 * `newsletter_subscribers` grants anon INSERT and nothing else, so adding
 * .select() to the insert would make PostgREST emit INSERT ... RETURNING, which
 * needs SELECT, and Postgres would reject the whole write with 42501 — losing
 * the signup entirely. Same trap as quiz_leads. The insert stays bare and the
 * id is fetched here, off the critical path, through the service-role client.
 *
 * Returns null unless the row is genuinely still enrichable, so a stale or
 * already-completed row can never be handed to the client as a live target.
 */
async function enrichableSubscriberId(email: string): Promise<string | null> {
  try {
    const cutoff = new Date(Date.now() - ENRICH_WINDOW_MS).toISOString();
    const { data, error } = await getAdminSupabase()
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", email)
      .is("enriched_at", null)
      .gte("subscribed_at", cutoff)
      .order("subscribed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return (data as { id: string }).id;
  } catch (err) {
    console.error("[enrichableSubscriberId] lookup failed (swallowed)", err);
    return null;
  }
}

const enrichSchema = z.object({
  subscriberId: z.string().uuid(),
  phone: z.string().max(40).optional(),
  companyName: z.string().max(160).optional(),
  currentProvider: z.string().max(120).optional(),
});

export interface EnrichNewsletterPayload {
  subscriberId: string;
  phone?: string;
  companyName?: string;
  currentProvider?: string;
}

/**
 * Optional second step of the popup. The subscriber row already exists by the
 * time this runs, so a failure here is cosmetic: the lead is never at risk and
 * the caller shows no error, it just closes.
 *
 * Write-once by design. `enriched_at IS NULL` in the update filter means a
 * leaked id cannot be replayed to overwrite what the merchant told us, and the
 * one-hour window means an old id is useless even before that.
 *
 * Mirrors enrichSortingHatLead in src/app/actions/sorting-hat.ts. Kept as two
 * functions rather than one generic helper because they write to different
 * tables under different policies, and collapsing them would hide exactly the
 * detail that matters.
 */
export async function enrichNewsletterLead(input: EnrichNewsletterPayload) {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(`enrich:${ip}`, 10)) {
      return { success: false as const };
    }

    const parsed = enrichSchema.safeParse(input);
    if (!parsed.success) return { success: false as const };

    const phone = parsed.data.phone?.trim() || null;
    const companyName = parsed.data.companyName?.trim() || null;
    const currentProvider = parsed.data.currentProvider?.trim() || null;
    if (!phone && !companyName && !currentProvider) {
      return { success: false as const };
    }

    // Service role: anon has an INSERT policy on newsletter_subscribers and
    // nothing else, so an UPDATE through the request-scoped client is silently
    // a no-op.
    const cutoff = new Date(Date.now() - ENRICH_WINDOW_MS).toISOString();

    const { data: rows, error } = await getAdminSupabase()
      .from("newsletter_subscribers")
      .update({
        ...(phone ? { phone } : {}),
        ...(companyName ? { company_name: companyName } : {}),
        ...(currentProvider ? { current_provider: currentProvider } : {}),
        enriched_at: new Date().toISOString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .eq("id", parsed.data.subscriberId)
      .is("enriched_at", null)
      .gte("subscribed_at", cutoff)
      .select("id, email, source");

    if (error || !rows || rows.length === 0) {
      if (error) console.error("[enrichNewsletterLead] update failed", error);
      return { success: false as const };
    }

    // Second notification, sent only when they actually filled this in. A phone
    // number turns an email-only signup into someone Barak can call, and that
    // is worth its own email rather than a silent row update.
    const row = rows[0] as unknown as Record<string, unknown>;
    const src = String(row.source || "");
    notifyNewLead({
      source: src === "exit_intent" ? "exit_intent" : "newsletter",
      lead: {
        email: String(row.email || ""),
        phone,
        company: companyName,
        current_provider: currentProvider,
      },
      subject_note: "details added",
    }).catch((err) => {
      console.error("[enrichNewsletterLead] notify failed (swallowed)", err);
    });

    return { success: true as const };
  } catch (err) {
    console.error("[enrichNewsletterLead] unexpected error", err);
    return { success: false as const };
  }
}

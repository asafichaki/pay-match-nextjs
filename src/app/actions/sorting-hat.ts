"use server";

import { z } from "zod";
import { headers, cookies } from "next/headers";
import { createSupabaseServerClient } from "@/integrations/supabase/server";
import { getAdminSupabase } from "@/lib/funnel/admin-supabase";
import {
  ATTRIBUTION_COOKIE,
  attributionColumns,
  parseAttributionCookie,
} from "@/lib/attribution";
import { trackLeadFailure } from "@/lib/leads/track-failure";
import { notifyNewLead } from "@/lib/leads/notify-new-lead";
import { routeTrack } from "@/lib/funnel/track-router";
import {
  PAIN_POINT_SHORT,
  VOLUME_TIER_LABELS,
  BUSINESS_TYPE_LABELS,
  type SortingHatPayload,
  type SortingHatEnrichPayload,
} from "@/lib/funnel/types";
import {
  getResend,
  FUNNEL_FROM,
  FUNNEL_REPLY_TO,
  CALENDLY_URL,
  SHORTLIST_URL_BASE,
} from "@/lib/funnel/resend-client";
import { getEmail } from "@/lib/funnel/email-registry";
import { isValidPhone, normalizePhone, PHONE_INVALID_MESSAGE } from "@/lib/phone";

const schema = z.object({
  fullName: z.string().min(1).max(120),
  email: z.string().email().max(320),
  // Required since 2026-08-29. It used to be collected on an optional step
  // AFTER the lead was saved, under the label "only if you'd rather talk",
  // and the result was 9 leads with 0 phone numbers. Validated here and not
  // only in the browser, because a client-side check is a suggestion to
  // anyone posting to the action directly.
  phone: z
    .string()
    .min(1)
    .max(40)
    .refine(isValidPhone, { message: PHONE_INVALID_MESSAGE }),
  businessType: z.enum([
    "physical_goods",
    "saas_digital",
    "subscription",
    "retail_inperson",
    "restaurant_hospitality",
    "field_services",
    "financial_services",
    "health_wellness",
    "gaming_entertainment",
    "other",
  ]),
  volumeTier: z.enum([
    "under_50k",
    "50k_to_250k",
    "250k_to_1m",
    "over_1m",
    "pre_launch",
  ]),
  painPoint: z.enum([
    "funds_frozen",
    "approval_rates",
    "long_onboarding",
    "new_markets",
    "failed_recurring",
    "in_person_costs",
    "needs_approval",
  ]),
  honeypot: z.string().max(0).optional(),
});

const rateLimit = new Map<string, { count: number; resetAt: number }>();
function checkRate(ip: string, max = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

export async function submitSortingHatLead(input: SortingHatPayload) {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRate(ip)) {
      return { success: false as const, error: "Too many requests. Please try again in a minute." };
    }

    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      return { success: false as const, error: "Please check your inputs and try again." };
    }
    const data = parsed.data;
    if (data.honeypot) {
      // bot — silently succeed without doing anything destructive
      return { success: true as const, thankYouSlug: "a" as const, leadId: null };
    }

    const route = routeTrack(data.businessType, data.painPoint);

    const supabase = await createSupabaseServerClient();

    // First-touch attribution: where this visitor actually came from.
    const cookieStore = await cookies();
    const attribution = attributionColumns(
      parseAttributionCookie(cookieStore.get(ATTRIBUTION_COOKIE)?.value),
      headersList.get("referer"),
    );

    // Insert with a JSON-encoded "integration_needs" to carry funnel metadata
    // even before the SQL migration runs. Once migration applies, the
    // dedicated columns also populate and the cron reads them directly.
    const funnelMeta = {
      track: route.track,
      track_variant: route.trackVariant,
      volume_tier: data.volumeTier,
      pain_point: data.painPoint,
      business_type: data.businessType,
      funnel_state: "day0",
      lead_source: "sorting_hat",
    };

    // Build insert payload using both legacy and new columns. Supabase will
    // ignore unknown columns gracefully if the migration has not yet run on
    // the production project (we handle that path silently below).
    const insertPayload: Record<string, unknown> = {
      full_name: data.fullName,
      email: data.email,
      phone: normalizePhone(data.phone),
      monthly_volume: data.volumeTier,
      business_type: data.businessType,
      industry: BUSINESS_TYPE_LABELS[data.businessType],
      integration_needs: JSON.stringify(funnelMeta),
      status: `track_${route.track.toLowerCase()}`,
      // The new columns from the migration — included optimistically
      track: route.track,
      track_variant: route.trackVariant,
      volume_tier: data.volumeTier,
      pain_point: data.painPoint,
      lead_source: "sorting_hat",
      // `source` is the canonical attribution column read across the admin UI;
      // keep it in lockstep with lead_source so it is never null again.
      source: "sorting_hat",
      funnel_state: "day0",
      ...attribution,
    };

    // Bare insert, no RETURNING. `quiz_leads` grants anon INSERT but not
    // SELECT, so adding .select() here makes Postgres reject the whole write
    // with 42501 and no lead is captured at all. The id is fetched separately
    // below, off the critical path.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let { error } = await supabase.from("quiz_leads").insert(insertPayload as any);

    // If the new columns do not yet exist (migration not applied), retry
    // with the legacy-only payload so leads still capture in production.
    if (error && /column .* does not exist/i.test(error.message)) {
      const legacyPayload: Record<string, unknown> = {
        full_name: data.fullName,
        email: data.email,
        phone: normalizePhone(data.phone),
        monthly_volume: data.volumeTier,
        business_type: data.businessType,
        industry: BUSINESS_TYPE_LABELS[data.businessType],
        integration_needs: JSON.stringify(funnelMeta),
        status: `track_${route.track.toLowerCase()}`,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const retry = await supabase.from("quiz_leads").insert(legacyPayload as any);
      error = retry.error;
    }

    if (error) {
      // LAYER 1
      console.error("[submitSortingHatLead] insert failed", {
        error,
        payload_email: data.email,
      });
      // LAYER 2: mirror so the lead is not lost
      await trackLeadFailure({
        source: "submitSortingHatLead",
        payload: {
          full_name: data.fullName,
          email: data.email,
          phone: normalizePhone(data.phone),
          business_type: data.businessType,
          volume_tier: data.volumeTier,
          pain_point: data.painPoint,
          track: route.track,
          track_variant: route.trackVariant,
        },
        error_code: error.code,
        error_message: error.message,
      });
      // LAYER 3
      return { success: false as const, error: "We couldn't save your details. Please try again." };
    }

    // Fire admin notification — fire-and-forget, never awaited
    notifyNewLead({
      source: "sorting_hat",
      lead: {
        email: data.email,
        name: data.fullName,
        // The whole point of making this field required on 2026-08-29 was that
        // Barak reads the alert and calls. It was saved to the row but never
        // handed to the notifier, so the subject and the tel: link stayed
        // empty and the first lead with a number looked like the nine without.
        phone: normalizePhone(data.phone),
        business_type: BUSINESS_TYPE_LABELS[data.businessType],
      },
      funnel: {
        track: route.track,
        track_variant: route.trackVariant,
        volume_tier: VOLUME_TIER_LABELS[data.volumeTier],
        pain_point: PAIN_POINT_SHORT[data.painPoint],
        lead_source: "sorting_hat",
      },
      thank_you_slug: route.thankYouSlug,
      page_url: headersList.get("referer") || undefined,
    }).catch((err) => {
      console.error("[submitSortingHatLead] notify failed (swallowed)", err);
    });

    // Fire Day 0 email — non-blocking on errors so the form still completes
    sendDay0Email({
      track: route.track,
      trackVariant: route.trackVariant,
      name: data.fullName.split(" ")[0],
      email: data.email,
      businessType: BUSINESS_TYPE_LABELS[data.businessType],
      volumeTier: VOLUME_TIER_LABELS[data.volumeTier],
      painPointShort: PAIN_POINT_SHORT[data.painPoint],
    }).catch((err) => {
      console.error("[sorting-hat] Day 0 email error:", err);
    });

    return {
      success: true as const,
      thankYouSlug: route.thankYouSlug,
      track: route.track,
      // Null if the lookup fails, in which case step 5 simply doesn't appear.
      // The lead is already saved either way.
      leadId: await newestLeadId(data.email),
    };
  } catch (err) {
    console.error("[submitSortingHatLead] unexpected error", err);
    await trackLeadFailure({
      source: "submitSortingHatLead",
      payload: {
        email: typeof input?.email === "string" ? input.email : "unknown",
        full_name: typeof input?.fullName === "string" ? input.fullName : null,
        phone: typeof input?.phone === "string" ? input.phone : null,
        business_type: typeof input?.businessType === "string" ? input.businessType : null,
        volume_tier: typeof input?.volumeTier === "string" ? input.volumeTier : null,
        pain_point: typeof input?.painPoint === "string" ? input.painPoint : null,
      },
      error_code: "UNEXPECTED",
      error_message: err instanceof Error ? err.message : String(err),
    });
    return { success: false as const, error: "Unexpected error. Please try again." };
  }
}

/**
 * Id of the row we just wrote, looked up rather than returned, because the
 * insert cannot use RETURNING under the anon RLS policy. Service-role read,
 * narrowed to one email and one column.
 *
 * Best effort by contract: the lead is already saved when this runs, so every
 * failure path just costs us the optional step, never the lead.
 */
async function newestLeadId(email: string): Promise<string | null> {
  try {
    const { data, error } = await getAdminSupabase()
      .from("quiz_leads")
      .select("id")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    return (data as { id: string }).id;
  } catch (err) {
    console.error("[newestLeadId] lookup failed (swallowed)", err);
    return null;
  }
}

const enrichSchema = z.object({
  leadId: z.string().uuid(),
  phone: z.string().max(40).optional(),
  companyName: z.string().max(160).optional(),
  currentProvider: z.string().max(120).optional(),
});

/**
 * Optional step 5. The lead row already exists by the time this runs, so a
 * failure here is cosmetic: the lead is never at risk and the caller shows no
 * error, it just moves on to the thank-you page.
 *
 * Write-once by design. `enriched_at IS NULL` in the update filter means a
 * leaked lead id cannot be replayed to overwrite what the merchant told us, and
 * the one-hour window means an old id is useless even before that.
 */
export async function enrichSortingHatLead(input: SortingHatEnrichPayload) {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRate(`enrich:${ip}`, 10)) {
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

    // Service role: anon has an INSERT policy on quiz_leads and nothing else,
    // so an UPDATE through the request-scoped client is silently a no-op.
    const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: rows, error } = await getAdminSupabase()
      .from("quiz_leads")
      .update({
        ...(phone ? { phone } : {}),
        ...(companyName ? { company_name: companyName } : {}),
        ...(currentProvider ? { current_provider: currentProvider } : {}),
        enriched_at: new Date().toISOString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .eq("id", parsed.data.leadId)
      .is("enriched_at", null)
      .gte("created_at", cutoff)
      .select("id, email, full_name, track, volume_tier, pain_point");

    if (error || !rows || rows.length === 0) {
      if (error) console.error("[enrichSortingHatLead] update failed", error);
      return { success: false as const };
    }

    // Second notification, sent only when the merchant actually filled this in.
    // A phone number and a current provider change how Barak opens the reply,
    // and that is worth its own email rather than a silent row update.
    // The generated Supabase types predate the funnel v4.1 columns, which is
    // why the inserts above also cast. Same workaround, same reason.
    const lead = rows[0] as unknown as Record<string, unknown>;
    notifyNewLead({
      source: "sorting_hat",
      lead: {
        email: String(lead.email || ""),
        name: (lead.full_name as string) || null,
        phone,
        company: companyName,
        current_provider: currentProvider,
      },
      subject_note: "details added",
      funnel: {
        track: (lead.track as string) || undefined,
        volume_tier: (lead.volume_tier as string) || undefined,
        pain_point: (lead.pain_point as string) || undefined,
        lead_source: "sorting_hat",
      },
    }).catch((err) => {
      console.error("[enrichSortingHatLead] notify failed (swallowed)", err);
    });

    return { success: true as const };
  } catch (err) {
    console.error("[enrichSortingHatLead] unexpected error", err);
    return { success: false as const };
  }
}

interface Day0Args {
  track: "A" | "B" | "C" | "MANUAL";
  trackVariant: "default" | "subscriptions";
  name: string;
  email: string;
  businessType: string;
  volumeTier: string;
  painPointShort: string;
}

async function sendDay0Email(args: Day0Args) {
  const resend = getResend();

  const sharedProps = {
    name: args.name,
    businessType: args.businessType,
    volumeTier: args.volumeTier,
    painPoint: args.painPointShort,
    shortlistUrl: SHORTLIST_URL_BASE,
    calendlyUrl: CALENDLY_URL,
  };

  const trackDir =
    args.track === "B" ? "track-b" : args.track === "C" ? "track-c" : "track-a";
  const mod = getEmail(`${trackDir}/Day0_Confirmation`);
  if (!mod) throw new Error(`Day 0 email module not found for track ${args.track}`);
  const subject = mod.subject(sharedProps);
  const react = mod.default(sharedProps);

  await resend.emails.send({
    from: FUNNEL_FROM,
    replyTo: FUNNEL_REPLY_TO,
    to: args.email,
    subject,
    react,
    headers: {
      "X-Funnel-Track": args.track,
      "X-Funnel-State": "day0",
    },
  });
}

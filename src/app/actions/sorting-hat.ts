"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/integrations/supabase/server";
import { routeTrack } from "@/lib/funnel/track-router";
import {
  PAIN_POINT_SHORT,
  VOLUME_TIER_LABELS,
  BUSINESS_TYPE_LABELS,
  type SortingHatPayload,
} from "@/lib/funnel/types";
import {
  getResend,
  FUNNEL_FROM,
  FUNNEL_REPLY_TO,
  CALENDLY_URL,
  SHORTLIST_URL_BASE,
} from "@/lib/funnel/resend-client";

const schema = z.object({
  fullName: z.string().min(1).max(120),
  email: z.string().email().max(320),
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
      return { success: true as const, thankYouSlug: "a" as const };
    }

    const route = routeTrack(data.businessType, data.painPoint);

    const supabase = await createSupabaseServerClient();
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
      funnel_state: "day0",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let { error } = await supabase.from("quiz_leads").insert(insertPayload as any);

    // If the new columns do not yet exist (migration not applied), retry
    // with the legacy-only payload so leads still capture in production.
    if (error && /column .* does not exist/i.test(error.message)) {
      const legacyPayload: Record<string, unknown> = {
        full_name: data.fullName,
        email: data.email,
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
      console.error("[sorting-hat] insert error:", error);
      return { success: false as const, error: "Failed to save your details. Please try again." };
    }

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
    };
  } catch (err) {
    console.error("[sorting-hat] unexpected error:", err);
    return { success: false as const, error: "Unexpected error. Please try again." };
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

  let subject: string;
  let react: React.ReactElement;

  if (args.track === "B") {
    const mod = await import("@/emails/track-b/Day0_Confirmation");
    react = mod.default(sharedProps);
    subject = mod.subject(sharedProps);
  } else if (args.track === "C") {
    const mod = await import("@/emails/track-c/Day0_Confirmation");
    react = mod.default(sharedProps);
    subject = mod.subject(sharedProps);
  } else {
    // Track A (default + subscriptions both share Day 0)
    const mod = await import("@/emails/track-a/Day0_Confirmation");
    react = mod.default(sharedProps);
    subject = mod.subject(sharedProps);
  }

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

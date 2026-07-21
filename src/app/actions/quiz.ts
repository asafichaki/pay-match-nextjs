"use server";

import { createSupabaseServerClient } from "@/integrations/supabase/server";
import { trackLeadFailure } from "@/lib/leads/track-failure";
import { notifyNewLead } from "@/lib/leads/notify-new-lead";
import { z } from "zod";
import { headers, cookies } from "next/headers";
import {
  ATTRIBUTION_COOKIE,
  attributionColumns,
  parseAttributionCookie,
} from "@/lib/attribution";

const quizLeadSchema = z.object({
  fullName: z.string().min(1).max(200),
  email: z.string().email().max(320),
  phone: z.string().max(30).optional().default(""),
  monthlyVolume: z.string().max(50).optional(),
  businessType: z.string().max(50).optional(),
  industry: z.string().max(100).optional(),
  internationalPayments: z.string().max(50).optional(),
  averageTransaction: z.string().max(50).optional(),
  priority: z.array(z.string().max(50)).optional(),
  recommendedProvider: z.string().max(200).optional(),
  honeypot: z.string().max(0).optional(),
});

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

export async function submitQuizLead(formData: {
  fullName: string;
  email: string;
  phone?: string;
  monthlyVolume?: string;
  businessType?: string;
  industry?: string;
  internationalPayments?: string;
  averageTransaction?: string;
  priority?: string[];
  recommendedProvider?: string;
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
      // Silently reject bot submissions
      return { success: true };
    }

    // Validate input
    const result = quizLeadSchema.safeParse(formData);
    if (!result.success) {
      return { success: false, error: "Invalid form data. Please check your inputs." };
    }

    const data = result.data;
    const supabase = await createSupabaseServerClient();

    // First-touch attribution: where this visitor actually came from.
    const cookieStore = await cookies();
    const attribution = attributionColumns(
      parseAttributionCookie(cookieStore.get(ATTRIBUTION_COOKIE)?.value),
      headersList.get("referer"),
    );

    const { error } = await supabase.from("quiz_leads").insert({
      full_name: data.fullName,
      email: data.email,
      phone: data.phone || null,
      monthly_volume: data.monthlyVolume || null,
      business_type: data.businessType || null,
      industry: data.industry || null,
      international_payments: data.internationalPayments || null,
      average_transaction: data.averageTransaction || null,
      chargeback_history: null,
      integration_needs: data.priority ? data.priority.join(", ") : null,
      recommended_provider: data.recommendedProvider || null,
      status: "track_a",
      lead_source: "legacy_quiz",
      // Canonical attribution column — keep populated so it is never null.
      source: "quiz",
      track: "A",
      track_variant: "default",
      funnel_state: "day0",
      volume_tier: data.monthlyVolume || null,
      ...attribution,
    });

    if (error) {
      // LAYER 1: real log
      console.error("[submitQuizLead] insert failed", {
        error,
        payload_email: data.email,
      });
      // LAYER 2: mirror to lead_capture_failures
      await trackLeadFailure({
        source: "submitQuizLead",
        payload: {
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          monthly_volume: data.monthlyVolume,
          business_type: data.businessType,
          industry: data.industry,
          international_payments: data.internationalPayments,
          average_transaction: data.averageTransaction,
          priority: data.priority,
          recommended_provider: data.recommendedProvider,
        },
        error_code: error.code,
        error_message: error.message,
      });
      // LAYER 3: honest response
      return { success: false, error: "We couldn't save your details. Please try again." };
    }

    notifyNewLead({
      source: "quiz",
      lead: {
        email: data.email,
        name: data.fullName,
        phone: data.phone || null,
        monthly_volume: data.monthlyVolume,
        business_type: data.businessType,
        industry: data.industry,
        international_payments: data.internationalPayments,
        average_transaction: data.averageTransaction,
        priority: data.priority,
        recommended_provider: data.recommendedProvider,
      },
      funnel: { track: "A", track_variant: "default", volume_tier: data.monthlyVolume, lead_source: "legacy_quiz" },
      page_url: headersList.get("referer") || undefined,
    }).catch((err) => {
      console.error("[submitQuizLead] notify failed (swallowed)", err);
    });

    return { success: true };
  } catch (error) {
    console.error("[submitQuizLead] unexpected error", error);
    await trackLeadFailure({
      source: "submitQuizLead",
      payload: {
        email: typeof formData?.email === "string" ? formData.email : "unknown",
        full_name: typeof formData?.fullName === "string" ? formData.fullName : null,
      },
      error_code: "UNEXPECTED",
      error_message: error instanceof Error ? error.message : String(error),
    });
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

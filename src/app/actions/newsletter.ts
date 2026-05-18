"use server";

import { createSupabaseServerClient } from "@/integrations/supabase/server";
import { trackLeadFailure } from "@/lib/leads/track-failure";
import { z } from "zod";
import { headers } from "next/headers";

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address").max(320),
  source: z.enum(["homepage", "footer", "exit_intent"]).default("homepage"),
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

    // Plain INSERT — RLS allows anon INSERT but not UPDATE, so upsert is blocked.
    // Duplicate emails surface as Postgres 23505 (unique violation), treated as
    // silent success below since the user is already on the list.
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email: data.email.toLowerCase().trim(),
        source: data.source,
        active: true,
        subscribed_at: new Date().toISOString(),
      });

    if (error) {
      // Duplicate email — already subscribed. Treat as success.
      if (error.code === "23505") {
        return { success: true };
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

    return { success: true };
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

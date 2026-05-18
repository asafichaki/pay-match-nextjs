"use server";

import { createSupabaseServerClient } from "@/integrations/supabase/server";
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

    // Insert (upsert to handle duplicates gracefully)
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        {
          email: data.email.toLowerCase().trim(),
          source: data.source,
          active: true,
          subscribed_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );

    if (error) {
      console.error("Newsletter subscribe error:", error);
      return { success: false, error: "Could not save subscription. Please try again." };
    }

    return { success: true };
  } catch (error) {
    console.error("Newsletter error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

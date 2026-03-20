"use server";

import { createSupabaseServerClient } from "@/integrations/supabase/server";
import { z } from "zod";
import { headers } from "next/headers";

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
      status: "new",
    });

    if (error) {
      console.error("Quiz lead insert error:", error);
      return { success: false, error: "Failed to save your information. Please try again." };
    }

    return { success: true };
  } catch (error) {
    console.error("Quiz submission error:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}

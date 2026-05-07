import { Resend } from "resend";

let cached: Resend | null = null;

export function getResend(): Resend {
  if (!cached) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY is not set");
    }
    cached = new Resend(key);
  }
  return cached;
}

export const FUNNEL_FROM = process.env.FUNNEL_FROM_EMAIL || "Barak Bachar <barak@mypayadvisor.com>";
export const FUNNEL_REPLY_TO = process.env.FUNNEL_REPLY_TO_EMAIL || "barak@mypayadvisor.com";
export const CALENDLY_URL = process.env.CALENDLY_URL || "https://calendly.com/barak-bachar/payments-consultation";
export const SHORTLIST_URL_BASE = process.env.SHORTLIST_URL_BASE || "https://www.mypayadvisor.com/comparisons";
export const AFFILIATE_URL_BASE = process.env.AFFILIATE_URL_BASE || "https://www.mypayadvisor.com/quiz";

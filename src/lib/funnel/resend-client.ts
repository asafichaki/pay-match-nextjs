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
// No live Calendly booking link exists (the old default 404'd on every email +
// thank-you page). Until a real scheduling link is set via the CALENDLY_URL env
// var, every "talk to Barak" reference points at his real profile page (HTTP 200,
// links to contact) instead of a dead booking URL. The primary conversion path is
// now the lead handoff: Barak gets notified on capture and emails the merchant.
export const CALENDLY_URL =
  process.env.CALENDLY_URL || "https://www.mypayadvisor.com/about/barak";
export const SHORTLIST_URL_BASE = process.env.SHORTLIST_URL_BASE || "https://www.mypayadvisor.com/comparisons";
export const AFFILIATE_URL_BASE = process.env.AFFILIATE_URL_BASE || "https://www.mypayadvisor.com/quiz";

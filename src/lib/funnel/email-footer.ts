import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { ReactElement } from "react";
import { render } from "@react-email/render";
import { OPERATOR_NAME, OPERATOR_ADDRESS_LINE } from "./operator";

/**
 * CAN-SPAM footer for every funnel email, added in ONE place at send time
 * instead of inside 23 templates: the sender's postal address and a working
 * unsubscribe link. The link is keyed on the email address, not the lead id,
 * because the Day 0 email can go out before the lead id is known.
 *
 * Token = HMAC-SHA256(lowercased email) under FUNNEL_UNSUBSCRIBE_SECRET, with
 * FUNNEL_CRON_SECRET as the fallback so nothing breaks before the new env var
 * is set in Vercel.
 */

const SITE = "https://www.mypayadvisor.com";

function secret(): string {
  const s = process.env.FUNNEL_UNSUBSCRIBE_SECRET || process.env.FUNNEL_CRON_SECRET || "";
  if (!s) console.error("[email-footer] no FUNNEL_UNSUBSCRIBE_SECRET / FUNNEL_CRON_SECRET set; unsubscribe tokens are unsigned");
  return s;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function unsubscribeToken(email: string): string {
  return createHmac("sha256", secret()).update(normalizeEmail(email)).digest("hex").slice(0, 32);
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = Buffer.from(unsubscribeToken(email));
  const given = Buffer.from((token || "").slice(0, 32).padEnd(32, "0"));
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function unsubscribeUrl(email: string): string {
  const e = normalizeEmail(email);
  return `${SITE}/api/funnel/unsubscribe?e=${encodeURIComponent(e)}&t=${unsubscribeToken(e)}`;
}

/** RFC 8058 one-click headers, so Gmail and Yahoo show their own unsubscribe button. */
export function unsubscribeHeaders(email: string): Record<string, string> {
  return {
    "List-Unsubscribe": `<${unsubscribeUrl(email)}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function footerHtml(email: string): string {
  const url = unsubscribeUrl(email);
  return (
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 auto;max-width:560px">` +
    `<tr><td style="padding:24px 24px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;line-height:1.6;color:#64748b;border-top:1px solid #e2e8f0">` +
    `You are getting this because you asked myPayAdvisor for a payment-processor shortlist. ` +
    `myPayAdvisor is operated by ${escapeHtml(OPERATOR_NAME)}, ${escapeHtml(OPERATOR_ADDRESS_LINE)}. ` +
    `<a href="${url}" style="color:#64748b;text-decoration:underline">Unsubscribe</a> and you will not hear from us again.` +
    `</td></tr></table>`
  );
}

/**
 * Render a funnel email template to HTML with the footer inside <body>.
 * Falls back to appending when the template has no closing body tag.
 */
export async function renderFunnelEmail(react: ReactElement, email: string): Promise<string> {
  const html = await render(react);
  const footer = footerHtml(email);
  const idx = html.lastIndexOf("</body>");
  return idx === -1 ? html + footer : html.slice(0, idx) + footer + html.slice(idx);
}

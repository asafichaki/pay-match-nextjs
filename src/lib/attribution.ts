/**
 * First-touch marketing attribution.
 *
 * A tiny first-party cookie (`mpa_attr`) is written once, on the visitor's
 * first page load (see AttributionCapture.tsx), and read back server-side when
 * a lead is saved so every `quiz_leads` row carries where the visitor actually
 * came from. Works across every entry point (Sorting Hat, quiz, exit intent)
 * without threading params through each form.
 *
 * Shared module — safe to import from both client and server. No React,
 * no "server-only" so the capture component can reuse the constants.
 */

export const ATTRIBUTION_COOKIE = "mpa_attr";
// First-touch is the goal, so keep it long enough to survive a research gap
// between the first visit and the eventual form submit.
export const ATTRIBUTION_MAX_AGE_DAYS = 90;

export type Attribution = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  landing_page_url: string | null;
};

const EMPTY: Attribution = {
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  referrer: null,
  landing_page_url: null,
};

function clean(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  // Defensive cap — attribution values are short by nature; never let a
  // crafted cookie balloon a DB row.
  return t.slice(0, 500);
}

/**
 * Parse the raw cookie value (URL-encoded JSON) into a safe Attribution.
 * Never throws — a malformed cookie yields all-null attribution.
 */
export function parseAttributionCookie(raw: string | undefined | null): Attribution {
  if (!raw) return { ...EMPTY };
  try {
    const decoded = decodeURIComponent(raw);
    const obj = JSON.parse(decoded) as Record<string, unknown>;
    return {
      utm_source: clean(obj.utm_source),
      utm_medium: clean(obj.utm_medium),
      utm_campaign: clean(obj.utm_campaign),
      referrer: clean(obj.referrer),
      landing_page_url: clean(obj.landing_page_url),
    };
  } catch {
    return { ...EMPTY };
  }
}

/**
 * Build the attribution columns to merge into a `quiz_leads` insert.
 * `referHeader` is the server `referer` header — the page the form was
 * submitted from — used as a fallback landing page when no cookie exists yet
 * (e.g. JS-disabled or same-session first hit).
 */
export function attributionColumns(
  attr: Attribution,
  referHeader?: string | null,
): Attribution {
  return {
    utm_source: attr.utm_source,
    utm_medium: attr.utm_medium,
    utm_campaign: attr.utm_campaign,
    referrer: attr.referrer,
    landing_page_url: attr.landing_page_url || clean(referHeader),
  };
}

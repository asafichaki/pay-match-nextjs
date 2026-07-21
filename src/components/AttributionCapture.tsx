"use client";

import { useEffect } from "react";
import {
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_MAX_AGE_DAYS,
} from "@/lib/attribution";

/**
 * Writes the first-touch attribution cookie exactly once per visitor.
 *
 * Runs on the very first page load, captures where the visitor came from
 * (UTMs + external referrer + landing page), and never overwrites itself, so
 * the ORIGINAL source survives even after the visitor clicks around the site
 * before submitting a form. Read back server-side in the lead actions.
 *
 * Mounted globally in the root layout. Renders nothing.
 */
export function AttributionCapture() {
  useEffect(() => {
    try {
      // First-touch: never clobber an existing cookie.
      if (document.cookie.split("; ").some((c) => c.startsWith(`${ATTRIBUTION_COOKIE}=`))) {
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const ref = document.referrer || "";
      // Ignore internal referrers so `referrer` means "came from outside".
      const external = ref && !ref.startsWith(window.location.origin) ? ref : null;

      const payload = {
        utm_source: params.get("utm_source") || null,
        utm_medium: params.get("utm_medium") || null,
        utm_campaign: params.get("utm_campaign") || null,
        referrer: external,
        landing_page_url: window.location.pathname + window.location.search,
      };

      // Only write if there's actually something worth attributing.
      const hasSignal = Object.values(payload).some(Boolean);
      if (!hasSignal) return;

      const maxAge = ATTRIBUTION_MAX_AGE_DAYS * 24 * 60 * 60;
      const value = encodeURIComponent(JSON.stringify(payload));
      document.cookie = `${ATTRIBUTION_COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
    } catch {
      // Attribution is best-effort — never break the page over it.
    }
  }, []);

  return null;
}

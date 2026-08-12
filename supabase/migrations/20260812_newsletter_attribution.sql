-- First-touch attribution on newsletter_subscribers.
--
-- The `mpa_attr` cookie is already written for every visitor on their first
-- page load (AttributionCapture, mounted globally in providers.tsx), and
-- src/lib/attribution.ts even documents exit intent as one of the entry points
-- it covers. quiz_leads reads it; subscribeNewsletter never did, so it was
-- collected and then thrown away on every popup and footer signup.
--
-- Without these columns the leads sheet can only ever say "Direct / unknown"
-- under "Came from" for an email-only lead, which is worse than useless: it
-- reads as a fact rather than as missing data.
--
-- Same five columns and same names as quiz_leads, so traffic_source() in
-- scripts/leads-sheet-sync.py works on a row from either table unchanged.
--
-- Existing rows stay null. The attribution for those three signups was never
-- persisted and cannot be reconstructed.

ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS referrer TEXT,
  ADD COLUMN IF NOT EXISTS landing_page_url TEXT;

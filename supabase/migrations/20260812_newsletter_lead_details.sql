-- Optional second step of the exit-intent popup and the footer form: details
-- the merchant can add AFTER the newsletter row already exists, so abandoning
-- the step never costs us the signup.
--
-- Mirrors 20260810_lead_optional_details.sql on quiz_leads, deliberately. Both
-- capture paths now feed one call list (the Leads tab of the shared sheet), so
-- the same three facts have to be recordable whichever door the lead came in.
--   phone             the whole point of the step: an email-only lead cannot be called
--   company_name      what the business is called (email domain only guesses it)
--   current_provider  who processes for them today, the single most useful
--                     opener Barak can have before the first reply
--   enriched_at       set once, on the first successful enrichment. Doubles as
--                     the write-once guard in enrichNewsletterLead.
--
-- No RLS change. anon still holds INSERT and nothing else on this table, which
-- is why the enrichment update runs through the service-role client.

ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS current_provider TEXT,
  ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_enriched_at
  ON public.newsletter_subscribers(enriched_at);

-- The enrichment looks its row up by email (the insert cannot use RETURNING
-- under the anon INSERT-only policy), so that lookup needs an index too.
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email
  ON public.newsletter_subscribers(email);

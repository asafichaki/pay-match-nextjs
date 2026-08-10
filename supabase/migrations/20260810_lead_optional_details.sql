-- Optional step 5 of the Sorting Hat: details the merchant can add AFTER the
-- lead row already exists, so abandoning the step never costs us the lead.
-- `phone` already existed on quiz_leads; these three are new.
--   company_name      what the business is called (email domain only guesses it)
--   current_provider  who processes for them today, the single most useful
--                     opener Barak can have before the first reply
--   enriched_at       set once, on the first successful enrichment. Doubles as
--                     the write-once guard in enrichSortingHatLead.

ALTER TABLE public.quiz_leads
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS current_provider TEXT,
  ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_quiz_leads_enriched_at
  ON public.quiz_leads(enriched_at);

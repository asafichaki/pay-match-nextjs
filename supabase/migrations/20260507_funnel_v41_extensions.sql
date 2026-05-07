-- Funnel v4.1 schema extensions for quiz_leads
-- Adds: track routing, pain_point, funnel state machine, email engagement,
-- agent distribution, calendly booking, audit upload.
-- Run once via Supabase SQL Editor or `supabase db push`.

ALTER TABLE public.quiz_leads
  ADD COLUMN IF NOT EXISTS track TEXT,
  ADD COLUMN IF NOT EXISTS track_variant TEXT,
  ADD COLUMN IF NOT EXISTS volume_tier TEXT,
  ADD COLUMN IF NOT EXISTS pain_point TEXT,
  ADD COLUMN IF NOT EXISTS lead_source TEXT DEFAULT 'sorting_hat',
  ADD COLUMN IF NOT EXISTS funnel_state TEXT DEFAULT 'day0',
  ADD COLUMN IF NOT EXISTS email_state JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS calendly_booking_id TEXT,
  ADD COLUMN IF NOT EXISTS calendly_booked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS audit_file_url TEXT,
  ADD COLUMN IF NOT EXISTS assigned_to TEXT,
  ADD COLUMN IF NOT EXISTS sold_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sold_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS internal_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_quiz_leads_track ON public.quiz_leads(track);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_funnel_state ON public.quiz_leads(funnel_state);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_pain_point ON public.quiz_leads(pain_point);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_volume_tier ON public.quiz_leads(volume_tier);

CREATE TABLE IF NOT EXISTS public.lead_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.quiz_leads(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  delivery_method TEXT NOT NULL,
  delivery_status TEXT DEFAULT 'pending',
  delivered_at TIMESTAMPTZ,
  agent_outcome TEXT,
  outcome_notes TEXT,
  price NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_distributions_lead_id ON public.lead_distributions(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_distributions_agent ON public.lead_distributions(agent_name);

CREATE TABLE IF NOT EXISTS public.funnel_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  email TEXT,
  webhook_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  criteria_track TEXT[],
  criteria_volume_tier TEXT[],
  criteria_industry TEXT[],
  price_per_lead NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lead_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role can do everything on lead_distributions" ON public.lead_distributions;
CREATE POLICY "service_role can do everything on lead_distributions"
  ON public.lead_distributions FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "service_role can do everything on funnel_agents" ON public.funnel_agents;
CREATE POLICY "service_role can do everything on funnel_agents"
  ON public.funnel_agents FOR ALL
  USING (auth.role() = 'service_role');

-- Authenticated users (admin dashboard) can read
DROP POLICY IF EXISTS "authenticated can read lead_distributions" ON public.lead_distributions;
CREATE POLICY "authenticated can read lead_distributions"
  ON public.lead_distributions FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "authenticated can read funnel_agents" ON public.funnel_agents;
CREATE POLICY "authenticated can read funnel_agents"
  ON public.funnel_agents FOR SELECT
  USING (auth.role() = 'authenticated');

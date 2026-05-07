-- Live Updates feed (Phase: live-updates v1)
-- Run once via Supabase SQL Editor.

-- Master feed — everything published lands here
CREATE TABLE IF NOT EXISTS public.updates_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('rate_change','industry_news','outage','editorial')),
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low','medium','high')),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  body_md TEXT,
  source_url TEXT,
  source_name TEXT,
  related_processor TEXT,
  tags TEXT[],
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Editorial state
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published','pending_review','rejected','unpublished')),
  voice_score INTEGER,
  classifier_score INTEGER,
  voice_violations JSONB DEFAULT '[]'::jsonb,
  -- Index hint (we want roundups in sitemap, individual items noindex)
  index_in_sitemap BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_updates_feed_published_at ON public.updates_feed(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_updates_feed_type ON public.updates_feed(type);
CREATE INDEX IF NOT EXISTS idx_updates_feed_status ON public.updates_feed(status);
CREATE INDEX IF NOT EXISTS idx_updates_feed_severity ON public.updates_feed(severity);

-- Rate changes — full history of every detected processor pricing change
CREATE TABLE IF NOT EXISTS public.rate_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  field TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  delta_pct NUMERIC(5,2),
  source_url TEXT,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Auto / manual decision trail
  auto_applied BOOLEAN DEFAULT FALSE,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  raw_html_hash TEXT,
  classifier_notes TEXT,
  feed_id UUID REFERENCES public.updates_feed(id)
);

CREATE INDEX IF NOT EXISTS idx_rate_changes_provider ON public.rate_changes(provider, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_changes_observed ON public.rate_changes(observed_at DESC);

-- Industry news — RSS pulls before classification
CREATE TABLE IF NOT EXISTS public.industry_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  raw_summary TEXT,
  source_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  -- Classifier output
  is_relevant BOOLEAN,
  relevance_score INTEGER,
  classifier_tags TEXT[],
  ai_summary TEXT,
  voice_violations JSONB DEFAULT '[]'::jsonb,
  -- Dedup
  title_hash TEXT NOT NULL UNIQUE,
  url_hash TEXT NOT NULL UNIQUE,
  -- Publish state
  feed_id UUID REFERENCES public.updates_feed(id)
);

CREATE INDEX IF NOT EXISTS idx_industry_news_published ON public.industry_news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_industry_news_relevant ON public.industry_news(is_relevant);

-- Pending review queue — large deltas + defamation gate hits + voice-fail items
CREATE TABLE IF NOT EXISTS public.pending_review (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('rate_change','news_summary','defamation_flag')),
  reason TEXT NOT NULL,
  payload JSONB NOT NULL,
  rate_change_id UUID REFERENCES public.rate_changes(id),
  news_id UUID REFERENCES public.industry_news(id),
  approve_token_hash TEXT,
  reject_token_hash TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  resolution TEXT CHECK (resolution IN ('approved','rejected','expired')),
  resolved_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_review_unresolved ON public.pending_review(resolved_at) WHERE resolved_at IS NULL;

-- Cron health — heartbeats + errors per scheduled job
CREATE TABLE IF NOT EXISTS public.cron_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success','partial','failed')),
  items_processed INTEGER DEFAULT 0,
  items_published INTEGER DEFAULT 0,
  items_rejected INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb,
  duration_ms INTEGER,
  cost_usd_estimate NUMERIC(8,4),
  ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cron_health_job_ran ON public.cron_health(job_name, ran_at DESC);

-- Settings — kv store for budget caps, feature flags, etc.
CREATE TABLE IF NOT EXISTS public.live_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.live_settings (key, value) VALUES
  ('claude_daily_budget_usd', '5'::jsonb),
  ('news_daily_publish_cap', '5'::jsonb),
  ('rate_delta_auto_threshold', '0.5'::jsonb),
  ('rate_delta_alert_threshold', '0.5'::jsonb),
  ('news_min_relevance_score', '70'::jsonb),
  ('voice_min_score', '80'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- RLS
ALTER TABLE public.updates_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_review ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cron_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_settings ENABLE ROW LEVEL SECURITY;

-- Public reads only on published feed items
CREATE POLICY "anon read updates_feed" ON public.updates_feed
  FOR SELECT TO anon USING (status = 'published');
-- Authenticated full
CREATE POLICY "authed all updates_feed" ON public.updates_feed FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "authed all rate_changes" ON public.rate_changes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authed all industry_news" ON public.industry_news FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authed all pending_review" ON public.pending_review FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authed all cron_health" ON public.cron_health FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authed all live_settings" ON public.live_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';

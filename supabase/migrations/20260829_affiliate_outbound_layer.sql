-- The affiliate outbound layer.
--
-- Two tables and one idea: an outbound commercial link is DATA, not a string
-- typed into a .tsx file. Today there are 21 hardcoded PaymentCloud URLs and
-- 19 Durango URLs across the comparison shells. Signing a program, changing a
-- tracking parameter or pausing a partner means 21 edits and a deploy. After
-- this it means one UPDATE.
--
-- The second table answers a question nothing on this site can answer today:
-- who left for a provider, from which page, and which channel sent them.
--
-- The channel column is the load-bearing one. GSC cannot see a visitor who
-- arrived from ChatGPT, and GA4 sees the referrer but never connects it to the
-- click-out. Over the last measured period this site took 93 referral clicks
-- from chatgpt.com and 21 from gemini.google.com, against roughly 90 organic
-- clicks from Google in 28 days. The AI channel is not a rounding error here,
-- it is half the traffic, and it is currently unattributed and unmonetised.

CREATE TABLE IF NOT EXISTS public.partners (
  slug              TEXT PRIMARY KEY,
  name              TEXT NOT NULL,
  -- Where a click actually goes. Until a program is signed this is the plain
  -- provider URL, so /go/<slug> is safe to ship before any affiliate deal
  -- exists: it behaves exactly like the link it replaced, and starts counting.
  destination_url   TEXT NOT NULL,
  network           TEXT,
  -- unsigned -> applied -> active -> paused. Only `active` means the
  -- destination_url carries a tracking parameter that pays us.
  program_status    TEXT NOT NULL DEFAULT 'unsigned'
                      CHECK (program_status IN ('unsigned','applied','active','paused')),
  payout_model      TEXT,
  payout_note       TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN public.partners.destination_url IS
  'Plain provider URL while unsigned; the affiliate/tracking URL once active. Never edited in code.';

CREATE TABLE IF NOT EXISTS public.outbound_clicks (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ts              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  partner_slug    TEXT NOT NULL REFERENCES public.partners(slug) ON UPDATE CASCADE,
  -- The page that sent the click. Path only, never the full URL with params.
  from_path       TEXT,
  -- FIRST-TOUCH channel, read from the mpa_attr cookie, not from the referer
  -- header. A visitor who lands from ChatGPT, reads two more pages and then
  -- clicks out has a same-site referer at click time. Reading the header alone
  -- would file every one of those under "direct" and erase the AI channel,
  -- which is the exact blind spot this table exists to close.
  channel         TEXT,
  -- The immediate referer at click time, kept separately so the two can be
  -- compared rather than conflated.
  click_referrer  TEXT,
  first_referrer  TEXT,
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  destination_url TEXT NOT NULL,
  ua              TEXT,
  -- A crawler that follows /go/ is logged but flagged, never silently mixed
  -- into the human counts. robots.txt disallows /go/, so this should stay near
  -- zero; if it does not, that is the signal.
  is_bot          BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS outbound_clicks_ts_idx      ON public.outbound_clicks (ts DESC);
CREATE INDEX IF NOT EXISTS outbound_clicks_partner_idx ON public.outbound_clicks (partner_slug, ts DESC);
CREATE INDEX IF NOT EXISTS outbound_clicks_channel_idx ON public.outbound_clicks (channel, ts DESC);
CREATE INDEX IF NOT EXISTS outbound_clicks_from_idx    ON public.outbound_clicks (from_path, ts DESC);

-- RLS on, no policy for anon or authenticated. Both tables are written and
-- read by the service role only (the /go route and the admin views). The
-- portfolio RLS hardening pass treats a table with RLS off as a finding.
ALTER TABLE public.partners        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbound_clicks ENABLE ROW LEVEL SECURITY;

-- A second destination per partner.
--
-- The best-of index offers two different actions on the same provider: "Visit
-- Site" and "Get a Free Quote". They are different pages, and on a merchant
-- services program they are usually different payouts, since a quote request
-- is the lead event that actually converts. Keeping both as data means
-- /go/<slug> and /go/<slug>?v=quote are the only two things a page ever needs
-- to know.
ALTER TABLE public.partners ADD COLUMN IF NOT EXISTS quote_url TEXT;

COMMENT ON COLUMN public.partners.quote_url IS
  'Contact/demo/quote destination. Falls back to destination_url when null.';

-- Which of the two was clicked, so a quote request is never counted as a
-- browse. Existing rows are all plain visits.
ALTER TABLE public.outbound_clicks
  ADD COLUMN IF NOT EXISTS variant TEXT NOT NULL DEFAULT 'visit'
  CHECK (variant IN ('visit','quote'));

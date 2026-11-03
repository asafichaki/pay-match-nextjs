-- Separate real reader clicks from scripted fetches that borrow a browser UA.
--
-- On 2026-11-03, 210 of 214 non-bot rows in the previous 14 days had no
-- attribution cookie and channel=direct, while the client-side affiliate_click
-- event (only a browser running our JS can send it) saw 3. The UA check in
-- click-bot.ts cannot catch these, so two browser-only signals are stored:
--
--   has_attr_cookie  mpa_attr is written by AttributionCapture on every first
--                    page load, so a request without it never ran our JS.
--   sec_fetch_site   a browser clicking our link sends "same-origin"; a fetcher
--                    hitting /go/ directly sends "none" or nothing.
--
-- likely_human is the number to report. plain_url keeps the provider's clean
-- address so an unlikely-human click on a signed program can still go to the
-- provider without touching the network's tracking link.

alter table public.outbound_clicks
  add column if not exists has_attr_cookie boolean,
  add column if not exists sec_fetch_site text,
  add column if not exists sec_fetch_user text,
  add column if not exists likely_human boolean;

alter table public.partners
  add column if not exists plain_url text;

update public.partners
   set plain_url = destination_url
 where plain_url is null
   and program_status <> 'active';

create index if not exists outbound_clicks_human_ts_idx
  on public.outbound_clicks (ts desc)
  where likely_human;

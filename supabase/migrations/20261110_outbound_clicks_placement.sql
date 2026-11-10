-- Record WHERE on the page a provider click came from, so the pilot can tell
-- a card button from a table row, a verdict block or the sticky bar, and at
-- which selected volume. Applied to prod via the Management API on
-- 2026-11-10 BEFORE the code that writes these columns shipped.
--
--   placement    card | table | review | verdict | sticky | widget | offers | hub
--   position     1-based rank of the provider in the block it was clicked from
--   volume_tier  the volume the reader had selected: 10k | 50k | 250k | 1m

alter table public.outbound_clicks add column if not exists placement text;
alter table public.outbound_clicks add column if not exists position smallint;
alter table public.outbound_clicks add column if not exists volume_tier text;

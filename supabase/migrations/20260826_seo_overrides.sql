-- Phase 2 SEO autopilot: the override layer contract.
--
-- Adds the tables the render-time override layer reads and the Hermes loop
-- (/opt/mypayadvisor-seo, ops/hermes-seo in this repo) writes, plus the one
-- SECURITY DEFINER RPC that is the ONLY path allowed to change an override.
--
-- This file touches nothing that already exists: no blog_articles, no
-- quiz_leads, no newsletter_subscribers, no providers. Everything here is new
-- and inert until the loop writes a row, so the site renders base metadata
-- until then.
--
-- Safe to run twice: every object is created "if not exists" or "or replace",
-- every policy is dropped before it is created, and enabling row level
-- security on an already-protected table is a no-op in Postgres.
--
-- Apply BEFORE the PR 2 code ships (migration before code).

-- ===========================================================================
-- 1. seo_expert_quotes: the curated quote library
-- ===========================================================================
-- Written by a human only (SQL insert or the admin UI); the loop NEVER writes
-- here, it only selects a matching id. A quote without a source URL and a
-- retrieval date cannot exist, which is what makes "no generated quotes"
-- enforceable rather than a promise.

create table if not exists public.seo_expert_quotes (
  id integer generated always as identity primary key,
  quote text not null,
  author_name text not null,
  author_title text,
  author_url text,
  source_url text not null,
  source_title text,
  retrieved_at date not null,
  topic text,
  topics text[],
  tags text[],
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint seo_expert_quotes_source_url_check check (source_url ~ '^https?://'),
  constraint seo_expert_quotes_quote_len_check check (length(btrim(quote)) between 20 and 1000)
);

comment on table public.seo_expert_quotes is
  'Curated real expert quotes with a source URL and a retrieval date. Written by a human only. Read by aeo.py (pick_quote) to choose seo_overrides.expert_quote_id, and by the ExpertQuote component at render time. The loop never inserts here: this table is the only permitted source of a quote.';

create index if not exists seo_expert_quotes_active_idx
  on public.seo_expert_quotes (active) where active;

-- ===========================================================================
-- 2. seo_overrides: what the site renders on top of its base metadata
-- ===========================================================================
-- Written ONLY by public.seo_apply_change(). Read at render time by
-- src/lib/seo/overrides.ts (getSeoOverride, service role), by the llms.txt and
-- llms-full.txt routes, and by the loop (main.py load_shared, health.py).

create table if not exists public.seo_overrides (
  override_id bigint generated always as identity primary key,
  kind text not null,
  slug text not null,
  meta_title text,
  meta_description text,
  title_absolute boolean not null default false,
  h1_override text,
  related_links jsonb,
  aeo_answer text,
  expert_quote_id integer references public.seo_expert_quotes (id) on delete set null,
  canonical text,
  noindex boolean not null default false,
  citation_lock boolean not null default false,
  cohort text,
  locked_until date,
  version integer not null default 1,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint seo_overrides_kind_check check (kind in ('insights', 'comparisons', 'pages')),
  constraint seo_overrides_slug_check check (slug ~ '^[a-z0-9][a-z0-9-]*(/[a-z0-9][a-z0-9-]*)*$' and length(slug) <= 200),
  constraint seo_overrides_version_check check (version >= 1),
  constraint seo_overrides_kind_slug_key unique (kind, slug)
);

comment on table public.seo_overrides is
  'Render-time overrides for title, meta, H1, related links, AEO answer block, expert quote, canonical and robots, keyed by (kind, slug). Written ONLY by seo_apply_change(). Read by the Next.js override layer at render time and by the loop for its before-snapshot. Empty table = the site renders its base metadata.';

comment on column public.seo_overrides.citation_lock is
  'True while the page is cited by an answer engine in the last two probe rounds. The title lane must not touch it; the answer block may still be refreshed.';
comment on column public.seo_overrides.cohort is
  'Measurement cohort tag: changed wave or holdout. The holdout membership itself lives in seo_settings.holdout; this column is the per-row record of it.';
comment on column public.seo_overrides.locked_until is
  'While this date is today or later, seo_apply_change() refuses every field except restore. Set by a rollback (30 days) or by hand.';

create index if not exists seo_overrides_cohort_idx
  on public.seo_overrides (cohort) where cohort is not null;

create index if not exists seo_overrides_locked_idx
  on public.seo_overrides (locked_until) where locked_until is not null;

-- ===========================================================================
-- 3. seo_overrides_history: immutable version snapshots, the rollback source
-- ===========================================================================
-- One row per version of a seo_overrides row, written by seo_apply_change()
-- BEFORE it changes anything. Read by measure.py (restore_from_history) and by
-- the restore branch of the RPC. Rows are immutable: a trigger blocks update
-- and delete, so a rollback target can never be edited away.

create table if not exists public.seo_overrides_history (
  history_id bigint generated always as identity primary key,
  kind text not null,
  slug text not null,
  version integer not null,
  meta_title text,
  meta_description text,
  title_absolute boolean,
  h1_override text,
  related_links jsonb,
  aeo_answer text,
  expert_quote_id integer,
  canonical text,
  noindex boolean,
  citation_lock boolean,
  cohort text,
  locked_until date,
  updated_by text,
  snapshot_at timestamptz not null default now(),
  changed_field text,
  changed_reason text,
  constraint seo_overrides_history_kind_slug_version_key unique (kind, slug, version)
);

comment on table public.seo_overrides_history is
  'Immutable snapshot of a seo_overrides row as it was BEFORE each change, carrying the version it had. Written by seo_apply_change(); read by measure.py and by the RPC restore path. Never updated, never deleted (enforced by trigger seo_overrides_history_immutable).';

create index if not exists seo_overrides_history_lookup_idx
  on public.seo_overrides_history (kind, slug, version desc);

create or replace function public.seo_overrides_history_no_change()
returns trigger language plpgsql as $$
begin
  raise exception 'seo_overrides_history is append only: % on version % of %/% is refused',
    tg_op, old.version, old.kind, old.slug
    using errcode = '42501';
end;
$$;

drop trigger if exists trg_seo_overrides_history_immutable on public.seo_overrides_history;
create trigger trg_seo_overrides_history_immutable
  before update or delete on public.seo_overrides_history
  for each row execute function public.seo_overrides_history_no_change();

-- ===========================================================================
-- 4. seo_changes: the audit trail and the verification queue
-- ===========================================================================
-- Applied rows are written by seo_apply_change(). Proposal rows (status
-- 'proposed', idempotency_key prefixed 'proposed:') are inserted directly by
-- changes.py when the apply gate is closed. Status is advanced by the loop:
-- applied -> verification_pending -> verified, or -> advisory_regression by
-- measure.py, or -> rolled_back.

create table if not exists public.seo_changes (
  change_id bigint generated always as identity primary key,
  idempotency_key text not null,
  kind text not null,
  slug text not null,
  field text not null,
  old text,
  new text,
  reason text,
  source text,
  status text not null default 'proposed',
  outcome jsonb,
  created_at timestamptz not null default now(),
  applied_at timestamptz,
  verified_at timestamptz,
  constraint seo_changes_idempotency_key_key unique (idempotency_key),
  constraint seo_changes_kind_check check (kind in ('insights', 'comparisons', 'pages')),
  constraint seo_changes_status_check check (status in (
    'proposed', 'applied', 'verification_pending', 'verified', 'rolled_back', 'advisory_regression'))
);

comment on table public.seo_changes is
  'Every proposed and applied page change, one row per field. Written by seo_apply_change() (status applied) and by changes.py (status proposed). Read by changes.py for idempotency, by indexing.py to decide which URLs get an IndexNow ping, by measure.py for the changed set, and by report.py for the morning mail. applied_at is NULL until the change is actually applied.';

comment on column public.seo_changes.idempotency_key is
  'field:kind:slug:sha1(new)[0:10] for an applied change, prefixed "proposed:" for a proposal. A second call with the same key returns the existing row instead of writing twice.';

create index if not exists seo_changes_kind_slug_applied_idx
  on public.seo_changes (kind, slug, applied_at desc);

create index if not exists seo_changes_status_idx
  on public.seo_changes (status);

create index if not exists seo_changes_status_field_applied_idx
  on public.seo_changes (status, field, applied_at desc);

create index if not exists seo_changes_slug_idx
  on public.seo_changes (slug);

-- ===========================================================================
-- 5. seo_metrics: the GSC truth table
-- ===========================================================================
-- Written by main.py step_gsc (upsert on the primary key) from a trailing
-- 10-day re-pull. Read by ctx.page_metrics, measure.py (cohort read and page
-- flags) and report.py (the traffic block). bot_impressions comes from the
-- weekly frozen bot-query list, so human impressions are impressions minus it.

create table if not exists public.seo_metrics (
  date date not null,
  page text not null,
  device text not null default '',
  country text not null default '',
  clicks integer not null default 0,
  impressions integer not null default 0,
  ctr numeric(10, 5) not null default 0,
  position numeric(8, 2) not null default 0,
  bot_impressions integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint seo_metrics_pkey primary key (date, page, device, country)
);

comment on table public.seo_metrics is
  'Google Search Console rows at date x page x device x country grain. Written by the loop gsc step, re-pulled for a trailing 10 days because D-1 and D-2 are undercounted. Read by ctx.py, measure.py and report.py. Never written by the site.';

create index if not exists seo_metrics_page_date_idx
  on public.seo_metrics (page, date);

create index if not exists seo_metrics_date_idx
  on public.seo_metrics (date);

-- ===========================================================================
-- 6. seo_index_status: URL Inspection results
-- ===========================================================================
-- Written by indexing.py (index_watch, upsert on url) and by the day-0
-- baseline import. Read by ctx.is_indexed, the escalation ladder and the
-- report index block. Keeps every diagnostic field Check 2 asked for, because
-- coverage_state alone cannot tell a canonical fight from a fetch problem.

create table if not exists public.seo_index_status (
  url text primary key,
  verdict text,
  coverage_state text,
  google_canonical text,
  user_canonical text,
  page_fetch_state text,
  crawled_as text,
  referring_urls jsonb not null default '[]'::jsonb,
  last_crawl timestamptz,
  checked_at timestamptz,
  updated_at timestamptz not null default now()
);

comment on table public.seo_index_status is
  'Latest Google URL Inspection result per tracked URL, with the full diagnostic set (google_canonical, user_canonical, page_fetch_state, crawled_as, referring_urls, last_crawl). Written by indexing.py index_watch and import_baseline; read by ctx.is_indexed, indexing.escalate and report.index_block.';

create index if not exists seo_index_status_coverage_idx
  on public.seo_index_status (coverage_state);

create index if not exists seo_index_status_checked_idx
  on public.seo_index_status (checked_at);

-- ===========================================================================
-- 7. seo_runs: the run ledger and the run lock
-- ===========================================================================
-- Written by ledger.Run (insert as lock, then patched per step). Read by the
-- lock check, month_spend, maybe_promote and report.today_run. A 'started' row
-- older than two hours is treated as abandoned by the loop.

create table if not exists public.seo_runs (
  run_date date not null,
  kind text not null,
  step_status jsonb not null default '{}'::jsonb,
  spend_usd numeric(10, 4) not null default 0,
  status text not null default 'started',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  constraint seo_runs_pkey primary key (run_date, kind),
  constraint seo_runs_status_check check (status in ('started', 'ok', 'failed'))
);

comment on table public.seo_runs is
  'One row per loop invocation, unique on (run_date, kind). The row IS the run lock. step_status holds per-step status, ms and notes; spend_usd feeds the monthly cap. Written and read by ledger.py; read by report.py to raise the red line when the daily run did not finish.';

create index if not exists seo_runs_kind_date_idx
  on public.seo_runs (kind, run_date desc);

-- ===========================================================================
-- 8. seo_settings: kill switches and loop state
-- ===========================================================================
-- Written and read by the loop through supa.setting / set_setting. Holds
-- loop_enabled, apply_enabled, the frozen bot-query list, the holdout, the
-- citation lock, the escalation state, the verification queue and
-- rules/version bookkeeping. A missing key reads as the caller's default.

create table if not exists public.seo_settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.seo_settings is
  'Key/value loop state as jsonb. Written and read only by the loop (supa.setting, set_setting). Keys in use: loop_enabled, apply_enabled, apply_disabled_reason, auto_promote, bot_queries, holdout, citation_lock, escalation, verification, index_classes, inspect_extra, aeo_refresh_queue, title_waves, probe_summary, competitor_hashes, bing_index, backlinks_summary, health_fail_streak, check1_rewrite_rate, loop_start_date.';

-- ===========================================================================
-- 9. seo_reports: the morning mail contract
-- ===========================================================================
-- Written by report.build (upsert on date), mirroring the JSON file in
-- SEO_STATE_DIR. Read by the digest when the file is unavailable, and by hand
-- when reconstructing a past day.

create table if not exists public.seo_reports (
  date date primary key,
  json jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.seo_reports is
  'One report JSON per day, the exact object render_seo_section() turns into the 08:30 digest block. Written by report.build; read by the digest and by hand for history.';

-- ===========================================================================
-- 10. seo_probe_results: answer-engine and SERP presence probes
-- ===========================================================================
-- Written weekly by weekly.probes (LLM engines) and weekly.competitor_watch
-- (engine 'google_desktop'). Read by the next probe round to compute
-- retained/gained/lost and the citation lock. cited IS NULL means the probe
-- could not be parsed, which is never counted as "not cited".

create table if not exists public.seo_probe_results (
  date date not null,
  query_id text not null,
  engine text not null,
  query text,
  bucket text,
  cited boolean,
  rank integer,
  url text,
  sources jsonb not null default '[]'::jsonb,
  error text,
  created_at timestamptz not null default now(),
  constraint seo_probe_results_pkey primary key (date, query_id, engine)
);

comment on table public.seo_probe_results is
  'One row per (date, query, engine) probe. Written by weekly.py probes and competitor_watch; read by the following round for retained/gained/lost and to set the citation lock. cited NULL = unparseable answer, never "not cited".';

create index if not exists seo_probe_results_date_idx
  on public.seo_probe_results (date desc);

create index if not exists seo_probe_results_query_idx
  on public.seo_probe_results (query_id, date desc);

-- ===========================================================================
-- 11. seo_crawl_hits: the bot crawl log
-- ===========================================================================
-- Written fire and forget by src/middleware.ts for verified bot user agents
-- only (Googlebot, Bingbot, GPTBot, ClaudeBot, PerplexityBot). Humans are
-- never logged, so there is no PII here. Read by indexing.crawl_hits_7d and
-- the report, and it is the only instrument that answers "is Google actually
-- fetching the pillar" between inspections.

create table if not exists public.seo_crawl_hits (
  hit_id bigint generated always as identity primary key,
  ts timestamptz not null default now(),
  url text not null,
  ua_class text not null,
  status integer,
  ua text
);

comment on table public.seo_crawl_hits is
  'Verified bot fetches of public pages. Written by the Next.js middleware (bots only, never humans, no PII). Read by indexing.crawl_hits_7d for the escalation ladder and by report.index_block for the pillar Googlebot count. ua_class values: googlebot, bingbot, gptbot, claudebot, perplexitybot.';

create index if not exists seo_crawl_hits_url_ts_idx
  on public.seo_crawl_hits (url, ts desc);

create index if not exists seo_crawl_hits_class_ts_idx
  on public.seo_crawl_hits (ua_class, ts desc);

-- ===========================================================================
-- updated_at touch trigger
-- ===========================================================================
-- Same shape as touch_blog_articles_updated_at() in 20260508_blog_articles.sql.

create or replace function public.touch_seo_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_seo_overrides_updated_at on public.seo_overrides;
create trigger trg_seo_overrides_updated_at
  before update on public.seo_overrides
  for each row execute function public.touch_seo_updated_at();

drop trigger if exists trg_seo_settings_updated_at on public.seo_settings;
create trigger trg_seo_settings_updated_at
  before update on public.seo_settings
  for each row execute function public.touch_seo_updated_at();

drop trigger if exists trg_seo_metrics_updated_at on public.seo_metrics;
create trigger trg_seo_metrics_updated_at
  before update on public.seo_metrics
  for each row execute function public.touch_seo_updated_at();

drop trigger if exists trg_seo_index_status_updated_at on public.seo_index_status;
create trigger trg_seo_index_status_updated_at
  before update on public.seo_index_status
  for each row execute function public.touch_seo_updated_at();

drop trigger if exists trg_seo_reports_updated_at on public.seo_reports;
create trigger trg_seo_reports_updated_at
  before update on public.seo_reports
  for each row execute function public.touch_seo_updated_at();

-- ===========================================================================
-- seo_apply_change: the one write path for an override
-- ===========================================================================
-- One transaction: snapshot the current row into history with its version,
-- write the one field, bump the version, stamp updated_at/updated_by, insert
-- the audit row, return that audit row as jsonb.
--
-- p_new is text on purpose: supa.apply_change() sends a string for every
-- field and json.dumps() anything that is not one, so a jsonb parameter would
-- fail PostgREST's function resolution. Booleans arrive as 'true'/'false',
-- expert_quote_id as a decimal string, related_links as a JSON array string.
--
-- p_field 'restore' takes {"version": n, "lock_until": "YYYY-MM-DD"} and puts
-- that history version back, which is the rollback path in measure.py. It is
-- the only field allowed through a locked_until window.

create or replace function public.seo_apply_change(
  p_idempotency_key text,
  p_kind text,
  p_slug text,
  p_field text,
  p_new text,
  p_reason text default null,
  p_source text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_change public.seo_changes;
  v_row public.seo_overrides;
  v_hist public.seo_overrides_history;
  v_old text;
  v_payload jsonb;
  v_bool boolean;
  v_int integer;
  v_json jsonb;
  v_date date;
  v_target_version integer;
  v_by text := coalesce(nullif(btrim(coalesce(p_source, '')), ''), 'seo_apply_change');
  v_now timestamptz := now();
begin
  if p_idempotency_key is null or btrim(p_idempotency_key) = '' then
    raise exception 'seo_apply_change: p_idempotency_key is required'
      using errcode = '22023';
  end if;

  -- Idempotency first, before any validation, so a retry after a network
  -- timeout returns the row that was already written and never raises.
  select * into v_change
    from public.seo_changes
   where idempotency_key = p_idempotency_key;
  if found then
    return to_jsonb(v_change);
  end if;

  if p_kind is null or p_kind not in ('insights', 'comparisons', 'pages') then
    raise exception 'seo_apply_change: invalid kind %, expected insights, comparisons or pages',
      coalesce(p_kind, 'null') using errcode = '22023';
  end if;

  if p_slug is null
     or length(p_slug) > 200
     or p_slug !~ '^[a-z0-9][a-z0-9-]*(/[a-z0-9][a-z0-9-]*)*$' then
    raise exception 'seo_apply_change: invalid slug %, expected lowercase path segments like best-payment-processors-2026 or glossary/interchange',
      coalesce(p_slug, 'null') using errcode = '22023';
  end if;

  if p_field is null or p_field not in (
       'meta_title', 'meta_description', 'title_absolute', 'h1_override',
       'related_links', 'aeo_answer', 'expert_quote_id', 'canonical',
       'noindex', 'citation_lock', 'cohort', 'locked_until', 'restore') then
    raise exception 'seo_apply_change: unknown field %', coalesce(p_field, 'null')
      using errcode = '22023';
  end if;

  -- Parse the typed fields up front so a bad value fails with its own message
  -- rather than somewhere inside the update.
  if p_field in ('title_absolute', 'noindex', 'citation_lock') then
    begin
      v_bool := nullif(btrim(p_new), '')::boolean;
    exception when others then
      raise exception 'seo_apply_change: % expects true or false, got %', p_field, left(coalesce(p_new, 'null'), 60)
        using errcode = '22023';
    end;
    if v_bool is null then
      raise exception 'seo_apply_change: % expects true or false, got an empty value', p_field
        using errcode = '22023';
    end if;
  elsif p_field = 'expert_quote_id' then
    begin
      v_int := nullif(btrim(p_new), '')::integer;
    exception when others then
      raise exception 'seo_apply_change: expert_quote_id expects an integer, got %', left(coalesce(p_new, 'null'), 60)
        using errcode = '22023';
    end;
    if v_int is not null and not exists (select 1 from public.seo_expert_quotes where id = v_int) then
      raise exception 'seo_apply_change: expert_quote_id % is not in seo_expert_quotes; quotes are curated, never generated', v_int
        using errcode = '23503';
    end if;
  elsif p_field = 'related_links' then
    begin
      v_json := nullif(btrim(p_new), '')::jsonb;
    exception when others then
      raise exception 'seo_apply_change: related_links expects a JSON array, got %', left(coalesce(p_new, 'null'), 80)
        using errcode = '22023';
    end;
    if v_json is not null and jsonb_typeof(v_json) <> 'array' then
      raise exception 'seo_apply_change: related_links expects a JSON array, got a %', jsonb_typeof(v_json)
        using errcode = '22023';
    end if;
  elsif p_field = 'locked_until' then
    begin
      v_date := nullif(btrim(p_new), '')::date;
    exception when others then
      raise exception 'seo_apply_change: locked_until expects YYYY-MM-DD, got %', left(coalesce(p_new, 'null'), 60)
        using errcode = '22023';
    end;
  elsif p_field = 'restore' then
    begin
      v_payload := coalesce(nullif(btrim(coalesce(p_new, '')), ''), '{}')::jsonb;
    exception when others then
      raise exception 'seo_apply_change: restore expects a JSON object, got %', left(coalesce(p_new, 'null'), 80)
        using errcode = '22023';
    end;
    if jsonb_typeof(v_payload) <> 'object' then
      raise exception 'seo_apply_change: restore expects a JSON object, got a %', jsonb_typeof(v_payload)
        using errcode = '22023';
    end if;
    v_target_version := nullif(v_payload ->> 'version', '')::integer;
    v_date := nullif(v_payload ->> 'lock_until', '')::date;
  end if;

  -- Make sure the row exists, then take it for update so two concurrent runs
  -- serialise on this page instead of racing the version bump.
  insert into public.seo_overrides (kind, slug, updated_by)
  values (p_kind, p_slug, v_by)
  on conflict (kind, slug) do nothing;

  select * into v_row
    from public.seo_overrides
   where kind = p_kind and slug = p_slug
     for update;

  -- locked_until: refuse loudly. A restore is the documented way out.
  if p_field <> 'restore'
     and v_row.locked_until is not null
     and v_row.locked_until >= current_date then
    raise exception 'seo_apply_change: %/% is locked until % after a rollback; field % refused, only restore may write',
      p_kind, p_slug, v_row.locked_until, p_field
      using errcode = '55006';
  end if;

  -- Snapshot the row as it is now, carrying the version it currently holds.
  -- on conflict do nothing keeps the RPC re-entrant: one snapshot per version.
  insert into public.seo_overrides_history (
    kind, slug, version, meta_title, meta_description, title_absolute, h1_override,
    related_links, aeo_answer, expert_quote_id, canonical, noindex, citation_lock,
    cohort, locked_until, updated_by, changed_field, changed_reason)
  values (
    v_row.kind, v_row.slug, v_row.version, v_row.meta_title, v_row.meta_description,
    v_row.title_absolute, v_row.h1_override, v_row.related_links, v_row.aeo_answer,
    v_row.expert_quote_id, v_row.canonical, v_row.noindex, v_row.citation_lock,
    v_row.cohort, v_row.locked_until, v_row.updated_by, p_field, p_reason)
  on conflict (kind, slug, version) do nothing;

  if p_field = 'restore' then
    select * into v_hist
      from public.seo_overrides_history
     where kind = p_kind
       and slug = p_slug
       and version <> v_row.version
       and (v_target_version is null or version = v_target_version)
     order by version desc
     limit 1;
    if not found then
      raise exception 'seo_apply_change: no history version % for %/% to restore',
        coalesce(v_target_version::text, 'newest'), p_kind, p_slug
        using errcode = 'P0002';
    end if;

    v_old := format('version %s', v_row.version);

    update public.seo_overrides set
      meta_title       = v_hist.meta_title,
      meta_description = v_hist.meta_description,
      title_absolute   = coalesce(v_hist.title_absolute, false),
      h1_override      = v_hist.h1_override,
      related_links    = v_hist.related_links,
      aeo_answer       = v_hist.aeo_answer,
      expert_quote_id  = v_hist.expert_quote_id,
      canonical        = v_hist.canonical,
      noindex          = coalesce(v_hist.noindex, false),
      citation_lock    = coalesce(v_hist.citation_lock, citation_lock),
      cohort           = v_hist.cohort,
      locked_until     = coalesce(v_date, v_hist.locked_until),
      version          = v_row.version + 1,
      updated_by       = v_by,
      updated_at       = v_now
    where kind = p_kind and slug = p_slug;
  else
    v_old := case p_field
      when 'meta_title'       then v_row.meta_title
      when 'meta_description' then v_row.meta_description
      when 'h1_override'      then v_row.h1_override
      when 'aeo_answer'       then v_row.aeo_answer
      when 'canonical'        then v_row.canonical
      when 'cohort'           then v_row.cohort
      when 'title_absolute'   then v_row.title_absolute::text
      when 'noindex'          then v_row.noindex::text
      when 'citation_lock'    then v_row.citation_lock::text
      when 'expert_quote_id'  then v_row.expert_quote_id::text
      when 'related_links'    then v_row.related_links::text
      when 'locked_until'     then v_row.locked_until::text
    end;

    update public.seo_overrides set
      meta_title       = case when p_field = 'meta_title'       then p_new  else meta_title end,
      meta_description = case when p_field = 'meta_description' then p_new  else meta_description end,
      h1_override      = case when p_field = 'h1_override'      then p_new  else h1_override end,
      aeo_answer       = case when p_field = 'aeo_answer'       then p_new  else aeo_answer end,
      canonical        = case when p_field = 'canonical'        then p_new  else canonical end,
      cohort           = case when p_field = 'cohort'           then p_new  else cohort end,
      title_absolute   = case when p_field = 'title_absolute'   then v_bool else title_absolute end,
      noindex          = case when p_field = 'noindex'          then v_bool else noindex end,
      citation_lock    = case when p_field = 'citation_lock'    then v_bool else citation_lock end,
      expert_quote_id  = case when p_field = 'expert_quote_id'  then v_int  else expert_quote_id end,
      related_links    = case when p_field = 'related_links'    then v_json else related_links end,
      locked_until     = case when p_field = 'locked_until'     then v_date else locked_until end,
      version          = v_row.version + 1,
      updated_by       = v_by,
      updated_at       = v_now
    where kind = p_kind and slug = p_slug;
  end if;

  insert into public.seo_changes (
    idempotency_key, kind, slug, field, old, new, reason, source, status, applied_at)
  values (
    p_idempotency_key, p_kind, p_slug, p_field, v_old, p_new, p_reason, p_source, 'applied', v_now)
  on conflict (idempotency_key) do nothing
  returning * into v_change;

  -- A concurrent call won the insert: return its row rather than raising.
  if v_change.change_id is null then
    select * into v_change from public.seo_changes where idempotency_key = p_idempotency_key;
  end if;

  return to_jsonb(v_change);
end;
$$;

comment on function public.seo_apply_change(text, text, text, text, text, text, text) is
  'The only write path for seo_overrides. One transaction: snapshot the current row into seo_overrides_history with its version, write the single field, bump version, stamp updated_at and updated_by, insert the seo_changes audit row, return it as jsonb. Idempotent on p_idempotency_key. Refuses an invalid kind, an invalid slug, an unknown field and a row inside its locked_until window (restore excepted). Called only by the Hermes loop through supa.apply_change().';

revoke all on function public.seo_apply_change(text, text, text, text, text, text, text) from public;
revoke all on function public.seo_apply_change(text, text, text, text, text, text, text) from anon, authenticated;
grant execute on function public.seo_apply_change(text, text, text, text, text, text, text) to service_role;

-- ===========================================================================
-- Row level security: service role only, one policy per table
-- ===========================================================================
-- Every one of these tables is loop and server infrastructure. The override
-- layer reads seo_overrides with getAdminSupabase() (service role), so no
-- anon or authenticated grant is needed anywhere here.

alter table public.seo_expert_quotes enable row level security;
drop policy if exists "seo_expert_quotes_service_all" on public.seo_expert_quotes;
create policy "seo_expert_quotes_service_all"
  on public.seo_expert_quotes for all to service_role using (true) with check (true);
revoke all on table public.seo_expert_quotes from anon, authenticated;
grant all on table public.seo_expert_quotes to service_role;

alter table public.seo_overrides enable row level security;
drop policy if exists "seo_overrides_service_all" on public.seo_overrides;
create policy "seo_overrides_service_all"
  on public.seo_overrides for all to service_role using (true) with check (true);
revoke all on table public.seo_overrides from anon, authenticated;
grant all on table public.seo_overrides to service_role;

alter table public.seo_overrides_history enable row level security;
drop policy if exists "seo_overrides_history_service_all" on public.seo_overrides_history;
create policy "seo_overrides_history_service_all"
  on public.seo_overrides_history for all to service_role using (true) with check (true);
revoke all on table public.seo_overrides_history from anon, authenticated;
grant all on table public.seo_overrides_history to service_role;

alter table public.seo_changes enable row level security;
drop policy if exists "seo_changes_service_all" on public.seo_changes;
create policy "seo_changes_service_all"
  on public.seo_changes for all to service_role using (true) with check (true);
revoke all on table public.seo_changes from anon, authenticated;
grant all on table public.seo_changes to service_role;

alter table public.seo_metrics enable row level security;
drop policy if exists "seo_metrics_service_all" on public.seo_metrics;
create policy "seo_metrics_service_all"
  on public.seo_metrics for all to service_role using (true) with check (true);
revoke all on table public.seo_metrics from anon, authenticated;
grant all on table public.seo_metrics to service_role;

alter table public.seo_index_status enable row level security;
drop policy if exists "seo_index_status_service_all" on public.seo_index_status;
create policy "seo_index_status_service_all"
  on public.seo_index_status for all to service_role using (true) with check (true);
revoke all on table public.seo_index_status from anon, authenticated;
grant all on table public.seo_index_status to service_role;

alter table public.seo_runs enable row level security;
drop policy if exists "seo_runs_service_all" on public.seo_runs;
create policy "seo_runs_service_all"
  on public.seo_runs for all to service_role using (true) with check (true);
revoke all on table public.seo_runs from anon, authenticated;
grant all on table public.seo_runs to service_role;

alter table public.seo_settings enable row level security;
drop policy if exists "seo_settings_service_all" on public.seo_settings;
create policy "seo_settings_service_all"
  on public.seo_settings for all to service_role using (true) with check (true);
revoke all on table public.seo_settings from anon, authenticated;
grant all on table public.seo_settings to service_role;

alter table public.seo_reports enable row level security;
drop policy if exists "seo_reports_service_all" on public.seo_reports;
create policy "seo_reports_service_all"
  on public.seo_reports for all to service_role using (true) with check (true);
revoke all on table public.seo_reports from anon, authenticated;
grant all on table public.seo_reports to service_role;

alter table public.seo_probe_results enable row level security;
drop policy if exists "seo_probe_results_service_all" on public.seo_probe_results;
create policy "seo_probe_results_service_all"
  on public.seo_probe_results for all to service_role using (true) with check (true);
revoke all on table public.seo_probe_results from anon, authenticated;
grant all on table public.seo_probe_results to service_role;

alter table public.seo_crawl_hits enable row level security;
drop policy if exists "seo_crawl_hits_service_all" on public.seo_crawl_hits;
create policy "seo_crawl_hits_service_all"
  on public.seo_crawl_hits for all to service_role using (true) with check (true);
revoke all on table public.seo_crawl_hits from anon, authenticated;
grant all on table public.seo_crawl_hits to service_role;

-- ===========================================================================
-- Seed the two switches in their safe position.
-- ===========================================================================
-- The loop starts in shadow: it may read and keep its own books, it may not
-- touch an override until three clean consecutive runs promote it.

insert into public.seo_settings (key, value) values
  ('loop_enabled', 'true'::jsonb),
  ('apply_enabled', 'false'::jsonb)
on conflict (key) do nothing;

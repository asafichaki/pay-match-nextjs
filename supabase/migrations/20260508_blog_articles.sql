-- Phase 6 SEO autopilot: extend existing blog_articles + add support tables.
-- blog_articles already exists from the project bootstrap; we only ADD what autopilot needs.

create extension if not exists vector;

alter table public.blog_articles
  add column if not exists kind text,
  add column if not exists body_html text,
  add column if not exists faq_json jsonb,
  add column if not exists sources_json jsonb,
  add column if not exists schema_json jsonb,
  add column if not exists audio_url text,
  add column if not exists video_url text,
  add column if not exists youtube_id text,
  add column if not exists slide_image_urls text[],
  add column if not exists voice_score smallint,
  add column if not exists da_score smallint,
  add column if not exists embedding vector(1536),
  add column if not exists internal_links text[],
  add column if not exists is_autopilot boolean not null default false,
  add column if not exists autopilot_run_id uuid,
  add column if not exists index_in_sitemap boolean not null default true;

-- Backfill kind on any pre-existing rows so the check constraint is safe.
update public.blog_articles
set kind = 'insights'
where kind is null;

alter table public.blog_articles
  alter column kind set not null,
  add constraint blog_articles_kind_check check (kind in ('insights', 'comparisons')) not valid;

alter table public.blog_articles validate constraint blog_articles_kind_check;

-- Slug must be unique per kind so /insights/foo and /comparisons/foo can both exist.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'blog_articles_kind_slug_key'
  ) then
    alter table public.blog_articles add constraint blog_articles_kind_slug_key unique (kind, slug);
  end if;
end $$;

create index if not exists blog_articles_published_idx
  on public.blog_articles (kind, published, published_at desc);

create index if not exists blog_articles_slug_idx
  on public.blog_articles (slug);

create index if not exists blog_articles_embedding_idx
  on public.blog_articles using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

alter table public.blog_articles enable row level security;

drop policy if exists "blog_articles_public_read" on public.blog_articles;
create policy "blog_articles_public_read"
  on public.blog_articles for select
  to anon, authenticated
  using (published = true);

drop policy if exists "blog_articles_service_all" on public.blog_articles;
create policy "blog_articles_service_all"
  on public.blog_articles for all
  to service_role using (true) with check (true);

create or replace function public.match_blog_article_embedding(
  query_embedding vector(1536),
  match_threshold float default 0.55,
  match_count int default 10,
  exclude_slug text default null
)
returns table (
  id uuid,
  slug text,
  kind text,
  title text,
  similarity float
)
language sql stable as $$
  select
    a.id,
    a.slug,
    a.kind,
    a.title,
    1 - (a.embedding <=> query_embedding) as similarity
  from public.blog_articles a
  where a.embedding is not null
    and a.published = true
    and (exclude_slug is null or a.slug <> exclude_slug)
    and 1 - (a.embedding <=> query_embedding) >= match_threshold
  order by a.embedding <=> query_embedding
  limit match_count;
$$;

create or replace function public.touch_blog_articles_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_blog_articles_updated_at on public.blog_articles;
create trigger trg_blog_articles_updated_at
  before update on public.blog_articles
  for each row execute function public.touch_blog_articles_updated_at();

-- Class A protection: high-impression articles autopilot must never edit.
create table if not exists public.blog_articles_protected (
  slug text primary key,
  reason text not null,
  added_at timestamptz not null default now()
);

alter table public.blog_articles_protected enable row level security;

drop policy if exists "blog_articles_protected_service_all" on public.blog_articles_protected;
create policy "blog_articles_protected_service_all"
  on public.blog_articles_protected for all to service_role using (true) with check (true);

-- Autopilot run audit trail.
create table if not exists public.autopilot_runs (
  id uuid primary key default gen_random_uuid(),
  track text not null check (track in ('comparison', 'deepdive')),
  topic text,
  slug text,
  mode text not null check (mode in ('shadow', 'review', 'live')),
  status text not null check (status in ('started', 'gated_pass', 'gated_fail', 'rewriting', 'published', 'rejected', 'errored')),
  voice_score smallint,
  da_score smallint,
  rewrites smallint not null default 0,
  cost_usd numeric(10,4),
  notes text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

alter table public.autopilot_runs enable row level security;

drop policy if exists "autopilot_runs_service_all" on public.autopilot_runs;
create policy "autopilot_runs_service_all"
  on public.autopilot_runs for all to service_role using (true) with check (true);

create index if not exists autopilot_runs_started_idx
  on public.autopilot_runs (started_at desc);

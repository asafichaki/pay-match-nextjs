# Hermes SEO, Phase 0: the daily indexing ping

The one daily Hermes cron approved by Assaf on 2026-08-25 as an explicit exception to the 2026-07-14 "no crons" decision. Plan: `~/.claude/plans/lovely-leaping-gadget.md`, section "Phase 0".

What it does, once a day at 06:20 Israel time:

1. Reads `blog_articles` (PostgREST, `published=true`, `updated_at >= now-7d`) and builds `SITE_BASE/{kind}/{slug}` for each row.
2. Adds the lines of `SEED_URLS_FILE` (the 15 URLs shipped 08-17/08-19 plus the high-risk pillar).
3. Dedupes and POSTs the list once to `https://api.indexnow.org/indexnow` and once to `https://www.bing.com/indexnow` with the key `ececeafbb53f493babf094ce355c8b7f` (key file is live at `SITE_BASE/<key>.txt`).
4. Calls GSC `sitemaps().submit()` for `SITE_BASE/sitemap.xml` with the service account.
5. Prints one JSON line: `{"ts","urls","indexnow":{"api","bing"},"sitemap_submit"}`.

Honest framing: IndexNow reaches Bing and Copilot only. Google ignores it. The Bing index count is this cron's KPI. The sitemap submit is the only Google-facing signal here.

## Files

| Repo | Hermes |
|---|---|
| `ping.py` | `/opt/mypayadvisor-seo/ping.py` |
| `run-ping.sh` | `/opt/mypayadvisor-seo/run-ping.sh` |
| `cron.d/mypayadvisor-seo` | `/etc/cron.d/mypayadvisor-seo` (644, root) |
| not in git | `/opt/mypayadvisor-seo/.env` (600) |
| not in git | `/opt/mypayadvisor-seo/seed-urls.txt` |
| | `/var/log/mypayadvisor-seo.log` |

## Env (`/opt/mypayadvisor-seo/.env`)

```
SUPABASE_URL=            same value as /opt/mypayadvisor-leads-sheet/.env
SUPABASE_SERVICE_ROLE_KEY=   same value as /opt/mypayadvisor-leads-sheet/.env
GSC_SA_JSON=/root/.credentials/gsc-agent-sa.json
GSC_SITE=sc-domain:mypayadvisor.com
SITE_BASE=https://www.mypayadvisor.com
INDEXNOW_KEY=ececeafbb53f493babf094ce355c8b7f
SEED_URLS_FILE=/opt/mypayadvisor-seo/seed-urls.txt
```

The service account is `gsc-agent@seo-agent-487614.iam.gserviceaccount.com` (siteOwner on the property). If it ever returns 403 on `sitemaps.submit`, the script logs it and still exits 0.

## Run by hand

```
/opt/mypayadvisor-seo/run-ping.sh --dry-run   # prints the URL set, no POST
/opt/mypayadvisor-seo/run-ping.sh             # real run
tail -3 /var/log/mypayadvisor-seo.log
```

Local dry run on the Mac: export `SUPABASE_URL` from `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`, `SUPABASE_SERVICE_ROLE_KEY` from the same file, `GSC_SA_JSON` to the local copy of the SA key, then `python3 ops/hermes-seo/ping.py --dry-run`.

## Exit codes

- `0`: normal, including a 403 from GSC or one IndexNow endpoint failing.
- `1`: both IndexNow endpoints failed.
- `2`: a required env var is missing.

## Dependencies

Python 3.12 on Hermes with `requests` and `google-api-python-client` already installed. No new packages.

Phase 3 replaces the scp'd files with a git checkout under `/opt/mypayadvisor-seo/repo` and folds this ping into the daily loop. Until then this directory holds exactly these four files.

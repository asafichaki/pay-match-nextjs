# myPayAdvisor SEO loop (Hermes)

Phase 3 of the 30-day SEO autopilot plan. One daily cron reads GSC truth,
watches indexation, trims titles against a holdout, writes related links and
answer blocks through one validating RPC, measures cohorts, checks health and
writes the JSON the 08:30 portfolio digest renders. Python 3.12, stdlib plus
`requests`, `google-api-python-client`, `google-auth`, `google-genai`.
No supabase client, no Anthropic SDK, no `claude`/`codex` CLI, ever.

```
main.py         subcommands: daily | weekly | measure | probe | health | report | import-baseline <json>
                flags: --dry-run  --limit N  --date YYYY-MM-DD  --force
config.py       env names, caps, cornerstones, 308'd losers, tracked-set builder
supa.py         PostgREST GET/POST/PATCH/upsert, the RPC caller, 5xx retry, "table missing" degrade
ledger.py       run lock (seo_runs unique run_date+kind, 2h stale), step ledger, spend, kill switches, promotion
rules.py        rules.json loader, validate_title/meta/answer, self_test with 6 planted failures
gsc.py          Search Analytics (D-10..D-3 final), URL Inspection, sitemap submit, bot-query rule
llm.py          Gemini Flash JSON, Gemini Pro judge, Anthropic/OpenAI via requests, DataForSEO one-task SERP
pages.py        fetch (+no-cache Googlebot poll), per-run cache, HTML extractors
changes.py      propose_or_apply (idempotency, RPC, lean revalidate), async verification state machine
indexing.py     IndexNow batch, index watch, escalation ladder, day-0 baseline import
titles.py       batch 1 deterministic trims + holdout + waves, batch 2 LLM titles, H1 rule
links.py        related-links scoring, cannibalization detector
aeo.py          answer blocks from the page's own table/verdict, expert quotes by topic match only
measure.py      cohort read vs holdout, advisory flags, real rollback via history
health.py       sitemap/robots/llms/JSON-LD/bylines/401/parity/citation-worthiness
weekly.py       probes (24 queries), citation-loss handling, competitor watch + Google presence, Bing, backlinks
report.py       the JSON contract -> {SEO_STATE_DIR}/report-YYYY-MM-DD.json + seo_reports
run.sh          git pull --ff-only, RULES parity check, exec main.py
cron.d/         15 6 daily, 45 6 Mon weekly, 40 7 report (Asia/Jerusalem)
data/           probe-queries.json (24), money-queries.json (14)
tests/          python3 -m unittest discover
```

## Modes

| Mode | When | Writes |
|---|---|---|
| dry-run | `--dry-run`, or `SEO_APPLY_ENABLED` is not `1` (the default) | none on the network; local report only |
| shadow | env `SEO_LOOP_ENABLED=1` and `SEO_APPLY_ENABLED=1`, DB `apply_enabled=false` (starting state) | bookkeeping: seo_runs, seo_metrics, seo_index_status, seo_changes (proposed), seo_settings, seo_reports, seo_probe_results, IndexNow |
| apply | shadow plus DB `apply_enabled=true`, rules self-test clean, RULES parity ok, health green, spend under cap | overrides through `seo_apply_change` + lean revalidate |

Promotion shadow -> apply is automatic: 3 consecutive daily runs with every
step ok, self-test clean, health green, parity ok and >= 5 proposals flip
`seo_settings.apply_enabled` to true (`auto_promote=false` in seo_settings
disables that). Batch-1 trims need no LLM and are the first thing applied.

## Deploy (Hermes)

```
mkdir -p /opt/mypayadvisor-seo /var/lib/mypayadvisor-seo /opt/mypayadvisor-seo/credentials
git clone git@github.com:<org>/pay-match-nextjs.git /opt/mypayadvisor-seo/repo   # deploy key from the git-mirror cron
ln -sf /opt/mypayadvisor-seo/repo/ops/hermes-seo/run.sh /opt/mypayadvisor-seo/run.sh
cp ops/hermes-seo/.env.example /opt/mypayadvisor-seo/.env && chmod 600 /opt/mypayadvisor-seo/.env   # fill it
python3 -m pip install requests google-api-python-client google-auth google-genai
cp ops/hermes-seo/cron.d/mypayadvisor-seo-loop /etc/cron.d/ && rm -f /etc/cron.d/mypayadvisor-seo   # replaces the Phase 0 ping cron
/opt/mypayadvisor-seo/run.sh daily --dry-run --limit 3
/opt/mypayadvisor-seo/run.sh import-baseline /path/to/index-baseline-2026-08-26.json   # once, seeds check1_rewrite_rate=0.45 and loop_start_date
```

`run.sh` does `git pull --ff-only` on every run; the code version is in the
mail. Never scp files to Hermes.

## Dry-run on the Mac

```
cd ops/hermes-seo
export SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... GSC_SA_JSON=... GEMINI_API_KEY=... SEO_STATE_DIR=/tmp/mpa-seo
python3 main.py daily --dry-run --limit 3
python3 main.py health --dry-run
python3 main.py report --dry-run
python3 -m unittest discover
```

Before the migration lands, every table read prints `warn: <table>: table
missing` and continues; nothing crashes.

## Kill switches

* `SEO_LOOP_ENABLED=0` in `/opt/mypayadvisor-seo/.env`: the run exits at start.
* `SEO_APPLY_ENABLED=0`: every write becomes a dry-run write (nothing on the network).
* `seo_settings` rows `loop_enabled` / `apply_enabled` (jsonb `true`/`false`): ANDed with the env, re-read before every override write. Flip with one SQL `update seo_settings set value='false' where key='apply_enabled'`.
* Automatic offs: rules self-test failure, RULES parity mismatch, two consecutive sitemap/robots failures, monthly spend over $30. Reason is stored in `seo_settings.apply_disabled_reason` and printed in red in the mail.

## Key rotation

`SUPABASE_SERVICE_ROLE_KEY` and `AUTOPILOT_SECRET` live only in
`/opt/mypayadvisor-seo/.env` (Hermes) and Vercel. Rotate: set the new value
in Vercel, redeploy, update the `.env`, run `run.sh health --dry-run` (checks
the revalidate route still returns 401 on a bad token). The GSC service
account JSON is the same file the leads sync uses; rotating it means a new
key in Google Cloud and a new file at `GSC_SA_JSON`.

## Force a restore

A real rollback restores the previous `seo_overrides_history` version through
the RPC with field `restore` and locks the page 30 days. To force one by hand
(for the first-apply-day verification):

```
select version from seo_overrides_history where kind='comparisons' and slug='square-vs-stripe' order by version desc limit 1;
select seo_apply_change('manual-restore-square-vs-stripe-1', 'comparisons', 'square-vs-stripe', 'restore',
  '{"version": <n>, "lock_until": "2026-10-01"}', 'manual restore test', 'human');
curl -X POST -H "Authorization: Bearer $AUTOPILOT_SECRET" -H 'content-type: application/json' \
  -d '{"kind":"comparisons","slug":"square-vs-stripe","lean":true}' https://www.mypayadvisor.com/api/autopilot/revalidate
```

Then poll `curl -A Googlebot -H 'Cache-Control: no-cache' .../comparisons/square-vs-stripe | grep '<title>'`
twice; the next daily run reports it under Changes.

## Contract notes for PR 2 / the migration

* `seo_apply_change(p_idempotency_key, p_kind, p_slug, p_field, p_new, p_reason, p_source)`; fields used: `meta_title`, `meta_description`, `title_absolute`, `h1_override`, `related_links` (JSON string), `aeo_answer`, `expert_quote_id`, `restore` (JSON `{"version", "lock_until"}`). The RPC takes one field per call, so a title trim is three calls back to back (meta_title, title_absolute, h1_override) under the same reason; if atomicity across the three matters, add a composite field and this loop only needs `changes.propose_or_apply` extended.
* Proposal rows use `idempotency_key = 'proposed:' + key` so the later apply gets a fresh key.
* `seo_probe_results` is upserted on `(date, query_id, engine)`; `seo_metrics` on `(date, page, device, country)`; `seo_index_status` on `url`; `seo_settings` on `key`; `seo_reports` on `date`; `seo_runs` on `(run_date, kind)`.
* `seo_settings` keys written: `loop_enabled`, `apply_enabled`, `apply_enabled_at`, `apply_disabled_reason`, `auto_promote`, `bot_queries`, `holdout`, `title_waves`, `title_wave_a_from`, `llm_titles_from`, `verification`, `escalation`, `aeo_refresh_queue`, `inspect_extra`, `citation_lock`, `probe_summary`, `competitor_hashes`, `bing_index`, `backlinks_summary`, `health_fail_streak`, `index_classes`, `check1_rewrite_rate`, `loop_start_date`.
* IndexNow pings are Bing/Copilot only and are the one external send besides the digest; they are skipped in dry-run and never gated on `apply_enabled`.

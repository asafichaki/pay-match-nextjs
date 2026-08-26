#!/usr/bin/env node
/**
 * PR 1 follow-up: unpublish the two duplicate comparison rows AFTER the deploy
 * that ships their 308 redirects (next.config.ts) has gone live.
 *
 *   stripe-vs-square-2026  -> 308 -> /comparisons/square-vs-stripe
 *   stripe-vs-helcim-2026  -> 308 -> /comparisons/helcim-vs-stripe
 *
 * Order matters: redirect first, then unpublish. Unpublishing first would 404
 * the loser URLs for the window between the row update and the deploy.
 *
 * Usage (from the repo root, reads NEXT_PUBLIC_SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY from .env.local or the environment):
 *
 *   node scripts/seo/pr1-unpublish-losers.mjs            # dry run: prints the rows and the statements
 *   node scripts/seo/pr1-unpublish-losers.mjs --apply    # runs the two updates, then reads back
 *
 * Statements (PostgREST PATCH, equivalent SQL):
 *   UPDATE blog_articles SET published = false, index_in_sitemap = false
 *     WHERE kind = 'comparisons' AND slug = 'stripe-vs-square-2026';
 *   UPDATE blog_articles SET published = false, index_in_sitemap = false
 *     WHERE kind = 'comparisons' AND slug = 'stripe-vs-helcim-2026';
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const APPLY = process.argv.includes("--apply");

const LOSERS = [
  { kind: "comparisons", slug: "stripe-vs-square-2026", winner: "/comparisons/square-vs-stripe" },
  { kind: "comparisons", slug: "stripe-vs-helcim-2026", winner: "/comparisons/helcim-vs-stripe" },
];

function loadEnv() {
  const env = { ...process.env };
  const file = path.join(ROOT, ".env.local");
  if (existsSync(file)) {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return env;
}

const env = loadEnv();
const URL_BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_BASE || !KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

async function readRow(l) {
  const q = `${URL_BASE}/rest/v1/blog_articles?select=id,kind,slug,published,index_in_sitemap,updated_at&kind=eq.${l.kind}&slug=eq.${l.slug}`;
  const r = await fetch(q, { headers });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  const rows = await r.json();
  return rows[0] ?? null;
}

async function liveRedirectOk(l) {
  try {
    const r = await fetch(`https://www.mypayadvisor.com${"/" + l.kind + "/" + l.slug}`, { redirect: "manual" });
    const loc = r.headers.get("location") || "";
    return { status: r.status, location: loc, ok: (r.status === 308 || r.status === 301) && loc.endsWith(l.winner) };
  } catch (e) {
    return { status: 0, location: "", ok: false, error: String(e) };
  }
}

for (const l of LOSERS) {
  const before = await readRow(l);
  const live = await liveRedirectOk(l);
  console.log(`\n${l.kind}/${l.slug}`);
  console.log(`  row before : ${before ? JSON.stringify(before) : "NOT FOUND"}`);
  console.log(`  live check : ${live.status} ${live.location}${live.ok ? "  (redirect live)" : "  (REDIRECT NOT LIVE YET)"}`);
  console.log(`  statement  : UPDATE blog_articles SET published = false, index_in_sitemap = false WHERE kind = '${l.kind}' AND slug = '${l.slug}';`);

  if (!APPLY) {
    console.log("  dry run    : no change (pass --apply to execute)");
    continue;
  }
  if (!before) {
    console.log("  skipped    : row not found");
    continue;
  }
  if (!live.ok) {
    console.log("  refused    : the 308 is not live yet; deploy first, then re-run with --apply");
    process.exitCode = 2;
    continue;
  }
  const r = await fetch(`${URL_BASE}/rest/v1/blog_articles?kind=eq.${l.kind}&slug=eq.${l.slug}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify({ published: false, index_in_sitemap: false }),
  });
  if (!r.ok) {
    console.log(`  FAILED     : ${r.status} ${await r.text()}`);
    process.exitCode = 1;
    continue;
  }
  const after = await readRow(l);
  console.log(`  row after  : ${JSON.stringify(after)}`);
}

console.log(APPLY ? "\nDone. Next: revalidate /sitemap.xml and /comparisons (they are ISR) or wait for the hourly refresh." : "\nDry run complete.");

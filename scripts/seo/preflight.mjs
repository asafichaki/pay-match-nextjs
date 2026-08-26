#!/usr/bin/env node
/**
 * Prebuild gate: a PRODUCTION build must be able to read the override layer.
 *
 * `src/lib/seo/overrides.ts` resolves to `null` on any error, by design: a
 * Supabase blip must not 500 an article page, it must render its base
 * metadata. The cost of that design is that a production deployment with a
 * missing `SUPABASE_SERVICE_ROLE_KEY`, or against a project where the tables
 * were never applied, would build green, deploy green, serve 200s, and quietly
 * ignore every override the loop had written. Nothing would go red. The loop
 * would keep writing rows, keep polling for its own change, keep recording
 * `verification_pending`, and nobody would know for days.
 *
 * So the failure is moved to the one place where it is loud and free: the
 * build.
 *
 * Scope: `VERCEL_ENV === "production"` only. A local `npm run build` and a
 * preview deployment are a no-op, because neither is allowed to be the thing
 * that bakes wrong metadata for real traffic.
 */

const IS_PRODUCTION = process.env.VERCEL_ENV === "production";

function skip(reason) {
  console.log(`[seo-preflight] skipped (${reason})`);
  process.exit(0);
}

function fail(message, detail) {
  console.error(`[seo-preflight] PRODUCTION BUILD BLOCKED: ${message}`);
  if (detail) console.error(`[seo-preflight]   ${detail}`);
  console.error(
    "[seo-preflight] A production build without the override layer would serve base metadata\n" +
      "[seo-preflight] and silently discard everything the SEO loop has applied. Fix the env or\n" +
      "[seo-preflight] the database, then rebuild.",
  );
  process.exit(1);
}

if (!IS_PRODUCTION) {
  skip(`VERCEL_ENV=${process.env.VERCEL_ENV ?? "unset"}`);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) fail("NEXT_PUBLIC_SUPABASE_URL is not set");
if (!key) fail("SUPABASE_SERVICE_ROLE_KEY is not set");

// One cheap read. `limit=0` returns headers and an empty body, so this proves
// the table exists and the key can reach it without transferring rows.
const endpoint = `${url}/rest/v1/seo_overrides?select=kind,slug&limit=1`;
let res;
try {
  res = await fetch(endpoint, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(20000),
  });
} catch (err) {
  fail("seo_overrides is unreachable", err instanceof Error ? err.message : String(err));
}

if (!res.ok) {
  const body = await res.text().catch(() => "");
  fail(`seo_overrides returned HTTP ${res.status}`, body.slice(0, 300));
}

// A row shape check, so a table that exists but has been altered out from
// under the reader is caught here too.
const rows = await res.json().catch(() => null);
if (!Array.isArray(rows)) {
  fail("seo_overrides did not return a row array");
}

console.log(`[seo-preflight] ok: seo_overrides reachable at ${new URL(url).host} (${rows.length} sample row(s))`);

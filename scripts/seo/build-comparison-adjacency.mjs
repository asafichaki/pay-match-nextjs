#!/usr/bin/env node
/**
 * Generates src/lib/comparisons/adjacency.generated.ts: a static, deterministic
 * adjacency list that gives every comparison page six sibling comparisons.
 *
 * Why a generated file and not a runtime query: the "Compare more" grid is
 * ARCHITECTURE, not an override. It has to be identical on every render, has to
 * exist for a crawler that fetches one page cold, and must never depend on
 * seo_overrides (which the daily loop owns). The loop's related_links block is a
 * separate, additive list rendered under a different heading.
 *
 * Scoring, per candidate, highest first:
 *   +3 per shared processor brand token   (square-vs-stripe <-> stripe-vs-stax)
 *   +2 same section                       (brand duel / volume / use case / high risk)
 *   +2 both are volume-tier pages, weighted by how adjacent the tiers are
 *   +1 per shared descriptive slug token  (ecommerce, restaurants, funding, ...)
 *   +2 shared concept family (storefront, online, professional, recurring, ...)
 *   +2 the all-tiers cornerstone
 * Ties break on a static prominence order then slug, so output is byte-stable.
 *
 * Coverage pass: any comparison with fewer than MIN_INBOUND inbound tiles is
 * forced into the adjacency of its best-matching pages, replacing the weakest
 * tile there. Without it a purely greedy top-6 leaves the least-connected pages
 * exactly as orphaned as they started, which is the bug this PR exists to fix.
 *
 * Usage: node scripts/seo/build-comparison-adjacency.mjs
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (reads
 * blog_articles for the DB-backed comparisons; static shells are read from disk).
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TILES = 6;
const MIN_INBOUND = 3;
const BACKFILL = 6;

// ---------------------------------------------------------------- env

function loadEnvLocal() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const i = line.indexOf("=");
    if (i < 1 || line.trim().startsWith("#")) continue;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim().replace(/^"|"$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

// ---------------------------------------------------------------- inputs

const REDIRECTED = new Set(["stripe-vs-square-2026", "stripe-vs-helcim-2026"]);

function readStaticShells() {
  const dir = path.join(ROOT, "src", "app", "(public)", "comparisons");
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name.startsWith("[") || e.name.startsWith("_")) continue;
    if (REDIRECTED.has(e.name)) continue;
    const file = path.join(dir, e.name, "page.tsx");
    if (!fs.existsSync(file)) continue;
    const src = fs.readFileSync(file, "utf8");
    const title =
      src.match(/title:\s*\{\s*absolute:\s*["'`]([^"'`]+)["'`]/)?.[1] ||
      src.match(/(?:const baseMetadata|export const metadata)[\s\S]{0,400}?title:\s*["'`]([^"'`]+)["'`]/)?.[1] ||
      src.match(/metaTitle/)?.[0] ||
      null;
    out.push({ slug: e.name, title, source: "static" });
  }
  return out;
}

function readTierTitles() {
  const file = path.join(ROOT, "src", "lib", "comparisons", "volume-tiers.ts");
  const src = fs.readFileSync(file, "utf8");
  const map = new Map();
  const re = /slug:\s*"([^"]+)"[\s\S]*?heroH1:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(src))) map.set(m[1], m[2]);
  return map;
}

async function readDbComparisons() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY required");
  const res = await fetch(
    `${url}/rest/v1/blog_articles?select=slug,title&kind=eq.comparisons&published=eq.true&limit=500`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } },
  );
  if (!res.ok) throw new Error(`supabase ${res.status}`);
  const rows = await res.json();
  return rows
    .filter((r) => !REDIRECTED.has(r.slug))
    .map((r) => ({ slug: r.slug, title: r.title || r.slug, source: "db" }));
}

// ---------------------------------------------------------------- taxonomy

export const BRANDS = [
  "adyen",
  "authorize",
  "braintree",
  "clover",
  "durango",
  "easy-pay-direct",
  "helcim",
  "payment-depot",
  "paymentcloud",
  "paypal",
  "shopify",
  "square",
  "stax",
  "stripe",
  "toast",
  "worldpay",
];

const STOP = new Set([
  "2026",
  "and",
  "best",
  "for",
  "in",
  "of",
  "on",
  "payment",
  "processors",
  "processor",
  "the",
  "to",
  "vs",
  "with",
]);

const TIER_ORDER = [
  "best-payment-processors-10k-25k-monthly-2026",
  "best-payment-processors-25k-50k-monthly-2026",
  "best-payment-processors-50k-100k-monthly-2026",
  "best-payment-processors-100k-250k-monthly-2026",
  "best-payment-processors-500k-1m-monthly-2026",
];

const CORNERSTONE = "best-payment-processors-2026";

// Concept families, so a restaurant roundup sits next to POS and tipping pages
// rather than next to whatever is first alphabetically.
const FAMILIES = {
  storefront: ["restaurants", "pos", "systems", "tipping", "automotive", "yoga", "fitness", "mobile"],
  online: ["ecommerce", "gateways", "gateway", "virtual", "terminals", "marketplaces"],
  professional: ["dental", "healthcare", "legal", "practices", "professional", "contractors", "field", "nonprofits", "b2b", "saas"],
  recurring: ["subscription", "subscriptions", "billing", "dunning", "recovery", "products"],
  risk: ["fraud", "dispute", "detection", "risk"],
  pricing: ["interchange", "low", "fee", "contract", "funding", "deposit", "fast", "acquirer", "reconciliation"],
};

function familiesOf(slug) {
  const t = new Set(slug.split("-"));
  return Object.entries(FAMILIES)
    .filter(([, words]) => words.some((w) => t.has(w)))
    .map(([name]) => name);
}

// Tie-break order for candidates that score the same. Without it the filler
// tiles are simply whatever sorts first alphabetically, which put five AI-tool
// pages on the restaurants roundup.
const PROMINENCE = [
  CORNERSTONE,
  ...TIER_ORDER,
  "square-vs-stripe",
  "stripe-vs-paypal",
  "paypal-vs-square",
  "helcim-vs-stripe",
  "best-low-fee-payment-processors-2026",
  "best-interchange-plus-payment-processors-2026",
  "best-high-risk-friendly-payment-processors-2026",
];

function prominence(slug) {
  const i = PROMINENCE.indexOf(slug);
  return i === -1 ? PROMINENCE.length : i;
}

/** Deterministic tie-break: prominence first, then slug. */
function byTieBreak(x, y) {
  return prominence(x) - prominence(y) || x.localeCompare(y);
}

function sectionOf(slug) {
  if (slug.includes("high-risk") || slug.startsWith("paymentcloud-")) return "high-risk";
  if (slug === CORNERSTONE) return "volume";
  // [0-9][0-9km-]* covers "10k-25k" and "500k-1m"; an earlier [\dk-]+ dropped
  // the 500k-1m tier into "use case" because of the "m".
  if (/^best-payment-processors-[0-9][0-9km-]*-monthly-\d{4}$/.test(slug)) return "volume";
  if (slug.includes("-vs-")) return "brand-duel";
  return "use-case";
}

function brandsOf(slug) {
  return BRANDS.filter((b) => slug.includes(b));
}

function tokensOf(slug) {
  return slug.split("-").filter((t) => t.length > 2 && !STOP.has(t) && !BRANDS.includes(t));
}

function score(a, b) {
  let s = 0;
  const ba = brandsOf(a);
  const bb = new Set(brandsOf(b));
  for (const brand of ba) if (bb.has(brand)) s += 3;

  const sa = sectionOf(a);
  const sb = sectionOf(b);
  if (sa === sb) s += 2;

  const ia = TIER_ORDER.indexOf(a);
  const ib = TIER_ORDER.indexOf(b);
  if (ia >= 0 && ib >= 0) s += Math.max(0, 3 - Math.abs(ia - ib));

  const fa = familiesOf(a);
  const fb = new Set(familiesOf(b));
  for (const f of fa) if (fb.has(f)) s += 2;

  const ta = tokensOf(a);
  const tb = new Set(tokensOf(b));
  for (const t of ta) if (tb.has(t)) s += 1;

  if (b === CORNERSTONE) s += 2;
  return s;
}

// ---------------------------------------------------------------- build

async function main() {
  loadEnvLocal();
  const tierTitles = readTierTitles();
  const shells = readStaticShells().map((s) => ({
    ...s,
    title: tierTitles.get(s.slug) || s.title || s.slug,
  }));
  const db = await readDbComparisons();

  const bySlug = new Map();
  for (const c of [...shells, ...db]) bySlug.set(c.slug, c);
  const slugs = [...bySlug.keys()].sort();
  if (slugs.length < 20) throw new Error(`only ${slugs.length} comparisons found, refusing to write`);

  const ranked = new Map();
  for (const a of slugs) {
    const list = slugs
      .filter((b) => b !== a)
      .map((b) => ({ slug: b, s: score(a, b) }))
      .sort((x, y) => y.s - x.s || byTieBreak(x.slug, y.slug));
    ranked.set(a, list);
  }

  const adjacency = new Map(slugs.map((a) => [a, ranked.get(a).slice(0, TILES).map((x) => x.slug)]));

  // Coverage pass: lift anything under MIN_INBOUND by displacing the weakest
  // tile on the pages that match it best.
  const inboundCount = () => {
    const c = Object.fromEntries(slugs.map((s) => [s, 0]));
    for (const list of adjacency.values()) for (const t of list) c[t] += 1;
    return c;
  };
  for (let pass = 0; pass < 6; pass++) {
    const counts = inboundCount();
    const starved = slugs.filter((s) => counts[s] < MIN_INBOUND).sort();
    if (!starved.length) break;
    for (const target of starved) {
      const hosts = slugs
        .filter((h) => h !== target && !adjacency.get(h).includes(target))
        .map((h) => ({ h, s: score(h, target) }))
        .sort((x, y) => y.s - x.s || byTieBreak(x.h, y.h));
      let need = MIN_INBOUND - inboundCount()[target];
      for (const { h } of hosts) {
        if (need <= 0) break;
        const list = adjacency.get(h);
        // Displace the weakest tile that is not itself starved.
        const counts2 = inboundCount();
        const weakest = [...list]
          .map((t) => ({ t, s: score(h, t), inb: counts2[t] }))
          .filter((x) => x.inb > MIN_INBOUND)
          .sort((x, y) => x.s - y.s || byTieBreak(y.t, x.t))[0];
        if (!weakest) continue;
        list[list.indexOf(weakest.t)] = target;
        need -= 1;
      }
    }
  }

  // Keep every list in score order so the grid reads best-match first.
  for (const [a, list] of adjacency) {
    const s = new Map(ranked.get(a).map((x) => [x.slug, x.s]));
    list.sort((x, y) => (s.get(y) ?? 0) - (s.get(x) ?? 0) || byTieBreak(x, y));
  }

  const finalCounts = inboundCount();
  const min = Math.min(...Object.values(finalCounts));
  const max = Math.max(...Object.values(finalCounts));

  // Backfill: the next best candidates, used only when a canonical tile has to
  // be dropped because the loop's related_links block already shows that URL.
  const backfill = new Map(
    slugs.map((a) => [
      a,
      ranked
        .get(a)
        .map((x) => x.slug)
        .filter((s) => !adjacency.get(a).includes(s))
        .slice(0, BACKFILL),
    ]),
  );

  const entries = slugs
    .map((a) => `  "${a}": [${adjacency.get(a).map((x) => `"${x}"`).join(", ")}],`)
    .join("\n");
  const backfillEntries = slugs
    .map((a) => `  "${a}": [${backfill.get(a).map((x) => `"${x}"`).join(", ")}],`)
    .join("\n");
  const titles = slugs
    .map((a) => `  "${a}": ${JSON.stringify(bySlug.get(a).title)},`)
    .join("\n");

  const out = `// GENERATED FILE, do not edit by hand.
// Regenerate: node scripts/seo/build-comparison-adjacency.mjs
//
// Static "Compare more" adjacency for every comparison page. Six deterministic
// sibling tiles per page, scored on shared brand, shared section, adjacent
// volume tier and shared descriptive tokens. This is code, not an override:
// seo_overrides.related_links is a separate additive block rendered under its
// own heading, and CompareMore filters out anything that block already shows.
//
// Coverage at generation time: ${slugs.length} comparisons, ${min} to ${max} inbound tiles each.

export const COMPARISON_TITLES: Record<string, string> = {
${titles}
};

export const COMPARISON_ADJACENCY: Record<string, string[]> = {
${entries}
};

/** Only used to refill a tile dropped as a duplicate of the related-links block. */
export const COMPARISON_BACKFILL: Record<string, string[]> = {
${backfillEntries}
};
`;

  const dest = path.join(ROOT, "src", "lib", "comparisons", "adjacency.generated.ts");
  fs.writeFileSync(dest, out);
  console.log(
    `[comparison-adjacency] ${slugs.length} comparisons, ${TILES} tiles each, inbound ${min}..${max} -> ${path.relative(ROOT, dest)}`,
  );
  const starved = slugs.filter((s) => finalCounts[s] < MIN_INBOUND);
  if (starved.length) {
    console.error(`[comparison-adjacency] FAILED: ${starved.length} under ${MIN_INBOUND} inbound: ${starved.join(", ")}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(`[comparison-adjacency] ${e.message}`);
  process.exit(1);
});

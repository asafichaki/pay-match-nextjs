#!/usr/bin/env node
/**
 * Build a per-route lastmod manifest from git log.
 *
 * Why: previously sitemap.xml emitted `today` as lastmod for every static
 * insight/comparison/glossary slug. Google saw the entire sitemap claim
 * "modified today" on every refresh, lost trust, and reduced crawl frequency.
 * This fixes Flag #1 (zero-day crawls 51% -> target <20%) by emitting a
 * stable per-file lastmod sourced from the last commit that touched the file.
 *
 * Output: public/lastmod-manifest.json
 *   { "/insights/payment-processor-fees-guide": "2026-05-19", ... }
 *
 * Run on every build (prebuild hook).
 */
import { execSync } from "node:child_process";
import { readdirSync, writeFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PUBLIC_APP = path.join(ROOT, "src", "app", "(public)");

function gitLastMod(filePath) {
  try {
    const rel = path.relative(ROOT, filePath);
    const out = execSync(`git log -1 --format=%ad --date=short -- "${rel}"`, {
      cwd: ROOT,
      encoding: "utf8",
    }).trim();
    if (out && /^\d{4}-\d{2}-\d{2}$/.test(out)) return out;
  } catch {}
  // Fallback to file mtime
  try {
    const m = statSync(filePath).mtime;
    return m.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function walkSubdirSlugs(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith("[") && !e.name.startsWith("_"))
      .map((e) => e.name);
  } catch {
    return [];
  }
}

const manifest = {};

// Insights
for (const slug of walkSubdirSlugs(path.join(PUBLIC_APP, "insights"))) {
  const file = path.join(PUBLIC_APP, "insights", slug, "page.tsx");
  manifest[`/insights/${slug}`] = gitLastMod(file);
}

// Comparisons
for (const slug of walkSubdirSlugs(path.join(PUBLIC_APP, "comparisons"))) {
  const file = path.join(PUBLIC_APP, "comparisons", slug, "page.tsx");
  manifest[`/comparisons/${slug}`] = gitLastMod(file);
}

// Top-level fixed pages
const FIXED = [
  ["/", path.join(PUBLIC_APP, "page.tsx")],
  ["/quiz", path.join(PUBLIC_APP, "quiz", "page.tsx")],
  ["/calculator", path.join(PUBLIC_APP, "calculator", "page.tsx")],
  ["/insights", path.join(PUBLIC_APP, "insights", "page.tsx")],
  ["/glossary", path.join(PUBLIC_APP, "glossary", "page.tsx")],
  ["/research/methodology", path.join(PUBLIC_APP, "research", "methodology", "page.tsx")],
  ["/comparisons", path.join(PUBLIC_APP, "comparisons", "page.tsx")],
  ["/data/effective-rates-2026", path.join(PUBLIC_APP, "data", "effective-rates-2026", "page.tsx")],
  ["/about/barak", path.join(PUBLIC_APP, "about", "barak", "page.tsx")],
  ["/pulse", path.join(PUBLIC_APP, "pulse", "page.tsx")],
];
for (const [route, file] of FIXED) {
  manifest[route] = gitLastMod(file);
}

const outPath = path.join(ROOT, "public", "lastmod-manifest.json");
writeFileSync(outPath, JSON.stringify(manifest, null, 2));
console.log(`[lastmod-manifest] wrote ${Object.keys(manifest).length} entries -> ${outPath}`);

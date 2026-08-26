#!/usr/bin/env node
/**
 * Regenerate public/lastmod-manifest.json from FULL git history and report what
 * changed against the committed file. Run it locally after content edits, then
 * commit the manifest with the edit (Vercel cannot compute these dates itself:
 * it builds from a depth-10 shallow clone).
 *
 *   node scripts/seo/refresh-lastmod-manifest.mjs
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { MANIFEST_PATH, distribution, generateFullManifest, isShallowRepo } from "./lastmod-core.mjs";

if (isShallowRepo()) {
  console.error("[refresh-lastmod-manifest] refusing to run in a shallow clone: dates would be boundary-commit artifacts. Use a full clone (git fetch --unshallow).");
  process.exit(1);
}

const before = existsSync(MANIFEST_PATH) ? JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) : {};
const manifest = generateFullManifest();
writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");

const changes = [];
for (const [route, date] of Object.entries(manifest)) {
  if (route.startsWith("__")) continue;
  if (before[route] !== date) changes.push(`  ${route}: ${before[route] ?? "(new)"} -> ${date}`);
}
const routes = Object.keys(manifest).filter((k) => !k.startsWith("__")).length;
console.log(`[refresh-lastmod-manifest] ${routes} routes from full history (HEAD ${manifest.__head}).`);
console.log(`  distribution: ${distribution(manifest).map(([d, n]) => `${d}:${n}`).join(" ")}`);
if (changes.length) {
  console.log(`  ${changes.length} route(s) changed vs the committed manifest:`);
  for (const c of changes) console.log(c);
  console.log("  Commit public/lastmod-manifest.json together with the content change.");
} else {
  console.log("  No changes vs the committed manifest.");
}

#!/usr/bin/env node
/**
 * Prebuild gate for public/lastmod-manifest.json (runs right after the builder).
 *
 * Fails when:
 *   1. the manifest is missing, has no __generated build date, or was not
 *      produced from full git history (__source);
 *   2. more than MAX_CLUSTER routes share one lastmod AND that date is not
 *      provably real:
 *        - shallow clone: the date equals a boundary-commit date (the exact
 *          artifact that stamped 91 live URLs with 2026-08-10);
 *        - full clone: any route in the cluster has a different real git date.
 *      A genuine same-day batch edit (the 05-30 pillar upgrade touched 17 files)
 *      passes because every route in it verifies against git.
 *
 * Why a gate: the sitemap's freshness signal is only worth something if a
 * lastmod means "this URL changed that day". A uniform block means nothing and
 * Google discounts the whole file.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  FULL_SOURCE,
  MANIFEST_PATH,
  ROOT,
  boundaryDates,
  distribution,
  git,
  isShallowRepo,
  routeSources,
} from "./lastmod-core.mjs";

const MAX_CLUSTER = 15;

if (!existsSync(MANIFEST_PATH)) {
  console.error("[check-lastmod-manifest] FAIL: public/lastmod-manifest.json missing");
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
const failures = [];

if (!/^\d{4}-\d{2}-\d{2}$/.test(manifest.__generated || "")) failures.push("__generated build date missing");
if (manifest.__source !== FULL_SOURCE) failures.push(`__source is "${manifest.__source}", expected "${FULL_SOURCE}" (refresh on a full clone and commit)`);

const shallow = isShallowRepo() || process.env.VERCEL === "1";
const boundaries = shallow ? boundaryDates() : new Set();
const sourcesByRoute = new Map(routeSources());

for (const [date, count] of distribution(manifest)) {
  if (count <= MAX_CLUSTER) continue;
  const routes = Object.entries(manifest).filter(([r, d]) => !r.startsWith("__") && d === date).map(([r]) => r);
  if (shallow) {
    if (boundaries.has(date)) {
      failures.push(`${count} routes share ${date}, which is a shallow-clone boundary date (artifact). Refresh the manifest on a full clone and commit it.`);
    }
    continue;
  }
  // Full history: verify each route against git.
  const wrong = [];
  for (const route of routes) {
    const sources = sourcesByRoute.get(route) || [];
    const real = sources
      .map((s) => {
        try {
          return git(`log -1 --format=%ad --date=short -- "${path.relative(ROOT, s)}"`);
        } catch {
          return "";
        }
      })
      .filter(Boolean)
      .sort()
      .at(-1);
    if (real && real !== date) wrong.push(`${route} (git says ${real})`);
  }
  if (wrong.length) {
    failures.push(`${count} routes share ${date} but ${wrong.length} of them have a different git date: ${wrong.slice(0, 5).join(", ")}${wrong.length > 5 ? ", ..." : ""}`);
  }
}

if (failures.length) {
  console.error("[check-lastmod-manifest] FAIL");
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}

const summary = distribution(manifest).slice(0, 5).map(([d, n]) => `${d}:${n}`).join(" ");
console.log(`[check-lastmod-manifest] OK (${shallow ? "shallow" : "full"} clone, max cluster ${distribution(manifest)[0]?.[1] ?? 0} <= ${MAX_CLUSTER} or verified): ${summary}`);

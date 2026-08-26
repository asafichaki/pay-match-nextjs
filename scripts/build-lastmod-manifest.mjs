#!/usr/bin/env node
/**
 * Prebuild: write public/lastmod-manifest.json for the sitemap.
 *
 * Full clone (local): regenerate every route date from full git history.
 * Shallow clone or VERCEL=1: keep the committed manifest and only bump routes
 * whose files changed in the commits this clone can see. See lastmod-core.mjs
 * for why (the depth-10 clone on Vercel stamped 91 URLs with one boundary date).
 *
 * To refresh the committed manifest after edits: node scripts/seo/refresh-lastmod-manifest.mjs
 */
import { writeFileSync } from "node:fs";
import {
  MANIFEST_PATH,
  bumpCommittedManifest,
  distribution,
  generateFullManifest,
  isShallowRepo,
} from "./seo/lastmod-core.mjs";

const shallow = isShallowRepo() || process.env.VERCEL === "1";
let manifest;
let mode;
if (shallow) {
  manifest = bumpCommittedManifest();
  mode = `shallow clone: committed manifest + ${manifest.__bumped_in_shallow_build} bump(s) from visible commits`;
} else {
  manifest = generateFullManifest();
  mode = "full history: regenerated from git";
}

writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");
const routes = Object.keys(manifest).filter((k) => !k.startsWith("__")).length;
const top = distribution(manifest).slice(0, 4).map(([d, n]) => `${d}:${n}`).join(" ");
console.log(`[lastmod-manifest] ${mode}; ${routes} routes -> public/lastmod-manifest.json (top dates ${top})`);

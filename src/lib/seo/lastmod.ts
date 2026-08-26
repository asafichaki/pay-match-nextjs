// Reader for `public/lastmod-manifest.json`, the per-route git-date manifest
// written by `scripts/build-lastmod-manifest.mjs` in `prebuild`.
//
// Contract (PR 1, 2026-08-25): every lastmod is a git date, never request
// time. A route with no entry falls back to the manifest's own build date
// (`__generated`), never to "today". Extracted from the sitemap route in PR 2
// so `/llms.txt` and `/llms-full.txt` date a static shell exactly the way the
// sitemap does.

import fs from "node:fs";
import path from "node:path";

function load(): Record<string, string> {
  try {
    const file = path.join(process.cwd(), "public", "lastmod-manifest.json");
    return JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, string>;
  } catch {
    return {};
  }
}

export const LASTMOD_MANIFEST: Record<string, string> = load();
export const LASTMOD_BUILD_DATE: string = LASTMOD_MANIFEST.__generated || "";

export function routeLastmod(route: string): string {
  return LASTMOD_MANIFEST[route] || LASTMOD_BUILD_DATE;
}

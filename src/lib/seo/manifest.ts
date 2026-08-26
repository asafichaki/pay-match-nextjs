// Reader for `public/seo-manifest.json`, the build-time route inventory.
//
// Written by `scripts/seo/build-seo-manifest.mjs` in `prebuild`. Read here by
// the sitemap (static route list) and by both llms routes (base title and
// description). Also served as-is at `/seo-manifest.json`, where the Hermes
// loop fetches it for its RULES parity check and its before-snapshot of the
// static shells.
//
// It is read once per lambda instance. A missing or unreadable file gives an
// empty inventory, and every caller treats that as a hard failure rather than
// as "no routes", because an empty sitemap is far worse than a 503.

import fs from "node:fs";
import path from "node:path";

export type ManifestSource = "static" | "db";
export type TitleMode = "absolute" | "template";

export interface ManifestRoute {
  route: string;
  kind: "insights" | "comparisons" | "pages";
  slug: string;
  source: ManifestSource;
  title_mode: TitleMode;
  base_title: string | null;
  base_description: string | null;
  /** Visible H2 headings, collected at build time from the route's .tsx files. */
  outline: string[];
}

export interface SeoManifest {
  generated_at: string;
  rules_version: string;
  counts: { static: number; db: number; total: number };
  routes: ManifestRoute[];
}

const EMPTY: SeoManifest = {
  generated_at: "",
  rules_version: "",
  counts: { static: 0, db: 0, total: 0 },
  routes: [],
};

function load(): SeoManifest {
  try {
    const file = path.join(process.cwd(), "public", "seo-manifest.json");
    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as SeoManifest;
    if (!Array.isArray(parsed.routes)) return EMPTY;
    return parsed;
  } catch {
    return EMPTY;
  }
}

export const SEO_MANIFEST: SeoManifest = load();

/** Static shells only. This is what replaced the sitemap's request-time walk. */
export function staticRoutes(kind: ManifestRoute["kind"]): ManifestRoute[] {
  return SEO_MANIFEST.routes.filter((r) => r.source === "static" && r.kind === kind);
}

/** Static shell slugs for one kind, in manifest order. */
export function staticSlugs(kind: ManifestRoute["kind"]): string[] {
  return staticRoutes(kind).map((r) => r.slug);
}

export function manifestRoute(route: string): ManifestRoute | undefined {
  return SEO_MANIFEST.routes.find((r) => r.route === route);
}

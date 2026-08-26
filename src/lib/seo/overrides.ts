// The SEO override layer.
//
// Every article page (the 47 static shells and both DB `[slug]` routes) reads
// `seo_overrides` at render time, so the daily loop changes a title, a meta,
// an answer block or a related-link set by writing a row and calling the
// revalidate route. No deploy is involved.
//
// Caching: one `unstable_cache` entry per (kind, slug) tagged
// `seo-override:<kind>:<slug>` with a 1 hour revalidate, wrapped in React
// `cache()` so a single render that asks twice (generateMetadata plus the
// page body) hits Supabase at most once. Next 16.2 still supports
// `unstable_cache`; `cacheTag`/`cacheLife` needs `cacheComponents`, which is
// out of scope for this PR.
//
// Failure policy: a missing table, a missing service key or any Supabase
// error resolves to `null` and the page renders its base metadata. A build
// must never fail because of this file. Production builds are protected by
// `scripts/seo/preflight.mjs` instead, which fails the build up front when
// the table is unreachable, so a silent fallback can never ship unnoticed.

import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { Metadata } from "next";
import { getAdminSupabase } from "@/lib/funnel/admin-supabase";

export type OverrideKind = "insights" | "comparisons" | "pages";

export const OVERRIDE_KINDS: readonly OverrideKind[] = ["insights", "comparisons", "pages"] as const;

/**
 * Slugs the loop and the revalidate route accept.
 *
 * Mirrors `seo_overrides_slug_check` in the migration character for character,
 * including the nested form. That matters for `kind = "pages"`: the top-level
 * routes the loop can override include `about/barak`, `research/methodology`
 * and `data/effective-rates-2026`, and a single-segment pattern would have
 * made the revalidate route reject three of the ten page routes the build
 * manifest lists while the database accepted the row.
 */
export const SLUG_RE = /^[a-z0-9][a-z0-9-]*(?:\/[a-z0-9][a-z0-9-]*)*$/;

export interface RelatedLink {
  href: string;
  title: string;
}

export interface SeoOverride {
  kind: OverrideKind;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  title_absolute: boolean | null;
  related_links: RelatedLink[] | null;
  aeo_answer: string | null;
  expert_quote_id: number | null;
  canonical: string | null;
  noindex: boolean | null;
  citation_lock: boolean | null;
  cohort: string | null;
  version: number | null;
  updated_at: string | null;
}

const SELECT =
  "kind,slug,meta_title,meta_description,title_absolute,related_links,aeo_answer,expert_quote_id,canonical,noindex,citation_lock,cohort,version,updated_at";

export function overrideTag(kind: string, slug: string): string {
  return `seo-override:${kind}:${slug}`;
}

function parseRelated(value: unknown): RelatedLink[] | null {
  let raw: unknown = value;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(raw)) return null;
  const out = raw
    .filter((l): l is Record<string, unknown> => Boolean(l) && typeof l === "object")
    .map((l) => ({ href: String(l.href ?? ""), title: String(l.title ?? "") }))
    .filter((l) => l.href.startsWith("/") && l.title.length > 0);
  return out.length ? out : null;
}

async function readOverride(kind: string, slug: string): Promise<SeoOverride | null> {
  const sb = getAdminSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb as any)
    .from("seo_overrides")
    .select(SELECT)
    .eq("kind", kind)
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return { ...(data as SeoOverride), related_links: parseRelated((data as SeoOverride).related_links) };
}

/**
 * One override row, or null.
 *
 * `cache()` dedupes within a render; `unstable_cache` dedupes across renders
 * and gives the revalidate route a tag to purge.
 */
export const getSeoOverride = cache(
  async (kind: OverrideKind, slug: string): Promise<SeoOverride | null> => {
    if (!slug || !SLUG_RE.test(slug)) return null;
    try {
      const load = unstable_cache(() => readOverride(kind, slug), ["seo-override", kind, slug], {
        tags: [overrideTag(kind, slug)],
        revalidate: 3600,
      });
      return await load();
    } catch {
      // Table missing, service key missing, network down: render the base.
      return null;
    }
  },
);

type TitleShape = NonNullable<Metadata["title"]>;

/** The plain-text value of whatever title shape a page declared. */
function titleText(title: Metadata["title"]): string | null {
  if (typeof title === "string") return title;
  if (title && typeof title === "object") {
    if ("absolute" in title && typeof title.absolute === "string") return title.absolute;
    if ("default" in title && typeof title.default === "string") return title.default;
  }
  return null;
}

/**
 * Build the replacement title in the SAME shape as the base.
 *
 * `{ absolute: ... }` stays absolute; a plain string stays a plain string so
 * the root template keeps appending " | myPayAdvisor"; `title_absolute` on
 * the row forces the absolute shape either way, which is how the loop drops
 * the suffix without a deploy.
 */
function nextTitle(base: Metadata["title"], override: SeoOverride): TitleShape | undefined {
  const forced = override.title_absolute === true;
  const baseIsAbsolute = Boolean(
    base && typeof base === "object" && "absolute" in base && typeof base.absolute === "string",
  );
  const text = override.meta_title ?? titleText(base);
  if (!text) return undefined;
  if (forced || baseIsAbsolute) return { absolute: text };
  if (override.meta_title === null) return undefined; // nothing to change
  return text;
}

/**
 * Fold one override row into a page's base metadata.
 *
 * Title and description are mirrored into `openGraph.title`/`twitter.title`
 * and their descriptions, because Next resolves those through the same title
 * template (see resolve-opengraph.js) and a page whose tab says one thing and
 * whose share card says another is worse than no override at all.
 */
export function applyOverrideToMetadata(base: Metadata, override: SeoOverride | null): Metadata {
  if (!override) return base;
  const out: Metadata = { ...base };

  const title = nextTitle(base.title, override);
  if (title !== undefined) {
    out.title = title;
    if (base.openGraph) out.openGraph = { ...base.openGraph, title };
    if (base.twitter) out.twitter = { ...base.twitter, title };
  }

  if (override.meta_description) {
    out.description = override.meta_description;
    const og = out.openGraph ?? base.openGraph;
    if (og) out.openGraph = { ...og, description: override.meta_description };
    const tw = out.twitter ?? base.twitter;
    if (tw) out.twitter = { ...tw, description: override.meta_description };
  }

  if (override.canonical) {
    out.alternates = { ...(base.alternates ?? {}), canonical: override.canonical };
  }

  if (override.noindex === true) {
    out.robots = { index: false, follow: true };
  }

  return out;
}

/** The one call a page makes: `return withSeoOverride("comparisons", slug, baseMetadata)`. */
export async function withSeoOverride(
  kind: OverrideKind,
  slug: string,
  base: Metadata,
): Promise<Metadata> {
  return applyOverrideToMetadata(base, await getSeoOverride(kind, slug));
}

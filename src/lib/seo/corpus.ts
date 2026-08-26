// The one inventory both `/llms.txt` and `/llms-full.txt` are built from.
//
// Three sources, merged in a fixed precedence:
//
//   1. `public/seo-manifest.json` (build time)  base title, description and
//      outline of every static shell and top-level page.
//   2. `blog_articles` (live)                   the DB articles, which carry
//      richer fields (key findings, sources, TOC, dates).
//   3. `seo_overrides` (live)                   meta_title, meta_description
//      and aeo_answer, which win over both.
//
// Why this file exists at all: `/llms-full.txt` used to read `page.tsx` off
// the filesystem at request time and pull the title out with a regex on
// `export const metadata`. The PR 2 codemod renamed that to `baseMetadata` on
// 46 shells, so the regex would have missed every one of them and printed the
// slug as the title. Reading the manifest instead means a title can only be
// missing if the build could not find one, which fails the build.
//
// Overrides are read in ONE query for the whole corpus. A per-entry
// `getSeoOverride` call would be 130 round trips per rebuild of a file that
// exists to be cheap.

import { getAdminSupabase } from "@/lib/funnel/admin-supabase";
import { SEO_MANIFEST, type ManifestRoute } from "@/lib/seo/manifest";
import { REDIRECTED_INSIGHT_SLUGS } from "@/lib/insights/redirected-slugs";
import { REDIRECTED_COMPARISON_SLUGS } from "@/lib/comparisons/redirected-slugs";

export const SITE = "https://www.mypayadvisor.com";

export type CorpusKind = "insights" | "comparisons" | "pages";

export interface CorpusEntry {
  kind: CorpusKind;
  slug: string;
  route: string;
  url: string;
  title: string;
  description: string;
  /** `seo_overrides.aeo_answer`, the sentence an answer engine should lift. */
  aeoAnswer: string | null;
  iso: string;
  outline: string[];
  keyFindings: string[];
  sources: string[];
  author?: string;
  source: "static" | "db";
  overridden: boolean;
  noindex: boolean;
}

interface OverrideRow {
  kind: string;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  aeo_answer: string | null;
  noindex: boolean | null;
}

interface ArticleRow {
  kind: string;
  slug: string;
  title: string | null;
  meta_title: string | null;
  description: string | null;
  meta_description: string | null;
  published_at: string | null;
  updated_at: string | null;
  toc: unknown;
  key_findings: unknown;
  sources_json: unknown;
  author: string | null;
}

function redirected(kind: string, slug: string): boolean {
  if (kind === "insights") return REDIRECTED_INSIGHT_SLUGS.has(slug);
  if (kind === "comparisons") return REDIRECTED_COMPARISON_SLUGS.has(slug);
  return false;
}

async function fetchOverrides(): Promise<Map<string, OverrideRow>> {
  const out = new Map<string, OverrideRow>();
  try {
    const sb = getAdminSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (sb as any)
      .from("seo_overrides")
      .select("kind,slug,meta_title,meta_description,aeo_answer,noindex")
      .limit(2000);
    if (error || !data) return out;
    for (const row of data as OverrideRow[]) out.set(`${row.kind}/${row.slug}`, row);
  } catch {
    // No table, no key, no network: the corpus falls back to base metadata.
  }
  return out;
}

async function fetchArticles(): Promise<ArticleRow[]> {
  try {
    const sb = getAdminSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (sb as any)
      .from("blog_articles")
      .select(
        "kind,slug,title,meta_title,description,meta_description,published_at,updated_at,toc,key_findings,sources_json,author",
      )
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(1000);
    if (error || !data) return [];
    return data as ArticleRow[];
  } catch {
    return [];
  }
}

function stringList(value: unknown, limit: number, pick?: (v: Record<string, unknown>) => unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => {
      if (typeof v === "string") return v;
      if (v && typeof v === "object" && pick) {
        const got = pick(v as Record<string, unknown>);
        return typeof got === "string" ? got : "";
      }
      return "";
    })
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, limit);
}

function fromManifest(r: ManifestRoute, lastmod: Record<string, string>): CorpusEntry {
  return {
    kind: r.kind,
    slug: r.slug,
    route: r.route,
    url: `${SITE}${r.route === "/" ? "" : r.route}`,
    title: r.base_title || "",
    description: r.base_description || "",
    aeoAnswer: null,
    iso: lastmod[r.route] || "",
    outline: r.outline ?? [],
    keyFindings: [],
    sources: [],
    source: "static",
    overridden: false,
    noindex: false,
  };
}

/**
 * Every URL an answer engine should see, with overrides folded in.
 *
 * `lastmod` is the committed per-route git-date manifest the sitemap uses, so
 * the corpus dates a static shell the same way the sitemap does instead of
 * inventing a build timestamp.
 */
export async function buildCorpus(lastmod: Record<string, string> = {}): Promise<CorpusEntry[]> {
  const [overrides, articles] = await Promise.all([fetchOverrides(), fetchArticles()]);

  const byRoute = new Map<string, CorpusEntry>();
  for (const r of SEO_MANIFEST.routes) {
    if (r.source !== "static") continue;
    if (redirected(r.kind, r.slug)) continue;
    if (!r.base_title) continue;
    byRoute.set(r.route, fromManifest(r, lastmod));
  }

  // DB rows: a richer version of a shell, or a route the manifest never saw
  // because it was published after the last build.
  for (const a of articles) {
    if (a.kind !== "insights" && a.kind !== "comparisons") continue;
    if (redirected(a.kind, a.slug)) continue;
    const route = `/${a.kind}/${a.slug}`;
    const base = byRoute.get(route);
    const title = a.meta_title || a.title || base?.title || "";
    if (!title) continue;
    byRoute.set(route, {
      kind: a.kind,
      slug: a.slug,
      route,
      url: `${SITE}${route}`,
      title,
      description: a.meta_description || a.description || base?.description || "",
      aeoAnswer: null,
      iso: a.published_at || a.updated_at || base?.iso || "",
      outline: stringList(a.toc, 12, (v) => v.label ?? v.title ?? v.text),
      keyFindings: stringList(a.key_findings, 8),
      sources: stringList(a.sources_json, 10, (v) => v.name ?? v.title ?? v.url),
      author: a.author || undefined,
      source: "db",
      overridden: false,
      noindex: false,
    });
  }

  // Overrides last: they are the whole point of the layer.
  const out: CorpusEntry[] = [];
  for (const entry of byRoute.values()) {
    const row = overrides.get(`${entry.kind}/${entry.slug}`);
    if (row) {
      if (row.meta_title) entry.title = row.meta_title;
      if (row.meta_description) entry.description = row.meta_description;
      entry.aeoAnswer = row.aeo_answer?.trim() || null;
      entry.noindex = row.noindex === true;
      entry.overridden = Boolean(row.meta_title || row.meta_description || row.aeo_answer);
    }
    // A page the loop has told search engines not to index has no business in
    // a file whose only purpose is to get the page cited.
    if (!entry.noindex) out.push(entry);
  }

  out.sort((a, b) => (b.iso || "").localeCompare(a.iso || "") || a.route.localeCompare(b.route));
  return out;
}

export function corpusOf(entries: CorpusEntry[], kind: CorpusKind): CorpusEntry[] {
  return entries.filter((e) => e.kind === kind);
}

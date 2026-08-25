import fs from "fs";
import path from "path";
import { getAdminSupabase } from "@/lib/funnel/admin-supabase";
import { REDIRECTED_INSIGHT_SLUGS } from "@/lib/insights/redirected-slugs";
import { REDIRECTED_COMPARISON_SLUGS } from "@/lib/comparisons/redirected-slugs";
import { GLOSSARY } from "@/lib/glossary/terms";

const SITE = "https://www.mypayadvisor.com";

// Per-route lastmod manifest, generated at build time from git log by
// scripts/build-lastmod-manifest.mjs. Contract (PR 1, 2026-08-25):
//   - every lastmod is a git date, never request time
//   - a route with no manifest entry falls back to the manifest's own build
//     date (`__generated`), never to "today"
//   - /glossary/* uses `/glossary/_terms` = max git date of the glossary
//     index, the [term] template and src/lib/glossary/terms.ts
//   - a Supabase error is a 503 with Retry-After, never a partial 200
//   - /privacy and /terms are noindex and are not listed
//   - every value is XML-escaped; <loc> values are unique (static wins over DB)
function loadLastmodManifest(): Record<string, string> {
  try {
    const manifestPath = path.join(process.cwd(), "public", "lastmod-manifest.json");
    return JSON.parse(fs.readFileSync(manifestPath, "utf8")) as Record<string, string>;
  } catch {
    return {};
  }
}
const LASTMOD_MANIFEST = loadLastmodManifest();
const BUILD_DATE = LASTMOD_MANIFEST.__generated || "";

function routeLastmod(route: string): string {
  return LASTMOD_MANIFEST[route] || BUILD_DATE;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Priorities per slug (override default 0.8 for insights / 0.85 for comparisons).
const SLUG_PRIORITY: Record<string, number> = {
  // cornerstones
  "payment-processor-fees-guide": 0.9,
  "credit-card-processing-fees-explained": 0.9,
  "helcim-review-2025": 0.85,
  "online-vs-instore-payments": 0.85,
  "merchant-statement-audit-guide": 0.9,
  "free-statement-audit-playbook": 0.9,
  "payment-processor-negotiation-playbook": 0.9,
  "approval-rate-recovery-routing-acquirers-3ds": 0.9,
  "reserves-frozen-funds-capped-vs-rolling": 0.9,
  "in-person-payments-hardware-lockin-mdr": 0.9,
  "best-payment-processors-2026": 0.95,
};

function walkSubdirSlugs(dir: string): string[] {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith("[") && !e.name.startsWith("_"))
      .map((e) => e.name);
  } catch {
    return [];
  }
}

class SupabaseUnavailable extends Error {}

async function fetchAutopilotArticles() {
  const sb = getAdminSupabase();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb as any)
    .from("blog_articles")
    .select("kind,slug,updated_at,published_at,index_in_sitemap")
    .eq("published", true)
    .eq("index_in_sitemap", true)
    .order("published_at", { ascending: false })
    .limit(2000);
  if (error) throw new SupabaseUnavailable(error.message || "blog_articles query failed");
  return (
    (data as Array<{
      kind: string;
      slug: string;
      updated_at: string;
      published_at: string | null;
    }>) || []
  );
}

async function fetchRecentWeekRoundups() {
  const sb = getAdminSupabase();
  // 12-week window for the weekly roundups. The cutoff is a query filter, not a lastmod.
  const cutoff = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000).toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb as any)
    .from("updates_feed")
    .select("slug,published_at")
    .eq("status", "published")
    .eq("type", "editorial")
    .like("slug", "%-week-%")
    .gte("published_at", cutoff)
    .order("published_at", { ascending: false })
    .limit(12);
  if (error) throw new SupabaseUnavailable(error.message || "updates_feed query failed");
  return (data as Array<{ slug: string; published_at: string }>) || [];
}

type Entry = { loc: string; lastmod: string; changefreq: string; priority: number };

function renderEntry(e: Entry) {
  return `\n  <url>\n    <loc>${escapeXml(e.loc)}</loc>\n    <lastmod>${escapeXml(e.lastmod)}</lastmod>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`;
}

function unavailable(reason: string) {
  return new Response(`sitemap temporarily unavailable: ${reason}`, {
    status: 503,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Retry-After": "300",
      "Cache-Control": "no-store",
    },
  });
}

export async function GET() {
  if (!BUILD_DATE) {
    // The manifest is written by the prebuild hook; without it we would have to
    // invent dates. Fail loudly instead.
    return unavailable("lastmod manifest missing");
  }

  const publicDir = path.join(process.cwd(), "src", "app", "(public)");
  const insightSlugs = walkSubdirSlugs(path.join(publicDir, "insights")).filter(
    (s) => !REDIRECTED_INSIGHT_SLUGS.has(s)
  );
  const comparisonSlugs = walkSubdirSlugs(path.join(publicDir, "comparisons")).filter(
    (s) => !REDIRECTED_COMPARISON_SLUGS.has(s)
  );

  let roundups: Awaited<ReturnType<typeof fetchRecentWeekRoundups>>;
  let autopilotArticles: Awaited<ReturnType<typeof fetchAutopilotArticles>>;
  try {
    [roundups, autopilotArticles] = await Promise.all([fetchRecentWeekRoundups(), fetchAutopilotArticles()]);
  } catch (e) {
    return unavailable(e instanceof Error ? e.message : "supabase error");
  }

  // Ordered, deduped by <loc>. Static entries are inserted first, so a DB row
  // that collides with a static shell is dropped (static wins).
  const entries = new Map<string, Entry>();
  const add = (loc: string, lastmod: string, changefreq = "monthly", priority = 0.8) => {
    if (!entries.has(loc)) entries.set(loc, { loc, lastmod: lastmod.slice(0, 10), changefreq, priority });
  };

  // Top-level fixed pages (no /privacy, no /terms: both are noindex).
  add(`${SITE}/`, routeLastmod("/"), "weekly", 1.0);
  add(`${SITE}/quiz`, routeLastmod("/quiz"), "weekly", 0.9);
  add(`${SITE}/calculator`, routeLastmod("/calculator"), "monthly", 0.85);
  add(`${SITE}/insights`, routeLastmod("/insights"), "weekly", 0.9);
  add(`${SITE}/glossary`, routeLastmod("/glossary"), "monthly", 0.85);
  add(`${SITE}/research/methodology`, routeLastmod("/research/methodology"), "monthly", 0.85);
  add(`${SITE}/comparisons`, routeLastmod("/comparisons"), "weekly", 0.95);
  add(`${SITE}/data/effective-rates-2026`, routeLastmod("/data/effective-rates-2026"), "monthly", 0.9);
  add(`${SITE}/about/barak`, routeLastmod("/about/barak"), "monthly", 0.7);
  add(`${SITE}/pulse`, routeLastmod("/pulse"), "daily", 0.85);

  // Static comparison + insight shells (per-file git lastmod)
  for (const s of comparisonSlugs) {
    add(`${SITE}/comparisons/${s}`, routeLastmod(`/comparisons/${s}`), "monthly", SLUG_PRIORITY[s] ?? 0.85);
  }
  for (const s of insightSlugs) {
    add(`${SITE}/insights/${s}`, routeLastmod(`/insights/${s}`), "monthly", SLUG_PRIORITY[s] ?? 0.8);
  }

  // Glossary per-term sub-pages: one stable date for the whole set, the newest
  // git date across the index, the term template and the terms data file.
  const glossaryLastmod = routeLastmod("/glossary/_terms");
  for (const t of GLOSSARY) {
    add(`${SITE}/glossary/${t.slug}`, glossaryLastmod, "monthly", 0.75);
  }

  // Recent week roundups
  for (const r of roundups) {
    add(`${SITE}/pulse/week/${r.slug}`, r.published_at, "weekly", 0.7);
  }

  // DB-driven autopilot articles (skipping any slug that now 308s)
  for (const a of autopilotArticles) {
    if (a.kind === "insights" && REDIRECTED_INSIGHT_SLUGS.has(a.slug)) continue;
    if (a.kind === "comparisons" && REDIRECTED_COMPARISON_SLUGS.has(a.slug)) continue;
    add(`${SITE}/${a.kind}/${a.slug}`, a.updated_at || a.published_at || BUILD_DATE, "monthly", 0.8);
  }

  const body = Array.from(entries.values()).map(renderEntry).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">${body}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}

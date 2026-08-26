import { getAdminSupabase } from "@/lib/funnel/admin-supabase";
import { REDIRECTED_INSIGHT_SLUGS } from "@/lib/insights/redirected-slugs";
import { REDIRECTED_COMPARISON_SLUGS } from "@/lib/comparisons/redirected-slugs";
import { GLOSSARY } from "@/lib/glossary/terms";
import { LASTMOD_BUILD_DATE, routeLastmod } from "@/lib/seo/lastmod";
import { staticSlugs } from "@/lib/seo/manifest";

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
//
// PR 2 adds the override-layer half of the contract:
//   - the static route list comes from public/seo-manifest.json, not from a
//     request-time readdir of src/app/(public)
//   - a title, meta or related-link override does NOT move lastmod. Only a
//     content-class change does: aeo_answer and expert_quote_id. Freshness
//     churn is exactly what PR 1 removed, and the loop rewrites titles daily.
//   - no lastmod is ever today or later. See clampLastmod.

// The fields of seo_changes that count as a real content edit. Everything the
// loop writes that is not in this set is metadata about the page, not the page.
const CONTENT_CLASS_FIELDS = ["aeo_answer", "expert_quote_id"] as const;
// A change only counts once it is actually live on the page.
const APPLIED_STATUSES = ["applied", "verification_pending", "verified"] as const;

/**
 * Yesterday, in UTC. The ceiling for every lastmod in this file.
 *
 * Two reasons a same-day date is not worth having. The loop's health check
 * treats any lastmod equal to today as the uniform request-time churn PR 1
 * removed, and would go red on its own change. And a date that moves while the
 * page is still propagating through the CDN is the churn signal we are trying
 * not to send. The cost is up to 24 hours of precision on a hint Google reads
 * at day granularity; the escalation ladder still gets its bump, because the
 * date it replaces is months old.
 */
function yesterdayIso(): string {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
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

class SupabaseUnavailable extends Error {}

/**
 * `<kind>/<slug>` -> the date of the newest content-class change on it.
 *
 * Read from `seo_changes`, not from `seo_overrides.updated_at`: the migration
 * has no `content_updated_at` column, and `updated_at` moves on every field
 * including a title, which is precisely the churn this contract forbids.
 * Filtering on `field` and `status` keeps a proposed change (nothing live yet)
 * and a rolled-back one out of it.
 *
 * A failure here is not fatal. The sitemap falls back to git dates, which is
 * the state before PR 2, rather than 503-ing over an optional enrichment.
 */
async function fetchContentClassDates(): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  try {
    const sb = getAdminSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (sb as any)
      .from("seo_changes")
      .select("kind,slug,field,status,applied_at")
      .in("field", CONTENT_CLASS_FIELDS)
      .in("status", APPLIED_STATUSES)
      .not("applied_at", "is", null)
      .order("applied_at", { ascending: false })
      .limit(2000);
    if (error || !data) return out;
    for (const row of data as Array<{ kind: string; slug: string; applied_at: string }>) {
      const key = `${row.kind}/${row.slug}`;
      const date = (row.applied_at || "").slice(0, 10);
      if (!date) continue;
      const prev = out.get(key);
      if (!prev || date > prev) out.set(key, date);
    }
  } catch {
    // Table missing or unreachable: git dates only.
  }
  return out;
}

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
  if (!LASTMOD_BUILD_DATE) {
    // The manifest is written by the prebuild hook; without it we would have to
    // invent dates. Fail loudly instead.
    return unavailable("lastmod manifest missing");
  }

  // The static inventory comes from the build, not from a request-time readdir.
  const comparisonSlugs = staticSlugs("comparisons").filter((s) => !REDIRECTED_COMPARISON_SLUGS.has(s));
  const insightSlugs = staticSlugs("insights").filter((s) => !REDIRECTED_INSIGHT_SLUGS.has(s));
  if (!comparisonSlugs.length || !insightSlugs.length) {
    return unavailable("seo manifest missing or empty");
  }

  let roundups: Awaited<ReturnType<typeof fetchRecentWeekRoundups>>;
  let autopilotArticles: Awaited<ReturnType<typeof fetchAutopilotArticles>>;
  try {
    [roundups, autopilotArticles] = await Promise.all([fetchRecentWeekRoundups(), fetchAutopilotArticles()]);
  } catch (e) {
    return unavailable(e instanceof Error ? e.message : "supabase error");
  }
  const contentDates = await fetchContentClassDates();
  const CEILING = yesterdayIso();

  /**
   * The one place a lastmod is decided.
   *
   * base is the git (or DB) date. A content-class override on the same page
   * can move it forward, nothing else can, and nothing can push it past
   * yesterday.
   */
  const lastmodFor = (base: string, kind?: string, slug?: string): string => {
    let value = (base || LASTMOD_BUILD_DATE).slice(0, 10);
    if (kind && slug) {
      const content = contentDates.get(`${kind}/${slug}`);
      if (content && content > value) value = content;
    }
    return value > CEILING ? CEILING : value;
  };

  // Ordered, deduped by <loc>. Static entries are inserted first, so a DB row
  // that collides with a static shell is dropped (static wins).
  const entries = new Map<string, Entry>();
  const add = (loc: string, lastmod: string, changefreq = "monthly", priority = 0.8) => {
    if (!entries.has(loc)) entries.set(loc, { loc, lastmod, changefreq, priority });
  };

  // Top-level fixed pages (no /privacy, no /terms: both are noindex).
  // These can carry a kind "pages" override, so they take the same treatment.
  const page = (route: string, slug: string) => lastmodFor(routeLastmod(route), "pages", slug);
  add(`${SITE}/`, page("/", "home"), "weekly", 1.0);
  add(`${SITE}/quiz`, page("/quiz", "quiz"), "weekly", 0.9);
  add(`${SITE}/calculator`, page("/calculator", "calculator"), "monthly", 0.85);
  add(`${SITE}/insights`, page("/insights", "insights"), "weekly", 0.9);
  add(`${SITE}/glossary`, page("/glossary", "glossary"), "monthly", 0.85);
  add(`${SITE}/research/methodology`, page("/research/methodology", "research/methodology"), "monthly", 0.85);
  add(`${SITE}/comparisons`, page("/comparisons", "comparisons"), "weekly", 0.95);
  add(`${SITE}/data/effective-rates-2026`, page("/data/effective-rates-2026", "data/effective-rates-2026"), "monthly", 0.9);
  add(`${SITE}/about/barak`, page("/about/barak", "about/barak"), "monthly", 0.7);
  add(`${SITE}/pulse`, page("/pulse", "pulse"), "daily", 0.85);

  // Static comparison + insight shells (per-file git lastmod)
  for (const s of comparisonSlugs) {
    add(`${SITE}/comparisons/${s}`, lastmodFor(routeLastmod(`/comparisons/${s}`), "comparisons", s), "monthly", SLUG_PRIORITY[s] ?? 0.85);
  }
  for (const s of insightSlugs) {
    add(`${SITE}/insights/${s}`, lastmodFor(routeLastmod(`/insights/${s}`), "insights", s), "monthly", SLUG_PRIORITY[s] ?? 0.8);
  }

  // Glossary per-term sub-pages: one stable date for the whole set, the newest
  // git date across the index, the term template and the terms data file.
  const glossaryLastmod = lastmodFor(routeLastmod("/glossary/_terms"));
  for (const t of GLOSSARY) {
    add(`${SITE}/glossary/${t.slug}`, glossaryLastmod, "monthly", 0.75);
  }

  // Recent week roundups
  for (const r of roundups) {
    add(`${SITE}/pulse/week/${r.slug}`, lastmodFor(r.published_at), "weekly", 0.7);
  }

  // DB-driven autopilot articles (skipping any slug that now 308s)
  for (const a of autopilotArticles) {
    if (a.kind === "insights" && REDIRECTED_INSIGHT_SLUGS.has(a.slug)) continue;
    if (a.kind === "comparisons" && REDIRECTED_COMPARISON_SLUGS.has(a.slug)) continue;
    add(
      `${SITE}/${a.kind}/${a.slug}`,
      lastmodFor(a.updated_at || a.published_at || LASTMOD_BUILD_DATE, a.kind, a.slug),
      "monthly",
      0.8,
    );
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

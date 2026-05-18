import fs from "fs";
import path from "path";
import { getAdminSupabase } from "@/lib/funnel/admin-supabase";
import { REDIRECTED_INSIGHT_SLUGS } from "@/lib/insights/redirected-slugs";

const SITE = "https://www.mypayadvisor.com";

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

async function fetchAutopilotArticles() {
  try {
    const sb = getAdminSupabase();
    const { data } = await (sb as any)
      .from("blog_articles")
      .select("kind,slug,updated_at,published_at,index_in_sitemap")
      .eq("published", true)
      .eq("index_in_sitemap", true)
      .order("published_at", { ascending: false })
      .limit(2000);
    return (
      (data as Array<{
        kind: string;
        slug: string;
        updated_at: string;
        published_at: string | null;
      }>) || []
    );
  } catch {
    return [];
  }
}

async function fetchRecentWeekRoundups() {
  try {
    const sb = getAdminSupabase();
    const cutoff = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await (sb as any)
      .from("updates_feed")
      .select("slug,published_at")
      .eq("status", "published")
      .eq("type", "editorial")
      .like("slug", "%-week-%")
      .gte("published_at", cutoff)
      .order("published_at", { ascending: false })
      .limit(12);
    return (data as Array<{ slug: string; published_at: string }>) || [];
  } catch {
    return [];
  }
}

function entry(loc: string, lastmod: string, changefreq = "monthly", priority = 0.8) {
  return `\n  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);
  const publicDir = path.join(process.cwd(), "src", "app", "(public)");
  const insightSlugs = walkSubdirSlugs(path.join(publicDir, "insights")).filter(
    (s) => !REDIRECTED_INSIGHT_SLUGS.has(s)
  );
  const comparisonSlugs = walkSubdirSlugs(path.join(publicDir, "comparisons"));

  const [roundups, autopilotArticles] = await Promise.all([
    fetchRecentWeekRoundups(),
    fetchAutopilotArticles(),
  ]);

  // Top-level fixed pages
  const fixed = [
    entry(`${SITE}/`, today, "weekly", 1.0),
    entry(`${SITE}/quiz`, today, "weekly", 0.9),
    entry(`${SITE}/calculator`, today, "monthly", 0.85),
    entry(`${SITE}/insights`, today, "weekly", 0.9),
    entry(`${SITE}/glossary`, today, "monthly", 0.85),
    entry(`${SITE}/research/methodology`, today, "monthly", 0.85),
    entry(`${SITE}/comparisons`, today, "weekly", 0.95),
    entry(`${SITE}/data/effective-rates-2026`, today, "monthly", 0.9),
    entry(`${SITE}/about/barak`, today, "monthly", 0.7),
    entry(`${SITE}/pulse`, today, "daily", 0.85),
    entry(`${SITE}/privacy`, "2025-12-11", "yearly", 0.3),
    entry(`${SITE}/terms`, "2025-12-11", "yearly", 0.3),
  ].join("");

  // Auto-walked static insight + comparison shells
  const insightXml = insightSlugs
    .map((s) => entry(`${SITE}/insights/${s}`, today, "monthly", SLUG_PRIORITY[s] ?? 0.8))
    .join("");
  const comparisonXml = comparisonSlugs
    .map((s) => entry(`${SITE}/comparisons/${s}`, today, "monthly", SLUG_PRIORITY[s] ?? 0.85))
    .join("");

  // DB-driven autopilot articles
  const autopilotXml = autopilotArticles
    .map((a) => {
      const lastmod = (a.updated_at || a.published_at || today).slice(0, 10);
      return entry(`${SITE}/${a.kind}/${a.slug}`, lastmod, "monthly", 0.8);
    })
    .join("");

  // Recent week roundups
  const roundupXml = roundups
    .map((r) => entry(`${SITE}/pulse/week/${r.slug}`, r.published_at.slice(0, 10), "weekly", 0.7))
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">${fixed}${comparisonXml}${insightXml}${roundupXml}${autopilotXml}

</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

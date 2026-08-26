import { getAdminSupabase } from "@/lib/funnel/admin-supabase";
import { buildRss, SITE_URL, BRAND_NAME } from "@/lib/distribution/rss";
import { markdownToHtml, escapeHtmlText } from "@/lib/distribution/markdown-lite";

export const revalidate = 1800;
export const runtime = "nodejs";

// Full-content RSS for /pulse. Bodies live in updates_feed.body_md (there is no
// body_html column; the old select on it returned nothing, so every item shipped
// summary-only). body_md is rendered to simple HTML paragraphs inside
// <content:encoded><![CDATA[...]]></content:encoded>, followed by the source link
// and the canonical /pulse link. Cookie-free admin client so the route stays ISR.

type FeedRow = {
  slug: string;
  title: string | null;
  summary: string | null;
  source_url: string | null;
  source_name: string | null;
  type: string | null;
  related_processor: string | null;
  published_at: string | null;
  body_md: string | null;
};

export async function GET() {
  let rows: FeedRow[] = [];
  try {
    const supabase = getAdminSupabase();
    // updates_feed is not in the generated Database types; same cast the sitemap uses.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("updates_feed")
      .select("slug,title,summary,source_url,source_name,type,related_processor,published_at,body_md")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    rows = (data as FeedRow[]) || [];
  } catch {
    return new Response("feed temporarily unavailable", {
      status: 503,
      headers: { "Retry-After": "300", "Cache-Control": "no-store" },
    });
  }

  const items = rows
    .filter((row) => !!row.published_at)
    .map((row) => {
      const link = `${SITE_URL}/pulse/${row.slug}`;
      const summary = row.summary || "";
      const body = row.body_md
        ? markdownToHtml(row.body_md)
        : summary
          ? `<p>${escapeHtmlText(summary)}</p>`
          : "";
      const source = row.source_url
        ? `<p>Source: <a href="${escapeHtmlText(row.source_url)}">${escapeHtmlText(row.source_name || "original report")}</a></p>`
        : "";
      const canonical = `<p><a href="${link}">Read this item on ${BRAND_NAME}</a></p>`;
      return {
        title: row.title || row.slug,
        link,
        pubDate: row.published_at as string,
        description: summary,
        contentHtml: [body, source, canonical].filter(Boolean).join("\n"),
        author: row.source_name || `${BRAND_NAME} desk`,
        categories: [row.type || "industry_news", row.related_processor].filter(Boolean) as string[],
      };
    });

  const xml = buildRss({
    title: `${BRAND_NAME} Pulse`,
    link: `${SITE_URL}/pulse/feed.xml`,
    description: "Live industry news on payment processing: rate changes, outages, editorial roundups.",
    items,
  });

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=1800",
    },
  });
}

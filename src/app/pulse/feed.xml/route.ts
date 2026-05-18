import { createSupabaseServerClient } from "@/integrations/supabase/server";
import { buildRss, SITE_URL, BRAND_NAME } from "@/lib/distribution/rss";

export const revalidate = 1800;
export const runtime = "nodejs";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data } = await (supabase as any)
    .from("updates_feed")
    .select("slug,title,summary,source_url,source_name,type,related_processor,published_at,body_html")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50);

  const items = (data || []).map((row: any) => {
    const summary = row.summary || "";
    const fullHtml = row.body_html || (row.summary && row.source_url
      ? `<p>${row.summary}</p><p><a href="${row.source_url}">${row.source_name || "Source"}</a></p>`
      : summary);
    return {
      title: row.title || row.slug,
      link: `${SITE_URL}/pulse/${row.slug}`,
      pubDate: row.published_at || new Date().toISOString(),
      description: summary,
      contentHtml: fullHtml,
      author: row.source_name || "myPayAdvisor desk",
      categories: [row.type || "industry_news", row.related_processor].filter(Boolean) as string[],
    };
  });

  const xml = buildRss({
    title: `${BRAND_NAME} — Pulse`,
    link: `${SITE_URL}/pulse/feed.xml`,
    description: "Live industry news on payment processing — rate changes, outages, editorial roundups.",
    items,
  });

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=1800, s-maxage=1800",
    },
  });
}

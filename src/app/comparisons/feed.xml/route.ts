import { createSupabaseServerClient } from "@/integrations/supabase/server";
import { buildRss, SITE_URL, BRAND_NAME } from "@/lib/distribution/rss";

export const revalidate = 3600;
export const runtime = "nodejs";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data } = await (supabase as any)
    .from("blog_articles")
    .select("slug,title,description,meta_description,body_html,published_at,updated_at,author")
    .eq("kind", "comparisons")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(50);

  const items = (data || []).map((row: any) => ({
    title: row.title || row.slug,
    link: `${SITE_URL}/comparisons/${row.slug}`,
    pubDate: row.published_at || row.updated_at || new Date().toISOString(),
    description: row.description || row.meta_description || "",
    contentHtml: row.body_html || row.description || "",
    author: row.author || "myPayAdvisor",
    categories: ["Payment Processing", "Comparison"],
  }));

  const xml = buildRss({
    title: `${BRAND_NAME}: Comparisons`,
    link: `${SITE_URL}/comparisons/feed.xml`,
    description: "Side-by-side payment processor comparisons with real 2026 rates.",
    items,
  });

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

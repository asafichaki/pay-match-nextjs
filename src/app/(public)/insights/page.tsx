import { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { JsonLd } from "@/components/JsonLd";
import InsightsContent from "./InsightsContent";
import { REDIRECTED_INSIGHT_SLUGS } from "@/lib/insights/redirected-slugs";
import { createSupabaseServerClient } from "@/integrations/supabase/server";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Payment Processing Insights & Expert Guides 2026",
  description: "Expert insights on payment processing, payment gateways, merchant services, and choosing the right payment provider in 2026. In-depth guides to optimize your business payments and reduce processing costs.",
  keywords: "payment processing guides 2026, payment gateway tutorials, merchant services advice, credit card processing tips, payment processor comparison, fintech insights",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.mypayadvisor.com/insights" },
  openGraph: {
    type: "website",
    url: "https://www.mypayadvisor.com/insights",
    title: "Payment Processing Insights & Expert Guides 2026",
    description: "Expert insights on payment processing, payment gateways, and choosing the right payment provider in 2026.",
    images: [{ url: "https://www.mypayadvisor.com/og-logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Payment Processing Insights & Expert Guides 2026",
    description: "Expert guides on payment processing and choosing the right payment provider.",
  },
};

interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  slug: string;
  keywords: string[];
  iso: string;
  hasAudio?: boolean;
  hasVideo?: boolean;
  hasSlides?: boolean;
}

function firstMatch(src: string, re: RegExp): string | null {
  const m = src.match(re);
  return m ? m[1] : null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function discoverStaticArticles(): Article[] {
  const insightsDir = path.join(process.cwd(), "src", "app", "(public)", "insights");
  let entries: string[] = [];
  try {
    entries = fs.readdirSync(insightsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith("[") && !e.name.startsWith("_"))
      .map((e) => e.name)
      .filter((name) => !REDIRECTED_INSIGHT_SLUGS.has(name));
  } catch {
    return [];
  }

  const articles: Article[] = [];
  for (const slug of entries) {
    const file = path.join(insightsDir, slug, "page.tsx");
    let src = "";
    try { src = fs.readFileSync(file, "utf8"); } catch { continue; }

    const title =
      firstMatch(src, /export\s+const\s+metadata[\s\S]*?title:\s*["'`]([^"'`]+)["'`]/) ||
      firstMatch(src, /"headline":"([^"\\]+)"/) ||
      slug;
    const description =
      firstMatch(src, /export\s+const\s+metadata[\s\S]*?description:\s*["'`]([^"'`]+)["'`]/) ||
      firstMatch(src, /"description":"([^"\\]+)"/) ||
      "";
    const iso =
      firstMatch(src, /"datePublished":"([^"]+)"/) ||
      firstMatch(src, /datetime="([^"]+)"/) ||
      "";
    const category =
      firstMatch(src, /"articleSection":"([^"\\]+)"/) || "Insights";

    articles.push({
      id: slug,
      title: decodeEntities(title),
      description: decodeEntities(description),
      category,
      date: iso ? formatDate(iso) : "",
      iso,
      slug: `/insights/${slug}`,
      keywords: [],
    });
  }
  return articles;
}

async function fetchDbArticles(): Promise<Article[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await (supabase as any)
      .from("blog_articles")
      .select("slug,title,description,meta_description,published_at,updated_at,audio_url,video_url,youtube_id,slide_image_urls,tags")
      .eq("kind", "insights")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(500);
    if (!data) return [];
    return (data as any[]).map((row) => ({
      id: row.slug,
      title: row.title || row.slug,
      description: row.description || row.meta_description || "",
      category: "Insights",
      date: row.published_at ? formatDate(row.published_at) : "",
      iso: row.published_at || row.updated_at || "",
      slug: `/insights/${row.slug}`,
      keywords: Array.isArray(row.tags) ? row.tags : [],
      hasAudio: !!row.audio_url,
      hasVideo: !!(row.video_url || row.youtube_id),
      hasSlides: Array.isArray(row.slide_image_urls) && row.slide_image_urls.length > 0,
    }));
  } catch {
    return [];
  }
}

async function getAllArticles(): Promise<Article[]> {
  const [staticArticles, dbArticles] = await Promise.all([
    Promise.resolve(discoverStaticArticles()),
    fetchDbArticles(),
  ]);

  // DB articles win on slug collision (more recent + has media metadata)
  const bySlug = new Map<string, Article>();
  for (const a of staticArticles) bySlug.set(a.slug, a);
  for (const a of dbArticles) bySlug.set(a.slug, a);

  const merged = Array.from(bySlug.values());
  merged.sort((a, b) => (b.iso || "").localeCompare(a.iso || ""));
  return merged;
}

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.mypayadvisor.com" },
    { "@type": "ListItem", "position": 2, "name": "Insights", "item": "https://www.mypayadvisor.com/insights" },
  ],
};

export default async function InsightsPage() {
  const articles = await getAllArticles();

  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Payment Processing Insights & Expert Guides 2026",
    "description": "Expert insights on payment processing, payment gateways, and choosing the right payment provider for your business in 2026.",
    "url": "https://www.mypayadvisor.com/insights",
    "mainEntity": {
      "@type": "ItemList",
      "name": "Payment Processing Articles",
      "numberOfItems": articles.length,
      "itemListElement": articles.map((article, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Article",
          "headline": article.title,
          "description": article.description,
          "url": `https://www.mypayadvisor.com${article.slug}`,
          "datePublished": article.iso || undefined,
          "author": { "@type": "Organization", "name": "myPayAdvisor" },
          "publisher": {
            "@type": "Organization",
            "name": "myPayAdvisor",
            "logo": { "@type": "ImageObject", "url": "https://www.mypayadvisor.com/og-logo.png" },
          },
        },
      })),
    },
  };

  return (
    <>
      <JsonLd data={collectionPageSchema} />
      <JsonLd data={breadcrumbSchema} />
      <InsightsContent articles={articles} />
    </>
  );
}

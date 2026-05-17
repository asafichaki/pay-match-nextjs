import { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { JsonLd } from "@/components/JsonLd";
import InsightsContent from "./InsightsContent";
import { REDIRECTED_INSIGHT_SLUGS } from "@/lib/insights/redirected-slugs";

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

function discoverArticles(): Article[] {
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

  articles.sort((a, b) => (b.iso || "").localeCompare(a.iso || ""));
  return articles;
}

const articles = discoverArticles();

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

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.mypayadvisor.com" },
    { "@type": "ListItem", "position": 2, "name": "Insights", "item": "https://www.mypayadvisor.com/insights" },
  ],
};

export default function InsightsPage() {
  return (
    <>
      <JsonLd data={collectionPageSchema} />
      <JsonLd data={breadcrumbSchema} />
      <InsightsContent articles={articles} />
    </>
  );
}

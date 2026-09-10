import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { withSeoOverride } from "@/lib/seo/overrides";
import { AeoAnswer } from "@/components/seo/AeoAnswer";
import content from "@/data/articles/pos-by-business-type.json";
import { MatchCTA } from "@/components/MatchCTA";
import { RelatedLinks } from "@/components/seo/RelatedLinks";

const baseMetadata: Metadata = {
  // absolute + use-case angle: this page owns "best POS by business type"; the pricing head term
  // "best pos systems for small business 2026" is owned by /comparisons/best-pos-systems-for-small-business-2026 (avoids cannibalization).
  title: { absolute: "Best POS System by Business Type: 2026 Expert Picks" },
  description: "The best POS system depends on your business type. 2026 expert picks: Square for retail, Toast for restaurants, Vagaro for services, plus Clover, Shopify, and Lightspeed compared by use case.",
  alternates: {
    canonical: "https://www.mypayadvisor.com/insights/best-pos-systems-for-small-business-2026-niche-comparison-expert-picks",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("insights", "best-pos-systems-for-small-business-2026-niche-comparison-expert-picks", baseMetadata);
}

const html = content.body_html;

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Best POS System by Business Type: 2026 Expert Picks",
  description: "The best POS system depends on your business type. 2026 expert picks: Square for retail, Toast for restaurants, Vagaro for services, plus Clover, Shopify, and Lightspeed compared by use case.",
  datePublished: "2026-04-15T17:35:15.531Z",
  dateModified: "2026-09-10",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://www.mypayadvisor.com/insights/best-pos-systems-for-small-business-2026-niche-comparison-expert-picks"
  },
  author: {
    "@type": "Organization",
    name: "myPayAdvisor",
  },
  publisher: {
    "@type": "Organization",
    name: "myPayAdvisor",
    logo: {
      "@type": "ImageObject",
      url: "https://www.mypayadvisor.com/og-logo.png"
    }
  }
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.mypayadvisor.com" },
    { "@type": "ListItem", position: 2, name: "Insights", item: "https://www.mypayadvisor.com/insights" },
    { "@type": "ListItem", position: 3, name: "Best POS System by Business Type: 2026 Expert Picks", item: "https://www.mypayadvisor.com/insights/best-pos-systems-for-small-business-2026-niche-comparison-expert-picks" }
  ]
};

export default function InsightPage() {
  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: content.faq_json.map((item) => ({ "@type": "Question", name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer } })) }} />
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="flex gap-12 justify-center">
          <article className="max-w-3xl flex-1 min-w-0">
            <header className="mb-12 border-b border-border pb-8">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="font-medium text-primary">Payment Processing</span>
                <span>&bull;</span>
                <span>Sources checked September 10, 2026</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground leading-tight mb-6">
                Best POS System by Business Type in 2026: Square for Retail, Toast for Restaurants, Vagaro for Services
              </h1>
              <AeoAnswer kind="insights" slug="best-pos-systems-for-small-business-2026-niche-comparison-expert-picks" />
              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                The best POS system depends on your business type. These are the 2026 expert picks by use case, from retail and restaurants to mobile and appointment-based services, with the pricing and hardware trade-offs that decide each one.
              </p>
              <div className="pt-4 border-t border-border">
                <Link href="/insights" className="text-sm text-primary hover:underline">
                  Back to Insights
                </Link>
              </div>
            </header>
            <MatchCTA headline="Find a POS that fits how you sell"
              subline="Tell us your business type and monthly volume. Request a comparison for your store or service business. Phone number optional."
              ctaLabel="Compare my POS options" />
            <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />
            <section className="article-body mt-10" aria-labelledby="pos-faq">
              <h2 id="pos-faq">Frequently asked questions</h2>
              {content.faq_json.map((item) => <div key={item.question}>
                <h3>{item.question}</h3><p>{item.answer}</p>
              </div>)}
            </section>
          </article>
        </div>
      </div>
    <RelatedLinks kind="insights" slug="best-pos-systems-for-small-business-2026-niche-comparison-expert-picks" />
    </>
  );
}

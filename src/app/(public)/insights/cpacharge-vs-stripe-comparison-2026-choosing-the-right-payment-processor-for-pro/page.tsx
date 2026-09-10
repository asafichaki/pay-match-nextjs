import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { BARAK_NAME, BARAK_TITLE, BARAK_LINKEDIN } from "@/data/personas/barak";
import { withSeoOverride } from "@/lib/seo/overrides";
import { AeoAnswer } from "@/components/seo/AeoAnswer";
import content from "@/data/articles/cpacharge-vs-stripe.json";
import { MatchCTA } from "@/components/MatchCTA";
import { RelatedLinks } from "@/components/seo/RelatedLinks";

const baseMetadata: Metadata = {
  title: "CPACharge vs Stripe 2026: Which Wins for Pro Services",
  description: content.description,
  alternates: {
    canonical: "https://www.mypayadvisor.com/insights/cpacharge-vs-stripe-comparison-2026-choosing-the-right-payment-processor-for-pro",
  },
  openGraph: {
    title: "CPACharge vs Stripe 2026: Which Wins for Pro Services",
    description: content.description,
    url: "https://www.mypayadvisor.com/insights/cpacharge-vs-stripe-comparison-2026-choosing-the-right-payment-processor-for-pro",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "CPACharge vs Stripe 2026: Which Wins for Pro Services",
    description: content.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("insights", "cpacharge-vs-stripe-comparison-2026-choosing-the-right-payment-processor-for-pro", baseMetadata);
}

const html = content.body_html;

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "CPACharge vs Stripe 2026: Which Wins for Pro Services",
  description: content.description,
  datePublished: "2026-04-02T07:08:41.508Z",
  dateModified: "2026-09-10",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://www.mypayadvisor.com/insights/cpacharge-vs-stripe-comparison-2026-choosing-the-right-payment-processor-for-pro"
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
    { "@type": "ListItem", position: 3, name: "CPACharge vs Stripe 2026: Which Wins for Pro Services", item: "https://www.mypayadvisor.com/insights/cpacharge-vs-stripe-comparison-2026-choosing-the-right-payment-processor-for-pro" }
  ]
};

const faqSchema = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: content.faq_json.map((item) => ({
    "@type": "Question", name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default function InsightPage() {
  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
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
                CPACharge vs Stripe 2026: Which Wins for Pro Services
              </h1>
              <AeoAnswer kind="insights" slug="cpacharge-vs-stripe-comparison-2026-choosing-the-right-payment-processor-for-pro" />
              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                {content.description}
              </p>
              <div className="pt-4 border-t border-border">
                <Link href="/insights" className="text-sm text-primary hover:underline">
                  Back to Insights
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                About our payments expert:{" "}
                <Link href="/about/barak" className="font-medium text-foreground hover:text-primary underline">
                  {BARAK_NAME}
                </Link>
                , {BARAK_TITLE} ·{" "}
                <a href={BARAK_LINKEDIN} target="_blank" rel="noopener noreferrer" className="hover:text-primary underline">
                  LinkedIn
                </a>
              </p>
            </header>
            <MatchCTA headline="Compare payment options for your firm"
              subline="Tell us your business type and monthly volume. Request a comparison for your workflow. Phone number optional."
              ctaLabel="Compare my firm's options" />
            <div className="article-body" dangerouslySetInnerHTML={{ __html: html }} />
            <section className="article-body mt-10" aria-labelledby="cpa-faq">
              <h2 id="cpa-faq">Frequently asked questions</h2>
              {content.faq_json.map((item) => <div key={item.question}>
                <h3>{item.question}</h3><p>{item.answer}</p>
              </div>)}
            </section>
          </article>
        </div>
      </div>
    <RelatedLinks kind="insights" slug="cpacharge-vs-stripe-comparison-2026-choosing-the-right-payment-processor-for-pro" />
    </>
  );
}

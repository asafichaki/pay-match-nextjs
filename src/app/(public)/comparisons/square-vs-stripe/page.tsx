import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import SquareVsStripeContent from "./SquareVsStripeContent";
import { withSeoOverride } from "@/lib/seo/overrides";
import { AeoAnswer } from "@/components/seo/AeoAnswer";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { CompareMore } from "@/components/comparisons/CompareMore";
import { FAQ, META_DESCRIPTION } from "./data";

const TITLE = "Square vs Stripe 2026: Fees Compared at $10K to $250K";

const baseMetadata: Metadata = {
  title: { absolute: TITLE },
  description: META_DESCRIPTION,
  keywords: ["Square vs Stripe", "Stripe vs Square", "Square vs Stripe fees", "payment processor comparison", "Square POS", "Stripe API", "best payment processor 2026", "credit card processing", "online payments", "in-person payments"],
  alternates: {
    canonical: "https://www.mypayadvisor.com/comparisons/square-vs-stripe",
  },
  openGraph: {
    title: TITLE,
    description: META_DESCRIPTION,
    url: "https://www.mypayadvisor.com/comparisons/square-vs-stripe",
    type: "article",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
  other: {
    "article:published_time": "2025-11-15T00:00:00.000Z",
    "article:modified_time": "2026-11-01T00:00:00.000Z",
  },
};

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("comparisons", "square-vs-stripe", baseMetadata);
}

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  // Same list as the visible FAQ (data.ts), so the two cannot disagree.
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const speakableSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://www.mypayadvisor.com/comparisons/square-vs-stripe#webpage",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: [".aeo-answer", "h1"],
  },
};

export default function SquareVsStripePage() {
  return (
    <>
      <ComparisonSchema
        title="Square vs Stripe 2026: Fees, Payouts and Which to Pick"
        description={META_DESCRIPTION}
        slug="square-vs-stripe"
        datePublished="2025-11-15"
        dateModified="2026-11-01"
        breadcrumbItems={[
          { name: "Home", item: "https://www.mypayadvisor.com" },
          { name: "Comparisons", item: "https://www.mypayadvisor.com/comparisons" },
          { name: "Square vs Stripe" },
        ]}
        quotation={{
          text: "For a typical, low-risk business, your effective rate should be around 3 to 4%.",
          creator: {
            "@type": "Person",
            name: "Erica Seppala",
            jobTitle: "Editor & Senior Staff Writer",
            worksFor: { "@type": "Organization", name: "Merchant Maverick" },
            url: "https://www.merchantmaverick.com/author/erica-seppala/",
          },
          publisher: {
            "@type": "Organization",
            name: "Merchant Maverick",
            url: "https://www.merchantmaverick.com/",
          },
          isBasedOn: "https://www.merchantmaverick.com/the-complete-guide-to-credit-card-processing-rates-and-fees/",
          inLanguage: "en-US",
        }}
      />
      <JsonLd data={faqStructuredData} />
      <JsonLd data={speakableSchema} />
      <SquareVsStripeContent
        aeoAnswer={<AeoAnswer kind="comparisons" slug="square-vs-stripe" />}
        relatedLinks={<RelatedLinks kind="comparisons" slug="square-vs-stripe" />}
      />
      <CompareMore slug="square-vs-stripe" />
    </>
  );
}

import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import StripeVsPayPalContent from "./StripeVsPayPalContent";
import { withSeoOverride } from "@/lib/seo/overrides";
import { AeoAnswer } from "@/components/seo/AeoAnswer";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { CompareMore } from "@/components/comparisons/CompareMore";
import { FAQ, META_DESCRIPTION as COMPUTED_DESCRIPTION } from "./data";
// Literal, so the SEO manifest and llms.txt can read it statically. It must equal the
// string data.ts computes from ranking-2026.ts; the build fails if a price moves.
const META_DESCRIPTION = "PayPal Checkout 3.49% + 49¢ vs Stripe 2.9% + 30¢: about $97 more per $10K on $50 sales. Card, in-person, dispute and payout fees by volume.";
if (META_DESCRIPTION !== COMPUTED_DESCRIPTION) {
  throw new Error("stripe-vs-paypal: meta description literal is out of date with data.ts / ranking-2026.ts");
}


const baseMetadata: Metadata = {
  title: { absolute: "Stripe vs PayPal 2026: 2.9% Stripe vs 3.49% PayPal Rate" },
  description: META_DESCRIPTION,
  alternates: {
    canonical: "https://www.mypayadvisor.com/comparisons/stripe-vs-paypal",
  },
  openGraph: {
    title: "Stripe vs PayPal 2026: 2.9% Stripe vs 3.49% PayPal Rate",
    description: META_DESCRIPTION,
    url: "https://www.mypayadvisor.com/comparisons/stripe-vs-paypal",
    type: "article",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
  other: {
    "article:published_time": "2025-11-15T00:00:00.000Z",
    "article:modified_time": "2026-11-11T00:00:00.000Z",
  },
};

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("comparisons", "stripe-vs-paypal", baseMetadata);
}

const speakableSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://www.mypayadvisor.com/comparisons/stripe-vs-paypal#webpage",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: [".aeo-answer", "h1"],
  },
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  // Same list as the visible FAQ (data.ts), so the two cannot disagree.
  mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function StripeVsPayPalPage() {
  return (
    <>
      <ComparisonSchema
        title="Stripe vs PayPal 2026: 2.9% Stripe vs 3.49% PayPal Rate"
        description={META_DESCRIPTION}
        slug="stripe-vs-paypal"
        datePublished="2025-11-15"
        dateModified="2026-11-11"
        breadcrumbItems={[
          { name: "Home", item: "https://www.mypayadvisor.com" },
          { name: "Comparisons", item: "https://www.mypayadvisor.com/comparisons" },
          { name: "Stripe vs PayPal" },
        ]}
        quotation={{
          text: "Stripe can process payments in more than 135 currencies. This can be valuable for small businesses that want to expand overseas.",
          creator: {
            "@type": "Person",
            name: "Hillary Crawford",
            jobTitle: "Lead Writer & Content Strategist",
            worksFor: { "@type": "Organization", name: "NerdWallet" },
            url: "https://www.nerdwallet.com/blog/author/hcrawford/",
          },
          publisher: {
            "@type": "Organization",
            name: "NerdWallet",
            url: "https://www.nerdwallet.com/",
          },
          isBasedOn: "https://www.nerdwallet.com/business/software/learn/stripe-vs-paypal",
          inLanguage: "en-US",
        }}
      />
      <JsonLd data={speakableSchema} />
      <JsonLd data={faqStructuredData} />
      <StripeVsPayPalContent
        aeoAnswer={<AeoAnswer kind="comparisons" slug="stripe-vs-paypal" />}
        relatedLinks={<RelatedLinks kind="comparisons" slug="stripe-vs-paypal" />}
      />
      <CompareMore slug="stripe-vs-paypal" />
    </>
  );
}

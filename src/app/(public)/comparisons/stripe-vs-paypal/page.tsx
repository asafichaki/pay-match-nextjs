import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import StripeVsPayPalContent from "./StripeVsPayPalContent";

export const metadata: Metadata = {
  title: "Stripe vs PayPal 2026: 2.97% vs 3.07% Effective Rate",
  description: "Stripe 2.9% + $0.30 vs PayPal 2.99% + $0.49. PayPal processes 135+ currencies for cross-border sellers, Stripe wins on subscriptions. Effective rates at $10K, $50K, $250K.",
  alternates: {
    canonical: "https://www.mypayadvisor.com/comparisons/stripe-vs-paypal",
  },
  openGraph: {
    title: "Stripe vs PayPal 2026: 2.97% vs 3.07% Effective Rate",
    description: "Stripe 2.9% + $0.30 vs PayPal 2.99% + $0.49. PayPal processes 135+ currencies for cross-border sellers, Stripe wins on subscriptions. Effective rates at $10K, $50K, $250K.",
    url: "https://www.mypayadvisor.com/comparisons/stripe-vs-paypal",
    type: "article",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
  other: {
    "article:published_time": "2025-11-15T00:00:00.000Z",
    "article:modified_time": new Date().toISOString(),
  },
};

const speakableSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://www.mypayadvisor.com/comparisons/stripe-vs-paypal#webpage",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: [".aeo-answer", "h1"],
  },
};

export default function StripeVsPayPalPage() {
  return (
    <>
      <ComparisonSchema
        title="Stripe vs PayPal 2026: Fees, FX Cost & Conversion Compared"
        description="Stripe vs PayPal comparison for 2026. Fees, FX cost, conversion lift, APIs, and subscriptions, side by side."
        slug="stripe-vs-paypal"
        datePublished="2025-11-15"
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
      <StripeVsPayPalContent />
    </>
  );
}

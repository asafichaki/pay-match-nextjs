import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import SquareVsStripeContent from "./SquareVsStripeContent";

export const metadata: Metadata = {
  title: "Square vs Stripe 2026: 2.65% In-Person vs 2.97% Online",
  description: "Square 2.6% + $0.10 in-person, Stripe 2.9% + $0.30 online. Square wins retail under $80K monthly, Stripe wins SaaS and subscriptions. May 2026 rates.",
  keywords: ["Square vs Stripe", "Stripe vs Square", "payment processor comparison", "Square POS", "Stripe API", "best payment processor 2026", "credit card processing", "online payments", "in-person payments"],
  alternates: {
    canonical: "https://www.mypayadvisor.com/comparisons/square-vs-stripe",
  },
  openGraph: {
    title: "Square vs Stripe 2026: 2.65% In-Person vs 2.97% Online",
    description: "Square 2.6% + $0.10 in-person, Stripe 2.9% + $0.30 online. Square wins retail under $80K monthly, Stripe wins SaaS and subscriptions. May 2026 rates.",
    url: "https://www.mypayadvisor.com/comparisons/square-vs-stripe",
    type: "article",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
  other: {
    "article:published_time": "2025-11-15T00:00:00.000Z",
    "article:modified_time": new Date().toISOString(),
  },
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Which is cheaper, Square or Stripe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For in-person transactions, Square is slightly cheaper (2.6% + $0.10 vs 2.7% + $0.05). Online rates are identical (2.9% + $0.30). For ACH payments, Stripe is much cheaper (0.8% capped at $5 vs Square's 3.3% + $0.30).",
      },
    },
    {
      "@type": "Question",
      name: "Which is better for restaurants?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Square wins for restaurants with Square for Restaurants offering table management, course firing, menu modifiers, kitchen display system, tableside ordering, split checks, and tip pooling. Stripe would require building or buying third-party restaurant POS.",
      },
    },
    {
      "@type": "Question",
      name: "Which is better for SaaS/subscription businesses?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Stripe wins for SaaS with advanced billing features including usage-based pricing, metered billing, tiered pricing, smart dunning, revenue recognition, and customer portal. Square only offers basic recurring billing.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need a developer for Stripe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not necessarily. You don't need a developer if using Stripe with platforms like Shopify/WooCommerce, Stripe Checkout hosted pages, or simple payment links. Developers are helpful for custom checkout design and required for building marketplaces or complex automation.",
      },
    },
    {
      "@type": "Question",
      name: "Can I accept international payments with Square?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Very limited. Square only operates in 8 countries with no currency conversion or local payment methods. Stripe supports 46 countries, 135+ currencies, and local payment methods, making it the clear choice for international businesses.",
      },
    },
    {
      "@type": "Question",
      name: "Can I switch from Square to Stripe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, switching is straightforward with no cancellation fees from either processor. Timeline is typically 1-3 weeks including account setup, integration, customer data migration, and testing.",
      },
    },
  ],
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
        title="Square vs Stripe 2026: Fees, POS & Online Comparison"
        description="Square vs Stripe comparison for 2026. Compare pricing, POS features, ecommerce capabilities, APIs, and find the best payment processor for your channel mix."
        slug="square-vs-stripe"
        datePublished="2025-11-15"
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
      <SquareVsStripeContent />
    </>
  );
}

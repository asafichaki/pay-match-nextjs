import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import SquareVsStripeContent from "./SquareVsStripeContent";

export const metadata: Metadata = {
  title: { absolute: "Square vs Stripe 2026: 2.65% In-Person vs 2.97% Online" },
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
    "article:modified_time": "2026-08-25T00:00:00.000Z",
  },
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Square better than Stripe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on your channel mix. Square is better for physical retail and food businesses under roughly $80K monthly, where its 2.65% effective in-person rate and free POS win. Stripe is better for online-first, SaaS, and subscription businesses that need APIs, advanced billing, and international coverage. Neither is universally better, they win different use cases.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between Stripe and Square?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Square is a point-of-sale and in-person payments company with a full POS ecosystem and free hardware, priced at 2.6% + $0.10 in-person. Stripe is a developer-first online payments platform at 2.9% + $0.30, built for websites, apps, marketplaces, and subscriptions. Online card rates are close, but Square owns in-person retail and Stripe owns online and recurring billing.",
      },
    },
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
    {
      "@type": "Question",
      name: "When does it make sense to leave Stripe or Square for interchange-plus?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Around $80K to $100K in monthly card volume, the markup baked into a 2.6 to 2.9 percent flat rate starts costing more than a monthly subscription or a small interchange-plus markup. At $250K monthly volume with an average retail card mix, an interchange-plus processor with a 0.40 percent markup typically lands 0.30 to 0.60 percent below either flat rate. On $3M annual volume that is roughly $12,000 to $18,000 saved per year. The exception is if you have heavy seasonality or unstable volume, where unpredictable monthly fees can hurt more than the percentage savings help.",
      },
    },
    {
      "@type": "Question",
      name: "Does Square ever charge a monthly fee?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not on the free plan. Square POS, Square Dashboard, and basic invoicing are free, and you only pay per transaction. Square does charge monthly subscriptions for vertical-specific software: Square for Restaurants Plus is $69 per location per month, Square for Retail Plus is $89 per location per month, Square Appointments Plus is $29 per location per month. Square Online is free with paid plans starting at $29 per month for custom domain and removed Square branding. Hardware is sold separately. PCI compliance, statement fees, and account closure fees are not charged on the standard plan.",
      },
    },
    {
      "@type": "Question",
      name: "Why is Stripe's published rate higher than what large enterprises pay?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The 2.9 percent plus 30 cents number is Stripe's standard plan, designed for self-serve signups under $80K monthly volume. Stripe offers custom interchange-plus pricing through its sales team for higher-volume merchants, where the markup is typically negotiated as a small percentage and per-transaction fee on top of true interchange. The published rate has to cover Stripe's full cost (interchange, network fees, processing margin, fraud risk, and software) for any account that signs up without a conversation, so it is intentionally above what a $1M+ monthly volume merchant would actually pay after negotiation.",
      },
    },
    {
      "@type": "Question",
      name: "Can Square hold my money?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Square's Seller Agreement allows account holds, rolling reserves, and termination at Square's discretion, particularly for merchants in higher-risk categories or those whose volume patterns trigger automated risk filters. Common triggers include a sudden volume spike, high chargeback ratio, or a merchant category code (firearms, supplements, CBD, ticket resale, certain coaching) that Square treats as elevated risk. Funds are typically held for 30 to 90 days. The defensive move for any business in those verticals is to set up a parallel interchange-plus merchant account on day one, so a Square hold does not freeze your operations.",
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
        dateModified="2026-08-25"
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

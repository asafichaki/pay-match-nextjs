import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import PayPalVsSquareContent from "./PayPalVsSquareContent";

export const metadata: Metadata = {
  title: "PayPal vs Square 2026: 3.07% vs 2.65% Effective Rate",
  description: "PayPal 2.99% + $0.49 online vs Square 2.6% + $0.10 in-person. PayPal POS gets some of the lowest flat rates, Square owns retail. Which wins by channel and volume.",
  keywords: ["Square vs PayPal", "PayPal vs Square", "payment processor comparison", "small business payments", "POS comparison"],
  alternates: {
    canonical: "https://www.mypayadvisor.com/comparisons/paypal-vs-square",
  },
  openGraph: {
    title: "PayPal vs Square 2026: 3.07% vs 2.65% Effective Rate",
    description: "PayPal 2.99% + $0.49 online vs Square 2.6% + $0.10 in-person. PayPal POS gets some of the lowest flat rates, Square owns retail. Which wins by channel and volume.",
    url: "https://www.mypayadvisor.com/comparisons/paypal-vs-square",
    type: "article",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "PayPal vs Square 2026: 3.07% vs 2.65% Effective Rate",
    description: "PayPal 2.99% + $0.49 online vs Square 2.6% + $0.10 in-person. PayPal POS gets some of the lowest flat rates, Square owns retail. Which wins by channel and volume.",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
  other: {
    "article:published_time": "2024-12-01T00:00:00.000Z",
    "article:modified_time": new Date().toISOString(),
  },
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Which is cheaper: Square or PayPal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Square is cheaper for online transactions (2.9% + $0.30 vs PayPal's 2.99% + $0.49). PayPal's Zettle is cheaper for in-person (2.29% + $0.09 vs Square's 2.6% + $0.10).",
      },
    },
    {
      "@type": "Question",
      name: "Which has better hardware: Square or PayPal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Square has significantly better hardware with a complete range from $49 mobile readers to $799 Square Register. PayPal's Zettle has only two main devices.",
      },
    },
    {
      "@type": "Question",
      name: "Is Square or PayPal better for restaurants?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Square is significantly better for restaurants with industry-specific features like table management, course timing, kitchen display integration, and delivery platform connections.",
      },
    },
  ],
};

export default function PayPalVsSquarePage() {
  return (
    <>
      <ComparisonSchema
        title="Square vs PayPal 2026: Complete Comparison for Small Businesses"
        description="Complete comparison of Square vs PayPal for 2026. Compare fees, features, hardware, and find which payment processor is best for your small business needs."
        slug="paypal-vs-square"
        datePublished="2024-12-01"
        breadcrumbItems={[
          { name: "Home", item: "https://www.mypayadvisor.com" },
          { name: "Comparisons", item: "https://www.mypayadvisor.com/comparisons" },
          { name: "Square vs PayPal" },
        ]}
        quotation={{
          text: "If you use PayPal POS to accept card payments in-person, you'll get access to some of the lowest flat rates out there.",
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
          isBasedOn: "https://www.nerdwallet.com/business/software/learn/stripe-vs-paypal-vs-square",
          inLanguage: "en-US",
        }}
      />
      <JsonLd data={faqStructuredData} />
      <PayPalVsSquareContent />
    </>
  );
}

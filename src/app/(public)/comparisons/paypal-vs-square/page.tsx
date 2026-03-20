import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import PayPalVsSquareContent from "./PayPalVsSquareContent";

export const metadata: Metadata = {
  title: "Square vs PayPal 2026: Complete Comparison for Small Businesses",
  description: "Complete comparison of Square vs PayPal for 2026. Compare fees, features, hardware, and find which payment processor is best for your small business needs.",
  keywords: ["Square vs PayPal", "PayPal vs Square", "payment processor comparison", "small business payments", "POS comparison"],
  alternates: {
    canonical: "https://www.mypayadvisor.com/comparisons/paypal-vs-square",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Square vs PayPal: Complete Comparison for Small Businesses (2026)",
  description: "Complete comparison of Square vs PayPal for 2026. Compare fees, features, hardware, and find which payment processor is best for your small business needs.",
  image: "https://www.mypayadvisor.com/og-logo.png",
  author: { "@type": "Organization", name: "myPayAdvisor" },
  datePublished: "2024-12-01",
  dateModified: "2025-01-15",
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
      <JsonLd data={structuredData} />
      <JsonLd data={faqStructuredData} />
      <PayPalVsSquareContent />
    </>
  );
}

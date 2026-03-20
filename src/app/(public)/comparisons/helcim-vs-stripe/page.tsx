import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import HelcimVsStripeContent from "./HelcimVsStripeContent";

export const metadata: Metadata = {
  title: "Helcim vs Stripe 2026: Complete Comparison Guide",
  description: "Helcim vs Stripe comparison 2026: Compare interchange-plus vs flat-rate pricing, features, support. Save 15-25% with Helcim or get advanced features with Stripe.",
  keywords: ["Helcim vs Stripe", "Stripe vs Helcim", "interchange-plus pricing", "payment processor comparison"],
  alternates: {
    canonical: "https://www.mypayadvisor.com/comparisons/helcim-vs-stripe",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Helcim vs Stripe: Which Payment Processor Offers Better Value? (2026)",
  description: "Complete Helcim vs Stripe comparison for 2026. Compare interchange-plus vs flat-rate pricing, features, support, and find which payment processor saves you more money.",
  image: "https://www.mypayadvisor.com/og-logo.png",
  author: { "@type": "Organization", name: "myPayAdvisor", url: "https://www.mypayadvisor.com" },
  publisher: { "@type": "Organization", name: "myPayAdvisor", logo: { "@type": "ImageObject", url: "https://www.mypayadvisor.com/og-logo.png" } },
  datePublished: "2024-12-01",
  dateModified: "2024-12-01",
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://www.mypayadvisor.com/comparisons/helcim-vs-stripe" },
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Is Helcim cheaper than Stripe?", acceptedAnswer: { "@type": "Answer", text: "For most businesses, yes. Helcim's interchange-plus pricing typically saves 15-25% compared to Stripe's flat-rate." } },
    { "@type": "Question", name: "Can I switch from Stripe to Helcim?", acceptedAnswer: { "@type": "Answer", text: "Yes, switching is straightforward with no cancellation fees from either processor." } },
  ],
};

export default function HelcimVsStripePage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <JsonLd data={faqStructuredData} />
      <HelcimVsStripeContent />
    </>
  );
}

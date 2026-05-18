import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import HelcimVsStripeContent from "./HelcimVsStripeContent";

export const metadata: Metadata = {
  title: "Helcim vs Stripe 2026: Complete Comparison Guide",
  description: "Helcim vs Stripe comparison 2026: Compare interchange-plus vs flat-rate pricing, features, support. Save 15-25% with Helcim or get advanced features with Stripe.",
  keywords: ["Helcim vs Stripe", "Stripe vs Helcim", "interchange-plus pricing", "payment processor comparison"],
  alternates: {
    canonical: "https://www.mypayadvisor.com/comparisons/helcim-vs-stripe",
  },
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
      <ComparisonSchema
        title="Helcim vs Stripe 2026: Complete Comparison Guide"
        description="Complete Helcim vs Stripe comparison for 2026. Compare interchange-plus vs flat-rate pricing, features, support, and find which payment processor saves you more money."
        slug="helcim-vs-stripe"
        datePublished="2024-12-01"
        breadcrumbItems={[
          { name: "Home", item: "https://www.mypayadvisor.com" },
          { name: "Comparisons", item: "https://www.mypayadvisor.com/comparisons" },
          { name: "Helcim vs Stripe" },
        ]}
        quotation={{
          text: "This transparent breakdown is what sets it apart from other pricing models, where these costs are often bundled together.",
          creator: {
            "@type": "Organization",
            name: "Helcim Editorial",
            parentOrganization: { "@type": "Organization", name: "Helcim Inc." },
          },
          publisher: {
            "@type": "Organization",
            name: "Helcim Inc.",
            url: "https://www.helcim.com/",
          },
          isBasedOn: "https://learn.helcim.com/docs/what-is-interchange-plus",
          inLanguage: "en-US",
        }}
      />
      <JsonLd data={faqStructuredData} />
      <HelcimVsStripeContent />
    </>
  );
}

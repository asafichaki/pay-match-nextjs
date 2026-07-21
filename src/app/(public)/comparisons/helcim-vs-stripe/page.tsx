import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import HelcimVsStripeContent from "./HelcimVsStripeContent";

export const metadata: Metadata = {
  // absolute: skip the layout "%s | myPayAdvisor" suffix so the money query "helcim vs stripe" stays front-loaded and un-truncated.
  title: { absolute: "Helcim vs Stripe 2026: Helcim Wins Above $25K Monthly" },
  description: "Helcim vs Stripe fees in 2026: Helcim's 2.51% interchange-plus beats Stripe's 2.97% flat rate above $25K monthly, with no monthly fee. Stripe wins on SaaS subscriptions.",
  keywords: ["Helcim vs Stripe", "Stripe vs Helcim", "interchange-plus pricing", "payment processor comparison"],
  alternates: {
    canonical: "https://www.mypayadvisor.com/comparisons/helcim-vs-stripe",
  },
  openGraph: {
    title: "Helcim vs Stripe 2026: Helcim Wins Above $25K Monthly",
    description: "Helcim vs Stripe fees in 2026: Helcim's 2.51% interchange-plus beats Stripe's 2.97% flat rate above $25K monthly, with no monthly fee. Stripe wins on SaaS subscriptions.",
    url: "https://www.mypayadvisor.com/comparisons/helcim-vs-stripe",
    type: "article",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Helcim vs Stripe 2026: Helcim Wins Above $25K Monthly",
    description: "Helcim vs Stripe fees in 2026: Helcim's 2.51% interchange-plus beats Stripe's 2.97% flat rate above $25K monthly, with no monthly fee. Stripe wins on SaaS subscriptions.",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
  other: {
    "article:published_time": "2026-03-20T00:00:00.000Z",
    "article:modified_time": new Date().toISOString(),
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
        datePublished="2026-03-20"
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
      <section aria-labelledby="related-comparisons" className="container mx-auto px-4 pb-16 max-w-3xl">
        <h2 id="related-comparisons" className="text-2xl font-serif font-bold text-foreground mb-4">Related comparisons</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li><a href="/comparisons/square-vs-helcim-2026" className="text-primary hover:underline">Square vs Helcim 2026</a>: free next-day funding versus the lowest effective rate.</li>
          <li><a href="/comparisons/best-no-contract-payment-processors-2026" className="text-primary hover:underline">Best no-contract payment processors 2026</a>: where Helcim lands against Stax, Square, and Payment Depot.</li>
          <li><a href="/comparisons/best-payment-processors-2026" className="text-primary hover:underline">Best payment processors 2026</a>: 15 processors ranked by effective rate.</li>
        </ul>
      </section>
    </>
  );
}

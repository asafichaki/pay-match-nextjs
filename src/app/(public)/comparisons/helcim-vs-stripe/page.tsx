import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import HelcimVsStripeContent from "./HelcimVsStripeContent";
import { withSeoOverride } from "@/lib/seo/overrides";
import { AeoAnswer } from "@/components/seo/AeoAnswer";
import { RelatedLinks } from "@/components/seo/RelatedLinks";

const baseMetadata: Metadata = {
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
    "article:modified_time": "2026-08-25T00:00:00.000Z",
  },
};

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("comparisons", "helcim-vs-stripe", baseMetadata);
}

// Same Q&A text as the visible FAQ in HelcimVsStripeContent.tsx (Google's visible-content requirement).
const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Is Helcim cheaper than Stripe?", acceptedAnswer: { "@type": "Answer", text: "For most businesses processing $10K+/month, yes. Helcim's interchange-plus pricing typically saves 15-25%." } },
    { "@type": "Question", name: "When does Helcim become cheaper than Stripe?", acceptedAnswer: { "@type": "Answer", text: "Helcim is usually cheaper than Stripe once monthly card volume passes $25K and the merchant accepts at least 60 percent in-person or low-risk online cards. On a 1.8 percent average interchange mix, Helcim's interchange plus 0.50 percent plus $0.25 online rate works out to roughly 2.30 percent versus Stripe's 2.90 percent. On $100K monthly volume, that gap is around $600 per month, before any of Helcim's automatic volume discount kicks in. Below $25K, the savings are usually too small to justify the time spent switching integrations." } },
    { "@type": "Question", name: "Does Stripe negotiate below 2.9 percent?", acceptedAnswer: { "@type": "Answer", text: "Stripe offers custom pricing for merchants above roughly $1 million in monthly processing volume, per its public pricing page. The custom rate is interchange-plus and can drop the effective markup by 0.30 to 0.60 percent depending on card mix. For volumes between $250K and $1M, Stripe sometimes offers volume discounts on a case-by-case basis, but the published flat rate is the default. Merchants in that range should price-check Helcim, Stax, or a tier-one acquirer before signing any Stripe custom contract because the comparison points strengthen the negotiation." } },
    { "@type": "Question", name: "Are there any monthly fees with Stripe or Helcim?", acceptedAnswer: { "@type": "Answer", text: "Neither company charges a base monthly fee on its standard plan. Stripe's pricing is purely per transaction at 2.9 percent plus $0.30 online, with no monthly fee, no PCI fee, and no statement fee. Helcim charges no monthly fee, no setup fee, and no PCI compliance fee. Both companies operate month-to-month with no early termination fee. Add-on Stripe products like Radar for fraud, Sigma for reporting, and Atlas for incorporation carry their own pricing, which is published separately on the Stripe pricing page." } },
    { "@type": "Question", name: "Which is better for B2B card-not-present?", acceptedAnswer: { "@type": "Answer", text: "Helcim is the stronger choice for B2B card-not-present merchants in most cases. Interchange-plus pricing combined with level 2 and level 3 data support qualifies commercial, purchasing, and government cards for lower interchange categories, which can drop the effective rate by 0.50 to 1.00 percent versus a flat rate. Stripe supports level 2 data on its API, but level 3 support is limited unless the merchant builds it into the integration. For B2B operators with average tickets above $500, the rate difference compounds quickly into five-figure annual savings." } },
    { "@type": "Question", name: "Can I switch from Stripe to Helcim mid-contract?", acceptedAnswer: { "@type": "Answer", text: "Yes. Stripe runs a month-to-month standard agreement with no early termination fee, per its public terms. A merchant can stop processing through Stripe at any time and switch to Helcim without paying a penalty. The practical work involves repointing the payment integration, migrating saved card tokens (Stripe will migrate tokens to a compliant processor on request), and updating recurring billing schedules. For ecommerce merchants, plan for one to two engineering weeks if recurring billing or saved cards are in scope. Run both processors in parallel for a week to validate." } },
    { "@type": "Question", name: "Does Helcim work in the US?", acceptedAnswer: { "@type": "Answer", text: "Yes. Despite being Canadian-based, Helcim fully supports US businesses with USD processing." } },
    { "@type": "Question", name: "Which has better support?", acceptedAnswer: { "@type": "Answer", text: "Helcim wins with 24/7 phone, email, and chat. Stripe offers email and chat only." } },
  ],
};

const speakableSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://www.mypayadvisor.com/comparisons/helcim-vs-stripe#webpage",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: [".aeo-answer", "h1"],
  },
};

export default function HelcimVsStripePage() {
  return (
    <>
      <ComparisonSchema
        title="Helcim vs Stripe 2026: Complete Comparison Guide"
        description="Complete Helcim vs Stripe comparison for 2026. Compare interchange-plus vs flat-rate pricing, features, support, and find which payment processor saves you more money."
        slug="helcim-vs-stripe"
        datePublished="2026-03-20"
        dateModified="2026-08-25"
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
      <JsonLd data={speakableSchema} />
      <HelcimVsStripeContent
        aeoAnswer={<AeoAnswer kind="comparisons" slug="helcim-vs-stripe" />}
        relatedLinks={<RelatedLinks kind="comparisons" slug="helcim-vs-stripe" />}
      />
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

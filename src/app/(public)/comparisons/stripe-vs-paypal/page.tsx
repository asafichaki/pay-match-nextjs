import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import StripeVsPayPalContent from "./StripeVsPayPalContent";

export const metadata: Metadata = {
  title: "Stripe vs PayPal 2026: 2.9% Stripe vs 3.49% PayPal Rate",
  description: "Stripe 2.9% + $0.30, PayPal 3.49% + $0.49 commercial rate. Stripe wins on subscriptions and APIs. PayPal wins on 400M+ buyer trust. May 2026 rates.",
  alternates: {
    canonical: "https://www.mypayadvisor.com/comparisons/stripe-vs-paypal",
  },
  openGraph: {
    title: "Stripe vs PayPal 2026: 2.9% Stripe vs 3.49% PayPal Rate",
    description: "Stripe 2.9% + $0.30, PayPal 3.49% + $0.49 commercial rate. Stripe wins on subscriptions and APIs. PayPal wins on 400M+ buyer trust. May 2026 rates.",
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

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Is Stripe cheaper than PayPal?", acceptedAnswer: { "@type": "Answer", text: "For most card transactions, yes. Stripe charges 2.9% + $0.30 per transaction versus PayPal's 3.49% + $0.49 commercial rate, so Stripe is typically the lower-cost option on standard online payments." } },
    { "@type": "Question", name: "What is the difference between Stripe and PayPal fees?", acceptedAnswer: { "@type": "Answer", text: "Stripe runs 2.9% + $0.30 on online card payments with strong subscription and API tooling. PayPal runs 3.49% + $0.49 on commercial transactions but adds access to 400M+ existing buyer accounts that can lift checkout conversion." } },
    { "@type": "Question", name: "Should I use Stripe or PayPal for my business?", acceptedAnswer: { "@type": "Answer", text: "Choose Stripe if you sell subscriptions, need developer APIs, or want the lowest per-transaction rate. Choose PayPal if buyer trust and one-click checkout for existing PayPal users matter more than the rate difference." } },
  ],
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
      <JsonLd data={faqStructuredData} />
      <StripeVsPayPalContent />
    </>
  );
}

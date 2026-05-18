import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import StripeVsPayPalContent from "./StripeVsPayPalContent";

export const metadata: Metadata = {
  title: "Stripe vs PayPal 2026: Fees, FX Cost & Conversion Compared",
  description: "Stripe 2.9% + $0.30 vs PayPal 2.99% + $0.49 plus FX. PayPal lifts checkout conversion 5 to 10 percent. When each one wins in 2026.",
  alternates: {
    canonical: "https://www.mypayadvisor.com/comparisons/stripe-vs-paypal",
  },
  openGraph: {
    title: "Stripe vs PayPal 2026: Fees, FX Cost & Conversion Compared",
    description: "Stripe 2.9% + $0.30 vs PayPal 2.99% + $0.49 plus FX. PayPal lifts checkout conversion 5 to 10 percent. When each one wins in 2026.",
    url: "https://www.mypayadvisor.com/comparisons/stripe-vs-paypal",
    type: "article",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
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
      />
      <JsonLd data={speakableSchema} />
      <StripeVsPayPalContent />
    </>
  );
}

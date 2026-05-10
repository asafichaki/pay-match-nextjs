import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import StripeVsPayPalContent from "./StripeVsPayPalContent";

export const metadata: Metadata = {
  title: "Stripe vs PayPal 2026: Real Fees, Conversion Lift, FX Cost",
  description: "Stripe 2.9% + $0.30 vs PayPal 2.99% + $0.49 plus FX. PayPal lifts checkout conversion 5 to 10 percent. When each one wins in 2026.",
  alternates: {
    canonical: "https://www.mypayadvisor.com/comparisons/stripe-vs-paypal",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Stripe vs PayPal: Which Payment Processor Is Best? (2026)",
  description: "Comprehensive Stripe vs PayPal comparison for 2026. Compare fees, features, APIs, subscriptions.",
  image: "https://www.mypayadvisor.com/og-logo.png",
  author: { "@type": "Organization", name: "myPayAdvisor" },
  datePublished: "2024-12-01",
};

export default function StripeVsPayPalPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <StripeVsPayPalContent />
    </>
  );
}

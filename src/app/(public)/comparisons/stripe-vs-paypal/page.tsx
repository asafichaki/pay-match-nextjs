import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { BARAK_PERSON_SCHEMA } from "@/data/personas/barak";
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

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Stripe vs PayPal 2026: Fees, FX Cost & Conversion Compared",
  description: "Stripe vs PayPal comparison for 2026. Fees, FX cost, conversion lift, APIs, and subscriptions, side by side.",
  image: "https://www.mypayadvisor.com/og-logo.png",
  author: { "@type": "Organization", name: "myPayAdvisor", url: "https://www.mypayadvisor.com" },
  reviewedBy: BARAK_PERSON_SCHEMA,
  publisher: {
    "@type": "Organization",
    name: "myPayAdvisor",
    logo: { "@type": "ImageObject", url: "https://www.mypayadvisor.com/og-logo.png" },
  },
  datePublished: "2025-11-15",
  dateModified: "2026-05-15",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://www.mypayadvisor.com/comparisons/stripe-vs-paypal",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.mypayadvisor.com" },
    { "@type": "ListItem", position: 2, name: "Comparisons", item: "https://www.mypayadvisor.com/comparisons" },
    { "@type": "ListItem", position: 3, name: "Stripe vs PayPal", item: "https://www.mypayadvisor.com/comparisons/stripe-vs-paypal" },
  ],
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
      <JsonLd data={structuredData} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={speakableSchema} />
      <StripeVsPayPalContent />
    </>
  );
}

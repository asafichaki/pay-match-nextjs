import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import BestPaymentProcessors2026Content from "./BestPaymentProcessors2026Content";

export const metadata: Metadata = {
  title: "Best Payment Processors 2026: Lowest Effective Rate by Volume",
  description: "Ranked by effective rate at $10K, $50K, $250K and $1M monthly volume. Stripe, Helcim, Stax, Payment Depot and 10 more. Updated for 2026.",
  keywords: ["best payment processors 2026", "payment processing companies", "merchant services", "credit card processing", "Leaders Merchant Services", "Worldpay", "Clover", "Payment Depot", "Stax", "Stripe"],
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://www.mypayadvisor.com/comparisons/best-payment-processors-2026",
  },
  openGraph: {
    type: "article",
    url: "https://www.mypayadvisor.com/comparisons/best-payment-processors-2026",
    title: "Best Payment Processors 2026: Lowest Effective Rate by Volume",
    description: "Ranked by effective rate at $10K, $50K, $250K and $1M monthly volume. Stripe, Helcim, Stax, Payment Depot and 10 more.",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Payment Processors 2026: Lowest Effective Rate",
    description: "Ranked by effective rate by volume tier. Stripe, Helcim, Stax and 10 more.",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Best Payment Processing Companies 2026: Complete Guide & Comparison",
  description: "Expert analysis of the best payment processors for 2026. Compare Leaders Merchant Services, Worldpay, Clover, Payment Depot, Stax, Stripe, and more. Find the lowest fees and best features for your business.",
  image: "https://www.mypayadvisor.com/og-logo.png",
  author: { "@type": "Organization", name: "MyPayAdvisor" },
  publisher: { "@type": "Organization", name: "MyPayAdvisor", logo: { "@type": "ImageObject", url: "https://www.mypayadvisor.com/og-logo.png" } },
  datePublished: "2026-01-01",
  dateModified: "2026-01-08",
  mainEntityOfPage: { "@type": "WebPage", "@id": "https://www.mypayadvisor.com/comparisons/best-payment-processors-2026" },
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What is interchange and why does it matter?", acceptedAnswer: { "@type": "Answer", text: "Interchange is the fee charged by card-issuing banks and card networks for processing transactions. These fees typically range from 1.3% to 3.3% plus a fixed fee. Interchange matters because it represents the largest component of your payment processing costs." } },
    { "@type": "Question", name: "How can I reduce my payment processing fees?", acceptedAnswer: { "@type": "Answer", text: "You can reduce processing costs by switching to interchange-plus pricing, negotiating better rates based on volume, encouraging debit card usage, implementing fraud protection, and regularly reviewing your processing agreement." } },
    { "@type": "Question", name: "Can I negotiate payment processing rates?", acceptedAnswer: { "@type": "Answer", text: "Yes, especially if you process substantial volume. Businesses processing over $100,000 monthly should always negotiate rather than accepting standard published rates." } },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.mypayadvisor.com" },
    { "@type": "ListItem", position: 2, name: "Comparisons", item: "https://www.mypayadvisor.com/comparisons" },
    { "@type": "ListItem", position: 3, name: "Best Payment Processors 2026", item: "https://www.mypayadvisor.com/comparisons/best-payment-processors-2026" },
  ],
};

export default function BestPaymentProcessors2026Page() {
  return (
    <>
      <JsonLd data={structuredData} />
      <JsonLd data={faqStructuredData} />
      <JsonLd data={breadcrumbSchema} />
      <BestPaymentProcessors2026Content />
    </>
  );
}

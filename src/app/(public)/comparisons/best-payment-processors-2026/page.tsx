import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import BestPaymentProcessors2026Content from "./BestPaymentProcessors2026Content";

export const metadata: Metadata = {
  title: "15 Best Payment Processors 2026: Ranked by Effective Rate",
  description: "15 best payment processors of 2026, ranked by effective rate at $10K, $50K, $250K and $1M monthly volume. Stripe, Helcim, Stax, Payment Depot and more.",
  keywords: ["best payment processors 2026", "payment processing companies", "merchant services", "credit card processing", "Leaders Merchant Services", "Worldpay", "Clover", "Payment Depot", "Stax", "Stripe"],
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://www.mypayadvisor.com/comparisons/best-payment-processors-2026",
  },
  openGraph: {
    type: "article",
    url: "https://www.mypayadvisor.com/comparisons/best-payment-processors-2026",
    title: "15 Best Payment Processors 2026: Ranked by Effective Rate",
    description: "15 best payment processors of 2026, ranked by effective rate at $10K, $50K, $250K and $1M monthly volume.",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "15 Best Payment Processors 2026: Ranked by Effective Rate",
    description: "Ranked by effective rate by volume tier. Stripe, Helcim, Stax and 10 more.",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
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

export default function BestPaymentProcessors2026Page() {
  return (
    <>
      <ComparisonSchema
        title="15 Best Payment Processors 2026: Ranked by Effective Rate"
        description="Expert ranking of the 15 best payment processors for 2026 by effective rate across volume tiers. Stripe, Helcim, Stax, Payment Depot, Leaders Merchant Services and more."
        slug="best-payment-processors-2026"
        datePublished="2026-01-01"
        breadcrumbItems={[
          { name: "Home", item: "https://www.mypayadvisor.com" },
          { name: "Comparisons", item: "https://www.mypayadvisor.com/comparisons" },
          { name: "Best Payment Processors 2026" },
        ]}
      />
      <JsonLd data={faqStructuredData} />
      <BestPaymentProcessors2026Content />
    </>
  );
}

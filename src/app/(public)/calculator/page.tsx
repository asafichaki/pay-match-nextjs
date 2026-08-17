import { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { BARAK_PERSON_SCHEMA } from "@/data/personas/barak";
import FeeCalculatorClient from "./FeeCalculatorClient";

// Title retargeted 2026-08-17. The head term is "credit card processing fee calculator"
// (1,000/mo, KD 1, rankers at DR 151-293), and the old title targeted "payment processing fee
// calculator" instead, so the exact term appeared nowhere. The old title was also 60 chars, and
// layout.tsx appends " | myPayAdvisor" (15 chars), so it truncated in SERPs at ~75. Budget is 45.
export const metadata: Metadata = {
  title: "Credit Card Processing Fee Calculator 2026",
  description: "Free calculator: enter monthly volume, average ticket and channel mix to see your real effective rate, and what Stripe, Square, Helcim and Payment Depot would each cost you.",
  keywords: "credit card processing fee calculator, payment processing fee calculator, effective rate calculator, merchant fee calculator, credit card processing cost calculator, processing fee estimator",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.mypayadvisor.com/calculator" },
  openGraph: {
    type: "website",
    url: "https://www.mypayadvisor.com/calculator",
    title: "Credit Card Processing Fee Calculator 2026",
    description: "Estimate real 2026 processing costs by volume, ticket size, and channel mix. Compare against Stripe, Square, Helcim, Payment Depot.",
    images: [{ url: "https://www.mypayadvisor.com/og-logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Credit Card Processing Fee Calculator 2026",
    description: "Estimate real 2026 processing costs by volume, ticket size, channel mix.",
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "myPayAdvisor Payment Processing Fee Calculator",
  url: "https://www.mypayadvisor.com/calculator",
  description:
    "Free web-based calculator that estimates real 2026 payment processing fees and effective rate from monthly volume, average ticket, and channel mix.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  creator: {
    "@type": "Organization",
    name: "myPayAdvisor",
    url: "https://www.mypayadvisor.com",
  },
  inLanguage: "en-US",
  isAccessibleForFree: true,
  audience: { "@type": "Audience", audienceType: "U.S. merchants and small business owners" },
  about: {
    "@type": "Thing",
    name: "Payment processing fees and effective rate computation for U.S. merchants in 2026",
  },
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to calculate your effective payment processing rate",
  description:
    "Step-by-step method for computing your real effective payment processing rate from your merchant statement.",
  totalTime: "PT3M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Pull your latest monthly statement",
      text: "Find the total fees paid and total processing volume on your latest merchant statement. Both numbers usually appear on the statement summary.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Divide fees by volume",
      text: "Effective rate = (Total Fees Paid / Total Processing Volume) × 100. For example, $1,250 in fees on $50,000 volume = 2.50% effective rate.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Compare against benchmark",
      text: "Use the calculator to compare your effective rate against interchange-plus benchmarks (Helcim, Payment Depot, Stax) and flat-rate competitors (Stripe, Square, PayPal). A gap of more than 0.30% above benchmark usually means it is worth negotiating or switching.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Identify hidden fees",
      text: "Subtract obvious card fees from total fees. The remainder is hidden cost (PCI compliance, monthly minimum, batch fee, statement fee, gateway fee). Anything above 0.10% of volume is unusually high.",
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is an effective payment processing rate?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Effective rate is the all-in cost of payment processing expressed as a percentage of total processing volume. It captures interchange, assessments, processor markup, and every other fee on your statement. For U.S. merchants in 2026, effective rates typically range from 1.75 percent for high-volume interchange-plus accounts to 3.50 percent for low-volume flat-rate or tiered accounts.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate is this calculator?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The calculator uses published 2026 rates from Stripe, Square, PayPal, Helcim, Payment Depot, Stax, and other major processors, applied to a standard card-mix assumption (60 percent credit, 40 percent debit, 30 percent rewards cards). Real merchant statements typically come within 5 to 15 percent of the calculator output. For an exact number, use the calculator output plus an audit of your actual statement.",
      },
    },
    {
      "@type": "Question",
      name: "Is the calculator free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The calculator is free and requires no signup. We provide it because the single biggest factor in choosing a processor is knowing your real effective rate, and most processors will not give you that number until you sign.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.mypayadvisor.com" },
    { "@type": "ListItem", position: 2, name: "Calculator", item: "https://www.mypayadvisor.com/calculator" },
  ],
};

export default function CalculatorPage() {
  return (
    <>
      <JsonLd data={webAppSchema} />
      <JsonLd data={howToSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <FeeCalculatorClient />
    </>
  );
}

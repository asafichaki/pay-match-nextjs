import { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import FeeCalculatorClient from "./FeeCalculatorClient";
import { RelatedGuides } from "@/components/seo/RelatedGuides";

// Title retargeted 2026-08-17. The head term is "credit card processing fee calculator"
// (1,000/mo, KD 1, rankers at DR 151-293), and the old title targeted "payment processing fee
// calculator" instead, so the exact term appeared nowhere. The old title was also 60 chars, and
// layout.tsx appends " | myPayAdvisor" (15 chars), so it truncated in SERPs at ~75. Budget is 45.
export const metadata: Metadata = {
  title: "Credit Card Processing Fee Calculator 2026",
  description: "Free calculator: enter monthly volume, average ticket and channel mix to estimate your effective rate across interchange-plus, flat-rate, and premium pricing models.",
  keywords: "credit card processing fee calculator, payment processing fee calculator, effective rate calculator, merchant fee calculator, credit card processing cost calculator, processing fee estimator",
  robots: { index: true, follow: true },
  alternates: { canonical: "https://www.mypayadvisor.com/calculator" },
  openGraph: {
    type: "website",
    url: "https://www.mypayadvisor.com/calculator",
    title: "Credit Card Processing Fee Calculator 2026",
    description: "Estimate 2026 processing costs by volume, ticket size, and channel mix across interchange-plus, flat-rate, and premium pricing models.",
    images: [{ url: "https://www.mypayadvisor.com/og-logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Credit Card Processing Fee Calculator 2026",
    description: "Estimate 2026 processing costs by volume, ticket size, channel mix.",
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "myPayAdvisor Payment Processing Fee Calculator",
  url: "https://www.mypayadvisor.com/calculator",
  description:
    "Free web-based calculator that produces a directional estimate of 2026 payment processing fees and effective-rate ranges from monthly volume, average ticket, and channel mix.",
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

// FAQ content is rendered visibly below the calculator AND emitted as FAQPage
// JSON-LD from the same source of truth (Google's visible-content requirement).
const CALCULATOR_FAQS = [
  {
    question: "What is an effective payment processing rate?",
    answer:
      "Effective rate is the all-in cost of payment processing expressed as a percentage of total processing volume. It captures interchange, assessments, processor markup, and every other fee on your statement. For U.S. merchants in 2026, effective rates typically range from 1.75 percent for high-volume interchange-plus accounts to 3.50 percent for low-volume flat-rate or tiered accounts.",
  },
  {
    question: "How accurate is this calculator?",
    answer:
      "The calculator models three common pricing scenarios: a low estimate in the style of interchange-plus pricing, a mid estimate in the style of flat-rate pricing, and a high estimate reflecting premium pricing. Each uses representative 2026 rate assumptions for card-present and card-not-present volume. It is a directional estimate of pricing-model impact, not a quote from any named processor, and your actual costs depend on your card mix, business type, and negotiated terms. For an exact number, audit your actual merchant statement.",
  },
  {
    question: "Is the calculator free?",
    answer:
      "Yes. The calculator is free and requires no signup. We provide it because the single biggest factor in choosing a processor is knowing your effective rate, and most processors will not give you that number until you sign.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: CALCULATOR_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
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
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema} />
      <FeeCalculatorClient />
      {/* Visible FAQ: same Q&A text as the FAQPage JSON-LD above. */}
      <section className="container mx-auto max-w-3xl px-4 pb-16">
        <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {CALCULATOR_FAQS.map((faq) => (
            <div key={faq.question} className="p-6 bg-muted/30 rounded-lg">
              <h3 className="text-lg font-semibold text-foreground mb-3">{faq.question}</h3>
              <p className="text-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
      <RelatedGuides slug="calculator" heading="Related guides to read with your estimate" />
    </>
  );
}

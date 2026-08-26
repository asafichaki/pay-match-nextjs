import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import { EFFECTIVE_RATES_2026 } from "@/lib/data/effective-rates-2026";
import BestPaymentProcessors2026Content from "./BestPaymentProcessors2026Content";
import { withSeoOverride } from "@/lib/seo/overrides";
import { AeoAnswer } from "@/components/seo/AeoAnswer";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { CompareMore } from "@/components/comparisons/CompareMore";

function parseRate(rate: string): number {
  return parseFloat(rate.replace("%", ""));
}

function buildItemListSchema() {
  // Pick best (lowest) effective rate at $10K per processor, then rank ascending.
  const byProcessor = new Map<string, number>();
  for (const row of EFFECTIVE_RATES_2026) {
    const v = parseRate(row.rates[0]);
    const prev = byProcessor.get(row.processor);
    if (prev === undefined || v < prev) byProcessor.set(row.processor, v);
  }
  const ranked = Array.from(byProcessor.entries()).sort((a, b) => a[1] - b[1]);
  const baseUrl = "https://www.mypayadvisor.com/comparisons/best-payment-processors-2026";

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "15 Best Payment Processors 2026, Ranked by Effective Rate",
    description:
      "Payment processors ranked by lowest effective rate at $10K monthly volume.",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: ranked.length,
    itemListElement: ranked.map(([processor, rate], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${processor}: ${rate.toFixed(2)}% effective rate`,
      url: `${baseUrl}#${processor.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    })),
  };
}

const baseMetadata: Metadata = {
  title: { absolute: "15 Best Payment Processors 2026, Ranked by Effective Rate" },
  description: "May 2026: Helcim 2.51%, Adyen 2.32%, Square 2.65%, Stripe 2.97%, PayPal 3.07%. 15 processors ranked at $10K, $50K, $250K, $1M monthly. Real rates.",
  keywords: ["best payment processors 2026", "payment processing companies", "merchant services", "credit card processing", "Leaders Merchant Services", "Worldpay", "Clover", "Payment Depot", "Stax", "Stripe"],
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://www.mypayadvisor.com/comparisons/best-payment-processors-2026",
  },
  openGraph: {
    type: "article",
    url: "https://www.mypayadvisor.com/comparisons/best-payment-processors-2026",
    title: "15 Best Payment Processors 2026: Ranked by Effective Rate",
    description: "May 2026: Helcim 2.51%, Adyen 2.32%, Square 2.65%, Stripe 2.97%, PayPal 3.07%. 15 processors ranked at $10K, $50K, $250K, $1M monthly. Real rates.",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "15 Best Payment Processors 2026: Ranked by Effective Rate",
    description: "May 2026: Helcim 2.51%, Adyen 2.32%, Square 2.65%, Stripe 2.97%, PayPal 3.07%. 15 processors ranked at $10K, $50K, $250K, $1M monthly. Real rates.",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
  other: {
    "article:published_time": "2026-01-01T00:00:00.000Z",
    "article:modified_time": "2026-08-25T00:00:00.000Z",
  },
};

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("comparisons", "best-payment-processors-2026", baseMetadata);
}

const speakableSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://www.mypayadvisor.com/comparisons/best-payment-processors-2026#webpage",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", ".aeo-answer", "[data-speakable]"],
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
        dateModified="2026-08-25"
        breadcrumbItems={[
          { name: "Home", item: "https://www.mypayadvisor.com" },
          { name: "Comparisons", item: "https://www.mypayadvisor.com/comparisons" },
          { name: "Best Payment Processors 2026" },
        ]}
        quotation={{
          text: "an interchange fee that exceeds $0.21 plus 0.05 percent multiplied by the value of the transaction, plus a $0.01 fraud-prevention adjustment",
          creator: {
            "@type": "Organization",
            name: "Board of Governors of the Federal Reserve System",
            url: "https://www.federalreserve.gov/",
          },
          publisher: {
            "@type": "GovernmentOrganization",
            name: "Federal Reserve System",
            url: "https://www.federalreserve.gov/",
          },
          isBasedOn: "https://www.federalreserve.gov/paymentsystems/regii-average-interchange-fee.htm",
          citation: "Regulation II, Debit Card Interchange Fees and Routing (12 CFR Part 235)",
          inLanguage: "en-US",
        }}
      />
      <JsonLd data={faqStructuredData} />
      <JsonLd data={speakableSchema} />
      <JsonLd data={buildItemListSchema()} />
      <BestPaymentProcessors2026Content
        aeoAnswer={<AeoAnswer kind="comparisons" slug="best-payment-processors-2026" />}
        relatedLinks={<RelatedLinks kind="comparisons" slug="best-payment-processors-2026" />}
      />
      <CompareMore slug="best-payment-processors-2026" />
    </>
  );
}

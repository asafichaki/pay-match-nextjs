import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import { formatRate, rankAt } from "@/lib/data/ranking-2026";
import { BEST_OF_FAQ } from "./faq";
import BestPaymentProcessors2026Content from "./BestPaymentProcessors2026Content";
import { withSeoOverride } from "@/lib/seo/overrides";
import { AeoAnswer } from "@/components/seo/AeoAnswer";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { CompareMore } from "@/components/comparisons/CompareMore";

function buildItemListSchema() {
  const ranked = rankAt(0);
  const baseUrl = "https://www.mypayadvisor.com/comparisons/best-payment-processors-2026";
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best Payment Processors 2026, Ranked by Effective Rate at $10K a Month",
    description: "Payment processors ranked by lowest effective rate at $10K monthly volume on a standard U.S. card mix. Same order as the visible ranking.",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: ranked.length,
    itemListElement: ranked.map((p) => ({
      "@type": "ListItem",
      position: p.rank,
      name: `${p.name}: ${formatRate(p.score)} effective rate`,
      url: `${baseUrl}#${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    })),
  };
}

const TOP = rankAt(0);
// A string literal on purpose: scripts/seo/build-seo-manifest.mjs reads the
// title from source. The count is asserted against the ranking below.
const TITLE = "Best Payment Processors 2026: 10 Ranked by Real Cost";
if (!TITLE.includes(`: ${TOP.length} Ranked`)) {
  throw new Error(`best-of title says a different count than the ranking (${TOP.length})`);
}
const DESCRIPTION = `${TOP[0].name} ${formatRate(TOP[0].score)}, ${TOP[1].name} ${formatRate(TOP[1].score)}, ${TOP[2].name} ${formatRate(TOP[2].score)} at $10K a month. Switch to $50K, $250K or $1M and see who wins. Fees included.`;

const baseMetadata: Metadata = {
  title: { absolute: "Best Payment Processors 2026: 10 Ranked by Real Cost" },
  description: DESCRIPTION,
  keywords: ["best payment processors 2026", "payment processing companies", "merchant services", "credit card processing", "Worldpay", "Clover", "Payment Depot", "Stax", "Stripe"],
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://www.mypayadvisor.com/comparisons/best-payment-processors-2026",
  },
  openGraph: {
    type: "article",
    url: "https://www.mypayadvisor.com/comparisons/best-payment-processors-2026",
    title: TITLE,
    description: DESCRIPTION,
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
  other: {
    "article:published_time": "2026-01-01T00:00:00.000Z",
    "article:modified_time": "2026-10-29T00:00:00.000Z",
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
  mainEntity: BEST_OF_FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function BestPaymentProcessors2026Page() {
  return (
    <>
      <ComparisonSchema
        title={TITLE}
        description={DESCRIPTION}
        slug="best-payment-processors-2026"
        datePublished="2026-01-01"
        dateModified="2026-10-29"
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

import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import PayPalVsSquareContent from "./PayPalVsSquareContent";
import { withSeoOverride } from "@/lib/seo/overrides";
import { AeoAnswer } from "@/components/seo/AeoAnswer";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { CompareMore } from "@/components/comparisons/CompareMore";
import { FAQ, META_DESCRIPTION as COMPUTED_DESCRIPTION } from "./data";

// Literal, so the SEO manifest and llms.txt can read it statically. It must equal the
// string data.ts computes from ranking-2026.ts; the build fails if a price moves.
const TITLE = "PayPal vs Square 2026: Fees Compared In Person and Online";
const META_DESCRIPTION = "PayPal POS 2.29% + 9¢ vs Square 2.6% + 15¢ in person; Square 2.9% + 30¢ vs PayPal Checkout 3.49% + 49¢ online. Monthly cost at $10K to $250K.";
if (META_DESCRIPTION !== COMPUTED_DESCRIPTION) {
  throw new Error(`paypal-vs-square: meta description literal is out of date with data.ts / ranking-2026.ts. Expected: ${COMPUTED_DESCRIPTION}`);
}

const baseMetadata: Metadata = {
  title: { absolute: TITLE },
  description: META_DESCRIPTION,
  keywords: ["Square vs PayPal", "PayPal vs Square", "PayPal vs Square fees", "payment processor comparison", "POS comparison"],
  alternates: {
    canonical: "https://www.mypayadvisor.com/comparisons/paypal-vs-square",
  },
  openGraph: {
    title: TITLE,
    description: META_DESCRIPTION,
    url: "https://www.mypayadvisor.com/comparisons/paypal-vs-square",
    type: "article",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: META_DESCRIPTION,
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
  other: {
    "article:published_time": "2026-03-20T00:00:00.000Z",
    "article:modified_time": "2026-11-02T00:00:00.000Z",
  },
};

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("comparisons", "paypal-vs-square", baseMetadata);
}

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  // Same list as the visible FAQ (data.ts), so the two cannot disagree.
  mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function PayPalVsSquarePage() {
  return (
    <>
      <ComparisonSchema
        title={TITLE}
        description={META_DESCRIPTION}
        slug="paypal-vs-square"
        datePublished="2026-03-20"
        dateModified="2026-11-02"
        breadcrumbItems={[
          { name: "Home", item: "https://www.mypayadvisor.com" },
          { name: "Comparisons", item: "https://www.mypayadvisor.com/comparisons" },
          { name: "Square vs PayPal" },
        ]}
        quotation={{
          text: "If you use PayPal POS to accept card payments in-person, you'll get access to some of the lowest flat rates out there.",
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
          isBasedOn: "https://www.nerdwallet.com/business/software/learn/stripe-vs-paypal-vs-square",
          inLanguage: "en-US",
        }}
      />
      <JsonLd data={faqStructuredData} />
      <PayPalVsSquareContent
        aeoAnswer={<AeoAnswer kind="comparisons" slug="paypal-vs-square" />}
        relatedLinks={<RelatedLinks kind="comparisons" slug="paypal-vs-square" />}
      />
      <CompareMore slug="paypal-vs-square" />
    </>
  );
}

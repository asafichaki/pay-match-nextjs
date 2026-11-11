import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import PaymentCloudVsDurangoContent from "./PaymentCloudVsDurangoContent";
import { withSeoOverride } from "@/lib/seo/overrides";
import { AeoAnswer } from "@/components/seo/AeoAnswer";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { CompareMore } from "@/components/comparisons/CompareMore";

const URL = "https://www.mypayadvisor.com/comparisons/paymentcloud-vs-durango";

const baseMetadata: Metadata = {
  title: { absolute: "PaymentCloud vs Durango 2026: High-Risk Terms Compared" },
  description:
    "PaymentCloud vs Durango Merchant Services for high-risk merchants. Published price ranges, reserves, verticals, approval times, and international accounts compared.",
  alternates: {
    canonical: URL,
  },
  openGraph: {
    title: "PaymentCloud vs Durango 2026: High-Risk Terms Compared",
    description:
      "PaymentCloud vs Durango Merchant Services for high-risk merchants. Published price ranges, reserves, verticals, approval times, and international accounts compared.",
    url: URL,
    type: "article",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
  other: {
    "article:published_time": "2026-05-30T00:00:00.000Z",
    "article:modified_time": "2026-11-11T00:00:00.000Z",
  },
};

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("comparisons", "paymentcloud-vs-durango", baseMetadata);
}

const speakableSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${URL}#webpage`,
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: [".aeo-answer", "h1"],
  },
};

const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "PaymentCloud vs Durango Merchant Services (2026)",
  itemListOrder: "https://schema.org/ItemListUnordered",
  numberOfItems: 2,
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      item: {
        "@type": "SoftwareApplication",
        name: "PaymentCloud",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        url: "https://paymentcloudinc.com",
        offers: {
          "@type": "Offer",
          category: "High-risk merchant account",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": "PriceSpecification",
            description:
              "Quote-only; PaymentCloud publishes no rate card",
          },
        },
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      item: {
        "@type": "SoftwareApplication",
        name: "Durango Merchant Services",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        url: "https://www.durangomerchantservices.com",
        offers: {
          "@type": "Offer",
          category: "High-risk merchant account",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": "PriceSpecification",
            description:
              "Published typical ranges: 1.95% to 4.95% plus $0.15 to $0.25 per authorization; final pricing set in a written offer",
          },
        },
      },
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is PaymentCloud or Durango cheaper for high-risk?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PaymentCloud publishes no rates, so every PaymentCloud price is a quote. Durango publishes typical ranges for its high-risk accounts: 1.95% to 4.95% plus $0.15 to $0.25 per authorization, chargeback fees of $15 to $25, and a $5,000 monthly processing minimum for U.S. accounts ($50,000 for international accounts). Durango says these are ranges, not quotes, and that your exact pricing goes into a written offer before you sign. Because PaymentCloud gives no numbers in advance, the only fair comparison is written quotes from both, side by side.",
      },
    },
    {
      "@type": "Question",
      name: "Which one approves CBD, firearms, nutra, or adult?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PaymentCloud lists CBD, guns and firearms, adult, vape and e-cig, and nutraceuticals among the industries it supports. Durango also approves supplements and nutraceuticals, vape and tobacco, CBD (U.S.-only, with a Certificate of Analysis under 12 months old), and firearms dealers, but it lists adult content, kratom, and outbound tech support among the categories it cannot take. For adult content, PaymentCloud is the one of the two that will consider you. For a supplement, vape, or CBD store, get quotes from both.",
      },
    },
    {
      "@type": "Question",
      name: "Do PaymentCloud and Durango both require a rolling reserve?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Either can, because the reserve is set in underwriting by the bank behind the account. PaymentCloud says reserve requirements vary by business type and are discussed before signing, and publishes no percentage. Durango publishes a typical rolling reserve of 5% to 10% held 90 to 180 days, higher after a shutdown or termination, and says new businesses are often approved with a reserve of about 10% for six months. Reserves are often negotiable after several clean months: ask in writing with your chargeback ratio in hand.",
      },
    },
    {
      "@type": "Question",
      name: "Can I switch from Stripe to PaymentCloud or Durango after a freeze?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Both work with merchants that Stripe, PayPal, or Square have declined, frozen, or terminated; Durango says most of the merchants it gets approved have been told no before. Move quickly: get the freeze reason in writing, gather your processing history, and apply to a specialist whose banks already underwrite your category. A prior freeze does not block approval by itself; underwriting weighs it alongside your chargeback ratio and documentation. Durango will not open an account while you are on the MATCH list or if your chargeback ratio is 5% or higher over three months.",
      },
    },
  ],
};

export default function PaymentCloudVsDurangoPage() {
  return (
    <>
      <ComparisonSchema
        title="PaymentCloud vs Durango 2026: High-Risk Terms Compared"
        description="PaymentCloud vs Durango Merchant Services for high-risk merchants. Published price ranges, reserves, verticals, approval times, and international accounts compared."
        slug="paymentcloud-vs-durango"
        datePublished="2026-05-30"
        dateModified="2026-11-11"
        breadcrumbItems={[
          { name: "Home", item: "https://www.mypayadvisor.com" },
          { name: "Comparisons", item: "https://www.mypayadvisor.com/comparisons" },
          { name: "PaymentCloud vs Durango" },
        ]}
        quotation={{
          text: "In high-risk, the highest published approval rate is not the metric that matters. What matters is how many acquiring banks sit behind the processor, because a single-bank setup is one underwriting decision away from another freeze. I would rather place a merchant with a provider that routes across several banks at a slightly higher rate than win on price and watch the account get shut off in ninety days. Stability is the product. The rate is secondary.",
          creator: {
            "@type": "Person",
            name: "Barak Bachar",
            jobTitle: "Global Payments Manager",
            worksFor: { "@type": "Organization", name: "myPayAdvisor" },
            url: "https://www.mypayadvisor.com/about/barak",
          },
          publisher: {
            "@type": "Organization",
            name: "myPayAdvisor",
            url: "https://www.mypayadvisor.com",
          },
          isBasedOn: "https://www.mypayadvisor.com/about/barak",
          inLanguage: "en-US",
        }}
      />
      <JsonLd data={speakableSchema} />
      <JsonLd data={itemListSchema} />
      <JsonLd data={faqSchema} />
      <PaymentCloudVsDurangoContent
        aeoAnswer={<AeoAnswer kind="comparisons" slug="paymentcloud-vs-durango" />}
        relatedLinks={<RelatedLinks kind="comparisons" slug="paymentcloud-vs-durango" />}
      />
      <CompareMore slug="paymentcloud-vs-durango" />
    </>
  );
}

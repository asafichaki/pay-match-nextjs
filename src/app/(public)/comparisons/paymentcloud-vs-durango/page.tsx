import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import PaymentCloudVsDurangoContent from "./PaymentCloudVsDurangoContent";

const URL = "https://www.mypayadvisor.com/comparisons/paymentcloud-vs-durango";

export const metadata: Metadata = {
  title: "PaymentCloud vs Durango 2026: Which High-Risk Processor Approves You Faster",
  description:
    "PaymentCloud vs Durango Merchant Services for high-risk merchants. Approved verticals, reserves, approval speed, and offshore options compared. Reviewed by a payments operator.",
  alternates: {
    canonical: URL,
  },
  openGraph: {
    title: "PaymentCloud vs Durango 2026: Which High-Risk Processor Approves You Faster",
    description:
      "PaymentCloud vs Durango Merchant Services for high-risk merchants. Approved verticals, reserves, approval speed, and offshore options compared.",
    url: URL,
    type: "article",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
  other: {
    "article:published_time": "2026-05-30T00:00:00.000Z",
    "article:modified_time": new Date().toISOString(),
  },
};

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
              "Interchange-plus and tiered high-risk pricing; rate quoted per merchant on underwriting",
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
              "Domestic and offshore high-risk pricing; rate quoted per merchant and acquirer",
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
        text: "Neither publishes a fixed high-risk rate, because both quote per merchant after underwriting your industry, chargeback history, and volume. PaymentCloud positions on domestic interchange-plus and tiered pricing with fast onboarding; Durango can route domestically or offshore, and an offshore placement sometimes lowers the effective cost or reserve for a vertical that domestic banks penalize heavily. The honest answer is that the cheaper option depends on which acquiring bank approves you, not on a headline number, so compare written quotes side by side before deciding.",
      },
    },
    {
      "@type": "Question",
      name: "Which one approves CBD, firearms, or nutra?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PaymentCloud publicly states acceptance of CBD, firearms, adult, e-cig, and nutraceutical merchants through domestic acquirers, which makes it a common default for U.S. e-commerce in those verticals. Durango Merchant Services also serves these categories and adds offshore acquiring, which matters when a vertical, a chargeback history, or a volume level has already been declined by domestic banks. For a clean domestic CBD or firearms store, PaymentCloud is usually the faster path; for harder-to-place or offshore-suited cases, Durango widens the options.",
      },
    },
    {
      "@type": "Question",
      name: "Do PaymentCloud and Durango both require a rolling reserve?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both can require a rolling reserve, because the reserve is set by the acquiring bank behind the account, not by the reseller. For high-risk verticals a reserve is common, typically a percentage of each batch held for a fixed window. The reserve is negotiable over time: after several months of clean processing, a written release request that cites a low chargeback ratio and active fraud tooling often reduces the percentage or the hold window with either provider. Ask in writing, and ask after you have a track record.",
      },
    },
    {
      "@type": "Question",
      name: "Can I switch from Stripe to PaymentCloud or Durango after a freeze?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Both PaymentCloud and Durango specialize in merchants that Stripe, PayPal, or Square have declined, frozen, or terminated, which is one of their core use cases. Move quickly: get the freeze reason from Stripe in writing, gather your processing history and documentation, and apply to a high-risk specialist whose acquiring banks already underwrite your category. A prior freeze does not block approval by itself; it is one data point underwriting weighs alongside your chargeback ratio and documentation.",
      },
    },
  ],
};

export default function PaymentCloudVsDurangoPage() {
  return (
    <>
      <ComparisonSchema
        title="PaymentCloud vs Durango 2026: High-Risk Approval and Reserves Compared"
        description="PaymentCloud vs Durango Merchant Services for high-risk merchants. Approved verticals, reserves, approval speed, and offshore options compared, reviewed by a payments operator."
        slug="paymentcloud-vs-durango"
        datePublished="2026-05-30"
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
      <PaymentCloudVsDurangoContent />
    </>
  );
}

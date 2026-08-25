import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import StripeHighRiskAlternativesContent from "./StripeHighRiskAlternativesContent";

const URL = "https://www.mypayadvisor.com/comparisons/stripe-high-risk-alternatives";

export const metadata: Metadata = {
  title: "Stripe High-Risk Alternatives 2026: Where to Go After a Freeze",
  description:
    "Stripe froze your account or holds your funds? Here are real high-risk payment processors that approve merchants Stripe declines: PaymentCloud, Durango, Easy Pay Direct, Soar Payments, and Host Merchant Services. Reviewed by a payments operator.",
  alternates: {
    canonical: URL,
  },
  openGraph: {
    title: "Stripe High-Risk Alternatives 2026: Where to Go After a Freeze",
    description:
      "Real high-risk payment processors that approve merchants Stripe declines, frozen, or terminated. PaymentCloud, Durango, Easy Pay Direct, Soar Payments, Host Merchant Services compared.",
    url: URL,
    type: "article",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
  other: {
    "article:published_time": "2026-05-30T00:00:00.000Z",
    "article:modified_time": "2026-08-25T00:00:00.000Z",
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
  name: "Stripe High-Risk Alternatives (2026)",
  itemListOrder: "https://schema.org/ItemListUnordered",
  numberOfItems: 5,
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
              "Domestic high-risk pricing; rate quoted per merchant on underwriting",
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
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "SoftwareApplication",
        name: "Easy Pay Direct",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        url: "https://easypaydirect.com",
        offers: {
          "@type": "Offer",
          category: "High-risk merchant account",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": "PriceSpecification",
            description:
              "High-risk pricing quoted per merchant; supports load balancing across multiple MIDs",
          },
        },
      },
    },
    {
      "@type": "ListItem",
      position: 4,
      item: {
        "@type": "SoftwareApplication",
        name: "Soar Payments",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        url: "https://www.soarpay.com",
        offers: {
          "@type": "Offer",
          category: "High-risk merchant account",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": "PriceSpecification",
            description:
              "Domestic high-risk pricing; rate quoted per merchant on underwriting",
          },
        },
      },
    },
    {
      "@type": "ListItem",
      position: 5,
      item: {
        "@type": "SoftwareApplication",
        name: "Host Merchant Services",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        url: "https://www.hostmerchantservices.com",
        offers: {
          "@type": "Offer",
          category: "High-risk merchant account",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": "PriceSpecification",
            description:
              "Interchange-plus pricing; high-risk placement quoted per merchant",
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
      name: "Why did Stripe freeze my account or hold my funds?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Stripe is an aggregator: many merchants share underwriting on its platform, so it manages risk by acting fast on anything that looks elevated. Common triggers are a rising chargeback ratio, a sudden spike in volume, selling a restricted or high-risk category (CBD, supplements, firearms, adult, future-delivery sales), a mismatch between your stated business and your actual transactions, or a dispute pattern flagged by its automated review. When Stripe sees risk it can pause payouts, hold a reserve, or terminate the account, often before a human reviews the case. The first step is to request the specific reason in writing through Stripe support.",
      },
    },
    {
      "@type": "Question",
      name: "What is the best alternative to Stripe for a high-risk business?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "There is no single best answer, because the right alternative depends on your vertical, volume, and why Stripe declined you. For domestic CBD, firearms, or nutra e-commerce that wants speed, PaymentCloud is a common default. If a domestic bank has already declined you or you need offshore acquiring, Durango Merchant Services widens the options. For high-volume or subscription merchants, Easy Pay Direct's load balancing across multiple MIDs adds resilience. Soar Payments and Host Merchant Services are additional domestic high-risk specialists worth a quote. The honest move is to get written quotes from two or three whose acquiring banks already underwrite your category.",
      },
    },
    {
      "@type": "Question",
      name: "Can I get my frozen funds back from Stripe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Frozen funds are usually released, but on Stripe's timeline, not yours. When an account is terminated, processors commonly hold the balance for a period (often around ninety to one hundred eighty days) to cover potential chargebacks and refunds, then release the remainder. To improve your odds and speed, get the freeze reason in writing, respond to every documentation request promptly, resolve open disputes, and keep records of fulfilled orders. Funds tied to genuine, fulfilled transactions are generally returned; the hold exists to protect against future chargebacks, not to keep your money permanently. Meanwhile, set up a high-risk account elsewhere so the business keeps running.",
      },
    },
    {
      "@type": "Question",
      name: "How fast can I switch to a high-risk processor after Stripe freezes me?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "High-risk specialists can often approve and onboard within one to three business days once your application and documentation are complete, because approving merchants the aggregators decline is their core business. The bottleneck is usually documentation, not the processor: have your business details, processing history, prior statements, and any chargeback context ready before you apply. Applying to a specialist whose acquiring banks already underwrite your vertical, rather than another aggregator, is what shortens the gap and reduces the chance of a repeat freeze.",
      },
    },
  ],
};

export default function StripeHighRiskAlternativesPage() {
  return (
    <>
      <ComparisonSchema
        title="Stripe High-Risk Alternatives 2026: Where to Go After a Freeze"
        description="Real high-risk payment processors that approve merchants Stripe declines, freezes, or terminates: PaymentCloud, Durango, Easy Pay Direct, Soar Payments, Host Merchant Services, reviewed by a payments operator."
        slug="stripe-high-risk-alternatives"
        datePublished="2026-05-30"
        dateModified="2026-08-25"
        breadcrumbItems={[
          { name: "Home", item: "https://www.mypayadvisor.com" },
          { name: "Comparisons", item: "https://www.mypayadvisor.com/comparisons" },
          { name: "Stripe High-Risk Alternatives" },
        ]}
        quotation={{
          text: "When Stripe freezes a merchant, the panic is about the held funds, but the real problem is that the business stopped processing today. Stripe is an aggregator, so it manages risk for thousands of accounts at once and acts fast on anything elevated. The fix is not to argue your way back in; it is to move to a processor whose acquiring banks actually underwrite your category, so you are a known risk they priced for, not an anomaly an algorithm flagged. Get the freeze reason in writing, then place the account where it belongs.",
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
      <StripeHighRiskAlternativesContent />
    </>
  );
}

import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import StripeHighRiskAlternativesContent from "./StripeHighRiskAlternativesContent";
import { withSeoOverride } from "@/lib/seo/overrides";
import { AeoAnswer } from "@/components/seo/AeoAnswer";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { CompareMore } from "@/components/comparisons/CompareMore";

const URL = "https://www.mypayadvisor.com/comparisons/stripe-high-risk-alternatives";

const baseMetadata: Metadata = {
  title: { absolute: "Stripe High-Risk Alternatives 2026: Where to Go After a Freeze" },
  description:
    "Stripe froze your account or holds your funds? Here are real high-risk payment processors that approve merchants Stripe declines: PaymentCloud, Durango, Easy Pay Direct, Soar Payments, and Host Merchant Services, with what each publishes.",
  alternates: {
    canonical: URL,
  },
  openGraph: {
    title: "Stripe High-Risk Alternatives 2026: Where to Go After a Freeze",
    description:
      "Real high-risk payment processors for merchants Stripe declined, froze, or terminated. PaymentCloud, Durango, Easy Pay Direct, Soar Payments, Host Merchant Services compared.",
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
  return withSeoOverride("comparisons", "stripe-high-risk-alternatives", baseMetadata);
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
    {
      "@type": "ListItem",
      position: 3,
      item: {
        "@type": "SoftwareApplication",
        name: "Easy Pay Direct",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        url: "https://www.easypaydirect.com",
        offers: {
          "@type": "Offer",
          category: "High-risk merchant account",
          priceCurrency: "USD",
          priceSpecification: {
            "@type": "PriceSpecification",
            description:
              "Published online card rate 2.69% + $0.36 per transaction; custom pricing for higher volume",
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
              "Quote-only; Soar Payments publishes no rates",
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
              "Interchange-plus; standard e-commerce markup 0.35% + $0.10 per transaction and $14.99 monthly fee published; high-risk accounts placed through partners and priced per merchant",
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
        text: "Stripe pools many merchants on one platform and reviews risk continuously, so it can act quickly on anything that looks risky. Common triggers are a rising chargeback ratio, a sudden spike in volume, selling a category on Stripe's prohibited or restricted list (adult content is prohibited; CBD and legal firearms are restricted), a mismatch between your stated business and your actual transactions, or a flagged dispute pattern. When Stripe sees risk it can pause payouts, hold a reserve, or close the account. The first step is to request the specific reason in writing through Stripe support.",
      },
    },
    {
      "@type": "Question",
      name: "What is the best alternative to Stripe for a high-risk business?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "There is no single best answer, because the right alternative depends on your vertical, volume, and why Stripe declined you. PaymentCloud accepts a wide list of verticals, including adult, and quotes every account. Durango Merchant Services publishes its typical price and reserve ranges and offers international accounts in Canada, Europe, and Panama, but does not take adult content. Easy Pay Direct publishes an online rate of 2.69% + $0.36 and routes transactions across multiple merchant accounts, which suits high-volume or subscription merchants. Soar Payments is another quote-only high-risk specialist, and Host Merchant Services publishes interchange-plus markups for standard accounts and places high-risk merchants through partners. Get written quotes from two or three whose banks already underwrite your category.",
      },
    },
    {
      "@type": "Question",
      name: "Can I get my frozen funds back from Stripe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Stripe's reserves FAQ describes a reserve as a temporary hold on a portion of your funds for a predetermined period, released in full at the end of the reserve period, and says that in rare cases a reserve may be required indefinitely. Stripe does not publish a fixed number of days for funds held after an account closes, so ask support for the expected release date in writing. To speed things up, respond to every documentation request promptly, resolve open disputes, and keep records of fulfilled orders. Meanwhile, set up a high-risk account elsewhere so the business keeps running.",
      },
    },
    {
      "@type": "Question",
      name: "How fast can I switch to a high-risk processor after Stripe freezes me?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "High-risk specialists state approval times from about 24 hours to five business days once your application and documents are complete: PaymentCloud says 24 hours to 5 days, Durango says most accounts take 1 to 3 business days, Soar says underwriting typically takes 24 to 72 hours, and Easy Pay Direct says 24 to 48 hours from a complete submission. The bottleneck is usually documentation: have your business details, bank and processing statements, and any chargeback context ready before you apply. Applying to a specialist whose banks already underwrite your vertical is what shortens the gap and reduces the chance of a repeat freeze.",
      },
    },
  ],
};

export default function StripeHighRiskAlternativesPage() {
  return (
    <>
      <ComparisonSchema
        title="Stripe High-Risk Alternatives 2026: Where to Go After a Freeze"
        description="Real high-risk payment processors for merchants Stripe declines, freezes, or terminates: PaymentCloud, Durango, Easy Pay Direct, Soar Payments, Host Merchant Services, with what each publishes."
        slug="stripe-high-risk-alternatives"
        datePublished="2026-05-30"
        dateModified="2026-11-11"
        breadcrumbItems={[
          { name: "Home", item: "https://www.mypayadvisor.com" },
          { name: "Comparisons", item: "https://www.mypayadvisor.com/comparisons" },
          { name: "Stripe High-Risk Alternatives" },
        ]}
        quotation={{
          text: "When Stripe freezes a merchant, the panic is about the held funds, but the real problem is that the business stopped processing today. Stripe is an aggregator, so it manages risk for thousands of accounts at once and acts fast on anything that looks risky. The fix is not to argue your way back in; it is to move to a processor whose acquiring banks actually underwrite your category, so you are a known risk they priced for, not an anomaly an algorithm flagged. Get the freeze reason in writing, then place the account where it belongs.",
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
      <StripeHighRiskAlternativesContent
        aeoAnswer={<AeoAnswer kind="comparisons" slug="stripe-high-risk-alternatives" />}
        relatedLinks={<RelatedLinks kind="comparisons" slug="stripe-high-risk-alternatives" />}
      />
      <CompareMore slug="stripe-high-risk-alternatives" />
    </>
  );
}

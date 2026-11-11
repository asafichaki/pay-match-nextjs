import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import PaymentCloudVsEasyPayDirectContent from "./PaymentCloudVsEasyPayDirectContent";
import { withSeoOverride } from "@/lib/seo/overrides";
import { AeoAnswer } from "@/components/seo/AeoAnswer";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { CompareMore } from "@/components/comparisons/CompareMore";

const URL = "https://www.mypayadvisor.com/comparisons/paymentcloud-vs-easy-pay-direct";

const baseMetadata: Metadata = {
  title: { absolute: "PaymentCloud vs Easy Pay Direct 2026: High-Risk Approval and Multi-MID Compared" },
  description:
    "PaymentCloud vs Easy Pay Direct for high-risk merchants. Published pricing, verticals, reserves, multi-account routing, and approval times compared from each provider's own site.",
  alternates: {
    canonical: URL,
  },
  openGraph: {
    title: "PaymentCloud vs Easy Pay Direct 2026: High-Risk Approval and Multi-MID Compared",
    description:
      "PaymentCloud vs Easy Pay Direct for high-risk merchants. Published pricing, verticals, reserves, multi-account routing, and approval times compared.",
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
  return withSeoOverride("comparisons", "paymentcloud-vs-easy-pay-direct", baseMetadata);
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
  name: "PaymentCloud vs Easy Pay Direct (2026)",
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
              "Published online card rate 2.69% + $0.36 per transaction; $99 setup fee waived if documents are submitted within 24 hours; monthly fee varies; custom pricing for higher volume",
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
      name: "What is the main difference between PaymentCloud and Easy Pay Direct?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both are U.S. high-risk specialists that place merchants the big processors decline, and both list CBD, nutraceuticals, firearms, vape, and adult among the verticals they serve. The differences are in what they publish and how they structure accounts. PaymentCloud publishes no rates; it says it has no long-term contracts and approves in 24 hours to 5 days. Easy Pay Direct publishes an online card rate of 2.69% + $0.36 per transaction and a $99 setup fee waived if documents arrive within 24 hours, and builds multi-account transaction routing into its gateway so volume can move to another merchant account if one has a problem.",
      },
    },
    {
      "@type": "Question",
      name: "What is multi-MID load balancing and do I need it?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Load balancing, which Easy Pay Direct calls multi-account transaction routing, splits your transactions across more than one merchant account, often at different banks. The benefit is resilience: if one account hits a volume limit, a chargeback spike, or a pause, the others keep processing. Easy Pay Direct says it recommends a second merchant account once annual volume passes $250,000 or when you rely on payments for payroll, ad spend, or inventory. A small store usually does not need it; a scaling subscription business often does.",
      },
    },
    {
      "@type": "Question",
      name: "Do PaymentCloud and Easy Pay Direct both require a rolling reserve?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both can, because the reserve is set during underwriting by the bank behind the account, and neither publishes a fixed percentage. PaymentCloud says reserve requirements vary by business type and are discussed before signing. Easy Pay Direct says some high-risk accounts need a reserve, typically on a six-month rolling cycle with funds held at least 180 days, while others get a capped reserve that stops collecting at a set amount. Reserves are often negotiable after several clean months; ask in writing with your chargeback ratio in hand. With more than one merchant account, terms can differ per account, so review each one.",
      },
    },
    {
      "@type": "Question",
      name: "Can I switch from Stripe to PaymentCloud or Easy Pay Direct after a freeze?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Both work with merchants that Stripe, PayPal, or Square have declined, frozen, or terminated. Move quickly: get the freeze reason in writing, gather your processing history, and apply to a specialist whose banks already underwrite your category. If a freeze hurt you because all volume sat on one account, Easy Pay Direct's multi-account routing is worth weighing, because it reduces the single point of failure that caused the outage.",
      },
    },
  ],
};

export default function PaymentCloudVsEasyPayDirectPage() {
  return (
    <>
      <ComparisonSchema
        title="PaymentCloud vs Easy Pay Direct 2026: High-Risk Approval and Multi-MID Compared"
        description="PaymentCloud vs Easy Pay Direct for high-risk merchants. Published pricing, verticals, reserves, multi-account routing, and approval times compared from each provider's own site."
        slug="paymentcloud-vs-easy-pay-direct"
        datePublished="2026-05-30"
        dateModified="2026-11-11"
        breadcrumbItems={[
          { name: "Home", item: "https://www.mypayadvisor.com" },
          { name: "Comparisons", item: "https://www.mypayadvisor.com/comparisons" },
          { name: "PaymentCloud vs Easy Pay Direct" },
        ]}
        quotation={{
          text: "High-volume high-risk merchants get burned when everything rides on one account. The day that single MID gets a chargeback spike or a volume cap, the whole business stops processing. Spreading volume across several MIDs and acquirers is not a growth hack, it is survival engineering. I would rather a scaling subscription merchant accept slightly more setup work to route across multiple banks than win on simplicity and discover the hard limit at the worst possible moment.",
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
      <PaymentCloudVsEasyPayDirectContent
        aeoAnswer={<AeoAnswer kind="comparisons" slug="paymentcloud-vs-easy-pay-direct" />}
        relatedLinks={<RelatedLinks kind="comparisons" slug="paymentcloud-vs-easy-pay-direct" />}
      />
      <CompareMore slug="paymentcloud-vs-easy-pay-direct" />
    </>
  );
}

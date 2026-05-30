import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import PaymentCloudVsEasyPayDirectContent from "./PaymentCloudVsEasyPayDirectContent";

const URL = "https://www.mypayadvisor.com/comparisons/paymentcloud-vs-easy-pay-direct";

export const metadata: Metadata = {
  title: "PaymentCloud vs Easy Pay Direct 2026: High-Risk Approval and Multi-MID Compared",
  description:
    "PaymentCloud vs Easy Pay Direct for high-risk merchants. Approved verticals, reserves, load balancing across multiple MIDs, and approval speed compared. Reviewed by a payments operator.",
  alternates: {
    canonical: URL,
  },
  openGraph: {
    title: "PaymentCloud vs Easy Pay Direct 2026: High-Risk Approval and Multi-MID Compared",
    description:
      "PaymentCloud vs Easy Pay Direct for high-risk merchants. Approved verticals, reserves, load balancing across multiple MIDs, and approval speed compared.",
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
        text: "Both are U.S. high-risk specialists that place merchants the big processors decline, but their emphasis differs. PaymentCloud positions as a broad high-risk reseller with a dedicated account rep and fast domestic onboarding across verticals like CBD, firearms, and nutra. Easy Pay Direct is known for its load-balancing approach, distributing volume across multiple merchant IDs (MIDs) so a single account or acquirer is less likely to cap or freeze a high-volume merchant. The right pick depends on whether your priority is fast simple approval or resilient multi-MID volume routing.",
      },
    },
    {
      "@type": "Question",
      name: "What is multi-MID load balancing and do I need it?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Load balancing splits your transaction volume across more than one merchant ID, often across more than one acquiring bank. The benefit is resilience: if one MID hits a volume cap, gets a chargeback spike, or is paused, the others keep processing, so the business does not go fully offline. It matters most for high-volume subscription and e-commerce merchants whose monthly volume would strain a single high-risk MID. A smaller domestic store usually does not need it; a scaling subscription business often does. Easy Pay Direct centers its offer on this model.",
      },
    },
    {
      "@type": "Question",
      name: "Do PaymentCloud and Easy Pay Direct both require a rolling reserve?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both can, because the reserve is set by the acquiring bank behind the account, not by the reseller. For high-risk verticals a rolling reserve is common: a percentage of each batch held for a fixed window. It is negotiable over time with either provider. After several months of clean processing, a written release request that cites a low chargeback ratio and active fraud tooling often reduces the percentage or the hold window. With a multi-MID setup, reserve terms can differ per MID, so review each account's terms rather than assuming one number applies across all of them.",
      },
    },
    {
      "@type": "Question",
      name: "Can I switch from Stripe to PaymentCloud or Easy Pay Direct after a freeze?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Both specialize in merchants that Stripe, PayPal, or Square have declined, frozen, or terminated, which is a core use case for each. Move quickly: get the freeze reason from Stripe in writing, gather your processing history and documentation, and apply to a specialist whose acquiring banks already underwrite your category. If a freeze hurt you because all volume sat on one account, Easy Pay Direct's multi-MID model is worth weighing, because it reduces the single-point-of-failure that caused the outage in the first place.",
      },
    },
  ],
};

export default function PaymentCloudVsEasyPayDirectPage() {
  return (
    <>
      <ComparisonSchema
        title="PaymentCloud vs Easy Pay Direct 2026: High-Risk Approval and Multi-MID Compared"
        description="PaymentCloud vs Easy Pay Direct for high-risk merchants. Approved verticals, reserves, load balancing across multiple MIDs, and approval speed compared, reviewed by a payments operator."
        slug="paymentcloud-vs-easy-pay-direct"
        datePublished="2026-05-30"
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
      <PaymentCloudVsEasyPayDirectContent />
    </>
  );
}

import { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import Hero from "@/components/Hero";
import InlineStep1 from "@/components/sorting-hat/InlineStep1";
import EffectiveRateCalculator from "@/components/calculator/EffectiveRateCalculator";
import LeadCaptureBrief from "@/components/home/LeadCaptureBrief";
import LatestUpdatesStrip from "@/components/home/LatestUpdatesStrip";
import RateTable from "@/components/home/RateTable";
import HighRiskEntry from "@/components/home/HighRiskEntry";
import BarakBlock from "@/components/home/BarakBlock";
import WhoWeAreVideo from "@/components/home/WhoWeAreVideo";
import ProcessorVoices from "@/components/home/ProcessorVoices";
import EditorialPicks from "@/components/home/EditorialPicks";
import FAQ from "@/components/FAQ";
import { faqs } from "@/data/faqs";

export const metadata: Metadata = {
  title: {
    absolute: "myPayAdvisor, A real payments operator reviews your shortlist",
  },
  description:
    "Independently reviewed by people who've operated payment infrastructure at $500M+ annual volume. Real 2026 rates, the questions to ask each processor, no generic CRM.",
  keywords:
    "payment processor comparison, payment processing rates 2026, merchant account negotiation, interchange-plus pricing, independent processor review",
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large" as const,
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  authors: [{ name: "myPayAdvisor" }],
  alternates: {
    canonical: "https://www.mypayadvisor.com",
  },
  openGraph: {
    type: "website",
    url: "https://www.mypayadvisor.com",
    title: "myPayAdvisor, A real payments operator reviews your shortlist",
    description:
      "Independent review of the major payment processors. Real 2026 rates and the questions to ask before you sign with anyone.",
    images: [
      {
        url: "https://www.mypayadvisor.com/og-logo.png",
        width: 1200,
        height: 630,
      },
    ],
    siteName: "myPayAdvisor",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "myPayAdvisor, A real payments operator reviews your shortlist",
    description:
      "Real 2026 processor rates, independently reviewed. No generic CRM. Personal reply in minutes.",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "myPayAdvisor",
  url: "https://www.mypayadvisor.com",
  logo: "https://www.mypayadvisor.com/og-logo.png",
  description:
    "Independent payment-processor advisory and comparison platform. Reviewed by people who've operated payment infrastructure at the $500M+ annual volume level.",
  foundingDate: "2024",
  sameAs: [
    "https://www.linkedin.com/company/mypayadvisor",
    "https://www.crunchbase.com/organization/mypayadvisor",
    "https://www.wikidata.org/wiki/Q139731888",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "info@mypayadvisor.com",
    contactType: "customer service",
    availableLanguage: ["English"],
  },
};

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "myPayAdvisor, A real payments operator reviews your shortlist",
  description:
    "Independently reviewed by experienced payments operators so you stop overpaying on processing.",
  url: "https://www.mypayadvisor.com/",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1"],
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.mypayadvisor.com/" },
  ],
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Personally-vetted payment processor shortlist",
  description:
    "A short list of payment processors picked by an experienced operator for your specific vertical, monthly volume, and operational pain.",
  provider: { "@type": "Organization", name: "myPayAdvisor" },
  serviceType: "Payment Processing Advisory",
  areaServed: { "@type": "Country", name: "United States" },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={organizationSchema} />
      <JsonLd data={webPageSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={serviceSchema} />

      {/* 1. Hero, operator-first */}
      <Hero />

      {/* 2. Inline Sorting Hat Step 1 */}
      <InlineStep1 />

      {/* 2b. Live updates strip (renders only if 3+ items) */}
      <LatestUpdatesStrip />

      {/* 3. Lead capture, The Rate Brief */}
      <LeadCaptureBrief />

      {/* 4. Effective Rate Calculator */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <EffectiveRateCalculator defaultChannel="online" />
      </div>

      {/* 4b. Who we are, 90-sec founder video */}
      <WhoWeAreVideo />

      {/* 5. Provider rate table, editorial */}
      <RateTable />

      {/* 5b. High-risk tile: the rates above do not apply if underwriting flags you */}
      <HighRiskEntry />

      {/* 6. How this is different (operator review process) */}
      <BarakBlock />

      {/* 7. Industry voices, processor sentiment */}
      <ProcessorVoices />

      {/* 8. Editorial picks (3 cornerstones) */}
      <EditorialPicks />

      {/* 9. FAQ */}
      <FAQ />
    </>
  );
}

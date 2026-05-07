import { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import Hero from "@/components/Hero";
import InlineStep1 from "@/components/sorting-hat/InlineStep1";
import EffectiveRateCalculator from "@/components/calculator/EffectiveRateCalculator";
import RateTable from "@/components/home/RateTable";
import BarakBlock from "@/components/home/BarakBlock";
import EditorialPicks from "@/components/home/EditorialPicks";
import FAQ from "@/components/FAQ";
import { faqs } from "@/data/faqs";
import { BARAK_PERSON_SCHEMA, BARAK_NAME, BARAK_LINKEDIN } from "@/data/personas/barak";

export const metadata: Metadata = {
  title: {
    absolute: "myPayAdvisor — Reviewed by Barak Bachar, Global Payments Manager",
  },
  description:
    "A real payments operator who's run $500M+ in volume reviews your shortlist. Real 2026 rates, exact questions to ask each processor, no generic CRM.",
  keywords:
    "payment processor comparison, payment processing rates 2026, merchant account negotiation, interchange-plus pricing, Barak Bachar payments expert",
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large" as const,
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  authors: [{ name: BARAK_NAME }],
  alternates: {
    canonical: "https://www.mypayadvisor.com",
  },
  openGraph: {
    type: "website",
    url: "https://www.mypayadvisor.com",
    title: "myPayAdvisor — Reviewed by Barak Bachar, Global Payments Manager",
    description:
      "A real payments operator reviews your shortlist. Real 2026 rates and the questions to ask before you sign with anyone.",
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
    title: "myPayAdvisor — Reviewed by Barak Bachar",
    description:
      "Real 2026 processor rates, reviewed by a $500M+ payments operator. No generic CRM. Personal reply in minutes.",
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
    "Independent payment-processor advisory and comparison platform reviewed by Barak Bachar, Global Payments Manager.",
  foundingDate: "2024",
  sameAs: [BARAK_LINKEDIN],
  employee: {
    "@type": "Person",
    name: BARAK_NAME,
    jobTitle: "Global Payments Manager",
    sameAs: [BARAK_LINKEDIN],
    url: "https://www.mypayadvisor.com/about/barak",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "info@mypayadvisor.com",
    contactType: "customer service",
    availableLanguage: ["English"],
  },
};

const personSchema = {
  "@context": "https://schema.org",
  ...BARAK_PERSON_SCHEMA,
  worksFor: {
    "@type": "Organization",
    name: "myPayAdvisor",
    url: "https://www.mypayadvisor.com",
  },
};

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "myPayAdvisor — Reviewed by Barak Bachar, Global Payments Manager",
  description:
    "A real payments operator reviews your shortlist so you stop overpaying on processing.",
  url: "https://www.mypayadvisor.com/",
  reviewedBy: BARAK_PERSON_SCHEMA,
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
    "A short list of payment processors picked by a Global Payments Manager for your specific vertical, monthly volume, and operational pain.",
  provider: { "@type": "Organization", name: "myPayAdvisor" },
  serviceType: "Payment Processing Advisory",
  areaServed: { "@type": "Country", name: "United States" },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={organizationSchema} />
      <JsonLd data={personSchema} />
      <JsonLd data={webPageSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={serviceSchema} />

      {/* 1. Hero — Barak-first */}
      <Hero />

      {/* 2. Inline Sorting Hat Step 1 */}
      <InlineStep1 />

      {/* 3. Effective Rate Calculator */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-4">
        <EffectiveRateCalculator defaultChannel="online" />
      </div>

      {/* 4. Provider rate table — editorial */}
      <RateTable />

      {/* 5. Barak credibility block */}
      <BarakBlock />

      {/* 6. Editorial picks (3 cornerstones) */}
      <EditorialPicks />

      {/* 7. FAQ */}
      <FAQ />
    </>
  );
}

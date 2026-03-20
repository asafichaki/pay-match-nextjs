import { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import Hero from "@/components/Hero";
import SocialProofBar from "@/components/SocialProofBar";
import ProblemSection from "@/components/ProblemSection";
import QuizPreview from "@/components/QuizPreview";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import ProvidersList from "@/components/ProvidersList";
import ComparisonTable from "@/components/ComparisonTable";
import WhyChoose from "@/components/WhyChoose";
import NewsletterSection from "@/components/NewsletterSection";
import FAQ from "@/components/FAQ";
import Insights from "@/components/Insights";
import { faqs } from "@/data/faqs";

export const metadata: Metadata = {
  title: {
    absolute: "myPayAdvisor - Compare Payment Processors & Save Up to 40% on Fees",
  },
  description: "Compare top payment processors for your business. Find solutions with low fees, fast funding & 24/7 support. Free quiz matches you in 90 seconds.",
  keywords: "payment processor comparison, payment gateway, credit card processing, merchant services, payment solutions, transaction fees, best payment processor 2026",
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
    title: "Best Payment Processors 2026 | Compare & Save Up to 40%",
    description: "Compare top payment processors. Find low fees, fast funding & expert support. Free quiz matches you in 90 seconds.",
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
    title: "Best Payment Processors 2026 | Compare & Save",
    description: "Compare payment processors and save up to 40% on fees. Free 90-second quiz matches you with the best fit.",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
};

// FAQ Schema
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
};

// Organization Schema
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "myPayAdvisor",
  "url": "https://www.mypayadvisor.com",
  "logo": "https://www.mypayadvisor.com/og-logo.png",
  "description": "Expert payment processing advisory and comparison platform helping businesses find the best payment solutions",
  "foundingDate": "2024",
  "sameAs": [],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "info@mypayadvisor.com",
    "contactType": "customer service",
    "availableLanguage": ["English"]
  }
};

// WebPage Schema with speakable
const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "myPayAdvisor - Compare Payment Processors & Save Up to 40% on Fees",
  "description": "Compare leading payment processors trusted by thousands of businesses. Find the best payment solution with transparent pricing, next-day funding, and 24/7 support.",
  "url": "https://www.mypayadvisor.com/",
  "mainEntity": {
    "@type": "ItemList",
    "name": "Top Payment Processors 2026",
    "description": "Curated list of the best payment processors for businesses",
    "itemListOrder": "https://schema.org/ItemListOrderDescending",
    "numberOfItems": 5
  },
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": ["h1", ".hero-description"]
  }
};

// BreadcrumbList Schema
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [{
    "@type": "ListItem",
    "position": 1,
    "name": "Home",
    "item": "https://www.mypayadvisor.com/"
  }]
};

// Service Schema
const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Payment Processor Comparison Service",
  "description": "Free payment processor comparison and recommendation service for businesses of all sizes",
  "provider": {
    "@type": "Organization",
    "name": "myPayAdvisor"
  },
  "serviceType": "Payment Processing Advisory",
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  }
};

// HowTo Schema for quiz
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Find the Best Payment Processor for Your Business",
  "description": "Use our free 90-second quiz to get matched with the ideal payment processor based on your business needs.",
  "totalTime": "PT2M",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Take the Quiz",
      "text": "Answer 6 quick questions about your business type, volume, and priorities."
    },
    {
      "@type": "HowToStep",
      "name": "See Your Matches",
      "text": "Our algorithm analyzes 50+ data points to find processors that fit your specific needs."
    },
    {
      "@type": "HowToStep",
      "name": "Get Your Free Quote",
      "text": "Connect directly with your matched processors and start saving on processing fees."
    }
  ]
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={organizationSchema} />
      <JsonLd data={webPageSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={serviceSchema} />
      <JsonLd data={howToSchema} />

      {/* 1. Hero - Hook with single quiz CTA */}
      <Hero />

      {/* 2. Social Proof - Trust immediately */}
      <SocialProofBar />

      {/* 3. Problem - Loss aversion activation */}
      <ProblemSection />

      {/* 4. Quiz Preview - Solution to the problem */}
      <QuizPreview />

      {/* 5. How It Works - Reduce anxiety */}
      <HowItWorks />

      {/* 6. Testimonials - Proof the process works */}
      <Testimonials />

      {/* 7. Providers - Now with context + trust + motivation */}
      <ProvidersList />

      {/* 8. Comparison Table - Detail for analytical buyers */}
      <ComparisonTable />

      {/* 9. Why Choose Us - Reinforce vs DIY */}
      <WhyChoose />

      {/* 10. Newsletter - Catch scrollers who didn't convert */}
      <NewsletterSection />

      {/* 11. FAQ - Objection handling */}
      <FAQ />

      {/* 12. Insights - SEO + internal links */}
      <Insights />
    </>
  );
}

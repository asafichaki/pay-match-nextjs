import { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import Hero from "@/components/Hero";
import ProvidersList from "@/components/ProvidersList";
import WhyChoose from "@/components/WhyChoose";
import QuizCTA from "@/components/QuizCTA";
import ComparisonTable from "@/components/ComparisonTable";
import Testimonials from "@/components/Testimonials";
import SimpleCTA from "@/components/SimpleCTA";
import GlobalPayments from "@/components/GlobalPayments";
import FAQ from "@/components/FAQ";
import Insights from "@/components/Insights";
import FeaturedArticles from "@/components/FeaturedArticles";
import AboutUs from "@/components/AboutUs";
import { faqs } from "@/data/faqs";

export const metadata: Metadata = {
  title: {
    absolute: "myPayAdvisor - Find the Perfect Payment Processor for Your Business",
  },
  description: "Compare top payment processors for your business. Find solutions with low fees, fast funding & 24/7 support. Save up to 40% on processing.",
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
    title: "Best Payment Processors 2026 | Compare & Save",
    description: "Compare top payment processors. Find low fees, fast funding & expert support. Save up to 40%.",
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
    title: "Best Payment Processors 2026",
    description: "Compare payment processors and save up to 40% on fees. Expert reviews & transparent pricing.",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
};

// Generate FAQ Schema
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

// WebPage Schema with enhanced info
const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "myPayAdvisor - Find the Perfect Payment Processor for Your Business",
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
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Payment Processor Recommendations",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Payment Processor Comparison Quiz"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Custom Payment Solution Recommendations"
        }
      }
    ]
  }
};

// AggregateRating Schema for social proof
const aggregateRatingSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "myPayAdvisor Payment Processor Comparison",
  "description": "Expert payment processor comparison and recommendation platform",
  "brand": {
    "@type": "Brand",
    "name": "myPayAdvisor"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": "847",
    "reviewCount": "312"
  }
};

// SoftwareApplication Schema (for the quiz tool)
const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "myPayAdvisor Payment Processor Finder",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "523"
  }
};

// AboutPage Schema
const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About Us - myPayAdvisor",
  "description": "myPayAdvisor helps you find the payment processor that best fits your business needs. We simplify the comparison process so you can make an informed decision.",
  "url": "https://www.mypayadvisor.com/#about",
  "mainEntity": {
    "@type": "Organization",
    "name": "myPayAdvisor",
    "description": "Payment processor comparison platform helping businesses find the right payment solution",
    "foundingDate": "2024",
    "knowsAbout": [
      "Payment Processing",
      "Credit Card Processing",
      "Merchant Services",
      "Payment Gateways",
      "E-commerce Payments"
    ]
  }
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={organizationSchema} />
      <JsonLd data={webPageSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={serviceSchema} />
      <JsonLd data={aggregateRatingSchema} />
      <JsonLd data={softwareSchema} />
      <JsonLd data={aboutSchema} />

      <Hero />
      <WhyChoose />
      <ProvidersList />
      <QuizCTA />
      <ComparisonTable />
      <Testimonials />
      <SimpleCTA />
      <GlobalPayments />
      <FAQ />
      <Insights />
      <FeaturedArticles />
      <AboutUs />
    </>
  );
}

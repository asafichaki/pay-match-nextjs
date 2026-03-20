"use client";

import { useEffect } from "react";
import { CreditCard } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import QuizContent from "@/components/QuizContent";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import WhyChoose from "@/components/WhyChoose";
import Breadcrumbs from "@/components/ui/breadcrumbs";

// HowTo Schema for the quiz process
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Find the Best Payment Processor for Your Business",
  "description": "A step-by-step guide to finding the perfect payment processor for your business needs using our free assessment tool.",
  "totalTime": "PT2M",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "0"
  },
  "tool": {
    "@type": "HowToTool",
    "name": "myPayAdvisor Payment Processor Quiz"
  },
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Select Your Business Type",
      "text": "Choose whether you operate online, in-store, or both to help us understand your payment acceptance needs."
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Enter Your Monthly Volume",
      "text": "Provide your estimated monthly transaction volume to get pricing recommendations tailored to your scale."
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Specify Your Industry",
      "text": "Select your business industry to ensure we recommend processors experienced with your type of transactions."
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Choose Your Priorities",
      "text": "Tell us what matters most: low fees, fast funding, specific integrations, or customer support quality."
    },
    {
      "@type": "HowToStep",
      "position": 5,
      "name": "Get Personalized Recommendations",
      "text": "Receive a curated list of payment processors that match your specific business requirements and goals."
    }
  ]
};

// WebPage Schema
const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Find Your Perfect Payment Processor - Free Quiz",
  "description": "Take our free 2-minute quiz to get personalized payment processor recommendations based on your business type, volume, and specific needs.",
  "url": "https://www.mypayadvisor.com/quiz",
  "mainEntity": {
    "@type": "Quiz",
    "name": "Payment Processor Recommendation Quiz",
    "about": {
      "@type": "Thing",
      "name": "Payment Processing"
    }
  }
};

export default function QuizPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <JsonLd data={howToSchema} />
      <JsonLd data={webPageSchema} />

      <div className="px-4 py-6 sm:py-12 flex items-center justify-center">
        <div className="w-full max-w-3xl">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[{ label: "Payment Processor Quiz" }]}
            className="mb-4 justify-center sm:justify-start"
          />

          <div className="bg-card rounded-2xl sm:rounded-3xl shadow-xl border-2 border-border p-6 sm:p-8 lg:p-10">
            {/* Header */}
            <header className="mb-6 sm:mb-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-primary" aria-hidden="true" />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  Find Your Perfect Payment Processor
                </h1>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                Answer a few quick questions to get personalized recommendations tailored to your business needs
              </p>
            </header>

            {/* Quiz Content */}
            <QuizContent showBackButton={true} />
          </div>
        </div>
      </div>

      {/* Additional Content from Home Page */}
      <WhyChoose />
      <Testimonials />
      <FAQ />
    </>
  );
}

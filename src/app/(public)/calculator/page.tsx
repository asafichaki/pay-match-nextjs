import { Metadata } from "next";
import FeeCalculatorClient from "./FeeCalculatorClient";

export const metadata: Metadata = {
  title: "Payment Processor Fee Calculator | Estimate Processing Costs",
  description: "Calculate estimated payment processing fees based on your monthly volume, average transaction size, and sales channels. Free tool to understand your potential costs.",
  keywords: "payment processor calculator, credit card processing fees, payment processing cost estimate, processing fee calculator",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.mypayadvisor.com/calculator",
  },
  openGraph: {
    type: "website",
    url: "https://www.mypayadvisor.com/calculator",
    title: "Payment Processor Fee Calculator",
    description: "Calculate estimated payment processing fees. Understand potential costs before choosing a processor.",
    images: [
      {
        url: "https://www.mypayadvisor.com/og-logo.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Payment Processor Fee Calculator",
    description: "Estimate your payment processing costs",
  },
};

export default function CalculatorPage() {
  return <FeeCalculatorClient />;
}

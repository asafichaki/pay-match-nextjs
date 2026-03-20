import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Your Perfect Payment Processor - Free Quiz",
  description: "Take our free 2-minute quiz to get personalized payment processor recommendations. Compare fees, features, and find the best fit for your business type and volume.",
  keywords: "payment processor quiz, find payment processor, best payment processor for my business, payment gateway comparison, merchant account finder",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.mypayadvisor.com/quiz",
  },
  openGraph: {
    type: "website",
    url: "https://www.mypayadvisor.com/quiz",
    title: "Find Your Perfect Payment Processor - Free Quiz",
    description: "Get personalized payment processor recommendations in 2 minutes. Free assessment tool for businesses.",
    images: [
      {
        url: "https://www.mypayadvisor.com/og-logo.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Find Your Perfect Payment Processor - Free Quiz",
    description: "Get personalized payment processor recommendations in 2 minutes.",
  },
};

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

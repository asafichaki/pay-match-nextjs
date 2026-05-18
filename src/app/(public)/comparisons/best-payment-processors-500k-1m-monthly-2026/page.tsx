import type { Metadata } from "next";
import { VolumeTierPage } from "@/components/comparisons/VolumeTierPage";
import { VOLUME_TIERS_BY_SLUG } from "@/lib/comparisons/volume-tiers";

const SLUG = "best-payment-processors-500k-1m-monthly-2026";
const tier = VOLUME_TIERS_BY_SLUG.get(SLUG)!;

export const metadata: Metadata = {
  title: tier.metaTitle,
  description: tier.metaDescription,
  alternates: { canonical: `https://www.mypayadvisor.com/comparisons/${SLUG}` },
  robots: { index: true, follow: true },
  openGraph: {
    type: "article",
    url: `https://www.mypayadvisor.com/comparisons/${SLUG}`,
    title: tier.metaTitle,
    description: tier.metaDescription,
    images: [{ url: "https://www.mypayadvisor.com/og-logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: tier.metaTitle,
    description: tier.metaDescription,
  },
};

export default function Page() {
  return <VolumeTierPage tier={tier} />;
}

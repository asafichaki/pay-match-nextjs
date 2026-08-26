import type { Metadata } from "next";
import { VolumeTierPage } from "@/components/comparisons/VolumeTierPage";
import { VOLUME_TIERS_BY_SLUG } from "@/lib/comparisons/volume-tiers";
import { withSeoOverride } from "@/lib/seo/overrides";
import { AeoAnswer } from "@/components/seo/AeoAnswer";
import { RelatedLinks } from "@/components/seo/RelatedLinks";

const SLUG = "best-payment-processors-25k-50k-monthly-2026";
const tier = VOLUME_TIERS_BY_SLUG.get(SLUG)!;

const baseMetadata: Metadata = {
  title: { absolute: tier.metaTitle },
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

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("comparisons", "best-payment-processors-25k-50k-monthly-2026", baseMetadata);
}

export default function Page() {
  return <VolumeTierPage
    tier={tier}
    aeoAnswer={<AeoAnswer kind="comparisons" slug="best-payment-processors-25k-50k-monthly-2026" />}
    relatedLinks={<RelatedLinks kind="comparisons" slug="best-payment-processors-25k-50k-monthly-2026" />}
  />;
}

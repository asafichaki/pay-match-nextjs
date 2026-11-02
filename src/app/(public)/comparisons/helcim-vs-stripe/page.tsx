import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import HelcimVsStripeContent from "./HelcimVsStripeContent";
import { withSeoOverride } from "@/lib/seo/overrides";
import { AeoAnswer } from "@/components/seo/AeoAnswer";
import { RelatedLinks } from "@/components/seo/RelatedLinks";
import { CompareMore } from "@/components/comparisons/CompareMore";
import { FAQ, META_DESCRIPTION, TITLE } from "./data";

const baseMetadata: Metadata = {
  // absolute: skip the layout "%s | myPayAdvisor" suffix so the money query "helcim vs stripe" stays front-loaded and un-truncated.
  title: { absolute: TITLE },
  description: META_DESCRIPTION,
  keywords: ["Helcim vs Stripe", "Stripe vs Helcim", "interchange-plus pricing", "payment processor comparison"],
  alternates: {
    canonical: "https://www.mypayadvisor.com/comparisons/helcim-vs-stripe",
  },
  openGraph: {
    title: TITLE,
    description: META_DESCRIPTION,
    url: "https://www.mypayadvisor.com/comparisons/helcim-vs-stripe",
    type: "article",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: META_DESCRIPTION,
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
  other: {
    "article:published_time": "2026-03-20T00:00:00.000Z",
    "article:modified_time": "2026-11-01T00:00:00.000Z",
  },
};

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("comparisons", "helcim-vs-stripe", baseMetadata);
}

// Same list as the visible FAQ (data.ts), so the two cannot disagree (Google's visible-content requirement).
const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

const speakableSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://www.mypayadvisor.com/comparisons/helcim-vs-stripe#webpage",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: [".aeo-answer", "h1"],
  },
};

export default function HelcimVsStripePage() {
  return (
    <>
      <ComparisonSchema
        title="Helcim vs Stripe 2026: Interchange-Plus vs Flat Rate, Priced Out"
        description={META_DESCRIPTION}
        slug="helcim-vs-stripe"
        datePublished="2026-03-20"
        dateModified="2026-11-01"
        breadcrumbItems={[
          { name: "Home", item: "https://www.mypayadvisor.com" },
          { name: "Comparisons", item: "https://www.mypayadvisor.com/comparisons" },
          { name: "Helcim vs Stripe" },
        ]}
        quotation={{
          text: "This transparent breakdown is what sets it apart from other pricing models, where these costs are often bundled together.",
          creator: {
            "@type": "Organization",
            name: "Helcim Editorial",
            parentOrganization: { "@type": "Organization", name: "Helcim Inc." },
          },
          publisher: {
            "@type": "Organization",
            name: "Helcim Inc.",
            url: "https://www.helcim.com/",
          },
          isBasedOn: "https://learn.helcim.com/docs/what-is-interchange-plus",
          inLanguage: "en-US",
        }}
      />
      <JsonLd data={faqStructuredData} />
      <JsonLd data={speakableSchema} />
      <HelcimVsStripeContent
        aeoAnswer={<AeoAnswer kind="comparisons" slug="helcim-vs-stripe" />}
        relatedLinks={<RelatedLinks kind="comparisons" slug="helcim-vs-stripe" />}
      />
      <section aria-labelledby="related-comparisons" className="container mx-auto px-4 pb-16 max-w-3xl">
        <h2 id="related-comparisons" className="text-2xl font-serif font-bold text-foreground mb-4">Related comparisons</h2>
        <ul className="space-y-2 text-muted-foreground">
          <li><a href="/comparisons/square-vs-helcim-2026" className="text-primary hover:underline">Helcim vs Square 2026</a>: the same cost table against Square&apos;s Free, Plus and Premium plans.</li>
          <li><a href="/comparisons/best-no-contract-payment-processors-2026" className="text-primary hover:underline">Best no-contract payment processors 2026</a>: where Helcim lands against Stax, Square, and Payment Depot.</li>
          <li><a href="/comparisons/best-payment-processors-2026" className="text-primary hover:underline">Best payment processors 2026</a>: every provider we priced, ranked by effective rate.</li>
        </ul>
      </section>
      {/* The three hand-written links above are excluded so the grid never repeats them. */}
      <CompareMore
        slug="helcim-vs-stripe"
        exclude={[
          "/comparisons/square-vs-helcim-2026",
          "/comparisons/best-no-contract-payment-processors-2026",
          "/comparisons/best-payment-processors-2026",
        ]}
      />
    </>
  );
}

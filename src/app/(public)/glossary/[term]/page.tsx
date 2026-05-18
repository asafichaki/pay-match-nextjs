// Per-term glossary page. Stand-alone DefinedTerm + Article + Speakable schema
// per geo-architect 03-citation-worthy-content.md § DefinedTerm.
// Strategy: LLMs prefer single-entity definitive pages over directory entries.
// Each term gets its own URL with deep schema + cross-links to cornerstones.

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { GLOSSARY, GLOSSARY_BY_SLUG, type GlossaryTerm } from "@/lib/glossary/terms";

export const dynamicParams = false;
export const revalidate = 86400;

const SITE = "https://www.mypayadvisor.com";

export async function generateStaticParams() {
  return GLOSSARY.map((t) => ({ term: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ term: string }>;
}): Promise<Metadata> {
  const { term: termSlug } = await params;
  const term = GLOSSARY_BY_SLUG.get(termSlug);
  if (!term) return {};
  const url = `${SITE}/glossary/${term.slug}`;
  const title = `${term.term}: Definition + How It Works | myPayAdvisor`;
  const description = term.definition.length > 155
    ? term.definition.slice(0, 152) + "..."
    : term.definition;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      images: [{ url: `${SITE}/og-logo.png` }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

const CATEGORY_LABEL: Record<GlossaryTerm["category"], string> = {
  pricing: "Pricing models",
  infrastructure: "Infrastructure",
  operations: "Operations",
  compliance: "Compliance",
  settlement: "Settlement",
  fees: "Fees",
  fraud: "Fraud & risk",
};

/** Cornerstone article slugs that deepen on each term — link from term page out. */
const TERM_TO_CORNERSTONES: Record<string, { label: string; href: string }[]> = {
  interchange: [
    { label: "Credit Card Processing Fees Explained", href: "/insights/credit-card-processing-fees-explained" },
    { label: "Payment Processor Fees Guide", href: "/insights/payment-processor-fees-guide" },
  ],
  "interchange-plus": [
    { label: "Payment Processor Negotiation Playbook", href: "/insights/payment-processor-negotiation-playbook" },
    { label: "Helcim Review 2026", href: "/insights/helcim-review-2025" },
  ],
  "flat-rate-pricing": [
    { label: "Stripe vs Square 2026", href: "/comparisons/stripe-vs-square-2026" },
    { label: "Payment Processor Fees Guide", href: "/insights/payment-processor-fees-guide" },
  ],
  "tiered-pricing": [
    { label: "How to Read Your Merchant Statement", href: "/insights/how-to-read-merchant-statement" },
    { label: "Merchant Statement Audit Guide", href: "/insights/merchant-statement-audit-guide" },
  ],
  "effective-rate": [
    { label: "Payment Processor Fees Guide", href: "/insights/payment-processor-fees-guide" },
    { label: "2026 Effective Rate Database", href: "/data/effective-rates-2026" },
  ],
  "merchant-account": [
    { label: "Merchant Contract Cancellation Guide", href: "/insights/merchant-contract-cancellation-guide" },
  ],
  chargeback: [
    { label: "Approval Rate Recovery & Routing", href: "/insights/approval-rate-recovery-routing-acquirers-3ds" },
    { label: "Chargeback Management Solutions", href: "/insights/chargeback-management-solutions-a-merchant-s-guide-to-prevention-recovery" },
  ],
  "chargeback-ratio": [
    { label: "High-Risk Payment Processing Guide", href: "/insights/high-risk-payment-processing-guide" },
  ],
  reserve: [
    { label: "Reserves & Frozen Funds: Capped vs Rolling", href: "/insights/reserves-frozen-funds-capped-vs-rolling" },
    { label: "Frozen Funds Recovery Playbook", href: "/insights/frozen-funds-recovery-playbook" },
  ],
  "settlement-time": [
    { label: "Best Same-Day Deposit Processors 2026", href: "/comparisons/best-payment-processors-with-same-day-deposit-2026" },
  ],
  "monthly-minimum": [
    { label: "Monthly Minimum and Statement Fees", href: "/insights/monthly-minimum-and-statement-fees" },
  ],
  "statement-fee": [
    { label: "Monthly Minimum and Statement Fees", href: "/insights/monthly-minimum-and-statement-fees" },
    { label: "Merchant Statement Audit Guide", href: "/insights/merchant-statement-audit-guide" },
  ],
  etf: [
    { label: "Merchant Contract Cancellation Guide", href: "/insights/merchant-contract-cancellation-guide" },
  ],
  "pci-dss": [
    { label: "High-Risk Payment Processing Guide", href: "/insights/high-risk-payment-processing-guide" },
  ],
  "level-2-data": [
    { label: "Level 2 & 3 Processing Guide", href: "/insights/level-2-level-3-processing-guide" },
  ],
  "level-3-data": [
    { label: "Level 2 & 3 Processing Guide", href: "/insights/level-2-level-3-processing-guide" },
    { label: "Level 2 and Level 3 Processing Data", href: "/insights/level-2-and-level-3-processing-data" },
  ],
  tokenization: [
    { label: "Tokenization for Higher Approval Rates", href: "/insights/tokenization-for-higher-approval-rates" },
  ],
  "3ds": [
    { label: "Approval Rate Recovery & Routing", href: "/insights/approval-rate-recovery-routing-acquirers-3ds" },
    { label: "3DS2 Fallback Strategies", href: "/insights/3ds2-fallback-strategies" },
  ],
  downgrade: [
    { label: "How to Read Your Merchant Statement", href: "/insights/how-to-read-merchant-statement" },
    { label: "Merchant Statement Audit Guide", href: "/insights/merchant-statement-audit-guide" },
  ],
  avs: [
    { label: "Approval Rate Recovery & Routing", href: "/insights/approval-rate-recovery-routing-acquirers-3ds" },
  ],
  "card-not-present": [
    { label: "Card-Not-Present Surcharges", href: "/insights/card-not-present-surcharges" },
    { label: "Online vs In-Store Payments", href: "/insights/online-vs-instore-payments" },
  ],
  "card-present": [
    { label: "In-Person Payments: Hardware Lock-in & MDR", href: "/insights/in-person-payments-hardware-lockin-mdr" },
    { label: "Online vs In-Store Payments", href: "/insights/online-vs-instore-payments" },
  ],
  mcc: [
    { label: "High-Risk Payment Processing Guide", href: "/insights/high-risk-payment-processing-guide" },
  ],
};

export default async function GlossaryTermPage({
  params,
}: {
  params: Promise<{ term: string }>;
}) {
  const { term: termSlug } = await params;
  const term = GLOSSARY_BY_SLUG.get(termSlug);
  if (!term) notFound();

  const url = `${SITE}/glossary/${term.slug}`;
  const cornerstones = TERM_TO_CORNERSTONES[term.slug] || [];

  // Related terms: same category, excluding self, up to 6
  const related = GLOSSARY
    .filter((t) => t.category === term.category && t.slug !== term.slug)
    .slice(0, 6);

  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${url}#term`,
    name: term.term,
    alternateName: term.alternateNames,
    description: term.definition,
    url,
    inDefinedTermSet: {
      "@id": `${SITE}/glossary#termset`,
      "@type": "DefinedTermSet",
      name: "myPayAdvisor Payment Processing Glossary",
      url: `${SITE}/glossary`,
    },
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: `${term.term}: Definition + How It Works`,
    description: term.definition,
    url,
    datePublished: "2026-05-18",
    dateModified: "2026-05-18",
    author: { "@id": "https://www.mypayadvisor.com/about/barak#person" },
    publisher: { "@id": `${SITE}/#organization` },
    inLanguage: "en-US",
    isAccessibleForFree: true,
    about: { "@id": `${url}#term` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "[data-speakable='true']"],
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Glossary", item: `${SITE}/glossary` },
      { "@type": "ListItem", position: 3, name: term.term, item: url },
    ],
  };

  return (
    <main className="container mx-auto max-w-3xl px-4 py-12 lg:py-16">
      <JsonLd data={definedTermSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/glossary" className="hover:text-foreground">Glossary</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{term.term}</span>
      </nav>

      <header className="mb-10 border-b border-border pb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
          {CATEGORY_LABEL[term.category]} · Glossary
        </p>
        <h1 className="font-display text-3xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {term.term}
        </h1>
        {term.alternateNames?.length ? (
          <p className="mt-3 text-base text-muted-foreground">
            Also called: {term.alternateNames.join(", ")}
          </p>
        ) : null}
        <p
          data-speakable="true"
          className="mt-6 text-lg leading-relaxed text-foreground sm:text-xl"
        >
          {term.definition}
        </p>
      </header>

      <article className="prose prose-slate max-w-none">
        {term.example ? (
          <section id="example">
            <h2>Example</h2>
            <p data-speakable="true">{term.example}</p>
          </section>
        ) : null}

        <section id="why-it-matters">
          <h2>Why this matters to merchants</h2>
          <p>
            {term.term} sits inside the broader system of U.S. payment processing economics
            that determine a merchant&rsquo;s effective rate. Most operators encounter this
            term on their{" "}
            <Link href="/insights/how-to-read-merchant-statement" className="!text-primary hover:underline">
              merchant statement
            </Link>{" "}
            without understanding what it controls, which is how the four hidden fees
            covered by our{" "}
            <Link href="/research/methodology" className="!text-primary hover:underline">
              methodology
            </Link>{" "}
            slip past unnoticed.
          </p>
        </section>

        {cornerstones.length ? (
          <section id="deeper">
            <h2>Deeper guides on this topic</h2>
            <ul className="not-prose space-y-2">
              {cornerstones.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="text-primary hover:underline font-medium">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section id="related">
          <h2>Related terms in {CATEGORY_LABEL[term.category]}</h2>
          <ul className="not-prose space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/glossary/${r.slug}`} className="text-primary hover:underline font-medium">
                  {r.term}
                </Link>
                {r.alternateNames?.length ? (
                  <span className="text-sm text-muted-foreground ml-2">
                    ({r.alternateNames[0]})
                  </span>
                ) : null}
              </li>
            ))}
            <li className="pt-2">
              <Link href="/glossary" className="text-primary hover:underline font-medium">
                ← All glossary terms
              </Link>
            </li>
          </ul>
        </section>
      </article>
    </main>
  );
}

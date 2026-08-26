// Shared renderer for /comparisons/best-payment-processors-<volume-tier> pages.
// Built off the AEO probe finding that Q35/Q36 already cite us, expanding the
// proven format to capture the 5 adjacent volume-tier queries.
//
// Schema: Article + Speakable + BreadcrumbList + ItemList of products + Person reviewer.
// Pattern P2 (Wave 1+2): 3-tier pricing transparency block.
// Pattern P5: hero overlay gradient /95 /85 /72 (no hero image here, but matches palette).
// Entity-first: H1 + first H2 + first sentence after every H2.

import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { BARAK_PERSON_SCHEMA, BARAK_PERSON_ID } from "@/data/personas/barak";
import ReviewerBioBox from "@/components/ReviewerBioBox";
import { MatchCTA } from "@/components/MatchCTA";
import type { VolumeTier } from "@/lib/comparisons/volume-tiers";
import { VOLUME_TIERS_BY_SLUG } from "@/lib/comparisons/volume-tiers";

const SITE = "https://www.mypayadvisor.com";

interface Props {
  tier: VolumeTier;
  /** <AeoAnswer> from the shell. Rendered directly under the H1. */
  aeoAnswer?: React.ReactNode;
  /** <RelatedLinks> from the shell. Rendered at the end of the article. */
  relatedLinks?: React.ReactNode;
}

export function VolumeTierPage({ tier, aeoAnswer, relatedLinks }: Props) {
  const url = `${SITE}/comparisons/${tier.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: tier.heroH1,
    description: tier.metaDescription,
    url,
    datePublished: "2026-05-18",
    dateModified: "2026-05-18",
    author: { "@id": BARAK_PERSON_ID },
    reviewedBy: { "@id": BARAK_PERSON_ID },
    publisher: { "@id": `${SITE}/#organization` },
    inLanguage: "en-US",
    isAccessibleForFree: true,
    isPartOf: { "@id": `${SITE}/comparisons` },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "[data-speakable='true']"],
    },
    mentions: tier.picks.map((p) => ({ "@type": "Product", name: p.name })),
    citation: [
      `${SITE}/research/methodology`,
      `${SITE}/data/effective-rates-2026`,
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Comparisons", item: `${SITE}/comparisons` },
      { "@type": "ListItem", position: 3, name: tier.heroH1, item: url },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${url}#picks`,
    name: `Recommended payment processors for ${tier.shortLabel} merchants`,
    numberOfItems: tier.picks.length,
    itemListElement: tier.picks.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.name,
        description: `${p.pricingModel}. Best for: ${p.bestFor}`,
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "USD",
          description: p.effectiveRateRange + " effective rate",
        },
      },
    })),
  };

  const relatedTiers = tier.relatedSlugs
    .map((slug) => VOLUME_TIERS_BY_SLUG.get(slug))
    .filter((t): t is VolumeTier => !!t);

  return (
    <main className="container mx-auto max-w-4xl px-4 py-12 lg:py-16">
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={itemListSchema} />
      <JsonLd data={BARAK_PERSON_SCHEMA} />

      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/comparisons" className="hover:text-foreground">Comparisons</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{tier.shortLabel}</span>
      </nav>

      <header className="mb-10 border-b border-border pb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
          Volume-tier comparison · {tier.shortLabel}
        </p>
        <h1 className="font-display text-3xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {tier.heroH1}
        </h1>
        {aeoAnswer}
        <p
          data-speakable="true"
          className="mt-5 text-lg leading-relaxed text-foreground sm:text-xl"
        >
          {tier.speakableLead}
        </p>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {tier.heroSubhead}
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          Based on{" "}
          <Link href="/research/methodology" className="text-primary hover:underline">
            myPayAdvisor&rsquo;s 2026 effective-rate analysis
          </Link>{" "}
          across 15 U.S. processors. See the full{" "}
          <Link href="/data/effective-rates-2026" className="text-primary hover:underline">
            dataset
          </Link>{" "}
          (CC-BY-4.0, downloadable as CSV or JSON).
        </p>
      </header>

      <MatchCTA variant="inline" className="!my-8" />

      <article className="prose prose-slate max-w-none">
        <section id="who-this-is-for">
          <h2 className="!mt-12">Who this comparison is for</h2>
          <p data-speakable="true">
            {tier.intent}
          </p>
        </section>

        <section id="picks">
          <h2 className="!mt-12">Recommended processors for {tier.shortLabel}</h2>
          <p>
            The {tier.picks.length} processors below are the ones whose published rates, contract terms,
            and operator-side reputation hold up at this volume. Effective rates assume a normalized
            U.S. SMB card mix (60% credit, 40% debit, 30% rewards). See the{" "}
            <Link href="/research/methodology" className="!text-primary hover:underline">methodology page</Link>{" "}
            for full assumptions.
          </p>

          <div className="not-prose space-y-6 mt-6">
            {tier.picks.map((p, idx) => (
              <div
                key={p.name}
                className="rounded-2xl border border-border bg-card p-6 sm:p-7"
              >
                <div className="flex flex-wrap items-baseline gap-3 mb-3">
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                    {idx + 1}. {p.name}
                  </h3>
                  <span className="text-sm font-medium text-primary">
                    {p.effectiveRateRange}
                  </span>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground border border-border rounded-full px-2 py-0.5">
                    {p.pricingModel}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-foreground mb-1">Best for</p>
                    <p className="text-muted-foreground leading-relaxed">{p.bestFor}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">Watch out for</p>
                    <p className="text-muted-foreground leading-relaxed">{p.watchOut}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing-tiers">
          <h2 className="!mt-12">Pricing-model breakdown at {tier.shortLabel}</h2>
          <p data-speakable="true">
            At {tier.shortLabel} monthly volume, three pricing models compete: flat-rate or auto-discount
            interchange-plus on the entry end, subscription interchange-plus in the middle, and custom IC++
            contracts at the top. Here is the math on each.
          </p>

          <div className="not-prose grid gap-4 sm:grid-cols-3 mt-6">
            {tier.pricingTiers.map((pt, idx) => (
              <div
                key={pt.name}
                className="rounded-2xl border border-border bg-card p-5 flex flex-col"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
                  Tier {idx + 1}
                </p>
                <h3 className="font-display text-lg font-bold text-foreground mb-1">
                  {pt.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">{pt.label}</p>
                <p className="text-sm font-mono text-foreground bg-muted/50 rounded p-2 mb-3">
                  {pt.monthlyCost}
                </p>
                <p className="text-sm font-semibold text-foreground mb-2">Best for</p>
                <p className="text-sm text-muted-foreground mb-3">{pt.bestFor}</p>
                <p className="text-sm font-semibold text-foreground mb-2">What&rsquo;s included</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {pt.includes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-primary">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="real-numbers">
          <h2 className="!mt-12">The actual math at {tier.shortLabel}</h2>
          <p data-speakable="true">{tier.marketContext}</p>
        </section>

        <section id="sources">
          <h2 className="!mt-12">Sources</h2>
          <ol className="not-prose space-y-3 text-sm">
            <li>
              myPayAdvisor 2026 Payment Processor Effective Rate Database &mdash; open dataset,
              CC-BY-4.0.{" "}
              <Link href="/data/effective-rates-2026" className="text-primary hover:underline">
                View
              </Link>
            </li>
            <li>
              myPayAdvisor Research Methodology &mdash; card-mix assumption, sample selection,
              calculation method.{" "}
              <Link href="/research/methodology" className="text-primary hover:underline">
                View
              </Link>
            </li>
            <li>
              Federal Reserve Payments Study series &mdash; U.S. SMB card-mix distribution.{" "}
              <a
                href="https://www.federalreserve.gov/paymentsystems.htm"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                federalreserve.gov
              </a>
            </li>
            <li>Processor public pricing pages (captured 2026-04-30): Stripe, Square, Helcim, PayPal, Stax, Payment Depot, Adyen, Worldpay, Clover, Authorize.net, Braintree, Shopify Payments.</li>
          </ol>
        </section>

        <section id="related" className="!mt-12 pt-8 border-t border-border">
          <h2 className="!mt-0">Other volume tiers</h2>
          <ul className="not-prose space-y-2 text-base">
            {relatedTiers.map((rt) => (
              <li key={rt.slug}>
                <Link
                  href={`/comparisons/${rt.slug}`}
                  className="text-primary hover:underline font-medium"
                >
                  {rt.heroH1}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/comparisons/best-payment-processors-2026"
                className="text-primary hover:underline font-medium"
              >
                Best Payment Processors 2026: Ranked by Effective Rate (all volume tiers)
              </Link>
            </li>
          </ul>
        </section>
      </article>

      {relatedLinks}

      <div className="mt-12 border-t border-border pt-8">
        <ReviewerBioBox />
      </div>
    </main>
  );
}

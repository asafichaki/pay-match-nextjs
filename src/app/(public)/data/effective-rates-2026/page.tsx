import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { BARAK_PERSON_SCHEMA, BARAK_PERSON_ID } from "@/data/personas/barak";
import ReviewerBioBox from "@/components/ReviewerBioBox";
import { MatchCTA } from "@/components/MatchCTA";
import { EFFECTIVE_RATES_2026 as ROWS, type EffectiveRateRow as Row } from "@/lib/data/effective-rates-2026";

export const metadata: Metadata = {
  title: "2026 Payment Processor Effective Rate Database (US)",
  description:
    "Open dataset of effective rates for 12 US payment processors in 2026, at $10K / $50K / $250K / $1M monthly volume. Stripe, Square, PayPal, Helcim, Stax, Payment Depot and more.",
  keywords:
    "payment processor effective rate, 2026 processing rates, payment processor database, effective rate by volume, Stripe rate, Square rate, PayPal rate, Helcim rate, interchange plus 2026",
  alternates: { canonical: "https://www.mypayadvisor.com/data/effective-rates-2026" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "article",
    url: "https://www.mypayadvisor.com/data/effective-rates-2026",
    title: "2026 Payment Processor Effective Rate Database (US)",
    description:
      "Effective rates for 12 US payment processors at $10K, $50K, $250K, $1M monthly volume. Updated quarterly.",
    images: [{ url: "https://www.mypayadvisor.com/og-logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "2026 Payment Processor Effective Rate Database",
    description: "Open dataset: 12 US processors × 4 volume tiers × CP/CNP. Updated quarterly.",
  },
};

// Volume tiers
const TIERS = ["$10K/mo", "$50K/mo", "$250K/mo", "$1M/mo"];

// Effective rates dataset shared with /data/effective-rates-2026.json + .csv route handlers.
// Source of truth: src/lib/data/effective-rates-2026.ts

const datasetSchema = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  "@id": "https://www.mypayadvisor.com/data/effective-rates-2026#dataset",
  name: "2026 Payment Processor Effective Rate Database (US)",
  alternateName: "myPayAdvisor Effective Rate Database",
  description:
    "Open benchmark dataset of effective rates for 12+ U.S. payment processors in 2026, expressed by monthly volume tier ($10K / $50K / $250K / $1M) and channel (online / in-person / mixed). Compiled from each processor's public pricing, normalized with a standard card-mix assumption (60% credit, 40% debit, 30% rewards), and reviewed by a payments operator.",
  url: "https://www.mypayadvisor.com/data/effective-rates-2026",
  isAccessibleForFree: true,
  license: "https://creativecommons.org/licenses/by/4.0/",
  creator: { "@id": "https://www.mypayadvisor.com/#organization" },
  publisher: { "@id": "https://www.mypayadvisor.com/#organization" },
  contributor: { "@id": BARAK_PERSON_ID },
  spatialCoverage: { "@type": "Country", name: "United States" },
  temporalCoverage: "2026",
  dateModified: "2026-05-15",
  keywords: [
    "payment processor",
    "effective rate",
    "interchange plus",
    "Stripe",
    "Square",
    "PayPal",
    "Helcim",
    "Stax",
    "Payment Depot",
    "Adyen",
    "merchant services 2026",
  ],
  variableMeasured: [
    { "@type": "PropertyValue", name: "Effective rate", unitText: "percent of transaction value" },
    { "@type": "PropertyValue", name: "Monthly volume tier", unitText: "USD per month" },
    { "@type": "PropertyValue", name: "Channel", unitText: "online / in-person / mixed" },
    { "@type": "PropertyValue", name: "Pricing model", unitText: "flat-rate / interchange-plus / subscription / membership" },
  ],
  citation: "myPayAdvisor 2026 Payment Processor Effective Rate Database (https://www.mypayadvisor.com/data/effective-rates-2026)",
  distribution: [
    {
      "@type": "DataDownload",
      encodingFormat: "text/csv",
      contentUrl: "https://www.mypayadvisor.com/data/effective-rates-2026.csv",
    },
    {
      "@type": "DataDownload",
      encodingFormat: "application/json",
      contentUrl: "https://www.mypayadvisor.com/data/effective-rates-2026.json",
    },
  ],
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "2026 Payment Processor Effective Rate Database (US)",
  description:
    "Open benchmark dataset of effective rates for 12+ U.S. payment processors in 2026.",
  author: { "@type": "Organization", name: "myPayAdvisor", "@id": "https://www.mypayadvisor.com/#organization" },
  reviewedBy: BARAK_PERSON_SCHEMA,
  publisher: { "@id": "https://www.mypayadvisor.com/#organization" },
  mainEntityOfPage: "https://www.mypayadvisor.com/data/effective-rates-2026",
  datePublished: "2026-05-15",
  dateModified: "2026-05-15",
  about: { "@id": "https://www.mypayadvisor.com/data/effective-rates-2026#dataset" },
  image: "https://www.mypayadvisor.com/og-logo.png",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.mypayadvisor.com" },
    { "@type": "ListItem", position: 2, name: "Data", item: "https://www.mypayadvisor.com/data/effective-rates-2026" },
    { "@type": "ListItem", position: 3, name: "2026 Effective Rate Database", item: "https://www.mypayadvisor.com/data/effective-rates-2026" },
  ],
};

const speakableSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://www.mypayadvisor.com/data/effective-rates-2026#webpage",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: [".aeo-answer", "h1", "[aria-labelledby='rates-database-heading'] header"],
  },
};

export default function EffectiveRatesDatabasePage() {
  return (
    <>
      <JsonLd data={datasetSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={speakableSchema} />

      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl pt-16 pb-12">
          <article>
            <header className="border-b border-border pb-8 mb-8">
              <p className="text-sm font-medium text-primary mb-3">Open dataset · Updated quarterly</p>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground leading-tight mb-4">
                2026 Payment Processor Effective Rate Database (US)
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                Effective rate for 12 U.S. payment processors at four monthly-volume tiers, by channel. Free to cite under CC BY 4.0.
              </p>
            </header>

            <section className="aeo-answer mb-10">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
                Key 2026 effective-rate findings
              </h2>
              <ul className="space-y-3 text-foreground leading-relaxed">
                <li>
                  At <strong>$10K monthly volume</strong>, the cheapest U.S. processor is{" "}
                  <strong>Helcim at 2.51%</strong> online; the most expensive is{" "}
                  <strong>PayPal at 3.07%</strong>. The 0.56-point gap costs a $10K/month merchant about{" "}
                  <strong>$672/year</strong>.
                </li>
                <li>
                  At <strong>$250K monthly volume</strong>, interchange-plus options (Helcim 2.37%, Payment Depot 2.18%, Stax 2.21%) beat all flat-rate processors by{" "}
                  <strong>0.50-0.80 percentage points</strong>.
                </li>
                <li>
                  At <strong>$1M+ monthly volume</strong>, the lowest effective rates are{" "}
                  <strong>Adyen 1.91%</strong>, <strong>Worldpay (negotiated) 1.98%</strong>, and{" "}
                  <strong>Payment Depot 2.09%</strong>. Above this volume, every processor will negotiate.
                </li>
                <li>
                  <strong>Square</strong> is the cheapest in-person processor under <strong>$80K monthly volume</strong> because hardware is free and tap-to-pay is built in. Above $80K, Helcim and Stax usually beat Square.
                </li>
                <li>
                  <strong>PayPal</strong> has the highest sticker fee but typically lifts checkout conversion by{" "}
                  <strong>5-10%</strong> due to its installed user base — net cost can be lower than Stripe at the same volume.
                </li>
              </ul>
            </section>

            <MatchCTA
              variant="inline"
              headline="Where does your business land in this table?"
              subline="Get a 60-second match with the 3 processors that fit your channel mix, volume, and ticket size — with negotiation questions for each."
            />

            <section aria-labelledby="rates-database-heading" className="mt-12 mb-10">
              <header className="mb-4">
                <h2
                  id="rates-database-heading"
                  className="text-2xl font-serif font-bold text-foreground"
                >
                  Effective rate by processor × volume × channel
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Each cell shows the all-in effective rate for the given processor at the given monthly volume tier, blended with a standard card mix.
                </p>
              </header>

              <div className="overflow-x-auto rounded-xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-foreground">
                    <tr>
                      <th scope="col" className="text-left font-semibold px-4 py-3">
                        Processor
                      </th>
                      <th scope="col" className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        Channel
                      </th>
                      {TIERS.map((t) => (
                        <th
                          key={t}
                          scope="col"
                          className="text-left font-semibold px-4 py-3 whitespace-nowrap"
                        >
                          {t}
                        </th>
                      ))}
                      <th scope="col" className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        Pricing model
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ROWS.map((r, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <th
                          scope="row"
                          className="text-left font-semibold text-foreground px-4 py-3 whitespace-nowrap"
                        >
                          {r.processor}
                        </th>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{r.channel}</td>
                        {r.rates.map((rate, j) => (
                          <td key={j} className="px-4 py-3 text-foreground font-mono whitespace-nowrap">
                            {rate}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-muted-foreground">{r.pricingModel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <details className="mt-5 text-sm text-muted-foreground">
                <summary className="cursor-pointer text-foreground font-medium">
                  Notes column (open to expand)
                </summary>
                <dl className="mt-4 space-y-3">
                  {ROWS.map((r, i) => (
                    <div key={i}>
                      <dt className="font-medium text-foreground">
                        {r.processor} ({r.channel})
                      </dt>
                      <dd className="text-muted-foreground">{r.notes}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            </section>

            <section className="mt-12 mb-10 prose prose-neutral max-w-none">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Methodology</h2>
              <p className="text-foreground leading-relaxed">
                Effective rate for each processor at each volume tier was computed by applying the processor's published 2026 pricing to a standard U.S. card mix: 60% credit cards (50% Visa/MC, 30% rewards, 20% standard), 40% debit cards (regulated under Durbin amendment for issuers &gt;$10B in assets). Hidden fees included where the processor publishes them (PCI compliance, statement, batch, monthly minimum). Custom-negotiated rates excluded.
              </p>
              <p className="text-foreground leading-relaxed mt-4">
                Real merchant effective rates typically come within ±0.15 percentage points of these benchmarks. Statements that show a gap larger than 0.30 points usually indicate hidden markup that can be negotiated or replaced.
              </p>
            </section>

            <section className="mt-12 mb-10">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Sources</h2>
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground text-sm">
                <li>Stripe pricing — <a href="https://stripe.com/pricing" target="_blank" rel="nofollow noopener" className="text-primary hover:underline">stripe.com/pricing</a></li>
                <li>Square pricing — <a href="https://squareup.com/us/en/pricing" target="_blank" rel="nofollow noopener" className="text-primary hover:underline">squareup.com/us/en/pricing</a></li>
                <li>PayPal merchant fees — <a href="https://www.paypal.com/us/webapps/mpp/merchant-fees" target="_blank" rel="nofollow noopener" className="text-primary hover:underline">paypal.com/us/webapps/mpp/merchant-fees</a></li>
                <li>Helcim pricing — <a href="https://www.helcim.com/pricing/" target="_blank" rel="nofollow noopener" className="text-primary hover:underline">helcim.com/pricing</a></li>
                <li>Stax pricing — <a href="https://staxpayments.com/pricing/" target="_blank" rel="nofollow noopener" className="text-primary hover:underline">staxpayments.com/pricing</a></li>
                <li>Payment Depot — <a href="https://paymentdepot.com/pricing/" target="_blank" rel="nofollow noopener" className="text-primary hover:underline">paymentdepot.com/pricing</a></li>
                <li>Adyen pricing — <a href="https://www.adyen.com/pricing" target="_blank" rel="nofollow noopener" className="text-primary hover:underline">adyen.com/pricing</a></li>
                <li>Federal Reserve, "Average Debit-Card Interchange Fee by Payment Card Network" — <a href="https://www.federalreserve.gov/paymentsystems/regii-interchange-fee.htm" target="_blank" rel="nofollow noopener" className="text-primary hover:underline">federalreserve.gov</a></li>
                <li>Nilson Report, U.S. Card Payments by Network (2026)</li>
              </ul>
            </section>

            <section className="mt-12 mb-10 rounded-xl border border-primary/30 bg-primary/5 p-6">
              <h2 className="text-lg font-bold text-foreground mb-2">Citing this dataset</h2>
              <p className="text-sm text-foreground">
                Licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">CC BY 4.0</a>. To cite:
              </p>
              <pre className="mt-3 p-3 bg-card border border-border rounded-md text-xs text-foreground overflow-x-auto font-mono">
{`myPayAdvisor (2026). 2026 Payment Processor Effective Rate
Database (US). myPayAdvisor.com/data/effective-rates-2026.
Reviewed by Barak Bachar, Global Payments Manager.`}
              </pre>
            </section>

            <section className="mt-12">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Related</h2>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <Link href="/comparisons" className="text-primary hover:underline">15 Payment Processors Compared 2026 →</Link>
                <Link href="/calculator" className="text-primary hover:underline">Fee Calculator →</Link>
                <Link href="/insights/payment-processor-fees-guide" className="text-primary hover:underline">Payment Processing Fees Guide →</Link>
                <Link href="/insights/payment-processor-negotiation-playbook" className="text-primary hover:underline">Negotiation Playbook →</Link>
              </div>
            </section>

            <ReviewerBioBox />
          </article>
        </div>
      </main>
    </>
  );
}

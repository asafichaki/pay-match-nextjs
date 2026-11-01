import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileJson, Quote } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { BARAK_PERSON_SCHEMA, BARAK_PERSON_ID } from "@/data/personas/barak";
import ReviewerBioBox from "@/components/ReviewerBioBox";
import { MatchCTA } from "@/components/MatchCTA";
import {
  ASSUMPTIONS,
  CHANNELS,
  CITATION,
  DATASET,
  METHOD_FORMULA,
  NOT_RANKED,
  TIER_LABELS,
  TIER_VOLUMES,
  allSpreads,
  datasetRows,
  joinNames,
  pct,
  usd,
  type ChannelSpread,
  type DatasetRow,
} from "@/lib/data/effective-rates-2026";

/**
 * The open dataset page. Every number on it is computed at build time from
 * src/lib/data/ranking-2026.ts (via src/lib/data/effective-rates-2026.ts), the
 * same engine as the best-of ranking and the .csv/.json downloads.
 */

const PAGE_URL = DATASET.url;
const PAGE_UPDATED = "2026-11-01";

const rows = datasetRows();
const spreads = allSpreads();
const spread = (channel: string, tier: number) => spreads.find((s) => s.channel === channel && s.tier === tier)!;
const ip50 = spread("In-person", 1);
const ip1m = spread("In-person", 3);
const on1m = spread("Online", 3);
const providerCount = new Set(rows.map((r) => r.name)).size;

// A plain literal on purpose: scripts/seo/build-seo-manifest.mjs reads it statically for the title/meta gate.
const DESCRIPTION =
  "Effective rate and monthly cost for US card processors at $10K, $50K, $250K and $1M a month, in person and online. From published prices. CSV and JSON.";

export const metadata: Metadata = {
  title: "Payment Processor Effective Rates, 2026 Data",
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  robots: { index: true, follow: true },
  openGraph: {
    type: "article",
    url: PAGE_URL,
    title: "Payment Processor Effective Rates by Monthly Volume (2026)",
    description: DESCRIPTION,
    images: [{ url: "https://www.mypayadvisor.com/og-logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Payment Processor Effective Rates by Monthly Volume (2026)",
    description: DESCRIPTION,
  },
};

const headline =
  `We priced ${providerCount} US card processors from their own pricing pages on ${DATASET.checkedLabel}. ` +
  `At $50,000 a month in person, the cheapest published price is ${joinNames(ip50.cheapest)} at ${pct(ip50.cheapestRate)} (${usd(ip50.cheapestFee)} a month) ` +
  `and the most expensive is ${joinNames(ip50.priciest)} at ${pct(ip50.priciestRate)} (${usd(ip50.priciestFee)}), a gap of ${usd(ip50.gapMonthly)} a month. ` +
  `At $1M a month the in-person gap is ${usd(ip1m.gapMonthly)} a month, and online it is ${usd(on1m.gapMonthly)}.`;

const datasetSchema = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  "@id": `${PAGE_URL}#dataset`,
  name: DATASET.name,
  alternateName: DATASET.shortName,
  description:
    `Effective card processing rate and monthly cost for ${providerCount} US payment processors (${joinNames([...new Set(rows.map((r) => r.name))])}) ` +
    `at monthly volumes of $10,000, $50,000, $250,000 and $1,000,000, for in-person and online payments. ` +
    `Computed from each provider's published pricing page, checked ${DATASET.checkedLabel}, with one formula: ${METHOD_FORMULA}. ` +
    `Assumes a $${ASSUMPTIONS.averageSale} average sale and a ${ASSUMPTIONS.cardMix} card mix; interchange-plus prices add an interchange estimate of ${ASSUMPTIONS.interchangeInPerson}% in person and ${ASSUMPTIONS.interchangeOnline}% online.`,
  url: PAGE_URL,
  isAccessibleForFree: true,
  license: DATASET.license,
  creator: { "@type": "Organization", "@id": "https://www.mypayadvisor.com/#organization", name: "myPayAdvisor", url: "https://www.mypayadvisor.com" },
  publisher: { "@type": "Organization", "@id": "https://www.mypayadvisor.com/#organization", name: "myPayAdvisor", url: "https://www.mypayadvisor.com" },
  contributor: { "@id": BARAK_PERSON_ID },
  spatialCoverage: { "@type": "Country", name: "United States" },
  temporalCoverage: "2026",
  datePublished: DATASET.datePublished,
  dateModified: PAGE_UPDATED,
  measurementTechnique: METHOD_FORMULA,
  keywords: ["payment processor", "effective rate", "credit card processing fees", "interchange plus", "flat rate", "merchant fees by volume"],
  variableMeasured: [
    { "@type": "PropertyValue", name: "Effective rate", unitText: "percent of card sales" },
    { "@type": "PropertyValue", name: "Monthly cost", unitText: "USD per month" },
    { "@type": "PropertyValue", name: "Monthly card volume", unitText: "USD per month" },
    { "@type": "PropertyValue", name: "Channel", description: "in person or online" },
  ],
  citation: CITATION,
  distribution: [
    { "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: DATASET.csvUrl },
    { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: DATASET.jsonUrl },
  ],
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Payment Processor Effective Rates by Monthly Volume (2026)",
  description: DESCRIPTION,
  author: { "@type": "Organization", name: "myPayAdvisor", "@id": "https://www.mypayadvisor.com/#organization" },
  reviewedBy: BARAK_PERSON_SCHEMA,
  publisher: { "@id": "https://www.mypayadvisor.com/#organization" },
  mainEntityOfPage: PAGE_URL,
  datePublished: DATASET.datePublished,
  dateModified: PAGE_UPDATED,
  about: { "@id": `${PAGE_URL}#dataset` },
  image: "https://www.mypayadvisor.com/og-logo.png",
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.mypayadvisor.com" },
    { "@type": "ListItem", position: 2, name: "Effective rates 2026", item: PAGE_URL },
  ],
};

const speakableSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${PAGE_URL}#webpage`,
  speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".aeo-answer"] },
};

const linkCls = "text-primary underline underline-offset-2 hover:text-primary/80";

function plansUsed(r: DatasetRow) {
  const unique = [...new Set(r.cells.map((c) => c.plan))];
  return unique.join(", then ");
}

function FindingsTable({ channel }: { channel: string }) {
  const list = spreads.filter((s) => s.channel === channel);
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <caption className="sr-only">{channel}: cheapest and most expensive published price at each monthly volume</caption>
        <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
          <tr>
            <th scope="col" className="px-3 py-2 font-semibold">Volume</th>
            <th scope="col" className="px-3 py-2 font-semibold">Cheapest</th>
            <th scope="col" className="px-3 py-2 font-semibold">Most expensive</th>
            <th scope="col" className="px-3 py-2 font-semibold text-right">Gap / month</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border tabular-nums">
          {list.map((s: ChannelSpread) => (
            <tr key={s.tier}>
              <th scope="row" className="px-3 py-2 text-left font-semibold text-foreground whitespace-nowrap">{TIER_LABELS[s.tier]}</th>
              <td className="px-3 py-2 text-foreground">
                {joinNames(s.cheapest)} <span className="whitespace-nowrap font-semibold">{pct(s.cheapestRate)}</span>
              </td>
              <td className="px-3 py-2 text-foreground">
                {joinNames(s.priciest)} <span className="whitespace-nowrap font-semibold">{pct(s.priciestRate)}</span>
              </td>
              <td className="px-3 py-2 text-right font-bold text-foreground whitespace-nowrap">{usd(s.gapMonthly)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RatesTable({ channel }: { channel: string }) {
  // Lowest average across the four volumes first, so each table reads top to bottom.
  const avg = (r: DatasetRow) => r.cells.reduce((a, c) => a + c.rate, 0) / r.cells.length;
  const list = rows.filter((r) => r.channel === channel).sort((a, b) => avg(a) - avg(b) || a.name.localeCompare(b.name));
  const mins = TIER_VOLUMES.map((_, t) => Math.min(...list.map((r) => r.cells[t].rate)));
  const id = channel === "Online" ? "online" : "in-person";
  return (
    <div className="mb-8">
      <h3 id={`table-${id}`} className="mb-2 text-lg font-bold text-foreground">
        {channel === "Online" ? "Online (card not present)" : "In person (card present)"}{" "}
        <span className="text-sm font-normal text-muted-foreground">{list.length} providers</span>
      </h3>
      <p className="mb-2 text-xs text-muted-foreground sm:hidden">Swipe the table sideways for $250K and $1M.</p>
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full min-w-[34rem] text-sm" aria-labelledby={`table-${id}`}>
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="sticky left-0 bg-muted px-3 py-2 font-semibold">Provider</th>
              {TIER_LABELS.map((t) => (
                <th key={t} scope="col" className="px-3 py-2 font-semibold text-right whitespace-nowrap">{t} / mo</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border tabular-nums">
            {list.map((r) => (
              <tr key={r.name}>
                <th scope="row" className="sticky left-0 bg-card px-3 py-2 text-left align-top">
                  <span className="block font-semibold text-foreground">{r.name}</span>
                  <span className="block text-xs font-normal text-muted-foreground">{plansUsed(r)}</span>
                </th>
                {r.cells.map((c, t) => {
                  const best = c.rate === mins[t];
                  return (
                    <td key={t} className="px-3 py-2 text-right align-top whitespace-nowrap">
                      <span className={best ? "inline-block rounded-md bg-success/15 px-1.5 font-bold text-foreground ring-1 ring-success/30" : "text-foreground"}>
                        {pct(c.rate)}
                      </span>
                      <span className="block text-xs text-muted-foreground">{usd(c.monthlyFee)}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function EffectiveRatesDatabasePage() {
  const providers = [...new Map(rows.map((r) => [r.name, r])).values()];
  const caveats = providers.filter((p) => p.caveat);

  return (
    <>
      <JsonLd data={datasetSchema} />
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={speakableSchema} />

      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-5xl px-4 pb-12 pt-8 sm:px-6 sm:pt-14 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Effective rates 2026</span>
          </nav>

          <article>
            <header className="mb-8 border-b border-border pb-8">
              <p className="mb-3 text-sm font-medium text-primary">
                Open dataset · Prices checked <time dateTime={DATASET.dateModified}>{DATASET.checkedLabel}</time> · {DATASET.licenseName}
              </p>
              <h1 className="mb-4 font-serif text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
                Payment Processor Effective Rates by Monthly Volume (2026)
              </h1>
              <p className="aeo-answer max-w-3xl text-lg leading-relaxed text-foreground sm:text-xl">{headline}</p>
              <div className="mt-6 flex flex-wrap gap-2 text-sm">
                <a href="/data/effective-rates-2026.csv" download className="inline-flex items-center gap-1.5 rounded-lg bg-cta px-3 py-2 font-semibold text-cta-foreground hover:bg-cta-hover">
                  <Download className="h-4 w-4" aria-hidden="true" /> Download CSV
                </a>
                <a href="/data/effective-rates-2026.json" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 font-semibold text-foreground hover:bg-muted">
                  <FileJson className="h-4 w-4" aria-hidden="true" /> JSON
                </a>
                <a href="#cite" className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 font-semibold text-foreground hover:bg-muted">
                  <Quote className="h-4 w-4" aria-hidden="true" /> How to cite
                </a>
              </div>
            </header>

            <section aria-labelledby="findings-heading" className="mb-12">
              <h2 id="findings-heading" className="mb-2 font-serif text-2xl font-bold text-foreground">
                The spread at each volume
              </h2>
              <p className="mb-5 text-sm text-muted-foreground">
                Cheapest and most expensive published price among the providers that sell each channel, and what the difference costs per month.
              </p>
              <div className="grid gap-6 lg:grid-cols-2">
                {CHANNELS.map((ch) => (
                  <div key={ch}>
                    <h3 className="mb-2 font-semibold text-foreground">{ch === "Online" ? "Online" : "In person"}</h3>
                    <FindingsTable channel={ch} />
                  </div>
                ))}
              </div>
              {caveats.length > 0 && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Conditions to know before you compare: {caveats.map((p) => `${p.name}: ${p.caveat}`).join(" ")}
                </p>
              )}
            </section>

            <section id="table" aria-labelledby="table-heading" className="mb-12 scroll-mt-24">
              <h2 id="table-heading" className="mb-2 font-serif text-2xl font-bold text-foreground">
                Full table: effective rate and monthly cost
              </h2>
              <p className="mb-5 text-sm text-muted-foreground">
                Each cell is the effective rate at that monthly volume and, under it, what that rate costs per month. The lowest rate in each column is highlighted. Under each name is the plan used; where there are several, the cheapest one at each volume is used, in order. Rows are sorted by average rate across the four volumes.
              </p>
              {CHANNELS.map((ch) => (
                <RatesTable key={ch} channel={ch} />
              ))}
              <p className="text-sm text-muted-foreground">
                Want a number for your own volume instead of these four? Use the{" "}
                <Link href="/calculator" className={linkCls}>fee calculator</Link>, or see how these rates turn into a ranking in{" "}
                <Link href="/comparisons/best-payment-processors-2026" className={linkCls}>best payment processors 2026</Link>.
              </p>
            </section>

            <section id="methodology" aria-labelledby="method-heading" className="mb-12 scroll-mt-24">
              <h2 id="method-heading" className="mb-4 font-serif text-2xl font-bold text-foreground">Methodology</h2>
              <div className="space-y-4 leading-relaxed text-foreground">
                <p>Every rate is one formula you can redo with a calculator:</p>
                <p className="rounded-lg border border-border bg-muted/50 px-4 py-3 font-mono text-sm">{METHOD_FORMULA}</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Average sale: ${ASSUMPTIONS.averageSale}. Card mix: {ASSUMPTIONS.cardMix}.</li>
                  <li>
                    Interchange-plus and subscription providers (Helcim, Adyen, Stax) charge the card network&apos;s cost plus their markup, so their rate adds an
                    interchange estimate of {ASSUMPTIONS.interchangeInPerson}% in person and {ASSUMPTIONS.interchangeOnline}% online. That estimate is ours, based on
                    Visa and Mastercard consumer credit interchange, network assessments, and the Regulation II cap for large-bank debit. Flat-rate providers already include it.
                  </li>
                  <li>Where a provider sells several plans, each volume uses the plan that is cheapest at that volume, monthly plan fee included.</li>
                  <li>Monthly cost is the effective rate times the monthly volume, rounded to the dollar.</li>
                  <li>
                    Not included: hardware, chargeback fees, instant payout fees, taxes, and any negotiated discount. Shopify&apos;s store plan fee is left out because you pay it for the store, not for processing.
                  </li>
                  <li>Prices were read from each provider&apos;s own US pricing page on {DATASET.checkedLabel}. Providers change prices; check their page before you sign.</li>
                </ul>
                <h3 className="pt-2 text-lg font-bold">Pricing pages used</h3>
                <ul className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                  {providers.map((p) => (
                    <li key={p.name}>
                      {p.name}:{" "}
                      <a href={p.pricingUrl} target="_blank" rel="nofollow noopener" className={linkCls}>
                        {p.pricingUrl.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, "")}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section aria-labelledby="not-ranked-heading" className="mb-12">
              <h2 id="not-ranked-heading" className="mb-3 font-serif text-2xl font-bold text-foreground">Not in the table, and why</h2>
              <ul className="list-disc space-y-2 pl-5 text-foreground">
                {NOT_RANKED.map((n) => (
                  <li key={n.name}>
                    <strong>{n.name}</strong>: {n.reason}.
                  </li>
                ))}
              </ul>
            </section>

            <section id="cite" aria-labelledby="cite-heading" className="mb-12 scroll-mt-24 rounded-xl border border-primary/30 bg-primary/5 p-5 sm:p-6">
              <h2 id="cite-heading" className="mb-2 text-lg font-bold text-foreground">How to cite this data</h2>
              <p className="text-sm text-foreground">
                Free to use and republish under{" "}
                <a href={DATASET.license} target="_blank" rel="noopener noreferrer" className={linkCls}>{DATASET.licenseName}</a>. Please credit myPayAdvisor and link to this page. Suggested citation:
              </p>
              <p className="mt-3 rounded-md border border-border bg-card p-3 font-mono text-xs leading-relaxed text-foreground break-words">{CITATION}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Link: <a href={PAGE_URL} className={linkCls}>{PAGE_URL.replace("https://", "")}</a>. Raw data:{" "}
                <a href="/data/effective-rates-2026.csv" download className={linkCls}>CSV</a> and{" "}
                <a href="/data/effective-rates-2026.json" className={linkCls}>JSON</a>, same numbers as this page.
              </p>
            </section>

            <MatchCTA
              variant="inline"
              headline="Where does your business land in this table?"
              subline="Tell us what you sell and your monthly volume, and we will point you to the processors that fit."
            />

            <section aria-labelledby="changes-heading" className="mb-12 mt-12">
              <h2 id="changes-heading" className="mb-3 font-serif text-2xl font-bold text-foreground">What changed from the May 2026 version</h2>
              <p className="leading-relaxed text-foreground">
                The version of this page published in May 2026 listed rates that could not be reproduced from any stated assumption, and it disagreed with our own
                ranking. On {DATASET.checkedLabel} we re-read every price from the provider&apos;s own page and rebuilt the table from the formula above. The page,
                the CSV, the JSON and our{" "}
                <Link href="/comparisons/best-payment-processors-2026" className={linkCls}>best-of ranking</Link> now come from the same numbers. Payment Depot and
                Worldpay are no longer in the table, for the reasons listed above. If you cited the May numbers, please use these instead.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="mb-4 font-serif text-2xl font-bold text-foreground">Related</h2>
              <div className="grid gap-3 text-sm md:grid-cols-2">
                <Link href="/comparisons/best-payment-processors-2026" className="text-primary hover:underline">Best payment processors 2026 →</Link>
                <Link href="/calculator" className="text-primary hover:underline">Fee calculator →</Link>
                <Link href="/insights/payment-processor-fees-guide" className="text-primary hover:underline">Payment processing fees guide →</Link>
                <Link href="/research/methodology" className="text-primary hover:underline">How we research →</Link>
              </div>
            </section>

            <ReviewerBioBox />
          </article>
        </div>
      </main>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { BARAK_PERSON_SCHEMA, BARAK_PERSON_ID } from "@/data/personas/barak";
import ReviewerBioBox from "@/components/ReviewerBioBox";

const URL_CANONICAL = "https://www.mypayadvisor.com/research/methodology";

export const metadata: Metadata = {
  title: "Research Methodology | myPayAdvisor",
  description:
    "How myPayAdvisor measures and reports U.S. payment processor effective rates, fees, and operator outcomes. Public methodology, sources, sample selection, and update cadence.",
  keywords:
    "payment processing methodology, effective rate calculation, merchant statement analysis, payment processor research, transparent methodology",
  alternates: { canonical: URL_CANONICAL },
  robots: { index: true, follow: true },
  openGraph: {
    type: "article",
    url: URL_CANONICAL,
    title: "Research Methodology | myPayAdvisor",
    description:
      "How we measure effective rates and processor outcomes. Public, reproducible, reviewed by a payments operator.",
    images: [{ url: "https://www.mypayadvisor.com/og-logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Research Methodology | myPayAdvisor",
    description:
      "How we measure payment processor effective rates and fees. Public methodology, sources, sample selection.",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": `${URL_CANONICAL}#article`,
  headline: "myPayAdvisor Research Methodology",
  description:
    "Public methodology for myPayAdvisor's effective rate calculations, processor comparisons, and operator outcomes.",
  url: URL_CANONICAL,
  datePublished: "2026-05-18",
  dateModified: "2026-05-18",
  author: { "@id": BARAK_PERSON_ID },
  publisher: { "@id": "https://www.mypayadvisor.com/#organization" },
  inLanguage: "en-US",
  isAccessibleForFree: true,
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", "[data-speakable='true']"],
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.mypayadvisor.com" },
    { "@type": "ListItem", position: 2, name: "Research", item: "https://www.mypayadvisor.com/research" },
    { "@type": "ListItem", position: 3, name: "Methodology", item: URL_CANONICAL },
  ],
};

export default function MethodologyPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12 lg:py-16">
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={BARAK_PERSON_SCHEMA} />

      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Research Methodology</span>
      </nav>

      <header className="mb-10 border-b border-border pb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Research</p>
        <h1 className="font-display text-3xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Methodology
        </h1>
        <p
          data-speakable="true"
          className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          myPayAdvisor measures payment processor effective rates, fees, and operator outcomes
          using public processor pricing, the Federal Reserve&rsquo;s payments studies, the Nilson
          Report, and reviewer-confirmed merchant statements. This page documents every input,
          every assumption, and every update cycle.
        </p>
      </header>

      <article className="prose prose-slate max-w-none">
        <section id="what-we-measure">
          <h2>What we measure</h2>
          <p data-speakable="true">
            We track <strong>effective rate</strong> (total card-processing cost as a percent of
            volume), <strong>fee structure</strong> (interchange-plus, flat-rate, tiered,
            subscription), <strong>contract terms</strong> (length, ETF, reserves, settlement
            time), and <strong>operator outcomes</strong> (statement audits, negotiated savings,
            churn from processor switches).
          </p>
        </section>

        <section id="sample">
          <h2>Sample selection</h2>
          <p>
            Our 2026 baseline covers <strong>15 U.S. payment processors</strong> at four volume
            tiers ($10K, $50K, $250K, $1M monthly) across three channels (online, in-person,
            mixed). The processors selected together cover ~80% of U.S. small-and-mid-market
            processing volume per Nilson Report market-share estimates.
          </p>
          <p>
            Processor selection rule: must (a) accept SMBs without an introducer, (b) publish
            transparent pricing on their website, (c) have an audited fee disclosure of some
            form. We do not include white-label-only processors or those that quote only by
            phone.
          </p>
        </section>

        <section id="card-mix-assumption">
          <h2>Card-mix assumption</h2>
          <p data-speakable="true">
            All effective-rate calculations use a normalized U.S. SMB card mix of{" "}
            <strong>60% credit, 40% debit, with 30% of credit volume in rewards tiers</strong>.
            This mix matches the Federal Reserve&rsquo;s 2022-2024 payments studies for U.S.
            retail and online merchants under $1M annual volume.
          </p>
          <p>
            For business-to-business heavy verticals (B2B SaaS, professional services), we
            publish an alternate mix (80% credit, 20% debit, 50% of credit in business rewards)
            on individual articles where the vertical demands it.
          </p>
        </section>

        <section id="inputs">
          <h2>Inputs and data sources</h2>
          <ul>
            <li>
              <strong>Processor public pricing</strong> &mdash; Stripe pricing pages, Square
              pricing pages, PayPal Business fees, Helcim pricing, Stax, Payment Depot, Adyen,
              Clover (via Fiserv), Worldpay, Shopify Payments, Authorize.net, Braintree.
              Captured at quarterly snapshots. Last full capture: 2026-04-30.
            </li>
            <li>
              <strong>Card network interchange schedules</strong> &mdash; published Visa and
              Mastercard interchange tables (U.S.), accessed via official network sites.
            </li>
            <li>
              <strong>Federal Reserve payments studies</strong> &mdash; H.3 release and the
              triennial Federal Reserve Payments Study series.
            </li>
            <li>
              <strong>Nilson Report</strong> &mdash; market-share estimates and merchant counts;
              public excerpts only.
            </li>
            <li>
              <strong>ETA Trends and Insights</strong> &mdash; Electronic Transactions
              Association industry data on U.S. processor consolidation, ISO economics, and
              merchant churn rates.
            </li>
            <li>
              <strong>Reviewer-confirmed merchant statements</strong> &mdash; statements
              submitted by readers to the free statement audit tool. Used only in aggregate,
              fully anonymized, with explicit consent. As of 2026-05-18, the aggregated set is
              not yet large enough to release as a public dataset; we plan first release Q3 2026.
            </li>
          </ul>
        </section>

        <section id="how-we-calculate">
          <h2>How we calculate effective rate</h2>
          <p>For every processor and volume tier:</p>
          <ol>
            <li>
              Start with published <strong>headline rate</strong> (e.g. 2.9% + $0.30 for Stripe
              online).
            </li>
            <li>
              Apply the normalized card mix to derive the blended rate component.
            </li>
            <li>
              Add per-transaction fixed fees scaled by an average ticket of $74 (U.S. SMB
              median, per the Federal Reserve).
            </li>
            <li>
              Add any monthly fees (gateway, statement, PCI, regulatory) divided by the volume
              tier to express as a percentage.
            </li>
            <li>
              Subtract volume discounts that are <strong>publicly</strong> documented and
              automatic at the tier level. We do not include &ldquo;call us to negotiate&rdquo;
              discounts.
            </li>
          </ol>
          <p>
            Result: published effective rate as a single percentage at each volume tier and
            channel. See the downloadable dataset at{" "}
            <Link href="/data/effective-rates-2026" className="text-primary hover:underline">
              /data/effective-rates-2026
            </Link>{" "}
            for the full table plus CSV and JSON.
          </p>
        </section>

        <section id="what-we-do-not-claim">
          <h2>What we do not claim</h2>
          <ul>
            <li>
              We do not claim the published rates equal what every merchant pays. Real merchant
              rates depend on negotiation, vertical risk, monthly volume volatility, and ISO
              relationships.
            </li>
            <li>
              We do not include cash-discounting or surcharge programs in headline calculations,
              because their applicability is jurisdiction-dependent and not always legal.
            </li>
            <li>
              We do not project future rates. The 2026 dataset describes 2026 pricing; we
              refresh quarterly.
            </li>
            <li>
              We are independent and do not accept payment from processors to influence
              rankings or comparison conclusions.
            </li>
          </ul>
        </section>

        <section id="reviewer">
          <h2>Reviewer</h2>
          <p>
            Every quarterly refresh is reviewed by{" "}
            <Link href="/about/barak" className="text-primary hover:underline font-semibold">
              Barak Bachar
            </Link>
            , Global Payments Manager, with operator-side experience covering interchange
            economics, processor comparisons, chargeback defense, and merchant payment
            acceptance. Reviewer credentials are detailed on his profile.
          </p>
        </section>

        <section id="update-cadence">
          <h2>Update cadence</h2>
          <ul>
            <li>
              <strong>Headline pricing</strong> &mdash; quarterly snapshot from processor public
              pages.
            </li>
            <li>
              <strong>Interchange schedules</strong> &mdash; biannual (Visa/Mastercard publish
              in April and October).
            </li>
            <li>
              <strong>Federal Reserve studies</strong> &mdash; triennial, with annual H.3
              release updates.
            </li>
            <li>
              <strong>Aggregated reader statements</strong> &mdash; planned annual release once
              sample exceeds 1,000 statements.
            </li>
          </ul>
        </section>

        <section id="corrections">
          <h2>Corrections</h2>
          <p>
            If you find a rate, fee, or methodology claim on this site that you believe is
            outdated or wrong, email{" "}
            <a href="mailto:info@mypayadvisor.com" className="text-primary hover:underline">
              info@mypayadvisor.com
            </a>{" "}
            with the specific URL and citation. We correct material errors within 14 days and
            log every correction on the affected article&rsquo;s sources block.
          </p>
        </section>
      </article>

      <div className="mt-12 border-t border-border pt-8">
        <ReviewerBioBox />
      </div>
    </main>
  );
}

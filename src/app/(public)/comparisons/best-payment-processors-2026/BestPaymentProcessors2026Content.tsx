"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarCheck, Scale, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import PaymentQuiz from "@/components/PaymentQuiz";
import { MatchCTA } from "@/components/MatchCTA";
import ReviewerBioBox from "@/components/ReviewerBioBox";
import { MainRankingTable } from "@/components/mix/MainRankingTable";
import { ProviderReview } from "@/components/mix/ProviderReview";
import { ASSUMPTIONS, cheapestPerTier, formatRate, mainTable, monthlyCost, NOT_RANKED, rankAt, RATES_CHECKED, TIER_LABELS } from "@/lib/data/ranking-2026";
import { PROVIDER_REVIEWS } from "@/lib/data/provider-reviews-2026";
import { BEST_OF_FAQ } from "./faq";
import { HowToChoose } from "./HowToChoose";

interface ContentSlots {
  /** <AeoAnswer> from page.tsx. Rendered directly under the H1. */
  aeoAnswer?: React.ReactNode;
  /** <RelatedLinks> from page.tsx. Rendered at the end of the article. */
  relatedLinks?: React.ReactNode;
}

const FROM = "/comparisons/best-payment-processors-2026";

export default function BestPaymentProcessors2026Content({ aeoAnswer, relatedLinks }: ContentSlots) {
  const [quizOpen, setQuizOpen] = useState(false);
  const at10k = rankAt(0);
  const at250k = rankAt(2);
  const rows = mainTable();
  const cheapest = cheapestPerTier(rows);

  return (
    <>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <article className="mx-auto max-w-5xl pb-16">
            <header className="pt-6 sm:pt-12 pb-2">
              <nav aria-label="Breadcrumb" className="mb-4 text-xs text-muted-foreground">
                <Link href="/" className="hover:text-foreground">Home</Link>
                <span className="mx-1.5">/</span>
                <Link href="/comparisons" className="hover:text-foreground">Comparisons</Link>
                <span className="mx-1.5">/</span>
                <span className="text-foreground">Best payment processors</span>
              </nav>
              <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" /> Prices checked {RATES_CHECKED}<span className="hidden sm:inline">&nbsp;on each provider&apos;s own pricing page</span>
              </p>
              <h1 className="text-[1.85rem]/[1.15] sm:text-4xl/[1.15] lg:text-[3.25rem]/[1.1] font-bold text-foreground mb-4 tracking-tight text-balance">
                Best Payment Processors of 2026, Ranked by What You&apos;d Actually Pay
              </h1>
              {aeoAnswer}
              <p className="aeo-answer max-w-3xl text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed" data-speakable="true">
                At {TIER_LABELS[0]} a month, {at10k[0].name} costs the least at {formatRate(at10k[0].score)} effective
                (about {monthlyCost(at10k[0].score, 0)} a month), ahead of {at10k[1].name} ({formatRate(at10k[1].score)}) and {at10k[2].name} ({formatRate(at10k[2].score)}).
                At {TIER_LABELS[2]} and above, {at250k[0].name} leads at {formatRate(at250k[0].score)}. The table shows all four volumes; full reviews follow.
              </p>

              <div className="mt-4 sm:mt-5 flex items-center gap-3">
                <span aria-hidden="true" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">BB</span>
                <div className="text-sm leading-tight">
                  <p className="text-foreground">Reviewed by <Link href="/about/barak" className="font-semibold hover:text-primary">Barak Bachar</Link>, payments manager</p>
                  <p className="text-muted-foreground">Updated Oct 29, 2026<span className="hidden sm:inline"> · {at10k.length} providers ranked</span></p>
                </div>
              </div>

              <ul className="mt-6 hidden gap-3 sm:grid sm:grid-cols-3 list-none p-0">
                <li className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><TrendingDown className="h-4 w-4 text-success" aria-hidden="true" /> Cheapest under $50K/mo</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{at10k[0].name} <span className="tabular-nums">{formatRate(at10k[0].score)}</span></p>
                  <p className="text-xs text-muted-foreground">Interchange-plus, no monthly fee</p>
                </li>
                <li className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><Scale className="h-4 w-4 text-primary" aria-hidden="true" /> Cheapest from $250K/mo</p>
                  <p className="mt-1 text-lg font-bold text-foreground">{at250k[0].name} <span className="tabular-nums">{formatRate(at250k[0].score)}</span></p>
                  <p className="text-xs text-muted-foreground">Subscription, interchange at cost</p>
                </li>
                <li className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><BadgeCheck className="h-4 w-4 text-primary" aria-hidden="true" /> How we rank</p>
                  <p className="mt-1 text-lg font-bold text-foreground">Real cost, not list rate</p>
                  <p className="text-xs text-muted-foreground">Fixed fees and monthly fees included. <a href="#method" className="underline">Method</a></p>
                </li>
              </ul>
            </header>

            <MainRankingTable from={FROM} />

            <MatchCTA
              variant="inline"
              headline="Not sure which row is you?"
              subline="Answer four questions and get the 3 processors that fit your card mix, ticket size and industry, with what to ask each one before signing."
            />

            <nav aria-label="Reviews in this guide" className="my-10 rounded-2xl border border-border bg-muted/40 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Jump to a review</p>
              <ol className="flex flex-wrap gap-2 list-none p-0 m-0">
                {rows.map((r) => (
                  <li key={r.processor}>
                    <a href={`#${r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground hover:border-primary hover:text-primary transition-colors">
                      <span className="text-xs font-bold text-muted-foreground tabular-nums">{r.rank}</span> {r.name}
                    </a>
                  </li>
                ))}
                {[["#how-to-choose", "How to choose"], ["#method", "How we rank"], ["#faq", "FAQ"]].map(([h, l]) => (
                  <li key={h}>
                    <a href={h} className="inline-flex rounded-full px-3 py-1.5 text-sm text-primary hover:underline">{l}</a>
                  </li>
                ))}
              </ol>
            </nav>

            <section aria-labelledby="reviews-heading">
              <h2 id="reviews-heading" className="text-2xl md:text-3xl font-bold text-foreground">
                The {rows.length} providers, reviewed
              </h2>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                Each review lists the fees from the provider&apos;s own pricing page, checked {RATES_CHECKED}, what they mean in practice, and who should pick it. Ranked in the order of the table above.
              </p>
              {rows.map((r) =>
                PROVIDER_REVIEWS[r.processor] ? (
                  <ProviderReview key={r.processor} row={r} review={PROVIDER_REVIEWS[r.processor]} from={FROM} cheapest={cheapest} />
                ) : null,
              )}
            </section>

            <section className="mt-10 rounded-2xl border border-border p-5 sm:p-6">
              <h2 className="text-xl font-bold text-foreground mb-2">Not ranked, and why</h2>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {NOT_RANKED.map((n) => (
                  <li key={n.name}><strong className="text-foreground">{n.name}:</strong> {n.reason}.</li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-muted-foreground">
                For CBD, gaming, nutra, firearms, travel or subscription businesses, most providers above may decline you; start with the <Link href="/insights/high-risk-payment-processing-guide" className="text-primary hover:underline">high-risk payment processing guide</Link>.
              </p>
            </section>

            <HowToChoose />

            <section id="method" className="py-10 border-t border-border">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">How we rank</h2>
              <div className="space-y-3 text-muted-foreground leading-relaxed">
                <p>
                  Every provider gets the same test, built only from its own published prices. The effective rate is:
                </p>
                <p className="rounded-lg bg-muted/60 px-4 py-3 font-mono text-sm text-foreground">
                  percentage + (fixed fee ÷ ${ASSUMPTIONS.averageSale}) + (monthly fee ÷ monthly volume)
                </p>
                <p>
                  We assume a ${ASSUMPTIONS.averageSale} average sale and a {ASSUMPTIONS.cardMix} card mix. For interchange-plus providers (Helcim, Stax, Adyen) we add an estimate of the card networks&apos; own cost: {ASSUMPTIONS.interchangeInPerson.toFixed(2)}% in person and {ASSUMPTIONS.interchangeOnline.toFixed(2)}% online. That estimate blends typical Visa and Mastercard credit interchange with the federal cap on large-bank debit interchange (Regulation II), plus network assessments. Your real number moves with your card mix.
                </p>
                <p>
                  Where a provider has plans, we use the cheapest plan at each volume. Each provider is scored on the cheaper of its in-person or online rate, and the table is ordered at $10K a month. Shopify&apos;s store plan fee is left out because you pay it for the store, not for processing.
                </p>
                <p>
                  Commissions never enter the sort. Some providers pay us when you sign up through a Visit button; the ones that don&apos;t still get a button and keep their place. Barak Bachar reviews the method and the rankings.
                </p>
              </div>
              <h3 className="mt-6 font-semibold text-foreground">Changelog</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc pl-5">
                <li>Oct 29, 2026: every price re-read from the provider&apos;s own pricing page. Square&apos;s in-person fixed fee is now 15¢ and its free-plan online rate 3.3% + 30¢; Helcim&apos;s volume tiers updated; Braintree corrected to its published 2.89% + 29¢. Rankings recomputed with the formula above. Payment Depot removed because its membership fee is no longer published.</li>
                <li>Oct 28, 2026: one ranking for the whole page and its sidebar.</li>
              </ul>
            </section>

            <section id="why-payment-processing-matters" className="py-8 border-t border-border">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Why the advertised rate is not what you pay</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>For a business processing $500,000 a year, the difference between a 2.9% and a 2.2% effective rate is <strong className="text-foreground">$3,500 a year</strong>. Most of that gap hides in fixed fees per sale, monthly fees and markup on top of interchange, which is why we rank on effective rate instead of the headline percentage.</p>
                <p>Card networks and issuing banks set a baseline cost called interchange that every processor pays. Regulation II caps debit-card interchange for large issuers in the United States:</p>
                <figure className="my-4 border-l-4 border-primary bg-muted/40 px-5 py-4 rounded-r-md">
                  <blockquote cite="https://www.federalreserve.gov/paymentsystems/regii-average-interchange-fee.htm" className="text-foreground italic leading-relaxed">
                    &ldquo;an interchange fee that exceeds $0.21 plus 0.05 percent multiplied by the value of the transaction, plus a $0.01 fraud-prevention adjustment&rdquo;
                  </blockquote>
                  <figcaption className="mt-2 text-sm text-muted-foreground not-italic">
                    Board of Governors of the Federal Reserve System, <a href="https://www.federalreserve.gov/paymentsystems/regii-average-interchange-fee.htm" target="_blank" rel="noopener" className="text-primary hover:underline">Regulation II (12 CFR Part 235)</a>
                  </figcaption>
                </figure>
                <p>More on each line of a statement in the <Link href="/insights/payment-processor-fees-guide" className="text-primary hover:underline">payment processor fees guide</Link>.</p>
              </div>
            </section>

            <section id="faq" className="py-8 border-t border-border">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Frequently asked questions</h2>
              <div className="space-y-6">
                {BEST_OF_FAQ.map((faq) => (
                  <div key={faq.q}>
                    <h3 className="font-semibold mb-2 text-foreground">{faq.q}</h3>
                    <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="py-10 text-center border-t border-border">
              <h2 className="text-2xl font-bold mb-3 text-foreground">Want the 3 that fit your business?</h2>
              <p className="text-muted-foreground mb-6">Four questions, two minutes. You get a shortlist by email.</p>
              <Button size="lg" onClick={() => setQuizOpen(true)}>
                Match me <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </section>

            {relatedLinks}

            <section className="py-8 border-t border-border">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Related comparisons</h2>
              <div className="grid md:grid-cols-2 gap-3">
                <Link href="/comparisons/square-vs-stripe" className="text-primary hover:underline text-sm">Square vs Stripe &rarr;</Link>
                <Link href="/comparisons/stripe-vs-adyen-2026" className="text-primary hover:underline text-sm">Stripe vs Adyen 2026 &rarr;</Link>
                <Link href="/comparisons/square-vs-helcim-2026" className="text-primary hover:underline text-sm">Square vs Helcim 2026 &rarr;</Link>
                <Link href="/comparisons/square-vs-toast-2026" className="text-primary hover:underline text-sm">Square vs Toast 2026 &rarr;</Link>
                <Link href="/comparisons/best-payment-processors-with-same-day-deposit-2026" className="text-primary hover:underline text-sm">Same-day deposit processors &rarr;</Link>
                <Link href="/comparisons/paypal-vs-square" className="text-primary hover:underline text-sm">PayPal vs Square &rarr;</Link>
                <Link href="/comparisons/stripe-vs-paypal" className="text-primary hover:underline text-sm">Stripe vs PayPal &rarr;</Link>
                <Link href="/comparisons/helcim-vs-stripe" className="text-primary hover:underline text-sm">Helcim vs Stripe &rarr;</Link>
                <Link href="/comparisons/stripe-vs-worldpay-2026" className="text-primary hover:underline text-sm">Stripe vs Worldpay 2026 &rarr;</Link>
                <Link href="/comparisons" className="text-primary hover:underline text-sm">All comparisons &rarr;</Link>
              </div>
            </section>

            <ReviewerBioBox linkProfile={false} />

            <footer className="py-8 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <strong>How we make money:</strong> We earn a commission from some providers when you sign up through our links. It never changes our scores or the order of our rankings, and it doesn&apos;t change your price. <a href="/how-we-make-money" className="underline">Details</a>.
              </p>
            </footer>
          </article>
        </div>
      </main>

      <PaymentQuiz open={quizOpen} onOpenChange={setQuizOpen} />
    </>
  );
}

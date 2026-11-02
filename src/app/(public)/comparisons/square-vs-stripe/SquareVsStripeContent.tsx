"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import PaymentQuiz from "@/components/PaymentQuiz";
import ArticleSidebar from "@/components/ArticleSidebar";
import { MatchCTA } from "@/components/MatchCTA";
import ReviewerBioBox from "@/components/ReviewerBioBox";
import { ArticleByline } from "@/components/seo/ArticleByline";
import { VsCostTable } from "@/components/mix/VsCostTable";
import { FEES, RATES_CHECKED, TIER_LABELS, dollarsAt, engineRate, feeLabel, flatEffective, pct, usd } from "@/lib/data/vs-pages-2026";
import { ANSWER, EXAMPLES, FAQ, N } from "./data";

interface ContentSlots {
  /** <AeoAnswer> from page.tsx. Rendered directly under the H1. */
  aeoAnswer?: React.ReactNode;
  /** <RelatedLinks> from page.tsx. Rendered at the end of the article. */
  relatedLinks?: React.ReactNode;
}

const sq = FEES.square;
const st = FEES.stripe;
const link = "text-primary hover:underline";

export default function SquareVsStripeContent({ aeoAnswer, relatedLinks }: ContentSlots) {
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-12 justify-center">
            <article className="max-w-3xl flex-1 min-w-0">
          <header className="pt-10 sm:pt-16 pb-10 border-b border-border">
            <p className="text-sm font-medium text-primary mb-4">Stripe vs Square fees, prices checked {RATES_CHECKED}</p>

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
              Square vs Stripe 2026: Fees, Payouts and Which to Pick
            </h1>
            {aeoAnswer}

            <ArticleByline
              author="Reviewed by Barak Bachar"
              authorUrl="/about/barak"
              lastUpdated="2026-11-01"
              className="mt-2 mb-6"
            />

            <p className="aeo-answer text-lg md:text-xl text-foreground leading-relaxed" data-speakable="true">
              {ANSWER}
            </p>

            <VsCostTable
              groups={[
                {
                  title: "In person (card present)",
                  options: [
                    { label: "Square", note: `${feeLabel(sq.inPersonFree)}, cheapest plan`, rate: (t) => engineRate("Square", "In-person", t) },
                    { label: "Stripe", note: `${feeLabel(st.inPerson)}, Terminal`, rate: (t) => engineRate("Stripe", "In-person", t) },
                  ],
                },
                {
                  title: "Online (card not present)",
                  options: [
                    { label: "Square Free", note: `${feeLabel(sq.onlineFree)}, online store`, rate: () => flatEffective(sq.onlineFree) },
                    { label: "Square API", note: `${feeLabel(sq.onlinePaidOrApi)}, or paid plan`, rate: (t) => engineRate("Square", "Online", t) },
                    { label: "Stripe", note: feeLabel(st.online), rate: (t) => engineRate("Stripe", "Online", t) },
                  ],
                },
              ]}
              footnote={<>Square&apos;s in-person column uses the cheapest plan at each volume: Free at $10K and $50K, Premium (${sq.planPremium} a month) at $250K.</>}
            />

            <p className="text-muted-foreground leading-relaxed">
              The gap between the two is small, so the better question is which tools you need. Square gives you a free POS app and next-day deposits. Stripe gives you APIs, subscription billing and a checkout you can shape. If fees are the deciding factor, neither is the cheapest option we priced: see <Link href="/comparisons/helcim-vs-stripe" className={link}>Helcim vs Stripe</Link> and <Link href="/comparisons/square-vs-helcim-2026" className={link}>Helcim vs Square</Link>.
            </p>

            <MatchCTA
              variant="inline"
              headline="Square or Stripe: which fits your business?"
              subline="Tell us your channel mix, volume and average sale. We send back the processors that fit, with the questions to ask before you sign."
            />
          </header>

          <section className="py-10 border-b border-border">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">Quick Verdict</h2>
            <div className="space-y-4">
              <p className="text-foreground">
                <strong className="text-primary">Choose Square</strong> if you sell at a counter, a table or a market stall and want a working <Link href="/comparisons/best-pos-systems-for-small-business-2026" className={link}>POS system</Link> today with no developer, plus free next-business-day deposits.
              </p>
              <p className="text-foreground">
                <strong className="text-primary">Choose Stripe</strong> if most of your money comes in online, you bill subscriptions, or you have a developer to build the checkout. Its in-person readers work too, at {feeLabel(st.inPerson)}, which beats Square on small tickets.
              </p>
              <p className="text-foreground">
                <strong className="text-primary">Choose neither</strong> if you process more than about {TIER_LABELS[1]} a month and cost comes first. Interchange-plus providers such as Helcim ({pct(N.helcimIp[1])} in person at {TIER_LABELS[1]}) and subscription models such as Stax ({pct(N.staxIp250)} at {TIER_LABELS[2]}) come in well under both. Our <Link href="/comparisons/best-payment-processors-2026" className={link}>ranking of the best payment processors</Link> prices all of them on the same method.
              </p>
            </div>
          </section>

          <nav className="py-10 border-b border-border">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">In This Article</h2>
            <ol className="grid md:grid-cols-2 gap-2 text-sm list-decimal list-inside">
              {[
                { href: "#comparison", label: "Quick Comparison" },
                { href: "#pricing", label: "Every Fee, Side by Side" },
                { href: "#examples", label: "Two Worked Examples" },
                { href: "#payouts", label: "Payouts and Cash Flow" },
                { href: "#high-volume", label: "Above $50K a Month" },
                { href: "#pos", label: "POS and Hardware" },
                { href: "#features", label: "Features Comparison" },
                { href: "#use-cases", label: "Best Use Cases" },
                { href: "#faq", label: "FAQ" },
              ].map((item) => (
                <li key={item.href} className="text-muted-foreground">
                  <a href={item.href} className="text-primary hover:underline">{item.label}</a>
                </li>
              ))}
            </ol>
          </nav>

          <section id="comparison" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Quick Comparison</h2>

            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-foreground">
                    <th className="py-3 text-left font-semibold">Feature</th>
                    <th className="py-3 text-center font-semibold">Square</th>
                    <th className="py-3 text-center font-semibold">Stripe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { feature: "Best For", square: "In-person, brick-and-mortar", stripe: "Online, developers, SaaS" },
                    { feature: "In-Person Rate", square: `${feeLabel(sq.inPersonFree)} (Free plan)`, stripe: feeLabel(st.inPerson), stripeWins: true },
                    { feature: "Online Rate", square: `${feeLabel(sq.onlineFree)} on Free; ${feeLabel(sq.onlinePaidOrApi)} on paid plans or API`, stripe: feeLabel(st.online), stripeWins: true },
                    { feature: "Standard Payout", square: "Next business day, free", stripe: "2 business days", squareWins: true },
                    { feature: "Instant Payout", square: `${sq.instantPayoutPct}% of transfer`, stripe: `${st.instantPayoutPct}% of transfer`, stripeWins: true },
                    { feature: "Monthly Fee", square: `$0 Free, $${sq.planPlus} Plus, $${sq.planPremium} Premium`, stripe: "$0" },
                    { feature: "Free POS Software", square: "Yes", stripe: "No", squareWins: true },
                    { feature: "Entry Hardware", square: "From $59", stripe: "Reader M2 $59" },
                    { feature: "Setup Difficulty", square: "Easy", stripe: "Moderate to advanced", squareWins: true },
                    { feature: "API and Billing Tools", square: "Good, basic recurring", stripe: "Extensive, full subscription billing", stripeWins: true },
                    { feature: "Currencies", square: "Limited", stripe: "135+", stripeWins: true },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 pr-2 font-medium">{row.feature}</td>
                      <td className={`py-3 px-1 text-center ${row.squareWins ? 'text-primary font-semibold' : ''}`}>{row.square}</td>
                      <td className={`py-3 px-1 text-center ${row.stripeWins ? 'text-primary font-semibold' : ''}`}>{row.stripe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="pricing" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Square vs Stripe Fees, Side by Side</h2>

            <p className="text-muted-foreground mb-6">
              Every figure below is from the providers&apos; own pricing pages (<a href={sq.pricingUrl} target="_blank" rel="noopener noreferrer" className={link}>Square</a>, <a href={st.pricingUrl} target="_blank" rel="noopener noreferrer" className={link}>Stripe</a>), checked {RATES_CHECKED}. Our <Link href="/insights/payment-processor-fees-guide" className={link}>payment processing fees guide</Link> explains each line. Before you read them, a benchmark for what a healthy effective rate looks like:
            </p>

            <figure className="my-6 border-l-4 border-primary bg-muted/40 px-5 py-4 rounded-r-md">
              <blockquote cite="https://www.merchantmaverick.com/the-complete-guide-to-credit-card-processing-rates-and-fees/" className="text-foreground italic leading-relaxed">
                &ldquo;For a typical, low-risk business, your effective rate should be around 3 to 4%.&rdquo;
              </blockquote>
              <figcaption className="mt-2 text-sm text-muted-foreground not-italic">
                Erica Seppala, Editor &amp; Senior Staff Writer, <a href="https://www.merchantmaverick.com/the-complete-guide-to-credit-card-processing-rates-and-fees/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Merchant Maverick</a>
              </figcaption>
            </figure>

            <div className="overflow-x-auto -mx-4 px-4 mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-foreground">
                    <th className="py-3 text-left font-semibold">Fee</th>
                    <th className="py-3 text-center font-semibold">Square</th>
                    <th className="py-3 text-center font-semibold">Stripe</th>
                    <th className="py-3 text-center font-semibold">Lower</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { type: "In person", square: `${feeLabel(sq.inPersonFree)} Free; ${feeLabel(sq.inPersonPlus)} Plus; ${feeLabel(sq.inPersonPremium)} Premium`, stripe: feeLabel(st.inPerson), winner: `Stripe under $${N.crossover} a sale` },
                    { type: "Online", square: `${feeLabel(sq.onlineFree)} Free; ${feeLabel(sq.onlinePaidOrApi)} paid plans and API`, stripe: feeLabel(st.online), winner: "Tie, or Stripe vs Square Free" },
                    { type: "Keyed or card on file", square: feeLabel(sq.manual), stripe: feeLabel(st.manual), winner: "Depends on sale size" },
                    { type: "ACH bank payment", square: sq.ach, stripe: `${st.achPct}%, capped at $${st.achCap}`, winner: "Stripe" },
                    { type: "International card", square: `+${sq.internationalAddPct}%`, stripe: `+${st.internationalAddPct}%, plus ${st.conversionAddPct}% if currency is converted`, winner: "Tie when settled in USD" },
                    { type: "Dispute", square: "Not listed on the pricing page", stripe: `$${st.dispute}, plus $${st.disputeCounter} if you counter it (refunded if you win)`, winner: "Check your agreement" },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 pr-2 font-medium">{row.type}</td>
                      <td className="py-3 px-1 text-center">{row.square}</td>
                      <td className="py-3 px-1 text-center">{row.stripe}</td>
                      <td className="py-3 px-1 text-center font-semibold text-primary">{row.winner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-muted-foreground mb-4">
              The in-person rates cross at exactly ${N.crossover}: {feeLabel(sq.inPersonFree)} and {feeLabel(st.inPerson)} cost the same on a ${N.crossover} sale. A coffee shop selling $8 drinks pays noticeably less on Stripe; a furniture store selling $400 pieces pays a little less on Square. If your sales cluster on one side of ${N.crossover}, that settles the fee question.
            </p>
            <p className="text-muted-foreground">
              Online, read which Square product you would actually use. Square Free charges {feeLabel(sq.onlineFree)} on its online store and invoices ({pct(N.sqOnFree)} effective on a $50 sale); the {feeLabel(sq.onlinePaidOrApi)} rate applies on Plus and Premium or through Square&apos;s Online API. Stripe charges {feeLabel(st.online)} everywhere ({pct(N.stOn[0])}). If you are weighing Stripe against a wallet button instead, our <Link href="/comparisons/stripe-vs-paypal" className={link}>Stripe vs PayPal fees</Link> breakdown runs the same numbers.
            </p>
          </section>

          <section id="examples" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Two Worked Examples</h2>
            <div className="space-y-6">
              <div className="border-l-2 border-primary pl-4">
                <h3 className="font-semibold text-foreground">Coffee shop</h3>
                <p className="text-sm text-muted-foreground mb-2">{usd(EXAMPLES.coffee.volume)} a month, ${EXAMPLES.coffee.avg} average sale, {Math.round(EXAMPLES.coffee.inPersonShare * 100)}% in person, the rest online through Square&apos;s API or Stripe</p>
                <p className="text-sm">
                  Square: <strong>{usd(EXAMPLES.coffee.square)}/month</strong> | Stripe: <strong>{usd(EXAMPLES.coffee.stripe)}/month</strong>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Stripe saves about {usd(EXAMPLES.coffee.square - EXAMPLES.coffee.stripe)} a month because Square&apos;s 15¢ fixed fee is a big share of an $8 sale. Square still wins on the POS software, which Stripe does not include.
                </p>
              </div>

              <div className="border-l-2 border-primary pl-4">
                <h3 className="font-semibold text-foreground">SaaS company</h3>
                <p className="text-sm text-muted-foreground mb-2">{usd(EXAMPLES.saas.volume)} a month, ${EXAMPLES.saas.avg} average charge, all online</p>
                <p className="text-sm">
                  Stripe: <strong>{usd(EXAMPLES.saas.stripe)}/month</strong> | Square API: <strong>{usd(EXAMPLES.saas.squareApi)}/month</strong> | Square Free invoices: <strong>{usd(EXAMPLES.saas.squareFree)}/month</strong>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  The card fee is the same on Stripe and Square&apos;s API. Stripe wins on billing tools: proration, usage-based plans and failed-payment retries.
                </p>
              </div>
            </div>
          </section>

          <section id="payouts" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Payouts and Cash Flow</h2>
            <p className="text-muted-foreground mb-4">
              Square deposits the next business day at no cost. Stripe pays out in 2 business days, and a new account&apos;s first payout typically takes 7 to 14 days, which matters if you open the week you launch. For faster money, Stripe Instant Payouts cost {st.instantPayoutPct}% (50¢ minimum) and Square&apos;s instant or same-day transfers cost {sq.instantPayoutPct}%.
            </p>
            <p className="text-muted-foreground">
              On {usd(10_000)} moved early each month, that is {usd(10_000 * st.instantPayoutPct / 100)} on Stripe against {usd(10_000 * sq.instantPayoutPct / 100)} on Square. More options, including free next-day funding, are in our guide to <Link href="/comparisons/best-payment-processors-with-same-day-deposit-2026" className={link}>same-day deposit payment processors</Link>.
            </p>
          </section>

          <section id="high-volume" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Above $50K a Month: When Neither Flat Rate Wins</h2>
            <p className="text-muted-foreground mb-4">
              Flat rates bundle the card networks&apos; cost and the provider&apos;s markup into one number, so the markup grows with every sale. Interchange-plus pricing shows the two separately and the markup is small. On our method, at {TIER_LABELS[2]} a month in person:
            </p>
            <div className="overflow-x-auto -mx-4 px-4 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-foreground">
                    <th className="py-3 text-left font-semibold">Processor</th>
                    <th className="py-3 text-center font-semibold">Effective rate</th>
                    <th className="py-3 text-center font-semibold">Monthly cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { name: "Stripe", rate: N.stIp[2] },
                    { name: `Square Premium ($${sq.planPremium}/mo)`, rate: N.sqIp[2] },
                    { name: "Helcim (interchange-plus)", rate: N.helcimIp[2] },
                    { name: "Stax (subscription)", rate: N.staxIp250 },
                  ].map((row) => (
                    <tr key={row.name}>
                      <td className="py-3 font-medium">{row.name}</td>
                      <td className="py-3 text-center tabular-nums">{pct(row.rate)}</td>
                      <td className="py-3 text-center tabular-nums">{usd(dollarsAt(row.rate, 2))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mb-4">
              Stripe offers custom pricing for large volume through its sales team but publishes no threshold. Square offers custom pricing only above $250,000 a year in card sales. Both are worth asking for, with a competing interchange-plus quote in hand.
            </p>
            <p className="text-sm text-muted-foreground">
              The math for each pair is in <Link href="/comparisons/helcim-vs-stripe" className={link}>Helcim vs Stripe</Link>, <Link href="/comparisons/square-vs-helcim-2026" className={link}>Helcim vs Square</Link> and, for larger merchants who would sign a negotiated contract, <Link href="/comparisons/stripe-vs-worldpay-2026" className={link}>Stripe vs Worldpay</Link>.
            </p>
          </section>

          <section id="pos" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">POS and Hardware</h2>

            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Square POS</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>+ Free POS app on the Free plan</li>
                  <li>+ Works on iOS, Android and iPad</li>
                  <li>+ Offline mode for card payments when the internet drops</li>
                  <li>+ Inventory, staff permissions and reports</li>
                  <li>+ Versions for retail, restaurants and appointments</li>
                  <li>+ {sq.hardware}; no contract</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">Stripe Terminal</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>- No POS software of its own</li>
                  <li>+ {st.hardware}</li>
                  <li>+ SDK to build a custom checkout, or use a POS partner</li>
                  <li>+ Tap to Pay on iPhone, at {Math.round(st.tapToPayAdd * 100)}¢ extra per sale</li>
                  <li>- Not plug-and-play without a developer or a partner app</li>
                </ul>
              </div>
            </div>

            <p className="mt-6 p-4 bg-muted/50 text-sm">
              <strong className="text-primary">POS winner: Square.</strong> Unless you have developers or already run a POS that supports Stripe Terminal, Square is the simpler choice for in-person sales.
            </p>
          </section>

          <section id="features" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Features Comparison</h2>

            <div className="space-y-8">
              {[
                { title: "Subscriptions", square: "Basic recurring invoices.", stripe: "Usage-based, tiered and per-seat billing, retries for failed payments, customer portal.", winner: "Stripe" },
                { title: "API and developer tools", square: "Solid REST API, smaller developer community.", stripe: "Extensive documentation, webhooks, CLI and test mode.", winner: "Stripe" },
                { title: "International", square: "Sells in a handful of countries, little currency support.", stripe: "135+ currencies and many local payment methods.", winner: "Stripe" },
                { title: "Fraud tools", square: "Built-in fraud detection, few settings.", stripe: "Radar machine-learning screening with custom rules.", winner: "Stripe" },
                { title: "Getting started", square: "Sign up, plug in a reader, sell the same day.", stripe: "Fast for payment links and hosted checkout; slower for custom builds.", winner: "Square" },
              ].map((feature, i) => (
                <div key={i} className="border-b border-border pb-6 last:border-b-0">
                  <h3 className="font-semibold text-foreground mb-3">{feature.title}</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm mb-2">
                    <div>
                      <p className="font-medium mb-1">Square</p>
                      <p className="text-muted-foreground">{feature.square}</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Stripe</p>
                      <p className="text-muted-foreground">{feature.stripe}</p>
                    </div>
                  </div>
                  <p className="text-sm text-primary font-medium">Winner: {feature.winner}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="use-cases" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">When to Choose Each Processor</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-foreground mb-4 text-primary">Choose Square If:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>- You have a storefront, a restaurant or a cafe</li>
                  <li>- Your average sale is above ${N.crossover}</li>
                  <li>- You need inventory and staff management</li>
                  <li>- You want to start selling today</li>
                  <li>- You have no developers</li>
                  <li>- You want free next-day deposits</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-4 text-primary">Choose Stripe If:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>- You sell mainly online</li>
                  <li>- You run a SaaS or subscription business</li>
                  <li>- You have developers or use a cart that supports Stripe</li>
                  <li>- You sell internationally</li>
                  <li>- You are building an app or a marketplace</li>
                  <li>- Your in-person sales are small tickets under ${N.crossover}</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Pros and Cons</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-foreground mb-4">Square</h3>
                <div className="mb-4">
                  <p className="text-sm font-medium text-primary mb-2">Pros</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>+ Free POS app on the Free plan</li>
                    <li>+ Next-business-day deposits at no cost</li>
                    <li>+ All-in-one hardware and software</li>
                    <li>+ No coding, no contract</li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Cons</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>- {feeLabel(sq.onlineFree)} online on the Free plan</li>
                    <li>- 15¢ fixed fee costs more on small tickets</li>
                    <li>- Instant transfers cost {sq.instantPayoutPct}%</li>
                    <li>- Basic subscription features</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-4">Stripe</h3>
                <div className="mb-4">
                  <p className="text-sm font-medium text-primary mb-2">Pros</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>+ Lower in-person rate on sales under ${N.crossover}</li>
                    <li>+ Full billing, marketplace and fraud tools</li>
                    <li>+ 135+ currencies</li>
                    <li>+ ACH capped at ${st.achCap}; instant payouts at {st.instantPayoutPct}%</li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Cons</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>- No POS software of its own</li>
                    <li>- Payouts take 2 business days</li>
                    <li>- Countering a dispute adds a second ${st.disputeCounter}</li>
                    <li>- International cards add {st.internationalAddPct}% plus {st.conversionAddPct}% for conversion</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section id="faq" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>

            <div className="space-y-6">
              {FAQ.map((faq) => (
                <div key={faq.q} className="border-b border-border pb-6 last:border-b-0">
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Final Verdict</h2>

            <div className="space-y-4 mb-8">
              <p className="text-foreground">
                <strong className="text-primary">Square for a physical business.</strong> The free POS, free next-day deposits and same-day setup outweigh a fee gap of about {usd(dollarsAt(N.sqIp[0], 0) - dollarsAt(N.stIp[0], 0))} per {TIER_LABELS[0]} of sales.
              </p>
              <p className="text-foreground">
                <strong className="text-primary">Stripe for an online business.</strong> Same online card rate as Square&apos;s API, far better billing and developer tools, and a lower in-person rate if you also sell small tickets face to face.
              </p>
            </div>

            <p className="p-4 bg-muted/50 text-foreground">
              <strong>On fees alone</strong>, the two sit within {pct(Math.abs(N.sqIp[0] - N.stIp[0]))} of each other at {TIER_LABELS[0]} and {TIER_LABELS[1]} a month. Above that, compare both against an interchange-plus quote; Helcim at {pct(engineRate("Helcim", "In-person", 1))} in person at {TIER_LABELS[1]} is the one to beat.
            </p>
          </section>

          <section className="py-12 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Not Sure Which Processor Is Right for You?
            </h2>
            <p className="text-muted-foreground mb-6">
              Take our 60-second quiz to get a recommendation based on your business type, how you take payments and your volume.
            </p>
            <Button
              size="lg"
              className="font-semibold"
              onClick={() => setQuizOpen(true)}
            >
              Get Your Free Recommendation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </section>

          <section className="py-10 border-t border-border">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Related Comparisons</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/comparisons/square-vs-helcim-2026" className="text-primary hover:underline text-sm">Helcim vs Square 2026 &rarr;</Link>
              <Link href="/comparisons/square-vs-toast-2026" className="text-primary hover:underline text-sm">Square vs Toast 2026 &rarr;</Link>
              <Link href="/comparisons/stripe-vs-adyen-2026" className="text-primary hover:underline text-sm">Stripe vs Adyen 2026 &rarr;</Link>
              <Link href="/comparisons/best-payment-processors-2026" className="text-primary hover:underline text-sm">Best Payment Processors 2026 &rarr;</Link>
              <Link href="/comparisons/stripe-vs-paypal" className="text-primary hover:underline text-sm">Stripe vs PayPal &rarr;</Link>
              <Link href="/comparisons/paypal-vs-square" className="text-primary hover:underline text-sm">PayPal vs Square &rarr;</Link>
              <Link href="/comparisons/helcim-vs-stripe" className="text-primary hover:underline text-sm">Helcim vs Stripe &rarr;</Link>
              <Link href="/comparisons" className="text-primary hover:underline text-sm">View All Comparisons &rarr;</Link>
            </div>
          </section>

          <ReviewerBioBox linkProfile={false} />

          <footer className="py-8 border-t border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Disclosure: This comparison is based on each provider&apos;s published pricing and terms, checked on the dates shown. We earn a commission from some providers when you sign up through our links, at no extra cost to you. It never changes our scores or the order of our rankings, and it doesn&apos;t change your price. <a href="/how-we-make-money" className="underline">How we make money</a>.
            </p>
          </footer>
        </article>

        <ArticleSidebar currentSlug="/comparisons/square-vs-stripe" />
          </div>
        </div>
      {relatedLinks}
      </main>

      <PaymentQuiz open={quizOpen} onOpenChange={setQuizOpen} />
    </>
  );
}

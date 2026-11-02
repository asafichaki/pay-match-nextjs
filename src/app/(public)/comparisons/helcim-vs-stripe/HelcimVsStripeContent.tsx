"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import PaymentQuiz from "@/components/PaymentQuiz";
import ArticleSidebar from "@/components/ArticleSidebar";
import ReviewerBioBox from "@/components/ReviewerBioBox";
import { ArticleByline } from "@/components/seo/ArticleByline";
import ProviderCTA from "@/components/ProviderCTA";
import { VsCostTable } from "@/components/mix/VsCostTable";
import { ASSUMPTIONS, FEES, RATES_CHECKED, TIER_LABELS, VS_TIERS, engineRate, feeLabel, pct, usd } from "@/lib/data/vs-pages-2026";
import { ANSWER, FAQ, N, SAVE_IP, SAVE_ON } from "./data";

interface ContentSlots {
  /** <AeoAnswer> from page.tsx. Rendered directly under the H1. */
  aeoAnswer?: React.ReactNode;
  /** <RelatedLinks> from page.tsx. Rendered at the end of the article. */
  relatedLinks?: React.ReactNode;
}

const st = FEES.stripe;
const hc = FEES.helcim;
const link = "text-primary hover:underline";

export default function HelcimVsStripeContent({ aeoAnswer, relatedLinks }: ContentSlots) {
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-12 justify-center">
            <article className="max-w-3xl flex-1 min-w-0">
          <header className="pt-10 sm:pt-16 pb-10 border-b border-border">
            <p className="text-sm font-medium text-primary mb-4">Helcim vs Stripe fees, prices checked {RATES_CHECKED}</p>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
              Helcim vs Stripe 2026: Helcim Is Cheaper From $10K a Month
            </h1>
            {aeoAnswer}
            <ArticleByline
              author="Reviewed by Barak Bachar"
              authorUrl="/about/barak"
              lastUpdated="2026-11-02"
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
                    { label: "Helcim", note: `Interchange + ${feeLabel(hc.inPersonFirstTier)} under $50K`, rate: (t) => engineRate("Helcim", "In-person", t) },
                    { label: "Stripe", note: `${feeLabel(st.inPerson)}, Terminal`, rate: (t) => engineRate("Stripe", "In-person", t) },
                  ],
                },
                {
                  title: "Online and keyed",
                  options: [
                    { label: "Helcim", note: `Interchange + ${feeLabel(hc.onlineFirstTier)} under $50K`, rate: (t) => engineRate("Helcim", "Online", t) },
                    { label: "Stripe", note: feeLabel(st.online), rate: (t) => engineRate("Stripe", "Online", t) },
                  ],
                },
              ]}
              footnote={<>Helcim&apos;s margin steps down at $50K a month, so its $50K and $250K rows use the lower published tiers.</>}
            />
          </header>

          <section className="py-10 border-b border-border">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">Quick Verdict</h2>
            <div className="space-y-4">
              <p className="text-foreground"><strong className="text-primary">Choose Helcim</strong> if cost is the priority and you are a US or Canadian business. You see the card network&apos;s cost and Helcim&apos;s margin on every sale, the margin falls on its own at {hc.tierBreaks} a month, and deposits arrive the next business morning for free.</p>
              <p className="text-foreground"><strong className="text-primary">Choose Stripe</strong> if you need deep developer tools, subscription billing, a marketplace setup or many currencies. The flat {feeLabel(st.online)} is easy to budget, and you pay for that simplicity.</p>
            </div>
          </section>

          <nav className="py-10 border-b border-border">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">In This Article</h2>
            <ol className="grid md:grid-cols-2 gap-2 text-sm list-decimal list-inside">
              {[
                { href: "#comparison", label: "Quick Comparison" },
                { href: "#helcim", label: "What Is Helcim?" },
                { href: "#stripe", label: "What Is Stripe?" },
                { href: "#pricing", label: "Pricing Deep Dive" },
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
                    <th className="py-3 text-center font-semibold">Helcim</th>
                    <th className="py-3 text-center font-semibold">Stripe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { feature: "Best For", helcim: "Cost-focused SMBs", stripe: "Developers, SaaS, platforms" },
                    { feature: "Pricing Model", helcim: "Interchange-plus", stripe: "Flat rate" },
                    { feature: "Online Rate", helcim: `Interchange + ${feeLabel(hc.onlineFirstTier)}`, stripe: feeLabel(st.online), helcimWins: true },
                    { feature: "In-Person Rate", helcim: `Interchange + ${feeLabel(hc.inPersonFirstTier)}`, stripe: feeLabel(st.inPerson), helcimWins: true },
                    { feature: "Monthly Fee", helcim: "$0", stripe: "$0" },
                    { feature: "Volume Discounts", helcim: `Automatic at ${hc.tierBreaks}`, stripe: "Custom pricing on request", helcimWins: true },
                    { feature: "Standard Payout", helcim: hc.payouts, stripe: "2 business days", helcimWins: true },
                    { feature: "Instant Payout", helcim: "Not offered", stripe: `${st.instantPayoutPct}%`, stripeWins: true },
                    { feature: "Chargeback", helcim: `$${hc.chargebackLost} if lost, $0 if won`, stripe: `$${st.dispute}, +$${st.disputeCounter} to counter`, helcimWins: true },
                    { feature: "Recurring Payments", helcim: `+${hc.recurringAddPct}% per transaction`, stripe: "Stripe Billing, priced separately" },
                    { feature: "Hardware", helcim: hc.hardware, stripe: st.hardware },
                    { feature: "Currencies", helcim: "USD and CAD", stripe: "135+", stripeWins: true },
                    { feature: "API Depth", helcim: "Good", stripe: "Extensive", stripeWins: true },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 pr-2 font-medium">{row.feature}</td>
                      <td className={`py-3 px-1 text-center ${row.helcimWins ? 'text-primary font-semibold' : ''}`}>{row.helcim}</td>
                      <td className={`py-3 px-1 text-center ${row.stripeWins ? 'text-primary font-semibold' : ''}`}>{row.stripe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="helcim" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">What Is Helcim?</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              <a href="https://www.helcim.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">Helcim</a> is a Canadian payment processor founded in 2007 that publishes its full interchange-plus price list, including the US volume tiers. {hc.contract}.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              It also competes with Square for in-person sellers; the <Link href="/comparisons/square-vs-helcim-2026" className={link}>Helcim vs Square</Link> breakdown runs the same cost table for Square&apos;s plans.
            </p>
          </section>

          <section id="stripe" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">What Is Stripe?</h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              <strong className="text-foreground">Stripe</strong> is an online payments platform founded in 2010, built around APIs, hosted checkout and subscription billing, with Terminal readers for in-person sales. It charges one flat rate with no monthly fee.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              For how Stripe compares with the other flat-rate brands, see <Link href="/comparisons/square-vs-stripe" className={link}>Stripe vs Square</Link> and <Link href="/comparisons/stripe-vs-paypal" className={link}>Stripe vs PayPal</Link>.
            </p>
          </section>

          <section id="pricing" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Pricing Deep Dive</h2>
            <p className="text-muted-foreground mb-6">
              This is where Helcim and Stripe differ most. Our <Link href="/insights/payment-processor-fees-guide" className={link}>payment processor fees guide</Link> explains interchange, assessments and markup line by line.
            </p>

            <figure className="my-6 border-l-4 border-primary bg-muted/40 px-5 py-4 rounded-r-md">
              <blockquote cite="https://learn.helcim.com/docs/what-is-interchange-plus" className="text-foreground italic leading-relaxed">
                &ldquo;This transparent breakdown is what sets it apart from other pricing models, where these costs are often bundled together.&rdquo;
              </blockquote>
              <figcaption className="mt-2 text-sm text-muted-foreground not-italic">
                Helcim Editorial, <a href="https://learn.helcim.com/docs/what-is-interchange-plus" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Helcim Learn (What Is Interchange-Plus)</a>
              </figcaption>
            </figure>

            <h3 className="font-semibold text-foreground mb-4">How the two prices are built</h3>
            <p className="text-muted-foreground mb-4">
              Stripe&apos;s {feeLabel(st.online)} online and {feeLabel(st.inPerson)} in person include everything: the card network&apos;s interchange, its assessments and Stripe&apos;s own margin. Helcim charges the interchange at cost and adds a margin it publishes. To compare them you need an estimate of interchange. We use {ASSUMPTIONS.interchangeInPerson.toFixed(2)}% in person and {ASSUMPTIONS.interchangeOnline.toFixed(2)}% online for a {ASSUMPTIONS.cardMix} mix, blending typical Visa and Mastercard credit interchange with the federal cap on large-bank debit cards.
            </p>
            <p className="text-muted-foreground mb-6">
              At that estimate Helcim wins at every volume. The break-even is an average interchange of {N.beIp.toFixed(2)}% in person or {N.beOn.toFixed(2)}% online: a business whose customers pay almost entirely with premium rewards and corporate cards could reach it, a typical retailer or online store will not. Your last statement shows your real interchange line by line.
            </p>

            <h3 className="font-semibold text-foreground mb-4">Monthly savings with Helcim</h3>
            <div className="overflow-x-auto -mx-4 px-4 mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-foreground">
                    <th className="py-3 text-left font-semibold">Monthly Volume</th>
                    <th className="py-3 text-center font-semibold">In person</th>
                    <th className="py-3 text-center font-semibold">Online</th>
                    <th className="py-3 text-center font-semibold">A year, online</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {VS_TIERS.map((t) => (
                    <tr key={t}>
                      <td className="py-3 font-medium">{TIER_LABELS[t]}</td>
                      <td className="py-3 text-center tabular-nums">{usd(SAVE_IP[t])}/mo</td>
                      <td className="py-3 text-center tabular-nums">{usd(SAVE_ON[t])}/mo</td>
                      <td className="py-3 text-center tabular-nums text-primary font-semibold">{usd(SAVE_ON[t] * 12)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="font-semibold text-foreground mb-4">Helcim&apos;s US volume tiers</h3>
            <div className="overflow-x-auto -mx-4 px-4 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-foreground">
                    <th className="py-3 text-left font-semibold">Monthly volume</th>
                    <th className="py-3 text-center font-semibold">In person</th>
                    <th className="py-3 text-center font-semibold">Online and keyed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["Under $50K", "0.40% + 8¢", "0.50% + 25¢"],
                    ["$50K to $100K", "0.35% + 7¢", "0.45% + 20¢"],
                    ["$100K to $500K", "0.25% + 7¢", "0.35% + 20¢"],
                    ["$500K to $1M", "0.20% + 6¢", "0.25% + 15¢"],
                    ["$1M to $5M", "0.15% + 6¢", "0.15% + 15¢"],
                  ].map(([v, ip, on]) => (
                    <tr key={v}>
                      <td className="py-3 font-medium">{v}</td>
                      <td className="py-3 text-center">Interchange + {ip}</td>
                      <td className="py-3 text-center">Interchange + {on}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground">
              From <a href={hc.pricingUrl} target="_blank" rel="noopener noreferrer" className={link}>Helcim&apos;s pricing page</a>, checked {RATES_CHECKED}. Above $5M a month Helcim quotes custom pricing. Stripe offers custom pricing to large merchants too, with no published threshold; at {TIER_LABELS[2]} a month and up, also compare a negotiated contract such as the one in <Link href="/comparisons/stripe-vs-worldpay-2026" className={link}>Stripe vs Worldpay</Link>.
            </p>
          </section>

          <section id="features" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Features Comparison</h2>
            <div className="space-y-8">
              {[
                { title: "Pricing Transparency", helcim: "Shows interchange and margin on every transaction.", stripe: "One clear flat rate; the interchange inside it is not shown.", winner: "Helcim" },
                { title: "Payouts", helcim: "Next business morning, free. No instant option.", stripe: `2 business days; Instant Payouts at ${st.instantPayoutPct}%.`, winner: "Helcim for free speed, Stripe for instant" },
                { title: "API & Developer Tools", helcim: "Good API and documentation.", stripe: "Extensive APIs, webhooks, test mode and CLI.", winner: "Stripe" },
                { title: "International", helcim: "US and Canada, in USD and CAD.", stripe: "135+ currencies and many local payment methods.", winner: "Stripe" },
              ].map((feature, i) => (
                <div key={i} className="border-b border-border pb-6 last:border-b-0">
                  <h3 className="font-semibold text-foreground mb-3">{feature.title}</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm mb-2">
                    <div><p className="font-medium mb-1">Helcim</p><p className="text-muted-foreground">{feature.helcim}</p></div>
                    <div><p className="font-medium mb-1">Stripe</p><p className="text-muted-foreground">{feature.stripe}</p></div>
                  </div>
                  <p className="text-sm text-primary font-medium">Winner: {feature.winner}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="use-cases" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">When to Choose Each</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-foreground mb-4 text-primary">Choose Helcim If:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>- Cost is the priority</li>
                  <li>- You process {TIER_LABELS[0]} a month or more</li>
                  <li>- You want free next-day deposits</li>
                  <li>- You are a US or Canadian business</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-4 text-primary">Choose Stripe If:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>- You need advanced API features</li>
                  <li>- You are building a SaaS product</li>
                  <li>- You sell in many currencies</li>
                  <li>- You are building a marketplace</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="faq" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {FAQ.map((faq) => (
                <div key={faq.q} className="border-b border-border pb-6 last:border-b-0">
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Final Verdict</h2>
            <p className="p-4 bg-muted/50 text-foreground">
              <strong>Bottom line:</strong> for a North American business where cost matters, <a href="https://www.helcim.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Helcim</a> saves about {usd(SAVE_ON[1] * 12)} a year online at {TIER_LABELS[1]} a month. If you are building a tech product, <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe&apos;s</a> tools may be worth the {pct(N.stOn[1] - N.hcOn[1])} premium. See where both land among every provider we priced in the <Link href="/comparisons/best-payment-processors-2026" className={link}>best payment processors ranking</Link>.
            </p>
          </section>

          <ProviderCTA
            from="/comparisons/helcim-vs-stripe"
            items={[
              { partner: "helcim", name: "Helcim", note: "Interchange-plus, volume discounts" },
              { partner: "stripe", name: "Stripe", note: "Developer tooling and APIs" },
            ]}
          />

          <section className="py-12 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Not Sure Which Processor Is Right?</h2>
            <p className="text-muted-foreground mb-6">Take our 60-second quiz for a personalized recommendation.</p>
            <Button size="lg" className="font-semibold" onClick={() => setQuizOpen(true)}>
              Get Your Free Recommendation <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </section>

          <section className="py-10 border-t border-border">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Related Comparisons</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/comparisons/square-vs-stripe" className="text-primary hover:underline text-sm">Square vs Stripe &rarr;</Link>
              <Link href="/comparisons/stripe-vs-paypal" className="text-primary hover:underline text-sm">Stripe vs PayPal &rarr;</Link>
              <Link href="/comparisons/paypal-vs-square" className="text-primary hover:underline text-sm">PayPal vs Square &rarr;</Link>
              <Link href="/comparisons" className="text-primary hover:underline text-sm">View All Comparisons &rarr;</Link>
            </div>
          </section>

          <ReviewerBioBox linkProfile={false} />

          <footer className="py-8 border-t border-border">
            <p className="text-xs text-muted-foreground">Disclosure: We may earn a commission if you sign up through our links.</p>
          </footer>
        </article>

        <ArticleSidebar currentSlug="/comparisons/helcim-vs-stripe" />
          </div>
        </div>
      {relatedLinks}
      </main>
      <PaymentQuiz open={quizOpen} onOpenChange={setQuizOpen} />
    </>
  );
}

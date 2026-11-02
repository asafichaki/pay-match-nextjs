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
import { ANSWER, CHECKOUT_GAP, FAQ, N, saleFee } from "./data";

interface ContentSlots {
  /** <AeoAnswer> from page.tsx. Rendered directly under the H1. */
  aeoAnswer?: React.ReactNode;
  /** <RelatedLinks> from page.tsx. Rendered at the end of the article. */
  relatedLinks?: React.ReactNode;
}

const st = FEES.stripe;
const pp = FEES.paypal;
const link = "text-primary hover:underline";
const money = (n: number) => `$${n.toFixed(2)}`;

export default function StripeVsPayPalContent({ aeoAnswer, relatedLinks }: ContentSlots) {
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-12 justify-center">
            <article className="max-w-3xl flex-1 min-w-0">
          <header className="pt-10 sm:pt-16 pb-10 border-b border-border">
            <p className="text-sm font-medium text-primary mb-4">PayPal fees vs Stripe, prices checked {RATES_CHECKED}</p>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
              Stripe vs PayPal 2026: 2.9% Stripe vs 3.49% PayPal Rate
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
                  title: "Online card payments",
                  options: [
                    { label: "Stripe", note: feeLabel(st.online), rate: (t) => engineRate("Stripe", "Online", t) },
                    { label: "PayPal button", note: `${feeLabel(pp.checkout)}, Checkout`, rate: () => flatEffective(pp.checkout) },
                    { label: "PayPal cards", note: `${feeLabel(pp.advancedCard)}, needs approval`, rate: (t) => engineRate("PayPal", "Online", t) },
                  ],
                },
                {
                  title: "In person (card present)",
                  options: [
                    { label: "Stripe", note: `${feeLabel(st.inPerson)}, Terminal`, rate: (t) => engineRate("Stripe", "In-person", t) },
                    { label: "PayPal POS", note: feeLabel(pp.pos), rate: (t) => engineRate("PayPal", "In-person", t) },
                  ],
                },
              ]}
              footnote={<>&ldquo;PayPal cards&rdquo; is Advanced Credit and Debit Card Payments, which PayPal approves case by case.</>}
            />

            <p className="text-muted-foreground leading-relaxed">
              Most online stores that take both pay the PayPal rate only on the orders where a buyer picks the PayPal button. That is why the common setup is Stripe for cards plus PayPal as a second button, and why the real question is how many of your buyers insist on PayPal.
            </p>

            <MatchCTA
              variant="inline"
              headline="Stripe or PayPal: which actually fits you?"
              subline="Tell us your volume, your channels and what you sell. We send back the processors that fit, with the questions to ask before you sign."
            />
          </header>

          <section className="py-10 border-b border-border">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">Quick Verdict</h2>
            <div className="space-y-4">
              <p><strong className="text-primary">Choose Stripe</strong> if you sell online, bill subscriptions or want a checkout you control. It costs {usd(CHECKOUT_GAP[0])} a month less than the PayPal button per {TIER_LABELS[0]} of $50 sales, and the developer tools are deeper. See also our <Link href="/insights/best-payment-gateway-ecommerce" className={link}>ecommerce payment gateway guide</Link>.</p>
              <p><strong className="text-primary">Choose PayPal</strong> if your buyers already pay with PayPal or Venmo, you want to sell today with no developer, or you sell in person and want PayPal POS at {feeLabel(pp.pos)}.</p>
              <p><strong className="text-primary">Use both</strong> if you can: Stripe as the card processor, PayPal as an extra button. You pay PayPal&apos;s higher rate only when a buyer chooses it.</p>
            </div>
          </section>

          <nav className="py-10 border-b border-border">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">In This Article</h2>
            <ol className="grid md:grid-cols-2 gap-2 text-sm list-decimal list-inside">
              {[
                { href: "#comparison", label: "Quick Comparison" },
                { href: "#pricing", label: "Every Fee, Side by Side" },
                { href: "#ticket-size", label: "Small Orders vs Large Orders" },
                { href: "#payouts", label: "Payout Speed" },
                { href: "#disputes", label: "Disputes and Chargebacks" },
                { href: "#checkout", label: "Checkout Differences" },
                { href: "#high-volume", label: "Above $50K a Month" },
                { href: "#use-cases", label: "Who Should Pick Which" },
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
            <figure className="my-6 border-l-4 border-primary bg-muted/40 px-5 py-4 rounded-r-md">
              <blockquote cite="https://www.nerdwallet.com/business/software/learn/stripe-vs-paypal" className="text-foreground italic leading-relaxed">
                &ldquo;Stripe can process payments in more than 135 currencies. This can be valuable for small businesses that want to expand overseas.&rdquo;
              </blockquote>
              <figcaption className="mt-2 text-sm text-muted-foreground not-italic">
                Hillary Crawford, Lead Writer &amp; Content Strategist, <a href="https://www.nerdwallet.com/business/software/learn/stripe-vs-paypal" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NerdWallet</a>
              </figcaption>
            </figure>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-foreground">
                    <th className="py-3 text-left font-semibold">Feature</th>
                    <th className="py-3 text-center font-semibold">Stripe</th>
                    <th className="py-3 text-center font-semibold">PayPal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { feature: "Online card rate", stripe: feeLabel(st.online), paypal: `${feeLabel(pp.checkout)} button; ${feeLabel(pp.advancedCard)} with approval`, stripeWins: true },
                    { feature: "In-person rate", stripe: feeLabel(st.inPerson), paypal: feeLabel(pp.pos), paypalWins: true },
                    { feature: "Monthly fee", stripe: "$0", paypal: "$0 on POS and Advanced Credit and Debit" },
                    { feature: "Standard payout", stripe: "2 business days", paypal: "Free withdrawal to bank" },
                    { feature: "Instant payout", stripe: `${st.instantPayoutPct}%`, paypal: `${pp.instantPayoutPct}%` },
                    { feature: "Dispute fee", stripe: `$${st.dispute} (+$${st.disputeCounter} to counter)`, paypal: `$${pp.chargeback}` },
                    { feature: "Setup", stripe: "Minutes for links, longer for custom", paypal: "Minutes", paypalWins: true },
                    { feature: "Buyer-facing brand", stripe: "Invisible to buyers", paypal: "PayPal and Venmo buttons", paypalWins: true },
                    { feature: "Developer tools", stripe: "Extensive", paypal: "Good", stripeWins: true },
                    { feature: "Subscriptions", stripe: "Full billing tools", paypal: "Basic", stripeWins: true },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 pr-2 font-medium">{row.feature}</td>
                      <td className={`py-3 px-1 text-center ${row.stripeWins ? 'text-primary font-semibold' : ''}`}>{row.stripe}</td>
                      <td className={`py-3 px-1 text-center ${row.paypalWins ? 'text-primary font-semibold' : ''}`}>{row.paypal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="pricing" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Stripe vs PayPal Fees, Side by Side</h2>
            <p className="text-muted-foreground mb-6">
              Read from <a href={st.pricingUrl} target="_blank" rel="noopener noreferrer" className={link}>Stripe&apos;s pricing page</a> and <a href={pp.pricingUrl} target="_blank" rel="noopener noreferrer" className={link}>PayPal&apos;s business fee table</a> on {RATES_CHECKED}. PayPal sells several card products at different prices, so the first thing to check on any PayPal quote is which product it is. Our <Link href="/insights/payment-processor-fees-guide" className={link}>payment processor fees guide</Link> explains each line you will see on a statement.
            </p>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-foreground">
                    <th className="py-3 text-left font-semibold">Type</th>
                    <th className="py-3 text-center font-semibold">Stripe</th>
                    <th className="py-3 text-center font-semibold">PayPal</th>
                    <th className="py-3 text-center font-semibold">Lower</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { type: "Online, wallet button", stripe: "n/a", paypal: `${feeLabel(pp.checkout)} (${pct(N.ppCheckout)})`, winner: "n/a" },
                    { type: "Online card", stripe: `${feeLabel(st.online)} (${pct(N.stOn)})`, paypal: `${feeLabel(pp.standardCard)} standard (${pct(N.ppStandard)}); ${feeLabel(pp.advancedCard)} Advanced (${pct(N.ppAdvanced)})`, winner: "Stripe, or PayPal Advanced" },
                    { type: "Pay Later", stripe: "n/a", paypal: `${feeLabel(pp.payLater)} (${pct(N.ppPayLater)})`, winner: "n/a" },
                    { type: "Keyed card", stripe: `${feeLabel(st.manual)} (${pct(N.stManual)})`, paypal: `${feeLabel(pp.virtualTerminal)} Virtual Terminal (${pct(N.ppVirtual)})`, winner: "Near tie" },
                    { type: "In person", stripe: `${feeLabel(st.inPerson)} (${pct(N.stIp)})`, paypal: `${feeLabel(pp.pos)} (${pct(N.ppPos)})`, winner: "PayPal" },
                    { type: "ACH bank payment", stripe: `${st.achPct}%, cap $${st.achCap}`, paypal: `${pp.achPct}%, cap $${pp.achCap}`, winner: "Tie" },
                    { type: "International card", stripe: `+${st.internationalAddPct}%, +${st.conversionAddPct}% to convert`, paypal: `+${pp.internationalAddPct}%`, winner: "Tie in USD" },
                    { type: "Chargeback", stripe: `$${st.dispute}`, paypal: `$${pp.chargeback}`, winner: "Stripe" },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 pr-2 font-medium">{row.type}</td>
                      <td className="py-3 px-1 text-center">{row.stripe}</td>
                      <td className="py-3 px-1 text-center">{row.paypal}</td>
                      <td className="py-3 px-1 text-center text-primary font-semibold">{row.winner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Effective rates in brackets assume a $50 sale. PayPal says advanced card processing, interchange-plus-plus pricing and PayPal POS are subject to approval, and that it can raise rates on accounts it considers high risk with 30 days&apos; notice.
            </p>
          </section>

          <section id="ticket-size" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Small Orders vs Large Orders</h2>
            <p className="text-muted-foreground mb-4">
              PayPal&apos;s checkout button carries a 49¢ fixed fee against Stripe&apos;s 30¢, so the gap is widest on cheap orders. Per sale:
            </p>
            <div className="overflow-x-auto -mx-4 px-4 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-foreground">
                    <th className="py-3 text-left font-semibold">Order</th>
                    <th className="py-3 text-center font-semibold">Stripe</th>
                    <th className="py-3 text-center font-semibold">PayPal button</th>
                    <th className="py-3 text-center font-semibold">Extra on PayPal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[10, 50, 200, 500].map((amt) => {
                    const a = saleFee(amt, st.online);
                    const b = saleFee(amt, pp.checkout);
                    return (
                      <tr key={amt}>
                        <td className="py-3 font-medium tabular-nums">${amt}</td>
                        <td className="py-3 text-center tabular-nums">{money(a)}</td>
                        <td className="py-3 text-center tabular-nums">{money(b)}</td>
                        <td className="py-3 text-center tabular-nums">{money(b - a)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground">
              A store selling $10 items gives PayPal about {((saleFee(10, pp.checkout) / 10) * 100).toFixed(1)}% of every button order, against {((saleFee(10, st.online) / 10) * 100).toFixed(1)}% on Stripe. If your basket is small, steer buyers to the card form and keep the PayPal button as a fallback.
            </p>
          </section>

          <section id="payouts" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Payout Speed</h2>
            <p className="text-muted-foreground mb-4">
              Stripe pays out to your bank in 2 business days. A new account&apos;s first payout typically takes 7 to 14 days, which catches people who launch and expect money that week. Instant Payouts cost {st.instantPayoutPct}% with a 50¢ minimum and are not available to new accounts right away.
            </p>
            <p className="text-muted-foreground">
              PayPal holds your sales in a PayPal balance. A standard withdrawal to your bank is free; an instant transfer costs {pp.instantPayoutPct}% (50¢ minimum), up to $25,000 per bank transfer. If cash flow drives your choice, compare these with free next-day options in our guide to <Link href="/comparisons/best-payment-processors-with-same-day-deposit-2026" className={link}>same-day deposit processors</Link>.
            </p>
          </section>

          <section id="disputes" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Disputes and Chargebacks</h2>
            <p className="text-muted-foreground mb-4">
              Stripe charges ${st.dispute} when a buyer disputes a payment. If you counter the dispute manually, Stripe charges another ${st.disputeCounter}, which it refunds if you win. PayPal charges ${pp.chargeback} per card chargeback.
            </p>
            <p className="text-muted-foreground">
              Ten disputes a month cost ${st.dispute * 10} on Stripe if you accept them, ${(st.dispute + st.disputeCounter) * 10} if you fight and lose them all, and ${pp.chargeback * 10} on PayPal. Disputes also count against you: both providers can hold funds or close an account whose dispute rate climbs. For a deeper look, see the <Link href="/insights/chargeback-management-solutions-a-merchant-s-guide-to-prevention-recovery" className={link}>chargeback prevention guide</Link>.
            </p>
          </section>

          <section id="checkout" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Checkout Differences</h2>
            <div className="space-y-6">
              {[
                { title: "What the buyer sees", stripe: "Your own card form or Stripe's hosted checkout, with wallets like Apple Pay and Google Pay. Stripe's brand stays in the background.", paypal: "A PayPal or Venmo button that logs the buyer into an account they already have. Some buyers trust it more than typing a card number.", winner: "Depends on your buyers" },
                { title: "Subscriptions", stripe: "Usage-based, tiered and per-seat plans, proration, retries for failed payments, a customer portal.", paypal: "Basic recurring payments.", winner: "Stripe" },
                { title: "Developer tools", stripe: "Extensive APIs, webhooks, test mode and a CLI.", paypal: "Solid APIs and SDKs, less depth for custom flows.", winner: "Stripe" },
                { title: "Selling in person", stripe: `Terminal readers at ${feeLabel(st.inPerson)}; ${st.hardware}.`, paypal: `PayPal POS at ${feeLabel(pp.pos)}, card reader or Tap to Pay in the app.`, winner: "PayPal on rate" },
                { title: "International", stripe: "135+ currencies; international cards add 1.5%, currency conversion another 1%.", paypal: "International commercial transactions add 1.5%.", winner: "Stripe on reach" },
              ].map((f, i) => (
                <div key={i} className="border-b border-border pb-6 last:border-b-0">
                  <h3 className="font-semibold mb-3">{f.title}</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm mb-2">
                    <div><p className="font-medium mb-1">Stripe</p><p className="text-muted-foreground">{f.stripe}</p></div>
                    <div><p className="font-medium mb-1">PayPal</p><p className="text-muted-foreground">{f.paypal}</p></div>
                  </div>
                  <p className="text-sm text-primary font-medium">Winner: {f.winner}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="high-volume" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Above $50K a Month</h2>
            <p className="text-muted-foreground mb-4">
              Both price on flat rates, so the markup grows with every sale. At {TIER_LABELS[2]} a month online, Stripe costs about {usd(dollarsAt(N.stOn, 2))} a month on our method and the PayPal button {usd(dollarsAt(N.ppCheckout, 2))}. Helcim&apos;s interchange-plus pricing comes to about {usd(dollarsAt(N.helcimOn[2], 2))} ({pct(N.helcimOn[2])}), with no monthly fee.
            </p>
            <p className="text-muted-foreground">
              That gap is worked out pair by pair in <Link href="/comparisons/helcim-vs-stripe" className={link}>Helcim vs Stripe</Link>, and for merchants big enough to negotiate a contract, in <Link href="/comparisons/stripe-vs-worldpay-2026" className={link}>Stripe vs Worldpay</Link>. If you also sell in person, <Link href="/comparisons/square-vs-stripe" className={link}>Stripe vs Square</Link> covers the POS side, and <Link href="/comparisons/paypal-vs-square" className={link}>PayPal vs Square</Link> the same for PayPal.
            </p>
          </section>

          <section id="use-cases" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Who Should Pick Which</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4 text-primary">Choose Stripe If:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>- You run a SaaS product or bill subscriptions</li>
                  <li>- Your orders are small, so the fixed fee matters</li>
                  <li>- You have a developer or a cart that supports Stripe</li>
                  <li>- You want one card rate on every online sale</li>
                  <li>- You sell in many currencies</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-primary">Choose PayPal If:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>- Your buyers ask for PayPal or Venmo</li>
                  <li>- You need to start selling today with no code</li>
                  <li>- You sell in person and want {feeLabel(pp.pos)}</li>
                  <li>- PayPal approves you for Advanced Credit and Debit</li>
                  <li>- You already keep a PayPal business balance</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="faq" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">FAQ</h2>
            <div className="space-y-6">
              {FAQ.map((faq) => (
                <div key={faq.q} className="border-b border-border pb-6 last:border-b-0">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Final Verdict</h2>
            <p className="p-4 bg-muted/50">
              <strong>Best setup for most online stores:</strong> <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe</a> as the card processor, which saves about {usd(CHECKOUT_GAP[1])} a month against the PayPal button at {TIER_LABELS[1]}, with <a href="https://www.paypal.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PayPal</a> added as a second button for buyers who want it. For in-person sales, PayPal POS is the cheaper of the two.
            </p>
          </section>

          <section className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Not Sure Which Is Right?</h2>
            <p className="text-muted-foreground mb-6">Take our 60-second quiz.</p>
            <Button size="lg" onClick={() => setQuizOpen(true)}>
              Get Your Recommendation <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </section>

          <section className="py-10 border-t border-border">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Related</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/comparisons/square-vs-stripe" className="text-primary hover:underline text-sm">Square vs Stripe &rarr;</Link>
              <Link href="/comparisons/paypal-vs-square" className="text-primary hover:underline text-sm">PayPal vs Square &rarr;</Link>
              <Link href="/comparisons/helcim-vs-stripe" className="text-primary hover:underline text-sm">Helcim vs Stripe &rarr;</Link>
              <Link href="/comparisons/best-payment-processors-2026" className="text-primary hover:underline text-sm">Best Payment Processors 2026 &rarr;</Link>
              <Link href="/comparisons" className="text-primary hover:underline text-sm">All Comparisons &rarr;</Link>
            </div>
          </section>

          <ReviewerBioBox linkProfile={false} />

          <footer className="py-8 border-t border-border">
            <p className="text-xs text-muted-foreground">Disclosure: We may earn a commission if you sign up through our links.</p>
          </footer>
        </article>

        <ArticleSidebar currentSlug="/comparisons/stripe-vs-paypal" />
          </div>
        </div>
      {relatedLinks}
      </main>
      <PaymentQuiz open={quizOpen} onOpenChange={setQuizOpen} />
    </>
  );
}

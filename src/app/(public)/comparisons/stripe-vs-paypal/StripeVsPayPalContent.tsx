"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import PaymentQuiz from "@/components/PaymentQuiz";
import ArticleSidebar from "@/components/ArticleSidebar";
import { MatchCTA } from "@/components/MatchCTA";

export default function StripeVsPayPalContent() {
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-12 justify-center">
            <article className="max-w-3xl flex-1 min-w-0">
          <header className="pt-16 pb-10 border-b border-border">
            <p className="text-sm font-medium text-primary mb-4">Payment Processor Comparison</p>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-8 leading-[1.1] tracking-tight">
              Stripe vs PayPal: Developer Power vs Consumer Trust
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
              Stripe offers unmatched customization with best-in-class APIs.
              <a href="https://www.paypal.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"> PayPal</a> brings 400M+ users and instant trust.
              The right choice depends on your priorities.
            </p>
            <div className="flex items-center gap-4">
              <img src="/images/hannah-sutton.png" alt="Hannah Sutton" className="w-12 h-12 rounded-full object-cover object-top" />
              <div>
                <p className="font-semibold text-foreground">Hannah Sutton</p>
                <p className="text-sm text-muted-foreground">Finance & Payments Analyst - December 2026</p>
              </div>
            </div>

            <MatchCTA
              variant="inline"
              headline="Stripe or PayPal — which actually fits you?"
              subline="Get a 60-second personalized match based on your volume, channels, and what you sell. We answer to you, not the processors."
            />
          </header>

          <section className="py-10 border-b border-border aeo-answer">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">Quick Verdict</h2>
            <div className="space-y-4">
              <p className="text-lg text-foreground leading-relaxed">
                Stripe charges <strong>2.9% + $0.30</strong> per online transaction. PayPal charges{" "}
                <strong>2.99% + $0.49</strong> for standard checkout. On a $50 sale, Stripe costs $1.75; PayPal costs $1.99 — a 14% fee gap.
                PayPal typically lifts checkout conversion by <strong>5-10%</strong> due to its 400M+ user base; Stripe wins on API customization, subscriptions, and global currency support.
              </p>
              <p><strong className="text-primary">Choose Stripe</strong> if you need customization, have technical resources, and want <Link href="/insights/best-payment-gateway-ecommerce" className="text-primary hover:underline">advanced features</Link>.</p>
              <p><strong className="text-primary">Choose PayPal</strong> if you sell to U.S. consumers, want plug-and-play setup, and value the conversion lift from one-click checkout.</p>
            </div>
          </section>

          <nav className="py-10 border-b border-border">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">In This Article</h2>
            <ol className="grid md:grid-cols-2 gap-2 text-sm list-decimal list-inside">
              {[
                { href: "#comparison", label: "Quick Comparison" },
                { href: "#stripe", label: "What Is Stripe?" },
                { href: "#paypal", label: "What Is PayPal?" },
                { href: "#pricing", label: "Pricing Comparison" },
                { href: "#features", label: "Features Breakdown" },
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
                    <th className="py-3 text-center font-semibold">Stripe</th>
                    <th className="py-3 text-center font-semibold">PayPal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { feature: "Online Rate", stripe: "2.9% + $0.30", paypal: "3.49% + $0.49", stripeWins: true },
                    { feature: "Setup Time", stripe: "Hours to days", paypal: "15 minutes", paypalWins: true },
                    { feature: "Consumer Trust", stripe: "Low (backend)", paypal: "Very High", paypalWins: true },
                    { feature: "API Quality", stripe: "Best-in-class", paypal: "Good", stripeWins: true },
                    { feature: "Subscriptions", stripe: "Advanced", paypal: "Basic", stripeWins: true },
                    { feature: "International", stripe: "46 countries", paypal: "200+", paypalWins: true },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 font-medium">{row.feature}</td>
                      <td className={`py-3 text-center ${row.stripeWins ? 'text-primary font-semibold' : ''}`}>{row.stripe}</td>
                      <td className={`py-3 text-center ${row.paypalWins ? 'text-primary font-semibold' : ''}`}>{row.paypal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="stripe" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">What Is Stripe?</h2>
            <p className="text-muted-foreground mb-6">
              <strong className="text-foreground">Stripe</strong> is the global leader in payment infrastructure, founded in 2010. With a $50 billion valuation, Stripe is the go-to choice for developers.
              See also: <Link href="/comparisons/square-vs-stripe" className="text-primary hover:underline">Square vs Stripe</Link> and <Link href="/comparisons/helcim-vs-stripe" className="text-primary hover:underline">Helcim vs Stripe</Link>.
            </p>
          </section>

          <section id="paypal" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">What Is PayPal?</h2>
            <p className="text-muted-foreground mb-6">
              <a href="https://www.paypal.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">PayPal</a> is the original digital payment pioneer (founded 1998).
              With 400M+ active accounts, PayPal provides instant consumer trust that can boost conversion 15-30%.
              See also: <Link href="/comparisons/paypal-vs-square" className="text-primary hover:underline">PayPal vs Square</Link>.
            </p>
          </section>

          <section id="pricing" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Pricing Comparison</h2>
            <p className="text-muted-foreground mb-6">
              Understanding <Link href="/insights/payment-processor-fees-guide" className="text-primary hover:underline">payment processor fees</Link> helps you make the right choice.
            </p>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-foreground">
                    <th className="py-3 text-left font-semibold">Type</th>
                    <th className="py-3 text-center font-semibold">Stripe</th>
                    <th className="py-3 text-center font-semibold">PayPal</th>
                    <th className="py-3 text-center font-semibold">Winner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { type: "Online Standard", stripe: "2.9% + $0.30", paypal: "3.49% + $0.49", winner: "Stripe" },
                    { type: "ACH/Bank", stripe: "0.8% (cap $5)", paypal: "3.49% + $0.49", winner: "Stripe" },
                    { type: "Chargeback", stripe: "$15", paypal: "$20", winner: "Stripe" },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 font-medium">{row.type}</td>
                      <td className="py-3 text-center">{row.stripe}</td>
                      <td className="py-3 text-center">{row.paypal}</td>
                      <td className="py-3 text-center text-primary font-semibold">{row.winner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="features" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Features Breakdown</h2>
            <div className="space-y-8">
              {[
                { title: "API & Developer", stripe: "Best-in-class. Clean REST API, 100+ webhooks.", paypal: "Adequate. Documentation improving.", winner: "Stripe" },
                { title: "Subscriptions", stripe: "Advanced: usage-based, metered, tiered pricing.", paypal: "Basic recurring only.", winner: "Stripe" },
                { title: "Consumer Trust", stripe: "Invisible to customers.", paypal: "400M+ users. Boosts conversion 15-30%.", winner: "PayPal" },
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

          <section id="use-cases" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Best Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4 text-primary">Choose Stripe If:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>- You're building a SaaS product</li>
                  <li>- You have developer resources</li>
                  <li>- You need subscription billing</li>
                  <li>- You want full customization</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4 text-primary">Choose PayPal If:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>- You need to launch quickly</li>
                  <li>- Consumer trust matters</li>
                  <li>- You have no technical resources</li>
                  <li>- You need 200+ country coverage</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="faq" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">FAQ</h2>
            <div className="space-y-6">
              {[
                { q: "Can I use both?", a: "Yes! Use Stripe as primary for lower fees, add PayPal as a checkout option to capture PayPal-loyal customers." },
                { q: "Is Stripe cheaper?", a: "For most online businesses, yes. Stripe charges 2.9% + $0.30 vs PayPal's 3.49% + $0.49." },
              ].map((faq, i) => (
                <div key={i} className="border-b border-border pb-6 last:border-b-0">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Final Verdict</h2>
            <p className="p-4 bg-muted/50">
              <strong>Best Strategy:</strong> Use both! <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe</a> as your primary processor for lower fees and powerful features,
              with <a href="https://www.paypal.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PayPal</a> as an additional checkout option.
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
              <Link href="/comparisons" className="text-primary hover:underline text-sm">All Comparisons &rarr;</Link>
            </div>
          </section>

          <footer className="py-8 border-t border-border">
            <p className="text-xs text-muted-foreground">Disclosure: We may earn a commission if you sign up through our links.</p>
          </footer>
        </article>

        <ArticleSidebar currentSlug="/comparisons/stripe-vs-paypal" />
          </div>
        </div>
      </main>
      <PaymentQuiz open={quizOpen} onOpenChange={setQuizOpen} />
    </>
  );
}

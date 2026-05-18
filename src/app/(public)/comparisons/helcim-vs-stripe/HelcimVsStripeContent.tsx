"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import PaymentQuiz from "@/components/PaymentQuiz";
import ArticleSidebar from "@/components/ArticleSidebar";
import ReviewerBioBox from "@/components/ReviewerBioBox";

export default function HelcimVsStripeContent() {
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
              Helcim vs Stripe: Transparent Pricing vs Advanced Features
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
              <a href="https://www.helcim.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Helcim</a> is known for radically transparent <Link href="/insights/credit-card-processing-fees-explained" className="text-primary hover:underline">interchange-plus pricing</Link>.
              Stripe leads with best-in-class APIs.
              Which saves you more? Let's find out.
            </p>
            <div className="flex items-center gap-4">
              <img src="/images/hannah-sutton.png" alt="Hannah Sutton" className="w-12 h-12 rounded-full object-cover object-top" />
              <div>
                <p className="font-semibold text-foreground">Hannah Sutton</p>
                <p className="text-sm text-muted-foreground">Finance & Payments Analyst - December 2026</p>
              </div>
            </div>
          </header>

          <section className="py-10 border-b border-border">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">Quick Verdict</h2>
            <div className="space-y-4">
              <p className="text-foreground"><strong className="text-primary">Choose Helcim</strong> if you want the lowest fees, transparent pricing, and excellent 24/7 support.</p>
              <p className="text-foreground"><strong className="text-primary">Choose Stripe</strong> if you need advanced features, customization, and have developers.</p>
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
                    { feature: "Best For", helcim: "Transparency, savings, SMBs", stripe: "Developers, SaaS, customization" },
                    { feature: "Pricing Model", helcim: "Interchange-plus", stripe: "Flat-rate", helcimWins: true },
                    { feature: "Online Rate", helcim: "Interchange + 0.40% + $0.08", stripe: "2.9% + $0.30", helcimWins: true },
                    { feature: "In-Person Rate", helcim: "Interchange + 0.30% + $0.08", stripe: "2.7% + $0.05", helcimWins: true },
                    { feature: "Volume Discounts", helcim: "Automatic", stripe: "Custom ($1M+)", helcimWins: true },
                    { feature: "Customer Support", helcim: "24/7 Phone/Chat/Email", stripe: "Email/Chat only", helcimWins: true },
                    { feature: "API Quality", helcim: "Good", stripe: "Best-in-class", stripeWins: true },
                    { feature: "Currencies", helcim: "USD, CAD only", stripe: "135+", stripeWins: true },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 font-medium">{row.feature}</td>
                      <td className={`py-3 text-center ${row.helcimWins ? 'text-primary font-semibold' : ''}`}>{row.helcim}</td>
                      <td className={`py-3 text-center ${row.stripeWins ? 'text-primary font-semibold' : ''}`}>{row.stripe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="helcim" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">What Is Helcim?</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              <a href="https://www.helcim.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">Helcim</a> is a Canadian payment processor founded in 2007, known for radically transparent pricing.
            </p>
          </section>

          <section id="stripe" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">What Is Stripe?</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              <strong className="text-foreground">Stripe</strong> is the global leader in payment infrastructure, founded in 2010. See our <Link href="/comparisons/square-vs-stripe" className="text-primary hover:underline">Square vs Stripe</Link> comparison for more.
            </p>
          </section>

          <section id="pricing" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Pricing Deep Dive</h2>
            <p className="text-muted-foreground mb-6">
              This is where Helcim and Stripe differ most. Understanding these <Link href="/insights/payment-processor-fees-guide" className="text-primary hover:underline">pricing models</Link> can save you thousands.
            </p>

            <figure className="my-6 border-l-4 border-primary bg-muted/40 px-5 py-4 rounded-r-md">
              <blockquote cite="https://learn.helcim.com/docs/what-is-interchange-plus" className="text-foreground italic leading-relaxed">
                &ldquo;This transparent breakdown is what sets it apart from other pricing models, where these costs are often bundled together.&rdquo;
              </blockquote>
              <figcaption className="mt-2 text-sm text-muted-foreground not-italic">
                Helcim Editorial, <a href="https://learn.helcim.com/docs/what-is-interchange-plus" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Helcim Learn (What Is Interchange-Plus)</a>
              </figcaption>
            </figure>

            <h3 className="font-semibold text-foreground mb-4">Real Savings Comparison</h3>
            <div className="overflow-x-auto -mx-4 px-4 mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-foreground">
                    <th className="py-3 text-left font-semibold">Monthly Volume</th>
                    <th className="py-3 text-center font-semibold">Helcim Fees</th>
                    <th className="py-3 text-center font-semibold">Stripe Fees</th>
                    <th className="py-3 text-center font-semibold">You Save</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { volume: "$25,000/month", helcim: "$585", stripe: "$755", savings: "$170/mo ($2,040/yr)" },
                    { volume: "$50,000/month", helcim: "$1,120", stripe: "$1,500", savings: "$380/mo ($4,560/yr)" },
                    { volume: "$100,000/month", helcim: "$2,140", stripe: "$3,000", savings: "$860/mo ($10,320/yr)" },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 font-medium">{row.volume}</td>
                      <td className="py-3 text-center">{row.helcim}</td>
                      <td className="py-3 text-center">{row.stripe}</td>
                      <td className="py-3 text-center text-primary font-semibold">{row.savings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="features" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Features Comparison</h2>
            <div className="space-y-8">
              {[
                { title: "Pricing Transparency", helcim: "Industry leader. Shows exact interchange costs.", stripe: "Clear flat-rate but hides actual interchange.", winner: "Helcim" },
                { title: "Customer Support", helcim: "24/7 phone, email, chat. 4.8/5 rating.", stripe: "Email and chat only. No phone.", winner: "Helcim" },
                { title: "API & Developer Tools", helcim: "Good API, adequate docs.", stripe: "Best-in-class. 100+ webhooks.", winner: "Stripe" },
                { title: "International", helcim: "US and Canada only.", stripe: "46 countries. 135+ currencies.", winner: "Stripe" },
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
                  <li>- Cost savings are a priority</li>
                  <li>- You process $10K+/month</li>
                  <li>- You want 24/7 phone support</li>
                  <li>- You're a Canadian business</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-4 text-primary">Choose Stripe If:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>- You need advanced API features</li>
                  <li>- You're building a SaaS product</li>
                  <li>- You need international expansion</li>
                  <li>- You're building a marketplace</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="faq" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                { q: "Is Helcim cheaper than Stripe?", a: "For most businesses processing $10K+/month, yes. Helcim's interchange-plus pricing typically saves 15-25%." },
                { q: "Does Helcim work in the US?", a: "Yes! Despite being Canadian-based, Helcim fully supports US businesses with USD processing." },
                { q: "Which has better support?", a: "Helcim wins with 24/7 phone, email, and chat. Stripe offers email and chat only." },
              ].map((faq, i) => (
                <div key={i} className="border-b border-border pb-6 last:border-b-0">
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Final Verdict</h2>
            <p className="p-4 bg-muted/50 text-foreground">
              <strong>Bottom Line:</strong> If you're an SMB in North America and cost matters, <a href="https://www.helcim.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Helcim</a> will save you thousands. If you're building a tech product, <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe's</a> features may justify the cost.
            </p>
          </section>

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

          <ReviewerBioBox />

          <footer className="py-8 border-t border-border">
            <p className="text-xs text-muted-foreground">Disclosure: We may earn a commission if you sign up through our links.</p>
          </footer>
        </article>

        <ArticleSidebar currentSlug="/comparisons/helcim-vs-stripe" />
          </div>
        </div>
      </main>
      <PaymentQuiz open={quizOpen} onOpenChange={setQuizOpen} />
    </>
  );
}

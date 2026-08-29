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

interface ContentSlots {
  /** <AeoAnswer> from page.tsx. Rendered directly under the H1. */
  aeoAnswer?: React.ReactNode;
  /** <RelatedLinks> from page.tsx. Rendered at the end of the article. */
  relatedLinks?: React.ReactNode;
}

export default function HelcimVsStripeContent({ aeoAnswer, relatedLinks }: ContentSlots) {
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
            {aeoAnswer}
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
              <a href="https://www.helcim.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Helcim</a> is known for radically transparent <Link href="/insights/credit-card-processing-fees-explained" className="text-primary hover:underline">interchange-plus pricing</Link>.
              Stripe leads with best-in-class APIs.
              Which saves you more? Let's find out.
            </p>
            <ArticleByline
              author="Reviewed by Barak Bachar"
              authorUrl="/about/barak"
              lastUpdated="2026-08-25"
              className="mt-4"
            />
          </header>

          <section className="py-10 border-b border-border aeo-answer">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">Quick Verdict</h2>
            <div className="space-y-4">
              <p className="text-lg text-foreground leading-relaxed">
                Helcim wins for most U.S. merchants above <strong>$25K</strong> in monthly card volume. Stripe&rsquo;s flat <strong>2.9% + $0.30</strong> online rate is easy to budget but stops being competitive once interchange averages run below 1.8 percent. Helcim&rsquo;s interchange-plus model passes through the wholesale cost and adds <strong>0.50% + $0.25</strong> online, with automatic volume discounts at $50K, $100K, and $250K monthly tiers. Stripe wins on developer tooling and global card support.
              </p>
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
                    { feature: "Online Rate", helcim: "Interchange + 0.50% + $0.25", stripe: "2.9% + $0.30", helcimWins: true },
                    { feature: "In-Person Rate", helcim: "Interchange + 0.40% + $0.08", stripe: "2.7% + $0.05", helcimWins: true },
                    { feature: "Monthly Fee", helcim: "$0", stripe: "$0" },
                    { feature: "Volume Discounts", helcim: "Automatic at $25K, $50K, $100K, $250K", stripe: "Custom ($1M+)", helcimWins: true },
                    { feature: "Settlement", helcim: "2 business days", stripe: "2 business days" },
                    { feature: "Level 2 / Level 3 Data", helcim: "Supported on the hosted gateway", stripe: "Level 2 via API, level 3 limited", helcimWins: true },
                    { feature: "International Cards", helcim: "USD and CAD only", stripe: "+1.5%, plus 1% currency conversion", stripeWins: true },
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

            <h3 className="font-semibold text-foreground mb-4">Effective rate math at $250K a month</h3>
            <p className="text-muted-foreground mb-4">
              Per <a href="https://www.federalreserve.gov/paymentsystems.htm" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Federal Reserve payments studies</a>, U.S. card interchange has averaged near a 1.7 to 1.9 percent weighted rate across recent reporting cycles. At a 1.8 percent average interchange, a merchant processing $250K monthly pays roughly 2.30% + $0.25 per transaction on Helcim versus 2.90% + $0.30 on Stripe. On 2,500 transactions averaging $100, that gap is about $1,500 a month before Helcim&rsquo;s automatic volume discount. Stripe&rsquo;s flat rate covers interchange, the network assessments, and its own markup; on a typical U.S. consumer card mix that markup is 0.90 to 1.40 percent above wholesale, and there is no volume discount until a custom contract above roughly $1M monthly.
            </p>

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
                { q: "When does Helcim become cheaper than Stripe?", a: "Helcim is usually cheaper than Stripe once monthly card volume passes $25K and the merchant accepts at least 60 percent in-person or low-risk online cards. On a 1.8 percent average interchange mix, Helcim's interchange plus 0.50 percent plus $0.25 online rate works out to roughly 2.30 percent versus Stripe's 2.90 percent. On $100K monthly volume, that gap is around $600 per month, before any of Helcim's automatic volume discount kicks in. Below $25K, the savings are usually too small to justify the time spent switching integrations." },
                { q: "Does Stripe negotiate below 2.9 percent?", a: "Stripe offers custom pricing for merchants above roughly $1 million in monthly processing volume, per its public pricing page. The custom rate is interchange-plus and can drop the effective markup by 0.30 to 0.60 percent depending on card mix. For volumes between $250K and $1M, Stripe sometimes offers volume discounts on a case-by-case basis, but the published flat rate is the default. Merchants in that range should price-check Helcim, Stax, or a tier-one acquirer before signing any Stripe custom contract because the comparison points strengthen the negotiation." },
                { q: "Are there any monthly fees with Stripe or Helcim?", a: "Neither company charges a base monthly fee on its standard plan. Stripe's pricing is purely per transaction at 2.9 percent plus $0.30 online, with no monthly fee, no PCI fee, and no statement fee. Helcim charges no monthly fee, no setup fee, and no PCI compliance fee. Both companies operate month-to-month with no early termination fee. Add-on Stripe products like Radar for fraud, Sigma for reporting, and Atlas for incorporation carry their own pricing, which is published separately on the Stripe pricing page." },
                { q: "Which is better for B2B card-not-present?", a: "Helcim is the stronger choice for B2B card-not-present merchants in most cases. Interchange-plus pricing combined with level 2 and level 3 data support qualifies commercial, purchasing, and government cards for lower interchange categories, which can drop the effective rate by 0.50 to 1.00 percent versus a flat rate. Stripe supports level 2 data on its API, but level 3 support is limited unless the merchant builds it into the integration. For B2B operators with average tickets above $500, the rate difference compounds quickly into five-figure annual savings." },
                { q: "Can I switch from Stripe to Helcim mid-contract?", a: "Yes. Stripe runs a month-to-month standard agreement with no early termination fee, per its public terms. A merchant can stop processing through Stripe at any time and switch to Helcim without paying a penalty. The practical work involves repointing the payment integration, migrating saved card tokens (Stripe will migrate tokens to a compliant processor on request), and updating recurring billing schedules. For ecommerce merchants, plan for one to two engineering weeks if recurring billing or saved cards are in scope. Run both processors in parallel for a week to validate." },
                { q: "Does Helcim work in the US?", a: "Yes. Despite being Canadian-based, Helcim fully supports US businesses with USD processing." },
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

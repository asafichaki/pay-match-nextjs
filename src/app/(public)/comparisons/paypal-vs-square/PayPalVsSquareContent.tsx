"use client";

import Link from "next/link";
import { ArrowRight, Check, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import PaymentQuiz from "@/components/PaymentQuiz";
import ArticleSidebar from "@/components/ArticleSidebar";
import ReviewerBioBox from "@/components/ReviewerBioBox";
import { ArticleByline } from "@/components/seo/ArticleByline";
import { VsCostTable } from "@/components/mix/VsCostTable";
import { FEES, RATES_CHECKED, engineRate, feeLabel, flatEffective } from "@/lib/data/vs-pages-2026";
import { ANSWER, FAQ } from "./data";

const sq = FEES.square;
const pp = FEES.paypal;

interface ContentSlots {
  /** <AeoAnswer> from page.tsx. Rendered directly under the H1. */
  aeoAnswer?: React.ReactNode;
  /** <RelatedLinks> from page.tsx. Rendered at the end of the article. */
  relatedLinks?: React.ReactNode;
}

export default function PayPalVsSquareContent({ aeoAnswer, relatedLinks }: ContentSlots) {
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-12 justify-center">
            <article className="max-w-3xl flex-1 min-w-0">
              <header className="pt-16 pb-10 border-b border-border">
                <p className="text-sm font-medium text-primary mb-4">PayPal vs Square fees, prices checked {RATES_CHECKED}</p>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8 leading-[1.1] tracking-tight">
                  Square vs PayPal: Complete Comparison for Small Businesses (2026)
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
                        { label: "Square", note: `${feeLabel(sq.inPersonFree)} Free; cheapest plan`, rate: (t) => engineRate("Square", "In-person", t) },
                        { label: "PayPal POS", note: feeLabel(pp.pos), rate: (t) => engineRate("PayPal", "In-person", t) },
                      ],
                    },
                    {
                      title: "Online card payments",
                      options: [
                        { label: "Square", note: `${feeLabel(sq.onlinePaidOrApi)}, paid plans or API`, rate: (t) => engineRate("Square", "Online", t) },
                        { label: "Square Free", note: feeLabel(sq.onlineFree), rate: () => flatEffective(sq.onlineFree) },
                        { label: "PayPal button", note: `${feeLabel(pp.checkout)}, Checkout`, rate: () => flatEffective(pp.checkout) },
                      ],
                    },
                  ]}
                  footnote={<>Square in person uses its cheapest plan at each volume: Free ({feeLabel(sq.inPersonFree)}) at $10K, and Premium ({feeLabel(sq.inPersonPremium)} plus ${sq.planPremium} a month) once that costs less. PayPal&apos;s Advanced Credit and Debit ({feeLabel(pp.advancedCard)}) needs PayPal&apos;s approval and is not shown.</>}
                />
              </header>

              <nav className="py-10 border-b border-border">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">In This Article</h2>
                <ol className="grid md:grid-cols-2 gap-2 text-sm list-decimal list-inside">
                  {[
                    { href: "#overview", label: "Quick Overview" },
                    { href: "#pricing", label: "Pricing & Fees" },
                    { href: "#features", label: "Core Features" },
                    { href: "#hardware", label: "Hardware & POS" },
                    { href: "#international", label: "International Support" },
                    { href: "#support", label: "Customer Support" },
                    { href: "#best-for", label: "Best Use Cases" },
                    { href: "#verdict", label: "Final Verdict" },
                    { href: "#faq", label: "FAQ" },
                  ].map((item) => (
                    <li key={item.href} className="text-muted-foreground">
                      <a href={item.href} className="text-primary hover:underline">{item.label}</a>
                    </li>
                  ))}
                </ol>
              </nav>

              <section className="py-10 border-b border-border">
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Choosing between Square and PayPal is one of the most common dilemmas for small business owners. Both are household names in payment processing, but they excel in different areas and serve different business needs.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  <a href="https://squareup.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">Square</a> has built its reputation on elegant, user-friendly point-of-sale systems perfect for in-person retail and restaurants. <a href="https://www.paypal.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">PayPal</a> dominates online payments with unmatched brand recognition and customer trust.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  The lines have blurred: Square now sells online too, and PayPal sells in person through PayPal POS. This guide compares them on fees first, using each provider&apos;s own pricing page, then on features.
                </p>
              </section>

              <section id="overview" className="py-10 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">Square vs PayPal: Quick Overview</h2>
                <div className="overflow-x-auto -mx-4 px-4 mb-8">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-foreground">
                        <th className="py-3 text-left font-semibold"></th>
                        <th className="py-3 text-center font-semibold">Square</th>
                        <th className="py-3 text-center font-semibold">PayPal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr><td className="py-3 font-medium">Founded</td><td className="py-3 text-center">2009</td><td className="py-3 text-center">1998</td></tr>
                      <tr><td className="py-3 font-medium">Best Known For</td><td className="py-3 text-center">POS Hardware & Retail</td><td className="py-3 text-center">Online Payments</td></tr>
                      <tr><td className="py-3 font-medium">Ideal Customer</td><td className="py-3 text-center">Brick & Mortar, Restaurants</td><td className="py-3 text-center">Ecommerce, International</td></tr>
                      <tr><td className="py-3 font-medium">In-person rate</td><td className="py-3 text-center">{feeLabel(sq.inPersonFree)} (Free plan)</td><td className="py-3 text-center">{feeLabel(pp.pos)}</td></tr>
                      <tr><td className="py-3 font-medium">Monthly fee</td><td className="py-3 text-center">$0 Free, ${sq.planPlus} Plus, ${sq.planPremium} Premium</td><td className="py-3 text-center">$0 for POS and Advanced</td></tr>
                    </tbody>
                  </table>
                </div>
                <h3 className="text-lg font-semibold mb-4">Quick Verdict</h3>
                <p className="mb-4"><strong>Choose Square if:</strong> You need in-person payment processing, want great POS hardware, run a retail store or restaurant, value integrated inventory management, or operate both physical and online stores.</p>
                <p><strong>Choose PayPal if:</strong> You&apos;re primarily online, your customers prefer PayPal checkout, you sell internationally, or you want the lowest flat in-person rate of the two.</p>
              </section>

              <section id="pricing" className="py-10 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground mb-4">Pricing & Fees Comparison</h2>
                <p className="text-muted-foreground mb-6">
                  Both Square and PayPal use flat-rate pricing, so the cost of a sale is easy to predict. The rates differ a lot between in-person and online payments, and Square&apos;s also depend on its plan. For how the card networks&apos; cost fits under these prices, see our guide to <Link href="/insights/payment-processor-fees-guide" className="text-primary hover:underline">credit card processing fees</Link>.
                </p>
                <h3 className="text-lg font-semibold mb-4">Transaction Fees</h3>
                <div className="overflow-x-auto -mx-4 px-4 mb-8">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-foreground">
                        <th className="py-3 text-left font-semibold">Transaction Type</th>
                        <th className="py-3 text-center font-semibold">Square</th>
                        <th className="py-3 text-center font-semibold">PayPal</th>
                        <th className="py-3 text-center font-semibold">Winner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[
                        { type: "In person", square: `${feeLabel(sq.inPersonFree)} Free; ${feeLabel(sq.inPersonPremium)} Premium`, paypal: `${feeLabel(pp.pos)} POS`, winner: "PayPal" },
                        { type: "Online", square: `${feeLabel(sq.onlinePaidOrApi)} paid plans or API; ${feeLabel(sq.onlineFree)} Free`, paypal: `${feeLabel(pp.checkout)} Checkout; ${feeLabel(pp.advancedCard)} Advanced, with approval`, winner: "Depends" },
                        { type: "Manual entry", square: feeLabel(sq.manual), paypal: `${feeLabel(pp.posManual)} POS; ${feeLabel(pp.virtualTerminal)} Virtual Terminal`, winner: "PayPal" },
                        { type: "International cards", square: `+${sq.internationalAddPct}%`, paypal: `+${pp.internationalAddPct}%`, winner: "Tie" },
                        { type: "Instant payout", square: `${sq.instantPayoutPct}%`, paypal: `${pp.instantPayoutPct}% (50¢ min)`, winner: "PayPal" },
                        { type: "Monthly fee", square: `$0 Free; $${sq.planPlus} Plus; $${sq.planPremium} Premium`, paypal: "$0 for POS and Advanced", winner: "Tie at $0" },
                      ].map((row, i) => (
                        <tr key={i}>
                          <td className="py-3 font-medium">{row.type}</td>
                          <td className="py-3 text-center">{row.square}</td>
                          <td className="py-3 text-center">{row.paypal}</td>
                          <td className="py-3 text-center text-primary font-medium">{row.winner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-muted-foreground mb-6">
                  The online winner depends on which PayPal product you use. The Checkout button costs more than Square on every sale; Advanced Credit and Debit costs about the same as Square&apos;s paid plans but needs PayPal&apos;s approval. The monthly cost at $10K, $50K and $250K is in the table at the top of this page.
                </p>
              </section>

              <section id="features" className="py-10 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">Core Features Head-to-Head</h2>
                <h3 className="text-lg font-semibold mb-4">Point of Sale (POS) Features</h3>
                <p className="text-muted-foreground mb-4"><strong>Square POS</strong> offers an intuitive interface, comprehensive inventory management with variants, built-in employee time tracking, table management for restaurants, customer directory with purchase history, and crucially - offline mode that processes payments without internet.</p>
                <p className="text-muted-foreground mb-6"><strong>PayPal POS</strong> provides a simpler interface with basic inventory tracking, receipt customization, and sales analytics. It covers the basics but lacks the depth of Square&apos;s POS.</p>
                <p className="mb-6"><strong>Winner: Square.</strong> For any business where in-person POS is primary - retail, restaurants, salons - Square provides a superior experience.</p>

                <figure className="my-6 border-l-4 border-primary bg-muted/40 px-5 py-4 rounded-r-md">
                  <blockquote cite="https://www.nerdwallet.com/business/software/learn/stripe-vs-paypal-vs-square" className="text-foreground italic leading-relaxed">
                    &ldquo;If you use PayPal POS to accept card payments in-person, you&rsquo;ll get access to some of the lowest flat rates out there.&rdquo;
                  </blockquote>
                  <figcaption className="mt-2 text-sm text-muted-foreground not-italic">
                    Hillary Crawford, Lead Writer &amp; Content Strategist, <a href="https://www.nerdwallet.com/business/software/learn/stripe-vs-paypal-vs-square" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">NerdWallet</a>
                  </figcaption>
                </figure>

                <h3 className="text-lg font-semibold mb-4">Payment Methods Accepted</h3>
                <div className="overflow-x-auto -mx-4 px-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-foreground">
                        <th className="py-3 text-left font-semibold">Payment Method</th>
                        <th className="py-3 text-center font-semibold">Square</th>
                        <th className="py-3 text-center font-semibold">PayPal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[
                        { method: "Credit/Debit Cards", square: true, paypal: true },
                        { method: "Apple Pay / Google Pay", square: true, paypal: true },
                        { method: "PayPal Account", square: false, paypal: true },
                        { method: "Venmo", square: false, paypal: true },
                        { method: "Cash App Pay", square: true, paypal: false },
                        { method: "Buy Now Pay Later", square: true, paypal: true },
                        { method: "Gift Cards", square: true, paypal: false },
                      ].map((row, i) => (
                        <tr key={i}>
                          <td className="py-3">{row.method}</td>
                          <td className="py-3 text-center">{row.square ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground mx-auto" />}</td>
                          <td className="py-3 text-center">{row.paypal ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <X className="w-4 h-4 text-muted-foreground mx-auto" />}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section id="hardware" className="py-10 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground mb-4">Hardware & POS Systems</h2>
                <p className="text-muted-foreground mb-6">Square&apos;s hardware starts at $59 and runs up to countertop registers, all built for its own POS software. PayPal POS offers a card reader and a terminal; its POS page does not list their prices, and Tap to Pay in the PayPal app needs no hardware.</p>
                <p><strong>Winner: Square.</strong> More devices, and one system from reader to register.</p>
              </section>

              <section id="international" className="py-10 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground mb-4">International Business Support</h2>
                <p className="text-muted-foreground mb-6">
                  On fees it is a tie: Square adds {sq.internationalAddPct}% for international cards and PayPal adds {pp.internationalAddPct}% for international commercial transactions. The difference is reach. PayPal works in far more countries and currencies than Square, and many buyers abroad already have a PayPal account.
                </p>
                <p><strong>Winner: PayPal</strong> for selling abroad.</p>
              </section>

              <section id="support" className="py-10 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground mb-4">Customer Support & Reliability</h2>
                <p className="text-muted-foreground">Square generally has better-rated customer support based on merchant reviews. The bigger concern with PayPal is their tendency to hold merchant funds.</p>
              </section>

              <section id="best-for" className="py-10 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">Which Is Best for Your Business?</h2>
                <h3 className="text-lg font-semibold mb-3">Choose Square If:</h3>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
                  <li>You have a physical retail location</li>
                  <li>You run a restaurant or cafe</li>
                  <li>You need a full range of POS hardware</li>
                  <li>You want unified online/offline inventory</li>
                </ul>
                <h3 className="text-lg font-semibold mb-3">Choose PayPal If:</h3>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
                  <li>You primarily sell online</li>
                  <li>Your customers prefer PayPal checkout</li>
                  <li>You sell to buyers in other countries</li>
                  <li>Brand trust is critical for conversions</li>
                </ul>
              </section>

              <section id="verdict" className="py-10 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground mb-4">Final Verdict</h2>
                <p className="text-muted-foreground mb-4"><strong>Square</strong> is the better choice for businesses with physical locations.</p>
                <p className="text-muted-foreground mb-4"><strong>PayPal</strong> wins for pure ecommerce businesses and international sellers.</p>
                <p className="text-muted-foreground"><strong>Tip:</strong> many businesses use both, Square at the counter and PayPal as a checkout button online.</p>
              </section>

              <section id="faq" className="py-10 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
                <div className="space-y-8">
                  {FAQ.map((faq, i) => (
                    <div key={i}>
                      <h3 className="font-semibold mb-2">{faq.q}</h3>
                      <p className="text-sm text-muted-foreground">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="py-12 text-center">
                <h2 className="text-2xl font-bold mb-4">Still Not Sure Which Is Right for You?</h2>
                <p className="text-muted-foreground mb-6">Take our 60-second quiz and get a personalized recommendation.</p>
                <Button size="lg" onClick={() => setQuizOpen(true)}>
                  Get Your Recommendation <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </section>

              <section className="py-10 border-t border-border">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Related Comparisons</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { href: "/comparisons/square-vs-stripe", label: "Square vs Stripe" },
                    { href: "/comparisons/stripe-vs-paypal", label: "Stripe vs PayPal" },
                    { href: "/comparisons/helcim-vs-stripe", label: "Helcim vs Stripe" },
                    { href: "/comparisons", label: "All Comparisons" },
                  ].map((link) => (
                    <Link key={link.href} href={link.href} className="flex items-center gap-2 text-primary hover:underline text-sm group">
                      {link.label}
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              </section>

              <ReviewerBioBox linkProfile={false} />

              <footer className="py-8 border-t border-border">
                <p className="text-xs text-muted-foreground">Disclosure: We may earn a commission if you sign up through our links. This does not affect our ratings or recommendations.</p>
              </footer>
            </article>

            <ArticleSidebar currentSlug="/comparisons/paypal-vs-square" />
          </div>
        </div>
      {relatedLinks}
      </main>
      <PaymentQuiz open={quizOpen} onOpenChange={setQuizOpen} />
    </>
  );
}

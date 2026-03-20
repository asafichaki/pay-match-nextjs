"use client";

import Link from "next/link";
import { ArrowRight, Check, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import PaymentQuiz from "@/components/PaymentQuiz";
import ArticleSidebar from "@/components/ArticleSidebar";

export default function PayPalVsSquareContent() {
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-12 justify-center">
            <article className="max-w-3xl flex-1 min-w-0">
              <header className="pt-16 pb-10 border-b border-border">
                <p className="text-sm font-medium text-primary mb-4">Payment Processor Comparison</p>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8 leading-[1.1] tracking-tight">
                  Square vs PayPal: Complete Comparison for Small Businesses (2026)
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                  In-person POS vs online payments excellence. A comprehensive breakdown of fees, features, and best use cases to help you decide which platform suits your business model.
                </p>
                <div className="flex items-center gap-4">
                  <img src="/images/hannah-sutton.png" alt="Hannah Sutton" className="w-12 h-12 rounded-full object-cover object-top" />
                  <div>
                    <p className="font-semibold text-foreground">Hannah Sutton</p>
                    <p className="text-sm text-muted-foreground">Finance & Payments Analyst - Updated January 2026</p>
                  </div>
                </div>
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
                  But the lines have blurred - Square now offers robust online payment tools, while PayPal has entered the in-person POS market with Zettle. So which one truly fits your business best? After testing both platforms extensively, this guide provides an unbiased comparison.
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
                      <tr><td className="py-3 font-medium">Countries</td><td className="py-3 text-center">8</td><td className="py-3 text-center">200+</td></tr>
                      <tr><td className="py-3 font-medium">Annual Volume</td><td className="py-3 text-center">$200B+</td><td className="py-3 text-center">$1.4T+</td></tr>
                    </tbody>
                  </table>
                </div>
                <h3 className="text-lg font-semibold mb-4">Quick Verdict</h3>
                <p className="mb-4"><strong>Choose Square if:</strong> You need in-person payment processing, want great POS hardware, run a retail store or restaurant, value integrated inventory management, or operate both physical and online stores.</p>
                <p><strong>Choose PayPal if:</strong> You're primarily online, your customers prefer PayPal checkout, you sell internationally, you need faster access to funds, or brand trust is critical for your conversion rates.</p>
              </section>

              <section id="pricing" className="py-10 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground mb-4">Pricing & Fees Comparison</h2>
                <p className="text-muted-foreground mb-6">
                  Both Square and PayPal use flat-rate pricing, making costs predictable. However, rates differ significantly between in-person and online transactions. Understanding <Link href="/insights/credit-card-processing-fees-explained" className="text-primary hover:underline">credit card processing fees</Link> is crucial.
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
                        { type: "In-Person", square: "2.6% + $0.10", paypal: "2.29% + $0.09", winner: "PayPal" },
                        { type: "Online/Ecommerce", square: "2.9% + $0.30", paypal: "2.99% + $0.49", winner: "Square" },
                        { type: "Invoices", square: "2.9% + $0.30", paypal: "2.99% + $0.49", winner: "Square" },
                        { type: "Manual Entry", square: "3.5% + $0.15", paypal: "3.49% + $0.49", winner: "Square" },
                        { type: "International Cards", square: "+1.0%", paypal: "+1.5%", winner: "Square" },
                        { type: "Currency Conversion", square: "+1.0%", paypal: "+3% to 4%", winner: "Square" },
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
                <h3 className="text-lg font-semibold mb-4">Cost Analysis: $50,000 Monthly Processing</h3>
                <p className="text-muted-foreground mb-4"><strong>Primarily In-Person (70/30 split):</strong> Square costs $1,262/month vs PayPal at $1,233/month. <em>PayPal saves $348/year.</em></p>
                <p className="text-muted-foreground mb-6"><strong>Primarily Online (70/30 split):</strong> Square costs $1,407/month vs PayPal at $1,466/month. <em>Square saves $708/year.</em></p>
              </section>

              <section id="features" className="py-10 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">Core Features Head-to-Head</h2>
                <h3 className="text-lg font-semibold mb-4">Point of Sale (POS) Features</h3>
                <p className="text-muted-foreground mb-4"><strong>Square POS</strong> offers an intuitive interface, comprehensive inventory management with variants, built-in employee time tracking, table management for restaurants, customer directory with purchase history, and crucially - offline mode that processes payments without internet.</p>
                <p className="text-muted-foreground mb-6"><strong>PayPal Zettle POS</strong> provides a simpler interface with basic inventory tracking, receipt customization, and sales analytics. While functional, it lacks the depth and polish of Square's offering.</p>
                <p className="mb-8"><strong>Winner: Square.</strong> For any business where in-person POS is primary - retail, restaurants, salons - Square provides a superior experience.</p>

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
                <p className="text-muted-foreground mb-6">For businesses needing in-person payment processing, hardware quality matters enormously. Square has a significant advantage here.</p>
                <p><strong>Winner: Square (by a wide margin).</strong> Square's hardware is superior in design, durability, and ecosystem integration.</p>
              </section>

              <section id="international" className="py-10 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground mb-4">International Business Support</h2>
                <div className="overflow-x-auto -mx-4 px-4 mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-foreground">
                        <th className="py-3 text-left font-semibold">Feature</th>
                        <th className="py-3 text-center font-semibold">Square</th>
                        <th className="py-3 text-center font-semibold">PayPal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr><td className="py-3">Countries Supported</td><td className="py-3 text-center">8</td><td className="py-3 text-center font-semibold text-primary">200+</td></tr>
                      <tr><td className="py-3">Currencies</td><td className="py-3 text-center">4 primary</td><td className="py-3 text-center font-semibold text-primary">100+</td></tr>
                      <tr><td className="py-3">Active Global Accounts</td><td className="py-3 text-center">-</td><td className="py-3 text-center font-semibold text-primary">435M+</td></tr>
                    </tbody>
                  </table>
                </div>
                <p><strong>Winner: PayPal (decisively).</strong> PayPal's international capabilities are vastly superior.</p>
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
                  <li>You need robust POS hardware</li>
                  <li>You want unified online/offline inventory</li>
                </ul>
                <h3 className="text-lg font-semibold mb-3">Choose PayPal If:</h3>
                <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
                  <li>You primarily sell online</li>
                  <li>Your customers prefer PayPal checkout</li>
                  <li>You sell internationally (200+ countries)</li>
                  <li>Brand trust is critical for conversions</li>
                </ul>
              </section>

              <section id="verdict" className="py-10 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground mb-4">Final Verdict</h2>
                <p className="text-muted-foreground mb-4"><strong>Square</strong> is the better choice for businesses with physical locations.</p>
                <p className="text-muted-foreground mb-4"><strong>PayPal</strong> wins for pure ecommerce businesses and international sellers.</p>
                <p className="text-muted-foreground"><strong>Pro Tip:</strong> Many successful businesses use both!</p>
              </section>

              <section id="faq" className="py-10 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
                <div className="space-y-8">
                  {[
                    { q: "Which is cheaper: Square or PayPal?", a: "It depends on your transaction mix. Square is cheaper for online transactions (2.9% + $0.30 vs PayPal's 2.99% + $0.49). PayPal's Zettle is cheaper for in-person (2.29% + $0.09 vs Square's 2.6% + $0.10)." },
                    { q: "Which has better hardware: Square or PayPal?", a: "Square has significantly better hardware with a complete range from the $49 mobile reader to the $799 Square Register." },
                    { q: "Is Square or PayPal better for online businesses?", a: "PayPal has a slight edge for pure online businesses due to higher conversion rates from brand recognition and one-click checkout." },
                    { q: "Which is better for international sales?", a: "PayPal is vastly better for international sales. PayPal operates in 200+ countries with 100+ currencies." },
                    { q: "Can I use both Square and PayPal?", a: "Yes! Many businesses use Square for in-person POS and PayPal as an online checkout option." },
                  ].map((faq, i) => (
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

              <footer className="py-8 border-t border-border">
                <p className="text-xs text-muted-foreground">Disclosure: We may earn a commission if you sign up through our links. This does not affect our ratings or recommendations.</p>
              </footer>
            </article>

            <ArticleSidebar currentSlug="/comparisons/paypal-vs-square" />
          </div>
        </div>
      </main>
      <PaymentQuiz open={quizOpen} onOpenChange={setQuizOpen} />
    </>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import PaymentQuiz from "@/components/PaymentQuiz";
import ArticleSidebar from "@/components/ArticleSidebar";
import { MatchCTA } from "@/components/MatchCTA";
import ReviewerBioBox from "@/components/ReviewerBioBox";

export default function SquareVsStripeContent() {
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
              Square vs Stripe: The Definitive Guide for 2026
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
              Two payment giants, two different philosophies. <a href="https://squareup.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Square</a> dominates
              brick-and-mortar with its all-in-one POS system. Stripe powers
              the internet economy with unmatched developer tools. Here's how to choose.
            </p>

            <div className="flex items-center gap-4">
              <img
                src="/images/hannah-sutton.png"
                alt="Hannah Sutton"
                className="w-12 h-12 rounded-full object-cover object-top"
              />
              <div>
                <p className="font-semibold text-foreground">Hannah Sutton</p>
                <p className="text-sm text-muted-foreground">Finance & Payments Analyst - December 2026</p>
              </div>
            </div>

            <MatchCTA
              variant="inline"
              headline="Square or Stripe — which fits your business?"
              subline="Skip the 4,000-word read. Get a 60-second match based on your channel mix, volume, and ticket size."
            />
          </header>

          <section className="py-10 border-b border-border aeo-answer">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">Quick Verdict</h2>
            <div className="space-y-4">
              <p className="text-lg text-foreground leading-relaxed">
                Square charges <strong>2.6% + $0.10</strong> in-person and <strong>2.9% + $0.30</strong> online. Stripe charges <strong>2.7% + $0.05</strong> in-person and <strong>2.9% + $0.30</strong> online.
                For physical retail under $80,000 monthly, Square is usually cheaper because hardware is free and tap-to-pay is built in. For online-only or developer-driven setups, Stripe wins on API depth, subscriptions, and global currency support.
              </p>
              <p className="text-foreground">
                <strong className="text-primary">Choose Square</strong> if you have a physical store and need an all-in-one <Link href="/insights" className="text-primary hover:underline">POS system</Link> with free hardware.
              </p>
              <p className="text-foreground">
                <strong className="text-primary">Choose Stripe</strong> if you're online-first and have technical resources for customization.
              </p>
            </div>
          </section>

          <nav className="py-10 border-b border-border">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">In This Article</h2>
            <ol className="grid md:grid-cols-2 gap-2 text-sm list-decimal list-inside">
              {[
                { href: "#comparison", label: "Quick Comparison" },
                { href: "#square", label: "What Is Square?" },
                { href: "#stripe", label: "What Is Stripe?" },
                { href: "#pricing", label: "Pricing Breakdown" },
                { href: "#pos", label: "POS Capabilities" },
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
                    { feature: "In-Person Rate", square: "2.6% + $0.10", stripe: "2.7% + $0.05", squareWins: true },
                    { feature: "Online Rate", square: "2.9% + $0.30", stripe: "2.9% + $0.30" },
                    { feature: "Free POS System", square: "Yes", stripe: "No", squareWins: true },
                    { feature: "Free Hardware", square: "Yes", stripe: "No", squareWins: true },
                    { feature: "Setup Difficulty", square: "Easy", stripe: "Moderate-Advanced", squareWins: true },
                    { feature: "API Quality", square: "Good", stripe: "Best-in-class", stripeWins: true },
                    { feature: "Countries", square: "8", stripe: "46", stripeWins: true },
                    { feature: "Currencies", square: "Limited", stripe: "135+", stripeWins: true },
                    { feature: "Subscription Billing", square: "Basic", stripe: "Advanced", stripeWins: true },
                    { feature: "24/7 Phone Support", square: "Yes", stripe: "No", squareWins: true },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 font-medium">{row.feature}</td>
                      <td className={`py-3 text-center ${row.squareWins ? 'text-primary font-semibold' : ''}`}>{row.square}</td>
                      <td className={`py-3 text-center ${row.stripeWins ? 'text-primary font-semibold' : ''}`}>{row.stripe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="square" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">What Is Square?</h2>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              <a href="https://squareup.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">Square</a> launched in 2009
              and revolutionized <Link href="/insights/credit-card-processing-fees-explained" className="text-primary hover:underline">payment processing</Link> with its iconic white card reader. Today, Square (now part of <a href="https://block.xyz" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Block, Inc.</a>)
              is a comprehensive business platform serving 4+ million merchants.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Key Facts</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li><strong>Founded:</strong> 2009 by Jack Dorsey</li>
                  <li><strong>Parent Company:</strong> <a href="https://block.xyz" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Block, Inc.</a></li>
                  <li><strong>Active Merchants:</strong> 4+ million</li>
                  <li><strong>Transaction Volume:</strong> $200+ billion annually</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-3">What Square Offers</h3>
                <ul className="space-y-1 text-muted-foreground text-sm">
                  <li>- <a href="https://squareup.com/us/en/point-of-sale" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Square POS</a> - Free point-of-sale</li>
                  <li>- <a href="https://squareup.com/us/en/online-store" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Square Online</a> - Free ecommerce</li>
                  <li>- <a href="https://squareup.com/us/en/point-of-sale/restaurants" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Square for Restaurants</a></li>
                  <li>- <a href="https://squareup.com/us/en/point-of-sale/retail" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Square for Retail</a></li>
                  <li>- <a href="https://squareup.com/us/en/banking" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Square Banking</a> - Business checking</li>
                </ul>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              <strong>Who Uses Square:</strong> Retail stores, restaurants, cafes, food trucks, salons, spas, service businesses, pop-up shops, farmers markets
            </p>
          </section>

          <section id="stripe" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">What Is Stripe?</h2>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              <strong className="text-foreground">Stripe</strong> is the global
              leader in payment infrastructure for the internet, founded in 2010 by brothers Patrick and John Collison.
              With a $50 billion valuation, Stripe powers payments for millions of online businesses. Learn more in our <Link href="/comparisons/stripe-vs-paypal" className="text-primary hover:underline">Stripe vs PayPal comparison</Link>.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Key Facts</h3>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li><strong>Founded:</strong> 2010</li>
                  <li><strong>Valuation:</strong> $50 billion</li>
                  <li><strong>Processing Volume:</strong> $640+ billion annually</li>
                  <li><strong>Countries:</strong> 46</li>
                  <li><strong>Currencies:</strong> 135+</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-3">What Stripe Offers</h3>
                <ul className="space-y-1 text-muted-foreground text-sm">
                  <li>- Stripe Payments - Core processing</li>
                  <li>- Stripe Billing - Subscriptions</li>
                  <li>- Stripe Connect - Marketplaces</li>
                  <li>- Stripe Radar - Fraud prevention</li>
                  <li>- <a href="https://stripe.com/terminal" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe Terminal</a> - In-person</li>
                </ul>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              <strong>Who Uses Stripe:</strong> SaaS companies, ecommerce stores, marketplaces, subscription businesses, mobile apps, tech startups. Powers: Amazon, Google, Shopify, Lyft, DoorDash
            </p>
          </section>

          <section id="pricing" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Pricing Breakdown</h2>

            <p className="text-muted-foreground mb-6">
              Understanding the complete cost structure is crucial for your bottom line.
            </p>

            <div className="overflow-x-auto -mx-4 px-4 mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-foreground">
                    <th className="py-3 text-left font-semibold">Transaction Type</th>
                    <th className="py-3 text-center font-semibold">Square</th>
                    <th className="py-3 text-center font-semibold">Stripe</th>
                    <th className="py-3 text-center font-semibold">Winner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { type: "In-Person (Card Present)", square: "2.6% + $0.10", stripe: "2.7% + $0.05", winner: "Square*" },
                    { type: "Online/Ecommerce", square: "2.9% + $0.30", stripe: "2.9% + $0.30", winner: "Tie" },
                    { type: "Keyed-In/Manual", square: "3.5% + $0.15", stripe: "3.4% + $0.30", winner: "Depends" },
                    { type: "ACH/Bank Transfer", square: "3.3% + $0.30", stripe: "0.8% (cap $5)", winner: "Stripe" },
                    { type: "International Cards", square: "Included", stripe: "+1.5%", winner: "Square" },
                    { type: "Chargeback Fee", square: "$0 (first $250/mo)", stripe: "$15", winner: "Square" },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-3 font-medium">{row.type}</td>
                      <td className="py-3 text-center">{row.square}</td>
                      <td className="py-3 text-center">{row.stripe}</td>
                      <td className={`py-3 text-center font-semibold ${row.winner !== 'Tie' && row.winner !== 'Depends' ? 'text-primary' : ''}`}>{row.winner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-muted-foreground mb-8">
              *Square is technically cheaper for in-person IF transaction is over $0.50. For smaller amounts, Stripe's lower fixed fee wins.
            </p>

            <h3 className="font-semibold text-foreground mb-4">Real-World Cost Examples</h3>

            <div className="space-y-6">
              <div className="border-l-2 border-primary pl-4">
                <h4 className="font-semibold text-foreground">Coffee Shop</h4>
                <p className="text-sm text-muted-foreground mb-2">$30K/month, $8 average transaction, 90% in-person</p>
                <p className="text-sm">
                  Square: <strong>$1,239/month</strong> | Stripe: <strong>$1,097/month</strong>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Stripe saves $142/mo BUT Square offers free POS + free hardware = better overall value
                </p>
              </div>

              <div className="border-l-2 border-primary pl-4">
                <h4 className="font-semibold text-foreground">SaaS Company</h4>
                <p className="text-sm text-muted-foreground mb-2">$100K/month, $200 average transaction, 100% online</p>
                <p className="text-sm">
                  Square: <strong>$3,050/month</strong> | Stripe: <strong>$3,050/month</strong>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Same price, but Stripe's subscription features are FAR superior for SaaS
                </p>
              </div>
            </div>
          </section>

          <section id="pos" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Point of Sale (POS) Systems</h2>

            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-foreground mb-3">Square POS</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>+ <strong>FREE</strong> full-featured POS app</li>
                  <li>+ Works on any device (iOS, Android, iPad)</li>
                  <li>+ Offline mode - process without internet</li>
                  <li>+ Inventory management with alerts</li>
                  <li>+ Employee management & permissions</li>
                  <li>+ Real-time analytics & reports</li>
                  <li>+ Multi-location support</li>
                  <li>+ Industry-specific: Restaurants, Retail, Appointments</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">Stripe Terminal</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>- No built-in POS software</li>
                  <li>+ Hardware readers available</li>
                  <li>+ SDK to build custom POS</li>
                  <li>+ Tap to Pay on iPhone (no hardware needed)</li>
                  <li>- Must integrate with third-party POS</li>
                  <li>- Not plug-and-play</li>
                </ul>
              </div>
            </div>

            <p className="mt-6 p-4 bg-muted/50 text-sm">
              <strong className="text-primary">POS Winner: Square (by far)</strong> - Unless you have developers to build a custom POS, Square is the obvious choice for in-person sales.
            </p>
          </section>

          <section id="features" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Features Comparison</h2>

            <div className="space-y-8">
              {[
                { title: "Hardware", square: "Free magstripe reader, $49-$799 for advanced. Full ecosystem.", stripe: "$59-$299 readers. Tap to Pay on iPhone (free, no hardware).", winner: "Square (free option)" },
                { title: "Subscriptions", square: "Basic recurring billing. Limited pricing models.", stripe: "Advanced: usage-based, metered, tiered, smart dunning, revenue recognition.", winner: "Stripe (by landslide)" },
                { title: "API & Developer", square: "Good REST API. Smaller developer community.", stripe: "Best-in-class. Exceptional docs. 100+ webhooks. CLI.", winner: "Stripe (gold standard)" },
                { title: "International", square: "8 countries only. No cross-border payments.", stripe: "46 countries. 135+ currencies. Local payment methods.", winner: "Stripe (far superior)" },
                { title: "Support", square: "24/7 phone + chat. Video tutorials. 4/5 rating.", stripe: "Email + chat only. No phone. Excellent for technical.", winner: "Square (phone available)" },
                { title: "Fraud Protection", square: "Built-in fraud detection. Limited customization.", stripe: "Radar ML fraud detection. Customizable rules. Risk scoring.", winner: "Stripe (more advanced)" },
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
                  <li>- You have a physical storefront</li>
                  <li>- You run a restaurant or cafe</li>
                  <li>- You're a service business (salon, spa)</li>
                  <li>- You need inventory management</li>
                  <li>- You manage employees</li>
                  <li>- You need to start immediately</li>
                  <li>- You have no developers</li>
                  <li>- You value 24/7 phone support</li>
                  <li>- You want free POS + hardware</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  <strong>Perfect for:</strong> Retail, restaurants, salons, service businesses, brick-and-mortar, startups
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-4 text-primary">Choose Stripe If:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>- You're primarily online</li>
                  <li>- You're a SaaS or subscription business</li>
                  <li>- You have developers</li>
                  <li>- You need customization</li>
                  <li>- You're international or expanding globally</li>
                  <li>- You're building mobile apps</li>
                  <li>- You're building a marketplace</li>
                  <li>- You need detailed analytics</li>
                  <li>- You're a fast-growing tech startup</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-4">
                  <strong>Perfect for:</strong> SaaS, ecommerce, tech startups, developers, international businesses, apps
                </p>
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
                    <li>+ Free POS system - fully-functional</li>
                    <li>+ Free hardware - magstripe reader</li>
                    <li>+ All-in-one platform</li>
                    <li>+ No coding required</li>
                    <li>+ Quick setup - live in minutes</li>
                    <li>+ 24/7 phone support</li>
                    <li>+ Offline mode</li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Cons</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>- Limited international (8 countries)</li>
                    <li>- Limited customization</li>
                    <li>- Basic API compared to Stripe</li>
                    <li>- Basic subscription features</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-4">Stripe</h3>
                <div className="mb-4">
                  <p className="text-sm font-medium text-primary mb-2">Pros</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>+ Best API - industry gold standard</li>
                    <li>+ Advanced features (Billing, Connect, Radar)</li>
                    <li>+ Global reach - 46 countries, 135+ currencies</li>
                    <li>+ Highly customizable</li>
                    <li>+ Superior documentation</li>
                    <li>+ Lower ACH fees (0.8%)</li>
                    <li>+ Volume discounts available</li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Cons</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>- Requires coding - not plug-and-play</li>
                    <li>- Setup takes hours to days</li>
                    <li>- No free POS software</li>
                    <li>- Limited phone support</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section id="faq" className="py-10 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>

            <div className="space-y-6">
              {[
                { q: "Which is cheaper, Square or Stripe?", a: "For in-person: Square is slightly cheaper (2.6% + $0.10 vs 2.7% + $0.05). For online: identical (2.9% + $0.30). For ACH: Stripe crushes (0.8% capped at $5 vs 3.3% + $0.30). Overall difference is minimal except for ACH payments." },
                { q: "Which is better for restaurants?", a: "Square wins for restaurants. Square for Restaurants offers table management, course firing, menu modifiers, kitchen display system, tableside ordering, split checks, and tip pooling. Stripe would require building or buying third-party restaurant POS." },
                { q: "Which is better for SaaS/subscription businesses?", a: "Stripe wins hands down. Stripe Billing offers usage-based pricing, metered billing, tiered pricing, per-seat pricing, smart dunning, revenue recognition, and customer portal. Square only offers basic recurring billing." },
                { q: "Do I need a developer for Stripe?", a: "Not necessarily. You don't need a developer if using Stripe with platforms like Shopify/WooCommerce, Stripe Checkout hosted pages, or simple payment links. Developers are helpful for custom checkout design and required for building marketplaces or complex automation." },
                { q: "Can I accept international payments with Square?", a: "Very limited. Square only operates in 8 countries with no currency conversion or local payment methods. Stripe supports 46 countries, 135+ currencies, and local payment methods - making it the clear choice for international businesses." },
                { q: "Can I switch from Square to Stripe (or vice versa)?", a: "Yes, and it's straightforward with no cancellation fees from either processor. Timeline is typically 1-3 weeks including account setup, integration, customer data migration, and testing." },
              ].map((faq, i) => (
                <div key={i} className="border-b border-border pb-6 last:border-b-0">
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
                <strong className="text-primary">Square = Physical Business</strong> - Best all-in-one solution for any business with a physical location. Free to start, easy to use, everything included.
              </p>
              <p className="text-foreground">
                <strong className="text-primary">Stripe = Online Business</strong> - Best payment infrastructure for online businesses, especially with technical resources and growth plans.
              </p>
            </div>

            <p className="p-4 bg-muted/50 text-foreground">
              <strong>The Simple Truth:</strong> Both are excellent. The right choice depends entirely on your business model. Choose Square for physical/hybrid businesses. Choose Stripe for online/tech businesses.
            </p>
          </section>

          <section className="py-12 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Not Sure Which Processor Is Right for You?
            </h2>
            <p className="text-muted-foreground mb-6">
              Take our 60-second quiz to get a personalized recommendation based on your
              business type, technical resources, and specific needs.
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
              <Link href="/comparisons/stripe-vs-paypal" className="text-primary hover:underline text-sm">Stripe vs PayPal &rarr;</Link>
              <Link href="/comparisons/paypal-vs-square" className="text-primary hover:underline text-sm">PayPal vs Square &rarr;</Link>
              <Link href="/comparisons/helcim-vs-stripe" className="text-primary hover:underline text-sm">Helcim vs Stripe &rarr;</Link>
              <Link href="/comparisons" className="text-primary hover:underline text-sm">View All Comparisons &rarr;</Link>
            </div>
          </section>

          <ReviewerBioBox />

          <footer className="py-8 border-t border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Disclosure: This review is based on our independent analysis and testing. We may earn a commission if you sign up through our links, at no extra cost to you. This helps us keep our content free and unbiased.
            </p>
          </footer>
        </article>

        <ArticleSidebar currentSlug="/comparisons/square-vs-stripe" />
          </div>
        </div>
      </main>

      <PaymentQuiz open={quizOpen} onOpenChange={setQuizOpen} />
    </>
  );
}

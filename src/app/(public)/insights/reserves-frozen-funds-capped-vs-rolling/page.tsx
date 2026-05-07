import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import Link from "next/link";
import { BARAK_PERSON_SCHEMA, BARAK_NAME, BARAK_TITLE, BARAK_LINKEDIN } from "@/data/personas/barak";

const URL = "https://www.mypayadvisor.com/insights/reserves-frozen-funds-capped-vs-rolling";
const TITLE = "Capped vs. Rolling Reserves: A 2026 Guide to Reserve Negotiation";
const DESC = "What a processor reserve actually is, the difference between rolling and capped reserves, the math on $300K in trapped working capital, the path-to-release language to insist on, and how to push back when offered rolling.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: URL },
  robots: { index: true, follow: true },
  openGraph: { type: "article", url: URL, title: TITLE, description: DESC, images: [{ url: "https://www.mypayadvisor.com/og-logo.png" }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

export default function Page() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Capped vs Rolling Reserves: How to Negotiate Reserves in 2026",
    "description": DESC,
    "image": "https://www.mypayadvisor.com/og-logo.png",
    "author": { "@type": "Person", "name": BARAK_NAME, "url": "https://www.mypayadvisor.com/about/barak", "sameAs": [BARAK_LINKEDIN] },
    "reviewedBy": BARAK_PERSON_SCHEMA,
    "publisher": { "@type": "Organization", "name": "myPayAdvisor", "logo": { "@type": "ImageObject", "url": "https://www.mypayadvisor.com/og-logo.png" } },
    "datePublished": "2026-05-07",
    "dateModified": "2026-05-07",
    "mainEntityOfPage": { "@type": "WebPage", "@id": URL }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.mypayadvisor.com" },
      { "@type": "ListItem", "position": 2, "name": "Insights", "item": "https://www.mypayadvisor.com/insights" },
      { "@type": "ListItem", "position": 3, "name": TITLE, "item": URL }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Why do payment processors hold a reserve?", "acceptedAnswer": { "@type": "Answer", "text": "A reserve protects the processor against future chargebacks, refunds, and merchant insolvency. The processor is on the hook to the card networks if your business disappears with unfulfilled orders. The reserve is their hedge. The amount and structure are negotiable. Whether one exists at all is sometimes negotiable too." } },
      { "@type": "Question", "name": "Is a rolling reserve normal?", "acceptedAnswer": { "@type": "Answer", "text": "Rolling reserves are normal in higher-risk verticals (subscriptions with churn, travel, ticketing, supplements, anything regulated). They are not normal for low-risk retail or services. If you are being offered a rolling reserve in a low-risk vertical, push back hard or move to a processor that offers a capped reserve or none at all." } },
      { "@type": "Question", "name": "How long does a typical reserve last?", "acceptedAnswer": { "@type": "Answer", "text": "Rolling reserves at 5% to 10% with 180-day hold are typical at onboarding. Most processors will release after 6 to 12 months of clean operation if you ask in writing. The key is having a written release path in the contract before signing, not after." } },
      { "@type": "Question", "name": "What happens to my reserve if I change processors?", "acceptedAnswer": { "@type": "Answer", "text": "The reserve releases on the schedule in the contract, regardless of whether you stay or leave. If you leave, the processor holds the reserve until the chargeback window for the last batch of transactions closes (180 days for most card-not-present). Plan for 6 months between switching processors and getting the final reserve back." } },
      { "@type": "Question", "name": "Can I negotiate a reserve down after the account is open?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, after 6 months of clean operation. Email the processor with your chargeback rate (it should be under 1%), your refund rate, and a request to release the reserve or convert from rolling to capped. Most processors will agree because keeping a reserve on a clean account is operational overhead they would rather drop." } }
    ]
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />

      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="flex gap-12 justify-center">
          <article className="max-w-3xl flex-1 min-w-0">
            <header className="mb-12 border-b border-border pb-8">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="font-medium text-primary">Cornerstone</span>
                <span>•</span>
                <span>Published May 2026</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground leading-tight mb-6">
                Capped vs Rolling Reserves: How to Negotiate Reserves in 2026
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                A rolling reserve at 10% on $500K monthly volume traps $300,000 of your working capital across 180 days. That is not a risk control. That is a structural problem with the contract. Here is how reserves actually work, what to insist on, and what to do if your funds are already frozen.
              </p>
              <p className="text-sm text-muted-foreground mt-3">
                By{" "}
                <Link href="/about/barak" className="font-medium text-foreground hover:text-primary underline">{BARAK_NAME}</Link>
                , {BARAK_TITLE} ·{" "}
                <a href={BARAK_LINKEDIN} target="_blank" rel="noopener noreferrer" className="hover:text-primary underline">LinkedIn</a>
              </p>
            </header>

            <nav className="mb-12 p-6 bg-muted/30 rounded-lg">
              <h2 className="text-lg font-semibold text-foreground mb-4">In this article</h2>
              <ul className="space-y-2 text-sm">
                <li><a href="#what-a-reserve-is" className="text-muted-foreground hover:text-primary transition-colors">What a reserve is and why processors hold one</a></li>
                <li><a href="#rolling-mechanics" className="text-muted-foreground hover:text-primary transition-colors">Rolling reserve mechanics</a></li>
                <li><a href="#capped-mechanics" className="text-muted-foreground hover:text-primary transition-colors">Capped reserve mechanics</a></li>
                <li><a href="#release-language" className="text-muted-foreground hover:text-primary transition-colors">Path-to-release language</a></li>
                <li><a href="#push-back" className="text-muted-foreground hover:text-primary transition-colors">How to push back on rolling</a></li>
                <li><a href="#already-frozen" className="text-muted-foreground hover:text-primary transition-colors">If funds are already frozen</a></li>
                <li><a href="#faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </nav>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-foreground leading-relaxed">
                A reserve is the line item on a processing contract that nobody reads carefully and everybody regrets later. It does not show up on your P&amp;L. It does not show up on the rate page of the contract. It shows up the first month volume scales and you realize 10% of every settlement is being held back somewhere you cannot see.
              </p>
              <p className="text-foreground leading-relaxed">
                The reserve is the most expensive number on the contract that nobody negotiates. This guide fixes that.
              </p>

              <h2 id="what-a-reserve-is" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                What a reserve is and why processors hold one
              </h2>
              <p className="text-foreground leading-relaxed">
                A reserve is a portion of your settlements held by the processor as a hedge against future chargebacks, refunds, and merchant insolvency. If a customer disputes a charge 90 days after purchase, the processor refunds the customer. If your business has shut down by then, the processor eats the loss unless they have your money on hand.
              </p>
              <p className="text-foreground leading-relaxed">
                That is the legitimate reason reserves exist. The legitimate amount, on a low-risk merchant, is zero. The legitimate amount, on a higher-risk merchant, is enough to cover 60 to 90 days of expected chargebacks plus a buffer. Anything beyond that is the processor using your money as float.
              </p>
              <p className="text-foreground leading-relaxed">
                Three reserve structures exist. Capped reserve, rolling reserve, and upfront reserve. Each works differently. Each has different working-capital implications.
              </p>

              <h2 id="rolling-mechanics" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Rolling reserve mechanics
              </h2>
              <p className="text-foreground leading-relaxed">
                Rolling reserve withholds a percentage of every settlement and releases each batch back after a fixed period, usually 180 days. The reserve is always growing as new volume comes in and always releasing as old batches mature.
              </p>
              <div className="my-8 p-6 bg-orange-50 dark:bg-orange-950/20 rounded-lg border-l-4 border-orange-500">
                <p className="text-foreground"><strong>The math on $500K monthly volume at 10% rolling, 180-day hold:</strong></p>
                <p className="text-foreground mt-2">Month 1: $50,000 withheld. Cumulative: $50,000.</p>
                <p className="text-foreground">Month 2: $50,000 withheld. Cumulative: $100,000.</p>
                <p className="text-foreground">Month 6: $50,000 withheld. Cumulative: $300,000.</p>
                <p className="text-foreground">Month 7: $50,000 withheld. Month 1 releases. Cumulative: $300,000.</p>
                <p className="text-foreground mt-2">Steady state after 6 months: $300,000 of your working capital permanently parked at the processor as long as the reserve structure is in force.</p>
              </div>
              <p className="text-foreground leading-relaxed">
                That $300,000 is not earning you interest. It is not available for inventory, payroll, or growth. It is sitting in a processor-controlled account, often non-interest-bearing, until the rolling release schedule says it can come back. And every new month adds more.
              </p>

              <h2 id="capped-mechanics" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Capped reserve mechanics
              </h2>
              <p className="text-foreground leading-relaxed">
                Capped reserve withholds a percentage of settlements until a fixed dollar cap is reached. After that, settlements release at 100%. The reserve sits at the cap until either the contract ends or a release condition is triggered.
              </p>
              <p className="text-foreground leading-relaxed">
                On the same $500K monthly account at 10% with a $50,000 cap: month 1 withholds $50,000, the cap is reached, every subsequent month settles at 100%. Total trapped working capital: $50,000. Versus $300,000 on rolling. That is the difference, and that is why the structure matters more than the percentage.
              </p>
              <p className="text-foreground leading-relaxed">
                Capped reserve is what you should be asking for. Always.
              </p>

              <h2 id="release-language" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Path-to-release language to insist on
              </h2>
              <p className="text-foreground leading-relaxed">
                Whatever reserve structure you accept, the contract must spell out the release path. Without it, the reserve is functionally permanent. Insist on language that includes:
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>A specific dollar cap or percentage cap.</strong> Not &quot;up to.&quot; A number.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>A release schedule.</strong> Capped reserves should release in full no later than 180 days after account closure. Rolling reserves should release each batch on its 180-day mark, automatic and visible in the dashboard.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>A step-down trigger.</strong> &quot;After 6 months of operation with chargeback rate below 1.0%, the reserve percentage steps down by half. After 12 months at the same threshold, the reserve releases entirely.&quot; This single sentence is worth more than any rate concession.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>An interest-bearing requirement (where possible).</strong> Some processors will hold the reserve in an interest-bearing account if you ask. Many will not, but it is worth asking. On $300,000 at 4%, that is $12,000 a year you are otherwise donating to the processor.
              </p>
              <div className="my-8 p-6 bg-primary/5 rounded-lg border-l-4 border-primary">
                <p className="text-foreground"><strong>Sample contract language:</strong> &quot;Reserve shall be capped at $X. Following 6 consecutive months of operation with chargeback rate below 1.0% and no fraud-related chargebacks, the reserve cap shall reduce by 50%. Following 12 consecutive months at the same threshold, the reserve shall be released in full. Any unreleased reserve at account closure shall be returned to merchant within 180 days, less any documented chargebacks or refunds.&quot;</p>
              </div>

              <h2 id="push-back" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                How to push back when offered rolling
              </h2>
              <p className="text-foreground leading-relaxed">
                The processor offers 10% rolling for 180 days. Your script:
              </p>
              <p className="text-foreground leading-relaxed">
                &quot;Rolling reserve does not work for the cash flow profile of this business. I am willing to accept a capped reserve at $X with the step-down language we just discussed. If you cannot offer that structure, I need to understand exactly what risk profile is driving the rolling structure, because the chargeback rate in the vertical is well below the threshold that should trigger it.&quot;
              </p>
              <p className="text-foreground leading-relaxed">
                Three things happen. The processor moves to capped (most common, especially in low-risk verticals). The processor explains the underwriting reason for rolling (fair, especially in higher-risk verticals). The processor refuses to move and refuses to explain. That third option is your signal to walk to a different processor.
              </p>
              <p className="text-foreground leading-relaxed">
                The full negotiation framework, including this specific lever, is in the <Link href="/insights/payment-processor-negotiation-playbook" className="text-primary hover:underline">Negotiation Playbook</Link>.
              </p>

              <h2 id="already-frozen" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                What to do if funds are already frozen
              </h2>
              <p className="text-foreground leading-relaxed">
                A frozen funds situation is different from a contractual reserve. Frozen funds happen when the processor halts payouts because of a sudden chargeback spike, a regulatory inquiry, an underwriting re-review, or a TMF/MATCH list flag.
              </p>
              <p className="text-foreground leading-relaxed">
                Step one: get the reason in writing. Email the processor and request the specific contract clause being invoked, the trigger event, and the conditions for release. Verbal explanations do not count. The contract has language. Make them point to it.
              </p>
              <p className="text-foreground leading-relaxed">
                Step two: assess the trigger. Chargeback spike? Pull the chargeback list and identify the cause. Regulatory inquiry? Get counsel. Underwriting re-review? Provide the documentation requested.
              </p>
              <p className="text-foreground leading-relaxed">
                Step three: stage your alternative. While the funds are frozen, set up a new merchant account with a different processor on different acquiring rails. New transactions go there. The frozen funds will eventually release on the contract schedule (typically 180 days after the last batch). Do not let the frozen funds tie you to the processor that froze them.
              </p>
              <p className="text-foreground leading-relaxed">
                Step four: if the freeze is unjustified, escalate. The acquirer (the bank behind the processor) is the actual decision maker. A letter from counsel to the acquirer&apos;s risk team often resolves freezes that the processor would not unwind.
              </p>
              <p className="text-foreground leading-relaxed">
                Before you scale into a vertical that triggers reserves and freezes routinely, audit the contract. Start with the <Link href="/insights/free-statement-audit-playbook" className="text-primary hover:underline">Statement Audit Playbook</Link> to confirm there is no hidden reserve language already in force.
              </p>

              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Upfront reserve: the third structure
              </h2>
              <p className="text-foreground leading-relaxed">
                Less common, but worth knowing. Upfront reserve is a flat dollar amount the merchant deposits at account opening, held until contract end or release condition. Common in higher-risk verticals where the processor wants the cushion immediately rather than building it through rolling withholdings.
              </p>
              <p className="text-foreground leading-relaxed">
                Upfront is sometimes the cleanest option. You write the check once, every settlement after that comes through at 100%, no rolling withholdings to track. The trade-off is the upfront capital outlay. On a $100,000 upfront reserve at 4% opportunity cost, that is $4,000 a year in foregone return.
              </p>
              <p className="text-foreground leading-relaxed">
                Compared to a 10% rolling reserve on $500K monthly volume that traps $300,000 across 180 days, the $100,000 upfront is materially cheaper in working-capital terms. If the underwriter insists on a reserve and capped is not on the table, ask whether upfront is.
              </p>

              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                The reserve cost calculation nobody runs
              </h2>
              <p className="text-foreground leading-relaxed">
                Operators evaluate processor offers on the rate. The rate is one variable. The reserve structure is another, often more important, variable. Run this math before signing:
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Trapped capital cost = (steady-state reserve balance) × (your cost of capital).</strong>
              </p>
              <p className="text-foreground leading-relaxed">
                On $500K monthly volume, 10% rolling, 180-day hold, the steady-state reserve balance is $300,000. If your cost of capital is 12% (typical for a small business with a working capital line), the reserve costs $36,000 per year in pure opportunity cost. Compare that to a 0.10% rate negotiation, which on $500K monthly is $6,000 per year. The reserve structure is six times the rate, and nobody is negotiating it.
              </p>
              <p className="text-foreground leading-relaxed">
                When evaluating two processor offers, always compute reserve cost in dollars per year alongside the rate cost in dollars per year. The processor with the slightly higher rate but capped reserve usually wins.
              </p>

              <h2 id="faq" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Frequently asked questions
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Why do payment processors hold a reserve?</h3>
                  <p className="text-foreground leading-relaxed">A reserve protects the processor against future chargebacks, refunds, and merchant insolvency. The processor is on the hook to the card networks if your business disappears with unfulfilled orders. The reserve is their hedge. The amount and structure are negotiable. Whether one exists at all is sometimes negotiable too.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Is a rolling reserve normal?</h3>
                  <p className="text-foreground leading-relaxed">Rolling reserves are normal in higher-risk verticals (subscriptions with churn, travel, ticketing, supplements, anything regulated). They are not normal for low-risk retail or services. If you are being offered a rolling reserve in a low-risk vertical, push back hard or move to a processor that offers a capped reserve or none at all.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">How long does a typical reserve last?</h3>
                  <p className="text-foreground leading-relaxed">Rolling reserves at 5% to 10% with 180-day hold are typical at onboarding. Most processors will release after 6 to 12 months of clean operation if you ask in writing. The key is having a written release path in the contract before signing, not after.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">What happens to my reserve if I change processors?</h3>
                  <p className="text-foreground leading-relaxed">The reserve releases on the schedule in the contract, regardless of whether you stay or leave. If you leave, the processor holds the reserve until the chargeback window for the last batch of transactions closes (180 days for most card-not-present). Plan for 6 months between switching processors and getting the final reserve back.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Can I negotiate a reserve down after the account is open?</h3>
                  <p className="text-foreground leading-relaxed">Yes, after 6 months of clean operation. Email the processor with your chargeback rate (it should be under 1%), your refund rate, and a request to release the reserve or convert from rolling to capped. Most processors will agree because keeping a reserve on a clean account is operational overhead they would rather drop.</p>
                </div>
              </div>

              <div className="not-prose mt-12 p-6 rounded-lg bg-primary/5 border border-primary/20">
                <h3 className="text-xl font-semibold text-foreground mb-2">Want a 15-minute call with Barak?</h3>
                <p className="text-foreground mb-4">If you want a second set of eyes on a contract, statement, or pricing offer, Barak takes a limited number of merchant calls per week.</p>
                <Link href="/quiz" className="inline-flex items-center px-5 py-2.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">Get my matched shortlist →</Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}

import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import Link from "next/link";
import { BARAK_PERSON_SCHEMA, BARAK_NAME, BARAK_TITLE, BARAK_LINKEDIN } from "@/data/personas/barak";

const URL = "https://www.mypayadvisor.com/insights/free-statement-audit-playbook";
const TITLE = "How to Audit Your Merchant Statement: The 6-Step Playbook";
const DESC = "A 6-step audit playbook for merchant statements: pull 90 days, compute your effective rate, classify line items, find the four hidden fees, build the negotiation case, and decide whether to renegotiate or switch.";

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
    "headline": "How to Audit Your Merchant Statement (and Find What You're Overpaying)",
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
      { "@type": "Question", "name": "How long does a merchant statement audit take?", "acceptedAnswer": { "@type": "Answer", "text": "A focused audit on a single processor takes 60 to 90 minutes if you have three months of statements in PDF. Pulling the statements is usually the slowest step. The math itself is one spreadsheet." } },
      { "@type": "Question", "name": "How much do merchants typically save after an audit?", "acceptedAnswer": { "@type": "Answer", "text": "On a $100K monthly volume account, a clean audit usually surfaces 0.20% to 0.45% of effective-rate savings, which is $2,400 to $5,400 per year. Above $500K monthly, savings often run six figures because the dollar base is larger and the contract was usually never renegotiated after the first year." } },
      { "@type": "Question", "name": "What is the most common hidden fee on a merchant statement?", "acceptedAnswer": { "@type": "Answer", "text": "The PCI non-compliance fee, usually $20 to $40 per month, charged because nobody completed the annual self-assessment questionnaire. After that: monthly minimum shortfall, batch fees, and statement fees. None of these are interchange. All of them are markup the processor keeps." } },
      { "@type": "Question", "name": "Should I do the audit myself or pay someone to do it?", "acceptedAnswer": { "@type": "Answer", "text": "If your monthly volume is under $50K, do it yourself with this playbook. If you are above $250K monthly and on a tiered or blended contract, paying for a third-party audit is usually worth it because the dollar savings dwarf the fee. Free audits offered by other processors are sales tools, not audits." } },
      { "@type": "Question", "name": "Can I negotiate using only one month of statements?", "acceptedAnswer": { "@type": "Answer", "text": "You can, but you lose leverage. A processor will argue your card mix was unusual that month. Three months is the minimum to make the negotiation airtight. Six months is better if your volume swings seasonally." } }
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
                How to Audit Your Merchant Statement (and Find What You&apos;re Overpaying)
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                A 6-step playbook to read your statement the way a payments operator does. Pull 90 days, compute your effective rate, classify the line items, find the four fees that are almost always hiding, then decide whether to renegotiate or switch.
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
                <li><a href="#what-an-audit-is" className="text-muted-foreground hover:text-primary transition-colors">What a statement audit actually is</a></li>
                <li><a href="#step-1" className="text-muted-foreground hover:text-primary transition-colors">Step 1: Pull 90 days of statements</a></li>
                <li><a href="#step-2" className="text-muted-foreground hover:text-primary transition-colors">Step 2: Compute the effective rate</a></li>
                <li><a href="#step-3" className="text-muted-foreground hover:text-primary transition-colors">Step 3: Classify every line item</a></li>
                <li><a href="#step-4" className="text-muted-foreground hover:text-primary transition-colors">Step 4: Spot the four hidden fees</a></li>
                <li><a href="#step-5" className="text-muted-foreground hover:text-primary transition-colors">Step 5: Build the negotiation case</a></li>
                <li><a href="#step-6" className="text-muted-foreground hover:text-primary transition-colors">Step 6: Pick the next move</a></li>
                <li><a href="#what-audits-uncover" className="text-muted-foreground hover:text-primary transition-colors">What audits typically uncover</a></li>
                <li><a href="#diy-vs-paid" className="text-muted-foreground hover:text-primary transition-colors">Free DIY vs paid audit</a></li>
                <li><a href="#faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </nav>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-foreground leading-relaxed">
                Most merchants have never read their processing statement line by line. The processor knows that. Pricing drifts up 0.05% here, a $25 fee appears there, and within 18 months the effective rate is 40 basis points higher than the day the contract was signed. An audit is how you get that back.
              </p>
              <p className="text-foreground leading-relaxed">
                This playbook walks through the exact 6 steps an operator runs on a new account. No software, no consultant. A spreadsheet, three statements, and about 90 minutes.
              </p>

              <h2 id="what-an-audit-is" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                What a statement audit actually is
              </h2>
              <p className="text-foreground leading-relaxed">
                An audit is not a sales pitch from another processor. It is a forensic read of three months of statements with one goal: separate what you cannot control (interchange and assessments) from what you can (the markup, the fees, the contract terms).
              </p>
              <p className="text-foreground leading-relaxed">
                Roughly 85% of your processing cost is interchange and network assessments. Those numbers are set by Visa, Mastercard, Amex, and Discover. They are the same regardless of who processes for you. The remaining 15% is the processor markup plus fixed fees. That 15% is the entire negotiation surface.
              </p>
              <p className="text-foreground leading-relaxed">
                The audit makes that 15% legible. Once you can see it, you can shrink it.
              </p>

              <h2 id="step-1" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Step 1: Pull 90 days of statements
              </h2>
              <p className="text-foreground leading-relaxed">
                Three months is the minimum. If your business is seasonal or your card mix shifts, pull six. You want PDFs, not screenshots, because the line-item detail at the back of the statement is what matters and screenshots usually crop it off.
              </p>
              <p className="text-foreground leading-relaxed">
                Most processor portals bury statement downloads two clicks deep. Look for &quot;Statements,&quot; &quot;Reports,&quot; or &quot;Documents.&quot; If you cannot find them, email your account rep and ask for the last 6 months as PDFs. Do not accept a summary. You need the full statement, including the interchange detail pages at the back.
              </p>
              <div className="my-8 p-6 bg-primary/5 rounded-lg border-l-4 border-primary">
                <p className="text-foreground"><strong>What a complete statement contains:</strong> a summary page, a fee schedule page, a deposit page, and 2 to 8 pages of interchange line items grouped by card type. If yours stops at the summary, the processor is hiding the interchange detail and that itself is a finding.</p>
              </div>

              <h2 id="step-2" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Step 2: Compute the effective rate
              </h2>
              <p className="text-foreground leading-relaxed">
                Open a spreadsheet. Three rows, one per month. Three columns: total processing volume, total fees paid (every fee on the statement, not just the discount line), and effective rate.
              </p>
              <p className="text-foreground leading-relaxed">
                Effective rate equals total fees divided by total volume, expressed as a percentage. If you processed $200,000 and paid $5,800 in fees, your effective rate is 2.90%.
              </p>
              <p className="text-foreground leading-relaxed">
                Now you have a real number. Not a marketing rate. Not the &quot;qualified rate&quot; on the contract. The actual rate.
              </p>
              <div className="my-8 p-6 bg-muted/30 rounded-lg border-l-4 border-primary">
                <p className="text-foreground"><strong>Benchmarks I use:</strong></p>
                <p className="text-foreground mt-2">Card-present retail with average ticket above $40: 2.10% to 2.50% is normal. Above 2.70% is overpaying.</p>
                <p className="text-foreground">Card-not-present ecommerce: 2.50% to 2.90% is normal. Above 3.10% is overpaying.</p>
                <p className="text-foreground">B2B with high commercial-card mix and no Level 2/3 enabled: 2.80% to 3.40% is normal. Above 3.50% means Level 2/3 is the next move.</p>
                <p className="text-foreground">Restaurants with tip adjustment: 2.20% to 2.60% is normal. Above 2.80% almost always means downgrades from late tip submission.</p>
              </div>

              <h2 id="step-3" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Step 3: Classify every line item
              </h2>
              <p className="text-foreground leading-relaxed">
                Every fee on the statement falls into one of three buckets:
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Pass-through (non-negotiable):</strong> Visa interchange, Mastercard interchange, Amex OptBlue interchange, Discover interchange, network assessments, NABU, APF, dues. These are set by the networks. The processor only collects them.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Markup (fully negotiable):</strong> the basis-point spread above interchange, the per-transaction authorization fee, monthly account fees, statement fees, batch fees, IRS reporting fees.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Junk (often waivable):</strong> PCI non-compliance fees, monthly minimums, annual fees, gateway fees that duplicate processor fees, &quot;regulatory product&quot; fees that are just renamed markup.
              </p>
              <p className="text-foreground leading-relaxed">
                Add a column to your spreadsheet and tag every line. The total of the &quot;markup&quot; and &quot;junk&quot; columns is your real bill from the processor. That is the number to attack.
              </p>

              <h2 id="step-4" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Step 4: Spot the four hidden fees
              </h2>
              <p className="text-foreground leading-relaxed">
                Four fees show up on roughly 80% of merchant statements I review. None of them are interchange. All of them are pure margin to the processor.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>1. PCI non-compliance fee.</strong> $20 to $40 per month, sometimes $99 per quarter, charged when the annual self-assessment questionnaire was never filed. Filing the SAQ takes 30 minutes and ends the fee. This alone is often $480 a year recovered.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>2. Monthly minimum shortfall.</strong> Contract sets a $25 minimum monthly processing fee. Slow months trigger the shortfall. Usually 100% negotiable away on a renewal.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>3. Batch and IRS reporting fees.</strong> $0.10 to $0.25 per batch, $7 per month for IRS 1099-K reporting. The 1099-K is something the processor is legally required to file. Charging extra for it is markup theater.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>4. &quot;Regulatory&quot; or &quot;network access&quot; fees.</strong> A flat percentage, often 0.10% to 0.20%, dressed up to look like a pass-through. It is not. It is markup with a costume.
              </p>
              <div className="my-8 p-6 bg-orange-50 dark:bg-orange-950/20 rounded-lg border-l-4 border-orange-500">
                <p className="text-foreground"><strong>Quick math:</strong> on $250K monthly volume, a 0.15% &quot;regulatory product fee&quot; is $375 per month, or $4,500 per year, that exists for no reason except that nobody asked about it.</p>
              </div>

              <h2 id="step-5" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Step 5: Build the negotiation case
              </h2>
              <p className="text-foreground leading-relaxed">
                Do not call the processor with feelings. Call with three numbers: your 90-day effective rate, the markup-only rate (interchange stripped out), and the dollar total of the four hidden fees.
              </p>
              <p className="text-foreground leading-relaxed">
                Then write a one-page request. It says: &quot;Move me to interchange-plus pricing at IC + 0.25% + $0.10. Waive PCI non-compliance because we have completed the SAQ. Drop the monthly minimum. Cap chargeback fees at $15. The alternative is I move the account.&quot;
              </p>
              <p className="text-foreground leading-relaxed">
                That is the negotiation. The processor will counter. The full lever-by-lever breakdown is in the <Link href="/insights/payment-processor-negotiation-playbook" className="text-primary hover:underline">Payment Processor Negotiation Playbook</Link>.
              </p>

              <h2 id="step-6" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Step 6: Pick the next move
              </h2>
              <p className="text-foreground leading-relaxed">
                Three options after the audit. Renegotiate, switch, or stay.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Renegotiate</strong> if your effective rate is within 0.20% of benchmark and the relationship is otherwise clean. Most processors will save the account.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Switch</strong> if your effective rate is more than 0.30% above benchmark, you are on tiered or blended pricing, the contract has more than 6 months left of early termination exposure, or the processor has held funds in a reserve you never agreed to. On reserves specifically, see <Link href="/insights/reserves-frozen-funds-capped-vs-rolling" className="text-primary hover:underline">Capped vs Rolling Reserves</Link>.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Stay</strong> only if the processor matches market and the integration cost of switching exceeds 12 months of savings.
              </p>

              <h2 id="what-audits-uncover" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                What audits typically uncover
              </h2>
              <p className="text-foreground leading-relaxed">
                Across roughly 200 statements I have reviewed in the last three years, here is the dollar range of what a clean audit surfaces:
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Under $50K monthly volume:</strong> $80 to $400 per month in junk fees and modest markup compression. Annual: $1,000 to $4,800.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>$50K to $250K monthly:</strong> 0.20% to 0.45% effective-rate reduction plus $300 to $800 per month in junk. Annual: $5,000 to $20,000.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>$250K to $1M monthly:</strong> 0.15% to 0.35% effective-rate reduction plus reserve and funding-window improvements. Annual: $20,000 to $80,000.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Above $1M monthly:</strong> the audit usually pays for a full RFP and a six-figure contract restructure. Often pairs with multi-acquirer routing, covered in <Link href="/insights/approval-rate-recovery-routing-acquirers-3ds" className="text-primary hover:underline">Approval Rate Recovery</Link>.
              </p>

              <p className="text-foreground leading-relaxed">
                One pattern shows up at every volume tier: the longer the contract has run without renegotiation, the bigger the gap. A 4-year-old contract is almost always 0.30% above a freshly negotiated one, regardless of who the processor is. Pricing drifts. Markup creeps. Junk fees accumulate. The audit is the forcing function that resets the clock.
              </p>
              <p className="text-foreground leading-relaxed">
                The second pattern: about 30% of audits surface a fee category the operator did not know existed. The most common surprise is the &quot;non-qualified&quot; bucket on tiered contracts, which is sometimes 40 to 60% of total volume getting charged at the highest tier. The operator was sold on the &quot;qualified&quot; rate. Their actual blended rate is 1.2% higher.
              </p>

              <h2 id="diy-vs-paid" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Free DIY vs paid audit
              </h2>
              <p className="text-foreground leading-relaxed">
                Three flavors of audit exist. They are not the same product.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>DIY (free, this playbook):</strong> works for any volume up to about $250K monthly. The math is not hard. The work is reading carefully.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Free audit from a competing processor:</strong> this is a sales tool. The competing processor will find real savings, but those savings come bundled with their own contract. The numbers are usually accurate. The recommendation is biased. Treat it as a second opinion, not as truth.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Paid third-party audit ($500 to $5,000):</strong> worth it above $500K monthly, especially on tiered or blended legacy contracts. The auditor has no skin in which processor you end up with, and the dollar findings usually clear 10x the fee in year one.
              </p>

              <h2 id="faq" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Frequently asked questions
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">How long does a merchant statement audit take?</h3>
                  <p className="text-foreground leading-relaxed">A focused audit on a single processor takes 60 to 90 minutes if you have three months of statements in PDF. Pulling the statements is usually the slowest step. The math itself is one spreadsheet.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">How much do merchants typically save after an audit?</h3>
                  <p className="text-foreground leading-relaxed">On a $100K monthly volume account, a clean audit usually surfaces 0.20% to 0.45% of effective-rate savings, which is $2,400 to $5,400 per year. Above $500K monthly, savings often run six figures because the dollar base is larger and the contract was usually never renegotiated after the first year.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">What is the most common hidden fee on a merchant statement?</h3>
                  <p className="text-foreground leading-relaxed">The PCI non-compliance fee, usually $20 to $40 per month, charged because nobody completed the annual self-assessment questionnaire. After that: monthly minimum shortfall, batch fees, and statement fees. None of these are interchange. All of them are markup the processor keeps.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Should I do the audit myself or pay someone to do it?</h3>
                  <p className="text-foreground leading-relaxed">If your monthly volume is under $50K, do it yourself with this playbook. If you are above $250K monthly and on a tiered or blended contract, paying for a third-party audit is usually worth it because the dollar savings dwarf the fee. Free audits offered by other processors are sales tools, not audits.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Can I negotiate using only one month of statements?</h3>
                  <p className="text-foreground leading-relaxed">You can, but you lose leverage. A processor will argue your card mix was unusual that month. Three months is the minimum to make the negotiation airtight. Six months is better if your volume swings seasonally.</p>
                </div>
              </div>

              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Worked example: a 90-day audit on a $180K monthly account
              </h2>
              <p className="text-foreground leading-relaxed">
                A specialty retail operator, three locations, $180K monthly volume across the chain, average ticket $58. They had been on the same processor for 5 years on tiered pricing.
              </p>
              <p className="text-foreground leading-relaxed">
                Step 1: pulled three monthly statements as PDFs. Step 2: total volume across the three months was $542,000. Total fees across the three months was $17,710. Effective rate: 3.27%.
              </p>
              <p className="text-foreground leading-relaxed">
                Step 3: classified line items. Interchange and assessments came in at $12,180 (2.25% of volume), which is normal for this card mix. Markup, fees, and junk: $5,530 (1.02% of volume). The 1.02% markup line is the tell. Healthy markup at this volume is 0.20% to 0.35%. Three times market.
              </p>
              <p className="text-foreground leading-relaxed">
                Step 4: hidden fees. PCI non-compliance at $30/month per location, $90/month total, $1,080 per year. Monthly minimum shortfall on the slowest location: $25/month, $300 per year. &quot;Network access fee&quot; at 0.18% across all locations: $324/month, $3,888 per year. Combined junk: $5,268 per year recoverable before any rate negotiation.
              </p>
              <p className="text-foreground leading-relaxed">
                Step 5: built the case. Effective rate 3.27%. Market for this volume and card mix on IC++ was 2.55% to 2.70%. Gap: 0.57% to 0.72%. On $2.16M annual volume, that is $12,300 to $15,500 per year on top of the $5,268 in junk.
              </p>
              <p className="text-foreground leading-relaxed">
                Step 6: outcome. Existing processor matched IC + 0.25% + $0.10, struck PCI non-compliance, dropped the network access fee, removed monthly minimums. New effective rate: 2.61%. Annual savings versus prior contract: $14,300. The audit took 3 hours. The negotiation call took 40 minutes.
              </p>

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

import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import Link from "next/link";
import { BARAK_PERSON_SCHEMA, BARAK_NAME, BARAK_TITLE, BARAK_LINKEDIN } from "@/data/personas/barak";
import { withSeoOverride } from "@/lib/seo/overrides";
import { AeoAnswer } from "@/components/seo/AeoAnswer";
import { RelatedLinks } from "@/components/seo/RelatedLinks";

const URL = "https://www.mypayadvisor.com/insights/free-statement-audit-playbook";
const TITLE = "How to Audit Your Merchant Statement: The 6-Step Playbook";
const DESC = "A 6-step audit playbook for merchant statements: pull 90 days, compute your effective rate, classify line items, find the four hidden fees, build the negotiation case, and decide whether to renegotiate or switch.";

const baseMetadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: URL },
  robots: { index: true, follow: true },
  openGraph: { type: "article", url: URL, title: TITLE, description: DESC, images: [{ url: "https://www.mypayadvisor.com/og-logo.png" }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("insights", "free-statement-audit-playbook", baseMetadata);
}

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
    "dateModified": "2026-11-11",
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
      { "@type": "Question", "name": "How long does a merchant statement audit take?", "acceptedAnswer": { "@type": "Answer", "text": "It depends on how many statements and line items you have. Pulling three months of full PDF statements is usually the slowest step. The math itself fits in one spreadsheet." } },
      { "@type": "Question", "name": "How much do merchants typically save after an audit?", "acceptedAnswer": { "@type": "Answer", "text": "There is no published average, because savings depend on your pricing model, card mix and fees. Size it on your own account: on $100K a month, every 0.10 percentage point off your effective rate is $100 a month, or $1,200 a year. For reference, our cost tables put in-person processing at $50K a month between 2.04 percent (Helcim) and 2.90 percent (Square) at published prices (checked Oct 2026)." } },
      { "@type": "Question", "name": "What is the most common hidden fee on a merchant statement?", "acceptedAnswer": { "@type": "Answer", "text": "There is no published count, but four are worth checking first: the PCI non-compliance fee, charged when the annual self-assessment questionnaire is not on file, a monthly minimum shortfall, batch fees, and statement fees. Amounts vary by processor, so check your statement. Checkout.com, for example, publishes a $150 monthly PCI non-compliance fee for Level 4 merchants after a 60-day grace period, while Helcim lists no PCI fee (checked Oct 2026). None of these are interchange. The processor sets each one." } },
      { "@type": "Question", "name": "Should I do the audit myself or pay someone to do it?", "acceptedAnswer": { "@type": "Answer", "text": "This playbook works at any volume, because the math is the same. A paid third-party audit can make sense on a large tiered or blended contract if its fee is small next to the markup you can already see; get the fee in writing and ask whether the auditor earns anything from the processor you end up with. Free audits offered by other processors are sales tools, not audits." } },
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
              <AeoAnswer kind="insights" slug="free-statement-audit-playbook" />
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
                Most merchants have never read their processing statement line by line. The processor knows that. Many contracts allow fee changes with written notice, so a small rate increase here and a new flat fee there can lift your effective rate well above the rate you signed for. An audit is how you find it and get it back.
              </p>
              <p className="text-foreground leading-relaxed">
                This playbook walks through the exact 6 steps an operator runs on a new account. No software, no consultant. A spreadsheet and three statements.
              </p>

              <h2 id="what-an-audit-is" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                What a statement audit actually is
              </h2>
              <p className="text-foreground leading-relaxed">
                An audit is not a sales pitch from another processor. It is a forensic read of three months of statements with one goal: separate what you cannot control (interchange and assessments) from what you can (the markup, the fees, the contract terms).
              </p>
              <p className="text-foreground leading-relaxed">
                Interchange and network fees are set by Visa, Mastercard, Amex, and Discover. They are the same regardless of who processes for you. What sits on top, the processor markup plus fixed fees, is the entire negotiation surface. How big that layer is depends on your pricing model and card mix.
              </p>
              <p className="text-foreground leading-relaxed">
                The audit makes that layer legible. Once you can see it, you can shrink it.
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
                <p className="text-foreground"><strong>What a complete statement contains:</strong> a summary page, a fee schedule page, a deposit page, and pages of interchange line items grouped by card type. On a tiered or interchange-plus contract, if yours stops at the summary, ask in writing for the interchange detail; a missing detail page is itself a finding. A flat-rate statement will not show interchange at all.</p>
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
                <p className="text-foreground"><strong>Reference points from published prices</strong> (our <Link href="/data/effective-rates-2026" className="text-primary hover:underline">cost tables</Link>, prices checked Oct 2026):</p>
                <p className="text-foreground mt-2">In person at $50K a month: 2.04% (Helcim) to 2.90% (Square) across the providers we track.</p>
                <p className="text-foreground">Online at $50K a month: 2.40% (Stax) to 3.70% (Clover keyed cards).</p>
                <p className="text-foreground">B2B with a high commercial-card mix: Visa's corporate and purchasing card interchange is 2.70% + 10¢ card-not-present, against 1.75% + 10¢ for its Commercial Product 3 rate with Level 3 data (Visa schedule effective Oct 24, 2026). If you sell to businesses and send no Level 3 data, that is the next move.</p>
                <p className="text-foreground">Restaurants with tip adjustment: check how tipped sales are billed. Visa's tip tolerance is 30% for restaurants (MCC 5811, 5812, 5814) and 20% for bars.</p>
              </div>

              <h2 id="step-3" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Step 3: Classify every line item
              </h2>
              <p className="text-foreground leading-relaxed">
                Every fee on the statement falls into one of three buckets:
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Pass-through (non-negotiable):</strong> Visa interchange, Mastercard interchange, Amex OptBlue interchange, Discover interchange, network assessments, NABU, APF, dues. These are set by the networks, and the processor should pass them through at cost. Ask for the network's published rate behind each network line; a padded network fee is markup.
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
                Four fees are worth checking first. None of them are interchange. The processor sets every one of them.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>1. PCI non-compliance fee.</strong> Charged when the annual self-assessment questionnaire (SAQ) is not on file. The amount is set by your processor and varies, so check your statement. Checkout.com, for example, publishes $150 a month for Level 4 merchants after a 60-day grace period, while Helcim lists no PCI fee (checked Oct 2026). Filing the SAQ usually ends the fee; at $40 a month, that would be $480 a year recovered.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>2. Monthly minimum shortfall.</strong> Some contracts set a minimum on monthly processing fees, and slow months trigger the shortfall. Amounts vary by contract. It is often negotiable at renewal, and some providers, such as Helcim, publish no monthly fee or minimum.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>3. Batch and IRS reporting fees.</strong> Batch fees apply to each settlement close where your contract has them; Authorize.net's gateway-only plan, for example, charges 10 cents per daily batch (checked Oct 2026). Some processors also add a monthly IRS or 1099-K reporting fee. Filing <a href="https://www.irs.gov/forms-pubs/about-form-1099-k" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Form 1099-K</a> is the processor's own reporting duty. Charging extra for it is processor revenue, not a government fee.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>4. &quot;Regulatory&quot; or &quot;network access&quot; fees.</strong> Sometimes a percentage of volume, sometimes a flat amount, named to look like a pass-through. No regulation requires a regulatory product fee. A line named after a real network fee should match the network's published rate; anything above it is markup.
              </p>
              <div className="my-8 p-6 bg-orange-50 dark:bg-orange-950/20 rounded-lg border-l-4 border-orange-500">
                <p className="text-foreground"><strong>Quick math (hypothetical):</strong> on $250K monthly volume, a 0.15% &quot;regulatory product fee&quot; would be $375 per month, or $4,500 per year, for a fee nobody asked about.</p>
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
                <strong>Renegotiate</strong> if your current processor can match the best written quote and the relationship is otherwise clean. Some processors will cut markup to keep the account.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Switch</strong> if competing written quotes beat your effective rate by a clear margin and the processor will not match, you are on tiered or blended pricing, or the processor has held funds in a reserve you never agreed to. Before you switch, compare any early-exit charges with the savings for the months left on the term; if the exit charges are bigger, give notice on time and wait for the end date. On reserves specifically, see <Link href="/insights/reserves-frozen-funds-capped-vs-rolling" className="text-primary hover:underline">Capped vs Rolling Reserves</Link>.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Stay</strong> if the processor matches the best quote, or if the cost of switching (integration, hardware, exit charges) is bigger than the savings.
              </p>

              <h2 id="what-audits-uncover" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                What audits typically uncover
              </h2>
              <p className="text-foreground leading-relaxed">
                There is no published data on what a typical audit finds, so treat any average-savings figure with caution, including ones from processors offering free audits. What you can measure is the spread in published prices. Here is the gap between the cheapest and the most expensive in-person option in our cost tables (prices checked Oct 2026). A tiered contract can sit above all of them.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Under $50K monthly volume:</strong> at $10K a month, $211 (Helcim) to $290 (Square), a gap of $79 a month or $948 a year.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>$50K to $250K monthly:</strong> at $50K a month, $1,020 (Helcim) to $1,450 (Square), $430 a month; at $250K, $4,475 (Stax) to $7,000 (Stripe Terminal), $2,525 a month.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>$250K to $1M monthly:</strong> at $1M a month, $17,300 (Stax) to $28,000 (Stripe Terminal), $10,700 a month. Reserve and funding terms start to matter as much as the rate.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Above $1M monthly:</strong> negotiated terms matter more than list prices, so the audit becomes the basis for an RFP to several acquirers, sometimes paired with multi-acquirer routing, covered in <Link href="/insights/approval-rate-recovery-routing-acquirers-3ds" className="text-primary hover:underline">Approval Rate Recovery</Link>.
              </p>

              <p className="text-foreground leading-relaxed">
                Two things to check at every volume. First, how long the contract has run without a rate review: many contracts allow fee changes with notice, so older contracts are the ones to audit first. The audit is the forcing function that resets the clock.
              </p>
              <p className="text-foreground leading-relaxed">
                Second, on tiered contracts, the share of volume billed at mid- and non-qualified rates. The operator was sold on the &quot;qualified&quot; rate. If $60,000 of a $200,000 month moved from a 1.69% qualified rate to 2.45% mid-qualified, that alone would cost $456 a month.
              </p>

              <h2 id="diy-vs-paid" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Free DIY vs paid audit
              </h2>
              <p className="text-foreground leading-relaxed">
                Three flavors of audit exist. They are not the same product.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>DIY (free, this playbook):</strong> works at any volume. The math is not hard. The work is reading carefully.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Free audit from a competing processor:</strong> this is a sales tool. The competing processor will find real savings, but those savings come bundled with their own contract. The numbers are usually accurate. The recommendation is biased. Treat it as a second opinion, not as truth.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Paid third-party audit:</strong> fees and fee structures vary (some charge a share of the savings), so get the price in writing. It can be worth it on a large tiered or blended legacy contract. Ask whether the auditor earns anything from the processor you end up with.
              </p>

              <h2 id="faq" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Frequently asked questions
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">How long does a merchant statement audit take?</h3>
                  <p className="text-foreground leading-relaxed">It depends on how many statements and line items you have. Pulling three months of full PDF statements is usually the slowest step. The math itself fits in one spreadsheet.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">How much do merchants typically save after an audit?</h3>
                  <p className="text-foreground leading-relaxed">There is no published average, because savings depend on your pricing model, card mix and fees. Size it on your own account: on $100K a month, every 0.10 percentage point off your effective rate is $100 a month, or $1,200 a year. For reference, our cost tables put in-person processing at $50K a month between 2.04 percent (Helcim) and 2.90 percent (Square) at published prices (checked Oct 2026).</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">What is the most common hidden fee on a merchant statement?</h3>
                  <p className="text-foreground leading-relaxed">There is no published count, but four are worth checking first: the PCI non-compliance fee, charged when the annual self-assessment questionnaire is not on file, a monthly minimum shortfall, batch fees, and statement fees. Amounts vary by processor, so check your statement. Checkout.com, for example, publishes a $150 monthly PCI non-compliance fee for Level 4 merchants after a 60-day grace period, while Helcim lists no PCI fee (checked Oct 2026). None of these are interchange. The processor sets each one.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Should I do the audit myself or pay someone to do it?</h3>
                  <p className="text-foreground leading-relaxed">This playbook works at any volume, because the math is the same. A paid third-party audit can make sense on a large tiered or blended contract if its fee is small next to the markup you can already see; get the fee in writing and ask whether the auditor earns anything from the processor you end up with. Free audits offered by other processors are sales tools, not audits.</p>
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
                A hypothetical specialty retail operator, three locations, about $180K monthly volume across the chain, average ticket $58, on the same processor for 5 years on tiered pricing.
              </p>
              <p className="text-foreground leading-relaxed">
                Step 1: pulled three monthly statements as PDFs. Step 2: total volume across the three months was $542,000. Total fees across the three months was $17,710. Effective rate: 3.27%.
              </p>
              <p className="text-foreground leading-relaxed">
                Step 3: classified line items. Interchange and assessments came in at $12,180 (2.25% of volume). Markup, fees, and junk: $5,530 (1.02% of volume). The 1.02% markup line is the tell. For comparison, Helcim's published in-person margin at this volume is interchange + 0.25% + 7¢ (checked Oct 2026).
              </p>
              <p className="text-foreground leading-relaxed">
                Step 4: hidden fees. PCI non-compliance at $30/month per location, $90/month total, $1,080 per year. Monthly minimum shortfall on the slowest location: $25/month, $300 per year. &quot;Regulatory product fee&quot; at 0.18% across all locations: $324/month, $3,888 per year. Combined junk: $5,268 per year recoverable before any rate negotiation.
              </p>
              <p className="text-foreground leading-relaxed">
                Step 5: built the case. Effective rate 3.27%. Suppose two competing interchange-plus quotes work out to 2.55% and 2.70% on this card mix. Gap: 0.57% to 0.72%. On $2.16M annual volume, that is about $12,300 to $15,550 per year. The gap already includes the $5,268 in junk, because the 3.27% effective rate counts every fee.
              </p>
              <p className="text-foreground leading-relaxed">
                Step 6: outcome. If the existing processor matched IC + 0.25% + $0.10, struck PCI non-compliance, dropped the regulatory product fee and removed monthly minimums, the new effective rate would be about 2.67%: 2.25% interchange and network fees, 0.25% markup, and about 0.17% in 10-cent transaction fees on roughly 3,100 sales a month. Annual savings versus the prior contract: about $13,000 ($70,840 down to about $57,880).
              </p>

              <div className="not-prose mt-12 p-6 rounded-lg bg-primary/5 border border-primary/20">
                <h3 className="text-xl font-semibold text-foreground mb-2">Want a second set of eyes?</h3>
                <p className="text-foreground mb-4">Take the quiz for a matched shortlist by email. If you leave a phone number, Barak may call and can read your current statement or pricing offer with you.</p>
                <Link href="/quiz" className="inline-flex items-center px-5 py-2.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium">Get my matched shortlist →</Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    <RelatedLinks kind="insights" slug="free-statement-audit-playbook" />
    </>
  );
}

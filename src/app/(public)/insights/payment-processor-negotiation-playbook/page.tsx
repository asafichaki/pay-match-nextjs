import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import Link from "next/link";
import { BARAK_PERSON_SCHEMA, BARAK_NAME, BARAK_TITLE, BARAK_LINKEDIN, BARAK_PERSON_ID } from "@/data/personas/barak";
import { ExpertQuote } from "@/components/article/ExpertQuote";

const URL = "https://www.mypayadvisor.com/insights/payment-processor-negotiation-playbook";
const TITLE = "Payment Processor Negotiation Playbook: 9 Levers That Actually Move the Number";
const DESC = "Nine levers that actually move the number on a merchant processing contract: pricing model, markup, reserve cap, ETF, assessment pass-through, funding window, monthly minimum, PCI fee, chargeback fee floor. Scripts you can use verbatim.";

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
    "headline": "Payment Processor Negotiation Playbook (9 Levers That Actually Move the Number)",
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
      { "@type": "Question", "name": "How much can I negotiate off my processing fees?", "acceptedAnswer": { "@type": "Answer", "text": "On $50K to $250K monthly volume, 0.15% to 0.30% off the effective rate is realistic. Above $500K monthly, 0.30% to 0.60% is realistic. The dollar value depends on your base. On $1M monthly, even 0.20% is $24,000 a year." } },
      { "@type": "Question", "name": "What is the single most powerful negotiation lever?", "acceptedAnswer": { "@type": "Answer", "text": "Switching from blended or tiered pricing to interchange-plus. That single change usually delivers 0.20% to 0.50% of savings before any other negotiation, because it strips out the surcharge the processor was hiding inside the blended rate." } },
      { "@type": "Question", "name": "Do I need a competing offer in hand to negotiate?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Without a written offer from another processor, you have no leverage. The current processor knows you have not done the work. Get one written quote, even from a discount processor you would not actually use, and show it. Negotiation is a two-quote sport." } },
      { "@type": "Question", "name": "When should I walk instead of renegotiating?", "acceptedAnswer": { "@type": "Answer", "text": "Walk if the processor refuses to move from blended to IC++, refuses to drop the early termination fee, or holds funds in a reserve they will not put a release date on. Those three together mean the relationship is structurally broken, not just expensive." } },
      { "@type": "Question", "name": "How often should I renegotiate?", "acceptedAnswer": { "@type": "Answer", "text": "Every 18 to 24 months on a stable account. Pricing drifts. Card mix shifts. Network interchange resets twice a year. A two-year-old contract is almost always paying above market by 0.10% to 0.25%." } }
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
                Payment Processor Negotiation Playbook (9 Levers That Actually Move the Number)
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                Nine specific levers, in priority order, that move a merchant processing contract from above market to at or below it. Scripts you can read out loud. The two situations where you should walk instead of negotiate.
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
                <li><a href="#whats-negotiable" className="text-muted-foreground hover:text-primary transition-colors">What is actually negotiable (and what is not)</a></li>
                <li><a href="#lever-1" className="text-muted-foreground hover:text-primary transition-colors">Lever 1: Switch from blended to IC++</a></li>
                <li><a href="#lever-2" className="text-muted-foreground hover:text-primary transition-colors">Lever 2: Drop the markup</a></li>
                <li><a href="#lever-3" className="text-muted-foreground hover:text-primary transition-colors">Lever 3: Cap the reserve</a></li>
                <li><a href="#lever-4" className="text-muted-foreground hover:text-primary transition-colors">Lever 4: Kill the early termination fee</a></li>
                <li><a href="#lever-5" className="text-muted-foreground hover:text-primary transition-colors">Lever 5: Lock the assessment pass-through</a></li>
                <li><a href="#lever-6" className="text-muted-foreground hover:text-primary transition-colors">Lever 6: Fix the funding window</a></li>
                <li><a href="#lever-7" className="text-muted-foreground hover:text-primary transition-colors">Lever 7: Get rid of the monthly minimum</a></li>
                <li><a href="#lever-8" className="text-muted-foreground hover:text-primary transition-colors">Lever 8: PCI fee waiver</a></li>
                <li><a href="#lever-9" className="text-muted-foreground hover:text-primary transition-colors">Lever 9: Chargeback fee floor</a></li>
                <li><a href="#scripts" className="text-muted-foreground hover:text-primary transition-colors">Scripts you can use verbatim</a></li>
                <li><a href="#when-to-walk" className="text-muted-foreground hover:text-primary transition-colors">When to walk</a></li>
                <li><a href="#faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </nav>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-foreground leading-relaxed">
                Most merchants negotiate one number: the rate. The processor knows that, prices accordingly, and keeps everything else: the reserve, the ETF, the funding delay, the PCI fee, the markup hidden inside the assessments line. A real negotiation works nine levers, in order, and treats the rate as the fourth most important.
              </p>
              <p className="text-foreground leading-relaxed">
                If you have not run an audit yet, do that first. The numbers in this playbook only work when you walk in with three months of effective-rate data. Read the <Link href="/insights/free-statement-audit-playbook" className="text-primary hover:underline">Statement Audit Playbook</Link>, then come back.
              </p>

              <h2 id="whats-negotiable" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                What is actually negotiable (and what is not)
              </h2>
              <p className="text-foreground leading-relaxed">
                Interchange is not negotiable. It is set by the issuing bank under rules published by Visa and Mastercard. Nobody, including the largest acquirers, gets a discount on interchange.
              </p>
              <p className="text-foreground leading-relaxed">
                Network assessments are not negotiable. They run 0.13% to 0.15% and are charged by the network on every transaction.
              </p>
              <p className="text-foreground leading-relaxed">
                Everything else is negotiable. The pricing model is negotiable. The processor markup is negotiable. The reserve is negotiable. The ETF is negotiable. The PCI fee, the monthly minimum, the chargeback fee, the funding window, all negotiable. Treat anyone who tells you otherwise as a salesperson, not a payments operator.
              </p>

              <ExpertQuote
                quote="The most expensive sentence in payments is 'we don't have room to negotiate on that.' Above $25K monthly volume, every flat fee on the statement is on the table. Above $100K, the markup itself is on the table. The processor never volunteers it — you have to ask, in writing, with a competing quote in the same email."
                authorName={BARAK_NAME}
                authorRole={`${BARAK_TITLE}, myPayAdvisor`}
                authorSlug="barak"
                personId={BARAK_PERSON_ID}
                articleUrl="https://www.mypayadvisor.com/insights/payment-processor-negotiation-playbook"
              />

              <h2 id="lever-1" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Lever 1: Switch from blended to IC++
              </h2>
              <p className="text-foreground leading-relaxed">
                Blended pricing (a single rate like 2.9% + $0.30 covering everything) hides the markup inside an average. Tiered pricing (qualified, mid-qualified, non-qualified) does the same thing with extra steps.
              </p>
              <p className="text-foreground leading-relaxed">
                Interchange-plus (IC+) splits interchange from markup. IC++ goes further and splits assessments from interchange too. On a clean IC++ contract, your statement reads: interchange (pass-through), assessments (pass-through), processor markup (negotiated). Three numbers. No mystery.
              </p>
              <p className="text-foreground leading-relaxed">
                On a $200K monthly account moving from tiered to IC++, expect a 0.25% to 0.50% effective-rate drop with no other change. That is the single biggest move in this playbook.
              </p>
              <div className="my-8 p-6 bg-primary/5 rounded-lg border-l-4 border-primary">
                <p className="text-foreground"><strong>Target markup by volume:</strong></p>
                <p className="text-foreground mt-2">Under $25K monthly: IC + 0.40% + $0.10 is fair.</p>
                <p className="text-foreground">$25K to $100K: IC + 0.30% + $0.10.</p>
                <p className="text-foreground">$100K to $500K: IC + 0.20% + $0.08.</p>
                <p className="text-foreground">$500K to $2M: IC + 0.10% to 0.15% + $0.05.</p>
                <p className="text-foreground">Above $2M: IC + 0.05% to 0.08% + $0.03 to $0.05.</p>
              </div>

              <h2 id="lever-2" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Lever 2: Drop the markup
              </h2>
              <p className="text-foreground leading-relaxed">
                Once you are on IC++, the markup is one number on the page. You can attack it directly. Show the processor a competing IC++ quote at a lower markup. The current processor will usually match within 0.05% to avoid losing the account.
              </p>
              <p className="text-foreground leading-relaxed">
                Do not ask for an aspirational rate. Ask for the rate in the competing offer plus zero. &quot;Match this written quote or I move the volume next month.&quot;
              </p>

              <h2 id="lever-3" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Lever 3: Cap the reserve
              </h2>
              <p className="text-foreground leading-relaxed">
                If the processor holds a reserve, two things matter: the cap (a fixed dollar number) and the path to release (a written date or volume threshold). A rolling reserve at 10% with no cap and no release is a working capital trap, not a risk control. A capped reserve at $50,000 with release after 6 clean months is a normal risk control.
              </p>
              <p className="text-foreground leading-relaxed">
                Insist on both. The full mechanics are in <Link href="/insights/reserves-frozen-funds-capped-vs-rolling" className="text-primary hover:underline">Capped vs Rolling Reserves</Link>.
              </p>

              <h2 id="lever-4" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Lever 4: Kill the early termination fee
              </h2>
              <p className="text-foreground leading-relaxed">
                ETFs run from $295 to $50,000 depending on the contract. Some are tied to remaining contract months. Some are flat. They exist for one reason: to make leaving expensive enough that you stop trying.
              </p>
              <p className="text-foreground leading-relaxed">
                On a renewal, get the ETF struck out entirely. Replace it with a 30-day notice clause. Most processors will agree because the alternative is losing the account today.
              </p>

              <h2 id="lever-5" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Lever 5: Lock the assessment pass-through
              </h2>
              <p className="text-foreground leading-relaxed">
                Some processors quietly mark up the assessment line. Visa charges 0.14%, the statement shows 0.18%, and the 0.04% is silent margin. On $500K monthly that is $200 per month, $2,400 per year, hidden inside what looks like a pass-through.
              </p>
              <p className="text-foreground leading-relaxed">
                Add one line to the contract: &quot;Assessments and dues are billed at network-published rates with no processor markup.&quot; Push back hard if the processor refuses. There is no legitimate reason to refuse.
              </p>

              <h2 id="lever-6" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Lever 6: Fix the funding window
              </h2>
              <p className="text-foreground leading-relaxed">
                Standard funding is T+1 (next business day). T+2 and T+3 exist because the processor uses your money for an extra day or two. On $200K monthly, an extra day of float is roughly $50 to $100 of foregone interest, but the bigger issue is cash flow predictability.
              </p>
              <p className="text-foreground leading-relaxed">
                Insist on T+1 funding with a same-day cutoff that matches your batch close. If the processor offers same-day funding for a fee, decline. T+1 standard is the right answer.
              </p>

              <h2 id="lever-7" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Lever 7: Get rid of the monthly minimum
              </h2>
              <p className="text-foreground leading-relaxed">
                A $25 monthly minimum becomes a $25 fee any month volume dips. If your business is seasonal, you pay it 4 to 6 months a year. Strike it. Processors give it up easily on a renewal.
              </p>

              <h2 id="lever-8" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Lever 8: PCI fee waiver
              </h2>
              <p className="text-foreground leading-relaxed">
                $20 to $40 a month for PCI compliance is normal. $20 to $40 a month for PCI non-compliance is the processor charging you because nobody filed the SAQ. File the SAQ (it takes 30 minutes online), then ask the processor to refund the last 6 months of non-compliance fees as part of the renewal. Most will.
              </p>

              <h2 id="lever-9" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Lever 9: Chargeback fee floor
              </h2>
              <p className="text-foreground leading-relaxed">
                $25 per chargeback is normal. $50 to $100 is gouging. On a clean retail account with two chargebacks a month, the difference between $25 and $75 is $1,200 a year. Set the floor at $20 to $25, period.
              </p>
              <p className="text-foreground leading-relaxed">
                Separately: refuse the &quot;representment fee&quot; that some processors charge on top of the chargeback fee for the privilege of disputing it. That one should be zero.
              </p>

              <h2 id="scripts" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Scripts you can use verbatim
              </h2>
              <p className="text-foreground leading-relaxed">
                <strong>Opening the conversation:</strong> &quot;I have run a 90-day audit on the account. My effective rate is X.XX%. The market for my volume and card mix is Y.YY%. I have a written competing offer at Z.ZZ%. I want to keep the relationship. I need the contract restructured. Can you put me with someone who can actually move the numbers, or do I need to escalate?&quot;
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>When they push back on IC++:</strong> &quot;I understand blended is what your team prefers to sell. It is also what allows margin to drift. I am asking for IC++ pricing because that is what the contract has to look like for me to stay. Either you can offer it or I move to a processor that will.&quot;
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>On the ETF:</strong> &quot;The early termination fee is a deal breaker. I am willing to sign a 12-month commitment in exchange for striking the ETF entirely. Standard 30-day notice clause from there. That is my position.&quot;
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>On the reserve:</strong> &quot;A rolling reserve with no cap and no release schedule is not a contract I can sign. Cap it at a dollar amount, give me a written release date after 6 clean months, or we are not doing business.&quot;
              </p>

              <p className="text-foreground leading-relaxed">
                <strong>When they offer a small concession to make you stop:</strong> &quot;I appreciate the move on the rate. We are still a long way from where we need to be. The reserve, the ETF, the assessment markup, and the PCI fee are all on my list. I would rather settle every line item in one conversation than come back next quarter. Let&apos;s walk through the rest.&quot;
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>When they say the request needs to go to underwriting:</strong> &quot;Understood. I will hold the decision for 5 business days while underwriting reviews. After that, I am committing volume to the alternative processor. Send me the answer in writing by end of next week.&quot;
              </p>

              <h2 id="when-to-walk" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                When to walk
              </h2>
              <p className="text-foreground leading-relaxed">
                Walk in three situations.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>One:</strong> The processor refuses to move from blended or tiered to IC++. That refusal is a signal that their entire margin model depends on opacity. You will not win other negotiations against an opaque counterparty.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Two:</strong> The processor will not put a release date on a reserve. That is funds frozen indefinitely. The negotiation does not get better from there.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Three:</strong> The processor offers concessions only after threatening account termination. That is a coercive relationship. Move the volume on a planned timeline before the next pricing cycle.
              </p>

              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                The order matters: why these levers are sequenced this way
              </h2>
              <p className="text-foreground leading-relaxed">
                Pricing model first because it sets the visibility for everything else. Markup second because it is the biggest single dollar number on the page. Reserve third because trapped working capital outweighs almost any rate concession. ETF fourth because without removing it, you cannot credibly threaten to walk on lever 1, 2, or 3.
              </p>
              <p className="text-foreground leading-relaxed">
                Levers 5 through 9 are smaller in dollar value but easier to win once you have already moved levers 1 through 4. The processor has already conceded the relationship needs to change. The smaller items become rounding-error concessions on their side, real money on yours.
              </p>
              <p className="text-foreground leading-relaxed">
                Run them all in one conversation. Do not negotiate the rate today and the reserve next quarter. The negotiation is one event, with a written outcome, signed by both sides, before any volume processes under the new structure.
              </p>

              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                What happens after you sign the new contract
              </h2>
              <p className="text-foreground leading-relaxed">
                Two checks in the first 60 days. First check: pull the first new statement and recompute the effective rate. The number should match the contract within 0.05%. If it does not, the implementation has a bug or the processor missed a fee schedule update. Get it fixed in writing.
              </p>
              <p className="text-foreground leading-relaxed">
                Second check: confirm every line item that was supposed to be removed (PCI non-compliance, monthly minimum, regulatory fee, ETF) is actually gone. Sometimes processors strike them from the contract and forget to update the billing system. The first statement is the ground truth.
              </p>
              <p className="text-foreground leading-relaxed">
                Calendar the next renegotiation 18 months out. Do not wait for the contract to renew. Pull statements quarterly to confirm the rate has not drifted. Drift happens.
              </p>

              <h2 id="faq" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Frequently asked questions
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">How much can I negotiate off my processing fees?</h3>
                  <p className="text-foreground leading-relaxed">On $50K to $250K monthly volume, 0.15% to 0.30% off the effective rate is realistic. Above $500K monthly, 0.30% to 0.60% is realistic. The dollar value depends on your base. On $1M monthly, even 0.20% is $24,000 a year.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">What is the single most powerful negotiation lever?</h3>
                  <p className="text-foreground leading-relaxed">Switching from blended or tiered pricing to interchange-plus. That single change usually delivers 0.20% to 0.50% of savings before any other negotiation, because it strips out the surcharge the processor was hiding inside the blended rate.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Do I need a competing offer in hand to negotiate?</h3>
                  <p className="text-foreground leading-relaxed">Yes. Without a written offer from another processor, you have no leverage. The current processor knows you have not done the work. Get one written quote, even from a discount processor you would not actually use, and show it. Negotiation is a two-quote sport.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">When should I walk instead of renegotiating?</h3>
                  <p className="text-foreground leading-relaxed">Walk if the processor refuses to move from blended to IC++, refuses to drop the early termination fee, or holds funds in a reserve they will not put a release date on. Those three together mean the relationship is structurally broken, not just expensive.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">How often should I renegotiate?</h3>
                  <p className="text-foreground leading-relaxed">Every 18 to 24 months on a stable account. Pricing drifts. Card mix shifts. Network interchange resets twice a year. A two-year-old contract is almost always paying above market by 0.10% to 0.25%.</p>
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

import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import Link from "next/link";
import { BARAK_PERSON_SCHEMA, BARAK_NAME, BARAK_TITLE, BARAK_LINKEDIN } from "@/data/personas/barak";
import { ExpertQuote } from "@/components/article/ExpertQuote";
import { withSeoOverride } from "@/lib/seo/overrides";
import { AeoAnswer } from "@/components/seo/AeoAnswer";
import { RelatedLinks } from "@/components/seo/RelatedLinks";

const URL = "https://www.mypayadvisor.com/insights/payment-processor-negotiation-playbook";
const TITLE = "Payment Processor Negotiation Playbook: 9 Levers That Actually Move the Number";
const DESC = "Nine levers that actually move the number on a merchant processing contract: pricing model, markup, reserve cap, ETF, assessment pass-through, funding window, monthly minimum, PCI fee, chargeback fee floor. Scripts you can use verbatim.";

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
  return withSeoOverride("insights", "payment-processor-negotiation-playbook", baseMetadata);
}

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
      { "@type": "Question", "name": "How much can I negotiate off my processing fees?", "acceptedAnswer": { "@type": "Answer", "text": "There is no reliable average. It depends on how far your current markup and fees sit above the competing quotes you collect. The dollar value depends on your base: every 0.10 point is $250 a month on $250K monthly volume and $1,000 a month ($12,000 a year) on $1M." } },
      { "@type": "Question", "name": "What is the single most powerful negotiation lever?", "acceptedAnswer": { "@type": "Answer", "text": "Switching from blended or tiered pricing to interchange-plus. It shows the processor markup as its own line, so you can see what you pay and attack it. In our cost model at $250K a month in person, interchange-plus pricing from Helcim costs about $4,850 and Stax about $4,475, against $6,900 on Square and about $7,000 on Stripe Terminal (prices checked Oct 2026)." } },
      { "@type": "Question", "name": "Do I need a competing offer in hand to negotiate?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Without a written offer from another processor, you have no leverage. The current processor knows you have not done the work. Get one written quote, even from a discount processor you would not actually use, and show it. Negotiation is a two-quote sport." } },
      { "@type": "Question", "name": "When should I walk instead of renegotiating?", "acceptedAnswer": { "@type": "Answer", "text": "Walk if the processor refuses to move from blended to IC++, refuses to drop the early termination fee, or holds funds in a reserve they will not put a release date on. Those three together mean the relationship is structurally broken, not just expensive." } },
      { "@type": "Question", "name": "How often should I renegotiate?", "acceptedAnswer": { "@type": "Answer", "text": "Every year on a stable account, starting a month or two before your contract anniversary. Pricing drifts: some contracts let the processor change its markup on written notice. Card mix shifts. Visa updates its interchange schedule periodically; the current U.S. schedule took effect October 24, 2026." } }
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
              <AeoAnswer kind="insights" slug="payment-processor-negotiation-playbook" />
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
                Most merchants negotiate one number: the rate. The processor knows that, prices accordingly, and keeps everything else: the reserve, the ETF, the funding delay, the PCI fee, the markup hidden inside the assessments line. A real negotiation works nine levers, in order, and treats the rate as one lever among nine.
              </p>
              <p className="text-foreground leading-relaxed">
                If you have not run an audit yet, do that first. The numbers in this playbook only work when you walk in with three months of effective-rate data. Read the <Link href="/insights/free-statement-audit-playbook" className="text-primary hover:underline">Statement Audit Playbook</Link>, then come back.
              </p>

              <h2 id="whats-negotiable" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                What is actually negotiable (and what is not)
              </h2>
              <p className="text-foreground leading-relaxed">
                Interchange is not negotiable for a typical merchant. Visa and Mastercard set it in published schedules, and it is paid to the card-issuing bank. You lower it only by qualifying sales for cheaper categories, for example by reading the card in person or sending Level 3 data on commercial cards.
              </p>
              <p className="text-foreground leading-relaxed">
                Network assessments are not negotiable. The networks charge them on every transaction but do not publish them, so read them off your statement and make sure they are billed at the network&apos;s own rate.
              </p>
              <p className="text-foreground leading-relaxed">
                Everything else is negotiable. The pricing model is negotiable. The processor markup is negotiable. The reserve is negotiable. The ETF is negotiable. The PCI fee, the monthly minimum, the chargeback fee, the funding window, all negotiable. Treat anyone who tells you otherwise as a salesperson, not a payments operator.
              </p>

              <ExpertQuote
                pageUrl="https://www.mypayadvisor.com/insights/payment-processor-negotiation-playbook"
                quotation={{
                  text: "The most expensive sentence in payments is 'we don't have room to negotiate on that.' Above $25K monthly volume, every flat fee on the statement is on the table. Above $100K, the markup itself is on the table. The processor never volunteers it, you have to ask, in writing, with a competing quote in the same email.",
                  creator: {
                    "@type": "Person",
                    name: "Barak Bachar",
                    jobTitle: "Global Payments Manager",
                    worksFor: { "@type": "Organization", name: "myPayAdvisor" },
                    url: "https://www.mypayadvisor.com/about/barak",
                  },
                  publisher: {
                    "@type": "Organization",
                    name: "myPayAdvisor",
                    url: "https://www.mypayadvisor.com",
                  },
                  isBasedOn: "https://www.mypayadvisor.com/about/barak",
                  inLanguage: "en-US",
                }}
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
                How much the switch saves depends on your card mix and the markup you agree, so price it on your own statement. For scale, in our cost model at $250K a month in person, Helcim&apos;s interchange-plus pricing costs about $4,850 and Stax&apos;s about $4,475, against $6,900 on Square and about $7,000 on Stripe Terminal (prices checked Oct 2026). That is why it comes first in this playbook.
              </p>
              <div className="my-8 p-6 bg-primary/5 rounded-lg border-l-4 border-primary">
                <p className="text-foreground"><strong>Published markups to compare against (prices checked Oct 2026):</strong></p>
                <p className="text-foreground mt-2">Helcim in person: IC + 0.40% + $0.08 under $50K monthly, stepping down to 0.15% + $0.06 at the top tier.</p>
                <p className="text-foreground">Helcim online: IC + 0.50% + $0.25 under $50K monthly, falling to 0.15% + $0.15 above $1M.</p>
                <p className="text-foreground">Stax: interchange at cost + $0.08 in person or $0.15 online, plus $99 to $199+ a month by annual volume.</p>
                <p className="text-foreground">Adyen online (Visa and Mastercard): interchange++ + 0.60% + $0.13.</p>
                <p className="text-foreground">Use these as reference points for the markup line in any quote you collect.</p>
              </div>

              <h2 id="lever-2" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Lever 2: Drop the markup
              </h2>
              <p className="text-foreground leading-relaxed">
                Once you are on IC++, the markup is one number on the page. You can attack it directly. Show the processor a competing IC++ quote at a lower markup. The current processor may match rather than lose the account, but nothing obliges it to.
              </p>
              <p className="text-foreground leading-relaxed">
                Do not ask for an aspirational rate. Ask for the rate in the competing offer plus zero. &quot;Match this written quote or I move the volume next month.&quot;
              </p>

              <h2 id="lever-3" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Lever 3: Cap the reserve
              </h2>
              <p className="text-foreground leading-relaxed">
                If the processor holds a reserve, two things matter: the cap (a fixed dollar number) and the path to release (a written date or volume threshold). For example, a rolling reserve with no cap and no release date is a working capital trap, not a risk control. A reserve capped at a fixed dollar amount with a written release after a set number of clean months is a normal risk control.
              </p>
              <p className="text-foreground leading-relaxed">
                Insist on both. The full mechanics are in <Link href="/insights/reserves-frozen-funds-capped-vs-rolling" className="text-primary hover:underline">Capped vs Rolling Reserves</Link>.
              </p>

              <h2 id="lever-4" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Lever 4: Kill the early termination fee
              </h2>
              <p className="text-foreground leading-relaxed">
                ETF amounts vary widely by contract. Some are tied to remaining contract months (liquidated damages). Some are flat. They exist for one reason: to make leaving expensive enough that you stop trying.
              </p>
              <p className="text-foreground leading-relaxed">
                On a renewal, get the ETF struck out entirely. Replace it with a 30-day notice clause. Some processors will agree because the alternative is losing the account today. Several publish no cancellation fee at all, including Helcim.
              </p>

              <h2 id="lever-5" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Lever 5: Lock the assessment pass-through
              </h2>
              <p className="text-foreground leading-relaxed">
                Some processors quietly mark up the assessment line, billing a network fee above the network&apos;s own rate. The difference is silent margin: a 0.04 point pad on $500K monthly is $200 per month, $2,400 per year, hidden inside what looks like a pass-through.
              </p>
              <p className="text-foreground leading-relaxed">
                Add one line to the contract: &quot;Assessments and dues are billed at the network&apos;s own rates with no processor markup.&quot; Push back hard if the processor refuses. There is no legitimate reason to refuse.
              </p>

              <h2 id="lever-6" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Lever 6: Fix the funding window
              </h2>
              <p className="text-foreground leading-relaxed">
                Funding times vary. Square, Helcim and Stax fund the next business day, Stripe&apos;s standard payouts take 2 business days, and Shopify Payments takes 3 business days in the U.S. (Oct 2026). On $200K monthly, each extra day of delay keeps about $6,700 of your money with the processor at any time, and the bigger issue is cash flow predictability.
              </p>
              <p className="text-foreground leading-relaxed">
                Insist on T+1 funding with a same-day cutoff that matches your batch close. If the processor offers faster funding for a fee (Square charges 1.95% for instant transfers, Stripe 1.5% for Instant Payouts), decline unless you need it. T+1 standard is the right answer.
              </p>

              <h2 id="lever-7" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Lever 7: Get rid of the monthly minimum
              </h2>
              <p className="text-foreground leading-relaxed">
                A monthly minimum charges you the shortfall any month your fees fall below it. If your business is seasonal, you can pay it several months a year. Strike it. A renewal is the time to ask.
              </p>

              <h2 id="lever-8" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Lever 8: PCI fee waiver
              </h2>
              <p className="text-foreground leading-relaxed">
                Some processors charge a PCI compliance fee; others, such as Helcim, list none. A PCI non-compliance fee is the processor charging you because nobody filed the SAQ. File the SAQ, then ask the processor to refund the non-compliance fees you paid as part of the renewal. Some will.
              </p>

              <h2 id="lever-9" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Lever 9: Chargeback fee floor
              </h2>
              <p className="text-foreground leading-relaxed">
                Published chargeback fees give you a benchmark: Stripe charges $15 per dispute, PayPal $20, and Helcim $15 only when you lose (prices checked Oct 2026). If your contract charges much more, ask to bring it in line. On an account with two chargebacks a month, every $10 of fee is $240 a year.
              </p>
              <p className="text-foreground leading-relaxed">
                Separately: push back on the &quot;representment fee&quot; that some processors charge on top of the chargeback fee for disputing it. Ask for it to be zero, or refunded when you win, as Stripe does with its $15 counter fee.
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
                Two checks in the first 60 days. First check: pull the first new statement and recompute the processor markup. The markup line should match the contract exactly. If it does not, the implementation has a bug or the processor missed a fee schedule update. Get it fixed in writing.
              </p>
              <p className="text-foreground leading-relaxed">
                Second check: confirm every line item that was supposed to be removed (PCI non-compliance, monthly minimum, regulatory fee, ETF) is actually gone. Sometimes processors strike them from the contract and forget to update the billing system. The first statement is the ground truth.
              </p>
              <p className="text-foreground leading-relaxed">
                Calendar the next review 12 months out, a month or two before your contract anniversary. Do not wait for the contract to renew. Pull statements quarterly to confirm the rate has not drifted. Drift happens.
              </p>

              <h2 id="faq" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Frequently asked questions
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">How much can I negotiate off my processing fees?</h3>
                  <p className="text-foreground leading-relaxed">There is no reliable average. It depends on how far your current markup and fees sit above the competing quotes you collect. The dollar value depends on your base: every 0.10 point is $250 a month on $250K monthly volume and $1,000 a month ($12,000 a year) on $1M.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">What is the single most powerful negotiation lever?</h3>
                  <p className="text-foreground leading-relaxed">Switching from blended or tiered pricing to interchange-plus. It shows the processor markup as its own line, so you can see what you pay and attack it. In our cost model at $250K a month in person, interchange-plus pricing from Helcim costs about $4,850 and Stax about $4,475, against $6,900 on Square and about $7,000 on Stripe Terminal (prices checked Oct 2026).</p>
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
                  <p className="text-foreground leading-relaxed">Every year on a stable account, starting a month or two before your contract anniversary. Pricing drifts: some contracts let the processor change its markup on written notice. Card mix shifts. Visa updates its interchange schedule periodically; the current U.S. schedule took effect October 24, 2026.</p>
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
    <RelatedLinks kind="insights" slug="payment-processor-negotiation-playbook" />
    </>
  );
}

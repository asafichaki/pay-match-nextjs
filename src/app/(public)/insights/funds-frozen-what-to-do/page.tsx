import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Stripe Account Frozen? What To Do When a Processor Freezes Your Funds (2026)",
  description: "Your processor froze your funds or your Stripe account is frozen. Here is the fixed operator response, in order, from a working payments operator: get the reason in writing, submit docs same day, stand up a backup MID, escalate to the risk department, involve counsel if needed.",
  keywords: "stripe account frozen, why did stripe freeze my account, funds frozen merchant account, processor froze my funds, merchant account hold, payment processor reserve",
  alternates: {
    canonical: "https://www.mypayadvisor.com/insights/funds-frozen-what-to-do",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "article",
    url: "https://www.mypayadvisor.com/insights/funds-frozen-what-to-do",
    title: "Stripe Account Frozen? What To Do When a Processor Freezes Your Funds (2026)",
    description: "The fixed operator response when a processor freezes your funds: reason in writing, docs same day, backup MID, escalate to risk, involve counsel if past your reserve terms.",
    images: [{ url: "https://www.mypayadvisor.com/og-logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Processor Froze Your Funds? Here Is What To Do",
    description: "The fixed, in-order operator response to a funds freeze, reviewed by a working payments operator.",
  },
};

export default function FundsFrozenWhatToDoPage() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Stripe Account Frozen? What To Do When a Processor Freezes Your Funds (2026)",
    "description": "The fixed, in-order operator response when a payment processor freezes your funds or your Stripe account is frozen: get the reason in writing, submit documents the same day, stand up a backup merchant account, escalate to the risk department in writing, and involve counsel if the hold runs past your contract's reserve terms.",
    "image": "https://www.mypayadvisor.com/og-logo.png",
    "author": {
      "@type": "Organization",
      "@id": "https://www.mypayadvisor.com/#organization",
      "name": "myPayAdvisor"
    },
    "reviewedBy": {
      "@type": "Person",
      "@id": "https://www.mypayadvisor.com/about/barak#person",
      "name": "Barak Bachar",
      "jobTitle": "Global Payments Manager",
      "url": "https://www.mypayadvisor.com/about/barak",
      "sameAs": ["https://www.linkedin.com/in/barak-bachar/"]
    },
    "publisher": {
      "@type": "Organization",
      "name": "myPayAdvisor",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.mypayadvisor.com/og-logo.png"
      }
    },
    "datePublished": "2026-05-30",
    "dateModified": "2026-05-30",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://www.mypayadvisor.com/insights/funds-frozen-what-to-do"
    },
    "keywords": ["stripe account frozen", "why did stripe freeze my account", "funds frozen merchant account", "merchant account hold", "rolling reserve"],
    "articleSection": "High-Risk Processing"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.mypayadvisor.com" },
      { "@type": "ListItem", "position": 2, "name": "Insights", "item": "https://www.mypayadvisor.com/insights" },
      { "@type": "ListItem", "position": 3, "name": "Processor Froze Your Funds: What To Do", "item": "https://www.mypayadvisor.com/insights/funds-frozen-what-to-do" }
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Why did Stripe freeze my account?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Stripe and similar aggregators freeze or pause an account when their automated risk systems flag a pattern they could not underwrite up front: a sudden volume spike, a rise in disputes, a vertical they later classify as restricted, a mismatch between your stated business and your actual transactions, or a single large or unusual charge. Because aggregators onboard merchants instantly without full underwriting, the review often happens after money is already flowing, which is why the freeze can feel sudden. It is usually a documentation and classification problem rather than a final decision, and the specific trigger is something you are entitled to ask for in writing."
        }
      },
      {
        "@type": "Question",
        "name": "How long can a processor hold my funds?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The length of a hold depends on what the processor is investigating and what your contract allows. A documentation review can clear in days once you supply what is requested. A reserve tied to chargeback exposure can run for a defined window, commonly 90 to 180 days, because that is roughly how long a cardholder has to dispute a transaction. The hold period and any reserve terms should be written in your agreement. If the processor holds funds longer than the contract states, or will not put the reason and the expected release in writing, that is the point where escalation to the risk department and, if needed, bank-card counsel becomes appropriate."
        }
      },
      {
        "@type": "Question",
        "name": "Should I open a second merchant account after a freeze?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, and ideally before the next one happens. The single most common operator mistake is depending on one merchant account, so a freeze stops all revenue at once. Standing up a backup merchant account at a second acquirer, often one that specializes in your vertical, keeps money moving while you work the original freeze. This is the multi-MID approach that experienced high-risk merchants use as standard practice. The backup account does not resolve the original hold, but it removes the cash-flow emergency that pushes merchants into bad decisions, and it signals to the frozen processor that you are not trapped."
        }
      },
      {
        "@type": "Question",
        "name": "Can I sue a payment processor for withholding my money?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Legal action is a last resort, not a first move, and whether it is realistic depends entirely on your contract. Most processing agreements give the acquirer broad rights to hold funds against potential chargebacks and to maintain a reserve. The question is not whether they can hold money, but whether the hold exceeds the specific terms you signed. That is why the operator sequence puts everything in writing first: a documented timeline of the reason given, the documents you submitted, and the contractual reserve terms is exactly what bank-card counsel needs to assess whether the processor has overstepped. Involve counsel when the hold clearly runs past the stated terms, not as an opening threat."
        }
      },
      {
        "@type": "Question",
        "name": "What documents should I send when a processor asks for them?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Send everything the processor lists, in full, the same day. Typical requests include recent bank statements, supplier or fulfillment invoices, proof of delivery or tracking for disputed orders, a copy of your business license, and for regulated verticals product-compliance documents such as a Certificate of Analysis for CBD. Partial or slow responses are read as a risk signal and extend the hold. The merchants who clear a freeze fastest are the ones who treat the document request as the path out rather than an accusation, and who answer it completely on day one rather than negotiating which items to provide."
        }
      }
    ]
  };

  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://www.mypayadvisor.com/insights/funds-frozen-what-to-do#webpage",
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", ".aeo-answer"]
    }
  };

  const quotationSchema = {
    "@context": "https://schema.org",
    "@type": "Quotation",
    "@id": "https://www.mypayadvisor.com/insights/funds-frozen-what-to-do#barak-quote",
    "text": "A freeze feels like an accusation, so merchants react emotionally, and that is the mistake. The acquirer is not your adversary in that moment, they are a risk desk waiting on paperwork. Get the reason in writing, send every document they ask for the same day, and at the same time open a second merchant account so your revenue does not stop. The merchants who recover fastest treat the freeze as a documentation problem to solve in order, not a fight to win.",
    "creator": {
      "@type": "Person",
      "@id": "https://www.mypayadvisor.com/about/barak#person",
      "name": "Barak Bachar",
      "jobTitle": "Global Payments Manager",
      "url": "https://www.mypayadvisor.com/about/barak",
      "sameAs": ["https://www.linkedin.com/in/barak-bachar/"]
    },
    "isBasedOn": "https://www.mypayadvisor.com/about/barak",
    "inLanguage": "en-US"
  };

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={speakableSchema} />
      <JsonLd data={quotationSchema} />
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="flex gap-12 justify-center">
          <article className="max-w-3xl flex-1 min-w-0">
            {/* Header */}
            <header className="mb-12 border-b border-border pb-8">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="font-medium text-primary">High-Risk Processing</span>
                <span>•</span>
                <span>Updated May 2026</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground leading-tight mb-6">
                Your Processor Froze Your Funds. Here Is What To Do, In Order
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                A frozen Stripe account or a sudden settlement hold feels like the end. It usually is not. There is a fixed operator response, and the order matters more than the speed.
              </p>

              {/* Reviewed-by byline: real expert only (no fabricated author per locked portfolio_no_fictional_credentials policy). */}
              <div className="flex items-center gap-4 pt-6 border-t border-border">
                {/* eslint-disable-next-line @next/next/no-img-element -- static monogram SVG */}
                <img
                  src="/images/barak-monogram.svg"
                  alt="Barak Bachar, Global Payments Manager at myPayAdvisor"
                  className="w-12 h-12 rounded-full object-cover border border-border bg-card"
                />
                <div>
                  <p className="font-semibold text-foreground">
                    Reviewed by{" "}
                    <a href="/about/barak" className="underline hover:text-primary">Barak Bachar</a>, Global Payments Manager
                  </p>
                  <p className="text-sm text-muted-foreground">Covers high-risk merchant services, reserve negotiation, and frozen-funds recovery, with hands-on payment operations experience at the $500M+ annual volume level.</p>
                </div>
              </div>
            </header>

            {/* AEO lead-answer block: fixed-order operator response, 40-60 words, for AI Overviews / LLM extraction. */}
            <section className="aeo-answer mb-12 p-6 bg-primary/5 rounded-lg border-l-4 border-primary" data-speakable>
              <p className="text-lg text-foreground leading-relaxed">
                When a processor freezes your funds, follow a fixed order. First, get the specific reason in writing. Second, submit every requested document the same day, in full. Third, stand up a backup merchant account at a second acquirer so revenue keeps moving. Fourth, escalate in writing to the risk department. Fifth, if the hold runs past your contract&rsquo;s reserve terms, involve bank-card counsel.
              </p>
            </section>

            {/* Table of Contents */}
            <nav className="mb-12 p-6 bg-muted/30 rounded-lg">
              <h2 className="text-lg font-semibold text-foreground mb-4">Table of Contents</h2>
              <ul className="space-y-2 text-sm">
                <li><a href="#what-a-freeze-is" className="text-muted-foreground hover:text-primary transition-colors">1. What a funds freeze actually is</a></li>
                <li><a href="#why-stripe-freezes" className="text-muted-foreground hover:text-primary transition-colors">2. Why Stripe and aggregators freeze accounts</a></li>
                <li><a href="#operator-response" className="text-muted-foreground hover:text-primary transition-colors">3. The fixed operator response, step by step</a></li>
                <li><a href="#backup-mid" className="text-muted-foreground hover:text-primary transition-colors">4. Why a backup merchant account comes first, not last</a></li>
                <li><a href="#what-not-to-do" className="text-muted-foreground hover:text-primary transition-colors">5. What not to do</a></li>
                <li><a href="#faq" className="text-muted-foreground hover:text-primary transition-colors">6. Frequently asked questions</a></li>
              </ul>
            </nav>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-foreground leading-relaxed">
                If you are reading this with money you cannot reach, start with the fact that a freeze is rarely permanent. Most holds are a risk desk waiting on documentation, not a verdict that your business is finished. What determines how this ends is whether you respond in the right order and in writing. This page is the order. It assumes you are dealing with a real acquirer or an aggregator like Stripe, and it focuses on what you can actually do this week, not on legal theory.
              </p>

              <p className="text-foreground leading-relaxed">
                The same situation sits inside a larger category. If your business is in a vertical that banks treat cautiously, freezes and reserves are part of the terrain, which is why it helps to understand{" "}
                <Link href="/insights/high-risk-payment-processing-guide" className="text-primary hover:underline">high-risk merchant accounts</Link>{" "}
                as a whole. This page is the emergency entry point into that topic.
              </p>

              {/* Section 1 */}
              <h2 id="what-a-freeze-is" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                1. A funds freeze is a settlement hold, not a closure
              </h2>

              <p className="text-foreground leading-relaxed">
                A funds freeze is a temporary settlement hold placed by your acquirer or aggregator while it investigates a risk signal. The processor is not necessarily closing your account or keeping your money. It is pausing the flow of settled funds to your bank while it decides whether your transactions carry chargeback or fraud exposure it did not price for. The distinction matters, because a hold that is a documentation review behaves very differently from a reserve that is written into your contract for a defined window.
              </p>

              <p className="text-foreground leading-relaxed">
                Treating the two as the same thing is where merchants lose time. A documentation review can clear in days once you supply what is asked. A contractual reserve has terms, and those terms are your reference point if the hold drags on. For the difference between a temporary hold, a capped reserve, and a rolling reserve, see our explainer on{" "}
                <Link href="/insights/reserves-frozen-funds-capped-vs-rolling" className="text-primary hover:underline">capped vs rolling reserves and frozen funds</Link>.
              </p>

              {/* Section 2 */}
              <h2 id="why-stripe-freezes" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                2. Why Stripe and aggregators freeze accounts in the first place
              </h2>

              <p className="text-foreground leading-relaxed">
                Aggregators such as Stripe, PayPal, and Square onboard merchants instantly without full underwriting. That speed is the trade-off: because there is no deep review at signup, the review can happen later, after money is already moving. When the automated risk system sees something it could not assess up front, it pauses settlement and asks questions. Common triggers include a sudden volume spike, a rise in disputes, a vertical the platform later classifies as restricted, a mismatch between your stated business and your actual charges, or one unusually large transaction.
              </p>

              <p className="text-foreground leading-relaxed">
                None of those triggers means you did anything wrong. They mean the platform onboarded you faster than it underwrote you, and it is now catching up. If your business sits in a category banks treat cautiously, an aggregator is often the wrong long-term home, and the freeze is the signal to move toward a processor that underwrites your vertical on purpose rather than one that approved you by default.
              </p>

              {/* Section 3 */}
              <h2 id="operator-response" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                3. The fixed operator response, step by step
              </h2>

              <p className="text-foreground leading-relaxed">
                The order below is deliberate. Each step protects something the next one depends on, and skipping ahead is what turns a recoverable hold into a lost account.
              </p>

              <div className="my-8 p-6 bg-muted/30 rounded-lg border-l-4 border-primary">
                <ol className="text-foreground space-y-4 ml-4 list-decimal">
                  <li><strong>Get the specific reason in writing.</strong> Ask the processor, through its support or risk channel, to state the exact reason for the hold and what it needs from you. A written reason gives you something to act on and a record if this later goes to counsel. Do not accept a verbal explanation as the whole answer.</li>
                  <li><strong>Submit every requested document the same day, in full.</strong> Whatever the processor lists, bank statements, supplier invoices, proof of delivery, business license, compliance documents for regulated products, send all of it on day one. Partial responses read as a risk signal and extend the hold.</li>
                  <li><strong>Stand up a backup merchant account at a second acquirer.</strong> Open or activate a second account, ideally with a processor that specializes in your vertical, so revenue keeps moving while you work the original freeze. This removes the cash-flow emergency that pushes merchants into bad decisions.</li>
                  <li><strong>Escalate in writing to the risk department.</strong> If the front-line channel stalls, ask in writing for the risk or underwriting team and reference the documents you already submitted and the contractual terms. Keep it factual and dated. Written escalation creates accountability that a phone call does not.</li>
                  <li><strong>If the hold runs past your contract&rsquo;s reserve terms, involve bank-card counsel.</strong> When the timeline clearly exceeds what your agreement allows, bring in an attorney who knows card-network and acquiring agreements. By this point your written record is exactly what they need to assess whether the processor has overstepped.</li>
                </ol>
              </div>

              {/* Inline Barak Quotation block: opinion/experience, no fabricated stats. Mirrors quotationSchema JSON-LD above. */}
              <figure id="barak-quote" className="my-8 border-l-4 border-primary bg-muted/40 px-6 py-5 rounded-r-md not-prose">
                <blockquote cite="https://www.mypayadvisor.com/about/barak" className="text-foreground italic leading-relaxed">
                  &ldquo;A freeze feels like an accusation, so merchants react emotionally, and that is the mistake. The acquirer is not your adversary in that moment, they are a risk desk waiting on paperwork. Get the reason in writing, send every document they ask for the same day, and at the same time open a second merchant account so your revenue does not stop. The merchants who recover fastest treat the freeze as a documentation problem to solve in order, not a fight to win.&rdquo;
                </blockquote>
                <figcaption className="mt-3 text-sm text-muted-foreground not-italic">
                  <a href="/about/barak" className="text-primary hover:underline font-medium">Barak Bachar</a>, Global Payments Manager, myPayAdvisor
                </figcaption>
              </figure>

              {/* Section 4 */}
              <h2 id="backup-mid" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                4. Why a backup merchant account comes first, not last
              </h2>

              <p className="text-foreground leading-relaxed">
                The instinct during a freeze is to pour all your energy into the frozen account. That is backwards. Your first job is to stop the bleeding, and the bleeding is lost revenue, not the held balance. A backup merchant account at a second acquirer keeps sales flowing while the original hold works through its process. Experienced high-risk merchants run more than one merchant account on purpose for exactly this reason, so a single freeze never takes the whole business offline.
              </p>

              <p className="text-foreground leading-relaxed">
                If the frozen account is with an aggregator and your vertical is one banks treat cautiously, the backup should usually be a processor that underwrites your category deliberately. If you are weighing where to move, our guide to{" "}
                <Link href="/comparisons/stripe-high-risk-alternatives" className="text-primary hover:underline">Stripe high-risk alternatives</Link>{" "}
                walks through which specialists approve which verticals and how their reserve terms differ.
              </p>

              {/* Section 5 */}
              <h2 id="what-not-to-do" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                5. What not to do
              </h2>

              <ul className="text-foreground space-y-2 ml-6 list-disc">
                <li><strong>Do not threaten legal action as an opening move.</strong> It hardens the risk desk and rarely speeds anything up. Build the written record first; let counsel decide if and when to escalate.</li>
                <li><strong>Do not negotiate which documents to send.</strong> Send all of them. Selective responses extend the hold.</li>
                <li><strong>Do not run new charges through the frozen account to test it.</strong> Adding volume during an active review tends to deepen the freeze.</li>
                <li><strong>Do not go silent.</strong> A dated, factual, in-writing trail is your protection. Gaps in communication get read as risk.</li>
              </ul>

              {/* FAQ Section */}
              <h2 id="faq" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                6. Frequently Asked Questions
              </h2>

              <div className="space-y-6">
                <div className="p-6 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Why did Stripe freeze my account?</h3>
                  <p className="text-foreground">Stripe and similar aggregators freeze an account when their automated risk systems flag a pattern they could not underwrite up front: a sudden volume spike, a rise in disputes, a vertical they later treat as restricted, a mismatch between your stated business and your actual transactions, or a single unusual charge. Because aggregators onboard instantly without full underwriting, the review often happens after money is already flowing. It is usually a documentation and classification problem, and you are entitled to ask for the specific trigger in writing.</p>
                </div>

                <div className="p-6 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">How long can a processor hold my funds?</h3>
                  <p className="text-foreground">It depends on what is being investigated and what your contract allows. A documentation review can clear in days once you supply what is requested. A reserve tied to chargeback exposure can run for a defined window, commonly 90 to 180 days, because that is roughly how long a cardholder has to dispute a transaction. The hold period and any reserve terms should be in your agreement. If the processor holds funds longer than the contract states, or will not put the reason and expected release in writing, that is the point to escalate to the risk department and, if needed, bank-card counsel.</p>
                </div>

                <div className="p-6 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Should I open a second merchant account after a freeze?</h3>
                  <p className="text-foreground">Yes, and ideally before the next one happens. The most common operator mistake is depending on one merchant account, so a freeze stops all revenue at once. Standing up a backup account at a second acquirer, often one that specializes in your vertical, keeps money moving while you work the original freeze. The backup does not resolve the original hold, but it removes the cash-flow emergency that pushes merchants into bad decisions, and it signals to the frozen processor that you are not trapped.</p>
                </div>

                <div className="p-6 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Can I sue a payment processor for withholding my money?</h3>
                  <p className="text-foreground">Legal action is a last resort, and whether it is realistic depends entirely on your contract. Most processing agreements give the acquirer broad rights to hold funds against potential chargebacks and to maintain a reserve. The question is not whether they can hold money, but whether the hold exceeds the specific terms you signed. That is why the operator sequence puts everything in writing first: a documented timeline of the reason given, the documents you submitted, and the contractual reserve terms is exactly what bank-card counsel needs. Involve counsel when the hold clearly runs past the stated terms, not as an opening threat.</p>
                </div>

                <div className="p-6 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-3">What documents should I send when a processor asks for them?</h3>
                  <p className="text-foreground">Send everything the processor lists, in full, the same day. Typical requests include recent bank statements, supplier or fulfillment invoices, proof of delivery for disputed orders, a copy of your business license, and for regulated verticals product-compliance documents such as a Certificate of Analysis for CBD. Partial or slow responses are read as a risk signal and extend the hold. The merchants who clear a freeze fastest treat the document request as the path out rather than an accusation, and answer it completely on day one.</p>
                </div>
              </div>

              {/* CTA into Sorting Hat, deep-linked to the high-risk / track C path with funds_frozen pain point */}
              <div className="mt-12 p-8 bg-primary/10 rounded-xl text-center">
                <h3 className="text-2xl font-bold text-foreground mb-4">Need a backup processor that approves your vertical?</h3>
                <p className="text-muted-foreground mb-6">Take the free 2-minute assessment. We start from frozen funds and reserves and match you with high-risk specialists that underwrite your category on purpose.</p>
                <Link href="/quiz?track=c&painPoint=funds_frozen" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                  Start Free Assessment &rarr;
                </Link>
              </div>

              {/* Related */}
              <div className="mt-12 pt-8 border-t border-border">
                <h3 className="text-xl font-semibold text-foreground mb-6">Related Reading</h3>
                <div className="grid gap-4">
                  <Link href="/insights/high-risk-payment-processing-guide" className="group p-4 border border-border rounded-lg hover:border-primary transition-colors">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">High-Risk Merchant Accounts: The Operator&rsquo;s Guide</h4>
                    <p className="text-sm text-muted-foreground mt-1">The full picture: classification, reserves, VAMP, and who actually approves</p>
                  </Link>
                  <Link href="/comparisons/stripe-high-risk-alternatives" className="group p-4 border border-border rounded-lg hover:border-primary transition-colors">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">Stripe High-Risk Alternatives</h4>
                    <p className="text-sm text-muted-foreground mt-1">Where to move when an aggregator freezes you, by vertical</p>
                  </Link>
                  <Link href="/insights/reserves-frozen-funds-capped-vs-rolling" className="group p-4 border border-border rounded-lg hover:border-primary transition-colors">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">Capped vs Rolling Reserves and Frozen Funds</h4>
                    <p className="text-sm text-muted-foreground mt-1">How reserves work and how to get yours reduced in writing</p>
                  </Link>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}

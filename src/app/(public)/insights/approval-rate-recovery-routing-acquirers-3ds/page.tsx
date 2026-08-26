import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import Link from "next/link";
import { BARAK_PERSON_SCHEMA, BARAK_NAME, BARAK_TITLE, BARAK_LINKEDIN } from "@/data/personas/barak";
import { withSeoOverride } from "@/lib/seo/overrides";
import { AeoAnswer } from "@/components/seo/AeoAnswer";
import { RelatedLinks } from "@/components/seo/RelatedLinks";

const URL = "https://www.mypayadvisor.com/insights/approval-rate-recovery-routing-acquirers-3ds";
const TITLE = "Approval Rate Recovery: Routing, Acquirers, and 3DS2 in 2026";
const DESC = "Why approval rate problems are routing problems, not product problems. How interchange routing works, what acquirer-issuer relationships do to your auth rate, how 3DS2 frictionless flow recovers transactions, and a 90-day improvement roadmap.";

const baseMetadata: Metadata = {
  title: { absolute: TITLE },
  description: DESC,
  alternates: { canonical: URL },
  robots: { index: true, follow: true },
  openGraph: { type: "article", url: URL, title: TITLE, description: DESC, images: [{ url: "https://www.mypayadvisor.com/og-logo.png" }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("insights", "approval-rate-recovery-routing-acquirers-3ds", baseMetadata);
}

export default function Page() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Approval Rate Recovery in 2026: Routing, Acquirers, and 3DS2",
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
      { "@type": "Question", "name": "What is a normal approval rate for a US ecommerce merchant?", "acceptedAnswer": { "@type": "Answer", "text": "Domestic US Visa and Mastercard approval rates run 92% to 96% on a healthy account. Below 90% means a real routing or acquirer problem. International cross-border approval rates are 75% to 85% as a baseline, which is why merchants selling globally need local acquiring in their top 3 markets." } },
      { "@type": "Question", "name": "Will adding a second processor improve my approval rate?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, if the second processor uses a different acquirer with better issuer relationships in your traffic mix. No, if both processors route through the same acquirer. Approval lift comes from acquirer diversity, not from having two logos. Confirm the acquirer BIN before signing." } },
      { "@type": "Question", "name": "Does 3DS2 hurt or help approval rates?", "acceptedAnswer": { "@type": "Answer", "text": "It helps when used correctly. 3DS2 frictionless flow shifts liability to the issuer, which makes issuers approve transactions they would otherwise decline as fraud risk. Forcing 3DS2 challenge on every transaction hurts because customers abandon. The right setup is frictionless by default, challenge only on risk signals." } },
      { "@type": "Question", "name": "What is network tokenization and why does it matter for approval rates?", "acceptedAnswer": { "@type": "Answer", "text": "Network tokenization replaces the card PAN with a token issued by Visa or Mastercard. Issuers approve tokenized transactions at 1% to 3% higher rates than raw PANs because the token signals the card is in a verified merchant relationship. Turning it on is one of the highest-ROI auth-rate moves available in 2026." } },
      { "@type": "Question", "name": "How fast can I see auth-rate improvement after a routing change?", "acceptedAnswer": { "@type": "Answer", "text": "Same week. Routing changes take effect on the next transaction. The full picture takes 30 days because card mix and traffic patterns shift. A clean 90-day roadmap should show measurable lift in week 2 and stabilized lift by week 8." } }
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
                Approval Rate Recovery in 2026: Routing, Acquirers, and 3DS2
              </h1>
              <AeoAnswer kind="insights" slug="approval-rate-recovery-routing-acquirers-3ds" />
              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                Approval rate problems are routing problems, not product problems. Here is how interchange routing actually works, what acquirer-issuer relationships do to your auth rate, how 3DS2 frictionless flow recovers transactions you are losing today, and a 90-day roadmap to lift auth rates 2 to 5 points.
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
                <li><a href="#routing-not-product" className="text-muted-foreground hover:text-primary transition-colors">Why this is a routing problem</a></li>
                <li><a href="#how-routing-works" className="text-muted-foreground hover:text-primary transition-colors">How interchange routing actually works</a></li>
                <li><a href="#acquirer-issuer" className="text-muted-foreground hover:text-primary transition-colors">Acquirer-issuer relationships explained</a></li>
                <li><a href="#3ds2" className="text-muted-foreground hover:text-primary transition-colors">3DS2 frictionless flow</a></li>
                <li><a href="#config-mistakes" className="text-muted-foreground hover:text-primary transition-colors">Common config mistakes</a></li>
                <li><a href="#reading-dashboard" className="text-muted-foreground hover:text-primary transition-colors">Reading your auth-rate dashboard</a></li>
                <li><a href="#90-day" className="text-muted-foreground hover:text-primary transition-colors">The 90-day improvement roadmap</a></li>
                <li><a href="#faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </nav>

            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-foreground leading-relaxed">
                A 92% approval rate sounds fine until you do the math. On $1M monthly volume, every percentage point of auth rate is $10,000 of recovered revenue per month, $120,000 per year. Going from 92% to 95% is $360,000 a year. That is not optimization. That is a missing line on the P&amp;L.
              </p>
              <p className="text-foreground leading-relaxed">
                Every approval rate problem I have diagnosed traces back to four causes: wrong routing, wrong acquirer, missing 3DS2 frictionless, or missing network tokenization. Product, checkout UX, and fraud rules matter, but they are second-order. Fix the routing first.
              </p>

              <h2 id="routing-not-product" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Why approval rate problems are routing problems, not product problems
              </h2>
              <p className="text-foreground leading-relaxed">
                When a transaction declines, the merchant sees a generic error: &quot;do not honor,&quot; &quot;insufficient funds,&quot; &quot;contact issuer.&quot; Operators assume the customer got declined for a real reason. Often they did not. The issuer declined because the transaction looked unfamiliar: unfamiliar acquirer, unfamiliar BIN, unfamiliar geography, missing trust signals.

              </p>
              <p className="text-foreground leading-relaxed">
                Soft declines, the kind that flip to approvals on a retry through a different acquirer, run 3% to 8% of total volume on most accounts. That is the recoverable layer. None of it gets recovered by changing checkout copy or running another A/B test on the buy button.
              </p>

              <h2 id="how-routing-works" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                How interchange routing actually works
              </h2>
              <p className="text-foreground leading-relaxed">
                When a customer hits Pay, the transaction leaves your gateway, hits a processor, hits an acquirer, hits a card network (Visa, Mastercard), and finally hits the issuing bank. The issuer says yes or no. The answer travels back the same path.
              </p>
              <p className="text-foreground leading-relaxed">
                Each hop is a routing decision. The processor picks an acquirer. The acquirer picks a network rail. The network picks an issuer. Most merchants treat this as a black box. It is not. Each hop has a configuration, and the configuration determines whether your auth rate is 91% or 96%.
              </p>
              <p className="text-foreground leading-relaxed">
                Smart routing means the processor uses real-time data to pick the rail and acquirer most likely to approve a given BIN. Static routing means everything goes through one acquirer regardless. Static routing is what most accounts have, and it is why most accounts leave 2 to 5 points of approval rate on the table.
              </p>

              <h2 id="acquirer-issuer" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Acquirer-issuer relationships explained
              </h2>
              <p className="text-foreground leading-relaxed">
                Issuers (Chase, Citi, Capital One, Wells Fargo, plus thousands of credit unions) keep approval models per acquirer. If your acquirer has a long, clean history with that issuer, transactions get the benefit of the doubt. If the relationship is thin or noisy, the issuer is more conservative.
              </p>
              <p className="text-foreground leading-relaxed">
                Big-name acquirers (Chase Paymentech, Worldpay, Fiserv, Adyen, Stripe-as-acquirer in many cases) have deep issuer relationships in the US. Smaller acquirers and many international acquirers do not. If your processor is using a budget acquirer to save on interchange, your auth rate is paying for the savings.
              </p>
              <p className="text-foreground leading-relaxed">
                Cross-border makes this worse. A US merchant routing through a US acquirer sees 75% to 85% approval on European cards. The same volume routed through a European acquirer with local issuer relationships sees 88% to 93%. Local acquiring is the single biggest lever on cross-border auth.
              </p>
              <div className="my-8 p-6 bg-primary/5 rounded-lg border-l-4 border-primary">
                <p className="text-foreground"><strong>Rule of thumb:</strong> if more than 15% of your volume is from a single non-domestic country, you need local acquiring in that country. The auth-rate lift will pay for the integration in 60 to 90 days.</p>
              </div>

              <h2 id="3ds2" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                3DS2 frictionless flow
              </h2>
              <p className="text-foreground leading-relaxed">
                3DS2 is the protocol that lets the issuer see device, browser, and transaction context before approving. Done right, 95% of transactions go through frictionless (no challenge to the customer) and the issuer approves at higher rates because liability shifts to them.
              </p>
              <p className="text-foreground leading-relaxed">
                Done wrong, 3DS2 forces challenge on every transaction. Customers see a code prompt, half abandon, conversion drops 8 to 15 points. That is not a 3DS2 problem. That is a configuration problem.
              </p>
              <p className="text-foreground leading-relaxed">
                The right setup: 3DS2 enabled with frictionless as default, challenge triggered only by risk score above a threshold or by issuer mandate. On EU and UK volume, 3DS2 is required by SCA. On US volume, it is optional but lifts auth rates 1 to 3 points and shifts chargeback liability.
              </p>

              <h2 id="config-mistakes" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Common config mistakes
              </h2>
              <p className="text-foreground leading-relaxed">
                <strong>Missing CVV on card-on-file.</strong> Stored cards without the original CVV captured at first transaction get declined at higher rates. Capture CVV on the first transaction, store the network token, never store the CVV.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Wrong MCC code.</strong> The merchant category code drives interchange and risk model. A SaaS company classified under a generic MCC instead of 5734 (computer software stores) sees auth rates 2 to 4 points lower. Get the MCC right.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Account updater not enabled.</strong> Visa Account Updater and Mastercard Automatic Billing Updater catch reissued cards on subscription rebills. Without them, churn from card expiration runs 4% to 7% per month on subscription businesses. Free to enable. Enable it.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Static retry on soft declines.</strong> Retrying a soft decline through the same acquirer 30 seconds later gets the same answer. Retry through a different acquirer, or retry 24 hours later through a smart retry tool. Either recovers 30% to 60% of soft declines.
              </p>

              <h2 id="reading-dashboard" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Reading your auth-rate dashboard
              </h2>
              <p className="text-foreground leading-relaxed">
                Most processor dashboards show an aggregate approval rate. That number lies. Break it down by:
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Issuer BIN range.</strong> Top 20 issuers by volume, sorted by approval rate. The bottom 5 are your recovery target.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Card type.</strong> Credit, debit, prepaid, commercial. Commercial cards often run 3 to 6 points lower because of corporate fraud rules.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Geography.</strong> Domestic vs cross-border, by country. The cross-border number is almost always the gap.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Decline code.</strong> Group by ISO 8583 response code. Code 05 (do not honor), code 51 (insufficient funds), code 14 (invalid card) each have different recovery strategies.
              </p>

              <h2 id="90-day" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                The 90-day improvement roadmap
              </h2>
              <p className="text-foreground leading-relaxed">
                <strong>Days 1 to 14:</strong> Pull 30 days of transaction data with full decline-code breakdown. Identify the top 5 issuer BINs by decline volume and the top 3 decline codes. Confirm acquirer BIN. Confirm MCC code. Enable Account Updater if not on.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Days 15 to 30:</strong> Turn on network tokenization (Visa, Mastercard). Configure 3DS2 frictionless on EU and UK volume. Implement smart retry on soft declines (delay 24 hours, retry through alternate acquirer if available).
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Days 31 to 60:</strong> If cross-border is more than 15% of volume in a single market, scope local acquiring. If domestic auth on a top issuer is below benchmark, evaluate adding a second acquirer with stronger relationships there.
              </p>
              <p className="text-foreground leading-relaxed">
                <strong>Days 61 to 90:</strong> Measure. Lock in changes that produced lift. Reverse changes that did not. Document the new baseline. Set a quarterly review cadence.
              </p>
              <p className="text-foreground leading-relaxed">
                Realistic outcome: 2 to 4 points of approval rate recovered. On a $1M monthly account, that is $240,000 to $480,000 a year. None of it required new product, new checkout, or new fraud tools.
              </p>
              <p className="text-foreground leading-relaxed">
                If reserves or contract terms are blocking the routing changes you need, see the <Link href="/insights/payment-processor-negotiation-playbook" className="text-primary hover:underline">Negotiation Playbook</Link>.
              </p>

              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Soft declines vs hard declines: the recoverable layer
              </h2>
              <p className="text-foreground leading-relaxed">
                Not every decline is recoverable. Hard declines (lost card, stolen card, fraud-confirmed, account closed) are final. Soft declines (insufficient funds, do not honor, exceeds withdrawal limit, issuer system error) are recoverable, sometimes immediately on a different routing path, sometimes 24 hours later when the customer&apos;s funds clear.
              </p>
              <p className="text-foreground leading-relaxed">
                On a typical account, hard declines run 1% to 2% of attempts. Soft declines run 4% to 8%. The soft-decline pool is your recoverable revenue. A smart retry tool, configured against ISO 8583 response codes, recovers 30% to 60% of soft declines without the customer ever seeing a failure message.
              </p>
              <p className="text-foreground leading-relaxed">
                The most expensive mistake here is retrying a soft decline through the same acquirer 30 seconds later. The issuer returns the same answer. Worse, on some BIN ranges, repeated retries trigger a fraud flag that hardens the decline for 24 to 48 hours. Smart retry waits, varies the routing, and respects retry limits the network publishes.
              </p>

              <h2 className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                The reserves and contract terms that block routing changes
              </h2>
              <p className="text-foreground leading-relaxed">
                Approval rate recovery often requires structural changes the current contract was never set up to allow. Adding a second acquirer requires a second MID. Adding a second MID often requires re-underwriting. If the current processor holds a reserve, that reserve does not transfer. If the current contract has an ETF, splitting volume across two processors may trigger it.
              </p>
              <p className="text-foreground leading-relaxed">
                These are solvable. Most processors will allow a second MID under the same parent account if the volume justification is clean. If they will not, see <Link href="/insights/reserves-frozen-funds-capped-vs-rolling" className="text-primary hover:underline">Capped vs Rolling Reserves</Link> for how to negotiate the reserve out, and the <Link href="/insights/payment-processor-negotiation-playbook" className="text-primary hover:underline">Negotiation Playbook</Link> for how to remove the ETF.
              </p>
              <p className="text-foreground leading-relaxed">
                Treat routing optimization as a 6-month project, not a 6-week one. The technical work is fast. The contract work is what takes time.
              </p>

              <h2 id="faq" className="text-2xl font-serif font-bold text-foreground mt-12 mb-6 pt-8 border-t border-border">
                Frequently asked questions
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">What is a normal approval rate for a US ecommerce merchant?</h3>
                  <p className="text-foreground leading-relaxed">Domestic US Visa and Mastercard approval rates run 92% to 96% on a healthy account. Below 90% means a real routing or acquirer problem. International cross-border approval rates are 75% to 85% as a baseline, which is why merchants selling globally need local acquiring in their top 3 markets.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Will adding a second processor improve my approval rate?</h3>
                  <p className="text-foreground leading-relaxed">Yes, if the second processor uses a different acquirer with better issuer relationships in your traffic mix. No, if both processors route through the same acquirer. Approval lift comes from acquirer diversity, not from having two logos. Confirm the acquirer BIN before signing.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Does 3DS2 hurt or help approval rates?</h3>
                  <p className="text-foreground leading-relaxed">It helps when used correctly. 3DS2 frictionless flow shifts liability to the issuer, which makes issuers approve transactions they would otherwise decline as fraud risk. Forcing 3DS2 challenge on every transaction hurts because customers abandon. The right setup is frictionless by default, challenge only on risk signals.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">What is network tokenization and why does it matter for approval rates?</h3>
                  <p className="text-foreground leading-relaxed">Network tokenization replaces the card PAN with a token issued by Visa or Mastercard. Issuers approve tokenized transactions at 1% to 3% higher rates than raw PANs because the token signals the card is in a verified merchant relationship. Turning it on is one of the highest-ROI auth-rate moves available in 2026.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">How fast can I see auth-rate improvement after a routing change?</h3>
                  <p className="text-foreground leading-relaxed">Same week. Routing changes take effect on the next transaction. The full picture takes 30 days because card mix and traffic patterns shift. A clean 90-day roadmap should show measurable lift in week 2 and stabilized lift by week 8.</p>
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
    <RelatedLinks kind="insights" slug="approval-rate-recovery-routing-acquirers-3ds" />
    </>
  );
}

import Link from "next/link";
import { MatchCTA } from "@/components/MatchCTA";
import ReviewerBioBox from "@/components/ReviewerBioBox";
import { ArticleByline } from "@/components/seo/ArticleByline";

const FAQ = [
  {
    q: "Is PaymentCloud or Durango cheaper for high-risk?",
    a: "PaymentCloud publishes no rates, so every PaymentCloud price is a quote. Durango publishes typical ranges for its high-risk accounts: 1.95% to 4.95% plus $0.15 to $0.25 per authorization, chargeback fees of $15 to $25, and a $5,000 monthly processing minimum for U.S. accounts ($50,000 for international accounts). Durango says these are ranges, not quotes, and that your exact pricing goes into a written offer before you sign. Because PaymentCloud gives no numbers in advance, the only fair comparison is written quotes from both, side by side.",
  },
  {
    q: "Which one approves CBD, firearms, nutra, or adult?",
    a: "PaymentCloud lists CBD, guns and firearms, adult, vape and e-cig, and nutraceuticals among the industries it supports. Durango also approves supplements and nutraceuticals, vape and tobacco, CBD (U.S.-only, with a Certificate of Analysis under 12 months old), and firearms dealers, but it lists adult content, kratom, and outbound tech support among the categories it cannot take. For adult content, PaymentCloud is the one of the two that will consider you. For a supplement, vape, or CBD store, get quotes from both.",
  },
  {
    q: "Do PaymentCloud and Durango both require a rolling reserve?",
    a: "Either can, because the reserve is set in underwriting by the bank behind the account. PaymentCloud says reserve requirements vary by business type and are discussed before signing, and publishes no percentage. Durango publishes a typical rolling reserve of 5% to 10% held 90 to 180 days, higher after a shutdown or termination, and says new businesses are often approved with a reserve of about 10% for six months. Reserves are often negotiable after several clean months: ask in writing with your chargeback ratio in hand.",
  },
  {
    q: "Can I switch from Stripe to PaymentCloud or Durango after a freeze?",
    a: "Yes. Both work with merchants that Stripe, PayPal, or Square have declined, frozen, or terminated; Durango says most of the merchants it gets approved have been told no before. Move quickly: get the freeze reason in writing, gather your processing history, and apply to a specialist whose banks already underwrite your category. A prior freeze does not block approval by itself; underwriting weighs it alongside your chargeback ratio and documentation. Durango will not open an account while you are on the MATCH list or if your chargeback ratio is 5% or higher over three months.",
  },
];

interface ContentSlots {
  /** <AeoAnswer> from page.tsx. Rendered directly under the H1. */
  aeoAnswer?: React.ReactNode;
  /** <RelatedLinks> from page.tsx. Rendered at the end of the article. */
  relatedLinks?: React.ReactNode;
}

export default function PaymentCloudVsDurangoContent({ aeoAnswer, relatedLinks }: ContentSlots) {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-12 justify-center">
          <article className="max-w-3xl flex-1 min-w-0">
            <header className="pt-16 pb-10 border-b border-border">
              <p className="text-sm font-medium text-primary mb-4">High-Risk Processor Comparison</p>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-8 leading-[1.1] tracking-tight">
                PaymentCloud vs Durango Merchant Services: High-Risk Approval, Reserves, and Fit (2026)
              </h1>
              {aeoAnswer}
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
                Both are U.S. high-risk specialists that approve merchants the big processors decline. PaymentCloud quotes everything and accepts some verticals Durango turns away, such as adult content; Durango publishes its price and reserve ranges up front and also sets up international accounts in Canada, Europe, and Panama.
              </p>
              <ArticleByline
                author="Reviewed by Barak Bachar"
                authorUrl="/about/barak"
                lastUpdated="2026-11-11"
              />
              <MatchCTA
                variant="inline"
                headline="PaymentCloud or Durango, which actually fits your vertical?"
                subline="Get a 60-second match based on your industry, volume, and chargeback history. We answer to you, not the processors."
              />
            </header>

            {/* AEO answer block: direct, extractable verdict for AI Overviews / LLMs. */}
            <section className="py-10 border-b border-border aeo-answer" data-speakable>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">Quick Verdict</h2>
              <div className="space-y-4">
                <p className="text-lg text-foreground leading-relaxed">
                  PaymentCloud and Durango Merchant Services are both U.S. high-risk specialists with similar stated approval times: 24 hours to 5 days for PaymentCloud, as little as 24 hours and usually 1 to 3 business days for Durango. PaymentCloud publishes no rates, says it has no long-term contracts, and lists adult among its industries. Durango publishes typical ranges (1.95% to 4.95% plus $0.15 to $0.25 per authorization, a 5% to 10% rolling reserve held 90 to 180 days), charges no termination fee on U.S. accounts, and offers international accounts, but will not take adult content, kratom, or outbound tech support. The real difference is published terms and international reach versus a wider list of accepted verticals.
                </p>
                <p>
                  <strong className="text-primary">Choose PaymentCloud</strong> if your vertical is one Durango turns away, such as adult content, or you want ACH, eCheck, and in-person terminals from the same provider.
                </p>
                <p>
                  <strong className="text-primary">Choose Durango</strong> when you want price and reserve ranges in writing before you apply, or you need an international or multi-currency account.
                </p>
              </div>
            </section>

            <nav className="py-10 border-b border-border">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">In This Article</h2>
              <ol className="grid md:grid-cols-2 gap-2 text-sm list-decimal list-inside">
                {[
                  { href: "#comparison", label: "Side-by-Side Comparison" },
                  { href: "#paymentcloud", label: "PaymentCloud at a Glance" },
                  { href: "#durango", label: "Durango at a Glance" },
                  { href: "#reserves", label: "Reserves Compared" },
                  { href: "#vertical", label: "Which Fits Your Vertical" },
                  { href: "#verdict", label: "The Operator's Verdict" },
                  { href: "#faq", label: "FAQ" },
                ].map((item) => (
                  <li key={item.href} className="text-muted-foreground">
                    <a href={item.href} className="text-primary hover:underline">{item.label}</a>
                  </li>
                ))}
              </ol>
            </nav>

            <section id="comparison" className="py-10 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">Side-by-Side Comparison</h2>
              <p className="text-foreground leading-relaxed mb-6">
                Everything below comes from each provider&rsquo;s own site. PaymentCloud publishes no rates. Durango publishes typical ranges and says they are ranges, not quotes. Your final rate, reserve, and limits are set in underwriting, so get them in writing.
              </p>
              <div className="overflow-x-auto my-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-foreground">
                      <th className="text-left py-3 pr-4 font-semibold text-foreground"> </th>
                      <th className="text-left py-3 pr-4 font-semibold text-foreground">PaymentCloud</th>
                      <th className="text-left py-3 font-semibold text-foreground">Durango Merchant Services</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground">
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4 font-medium">Type</td>
                      <td className="py-3 pr-4">High-risk specialist, partner banks not named</td>
                      <td className="py-3">High-risk specialist; registered ISO of Fifth Third Bank, N.A.; U.S. plus international accounts</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4 font-medium">Published pricing</td>
                      <td className="py-3 pr-4">None; quote-only</td>
                      <td className="py-3">1.95% to 4.95% plus $0.15 to $0.25 per authorization; chargeback fee $15 to $25 (typical ranges)</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4 font-medium">Best-fit verticals</td>
                      <td className="py-3 pr-4">CBD, firearms, adult, nutra, vape, subscription, travel, tech support</td>
                      <td className="py-3">Supplements, travel, subscriptions, vape, CBD (U.S. only), high ticket, international; no adult content, kratom, or outbound tech support</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4 font-medium">Reserve</td>
                      <td className="py-3 pr-4">Varies by business type; not published</td>
                      <td className="py-3">5% to 10% typical, held 90 to 180 days</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4 font-medium">Contract</td>
                      <td className="py-3 pr-4">&ldquo;No long-term contracts&rdquo; per its homepage; termination fees not published</td>
                      <td className="py-3">No early termination fee on U.S. accounts; international terms vary by country</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4 font-medium">Stated approval time</td>
                      <td className="py-3 pr-4">24 hours to 5 days (homepage)</td>
                      <td className="py-3">As little as 24 hours; most 1 to 3 business days; complex files 3 to 5</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4 font-medium">Volume</td>
                      <td className="py-3 pr-4">Monthly limit on every account; suggests starting at $5,000 or $10,000</td>
                      <td className="py-3">$5,000 a month minimum for U.S. accounts; $50,000 for international</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4 font-medium">Where accounts are set up</td>
                      <td className="py-3 pr-4">U.S.</td>
                      <td className="py-3">U.S., Canada, Europe, and Panama</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4 font-medium">Support model</td>
                      <td className="py-3 pr-4">Account manager familiar with your industry; U.S.-based support</td>
                      <td className="py-3">Dedicated account manager; based in Durango, Colorado, since 2004</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4 font-medium">Best for</td>
                      <td className="py-3 pr-4">Verticals Durango excludes, or merchants wanting ACH, eCheck, and terminals too</td>
                      <td className="py-3">Merchants who want published terms, or need an international or multi-currency account</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section id="paymentcloud" className="py-10 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">PaymentCloud at a Glance</h2>
              <p className="text-foreground leading-relaxed">
                <a href="https://paymentcloudinc.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PaymentCloud</a> places high-risk merchants with partner banks it does not name. Its industries page lists CBD, guns and firearms, adult, vape and e-cig, nutraceuticals and supplements, continuity and subscription, travel, tech support, and online pharmacy, among others. Its homepage promises support from an account manager familiar with your industry, says it has no long-term contracts, and gives approval times of 24 hours to 5 days. It publishes no rate card: card rates, monthly fees, setup fees, reserves, and termination fees are all quoted after underwriting. Every account has a monthly volume limit, and PaymentCloud suggests starting at $5,000 or $10,000 and asking for increases after three months of clean processing.
              </p>
            </section>

            <section id="durango" className="py-10 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">Durango Merchant Services at a Glance</h2>
              <p className="text-foreground leading-relaxed">
                <a href="https://www.durangomerchantservices.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Durango Merchant Services</a> is a high-risk specialist based in Durango, Colorado, since 2004 and a registered ISO of Fifth Third Bank, N.A. It sets up U.S. accounts and international, multi-currency accounts in Canada, Europe, and Panama. Unusually for this category, it publishes typical ranges: 1.95% to 4.95% plus $0.15 to $0.25 per authorization, a 5% to 10% rolling reserve held 90 to 180 days, $15 to $25 chargeback fees, and a $5,000 monthly minimum for U.S. accounts ($50,000 for international). U.S. accounts carry no early termination fee. It is also clear about its limits: it will not take adult content, kratom, or outbound tech support, merchants currently on the MATCH list, or chargeback ratios of 5% or higher over three months. Onboarding is handled by a specialist who prepares the application rather than a self-serve flow.
              </p>
            </section>

            <section id="reserves" className="py-10 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">Reserves Compared: The Number That Actually Matters</h2>
              <p className="text-foreground leading-relaxed mb-6">
                With either provider, the reserve is set in underwriting by the bank behind your account. PaymentCloud says reserve requirements vary by business type and are discussed before you sign, without a published figure. Durango publishes a typical 5% to 10% rolling reserve held 90 to 180 days, higher after a shutdown or termination, and says new businesses are often approved with about 10% for six months. Either way it is often negotiable once you have a clean processing history. This is where an operator&rsquo;s judgment beats a price comparison.
              </p>
              <figure id="barak-quote" className="my-8 border-l-4 border-primary bg-muted/40 px-6 py-5 rounded-r-md">
                <blockquote cite="https://www.mypayadvisor.com/about/barak" className="text-foreground italic leading-relaxed">
                  &ldquo;In high-risk, the highest published approval rate is not the metric that matters. What matters is how many acquiring banks sit behind the processor, because a single-bank setup is one underwriting decision away from another freeze. I would rather place a merchant with a provider that routes across several banks at a slightly higher rate than win on price and watch the account get shut off in ninety days. Stability is the product. The rate is secondary.&rdquo;
                </blockquote>
                <figcaption className="mt-3 text-sm text-muted-foreground not-italic">
                  <a href="/about/barak" className="text-primary hover:underline font-medium">Barak Bachar</a>, Global Payments Manager, myPayAdvisor
                </figcaption>
              </figure>
              <p className="text-foreground leading-relaxed">
                For the written-request process that lowers a reserve over time, see our guide to <Link href="/insights/reserves-frozen-funds-capped-vs-rolling" className="text-primary hover:underline">capped vs rolling reserves</Link>.
              </p>
            </section>

            <section id="vertical" className="py-10 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">Which One Fits Your Vertical</h2>
              <ul className="text-foreground space-y-3 ml-6 list-disc">
                <li><strong>CBD, firearms, nutra, vape (U.S.):</strong> both serve these; get a quote from each. Durango&rsquo;s CBD accounts are U.S.-only and need a Certificate of Analysis under 12 months old.</li>
                <li><strong>Adult content:</strong> PaymentCloud lists adult among its industries; Durango lists adult content as a category it cannot take. Tech support sellers should note Durango reviews inbound tech support but not outbound.</li>
                <li><strong>Selling internationally or in several currencies:</strong> Durango, for accounts in Canada, Europe, or Panama (minimum $50,000 a month).</li>
                <li><strong>Want terms before you apply:</strong> Durango publishes rate, reserve, and fee ranges and charges no termination fee on U.S. accounts.</li>
                <li><strong>Switching after a Stripe or PayPal freeze:</strong> either works; both state similar approval times, so apply to both and compare written offers.</li>
              </ul>
              <p className="text-foreground leading-relaxed mt-6">
                For the full category, including reserves, VAMP thresholds, and how to stay approved, read our <Link href="/insights/high-risk-payment-processing-guide" className="text-primary hover:underline">operator&rsquo;s guide to high-risk merchant accounts</Link>.
              </p>
            </section>

            <section id="verdict" className="py-10 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">The Operator&rsquo;s Verdict</h2>
              <p className="p-4 bg-muted/50 text-foreground leading-relaxed">
                <strong>Bottom line:</strong> Choose PaymentCloud if your vertical is one Durango excludes, such as adult content, or you want ACH, eCheck, and terminals from one provider; choose Durango when you want published price and reserve ranges, no termination fee on a U.S. account, or an international account. Approval speed is not the deciding factor: both state similar times. Compare written quotes from both, and weigh stability over a slightly lower headline rate.
              </p>
            </section>

            <section id="faq" className="py-10 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">FAQ</h2>
              <div className="space-y-6">
                {FAQ.map((item, i) => (
                  <div key={i} className="border-b border-border pb-6 last:border-b-0">
                    <h3 className="font-semibold mb-2">{item.q}</h3>
                    <p className="text-sm text-muted-foreground">{item.a}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="py-10 border-t border-border">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Related</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/insights/high-risk-payment-processing-guide" className="text-primary hover:underline text-sm">High-Risk Merchant Accounts: Operator&rsquo;s Guide &rarr;</Link>
                <Link href="/insights/reserves-frozen-funds-capped-vs-rolling" className="text-primary hover:underline text-sm">Capped vs Rolling Reserves &rarr;</Link>
                <Link href="/comparisons" className="text-primary hover:underline text-sm">All Comparisons &rarr;</Link>
              </div>
            </section>

            <ReviewerBioBox linkProfile={false} />

            <footer className="py-8 border-t border-border">
              <p className="text-xs text-muted-foreground">Disclosure: We may earn a commission if you sign up through our links. Rates and terms are quoted per merchant by each provider and should be verified in writing.</p>
            </footer>
          </article>
        </div>
      </div>
    {relatedLinks}
    </main>
  );
}

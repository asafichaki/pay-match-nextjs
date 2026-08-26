import Link from "next/link";
import { MatchCTA } from "@/components/MatchCTA";
import ReviewerBioBox from "@/components/ReviewerBioBox";
import { ArticleByline } from "@/components/seo/ArticleByline";

const FAQ = [
  {
    q: "Is PaymentCloud or Durango cheaper for high-risk?",
    a: "Neither publishes a fixed high-risk rate; both quote per merchant after underwriting your industry, chargeback history, and volume. PaymentCloud positions on domestic interchange-plus and tiered pricing; Durango can route domestically or offshore, and an offshore placement sometimes lowers the effective cost or reserve for a heavily penalized vertical. The cheaper option depends on which acquiring bank approves you, so compare written quotes side by side.",
  },
  {
    q: "Which one approves CBD, firearms, or nutra?",
    a: "PaymentCloud publicly accepts CBD, firearms, adult, e-cig, and nutraceutical merchants through domestic acquirers, a common default for U.S. e-commerce. Durango serves these too and adds offshore acquiring, which matters once a vertical, chargeback history, or volume has been declined domestically. For a clean domestic store, PaymentCloud is usually faster; for harder-to-place cases, Durango widens the options.",
  },
  {
    q: "Do PaymentCloud and Durango both require a rolling reserve?",
    a: "Both can, because the reserve is set by the acquiring bank behind the account, not the reseller. For high-risk verticals a reserve is common: a percentage of each batch held for a fixed window. It is negotiable over time; after several clean months, a written release request citing a low chargeback ratio and active fraud tooling often reduces the percentage or hold window with either provider.",
  },
  {
    q: "Can I switch from Stripe to PaymentCloud or Durango after a freeze?",
    a: "Yes. Both specialize in merchants that Stripe, PayPal, or Square have declined, frozen, or terminated. Move quickly: get the freeze reason in writing, gather your processing history, and apply to a specialist whose acquiring banks already underwrite your category. A prior freeze does not block approval by itself; underwriting weighs it alongside your chargeback ratio and documentation.",
  },
];

export default function PaymentCloudVsDurangoContent() {
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
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed mb-8">
                Both are real U.S. high-risk specialists that approve merchants the big processors decline. PaymentCloud is the stronger domestic default for fast onboarding; Durango is the better call when you need offshore acquiring or a domestic bank has already said no.
              </p>
              <ArticleByline
                author="Reviewed by Barak Bachar"
                authorUrl="/about/barak"
                lastUpdated="2026-08-25"
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
                  PaymentCloud and Durango Merchant Services are both U.S. high-risk specialists. PaymentCloud is the stronger default for domestic CBD, firearms, and nutra e-commerce that wants fast onboarding and month-to-month positioning. Durango is the better choice when you need offshore acquiring, very high volume, or a vertical (some adult, travel, tech-support) that domestic banks decline. The real difference is reserve flexibility and which acquiring banks sit behind each.
                </p>
                <p>
                  <strong className="text-primary">Choose PaymentCloud</strong> for fast domestic high-risk approval with month-to-month terms and a dedicated account rep.
                </p>
                <p>
                  <strong className="text-primary">Choose Durango</strong> when a domestic bank has already declined you, or you need offshore acquiring or very high volume.
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
                Positioning below reflects each provider&rsquo;s publicly stated focus and onboarding model. Both quote rates per merchant on underwriting, so we do not publish fixed numbers. Treat any &ldquo;guaranteed rate&rdquo; claim as a starting position to verify in writing.
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
                      <td className="py-3 pr-4">High-risk specialist, U.S. acquirers</td>
                      <td className="py-3">High-risk specialist, domestic and offshore</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4 font-medium">Best-fit verticals</td>
                      <td className="py-3 pr-4">CBD, firearms, adult, nutra, e-cig, e-commerce</td>
                      <td className="py-3">Offshore, adult, travel, high-volume, tech-support</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4 font-medium">Reserve</td>
                      <td className="py-3 pr-4">Rolling, set by acquirer, negotiable over time</td>
                      <td className="py-3">Rolling; offshore options can change domestic terms</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4 font-medium">Contract positioning</td>
                      <td className="py-3 pr-4">Month-to-month positioning, no long-term lock advertised</td>
                      <td className="py-3">Varies by acquiring bank</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4 font-medium">Acquiring breadth</td>
                      <td className="py-3 pr-4">Domestic acquirers</td>
                      <td className="py-3">Domestic plus offshore acquiring</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4 font-medium">Support model</td>
                      <td className="py-3 pr-4">Dedicated account rep, U.S.-based</td>
                      <td className="py-3">High-touch, high-risk focused</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 pr-4 font-medium">Best for</td>
                      <td className="py-3 pr-4">Domestic high-risk e-commerce wanting speed and simplicity</td>
                      <td className="py-3">Merchants declined domestically, or needing offshore / very high volume</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section id="paymentcloud" className="py-10 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">PaymentCloud at a Glance</h2>
              <p className="text-foreground leading-relaxed">
                <a href="https://paymentcloudinc.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PaymentCloud</a> is a domestic high-risk reseller that places merchants with U.S. acquiring banks. It publicly states acceptance of CBD, firearms, adult, e-cig, nutraceutical, and broad e-commerce verticals, pairs each account with a dedicated rep, and positions on month-to-month terms. Pricing is interchange-plus or tiered and quoted per merchant after underwriting, so the rate you see depends on your industry, chargeback history, and volume, not a published rate card.
              </p>
            </section>

            <section id="durango" className="py-10 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">Durango Merchant Services at a Glance</h2>
              <p className="text-foreground leading-relaxed">
                <a href="https://www.durangomerchantservices.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Durango Merchant Services</a> is a high-risk specialist that places accounts with both domestic and offshore acquiring banks. The offshore option is the differentiator: it widens approval for verticals, chargeback profiles, or volume levels that domestic banks decline, and an offshore placement can change the reserve or effective cost. Durango leans toward offshore-suited, adult, travel, tech-support, and high-volume merchants, with high-touch onboarding rather than a self-serve flow.
              </p>
            </section>

            <section id="reserves" className="py-10 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">Reserves Compared: The Number That Actually Matters</h2>
              <p className="text-foreground leading-relaxed mb-6">
                With either provider, the reserve is set by the acquiring bank behind your account, not by the reseller. For high-risk verticals a rolling reserve is common, and it is negotiable once you have a clean processing history. This is where an operator&rsquo;s judgment beats a price comparison.
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
                <li><strong>CBD, firearms, nutra, e-cig (domestic):</strong> PaymentCloud is the usual fast path through U.S. acquirers.</li>
                <li><strong>Adult, travel, tech-support, or already declined domestically:</strong> Durango&rsquo;s offshore acquiring widens approval.</li>
                <li><strong>Very high volume needing multiple banks:</strong> Durango, for acquirer breadth and stability.</li>
                <li><strong>Switching after a Stripe or PayPal freeze:</strong> either works; start with PaymentCloud for speed, fall back to Durango if domestic banks decline.</li>
              </ul>
              <p className="text-foreground leading-relaxed mt-6">
                For the full category, including reserves, VAMP thresholds, and how to stay approved, read our <Link href="/insights/high-risk-payment-processing-guide" className="text-primary hover:underline">operator&rsquo;s guide to high-risk merchant accounts</Link>.
              </p>
            </section>

            <section id="verdict" className="py-10 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">The Operator&rsquo;s Verdict</h2>
              <p className="p-4 bg-muted/50 text-foreground leading-relaxed">
                <strong>Bottom line:</strong> Choose PaymentCloud for fast domestic high-risk approval with month-to-month terms; choose Durango when a domestic bank has already declined you, or you need offshore acquiring or very high volume. Compare written quotes from both, and weigh acquirer breadth over a slightly lower headline rate.
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
    </main>
  );
}

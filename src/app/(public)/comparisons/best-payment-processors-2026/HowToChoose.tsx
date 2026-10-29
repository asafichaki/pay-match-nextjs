import Link from "next/link";

/**
 * The buying guide under the reviews. Plain explanation of the five things
 * that actually move a merchant's cost, in the order they matter.
 */
export function HowToChoose() {
  return (
    <section id="how-to-choose" className="border-t border-border py-10">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">How to choose a payment processor</h2>
      <p className="text-muted-foreground leading-relaxed">
        Most merchants pick a processor on the headline rate and find out what it really costs on the third statement. Five things decide what you pay, roughly in this order.
      </p>

      <h3 className="mt-6 text-xl font-semibold text-foreground">1. Your monthly volume</h3>
      <p className="mt-2 text-muted-foreground leading-relaxed">
        Volume changes the answer more than anything else. Below about $25K a month, flat-rate pricing (one percentage plus a few cents per sale) is usually cheapest because there is no monthly fee to spread. Between $25K and $80K, interchange-plus providers start to win. Above $80K to $100K, subscription and membership models that pass interchange through at cost tend to beat everyone, because the fixed fee becomes small next to the markup you no longer pay. That is why the table shows four volumes instead of one rank.
      </p>

      <h3 className="mt-6 text-xl font-semibold text-foreground">2. How you take payments</h3>
      <p className="mt-2 text-muted-foreground leading-relaxed">
        Card-present payments (tap, dip, swipe) cost less than online or keyed payments, because the card networks charge less when the card is physically there. A restaurant and an online store with the same volume will see different winners. If you sell both ways, compare the rate for the channel where most of your money comes in.
      </p>

      <h3 className="mt-6 text-xl font-semibold text-foreground">3. The pricing model</h3>
      <p className="mt-2 text-muted-foreground leading-relaxed">
        Flat-rate is simple and predictable. Interchange-plus shows you the network cost and a fixed markup on top, so you can see exactly what the processor keeps. Tiered pricing sorts cards into &ldquo;qualified&rdquo; and &ldquo;non-qualified&rdquo; buckets and is the hardest to audit; if a quote is tiered, ask for interchange-plus instead. Our <Link href="/insights/payment-processor-fees-guide" className="text-primary hover:underline">fees guide</Link> walks through each line on a statement.
      </p>

      <h3 className="mt-6 text-xl font-semibold text-foreground">4. Contract, hardware and exit costs</h3>
      <p className="mt-2 text-muted-foreground leading-relaxed">
        A cheap rate with a three-year contract and a leased terminal can cost more than a slightly higher rate you can walk away from. Before signing, ask four things in writing: the contract length, the early termination fee, whether hardware is bought or leased, and every monthly or annual fee that is not a percentage. The <Link href="/insights/merchant-contract-cancellation-guide" className="text-primary hover:underline">contract cancellation guide</Link> covers what to do if you are already locked in.
      </p>

      <h3 className="mt-6 text-xl font-semibold text-foreground">5. How fast you get paid</h3>
      <p className="mt-2 text-muted-foreground leading-relaxed">
        Standard deposits usually land in one to two business days for free. Same-day or instant payouts typically cost 1.5% to 1.95% of the amount moved, which on a busy month can add more than the gap between two processors&apos; rates. If cash flow is tight, compare the payout fee as carefully as the card rate. See <Link href="/comparisons/best-payment-processors-with-same-day-deposit-2026" className="text-primary hover:underline">same-day deposit processors</Link>.
      </p>

      <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">A quick check on any quote:</strong> divide last month&apos;s total processing fees by last month&apos;s card volume. That is your effective rate, the same number this page ranks on. If a quote does not let you work it out, ask until it does.
      </div>
    </section>
  );
}

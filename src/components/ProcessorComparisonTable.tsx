import Link from "next/link";

interface Processor {
  name: string;
  online: string;
  inPerson: string;
  monthlyFee: string;
  bestFor: string;
  href?: string;
}

const PROCESSORS: Processor[] = [
  {
    name: "Stripe",
    online: "2.9% + $0.30",
    inPerson: "2.7% + $0.05",
    monthlyFee: "$0",
    bestFor: "Online-first, developer teams",
    href: "/comparisons/stripe-vs-paypal",
  },
  {
    name: "Square",
    online: "2.9% + $0.30",
    inPerson: "2.6% + $0.10",
    monthlyFee: "$0",
    bestFor: "Retail / POS, $0-$80K monthly",
    href: "/comparisons/square-vs-stripe",
  },
  {
    name: "PayPal",
    online: "2.99% + $0.49",
    inPerson: "2.29% + $0.09",
    monthlyFee: "$0",
    bestFor: "Checkout conversion (5-10% lift)",
    href: "/comparisons/stripe-vs-paypal",
  },
  {
    name: "Helcim",
    online: "IC + 0.40% + $0.08",
    inPerson: "IC + 0.30% + $0.08",
    monthlyFee: "$0",
    bestFor: "Transparent IC-plus, >$25K/mo",
    href: "/comparisons/helcim-vs-stripe",
  },
  {
    name: "Stax (FattMerchant)",
    online: "IC + $0.18",
    inPerson: "IC + $0.10",
    monthlyFee: "$99-199",
    bestFor: "Subscription pricing, >$80K/mo",
  },
  {
    name: "Payment Depot",
    online: "IC + 0.20%",
    inPerson: "IC + 0.15%",
    monthlyFee: "$79-199",
    bestFor: "High volume members, >$100K/mo",
  },
  {
    name: "Clover",
    online: "2.3-3.5% + $0.10",
    inPerson: "2.3-2.6% + $0.10",
    monthlyFee: "$0-$60",
    bestFor: "All-in-one restaurant / retail POS",
  },
  {
    name: "Authorize.net",
    online: "2.9% + $0.30",
    inPerson: "N/A (gateway)",
    monthlyFee: "$25 + $0.10/tx",
    bestFor: "Gateway-only, BYO processor",
  },
  {
    name: "Braintree",
    online: "2.59% + $0.49",
    inPerson: "2.29% + $0.09",
    monthlyFee: "$0",
    bestFor: "Subscription + marketplace",
  },
  {
    name: "Adyen",
    online: "IC + 0.60% + $0.13",
    inPerson: "IC + 0.50% + $0.13",
    monthlyFee: "Custom",
    bestFor: "Enterprise / global / >$1M/mo",
  },
  {
    name: "Shopify Payments",
    online: "2.4-2.9% + $0.30",
    inPerson: "2.4-2.7% + $0.00",
    monthlyFee: "Plan-bundled",
    bestFor: "Shopify stores only",
  },
  {
    name: "Worldpay",
    online: "Negotiated",
    inPerson: "Negotiated",
    monthlyFee: "Custom",
    bestFor: "Mid-market enterprise, >$500K/mo",
  },
];

export default function ProcessorComparisonTable() {
  return (
    <section
      aria-labelledby="rates-table-heading"
      className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-8 sm:py-10"
    >
      <header className="mb-4 sm:mb-6">
        <h2
          id="rates-table-heading"
          className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight"
        >
          12 Payment Processors at a Glance — 2026 Real Rates
        </h2>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-3xl">
          Published 2026 rates for the U.S. market. <strong className="text-foreground">IC</strong> = interchange (the
          card-network fee, typically 1.3-2.3% — passed through). For your effective rate, use the{" "}
          <Link href="/calculator" className="text-primary hover:underline font-medium">
            fee calculator
          </Link>
          .
        </p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-foreground">
            <tr>
              <th scope="col" className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                Processor
              </th>
              <th scope="col" className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                Online rate
              </th>
              <th scope="col" className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                In-person rate
              </th>
              <th scope="col" className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                Monthly fee
              </th>
              <th scope="col" className="text-left font-semibold px-4 py-3">
                Best for
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {PROCESSORS.map((p) => (
              <tr key={p.name} className="hover:bg-muted/30 transition-colors">
                <th
                  scope="row"
                  className="text-left font-semibold text-foreground px-4 py-3 whitespace-nowrap"
                >
                  {p.href ? (
                    <Link href={p.href} className="text-primary hover:underline">
                      {p.name}
                    </Link>
                  ) : (
                    p.name
                  )}
                </th>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.online}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.inPerson}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.monthlyFee}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.bestFor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Rates pulled from each processor's public pricing page as of {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}.
        Custom-negotiated rates differ. Effective rate (what you actually pay) usually runs 0.20-0.60% above sticker due to card mix and hidden fees.
      </p>
    </section>
  );
}

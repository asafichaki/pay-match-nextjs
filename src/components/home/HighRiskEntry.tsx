// Homepage high-risk tile.
//
// Specified in May, never built. Until PR 3 the only homepage link into the
// high-risk cluster was one of four equal cards in <EditorialPicks>, and the
// four comparison pages in the cluster had no homepage entry at all. The pillar
// has been "Crawled, currently not indexed" since 2026-05-16 and the homepage is
// the strongest internal page we can point at it.
//
// Copy rule: nothing new is claimed here. The verticals, the reserve and VAMP
// framing and the "approval before rate" line are all already published on
// /insights/high-risk-payment-processing-guide and on the /comparisons hub.

import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";

const CLUSTER = [
  {
    href: "/comparisons/best-high-risk-friendly-payment-processors-2026",
    label: "Processors that approve high-risk merchants",
  },
  {
    href: "/comparisons/stripe-high-risk-alternatives",
    label: "Stripe alternatives after a shutdown",
  },
  {
    href: "/comparisons/paymentcloud-vs-durango",
    label: "PaymentCloud vs Durango",
  },
  {
    href: "/comparisons/paymentcloud-vs-easy-pay-direct",
    label: "PaymentCloud vs Easy Pay Direct",
  },
];

export default function HighRiskEntry() {
  return (
    <section className="bg-muted/30 border-y border-border" aria-labelledby="high-risk-entry-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
          <div className="text-center md:text-left">
            <p className="inline-flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-wider font-medium text-primary mb-2 sm:mb-3">
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              High-risk merchants
            </p>
            <h2
              id="high-risk-entry-heading"
              className="font-display text-3xl md:text-4xl font-bold text-foreground"
            >
              Declined, frozen, or classified high-risk?
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-xl mx-auto md:mx-0">
              The rates above assume a processor will take you. CBD, gaming, nutra, firearms, travel
              and subscription merchants get underwritten on a different set of rules, where reserves
              and VAMP thresholds decide the real cost and approval comes before rate.
            </p>
            <Link
              href="/insights/high-risk-payment-processing-guide"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Read the high-risk payment processing guide
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2">
            {CLUSTER.map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className="group flex h-full items-start justify-between gap-3 rounded-lg border border-border bg-background p-4 transition-all hover:border-primary hover:shadow-md"
                >
                  <span className="text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
                    {c.label}
                  </span>
                  <ArrowRight
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

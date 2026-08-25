import Link from "next/link";

// Server-rendered "Related guides" block for the tool pages (/quiz, /calculator).
// Both had zero outbound internal links (2026-08-25 link-graph audit), so the
// equity they collect from the homepage and the comparison shells stopped there.
// Five hub links: the two cornerstones, the two section hubs, the high-risk pillar.
// PR 2 replaces this with <RelatedLinks kind="pages"> read from seo_overrides.

const GUIDES = [
  {
    href: "/comparisons/best-payment-processors-2026",
    title: "Best payment processors 2026",
    blurb: "15 U.S. processors ranked by effective rate at four volume tiers.",
  },
  {
    href: "/insights/payment-processor-fees-guide",
    title: "Payment processor fees guide",
    blurb: "Interchange, assessments, markup: what each line on the statement means.",
  },
  {
    href: "/comparisons",
    title: "All processor comparisons",
    blurb: "Head-to-head pricing on Stripe, Square, Helcim, PayPal and 50 more.",
  },
  {
    href: "/insights",
    title: "Insights and guides",
    blurb: "Statement audits, negotiation playbooks, reserves, approval rates.",
  },
  {
    href: "/insights/high-risk-payment-processing-guide",
    title: "High-risk payment processing guide",
    blurb: "Chargeback thresholds, reserves, and the processors that approve hard verticals.",
  },
] as const;

export function RelatedGuides({ heading = "Related guides" }: { heading?: string }) {
  return (
    <section aria-labelledby="related-guides-heading" className="container mx-auto max-w-3xl px-4 pb-16">
      <h2 id="related-guides-heading" className="text-2xl font-serif font-bold text-foreground mb-6">
        {heading}
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {GUIDES.map((g) => (
          <li key={g.href}>
            <Link
              href={g.href}
              className="group block h-full rounded-lg border border-border p-4 transition-colors hover:border-primary"
            >
              <span className="block font-semibold text-foreground group-hover:text-primary">{g.title}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{g.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RelatedGuides;

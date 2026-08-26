import Link from "next/link";
import { getSeoOverride } from "@/lib/seo/overrides";

// Server-rendered "Related guides" block for the tool pages (/quiz, /calculator).
// Both had zero outbound internal links (2026-08-25 link-graph audit), so the
// equity they collect from the homepage and the comparison shells stopped there.
// Five hub links: the two cornerstones, the two section hubs, the high-risk pillar.
//
// PR 2 gives it the override path instead of replacing it: the list below is
// the fallback, and `seo_overrides` with kind "pages" and slug "quiz" or
// "calculator" takes precedence when the loop writes one. The blurbs are only
// on the hand-written entries; an override supplies title-only cards, which is
// the same shape <RelatedLinks> renders on articles.

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

interface Guide {
  href: string;
  title: string;
  blurb?: string;
}

export async function RelatedGuides({
  heading = "Related guides",
  slug,
}: {
  heading?: string;
  /** Override slug under kind "pages", e.g. "quiz" or "calculator". */
  slug?: string;
}) {
  let guides: readonly Guide[] = GUIDES;
  if (slug) {
    const override = await getSeoOverride("pages", slug);
    if (override?.related_links?.length) guides = override.related_links;
  }

  return (
    <section aria-labelledby="related-guides-heading" className="container mx-auto max-w-3xl px-4 pb-16">
      <h2 id="related-guides-heading" className="text-2xl font-serif font-bold text-foreground mb-6">
        {heading}
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {guides.map((g) => (
          <li key={g.href}>
            <Link
              href={g.href}
              className="group block h-full rounded-lg border border-border p-4 transition-colors hover:border-primary"
            >
              <span className="block font-semibold text-foreground group-hover:text-primary">{g.title}</span>
              {g.blurb ? (
                <span className="mt-1 block text-sm text-muted-foreground">{g.blurb}</span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RelatedGuides;

// Section taxonomy for the /comparisons hub.
//
// The hub was a flat list of 57 items sitting at position 31.0 with 1,651
// impressions and 2 clicks (GSC, 28 days to 2026-08-25). A flat list gives a
// crawler no shape and a reader no entry point, and it is the ONLY inbound link
// 40% of the corpus has. These four sections give both.
//
// The rule is deterministic and applies to rows that did not exist when this
// file was written, so a comparison the autopilot publishes tomorrow lands in
// the right section with no edit here.
//
// NOTE: scripts/seo/build-comparison-adjacency.mjs carries the same rule for
// its scoring pass. Change one, change the other.

export type ComparisonSection = "high-risk" | "brand-duel" | "volume" | "use-case";

export const CORNERSTONE_SLUG = "best-payment-processors-2026";

export function sectionOfSlug(slug: string): ComparisonSection {
  if (slug.includes("high-risk") || slug.startsWith("paymentcloud-")) return "high-risk";
  if (slug === CORNERSTONE_SLUG) return "volume";
  // [0-9][0-9km-]* covers "10k-25k" and "500k-1m"; an earlier [\dk-]+ dropped
  // the 500k-1m tier into "use case" because of the "m".
  if (/^best-payment-processors-[0-9][0-9km-]*-monthly-\d{4}$/.test(slug)) return "volume";
  if (slug.includes("-vs-")) return "brand-duel";
  return "use-case";
}

export function sectionOfHref(href: string): ComparisonSection {
  return sectionOfSlug(href.replace(/^\/comparisons\//, ""));
}

interface SectionMeta {
  id: string;
  eyebrow: string;
  heading: string;
  /**
   * 40 to 60 words. Every number in here is already on this page: the hero
   * quotes the 2.32% to 3.07% effective-rate band, and the FAQ block below
   * carries the sub-$10K, $80K and $250K thresholds. Nothing new is claimed.
   */
  intro: string;
  /**
   * A phrase inside `intro` that renders as a link. Kept here rather than in
   * JSX so the visible copy and the ItemList description can never drift.
   */
  link?: { phrase: string; href: string };
}

export const SECTION_ORDER: ComparisonSection[] = ["brand-duel", "volume", "use-case", "high-risk"];

export const SECTION_META: Record<ComparisonSection, SectionMeta> = {
  "brand-duel": {
    id: "brand-duels",
    eyebrow: "Head to head",
    heading: "Brand duels",
    intro:
      "Two processors, one decision. Each of these runs the same effective-rate math on both sides at your volume and card mix, then says which one wins and where the break-even sits. Start here when you have already narrowed the field to a shortlist of two and need the cost difference in dollars.",
  },
  volume: {
    id: "by-monthly-volume",
    eyebrow: "By size",
    heading: "By monthly volume",
    intro:
      "Processing cost is a function of volume, not brand. Below $10,000 a month flat-rate pricing is usually fine; above $80,000 both Stripe and Square are beaten by interchange-plus. These pages break the market into tiers and show what a merchant at that size should expect to pay.",
  },
  "use-case": {
    id: "by-use-case",
    eyebrow: "By requirement",
    heading: "By use case",
    intro:
      "Same processors, different constraints. A restaurant needs tip adjustment and fast funding, a B2B seller needs Level 2 and Level 3 data, a subscription business needs dunning and retry logic that stays inside card-network rules. These roundups rank the field by the requirement that decides the shortlist rather than by headline rate alone.",
  },
  "high-risk": {
    id: "high-risk",
    eyebrow: "Hard to approve",
    heading: "High-risk merchants",
    intro:
      "Declined, frozen, or classified high-risk by underwriting? Rate is the second question here, approval is the first. Start with the high-risk payment processing guide for how underwriting classifies CBD, gaming, nutra, firearms, travel and subscription merchants, what reserves and VAMP thresholds cost, then compare the processors that actually approve.",
    link: {
      phrase: "high-risk payment processing guide",
      href: "/insights/high-risk-payment-processing-guide",
    },
  },
};

/** Splits an intro into [before, phrase, after] when the section carries a link. */
export function splitIntro(meta: SectionMeta): [string, string, string] | null {
  if (!meta.link) return null;
  const i = meta.intro.indexOf(meta.link.phrase);
  if (i === -1) return null;
  return [
    meta.intro.slice(0, i),
    meta.link.phrase,
    meta.intro.slice(i + meta.link.phrase.length),
  ];
}

import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, TrendingUp, Headphones, PlayCircle, Presentation } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { MatchCTA } from "@/components/MatchCTA";
import ProcessorComparisonTable from "@/components/ProcessorComparisonTable";
import { createSupabasePublicClient } from "@/integrations/supabase/server-public";
import { REDIRECTED_COMPARISON_SLUGS } from "@/lib/comparisons/redirected-slugs";
import { VOLUME_TIERS } from "@/lib/comparisons/volume-tiers";
import { RATES_CHECKED, channelRates, formatRate, mainTable, type TierIndex } from "@/lib/data/ranking-2026";
import { ASSUMPTIONS, FEES, crossoverTicket, engineRate, feeLabel, pct } from "@/lib/data/vs-pages-2026";
import {
  SECTION_META,
  SECTION_ORDER,
  sectionOfHref,
  splitIntro,
  type ComparisonSection,
} from "@/lib/comparisons/sections";

export const revalidate = 3600;

interface Comparison {
  title: string;
  description: string;
  href: string;
  date: string;
  iso?: string;
  featured?: boolean;
  hasAudio?: boolean;
  hasVideo?: boolean;
  hasSlides?: boolean;
}

function formatComparisonDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

async function fetchDbComparisons(): Promise<Comparison[]> {
  try {
    // Use anonymous (cookie-free) client so this page stays static + bf-cache eligible.
    const supabase = createSupabasePublicClient();
    const { data } = await (supabase as any)
      .from("blog_articles")
      .select("slug,title,description,meta_description,published_at,updated_at,audio_url,video_url,youtube_id,slide_image_urls")
      .eq("kind", "comparisons")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(500);
    if (!data) return [];
    return (data as any[]).filter((row) => !REDIRECTED_COMPARISON_SLUGS.has(row.slug)).map((row) => ({
      title: row.title || row.slug,
      description: row.description || row.meta_description || "",
      href: `/comparisons/${row.slug}`,
      date: row.published_at ? formatComparisonDate(row.published_at) : "",
      iso: row.published_at || row.updated_at || "",
      hasAudio: !!row.audio_url,
      hasVideo: !!(row.video_url || row.youtube_id),
      hasSlides: Array.isArray(row.slide_image_urls) && row.slide_image_urls.length > 0,
    }));
  } catch {
    return [];
  }
}

// Every number on this page comes from the ranking engine (lib/data/ranking-2026.ts),
// the same source as the ranking, the vs-pages and /data/effective-rates-2026.
// The title and description stay literal so the SEO manifest and llms.txt can read
// them statically; the check below fails the build if a price moves under them.
const HUB = (() => {
  const rows = mainTable();
  const at = (t: TierIndex) => rows.map((r) => ({ name: r.name, rate: r.rates[t] as number, channel: channelRates(r, t) }));
  const low = (t: TierIndex) => at(t).reduce((a, b) => (b.rate < a.rate ? b : a));
  const high = (t: TierIndex) => at(t).reduce((a, b) => (b.rate > a.rate ? b : a));
  const ch = (x: { rate: number; channel: { inPerson: number | null; online: number | null } }) => (x.channel.inPerson === x.rate ? "in person" : "online");
  return { low0: low(0), high0: high(0), low1: low(1), low2: low(2), low3: low(3), ch };
})();
const HUB_TITLE = "Compare Payment Processors 2026: Fees at $10K to $1M";
const HUB_DESCRIPTION = "Published prices for Helcim, PayPal, Stripe, Square, Stax and more, checked Oct 29, 2026. Effective rates run 1.73% to 3.75% from $10K to $1M a month.";
{
  const computed = `Published prices for Helcim, PayPal, Stripe, Square, Stax and more, checked ${RATES_CHECKED}. Effective rates run ${formatRate(HUB.low3.rate)} to ${formatRate(HUB.high0.rate)} from $10K to $1M a month.`;
  if (computed !== HUB_DESCRIPTION) throw new Error(`comparisons hub: description literal is out of date with ranking-2026.ts. Expected: ${computed}`);
}

export const metadata: Metadata = {
  title: { absolute: HUB_TITLE },
  description: HUB_DESCRIPTION,
  keywords: "compare payment processors, payment processor comparison, Square vs Stripe, PayPal vs Stripe, best payment processor 2026, merchant services comparison",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://www.mypayadvisor.com/comparisons",
    types: {
      "application/rss+xml": "https://www.mypayadvisor.com/comparisons/feed.xml",
    },
  },
  openGraph: {
    type: "website",
    url: "https://www.mypayadvisor.com/comparisons",
    title: HUB_TITLE,
    description: HUB_DESCRIPTION,
    images: [{ url: "https://www.mypayadvisor.com/og-logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: HUB_TITLE,
    description: HUB_DESCRIPTION,
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
};

const sq = FEES.square;
const st = FEES.stripe;
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I compare payment processors fairly?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Compare on five things: effective rate at your card mix and ticket size, contract length and termination fee, settlement time, extra fees (PCI, monthly minimum, batch, statement), and whether the processor approves your industry. The headline percentage rarely matches what you actually pay, because the fixed fee per sale and any monthly fee move it."
      }
    },
    {
      "@type": "Question",
      "name": "Is Stripe cheaper than Square?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `In person, by a little on small sales. Stripe Terminal charges ${feeLabel(st.inPerson)} and Square Free ${feeLabel(sq.inPersonFree)}, which is ${pct(engineRate("Stripe", "In-person", 0))} against ${pct(engineRate("Square", "In-person", 0))} on a $${ASSUMPTIONS.averageSale} sale. The two cost the same at a $${crossoverTicket(st.inPerson, sq.inPersonFree)} ticket and Square costs less above it. Online, both charge ${feeLabel(sq.onlinePaidOrApi)} on Square's paid plans or Online API, but Square Free charges ${feeLabel(sq.onlineFree)}. On our assumptions, interchange-plus from Helcim costs less than either: ${pct(engineRate("Helcim", "In-person", 0))} in person at $10K a month.`
      }
    },
    {
      "@type": "Question",
      "name": "Which payment processor has the lowest fees in 2026?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `On our published method (a $${ASSUMPTIONS.averageSale} average sale, ${ASSUMPTIONS.cardMix}), ${HUB.low0.name} is cheapest at $10K a month (${formatRate(HUB.low0.rate)} ${HUB.ch(HUB.low0)}) and ${HUB.low1.name} at $50K (${formatRate(HUB.low1.rate)}). From $250K, ${HUB.low2.name} is cheapest (${formatRate(HUB.low2.rate)} at $250K, ${formatRate(HUB.low3.rate)} at $1M). Your own rate moves with your card mix and average sale, so run your numbers in the fee calculator.`
      }
    },
    {
      "@type": "Question",
      "name": "Should I use PayPal or Stripe for online payments?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Stripe wins on developer tooling, subscription billing and checkout control. PayPal wins with buyers who already pay with PayPal or Venmo. Many checkouts run both: Stripe as the card processor and PayPal as an extra button, so the higher PayPal rate applies only to the orders that use it."
      }
    },
    {
      "@type": "Question",
      "name": "How long does it take to switch payment processors?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For an online merchant on a standard processor, switching usually takes one to three weeks: underwriting, integration testing, and updating webhooks or checkout settings. Complex or high-risk businesses should plan for longer. Check your current contract for a termination fee before you start."
      }
    }
  ]
};

const staticComparisons: Comparison[] = [
  {
    title: "Best Payment Processing Companies 2026: Complete Guide",
    description: "Expert analysis of Leaders Merchant Services, Worldpay, Clover, Payment Depot, Stax, Stripe, and more. Find the lowest fees and best features for your business.",
    href: "/comparisons/best-payment-processors-2026",
    date: "Jan. 6, 2026",
    iso: "2026-01-06",
    featured: true
  },
  {
    title: "Square vs Stripe: Which Payment Processor Is Right for You?",
    description: "In-person POS vs online payments. A comprehensive breakdown of fees, features, and best use cases to help you decide which platform suits your business model.",
    href: "/comparisons/square-vs-stripe",
    date: "Nov. 15, 2025",
    iso: "2025-11-15"
  },
  {
    title: "PayPal vs Square: Complete Comparison for Small Businesses",
    description: "Online payments & international reach vs in-person POS excellence. Compare transaction fees, hardware costs, and features for retail and e-commerce.",
    href: "/comparisons/paypal-vs-square",
    date: "Nov. 12, 2025",
    iso: "2025-11-12"
  },
  {
    title: "Stripe vs PayPal: Developer Tools vs Consumer Trust",
    description: "Which payment gateway wins for online businesses? We compare APIs, subscription billing, international fees, and merchant experience.",
    href: "/comparisons/stripe-vs-paypal",
    date: "Nov. 10, 2025",
    iso: "2025-11-10"
  },
  {
    title: "Helcim vs Stripe: Transparent Pricing vs Advanced Features",
    description: "Interchange-plus against a flat rate, priced at $10K, $50K and $250K a month in person and online, with the break-even card mix.",
    href: "/comparisons/helcim-vs-stripe",
    date: "Nov. 8, 2025",
    iso: "2025-11-08"
  },
];

/**
 * The eight static shells the hand-written list above never covered.
 *
 * `staticComparisons` listed 5 of the 13 shells, so the hub silently omitted
 * the five volume-tier pages and the three high-risk shells: 8 of 54
 * comparisons had no link from the hub that is supposed to be their only
 * distribution path. Titles, descriptions and dates below are the pages' own
 * metadata and their ComparisonSchema `datePublished`, nothing invented.
 */
const tierComparisons: Comparison[] = VOLUME_TIERS.map((t) => ({
  title: t.metaTitle,
  description: t.metaDescription,
  href: `/comparisons/${t.slug}`,
  date: "May 18, 2026",
  iso: "2026-05-18",
}));

const highRiskShellComparisons: Comparison[] = [
  {
    title: "Stripe High-Risk Alternatives 2026: Where to Go After a Freeze",
    description:
      "Stripe froze your account or holds your funds? Here are real high-risk payment processors that approve merchants Stripe declines: PaymentCloud, Durango, Easy Pay Direct, Soar Payments, and Host Merchant Services.",
    href: "/comparisons/stripe-high-risk-alternatives",
    date: "May 30, 2026",
    iso: "2026-05-30",
  },
  {
    title: "PaymentCloud vs Durango 2026: Which High-Risk Processor Approves You Faster",
    description:
      "PaymentCloud vs Durango Merchant Services for high-risk merchants. Approved verticals, reserves, approval speed, and offshore options compared.",
    href: "/comparisons/paymentcloud-vs-durango",
    date: "May 30, 2026",
    iso: "2026-05-30",
  },
  {
    title: "PaymentCloud vs Easy Pay Direct 2026: High-Risk Approval and Multi-MID Compared",
    description:
      "PaymentCloud vs Easy Pay Direct for high-risk merchants. Approved verticals, reserves, load balancing across multiple MIDs, and approval speed compared.",
    href: "/comparisons/paymentcloud-vs-easy-pay-direct",
    date: "May 30, 2026",
    iso: "2026-05-30",
  },
];

async function getAllComparisons(): Promise<Comparison[]> {
  const dbComparisons = await fetchDbComparisons();
  const byHref = new Map<string, Comparison>();
  for (const c of staticComparisons) byHref.set(c.href, c);
  for (const c of tierComparisons) byHref.set(c.href, c);
  for (const c of highRiskShellComparisons) byHref.set(c.href, c);
  for (const c of dbComparisons) byHref.set(c.href, c);
  const merged = Array.from(byHref.values());
  merged.sort((a, b) => (b.iso || "").localeCompare(a.iso || ""));
  return merged;
}

function buildStructuredData(comparisons: Comparison[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Payment Processor Comparisons",
    "description": "Side-by-side comparisons of top payment processors to help you choose the best solution for your business.",
    "url": "https://www.mypayadvisor.com/comparisons",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": comparisons.length,
      "itemListElement": comparisons.map((comparison, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://www.mypayadvisor.com${comparison.href}`,
        "name": comparison.title
      }))
    }
  };
}

/**
 * One ItemList per section, alongside the existing CollectionPage.
 *
 * The CollectionPage keeps its own mainEntity ItemList of every comparison, so
 * nothing that validated before this change stops validating. These four are
 * additive and give each section an addressable @id, which is what lets an
 * answer engine quote "the high-risk comparisons on myPayAdvisor" as a set.
 */
function buildSectionItemLists(grouped: Map<ComparisonSection, Comparison[]>) {
  return SECTION_ORDER.filter((s) => (grouped.get(s)?.length ?? 0) > 0).map((s) => {
    const meta = SECTION_META[s];
    const items = grouped.get(s) as Comparison[];
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `https://www.mypayadvisor.com/comparisons#${meta.id}`,
      "name": meta.heading,
      "description": meta.intro,
      "numberOfItems": items.length,
      "itemListOrder": "https://schema.org/ItemListUnordered",
      "itemListElement": items.map((c, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "url": `https://www.mypayadvisor.com${c.href}`,
        "name": c.title,
      })),
    };
  });
}

function groupBySection(comparisons: Comparison[]): Map<ComparisonSection, Comparison[]> {
  const grouped = new Map<ComparisonSection, Comparison[]>();
  for (const s of SECTION_ORDER) grouped.set(s, []);
  for (const c of comparisons) {
    (grouped.get(sectionOfHref(c.href)) as Comparison[]).push(c);
  }
  return grouped;
}

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.mypayadvisor.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Comparisons",
      "item": "https://www.mypayadvisor.com/comparisons"
    }
  ]
};

const speakableSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://www.mypayadvisor.com/comparisons#webpage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": ["[aria-labelledby='rates-table-heading'] header", "h1"]
  }
};

// Literal on purpose: the old new Date() version re-stamped the hub as "updated this
// month" on every render (check-dates.mjs now fails the build on render-time dates).
// Update it when the rate table or the list actually changes.
const LAST_REVIEWED = "November 2026";

export default async function ComparisonsPage() {
  const comparisons = await getAllComparisons();
  const structuredData = buildStructuredData(comparisons);
  const grouped = groupBySection(comparisons);
  const sections = SECTION_ORDER.filter((s) => (grouped.get(s)?.length ?? 0) > 0);
  const sectionItemLists = buildSectionItemLists(grouped);
  return (
    <>
      <JsonLd data={structuredData} />
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      <JsonLd data={speakableSchema} />
      {sectionItemLists.map((data) => (
        <JsonLd key={data["@id"]} data={data} />
      ))}

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section
          className="relative overflow-hidden bg-background border-b border-border/50"
          aria-labelledby="comparisons-heading"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 items-center">
              {/* Text content - left side */}
              <div className="relative py-8 md:py-10 lg:py-12 pr-4 lg:pr-8">
                {/* Gray extension under text area */}
                <div
                  className="absolute -bottom-4 -left-20 right-0 h-24 bg-gradient-to-t from-muted/40 via-muted/20 to-transparent lg:block hidden"
                  aria-hidden="true"
                />
                <header className="space-y-2 sm:space-y-3 relative z-10 text-center md:text-left">
                  <h1
                    id="comparisons-heading"
                    className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight"
                  >
                    Compare Payment Processors:{" "}
                    <span className="text-primary">Real 2026 Rates from $10K to $1M Monthly</span>
                  </h1>

                  <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-xl hidden md:block">
                    Prices read from each provider&apos;s own pricing page on {RATES_CHECKED}. At $10K a month the effective rate runs from {formatRate(HUB.low0.rate)} ({HUB.low0.name}, {HUB.ch(HUB.low0)}) to {formatRate(HUB.high0.rate)} ({HUB.high0.name}, {HUB.ch(HUB.high0)}). At $1M it falls to {formatRate(HUB.low3.rate)} ({HUB.low3.name}). Pick by your monthly volume and how you take cards.
                  </p>

                  <div className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-primary">
                    <TrendingUp className="h-4 w-4" aria-hidden="true" />
                    <span>Updated {LAST_REVIEWED}</span>
                  </div>

                  <MatchCTA variant="inline" className="max-w-xl !my-5" />
                </header>
              </div>

              {/* Image - right side */}
              <div className="relative hidden lg:block h-full min-h-[300px]">
                {/* Image container */}
                <div
                  className="absolute inset-0 bg-cover bg-center brightness-105"
                  style={{
                    backgroundImage: `url(/images/comparisons-hero-new.png)`,
                    backgroundPosition: 'center center'
                  }}
                  aria-hidden="true"
                />
                {/* Gradient fade on left edge */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-background via-background/40 via-10% to-transparent"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-r from-background via-background/40 via-10% to-transparent"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

        </section>

        {/* Above-fold comparison table */}
        <ProcessorComparisonTable />

        {/* High-risk row: the hub had no link to the pillar (Check 2, 2026-08-25). Server-rendered.
            The three high-risk comparisons it used to list now have their own cards in the
            "High-risk merchants" section below, so this row carries the pillar link only. */}
        <section aria-labelledby="high-risk-row-heading" className="border-y border-border bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-6">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-primary mb-1">High-risk merchants</p>
            <h2 id="high-risk-row-heading" className="text-lg font-bold text-foreground mb-2">Declined, frozen, or flagged as high-risk?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The rates below assume a processor will take you. Before you compare them, read the{" "}
              <Link href="/insights/high-risk-payment-processing-guide" className="text-primary font-medium hover:underline">high-risk payment processing guide</Link>
              {" "}for reserves, VAMP thresholds and the processors that approve CBD, gaming, nutra, firearms, travel and subscription merchants.
            </p>
          </div>
        </section>

        {/* The head-to-heads readers search for most, linked in a sentence rather than only as cards. */}
        <section aria-labelledby="popular-vs-heading" className="border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-6">
            <h2 id="popular-vs-heading" className="text-lg font-bold text-foreground mb-2">The most-read head-to-heads</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Choosing between two big names? Start with <Link href="/comparisons/square-vs-stripe" className="text-primary font-medium hover:underline">Square vs Stripe fees</Link> if you sell in person, or <Link href="/comparisons/stripe-vs-paypal" className="text-primary font-medium hover:underline">Stripe vs PayPal</Link> if you sell online. If cost matters more than brand, see how interchange-plus pricing compares in <Link href="/comparisons/helcim-vs-stripe" className="text-primary font-medium hover:underline">Helcim vs Stripe</Link> and <Link href="/comparisons/square-vs-helcim-2026" className="text-primary font-medium hover:underline">Helcim vs Square</Link>. Above about $250K a month, <Link href="/comparisons/stripe-vs-worldpay-2026" className="text-primary font-medium hover:underline">Stripe vs Worldpay</Link> covers when a negotiated contract beats a flat rate. Every one uses the same prices and method as our <Link href="/comparisons/best-payment-processors-2026" className="text-primary font-medium hover:underline">payment processor ranking</Link>.
            </p>
          </div>
        </section>

        {/* Comparisons List, split into four sections. */}
        <section className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <nav aria-label="Comparison sections" className="mb-8 flex flex-wrap gap-2">
              {sections.map((s) => (
                <a
                  key={s}
                  href={`#${SECTION_META[s].id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {SECTION_META[s].heading}
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {grouped.get(s)?.length ?? 0}
                  </span>
                </a>
              ))}
            </nav>

            {sections.map((s, sectionIndex) => {
              const meta = SECTION_META[s];
              const items = grouped.get(s) as Comparison[];
              const parts = splitIntro(meta);
              return (
                <section
                  key={s}
                  id={meta.id}
                  aria-labelledby={`${meta.id}-heading`}
                  className={`mb-4 scroll-mt-24 ${sectionIndex === 0 ? "" : "border-t border-border pt-8"}`}
                >
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-primary mb-1">
                    {meta.eyebrow}
                  </p>
                  <h2
                    id={`${meta.id}-heading`}
                    className="text-2xl sm:text-3xl font-bold text-foreground mb-3"
                  >
                    {meta.heading}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed max-w-2xl">
                    {parts && meta.link ? (
                      <>
                        {parts[0]}
                        <Link
                          href={meta.link.href}
                          className="text-primary font-medium hover:underline"
                        >
                          {parts[1]}
                        </Link>
                        {parts[2]}
                      </>
                    ) : (
                      meta.intro
                    )}
                  </p>

                  <div className="divide-y divide-border">
                    {items.map((comparison) => (
                      <Link
                        key={comparison.href}
                        href={comparison.href}
                        className="group block py-8"
                      >
                        <article className="flex flex-col gap-4">
                          <h3 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                            {comparison.title}
                          </h3>

                          <p className="text-muted-foreground leading-relaxed">
                            {comparison.description}
                          </p>

                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-sm text-muted-foreground">
                                {comparison.date}
                              </span>
                              {(comparison.hasAudio || comparison.hasVideo || comparison.hasSlides) && (
                                <div className="flex items-center gap-2 flex-wrap">
                                  {comparison.hasAudio && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                      <Headphones className="w-3 h-3" /> Listen
                                    </span>
                                  )}
                                  {comparison.hasVideo && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                      <PlayCircle className="w-3 h-3" /> Watch
                                    </span>
                                  )}
                                  {comparison.hasSlides && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                      <Presentation className="w-3 h-3" /> Slides
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <span className="flex items-center gap-2 text-sm font-medium text-primary">
                              Read comparison
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Quiz CTA */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="rounded-xl border border-border bg-background p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                      Not Sure Which Processor to Choose?
                    </h3>
                    <p className="text-muted-foreground">
                      Take our free 2-minute assessment to get a personalized recommendation based on your business needs.
                    </p>
                  </div>

                  <Link href="/quiz" className="shrink-0">
                    <button className="w-full lg:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                      Start Free Assessment
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, TrendingUp, Headphones, PlayCircle, Presentation } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { MatchCTA } from "@/components/MatchCTA";
import ProcessorComparisonTable from "@/components/ProcessorComparisonTable";
import { createSupabasePublicClient } from "@/integrations/supabase/server-public";
import { REDIRECTED_COMPARISON_SLUGS } from "@/lib/comparisons/redirected-slugs";
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

export const metadata: Metadata = {
  title: "Compare 15 Payment Processors: 2.32%-3.07% Real Rates",
  description: "Stripe 2.97%, Square 2.65%, PayPal 3.07%, Helcim 2.51%, Adyen 2.32%. Side-by-side at $10K, $50K, $250K, $1M monthly. Updated May 2026.",
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
    title: "Compare 15 Payment Processors: 2.32%-3.07% Real Rates",
    description: "Stripe 2.97%, Square 2.65%, PayPal 3.07%, Helcim 2.51%, Adyen 2.32%. Side-by-side at $10K, $50K, $250K, $1M monthly. Updated May 2026.",
    images: [{ url: "https://www.mypayadvisor.com/og-logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare 15 Payment Processors: 2.32%-3.07% Real Rates",
    description: "Stripe 2.97%, Square 2.65%, PayPal 3.07%, Helcim 2.51%, Adyen 2.32%. Side-by-side at $10K, $50K, $250K, $1M monthly. Updated May 2026.",
    images: ["https://www.mypayadvisor.com/og-logo.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I compare payment processors fairly?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Compare on five things: effective rate at your card mix and ticket size, contract length and termination fee, settlement time, hidden fees (PCI, monthly minimum, batch, statement), and approval rate for your industry. Sticker rates rarely match what you actually pay."
      }
    },
    {
      "@type": "Question",
      "name": "Is Stripe cheaper than Square?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It depends on your channel mix. For online-only and recurring payments under $25,000 monthly, Stripe and Square are roughly equivalent. For in-person retail, Square is usually cheaper because Stripe's hardware ecosystem is thinner. Above $80,000 monthly, both are beaten by interchange-plus alternatives like Helcim or Stax."
      }
    },
    {
      "@type": "Question",
      "name": "Which payment processor has the lowest fees in 2026?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Below $10,000 monthly volume, Helcim's interchange-plus pricing is the standard answer. Between $25,000 and $250,000 monthly, subscription processors like Stax or negotiated IC++ contracts win. Above $250,000 monthly, custom IC++ contracts beat anything advertised publicly."
      }
    },
    {
      "@type": "Question",
      "name": "Should I use PayPal or Stripe for online payments?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Stripe wins on developer tooling, subscription billing, and global routing. PayPal wins on consumer trust at checkout, especially for first-time buyers. Many high-converting checkouts run both: Stripe as the primary processor and PayPal as an alternative button."
      }
    },
    {
      "@type": "Question",
      "name": "How long does it take to switch payment processors?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For an online merchant on a standard processor, switching takes 1 to 3 weeks: underwriting (2 to 7 days), integration testing (3 to 5 days), and DNS or webhook updates. For complex verticals, 2 to 6 weeks is realistic. Most contracts have a termination fee, calculate the breakeven before you start."
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
    description: "Save 15-25% with Helcim's interchange-plus pricing or get powerful developer tools with Stripe. Find out which processor delivers better value for your business.",
    href: "/comparisons/helcim-vs-stripe",
    date: "Nov. 8, 2025",
    iso: "2025-11-08"
  },
];

async function getAllComparisons(): Promise<Comparison[]> {
  const dbComparisons = await fetchDbComparisons();
  const byHref = new Map<string, Comparison>();
  for (const c of staticComparisons) byHref.set(c.href, c);
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
const LAST_REVIEWED = "August 2026";

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
                    Updated May 2026. Compare 15 U.S. payment processors at real effective rates from 2.32% (Adyen, enterprise) to 3.07% (PayPal). Barak Bachar reconciles every rate against live merchant statements before publishing. Pick by volume tier and transaction mix in under five minutes.
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

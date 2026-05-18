import { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { getAdminSupabase } from "@/lib/funnel/admin-supabase";
import UpdatesFeedClient from "./UpdatesFeedClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: { absolute: "The Payments Pulse · myPayAdvisor" },
  description:
    "What is moving in payments right now. Rate changes, processor news, outages, and weekly editorial roundups, tracked in near real time.",
  alternates: {
    canonical: "https://www.mypayadvisor.com/pulse",
    types: {
      "application/rss+xml": "https://www.mypayadvisor.com/pulse/feed.xml",
    },
  },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "https://www.mypayadvisor.com/pulse",
    title: "The Payments Pulse · myPayAdvisor",
    description:
      "Rate changes, processor news, outages, weekly roundups. Tracked in near real time.",
    images: [
      {
        url: "https://www.mypayadvisor.com/og-logo.png",
        width: 1200,
        height: 630,
      },
    ],
    siteName: "myPayAdvisor",
    locale: "en_US",
  },
};

interface FeedRow {
  id: string;
  type: "rate_change" | "industry_news" | "outage" | "editorial";
  severity: string | null;
  title: string;
  slug: string;
  summary: string | null;
  source_url: string | null;
  source_name: string | null;
  related_processor: string | null;
  tags: string[] | null;
  published_at: string;
}

interface RoundupRow {
  slug: string;
  title: string;
  published_at: string;
}

async function fetchFeed(): Promise<FeedRow[]> {
  try {
    const sb = getAdminSupabase();
    const { data } = await (sb as any)
      .from("updates_feed")
      .select(
        "id,type,severity,title,slug,summary,source_url,source_name,related_processor,tags,published_at"
      )
      .eq("status", "published")
      .neq("type", "editorial")
      .order("published_at", { ascending: false })
      .limit(60);
    return (data as FeedRow[]) || [];
  } catch {
    return [];
  }
}

async function fetchLatestRoundup(): Promise<RoundupRow | null> {
  try {
    const sb = getAdminSupabase();
    const { data } = await (sb as any)
      .from("updates_feed")
      .select("slug,title,published_at")
      .eq("status", "published")
      .eq("type", "editorial")
      .like("slug", "%-week-%")
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return (data as RoundupRow) || null;
  } catch {
    return null;
  }
}

export default async function UpdatesIndexPage() {
  const [items, roundup] = await Promise.all([fetchFeed(), fetchLatestRoundup()]);

  const lastRefreshed = items[0]?.published_at || null;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "The Payments Pulse",
    description:
      "Rate changes, processor news, outages, and weekly editorial roundups from myPayAdvisor.",
    url: "https://www.mypayadvisor.com/pulse",
    publisher: { "@type": "Organization", name: "myPayAdvisor" },
  };

  return (
    <>
      <JsonLd data={collectionSchema} />

      <section className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-12 md:py-16">
          <p className="text-xs uppercase tracking-[0.18em] font-bold text-primary mb-3">
            What is moving in payments right now
          </p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.05]">
            The Payments Pulse
          </h1>
          <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl">
            Rate changes, processor news, outages. Tracked in near real time, summarised in plain operator English.
          </p>
          {lastRefreshed && (
            <p className="mt-3 text-xs text-muted-foreground">
              Last refreshed {new Date(lastRefreshed).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-10 md:py-14">
        {roundup && (
          <Link
            href={`/pulse/week/${roundup.slug}`}
            className="block mb-10 rounded-3xl border border-border bg-gradient-to-br from-primary/[0.06] via-primary/[0.04] to-cta/[0.05] p-6 md:p-8 hover:border-primary/40 transition-colors"
          >
            <p className="text-xs uppercase tracking-[0.18em] font-bold text-primary mb-2">
              This week from the desk
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              {roundup.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Read the weekly roundup &rarr;
            </p>
          </Link>
        )}

        <UpdatesFeedClient items={items} />
      </section>
    </>
  );
}

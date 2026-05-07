import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getAdminSupabase } from "@/lib/funnel/admin-supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RoundupRow {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body_md: string | null;
  published_at: string;
  tags: string[] | null;
}

interface FeedItem {
  id: string;
  type: "rate_change" | "industry_news" | "outage" | "editorial";
  title: string;
  slug: string;
  summary: string | null;
  source_url: string | null;
  source_name: string | null;
  related_processor: string | null;
  published_at: string;
}

// Slug format: 2026-week-19. Parse to ISO-week range.
function parseWeekSlug(slug: string): { start: Date; end: Date } | null {
  const m = slug.match(/^(\d{4})-week-(\d{1,2})$/);
  if (!m) return null;
  const year = parseInt(m[1], 10);
  const week = parseInt(m[2], 10);
  if (week < 1 || week > 53) return null;

  // ISO week 1 = week containing the Thursday that is 1-7 Jan.
  // Compute Monday of ISO week.
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7; // Sunday=0 -> 7
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));
  const start = new Date(week1Monday);
  start.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);
  return { start, end };
}

async function fetchRoundup(slug: string): Promise<RoundupRow | null> {
  try {
    const sb = getAdminSupabase();
    const { data } = await (sb as any)
      .from("updates_feed")
      .select("id,title,slug,summary,body_md,published_at,tags")
      .eq("slug", slug)
      .eq("type", "editorial")
      .eq("status", "published")
      .maybeSingle();
    return (data as RoundupRow) || null;
  } catch {
    return null;
  }
}

async function fetchItemsInWeek(start: Date, end: Date): Promise<FeedItem[]> {
  try {
    const sb = getAdminSupabase();
    const { data } = await (sb as any)
      .from("updates_feed")
      .select(
        "id,type,title,slug,summary,source_url,source_name,related_processor,published_at"
      )
      .eq("status", "published")
      .neq("type", "editorial")
      .gte("published_at", start.toISOString())
      .lt("published_at", end.toISOString())
      .order("published_at", { ascending: false });
    return (data as FeedItem[]) || [];
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = await fetchRoundup(slug);
  if (!r) return { title: "Roundup not found" };
  return {
    title: { absolute: `${r.title} · myPayAdvisor` },
    description: r.summary || undefined,
    alternates: { canonical: `https://www.mypayadvisor.com/pulse/week/${r.slug}` },
    robots: { index: true, follow: true },
  };
}

const TYPE_LABEL: Record<string, string> = {
  rate_change: "Rate changes",
  industry_news: "News",
  outage: "Outages",
};

const SECTION_ORDER: Array<FeedItem["type"]> = ["rate_change", "industry_news", "outage"];

function renderBody(md: string) {
  const paragraphs = md.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return paragraphs.map((p, i) => (
    <p key={i} className="text-base text-foreground leading-relaxed mb-4 whitespace-pre-line">
      {p}
    </p>
  ));
}

export default async function WeekRoundupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const range = parseWeekSlug(slug);
  if (!range) notFound();

  const roundup = await fetchRoundup(slug);
  if (!roundup) notFound();

  const items = await fetchItemsInWeek(range.start, range.end);

  const grouped: Record<string, FeedItem[]> = {};
  for (const t of SECTION_ORDER) grouped[t] = [];
  for (const it of items) {
    if (grouped[it.type]) grouped[it.type].push(it);
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: roundup.title,
    description: roundup.summary || undefined,
    datePublished: roundup.published_at,
    author: { "@type": "Organization", name: "myPayAdvisor" },
    publisher: {
      "@type": "Organization",
      name: "myPayAdvisor",
      logo: {
        "@type": "ImageObject",
        url: "https://www.mypayadvisor.com/og-logo.png",
      },
    },
    mainEntityOfPage: `https://www.mypayadvisor.com/pulse/week/${roundup.slug}`,
  };

  const dateline = `${range.start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} to ${new Date(range.end.getTime() - 86400000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  return (
    <>
      <JsonLd data={articleSchema} />

      <article className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-10 md:py-16">
        <Link
          href="/pulse"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          All updates
        </Link>

        <Badge variant="outline" className="mb-4">
          Weekly roundup
        </Badge>

        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.1] mb-3">
          {roundup.title}
        </h1>

        <p className="text-sm text-muted-foreground mb-8">{dateline}</p>

        {roundup.body_md ? (
          <div className="prose-none mb-12">{renderBody(roundup.body_md)}</div>
        ) : roundup.summary ? (
          <p className="text-lg text-foreground leading-relaxed mb-12 font-medium">
            {roundup.summary}
          </p>
        ) : null}

        {SECTION_ORDER.map((t) => {
          const list = grouped[t];
          if (!list || list.length === 0) return null;
          return (
            <section key={t} className="mb-10">
              <h2 className="font-display text-xl md:text-2xl font-bold text-foreground tracking-tight mb-4">
                {TYPE_LABEL[t]}
              </h2>
              <div className="grid gap-3">
                {list.map((it) => (
                  <Link
                    key={it.id}
                    href={`/pulse/${it.slug}`}
                    className="block rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {it.related_processor && (
                        <Badge variant="outline" className="text-xs">
                          {it.related_processor}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(it.published_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <h3 className="font-medium text-foreground">{it.title}</h3>
                    {it.summary && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {it.summary}
                      </p>
                    )}
                    {it.source_name && it.source_url && (
                      <span className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        {it.source_name}
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {items.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            No individual items logged in this window.
          </p>
        )}
      </article>
    </>
  );
}

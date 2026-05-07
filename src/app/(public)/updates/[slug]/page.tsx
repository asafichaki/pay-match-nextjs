import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { getAdminSupabase } from "@/lib/funnel/admin-supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface FeedRow {
  id: string;
  type: "rate_change" | "industry_news" | "outage" | "editorial";
  severity: string | null;
  title: string;
  slug: string;
  summary: string | null;
  body_md: string | null;
  source_url: string | null;
  source_name: string | null;
  related_processor: string | null;
  tags: string[] | null;
  published_at: string;
}

async function fetchBySlug(slug: string): Promise<FeedRow | null> {
  try {
    const sb = getAdminSupabase();
    const { data } = await (sb as any)
      .from("updates_feed")
      .select(
        "id,type,severity,title,slug,summary,body_md,source_url,source_name,related_processor,tags,published_at"
      )
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    return (data as FeedRow) || null;
  } catch {
    return null;
  }
}

const TYPE_LABEL: Record<string, string> = {
  rate_change: "Rate change",
  industry_news: "News",
  outage: "Outage",
  editorial: "Editorial",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await fetchBySlug(slug);
  if (!item) {
    return { title: "Update not found", robots: { index: false, follow: false } };
  }
  return {
    title: { absolute: `${item.title} · myPayAdvisor` },
    description: item.summary || undefined,
    robots: { index: false, follow: false },
    alternates: { canonical: `https://www.mypayadvisor.com/updates/${item.slug}` },
  };
}

function renderBody(md: string) {
  // Minimal markdown-ish rendering: split paragraphs on blank lines.
  const paragraphs = md.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return paragraphs.map((p, i) => (
    <p key={i} className="text-base text-foreground leading-relaxed mb-4 whitespace-pre-line">
      {p}
    </p>
  ));
}

export default async function UpdateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await fetchBySlug(slug);
  if (!item) notFound();

  const dateline = new Date(item.published_at).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: item.summary || undefined,
    datePublished: item.published_at,
    author: { "@type": "Organization", name: "myPayAdvisor" },
    publisher: {
      "@type": "Organization",
      name: "myPayAdvisor",
      logo: {
        "@type": "ImageObject",
        url: "https://www.mypayadvisor.com/og-logo.png",
      },
    },
    mainEntityOfPage: `https://www.mypayadvisor.com/updates/${item.slug}`,
  };

  return (
    <>
      <JsonLd data={articleSchema} />

      <article className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-10 md:py-16">
        <Link
          href="/updates"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          All updates
        </Link>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge variant="outline">{TYPE_LABEL[item.type] || item.type}</Badge>
          {item.related_processor && (
            <Badge variant="outline" className="text-xs">
              {item.related_processor}
            </Badge>
          )}
          {item.severity === "high" && (
            <Badge variant="outline" className="text-xs bg-rose-100 text-rose-700 border-rose-200">
              High
            </Badge>
          )}
        </div>

        <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.1] mb-4">
          {item.title}
        </h1>

        <p className="text-sm text-muted-foreground mb-8">{dateline}</p>

        {item.summary && (
          <p className="text-lg text-foreground leading-relaxed mb-8 font-medium">
            {item.summary}
          </p>
        )}

        <div className="prose-none">
          {item.body_md
            ? renderBody(item.body_md)
            : item.summary
            ? null
            : (
              <p className="text-muted-foreground italic">
                See source for full details.
              </p>
            )}
        </div>

        {item.source_url && (
          <div className="mt-10 pt-6 border-t">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
              Source
            </p>
            <a
              href={item.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-base text-primary hover:underline"
            >
              {item.source_name || item.source_url}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="mt-6 flex items-center gap-2 flex-wrap">
            {item.tags.map((t) => (
              <span
                key={t}
                className="text-[11px] uppercase tracking-wide text-muted-foreground bg-muted px-2 py-1 rounded"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </article>
    </>
  );
}

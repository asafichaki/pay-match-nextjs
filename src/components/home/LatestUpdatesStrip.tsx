"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface FeedRow {
  id: string;
  type: "rate_change" | "industry_news" | "outage" | "editorial";
  title: string;
  slug: string;
  source_name: string | null;
  source_url: string | null;
  related_processor: string | null;
  published_at: string;
}

const TYPE_LABEL: Record<string, string> = {
  rate_change: "Rate change",
  industry_news: "News",
  outage: "Outage",
  editorial: "Editorial",
};

function typeBadgeClass(t: FeedRow["type"]) {
  if (t === "rate_change")
    return "bg-primary/10 text-primary border-primary/30";
  if (t === "outage")
    return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900";
  if (t === "editorial")
    return "bg-cta/10 text-cta-foreground border-cta/30";
  return "bg-muted text-muted-foreground border-border";
}

export default function LatestUpdatesStrip() {
  const [items, setItems] = useState<FeedRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any)
        .from("updates_feed")
        .select(
          "id,type,title,slug,source_name,source_url,related_processor,published_at"
        )
        .eq("status", "published")
        .neq("type", "editorial")
        .order("published_at", { ascending: false })
        .limit(3);
      if (!cancelled) setItems((data as FeedRow[]) || []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!items || items.length < 3) return null;

  return (
    <section
      aria-labelledby="latest-updates-heading"
      className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-12 md:py-16"
    >
      <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] font-bold text-primary mb-2">
            Live from the desk
          </p>
          <h2
            id="latest-updates-heading"
            className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight"
          >
            Latest from the desk
          </h2>
        </div>
        <Link
          href="/updates"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          See all updates
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => {
          const time = (() => {
            try {
              return formatDistanceToNow(new Date(item.published_at), {
                addSuffix: true,
              });
            } catch {
              return "";
            }
          })();
          return (
            <Link
              key={item.id}
              href={`/updates/${item.slug}`}
              className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-colors flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge variant="outline" className={typeBadgeClass(item.type)}>
                  {TYPE_LABEL[item.type] || item.type}
                </Badge>
                {item.related_processor && (
                  <Badge variant="outline" className="text-xs">
                    {item.related_processor}
                  </Badge>
                )}
              </div>
              <h3 className="font-display text-base md:text-lg font-semibold text-foreground tracking-tight leading-snug group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-muted-foreground">
                {item.source_name && (
                  <span className="inline-flex items-center gap-1">
                    {item.source_name}
                    <ExternalLink className="h-3 w-3" />
                  </span>
                )}
                <span className="ml-auto">{time}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

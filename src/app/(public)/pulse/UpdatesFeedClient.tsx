"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

function FeedCard({ item }: { item: FeedRow }) {
  const time = (() => {
    try {
      return formatDistanceToNow(new Date(item.published_at), { addSuffix: true });
    } catch {
      return "";
    }
  })();

  return (
    <article className="group rounded-2xl border border-border bg-card p-5 md:p-6 hover:border-primary/40 transition-colors">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Badge variant="outline" className={typeBadgeClass(item.type)}>
          {TYPE_LABEL[item.type] || item.type}
        </Badge>
        {item.related_processor && (
          <Badge variant="outline" className="text-xs">
            {item.related_processor}
          </Badge>
        )}
        {item.severity === "high" && (
          <Badge variant="outline" className="text-xs bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900">
            High
          </Badge>
        )}
        <span className="text-xs text-muted-foreground ml-auto">{time}</span>
      </div>

      <Link href={`/pulse/${item.slug}`} className="block">
        <h3 className="font-display text-lg md:text-xl font-semibold text-foreground tracking-tight leading-snug group-hover:text-primary transition-colors">
          {item.title}
        </h3>
      </Link>

      {item.summary && (
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {item.summary}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
        {item.source_name && item.source_url && (
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            {item.source_name}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {item.tags && item.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {item.tags.slice(0, 3).map((t) => (
              <span key={t} className="text-[10px] uppercase tracking-wide text-muted-foreground/80">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default function UpdatesFeedClient({ items }: { items: FeedRow[] }) {
  const [tab, setTab] = useState<"all" | "rate_change" | "industry_news" | "outage">("all");

  const filtered = useMemo(() => {
    if (tab === "all") return items;
    return items.filter((i) => i.type === tab);
  }, [items, tab]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <p className="text-base font-medium text-foreground">No updates yet.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Check back soon. The desk publishes as soon as something moves.
        </p>
      </div>
    );
  }

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
      <TabsList className="mb-6">
        <TabsTrigger value="all">All ({items.length})</TabsTrigger>
        <TabsTrigger value="rate_change">
          Rates ({items.filter((i) => i.type === "rate_change").length})
        </TabsTrigger>
        <TabsTrigger value="industry_news">
          News ({items.filter((i) => i.type === "industry_news").length})
        </TabsTrigger>
        <TabsTrigger value="outage">
          Outages ({items.filter((i) => i.type === "outage").length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value={tab} className="mt-0">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Nothing in this category right now.
          </p>
        ) : (
          <div className="grid gap-4 md:gap-5">
            {filtered.map((item) => (
              <FeedCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

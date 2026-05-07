// Cron entry point: pull RSS -> dedup -> persist raw -> classify batch -> publish top N.
// Specialist B owns this route. Auth via authorizedCron(). Always recordRun() at the end.

import { NextResponse } from "next/server";
import { authorizedCron, recordRun } from "@/lib/updates/cron-health";
import { getAdminSupabase } from "@/lib/funnel/admin-supabase";
import { RSS_SOURCES } from "@/lib/updates/rss/sources";
import { pullFeed } from "@/lib/updates/rss/fetch-and-parse";
import { titleHash, urlHash } from "@/lib/updates/rss/dedup";
import {
  classifyAndSummarize,
  BudgetBlockedError,
} from "@/lib/updates/rss/classifier";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const JOB_NAME = "updates.pull_news";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function GET(req: Request) {
  if (!authorizedCron(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const errors: Array<{ where: string; message: string }> = [];
  let totalProcessed = 0;
  let totalPublished = 0;
  let totalRejected = 0;
  let totalCost = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getAdminSupabase() as any;

  // ---- Settings ----
  let minRelevance = 70;
  let dailyCap = 5;
  try {
    const { data: settings } = await supabase
      .from("live_settings")
      .select("key,value")
      .in("key", ["news_min_relevance_score", "news_daily_publish_cap"]);
    for (const row of settings || []) {
      if (row.key === "news_min_relevance_score") minRelevance = Number(row.value) || minRelevance;
      if (row.key === "news_daily_publish_cap") dailyCap = Number(row.value) || dailyCap;
    }
  } catch (err) {
    errors.push({ where: "load_settings", message: (err as Error).message });
  }

  // ---- Pull + persist raw ----
  for (const source of RSS_SOURCES) {
    try {
      const items = await pullFeed(source);
      for (const item of items) {
        const t_hash = titleHash(item.title);
        const u_hash = urlHash(item.source_url);
        const { error } = await supabase
          .from("industry_news")
          .upsert(
            {
              title: item.title,
              raw_summary: item.summary_raw,
              source_url: item.source_url,
              source_name: item.source_name,
              published_at: item.published_at,
              fetched_at: new Date().toISOString(),
              title_hash: t_hash,
              url_hash: u_hash,
            },
            { onConflict: "title_hash", ignoreDuplicates: true },
          );
        if (error && !/duplicate|conflict/i.test(error.message)) {
          errors.push({ where: `insert:${source.name}`, message: error.message });
        }
      }
      totalProcessed += items.length;
    } catch (err) {
      errors.push({ where: `pull:${source.name}`, message: (err as Error).message });
    }
  }

  // ---- Classify unclassified batch ----
  let unclassified: Array<{
    id: string;
    title: string;
    raw_summary: string | null;
    source_url: string;
    source_name: string;
  }> = [];
  try {
    const { data } = await supabase
      .from("industry_news")
      .select("id,title,raw_summary,source_url,source_name")
      .is("is_relevant", null)
      .order("published_at", { ascending: false })
      .limit(30);
    unclassified = data || [];
  } catch (err) {
    errors.push({ where: "fetch_unclassified", message: (err as Error).message });
  }

  interface Classified {
    id: string;
    title: string;
    source_url: string;
    source_name: string;
    relevance_score: number;
    tags: string[];
    ai_summary: string;
    voice_score: number;
    voice_violations_has_defamation: boolean;
    related_processor: string | null;
    publishable: boolean;
  }
  const classified: Classified[] = [];

  for (const row of unclassified) {
    try {
      const out = await classifyAndSummarize({
        title: row.title,
        summary_raw: row.raw_summary || "",
        source_name: row.source_name,
        source_url: row.source_url,
      });
      totalCost += out.cost_usd_estimate;

      const hasDefamation = out.voice_violations.some((v) => v.kind === "defamation");
      const passesVoice = out.voice_score >= 80 && !hasDefamation;
      const isRelevant = out.relevance_score >= minRelevance;

      await supabase
        .from("industry_news")
        .update({
          is_relevant: isRelevant || passesVoice ? true : false,
          relevance_score: out.relevance_score,
          classifier_tags: out.tags,
          ai_summary: out.ai_summary,
          voice_violations: out.voice_violations,
        })
        .eq("id", row.id);

      classified.push({
        id: row.id,
        title: row.title,
        source_url: row.source_url,
        source_name: row.source_name,
        relevance_score: out.relevance_score,
        tags: out.tags,
        ai_summary: out.ai_summary,
        voice_score: out.voice_score,
        voice_violations_has_defamation: hasDefamation,
        related_processor: out.related_processor,
        publishable: isRelevant && passesVoice,
      });
    } catch (err) {
      if (err instanceof BudgetBlockedError) {
        errors.push({ where: "classifier", message: "budget_blocked" });
        break;
      }
      errors.push({ where: `classify:${row.id}`, message: (err as Error).message });
      totalRejected += 1;
    }
  }

  // ---- Publish top N (daily cap) ----
  let publishedToday = 0;
  try {
    const startOfUtcDay = new Date();
    startOfUtcDay.setUTCHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("updates_feed")
      .select("id", { count: "exact", head: true })
      .eq("type", "industry_news")
      .gte("published_at", startOfUtcDay.toISOString());
    publishedToday = count || 0;
  } catch (err) {
    errors.push({ where: "count_today", message: (err as Error).message });
  }

  const remainingCap = Math.max(0, dailyCap - publishedToday);
  const candidates = classified
    .filter((c) => c.publishable)
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .slice(0, remainingCap);

  for (const c of candidates) {
    const severity = c.relevance_score >= 85 ? "medium" : "low";
    const datePart = new Date().toISOString().slice(0, 10);
    const slug = `${slugify(c.title)}-${datePart}`;
    try {
      const { data: feedRow, error: feedErr } = await supabase
        .from("updates_feed")
        .insert({
          type: "industry_news",
          severity,
          title: c.title,
          slug,
          summary: c.ai_summary,
          source_url: c.source_url,
          source_name: c.source_name,
          related_processor: c.related_processor,
          tags: c.tags,
          published_at: new Date().toISOString(),
          status: "published",
          voice_score: c.voice_score,
          classifier_score: c.relevance_score,
          voice_violations: [],
          index_in_sitemap: true,
        })
        .select("id")
        .single();
      if (feedErr) throw feedErr;

      await supabase
        .from("industry_news")
        .update({ feed_id: feedRow.id })
        .eq("id", c.id);

      totalPublished += 1;
    } catch (err) {
      errors.push({ where: `publish:${c.id}`, message: (err as Error).message });
      totalRejected += 1;
    }
  }

  totalRejected += classified.filter((c) => !c.publishable).length;

  await recordRun({
    job_name: JOB_NAME,
    status: errors.length ? (totalPublished > 0 ? "partial" : "failed") : "success",
    items_processed: totalProcessed,
    items_published: totalPublished,
    items_rejected: totalRejected,
    errors,
    duration_ms: Date.now() - startedAt,
    cost_usd_estimate: totalCost,
  });

  return NextResponse.json({
    ok: true,
    processed: totalProcessed,
    classified: classified.length,
    published: totalPublished,
    rejected: totalRejected,
    cost_usd_estimate: totalCost,
    errors,
  });
}

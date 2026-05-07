// Weekly roundup generator — runs every Friday 09:00.
// Pulls all published updates_feed items from the current ISO week, asks
// Claude to write an editorial intro + per-type sections, and inserts a
// new updates_feed row of type='editorial' with slug `YYYY-week-NN`.
// The roundup is the only sitemap-indexed surface from this pipeline.

import { NextRequest, NextResponse } from "next/server";
import { getAnthropicClient } from "@/lib/updates/anthropic-client";
import { getAdminSupabase } from "@/lib/funnel/admin-supabase";
import { authorizedCron, recordRun } from "@/lib/updates/cron-health";
import { shouldRunClaude, estimateCostUsd } from "@/lib/updates/budget";
import { voiceCheck, VOICE_PROMPT_FRAGMENT } from "@/lib/updates/voice-rules";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface FeedItem {
  id: string;
  type: string;
  severity: string;
  title: string;
  summary: string;
  source_url: string | null;
  source_name: string | null;
  related_processor: string | null;
  published_at: string;
}

function isoWeekSlug(d: Date): string {
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${target.getUTCFullYear()}-week-${String(week).padStart(2, "0")}`;
}

function startOfIsoWeek(d: Date): Date {
  const out = new Date(d);
  const dayNum = (out.getUTCDay() + 6) % 7;
  out.setUTCDate(out.getUTCDate() - dayNum);
  out.setUTCHours(0, 0, 0, 0);
  return out;
}

export async function GET(req: NextRequest) {
  const startedAt = Date.now();
  if (!authorizedCron(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const errors: Array<{ where: string; message: string }> = [];
  let cost = 0;

  try {
    const supabase = getAdminSupabase();
    const now = new Date();
    const weekStart = startOfIsoWeek(now);
    const slug = isoWeekSlug(now);

    // Skip if already exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from("updates_feed")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing?.id) {
      await recordRun({
        job_name: "roundup-generate",
        status: "success",
        items_processed: 0,
        items_published: 0,
        duration_ms: Date.now() - startedAt,
      });
      return NextResponse.json({ ok: true, skipped: "already_exists", slug });
    }

    // Pull this week's published items
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: items } = await (supabase as any)
      .from("updates_feed")
      .select("id, type, severity, title, summary, source_url, source_name, related_processor, published_at")
      .eq("status", "published")
      .neq("type", "editorial")
      .gte("published_at", weekStart.toISOString())
      .order("published_at", { ascending: false });

    const list = (items || []) as FeedItem[];
    if (list.length === 0) {
      await recordRun({
        job_name: "roundup-generate",
        status: "success",
        items_processed: 0,
        items_published: 0,
        duration_ms: Date.now() - startedAt,
      });
      return NextResponse.json({ ok: true, skipped: "no_items_this_week", slug });
    }

    if (!(await shouldRunClaude())) {
      await recordRun({
        job_name: "roundup-generate",
        status: "failed",
        errors: [{ where: "budget", message: "Claude daily budget exhausted" }],
        duration_ms: Date.now() - startedAt,
      });
      return NextResponse.json({ error: "budget_blocked" }, { status: 503 });
    }

    // Build prompt — give Claude the items, ask for editorial roundup
    const itemsBlock = list
      .map(
        (it, i) =>
          `${i + 1}. [${it.type}] ${it.title}\n   ${it.summary}\n   Source: ${it.source_name || "n/a"} (${it.source_url || "n/a"})${it.related_processor ? `\n   Processor: ${it.related_processor}` : ""}`,
      )
      .join("\n\n");

    const userPrompt = `${VOICE_PROMPT_FRAGMENT}

Below are ${list.length} published payments-industry items from this week. Write an editorial roundup for U.S. merchants.

Output JSON ONLY (no prose around it). Schema:
{
  "title": "string (≤80 chars)",
  "intro": "string (50-90 words)",
  "rate_changes_section": "string (skip if no rate_change items)",
  "industry_section": "string (skip if no industry_news)",
  "outage_section": "string (skip if no outage)",
  "takeaway": "string (40-60 words, the one thing operators should do this week)"
}

Each section is plain markdown paragraphs. Refer to items by processor and source. No em-dashes. Operator tone, not journalist.

Items:
${itemsBlock}`;

    const client = getAnthropicClient();
    const msg = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      temperature: 0,
      messages: [{ role: "user", content: userPrompt }],
    });
    cost = estimateCostUsd(msg.usage?.input_tokens || 0, msg.usage?.output_tokens || 0);

    const responseText = msg.content
      .filter((c) => c.type === "text")
      .map((c) => (c as { type: "text"; text: string }).text)
      .join("");

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Claude did not return parseable JSON");
    }
    const parsed = JSON.parse(jsonMatch[0]) as {
      title: string;
      intro: string;
      rate_changes_section?: string;
      industry_section?: string;
      outage_section?: string;
      takeaway: string;
    };

    // Build body_md
    const bodyParts: string[] = [];
    bodyParts.push(parsed.intro);
    if (parsed.rate_changes_section) bodyParts.push(`## Rate changes\n\n${parsed.rate_changes_section}`);
    if (parsed.industry_section) bodyParts.push(`## Industry moves\n\n${parsed.industry_section}`);
    if (parsed.outage_section) bodyParts.push(`## Outages\n\n${parsed.outage_section}`);
    bodyParts.push(`## The takeaway\n\n${parsed.takeaway}`);
    const body_md = bodyParts.join("\n\n");

    // Voice gate
    const titleCheck = voiceCheck(parsed.title);
    const bodyCheck = voiceCheck(body_md);
    const voiceScore = Math.min(titleCheck.score, bodyCheck.score);
    const violations = [...titleCheck.violations, ...bodyCheck.violations];

    if (!titleCheck.passes || !bodyCheck.passes) {
      // Don't auto-publish; queue for review
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from("pending_review").insert({
        kind: "news_summary",
        reason: `voice_fail (score=${voiceScore})`,
        payload: { slug, title: parsed.title, body_md, voice_violations: violations },
        expires_at: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      });
      await recordRun({
        job_name: "roundup-generate",
        status: "partial",
        items_processed: list.length,
        items_rejected: 1,
        errors: [{ where: "voice_gate", message: `score=${voiceScore}` }],
        duration_ms: Date.now() - startedAt,
        cost_usd_estimate: cost,
      });
      return NextResponse.json({ ok: true, queued_for_review: true, voice_score: voiceScore });
    }

    // INSERT roundup as editorial type, slug = YYYY-week-NN
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertErr } = await (supabase as any).from("updates_feed").insert({
      type: "editorial",
      severity: "medium",
      title: titleCheck.cleaned,
      slug,
      summary: parsed.intro.slice(0, 240),
      body_md: bodyCheck.cleaned,
      source_url: `https://www.mypayadvisor.com/updates/week/${slug}`,
      source_name: "myPayAdvisor",
      tags: ["roundup", "weekly"],
      published_at: new Date().toISOString(),
      status: "published",
      voice_score: voiceScore,
      voice_violations: violations,
      index_in_sitemap: true,
    });
    if (insertErr) {
      errors.push({ where: "insert_feed", message: insertErr.message });
    }

    await recordRun({
      job_name: "roundup-generate",
      status: errors.length ? "partial" : "success",
      items_processed: list.length,
      items_published: errors.length ? 0 : 1,
      errors,
      duration_ms: Date.now() - startedAt,
      cost_usd_estimate: cost,
    });

    return NextResponse.json({
      ok: true,
      slug,
      url: `https://www.mypayadvisor.com/updates/week/${slug}`,
      items_included: list.length,
      voice_score: voiceScore,
      cost_usd_estimate: cost,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    errors.push({ where: "main", message });
    await recordRun({
      job_name: "roundup-generate",
      status: "failed",
      errors,
      duration_ms: Date.now() - startedAt,
      cost_usd_estimate: cost,
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Daily processor-rate scraper.
// For each active provider: fetch pricing page -> Claude extract -> delta-gate
// -> auto-apply small changes, queue large changes for human review.
//
// Auth: `authorizedCron(req)` — Bearer UPDATES_CRON_SECRET or x-vercel-cron header.

import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/funnel/admin-supabase";
import { getResend, FUNNEL_FROM, FUNNEL_REPLY_TO } from "@/lib/funnel/resend-client";
import { authorizedCron, recordRun } from "@/lib/updates/cron-health";
import { voiceCheck } from "@/lib/updates/voice-rules";
import { signActionToken, hashToken } from "@/lib/updates/tokens";
import { fetchPricingHtml } from "@/lib/updates/scrape-rates/apify-fetch";
import {
  extractRates,
  BudgetBlockedError,
  type ParsedRates,
} from "@/lib/updates/scrape-rates/claude-parser";
import { evaluateDelta, getAutoThreshold } from "@/lib/updates/scrape-rates/delta-gate";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.mypayadvisor.com";
const ALERT_EMAIL = process.env.UPDATES_ALERT_EMAIL || FUNNEL_REPLY_TO;
const REVIEW_TTL_HOURS = 72;

interface ProviderRow {
  id: string;
  name: string;
  transaction_fees: string | null;
  source_url: string | null;
  is_active: boolean | null;
}

interface RouteError {
  where: string;
  message: string;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function hostOf(url: string | null): string {
  if (!url) return "source";
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildSummary(
  providerName: string,
  field: string,
  oldValue: string | null,
  newValue: string,
  sourceUrl: string | null,
): { summary: string; voice_score: number; voice_violations: unknown } {
  const date = todayIso();
  const old = oldValue ? oldValue : "not previously published";
  const raw = `${providerName} ${field.replace(/_/g, " ")} now ${newValue} (was ${old}). Source: ${hostOf(
    sourceUrl,
  )}, last verified ${date}.`;
  const v = voiceCheck(raw);
  return { summary: v.cleaned, voice_score: v.score, voice_violations: v.violations };
}

async function sendReviewEmail(args: {
  providerName: string;
  field: string;
  oldValue: string | null;
  newValue: string;
  approveUrl: string;
  rejectUrl: string;
  sourceUrl: string | null;
}) {
  const subject = `[mypayadvisor] Review: ${args.providerName} ${args.field} change`;
  const body = `Provider: ${args.providerName}
Field: ${args.field}
Old: ${args.oldValue ?? "(none)"}
New: ${args.newValue}
Source: ${args.sourceUrl ?? "(none)"}

Approve: ${args.approveUrl}
Reject:  ${args.rejectUrl}

Links expire in ${REVIEW_TTL_HOURS} hours.`;
  try {
    const resend = getResend();
    await resend.emails.send({
      from: FUNNEL_FROM,
      to: ALERT_EMAIL,
      replyTo: FUNNEL_REPLY_TO,
      subject,
      text: body,
    });
  } catch (err) {
    // Non-fatal: the row stays in pending_review and admin UI can act on it.
    console.error("[scrape-rates] review email failed:", err);
  }
}

export async function GET(req: NextRequest) {
  if (!authorizedCron(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getAdminSupabase() as any;

  let processed = 0;
  let auto_applied = 0;
  let queued_for_review = 0;
  let invalid = 0;
  let total_cost = 0;
  const errors: RouteError[] = [];

  const threshold = await getAutoThreshold();

  const { data: providers, error: provErr } = await supabase
    .from("providers")
    .select("id, name, transaction_fees, source_url, is_active")
    .eq("is_active", true);

  if (provErr) {
    await recordRun({
      job_name: "scrape-rates",
      status: "failed",
      duration_ms: Date.now() - startedAt,
      errors: [{ where: "providers.select", message: provErr.message }],
    });
    return NextResponse.json({ ok: false, error: provErr.message }, { status: 500 });
  }

  const rows = (providers || []) as ProviderRow[];

  for (const p of rows) {
    if (!p.source_url) continue;
    processed += 1;
    let html = "";
    let parsed: ParsedRates | null = null;

    try {
      const fetched = await fetchPricingHtml(p.source_url);
      html = fetched.html;
    } catch (err) {
      errors.push({
        where: `fetch:${p.name}`,
        message: err instanceof Error ? err.message : String(err),
      });
      continue;
    }

    try {
      parsed = await extractRates(html, p.name);
      total_cost += parsed.cost_usd;
    } catch (err) {
      if (err instanceof BudgetBlockedError) {
        errors.push({ where: `claude:${p.name}`, message: "budget_blocked" });
        break; // stop the loop; remaining providers will be retried tomorrow
      }
      errors.push({
        where: `claude:${p.name}`,
        message: err instanceof Error ? err.message : String(err),
      });
      continue;
    }

    const newSummary = parsed.transaction_fees_summary;
    const oldSummary = p.transaction_fees;
    const { delta_pct, decision } = evaluateDelta(oldSummary, newSummary, threshold);
    const raw_html_hash = crypto.createHash("sha256").update(html).digest("hex");

    if (decision === "no_change") continue;

    if (decision === "invalid") {
      invalid += 1;
      errors.push({
        where: `delta:${p.name}`,
        message: `out_of_band new=${newSummary ?? ""}`,
      });
      continue;
    }

    if (decision === "small_auto" && newSummary) {
      // 1) Build voice-checked summary first; if voice fails hard, downgrade to review.
      const built = buildSummary(
        p.name,
        "transaction_fees",
        oldSummary,
        newSummary,
        p.source_url,
      );
      const voiceFails = built.voice_score < 80;

      if (voiceFails) {
        // Treat as big_review path
        const { data: rcRow, error: rcErr } = await supabase
          .from("rate_changes")
          .insert({
            provider: p.name,
            field: "transaction_fees",
            old_value: oldSummary,
            new_value: newSummary,
            delta_pct,
            source_url: p.source_url,
            auto_applied: false,
            raw_html_hash,
            classifier_notes: `voice_fail score=${built.voice_score}`,
          })
          .select("id")
          .single();
        if (rcErr) {
          errors.push({ where: `rate_changes.insert:${p.name}`, message: rcErr.message });
          continue;
        }
        const expiresAt = new Date(Date.now() + REVIEW_TTL_HOURS * 3600 * 1000).toISOString();
        const { data: prRow, error: prErr } = await supabase
          .from("pending_review")
          .insert({
            kind: "rate_change",
            reason: "voice_fail",
            payload: {
              provider: p.name,
              field: "transaction_fees",
              old_value: oldSummary,
              new_value: newSummary,
              delta_pct,
              source_url: p.source_url,
              voice_score: built.voice_score,
              voice_violations: built.voice_violations,
            },
            rate_change_id: rcRow.id,
            expires_at: expiresAt,
          })
          .select("id")
          .single();
        if (prErr) {
          errors.push({ where: `pending_review.insert:${p.name}`, message: prErr.message });
          continue;
        }
        const approveTok = signActionToken(prRow.id, "approve");
        const rejectTok = signActionToken(prRow.id, "reject");
        await supabase
          .from("pending_review")
          .update({
            approve_token_hash: hashToken(approveTok),
            reject_token_hash: hashToken(rejectTok),
          })
          .eq("id", prRow.id);
        await sendReviewEmail({
          providerName: p.name,
          field: "transaction_fees",
          oldValue: oldSummary,
          newValue: newSummary,
          approveUrl: `${SITE_BASE}/api/updates/approve/${approveTok}`,
          rejectUrl: `${SITE_BASE}/api/updates/approve/${rejectTok}`,
          sourceUrl: p.source_url,
        });
        queued_for_review += 1;
        continue;
      }

      // 2) Auto-apply.
      const slug = `${slugify(p.name)}-rate-${todayIso()}`;
      const title = `${p.name} rate update`;

      const { data: feedRow, error: feedErr } = await supabase
        .from("updates_feed")
        .insert({
          type: "rate_change",
          severity: "medium",
          title,
          slug,
          summary: built.summary,
          source_url: p.source_url,
          source_name: hostOf(p.source_url),
          related_processor: p.name,
          tags: ["rate_change", slugify(p.name)],
          status: "published",
          voice_score: built.voice_score,
          voice_violations: built.voice_violations,
          index_in_sitemap: false,
        })
        .select("id")
        .single();
      if (feedErr) {
        errors.push({ where: `updates_feed.insert:${p.name}`, message: feedErr.message });
        continue;
      }

      const { error: rcErr } = await supabase.from("rate_changes").insert({
        provider: p.name,
        field: "transaction_fees",
        old_value: oldSummary,
        new_value: newSummary,
        delta_pct,
        source_url: p.source_url,
        auto_applied: true,
        approved_by: "auto",
        approved_at: new Date().toISOString(),
        raw_html_hash,
        feed_id: feedRow.id,
      });
      if (rcErr) {
        errors.push({ where: `rate_changes.insert:${p.name}`, message: rcErr.message });
        continue;
      }

      const { error: updErr } = await supabase
        .from("providers")
        .update({
          transaction_fees: newSummary,
          last_verified: new Date().toISOString(),
        })
        .eq("id", p.id);
      if (updErr) {
        errors.push({ where: `providers.update:${p.name}`, message: updErr.message });
        continue;
      }

      auto_applied += 1;
      continue;
    }

    if (decision === "big_review" && newSummary) {
      const { data: rcRow, error: rcErr } = await supabase
        .from("rate_changes")
        .insert({
          provider: p.name,
          field: "transaction_fees",
          old_value: oldSummary,
          new_value: newSummary,
          delta_pct,
          source_url: p.source_url,
          auto_applied: false,
          raw_html_hash,
        })
        .select("id")
        .single();
      if (rcErr) {
        errors.push({ where: `rate_changes.insert:${p.name}`, message: rcErr.message });
        continue;
      }

      const expiresAt = new Date(Date.now() + REVIEW_TTL_HOURS * 3600 * 1000).toISOString();
      const { data: prRow, error: prErr } = await supabase
        .from("pending_review")
        .insert({
          kind: "rate_change",
          reason: "delta_above_threshold",
          payload: {
            provider: p.name,
            field: "transaction_fees",
            old_value: oldSummary,
            new_value: newSummary,
            delta_pct,
            source_url: p.source_url,
            threshold,
          },
          rate_change_id: rcRow.id,
          expires_at: expiresAt,
        })
        .select("id")
        .single();
      if (prErr) {
        errors.push({ where: `pending_review.insert:${p.name}`, message: prErr.message });
        continue;
      }

      const approveTok = signActionToken(prRow.id, "approve");
      const rejectTok = signActionToken(prRow.id, "reject");
      await supabase
        .from("pending_review")
        .update({
          approve_token_hash: hashToken(approveTok),
          reject_token_hash: hashToken(rejectTok),
        })
        .eq("id", prRow.id);

      await sendReviewEmail({
        providerName: p.name,
        field: "transaction_fees",
        oldValue: oldSummary,
        newValue: newSummary,
        approveUrl: `${SITE_BASE}/api/updates/approve/${approveTok}`,
        rejectUrl: `${SITE_BASE}/api/updates/approve/${rejectTok}`,
        sourceUrl: p.source_url,
      });

      queued_for_review += 1;
    }
  }

  const status: "success" | "partial" | "failed" =
    errors.length === 0 ? "success" : auto_applied + queued_for_review > 0 ? "partial" : "failed";

  await recordRun({
    job_name: "scrape-rates",
    status,
    items_processed: processed,
    items_published: auto_applied,
    items_rejected: invalid,
    errors,
    duration_ms: Date.now() - startedAt,
    cost_usd_estimate: total_cost,
  });

  return NextResponse.json({
    ok: true,
    processed,
    auto_applied,
    queued_for_review,
    invalid,
    errors,
  });
}

// One-click approve / reject for items in pending_review.
// Token carries: pending_review id, action ('approve'|'reject'), exp.
// HMAC-SHA256 verified via verifyActionToken; idempotent via resolved_at check.

import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/funnel/admin-supabase";
import { verifyActionToken } from "@/lib/updates/tokens";
import { voiceCheck } from "@/lib/updates/voice-rules";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_BASE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.mypayadvisor.com";

function unauthorized() {
  return new NextResponse(
    `<!doctype html><html><body style="font-family:system-ui;padding:40px;max-width:560px;margin:auto"><h1>401 Invalid or expired link</h1><p>This action link is no longer valid.</p></body></html>`,
    { status: 401, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

function slugify(s: string): string {
  const normalized = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (normalized.length <= 80) return normalized;
  // Truncate at last full word boundary to avoid cutting mid-word.
  return normalized.slice(0, 80).replace(/-[^-]*$/, "").replace(/-+$/, "");
}
function hostOf(url: string | null | undefined): string {
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

interface RatePayload {
  provider: string;
  field: string;
  old_value: string | null;
  new_value: string;
  delta_pct?: number | null;
  source_url?: string | null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const payload = verifyActionToken(token);
  if (!payload) return unauthorized();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getAdminSupabase() as any;

  const { data: pr, error: prErr } = await supabase
    .from("pending_review")
    .select("*")
    .eq("id", payload.pid)
    .single();

  if (prErr || !pr) return unauthorized();

  // Idempotent: if already resolved, just redirect to admin.
  if (pr.resolved_at) {
    const path =
      pr.resolution === "approved"
        ? `/admin/updates?approved=${pr.id}&already=1`
        : `/admin/updates?rejected=${pr.id}&already=1`;
    return NextResponse.redirect(`${SITE_BASE}${path}`);
  }

  const nowIso = new Date().toISOString();

  if (payload.action === "reject") {
    await supabase
      .from("pending_review")
      .update({
        resolved_at: nowIso,
        resolution: "rejected",
        resolved_by: "email_link",
      })
      .eq("id", pr.id);

    if (pr.rate_change_id) {
      await supabase
        .from("rate_changes")
        .update({ rejected_at: nowIso, rejection_reason: "rejected_via_email" })
        .eq("id", pr.rate_change_id);
    }
    return NextResponse.redirect(`${SITE_BASE}/admin/updates?rejected=${pr.id}`);
  }

  // Approve path.
  if (pr.kind === "rate_change") {
    const data = (pr.payload || {}) as RatePayload;
    if (!data.provider || !data.new_value) {
      return unauthorized();
    }

    const built = voiceCheck(
      `${data.provider} ${data.field.replace(/_/g, " ")} now ${data.new_value} (was ${
        data.old_value ?? "not previously published"
      }). Source: ${hostOf(data.source_url)}, last verified ${todayIso()}.`,
    );

    const slug = `${slugify(data.provider)}-rate-${todayIso()}`;
    const title = `${data.provider} rate update`;

    const { data: feedRow, error: feedErr } = await supabase
      .from("updates_feed")
      .insert({
        type: "rate_change",
        severity: "medium",
        title,
        slug,
        summary: built.cleaned,
        source_url: data.source_url ?? null,
        source_name: hostOf(data.source_url),
        related_processor: data.provider,
        tags: ["rate_change", slugify(data.provider)],
        status: "published",
        voice_score: built.score,
        voice_violations: built.violations,
        index_in_sitemap: false,
      })
      .select("id")
      .single();

    if (feedErr) {
      return new NextResponse(
        `<!doctype html><html><body style="font-family:system-ui;padding:40px"><h1>Insert failed</h1><pre>${feedErr.message}</pre></body></html>`,
        { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } },
      );
    }

    if (pr.rate_change_id) {
      await supabase
        .from("rate_changes")
        .update({
          auto_applied: false,
          approved_by: "email_link",
          approved_at: nowIso,
          feed_id: feedRow.id,
        })
        .eq("id", pr.rate_change_id);
    }

    // Find provider id by name to update transaction_fees + last_verified.
    const { data: provRow } = await supabase
      .from("providers")
      .select("id")
      .eq("name", data.provider)
      .maybeSingle();
    if (provRow?.id) {
      await supabase
        .from("providers")
        .update({
          transaction_fees: data.new_value,
          last_verified: nowIso,
        })
        .eq("id", provRow.id);
    }
  }

  await supabase
    .from("pending_review")
    .update({
      resolved_at: nowIso,
      resolution: "approved",
      resolved_by: "email_link",
    })
    .eq("id", pr.id);

  return NextResponse.redirect(`${SITE_BASE}/admin/updates?approved=${pr.id}`);
}

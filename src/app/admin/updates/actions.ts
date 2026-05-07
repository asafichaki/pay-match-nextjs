"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getAdminSupabase } from "@/lib/funnel/admin-supabase";
import type { Database } from "@/integrations/supabase/types";

async function assertAdmin(): Promise<{ ok: boolean; userId?: string; error?: string }> {
  try {
    const cookieStore = await cookies();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const sb = createServerClient<Database>(url, anon, {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }));
        },
        setAll() {
          // no-op in server action
        },
      },
    });
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return { ok: false, error: "Not authenticated" };

    const { data: roleRow } = await sb
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();
    if (roleRow?.role !== "admin") return { ok: false, error: "Not admin" };

    return { ok: true, userId: user.id };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

interface ActionResult {
  success: boolean;
  error?: string;
}

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export async function approveLocal(pendingId: string): Promise<ActionResult> {
  const auth = await assertAdmin();
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const sb = getAdminSupabase() as any;

    const { data: pending, error: fetchErr } = await sb
      .from("pending_review")
      .select("*")
      .eq("id", pendingId)
      .is("resolved_at", null)
      .maybeSingle();

    if (fetchErr) return { success: false, error: fetchErr.message };
    if (!pending) return { success: false, error: "Pending item not found or already resolved" };

    const payload = pending.payload || {};
    const kind: string = pending.kind;

    if (kind === "rate_change") {
      const provider: string | undefined = payload.provider;
      const field: string | undefined = payload.field;
      const newValue = payload.new_value;
      if (provider && field && typeof newValue !== "undefined") {
        await sb
          .from("providers")
          .update({ [field]: newValue, updated_at: new Date().toISOString() })
          .eq("name", provider);
      }
      const title: string =
        payload.title || `${provider || "Provider"} ${field || "rate"} change`;
      await sb.from("updates_feed").insert({
        type: "rate_change",
        severity: payload.severity || "medium",
        title,
        slug: payload.slug || `${slugifyTitle(title)}-${Date.now().toString(36)}`,
        summary: payload.summary || null,
        body_md: payload.body_md || null,
        source_url: payload.source_url || null,
        source_name: payload.source_name || null,
        related_processor: provider || null,
        tags: payload.tags || [],
        published_at: new Date().toISOString(),
        status: "published",
        index_in_sitemap: false,
      });
    } else if (kind === "industry_news") {
      const title: string = payload.title || "Industry update";
      await sb.from("updates_feed").insert({
        type: "industry_news",
        severity: payload.severity || "medium",
        title,
        slug: payload.slug || `${slugifyTitle(title)}-${Date.now().toString(36)}`,
        summary: payload.summary || null,
        body_md: payload.body_md || null,
        source_url: payload.source_url || null,
        source_name: payload.source_name || null,
        related_processor: payload.related_processor || null,
        tags: payload.tags || [],
        voice_score: payload.voice_score || null,
        classifier_score: payload.classifier_score || null,
        published_at: new Date().toISOString(),
        status: "published",
        index_in_sitemap: false,
      });
    } else if (kind === "outage") {
      const title: string = payload.title || "Processor outage";
      await sb.from("updates_feed").insert({
        type: "outage",
        severity: payload.severity || "high",
        title,
        slug: payload.slug || `${slugifyTitle(title)}-${Date.now().toString(36)}`,
        summary: payload.summary || null,
        body_md: payload.body_md || null,
        source_url: payload.source_url || null,
        source_name: payload.source_name || null,
        related_processor: payload.related_processor || null,
        tags: payload.tags || [],
        published_at: new Date().toISOString(),
        status: "published",
        index_in_sitemap: false,
      });
    }

    await sb
      .from("pending_review")
      .update({
        resolved_at: new Date().toISOString(),
        resolution: "approved",
      })
      .eq("id", pendingId);

    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function rejectLocal(
  pendingId: string,
  reason: string
): Promise<ActionResult> {
  const auth = await assertAdmin();
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const sb = getAdminSupabase() as any;
    const { error } = await sb
      .from("pending_review")
      .update({
        resolved_at: new Date().toISOString(),
        resolution: `rejected: ${reason || "no reason"}`,
      })
      .eq("id", pendingId)
      .is("resolved_at", null);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function unpublishFeedItem(feedId: string): Promise<ActionResult> {
  const auth = await assertAdmin();
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const sb = getAdminSupabase() as any;
    const { error } = await sb
      .from("updates_feed")
      .update({ status: "unpublished" })
      .eq("id", feedId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

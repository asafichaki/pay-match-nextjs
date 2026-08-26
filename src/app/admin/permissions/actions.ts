"use server";

import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/integrations/supabase/types";

/**
 * Permissions toggle server action.
 *
 * Defense-in-depth: the client-side Switch is `disabled` for any admin row, but a
 * malicious admin could DevTools-flip the call. Server-side we hard-reject any
 * attempt to mutate a permission row where role='admin' — admins must keep full
 * access at all times to avoid permanent self-lockout.
 */

let adminCache: SupabaseClient<Database> | null = null;

function getAdmin(): SupabaseClient<Database> {
  if (!adminCache) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Permissions actions require NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
      );
    }
    adminCache = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminCache;
}

async function assertCallerIsAdmin(): Promise<string> {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createServerClient<Database>(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (roleRow?.role !== "admin") throw new Error("Forbidden: admin role required");
  return user.id;
}

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

export async function togglePermission(input: {
  id: string;
  nextValue: boolean;
}): Promise<ActionResult> {
  try {
    await assertCallerIsAdmin();

    const admin = getAdmin();

    // Look up the row so we can verify it's not an admin-role row.
    const { data: row, error: readErr } = await admin
      .from("role_permissions")
      .select("id, role, page_name")
      .eq("id", input.id)
      .single();
    if (readErr || !row) {
      return { ok: false, error: readErr?.message ?? "Permission row not found" };
    }

    if (row.role === "admin") {
      return {
        ok: false,
        error: "Cannot modify admin role permissions. Admins keep full access to prevent self-lockout.",
      };
    }

    const { error } = await admin
      .from("role_permissions")
      .update({ can_access: input.nextValue })
      .eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

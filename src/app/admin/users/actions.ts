"use server";

import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

/**
 * Admin user management server actions.
 *
 * Why server actions (not client-side supabase.auth.signUp):
 *   1. supabase.auth.signUp on the client logs the NEW user into the admin's
 *      browser session (replacing their own session). Server-side admin.createUser
 *      avoids this.
 *   2. Deleting a user from the client cannot reach auth.users — that requires
 *      service-role. Doing it in a server action with service-role removes the
 *      orphan-auth-row risk flag from the CRM audit.
 *   3. Password strength is enforced server-side via Zod so a malicious client
 *      cannot bypass the meter.
 */

// ─── Password policy (mirrored client-side for the live meter) ───────

const PASSWORD_SCHEMA = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[a-z]/, "Must contain a lowercase letter")
  .regex(/[0-9]/, "Must contain a digit")
  .regex(/[^A-Za-z0-9]/, "Must contain a special character");

const CREATE_USER_SCHEMA = z.object({
  email: z.string().email("Invalid email"),
  password: PASSWORD_SCHEMA,
  role: z.enum(["admin", "moderator", "user"]),
});

// ─── Clients ─────────────────────────────────────────────────────────

let adminCache: SupabaseClient<Database> | null = null;

function getAdmin(): SupabaseClient<Database> {
  if (!adminCache) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Admin user actions require NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
      );
    }
    adminCache = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminCache;
}

async function getCallerSession() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createServerClient<Database>(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // read-only in actions
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { user, supabase };
}

async function assertCallerIsAdmin(): Promise<string> {
  const { user, supabase } = await getCallerSession();
  if (!user) throw new Error("Not authenticated");
  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (roleRow?.role !== "admin") throw new Error("Forbidden: admin role required");
  return user.id;
}

// ─── Actions ─────────────────────────────────────────────────────────

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

export async function createUserAdmin(input: {
  email: string;
  password: string;
  role: "admin" | "moderator" | "user";
}): Promise<ActionResult> {
  try {
    await assertCallerIsAdmin();

    const parsed = CREATE_USER_SCHEMA.safeParse(input);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return { ok: false, error: first?.message ?? "Invalid input" };
    }

    const admin = getAdmin();

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: false,
    });
    if (createErr || !created?.user) {
      return { ok: false, error: createErr?.message ?? "Failed to create auth user" };
    }

    const userId = created.user.id;

    const { error: profileErr } = await admin
      .from("profiles")
      .insert({ user_id: userId, email: parsed.data.email });
    if (profileErr) {
      // Roll back the auth row so we don't orphan it.
      await admin.auth.admin.deleteUser(userId);
      return { ok: false, error: `Profile insert failed: ${profileErr.message}` };
    }

    const { error: roleErr } = await admin
      .from("user_roles")
      .insert({ user_id: userId, role: parsed.data.role });
    if (roleErr) {
      await admin.from("profiles").delete().eq("user_id", userId);
      await admin.auth.admin.deleteUser(userId);
      return { ok: false, error: `Role insert failed: ${roleErr.message}` };
    }

    return { ok: true, message: "User created" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteUserCompletely(userId: string): Promise<ActionResult> {
  try {
    const callerId = await assertCallerIsAdmin();
    if (callerId === userId) {
      return { ok: false, error: "Cannot delete your own account from this UI" };
    }

    const admin = getAdmin();

    // Order: dependent rows first, then auth.users last. None of these throw
    // on a missing row, so the operation is idempotent.
    await admin.from("user_roles").delete().eq("user_id", userId);
    await admin.from("profiles").delete().eq("user_id", userId);

    const { error: authErr } = await admin.auth.admin.deleteUser(userId);
    if (authErr) {
      return { ok: false, error: `auth.users delete failed: ${authErr.message}` };
    }

    return { ok: true, message: "User fully deleted" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function changeUserRole(input: {
  userId: string;
  newRole: "admin" | "moderator" | "user";
}): Promise<ActionResult> {
  try {
    const callerId = await assertCallerIsAdmin();

    // Self-lock guard: admin cannot demote their own admin role.
    if (callerId === input.userId && input.newRole !== "admin") {
      return {
        ok: false,
        error: "Cannot remove your own admin role. Ask another admin or use the Supabase dashboard.",
      };
    }

    const admin = getAdmin();
    const { error } = await admin
      .from("user_roles")
      .update({ role: input.newRole })
      .eq("user_id", input.userId);
    if (error) return { ok: false, error: error.message };
    return { ok: true, message: "Role updated" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

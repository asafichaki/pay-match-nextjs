import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for the automations engine.
 *
 * The engine runs from server actions and from internal API routes that may be
 * called outside an authenticated admin session (e.g. by other server actions
 * after they finish their primary insert). We bypass RLS deliberately — the
 * tables are admin-only by policy, and the runner is internal code.
 *
 * NOTE: This module must never be imported from a client component. The keys
 * stay in the server bundle.
 */
let cached: ReturnType<typeof createClient> | null = null;

export function getAutomationsAdminClient() {
  if (!cached) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Automations engine requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
      );
    }
    cached = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}

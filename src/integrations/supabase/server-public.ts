import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Read-only anonymous Supabase client for public/cached pages.
 *
 * Unlike `createSupabaseServerClient`, this client does NOT touch
 * `next/headers` cookies — so routes using it stay statically
 * renderable (no forced dynamic, no `Cache-Control: no-store`,
 * bf-cache eligible).
 *
 * Use only for anonymous reads on public pages (no auth required).
 */
export function createSupabasePublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

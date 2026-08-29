/**
 * Partner lookup. The destination of a commercial outbound link is a database
 * row, never a string typed into a page.
 *
 * Before this existed there were 21 hardcoded PaymentCloud URLs and 19 Durango
 * URLs across the comparison shells. Signing a program, adding a tracking
 * parameter or pausing a partner meant 21 edits and a deploy. Now it is one
 * UPDATE and at most a 60 second wait.
 */

export type Partner = {
  slug: string;
  name: string;
  destination_url: string;
  /** Contact/demo destination. Null falls back to destination_url. */
  quote_url: string | null;
  network: string | null;
  program_status: "unsigned" | "applied" | "active" | "paused";
  is_active: boolean;
};

const TTL_MS = 60_000;

let cache: { at: number; bySlug: Map<string, Partner> } | null = null;
let inflight: Promise<Map<string, Partner>> | null = null;

async function fetchAll(): Promise<Map<string, Partner>> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) throw new Error("partners: missing Supabase env");

  const res = await fetch(
    `${base}/rest/v1/partners?select=slug,name,destination_url,quote_url,network,program_status,is_active&is_active=eq.true`,
    {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    },
  );
  if (!res.ok) throw new Error(`partners: ${res.status}`);
  const rows = (await res.json()) as Partner[];
  return new Map(rows.map((r) => [r.slug, r]));
}

/**
 * Resolve one partner.
 *
 * Fails soft on purpose. If Supabase is unreachable the last good cache is
 * served however stale it is, because sending a visitor to a working provider
 * page with an out of date tracking parameter is strictly better than showing
 * them an error on their way out of the site.
 */
export async function getPartner(slug: string): Promise<Partner | null> {
  const now = Date.now();
  if (cache && now - cache.at < TTL_MS) return cache.bySlug.get(slug) ?? null;

  if (!inflight) {
    inflight = fetchAll()
      .then((bySlug) => {
        cache = { at: Date.now(), bySlug };
        return bySlug;
      })
      .finally(() => {
        inflight = null;
      });
  }

  try {
    const bySlug = await inflight;
    return bySlug.get(slug) ?? null;
  } catch {
    return cache?.bySlug.get(slug) ?? null;
  }
}

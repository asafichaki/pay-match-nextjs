/**
 * Write one outbound click. Fire and forget, never awaited by the redirect,
 * never throws. Same three rules as the crawl log: a measurement row is not
 * allowed to slow down or break the thing it measures.
 */

export type OutboundClickRow = {
  partner_slug: string;
  from_path: string | null;
  channel: string;
  click_referrer: string | null;
  first_referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  destination_url: string;
  variant: "visit" | "quote";
  ua: string | null;
  is_bot: boolean;
};

export function logOutboundClick(row: OutboundClickRow): Promise<void> | undefined {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) return undefined;

  return fetch(`${base}/rest/v1/outbound_clicks`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      ...row,
      from_path: row.from_path?.slice(0, 500) ?? null,
      click_referrer: row.click_referrer?.slice(0, 500) ?? null,
      first_referrer: row.first_referrer?.slice(0, 500) ?? null,
      ua: row.ua?.slice(0, 300) ?? null,
    }),
    cache: "no-store",
  })
    .then(() => undefined)
    .catch(() => undefined);
}

// The bot crawl log.
//
// Google Search Console's URL Inspection API answers 60 URLs a day and tells
// you what Google decided, not what Googlebot did. This is the other half:
// every verified crawler fetch of a public page, written straight from the
// edge. It is the only instrument that answers "has Googlebot actually
// fetched the pillar this week", which the escalation ladder in the daily loop
// branches on.
//
// Three rules, all load-bearing:
//
//   1. Bots only. A user agent that does not match one of the five verified
//      crawler tokens is never logged, so this table can never accumulate a
//      record of a human reading the site. There is no IP, no header dump and
//      no cookie in the row: `ts`, `url`, `ua_class`, `status`, `ua`.
//   2. Never blocks. The insert is fired without being awaited and the
//      response is already on its way when it runs.
//   3. Never throws. Every failure path resolves. A logging table is not
//      allowed to take the site down, so a missing key, a missing table or a
//      dead network is a silent no-op.
//
// The middleware runs on the edge runtime, so this uses `fetch` against
// PostgREST rather than the supabase-js client.

/** UA substring -> ua_class, in the values the migration documents. */
const BOT_TOKENS: Array<[RegExp, string]> = [
  [/googlebot|google-inspectiontool|storebot-google/i, "googlebot"],
  [/bingbot|adidxbot|bingpreview/i, "bingbot"],
  [/gptbot|oai-searchbot|chatgpt-user/i, "gptbot"],
  [/claudebot|claude-web|anthropic-ai|claude-searchbot/i, "claudebot"],
  [/perplexitybot|perplexity-user/i, "perplexitybot"],
];

/** The crawler class for a user agent, or null for everyone else. */
export function classifyBot(userAgent: string | null): string | null {
  if (!userAgent) return null;
  for (const [re, cls] of BOT_TOKENS) {
    if (re.test(userAgent)) return cls;
  }
  return null;
}

/** Paths that are not content and would only add noise. */
function isLoggable(pathname: string): boolean {
  if (pathname.startsWith("/api/")) return false;
  if (pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/_next/")) return false;
  return !/\.(?:png|jpe?g|svg|webp|gif|ico|css|js|map|woff2?|ttf)$/i.test(pathname);
}

/**
 * Record one verified-bot fetch. Fire and forget: never awaited by a request,
 * never rejects.
 */
export function logCrawlHit(
  userAgent: string | null,
  url: URL,
  status = 200,
): Promise<void> | undefined {
  const uaClass = classifyBot(userAgent);
  if (!uaClass) return undefined;
  if (!isLoggable(url.pathname)) return undefined;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) return undefined;

  const row = {
    url: `${url.origin}${url.pathname}`,
    ua_class: uaClass,
    status,
    ua: (userAgent || "").slice(0, 300),
  };

  return fetch(`${base}/rest/v1/seo_crawl_hits`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
    cache: "no-store",
  })
    .then(() => undefined)
    .catch(() => undefined);
}

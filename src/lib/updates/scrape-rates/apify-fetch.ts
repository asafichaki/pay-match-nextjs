// Fetch rendered HTML for a provider pricing page.
// Primary path: Apify cheerio-scraper actor (handles light JS + bot defenses).
// Fallback: direct fetch with desktop UA + 30s timeout.

const APIFY_ACTOR = "apify~cheerio-scraper";
const TIMEOUT_MS = 30_000;
const DESKTOP_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export interface FetchedHtml {
  html: string;
  fetched_at: Date;
}

async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function fetchViaApify(url: string, token: string): Promise<string | null> {
  const runUrl = `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`;
  const body = {
    startUrls: [{ url }],
    pageFunction:
      "async function pageFunction(context) { return { url: context.request.url, html: context.$('html').html() || '' }; }",
    proxyConfiguration: { useApifyProxy: true },
    maxRequestRetries: 1,
    maxPagesPerCrawl: 1,
  };
  try {
    const res = await fetchWithTimeout(
      runUrl,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
      TIMEOUT_MS,
    );
    if (!res.ok) return null;
    const items = (await res.json()) as Array<{ html?: string }>;
    const html = items?.[0]?.html;
    return html && html.length > 200 ? html : null;
  } catch {
    return null;
  }
}

async function fetchDirect(url: string): Promise<string> {
  const res = await fetchWithTimeout(
    url,
    {
      headers: {
        "User-Agent": DESKTOP_UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    },
    TIMEOUT_MS,
  );
  if (!res.ok) throw new Error(`direct fetch ${res.status} for ${url}`);
  return await res.text();
}

export async function fetchPricingHtml(url: string): Promise<FetchedHtml> {
  const token = process.env.APIFY_TOKEN;
  let html: string | null = null;
  if (token) {
    html = await fetchViaApify(url, token);
  }
  if (!html) {
    html = await fetchDirect(url);
  }
  return { html, fetched_at: new Date() };
}

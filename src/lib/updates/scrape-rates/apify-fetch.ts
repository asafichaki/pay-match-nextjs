// Fetch rendered HTML for a provider pricing page.
// PRIMARY: Apify web-scraper (Puppeteer + RESIDENTIAL proxy) — bypasses
//   Cloudflare on Helcim, Payment Depot, etc. that 403 plain curl.
// FALLBACK: direct fetch with desktop UA (only used if Apify is genuinely
//   broken or token missing).
//
// Note: per learnings.md 2026-05-07, Helcim and Payment Depot 403 direct
// fetch even with a desktop UA. Apify must always be tried first.

const APIFY_ACTOR = "apify~web-scraper";
const TIMEOUT_MS = 60_000;
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

interface ApifyResult {
  html: string | null;
  error?: string;
}

async function fetchViaApify(url: string, token: string): Promise<ApifyResult> {
  const runUrl = `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`;
  const body = {
    startUrls: [{ url }],
    runMode: "PRODUCTION",
    pageFunction:
      "async function pageFunction(context) { const { request, page } = context; await page.waitForLoadState ? page.waitForLoadState('networkidle').catch(()=>{}) : null; const html = await page.content(); return { url: request.url, html }; }",
    proxyConfiguration: { useApifyProxy: true, apifyProxyGroups: ["RESIDENTIAL"] },
    maxRequestRetries: 2,
    maxPagesPerCrawl: 1,
    waitUntil: ["networkidle2"],
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
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return { html: null, error: `apify ${res.status}: ${errText.slice(0, 200)}` };
    }
    const items = (await res.json()) as Array<{ html?: string }>;
    const html = items?.[0]?.html;
    if (!html || html.length < 200) {
      return { html: null, error: `apify returned ${html ? html.length : 0} bytes` };
    }
    return { html };
  } catch (err) {
    return { html: null, error: `apify exception: ${err instanceof Error ? err.message : "unknown"}` };
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
  const errors: string[] = [];

  // Primary: Apify with residential proxy + Puppeteer
  if (token) {
    const apify = await fetchViaApify(url, token);
    if (apify.html) {
      return { html: apify.html, fetched_at: new Date() };
    }
    errors.push(apify.error || "apify returned null");
  } else {
    errors.push("APIFY_TOKEN not set");
  }

  // Fallback: direct fetch (will 403 on Cloudflare-protected sites)
  try {
    const html = await fetchDirect(url);
    return { html, fetched_at: new Date() };
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "direct fetch failed");
    throw new Error(`All fetch paths failed: ${errors.join(" | ")}`);
  }
}

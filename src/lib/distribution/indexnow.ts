// IndexNow client — pings Bing/Yandex (and IndexNow-participating crawlers) on publish.
// Per geo-architect § 06-distribution-pipelines.md.
//
// Key location: public/<KEY>.txt (must return the key string).
// Verify: curl https://www.mypayadvisor.com/<KEY>.txt

const SITE_HOST = "www.mypayadvisor.com";
const KEY = process.env.INDEXNOW_KEY || "ececeafbb53f493babf094ce355c8b7f";
const KEY_LOCATION = `https://${SITE_HOST}/${KEY}.txt`;

const INDEXNOW_ENDPOINTS = [
  "https://api.indexnow.org/indexnow", // central
  "https://www.bing.com/indexnow", // Bing direct
];

export interface IndexNowResult {
  endpoint: string;
  status: number;
  ok: boolean;
  error?: string;
}

/** Ping IndexNow with a list of URLs. Returns per-endpoint results. */
export async function pingIndexNow(urls: string[]): Promise<IndexNowResult[]> {
  if (!urls.length) return [];

  // Normalize URLs to absolute, on our host only (IndexNow rejects mixed hosts).
  const sanitized = urls
    .map((u) => {
      if (u.startsWith("http")) return u;
      if (u.startsWith("/")) return `https://${SITE_HOST}${u}`;
      return `https://${SITE_HOST}/${u}`;
    })
    .filter((u) => u.includes(SITE_HOST));

  if (!sanitized.length) return [];

  const body = JSON.stringify({
    host: SITE_HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: sanitized,
  });

  return Promise.all(
    INDEXNOW_ENDPOINTS.map(async (endpoint) => {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json; charset=utf-8" },
          body,
        });
        return { endpoint, status: res.status, ok: res.ok };
      } catch (err) {
        return {
          endpoint,
          status: 0,
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    })
  );
}

/** Convenience: single-URL ping. */
export function pingIndexNowSingle(url: string) {
  return pingIndexNow([url]);
}

/**
 * Is this /go/ hit an automated fetch?
 *
 * `is_bot` used to come from the crawl-log classifier, which knows five
 * verified search crawlers. robots.txt already keeps exactly those five out of
 * /go/, so the flag was false on all 995 rows while declared crawlers
 * (SiteLockSpider, "...SourceUrlDiscovery ... crawler") and scripted fetches
 * with a browser UA filled the table.
 *
 * Only confident signals set the flag. A real reader with an unusual browser
 * must never be filed as a bot (that would undercount the one number this
 * table exists to measure), so the weaker hints are left for analysis rather
 * than decided here: the client-side `affiliate_click` event, which only a
 * browser running our JavaScript can send, is the human count.
 */
const BOT_UA =
  /bot\b|bot\/|crawl|spider|slurp|scan|monitor|preview|discovery|headless|phantom|selenium|playwright|puppeteer|lighthouse|pagespeed|python|curl|wget|httpclient|okhttp|java\/|go-http|axios|node-fetch|undici|libwww|scrapy|feedfetcher|facebookexternalhit|embedly|whatsapp|telegrambot|slackbot|discordbot|example\.com/i;

export function isAutomatedClick(headers: Headers): boolean {
  const ua = headers.get("user-agent") || "";
  if (!ua.trim()) return true;
  if (BOT_UA.test(ua)) return true;
  // A browser navigation always sends Accept with text/html. Scripted fetches
  // that only borrowed a browser UA usually send */* or nothing.
  const accept = headers.get("accept") || "";
  if (accept && !/text\/html/i.test(accept)) return true;
  return false;
}

/**
 * Did a person click this link on our page?
 *
 * Stricter than `!isAutomatedClick`. Scripted fetchers that borrow a full
 * browser UA pass the UA check, and on 2026-11-03 they were 98% of the table.
 * Two things only a real browser on our site produces:
 *
 *   - the first-touch cookie, written by our JavaScript on the first page load;
 *   - Sec-Fetch-Site: same-origin on the navigation. A missing header is
 *     allowed (older browsers do not send it); "none" (typed or fetched
 *     directly) and "cross-site" (linked from elsewhere) are not a click on
 *     our page.
 */
export function isLikelyHumanClick(headers: Headers, hasAttrCookie: boolean): boolean {
  if (isAutomatedClick(headers)) return false;
  if (!hasAttrCookie) return false;
  const site = headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return false;
  return true;
}

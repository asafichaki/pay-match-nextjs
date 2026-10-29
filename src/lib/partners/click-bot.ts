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

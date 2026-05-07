// Cheap RSS/Atom puller. Drops items older than 7 days and items that fail
// the merchant/processor pre-filter regex BEFORE any Claude call.

import Parser from "rss-parser";
import type { RssSource } from "./sources";

export interface RawItem {
  title: string;
  summary_raw: string;
  source_url: string;
  source_name: string;
  published_at: string; // ISO
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

// Items must mention at least one of these to survive pre-filter.
export const RELEVANCE_REGEX =
  /\b(Stripe|Square|PayPal|Helcim|Stax|Worldpay|Clover|interchange|merchant|processor|MDR|chargeback|3DS|payment processor|payment gateway|acquirer)\b/i;

const parser: Parser = new Parser({
  timeout: 15_000,
  headers: { "User-Agent": "myPayAdvisor-LiveUpdates/1.0 (+https://mypayadvisor.com)" },
});

function stripHtml(s: string): string {
  return (s || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function pullFeed(source: RssSource): Promise<RawItem[]> {
  let feed;
  try {
    feed = await parser.parseURL(source.url);
  } catch (err) {
    console.warn(`[rss] failed to parse ${source.name} (${source.url}):`, (err as Error).message);
    return [];
  }

  const cutoff = Date.now() - SEVEN_DAYS_MS;
  const out: RawItem[] = [];

  for (const item of feed.items || []) {
    const title = (item.title || "").trim();
    const link = (item.link || "").trim();
    if (!title || !link) continue;

    const rawSummary = stripHtml(
      item.contentSnippet || item.content || (item as { summary?: string }).summary || "",
    ).slice(0, 1200);

    const pub = item.isoDate || item.pubDate;
    const pubMs = pub ? Date.parse(pub) : Date.now();
    if (Number.isFinite(pubMs) && pubMs < cutoff) continue;

    const haystack = `${title} ${rawSummary}`;
    if (!RELEVANCE_REGEX.test(haystack)) continue;

    out.push({
      title,
      summary_raw: rawSummary,
      source_url: link,
      source_name: source.name,
      published_at: new Date(Number.isFinite(pubMs) ? pubMs : Date.now()).toISOString(),
    });
  }

  return out;
}

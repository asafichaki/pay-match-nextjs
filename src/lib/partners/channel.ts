/**
 * Which channel sent this visitor.
 *
 * The reason this file exists: Search Console cannot see a visitor who arrived
 * from ChatGPT, because there was no Google SERP. GA4 records the referrer but
 * never ties it to the moment someone leaves for a provider. On this site that
 * is not a small gap. Referral clicks measured from chatgpt.com (93) and
 * gemini.google.com (21) sit alongside roughly 90 Google organic clicks in 28
 * days, so answer engines are about half the arriving traffic and none of it
 * is currently attributed to anything.
 *
 * FIRST TOUCH, NOT LAST. A visitor lands from ChatGPT, reads two more pages,
 * then clicks out to a provider. At that moment the referer header says
 * mypayadvisor.com. Classifying on the header alone files the whole visit
 * under "direct" and erases the channel this table was built to see. So the
 * first-touch `mpa_attr` cookie wins, and the header is only the fallback for
 * a visitor whose very first page view is the click-out.
 */

export type Channel =
  | "chatgpt" | "perplexity" | "gemini" | "claude" | "copilot" | "deepseek" | "ai_other"
  | "google" | "bing" | "duckduckgo" | "search_other"
  | "social" | "email" | "referral" | "direct";

/** Answer engines first: a Gemini hit is gemini, not google. */
const HOST_RULES: Array<[RegExp, Channel]> = [
  [/(^|\.)chatgpt\.com$|(^|\.)chat\.openai\.com$|(^|\.)openai\.com$/i, "chatgpt"],
  [/(^|\.)perplexity\.ai$/i, "perplexity"],
  [/(^|\.)gemini\.google\.com$|(^|\.)bard\.google\.com$/i, "gemini"],
  [/(^|\.)claude\.ai$/i, "claude"],
  [/(^|\.)copilot\.microsoft\.com$|(^|\.)edgeservices\.bing\.com$/i, "copilot"],
  [/(^|\.)deepseek\.com$/i, "deepseek"],
  [/(^|\.)you\.com$|(^|\.)phind\.com$|(^|\.)poe\.com$|(^|\.)mistral\.ai$/i, "ai_other"],
  [/(^|\.)google\./i, "google"],
  [/(^|\.)bing\.com$|(^|\.)msn\.com$/i, "bing"],
  [/(^|\.)duckduckgo\.com$/i, "duckduckgo"],
  [/(^|\.)ecosia\.org$|(^|\.)brave\.com$|(^|\.)search\.yahoo\.com$|(^|\.)yandex\./i, "search_other"],
  [/(^|\.)linkedin\.com$|(^|\.)facebook\.com$|(^|\.)x\.com$|(^|\.)twitter\.com$|(^|\.)reddit\.com$|(^|\.)instagram\.com$|(^|\.)t\.co$/i, "social"],
];

/**
 * utm_source as the engines actually write it. ChatGPT appends
 * `utm_source=chatgpt.com` on links it surfaces, so this catches the visit
 * even when the referrer is stripped by the browser's referrer policy, which
 * is the common case for a link opened out of a chat window.
 */
const UTM_RULES: Array<[RegExp, Channel]> = [
  [/chatgpt|openai/i, "chatgpt"],
  [/perplexity/i, "perplexity"],
  [/gemini|bard/i, "gemini"],
  [/claude|anthropic/i, "claude"],
  [/copilot/i, "copilot"],
  [/deepseek/i, "deepseek"],
  [/^google$|^adwords$|^gclid$/i, "google"],
  [/^bing$/i, "bing"],
  [/newsletter|email|resend|drip/i, "email"],
];

function hostOf(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    return new URL(raw).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function fromHost(raw: string | null | undefined): Channel | null {
  const host = hostOf(raw);
  if (!host) return null;
  for (const [re, ch] of HOST_RULES) if (re.test(host)) return ch;
  return null;
}

function fromUtm(utmSource: string | null | undefined, utmMedium?: string | null): Channel | null {
  const s = (utmSource || "").trim();
  if (s) for (const [re, ch] of UTM_RULES) if (re.test(s)) return ch;
  const m = (utmMedium || "").trim();
  if (/email/i.test(m)) return "email";
  return null;
}

export type ChannelInput = {
  /** First-touch values read from the mpa_attr cookie. */
  firstUtmSource?: string | null;
  firstUtmMedium?: string | null;
  firstReferrer?: string | null;
  /** The referer header on the click-out request itself. */
  clickReferrer?: string | null;
  /** Our own host, so a same-site referer is never mistaken for a referral. */
  selfHost?: string | null;
};

/**
 * Resolve the channel. Order is deliberate and is the whole point of the file:
 * first-touch utm, then first-touch referrer, then the click-time referer, and
 * only then direct.
 */
export function classifyChannel(input: ChannelInput): Channel {
  const utm = fromUtm(input.firstUtmSource, input.firstUtmMedium);
  if (utm) return utm;

  const first = fromHost(input.firstReferrer);
  if (first) return first;

  const clickHost = hostOf(input.clickReferrer);
  const self = (input.selfHost || "").toLowerCase().replace(/^www\./, "");
  const isSelf = !!clickHost && !!self && clickHost.replace(/^www\./, "") === self;

  if (!isSelf) {
    const click = fromHost(input.clickReferrer);
    if (click) return click;
    if (clickHost) return "referral";
  }

  // A first-touch referrer that was recorded but matched no rule is still a
  // real referral, and is more informative than "direct".
  if (input.firstReferrer && hostOf(input.firstReferrer)) {
    const fh = hostOf(input.firstReferrer)!.replace(/^www\./, "");
    if (fh !== self) return "referral";
  }
  return "direct";
}

/** The channels that are answer engines, for reporting splits. */
export const AI_CHANNELS: readonly Channel[] = [
  "chatgpt", "perplexity", "gemini", "claude", "copilot", "deepseek", "ai_other",
];

export function isAiChannel(c: string | null | undefined): boolean {
  return !!c && (AI_CHANNELS as readonly string[]).includes(c);
}

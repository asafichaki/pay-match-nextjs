// The TypeScript half of the one rules source.
//
// `src/lib/seo/rules.json` is read here and by the Python loop
// (`ops/hermes-seo/rules.py`), so a rule changed in one place changes in both.
// The loop compares `rules_version` against the live `/seo-manifest.json`
// before it is allowed to apply anything; a mismatch turns apply off.
//
// Nothing here ever "cleans" text. A candidate passes or is rejected with
// reasons.

import rulesJson from "./rules.json";

export interface SeoRules {
  rules_version: string;
  title: { body_max: number; absolute_max: number; mobile_guide: number; suffix: string };
  meta: { max: number; min: number };
  answer: { min_words: number; max_words: number };
  forbidden_chars: string[];
  banned_bylines: string[];
  banned_image_names: string[];
  forbidden_claims: string[];
  banned_words: string[];
}

export const RULES: SeoRules = rulesJson as SeoRules;
export const RULES_VERSION: string = RULES.rules_version;

export interface RuleResult {
  ok: boolean;
  reasons: string[];
}

// $1,234.56 / $10K / 2.9% / 30 cents
const MONEY_RE = /\$\s?\d[\d,]*(?:\.\d+)?\s?(?:[kKmM]\b)?/g;
const PCT_RE = /\d[\d,]*(?:\.\d+)?\s?%/g;
const CENTS_RE = /\b\d+(?:\.\d+)?\s?(?:cents?|¢)/g;

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Whole-phrase match, so "crafted" does not fire inside "handcrafted-ish"
// and "best rate" does not fire inside "best rates-of-return".
function containsPhrase(text: string, phrase: string): boolean {
  if (!phrase) return false;
  const re = new RegExp(`(?<![\\w-])${escapeRe(phrase.toLowerCase())}(?![\\w-])`);
  return re.test(text.toLowerCase());
}

export function forbiddenCharHits(text: string): string[] {
  return RULES.forbidden_chars.filter((c) => c && text.includes(c));
}

export function bannedWordHits(text: string): string[] {
  return RULES.banned_words.filter((w) => containsPhrase(text, w));
}

export function forbiddenClaimHits(text: string): string[] {
  return RULES.forbidden_claims.filter((c) => containsPhrase(text, c));
}

export function bannedBylineHits(text: string): string[] {
  const low = text.toLowerCase();
  return [
    ...RULES.banned_bylines.filter((b) => low.includes(b.toLowerCase())),
    ...(RULES.banned_image_names || []).filter((n) => low.includes(n.toLowerCase())),
  ];
}

// Checks every field shares. Mirrors rules.py `_common`.
function common(text: string, reasons: string[]): void {
  for (const c of forbiddenCharHits(text)) reasons.push(`forbidden char ${JSON.stringify(c)}`);
  for (const w of bannedWordHits(text)) reasons.push(`banned word ${JSON.stringify(w)}`);
  for (const c of forbiddenClaimHits(text)) reasons.push(`forbidden claim ${JSON.stringify(c)}`);
  for (const b of bannedBylineHits(text)) reasons.push(`banned byline ${JSON.stringify(b)}`);
  if (/\s{2,}/.test(text.trim())) reasons.push("double space");
}

/** Length as a browser tab shows it: body plus the suffix unless absolute. */
export function renderedTitleLength(text: string, absolute: boolean): number {
  const suffix = RULES.title.suffix;
  if (absolute || text.endsWith(suffix.trim())) return text.length;
  return text.length + suffix.length;
}

/**
 * Title rules.
 *
 * absolute=false: the layout template appends " | myPayAdvisor", so the body
 * must fit `title.body_max`. absolute=true: the text is the whole title and
 * must fit `title.absolute_max`. Above `MOBILE_SHARE_GUIDE` mobile share the
 * rendered length must also fit `title.mobile_guide`.
 */
export function validateTitle(text: string, absolute: boolean, mobileShare = 0): RuleResult {
  const reasons: string[] = [];
  const t = (text || "").trim();
  if (!t) return { ok: false, reasons: ["empty title"] };
  if (absolute) {
    if (t.length > RULES.title.absolute_max) {
      reasons.push(`absolute title ${t.length} > ${RULES.title.absolute_max}`);
    }
  } else if (t.length > RULES.title.body_max) {
    reasons.push(`title body ${t.length} > ${RULES.title.body_max} (suffix is appended)`);
  }
  const rendered = renderedTitleLength(t, absolute);
  if (mobileShare > 0.3 && rendered > RULES.title.mobile_guide) {
    reasons.push(`rendered ${rendered} > mobile guide ${RULES.title.mobile_guide}`);
  }
  if (t.length < 20) reasons.push(`title too short (${t.length} < 20)`);
  if (t !== t.replace(/[|:\-, ]+$/, "")) reasons.push("trailing separator");
  common(t, reasons);
  return { ok: reasons.length === 0, reasons };
}

export function validateMeta(text: string): RuleResult {
  const reasons: string[] = [];
  const t = (text || "").trim();
  if (!t) return { ok: false, reasons: ["empty meta"] };
  if (t.length > RULES.meta.max) reasons.push(`meta ${t.length} > ${RULES.meta.max}`);
  if (t.length < RULES.meta.min) reasons.push(`meta ${t.length} < ${RULES.meta.min}`);
  common(t, reasons);
  return { ok: reasons.length === 0, reasons };
}

/** '$ 2,500.00' -> '$2500.00'; '2.9 %' -> '2.9%'; '30 cents' -> '30cents'. */
export function normalizeNumber(token: string): string {
  return token.toLowerCase().replace(/[\s,]/g, "").replace(/¢/g, "cents");
}

export function extractNumbers(text: string): Set<string> {
  const found = new Set<string>();
  for (const rx of [MONEY_RE, PCT_RE, CENTS_RE]) {
    const re = new RegExp(rx.source, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text || "")) !== null) found.add(normalizeNumber(m[0]));
  }
  return found;
}

/** Every figure a page really shows, in the normalizations an answer may use. */
export function pageNumbers(pageText: string): Set<string> {
  const nums = extractNumbers(pageText);
  const widened = new Set(nums);
  for (const n of nums) {
    if (n.endsWith(".00")) widened.add(n.slice(0, -3));
    if (n.includes(".") && n.endsWith("0%")) {
      widened.add(n.replace(/%$/, "").replace(/0+$/, "").replace(/\.$/, "") + "%");
    }
  }
  return widened;
}

/** AEO answer: 40-60 words, every %/$ figure also present on the page. */
export function validateAnswer(text: string, pageFigures: Set<string> = new Set()): RuleResult {
  const reasons: string[] = [];
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (!t) return { ok: false, reasons: ["empty answer"] };
  const words = t.split(" ").filter(Boolean).length;
  if (words < RULES.answer.min_words) reasons.push(`${words} words < ${RULES.answer.min_words}`);
  if (words > RULES.answer.max_words) reasons.push(`${words} words > ${RULES.answer.max_words}`);
  if (pageFigures.size > 0) {
    for (const n of Array.from(extractNumbers(t)).sort()) {
      const alt = n.endsWith(".00") ? n.slice(0, -3) : n;
      if (!pageFigures.has(n) && !pageFigures.has(alt)) reasons.push(`figure ${n} not on page`);
    }
  }
  common(t, reasons);
  return { ok: reasons.length === 0, reasons };
}

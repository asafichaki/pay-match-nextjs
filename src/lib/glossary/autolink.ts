// Glossary auto-linking for DB article bodies, at render time.
//
// Eight glossary terms had exactly one inbound link on 2026-08-25 (their own
// entry on /glossary), which is the definition of a near-orphan. The terms are
// already written out in the article bodies, they were just never links.
//
// Rules, all of them deliberate:
//   - FIRST mention only, per term, per article. A body that says "interchange"
//     forty times gets one link.
//   - At most MAX_LINKS_PER_ARTICLE links in total, so a long guide does not
//     turn into a link farm.
//   - Never inside an existing <a>, a heading, <code>/<pre>/<button>, or an
//     AEO answer block. An anchor inside an anchor is invalid HTML and a linked
//     heading looks broken; the answer block is the passage answer engines
//     quote and it stays clean.
//   - At most one link per text node, so two links never land side by side.
//   - Deterministic: terms are ranked by specificity (word count, then length,
//     then slug), never by document order, so "chargeback monitoring program"
//     wins over "chargeback" and the rare terms are the ones that get linked.
//
// Not applied to the static shells: those are TSX and already carry hand-placed
// links. This runs only over `blog_articles.body_html`.

import { GLOSSARY } from "./terms";

export const MAX_LINKS_PER_ARTICLE = 4;

const UNSAFE_TAGS = new Set(["a", "h1", "h2", "h3", "h4", "h5", "h6", "code", "pre", "button"]);

interface Candidate {
  slug: string;
  phrase: string;
  re: RegExp;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Specificity rank: more words first, then longer, then slug. A term with a
 * digit in it ("MCC 7995") counts as one extra word so the MCC pages, which are
 * exactly the near-orphans this exists for, outrank generic single words.
 */
function rankOf(phrase: string): [number, number, string] {
  const words = phrase.trim().split(/\s+/).length + (/\d/.test(phrase) ? 1 : 0);
  return [-words, -phrase.length, phrase.toLowerCase()];
}

const CANDIDATES: Candidate[] = (() => {
  const out: { slug: string; phrase: string }[] = [];
  for (const t of GLOSSARY) {
    for (const phrase of [t.term, ...(t.alternateNames ?? [])]) {
      const clean = phrase.trim();
      if (clean.length < 3) continue;
      out.push({ slug: t.slug, phrase: clean });
    }
  }
  out.sort((a, b) => {
    const ra = rankOf(a.phrase);
    const rb = rankOf(b.phrase);
    return ra[0] - rb[0] || ra[1] - rb[1] || ra[2].localeCompare(rb[2]);
  });
  return out.map((c) => ({
    ...c,
    // Word-ish boundaries that also work for "IC++", "3DS" and "MCC 7995".
    re: new RegExp(`(?<![A-Za-z0-9-])(${escapeRe(c.phrase)})(?![A-Za-z0-9-])`, "i"),
  }));
})();

interface Token {
  tag: boolean;
  value: string;
  safe: boolean;
  used: boolean;
}

const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

/**
 * Splits the body into tag and text tokens and marks each text token safe or
 * unsafe. The tag stack tracks EVERY open element, not just the blocking ones,
 * so a plain `</div>` inside an answer block cannot pop the answer block off
 * the stack and re-open the text for linking.
 */
function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  const stack: { name: string; blocks: boolean }[] = [];
  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>|<!--[\s\S]*?-->/g;
  let last = 0;
  let blocking = 0;
  let m: RegExpExecArray | null;

  while ((m = tagRe.exec(html))) {
    if (m.index > last) {
      tokens.push({ tag: false, value: html.slice(last, m.index), safe: blocking === 0, used: false });
    }
    const raw = m[0];
    last = tagRe.lastIndex;
    if (raw.startsWith("<!--")) {
      tokens.push({ tag: true, value: raw, safe: false, used: false });
      continue;
    }
    const name = (m[1] || "").toLowerCase();
    const isClose = raw.startsWith("</");
    const selfClosing = raw.endsWith("/>") || VOID_TAGS.has(name);
    if (isClose) {
      const idx = stack.map((e) => e.name).lastIndexOf(name);
      if (idx >= 0) {
        for (const e of stack.splice(idx)) if (e.blocks) blocking -= 1;
      }
    } else if (!selfClosing) {
      const blocks = UNSAFE_TAGS.has(name) || /class=["'][^"']*aeo-answer/i.test(raw);
      stack.push({ name, blocks });
      if (blocks) blocking += 1;
    }
    tokens.push({ tag: true, value: raw, safe: false, used: false });
  }
  if (last < html.length) {
    tokens.push({ tag: false, value: html.slice(last), safe: blocking === 0, used: false });
  }
  return tokens;
}

/**
 * Links the first mention of up to MAX_LINKS_PER_ARTICLE glossary terms.
 * Returns the HTML unchanged when there is nothing to link.
 */
export function autoLinkGlossary(html: string, max = MAX_LINKS_PER_ARTICLE): string {
  if (!html || max <= 0) return html;
  const tokens = tokenize(html);
  if (!tokens.some((t) => !t.tag && t.safe)) return html;

  const linkedSlugs = new Set<string>();
  let budget = max;

  for (const candidate of CANDIDATES) {
    if (budget <= 0) break;
    if (linkedSlugs.has(candidate.slug)) continue;
    for (const token of tokens) {
      if (token.tag || !token.safe || token.used) continue;
      const match = candidate.re.exec(token.value);
      if (!match) continue;
      const start = match.index;
      const text = match[1];
      token.value =
        token.value.slice(0, start) +
        `<a href="/glossary/${candidate.slug}" data-glossary="${candidate.slug}">${text}</a>` +
        token.value.slice(start + text.length);
      token.used = true;
      linkedSlugs.add(candidate.slug);
      budget -= 1;
      break;
    }
  }

  if (linkedSlugs.size === 0) return html;
  return tokens.map((t) => t.value).join("");
}

// Shared voice rules for the Live Updates pipeline.
// Adapted from /Users/user/Projects/bestai/src/lib/autopilot/sanitize.ts.
// Same idempotent text-only walk; extended banned-words list for payments
// editorial. All Claude-generated content (RSS summaries + roundup paragraphs)
// MUST pass `voiceCheck()` before publish. Voice score < 80 -> pending_review.

const BANNED = [
  // generic AI-flavored
  "delve",
  "leverage",
  "robust",
  "seamless",
  "navigate",
  "cutting-edge",
  "revolutionary",
  "paradigm",
  "harness",
  "synergize",
  "synergy",
  "in today's landscape",
  "in today's world",
  "in the world of",
  "the world of",
  "ever-evolving",
  "evolving landscape",
  "rapidly evolving",
  "game-changer",
  "game changer",
  "groundbreaking",
  "transformative",
  "elevate",
  "unlock",
  "empower",
  "unleash",
  // editorial drift specific to fintech
  "thoughtfully designed",
  "crafted",
  "bespoke",
  "tailor-made",
  "world-class",
];

// The prompt has to show the model the exact character it must not emit, so this
// is the one string in the codebase that is allowed to contain one.
// eslint-disable-next-line no-restricted-syntax
export const VOICE_PROMPT_FRAGMENT = `
Voice rules (HARD — output will be rejected if violated):
- No em-dashes (—). Use comma, period, or colon.
- No exclamation marks.
- No banned words: ${BANNED.join(", ")}.
- Short sentences. Operator tone, not journalist or marketer.
- Numbers > adjectives. Concrete dollar figures, percentages, dates.
- If unsure of a fact, omit it. Never invent dollar figures or dates.
- No editorial spin or accusations (do not say a processor "screwed", "deceived", or "scammed" merchants).
- Cite the source URL inline once, never republish full articles.
`.trim();

export interface VoiceCheckResult {
  score: number; // 0-100
  passes: boolean; // score >= 80 by default
  violations: Array<{ kind: string; match: string }>;
  cleaned: string; // text with em-dashes converted; banned words stripped
}

// The two characters this module strips. A regex literal is not reported by the
// em-dash rule, which only looks at strings, template chunks and JSX text.
const EM_DASH_RE = /[—–]/g;

export function voiceCheck(input: string, opts?: { minScore?: number }): VoiceCheckResult {
  const minScore = opts?.minScore ?? 80;
  const violations: Array<{ kind: string; match: string }> = [];
  let cleaned = input;

  // Em-dashes -> ", "
  if (EM_DASH_RE.test(cleaned)) {
    const matches = cleaned.match(EM_DASH_RE) || [];
    // eslint-disable-next-line no-restricted-syntax
    matches.forEach(() => violations.push({ kind: "em_dash", match: "—" }));
    cleaned = cleaned.replace(EM_DASH_RE, ", ");
  }

  // Exclamation marks
  if (/!/.test(cleaned)) {
    const count = (cleaned.match(/!/g) || []).length;
    for (let i = 0; i < count; i++) violations.push({ kind: "exclamation", match: "!" });
    cleaned = cleaned.replace(/!/g, ".");
  }

  // Banned words (word-boundary, case-insensitive)
  for (const phrase of BANNED) {
    // Build case-insensitive regex; for multi-word phrases use literal match
    const safe = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\b${safe}\\b`, "gi");
    const m = cleaned.match(re);
    if (m && m.length) {
      m.forEach((hit) => violations.push({ kind: "banned_word", match: hit }));
      cleaned = cleaned.replace(re, "");
    }
  }

  // Defamation gate — only accusatory verb forms, not topic nouns.
  // (e.g. "Stripe scammed merchants" -> flag. "Fraud detection update" -> OK.)
  const DEFAMATION_RE = /\b(screwed (over)?|scammed|stole from|deceived|swindled|defrauded|ripped off|cheated out of|conned)\b/gi;
  const defamationHits = cleaned.match(DEFAMATION_RE) || [];
  defamationHits.forEach((hit) => violations.push({ kind: "defamation", match: hit }));

  // Collapse double spaces
  cleaned = cleaned.replace(/[ \t]{2,}/g, " ").trim();

  // Score: start at 100, subtract per violation
  let score = 100;
  for (const v of violations) {
    if (v.kind === "defamation") score -= 30;
    else if (v.kind === "em_dash") score -= 5;
    else if (v.kind === "exclamation") score -= 5;
    else if (v.kind === "banned_word") score -= 8;
  }
  score = Math.max(0, score);

  return {
    score,
    passes: score >= minScore && violations.filter((v) => v.kind === "defamation").length === 0,
    violations,
    cleaned,
  };
}

export const BANNED_WORDS = BANNED;

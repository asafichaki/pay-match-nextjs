// Claude classifier + summarizer for industry-news items.
// Always run shouldRunClaude() first; throws BudgetBlockedError if capped.
// Output is run through voiceCheck(); voice score < 80 -> skip publish (caller's call).

import Anthropic from "@anthropic-ai/sdk";
import { shouldRunClaude, estimateCostUsd } from "@/lib/updates/budget";
import { VOICE_PROMPT_FRAGMENT, voiceCheck } from "@/lib/updates/voice-rules";
import type { VoiceCheckResult } from "@/lib/updates/voice-rules";

export class BudgetBlockedError extends Error {
  constructor() {
    super("Claude daily budget cap reached");
    this.name = "BudgetBlockedError";
  }
}

const ALLOWED_TAGS = [
  "rate_change",
  "regulation",
  "outage",
  "fraud",
  "new_processor",
  "industry_news",
] as const;
export type Tag = (typeof ALLOWED_TAGS)[number];

export interface ClassifierInput {
  title: string;
  summary_raw: string;
  source_name: string;
  source_url: string;
}

export interface ClassifierOutput {
  relevance_score: number;
  tags: Tag[];
  ai_summary: string;
  voice_violations: VoiceCheckResult["violations"];
  voice_score: number;
  related_processor: string | null;
  cost_usd_estimate: number;
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");
    client = new Anthropic({ apiKey });
  }
  return client;
}

function buildPrompt(item: ClassifierInput): string {
  return [
    VOICE_PROMPT_FRAGMENT,
    "",
    "You are classifying an industry-news item for a US merchant audience choosing or operating a payment processor.",
    "",
    "Score 0-100 how relevant this is to that audience.",
    `Allowed tags: ${ALLOWED_TAGS.join(", ")}. Pick 1-3.`,
    "Summary: 50-70 words MAX, factual, cite the source name once. No invented facts. No spin.",
    "If a specific processor (Stripe, Square, PayPal, Helcim, Stax, Worldpay, Clover, etc.) is the subject, set related_processor to its lowercased slug; otherwise null.",
    "",
    "Output JSON ONLY, no prose, no code fences. Schema:",
    `{"relevance_score": number, "tags": string[], "summary": string, "related_processor": string|null}`,
    "",
    `Title: ${item.title}`,
    `Source: ${item.source_name}`,
    `URL: ${item.source_url}`,
    `Raw summary: ${item.summary_raw}`,
  ].join("\n");
}

function extractJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("classifier: no JSON in response");
  return JSON.parse(trimmed.slice(start, end + 1));
}

export async function classifyAndSummarize(item: ClassifierInput): Promise<ClassifierOutput> {
  if (!(await shouldRunClaude())) throw new BudgetBlockedError();

  const prompt = buildPrompt(item);
  const resp = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    temperature: 0,
    messages: [{ role: "user", content: prompt }],
  });

  const text = resp.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();

  const parsed = extractJson(text) as {
    relevance_score?: number;
    tags?: string[];
    summary?: string;
    related_processor?: string | null;
  };

  const relevance_score = Math.max(0, Math.min(100, Number(parsed.relevance_score ?? 0)));
  const tags = (parsed.tags || [])
    .map((t) => String(t).toLowerCase())
    .filter((t): t is Tag => (ALLOWED_TAGS as readonly string[]).includes(t));
  const ai_summary = String(parsed.summary || "").trim();
  const related_processor = parsed.related_processor ? String(parsed.related_processor).toLowerCase() : null;

  const voice = voiceCheck(ai_summary, { minScore: 80 });

  const inputTokens = resp.usage?.input_tokens ?? 0;
  const outputTokens = resp.usage?.output_tokens ?? 0;

  return {
    relevance_score,
    tags,
    ai_summary: voice.cleaned || ai_summary,
    voice_violations: voice.violations,
    voice_score: voice.score,
    related_processor,
    cost_usd_estimate: estimateCostUsd(inputTokens, outputTokens),
  };
}

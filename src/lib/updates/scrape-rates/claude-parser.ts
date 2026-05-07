// Claude-powered rate extractor. Runs the daily-budget gate first; if cap is
// exceeded, throws BudgetBlockedError so the caller can record a partial run.

import { getAnthropicClient } from "@/lib/updates/anthropic-client";
import { shouldRunClaude, estimateCostUsd } from "@/lib/updates/budget";

const MODEL = "claude-sonnet-4-6";
const MAX_HTML_CHARS = 60_000; // keep token cost bounded

export class BudgetBlockedError extends Error {
  constructor() {
    super("Claude daily budget cap reached");
    this.name = "BudgetBlockedError";
  }
}

export interface ParsedRates {
  in_person_rate: string | null;
  online_rate: string | null;
  keyed_rate: string | null;
  monthly_fee: string | null;
  transaction_fees_summary: string | null;
  cost_usd: number;
}

const RATE_RE = /^[\d.]+%(\s*\+\s*\$[\d.]+)?$/;
const FEE_RE = /^\$[\d.]+(\/(mo|month))?$/i;

function trimHtml(html: string): string {
  // Strip script/style blocks and collapse whitespace before truncation.
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ");
  return stripped.length > MAX_HTML_CHARS ? stripped.slice(0, MAX_HTML_CHARS) : stripped;
}

function validateField(val: unknown, kind: "rate" | "fee"): string | null {
  if (val === null || val === undefined) return null;
  if (typeof val !== "string") return null;
  const v = val.trim();
  if (!v) return null;
  if (kind === "rate" && !RATE_RE.test(v)) return null;
  if (kind === "fee" && !FEE_RE.test(v) && !RATE_RE.test(v)) return null;
  return v;
}

export async function extractRates(html: string, providerName: string): Promise<ParsedRates> {
  if (!(await shouldRunClaude())) {
    throw new BudgetBlockedError();
  }

  const client = getAnthropicClient();
  const trimmed = trimHtml(html);

  const userPrompt = `Provider: ${providerName}
Pricing page HTML (truncated):
"""
${trimmed}
"""

Extract the published payment processing rates. Return JSON ONLY with this exact shape:
{
  "in_person_rate": string | null,
  "online_rate": string | null,
  "keyed_rate": string | null,
  "monthly_fee": string | null,
  "transaction_fees_summary": string | null
}

Rules:
- Numbers, percentages, and dollar amounts only. No prose, no editorial.
- Rate format must match: "2.6% + $0.10" or "2.9%". Nothing else.
- monthly_fee format: "$0", "$10", "$10/mo".
- transaction_fees_summary: a single short factual line, max 140 chars, no em-dashes, no exclamations, no adjectives.
- If a field is not visible on the page, return null. Do not guess.`;

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    temperature: 0,
    system:
      "You are a precise data extractor. You return JSON only, no prose, no code fences.",
    messages: [{ role: "user", content: userPrompt }],
  });

  const inputTokens = resp.usage?.input_tokens ?? 0;
  const outputTokens = resp.usage?.output_tokens ?? 0;
  const cost = estimateCostUsd(inputTokens, outputTokens);

  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  // Defensive JSON pull (in case the model wraps with stray whitespace).
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart < 0 || jsonEnd <= jsonStart) {
    return {
      in_person_rate: null,
      online_rate: null,
      keyed_rate: null,
      monthly_fee: null,
      transaction_fees_summary: null,
      cost_usd: cost,
    };
  }
  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
  } catch {
    parsed = {};
  }

  const summary =
    typeof parsed.transaction_fees_summary === "string"
      ? parsed.transaction_fees_summary.trim().slice(0, 200) || null
      : null;

  return {
    in_person_rate: validateField(parsed.in_person_rate, "rate"),
    online_rate: validateField(parsed.online_rate, "rate"),
    keyed_rate: validateField(parsed.keyed_rate, "rate"),
    monthly_fee: validateField(parsed.monthly_fee, "fee"),
    transaction_fees_summary: summary,
    cost_usd: cost,
  };
}

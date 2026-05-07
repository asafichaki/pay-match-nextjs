// Shared Anthropic client. If ANTHROPIC_BASE_URL is set, requests go to the
// Hermes proxy (claude-proxy.joyobarefoot.com) which is backed by the
// claude CLI on Assaf's Pro plan, not the metered API.
// Otherwise the SDK hits api.anthropic.com directly and bills the API key.

import Anthropic from "@anthropic-ai/sdk";

let cached: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (cached) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  const baseURL = process.env.ANTHROPIC_BASE_URL || undefined;
  cached = new Anthropic({ apiKey, ...(baseURL ? { baseURL } : {}) });
  return cached;
}

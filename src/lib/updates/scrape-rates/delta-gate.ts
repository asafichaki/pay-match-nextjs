// Decide whether a rate change is too small to matter, large enough to need
// human review, or out-of-band (likely a parser error). Threshold is in
// percentage points and read from live_settings.rate_delta_auto_threshold.

import { getAdminSupabase } from "@/lib/funnel/admin-supabase";

export type DeltaDecision = "no_change" | "small_auto" | "big_review" | "invalid";

export interface DeltaResult {
  delta_pct: number | null;
  decision: DeltaDecision;
}

const PCT_RE = /([\d]+(?:\.[\d]+)?)\s*%/;
const SANITY_MIN = 0.0;
const SANITY_MAX = 6.0;

function firstPct(s: string | null): number | null {
  if (!s) return null;
  const m = s.match(PCT_RE);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

let cachedThreshold: { value: number; at: number } | null = null;
const THRESHOLD_TTL_MS = 60_000;

export async function getAutoThreshold(): Promise<number> {
  if (cachedThreshold && Date.now() - cachedThreshold.at < THRESHOLD_TTL_MS) {
    return cachedThreshold.value;
  }
  try {
    const supabase = getAdminSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from("live_settings")
      .select("value")
      .eq("key", "rate_delta_auto_threshold")
      .single();
    const v = Number(data?.value ?? 0.5);
    const value = Number.isFinite(v) ? v : 0.5;
    cachedThreshold = { value, at: Date.now() };
    return value;
  } catch {
    return 0.5;
  }
}

export function evaluateDelta(
  oldStr: string | null,
  newStr: string | null,
  threshold: number,
): DeltaResult {
  // No new value: skip.
  if (newStr === null || newStr === undefined || newStr.trim() === "") {
    return { delta_pct: null, decision: "no_change" };
  }
  // Identical text: skip.
  if (oldStr !== null && oldStr.trim() === newStr.trim()) {
    return { delta_pct: null, decision: "no_change" };
  }

  const oldPct = firstPct(oldStr);
  const newPct = firstPct(newStr);

  // Sanity: parsed new percentage out of band -> invalid.
  if (newPct !== null && (newPct < SANITY_MIN || newPct > SANITY_MAX)) {
    return { delta_pct: null, decision: "invalid" };
  }

  // No old percentage to compare to: treat as a meaningful change needing review.
  if (oldPct === null || newPct === null) {
    return { delta_pct: null, decision: "big_review" };
  }

  const delta = Math.abs(newPct - oldPct);
  const rounded = Math.round(delta * 100) / 100;

  if (rounded === 0) return { delta_pct: 0, decision: "no_change" };
  if (rounded < threshold) return { delta_pct: rounded, decision: "small_auto" };
  return { delta_pct: rounded, decision: "big_review" };
}

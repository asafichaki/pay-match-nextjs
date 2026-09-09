/** First-party funnel diagnostics. Never store free text or contact details. */
const EVENTS = new Set([
  "sh_open", "sh_step_view", "sh_email_focus", "sh_submit_error",
  "sh_submit_success", "generate_lead", "sh_details_skipped", "sh_details_submitted",
]);

let fallbackSession: string | undefined;
export function getAnalyticsSessionId(): string {
  try {
    const saved = sessionStorage.getItem("analytics_session_id");
    if (saved) return saved;
    const id = fallbackSession ??= crypto.randomUUID();
    sessionStorage.setItem("analytics_session_id", id);
    return id;
  } catch {
    return fallbackSession ??= crypto.randomUUID();
  }
}

export function recordFunnelEvent(event: string, params: Record<string, unknown>): void {
  if (typeof window === "undefined" || !EVENTS.has(event)) return;
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    const metadata: Record<string, string | number | boolean> = {};
    if (Number.isInteger(params.step) && Number(params.step) >= 1 && Number(params.step) <= 5) {
      metadata.step = Number(params.step);
    }
    // Explicit categorical allowlists prevent accidental PII in future callers.
    const allowed: Record<string, readonly string[]> = {
      variant: ["page", "popup"],
      track: ["A", "B", "C", "MANUAL"],
      lead_source: ["sorting_hat"],
      reason: ["empty", "clicked_skip"],
    };
    for (const [name, values] of Object.entries(allowed)) {
      if (typeof params[name] === "string" && values.includes(params[name])) metadata[name] = params[name];
    }
    if (typeof params.ok === "boolean") metadata.ok = params.ok;
    void fetch(`${url}/rest/v1/analytics_events`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}`, Prefer: "return=minimal" },
      keepalive: true,
      body: JSON.stringify({
        event_type: event,
        page_path: window.location.pathname,
        session_id: getAnalyticsSessionId(),
        metadata,
      }),
    }).catch(() => {});
  } catch {
    // Storage, network and analytics failures must not interrupt lead capture.
  }
}

/**
 * Minimal, fail-safe analytics event helper.
 *
 * Fires GA4 events through the single direct gtag path (G-MDTFETTH7E, loaded in
 * the root layout). Falls back to a dataLayer push if gtag is not yet defined.
 * Analytics MUST NEVER break UX, so every path is wrapped in try/catch and
 * no-ops on the server.
 */
export function track(event: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  try {
    const w = window as unknown as {
      gtag?: (...args: unknown[]) => void;
      dataLayer?: unknown[];
    };
    if (typeof w.gtag === "function") {
      w.gtag("event", event, params);
    } else {
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({ event, ...params });
    }
  } catch {
    /* swallow — instrumentation must not throw */
  }
}

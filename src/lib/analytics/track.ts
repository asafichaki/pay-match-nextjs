/**
 * Minimal, fail-safe analytics event helper.
 *
 * Fires GA4 events through the single direct gtag path (G-MDTFETTH7E, loaded in
 * the root layout). Early events use the same gtag command queue as later ones.
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
    if (typeof w.gtag !== "function") {
      w.dataLayer = w.dataLayer || [];
      w.gtag = function () {
        // gtag consumes argument tuples; GTM-style event objects are ignored.
        // eslint-disable-next-line prefer-rest-params
        w.dataLayer!.push(arguments);
      };
    }
    w.gtag("event", event, params);
  } catch {
    /* swallow — instrumentation must not throw */
  }
}

// Retired URLs, and where a link to one should point instead.
//
// Every entry here is a 308 in next.config.ts. Nothing in the repo should link
// a retired slug, but `blog_articles.body_html` is data we did not hand-write:
// on 2026-08-25 six live pages still linked one, which costs a hop, leaks the
// signal to a URL that no longer exists, and is exactly what the "never link a
// retired slug" rule is there to prevent. This map rewrites those hrefs at
// render time so the body always points at the live destination.
//
// Keep in sync with the redirects block in next.config.ts.

export const RETIRED_LINK_TARGETS: Record<string, string> = {
  // Insight rows merged into /comparisons.
  "/insights/payment-platform-comparison-2026-fees-features-and-best-fit-for-your-business":
    "/comparisons",
  "/insights/top-payment-platforms-compared-pricing-benchmarks-risk-factors-and-best-fit-scen":
    "/comparisons",
  "/insights/online-payment-processing-fees-comparison-2026-navigating-the-evolving-landscape":
    "/comparisons",
  "/insights/payment-processor-fees-conversion-rates-2026-merchant-evaluation": "/comparisons",
  "/insights/stripe-vs-square-vs-paypal-vs-helcim-vs-payment-depot-a-2026-merchant-fee-deep":
    "/comparisons",
  // Fee-reduction rows merged into the negotiation playbook.
  "/insights/lowering-merchant-account-fees-2026-pricing-cost-reduction-strategies":
    "/insights/payment-processor-negotiation-playbook",
  "/insights/reduce-merchant-account-fees-expert-strategies-pricing-insights-for-2026":
    "/insights/payment-processor-negotiation-playbook",
  // High-risk duplicate merged into the pillar.
  "/insights/high-risk-merchant-processing-account-a-2026-guide-to-lowering-fees-thriving":
    "/insights/high-risk-payment-processing-guide",
  // Chargeback duplicate.
  "/insights/chargeback-management-software-optimizing-merchant-profitability-in-2026":
    "/insights/chargeback-management-solutions-a-merchant-s-guide-to-prevention-recovery",
  // Comparison duplicates absorbed in PR 1.
  "/comparisons/stripe-vs-square-2026": "/comparisons/square-vs-stripe",
  "/comparisons/stripe-vs-helcim-2026": "/comparisons/helcim-vs-stripe",
};

const HREF_RE = /(href=["'])([^"'#?]+)((?:[#?][^"']*)?["'])/gi;

/** Rewrites any href pointing at a retired URL to its live destination. */
export function rewriteRetiredLinks(html: string): string {
  if (!html) return html;
  return html.replace(HREF_RE, (full, open: string, path: string, close: string) => {
    const clean = path.replace(/\/+$/, "");
    const target = RETIRED_LINK_TARGETS[clean];
    return target ? `${open}${target}${close}` : full;
  });
}

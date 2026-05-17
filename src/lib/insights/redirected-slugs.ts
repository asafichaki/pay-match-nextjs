// Insight slugs that 301-redirect (defined in next.config.ts).
// Must be excluded from sitemap.xml AND from the /insights index
// so we never link to a known redirect.
export const REDIRECTED_INSIGHT_SLUGS = new Set([
  "payment-platform-comparison-2026-fees-features-and-best-fit-for-your-business",
  "top-payment-platforms-compared-pricing-benchmarks-risk-factors-and-best-fit-scen",
  "online-payment-processing-fees-comparison-2026-navigating-the-evolving-landscape",
  "payment-processor-fees-conversion-rates-2026-merchant-evaluation",
  "stripe-vs-square-vs-paypal-vs-helcim-vs-payment-depot-a-2026-merchant-fee-deep",
  "lowering-merchant-account-fees-2026-pricing-cost-reduction-strategies",
  "reduce-merchant-account-fees-expert-strategies-pricing-insights-for-2026",
  "high-risk-merchant-processing-account-a-2026-guide-to-lowering-fees-thriving",
  "chargeback-management-software-optimizing-merchant-profitability-in-2026",
]);

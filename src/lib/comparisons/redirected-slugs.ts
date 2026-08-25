// Comparison slugs that 308-redirect (defined in next.config.ts).
// These are DB rows (blog_articles, kind "comparisons") that duplicated a
// static shell. The static shell won on human impressions (GSC, 2026-08-25):
//   stripe-vs-square-2026 (654 impr)  -> /comparisons/square-vs-stripe (1,910 impr)
//   stripe-vs-helcim-2026 (46 impr)   -> /comparisons/helcim-vs-stripe (270 impr)
// Their unique content was merged into the winners in PR 1. The rows are
// unpublished after deploy with scripts/seo/pr1-unpublish-losers.mjs; until
// then this set keeps them out of the sitemap, the /comparisons hub and
// llms-full.txt so we never list a URL that redirects.
export const REDIRECTED_COMPARISON_SLUGS = new Set([
  "stripe-vs-square-2026",
  "stripe-vs-helcim-2026",
]);

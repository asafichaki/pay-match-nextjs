# Remaining SEO and conversion repairs — September 10, 2026

The live audit found 39 pending SEO checks: 22 matched their expected output, 14 related-link changes were hidden by legacy body blocks, and three H1 changes could not render because the override reader has no H1 field.

## Changes

- Keep embedded article links and render only missing explicit related-link destinations. Stop writing unsupported H1 overrides. Verify the entire AEO answer instead of its first eight words.
- Stop sending article URLs to Google's restricted JobPosting/BroadcastEvent Indexing API. Retain Search Console sitemap submission, URL Inspection and IndexNow for Bing. Official scope: https://developers.google.com/search/apis/indexing-api/v3/using-api
- Correct the indexed CPACharge/Stripe and POS-by-business-type articles, both of which lost clicks. Preserve URL, H1 and title. Replace unsubstantiated statistics, obsolete fees and CPACharge/LawPay feature conflation with sourced content and explicit comparison assumptions. Keep visible FAQ answers and schema in sync. Content and source URLs are stored in `src/data/articles/`.
- Add contextual quiz entry points to those two articles and four DB comparisons with lost clicks: Square/Helcim, Square/Toast, no-contract processors and interchange-plus processors. Keep the previously deployed funding CTA.
- Use the existing article typography for readable headings, links and tables. Contain the CPA table in a keyboard-focusable horizontal scroller.
- Stabilize the quiz modal's server snapshot after a React hydration warning was observed. Suppress only the expected next-themes HTML-attribute mismatch per its installed documentation; no broader hydration suppression.

## Evidence and limits

Fresh URL Inspection: CPACharge/Stripe, POS-by-business-type and same-day funding are indexed. The high-risk pillar remains crawled but not indexed, with the last reported crawl in May; the VAMP glossary URL is unknown in this direct inspection. Indexing notifications do not prove indexing.

Local validation: 118 Python tests, TypeScript, focused ESLint, related-link rendering tests and funnel reliability tests. Browser checks at 390px and 1440px; the two article CTAs open the quiz after hydration. The mobile CPA table scrolls within its region and the document has no horizontal overflow. Test analytics requests were intercepted in the local browser; no lead or email was submitted.

Source-reviewed comparisons are editorial judgments, not claims of new hands-on provider testing or a fresh human expert sign-off. Other articles have not received a full factual rewrite. Monthly lead results, indexing and click recovery still require observation; this batch does not establish the ten-lead business target.

## Live verification

Deployment, pending-check closure and discovery-request evidence are recorded in `/Users/user/Desktop/mypayadvisor-audit-2026-09-09/` after deployment. Old overrides are backed up before updates. Superseded changes are not called verified.

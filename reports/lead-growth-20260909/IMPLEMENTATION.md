# myPayAdvisor lead recovery, September 9, 2026

Goal: at least 10 unique new merchant inquiries per UTC calendar month. Implementation and test inquiries do not achieve this goal. Baseline and post-test counts: September 0; trailing 30 days 4. Valid format is provisional: human contact quality still needs review.

## Implemented

- Queue early GA4 events before deferred gtag loads; preserve the direct gtag command format.
- Mirror categorical quiz events into first-party analytics, with a shared session ID, keepalive requests and no contact fields or free-text error messages. Storage/network failures cannot block the quiz.
- Retain confirmation and internal notification work with Next.js `after()`; check Resend send errors.
- Configure and verify a project-specific Resend webhook using Svix signatures and lead/state tags. Missing secret fails closed.
- Replace the broken production Calendly destination with Barak's existing contact page.
- Correct quiz HowTo markup: four required steps, optional phone after persistence.
- Add contextual intake CTAs to the same-day funding comparison and high-risk pillar.
- Correct same-day payout guidance from official sources, including Square 1.95%, PayPal Business 1.50% rather than the consumer fee cap, Clover 1.75%, Helcim bank/cutoff eligibility, and payout arithmetic. Preserve URL, H1 and section anchors; update metadata, AEO, FAQ and schema together. Remove the outdated numerical illustration from the body.
- Contain the funding table in its own keyboard-focusable horizontal scroller. Fit navigation to small phones; theme control remains in the mobile menu.
- Mark glossary source definitions as answer blocks and prevent the automation from writing DB answers those templates cannot render. Archive and supersede 12 obsolete verification entries without claiming they were verified; other verification work remains.
- Add monthly lead progress to the existing daily SEO report and its existing email renderer. The read fails to unknown rather than zero. No new mailing list or extra report email was sent.

## Evidence

A clearly marked test was submitted through the public quiz without a phone. Its row persisted, the optional details step appeared, and the thank-you page opened. Resend marked both the confirmation and internal notification as delivered. The signed provider webhook saved `day0.delivered` on the test row. Delivery means recipient-server acceptance, not verified inbox placement or reading. The row is tagged `test` and excluded from follow-ups and goal counts.

The new article CTA opened the modal on mobile. First-party requests returned 201, and database reads confirmed `sh_open` and steps 1 and 2 with categorical metadata only. Those own-test analytics rows were removed after evidence capture.

Validation: TypeScript, focused ESLint, funnel/signature/privacy tests, 115 Python tests, production builds, 1,379 parsed JSON-LD blocks across 206 prerendered pages. The design detector found existing accent-border styling outside this conversion change.

Audit and redacted live evidence are in `/Users/user/Desktop/mypayadvisor-audit-2026-09-09/`. Full before-snapshots of the edited public article and SEO override are retained there for rollback. The content apply script defaults to read-only and requires a new backup file before every write.

## Diagnosis limits and next checks

Recent 10-day GSC clicks fell 40 to 9 while impressions fell 12,550 to 11,586. This is not proof of a single failure. The 28-day comparison is materially less severe. Do not treat the query-length heuristic as a verified bot measure.

All 177 sitemap URLs responded successfully in the audit; robots and llms surfaces were available. Google URL Inspection confirmed the funding comparison indexed, the high-risk pillar crawled but not indexed, and the VAMP glossary URL unknown. A successful sitemap submission does not establish indexation.

The ecommerce insight's noindex is an intentional prior consolidation decision and was retained. The fees guide/title and homepage were changed on September 8; repeated title changes one day later would confound evaluation. Preserve them and measure after a full comparison window.

GA4 measurement ID is G-MDTFETTH7E. Available service-account properties do not include myPayAdvisor; both local user tokens lack Analytics Admin scopes, and the browser requires login. No authenticated GA4 property report or key-event configuration was verified.

After the next scheduled run, verify `seo_reports.json.lead_goal` and deployed code version. The existing `run.sh` pulls main on each run; no independent recurring job was created. Recheck GSC after 14 complete days (with D-3 final-data lag), review indexation weekly, and assess September's actual merchant inquiries at month end. Ten requests remains a business target, not a guaranteed result.

## September 10: scheduled-email failure handling

The scheduled endpoint previously advanced leads even when Resend returned an error and overwrote webhook engagement with a stale snapshot. It now requires an accepted email ID, reports provider/database failures, leaves engagement writes to the signed webhook, uses a stable per-lead/state provider idempotency key, and conditionally advances the expected state. Marked test/spam/invalid contacts are excluded. A caller-supplied cron header no longer bypasses the configured bearer secret.

Network-free route tests exercise rejected/missing acceptance, database failure, concurrent state change, excluded test contacts, and forged cron headers. TypeScript and focused ESLint also pass. This does not activate the email sequence: no cron or historical-lead sends were added. Sequence timing and enrollment still need review before activation; provider idempotency is not a permanent send ledger.

Read-only recheck at 2026-09-10 13:50 UTC: September 0 eligible new requests; trailing 30 days 4; last eligible request August 30. GA4 account enumeration succeeds but still lists only four unrelated properties. The business goal is not achieved.

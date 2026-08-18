**SHIP TARGET (recommended, pending Assaf): UPDATE the existing live page /insights/nutra-supplement-merchant-account with this body. Do NOT create a new slug without a routing decision.**

# DRAFT: Nutraceutical Merchant Account (Wave 2, draft #3)

## Header block

- **Slug:** `nutraceutical-merchant-account` (under /insights/) [see SHIP TARGET above; slug pending routing decision]
- **Meta title:** Nutraceutical Merchant Account: 2026 Guide (42 chars; with " | myPayAdvisor" = 57)
- **Meta description:** Why supplement brands get declined, who approves nutraceutical merchant accounts in 2026, and how to structure subscription billing so underwriting says yes. (157 chars)
- **Primary keyword:** nutraceutical merchant account
- **Secondary keywords:** supplement merchant account, nutra payment processing, subscription merchant account for supplements, continuity billing merchant account
- **Target word count rationale:** Measured competitor mains: Soar Payments ~2,100, Corepay ~2,800, PaymentCloud ~3,500, Durango ~4,500 (median ~3,150, but PaymentCloud and Durango carry heavy feature-grid and testimonial boilerplate; prose-equivalent median is roughly 2,500-2,700). Target: ~2,800-3,100 words of body + FAQ with materially higher information density (current 2026 network thresholds and FTC status, which none of the four cover). Actual body + FAQ as drafted: 3,083 words.

## COMPLIANCE NOTES FOR LEGAL REVIEW

Every pricing-adjacent claim in this draft, listed for review. The site is a referral entity; Visa TPA rules restrict referral entities from discussing pricing, fees, or rates with merchants. All figures below are publicly published third-party numbers, attributed inline to their source. Nothing is framed as "our rates" and nothing promises a rate to the reader.

1. Durango Merchant Services publishes all-in processing rates of 1.95%-4.95%, per-authorization fees of $0.15-$0.25, monthly minimums of $15-$60, and rolling reserves of 0%-10% on its nutraceutical page. Attributed to Durango's own published page.
2. Corepay advertises blended rates "as low as 2.95%" on its weight-loss supplement page. Attributed to Corepay's own published page.
3. Visa VAMP enforcement fee of $8 per fraudulent or disputed transaction at merchants in the Excessive category, plus the three-month grace period on first identification within a rolling 12-month period. Attributed to Chargeback Gurus' VAMP guide (secondary source, consistent with the Merchant Risk Council's write-up). VAMP thresholds and regional scope are verified against Visa's own published VAMP fact sheet (2026-08-18); the fact sheet does not publish the fee schedule, so the $8 figure and the grace period remain attributed to the secondary sources.
4. Resolved per legal review 2026-08-19 (YELLOW #4): Mastercard ECM/HECM fine dollar-figures dropped; the body now describes the escalation qualitatively ("fines that escalate the longer a merchant stays in the program"), matching the gaming draft's treatment.
5. Reconciled per legal review 2026-08-19 (YELLOW #5): the body makes NO own-voice statement that nutra pricing runs above standard low-risk card rates; the only above-retail signal is the attributed published ranges themselves. If such a sentence is ever added, use the attributed form "The published ranges above sit above standard low-risk card rates."
6. Statement that reserves are negotiable with processing history. Framed as what processors themselves publish (Durango says reserves are renegotiable with low disputes), not as a pricing promise from myPayAdvisor.
7. The article never quotes a rate the reader "will" get, never says "we can get you X%", and routes all terms questions to the processor's own underwriting.

---

# ARTICLE BODY

# Nutraceutical Merchant Accounts: How Supplement Brands Get Approved in 2026

**Reviewed by Barak Bachar.** Barak has negotiated processing terms for high-risk merchants.

A nutraceutical merchant account is a payment processing account underwritten specifically for supplement, vitamin, and wellness brands, a category card networks and acquiring banks classify as high-risk. Approval runs through specialist high-risk processors rather than Stripe or Square, and the terms you get depend on your chargeback history, billing model, and marketing claims.

If you sell supplements on subscription and you have been declined, terminated, or quietly held at settlement, nothing is wrong with your product. The category itself carries a risk profile that mainstream processors are not built to hold. This page explains that risk profile the way an underwriter sees it, names the processors that publish real appetite for nutra, and shows how the structure of your offer, more than anything else, decides whether you get approved and on what terms.

## Why Nutraceuticals Are Classified High-Risk

Nutraceutical merchant accounts sit in the high-risk bucket for three stacked reasons, and each one shows up as a line item in underwriting.

**Chargebacks driven by continuity billing.** Most nutra revenue is recurring: auto-ship, monthly replenishment, subscribe-and-save. Recurring billing produces disputes in a predictable way. A customer forgets the subscription exists, does not recognize the descriptor, or finds cancellation harder than signup, and the path of least resistance is calling their bank. PaymentCloud's own industry page attributes the category's "higher-than-average chargeback rates" primarily to subscription renewals and expectation mismatches. Subscription merchants in card-not-present channels are also commonly classified under MCC 5968 (Direct Marketing, Continuity/Subscription Merchants), an MCC that acquirers themselves treat as high-risk regardless of what is being sold.

**Trial-offer economics.** Free trials and "free plus shipping" offers convert cheaply on the front end and generate disputes on the back end, because the customer who paid $4.95 for shipping did not internalize that a $79 charge follows in 14 days. The dispute rate on negative-option trial conversions is the single biggest reason acquiring banks lost money on nutra portfolios, and it is why some specialist processors now refuse trial offers outright even while approving the rest of the category (more on this below).

**Health-claim and advertising exposure.** Supplements live under FDA rules for labeling and under FTC rules for advertising. A brand that implies its product treats, cures, or prevents a condition invites regulatory action, and a regulatory action against a merchant becomes the acquirer's problem: frozen funds, mass refunds, and card-network scrutiny. Underwriters read your product pages and your ad funnels before they read your bank statements.

None of this makes nutra unapprovable. It makes nutra a category where the bank prices and structures for known risk, the same way it does for [high-risk merchant accounts](/insights/high-risk-payment-processing-guide) generally. The merchants who get clean approvals are the ones who walk in with the risk already managed.

## Negative Option Billing: Where the FTC Rule Stands in 2026

Negative option billing is a billing arrangement where the customer's silence or inaction is treated as consent to recurring charges. If your billing has any automatic-renewal or trial-conversion component, you are running a negative option program, and you need the current legal picture, because it changed twice in twelve months.

The FTC's Negative Option Rule, widely covered as the "click-to-cancel" rule, was vacated in its entirety by the U.S. Court of Appeals for the Eighth Circuit in July 2025, days before its main compliance deadline. The court found the FTC skipped a required preliminary regulatory analysis, a procedural failure, not a judgment that the substance was wrong. The FTC then restarted the rulemaking: it sent a draft Advance Notice of Proposed Rulemaking to OIRA on January 30, 2026, announced the public comment period on March 11, 2026, and took comments through April 13, 2026 (source: Gibson Dunn's tracking of the docket). As of August 2026 there is no new final rule in force. [VERIFY: re-check docket status at publish date]

Do not read that as a green light. Three enforcement layers never went away:

- **ROSCA** (the Restore Online Shoppers' Confidence Act) still federally requires clear disclosure of subscription terms, express informed consent before charging, and a simple cancellation mechanism for anything sold online with a negative option feature. The FTC's recent negative-option settlements, totaling over $70 million by Gibson Dunn's count, were brought under ROSCA and Section 5, not under the vacated rule.
- **FTC Act Section 5** still covers deceptive trial offers and buried disclosures.
- **State automatic renewal laws** are now the strictest layer. California's amended ARL (AB 2863, effective July 1, 2025) extends full disclosure, affirmative-consent, and click-to-quit cancellation requirements to free-to-paid conversions, requires annual renewal reminders, and requires you to keep consent records for at least three years, or one year after the contract ends, whichever is longer. Colorado, Minnesota, New York, and most other states have their own versions.

What this means for your billing flow is simple: build to the ROSCA-plus-California standard now, regardless of where the federal rule lands. Checkout shows the renewal price and cadence before the pay button, consent to the subscription is a separate affirmative act, cancellation works in the same channel as signup, and you keep the consent records. Underwriters have converged on the same checklist. Durango's published document list for nutra applicants literally asks for screenshots of your cancellation flow. A compliant flow is no longer just legal hygiene; it is an approval document.

*This is general information about how underwriters read billing flows, not legal advice. Subscription billing rules vary by state and change frequently; have your checkout and cancellation flow reviewed by counsel before you scale.*

## Chargeback Monitoring Programs: The Numbers That Get Nutra Merchants Terminated

Chargeback monitoring programs are the card-network programs, Visa VAMP and Mastercard ECM, that identify and penalize merchants whose fraud and dispute numbers exceed published thresholds. Approval is not the finish line: nutra accounts die at these thresholds, so know them before you scale spend.

**Visa VAMP.** On April 1, 2025, Visa replaced its separate dispute and fraud monitoring programs (VDMP and VFMP) with the consolidated Visa Acquirer Monitoring Program. Your VAMP ratio is reported fraud (TC40) plus non-fraud disputes, divided by settled card-absent transactions. The merchant "Excessive" threshold tightened from 2.2% to 1.5% on April 1, 2026 in the US, Canada, the EU, and Asia-Pacific, per Visa's own program fact sheet; Latin America and the Caribbean already sat at 1.5%, and CEMEA remains at 2.2%. Per Chargeback Gurus' program guide, merchants identified as Excessive expose their acquirer to enforcement fees of $8 per fraudulent or disputed transaction, with a three-month grace period on first identification within a rolling 12-month period.

**Mastercard ECM.** Mastercard's Excessive Chargeback Merchant program identifies a merchant at 100-299 chargebacks in a month combined with a chargeback ratio of 1.5%-2.99%, sustained for two consecutive months; 300+ chargebacks at a 3%+ ratio moves you to High Excessive (HECM). Published program summaries describe fines that escalate the longer a merchant stays in the program, plus possible MATCH listing, which is the industry blacklist that follows the business owner, not just the business.

The practical takeaway for a subscription supplement brand: 1.5% is now the number on both networks, and the VAMP math is harsher than it looks because fraud reports and the disputes they become can both count. A merchant doing 20,000 transactions a month hits the Visa threshold at 300 combined fraud-plus-dispute events. Dispute-alert services (Ethoca, Verifi), tight descriptors, pre-renewal reminder emails, and fast refunds on cancellation requests are not optional extras in this category; they are what keeps the account alive. This is the same discipline required in other flagged verticals; if you also operate in gaming, the [gaming merchant account](/insights/gaming-merchant-account) side of the same problem is covered separately.

## Nutraceutical Payment Processors That Approve Supplement Brands

These are providers whose own live pages state appetite for nutraceutical or supplement merchants. Every row below was verified against the provider's published page in August 2026. This is a map, not a ranking; the right fit depends on your volume, your billing model, and your history.

*Disclosure: myPayAdvisor may be compensated when a merchant we refer opens an account with a provider listed here. Rates and terms are set and quoted per merchant by each provider and its acquiring bank, and should be confirmed in writing before you sign. Every figure in this table is the provider's own published claim, not ours.*

| Provider | Nutra fit (published) | Reserve approach (published) | Approval speed (published) | Notable |
|---|---|---|---|---|
| PaymentCloud | Dedicated nutraceutical/supplement page; supports one-time and subscription billing | Not published | 24 hours to 5 days, most commonly 24-48 hours | Publishes its underwriting document list; FDA/FTC compliance emphasis |
| Corepay | Dedicated weight-loss supplement page; native recurring billing, auto-ship, bundles | Not published on the nutra page | 24-72 hours with a complete application | Ethoca and Verifi dispute alerts integrated; LegitScript-certified GLP-1 supplement merchants accepted; 30+ countries |
| Durango Merchant Services | Dedicated supplement/nutraceutical page "designed for long-term stability," subscription models supported | Publishes 0%-10% rolling reserve, 5-10% typical, renegotiable with low disputes | 3-7 days typical | Only provider here publishing full price ranges (1.95%-4.95% all-in); website pre-review before submission |
| Soar Payments | Nutra supported "since company founding"; supplements, vitamins, herbals, cosmeceuticals | Not published | Not published | Publishes hard offer restrictions: no free trials, no free-plus-shipping, subscriptions capped at 12 months |

Easy Pay Direct also maintains a dedicated nutraceutical merchant account page and is a fixture in this vertical, but its site blocked our verification crawl, so its terms are not tabled here. [VERIFY: Easy Pay Direct nutra page details before publish]

Two honest notes on how to read this table. First, these companies are specialist sales channels and processors that place nutra merchants with acquiring banks that have real appetite for the category; the bank behind the account, not the logo on the website, ultimately sets your terms. Second, published approval speeds assume a complete application. The checklist below is what "complete" means.

## Rolling Reserves: What High-Volume Subscription Merchants Can Negotiate

A rolling reserve is a percentage of every settlement the acquirer holds back for a defined window to cover potential future chargebacks and merchant default, released on a rolling schedule as the window ages out. (Full definition at our [glossary entry on reserves](/glossary#reserve).) In nutra, some reserve at the start is normal, not punitive. Durango, the only provider in the table that publishes numbers, lists 0%-10%, with 5-10% typical for new supplement accounts, and states plainly that reserves are renegotiable once the account shows low disputes.

That last clause is the part large merchants under-use. Reserve terms are set against uncertainty, and every month of clean processing removes uncertainty. If you are doing serious monthly volume on subscription billing, you have negotiating levers that a startup does not:

- **Processing history.** Six to twelve months of statements showing dispute ratios comfortably under the 1.5% network thresholds is the strongest single document you own.
- **Dispute infrastructure.** Enrolled dispute alerts, documented refund-first policies, and pre-renewal notifications show the bank the ratio is managed, not lucky.
- **Offer structure.** A brand running straight subscriptions with transparent renewal terms is priced differently from one running trial funnels, because the bank's loss models say they should be.
- **A clean funnel.** Claims-compliant product pages and a cancellation flow that works remove the regulatory tail risk that reserves partly exist to cover.

Reasonable asks with that file in hand: a lower reserve percentage, a shorter rolling window, a capped reserve (the hold stops growing at a fixed amount), or a scheduled review that releases the reserve after a defined clean period. What you cannot negotiate away is the bank's need to see the file first. New nutra accounts asking for zero reserve on day one read as inexperienced. That is not the bank being predatory; it is the bank pricing a category whose loss curve it has seen before.

## Underwriting Checklist: What a Nutra Brand Needs for Approval

A complete nutraceutical merchant account application is a document file an underwriter can price without guessing. Merged from the document lists PaymentCloud and Durango publish for this vertical, this is what complete looks like:

- Signed application, government photo ID, and proof the legal entity exists (formation documents, EIN)
- Voided check or bank letter for the settlement account
- Three months of business bank statements
- Three months of prior processing statements, if you have processed before, including the account you were terminated from (hiding a termination is worse than having one)
- Product information: labels, ingredient lists, and where available Certificates of Analysis from your manufacturer
- Website screenshots or a live URL showing terms of service, privacy policy, refund policy, shipping policy, and the full checkout and cancellation flow
- A one-page description of your billing model: straight sale, subscription cadence, trial terms if any, and average ticket
- Your chargeback mitigation setup: alerts enrollment, descriptor format, customer-service response times

Underwriters in this category also do something many merchants do not expect: they read your ads. A funnel screenshot with a disease claim or a fake countdown timer can sink an otherwise clean file. Sweep the claims before you apply, not after the decline.

## Offer Structure: How Straight Sale, Trial, and Subscription Change Your Approval Odds

Two supplement brands with identical products and identical volume can get opposite underwriting outcomes, and the difference is almost always the offer.

**Straight sale.** One-time purchases at honest prices are the easiest nutra approval there is. Low dispute surface, no negative option, no continuity risk. If you are rebuilding after a termination, running straight-sale only for a few months is the fastest way to generate the clean statements that reopen better terms.

**Standard subscription.** Subscribe-and-save with the renewal price and cadence disclosed at checkout is approvable across every provider in the table above; all four state recurring billing support. Expect the underwriter to test your cancellation flow personally. Soar's published cap is worth noting as a category signal: subscriptions over 12 months are outside its box entirely.

**Trial and negative-option funnels.** This is the structure that splits the market. Soar Payments publishes an outright ban: no free trials, no free-plus-shipping deals on nutra. Other providers will board trial offers, but this is where reserves climb and files get scrutinized, because trial conversion is where the category's chargebacks concentrate and where ROSCA and state ARL enforcement aims. If your economics genuinely depend on a trial funnel, the honest version (real price disclosure before the card is taken, an unmissable conversion reminder, one-click cancellation) is both the legal standard under California's ARL and the only version a good underwriter will keep on its books through 2026.

The pattern across all three: the more your offer relies on the customer not noticing the next charge, the worse your approval odds, your reserve, and your survival against the 1.5% thresholds. Structure the offer so the customer expects every charge, and the processing problem mostly dissolves.

## The Verdict: Approval Is an Engineering Problem, Not a Lottery

Nutraceutical processing in 2026 rewards exactly one thing: showing the acquiring bank a risk profile it can price. Classify yourself honestly as a continuity merchant, build the billing flow to ROSCA-plus-California standard, keep the combined fraud-and-dispute ratio under 1.5% with alerts and reminders, and apply with the full document file. The providers above approve this category every day; they decline chaos, not supplements.

Which of them fits your volume, your billing model, and your history is the part that benefits from a second pair of eyes. Take the [matching quiz](/) and Barak will review your shortlist against what you actually sell and how you bill. The same underwriting logic, applied to other flagged verticals, is covered in our guides to [gaming merchant accounts](/insights/gaming-merchant-account) and [travel merchant accounts](/insights/travel-merchant-account).

## FAQ

### Why do Stripe, Square, and PayPal keep shutting down supplement merchants?

Aggregators onboard you in minutes because they underwrite after the fact, not before. Your account runs until their risk systems look closely at what you sell and how you bill, and supplement brands, especially subscription ones, sit on or near the restricted-category lists these platforms maintain [VERIFY: current Stripe/Square/PayPal restricted business lists]. When the review happens, the outcome is a freeze or termination with funds held, often at the worst possible moment, mid-scale. A dedicated nutraceutical merchant account inverts this: the underwriting happens up front, the acquiring bank knowingly accepts the category, and the account is built to survive the dispute profile instead of being surprised by it.

### What chargeback ratio does a supplement brand need to stay under in 2026?

Treat 1.5% as the hard ceiling on both networks, and manage to well under 1% in practice. Visa's VAMP Excessive threshold dropped from 2.2% to 1.5% on April 1, 2026, and the VAMP ratio counts reported fraud plus non-fraud disputes against settled card-absent transactions, so it climbs faster than an old-style chargeback ratio. Mastercard's ECM program identifies you at 100+ monthly chargebacks combined with a 1.5%+ ratio held for two consecutive months. Because monitoring math includes absolute counts as well as ratios, high-volume merchants should track both numbers weekly, enroll in Ethoca and Verifi alerts, and treat every refund request inside 48 hours as cheaper than the dispute it prevents.

### Can I get a nutraceutical merchant account after a termination or a MATCH listing?

A prior termination does not end the conversation; hiding it does. High-risk underwriters see terminated nutra merchants weekly, and their first question is what caused it and what changed. Bring the old processing statements, explain the dispute spike or the offer that caused it, and show the fix: a restructured offer, alerts enrollment, a compliant cancellation flow. A MATCH listing is harder, because acquirers check it during underwriting and most decline listed merchants, but listings expire after five years and some specialist providers will still review the file depending on the listing reason. Expect a reserve and conservative volume caps at first, then renegotiate with clean months behind you.

### Do supplement companies need LegitScript certification to get payment processing?

Not as a blanket rule for standard supplements, but it increasingly matters at the edges of the category. Corepay, for example, publishes that it accepts GLP-1 supplement merchants only if they are compliant and LegitScript certified, and certification is a common requirement where products border on telehealth, weight-loss pharmaceuticals, or ingredients with regulatory history. For a conventional vitamin or sports-nutrition brand, what underwriters check instead is claims discipline on your site and ads, honest labeling, and manufacturer documentation. If your roadmap includes anything GLP-1 adjacent or advertising on platforms that gate health products, budget time for certification early. [VERIFY: current LegitScript requirements by product type]

### How long does approval take for a nutraceutical merchant account?

With a complete file, days, not months, per the providers' own published timelines: PaymentCloud states 24 hours to 5 days with most approvals in 24-48 hours, Corepay states 24-72 hours, and Durango states 3-7 days as typical. The variable is almost never the processor's speed; it is whether your application is actually complete. Missing processing statements, a checkout page without renewal disclosure, or a product label the underwriter cannot match to an ingredient list each add a round trip of days. Assemble the full checklist above before you apply, and treat the website review as part of the application, because the underwriter will.

---

## JSON-LD PLAN (structure only, not full JSON)

- **Article**
  - `headline`: Nutraceutical Merchant Accounts: How Supplement Brands Get Approved in 2026
  - `author`: Organization → myPayAdvisor (@id https://www.mypayadvisor.com/#organization)
  - `reviewedBy`: Person → @id https://www.mypayadvisor.com/about/barak#person (Barak Bachar)
  - `datePublished` / `dateModified`: set at publish
  - `about`: DefinedTerm references below
  - `isPartOf` → /insights/
- **FAQPage**
  - The 5 FAQ questions above as `mainEntity` Question/Answer pairs (answers trimmed to their first ~2 sentences for the schema text, full text on page)
- **BreadcrumbList**
  - Home → Insights → Nutraceutical Merchant Account
- **DefinedTerm plan** (reference the existing glossary set at `src/lib/glossary/terms.ts`; do NOT emit `inDefinedTermSet` pointing at `/glossary#termset` for a term that set does not contain, and do NOT mint duplicate nodes for existing terms):
  - Reference EXISTING glossary terms by `@id`:
    - `https://www.mypayadvisor.com/glossary#reserve` (Reserve; its alternateNames already include "rolling reserve". Do not mint a separate "Rolling reserve" node. Body copy uses the canonical rolling-reserve sentence derived from this entry.)
    - `https://www.mypayadvisor.com/glossary#mcc` (MCC, the general concept)
    - `https://www.mypayadvisor.com/glossary#chargeback`, `https://www.mypayadvisor.com/glossary#chargeback-ratio`, `https://www.mypayadvisor.com/glossary#card-not-present`
  - NEW terms, each with a visible on-page definition in this draft; **add to terms.ts at implementation**, then reference by `@id` at `/glossary#<slug>`:
    - "Negative option billing" (defined in the first sentence of the negative-option section)
    - "Chargeback monitoring program" (defined in the first sentence of the chargeback-monitoring section)
    - "VAMP ratio" (defined in the VAMP paragraph: reported fraud plus non-fraud disputes divided by settled card-absent transactions)
    - "MCC 5968" (Direct Marketing, Continuity/Subscription Merchants; defined in the classification section)
- **ItemList** (processor comparison table; copy the shipped firearms pattern from `/insights/firearms-merchant-account/page.tsx` exactly: `ItemList → ListItem → SoftwareApplication → offers: Offer → priceSpecification: PriceSpecification` with a `description` string ONLY. No numeric price anywhere. No AggregateRating.):
  - `name`: "Processors That Approve Nutraceutical Merchant Accounts (2026)"
  - `itemListOrder`: `https://schema.org/ItemListUnordered`; `numberOfItems`: 4
  - Each item: `SoftwareApplication` with `name`, `applicationCategory: "FinanceApplication"`, `operatingSystem: "Web"`, `url`, `offers.category: "Nutraceutical merchant account"`, `offers.priceCurrency: "USD"`, and `priceSpecification.description`:
    - PaymentCloud: "High-risk nutraceutical pricing; rate quoted per merchant on underwriting"
    - Corepay: "High-risk supplement pricing; rate quoted per merchant on underwriting"
    - Durango Merchant Services: "High-risk nutraceutical pricing; rate quoted per merchant and acquirer"
    - Soar Payments: "High-risk nutraceutical pricing; rate quoted per merchant on underwriting"
- **Speakable**
  - `cssSelector` targeting the lead answer block (the 51-word "A nutraceutical merchant account is..." paragraph); wrap it in a stable class like `.lead-answer` at build time

## SOURCES (URLs actually used)

- https://paymentcloudinc.com/industries/nutraceutical-supplements/ (fetched; H2 map, doc list, approval timeline, chargeback framing)
- https://corepay.net/industries/best-weight-loss-supplement-merchant-accounts/ (fetched; approval timeline, Ethoca/Verifi, LegitScript GLP-1 condition, 2.95% published rate)
- https://durangomerchantservices.com/natural-supplement-and-nutraceutical-merchant-account/ (fetched; reserve ranges, published rates, doc checklist, approval timeline)
- https://www.soarpay.com/nutraceuticals-merchant-accounts/ (fetched; trial-offer ban, 12-month subscription cap, category support)
- https://www.easypaydirect.com/merchant-accounts/nutraceutical-merchant-account/ (identified in SERP; fetch blocked with 403, details NOT used)
- https://www.gibsondunn.com/ftc-restarts-negative-option-rulemaking-after-eighth-circuit-vacatur-enforcement-under-rosca-continues/ (fetched; vacatur, ANPRM dates, comment deadline, ROSCA/Section 5 enforcement, $70M settlements figure)
- https://www.lw.com/en/insights/eighth-circuit-vacates-ftc-click-to-cancel-rule-days-before-compliance-deadline (SERP corroboration of July 2025 vacatur timing)
- https://www.chargebackgurus.com/visa-acquirer-monitoring-program-vamp (fetched; VAMP ratio definition, threshold dates, $8 fee, grace period)
- https://corporate.visa.com/content/dam/VCOM/corporate/visa-perspectives/security-and-trust/documents/visa-acquirer-monitoring-program-fact-sheet-2025.pdf (Visa's own VAMP fact sheet: threshold table by region, April 1, 2026 reduction to 150bps in AP/Canada/EU/US, LAC already at 150bps, CEMEA at 220bps; fetched 2026-08-18)
- https://merchantriskcouncil.org/learning/resource-center/member-news/blog/2026/stricter-vamp-ratio-thresholds-are-now-in-effect-heres-how-to-stay-compliant (SERP corroboration of April 2026 1.5% threshold)
- https://legalclarity.org/mastercard-ecm-program-thresholds-tiers-penalties/ (SERP; ECM/HECM thresholds and fine escalation)
- https://www.jpmorgan.com/content/dam/jpm/merchant-services/payment-network-updates/documents/mastercard-excessive-chargeback-program-guide.pdf (SERP; ECM program corroboration)
- https://www.cooley.com/news/insight/2025/2025-06-04-california-automatic-renewal-law-amendments-take-effect-on-july-1-2025 (SERP; AB 2863 effective date and requirements)
- https://ktslaw.com/en/insights/alert/2024/10/california-latest-automatic-renewal-law-amendments-take-effect-in-july-2025 (SERP; AB 2863 scope, free-to-paid conversions, record retention)
- https://www.pxp.io/mcc-codes/5968-direct-marketing-continuitysubscription-merchant (SERP; MCC 5968 definition and high-risk treatment)

## OPEN QUESTIONS ([VERIFY] items)

1. FTC Negative Option Rule docket status at publish date. Draft states the accurate picture as of 2026-08-18 (vacated July 2025, ANPRM comments closed April 13, 2026, no new final rule); re-check for any post-April movement before this goes live.
2. Visa VAMP enforcement mechanics: thresholds and regional scope verified 2026-08-18 against Visa's own VAMP fact sheet (now in Sources). The $8 per-transaction fee and the three-month first-identification grace period (within a rolling 12-month period) are stated consistently by Chargeback Gurus and the Merchant Risk Council but do not appear in Visa's public fact sheet; confirm against an acquirer bulletin if a primary citation is wanted.
3. Mastercard ECM/HECM fine schedule ($1,000 escalating to $200,000+, Issuer Recovery Assessment): sourced from secondary program guides. Confirm against the Mastercard chargeback guide or the JPMorgan program PDF before publish.
4. Easy Pay Direct nutraceutical page details: site returned 403 to our crawler, so EPD is named but not tabled. Manually verify its published nutra terms and either add a table row or leave as is.
5. Stripe/Square/PayPal restricted business lists: FAQ 1 references supplements sitting "on or near" these lists. Pull the current list URLs and confirm exact category wording before publish.
6. LegitScript requirements by product type (FAQ 4): the Corepay GLP-1 condition is verified from their page; the broader statement about certification "at the edges of the category" should be checked against LegitScript's own certification scope pages.

---

## P0 FIX LOG 2026-08-18

Applied from the GEO review (2026-08-18-geo-review.md) P0 list:

- **Routing prep (from P0-1):** SHIP TARGET note added at the top of the file (recommended: update the live /insights/nutra-supplement-merchant-account in place; no new slug without a routing decision). Sibling link to travel updated to the existing live slug /insights/travel-merchant-account; gaming links unchanged.
- **P0-2 (VAMP reconciliation):** Aligned the VAMP passage to the reconciled, sourced version now shared with the gaming draft. Regions verified against Visa's own VAMP fact sheet: the April 1, 2026 tightening to 1.5% applies to AP (Asia-Pacific), Canada, EU, and US; LAC was already at 1.5%; CEMEA remains at 2.2% (the earlier draft omitted LAC and CEMEA). Grace period clarified as first identification within a rolling 12-month period; inline [VERIFY] resolved (thresholds/regions now primary-sourced; $8 fee and grace period consistent across Chargeback Gurus and MRC). Compliance note 3, OPEN QUESTIONS 2, and Sources updated.
- **P0-3 (Mastercard ECM):** No change needed here; this draft already carried the fuller definition (two-consecutive-months qualifier). The gaming draft was aligned to it.
- **P0-4 (DefinedTerm plan):** Rewrote the JSON-LD DefinedTerm plan: existing glossary terms (reserve, mcc, chargeback, chargeback-ratio, card-not-present) referenced by @id; dropped the duplicate "Rolling reserve" node in favor of /glossary#reserve; surviving new terms (negative option billing, chargeback monitoring program, VAMP ratio, MCC 5968) marked "add to terms.ts at implementation". Added visible one-sentence definitions for negative option billing and chargeback monitoring program at the top of their sections (they previously existed only in the schema plan). Body now uses the canonical rolling-reserve sentence (identical across all three drafts) and links /glossary#reserve.
- **P0-5 (ItemList):** Added ItemList spec for the processor table copying the shipped firearms pattern (SoftwareApplication + Offer + PriceSpecification, description-only, no numeric price, no AggregateRating).
- **P0-6 (entity-first openers):** Rewrote three flagged openers: negative-option section, chargeback-monitoring section, underwriting checklist section. Each now leads with the entity and stands alone.
- **P0-8 (instruction leak):** Removed "and, per the differentiation rule of this category" from the rolling-reserve section and repaired the sentence; the non-adversarial framing is kept.

---

## LEGAL FIX LOG 2026-08-19

Applied from the legal-counsel review (2026-08-19-legal-review.md), mirrored in the shipped page src/app/(public)/insights/nutra-supplement-merchant-account/page.tsx:

- **YELLOW #4 (Mastercard fine figures):** dropped the "$1,000 up to $200,000+" dollar-figures; the ECM/HECM escalation is now described qualitatively, matching the gaming draft's treatment exactly.
- **YELLOW #5:** reconciled compliance note 5; the body makes no own-voice above-retail pricing claim.
- **ARL record-retention precision fix (§3.7):** "keep consent records for at least three years" corrected to "at least three years, or one year after the contract ends, whichever is longer."
- **Not-legal-advice line (§3.7):** added at the end of the negative-option section, exact review copy.
- **Inline compensation disclosure (§5.2):** added above the processor table, exact review copy.
- **GLP-1 framing (§3.6):** kept as what Corepay requires, never as a category myPayAdvisor endorses or routes (no change needed, noted for the record).

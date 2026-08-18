**SHIP TARGET (recommended, pending Assaf): UPDATE the existing live page /insights/travel-merchant-account with this body. Do NOT create a new slug without a routing decision.**

# DRAFT HEADER

- **Slug:** travel-agency-payment-processing (lives under /insights/) [see SHIP TARGET above; slug pending routing decision]
- **Meta title:** Travel Agency Payment Processing Guide 2026 (43 chars; layout appends " | myPayAdvisor" for 58 total)
- **Meta description:** Why card networks classify travel agencies as high-risk (MCC 4722), which processors actually approve them, and how large merchants negotiate reserves. (151 chars)
- **Primary keyword:** travel agency payment processing
- **Secondary keywords:** travel merchant account, tour operator merchant account, high risk travel merchant, payment processing for travel agencies
- **Target word count rationale:** Measured competitors: Durango Merchant Services ~4,500 words, PayCompass ~2,900, PaymentCloud ~2,800, Soar Payments ~2,100. Median ~2,850. This draft targets ~2,700-2,900 body words, beating the median on information gain (agency model vs merchant of record with ARC primary sourcing, MCC 4722, Stripe's actual restricted list) rather than padding.
- **Baseline all competitors cover:** why travel is high-risk, what a travel merchant account is, chargeback prevention, document list, application steps, FAQ.
- **What none cover (our information gain):** (1) the agency model vs merchant of record distinction and how it sets the reserve, sourced to ARC's own card acceptance guide; (2) MCC 4722 explained (none of the ranking processor pages mention MCC codes at all); (3) the exact Stripe restricted-businesses categories that explain aggregator terminations, quoted from Stripe's published list; (4) an exposure-math framing of reserves that large merchants can use in negotiation.

## COMPLIANCE NOTES FOR LEGAL REVIEW

myPayAdvisor is a referral entity. Visa TPA rules restrict referral entities from discussing pricing, fees, or rates with merchants. Every pricing-adjacent claim in this draft is a third-party published figure with inline attribution. The draft never states myPayAdvisor rates, never promises pricing, and never estimates what a reader "will pay." Pricing-adjacent claims to review:

1. "Travel chargeback rates often run 3 to 5x higher than traditional retail" (Durango Merchant Services' published claim, attributed inline).
2. "$1,000 to $8,000 bookings are very common" (Durango's published claim, attributed inline).
3. Durango's published pricing ranges quoted in the comparison table and reserve section: discount rate 1.95% to 4.95%, authorization fees $0.15 to $0.25, monthly fees $15 to $60, rolling reserve 0% to 10%, monthly minimums $5,000 (US) / $50,000 (international). All attributed to Durango's published travel page.
4. PayCompass's published statement that travel transaction fees are "typically between 3% and 5%," attributed inline.
5. Resolved per legal review 2026-08-19 (YELLOW #5): the unsourced higher-cost comparison was removed. The body now says only that the MCC is how networks and the acquirer categorize transactions, "which feeds the interchange treatment your account receives" (classification-only, no cost claim).
6. The reserve section describes reserve STRUCTURES (rolling, capped, upfront) and negotiation levers without quoting any myPayAdvisor terms. Confirm this framing stays on the right side of the TPA line.

---

# Travel Agency Payment Processing: How High-Volume Travel Merchants Get Approved

*By myPayAdvisor. Reviewed by [Barak Bachar](/about/barak). Barak has negotiated processing terms for high-risk merchants.*

<!-- LEAD ANSWER BLOCK (AEO citation hook, Speakable target) -->

**Travel agency payment processing is the acceptance of card payments for trips delivered weeks or months after the charge. Card networks classify travel agencies and tour operators under MCC 4722 and treat the category as high-risk because of future-delivery exposure, high average tickets, and high chargeback rates, so most travel businesses need a specialized high-risk merchant account.**

If you run a travel agency, an OTA, or a tour operator doing serious monthly volume, you have probably lived some version of this: a mainstream processor approved you fast, processed you for a season, then froze funds or terminated the account right as bookings peaked. Or a high-risk processor approved you but parked 10% of every settlement in a reserve you never agreed to in spirit.

None of that means your business is bad. It means the card networks price travel like a loan, not a payment stream. This page explains the actual risk mechanics, who approves travel today, and what a large merchant can negotiate that a small one cannot. It is part of our wider guide to [high-risk merchant accounts](/insights/high-risk-payment-processing-guide).

## Why Travel Agency Payment Processing Is Classified High-Risk

Underwriters look at travel and see one thing before anything else: money collected now for a service delivered later. Everything else flows from that.

**Future-delivery risk.** Future-delivery risk is the exposure an acquiring bank carries between the day a card is charged and the day the travel is actually delivered. A customer pays in January for a July safari. For six months, the acquiring bank is exposed: if the trip never happens (the agency fails, the operator fails, the flight is canceled), the cardholder can dispute the charge and the bank wears the loss if the merchant cannot cover it. The longer the gap between charge and delivery, the bigger the exposure. Card-network dispute rules for delayed-delivery purchases can run the cardholder's window from the expected delivery date rather than the charge date, so a travel merchant's tail of liability is longer than almost any other retail category.

**Chargeback exposure you do not fully control.** Travel chargebacks come from cancellations, weather, itinerary changes, supplier failures, and plain buyer's remorse, not just fraud. Durango Merchant Services, which has published one of the more detailed travel risk breakdowns, states that travel chargeback rates often run 3 to 5x higher than traditional retail and that the majority of travel chargebacks are experience-related rather than fraud. When a hurricane closes an airport, the disputes land on the merchant account, not on the weather.

**High average tickets.** Durango's published figures describe $1,000 to $8,000 bookings as very common. One disputed honeymoon package can equal a hundred disputed t-shirts. High tickets concentrate risk into single transactions, which is exactly what underwriting models penalize.

**Card-not-present by default.** ARC's own card acceptance guide notes that the large majority of transactions in the travel agency channel are card-not-present, that GDSs do not make card terminals available to US travel agents, and that this makes cardholder validation genuinely hard. Card-not-present fraud liability sits with the merchant.

**Seasonality.** Travel volume spikes around booking seasons. To a risk engine, a merchant that processes $150,000 in March and $900,000 in June looks like a fraud pattern unless the underwriter understood the seasonality upfront. Aggregator risk models usually did not.

Travel shares this future-delivery underwriting problem with other card-not-present verticals we cover, like [gaming merchant accounts](/insights/gaming-merchant-account) and [nutraceutical merchant accounts](/insights/nutra-supplement-merchant-account). The mechanics rhyme; the delivery windows differ.

### MCC 4722: The Code That Tells Underwriters What You Are

MCC 4722, Travel Agencies and Tour Operators, is the four-digit merchant category code the card networks assign to businesses that arrange flights, hotels, packages, and tours on behalf of travelers. It covers retail agencies, OTAs, and tour operators. The code matters for three reasons. First, it is how a processor's risk system recognizes you as travel before a human reads your application. Second, it is how the card networks and your acquirer categorize your transactions, which feeds the interchange treatment your account receives. Third, miscoding yourself to dodge the classification is a fast way to get terminated for misrepresentation. If you sell travel, you will be underwritten as travel. The useful move is to present the risk well, not to hide the code.

### Why Stripe and Other Aggregators Terminate Travel Merchants

Aggregator terminations of travel merchants are written policy, not anecdote. Stripe's published restricted-businesses list places "Commercial airlines and cruises," "International (cross-border) charter and private airlines," and "Timeshare services" under prohibited categories, and lists "Travel reservation services and clubs" as restricted, meaning they require additional due diligence, under Stripe's own heading of businesses that "might pose elevated financial risk" (quotes verified verbatim against Stripe's restricted businesses page, accessed August 18, 2026). Other aggregators apply similar house rules [VERIFY: Square's current published position on travel merchants not independently confirmed this session].

Aggregators onboard instantly precisely because they underwrite lightly. When their risk systems later catch up with what a travel merchant actually is (large tickets, long delivery windows, seasonal spikes), the standard responses are holds, reserves imposed without negotiation, or termination. A dedicated travel merchant account flips the order: heavy underwriting first, stability after. For a merchant doing real volume, that trade is the whole game.

## Agency Model vs. Merchant of Record: The Distinction That Sets Your Reserve

A merchant of record is the business whose merchant account accepts the traveler's card and carries the chargebacks, refunds, and card-network obligations for that sale. In travel, whether that business is you or your supplier is the distinction that sets your reserve, and it is the first question a good underwriter will ask you: **whose merchant account does the traveler's money actually touch?**

**Agency model.** The supplier (airline, hotel, cruise line) is the merchant of record. Your agency passes the traveler's card to the supplier, the charge settles on the supplier's merchant account, and you earn commission. Your own merchant account only carries your service fees and markups. In the airline channel this is formalized: ARC-accredited agencies accept cards on behalf of ARC participating airlines, the ticket settles as the airline's transaction, and when a cardholder disputes it, ARC's guide states the dispute is submitted to the airline's payment processor. The Merchant of Record analysis published by AltexSoft puts it simply: in the agency model, suppliers carry the direct chargeback and payment risk.

**Merchant model (merchant of record).** Your business is the merchant of record. You negotiate net rates, add markup, charge the traveler's card on your own merchant account, and pay suppliers later. Most tour operators, package builders, and merchant-model OTAs live here. Every dollar of every package settles through your account, so your acquirer's exposure equals your full booking value across your entire delivery horizon.

The underwriting consequence is direct. An agency-model shop doing $2M a month in gross bookings but only $80K a month through its own merchant account (service fees, small markups) is, to an acquirer, an $80K merchant with small average tickets. A merchant-model tour operator doing the same $2M gross is a $2M exposure with $8,000 tickets delivered nine months out. Same industry, same MCC, radically different reserve conversation. If you are structured partly agency-model, say so on the application and prove it with supplier agreements; it can shrink your underwritten exposure by an order of magnitude.

One honest caveat: the agency model reduces your acquirer's exposure, it does not erase yours. ARC's guide is blunt about where liability lands in the airline channel: "The agent is financially responsible for the sale, associated fees and chargebacks," and if the airline cannot reverse a cardholder's dispute, "the agent assumes financial responsibility for the debit memo issued as a result." Also note that agency service fees (TASF) require their own authorization, separate from the ticket, which is exactly the money that runs on your own merchant account.

## Travel Merchant Account Providers That Approve Travel

These are processors whose own published pages confirm they underwrite travel today. This table only contains rows we verified against the providers' live pages; it is a map of the category, not a ranking.

*Disclosure: myPayAdvisor may be compensated when a merchant we refer opens an account with a provider listed here. Rates and terms are set and quoted per merchant by each provider and its acquiring bank, and should be confirmed in writing before you sign. Every figure in this table is the provider's own published claim, not ours.*

| Provider | Travel fit (per their own pages) | Reserve approach | Approval speed (their published claim) | Notable |
|---|---|---|---|---|
| Durango Merchant Services | Dedicated travel program: agencies, OTAs, tour operators, charters | Publishes a 0% to 10% rolling reserve range and states reserves typically decrease or are removed as processing stabilizes | 1 to 3 business days once documentation is complete | Publishes full rate ranges (1.95% to 4.95% discount rate); acquiring bank network in US, Canada, EU; $5,000 monthly minimum (US) |
| PaymentCloud | Dedicated travel and timeshare page: agencies, cruises, timeshares | Not published | Application "in as little as 5 minutes," representative within 24 hours | Requires ARC bond or IATA certificate for airfare sellers; multiple gateway options (Authorize.net, NMI, others) |
| Soar Payments | Travel and timeshare page; states it has served travel since its founding | Not published | Not published | Requires a current ARC bond for airfare sellers and reseller agreements for resold inventory |
| PayCompass | Dedicated travel page: agencies, tour operators, timeshares | Not published | 3 to 5 business days | Publishes a typical travel fee range of 3% to 5%; multi-currency processing and virtual cards |

PayKings, Host Merchant Services, Zen Payments, and Easy Pay Direct also market travel merchant accounts; we excluded them from the table because their pages could not be verified during this review (rate-limited or blocked), not because of any negative finding.

The pattern worth noticing: every serious travel processor is a merchant account provider with multiple acquiring bank relationships, not an instant-onboarding aggregator. That is the structural difference between an account built to survive a heavy season and one built to onboard you in five minutes.

## Rolling Reserves on Travel Merchant Accounts: What Large Merchants Can Negotiate

A rolling reserve is a percentage of every settlement the acquirer holds back for a defined window to cover potential future chargebacks and merchant default, released on a rolling schedule as the window ages out. (Full definition at our [glossary entry on reserves](/glossary#reserve).) In travel it exists to cover the bank's future-delivery exposure: if you fail before the trips deliver, the reserve absorbs the chargebacks. Among the providers that publish numbers, Durango states travel reserves run from 0% to 10% and typically shrink or disappear as processing history stabilizes. Reserves also come in two other shapes: a capped reserve (holdbacks stop once a fixed dollar amount is reached) and an upfront reserve (a fixed deposit before processing begins).

Here is the frame that makes reserve negotiation rational instead of emotional. The acquirer is estimating one number:

**Exposure ≈ monthly volume through your account × share of bookings not yet delivered × expected dispute severity.**

Everything you can prove that shrinks one of those three factors is a negotiation lever. Large merchants have more levers, not because banks like them more, but because they have more provable history:

- **Processing history.** Twelve or more months of statements showing volume, refunds, and a dispute ratio at or under network monitoring thresholds is the single strongest input. It replaces the underwriter's worst-case guess with your actual numbers.
- **Delivery-horizon mix.** If 60% of your bookings deliver within 30 days, document it. An underwriter modeling every booking at nine months out will reserve you like a tour operator when you book like a city-break shop.
- **Merchant of record split.** Airfare settling through ARC on the airlines' accounts, or hotel stays settling on the supplier, should be carved out of your underwritten volume. Show the supplier agreements.
- **Refund and cancellation discipline.** Published cancellation terms, cardholder-accepted at checkout, plus proactive refunds before disputes, directly cut expected severity. ARC's chargeback guidance is built on exactly this evidence chain: prove identity, prove authorization, prove accepted terms.
- **Reserve review dates in the contract.** The realistic ask for a new account is rarely "no reserve." It is a defined reserve with a scheduled review at 3 and 6 months, a cap instead of an uncapped rolling percentage, and written release terms. Durango's own published position, that reserves typically decrease or get removed as processing stabilizes, tells you processors already operate this way; the negotiation is getting it in writing on day one.

## Travel Merchant Account Approval Checklist: What Underwriters Ask For

A travel merchant account application is judged on its document file: corporate identity, banking, processing history, accreditation if you issue air, and proof of how you book and deliver. The list below is compiled from the published requirements of the travel processors above. Have it ready before you apply; incomplete files are the most common reason a 3-day approval becomes a 3-week one.

- Business license and articles of incorporation
- EIN / tax ID and government-issued ID for all owners
- 3 to 6 months of business bank statements
- 3 to 6 months of prior processing statements, including your dispute counts (if you have processed before)
- ARC bond or IATA/IATAN accreditation certificate, if you issue airfare
- Supplier and reseller agreements for inventory you resell
- Published cancellation and refund policy, terms of service, privacy policy, and full contact details on your website, with secure checkout
- A one-page description of your business model: agency vs merchant of record split, average ticket, booking-to-delivery window, seasonality curve, and your chargeback prevention stack
- A business plan or volume projection (some processors request it for new entities)

That last one-pager is not a formality. It is you doing the underwriter's exposure math before they do it with worst-case assumptions.

## Merchant Size and Average Ticket: How Volume Changes the Conversation

Merchant size and average ticket decide how much underwriting attention a travel merchant account gets and how much of its terms are genuinely negotiable. The dynamics in this guide scale with size, in both directions.

A small agency (say, under $50K a month, service fees and commissions) is a lightweight file: modest exposure, small tickets, quick approval, often minimal reserve. The risk is neglect, not rejection; small travel files get standard terms because nobody spends negotiation effort on them, in either direction.

A very large merchant ($1M+ monthly, $5,000+ average tickets, months-long delivery horizons) is a different animal. Your file will get a human senior underwriter, and possibly more than one acquiring bank. Expect deeper document requests and financials. In exchange, you can genuinely negotiate: reserve caps and review schedules, settlement timing, volume tiers, and a multi-acquirer setup so one bank's risk appetite never becomes your single point of failure. Processors with several bank relationships (Durango and Easy Pay Direct both advertise this model) exist precisely for this file. High average tickets cut both ways: they raise per-transaction exposure, but a clean dispute history at high tickets is the strongest character evidence a travel merchant can show.

**The verdict:** travel is not unbankable, it is mispriced by default. The merchants that get sane terms are the ones that walk in with the exposure math already done: model split documented, delivery horizons proven, dispute ratio in hand. If you want that shortlist built for your specific file instead of a generic one, [take our matching quiz](/) and Barak will review the shortlist against your volume, ticket size, and model before you apply anywhere.

## FAQ: Travel Agency Payment Processing

### Why did Stripe (or another aggregator) shut down my travel agency account?

Because travel is on their written lists. Stripe's published restricted-businesses page marks "Travel reservation services and clubs" as restricted, requiring additional due diligence, under Stripe's own heading of businesses that "might pose elevated financial risk," and separately prohibits timeshare services and commercial airlines and cruises outright (quotes verified against Stripe's restricted businesses page, accessed August 18, 2026). Aggregators approve instantly by underwriting lightly, then their risk systems flag travel's signature pattern later: high tickets, long delivery windows, seasonal spikes. The termination usually arrives after volume grows, which is the worst possible timing. The fix is structural, not cosmetic: a dedicated travel merchant account that underwrites your model upfront, so the risk review happens before your peak season instead of during it.

### What is MCC 4722 and why does it matter for my travel business?

MCC 4722, Travel Agencies and Tour Operators, is the merchant category code card networks assign to businesses that arrange flights, hotels, packages, and tours. It is how a processor's systems classify you before a human reads your application, it shapes your interchange treatment, and it flags your account for high-risk underwriting. It matters because you cannot opt out of it: registering under a milder code to avoid travel underwriting is misrepresentation and a standard reason for termination. The winning approach is to accept the classification and present strong evidence (delivery windows, dispute history, refund discipline) inside it.

### How big is a rolling reserve on a travel merchant account?

There is no single number, and be wary of anyone quoting you one before underwriting. Among processors that publish figures, Durango Merchant Services states travel rolling reserves range from 0% to 10% of processing volume and typically decrease or are removed as processing history stabilizes. Your actual reserve depends on the exposure your account presents: how much volume settles on your merchant account (versus your suppliers'), how far ahead of delivery you charge, your average ticket, and your dispute ratio. Merchant-of-record tour operators with long horizons sit at the high end; agency-model shops running mostly service fees sit at the low end.

### Do I need ARC or IATA accreditation to get a travel merchant account?

Only if you issue airline tickets. PaymentCloud's published requirements ask for an ARC bond or IATA certificate specifically from merchants selling flight tickets, and Soar Payments requires a current ARC bond for airfare sellers. If you sell tours, packages, hotels, or cruises without issuing air, accreditation is not a standard underwriting requirement, though supplier and reseller agreements are. Worth knowing: ARC accreditation changes your risk profile too, because ARC-settled tickets run on the airlines' merchant accounts rather than yours, which shrinks the volume your own acquirer has to underwrite.

### Can a large travel agency negotiate a lower reserve?

Yes, and large merchants have the most negotiating room, because reserves are priced on provable exposure, not on industry labels alone. The levers that move terms: twelve or more months of processing statements with a controlled dispute ratio, documentation showing how much of your volume settles on suppliers' accounts as merchant of record, evidence of your real booking-to-delivery windows, and enforced cancellation terms accepted at checkout. The realistic negotiation targets are a capped reserve instead of an uncapped rolling one, scheduled reserve reviews at three and six months with written release conditions, and reserve percentage steps tied to dispute performance.

---

## JSON-LD PLAN (build at publish, not full JSON here)

- **Article**
  - `headline`: H1 above
  - `author`: Organization → myPayAdvisor (`@id: https://www.mypayadvisor.com/#organization`)
  - `reviewedBy`: Person → `@id: https://www.mypayadvisor.com/about/barak#person` (name: Barak Bachar; no invented bio properties)
  - `datePublished` / `dateModified`: set at publish
  - `about`: link DefinedTerm nodes below
- **FAQPage**: the 5 FAQ Q/A pairs above, verbatim
- **BreadcrumbList**: Home → Insights → Travel Agency Payment Processing
- **DefinedTerm plan** (reference the existing glossary set at `src/lib/glossary/terms.ts`; do NOT emit `inDefinedTermSet` pointing at `/glossary#termset` for a term that set does not contain, and do NOT mint duplicate nodes for existing terms):
  - Reference EXISTING glossary terms by `@id`:
    - `https://www.mypayadvisor.com/glossary#reserve` (Reserve; its alternateNames already include "rolling reserve". Do not mint a separate "Rolling reserve" node. Body copy uses the canonical rolling-reserve sentence derived from this entry.)
    - `https://www.mypayadvisor.com/glossary#mcc` (MCC, the general concept)
    - `https://www.mypayadvisor.com/glossary#card-not-present` and `https://www.mypayadvisor.com/glossary#chargeback`
  - NEW terms, each with a visible on-page definition in this draft; **add to terms.ts at implementation**, then reference by `@id` at `/glossary#<slug>`:
    - "MCC 4722" (Travel Agencies and Tour Operators merchant category code; defined in the MCC 4722 H3 and FAQ 2)
    - "Merchant of record" (defined in the first sentence of the agency-model section)
    - "Future-delivery risk" (defined in the first sentence of the future-delivery paragraph)
  - DROPPED from the plan: "ARC accreditation" and "TASF" (no visible definitional sentence on page; TASF appears only in a parenthetical caveat. Re-add only if a real definitional sentence is written into the body.)
- **ItemList** (processor comparison table; copy the shipped firearms pattern from `/insights/firearms-merchant-account/page.tsx` exactly: `ItemList → ListItem → SoftwareApplication → offers: Offer → priceSpecification: PriceSpecification` with a `description` string ONLY. No numeric price anywhere. No AggregateRating.):
  - `name`: "Providers That Approve Travel Merchant Accounts (2026)"
  - `itemListOrder`: `https://schema.org/ItemListUnordered`; `numberOfItems`: 5
  - Each item: `SoftwareApplication` with `name`, `applicationCategory: "FinanceApplication"`, `operatingSystem: "Web"`, `url`, `offers.category: "Travel merchant account"`, `offers.priceCurrency: "USD"`, and `priceSpecification.description`:
    - Durango Merchant Services: "High-risk travel pricing; rate quoted per merchant and acquirer"
    - PaymentCloud: "High-risk travel and timeshare pricing; rate quoted per merchant on underwriting"
    - Soar Payments: "High-risk travel pricing; rate quoted per merchant on underwriting"
    - PayCompass: "High-risk travel pricing; rate quoted per merchant on underwriting"
    - Easy Pay Direct: "High-risk travel pricing; rate quoted per merchant on underwriting"
- **Speakable**: `SpeakableSpecification` with cssSelector targeting the lead answer block (the bolded definition paragraph under the H1)

## SOURCES (URLs actually used)

- https://durangomerchantservices.com/travel-merchant-account-and-travel-business-payment-processing/ (risk factors, published rate/reserve/minimum figures, approval timeline, document list, multi-acquirer model)
- https://paycompass.com/travel/ (published 3% to 5% fee range, 3 to 5 day approval, travel risk factors)
- https://paymentcloudinc.com/industries/travel-agency/ (travel/timeshare support, ARC bond or IATA certificate requirement, document list, website requirements, application speed claims)
- https://www.soarpay.com/industry/travel/ (travel/timeshare support since founding, ARC bond and reseller agreement requirements, risk factors)
- https://stripe.com/legal/restricted-businesses (exact prohibited/restricted travel categories, quoted)
- https://www2.arccorp.com/globalassets/iah/arcguide-creditcardpayments.pdf (ARC's Guide to Travel Agency Payment Card Acceptance: cards accepted on behalf of airlines, chargeback flow through the airline's processor, agent liability for debit memos, TASF separate authorization, card-not-present and GDS terminal facts)
- https://www.altexsoft.com/blog/merchant-of-record-in-travel/ (agency model vs merchant model definitions and risk allocation)
- https://www.rapyd.net/blog/your-guide-to-merchant-category-code-mcc-4722-travel-agencies-and-tour-operators/ (MCC 4722 definition and scope, via search; secondary source)
- https://www.easypaydirect.com/merchant-accounts/travel-merchant-account/ (existence of travel program; page blocked direct fetch, content via search snippets of EPD's own site)
- https://www.merchantmaverick.com/travel-agency-merchant-account/ (checked; contributed little, listed for completeness)

## OPEN QUESTIONS ([VERIFY] items)

1. **MCC 4722 interchange cost claim**: "4722 merchants can face higher card-acceptance costs" is sourced to secondary MCC guides (Rapyd, others). Verify against Visa's published interchange/merchant data standards documentation before publish, or soften to classification-only.
2. **Square's travel policy**: the aggregator section names Stripe with a verified citation; Square's current published position on travel merchants was not independently confirmed this session. Either verify Square's seller agreement/prohibited list or keep the text as "other aggregators apply similar house rules."
3. **Soar Payments approval speed** ("underwriting in 24 to 72 hours"): appeared in search results attributed to Soar's site, but the travel page we fetched does not state it. Confirm on soarpay.com (likely the FAQ page) or drop the cell.
4. **Easy Pay Direct row**: EPD's travel page returned 403 to our crawler. Row facts ("as little as 2 days," vertical-matched back-end banks) come from EPD's own site text surfaced in search results. Re-verify with a direct page view before publish.
5. **Dispute-window claim**: "card-network dispute rules give cardholders a window that runs from the expected delivery date, not the charge date" reflects Visa/Mastercard dispute time-limit rules for delayed delivery but was not verified against network documentation this session. Verify against Visa Claims Resolution / Mastercard chargeback guide time-limit tables, or soften.
6. **Excluded providers**: PayKings, Host Merchant Services, Zen Payments blocked verification (429/403). If any should appear in the table, re-fetch and verify before adding.

---

## P0 FIX LOG 2026-08-18

Applied from the GEO review (2026-08-18-geo-review.md) P0 list:

- **Routing prep (from P0-1):** SHIP TARGET note added at the top of the file (recommended: update the live /insights/travel-merchant-account in place; no new slug without a routing decision). Sibling link to nutra updated to the existing live slug /insights/nutra-supplement-merchant-account; gaming link unchanged.
- **P0-4 (DefinedTerm plan):** Rewrote the JSON-LD DefinedTerm plan: existing glossary terms (reserve, mcc, card-not-present, chargeback) referenced by @id; dropped the duplicate "Rolling reserve" node in favor of /glossary#reserve; dropped "ARC accreditation" and "TASF" (no visible on-page definitional sentence); surviving new terms (MCC 4722, merchant of record, future-delivery risk) marked "add to terms.ts at implementation". Added a visible one-sentence definition of future-delivery risk at first mention. Body now uses the canonical rolling-reserve sentence (identical across all three drafts) and links /glossary#reserve.
- **P0-5 (ItemList):** Added ItemList spec for the provider table copying the shipped firearms pattern (SoftwareApplication + Offer + PriceSpecification, description-only, no numeric price, no AggregateRating).
- **P0-6 (entity-first openers):** Rewrote four flagged openers: agency-model vs merchant-of-record section (now opens with a standalone merchant-of-record definition), aggregator-termination H3, approval checklist section, merchant-size section. Each now leads with the entity and stands alone.
- **P0-7 (Stripe quotes):** Re-fetched Stripe's restricted businesses page 2026-08-18 and verified all quoted phrases verbatim ("Commercial airlines and cruises", "International (cross-border) charter and private airlines", "Timeshare services" prohibited; "Travel reservation services and clubs" restricted; heading "Businesses that might pose elevated financial risk"). Added "accessed August 18, 2026" next to the quotes in the body and FAQ 1. Corrected FAQ 1, which had attached the "elevated financial risk" heading to the prohibited items; the heading belongs to the restricted section only.

---

## LEGAL FIX LOG 2026-08-19

Applied from the legal-counsel review (2026-08-19-legal-review.md), mirrored in the shipped page src/app/(public)/insights/travel-merchant-account/page.tsx:

- **YELLOW #5 (MCC 4722 interchange-cost claim):** replaced the unsourced secondary-guide cost comparison with the review's exact edit: "Second, it is how the card networks and your acquirer categorize your transactions, which feeds the interchange treatment your account receives." OPEN QUESTION 1 resolved by softening to classification-only.
- **Inline compensation disclosure (§5.2):** added above the provider table, exact review copy.
- **EPD row (§3.5):** dropped from the table (unverified, page 403, two [VERIFY] cells); EPD moved to the excluded-providers sentence. Soar approval-speed cell reduced to "Not published" (claim not confirmed on Soar's travel page).
- **Dispute-window claim (OPEN QUESTION 5):** softened to "can run the cardholder's window from the expected delivery date rather than the charge date" pending verification against network time-limit tables.
- **Stripe quotes (§3.4):** kept verbatim with "accessed August 18, 2026"; review re-verified 2026-08-19 against Stripe's page (last updated 2026-05-13). 90-day re-verify reminder applies.

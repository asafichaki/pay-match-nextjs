# GEO/AEO Second-Voice Review: Wave 2 Industry Approval Pages

**Reviewer:** geo-architect (parallel second voice per locked auto-activate rule `geo_architect_auto_activate`)
**Date:** 2026-08-18
**Drafts reviewed:** gaming-merchant-account, travel-agency-payment-processing, nutraceutical-merchant-account
**Checked against:** `geo-architect/MASTER-CHECKLIST.md` (Phase 2 schema stacking, Phase 3 content patterns, Phase 9 12-point gate), the site's shipped Wave 1 pattern (`/insights/firearms-merchant-account`), `public/llms.txt`, `src/lib/glossary/terms.ts`, `src/data/personas/barak.ts`, and the live `/insights/` route inventory.

---

## Verdicts

| Draft | Verdict | One-line reason |
|---|---|---|
| **gaming-merchant-account** | **PASS-WITH-FIXES** | Net-new entity, no collision, strongest structural fit in the set. Blocked only by cross-set fact reconciliation and schema-plan gaps. |
| **travel-agency-payment-processing** | **FAIL** | Duplicates a live page (`/insights/travel-merchant-account`) with a competing canonical definition of the same entity. Prose is the best of the three; the failure is routing, not writing. |
| **nutraceutical-merchant-account** | **FAIL** | Duplicates a live page (`/insights/nutra-supplement-merchant-account`). Plus an editorial-instruction leak sitting in published body copy. |

**FAIL here means "do not publish at this slug as drafted."** In both cases the fix is a one-time routing decision by Assaf plus a merge, not a rewrite. The underlying content on both is strong enough to keep.

---

## The headline finding: two of three drafts collide with live pages

This is the single most important thing in this review and it is not visible from inside the drafts.

The live `/insights/` inventory already contains:

- `/insights/travel-merchant-account` — live, Article + reviewedBy Barak + FAQPage + BreadcrumbList + ItemList + Speakable. Its lead answer block reads: *"A travel merchant account is a payment-processing account underwritten for travel businesses, such as agencies, tour operators, online travel sellers, and charter providers... which is why travel is widely treated as high-risk and frequently carries a rolling reserve."* It already covers future-delivery risk, rolling reserves, which processors approve travel, and reserve negotiation.
- `/insights/nutra-supplement-merchant-account` — live, same schema stack. Covers free-trial and FTC scrutiny, chargeback exposure, supplement-friendly processors.
- No gaming page exists. The gaming draft is genuinely net-new.

Publishing `travel-agency-payment-processing` and `nutraceutical-merchant-account` as new slugs puts two pages on one domain, each asserting a slightly different canonical definition of the same entity, competing for the same probe queries.

Why this matters more for GEO than for SEO: Google resolves duplicate intent by picking a winner and demoting the other. An LLM does not. It ingests both, finds two same-domain definitions of "travel merchant account" that do not match word for word, and the multi-source-consensus gate (Campixx 2026 field notes) treats internal inconsistency as a reliability signal against the domain. The site currently sits at a 52% probe citation rate. Self-contradiction is one of the few things that reliably moves that number down.

Compounding it: `public/llms.txt` is a **static file** (`public/llms.txt`, last updated 2026-05-30), not a dynamic route handler. It already lists both old URLs by name:

```
- [Nutra and Supplement Merchant Account](https://www.mypayadvisor.com/insights/nutra-supplement-merchant-account): ...
- [Travel Merchant Account](https://www.mypayadvisor.com/insights/travel-merchant-account): ...
```

So on publish day, unless llms.txt is hand-edited, the curated corpus we hand to AI crawlers will keep pointing at the **old** pages while the new, better ones sit outside the corpus entirely. That is the worst of both worlds.

**Three viable resolutions, in my order of preference:**

1. **Merge and keep the old slug.** Publish the new body at the existing URL (`/insights/travel-merchant-account`, `/insights/nutra-supplement-merchant-account`), retitle to the new H1, update the llms.txt description in place. Keeps all accrued crawl history and every existing internal link, adds all the new information gain, creates zero duplication. Cheapest, safest, best for citation continuity.
2. **New slug + 301 from old + retire old from llms.txt and sitemap.** Justified if the new keyword target ("travel agency payment processing", "nutraceutical merchant account") is meaningfully bigger than the old one in the locked workbook. Costs some history; must confirm no dead schema remains (Master Checklist risk register item 4).
3. **Keep both, hard-differentiate.** Only if the two pages answer genuinely different questions and each carries an explicit "for X, see [other page]" link plus non-overlapping definitional sentences. I do not recommend this. As drafted the overlap is roughly 70% and the definitions restate each other.

The gaming draft is unaffected and can proceed independently.

Note in passing: `public/llms.txt` positions the site on "difficult verticals (CBD, subscription, nutraceuticals, **gaming**, travel)" but no gaming page exists today. The gaming draft closes a claim the corpus already makes. That is a real win.

---

## 1. Citation-worthiness

### Lead answer blocks: all three are genuinely quotable

This is the strongest part of the set. All three leads are entity-first, self-contained, definition-shaped, and land in the 52 to 58 word band. If I were the model answering "what is a nutraceutical merchant account", I would lift any of these verbatim.

- **Gaming (~55 words):** "A gaming merchant account is a payment processing account underwritten for businesses that banks classify as high-risk gaming: video game studios, esports platforms, in-game purchase systems, and licensed real-money iGaming operators..." Strong. The follow-on paragraph that names the iGaming/video-games fork is a second, separately citable atomic fact. Best lead in the set.
- **Travel (~58 words):** Entity-first, and it carries the MCC into the definition itself, which is exactly the kind of concrete anchor that survives summarization.
- **Nutra (~54 words):** Entity-first, names Stripe and Square as the negative case, which makes it directly responsive to the "why did Stripe shut me down" query family.

One inconsistency: travel wraps its lead in an HTML comment marker and bold, gaming and nutra leave it as a bare paragraph. The three Speakable plans then describe the target three different ways ("the 52-word definition directly under the H1/reviewer line", "the bolded definition paragraph under the H1", "wrap it in a stable class like `.lead-answer`"). Standardize on nutra's approach for all three.

### FAQ answers: the best citation surface in the set, and under-used

Every FAQ answer across the three drafts is a self-contained 60 to 110 word atomic answer with named sources inside it. These are more citable than most of the body. Gaming's "Is a gaming merchant account the same as a gambling merchant account?" is close to a perfect AEO answer block.

All three ship 5 FAQs. Master Checklist Phase 9 asks for 8 or more. I will note that the site's own shipped pattern (firearms) runs 4, so 5 is not a regression, but each additional FAQ is a discrete new query the page can win at near-zero writing cost. Cheap upside, not a blocker.

### H2s: the definitional openers are inconsistent

`ensureEntityFirst` is a hard gate in this agent's definition, and the set fails it in a consistent, easily-fixed pattern. Every draft nails the rolling-reserve section ("A rolling reserve is a percentage of each settlement...") and then misses on the sections that most need it.

Failing openers, by draft:

**Gaming**
- H2 "iGaming vs video games and esports" opens "Before any processor conversation, place your business on the correct side of this line." Imperative, not definitional. This is the page's differentiator section.
- H2 "Gaming merchant account approval checklist" opens on a sentence fragment ("Compiled from what gaming processors publish...").
- H2 "How merchant size changes the conversation" opens "Below roughly $50k a month, you take the terms you are offered." The H2 itself carries no entity.

**Travel**
- H2 "Agency Model vs. Merchant of Record" opens "This is the nuance almost every competitor page skips." This is the worst offender in the whole set: the page's single biggest information-gain section, and its first sentence is a meta-comment about competitors rather than a definition of merchant of record. An answer engine asked "what is the difference between agency model and merchant of record" has nothing to lift. Fix this one first.
- H3 "Why Stripe and Other Aggregators Terminate Travel Merchants" opens "This is not an anecdote, it is written policy."
- H2 "Travel Merchant Account Approval Checklist" opens on a fragment.
- H2 "Merchant Size and Average Ticket" opens "Everything above scales with size, in both directions." Anaphoric ("everything above"), so it does not survive being extracted as a passage.

**Nutra**
- H2 "Negative Option Billing: Where the FTC Rule Stands in 2026" opens with a conditional ("If your billing has any automatic-renewal or trial-conversion component..."). Negative option billing is proposed as a DefinedTerm, and the section that should define it never does. See finding 3.
- H2 "Chargeback Monitoring Programs" opens "Approval is not the finish line."
- H2 "Underwriting Checklist" opens on a fragment.

The counter-example to copy is in every draft already: travel's H3 "MCC 4722: The Code That Tells Underwriters What You Are" opens "MCC 4722, Travel Agencies and Tour Operators, is the four-digit merchant category code the card networks assign to..." That is the model. One sentence per flagged section.

### Would I cite these pages?

For the target queries: yes for gaming, yes for travel, yes for nutra, on the strength of the lead blocks, the FAQ blocks, and the attributed tables. Travel's ARC primary-source quotes are the highest-value citation asset in the entire set. Direct quotation from a primary-source PDF ("The agent is financially responsible for the sale, associated fees and chargebacks") is exactly the material that gets lifted, and no competitor page has it.

What would stop me citing: if I also retrieved `/insights/travel-merchant-account` and got a second, differently-worded definition from the same domain. See the headline finding.

---

## 2. Schema plan vs the site's proven pattern

The shipped Wave 1 pattern, read from `/insights/firearms-merchant-account/page.tsx`:

```
Article (author: Organization; reviewedBy: Person Barak with @id + name + jobTitle + url + sameAs LinkedIn)
BreadcrumbList
FAQPage
ItemList → SoftwareApplication → Offer → PriceSpecification (description-only, no numeric price)
WebPage → SpeakableSpecification
```

All three drafts plan: Article + reviewedBy + FAQPage + BreadcrumbList + DefinedTerm + Speakable.

**Missing: ItemList.** All three drafts carry a processor comparison table, which is the page element most directly responsible for the site's 52% comparison-query citation rate, and none of the three plans make it machine-readable. The firearms page wraps its processor list in `ItemList → SoftwareApplication → Offer → PriceSpecification` where the `PriceSpecification` carries only a `description` string ("High-risk firearms pricing; rate quoted per merchant on underwriting") and no numeric price. That construction is both the proven citation pattern and TPA-safe, since it asserts no rate. Reuse it verbatim, with `description` reflecting each provider's published position. Add to all three.

**Under-specified: reviewedBy.** The travel draft explicitly says "no invented bio properties" and plans a bare `@id` + `name`. That instinct is right in spirit and wrong in application here. `src/data/personas/barak.ts` already exports a complete, real, non-fictional `BARAK_PERSON_SCHEMA` with `jobTitle: "Global Payments Manager"`, `url`, `image`, `sameAs: [LinkedIn]`, `knowsAbout[]`, and `worksFor` pointing at `#organization`. None of that is invented. Reference the exported constant rather than hand-rolling a thinner node. A thinner reviewedBy node weakens the named-expert entity link that is the whole point of the byline.

Good news: the `@id` all three drafts reference, `https://www.mypayadvisor.com/about/barak#person`, is real and emitted by `/about/barak` via `BARAK_PERSON_ID`. No dangling reference. Confirmed.

**Entity-graph gap worth fixing once, benefiting everything.** `BARAK_AREAS` (which becomes `knowsAbout`) currently lists interchange-plus, statement audit, acquirer routing, reserve negotiation, approval-rate optimization, high-risk merchant accounts, PCI, CNP/CP, effective rate. It does not mention gaming, iGaming, travel, nutraceutical, subscription or continuity billing, or chargeback monitoring programs. After these three pages ship, Barak is the declared reviewer of three verticals his own entity says he does not know about. One edit to `src/data/personas/barak.ts` fixes it everywhere.

**Anti-patterns: clean.** No AggregateRating is proposed anywhere in the three drafts. Correct, and I want to be explicit that suggesting one here would have been fabrication, since the site has no visible third-party review count to cite. No AudioObject, no Dataset, no HowTo on non-procedural content. No fictional credentials. The reviewer credential line ("Barak has negotiated processing terms for high-risk merchants") is conservative and supported by the live bio. This part of the set is disciplined.

**Speakable scope:** all three target the lead block only. That is correctly surgical per the risk register. Consider adding the verdict block as a second target on gaming and nutra, which both have a clean `## The verdict` H2. Travel does not (see finding 6).

---

## 3. Definitional coverage and DefinedTerm correctness

The choice of terms is good. MCC codes, VAMP, rolling reserve, negative option, and merchant of record are exactly the entity-establishment surface these pages should own, and the site's glossary does not currently cover any of them at that specificity. Three problems with the execution.

**Problem A: the canonical DefinedTermSet already exists and does not contain these terms.**

`/glossary` emits a `DefinedTermSet` at `${URL_CANONICAL}#termset` with 32 terms, each at `#<slug>`, from `src/lib/glossary/terms.ts`. The gaming draft plans DefinedTerm nodes "(inDefinedTermSet, site glossary)". If we emit `inDefinedTermSet` pointing at `/glossary#termset` for terms that set does not contain, we create dangling references across the entity graph, which is precisely the "dead schema" failure in the risk register.

Terms proposed across the three drafts that do **not** exist in the glossary: MCC 4722, MCC 7995, MCC 5816, MCC 5968, VAMP ratio, negative option billing, merchant of record, future-delivery risk, VIRP, ARC accreditation, TASF, chargeback monitoring program.

The right sequence: add them to `src/lib/glossary/terms.ts` first, let `/glossary` become their canonical home, and have the article pages reference them by `@id`. That converts a schema-hygiene chore into a genuine entity-establishment win, and it is the single highest-leverage GEO action in this whole batch.

**Problem B: "Rolling reserve" collides with an existing term and is defined three different ways.**

The glossary already has `slug: "reserve"`, term "Reserve", with `alternateNames: ["merchant reserve", "rolling reserve", "capped reserve"]`. Minting a new standalone "Rolling reserve" DefinedTerm creates a second node competing with `/glossary#reserve` for the same concept.

Worse, the three drafts each define it differently in body copy:

- Gaming: "a percentage of each settlement the acquirer holds back for a defined window (commonly measured in months) as a cushion against future chargebacks, released on a rolling schedule as the window ages out"
- Travel: "a percentage of each settlement your acquirer holds back for a fixed window, then releases on a rolling basis"
- Nutra: "a percentage of your daily settled volume the acquirer holds back, usually for a defined window, as a cushion against future chargebacks and refunds"

Three same-domain definitions of one term is the multi-source-consensus problem in miniature. Pick one canonical wording, host it at `/glossary#reserve`, and let all three articles use that exact sentence in body copy. The variation buys nothing and costs consensus.

**Problem C: some proposed DefinedTerm descriptions have no visible on-page text.**

Schema must mirror what a human can read on the page. Two clear misses:

- Nutra plans a DefinedTerm "Negative option billing" described as "a billing arrangement where the customer's silence or inaction is treated as consent to recurring charges." That sentence appears nowhere in the article. The section named after the term never defines it.
- Nutra plans "Chargeback monitoring program" described as "card-network programs, Visa VAMP and Mastercard ECM, that identify and penalize merchants exceeding dispute thresholds." Also not present as a visible sentence.
- Travel plans "Future-delivery risk" and optional "ARC accreditation" / "TASF" DefinedTerms. Future-delivery risk appears only as a bolded lead-in followed by narrative, never as "Future-delivery risk is...". TASF is mentioned once in a parenthetical caveat, which is too thin to define at all. Drop TASF, or write it a real sentence.

Terms that **do** have proper on-page definitions and are ready to ship: MCC 4722 (travel), MCC 5816 / 7995 (gaming), VAMP ratio (nutra: "reported fraud (TC40) plus non-fraud disputes, divided by settled card-absent transactions"), MCC 5968 (nutra), merchant of record (travel, in the agency-model section, though it needs the entity-first rewrite from finding 1 to become a clean single sentence).

**Missing definitional H2s an answer engine would want:**

- **MATCH list.** Named three times in gaming and twice in nutra as a load-bearing consequence ("near-automatic decline", "the industry blacklist that follows the business owner"), never defined in its own right. "What is the MATCH list" is a high-volume definitional query in this niche and the site is well placed to own it. Strong candidate for a glossary term plus a short definitional block.
- **VAMP.** Used as a load-bearing acronym in gaming and nutra, expanded parenthetically, never given a definitional sentence in gaming at all. Nutra does it properly. Gaming should match.
- **Interchange-plus** in gaming: mentioned once with an inline gloss, and the glossary already has `interchange-plus`. Just link it.
- **Friendly fraud** in gaming: named ("The industry calls this friendly fraud (or family fraud)") and well illustrated, but never defined as a term. Cheap addition, and it is one of the more-searched definitional queries in the chargeback space.

---

## 4. Internal links and llms.txt

**Pillar up-link: present in all three.** Confirmed:
- Gaming links `/insights/high-risk-payment-processing-guide` in the "why banks put gaming in the high-risk bucket" section.
- Travel links it in the intro.
- Nutra links it at the end of "Why Nutraceuticals Are Classified High-Risk".

**Sibling cross-links: present in all three**, and reciprocal. Gaming links travel and nutra; travel links gaming and nutra; nutra links gaming and travel (twice). Good triangle, correct instinct.

Caveat: those sibling links point at the **new** slugs. If the travel/nutra collision is resolved by keeping the old slugs (resolution 1 above), all sibling links in all three drafts break on day one. Whatever routing decision gets made has to be applied to the link targets in all three drafts before publish, gaming included.

**CTA target is wrong in all three.** Every draft sends the reader to `/`:
- Gaming: "take our matching quiz at [myPayAdvisor](/)"
- Travel: "[take our matching quiz](/)"
- Nutra: "Take the [matching quiz](/)"

The quiz lives at `/quiz`. `/about/barak` itself links to `/quiz` as the "intake quiz". Also, gaming's anchor text is "myPayAdvisor" on a link described as a matching quiz, which is both a poor anchor and a self-referential brand link to the homepage. Fix the target on all three and the anchor on gaming.

**Missing internal links worth adding.** None of the three link to the most relevant existing pages, which leaves topical overlap without a canonical signal:
- `/insights/reserves-frozen-funds-capped-vs-rolling` is the site's canonical reserve page, and all three drafts have a rolling-reserve section that does not link to it. This is the clearest miss.
- `/insights/subscription-merchant-account` overlaps nutra's continuity-billing section heavily.
- `/glossary` is not linked from any of the three, despite all three proposing glossary terms.
- `/research/methodology` is not linked from any of the three. The site has one and it carries Speakable. Any page making original numeric claims should point at it.

**llms.txt: manual, and it must be updated at publish.** `public/llms.txt` is a static file with a hand-maintained curated list under "## High-risk merchant accounts (canonical answers)". It carries a visible `_Last updated: 2026-05-30_`. There is no build step that picks up new `/insights/` pages, so:

1. Add a gaming entry to the "High-risk merchant accounts" section with a 60 to 80 character description in the established style.
2. For travel and nutra, **edit the existing entries in place** rather than adding new ones, or you get two entries per vertical inside the curated file that is supposed to be the disambiguation layer.
3. Bump `_Last updated:_`.
4. `src/app/llms-full.txt` is a route, so confirm whether it enumerates dynamically or from a fixed list before assuming the new bodies land in the full corpus.

Separately, this is worth a follow-up outside this review: llms.txt being static is a standing risk for every future publish. Automating it (skill `05-llms-files-automation.md`) removes a recurring manual step that will eventually be forgotten.

---

## 5. Factual risk: untagged claims the drafts' own [VERIFY] lists miss

The [VERIFY] discipline in all three drafts is genuinely good. Blocked fetches are declared, secondary sources are labelled as secondary, and the compliance-notes blocks are the right instinct for a Visa TPA referral entity. What follows is what slipped past those lists.

### Cross-draft contradiction on VAMP enforcement (highest factual risk in the set)

- **Gaming** states that crossing the VAMP threshold means "per-transaction enforcement fees apply, **with no warning tier**."
- **Nutra** states that merchants identified as Excessive face "$8 per fraudulent or disputed transaction, **with a three-month grace period on first identification**."

Read together these contradict each other. Both may be technically reconcilable (VAMP removed VDMP's separate warning tier while retaining a first-identification grace period), but no reader or model will do that reconciliation. They will see two same-domain pages disagreeing about whether there is a grace period. Pick one accurate wording and use it identically on both pages. Gaming's "no warning tier" is untagged; nutra's grace period is tagged. Verify once, apply twice.

### Cross-draft inconsistency on the VAMP region list

- Gaming: threshold tightened "in the US, Canada, the EU, APAC and LATAM."
- Nutra: "for the US, Canada, EU, and APAC." LATAM omitted.

Same fact, same date, two different scopes. Trivial to fix, and exactly the kind of small inconsistency that erodes the consistency signal. Neither is tagged.

### Mastercard ECM stated at two levels of precision

- Gaming: "triggers at 100+ monthly chargebacks combined with a 1.5% ratio, escalating to its high-excessive tier at 300+ and 3%."
- Nutra: "100-299 chargebacks in a month combined with a chargeback ratio of 1.5%-2.99%, **sustained for two consecutive months**; 300+ chargebacks at a 3%+ ratio moves you to High Excessive."

Nutra's is the fuller and more accurate statement. Gaming drops the two-consecutive-months qualifier, which materially changes what "triggers" means. Align gaming to nutra's wording.

### Untagged: Stripe's restricted-businesses categories quoted verbatim (travel)

Travel quotes Stripe's published list directly and repeatedly: "Commercial airlines and cruises," "International (cross-border) charter and private airlines," "Timeshare services" as prohibited, "Travel reservation services and clubs" as restricted, all under Stripe's heading of businesses that "might pose elevated financial risk." It appears twice, in the body and again in FAQ 1.

This is the page's central differentiator and it carries no [VERIFY] tag. Two risks: Stripe revises that page without notice, and we are a payments advisory publicly characterizing a named competitor's prohibition policy in quotation marks. If the categories shift, the quote becomes a misstatement about a named third party on a page that ranks for it. Add an accessed-date inline ("as published on Stripe's restricted businesses page, accessed [date]") and re-verify at publish. Cheap insurance on the strongest claim in the draft.

The related Square gap **is** correctly tagged (VERIFY 2). Good catch by the writer.

### Untagged: Host Merchant Services (gaming)

Gaming states "Providers like PayKings and Host Merchant Services also publish gaming programs we could not verify in detail at write time." PayKings appears in SOURCES as search-level-only (fetch blocked 429). **Host Merchant Services appears nowhere in the SOURCES list at all.** So the draft asserts that a named company publishes a gaming program with no source of any kind behind it. Either source it or drop the name. Travel has the same shape of sentence but handles it better, since it explicitly says the exclusion is "not because of any negative finding."

### Untagged: California ARL specifics (nutra)

Nutra states, in body copy, that California's amended ARL (AB 2863, effective July 1, 2025) "extends full disclosure, affirmative-consent, and click-to-quit cancellation requirements to free-to-paid conversions, requires annual renewal reminders, and requires you to keep consent records for at least three years." Cooley and KTS are in SOURCES but there is no inline attribution and no [VERIFY] tag. These are specific legal-compliance requirements stated as fact by a payments advisory. Add inline attribution ("per Cooley's summary of the amendments") or a tag. The bill number and effective date check out; the itemized requirements are what need the attribution.

Adjacent, same paragraph: "Colorado, Minnesota, New York, and **most other states** have their own versions." The named three are fine; "most other states" is an unsourced quantifier attached to a legal claim. Either source the count or soften to "many states."

### Untagged, lower severity

- Nutra: "listings expire after five years" (MATCH). Standard and correct, but unsourced.
- Nutra: "A merchant doing 20,000 transactions a month hits the Visa threshold at 300 combined fraud-plus-dispute events." This is our own arithmetic (20,000 x 1.5%). The derivation is visible in the sentence so it is not misleading, but per `ensureProvenance` an original number should be framed as ours. It is also, for what it is worth, the single most citable concrete number in the nutra draft, so it is worth framing well.
- Nutra: MCC 5968 "an MCC that acquirers themselves treat as high-risk regardless of what is being sold" rests on a single secondary SERP source (pxp.io).
- Gaming: "a prior MATCH listing on any principal is a near-automatic decline" is stated as fact; it reads as operator experience. Either attribute it to Barak as an expert quote (which would also fix the missing Quotation schema, see below) or soften.
- Travel: "Processors with several bank relationships (Durango and Easy Pay Direct both advertise this model)" re-asserts the EPD claim in body copy, outside the tagged table row where the 403 caveat lives.

### Editorial-instruction leak in published body copy (nutra)

Nutra, rolling reserves section: *"New nutra accounts asking for zero reserve on day one read as inexperienced, and, **per the differentiation rule of this category**, that is not the bank being predatory; it is the bank pricing a category whose loss curve it has seen before."*

"Per the differentiation rule of this category" is an internal editorial instruction that leaked into the prose. It is meaningless to a reader, and if a model lifts that sentence it repeats a phrase that reveals machine authorship. Remove the clause. The sentence works without it.

### Durango figure mislabelled in the nutra compliance block

Nutra compliance note 1 lists Durango's "monthly minimums of $15-$60." Gaming and travel both list $15 to $60 as **monthly fees** and reserve **monthly minimums** for the $5,000 US / $50,000 international figures. Nutra has conflated two different published numbers from the same source. It sits in the compliance block rather than the body, so it is not a live citation risk, but it means legal review would be reviewing a mislabelled third-party figure. Correct it before the block goes to review.

### What is factually solid and worth protecting

Travel's ARC sourcing is the best work in the batch: primary-source PDF, direct quotation, correctly attributed, and it supports the page's genuine information gain (agency model versus merchant of record). Nutra's FTC negative-option timeline is precise, correctly attributed to Gibson Dunn, and correctly tagged for a docket re-check at publish. Gaming's MCC treatment is sourced to Visa's own Merchant Data Standards with secondary cross-checks. The pricing discipline across all three is strong: every figure is a named third party's published number, never framed as ours, which is the right posture for a TPA referral entity.

---

## 6. Consistency across the three drafts

**Consistent, and good:**
- Same schema plan shape (Article + reviewedBy Barak + FAQPage + BreadcrumbList + DefinedTerm + Speakable).
- Same author/reviewer model (Organization author, Person reviewer). Matches the shipped pattern, no byline contradiction.
- Same CTA shape ("take the matching quiz, Barak reviews your shortlist"), same promise.
- Same table construction: provider, published fit, reserve approach, published approval speed, notable, with "not published" in gaps and an explicit "this is a map, not a ranking" disclaimer. This is a good, honest, citable pattern. Keep it.
- Same COMPLIANCE NOTES block structure.
- Same word-count discipline. Measured: gaming 2,770, travel 3,090, nutra 3,091. All at or above stated targets.
- Zero em-dashes across all three. Zero banned words (the only hits for "elevate" are inside the direct Stripe quotation "might pose elevated financial risk", which is correct to leave).

**Inconsistent, needs fixing:**
- **VAMP grace period / warning tier.** Direct contradiction. See finding 5.
- **VAMP region list.** LATAM present in gaming, absent in nutra.
- **Mastercard ECM precision.** Gaming drops nutra's two-consecutive-months qualifier.
- **Rolling reserve definition.** Three different wordings for one term proposed as one DefinedTerm.
- **Byline format.** Travel: "*By myPayAdvisor. Reviewed by [Barak Bachar](/about/barak). Barak has negotiated processing terms for high-risk merchants.*" (italic, linked, names the author). Gaming and nutra: "**Reviewed by Barak Bachar.** Barak has negotiated..." (bold, unlinked, no author line). Travel's version is correct and should be the standard. An unlinked expert name is a wasted entity signal on the pages where the named-expert strategy lives.
- **Verdict block.** Gaming and nutra both have a `## The verdict` H2. Travel buries its verdict as a bolded paragraph inside the "Merchant Size" H2. Travel loses both a citable verdict passage and a second Speakable target. Promote it to its own H2.
- **Lead block markup.** Three different descriptions of the Speakable target. Standardize on a `.lead-answer` class.
- **Durango monthly fees vs monthly minimums.** See finding 5.
- **Sibling link targets.** All point at new slugs, which may not survive the collision resolution.

**No contradictions found** on: Durango's rate ranges (1.95% to 4.95%, $0.15 to $0.25 auth, 0% to 10% reserve) which are stated identically in all three; Corepay's blended 2.95% claim; the 1.5% VAMP threshold value itself; the April 1, 2026 effective date; the Soar Payments trial-offer ban; the general "reserves are negotiable with processing history" framing.

---

## 7. Missing: named-expert quotes

Not requested in the review brief, but it is a gap against this agent's `ensureExpertQuote` gate and against the site's entire named-expert strategy, so it belongs here.

All three drafts name Barak in the byline and in the CTA, and none of them quote him. There is no `<blockquote>` and no `Quotation` schema planned in any of the three.

This is the clearest unforced miss in the batch. Each draft already contains at least one sentence that is obviously operator opinion rather than sourced fact, and each would be stronger and safer as an attributed quote:

- Gaming: "a prior MATCH listing on any principal is a near-automatic decline" (currently an untagged factual assertion; as a Barak quote it becomes attributed expert opinion, which fixes finding 5 and adds a citation surface simultaneously).
- Gaming: "Reserves are the single most negotiable term in a gaming merchant agreement."
- Travel: "travel is not unbankable, it is mispriced by default" (already the sharpest line in the set, currently unattributed).
- Nutra: "the more your offer relies on the customer not noticing the next charge, the worse your approval odds."

One substantive quote per page, over 20 words, opinion-bearing, wrapped in `<blockquote cite="/about/barak">` with `Quotation` JSON-LD pointing at `BARAK_PERSON_ID`, converts three unattributed assertions into three attributed expert positions. It also gives the off-site programme (Featured, Qwoted, LinkedIn) direct quotable material to reuse under the same name, which is how co-citation compounds.

Requires Barak's actual sign-off on the wording. Do not invent quotes.

---

## Prioritized fix list

### P0 (must fix before publish)

1. **Resolve the duplicate-page collision.** Decide routing for travel (`/insights/travel-merchant-account` exists) and nutra (`/insights/nutra-supplement-merchant-account` exists). Recommended: merge new body into the existing slug. Then apply the decision to the sibling links in all three drafts, gaming included. Requires Assaf. Blocks travel and nutra entirely.
2. **Reconcile VAMP across gaming and nutra.** One wording for the grace period / warning tier question. One region list. Verify once against a current source, apply to both pages identically.
3. **Align Mastercard ECM.** Gaming adopts nutra's fuller statement including the two-consecutive-months qualifier.
4. **Fix the DefinedTerm plan.** Add the new terms to `src/lib/glossary/terms.ts` first so `/glossary` is their canonical home; reference by `@id` from the articles. Do not emit `inDefinedTermSet` into a set that lacks the term. Do not mint a second "Rolling reserve" node competing with the existing `/glossary#reserve`; pick one canonical rolling-reserve sentence and use it verbatim in all three bodies. Drop or properly define the DefinedTerms whose descriptions have no visible on-page text (negative option billing, chargeback monitoring program, future-delivery risk, TASF).
5. **Add ItemList to all three schema plans**, matching the shipped firearms construction (`ItemList → SoftwareApplication → Offer → PriceSpecification` with description-only, no numeric price). The processor table is the highest-value citation surface on these pages and is currently invisible to machines.
6. **Entity-first openers** on the flagged sections: gaming's iGaming-vs-video-games, approval checklist, and merchant-size H2s; travel's agency-model-vs-merchant-of-record (do this one first, it is the page's differentiator), aggregator-termination, checklist, and merchant-size sections; nutra's negative-option, chargeback-monitoring, and checklist sections. One definitional sentence each. Copy the pattern from travel's MCC 4722 H3.
7. **Add accessed-date and re-verify the Stripe restricted-businesses quotes** in travel (body and FAQ 1). Untagged verbatim quotation of a named third party's policy on the page's central claim.
8. **Remove the "per the differentiation rule of this category" instruction leak** from nutra's rolling-reserve section.
9. **Source or drop Host Merchant Services** in gaming. Currently named as publishing a gaming program with no source anywhere in the draft.
10. **Update `public/llms.txt` at publish.** It is a static hand-maintained file. Add gaming; edit the existing travel and nutra entries in place rather than adding duplicates; bump `_Last updated:_`. Confirm whether `src/app/llms-full.txt` enumerates dynamically before assuming the new bodies enter the full corpus.

### P1 (should fix)

11. **Fix the CTA target** on all three: `/` becomes `/quiz`. Fix gaming's anchor text ("myPayAdvisor" becomes "matching quiz").
12. **Use the full `BARAK_PERSON_SCHEMA`** for `reviewedBy` rather than a bare `@id` + `name`. Nothing in it is invented; it already ships on `/about/barak`.
13. **Expand `BARAK_AREAS`** in `src/data/personas/barak.ts` to cover the new verticals (gaming/iGaming, travel, nutraceutical, continuity billing, chargeback monitoring). One edit, benefits every page carrying his `knowsAbout`.
14. **Standardize the byline** to travel's linked format on all three: author line, linked reviewer name, credential sentence.
15. **Standardize the lead-block markup** on a `.lead-answer` class across all three, with matching `cssSelector` in each Speakable node.
16. **Promote travel's verdict** to its own `## The verdict` H2, matching gaming and nutra, and add it as a second Speakable target on all three.
17. **Add inline attribution to the California ARL specifics** in nutra, and soften or source "most other states."
18. **Add one named-expert quote per page** with `Quotation` schema, pending Barak's sign-off. Use it to convert the currently-unattributed operator assertions (gaming's MATCH claim especially) into attributed opinion.
19. **Add the missing internal links**: `/insights/reserves-frozen-funds-capped-vs-rolling` from all three reserve sections, `/insights/subscription-merchant-account` from nutra's continuity section, `/glossary` from all three, `/research/methodology` from any page making original numeric claims.
20. **Correct the Durango monthly-fees / monthly-minimums mislabel** in nutra's compliance block before it goes to legal review.
21. **Verify the "Barak will review your shortlist" promise** is operationally true. It appears three times as an unconditional commitment; `/about/barak` says "He takes a limited number of merchant calls per week." Either soften the CTA or confirm the capacity.

### P2 (nice to have)

22. **Add definitional coverage for MATCH list** (all three reference it as a consequence, none defines it) and **friendly fraud** (gaming names it, does not define it). Both are high-value definitional queries the site is well placed to own. Glossary terms plus a short on-page definitional block.
23. **Give VAMP a proper definitional sentence in gaming**, matching nutra's treatment.
24. **Link `interchange-plus` to the existing glossary term** in gaming.
25. **Grow FAQ blocks from 5 toward 8** per page. Each addition is a discrete new query at near-zero writing cost. Not a regression as-is; the shipped firearms page runs 4.
26. **Frame nutra's 20,000-transactions / 300-events calculation** explicitly as a myPayAdvisor calculation.
27. **Source MCC 5968's "acquirers treat as high-risk"** claim beyond the single secondary SERP source.
28. **Nutra draft has two H1s** in the file ("# ARTICLE BODY" then the real H1). Draft-structure artifact; ensure only one H1 renders.
29. **Automate llms.txt generation** (skill `05-llms-files-automation.md`). Static file plus manual publish step is a standing risk on every future publish, not just this batch.
30. Unrelated to these drafts, noticed while verifying: `src/app/(public)/about/barak/page.tsx` line 15 builds its metadata title with an em-dash (`${BARAK_NAME} — ${BARAK_TITLE}`). Violates the standing no-em-dash rule on a page that ships in every SERP and social preview for the named expert.

---

## Approval-gate readiness

After the P0 list is cleared, **gaming is ready for Assaf's approval gate.** It is net-new, non-colliding, structurally the strongest of the three, and its P0s are all mechanical.

**Travel and nutra are not ready and cannot be made ready by editing alone.** P0-1 is a routing decision only Assaf can make. Once that decision exists, both drafts clear their remaining P0s quickly, and both should ship, because the content is a clear upgrade on what is live today. Travel's ARC primary sourcing in particular is the kind of material that earns citations the current page cannot.

Recommended sequence: take the routing decision first, apply it to sibling links across all three, then clear P0-2 through P0-10 as one batch, then gate all three together so the cross-set consistency fixes get verified against each other rather than one at a time.

**Post-publish, per the playbook:** re-probe at +14d against the gaming, travel, and nutra query families, and log deltas to `04-knowledge/skills/geo-architect/playbooks/mypayadvisor.md`. The interesting measurement here is not whether the new pages get cited. It is whether resolving the travel and nutra duplication moves the citation rate on those two verticals specifically, which would be the first clean read this portfolio has on same-domain entity dilution as a citation suppressor. That is a promotable pattern if it holds.

# myPayAdvisor - Pre-Publish Compliance Review: Three High-Risk-Vertical Drafts

**Date of review: 2026-08-19**
**Reviewer: legal-counsel agent (internal). Scope: three Wave-2 drafts + the /calculator surface.**

> **THIS IS NOT LEGAL ADVICE.** I am not a licensed attorney. What follows is an internal
> compliance gap-analysis, risk-ranked by realistic enforcement exposure. Every binding
> question - final wording, network-rule interpretation, the sweepstakes question, the
> referral-agreement questions - is listed in the `needs-counsel` section at the end and
> must be signed off by a licensed attorney before it is relied on.

---

## 0. Headline (read this if you read nothing else)

**The pricing compliance work on these three drafts is good, and the thing Assaf is worried
about is not the thing that is going to cause a problem.**

- **20 enumerated pricing claims across the three COMPLIANCE NOTES blocks: 15 GREEN, 5 YELLOW, 0 RED.**
  Not one pricing claim in any of the three drafts is a Visa TPA problem. The attribution
  discipline (third-party published number + named source + inline link + never "our rate")
  is the correct pattern and it holds up.
- **The two genuinely serious findings are not in the drafts at all.** They are:
  1. **`/calculator` publishes a substantiation claim in FAQ schema that the code does not implement** (CRITICAL).
  2. **The site's Terms and its footer/article disclosures directly contradict each other** on whether
     compensation influences rankings (HIGH). One of the two is false on its face.
- **One element in one draft is a genuine hold-for-counsel item**, and it is not about pricing:
  the gaming draft's **sweepstakes** framing, against New York's Racing Law §912 (S5935A, signed
  2025-12-05), which reaches **"media affiliates"** and **"payment processors"** that support online
  sweepstakes games. myPayAdvisor is a media property that refers merchants to payment processors.

---

## 1. Visa TPA: re-researched, with the primary source

### 1.1 What the rule actually says (verbatim)

Fetched **2026-08-19** from Visa's own hosted PDF:
`https://usa.visa.com/content/dam/VCOM/download/merchants/tpa-registration-program-faqs.pdf`
Document title: *Third Party Agent Registration Program Frequently Asked Questions, U.S., Canada and
Latin America & Caribbean Regions.* Page footer: **"© Visa. All Rights Reserved. May 2016"**.

Under the heading **"Is registration required for sub-ISOs?"**:

> "ISO registration is required for any entity that solicits on behalf of a Visa client. An ISO is
> any entity that solicits merchant or cardholder accounts, discusses pricing, fees or rates,
> processes merchant or cardholder accounts, discusses terms and agreements, manages and /or drafts
> contracts, submits contracts to the acquirer or issuer (their registering client bank). A
> registered ISO may use referral entities or sales representatives to solicit on their behalf;
> however, those entities may only solicit and market in the name of the registered ISO. Acquirers
> must not process applications from any entity that they have not registered as an ISO with Visa.
> **Registration is not required for referral entities or sales representatives that solicit in the
> name of the registered ISO. Referral entities or sales representatives who market in their own
> name may only generate leads to registered ISOs and may not provide ISO services such as direct
> solicitation of merchant or cardholder accounts, discuss pricing, fees or rates, process merchant
> or cardholder accounts, discuss terms and agreements, manages / draft contracts, submit contracts
> to an acquirer or issuer.**"

### 1.2 The four things that actually matter about that text

**(a) It is a network rule, not law.** There is no statute, no regulator, and no private right of
action behind it. The enforcement chain is Visa → acquirer → registered ISO → your referral
agreement. The realistic worst case is **commercial**: a partner terminates the referral
agreement, or an acquirer demands the site register as an ISO, or Visa fines the acquirer and the
acquirer passes it down by indemnity. Nobody gets sued in a class action over this. That is why
this whole topic belongs at **MEDIUM**, not CRITICAL - and why it should not be consuming the
compliance budget that `/calculator` and the disclosure contradiction deserve.

**(b) The operative constraint is your referral agreement, not this FAQ.** Referral/partner
agreements with Corepay, Durango, and Easy Pay Direct almost certainly incorporate network rules
by reference **and add stricter marketing-approval clauses of their own** (pre-approval of
marketing collateral, prohibitions on rate representation, name-use restrictions). Those contracts
are the binding document. This FAQ is the floor, not the ceiling. → `needs-counsel`.

**(c) Structurally, the restriction describes account-specific sales acts, not publishing.**
The list is prefaced by "may not provide **ISO services such as**", and every enumerated item is a
bilateral act performed with or for a specific merchant in the boarding chain: *direct solicitation
of merchant accounts · **discuss** pricing, fees or rates · **process** merchant accounts ·
**discuss** terms and agreements · manage/draft contracts · submit contracts*. Read together
(*ejusdem generis*), "discuss pricing, fees or rates" is the sibling of "discuss terms and
agreements" and "draft contracts" - it describes the sales conversation, not the newsstand.
"Discuss" is a two-party verb. Publishing a page to the world is not discussing anything with a
merchant. The framing sentence confirms it: the whole passage is about entities that **"solicit on
behalf of a Visa client."** A publisher reporting what Durango puts on Durango's own website is not
performing an ISO service for a Visa client.

**(d) The document is ten years old and Visa still hosts it.** May 2016. That is well past the
staleness line for anything being used as a compliance boundary. The operative current text is the
**Visa Core Rules and Visa Product and Service Rules** (current edition) plus the Visa Rules'
registration sections, which are **not fully public** - I could not verify from public sources that
the May 2016 FAQ language survives unchanged in the current Rules. An attorney with Visa Rules
access, or your acquirer/ISO partner, must confirm. → `needs-counsel`.
Separately: **Mastercard runs a parallel registration regime** (Mastercard Registration Program /
Service Provider registration) that was not researched here and may not draw the line in the same
place. → `needs-counsel`.

### 1.3 Where the line actually sits - the answer to the narrow question

| Conduct | Inside or outside the restriction | Confidence |
|---|---|---|
| Republishing a third party's **own published** price list, with attribution + link, in editorial content addressed to the world, quoting no number of your own and making no representation about what any specific reader will pay | **Outside.** This is reporting, not discussing. | High |
| Publishing a general market statement in your own voice ("high-risk pricing runs above retail") with no source | **Grey, low risk.** Not merchant-specific, but it is you speaking about rates rather than reporting them. Cheap to fix by attributing. | Medium |
| A tool on your domain that **generates its own rate figures** and presents them to a specific user as what that user will pay | **Approaching the line.** This is the site originating a rate representation to an identified prospect. | Medium |
| Barak, on a 1:1 call with a matched lead, discussing what rate the merchant should expect, or reviewing/negotiating a term sheet | **Inside.** This is "discuss pricing, fees or rates" and "discuss terms and agreements" in the most literal sense the sentence has. | High |

**So: the three articles are the safest surface on the site.** The exposure is at the bottom two
rows of that table - `/calculator` and the advisor call - neither of which was what I was asked to
look at. That inversion is the single most useful output of this review.

---

## 2. Claim-by-claim risk ranking

Legend: **GREEN** publish as-is · **YELLOW** publish with the exact edit given · **RED** hold for a licensed attorney.

### 2.1 Gaming draft - pricing claims (notes 1-7)

| # | Claim | Verdict | Reasoning / exact edit |
|---|---|---|---|
| 1 | PaymentCloud 1.5%-3.5% + $0.10-$0.30, attributed | **GREEN** | Third-party published, named, linked. Textbook. |
| 2 | Corepay "as low as a blended 2.95%", waived fees | **GREEN** | Draft says Corepay *"advertises"* it. Correct framing - the teaser is reported, not adopted. |
| 3 | Durango full ranges (1.95%-4.95%, $0.15-$0.25, $15-$60, 0%-10%, minimums) | **GREEN** | Same pattern. This is the strongest example in all three drafts. |
| 4 | VAMP $8/transaction + 3-month grace (Chargeback Gurus); thresholds vs Visa fact sheet | **GREEN** | These are **network penalties**, not merchant pricing - not a TPA issue at all. Secondary sourcing is disclosed in-line. |
| 5 | VIRP fees exist, no amount stated | **GREEN** | Correct call. Do not add the number until it is pinned to a primary source. |
| 6 | "Zero 'our rates' language" | **YELLOW** | True as drafted - I verified it. **But** one sentence undercuts it: *"(What that markup should be is a term to negotiate with the processor; as a referral advisory, we do not quote rates.)"* Two problems: it publicly commits to a posture the advisor call must then match, and it half-explains a regulatory constraint in a way that invites the question. **Exact edit - replace with:** `(What that markup should be is a term to negotiate directly with the processor.)` |
| 7 | "High-risk gaming pricing runs above low-risk retail card-present pricing" | **YELLOW** | Two issues. First, **I could not locate this sentence verbatim in the body** - the COMPLIANCE NOTES block should be a true index of the body text, and here it lists a claim the body may not make. Reconcile it. Second, if the sentence is added, attribute it. **Exact edit:** `The published ranges above sit above typical card-present retail pricing.` |

**Gaming pricing: 5 GREEN / 2 YELLOW / 0 RED.**

### 2.2 Travel draft - pricing claims (notes 1-6)

| # | Claim | Verdict | Reasoning / exact edit |
|---|---|---|---|
| 1 | "3 to 5x higher than traditional retail" (Durango) | **GREEN** | Attributed inline to Durango by name. |
| 2 | "$1,000 to $8,000 bookings very common" (Durango) | **GREEN** | Attributed. |
| 3 | Durango published ranges | **GREEN** | Attributed. |
| 4 | PayCompass "typically between 3% and 5%" | **GREEN** | Attributed. |
| 5 | MCC 4722 merchants face higher card-acceptance costs | **YELLOW** | This is the site making an **interchange-cost** claim on secondary sourcing (Rapyd et al.), with an unresolved `[VERIFY]`. Interchange is the one pricing topic where a wrong published claim is both checkable and embarrassing. **Exact edit - replace the second reason with:** `Second, it is how the card networks and your acquirer categorize your transactions, which feeds the interchange treatment your account receives.` (Drops the unsourced cost comparison, keeps the point.) |
| 6 | Reserve **structures** + negotiation levers, no myPayAdvisor terms | **GREEN** | Explaining what a rolling reserve *is* and which levers exist is education, not a rate discussion. This framing is on the right side of the line and it is the model to copy. |

**Travel pricing: 5 GREEN / 1 YELLOW / 0 RED.**

### 2.3 Nutra draft - pricing claims (notes 1-7)

| # | Claim | Verdict | Reasoning / exact edit |
|---|---|---|---|
| 1 | Durango ranges on nutra page | **GREEN** | Attributed. |
| 2 | Corepay "as low as 2.95%" | **GREEN** | Attributed. |
| 3 | VAMP $8 + grace period | **GREEN** | Network penalty, disclosed secondary sourcing. |
| 4 | Mastercard ECM/HECM fines "$1,000 up to $200,000+" | **YELLOW** | **Inconsistent with the gaming draft, which deliberately dropped the dollar figures and went qualitative.** Here the numbers rest on a low-authority secondary source (legalclarity.org) and carry an unresolved `[VERIFY]`. **Exact edit - replace with:** `Published program summaries describe fines that escalate the longer a merchant stays in the program, plus possible MATCH listing, which is the industry blacklist that follows the business owner, not just the business.` (Matches the gaming draft's treatment exactly.) |
| 5 | "Runs above standard low-risk card rates" | **YELLOW** | Same as gaming #7 - site speaking in its own voice about rate levels. **Exact edit:** `The published ranges above sit above standard low-risk card rates.` |
| 6 | Reserves negotiable with history (Durango's own position) | **GREEN** | Attributed to what the processor publishes. |
| 7 | Never quotes a rate the reader "will" get | **GREEN** | Verified true across the full body. |

**Nutra pricing: 5 GREEN / 2 YELLOW / 0 RED.**

### 2.4 Totals

| | GREEN | YELLOW | RED |
|---|---|---|---|
| Gaming (7 claims) | 5 | 2 | 0 |
| Travel (6 claims) | 5 | 1 | 0 |
| Nutra (7 claims) | 5 | 2 | 0 |
| **All pricing claims (20)** | **15** | **5** | **0** |

---

## 3. Beyond pricing

### 3.1 RED - Gaming draft, sweepstakes (hold for counsel)

**New York Racing, Pari-Mutuel Wagering and Breeding Law §912**, added by **S5935A (Chapter 605),
signed by Gov. Hochul 2025-12-05, effective immediately with no wind-down**, prohibits operating,
conducting, **or promoting** online sweepstakes games (dual-currency games convertible to cash
prizes) - **and extends liability to "financial institutions, payment processors, geolocation
providers, gaming content suppliers, platform providers, [and] media affiliates" that support or
promote them.** Enforcement sits with the NY Gaming Commission and the Attorney General; penalties
run **$10,000 to $100,000**. AG James had already sent cease-and-desist letters to 26 operators on
2025-06-06. Montana (SB 555, effective 2025-10-01) was first to ban; Connecticut, New Jersey and
California followed in 2025, with Indiana, Louisiana, Maine, Nevada, Oklahoma and Tennessee
enacting through 2026.

**Why this touches myPayAdvisor specifically.** The draft (a) lists **"sweepstakes"** among Corepay's
served verticals in the processor table, (b) discusses sweepstakes casinos in the gray-zone
paragraph, and (c) ends every section with a CTA into a matching funnel that routes the reader to a
payment processor. A media property that names a payment processor for sweepstakes operators and
then refers those operators to payment processors is describing, with some precision, the
**"media affiliate" + "payment processor" support chain the statute names.**

This is a **novel, unlitigated theory against a statute roughly eight months old.** I am not going to
resolve it, and neither should Assaf. → `needs-counsel`.

**Interim edit that materially de-risks it (recommended regardless of what counsel says):**
1. **Delete "sweepstakes" from the Corepay row** in the processor table. Corepay's other listed
   verticals carry the row fine.
2. Keep the gray-zone paragraph as a **warning**, and add an explicit carve-out sentence:
   `myPayAdvisor does not match sweepstakes, dual-currency, or social-casino operators with payment providers.`
3. If that carve-out is not true operationally, do not publish it - fix the operation first.

### 3.2 LOW / dropping as marginal - iGaming publisher exposure

There is a real historical precedent for publisher liability here: DOJ's 2003 letters to media
outlets asserting that advertising online gambling could be **aiding and abetting**, culminating in
**Google, Yahoo and Microsoft paying a combined $31.5M in 2007** to settle claims over gambling ad
revenue (1997-2007), and *Casino City v. Ashcroft*, in which a gambling-news publisher's First
Amendment challenge failed on standing.

**I am dropping this as marginal**, and here is why, so the reasoning is on the record: that theory
targeted **advertising unlawful gambling to consumers**. This draft is B2B editorial about merchant
underwriting, addressed to operators, and it repeatedly instructs readers that a license is
mandatory and that miscoding leads to MATCH. It is closer to compliance journalism than to a
gambling ad. **One guardrail:** do not outbound-link to any operator, licensed or not - keep every
external link pointed at processors, networks, and regulators.

### 3.3 Gaming - unresolved `[VERIFY]` markers on load-bearing legal facts (YELLOW)

Seven `[VERIFY]` markers are still live, several **inside body prose and inside a table cell**. Do not
ship with bracketed editor markers visible. More importantly, three of them are legal facts:

- **State counts.** Current research (2026-08): **8 states have legalized online casino / iGaming
  (NJ, DE, PA, MI, CT, WV, RI, ME), with 7 operational - Maine legalized but has not launched.**
  Online **sports betting**: 38 states plus DC and Puerto Rico permit sports betting in some format,
  roughly **30 with online/mobile**. The draft's "licensed in most states" is defensible for sports
  betting; "only a small group of states" is correct for iGaming. **Pin the numbers, cite the
  American Gaming Association's State of the States 2026, and date-stamp the sentence.**
- **Skill-gaming state treatment** and **sweepstakes-restricting states** - resolve or cut the sentence.
- **PaymentCloud "no online gambling" cell** - an unverified negative claim about a named third
  party's policy is the one kind of table cell that can draw a complaint from the company itself.
  Verify on their live page or delete the cell.

### 3.4 Travel - Stripe verbatim quotes (GREEN on copyright, YELLOW on staleness)

**Accuracy: verified independently 2026-08-19.** Stripe's restricted-businesses page (**last updated
2026-05-13**) confirms all four quoted items, and the draft's P0-7 correction is right: **prohibited** -
"Commercial airlines and cruises", "International (cross-border) charter and private airlines",
"Timeshare services"; **restricted** - "Travel reservation services and clubs", under the heading
**"Businesses that might pose elevated financial risk."** The heading belongs to the restricted
section only, exactly as the draft now states.

**Copyright/fair use: GREEN, dropping as marginal.** Short factual category names quoted with
attribution for commentary and criticism is core fair use, and policy category labels are thin
expression at best. **Trademark: GREEN** - naming Stripe, Square et al. in comparative editorial is
nominative fair use.

**The real risk is staleness, not copyright.** Stripe edits this page. The draft already carries
"accessed August 18, 2026" - keep it, and **put a 90-day re-verify reminder on this page**, because a
verbatim quote that goes stale converts from an asset into a false statement about a named company.

### 3.5 Travel - the Easy Pay Direct row (YELLOW)

An entire comparison-table row built from **search snippets** on a page that returned 403, carrying
two `[VERIFY]` markers in user-visible cells. Publishing unverified factual claims about a named
competitor/partner in a comparison table is the highest-friction thing in this draft.
**Recommendation: delete the EPD row** from the travel table (and the EPD row from the gaming table,
same defect) rather than ship `[VERIFY]` to readers. Add them back when the pages are verified
manually. The tables read fine at 4 and 3 rows.

### 3.6 Nutra - FTC health-claim adjacency (GREEN, with one nudge)

**The draft makes no health claims about any product**, and it instructs merchants *not* to make
disease claims. That is the opposite of exposure. FTC's Health Products Compliance Guidance
requires competent and reliable scientific evidence **before** a claim is disseminated - this
article disseminates none.

One nudge: **FAQ 4 discusses GLP-1 supplements** as a bankable category via Corepay's LegitScript
condition. "GLP-1 supplements" is an active FDA/FTC enforcement zone. The draft handles it correctly
(attributed to Corepay's published policy, with the compliance condition attached). Keep it framed
as *what a processor requires*, never as *a category we endorse or route*.

### 3.7 Nutra - Negative Option Rule status framing (GREEN on accuracy, YELLOW on posture)

**Accuracy verified 2026-08-19 and the draft is correct:** the Eighth Circuit vacated the
Negative Option / "click-to-cancel" Rule **in its entirety on 2025-07-08** on Magnuson-Moss
procedural grounds; the FTC sent a draft **ANPRM to OIRA on 2026-01-30**, announced comment period
2026-03-11, **comments closed 2026-04-13**; **no new final rule is in force as of August 2026.**
ROSCA and FTC Act §5 enforcement continued throughout. This is a genuinely well-researched passage.

**California ARL (AB 2863, effective 2025-07-01) - verified**, with one precision fix.
**YELLOW - exact edit:** the draft says *"keep consent records for at least three years."* The
statute's standard is **three years, or one year after the contract is terminated, whichever is
longer.** Replace with: `and requires you to keep consent records for at least three years, or one
year after the contract ends, whichever is longer.`

**Posture (YELLOW).** This section tells merchants how to build a compliant billing flow
("build to the ROSCA-plus-California standard now"). That is regulatory guidance published by a
non-law-firm. Unauthorized-practice exposure against publishers is close to theoretical and the
First Amendment defense is strong, so I am **not** ranking this as real risk - but a disclaimer costs
nothing and this is the one draft of the three that earns it.
**Exact copy to add at the end of the negative-option section:**

> *This is general information about how underwriters read billing flows, not legal advice. Subscription billing rules vary by state and change frequently; have your checkout and cancellation flow reviewed by counsel before you scale.*

### 3.8 Not audited here, and higher-exposure than anything above

Scope note, stated plainly because ranking by real exposure is the job: **this review covered three
drafts and one calculator page. It did not cover the two surfaces where a California-heavy lead-gen
site actually gets sued.**

- **CIPA (Cal. Penal Code §§631/638.51)** - third-party pixels, session replay, and chat widgets on
  the quiz funnel. This is the live California class-action wave, **$5,000 per violation**, and it
  aggregates on traffic volume. A rate-comparison funnel is a textbook target.
- **TCPA** - consent capture on the quiz/lead form, and vicarious liability for what downstream
  processors do with a shared lead. **$500-$1,500 per contact.**

Neither is implicated by these three drafts. Both should get a dedicated pass before spend scales.
I am flagging, not opening, that audit here.

---

## 4. Does `/calculator` change the analysis? (the narrow question, answered)

**On the narrow question: no.** I grepped all three drafts - **none of them links to `/calculator`.**
Their internal links go to `/insights/high-risk-payment-processing-guide`, `/glossary#reserve`, the
two sibling verticals, and `/` (the quiz). There is no link path from these articles into a
rate-discussing surface, so the "surface contamination" theory does not attach through them.

**But the calculator changes the analysis in two ways that matter more.**

### 4.1 CRITICAL - the calculator publishes a substantiation claim its code does not implement

`src/app/(public)/calculator/page.tsx` ships a **FAQPage JSON-LD** block containing:

> "The calculator uses published 2026 rates from Stripe, Square, PayPal, Helcim, Payment Depot, Stax,
> and other major processors, applied to a standard card-mix assumption (60 percent credit, 40 percent
> debit, 30 percent rewards cards). Real merchant statements typically come within 5 to 15 percent of
> the calculator output."

`FeeCalculatorClient.tsx` (lines 52-79) implements **none of that**. It is three hardcoded generic
tiers:

```
low  : inPersonVolume * 0.018 + txn * 0.08   |  onlineVolume * 0.022 + txn * 0.08
mid  : inPersonVolume * 0.026 + txn * 0.10   |  onlineVolume * 0.029 + txn * 0.30
high : inPersonVolume * 0.029 + txn * 0.15   |  onlineVolume * 0.035 + txn * 0.49
```

There is **no per-processor rate table**, **no card-mix variable anywhere in the file**, and nothing
that could produce a "within 5 to 15 percent" accuracy figure. The page `metadata.description`
compounds it: *"see ... what Stripe, Square, Helcim and Payment Depot would each cost you"* - the
tool produces no per-processor output at all.

**Why this is the most serious finding in the review:**
- It is an **unsubstantiated advertising claim about the site's own product**, plus a **quantified
  accuracy claim** ("within 5 to 15 percent") with nothing behind it. FTC Act §5 deception, and
  **California UCL §17200 / FAL §17500** given the traffic profile.
- It sits in **FAQPage JSON-LD**, which means it is structured for verbatim reproduction in Google
  rich results and LLM answers. This is the worst possible place for an unsubstantiated claim: it is
  machine-readable, quotable, and archived.
- On the TPA axis, `/calculator` - not the articles - is the site's actual rate-originating surface.
  If Visa, an acquirer, or a partner ever asks whether myPayAdvisor "discusses pricing, fees or
  rates," **this page is the exhibit.**

**Fix (pick one, do it before these drafts publish - same domain, same reputational surface):**
- **(a) Conform the claim to the code.** Rewrite the FAQ answer to describe what the tool does:
  `The calculator models three common pricing structures - interchange-plus, flat-rate, and premium/tiered - using representative 2026 rate assumptions for card-present and card-not-present volume. It is a directional estimate of pricing-model impact, not a quote from any named processor.`
  **Delete the "within 5 to 15 percent" sentence outright** unless it can be substantiated against
  real statements. **Delete the named processors** from both the FAQ answer and the meta description
  until the tool actually models them.
- **(b) Or conform the code to the claim** - build the per-processor tables and the card-mix model.
  More work, better asset, and it makes the meta description true.

Either way, keep the existing on-page disclaimer (lines 425-432) - it is decent - but it does not
cure a specific, quantified, false methodology claim sitting in schema.

### 4.2 Do NOT add `/calculator` links to these three drafts

This is the non-obvious part. The calculator models **low-risk generic pricing (1.8%-3.5%)**. The
three drafts describe verticals whose published rates run **1.95%-4.95%**, with reserves of 0-10% and
monthly minimums. **Linking the calculator from a gaming, travel, or nutra page would manufacture a
false pricing representation** - telling a nutraceutical merchant their effective rate is 2.6% when
every source on the same page says otherwise. It would also be the site originating a rate figure
for a high-risk prospect, which is the one thing the TPA analysis says to avoid.

**Recommendation: keep the calculator unlinked from all high-risk vertical content, permanently, and
add a note to the content playbook saying why.** If a high-risk calculator is wanted later, it needs
its own tool with its own ranges and its own disclaimer.

---

## 5. Cross-cutting findings (apply to all three drafts)

### 5.1 HIGH - the site contradicts itself on whether compensation influences rankings

| Surface | What it says |
|---|---|
| `src/app/(public)/terms/page.tsx` §3 | compensation **"may influence: The order in which providers appear... The prominence given to certain providers... The recommendations made through our quiz and comparison tools"** |
| `src/components/Footer.tsx` | "This **does not influence** our rankings or recommendations." |
| `comparisons/best-payment-processors-2026` | "We may earn commissions from featured processors, but this **never influences** our editorial integrity or recommendations." |
| several `/insights/*` pages | "This **does not influence** our editorial recommendations." |

**These cannot all be true.** The Terms admit exactly what the footer denies. Whichever statement is
false is a deceptive representation to consumers under FTC Act §5 and Cal. UCL - and the
contradiction is self-proving from the site's own pages, which is the worst kind of finding because
it requires no discovery.

**Fix:** decide which is true, then conform **every** surface to it. If compensation does affect
ordering or quiz output (as Terms says), the footer and the article disclosures must stop claiming
it doesn't. This is a one-afternoon fix and it removes a provable misstatement.

### 5.2 HIGH - the three drafts carry no inline compensation disclosure

Every comparable existing page (`/comparisons/*`, several `/insights/*`) carries an inline
disclosure. **All three of these drafts carry none.** Each one presents a comparison table of
processors the site earns referral fees from, then routes the reader into the lead funnel. FTC
"clear and conspicuous" guidance wants the disclosure **proximate to the recommendation**, not only
in a global footer.

**Exact copy to insert immediately above each processor table in all three drafts** (matches the
pattern already shipped on `/comparisons/stripe-high-risk-alternatives`):

> *Disclosure: myPayAdvisor may be compensated when a merchant we refer opens an account with a provider listed here. Rates and terms are set and quoted per merchant by each provider and its acquiring bank, and should be confirmed in writing before you sign. Every figure in this table is the provider's own published claim, not ours.*

That second sentence does double duty: it is the affiliate disclosure **and** it is the cleanest
possible statement of the referral-entity posture, without the self-characterizing language flagged
in gaming #6.

### 5.3 MEDIUM - the advisor call is the real TPA surface, and the drafts make promises about it

All three CTAs promise a 1:1 review. The travel draft is the most specific: *"Barak will review your
shortlist against your volume, ticket size, and model before you apply anywhere."* Reviewing a
shortlist against volume and model is one conversational step away from discussing terms - and the
gaming draft separately publishes the representation *"as a referral advisory, we do not quote rates."*

**Those two must be reconciled**, because if the published sentence says one thing and the call does
another, the site has made a false statement to consumers **and** created its own evidence of a
network-rule breach. Barak needs a written call boundary (what he may and may not say about rates,
terms, and reserves), and the CTA copy must match it. → `needs-counsel` for the boundary; the CTA
copy follows from the answer.

### 5.4 MEDIUM - COMPLIANCE NOTES blocks must be a true index of the body

Gaming note 7 describes a sentence I could not locate verbatim in the body. That is a small thing
that matters a lot: if these blocks are the artifact a reviewer (or counsel, or a partner) relies on,
they have to match the text. **Before publish, re-walk each block against the final body and confirm
one-to-one.** Strip the blocks, the `[VERIFY]` markers, the `SHIP TARGET` notes, and the `P0 FIX LOG`
from anything that reaches the CMS.

---

## 6. Explicitly dropped as marginal

Cutting noise is part of the job. These came up and are **not** worth effort:

- **Copyright/fair use on the Stripe quotes.** Short factual category names, attributed, for
  commentary. Core fair use. Not a risk.
- **Trademark use of processor names** (Stripe, Square, Durango, Corepay...). Nominative fair use in
  comparative editorial. Not a risk.
- **DOJ aiding-and-abetting theory on gambling content.** Real history, wrong target - that theory
  went after consumer gambling ads, not B2B underwriting editorial. See §3.2.
- **GDPR / cookie-consent walls.** California is an **opt-out** regime. Do not build EU-style opt-in
  cookie banners for a US-market site; it buys nothing and hurts conversion.
- **ADA/WCAG on these three article pages.** Text-and-table content on an existing Tailwind build.
  Nuisance demand-letter tier at worst. Schedule with a normal accessibility sprint; do not hold
  publication.
- **The "Reviewed by Barak Bachar" byline.** Legitimate as long as he actually reviews them. Keep
  the review real and there is no issue.

---

## 7. `needs-counsel` - questions for a licensed attorney

*Forward as-is. Best fit: a payments/bank-card attorney with Visa Rules access, plus a gaming
regulatory attorney for Q5. Q7-Q8 are advertising-law questions.*

1. **Is the May 2016 Visa TPA Registration Program FAQ still the operative statement of the referral-entity restriction?** Visa still hosts this document at `usa.visa.com`, but the current Visa Core Rules and Visa Product and Service Rules are not fully public. Please confirm whether the language - *"Referral entities or sales representatives who market in their own name may only generate leads to registered ISOs and may not provide ISO services such as ... discuss pricing, fees or rates ..."* - survives unchanged in the current Rules, and identify the controlling section.

2. **Does republishing a third party's own published pricing, with attribution and a link, in editorial content addressed to the general public, constitute "discussing pricing, fees or rates" under that restriction?** Our reading is that the enumerated acts are all bilateral, merchant-specific sales services, and that one-way editorial publication falls outside. Please confirm or correct, and tell us where you place the line.

3. **Does an interactive fee calculator on our own domain, which generates our own estimated effective-rate figures for a user who inputs their volume, cross that line?** This is the surface we are most uncertain about, because the figures originate with us rather than with a third party.

4. **What may Barak Bachar say on a 1:1 call with a matched merchant lead?** We need a written boundary. Specifically: may he discuss expected rate ranges, comment on reserve terms, review a term sheet the merchant received, or advise on which offer is better? Please draft the permitted/prohibited script boundary.

5. **Sweepstakes - New York Racing, Pari-Mutuel Wagering and Breeding Law §912 (S5935A, signed 2025-12-05)** extends liability to "payment processors" and "media affiliates" that support or promote online sweepstakes games. **(a)** Does a publisher that names payment processors serving sweepstakes operators, and refers merchants to those processors, fall within "media affiliate" as used in the statute? **(b)** Does our matching/referral service create exposure if a sweepstakes operator uses it? **(c)** Do the parallel statutes in Montana, Connecticut, California, New Jersey, Indiana, Louisiana, Maine, Nevada, Oklahoma or Tennessee reach further? **(d)** Is a published carve-out ("we do not match sweepstakes or dual-currency operators") sufficient, or do we need an operational screen in the quiz?

6. **Do our referral agreements with Corepay, Durango, and Easy Pay Direct impose marketing restrictions stricter than the network rules** - for example, pre-approval of collateral, prohibitions on publishing their rate ranges, or name-use limits? Please review the executed agreements and tell us whether these three articles breach any of them. **Related: does Mastercard's registration regime draw the referral-entity line differently from Visa's?**

7. **Our Terms §3 states that compensation "may influence" provider ordering, prominence, and quiz recommendations, while our site footer and several article pages state that compensation "does not influence our rankings or recommendations."** Please advise on the FTC Act §5 and California UCL exposure from that contradiction, and tell us which formulation we must adopt given how the quiz and rankings actually work.

8. **Our `/calculator` page publishes, in FAQ structured data, that the tool "uses published 2026 rates from Stripe, Square, PayPal, Helcim, Payment Depot, Stax" with a specified card-mix assumption, and that "real merchant statements typically come within 5 to 15 percent of the calculator output." The underlying code implements none of this.** Please advise on §5 / UCL / FAL exposure, on whether the claim must be removed before or simultaneously with these three articles publishing, and on what substantiation we would need to make an accuracy claim of that kind lawfully.

9. **Do we need a "not legal advice" disclaimer on content that instructs merchants how to build ROSCA- and California-ARL-compliant billing flows?** We are a payments advisory, not a law firm.

10. **Scope question for a follow-on engagement:** we have not yet reviewed CIPA exposure (third-party pixels, session replay, chat widgets) or TCPA consent capture on our quiz funnel. Given a California-heavy consumer traffic profile and a shared-lead model, please advise whether that review should precede scaling paid acquisition.

---

## 8. Recommended sequence

1. **Before any of the three publish:** fix `/calculator` FAQ schema + meta description (§4.1). It is
   the same domain and the same reputational surface, and it is the one item that is unambiguously
   an unsubstantiated claim today.
2. **Before any of the three publish:** resolve the disclosure contradiction (§5.1) and add the
   inline disclosure block to all three drafts (§5.2).
3. **Gaming:** apply the sweepstakes carve-out (§3.1), resolve the `[VERIFY]` state counts (§3.3),
   drop the EPD row, apply YELLOW edits #6 and #7. Then it is publishable.
4. **Travel:** apply YELLOW edit #5, drop the EPD row, resolve the remaining `[VERIFY]` items. Then
   publishable.
5. **Nutra:** apply YELLOW edits #4 and #5, the ARL record-retention precision fix, and the
   not-legal-advice line. Then publishable.
6. **Send the `needs-counsel` list** in parallel - nothing above except Q5 blocks publication once
   the edits are applied.
7. **Schedule separately:** the CIPA/TCPA pass (§3.8), and a 90-day re-verify on the Stripe quotes.

---

*Prepared 2026-08-19. Not legal advice. Every rule cited above was re-verified against a current
source on 2026-08-19 and date-stamped; the Visa TPA FAQ's own publication date (May 2016) is itself
a flagged staleness issue, not a verification failure on our part. Re-verify anything in this
document older than roughly six months before relying on it.*

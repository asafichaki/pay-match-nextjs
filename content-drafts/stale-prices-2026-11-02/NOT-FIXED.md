# Stale prices: what this PR leaves for Assaf (2026-11-02)

The sweep matched 70 database rows on 48 pages, plus 38 code files. There were more than 40 rows, so the database body fixes are limited to the top 20 pages by GSC impressions (90 days to 2026-10-31). Every AEO answer block with a stale figure is fixed, whatever the page's impressions. Hit counts below are raw pattern matches and include legitimate figures: Clover and Shopify at 2.6% + 10¢, Stripe T+2, and Clover's 1.75% Rapid Deposit.

## Database article bodies not edited (below the top-20 cut)

| Page | 90d impressions | What the sweep matched |
|---|---|---|
| /comparisons/best-virtual-terminals-2026 | 397 | Stax 18¢ (AEO fixed) |
| /comparisons/best-interchange-plus-payment-processors-2026 | 325 | Square 10¢, Stax 18¢ |
| /comparisons/ai-subscription-billing-tools-2026 | 253 | Stax 18¢, T+2 (AEO fixed) |
| /insights/tokenization-for-higher-approval-rates | 233 | "May 2026" in meta_description and body |
| /insights/tipping-fees-on-pos-systems | 189 | Square 10¢ |
| /insights/ic-pricing-breakdown | 185 | Square 10¢, T+2 |
| /insights/downgrade-categories-explained | 177 | 18¢ |
| /comparisons/best-high-risk-friendly-payment-processors-2026 | 172 | Square 10¢, Stax 18¢ |
| /comparisons/best-payment-processors-for-b2b-2026 | 168 | Stax 18¢ |
| /comparisons/ai-reconciliation-tools-2026 | 160 | Square 10¢, PayPal 2.59%, Stax 18¢ |
| /comparisons/ai-fraud-detection-tools-for-merchants-2026 | 141 | Square 10¢, Stax 18¢ |
| /comparisons/best-payment-processors-restaurants-2026 | 110 | Square 10¢, "May 2026", Stax 18¢ (AEO fixed) |
| /comparisons/ai-dunning-and-recovery-tools-2026 | 91 | Square 10¢, PayPal 2.59%, Stax 18¢ |
| /comparisons/ai-dispute-management-tools-2026 | 70 | Square 10¢, Stax 18¢ |
| /comparisons/best-payment-processors-ecommerce-2026 | 66 | "May 2026", Stax 18¢ (AEO fixed) |
| /comparisons/best-payment-processors-yoga-and-fitness-studios-2026 | 61 | Square 10¢, Stax 18¢ |
| /comparisons/best-payment-processors-professional-services-2026 | 60 | Square 10¢, PayPal 2.59%, Stax 18¢, 2.65% |
| /insights/how-to-read-a-merchant-statement | 55 | Square 10¢ |
| /insights/hardware-lock-in-across-processors | 36 | 18¢ |
| /insights/emv-and-chip-card-mdr | 15 | Square 10¢ |
| /insights/multi-location-reconciliation | 8 | T+2 |
| /insights/what-to-ask-before-signing-a-processor-contract | 7 | T+2 |
| /comparisons/best-low-fee-payment-processors-2026 | 0 | Square 10¢, Stax 18¢, T+2, 1.75% (AEO fixed) |
| /comparisons/square-vs-clover-2026 | 0 | Square 10¢, 1.75% (AEO fixed) |
| /comparisons/best-payment-processors-dental-practices-2026 | 0 | Square 10¢, Stax 18¢ (AEO fixed) |
| /comparisons/best-multi-acquirer-payment-processors-2026 | 0 | Square 10¢, 2.59%, T+2 (AEO fixed) |
| /comparisons/best-payment-processors-healthcare-practices-2026 | 0 | Square 10¢, Stax 18¢ (AEO fixed) |
| /comparisons/best-payment-processors-legal-practices-2026 | 0 | Square 10¢, 2.59%, Stax 18¢ (AEO fixed) |
| /comparisons/best-payment-processors-automotive-shops-2026 | 0 | Square 10¢, Stax 18¢ (AEO fixed) |
| /comparisons/clover-vs-toast-2026 | 0 | Only Clover's correct 10¢ |

## Code pages not edited

- **Five volume-tier pages** (`src/lib/comparisons/volume-tiers.ts`, 13 to 168 impressions each). Their pick cards quote May ranges: Square 2.65 to 2.95%, Stripe 2.88 to 2.97%, PayPal 2.97 to 3.07%, Stax at a flat $99 and Payment Depot at $79. They need rebuilding from the engine, not a find-and-replace.
- **/insights/helcim-review-2025** (0 impressions). Square shows 2.6% + $0.10 in a cost table built on the old fee, and the Helcim tiers above the first one are wrong (discrepancies file, item 19).
- **/insights/payment-processor-fees-conversion-rates-2026-merchant-evaluation** (0 impressions). Square shows 10¢ and Braintree shows 2.59% + $0.49; the correct Braintree price is 2.89% + 29¢.
- **/insights/stripe-vs-square-vs-paypal-vs-helcim-vs-payment-depot-…** (0 impressions). Square shows 10¢.
- **"Updated May 2026" / "Published May 2026"** labels on about 15 insights pages. These are page dates, not rate claims, so they were left as they are.

## Flagged by the drafting pass, not changed (no sourced number to use)

- **same-day-deposit page, Helcim row:** "1 to 2 business days, next business day with Faster Deposits" is quoted from Helcim's funding doc, but Helcim's pricing page says next business morning. The two sources conflict.
- **best-pos-systems:** the Clover plan range of $14.95 to $54.95 is out of date (Essentials is $29.95, Growth from $84.95). The Payment Depot fee is unverified. The FAQ line "Square is almost always cheapest under $20K" contradicts the engine (Helcim 2.11% vs Square 2.90% at $10K).
- **stripe-vs-stax:** the "$7K to $10K break-even" claim does not reproduce on the engine (Stax 2.70% vs Stripe 2.80% at $10K).
- **best-fast-funding:** the verdict still reads "Square wins". The free same-day deposit that justified it is gone, since same-day now costs 1.95%. This needs an editorial call.
- **gateways-for-ecommerce:** the key finding "Helcim saves $13,500 a year at $250K" rests on the page's own interchange assumption; on the engine, the gap is larger.
- **Unverified, left in place:** Payment Depot fees, Toast rates, the "T+1" for Worldpay and Braintree, PayPal "1 business day", and Square Register at $799.

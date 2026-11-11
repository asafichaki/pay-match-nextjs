/**
 * Provider boxes for database-rendered articles (render-blog-article.tsx).
 *
 * None of the 80 Supabase articles carried a single provider button, and they
 * get ~95% of the site's human reads. Rather than editing HTML in the
 * database, a page opts in here: a heading, the providers the article itself
 * discusses, and the one fact from the article that decides the reader's
 * choice. Every figure below is copied from the article body it sits on, so
 * the box can never say something the page does not.
 */
export interface ArticleOffer {
  /** Must match PROVIDER_META.processor in ranking-2026.ts, or any label when `custom` is set. */
  processor: string;
  /** The deciding fact, from the article body. */
  fact: string;
  /**
   * A provider the ranking does not price (no published rates) but the
   * article ranks anyway, e.g. Worldpay or Payment Depot. `partnerSlug` is the
   * `partners` row for /go/; `quote` sends the reader to the contact page.
   */
  custom?: { name: string; partnerSlug: string | null; url: string; variant?: "visit" | "quote" };
}

export interface ArticleOffers {
  heading: string;
  /** How the list is ordered, shown to the reader. */
  orderNote: string;
  items: ArticleOffer[];
  checked: string;
}

export const ARTICLE_OFFERS: Record<string, ArticleOffers> = {
  "best-payment-processors-with-same-day-deposit-2026": {
    heading: "Same-day payout fees at a glance",
    orderNote: "Sorted by the published fee for an instant or same-day payout, lowest first. Helcim has no paid instant option; it is listed as the free next-day alternative.",
    checked: "2026",
    items: [
      { processor: "Stripe", fact: "1.5% Instant Payouts, $0.50 minimum. Standard schedule free." },
      { processor: "PayPal", fact: "1.50% Instant Transfer, $0.50 minimum. Standard transfer free." },
      { processor: "Clover", fact: "1.75% Rapid Deposit. Standard settlement 1 to 3 days." },
      { processor: "Square", fact: "1.95% instant or scheduled same-day transfer. Next business day free." },
      { processor: "Helcim", fact: "No instant fee. Eligible Faster Deposits arrive next business day, free." },
    ],
  },
};

ARTICLE_OFFERS["best-payment-processors-mobile-and-on-the-go-2026"] = {
  heading: "Mobile processors at a glance",
  orderNote: "In the order of the article's ranking: Square for sellers under $30K a month who want a free app and offline mode, Helcim as the lower-cost option.",
  checked: "2026",
  items: [
    { processor: "Square", fact: "2.6% + $0.15 in person, month to month, hardware from $59, offline mode. Best fit under $30K a month." },
    { processor: "Helcim", fact: "Interchange + 0.40% + $0.08 in person, month to month. About 2.04% at $50K a month in our engine, against 2.90% on Square." },
    { processor: "Stripe", fact: "2.7% + $0.05 in person with Tap to Pay, month to month. For custom iOS or Android apps." },
    { processor: "PayPal", fact: "PayPal POS: 2.29% + $0.09 in person. Card reader $29 for your first." },
    { processor: "Clover", fact: "Clover Go reader $199, on Clover's own processing. The reader usually cannot move with you if you switch." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month by annual volume plus interchange + $0.08. Behind Helcim under $50K, cheapest by $250K." },
  ],
};

ARTICLE_OFFERS["best-no-contract-payment-processors-2026"] = {
  heading: "No-contract processors at a glance",
  orderNote: "In the order of the article's verdict: Helcim first as the cheapest no-contract option in our engine at $10K and $50K a month, then by fit.",
  checked: "2026",
  items: [
    { processor: "Helcim", fact: "Interchange + 0.40% + $0.08 in person, no monthly fee, no early-termination clause. Cheapest here at $10K and $50K." },
    { processor: "Square", fact: "2.6% + $0.15 in person, month to month, free POS software. Easiest start for small sellers, not the cheapest." },
    { processor: "Stripe", fact: "2.9% + $0.30 online, 2.7% + $0.05 in person, month to month. Online and developer-led businesses." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month by annual volume plus interchange + $0.08. Cheaper than Helcim by $250K; contract length not published." },
    { processor: "Clover", fact: "2.3% to 2.6% + 10¢ by plan, software $0 to $89.95+ a month. Hardware subscriptions run 36 months and cannot be canceled." },
    { processor: "PayPal", fact: "3.49% + $0.49 standard online, 2.29% + $0.09 in person, month to month. For low volume with PayPal-preferring buyers." },
    { processor: "Payment Depot", fact: "Quote-only interchange-plus. Pricing page lists $0 setup and no cancellation fees; get a written quote.", custom: { name: "Payment Depot", partnerSlug: "payment-depot", url: "https://paymentdepot.com/", variant: "quote" } },
  ],
};

ARTICLE_OFFERS["best-pos-systems-for-small-business-2026"] = {
  heading: "POS systems at a glance",
  orderNote: "In the order of the article's ranking: Square as the easiest full POS under $50K a month, Helcim as the lower-cost processor at every volume we model.",
  checked: "2026",
  items: [
    { processor: "Square", fact: "2.6% + $0.15 in person on the Free plan, month to month, next-day deposits, hardware from $59. Easiest full POS, not the cheapest." },
    { processor: "Clover", fact: "2.3% to 2.6% + 10¢ by plan, software $0 to $89.95+ a month; hardware subscriptions run 36 months. Restaurants and retail." },
    { processor: "Helcim", fact: "Interchange + 0.40% + $0.08 in person, month to month. About $1,020 a month at $50K, against $1,450 on Square." },
    { processor: "Stripe", fact: "2.9% + $0.30 online, 2.7% + $0.05 in person, month to month. Online-first businesses." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month by annual volume plus interchange + $0.08. Cheapest in our engine from about $250K a month." },
    { processor: "Payment Depot", fact: "Quote-only interchange-plus, no POS prices listed. $0 setup and no cancellation fees; get a written quote.", custom: { name: "Payment Depot", partnerSlug: "payment-depot", url: "https://paymentdepot.com/", variant: "quote" } },
    { processor: "PayPal", fact: "2.29% + $0.09 in person, 3.49% + $0.49 standard online. Online sellers; highest invoice rate." },
  ],
};

ARTICLE_OFFERS["best-payment-processors-marketplaces-2026"] = {
  heading: "Marketplace processors at a glance",
  orderNote: "In the order of the article's verdict: Stripe Connect first, PayPal second for wallet-heavy B2C marketplaces, Worldpay for enterprise platforms on a custom quote.",
  checked: "2026",
  items: [
    { processor: "Stripe", fact: "Stripe Connect: 2.9% + $0.30 online; if you set seller pricing, $2 per active account a month plus 0.25% + $0.25 per payout." },
    { processor: "PayPal", fact: "PayPal Commerce Platform. For B2C marketplaces whose buyers want the PayPal wallet; test whether it lifts checkout enough." },
    { processor: "Worldpay", fact: "Part of Global Payments since January 2026. Custom pricing for enterprise marketplaces; no published rates.", custom: { name: "Worldpay", partnerSlug: "worldpay", url: "https://www.worldpay.com/en-us/contact", variant: "quote" } },
    { processor: "Helcim", fact: "Interchange + 0.50% + $0.25 online, month to month. Single-merchant businesses; no sub-merchant platform." },
    { processor: "Square", fact: "2.9% + $0.30 online on paid plans, 2.6% + $0.15 in person. Small sellers on Square POS; no marketplace facilitator API." },
  ],
};

ARTICLE_OFFERS["best-fast-funding-payment-processors-2026"] = {
  heading: "Fast-funding options at a glance",
  orderNote: "In the order of the article's ranking. Payout fees are from each provider's own page; Helcim is the free next-day option and costs least per sale in our engine.",
  checked: "2026",
  items: [
    { processor: "Square", fact: "Next business day free; same-day or instant transfer 1.95%, up to $10,000 each. No contract on the Free plan." },
    { processor: "Stripe", fact: "Instant Payouts 1.5%, $0.50 minimum. Standard payouts take 2 business days; a first payout typically 7 to 14 days." },
    { processor: "PayPal", fact: "Instant transfer 1.5%, $0.50 minimum, no maximum fee. For merchants already paid through PayPal." },
    { processor: "Helcim", fact: "Free next-business-morning deposits, no instant option. Cheapest in our engine at every volume we model." },
    { processor: "Clover", fact: "Rapid Deposit 1.75%; standard settlement 1 to 3 days. Clover sold through a bank can carry different terms." },
  ],
};


// Stage 2 pages, 2026-11-11 (reviews, alternatives, guides). Facts copied from each page body.
ARTICLE_OFFERS["square-review-2026"] = {
  heading: "Square and its closest alternatives",
  orderNote: "Square first because this page reviews it, then the alternatives by in-person monthly cost at $50K in our engine, lowest first.",
  checked: "2026",
  items: [
    { processor: "Square", fact: "2.6% + 15¢ in person on the $0 Free plan, no contract, next-day deposits free. About $290 a month at $10K in person." },
    { processor: "Helcim", fact: "Interchange + 0.40% + 8¢ in person, no monthly fee. About $1,020 a month at $50K in person, against $1,450 on Square." },
    { processor: "PayPal", fact: "PayPal POS at 2.29% + 9¢ in person, no monthly fee. About $1,235 a month at $50K in person." },
    { processor: "Stripe", fact: "2.7% + 5¢ in person with Terminal, 2.9% + 30¢ online. About $1,400 a month at $50K in person." },
  ],
};

ARTICLE_OFFERS["helcim-review-2026"] = {
  heading: "Helcim and its closest alternatives",
  orderNote: "Helcim first because this page reviews it, then the alternatives by in-person monthly cost at $250K in our engine, lowest first.",
  checked: "2026",
  items: [
    { processor: "Helcim", fact: "Interchange + 0.40% + 8¢ in person, $0 monthly fee, no contract. About $211 a month at $10K in person." },
    { processor: "Stax (Fattmerchant)", fact: "Interchange at cost + 8¢ in person, plus $99 to $199+ a month. About $4,475 a month at $250K in person." },
    { processor: "Square", fact: "2.6% + 15¢ in person on the $0 Free plan, hardware from $59. About $6,900 a month at $250K in person." },
    { processor: "Stripe", fact: "2.7% + 5¢ in person, 2.9% + 30¢ online, no monthly fee. About $7,000 a month at $250K in person." },
  ],
};

ARTICLE_OFFERS["clover-review-2026"] = {
  heading: "Clover and its closest alternatives",
  orderNote: "Clover first because this page reviews it, then the alternatives by in-person monthly cost at $50K in our engine, lowest first.",
  checked: "2026",
  items: [
    { processor: "Clover", fact: "2.3% + 10¢ in person on Clover.com Growth bundles; 36-month hardware subscriptions cannot be canceled. About $1,335 a month at $50K before hardware." },
    { processor: "Helcim", fact: "Interchange + 0.40% + 8¢ in person, no monthly fee or contract. About $1,020 a month at $50K in person." },
    { processor: "Stax (Fattmerchant)", fact: "Interchange at cost + 8¢ in person, plus $99 to $199+ a month. About $1,055 a month at $50K in person." },
    { processor: "Square", fact: "2.6% + 15¢ in person on the $0 Free plan, no contract, hardware from $59. About $1,450 a month at $50K in person." },
  ],
};

ARTICLE_OFFERS["toast-pos-review-2026"] = {
  heading: "Toast and the closest alternatives",
  orderNote: "Ordered by our engine's monthly cost at $50K in person, with Toast placed by the same formula; Clover is lowest at that volume.",
  checked: "2026",
  items: [
    { processor: "Helcim", fact: "Interchange + 0.40% + 8¢ in person, no monthly fee, no contract. About $1,020 a month at $50K in our engine." },
    { processor: "Clover", fact: "2.3% + 10¢ in person on Growth bundles; about $1,335 a month at $50K. Hardware subscriptions run 36 months." },
    { processor: "Square", fact: "2.5% + 15¢ in person on Plus at $49 a month, no contract. About $1,450 a month at $50K." },
    { processor: "Toast", fact: "2.49% + 15¢ plus $69 a month on Traditional, about $1,464 at $50K. 2-year agreement.", custom: { name: "Toast", partnerSlug: "toast", url: "https://pos.toasttab.com/pricing", variant: "visit" } },
  ],
};

ARTICLE_OFFERS["paymentcloud-review-2026"] = {
  heading: "High-risk options at a glance",
  orderNote: "High-risk providers first, in the order of this review; none of the three publishes a full high-risk rate, so cost cannot set the order. Helcim is listed for mid-risk businesses.",
  checked: "2026",
  items: [
    { processor: "PaymentCloud", fact: "Quote-only pricing. Approval in 24 hours to 5 days per its homepage; free terminal per location advertised.", custom: { name: "PaymentCloud", partnerSlug: "paymentcloud", url: "https://paymentcloudinc.com/", variant: "quote" } },
    { processor: "Durango Merchant Services", fact: "Interchange-plus pricing by quote; over 20 years in business; offshore placement options.", custom: { name: "Durango Merchant Services", partnerSlug: "durango", url: "https://durangomerchantservices.com/", variant: "quote" } },
    { processor: "Easy Pay Direct", fact: "Standard accounts: 2.69% + $0.36 online, 1.59% + $0.19 swiped, monthly typically $36.", custom: { name: "Easy Pay Direct", partnerSlug: "easy-pay-direct", url: "https://www.easypaydirect.com/", variant: "visit" } },
    { processor: "Helcim", fact: "Interchange + 0.50% + 25¢ online, no monthly fee, no contract. Mid-risk only; declines most high-risk categories." },
  ],
};

ARTICLE_OFFERS["best-pos-systems-for-restaurants-2026"] = {
  heading: "Restaurant POS systems at a glance",
  orderNote: "Sorted by monthly cost at $50K in card sales and a $50 check, lowest first; Lightspeed is last because it does not publish card rates.",
  checked: "2026",
  items: [
    { processor: "Clover", fact: "2.3% + 10¢ in person on Restaurant Growth; about $1,335 a month at $50K. 36-month hardware subscription." },
    { processor: "SpotOn", fact: "POS Essentials: $55 a station, 2.45% + 15¢, month to month. About $1,430 at $50K excluding Amex.", custom: { name: "SpotOn", partnerSlug: null, url: "https://www.spoton.com/pricing/", variant: "visit" } },
    { processor: "Square", fact: "Plus: $49 a month, 2.5% + 15¢ in person, no contract. About $1,450 a month at $50K." },
    { processor: "Toast", fact: "Traditional: 2.49% + 15¢ plus $69 a month, about $1,464 at $50K. 2-year agreement.", custom: { name: "Toast", partnerSlug: "toast", url: "https://pos.toasttab.com/pricing", variant: "visit" } },
    { processor: "Lightspeed Restaurant", fact: "Plans listed at $69, $189 and $399; card rates by quote.", custom: { name: "Lightspeed Restaurant", partnerSlug: null, url: "https://www.lightspeedhq.com/pos/restaurant/pricing/", variant: "quote" } },
  ],
};

ARTICLE_OFFERS["stripe-alternatives-2026"] = {
  heading: "Stripe alternatives at a glance",
  orderNote: "Sorted by our engine's monthly cost for $50K a month in online sales, lowest first; Square is listed last as the in-person POS option.",
  checked: "2026",
  items: [
    { processor: "Stax (Fattmerchant)", fact: "$1,200 a month at $50K online, $5,200 at $250K. Interchange at cost + 15¢, plus $99 to $199+ a month." },
    { processor: "Helcim", fact: "$1,275 a month at $50K online against $1,750 on Stripe. No monthly fee, no contract." },
    { processor: "Adyen", fact: "2.56% online in our engine; minimum monthly invoice not published." },
    { processor: "Braintree", fact: "2.89% + 29¢ for cards and wallets, with PayPal and Venmo in one integration. Online only." },
    { processor: "Square", fact: "2.6% + 15¢ in person on the $0 plan, free next-day transfers. Not cheaper than Stripe Terminal." },
  ],
};

ARTICLE_OFFERS["paypal-alternatives-2026"] = {
  heading: "PayPal alternatives at a glance",
  orderNote: "Sorted by our engine's monthly cost for $50K a month in online sales, lowest first; Square is listed last as the in-person POS option.",
  checked: "2026",
  items: [
    { processor: "Stax (Fattmerchant)", fact: "$1,200 a month at $50K online against $1,735 on PayPal. Interchange at cost + 15¢, plus $99 to $199+ a month." },
    { processor: "Helcim", fact: "$1,275 a month at $50K online against $1,735 on PayPal. No monthly fee, no contract." },
    { processor: "Stripe", fact: "2.9% + 30¢ online against 3.49% + 49¢ for PayPal Checkout. $15 dispute fee." },
    { processor: "Shopify Payments", fact: "2.9% + 30¢ online on Basic, lower on higher plans. Shopify stores only." },
    { processor: "Square", fact: "2.6% + 15¢ in person on the $0 plan with a free POS app. Costs more than PayPal POS." },
  ],
};

ARTICLE_OFFERS["square-alternatives-2026"] = {
  heading: "Square alternatives at a glance",
  orderNote: "Sorted by our engine's monthly cost for $50K a month in in-person sales, lowest first.",
  checked: "2026",
  items: [
    { processor: "Helcim", fact: "$1,020 a month at $50K in person against $1,450 on Square. No monthly fee, no contract." },
    { processor: "Stax (Fattmerchant)", fact: "$1,055 a month at $50K in person, $4,475 at $250K. Plus $99 to $199+ a month." },
    { processor: "PayPal", fact: "2.29% + 9¢ in person, the lowest flat rate we found. $1,235 a month at $50K." },
    { processor: "Clover", fact: "2.3% + 10¢ on Growth bundles; $1,335 a month at $50K. 36-month hardware term." },
    { processor: "Stripe", fact: "2.7% + 5¢ in person, 2.9% + 30¢ online, no monthly fee. $1,400 a month at $50K in person." },
  ],
};

ARTICLE_OFFERS["best-credit-card-readers-small-business-2026"] = {
  heading: "Card readers at a glance",
  orderNote: "Ordered by in-person monthly cost at $50K in our engine, lowest first; SumUp is last because it is not in the engine yet.",
  checked: "2026",
  items: [
    { processor: "Helcim", fact: "Card Reader $199; interchange + 0.40% + 8¢ in person, no monthly fee. $1,020 a month at $50K in our engine." },
    { processor: "PayPal", fact: "Card Reader $29 for your first, then $79; 2.29% + 9¢ in person. $1,235 a month at $50K." },
    { processor: "Clover", fact: "Clover Go $199; 2.3% to 2.6% + 10¢ by plan; 36-month hardware terms. $1,335 a month at $50K on Retail Growth." },
    { processor: "Stripe", fact: "Reader M2 $59; 2.7% + 5¢ in person, no monthly fee. $1,400 a month at $50K." },
    { processor: "Square", fact: "Reader $59; 2.6% + 15¢ on the Free plan, free next-day deposits. $1,450 a month at $50K." },
    { processor: "SumUp", fact: "Plus reader $37 on sale ($54 list); 2.6% + 10¢ in person, $0 Standard plan. Not yet in our cost engine.", custom: { name: "SumUp", partnerSlug: null, url: "https://www.sumup.com/en-us/pricing/", variant: "visit" } },
  ],
};

ARTICLE_OFFERS["credit-card-surcharging-guide-2026"] = {
  heading: "Processors with a published surcharge feature",
  orderNote: "Ordered by in-person monthly cost at $50K in our engine, lowest first; only processors whose own pages describe surcharging are listed.",
  checked: "2026",
  items: [
    { processor: "Helcim", fact: "Fee Saver: customers pay 3.0% on credit cards, you pay 0%; PIN debit costs you 1.0% + 8¢. $1,020 a month at $50K before Fee Saver." },
    { processor: "Stax (Fattmerchant)", fact: "Surcharges credit cards only, detects debit by BIN; $99 to $199+ a month plus interchange + 8¢ in person." },
    { processor: "Clover", fact: "Most US merchants surcharge at 3.00%, credit cards only; states with restrictions excluded." },
    { processor: "Square", fact: "Open beta for US sellers, capped at 3% and your cost; not on Kiosk, Virtual Terminal or Square Website." },
  ],
};

ARTICLE_OFFERS["ach-payment-processing-2026"] = {
  heading: "ACH fees at a glance",
  orderNote: "Sorted by the published fee to receive one $2,000 ACH payment, lowest first; ties in alphabetical order.",
  checked: "2026",
  items: [
    { processor: "Melio", fact: "Receiving ACH by payment request or link is free; card payments received cost 2.9%.", custom: { name: "Melio", partnerSlug: "melio", url: "https://www.melio.com/pricing", variant: "visit" } },
    { processor: "PayPal", fact: "Online ACH Services 0.80%, capped at $5; invoice Pay by Bank 1%, capped at $10." },
    { processor: "Stripe", fact: "ACH Direct Debit 0.8%, capped at $5; $4 per failed payment, $15 per dispute; settles in up to 4 business days." },
    { processor: "Helcim", fact: "ACH 0.5% + 25¢, capped at $6; $5 per rejected payment; no monthly fee." },
    { processor: "Square", fact: "ACH 1%, $1 minimum; capped at $10 on Plus and Premium invoices, $5 through the API." },
    { processor: "Stax (Fattmerchant)", fact: "ACH 1%, capped at $10, plus a $99 to $199+ monthly subscription." },
  ],
};

// Refreshed pages, 2026-11-11: facts corrected to the Oct 29 data and official pages.
ARTICLE_OFFERS["best-high-risk-friendly-payment-processors-2026"] = {
  heading: "Where a high-risk business can apply",
  orderNote: "Ordered by fit for high-risk files: specialists that say they take high-risk accounts first, then the quote-only acquirer, then the lowest-cost published option for businesses that are not high-risk. None of the first three publishes rates.",
  checked: "2026",
  items: [
    { processor: "PaymentCloud", fact: "Says it serves high-risk businesses, approves in 24 hours to 5 days, no long-term contracts. Pricing is quote-only.", custom: { name: "PaymentCloud", partnerSlug: "paymentcloud", url: "https://paymentcloudinc.com/", variant: "quote" } },
    { processor: "Durango Merchant Services", fact: "Says it opens high-risk and large-volume accounts with interchange-plus pricing. Pricing is quote-only.", custom: { name: "Durango Merchant Services", partnerSlug: "durango", url: "https://durangomerchantservices.com/", variant: "quote" } },
    { processor: "Worldpay", fact: "Publishes no price list or high-risk terms; every account is priced by quote. Ask for reserve and contract terms in writing.", custom: { name: "Worldpay", partnerSlug: "worldpay", url: "https://www.worldpay.com/en/small-business", variant: "quote" } },
    { processor: "Helcim", fact: "Interchange + 0.50% + $0.25 online, no contract, no monthly fee. No high-risk program on its pricing page." },
  ],
};

ARTICLE_OFFERS["best-low-fee-payment-processors-2026"] = {
  heading: "Cheapest processors at $50K a month",
  orderNote: "Sorted by our engine's monthly in-person cost at $50K with a $50 average sale (prices checked Oct 2026), lowest first. Payment Depot is last because its pricing is quote-only, so it cannot be priced.",
  checked: "2026",
  items: [
    { processor: "Helcim", fact: "Interchange + 0.40% + $0.08 in person, no monthly fee. About $1,020 a month at $50K." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month plus interchange + $0.08. About $1,055 at $50K; cheapest at $250K ($4,475)." },
    { processor: "PayPal", fact: "PayPal POS 2.29% + $0.09 in person. About $1,235 a month at $50K." },
    { processor: "Clover", fact: "2.3% to 2.6% + $0.10 plus $0 to $89.95+ a month. About $1,335 at $50K; 36-month hardware term." },
    { processor: "Stripe", fact: "2.7% + $0.05 in person, 2.9% + $0.30 online. About $1,400 a month at $50K." },
    { processor: "Square", fact: "2.6% + $0.15 in person on Free. About $1,450 a month at $50K on Plus." },
    { processor: "Payment Depot", fact: "Quote-only interchange-plus, so not priced here. Pricing page lists $0 setup and no cancellation fees.", custom: { name: "Payment Depot", partnerSlug: "payment-depot", url: "https://paymentdepot.com/", variant: "quote" } },
  ],
};

ARTICLE_OFFERS["best-virtual-terminals-2026"] = {
  heading: "Virtual terminals by keyed cost",
  orderNote: "Sorted by our engine's monthly keyed cost at $50K with a $50 average sale (prices checked Oct 2026), lowest first. Payment Depot is last because its pricing is quote-only.",
  checked: "2026",
  items: [
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month plus interchange + $0.15 online. About $1,200 a month at $50K keyed." },
    { processor: "Helcim", fact: "Interchange + 0.50% + $0.25 keyed, no monthly fee. About $1,275 at $50K; cheapest at $10K ($270)." },
    { processor: "Clover", fact: "3.5% + $0.10 keyed on every bundle. About $1,850 a month at $50K." },
    { processor: "Square", fact: "3.5% + $0.15 keyed, no monthly fee. About $1,900 a month at $50K." },
    { processor: "PayPal", fact: "Virtual terminal 3.39% + $0.29 per keyed sale. About $1,985 a month at $50K." },
    { processor: "Stripe", fact: "3.4% + $0.30 for manually entered cards. About $2,000 a month at $50K." },
    { processor: "Payment Depot", fact: "Quote-only interchange-plus, no keyed rate listed. Pricing page lists $0 setup and no cancellation fees.", custom: { name: "Payment Depot", partnerSlug: "payment-depot", url: "https://paymentdepot.com/", variant: "quote" } },
  ],
};

ARTICLE_OFFERS["clover-vs-toast-2026"] = {
  heading: "Toast vs Clover, with two alternatives",
  orderNote: "Sorted by monthly in-person cost at $50K with a $50 average sale, lowest first: Helcim, Clover and Square from our ranking engine, Toast's published Traditional plan run through the same formula.",
  checked: "2026",
  items: [
    { processor: "Helcim", fact: "Interchange + 0.40% + $0.08 in person, no contract. About $1,020 a month at $50K; no restaurant POS." },
    { processor: "Clover", fact: "2.6% + $0.10 on Starter ($0 software), 2.3% + $0.10 on Growth. About $1,335 at $50K; 36-month hardware term." },
    { processor: "Square", fact: "2.6% + $0.15 in person, no contract. About $1,450 a month at $50K on Plus." },
    { processor: "Toast", fact: "2.49% + $0.15 plus $69+ a month and a $1,153 kit, or 3.09% + $0.15 with $0 upfront. About $1,464 at $50K; 2-year agreement.", custom: { name: "Toast", partnerSlug: "toast", url: "https://pos.toasttab.com/pricing", variant: "visit" } },
  ],
};

ARTICLE_OFFERS["square-vs-clover-2026"] = {
  heading: "Clover vs Square, and two cheaper alternatives",
  orderNote: "Sorted by monthly in-person cost at $50K in our engine (prices checked Oct 2026), lowest first. Helcim and Stax are the interchange-plus alternatives the page compares.",
  checked: "2026",
  items: [
    { processor: "Helcim", fact: "Interchange + 0.40% + $0.08 in person, no monthly fee, no contract. About $1,020 a month at $50K." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month plus interchange + $0.08 in person. About $1,055 a month at $50K." },
    { processor: "Clover", fact: "2.6% + $0.10 on Starter, 2.3% + $0.10 on Growth from $84.95 a month. About $1,335 at $50K; 36-month hardware term." },
    { processor: "Square", fact: "2.6% + $0.15 in person on Free, no contract, next-day deposits free. About $1,450 at $50K on Plus." },
  ],
};

ARTICLE_OFFERS["square-vs-toast-2026"] = {
  heading: "Square vs Toast at a glance",
  orderNote: "Sorted by monthly cost at $50K with a $50 average sale, lowest first: Square from our ranking engine, Toast's published Traditional plan run through the same formula.",
  checked: "2026",
  items: [
    { processor: "Square", fact: "2.6% + $0.15 in person on Free, no contract. About $1,450 a month at $50K on Plus." },
    { processor: "Toast", fact: "2.49% + $0.15 plus $69+ a month and a $1,153 kit, or 3.09% + $0.15 with $0 upfront. 2-year agreement.", custom: { name: "Toast", partnerSlug: "toast", url: "https://pos.toasttab.com/pricing", variant: "visit" } },
  ],
};
// Offer boxes for the pages corrected in the Nov 11 2026 fact sweep.
ARTICLE_OFFERS["stripe-vs-worldpay-2026"] = {
  heading: "Stripe vs Worldpay, with two published alternatives",
  orderNote: "The two sides of the matchup first, Stripe as the verdict's pick for published pricing, then the interchange-plus alternatives the verdict names from about $50K a month.",
  checked: "2026",
  items: [
    { processor: "Stripe", fact: "2.9% + $0.30 online, 2.7% + $0.05 in person, no monthly fee or contract. About $1,750 a month at $50K online." },
    { processor: "Worldpay", fact: "Part of Global Payments; custom quote, no published rates. Ask for contract length and any early termination fee in writing.", custom: { name: "Worldpay", partnerSlug: "worldpay", url: "https://www.worldpay.com/en-us/contact", variant: "quote" } },
    { processor: "Helcim", fact: "Interchange + 0.50% + $0.25 online, no monthly fee, no contract. About $1,275 a month at $50K online." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month plus interchange + $0.15 online. About $1,200 a month at $50K online." },
  ],
};

ARTICLE_OFFERS["stripe-vs-payment-depot-2026"] = {
  heading: "Stripe vs Payment Depot, with two published alternatives",
  orderNote: "The two sides of the matchup first, then the published interchange-plus alternatives the verdict names; Payment Depot cannot be priced because it lists no prices.",
  checked: "2026",
  items: [
    { processor: "Stripe", fact: "2.9% + $0.30 online, 2.7% + $0.05 in person, no monthly fee. About $1,750 a month at $50K online." },
    { processor: "Payment Depot", fact: "Quote-only interchange-plus. Pricing page lists $0 setup and no cancellation fees; get a written quote.", custom: { name: "Payment Depot", partnerSlug: "payment-depot", url: "https://paymentdepot.com/", variant: "quote" } },
    { processor: "Helcim", fact: "Publishes interchange-plus prices, no quote needed. About $1,275 a month at $50K online on our method." },
    { processor: "Stax (Fattmerchant)", fact: "Publishes interchange-plus prices, no quote needed. About $1,200 a month at $50K online on our method." },
  ],
};

ARTICLE_OFFERS["helcim-vs-payment-depot-2026"] = {
  heading: "Helcim vs Payment Depot at a glance",
  orderNote: "Helcim first because it is the one of the two the verdict can price, then Payment Depot by quote, then Stax as the published subscription alternative the verdict names.",
  checked: "2026",
  items: [
    { processor: "Helcim", fact: "Interchange + 0.40% + $0.08 in person, no monthly fee, no contract. About $1,020 a month at $50K in person." },
    { processor: "Payment Depot", fact: "Quote-only interchange-plus. Pricing page lists $0 setup and no cancellation fees; get a written quote.", custom: { name: "Payment Depot", partnerSlug: "payment-depot", url: "https://paymentdepot.com/", variant: "quote" } },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month plus interchange + $0.08 in person. 1.79% against Helcim's 1.94% at $250K a month." },
  ],
};

ARTICLE_OFFERS["best-payment-processors-for-nonprofits-2026"] = {
  heading: "Nonprofit processors at a glance",
  orderNote: "In the order of the article's verdict: PayPal and Helcim under about $30K a month, Stax above it, then Stripe for custom donor flows and Square for in-person events.",
  checked: "2026",
  items: [
    { processor: "PayPal", fact: "1.99% + $0.49 confirmed charity rate once PayPal approves a 501(c)(3). About 2.97% on a $50 gift." },
    { processor: "Helcim", fact: "Interchange + 0.50% + $0.25 online, no monthly fee, no contract. About $270 a month at $10K online." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month plus interchange + $0.15 online. $1,200 a month at $50K against $1,275 for Helcim." },
    { processor: "Stripe", fact: "2.9% + $0.30 online; nonprofit discount by application, rate not published. For custom donor flows." },
    { processor: "Square", fact: "2.6% + $0.15 in person, hardware from $59, free next-day deposits. For galas and in-person collections." },
  ],
};

ARTICLE_OFFERS["best-payment-processors-contractors-and-field-services-2026"] = {
  heading: "Contractor processors at a glance",
  orderNote: "In the order of the article's verdict: Helcim up to about $60K a month, Stax above it, Square under $25K, Stripe for ACH invoicing, then Payment Depot by quote.",
  checked: "2026",
  items: [
    { processor: "Helcim", fact: "Interchange + 0.40% + $0.08 in person, no monthly fee, no contract. Cheapest in our engine at $10K and $50K a month." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month plus interchange + $0.08 in person. $4,475 a month at $250K against $4,850 for Helcim." },
    { processor: "Square", fact: "2.6% + $0.15 in person, no contract, free tap-on-phone app. For new crews under $25K a month." },
    { processor: "Stripe", fact: "ACH 0.8% capped at $5; cards 2.9% + $0.30 online. For online B2B invoices routed to ACH." },
    { processor: "Payment Depot", fact: "Quote-only interchange-plus. Pricing page lists $0 setup and no cancellation fees; get a written quote.", custom: { name: "Payment Depot", partnerSlug: "payment-depot", url: "https://paymentdepot.com/", variant: "quote" } },
  ],
};

ARTICLE_OFFERS["best-payment-processors-b2b-saas-2026"] = {
  heading: "B2B SaaS processors at a glance",
  orderNote: "In the order of the article's verdict: Stripe as the default on tooling, Helcim and Stax for a side-by-side on cost, Worldpay for enterprise contracts, then Payment Depot by quote.",
  checked: "2026",
  items: [
    { processor: "Stripe", fact: "2.9% + $0.30 online plus 0.7% for Stripe Billing, pay as you go. Smart Retries and automatic card updates." },
    { processor: "Helcim", fact: "Interchange + 0.50% + $0.25 online plus 0.4% on recurring. $7,125 at $250K a month against $10,500 on Stripe with Billing." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month plus interchange + $0.15 online. $1,200 a month at $50K online against $1,750 on Stripe." },
    { processor: "Worldpay", fact: "Part of Global Payments; custom quote, no published rates. For enterprise SaaS with multi-region settlement.", custom: { name: "Worldpay", partnerSlug: "worldpay", url: "https://www.worldpay.com/en-us/contact", variant: "quote" } },
    { processor: "Payment Depot", fact: "Quote-only interchange-plus. Pricing page lists $0 setup and no cancellation fees; get a written quote.", custom: { name: "Payment Depot", partnerSlug: "payment-depot", url: "https://paymentdepot.com/", variant: "quote" } },
  ],
};

ARTICLE_OFFERS["best-payment-gateways-for-ecommerce-2026"] = {
  heading: "Ecommerce gateways at a glance",
  orderNote: "In the order of the article's verdict: Helcim up to about $50K a month, Stripe for developer-heavy stacks, Stax from $50K, Payment Depot by quote, Square for omnichannel and PayPal as a second button.",
  checked: "2026",
  items: [
    { processor: "Helcim", fact: "Interchange + 0.50% + $0.25 online, no monthly fee, no contract. $6,125 a month at $250K online against $8,750 on Stripe." },
    { processor: "Stripe", fact: "2.9% + $0.30 online, pay as you go, 135+ currencies. For developer-led teams, marketplaces and global sellers." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month plus interchange + $0.15 online. $5,200 a month at $250K online against $6,125 on Helcim." },
    { processor: "Payment Depot", fact: "Quote-only interchange-plus. Pricing page lists $0 setup and no cancellation fees; get a written quote.", custom: { name: "Payment Depot", partnerSlug: "payment-depot", url: "https://paymentdepot.com/", variant: "quote" } },
    { processor: "Square", fact: "2.9% + $0.30 online on paid plans (3.3% + $0.30 on Free), free next-day funding. Omnichannel sellers under $50K." },
    { processor: "PayPal", fact: "PayPal Checkout 3.49% + $0.49, about 4.47% on a $50 sale. Works as a second button next to a card gateway." },
  ],
};

ARTICLE_OFFERS["best-interchange-plus-payment-processors-2026"] = {
  heading: "Interchange-plus processors at a glance",
  orderNote: "In the order of the article's verdict: Helcim from $10K to $50K a month, Stax as volume climbs, Payment Depot by quote, Stripe's custom pricing for high-volume online sellers, Worldpay for enterprise.",
  checked: "2026",
  items: [
    { processor: "Helcim", fact: "Interchange + 0.40% + $0.08 in person, no monthly fee, no contract. About $1,020 a month at $50K in person." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month plus interchange + $0.08 in person. About $4,475 a month at $250K against $4,850 on Helcim." },
    { processor: "Payment Depot", fact: "Quote-only interchange-plus. Pricing page lists $0 setup and no cancellation fees; get a written quote.", custom: { name: "Payment Depot", partnerSlug: "payment-depot", url: "https://paymentdepot.com/", variant: "quote" } },
    { processor: "Stripe", fact: "Standard plan is a flat 2.9% + $0.30 online; interchange-plus only as custom pricing by negotiation." },
    { processor: "Worldpay", fact: "Part of Global Payments; custom quote, no published rates. Markups and contract terms are negotiated.", custom: { name: "Worldpay", partnerSlug: "worldpay", url: "https://www.worldpay.com/en-us/contact", variant: "quote" } },
  ],
};

ARTICLE_OFFERS["best-payment-processors-subscription-products-2026"] = {
  heading: "Subscription processors at a glance",
  orderNote: "In the order of the article's verdict: Stripe as the default on billing tools, Helcim on cost up to about $50K a month, Stax from $50K, then Worldpay, PayPal and Square for narrower cases.",
  checked: "2026",
  items: [
    { processor: "Stripe", fact: "2.9% + $0.30 plus 0.7% for Stripe Billing, with automatic card updates and Smart Retries. $10,500 a month at $250K." },
    { processor: "Helcim", fact: "Interchange + 0.50% + $0.25 online plus 0.4% on recurring. 2.95% at $50K against 4.20% for Stripe with Billing." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month plus interchange + $0.15 online. 2.08% online at $250K, about $5,200 a month." },
    { processor: "Worldpay", fact: "Part of Global Payments; custom quote, no published rates. For enterprises with dedicated payments engineering.", custom: { name: "Worldpay", partnerSlug: "worldpay", url: "https://www.worldpay.com/en-us/contact", variant: "quote" } },
    { processor: "PayPal", fact: "PayPal Checkout 3.49% + $0.49. A secondary checkout next to Stripe or Helcim, not a primary processor." },
    { processor: "Square", fact: "2.9% + $0.30 online on paid plans (3.3% + $0.30 on Free), next-day deposits free. For sub-$25K creators." },
  ],
};

ARTICLE_OFFERS["best-payment-processors-for-b2b-2026"] = {
  heading: "B2B processors at a glance",
  orderNote: "In the order of the article's verdict: Helcim for $25K to $500K a month, Stax from about $50K, Worldpay above $1M, Stripe where billing complexity drives the choice, then Payment Depot by quote.",
  checked: "2026",
  items: [
    { processor: "Helcim", fact: "Interchange + 0.50% + $0.25 online, no monthly fee, no contract. Applies Level 2/3 data automatically, keeps 30% of savings." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month plus interchange + $0.15 online. 2.08% at $250K against 2.45% for Helcim; Level 2 via API." },
    { processor: "Worldpay", fact: "Part of Global Payments; custom quote, no published rates. For B2B merchants above $1M a month.", custom: { name: "Worldpay", partnerSlug: "worldpay", url: "https://www.worldpay.com/en-us/contact", variant: "quote" } },
    { processor: "Stripe", fact: "2.9% + $0.30 online, pay as you go. Level 2/3 savings reach you only on IC+ pricing, not the flat rate." },
    { processor: "Payment Depot", fact: "Quote-only interchange-plus. Pricing page lists $0 setup and no cancellation fees; get a written quote.", custom: { name: "Payment Depot", partnerSlug: "payment-depot", url: "https://paymentdepot.com/", variant: "quote" } },
  ],
};

ARTICLE_OFFERS["best-payment-processors-restaurants-2026"] = {
  heading: "Restaurant processors at a glance",
  orderNote: "In the order of the article's verdict: Square under about $25K a month, Helcim from $10K to $250K, Stax from $250K, then Clover, Toast and Stripe for specific setups.",
  checked: "2026",
  items: [
    { processor: "Square", fact: "2.6% + $0.15 in person on the $0 Free plan, no contract, free next-day funding. Simplest start under about $25K a month." },
    { processor: "Helcim", fact: "Interchange + 0.40% + $0.08 in person, no contract. About $1,020 a month at $50K; no restaurant POS software." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month plus interchange + $0.08 in person. About $4,475 a month at $250K against $4,850 on Helcim." },
    { processor: "Clover", fact: "2.3% + $0.10 on Growth bundles, about $1,335 a month at $50K. 36-month hardware subscription that cannot be canceled." },
    { processor: "Toast", fact: "Traditional plan: 2.49% + $0.15 plus $69 a month, about $1,464 at $50K. 2-year agreement.", custom: { name: "Toast", partnerSlug: "toast", url: "https://pos.toasttab.com/pricing", variant: "visit" } },
    { processor: "Stripe", fact: "2.7% + $0.05 in person, 2.9% + $0.30 online, no contract. For delivery-only and multi-tenant ordering platforms." },
  ],
};

ARTICLE_OFFERS["best-payment-processors-ecommerce-2026"] = {
  heading: "Ecommerce processors at a glance",
  orderNote: "In the order of the article's verdict: Helcim up to about $50K a month, Stax from $50K, Stripe for global or developer-heavy stacks, then PayPal as a wallet button, Worldpay for large merchants and Square for omnichannel.",
  checked: "2026",
  items: [
    { processor: "Helcim", fact: "Interchange + 0.50% + $0.25 online, no monthly fee, no contract. 2.70% at $10K against 3.50% for Stripe." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month plus interchange + $0.15 online. $5,200 a month at $250K against $6,125 on Helcim." },
    { processor: "Stripe", fact: "2.9% + $0.30 online, no contract, 135-plus currencies. $8,750 a month at $250K; wins on tools, not price." },
    { processor: "PayPal", fact: "PayPal Checkout 3.49% + $0.49, about 4.47% on a $50 sale. Use it as a wallet button, not the primary processor." },
    { processor: "Worldpay", fact: "Part of Global Payments; custom quote, no published rates. For large merchants with an international or B2B mix.", custom: { name: "Worldpay", partnerSlug: "worldpay", url: "https://www.worldpay.com/en-us/contact", variant: "quote" } },
    { processor: "Square", fact: "2.9% + $0.30 online on paid plans (3.3% + $0.30 on Free). Small omnichannel sellers under $60K a month online." },
  ],
};

ARTICLE_OFFERS["best-payment-processors-yoga-and-fitness-studios-2026"] = {
  heading: "Studio processors at a glance",
  orderNote: "In the order of the article's verdict: Helcim up to about $60K a month, Square under $25K, Stripe for custom apps, Stax above $60K or card-on-file billing, then Clover and PayPal for narrower cases.",
  checked: "2026",
  items: [
    { processor: "Helcim", fact: "Interchange + 0.40% + $0.08 in person, no monthly fee, no contract. About $1,020 a month at $50K against $1,450 on Square Plus." },
    { processor: "Square", fact: "2.6% + $0.15 in person, no monthly fee on Free, Square Appointments for booking. For studios under $25K a month." },
    { processor: "Stripe", fact: "2.9% + $0.30 online, 2.7% + $0.05 in person, no contract. For custom booking apps and multi-location operators." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month plus interchange + $0.15 online. About $1,200 a month at $50K online against $1,275 on Helcim." },
    { processor: "Clover", fact: "2.3% to 2.6% + $0.10 in person; 36-month hardware subscriptions cannot be canceled. For retail-heavy studios." },
    { processor: "PayPal", fact: "2.29% + $0.09 in person, 3.49% + $0.49 standard. For donation-based studios and workshops above $100 a ticket." },
  ],
};

ARTICLE_OFFERS["best-payment-processors-professional-services-2026"] = {
  heading: "Professional services processors at a glance",
  orderNote: "In the order of the article's verdict: Helcim under about $50K a month, Stax from $50K, Payment Depot by quote, Stripe when billing needs API work, then Square for solo practices.",
  checked: "2026",
  items: [
    { processor: "Helcim", fact: "Interchange + 0.50% + $0.25 online, no monthly fee, no contract. About $270 a month at $10K online, $1,275 at $50K." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month plus interchange + $0.15 online. $1,200 a month at $50K online, $5,200 at $250K." },
    { processor: "Payment Depot", fact: "Quote-only interchange-plus. Pricing page lists $0 setup and no cancellation fees; get a written quote.", custom: { name: "Payment Depot", partnerSlug: "payment-depot", url: "https://paymentdepot.com/", variant: "quote" } },
    { processor: "Stripe", fact: "2.9% + $0.30 online, no monthly fee. About $1,750 a month at $50K online; worth it when billing needs API work." },
    { processor: "Square", fact: "2.6% + $0.15 in person, 3.5% + $0.15 keyed, free invoicing tool. For solo practices under $25K a month." },
  ],
};

ARTICLE_OFFERS["best-payment-processors-legal-practices-2026"] = {
  heading: "Law firm processors at a glance",
  orderNote: "In the order of the article's verdict: Helcim under about $50K a month, payments built into legal billing software such as LawPay, Stripe for custom portals, Stax from $50K, then Payment Depot by quote.",
  checked: "2026",
  items: [
    { processor: "Helcim", fact: "Interchange + 0.50% + $0.25 online, no monthly fee, no contract. About $270 a month at $10K online against $350 on Stripe." },
    { processor: "LawPay", fact: "Lists 2.99% + $0.30 and $19 a month; markets trust account protection and IOLTA compliance.", custom: { name: "LawPay", partnerSlug: null, url: "https://www.lawpay.com/pricing/", variant: "visit" } },
    { processor: "Stripe", fact: "2.9% + $0.30 online, ACH 0.8% capped at $5. For custom client portals; no IOLTA product on its pricing page." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month plus interchange + $0.15 online. $1,200 a month at $50K online against $1,275 on Helcim." },
    { processor: "Payment Depot", fact: "Quote-only interchange-plus. Pricing page lists $0 setup and no cancellation fees; get a written quote.", custom: { name: "Payment Depot", partnerSlug: "payment-depot", url: "https://paymentdepot.com/", variant: "quote" } },
  ],
};

ARTICLE_OFFERS["best-payment-processors-healthcare-practices-2026"] = {
  heading: "Healthcare processors at a glance",
  orderNote: "In the order of the article's verdict: Helcim up to about $60K a month, Square for solo practices, Stax above about $60K, Stripe for custom patient portals, then Payment Depot by quote.",
  checked: "2026",
  items: [
    { processor: "Helcim", fact: "Interchange + 0.40% + $0.08 in person, no monthly fee, BAA on request. About $1,020 a month at $50K in person." },
    { processor: "Square", fact: "2.6% + $0.15 in person on Free, no contract; HIPAA users agree to its BAA. For solo practices under $25K a month." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month plus interchange + $0.08 in person. $4,475 a month at $250K against $4,850 on Helcim." },
    { processor: "Stripe", fact: "2.9% + $0.30 online, 2.7% + $0.05 in person, no monthly fee. For custom patient portals; no BAA policy found." },
    { processor: "Payment Depot", fact: "Quote-only interchange-plus. Pricing page lists $0 setup and no cancellation fees; get a written quote.", custom: { name: "Payment Depot", partnerSlug: "payment-depot", url: "https://paymentdepot.com/", variant: "quote" } },
  ],
};

ARTICLE_OFFERS["best-payment-processors-dental-practices-2026"] = {
  heading: "Dental processors at a glance",
  orderNote: "In the order of the article's verdict: Helcim up to about $60K a month, Stax above it, Square under $25K, Stripe and Clover for narrow cases, then Payment Depot by quote.",
  checked: "2026",
  items: [
    { processor: "Helcim", fact: "Interchange + 0.40% + $0.08 in person, no monthly fee, no contract. $1,020 a month at $50K; no direct Dentrix integration." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month plus interchange + $0.08 in person. $4,475 a month at $250K against $4,850 on Helcim." },
    { processor: "Square", fact: "2.6% + $0.15 in person on Free, no contract, hardware from $59. For solo practices under $25K a month." },
    { processor: "Stripe", fact: "2.7% + $0.05 in person, 2.9% + $0.30 online. 2.80% at $50K in person; for custom patient-pay portals." },
    { processor: "Clover", fact: "2.3% + $0.10 on Growth bundles, about $1,335 a month at $50K. 36-month hardware subscriptions cannot be canceled." },
    { processor: "Payment Depot", fact: "Quote-only interchange-plus. Pricing page lists $0 setup and no cancellation fees; get a written quote.", custom: { name: "Payment Depot", partnerSlug: "payment-depot", url: "https://paymentdepot.com/", variant: "quote" } },
  ],
};

ARTICLE_OFFERS["best-payment-processors-automotive-shops-2026"] = {
  heading: "Auto shop processors at a glance",
  orderNote: "In the order of the article's verdict: Helcim up to about $60K a month, Stax above it, Square under $25K, Clover for counter hardware, Stripe for online parts and deposits, then Payment Depot by quote.",
  checked: "2026",
  items: [
    { processor: "Helcim", fact: "Interchange + 0.40% + $0.08 in person, no monthly fee, no contract. About $2,832 a month in our $150K shop example." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month plus interchange + $0.08 in person. About $2,617 in the $150K example, $215 below Helcim." },
    { processor: "Square", fact: "2.6% + $0.15 in person, hardware from $59, free next-day deposits. A starter for shops under $25K a month." },
    { processor: "Clover", fact: "2.3% to 2.6% + $0.10 in person plus $0 to $89.95+ a month; 36-month hardware subscriptions cannot be canceled." },
    { processor: "Stripe", fact: "2.9% + $0.30 online, 2.7% + $0.05 in person. For online parts and booking deposits; few shop-management integrations." },
    { processor: "Payment Depot", fact: "Quote-only interchange-plus. Pricing page lists $0 setup and no cancellation fees; get a written quote.", custom: { name: "Payment Depot", partnerSlug: "payment-depot", url: "https://paymentdepot.com/", variant: "quote" } },
  ],
};

ARTICLE_OFFERS["best-multi-acquirer-payment-processors-2026"] = {
  heading: "Multi-acquirer options at a glance",
  orderNote: "In the order of the article's verdict: Stripe, the only one here that publishes multi-processor routing, then Worldpay and Braintree on negotiated terms, then Helcim and Stax, which publish no multi-acquirer routing.",
  checked: "2026",
  items: [
    { processor: "Stripe", fact: "2.9% + $0.30 online. Orchestration routes across processors (private preview); Adaptive Acceptance retries declines." },
    { processor: "Worldpay", fact: "Part of Global Payments; custom quote, no published rates. Get routing, contract and every fee in writing.", custom: { name: "Worldpay", partnerSlug: "worldpay", url: "https://www.worldpay.com/en-us/contact", variant: "quote" } },
    { processor: "Braintree", fact: "2.89% + $0.29 for cards and wallets, Venmo 3.49% + $0.49. Does not publish whether it routes across acquirers." },
    { processor: "Helcim", fact: "Interchange + 0.40% + $0.08 in person, no monthly fee. $1,020 a month at $50K; no multi-acquirer routing published." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month plus interchange + $0.08 to $0.15. $4,475 at $250K in person; no multi-acquirer routing." },
  ],
};

ARTICLE_OFFERS["ai-subscription-billing-tools-2026"] = {
  heading: "Subscription billing tools at a glance",
  orderNote: "In the order of the article's verdict: Stripe Billing on features, Stax on cost from about $50K a month, Helcim at $10K, PayPal as a second consumer checkout, then Payment Depot by quote.",
  checked: "2026",
  items: [
    { processor: "Stripe", fact: "Stripe Billing: 0.7% of Billing volume on top of 2.9% + $0.30 online. Smart Retries uses AI to time retries." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month plus interchange + $0.15 online. $20,200 a month at $1M online against $35,000 on Stripe." },
    { processor: "Helcim", fact: "Interchange + 0.50% + $0.25 online plus 0.4% on recurring, no contract. Cheapest at $10K a month; rule-based retries." },
    { processor: "PayPal", fact: "PayPal Checkout 3.49% + $0.49 with a Subscriptions API. A second checkout for consumer subscriptions only." },
    { processor: "Payment Depot", fact: "Quote-only interchange-plus. Pricing page lists $0 setup and no cancellation fees; get a written quote.", custom: { name: "Payment Depot", partnerSlug: "payment-depot", url: "https://paymentdepot.com/", variant: "quote" } },
  ],
};


/** Database-rendered vs-pages that get the two-brand box. [first, second] match PROVIDER_META.processor. */
export const ARTICLE_VS: Record<string, [string, string]> = {
  "square-vs-helcim-2026": ["Helcim", "Square"],
  "stripe-vs-adyen-2026": ["Adyen", "Stripe"],
  "stripe-vs-stax-2026": ["Stax (Fattmerchant)", "Stripe"],
  "square-vs-shopify-payments-2026": ["Square", "Shopify Payments"],
};

/**
 * The one-line "choose X if" for each side of a verdict block, keyed by the
 * processor name. Facts only, consistent with ranking-2026.ts and the
 * provider's published pricing; no adjectives. Used by VsPicksBox.
 */
export const VS_CHOOSE: Record<string, string> = {
  Helcim: "cost is the priority: interchange-plus with no monthly fee, no contract, and a margin that drops as volume grows",
  Square: "you want free POS software, a $0 monthly plan and same-day transfers, and accept a flat rate for it",
  Stripe: "you need developer tools, subscription billing, marketplaces or many currencies, and accept 2.9% + 30¢ online for it",
  PayPal: "your customers already pay with PayPal and you want its 2.29% + 9¢ in-person rate",
  Adyen: "you sell online at volume or across borders and can meet a minimum monthly invoice it sets by industry and does not publish, for interchange++ + 0.60% + 13¢ on Visa and Mastercard",
  "Stax (Fattmerchant)": "your card volume is steady above about $10K a month and you want interchange plus 8¢ in person or 15¢ online for a $99 to $199+ monthly fee, with no percentage markup",
  "Shopify Payments": "you run a Shopify store, where any other processor adds a 0.2% to 2% third-party fee, and accept 2.9% + 30¢ online on Basic",
};

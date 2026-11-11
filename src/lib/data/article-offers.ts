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
  orderNote: "In the order of the article's ranking: Square under $30K a month, Helcim above $40K, as set out in the At a glance table.",
  checked: "2026",
  items: [
    { processor: "Square", fact: "2.6% + $0.15 in person, month-to-month, hardware from $59. Best under $30K a month." },
    { processor: "Helcim", fact: "Interchange + 0.40% + $0.08 in person, month-to-month. Best from $25K to $250K a month; no offline mode." },
    { processor: "Stripe", fact: "2.7% + $0.05 in person, month-to-month. For custom mobile apps; reserve policy is opaque." },
    { processor: "PayPal", fact: "PayPal Zettle: 2.29% + $0.09 in person, instant to your PayPal balance. Sudden volume can trigger holds." },
    { processor: "Clover", fact: "2.3% to 2.6% + $0.10 plus a plan fee; contract varies by reseller. Hardware locked to Fiserv." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month by annual volume plus interchange + $0.08. For $50K+ mobile B2B; breakeven near $30K a month." },
  ],
};

ARTICLE_OFFERS["best-no-contract-payment-processors-2026"] = {
  heading: "No-contract processors at a glance",
  orderNote: "In the order of the article's verdict: Helcim for $25K to $500K a month, Stripe for online-only, Square under $25K, Stax and Payment Depot above $80K.",
  checked: "2026",
  items: [
    { processor: "Helcim", fact: "Interchange + 0.40% + $0.08 in person, no monthly fee, no early-termination clause. Best for $25K to $500K a month." },
    { processor: "Stripe", fact: "2.9% + $0.30 online, 2.7% + $0.05 in person, month-to-month. Online plus developer tools; flat-rate premium above $50K." },
    { processor: "Square", fact: "2.6% + $0.15 in person, 2.9% + $0.30 online on paid plans (3.3% + $0.30 on Free). Best under $25K retail and food." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month by annual volume plus interchange + $0.08 in person. Best above $80K a month." },
    { processor: "Payment Depot", fact: "$79 to $199 a month plus interchange + $0.05 to $0.15, month-to-month. For $40K+ a month; POS hardware not included.", custom: { name: "Payment Depot", partnerSlug: "payment-depot", url: "https://www.paymentdepot.com/" } },
    { processor: "Clover", fact: "2.3% to 2.6% + 10¢ by plan, software $0 to $89.95+ a month. Hardware subscriptions run 36 months and cannot be canceled." },
    { processor: "PayPal", fact: "3.49% + $0.49 standard online, 2.29% + $0.09 in person, month-to-month. For low volume with PayPal-preferring buyers." },
  ],
};

ARTICLE_OFFERS["best-pos-systems-for-small-business-2026"] = {
  heading: "POS systems at a glance",
  orderNote: "In the order of the article's ranking: Square under $50K a month on free software, Helcim above $50K on interchange-plus.",
  checked: "2026",
  items: [
    { processor: "Square", fact: "2.6% + $0.15 in person on the Free plan, month to month, next-day deposits. Best under $50K a month." },
    { processor: "Clover", fact: "2.3% to 2.6% + 10¢ by plan, software $0 to $89.95+ a month; hardware subscriptions run 36 months. Restaurants and retail." },
    { processor: "Helcim", fact: "Interchange + 0.40% + $0.08 in person, month to month. Best for $25K to $500K a month; no instant payout option." },
    { processor: "Stripe", fact: "2.9% + $0.30 online, 2.7% + $0.05 in person, month to month. Online-first businesses." },
    { processor: "Stax (Fattmerchant)", fact: "$99 to $199+ a month by annual volume plus interchange + $0.08. Worth it from $80K a month, not under $50K." },
    { processor: "Payment Depot", fact: "$79 to $199 a month plus interchange + $0.05 to $0.15. For $40K to $200K a month; PCI fees extra.", custom: { name: "Payment Depot", partnerSlug: "payment-depot", url: "https://www.paymentdepot.com/" } },
    { processor: "PayPal", fact: "2.29% + $0.09 in person, 3.49% + $0.49 standard online. Online sellers; highest invoice rate." },
  ],
};

ARTICLE_OFFERS["best-payment-processors-marketplaces-2026"] = {
  heading: "Marketplace processors at a glance",
  orderNote: "In the order of the article's verdict: Stripe Connect first, PayPal Commerce Platform second, Worldpay for enterprise marketplaces above $100M a year.",
  checked: "2026",
  items: [
    { processor: "Stripe", fact: "Stripe Connect: 2.9% + $0.30 online plus Connect fees from 0.25% + $0.25 per payout. Split payments, sub-merchant KYC, payouts in 135+ currencies." },
    { processor: "PayPal", fact: "PayPal Commerce Platform: 2.89% + $0.29 to 3.49% + $0.49. B2C marketplaces with strong wallet conversion; holds on new sellers." },
    { processor: "Worldpay", fact: "Custom interchange-plus-plus pricing, typically a 3-year contract. $100M+ GMV enterprise marketplaces; 7 to 14 day onboarding.", custom: { name: "Worldpay", partnerSlug: "worldpay", url: "https://www.worldpay.com/en-us/contact", variant: "quote" } },
    { processor: "Helcim", fact: "Interchange + 0.50% + $0.25 online, month-to-month. Single-merchant SaaS, no native sub-merchant API." },
    { processor: "Square", fact: "2.9% + $0.30 online (3.3% + $0.30 on Free), 2.6% + $0.15 in person. Small sellers on Square POS; holds funds on facilitator-like flows." },
  ],
};

ARTICLE_OFFERS["best-fast-funding-payment-processors-2026"] = {
  heading: "Fast-funding options at a glance",
  orderNote: "In the order of the article's ranking: Square for in-person merchants under $200K a month, Stripe and PayPal at 1.5% for instant transfers, Helcim as the free next-day alternative.",
  checked: "2026",
  items: [
    { processor: "Square", fact: "Next business day free; same-day or instant transfer 1.95%. In-person retail under $200K a month; account holds can freeze deposits." },
    { processor: "Stripe", fact: "T+2 rolling; Instant Payouts 1.5%, $0.50 minimum. Online platforms above $100K a month; first payout takes 7 to 14 days." },
    { processor: "PayPal", fact: "T+1; instant transfer 1.5%, $0.50 minimum, up to $25,000 per bank transfer. Merchants already paid through PayPal." },
    { processor: "Clover", fact: "T+1; Rapid Deposit fee set by the acquirer. Restaurants on Clover hardware." },
    { processor: "Helcim", fact: "T+1, no instant option. Lowest effective rate from $50K a month." },
  ],
};

ARTICLE_OFFERS["best-high-risk-friendly-payment-processors-2026"] = {
  heading: "Who actually takes high-risk merchants",
  orderNote: "In the order of the article's verdict: only Worldpay runs a dedicated high-risk desk; Helcim, Stax, Payment Depot and Clover take mid-risk; Stripe, Square and PayPal exclude most high-risk MCCs at signup.",
  checked: "2026",
  items: [
    { processor: "Worldpay", fact: "Custom interchange-plus, 1 to 3 year contract, 1-day settlement. Dedicated high-risk underwriting with rolling reserves; 7 to 14 day underwriting.", custom: { name: "Worldpay", partnerSlug: "worldpay", url: "https://www.worldpay.com/en-us/contact", variant: "quote" } },
    { processor: "Helcim", fact: "Interchange + 0.50% + $0.25 online, no contract. Mid-risk B2B and retail; declines most high-risk MCCs." },
    { processor: "Stax (Fattmerchant)", fact: "$99 a month plus interchange + $0.08 in person, month-to-month. $50K+ low-risk volume; standard underwriting, no high-risk desk." },
    { processor: "Payment Depot", fact: "$79 to $199 a month plus interchange + $0.05 to $0.15, month-to-month. $25K+ low-risk volume; same underwriting posture as Stax.", custom: { name: "Payment Depot", partnerSlug: "payment-depot", url: "https://www.paymentdepot.com/" } },
    { processor: "Clover", fact: "$14.95 to $54.95 a month plus 2.3% to 2.6%; 1 to 3 year hardware term. Low-risk brick-and-mortar; the Fiserv backend declines high-risk." },
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

/** Database-rendered vs-pages that get the two-brand box. [first, second] match PROVIDER_META.processor. */
export const ARTICLE_VS: Record<string, [string, string]> = {
  "square-vs-helcim-2026": ["Helcim", "Square"],
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
};

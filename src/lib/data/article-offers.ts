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
    { processor: "Clover", fact: "$14.95 to $54.95 a month plus 2.3% to 2.6% + $0.10. Month-to-month direct from Clover.com; reseller contracts run 36 to 48 months." },
    { processor: "PayPal", fact: "3.49% + $0.49 standard online, 2.29% + $0.09 in person, month-to-month. For low volume with PayPal-preferring buyers." },
  ],
};

ARTICLE_OFFERS["best-pos-systems-for-small-business-2026"] = {
  heading: "POS systems at a glance",
  orderNote: "In the order of the article's ranking: Square under $50K a month on free software, Helcim above $50K on interchange-plus.",
  checked: "2026",
  items: [
    { processor: "Square", fact: "2.6% + $0.15 in person on the Free plan, month to month, next-day deposits. Best under $50K a month." },
    { processor: "Clover", fact: "$14.95 to $54.95 a month plus 2.3% to 2.6% + $0.10; hardware leases run 36 to 48 months. Restaurants and retail." },
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

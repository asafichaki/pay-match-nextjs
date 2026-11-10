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
  /** Must match PROVIDER_META.processor in ranking-2026.ts */
  processor: string;
  /** The deciding fact, from the article body. */
  fact: string;
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

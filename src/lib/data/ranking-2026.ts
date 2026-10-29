/**
 * The one ranking on the site, computed from each provider's published prices.
 *
 * Before October 2026 this file read a May dataset whose numbers did not
 * reproduce from any stated assumption (Stripe online at 2.97% implies a $430
 * average sale; Braintree at 2.67% sat below its own published 2.89% + 29c).
 * Every price below was re-read from the provider's own pricing page on
 * PRICES_CHECKED_ISO, and the effective rate is computed by one formula that a
 * reader can redo with a calculator:
 *
 *   effective rate = percentage + fixed fee / average sale + monthly fee / volume
 *
 * Interchange-plus providers add an interchange estimate (ASSUMPTIONS below),
 * because their price is "network cost plus markup". For plan-based providers
 * the cheapest plan at each volume is used. Commercial status never enters the
 * sort: it only decides whether the Visit button goes through /go/.
 */

export type TierIndex = 0 | 1 | 2 | 3;
export const TIER_LABELS = ["$10K", "$50K", "$250K", "$1M"] as const;
const TIER_DOLLARS = [10_000, 50_000, 250_000, 1_000_000];

export const PRICES_CHECKED_ISO = "2026-10-29";
export const RATES_CHECKED = "Oct 29, 2026";

/** The assumptions, published on the page next to the table. */
export const ASSUMPTIONS = {
  averageSale: 50,
  cardMix: "60% credit, 40% debit",
  /**
   * Blended interchange plus card-network assessments for that card mix at a
   * $50 sale, as a percentage. Credit: Visa/Mastercard consumer credit
   * interchange of roughly 1.8% to 2.4% + 10c depending on card and channel,
   * plus about 0.14% in network assessments. Debit: the Regulation II cap of
   * 21c + 0.05% + 1c for large issuers. An estimate, stated as one.
   */
  interchangeInPerson: 1.55,
  interchangeOnline: 1.7,
};

type Channel = "In-person" | "Online";

interface Plan {
  label: string;
  /** Percentage, e.g. 2.6 for 2.6% */
  pct: number;
  /** Fixed fee per transaction in dollars */
  fixed: number;
  /** Monthly fee in dollars */
  monthly: number;
  /** True when pct is a markup on top of interchange */
  icPlus?: boolean;
}

export interface ProviderMeta {
  processor: string;
  name: string;
  partnerSlug: string | null;
  pricingUrl: string;
  bestFor: string;
  pricingModel: string;
  reviewHref?: string;
  /** Kept for type compatibility; no provider publishes a minimum we can use. */
  minMonthly?: number;
  /** Shown under the provider wherever it appears. */
  caveat?: string;
  /** Official logo under /public/images/logos. */
  logo?: string;
  plans: Partial<Record<Channel, Plan[] | ((monthlyVolume: number) => Plan[])>>;
}

/** Helcim publishes margins that step down by monthly volume. */
function helcimTier(v: number, channel: Channel): Plan {
  const ip: [number, number, number][] = [[50_000, 0.4, 0.08], [100_000, 0.35, 0.07], [500_000, 0.25, 0.07], [1_000_000, 0.2, 0.06], [Infinity, 0.15, 0.06]];
  const on: [number, number, number][] = [[50_000, 0.5, 0.25], [100_000, 0.45, 0.2], [500_000, 0.35, 0.2], [1_000_000, 0.25, 0.15], [Infinity, 0.15, 0.15]];
  const t = (channel === "In-person" ? ip : on).find(([cap]) => v < cap)!;
  return { label: "Volume tier", pct: t[1], fixed: t[2], monthly: 0, icPlus: true };
}

/** Stax sets its subscription by annual volume. */
const staxMonthly = (v: number) => (v * 12 <= 150_000 ? 99 : v * 12 <= 250_000 ? 139 : 199);

export const PROVIDER_META: ProviderMeta[] = [
  {
    processor: "Helcim", logo: "/images/logos/helcim.svg", name: "Helcim", partnerSlug: "helcim", pricingUrl: "https://www.helcim.com/pricing/",
    pricingModel: "Interchange-plus, no monthly fee",
    bestFor: "Most small and mid-size businesses that want low, transparent pricing with no contract",
    reviewHref: "/comparisons/helcim-vs-stripe",
    plans: { "In-person": (v) => [helcimTier(v, "In-person")], Online: (v) => [helcimTier(v, "Online")] },
  },
  {
    processor: "PayPal", logo: "/images/logos/paypal.svg", name: "PayPal", partnerSlug: "paypal", pricingUrl: "https://www.paypal.com/us/business/paypal-business-fees",
    pricingModel: "Flat rate",
    bestFor: "Businesses that already sell through PayPal and want a cheap in-person option",
    reviewHref: "/comparisons/paypal-vs-square",
    caveat: "Advanced card processing and PayPal POS are subject to PayPal's approval.",
    plans: {
      "In-person": [{ label: "PayPal POS", pct: 2.29, fixed: 0.09, monthly: 0 }],
      Online: [{ label: "Advanced Credit and Debit", pct: 2.89, fixed: 0.29, monthly: 0 }],
    },
  },
  {
    processor: "Adyen", logo: "/images/logos/adyen.svg", name: "Adyen", partnerSlug: "adyen", pricingUrl: "https://www.adyen.com/pricing",
    pricingModel: "Interchange++ plus fixed fee",
    bestFor: "Larger and international businesses that need one platform across countries",
    reviewHref: "/comparisons/stripe-vs-adyen-2026",
    caveat: "Adyen applies a minimum monthly invoice it does not publish, so small merchants may not qualify.",
    plans: { Online: [{ label: "Visa and Mastercard", pct: 0.6, fixed: 0.13, monthly: 0, icPlus: true }] },
  },
  {
    processor: "Stax (Fattmerchant)", logo: "/images/logos/stax.png", name: "Stax", partnerSlug: "stax", pricingUrl: "https://staxpayments.com/pricing/",
    pricingModel: "Subscription, interchange at cost",
    bestFor: "Businesses above about $25K a month that can spread a subscription fee",
    plans: {
      "In-person": (v) => [{ label: "Subscription", pct: 0, fixed: 0.08, monthly: staxMonthly(v), icPlus: true }],
      Online: (v) => [{ label: "Subscription", pct: 0, fixed: 0.15, monthly: staxMonthly(v), icPlus: true }],
    },
  },
  {
    processor: "Stripe", logo: "/images/logos/stripe.svg", name: "Stripe", partnerSlug: "stripe", pricingUrl: "https://stripe.com/pricing",
    pricingModel: "Flat rate, no monthly fee",
    bestFor: "Online businesses, SaaS and subscriptions that want a custom checkout",
    reviewHref: "/comparisons/stripe-vs-paypal",
    plans: {
      "In-person": [{ label: "Terminal", pct: 2.7, fixed: 0.05, monthly: 0 }],
      Online: [{ label: "Standard", pct: 2.9, fixed: 0.3, monthly: 0 }],
    },
  },
  {
    processor: "Clover", logo: "/images/logos/clover.png", name: "Clover", partnerSlug: "clover", pricingUrl: "https://www.clover.com/pricing",
    pricingModel: "Flat rate plus software plan",
    bestFor: "Restaurants and retail that want POS hardware and software in one system",
    caveat: "Clover sold through a bank can carry different rates and terms than Clover.com.",
    plans: {
      "In-person": [
        { label: "Starter", pct: 2.6, fixed: 0.1, monthly: 0 },
        { label: "Essentials", pct: 2.5, fixed: 0.1, monthly: 29.95 },
        { label: "Retail Growth", pct: 2.3, fixed: 0.1, monthly: 84.95 },
      ],
      Online: [{ label: "Keyed", pct: 3.5, fixed: 0.1, monthly: 0 }],
    },
  },
  {
    processor: "Shopify Payments", logo: "/images/logos/shopify.svg", name: "Shopify Payments", partnerSlug: "shopify", pricingUrl: "https://www.shopify.com/pricing",
    pricingModel: "Flat rate, tied to a Shopify plan",
    bestFor: "Stores that run on Shopify, online and in person",
    caveat: "Only available with a Shopify plan. The plan fee is not counted here because you pay it for the store, not for processing.",
    plans: {
      "In-person": [{ label: "Basic", pct: 2.6, fixed: 0.1, monthly: 0 }],
      Online: [{ label: "Basic", pct: 2.9, fixed: 0.3, monthly: 0 }],
    },
  },
  {
    processor: "Square", logo: "/images/logos/square.svg", name: "Square", partnerSlug: "square", pricingUrl: "https://squareup.com/us/en/pricing",
    pricingModel: "Flat rate, optional paid plans",
    bestFor: "New and small in-person sellers who want to start the same day with no contract",
    reviewHref: "/comparisons/square-vs-stripe",
    plans: {
      "In-person": [
        { label: "Free", pct: 2.6, fixed: 0.15, monthly: 0 },
        { label: "Plus", pct: 2.5, fixed: 0.15, monthly: 49 },
        { label: "Premium", pct: 2.4, fixed: 0.15, monthly: 149 },
      ],
      Online: [{ label: "Online API", pct: 2.9, fixed: 0.3, monthly: 0 }],
    },
  },
  {
    processor: "Braintree", logo: "/images/logos/braintree.svg", name: "Braintree", partnerSlug: null, pricingUrl: "https://www.paypal.com/us/enterprise/paypal-braintree-fees",
    pricingModel: "Flat rate, online only",
    bestFor: "Marketplaces and apps that want cards, PayPal and Venmo in one integration",
    plans: { Online: [{ label: "Cards and wallets", pct: 2.89, fixed: 0.29, monthly: 0 }] },
  },
  {
    processor: "Authorize.net", logo: "/images/logos/authorize-net.svg", name: "Authorize.net", partnerSlug: null, pricingUrl: "https://www.authorize.net/sign-up/pricing.html",
    pricingModel: "Flat rate plus $25 monthly fee",
    bestFor: "Merchants whose shopping cart or software requires an Authorize.net gateway",
    plans: { Online: [{ label: "All-in-one", pct: 2.9, fixed: 0.3, monthly: 25 }] },
  },
];

/** Not ranked, with the reason shown on the page. */
export const NOT_RANKED: { name: string; reason: string }[] = [
  { name: "Payment Depot", reason: "its pricing page lists per-transaction fees but no longer shows the membership fee, so the full cost cannot be computed" },
  { name: "Worldpay", reason: "it publishes no price list; pricing is negotiated" },
  { name: "Leaders Merchant Services", reason: "it publishes no small-business pricing" },
  { name: "Paysafe", reason: "it publishes no small-business pricing" },
];

function plansFor(m: ProviderMeta, ch: Channel, v: number): Plan[] {
  const p = m.plans[ch];
  if (!p) return [];
  return typeof p === "function" ? p(v) : p;
}

function effective(plan: Plan, ch: Channel, v: number): number {
  const ic = plan.icPlus ? (ch === "In-person" ? ASSUMPTIONS.interchangeInPerson : ASSUMPTIONS.interchangeOnline) : 0;
  return ic + plan.pct + (plan.fixed / ASSUMPTIONS.averageSale) * 100 + (plan.monthly / v) * 100;
}

/** Cheapest plan for one channel at a volume. */
function bestPlan(m: ProviderMeta, ch: Channel, v: number): { rate: number; plan: Plan } | null {
  let best: { rate: number; plan: Plan } | null = null;
  for (const plan of plansFor(m, ch, v)) {
    const rate = effective(plan, ch, v);
    if (!best || rate < best.rate) best = { rate, plan };
  }
  return best;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function scoreAt(m: ProviderMeta, t: TierIndex) {
  const v = TIER_DOLLARS[t];
  const ip = bestPlan(m, "In-person", v);
  const on = bestPlan(m, "Online", v);
  const useIp = ip !== null && (on === null || ip.rate <= on.rate);
  const pick = useIp ? ip! : on!;
  return { score: pick.rate, channel: useIp ? "In-person" : "Online", plan: pick.plan.label, ip: ip?.rate, on: on?.rate };
}

export interface RankedProvider extends ProviderMeta {
  rank: number;
  score: number;
  scoreChannel: string;
  scorePlan: string;
  online?: number;
  inPerson?: number;
  average: number;
}

/** Providers ranked by the published rule at a volume. */
export function rankAt(tier: TierIndex): RankedProvider[] {
  const out: RankedProvider[] = PROVIDER_META.map((m) => {
    const s = scoreAt(m, tier);
    const average = ([0, 1, 2, 3] as TierIndex[]).reduce<number>((a, t) => a + scoreAt(m, t).score, 0) / 4;
    return {
      ...m,
      rank: 0,
      score: round2(s.score),
      scoreChannel: s.channel,
      scorePlan: s.plan,
      online: s.on === undefined ? undefined : round2(s.on),
      inPerson: s.ip === undefined ? undefined : round2(s.ip),
      average,
    };
  });
  out.sort((a, b) => a.score - b.score || a.average - b.average || a.name.localeCompare(b.name));
  out.forEach((p, i) => (p.rank = i + 1));
  return out;
}

/** Kept for callers that list exclusions per volume; none apply now. */
export function excludedAt(tier: TierIndex): ProviderMeta[] {
  void tier;
  return [];
}

export function formatRate(n: number | undefined | null): string {
  return n === undefined || n === null ? "n/a" : `${n.toFixed(2)}%`;
}

export function monthlyCost(rate: number, tier: TierIndex): string {
  return `$${Math.round((rate / 100) * TIER_DOLLARS[tier]).toLocaleString("en-US")}`;
}

export interface TableRow extends ProviderMeta {
  rank: number | null;
  rates: (number | null)[];
  channels: string[];
  scoreChannel: string;
}

/** The single main table: every ranked provider, all four volumes. */
export function mainTable(): TableRow[] {
  return rankAt(0).map((r) => ({
    ...r,
    rates: ([0, 1, 2, 3] as TierIndex[]).map((t) => round2(scoreAt(r, t).score)),
    channels: Object.keys(r.plans),
  }));
}

export function cheapestPerTier(rows: TableRow[]): (number | null)[] {
  return [0, 1, 2, 3].map((t) => {
    const vals = rows.map((r) => r.rates[t]).filter((v): v is number => v !== null);
    return vals.length ? Math.min(...vals) : null;
  });
}

/** Per-channel effective rate at a volume, for review blocks. */
export function channelRates(m: ProviderMeta, tier: TierIndex): { inPerson: number | null; online: number | null } {
  const v = TIER_DOLLARS[tier];
  const ip = bestPlan(m, "In-person", v);
  const on = bestPlan(m, "Online", v);
  return { inPerson: ip ? round2(ip.rate) : null, online: on ? round2(on.rate) : null };
}

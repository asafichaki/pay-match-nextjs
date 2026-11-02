/**
 * Numbers for the head-to-head pages (square-vs-stripe, stripe-vs-paypal,
 * helcim-vs-stripe), computed from the one ranking engine.
 *
 * Two kinds of figure live here:
 *
 *  1. Effective rates and monthly costs. These come from `ranking-2026.ts`
 *     (`channelRates`, the same formula and ASSUMPTIONS the best-of page uses),
 *     so a vs-page can never disagree with /comparisons/best-payment-processors-2026.
 *  2. Product-level fees the ranking does not model (PayPal's Checkout button,
 *     Square Free's online store rate, dispute fees, payout timing, ACH). Each
 *     was read from the provider's own page on PRICES_CHECKED_ISO and is copied
 *     from the research file provider-facts.json (vault, research-2026-10-28).
 *     Effective rates for these use `flatEffective`, the ranking's formula.
 *
 * Nothing here is an estimate except the interchange figure the ranking itself
 * publishes in ASSUMPTIONS.
 */
import {
  ASSUMPTIONS,
  PROVIDER_META,
  PRICES_CHECKED_ISO,
  RATES_CHECKED,
  TIER_LABELS,
  channelRates,
  monthlyCost,
  type ProviderMeta,
  type TierIndex,
} from "./ranking-2026";

export { ASSUMPTIONS, PRICES_CHECKED_ISO, RATES_CHECKED, TIER_LABELS };
export type { TierIndex };

/** The three volumes every vs-page table shows. */
export const VS_TIERS: TierIndex[] = [0, 1, 2];

/** Dollar volume per tier, checked against the ranking's own monthlyCost so the two cannot drift. */
const TIER_VOLUME: Record<TierIndex, number> = { 0: 10_000, 1: 50_000, 2: 250_000, 3: 1_000_000 };
for (const t of [0, 1, 2, 3] as TierIndex[]) {
  if (monthlyCost(100, t) !== `$${TIER_VOLUME[t].toLocaleString("en-US")}`) {
    throw new Error(`vs-pages-2026: tier ${t} volume no longer matches ranking-2026`);
  }
}
export const tierVolume = (t: TierIndex) => TIER_VOLUME[t];

export type Channel = "In-person" | "Online";

function meta(processor: string): ProviderMeta {
  const m = PROVIDER_META.find((p) => p.processor === processor);
  if (!m) throw new Error(`vs-pages-2026: unknown processor ${processor}`);
  return m;
}

/** Effective rate (%) from the ranking engine, cheapest plan for that channel. */
export function engineRate(processor: string, channel: Channel, t: TierIndex): number | null {
  const r = channelRates(meta(processor), t);
  return channel === "In-person" ? r.inPerson : r.online;
}

export interface FlatFee {
  /** e.g. 3.49 for 3.49% */
  pct: number;
  /** dollars per transaction */
  fixed: number;
}

/** Same formula as ranking-2026 for a flat-rate product: % + fixed / average sale. */
export function flatEffective(f: FlatFee, monthly = 0, volume = 10_000): number {
  return Math.round((f.pct + (f.fixed / ASSUMPTIONS.averageSale) * 100 + (monthly / volume) * 100) * 100) / 100;
}

/** Whole dollars a month at a tier for an effective rate. */
export function dollarsAt(rate: number, t: TierIndex): number {
  return Math.round((rate / 100) * TIER_VOLUME[t]);
}

export const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
export const pct = (n: number | null | undefined) => (n === null || n === undefined ? "n/a" : `${n.toFixed(2)}%`);
/** "2.9% + 30¢" */
export function feeLabel(f: FlatFee): string {
  const cents = Math.round(f.fixed * 100);
  return `${+f.pct.toFixed(2)}% + ${cents}¢`;
}

/** Ticket size at which two flat fees cost the same: (fixedA - fixedB) / (pctB - pctA). */
export function crossoverTicket(a: FlatFee, b: FlatFee): number {
  return Math.round((a.fixed - b.fixed) / ((b.pct - a.pct) / 100));
}

/** Product fees not modeled by the ranking. Source: provider-facts.json, checked 2026-10-29. */
export const FEES = {
  square: {
    pricingUrl: "https://squareup.com/us/en/pricing",
    inPersonFree: { pct: 2.6, fixed: 0.15 },
    inPersonPlus: { pct: 2.5, fixed: 0.15 },
    inPersonPremium: { pct: 2.4, fixed: 0.15 },
    onlineFree: { pct: 3.3, fixed: 0.3 },
    onlinePaidOrApi: { pct: 2.9, fixed: 0.3 },
    manual: { pct: 3.5, fixed: 0.15 },
    planPlus: 49,
    planPremium: 149,
    instantPayoutPct: 1.95,
    internationalAddPct: 1.5,
    ach: "1% ($1 minimum; capped at $10 on Plus and Premium invoices, $5 through the API)",
    payouts: "Next business day, free",
    hardware: "Hardware starts at $59",
    contract: "No locked-in contract",
    customPricing: "Custom pricing only above $250,000 a year in card sales",
  },
  stripe: {
    pricingUrl: "https://stripe.com/pricing",
    inPerson: { pct: 2.7, fixed: 0.05 },
    online: { pct: 2.9, fixed: 0.3 },
    manual: { pct: 3.4, fixed: 0.3 },
    tapToPayAdd: 0.1,
    internationalAddPct: 1.5,
    conversionAddPct: 1,
    dispute: 15,
    disputeCounter: 15,
    achPct: 0.8,
    achCap: 5,
    instantPayoutPct: 1.5,
    instantPayoutMin: 0.5,
    payouts: "2 business days (first payout typically 7 to 14 days)",
    hardware: "Reader M2 $59; S700 and S710 $299; T600 $329",
    contract: "Pay as you go, no monthly fee",
    customPricing: "Custom pricing for large volume, no published threshold",
  },
  paypal: {
    pricingUrl: "https://www.paypal.com/us/business/paypal-business-fees",
    checkout: { pct: 3.49, fixed: 0.49 },
    standardCard: { pct: 2.99, fixed: 0.49 },
    advancedCard: { pct: 2.89, fixed: 0.29 },
    virtualTerminal: { pct: 3.39, fixed: 0.29 },
    payLater: { pct: 4.99, fixed: 0.49 },
    pos: { pct: 2.29, fixed: 0.09 },
    posManual: { pct: 3.49, fixed: 0.09 },
    internationalAddPct: 1.5,
    chargeback: 20,
    achPct: 0.8,
    achCap: 5,
    instantPayoutPct: 1.5,
    instantPayoutMin: 0.5,
    payouts: "Standard withdrawal to bank free; instant transfer 1.5% (50¢ minimum)",
    monthlyPlans: "No monthly fee for PayPal POS or Advanced Credit and Debit; Payments Advanced $5 a month; Payments Pro $30 a month",
  },
  helcim: {
    pricingUrl: "https://www.helcim.com/pricing/",
    inPersonFirstTier: { pct: 0.4, fixed: 0.08 },
    onlineFirstTier: { pct: 0.5, fixed: 0.25 },
    recurringAddPct: 0.4,
    chargebackLost: 15,
    achLabel: "0.5% + 25¢, capped at $6",
    tapToPayAdd: 0.1,
    payouts: "Next business morning, free",
    hardware: "Card Reader $199; Smart Terminal $349 or $32 a month for a year",
    contract: "No contract, no monthly, setup, PCI or cancellation fee",
    tierBreaks: "$50K, $100K, $500K and $1M",
  },
} as const;

/** Dollar cost of one flat fee on a slice of volume at a given average sale (worked examples). */
export function costFor(volume: number, averageSale: number, f: FlatFee): number {
  return volume * (f.pct / 100) + (volume / averageSale) * f.fixed;
}

/** Interchange level at which an interchange-plus margin equals a flat effective rate. */
export function breakEvenInterchange(flatRate: number, margin: FlatFee): number {
  return Math.round((flatRate - margin.pct - (margin.fixed / ASSUMPTIONS.averageSale) * 100) * 100) / 100;
}

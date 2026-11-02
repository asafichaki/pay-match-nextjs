import {
  FEES,
  TIER_LABELS,
  crossoverTicket,
  dollarsAt,
  engineRate,
  feeLabel,
  flatEffective,
  pct,
  tierVolume,
  usd,
} from "@/lib/data/vs-pages-2026";

const sq = FEES.square;
const st = FEES.stripe;

/** Every figure the page and its schema print, computed once. */
export const N = {
  sqIp: [0, 1, 2].map((t) => engineRate("Square", "In-person", t as 0 | 1 | 2)!),
  stIp: [0, 1, 2].map((t) => engineRate("Stripe", "In-person", t as 0 | 1 | 2)!),
  sqOnApi: [0, 1, 2].map((t) => engineRate("Square", "Online", t as 0 | 1 | 2)!),
  stOn: [0, 1, 2].map((t) => engineRate("Stripe", "Online", t as 0 | 1 | 2)!),
  sqOnFree: flatEffective(sq.onlineFree),
  helcimIp: [0, 1, 2].map((t) => engineRate("Helcim", "In-person", t as 0 | 1 | 2)!),
  staxIp250: engineRate("Stax (Fattmerchant)", "In-person", 2)!,
  crossover: crossoverTicket(sq.inPersonFree, st.inPerson),
};

const gap10 = dollarsAt(N.sqIp[0], 0) - dollarsAt(N.stIp[0], 0);
const gap250 = dollarsAt(N.stIp[2], 2) - dollarsAt(N.sqIp[2], 2);

export const ANSWER = `In person, Stripe is slightly cheaper for most small businesses: ${feeLabel(st.inPerson)} against Square's ${feeLabel(sq.inPersonFree)}, which works out to ${pct(N.stIp[0])} vs ${pct(N.sqIp[0])} on a $50 average sale, or ${usd(gap10)} a month less at ${TIER_LABELS[0]}. Square wins once your average sale is above $${N.crossover}, and at ${TIER_LABELS[2]} a month on its Premium plan (${pct(N.sqIp[2])} vs ${pct(N.stIp[2])}, ${usd(gap250)} a month less). Online both charge ${feeLabel(st.online)}, except Square's Free plan, which charges ${feeLabel(sq.onlineFree)} on its online store and invoices.`;

export const META_DESCRIPTION = `Stripe ${feeLabel(st.inPerson)} vs Square ${feeLabel(sq.inPersonFree)} in person, both ${feeLabel(st.online)} online. Monthly cost at $10K, $50K and $250K, prices checked Oct 2026.`;

export const FAQ: { q: string; a: string }[] = [
  {
    q: "Which is cheaper, Square or Stripe?",
    a: `For in-person sales, Stripe usually is: ${feeLabel(st.inPerson)} against Square's ${feeLabel(sq.inPersonFree)}. The two cost the same at a $${N.crossover} sale; below that Stripe's lower fixed fee wins, above it Square's lower percentage wins. Online they are the same ${feeLabel(st.online)}, unless you use Square's Free plan online store or invoices at ${feeLabel(sq.onlineFree)}. For bank payments Stripe's ACH is ${st.achPct}% capped at $${st.achCap}; Square's is ${sq.ach}.`,
  },
  {
    q: "What is the difference between Stripe and Square?",
    a: "Square is a point-of-sale company first: a free POS app, its own hardware, and next-business-day deposits at no cost. Stripe is an online payments platform first: APIs, a hosted checkout, subscription billing and support for 135+ currencies, with in-person payments through Stripe Terminal readers. Card fees are close; the tools are not.",
  },
  {
    q: "Which is better for restaurants and retail?",
    a: "Square, for most owners. It includes POS software for retail, restaurants and appointments, sells its own readers and registers, and deposits next business day for free. Stripe Terminal takes in-person payments, but you need a third-party POS or a developer to build the checkout around it.",
  },
  {
    q: "Which is better for SaaS and subscription businesses?",
    a: "Stripe. Stripe Billing handles usage-based, tiered and per-seat pricing, failed-payment retries and a customer portal. Square offers basic recurring invoices, which is enough for a simple monthly membership but not for software billing.",
  },
  {
    q: "Do I need a developer for Stripe?",
    a: "Not for the basics. Stripe works with Shopify, WooCommerce and other carts, and offers hosted checkout pages and payment links with no code. You need a developer for a custom checkout, a marketplace, or in-person payments without an off-the-shelf POS.",
  },
  {
    q: "How fast do Square and Stripe pay out?",
    a: `Square deposits the next business day for free, and instant or same-day transfers cost ${sq.instantPayoutPct}%. Stripe pays out in 2 business days (your first payout typically takes 7 to 14 days), and Instant Payouts cost ${st.instantPayoutPct}% with a 50¢ minimum.`,
  },
  {
    q: "Does Square charge a monthly fee?",
    a: `Not on Square Free, where you pay only per transaction. Square Plus costs $${sq.planPlus} and Square Premium $${sq.planPremium} a month per location; both lower the in-person rate (to ${feeLabel(sq.inPersonPlus)} and ${feeLabel(sq.inPersonPremium)}) and the online rate to ${feeLabel(sq.onlinePaidOrApi)}. Premium only pays for itself at high volume: at ${TIER_LABELS[1]} a month Plus and Free cost about the same.`,
  },
  {
    q: "When does it make sense to leave Square or Stripe?",
    a: `When cost matters more than the tools. On the same assumptions, Helcim's interchange-plus pricing costs ${pct(N.helcimIp[0])} in person at ${TIER_LABELS[0]} a month and ${pct(N.helcimIp[2])} at ${TIER_LABELS[2]}, against ${pct(N.stIp[0])} for Stripe. At ${TIER_LABELS[2]} that is about ${usd(dollarsAt(N.stIp[2], 2) - dollarsAt(N.helcimIp[2], 2))} a month. Interchange-plus rates move with your card mix, so check the estimate against your own statement.`,
  },
  {
    q: "Can Square or Stripe hold my money?",
    a: "Yes, both. Their agreements let them hold funds, add a reserve or close an account when they see risk, such as a sudden jump in volume or a high chargeback rate. If you sell in a category processors treat as high risk, keep a second merchant account ready so a hold does not stop your business.",
  },
  {
    q: "Can I switch from Square to Stripe, or the other way?",
    a: "Yes. Neither locks you into a contract. Plan for the work rather than a fee: new hardware or a new POS, moving saved cards and subscriptions, and running both side by side for a short overlap.",
  },
];

/** Worked examples: two businesses, same formula as the table. */
const coffee = { volume: 30_000, avg: 8, inPersonShare: 0.9 };
const saas = { volume: 100_000, avg: 200 };
const c = (v: number, avg: number, f: { pct: number; fixed: number }) => v * (f.pct / 100) + (v / avg) * f.fixed;
export const EXAMPLES = {
  coffee: {
    ...coffee,
    square: c(coffee.volume * coffee.inPersonShare, coffee.avg, sq.inPersonFree) + c(coffee.volume * (1 - coffee.inPersonShare), coffee.avg, sq.onlinePaidOrApi),
    stripe: c(coffee.volume * coffee.inPersonShare, coffee.avg, st.inPerson) + c(coffee.volume * (1 - coffee.inPersonShare), coffee.avg, st.online),
  },
  saas: {
    ...saas,
    squareFree: c(saas.volume, saas.avg, sq.onlineFree),
    squareApi: c(saas.volume, saas.avg, sq.onlinePaidOrApi),
    stripe: c(saas.volume, saas.avg, st.online),
  },
};

export const VOLUME_250K = tierVolume(2);

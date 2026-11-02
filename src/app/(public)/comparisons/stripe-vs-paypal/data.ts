import { FEES, TIER_LABELS, dollarsAt, engineRate, feeLabel, flatEffective, pct, usd } from "@/lib/data/vs-pages-2026";

const st = FEES.stripe;
const pp = FEES.paypal;

/** Every figure the page and its schema print, computed once from vs-pages-2026. */
export const N = {
  stOn: engineRate("Stripe", "Online", 0)!,
  stIp: engineRate("Stripe", "In-person", 0)!,
  ppAdvanced: engineRate("PayPal", "Online", 0)!,
  ppPos: engineRate("PayPal", "In-person", 0)!,
  ppCheckout: flatEffective(pp.checkout),
  ppStandard: flatEffective(pp.standardCard),
  ppPayLater: flatEffective(pp.payLater),
  ppVirtual: flatEffective(pp.virtualTerminal),
  stManual: flatEffective(st.manual),
  helcimOn: [0, 1, 2].map((t) => engineRate("Helcim", "Online", t as 0 | 1 | 2)!),
};

/** Monthly gap between the PayPal Checkout button and Stripe at each tier. */
export const CHECKOUT_GAP = [0, 1, 2].map((t) => dollarsAt(N.ppCheckout, t as 0 | 1 | 2) - dollarsAt(N.stOn, t as 0 | 1 | 2));

/** Fee on a single sale, for the ticket-size examples. */
export const saleFee = (amount: number, f: { pct: number; fixed: number }) => amount * (f.pct / 100) + f.fixed;
const cents = (n: number) => `$${n.toFixed(2)}`;

export const ANSWER = `Stripe costs less than PayPal's checkout button at every volume: ${feeLabel(st.online)} against ${feeLabel(pp.checkout)}, or ${pct(N.stOn)} vs ${pct(N.ppCheckout)} on a $50 sale. That is about ${usd(CHECKOUT_GAP[0])} a month less at ${TIER_LABELS[0]}, ${usd(CHECKOUT_GAP[1])} at ${TIER_LABELS[1]} and ${usd(CHECKOUT_GAP[2])} at ${TIER_LABELS[2]}. If PayPal approves you for Advanced Credit and Debit (${feeLabel(pp.advancedCard)}), card fees are effectively tied, and in person PayPal POS (${feeLabel(pp.pos)}) beats Stripe Terminal (${feeLabel(st.inPerson)}).`;

export const META_DESCRIPTION = `PayPal Checkout ${feeLabel(pp.checkout)} vs Stripe ${feeLabel(st.online)}: about ${usd(CHECKOUT_GAP[0])} more per $10K on $50 sales. Card, in-person, dispute and payout fees by volume.`;

export const FAQ: { q: string; a: string }[] = [
  {
    q: "Is Stripe cheaper than PayPal?",
    a: `For online card payments, yes, unless PayPal approves you for its Advanced Credit and Debit product. Stripe charges ${feeLabel(st.online)}. PayPal's checkout button costs ${feeLabel(pp.checkout)} and its standard card payments ${feeLabel(pp.standardCard)}. On a $50 sale that is ${pct(N.stOn)} on Stripe against ${pct(N.ppCheckout)} and ${pct(N.ppStandard)} on PayPal. Advanced Credit and Debit, at ${feeLabel(pp.advancedCard)}, comes in a hair under Stripe.`,
  },
  {
    q: "What are PayPal's fees compared with Stripe's?",
    a: `Online: Stripe ${feeLabel(st.online)}; PayPal Checkout ${feeLabel(pp.checkout)}, standard card payments ${feeLabel(pp.standardCard)}, Advanced Credit and Debit ${feeLabel(pp.advancedCard)}, Pay Later ${feeLabel(pp.payLater)}. In person: Stripe Terminal ${feeLabel(st.inPerson)}; PayPal POS ${feeLabel(pp.pos)}. Keyed: Stripe ${feeLabel(st.manual)}; PayPal Virtual Terminal ${feeLabel(pp.virtualTerminal)}. Both add ${st.internationalAddPct}% for international cards and charge ${st.achPct}% capped at $${st.achCap} for ACH.`,
  },
  {
    q: "How much more does PayPal cost on small orders?",
    a: `The fixed fee does most of the damage. On a $10 order Stripe takes ${cents(saleFee(10, st.online))} and the PayPal button ${cents(saleFee(10, pp.checkout))}. On a $500 order the gap is ${cents(saleFee(500, pp.checkout) - saleFee(500, st.online))}, or about ${(((saleFee(500, pp.checkout) - saleFee(500, st.online)) / 500) * 100).toFixed(1)}% of the sale.`,
  },
  {
    q: "Which has lower dispute fees, Stripe or PayPal?",
    a: `Stripe charges $${st.dispute} per dispute, plus another $${st.disputeCounter} if you counter it manually, refunded if you win. PayPal charges $${pp.chargeback} per chargeback. If you fight most disputes, the two end up close; if you accept most of them, Stripe is $${pp.chargeback - st.dispute} cheaper each time.`,
  },
  {
    q: "How fast do Stripe and PayPal pay out?",
    a: `Stripe pays out in 2 business days, and a new account's first payout typically takes 7 to 14 days. Instant Payouts cost ${st.instantPayoutPct}% (50¢ minimum). PayPal's standard withdrawal to a bank is free and its instant transfer costs ${pp.instantPayoutPct}% (50¢ minimum), up to $25,000 per bank transfer.`,
  },
  {
    q: "Should I use Stripe or PayPal for my business?",
    a: "Use Stripe as your card processor if you sell online, bill subscriptions or want control over the checkout. Add the PayPal button if your buyers ask for it; you pay PayPal's higher rate only on the orders that use it. Pick PayPal alone if you need to start selling today with no development and most of your buyers already have PayPal or Venmo.",
  },
  {
    q: "Does Stripe or PayPal charge a monthly fee?",
    a: `Stripe has no monthly fee on its standard pricing. PayPal has none for PayPal POS or Advanced Credit and Debit; its Payments Advanced and Payments Pro products cost $5 and $30 a month.`,
  },
  {
    q: "Is there a cheaper option than both?",
    a: `For card payments, yes. On the same assumptions, Helcim's interchange-plus pricing costs ${pct(N.helcimOn[0])} online at ${TIER_LABELS[0]} a month and ${pct(N.helcimOn[2])} at ${TIER_LABELS[2]}, against ${pct(N.stOn)} for Stripe. You give up PayPal's wallet button and some of Stripe's developer tools, and your rate moves with your card mix.`,
  },
];

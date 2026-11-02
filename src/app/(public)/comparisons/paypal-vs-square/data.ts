import { FEES, TIER_LABELS, dollarsAt, engineRate, feeLabel, flatEffective, pct, usd } from "@/lib/data/vs-pages-2026";

const sq = FEES.square;
const pp = FEES.paypal;

/** Every figure the page and its schema print, computed once from vs-pages-2026 (the ranking engine). */
export const N = {
  sqIp: [0, 1, 2].map((t) => engineRate("Square", "In-person", t as 0 | 1 | 2)!),
  ppPos: engineRate("PayPal", "In-person", 0)!,
  sqApi: engineRate("Square", "Online", 0)!,
  sqFreeOnline: flatEffective(sq.onlineFree),
  ppCheckout: flatEffective(pp.checkout),
  ppAdvanced: engineRate("PayPal", "Online", 0)!,
  sqManual: flatEffective(sq.manual),
  ppPosManual: flatEffective(pp.posManual),
};

/** Monthly saving with PayPal POS over Square Free in person, and with Square's API over the PayPal button online, at $10K. */
export const IN_PERSON_GAP = dollarsAt(N.sqIp[0], 0) - dollarsAt(N.ppPos, 0);
export const ONLINE_GAP = dollarsAt(N.ppCheckout, 0) - dollarsAt(N.sqApi, 0);

export const ANSWER = `PayPal costs less in person: PayPal POS charges ${feeLabel(pp.pos)} against ${feeLabel(sq.inPersonFree)} on Square Free, or ${pct(N.ppPos)} vs ${pct(N.sqIp[0])} on a $50 sale, about ${usd(IN_PERSON_GAP)} a month less at ${TIER_LABELS[0]}. Online, Square's ${feeLabel(sq.onlinePaidOrApi)} on its paid plans or Online API beats the PayPal Checkout button (${feeLabel(pp.checkout)}) by about ${usd(ONLINE_GAP)} a month per ${TIER_LABELS[0]}. Square Free charges ${feeLabel(sq.onlineFree)} online, and PayPal's Advanced Credit and Debit (${feeLabel(pp.advancedCard)}, approval required) is a hair under Square's ${feeLabel(sq.onlinePaidOrApi)}.`;

export const META_DESCRIPTION = `PayPal POS ${feeLabel(pp.pos)} vs Square ${feeLabel(sq.inPersonFree)} in person; Square ${feeLabel(sq.onlinePaidOrApi)} vs PayPal Checkout ${feeLabel(pp.checkout)} online. Monthly cost at $10K to $250K.`;

export const FAQ: { q: string; a: string }[] = [
  {
    q: "Which is cheaper: Square or PayPal?",
    a: `In person, PayPal: PayPal POS charges ${feeLabel(pp.pos)} and Square Free ${feeLabel(sq.inPersonFree)}, which is ${pct(N.ppPos)} against ${pct(N.sqIp[0])} on a $50 sale. Online, Square's ${feeLabel(sq.onlinePaidOrApi)} on paid plans or its Online API beats the PayPal Checkout button at ${feeLabel(pp.checkout)}. On Square Free, online payments cost ${feeLabel(sq.onlineFree)}.`,
  },
  {
    q: "What does each charge for manually entered cards?",
    a: `Square charges ${feeLabel(sq.manual)} for manually entered cards or cards on file. PayPal POS charges ${feeLabel(pp.posManual)} for manual entry in the app, and PayPal's Virtual Terminal ${feeLabel(pp.virtualTerminal)}.`,
  },
  {
    q: "Which has better hardware: Square or PayPal?",
    a: `Square, by range: its hardware starts at $59 and runs up to countertop registers, all built for its own POS software. PayPal POS offers a card reader and a terminal, and its POS page does not list their prices; Tap to Pay in the PayPal app needs no hardware.`,
  },
  {
    q: "How fast do Square and PayPal pay out?",
    a: `Square deposits the next business day for free; instant or same-day transfers cost ${sq.instantPayoutPct}%. PayPal's standard withdrawal to a bank is free, and an instant transfer costs ${pp.instantPayoutPct}% (50¢ minimum).`,
  },
  {
    q: "Is Square or PayPal better for restaurants?",
    a: "Square, for most restaurants. Its POS covers table management, course timing, kitchen display and delivery integrations, which PayPal POS does not match. PayPal makes more sense as a second checkout option than as a restaurant's main system.",
  },
  {
    q: "Can I use both Square and PayPal?",
    a: "Yes. A common setup is Square for in-person sales and PayPal as a checkout button online, so buyers who prefer PayPal can use it. You pay each provider's rate only on the sales that go through it.",
  },
];

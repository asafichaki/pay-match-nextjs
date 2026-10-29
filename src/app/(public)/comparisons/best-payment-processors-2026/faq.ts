import { formatRate, rankAt, TIER_LABELS } from "@/lib/data/ranking-2026";

const t0 = rankAt(0);
const t2 = rankAt(2);

/** One FAQ source for both the visible list and the FAQPage schema, so they cannot disagree. */
export const BEST_OF_FAQ: { q: string; a: string }[] = [
  {
    q: "What is the cheapest payment processor for a small business in 2026?",
    a: `On our effective-rate test at ${TIER_LABELS[0]} a month, ${t0[0].name} is cheapest at ${formatRate(t0[0].score)}, followed by ${t0[1].name} (${formatRate(t0[1].score)}) and ${t0[2].name} (${formatRate(t0[2].score)}). The answer changes with volume: at ${TIER_LABELS[2]} a month ${t2[0].name} leads at ${formatRate(t2[0].score)}.`,
  },
  {
    q: "What is an effective rate?",
    a: "Your total processing fees for a month divided by the card volume you processed. It folds the percentage, the per-transaction fee and the monthly fees into one number you can compare across providers and against your own statement.",
  },
  {
    q: "Is flat-rate or interchange-plus pricing cheaper?",
    a: "Flat-rate pricing (Square, Stripe, PayPal) is simpler and usually cheaper below about $25K to $50K a month. Interchange-plus pricing passes the card network's cost through at cost plus a fixed markup, and it usually wins above that, especially with a lot of debit cards.",
  },
  {
    q: "Can I negotiate payment processing rates?",
    a: "Yes, especially above about $100K a month. Interchange itself is not negotiable, but the provider's markup, monthly fees and contract terms are. Flat-rate providers like Stripe start to negotiate around $80K a month.",
  },
  {
    q: "Do the providers pay you for these rankings?",
    a: "Some providers pay us a commission when a business signs up through our links. That never changes the scores or the order, which come from the published method on this page. Providers that pay us nothing are ranked the same way.",
  },
];

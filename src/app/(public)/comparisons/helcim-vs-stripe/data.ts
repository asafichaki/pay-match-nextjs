import { ASSUMPTIONS, FEES, TIER_LABELS, breakEvenInterchange, dollarsAt, engineRate, feeLabel, pct, usd } from "@/lib/data/vs-pages-2026";

const st = FEES.stripe;
const hc = FEES.helcim;
const T = [0, 1, 2] as const;

/** Every figure the page and its schema print, computed once from vs-pages-2026. */
export const N = {
  hcIp: T.map((t) => engineRate("Helcim", "In-person", t)!),
  hcOn: T.map((t) => engineRate("Helcim", "Online", t)!),
  stIp: T.map((t) => engineRate("Stripe", "In-person", t)!),
  stOn: T.map((t) => engineRate("Stripe", "Online", t)!),
  beIp: breakEvenInterchange(engineRate("Stripe", "In-person", 0)!, hc.inPersonFirstTier),
  beOn: breakEvenInterchange(engineRate("Stripe", "Online", 0)!, hc.onlineFirstTier),
};
export const SAVE_IP = T.map((t) => dollarsAt(N.stIp[t], t) - dollarsAt(N.hcIp[t], t));
export const SAVE_ON = T.map((t) => dollarsAt(N.stOn[t], t) - dollarsAt(N.hcOn[t], t));

export const TITLE = "Helcim vs Stripe 2026: Helcim Is Cheaper From $10K a Month";

export const ANSWER = `Helcim costs less than Stripe at every volume we priced. In person it comes to ${pct(N.hcIp[0])} against Stripe's ${pct(N.stIp[0])} at ${TIER_LABELS[0]} a month, about ${usd(SAVE_IP[0])} saved, rising to ${usd(SAVE_IP[1])} at ${TIER_LABELS[1]} and ${usd(SAVE_IP[2])} at ${TIER_LABELS[2]}. Online the gap is ${usd(SAVE_ON[0])}, ${usd(SAVE_ON[1])} and ${usd(SAVE_ON[2])}. Stripe only wins on cost if your cards average more than ${N.beIp.toFixed(2)}% in interchange in person (${N.beOn.toFixed(2)}% online), which takes a mix heavy in premium rewards cards.`;

export const META_DESCRIPTION = `Helcim ${pct(N.hcIp[0])} vs Stripe ${pct(N.stIp[0])} in person at $10K a month, ${pct(N.hcOn[0])} vs ${pct(N.stOn[0])} online, fees included. Monthly cost to $250K, checked Oct 2026.`;

export const FAQ: { q: string; a: string }[] = [
  {
    q: "Is Helcim cheaper than Stripe?",
    a: `On our method, yes, at every volume: ${pct(N.hcIp[0])} vs ${pct(N.stIp[0])} in person and ${pct(N.hcOn[0])} vs ${pct(N.stOn[0])} online at ${TIER_LABELS[0]} a month, with a ${ASSUMPTIONS.cardMix} card mix and a $${ASSUMPTIONS.averageSale} average sale. Helcim's price is the card network's cost plus a published margin, so your own number moves with the cards your customers use.`,
  },
  {
    q: "When does Helcim become cheaper than Stripe?",
    a: `From the first dollar on a typical card mix. The saving is small at low volume, about ${usd(SAVE_IP[0])} a month in person at ${TIER_LABELS[0]}, which is why many small sellers do not bother switching. By ${TIER_LABELS[1]} it is about ${usd(SAVE_IP[1])} a month in person and ${usd(SAVE_ON[1])} online, enough to pay for the work of moving.`,
  },
  {
    q: "What are Helcim's rates?",
    a: `In person, interchange plus ${feeLabel(hc.inPersonFirstTier)} under $50K a month, falling to 0.35% + 7¢, 0.25% + 7¢, 0.20% + 6¢ and 0.15% + 6¢ as volume grows. Online and keyed, interchange plus ${feeLabel(hc.onlineFirstTier)}, falling to 0.15% + 15¢ above $1M. The margin drops automatically at ${hc.tierBreaks} a month, based on your average volume over the last three months.There is no monthly, setup, PCI or cancellation fee.`,
  },
  {
    q: "Does Stripe negotiate below 2.9%?",
    a: "Stripe offers custom pricing for large volume or unusual business models through its sales team. Its pricing page publishes no volume threshold. If you ask, bring a competing interchange-plus quote and your last three statements.",
  },
  {
    q: "Are there monthly fees with Stripe or Helcim?",
    a: `Neither charges one on its standard pricing. Watch the add-ons instead: Helcim adds ${hc.recurringAddPct}% to recurring payments and 10¢ to Tap to Pay, and Stripe adds 0.5% to keyed cards, 1.5% to international cards and 1% to currency conversion.`,
  },
  {
    q: "Which is better for subscriptions and SaaS?",
    a: `Stripe, on tools. Stripe Billing handles usage-based and tiered plans, proration and failed-payment retries. Helcim offers recurring payments but adds ${hc.recurringAddPct}% per recurring transaction, so price both with your actual billing volume before choosing.`,
  },
  {
    q: "How fast do Helcim and Stripe pay out?",
    a: `Helcim deposits the next business morning at no cost and publishes no instant option. Stripe pays out in 2 business days, with Instant Payouts at ${st.instantPayoutPct}% (50¢ minimum).`,
  },
  {
    q: "Can I switch from Stripe to Helcim?",
    a: "Yes. Stripe has no contract on its standard pricing, so there is no penalty to leave. The work is repointing your checkout, moving saved cards (Stripe migrates card data to another PCI-compliant processor on request) and recreating recurring billing schedules. Run both side by side for a week before you switch over.",
  },
  {
    q: "Does Helcim work in the US?",
    a: "Yes. Helcim is based in Canada and publishes separate US pricing for US merchants processing in US dollars.",
  },
];

export interface EffectiveRateRow {
  processor: string;
  channel: "Online" | "In-Person" | "Mixed";
  rates: [string, string, string, string];
  pricingModel: string;
  notes: string;
}

export const VOLUME_TIERS = [
  "$10K monthly",
  "$50K monthly",
  "$250K monthly",
  "$1M monthly",
] as const;

export const EFFECTIVE_RATES_2026: EffectiveRateRow[] = [
  { processor: "Stripe", channel: "Online", rates: ["2.97%", "2.95%", "2.92%", "2.88%"], pricingModel: "Flat-rate (negotiable >$80K)", notes: "Best for SaaS, subscriptions, custom checkout." },
  { processor: "Stripe", channel: "In-Person", rates: ["2.73%", "2.71%", "2.68%", "2.64%"], pricingModel: "Flat-rate", notes: "Terminal hardware $59-249. Thinner POS ecosystem than Square." },
  { processor: "Square", channel: "In-Person", rates: ["2.65%", "2.63%", "2.60%", "2.56%"], pricingModel: "Flat-rate", notes: "Free hardware on entry tier. Best for retail under $80K monthly." },
  { processor: "Square", channel: "Online", rates: ["2.95%", "2.93%", "2.90%", "2.86%"], pricingModel: "Flat-rate", notes: "Simpler than Stripe; weaker subscription engine." },
  { processor: "PayPal", channel: "Online", rates: ["3.07%", "3.05%", "3.01%", "2.97%"], pricingModel: "Flat-rate", notes: "Adds 5-10% checkout conversion via 400M+ accounts. Higher per-tx fixed fee ($0.49)." },
  { processor: "Helcim", channel: "Online", rates: ["2.51%", "2.43%", "2.37%", "2.31%"], pricingModel: "Interchange-plus", notes: "No monthly fee. Volume discounts auto-apply. Strong above $25K." },
  { processor: "Helcim", channel: "In-Person", rates: ["2.41%", "2.33%", "2.27%", "2.21%"], pricingModel: "Interchange-plus", notes: "Often beats Stripe + Square above $25K." },
  { processor: "Stax (Fattmerchant)", channel: "Mixed", rates: ["2.85%", "2.45%", "2.21%", "2.13%"], pricingModel: "Subscription + IC-plus", notes: "$99-199/mo. Win threshold: $80K+ monthly." },
  { processor: "Payment Depot", channel: "Mixed", rates: ["2.88%", "2.41%", "2.18%", "2.09%"], pricingModel: "Membership + IC-plus", notes: "$79-199/mo. Designed for >$100K monthly." },
  { processor: "Clover", channel: "In-Person", rates: ["2.61%", "2.58%", "2.55%", "2.50%"], pricingModel: "Flat-rate (tiered)", notes: "Owned by Fiserv. All-in-one POS hardware + software." },
  { processor: "Authorize.net", channel: "Online", rates: ["2.96%", "2.94%", "2.91%", "2.87%"], pricingModel: "Gateway + processor markup", notes: "$25/mo gateway. Bring your own merchant account." },
  { processor: "Braintree", channel: "Online", rates: ["2.67%", "2.65%", "2.62%", "2.58%"], pricingModel: "Flat-rate", notes: "PayPal-owned. Strong for marketplaces and recurring billing." },
  { processor: "Adyen", channel: "Online", rates: ["2.32%", "2.18%", "2.04%", "1.91%"], pricingModel: "Interchange-plus", notes: "Enterprise / global. Min ~$120K monthly. Strong cross-border." },
  { processor: "Shopify Payments", channel: "Online", rates: ["2.95%", "2.78%", "2.55%", "2.45%"], pricingModel: "Plan-bundled", notes: "Lower tier on Advanced/Plus plans. Only for Shopify stores." },
  { processor: "Worldpay", channel: "Mixed", rates: ["2.61%", "2.41%", "2.18%", "1.98%"], pricingModel: "Negotiated", notes: "Mid-market / enterprise. Always negotiate." },
];

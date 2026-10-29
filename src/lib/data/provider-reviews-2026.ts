/**
 * Review copy for the best-of page. Every fee line was read from the
 * provider's own pricing page on Oct 29, 2026 (sources in each pricingUrl).
 * "take" is our editorial read of those facts; it must never state a price
 * the fee lines do not.
 */
export interface ProviderReviewData {
  pricingUrl: string;
  checkedLabel: string;
  inPerson: string | null;
  online: string | null;
  monthlyFee: string | null;
  hardware: string | null;
  contract: string | null;
  payouts: string | null;
  otherFees: string | null;
  take: string[];
  pros: string[];
  cons: string[];
  bestFor: string;
  skipIf: string;
}

const CHECKED = "Oct 29, 2026";

export const PROVIDER_REVIEWS: Record<string, ProviderReviewData> = {
  Helcim: {
    pricingUrl: "https://www.helcim.com/pricing/",
    checkedLabel: CHECKED,
    inPerson: "Interchange + 0.40% + 8¢ under $50K a month, falling to 0.35% + 7¢, 0.25% + 7¢, 0.20% + 6¢ and 0.15% + 6¢ as volume grows",
    online: "Interchange + 0.50% + 25¢ under $50K a month, falling to 0.15% + 15¢ above $1M",
    monthlyFee: "$0. No setup, PCI or cancellation fee",
    hardware: "Card Reader $199; Smart Terminal $349 or $32 a month for a year",
    contract: "No contract",
    payouts: "Next business morning, free. No instant option published",
    otherFees: "Recurring payments +0.4%; lost chargeback $15 ($0 if you win); ACH 0.5% + 25¢, capped at $6",
    take: [
      "Helcim is the cheapest provider in our test at $10K and $50K a month, and close to the cheapest above that. The reason is structural: you pay the card network's cost plus a small published margin, and that margin steps down on its own as your volume grows. Nothing to negotiate, no monthly fee to spread.",
      "The trade-off is predictability. Interchange-plus means your rate moves with the card mix, so a month full of premium rewards cards costs more than a month of debit. Online sales carry a 25¢ fixed fee below $50K a month, which matters if your average sale is small.",
    ],
    pros: ["No monthly, PCI, setup or cancellation fee", "Margin drops automatically at $50K, $100K, $500K and $1M a month", "Next-business-morning deposits at no cost"],
    cons: ["Online and keyed sales carry a 25¢ fixed fee under $50K a month", "Smart Terminal costs $349, more than most entry readers", "No instant payout option"],
    bestFor: "Small and mid-size U.S. merchants who want interchange-plus pricing with no monthly fee",
    skipIf: "You need instant payouts or one fixed, predictable rate per sale",
  },
  PayPal: {
    pricingUrl: "https://www.paypal.com/us/business/paypal-business-fees",
    checkedLabel: CHECKED,
    inPerson: "PayPal POS 2.29% + 9¢; manual entry 3.49% + 9¢",
    online: "PayPal Checkout 3.49% + 49¢; standard card payments 2.99% + 49¢; Advanced Credit and Debit 2.89% + 29¢",
    monthlyFee: "$0 for PayPal POS and Advanced Credit and Debit",
    hardware: "Card reader and terminal offered; prices not shown on the POS page. Tap to Pay needs no hardware",
    contract: "No long-term commitment for PayPal POS",
    payouts: "Standard withdrawal free; instant 1.5% (minimum 50¢)",
    otherFees: "International sales +1.5%; chargeback $20; ACH 0.80% capped at $5",
    take: [
      "PayPal ranks high on the strength of one product: its point-of-sale rate of 2.29% + 9¢ is the lowest flat in-person rate we found. If you take cards at a counter and already use PayPal, that is a real saving over Square and Stripe.",
      "Online is a different story. The PayPal button costs 3.49% + 49¢, and the 49¢ hurts on small orders. The cheaper card rate (2.89% + 29¢) needs PayPal's approval for Advanced Credit and Debit. Read which product you are actually being quoted.",
    ],
    pros: ["Lowest flat in-person rate we found: 2.29% + 9¢", "PayPal and Venmo buttons buyers already trust", "Free standard withdrawals, instant at 1.5%"],
    cons: ["PayPal Checkout costs 3.49% + 49¢", "International sales add 1.5%", "Chargebacks cost $20"],
    bestFor: "Sellers who already use PayPal and want a cheap in-person rate",
    skipIf: "Most of your sales are small online orders where a 49¢ fee bites",
  },
  Adyen: {
    pricingUrl: "https://www.adyen.com/pricing",
    checkedLabel: CHECKED,
    inPerson: null,
    online: "Visa and Mastercard: 13¢ processing fee + interchange++ + 0.60%; Amex 13¢ + 3.3% + 10¢; Discover 13¢ + 3.95%",
    monthlyFee: "$0. No setup, integration or closure fee",
    hardware: "Not listed on the pricing page",
    contract: "Not published",
    payouts: "Flexible timing and settlement currency; no standard timing published",
    otherFees: "A minimum monthly invoice that depends on industry; the amount is not published",
    take: [
      "On paper Adyen is one of the cheapest ways to take Visa and Mastercard online: network cost plus 0.60% and 13¢, with no monthly fee. It is the platform large retailers use to run payments across many countries from one contract.",
      "In practice it is built for bigger merchants. Adyen applies a minimum monthly invoice it does not publish, and some industries are not accepted. If you process under six figures a month, expect a sales conversation before you get a yes.",
    ],
    pros: ["Interchange++ shows the true card cost on every transaction", "No monthly, setup or closure fees", "Settles in many currencies to many bank accounts"],
    cons: ["Minimum invoice amount not disclosed", "Amex and Discover cost more than Visa and Mastercard", "No published terminal pricing"],
    bestFor: "Large and cross-border merchants that want interchange++ across many payment methods",
    skipIf: "You are a small business that wants posted pricing without a sales call",
  },
  "Stax (Fattmerchant)": {
    pricingUrl: "https://staxpayments.com/pricing/",
    checkedLabel: CHECKED,
    inPerson: "Interchange at cost (0% markup) + 8¢",
    online: "Interchange at cost (0% markup) + 15¢",
    monthlyFee: "$99 up to $150K a year in volume; $139 for $150K to $250K; $199+ above $250K",
    hardware: "SwipeSimple reader $125; Dejavoo QD4 countertop $310; QD2 wireless $495",
    contract: "No cancellation fees stated; contract length not published",
    payouts: "Next business day",
    otherFees: "ACH 1% capped at $10; PCI and setup fees not published",
    take: [
      "Stax is the clearest example of why volume decides the winner. At $10K a month its subscription is a heavy add-on and it sits mid-table. From about $50K a month the subscription gets small next to the markup it removes, and from $250K up it is the cheapest provider in our test.",
      "You pay the card network's cost with no percentage added, plus a few cents per sale and a flat monthly fee. Ask for the contract length in writing, because the pricing page does not state it.",
    ],
    pros: ["No percentage markup over interchange", "Cheapest in our test from $250K a month", "Next business day funding"],
    cons: ["$99 to $199+ monthly fee before any processing", "8¢ and 15¢ per sale come on top", "Contract length not published"],
    bestFor: "Established merchants with steady volume who want interchange at cost",
    skipIf: "Your volume is low or seasonal, so the monthly fee outweighs the markup saved",
  },
  Clover: {
    pricingUrl: "https://www.clover.com/pricing",
    checkedLabel: CHECKED,
    inPerson: "2.6% + 10¢ on Starter; 2.5% + 10¢ on Essentials; 2.3% + 10¢ on the Growth bundles",
    online: "Keyed or typed-in cards 3.5% + 10¢ on every bundle",
    monthlyFee: "Starter $0 software fee; Essentials $29.95; Retail Growth $84.95 and up; Restaurant Growth $89.95 and up",
    hardware: "Clover Go $199; Compact $349 or $16 a month for 36 months; Station Solo bundles from $1,799",
    contract: "Hardware subscriptions run 36 months and cannot be canceled",
    payouts: "Standard 1 to 3 days; Rapid Deposit in minutes for 1.75%",
    otherFees: "PCI, statement and setup fees not listed on Clover.com",
    take: [
      "Clover is a full point-of-sale system first and a processor second. The Growth bundles bring the in-person rate down to 2.3% + 10¢, which makes it competitive above $50K a month, and the hardware is built for counters and kitchens.",
      "Two things to check before signing: the 36-month hardware subscription cannot be canceled, and keyed or online cards cost 3.5% + 10¢. Clover is also sold through banks, whose rates and terms can differ from Clover.com.",
    ],
    pros: ["POS hardware and software from one vendor", "In-person rate drops to 2.3% + 10¢ on Growth bundles", "Rapid Deposit available for 1.75%"],
    cons: ["36-month hardware subscriptions cannot be canceled", "Keyed and online cards cost 3.5% + 10¢", "Termination fees and full fee schedule not published"],
    bestFor: "Restaurants and retail that want countertop POS hardware and software bundled",
    skipIf: "You mainly sell online or will not commit to a 3-year hardware term",
  },
  Stripe: {
    pricingUrl: "https://stripe.com/pricing",
    checkedLabel: CHECKED,
    inPerson: "2.7% + 5¢ with Stripe Terminal; Tap to Pay adds 10¢",
    online: "2.9% + 30¢; manually entered cards +0.5%; international cards +1.5%",
    monthlyFee: "$0. No setup or monthly fee",
    hardware: "Reader M2 $59; S700 and S710 $299; T600 $329",
    contract: "Pay as you go",
    payouts: "2 business days; Instant Payouts 1.5% (minimum 50¢)",
    otherFees: "Dispute $15, plus $15 more to counter it (refunded if you win); ACH 0.8% capped at $5",
    take: [
      "Stripe is the default for businesses that sell online and want control over their checkout. The rate is simple, there is no monthly fee, and the developer tools for subscriptions, invoicing and marketplaces are the most complete in this list.",
      "Its in-person rate of 2.7% + 5¢ is now lower than Square's free-plan rate on a typical $50 sale. Where Stripe loses is volume: it never drops below its flat rate without a custom deal, so above $50K a month interchange-plus providers pull ahead.",
    ],
    pros: ["No monthly or setup fee", "Instant Payouts at 1.5%", "Most complete developer tools for online checkout and billing"],
    cons: ["Manual card entry costs 3.4% + 30¢", "Countering a dispute adds a second $15 fee", "International cards add 1.5%, plus 1% for conversion"],
    bestFor: "Online businesses, SaaS and platforms that build a custom checkout",
    skipIf: "You need a ready-made retail POS without developer work",
  },
  "Shopify Payments": {
    pricingUrl: "https://www.shopify.com/pricing",
    checkedLabel: CHECKED,
    inPerson: "2.6% + 10¢ on Basic, down to 2.3% + 10¢ on Plus",
    online: "2.9% + 30¢ on Basic, 2.7% on Grow, 2.5% on Advanced, from 2.25% on Plus",
    monthlyFee: "A Shopify plan is required: Basic $29 a month billed yearly, Grow $79, Advanced $299",
    hardware: "Tap & Chip reader $49; POS Terminal $349",
    contract: "Plans billed monthly or yearly",
    payouts: "3 business days in the U.S.",
    otherFees: "Using another processor instead adds 0.2% to 2% per sale",
    take: [
      "If your store runs on Shopify, this is almost always the processor to use, because choosing any other one adds a 0.2% to 2% transaction fee on top. Rates fall on each higher Shopify plan.",
      "We rank it on the Basic plan rate and leave the plan fee out, because you pay that for the store, not for processing. Outside Shopify it is not an option at all.",
    ],
    pros: ["No extra gateway; rates drop on every higher plan", "$49 card reader for in-person sales", "Avoids the third-party transaction fee"],
    cons: ["Only works inside Shopify", "U.S. payouts take 3 business days", "Premium cards cost up to 3.5% + 30¢ on Basic"],
    bestFor: "Merchants already selling on Shopify",
    skipIf: "You are not on Shopify",
  },
  Square: {
    pricingUrl: "https://squareup.com/us/en/pricing",
    checkedLabel: CHECKED,
    inPerson: "2.6% + 15¢ on Free; 2.5% + 15¢ on Plus; 2.4% + 15¢ on Premium",
    online: "3.3% + 30¢ on Free; 2.9% + 30¢ on Plus, Premium and the Online API",
    monthlyFee: "Free $0; Plus $49; Premium $149, per location",
    hardware: "From $59",
    contract: "No contract; switch or cancel plans any time",
    payouts: "Next business day free; instant or same-day 1.95%",
    otherFees: "International cards +1.5%; ACH 1%",
    take: [
      "Square is still the easiest way to start taking cards: a free plan, a free point-of-sale app and money in your bank the next business day. For a new business that values setup speed over the last tenth of a percent, that matters.",
      "On cost it has slipped. The in-person fixed fee is now 15¢, which puts the free plan at about 2.90% on a $50 sale, behind Stripe Terminal and PayPal POS. Online sales on the free plan cost 3.3% + 30¢, so move to a paid plan or the API if you sell online.",
    ],
    pros: ["$0 plan with free next-day deposits", "No contract", "Premium plan cuts the in-person rate to 2.4% + 15¢"],
    cons: ["Free plan charges 3.3% + 30¢ online", "Instant transfers cost 1.95%", "Lower rates need $49 or $149 per location a month"],
    bestFor: "New and small in-person sellers who want to start today with no contract",
    skipIf: "You sell mostly online on the Free plan or process enough to justify interchange-plus",
  },
  Braintree: {
    pricingUrl: "https://www.paypal.com/us/enterprise/paypal-braintree-fees",
    checkedLabel: CHECKED,
    inPerson: null,
    online: "Cards and digital wallets 2.89% + 29¢; Venmo 3.49% + 49¢",
    monthlyFee: "None listed",
    hardware: "None (online gateway)",
    contract: "Not published",
    payouts: "Not listed on the fee page",
    otherFees: "Amex +15¢; non-U.S. cards +1%; non-USD +1%; chargeback $15; fees kept on refunds",
    take: [
      "Braintree is PayPal's developer platform: one integration for cards, PayPal and Venmo, which is why marketplaces and apps use it. Its published card rate of 2.89% + 29¢ is close to Stripe's online rate.",
      "It ranks low here because it is online only and the list price never drops with volume. Lower rates and interchange-plus exist, but only by negotiation for established businesses.",
    ],
    pros: ["Cards, PayPal and Venmo through one integration", "ACH capped at $5", "Interchange-plus available to established businesses"],
    cons: ["No in-person option", "Extra 1% for non-U.S. cards and another for non-USD currency", "Fees are not returned on refunds"],
    bestFor: "Developer-built online checkouts that want PayPal and Venmo alongside cards",
    skipIf: "You need in-person payments or a no-code setup",
  },
  "Authorize.net": {
    pricingUrl: "https://www.authorize.net/sign-up/pricing.html",
    checkedLabel: CHECKED,
    inPerson: null,
    online: "All-in-one plan 2.9% + 30¢; gateway-only plan 10¢ per sale + 10¢ daily batch, plus your own processor's fees",
    monthlyFee: "$25 on every plan",
    hardware: "Not published",
    contract: "No setup fee and no early termination fee",
    payouts: "Usually 2 to 3 business days after the daily batch",
    otherFees: "eCheck 0.75%; late payment fee $20",
    take: [
      "Authorize.net is one of the oldest payment gateways, and plenty of shopping carts and billing tools still connect to it first. If your software requires it, the all-in-one plan now includes a merchant account, so you no longer need to find one separately.",
      "On cost alone it is last in our table: the $25 monthly fee on top of 2.9% + 30¢ adds up for small merchants, and there is no published in-person rate.",
    ],
    pros: ["All-in-one plan includes the merchant account", "No setup or early termination fee", "Recurring billing and fraud tools included"],
    cons: ["$25 monthly fee on every plan", "2 to 3 business day funding", "No published in-person rate"],
    bestFor: "Merchants whose cart or billing software requires an Authorize.net gateway",
    skipIf: "You sell mainly in person or process too little to cover $25 a month",
  },
};

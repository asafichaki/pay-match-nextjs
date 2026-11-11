// Configuration for the volume-tier comparison series.
// Each entry powers a /comparisons/best-payment-processors-<slug> page.
// Built from the baseline AEO probe finding (Q35/Q36 already cited in both
// Google + ChatGPT for volume-tier queries), expanding the proven format.
//
// Corrected 2026-11-11: every effective rate and monthly cost below comes from
// the site's cost engine (ranking-2026.ts / effective-rates-2026.csv, prices
// read Oct 29 2026) at its $10K, $50K, $250K and $1M points, with a $50 average
// sale, 60% credit / 40% debit and an interchange estimate of 1.55% in person
// and 1.70% online for interchange-plus providers.

export interface ProcessorPick {
  name: string;
  effectiveRateRange: string; // e.g. "2.11% in person, 2.70% online at $10K"
  pricingModel: string;
  bestFor: string;
  watchOut: string;
}

export interface PricingTier {
  name: string;
  label: string;
  monthlyCost: string;
  bestFor: string;
  includes: string[];
}

export interface VolumeTier {
  slug: string;
  monthlyRange: string; // for SEO / titles
  shortLabel: string;
  rangeMin: number;
  rangeMax: number | null;
  intent: string; // who this page is for
  metaTitle: string;
  metaDescription: string;
  heroH1: string;
  heroSubhead: string;
  // entity-first opening (data-speakable)
  speakableLead: string;
  // 3-5 recommended processors at this tier
  picks: ProcessorPick[];
  // 3-tier pricing transparency block per Wave 2 Pattern P2
  pricingTiers: PricingTier[];
  // optional context paragraphs
  marketContext: string;
  // anchors to link to from across the site
  relatedSlugs: string[];
}

export const VOLUME_TIERS: VolumeTier[] = [
  {
    slug: "best-payment-processors-10k-25k-monthly-2026",
    monthlyRange: "$10,000 to $25,000",
    shortLabel: "$10K to $25K monthly",
    rangeMin: 10000,
    rangeMax: 25000,
    intent: "Solo operators, small e-commerce and single-location retail crossing the $10K monthly bar, where a no-monthly-fee interchange-plus account already costs less than flat rate but a subscription plan is still hard to justify.",
    metaTitle: "Best Payment Processors for $10K-$25K Monthly Volume (2026)",
    metaDescription: "At $10K to $25K a month, Helcim's interchange-plus costs less than Square, Stripe and PayPal in our 2026 engine: $211 vs $290 for Square at $10K in person.",
    heroH1: "Best Payment Processors for $10,000 to $25,000 Monthly Volume",
    heroSubhead: "At $10K to $25K a month, interchange-plus with no monthly fee already beats flat rate in our engine: Helcim costs $211 a month at $10K in person, against $290 for Square and $280 for Stripe. Subscription pricing is harder to justify this early. Here is how the pricing models compare.",
    speakableLead: "Merchants processing $10,000 to $25,000 a month pay an effective rate of about 2.11% in person and 2.70% online with Helcim, against 2.47% to 2.90% in person and 3.47% to 3.50% online on flat-rate PayPal, Stripe and Square (our engine at $10K a month, $50 average sale, 60% credit and 40% debit). Helcim's margin does not change below $50K a month, so that gap holds across this whole tier. Stax, which charges a $99 to $199+ monthly subscription, costs $270 in person at $10K, more than Helcim.",
    picks: [
      {
        name: "Helcim",
        effectiveRateRange: "2.11% in person, 2.70% online at $10K",
        pricingModel: "Interchange-plus",
        bestFor: "Primary pick at this tier. Interchange + 0.40% + 8¢ in person and 0.50% + 25¢ online, no monthly fee, no contract. Cheapest in person in our engine at $10K a month and cheaper online than Square, Stripe and PayPal.",
        watchOut: "No instant payout option (deposits arrive free the next business morning). The rate moves with your card mix, and the 25¢ online fixed fee weighs more on small tickets.",
      },
      {
        name: "Square",
        effectiveRateRange: "2.90% in person, 3.50% online at a $50 sale",
        pricingModel: "Flat-rate",
        bestFor: "Brick-and-mortar retail, restaurants and salons that want Square's POS software and hardware in one system.",
        watchOut: "In person it is 2.6% + 15¢; online 2.9% + 30¢ on paid plans or 3.3% + 30¢ on Free. At $10K in person it costs $290 a month against $211 for Helcim in our engine.",
      },
      {
        name: "Stripe",
        effectiveRateRange: "3.50% online, 2.80% in person at a $50 sale",
        pricingModel: "Flat-rate",
        bestFor: "Online-only operators, SaaS, marketplaces and subscription billing that need Stripe's developer tools.",
        watchOut: "2.9% + 30¢ online and 2.7% + 5¢ in person (Terminal). Standard payouts take 2 business days; Instant Payouts cost 1.5%. Online it costs $350 a month at $10K against $270 for Helcim.",
      },
      {
        name: "PayPal",
        effectiveRateRange: "3.47% online (Advanced card), 2.47% in person at a $50 sale",
        pricingModel: "Flat-rate",
        bestFor: "Adding PayPal as a secondary checkout option to capture buyers who prefer paying with PayPal. PayPal POS (2.29% + 9¢) is also the cheapest flat rate in person.",
        watchOut: "PayPal Checkout costs 3.49% + 49¢, which is 5.94% on a $20 sale. Advanced card processing (2.89% + 29¢) and PayPal POS are subject to PayPal's approval.",
      },
    ],
    pricingTiers: [
      {
        name: "Entry flat-rate",
        label: "Square / Stripe / PayPal",
        monthlyCost: "$0 monthly fee · 2.29% to 2.7% + 5¢ to 15¢ in person, 2.89% to 2.9% + 29¢ to 30¢ online",
        bestFor: "Merchants who value one fixed rate per sale over the lowest cost.",
        includes: [
          "No monthly fee on the entry plans",
          "Same percentage at any volume",
          "Square 2.6% + 15¢, Stripe 2.7% + 5¢, PayPal POS 2.29% + 9¢ in person",
          "Square: next-business-day transfers free",
          "Stripe: standard payouts in 2 business days",
        ],
      },
      {
        name: "Mid-tier interchange-plus",
        label: "Helcim",
        monthlyCost: "$0 monthly fee · Interchange + 0.40% + 8¢ in person, + 0.50% + 25¢ online",
        bestFor: "The whole tier. Cheaper than Square, Stripe and PayPal at $10K a month in our engine, in person and online.",
        includes: [
          "No monthly fee or contract",
          "Margin steps down automatically from $50K a month",
          "No setup, PCI or cancellation fee",
          "Real interchange pass-through",
          "Free next-business-morning deposits",
        ],
      },
      {
        name: "Subscription IC-plus",
        label: "Stax (Payment Depot by quote only)",
        monthlyCost: "$99 to $199+ monthly by annual volume + interchange + 8¢ in person, 15¢ online",
        bestFor: "Usually not yet. At $10K a month Stax costs $270 in person and $299 online in our engine, against $211 and $270 for Helcim.",
        includes: [
          "No percentage markup over interchange",
          "Subscription rises from $99 to $199+ as annual volume grows",
          "Next business day funding",
          "Contract length not published: ask in writing",
          "Payment Depot: interchange-plus by quote, no published prices",
        ],
      },
    ],
    marketContext: "At $10,000 a month (the nearest point in our engine, at a $50 average sale and 60% credit, 40% debit), the monthly cost in person runs: Helcim $211, PayPal POS $247, Stax $270, Stripe Terminal $280, Square $290 (Free plan). Online: Adyen $256, Helcim $270, Stax $299, PayPal Advanced card $347, Stripe and Square $350. Adyen applies a minimum monthly invoice it does not publish, so small merchants may not qualify. Helcim's margin and the flat rates do not change below $50K a month, so at $25,000 in person Helcim (2.11%) still costs about $198 a month less than Square (2.90%). Interchange-plus figures rest on our interchange estimate (1.55% in person, 1.70% online), so a rewards-heavy card mix costs more.",
    relatedSlugs: [
      "best-payment-processors-25k-50k-monthly-2026",
      "best-payment-processors-2026",
      "small-business-credit-card-processing-guide",
    ],
  },
  {
    slug: "best-payment-processors-25k-50k-monthly-2026",
    monthlyRange: "$25,000 to $50,000",
    shortLabel: "$25K to $50K monthly",
    rangeMin: 25000,
    rangeMax: 50000,
    intent: "Growing SMBs where interchange-plus is already well ahead of flat rate and a subscription plan starts to pay for itself on online sales.",
    metaTitle: "Best Payment Processors for $25K-$50K Monthly Volume (2026)",
    metaDescription: "At $25K to $50K a month, Helcim and Stax cost 0.7 to 1.1 points less than Stripe and Square in our 2026 engine. The real monthly math at $50K.",
    heroH1: "Best Payment Processors for $25,000 to $50,000 Monthly Volume",
    heroSubhead: "In the $25K to $50K range interchange-plus is clearly ahead of flat rate: at $50K a month in person, Helcim costs $1,020 against $1,400 for Stripe and $1,450 for Square in our engine. Online, Stax already costs less than Helcim at $50K.",
    speakableLead: "Merchants processing $25,000 to $50,000 a month save the most on interchange-plus. In our engine at $50K a month, Helcim costs 2.04% in person and 2.55% online and Stax 2.11% and 2.40%, against 2.80% (Stripe) and 2.90% (Square) in person and 3.50% online. That is $380 to $430 a month in person over Stripe and Square. Payment Depot quotes interchange-plus but publishes no prices.",
    picks: [
      {
        name: "Helcim",
        effectiveRateRange: "2.11% in person, 2.70% online below $50K; 2.04% and 2.55% at $50K",
        pricingModel: "Interchange-plus",
        bestFor: "Primary in-person pick at this tier: no monthly fee, no contract, and the margin drops on its own at $50K a month (to 0.35% + 7¢ in person, 0.45% + 20¢ online).",
        watchOut: "No instant payout option. Online, Stax costs less at $50K a month in our engine ($1,200 vs $1,275).",
      },
      {
        name: "Stax (Fattmerchant)",
        effectiveRateRange: "2.11% in person, 2.40% online at $50K",
        pricingModel: "Subscription IC-plus",
        bestFor: "Online-heavy businesses toward $50K a month, where the $199+ subscription is small next to the markup it removes.",
        watchOut: "In person Helcim is still cheaper at $50K ($1,020 vs $1,055), and the fixed subscription weighs more the lower your volume. Stax does not publish its contract length, so get it in writing.",
      },
      {
        name: "Stripe",
        effectiveRateRange: "3.50% online, 2.80% in person at a $50 sale",
        pricingModel: "Flat-rate (custom pricing for large volume)",
        bestFor: "Custom checkout, marketplaces and subscription billing where Stripe's API ecosystem outweighs the rate premium.",
        watchOut: "At $50K a month you pay about $380 more than Helcim in person and $475 more online in our engine. Stripe offers custom pricing for large volumes without stating a threshold, so ask.",
      },
      {
        name: "Square",
        effectiveRateRange: "2.90% in person, 3.50% online at a $50 sale",
        pricingModel: "Flat-rate",
        bestFor: "Card-present retail or restaurants that want Square's POS software and hardware in one system.",
        watchOut: "Online it costs 2.9% + 30¢ (3.50% at a $50 sale), against 2.40% to 2.55% for Stax and Helcim at $50K. In person Helcim is $430 a month cheaper at $50K.",
      },
    ],
    pricingTiers: [
      {
        name: "Interchange-plus (no monthly)",
        label: "Helcim",
        monthlyCost: "$0 monthly fee · Interchange + 0.40% + 8¢ in person, + 0.50% + 25¢ online under $50K",
        bestFor: "In-person sales across this tier. Best entry point to IC+.",
        includes: [
          "No monthly fee or contract",
          "Margin steps down automatically at $50K a month",
          "No setup, PCI or cancellation fee",
          "Real interchange pass-through statements",
          "Cheapest in person at $50K in our engine",
        ],
      },
      {
        name: "Subscription IC-plus",
        label: "Stax (Payment Depot by quote only)",
        monthlyCost: "$199+ monthly at this volume + interchange + 8¢ in person, 15¢ online",
        bestFor: "Online-heavy businesses toward $50K a month, where it already beats Helcim.",
        includes: [
          "No percentage markup over interchange",
          "Fixed 8¢ in person, 15¢ online per sale",
          "Next business day funding",
          "Contract length not published: ask in writing",
          "Payment Depot: interchange-plus by quote, no published prices",
        ],
      },
      {
        name: "Custom IC++",
        label: "Negotiated with an ISO",
        monthlyCost: "Quote-based. No published rates to compare against",
        bestFor: "$45K+ monthly with stable processing history and a good chargeback ratio.",
        includes: [
          "Worth signing only if it beats Helcim's and Stax's published prices",
          "Ask for no auto-renewal and no early termination fee in writing",
          "Compare the full quote, including monthly, PCI and statement fees",
          "Worth negotiating only if you process consistently",
          "Get quotes from 3 ISOs before signing",
        ],
      },
    ],
    marketContext: "At $50,000 a month (the top of this tier and a point in our engine, at a $50 average sale and 60% credit, 40% debit), the monthly cost in person runs: Helcim $1,020, Stax $1,055, PayPal POS $1,235, Clover $1,335 (Retail Growth plan), Stripe Terminal $1,400, Square $1,450 (Plus plan). Online: Stax $1,200, Helcim $1,275, Adyen $1,280 (minimum monthly invoice not published), PayPal Advanced card $1,735, Stripe and Square $1,750. Below $50K Helcim's rate holds at 2.11% in person and 2.70% online, while Stax's $199+ subscription weighs more the lower your volume. Interchange-plus figures rest on our interchange estimate (1.55% in person, 1.70% online), so a rewards-heavy card mix costs more.",
    relatedSlugs: [
      "best-payment-processors-10k-25k-monthly-2026",
      "best-payment-processors-50k-100k-monthly-2026",
      "payment-processor-negotiation-playbook",
    ],
  },
  {
    slug: "best-payment-processors-50k-100k-monthly-2026",
    monthlyRange: "$50,000 to $100,000",
    shortLabel: "$50K to $100K monthly",
    rangeMin: 50000,
    rangeMax: 100000,
    intent: "Established SMBs and growing mid-market merchants where every basis point matters and rate negotiation becomes worth doing.",
    metaTitle: "Best Payment Processors for $50K-$100K Monthly Volume (2026)",
    metaDescription: "$50K to $100K a month: Helcim, Stax and quote-based interchange-plus compared on 2026 published prices, with the fees to push on before you sign.",
    heroH1: "Best Payment Processors for $50,000 to $100,000 Monthly Volume",
    heroSubhead: "At $50K a month in person, Helcim costs $1,020 and Stax $1,055 in our engine, against $1,400 for Stripe and $1,450 for Square. Online, Stax leads. Here is what each processor charges and where you still have room to negotiate.",
    speakableLead: "Merchants processing $50,000 to $100,000 a month pay about 2.04% to 2.11% in person and 2.40% to 2.55% online on Helcim and Stax at $50K in our engine, against 2.47% to 2.90% in person and 3.47% to 3.50% online on flat-rate PayPal, Stripe and Square. By $250K a month Stax is cheaper than Helcim in person too (1.79% vs 1.94%). Quote-based interchange-plus from an independent ISO, such as Payment Depot, can be worth pricing against both, but publishes no rates.",
    picks: [
      {
        name: "Helcim",
        effectiveRateRange: "2.04% in person, 2.55% online at $50K",
        pricingModel: "Interchange-plus with automatic volume discounts",
        bestFor: "In-person businesses near the bottom of this tier. Interchange + 0.35% + 7¢ in person from $50K, falling to 0.25% + 7¢ at $100K, with no negotiation and no monthly fee.",
        watchOut: "Online, Stax is already cheaper at $50K ($1,200 vs $1,275). In person, Stax overtakes Helcim between $50K and $250K a month (at $250K: $4,475 vs $4,850).",
      },
      {
        name: "Stax (Fattmerchant)",
        effectiveRateRange: "2.11% in person, 2.40% online at $50K (1.79% and 2.08% at $250K)",
        pricingModel: "Subscription interchange-plus",
        bestFor: "Online sales across this tier, and in-person sales toward the top of it, with predictable monthly volume.",
        watchOut: "The $199+ subscription is fixed regardless of volume, so slow months cost relatively more. Contract length is not published.",
      },
      {
        name: "Payment Depot",
        effectiveRateRange: "Not published (quote only)",
        pricingModel: "Interchange-plus by quote",
        bestFor: "Merchants who want another interchange-plus quote to price against Helcim and Stax. Its last readable pricing page states $0 setup and no cancellation fees.",
        watchOut: "Payment Depot publishes no membership or per-sale prices, so you cannot check a quote against a public rate. Get every fee in writing.",
      },
      {
        name: "Negotiated IC++ from an independent ISO",
        effectiveRateRange: "Not published (quote only)",
        pricingModel: "Custom interchange-plus-plus",
        bestFor: "Operators willing to get 3 ISO quotes and run a competitive process. Worth signing only if a quote beats Helcim's and Stax's published prices.",
        watchOut: "Hidden fees (PCI, regulatory, statement) can erase rate savings if you do not push back on them in the contract.",
      },
    ],
    pricingTiers: [
      {
        name: "Auto-discount IC+",
        label: "Helcim",
        monthlyCost: "$0 monthly fee · Interchange + 0.35% + 7¢ in person, + 0.45% + 20¢ online from $50K; 0.25% + 7¢ and 0.35% + 20¢ from $100K",
        bestFor: "In-person sales in the lower part of this tier. No negotiation required.",
        includes: [
          "No monthly fee or contract",
          "Volume steps applied automatically",
          "No cancellation fee",
          "No setup or PCI fee",
          "Best for operators who do not want to negotiate",
        ],
      },
      {
        name: "Subscription IC-plus",
        label: "Stax (Payment Depot by quote only)",
        monthlyCost: "$199+ monthly + interchange + 8¢ in person, 15¢ online",
        bestFor: "Online sales across this tier; in-person sales toward the top of it.",
        includes: [
          "No percentage markup over interchange",
          "Fixed 8¢ in person, 15¢ online per sale",
          "Next business day funding",
          "Predictable monthly fee",
          "Payment Depot: interchange-plus by quote, no published prices",
        ],
      },
      {
        name: "Custom IC++ (3-ISO process)",
        label: "Independent ISO contracts",
        monthlyCost: "Quote-based. No published rates to compare against",
        bestFor: "Mature operators with stable history, a good chargeback ratio and the time to negotiate.",
        includes: [
          "Worth signing only if it beats Helcim's and Stax's published prices",
          "Custom contract terms (push for no ETF, no auto-renewal)",
          "Ask for every monthly, PCI, statement and regulatory fee in writing",
          "PCI, regulatory and statement fees are negotiable",
          "Run a 3-quote competitive process, then come back to your incumbent",
        ],
      },
    ],
    marketContext: "At $50,000 a month (the bottom of this tier and a point in our engine, at a $50 average sale and 60% credit, 40% debit), the monthly cost in person runs: Helcim $1,020, Stax $1,055, PayPal POS $1,235, Stripe Terminal $1,400, Square $1,450. Online: Stax $1,200, Helcim $1,275, Adyen $1,280, Stripe and Square $1,750. At $250,000 a month, the next point in our engine, Stax costs $4,475 in person and $5,200 online against $4,850 and $6,125 for Helcim, so somewhere between $50K and $250K Stax becomes the cheaper choice in person as well. Independent ISO quotes publish no rates, so we cannot put them in this math: price any quote against these figures before you sign. Interchange-plus figures rest on our interchange estimate (1.55% in person, 1.70% online).",
    relatedSlugs: [
      "best-payment-processors-25k-50k-monthly-2026",
      "best-payment-processors-100k-250k-monthly-2026",
      "payment-processor-negotiation-playbook",
    ],
  },
  {
    slug: "best-payment-processors-100k-250k-monthly-2026",
    monthlyRange: "$100,000 to $250,000",
    shortLabel: "$100K to $250K monthly",
    rangeMin: 100000,
    rangeMax: 250000,
    intent: "Mid-market merchants where interchange at cost with a flat subscription (Stax) becomes the cheapest published price, and an independent ISO quote is worth pricing against it.",
    metaTitle: "Best Payment Processors for $100K-$250K Monthly Volume (2026)",
    metaDescription: "At $100K to $250K a month, Stax is the cheapest published price in our 2026 engine ($4,475 in person at $250K). Quotes and contract clauses to push on.",
    heroH1: "Best Payment Processors for $100,000 to $250,000 Monthly Volume",
    heroSubhead: "At $250K a month in person, Stax costs $4,475 and Helcim $4,850 in our engine, against $6,175 to $7,000 for PayPal, Square and Stripe. Flat rate at this volume costs real money. Quotes from independent ISOs can be lower still, but they publish no rates, so price them against these numbers.",
    speakableLead: "Merchants processing $100,000 to $250,000 a month pay about 1.79% in person and 2.08% online with Stax and 1.94% and 2.45% with Helcim at $250K in our engine, against 2.47% to 2.80% in person and 3.47% to 3.50% online on flat-rate PayPal, Square and Stripe. Quote-based interchange-plus from an independent ISO may beat that, but publishes no rates. The four fees to check in any quote are PCI, statement, regulatory and monthly minimum.",
    picks: [
      {
        name: "Stax",
        effectiveRateRange: "1.79% in person, 2.08% online at $250K",
        pricingModel: "Subscription IC-plus",
        bestFor: "Steady volume at this tier: interchange at cost plus 8¢ in person or 15¢ online and a $199+ subscription. The cheapest published price in our engine at $250K a month, in person and online.",
        watchOut: "Stax publishes its fee above $250K a year only as $199+ and does not publish its contract length, so get both in writing.",
      },
      {
        name: "Helcim",
        effectiveRateRange: "1.94% in person, 2.45% online at $250K",
        pricingModel: "Interchange-plus with automatic volume discounts",
        bestFor: "Merchants who want no monthly fee and no contract. Interchange + 0.25% + 7¢ in person and 0.35% + 20¢ online from $100K a month.",
        watchOut: "At $250K a month Stax costs $375 less in person ($4,475 vs $4,850) and $925 less online ($5,200 vs $6,125) in our engine.",
      },
      {
        name: "Negotiated IC++ from an independent ISO",
        effectiveRateRange: "Not published (quote only)",
        pricingModel: "Custom interchange-plus-plus",
        bestFor: "Operators willing to run a 3-quote process. ISOs such as Payment Depot (a registered ISO of Wells Fargo Bank, N.A.) quote interchange-plus; sign only if the quote beats Stax's and Helcim's published prices.",
        watchOut: "Read the contract for early termination fees and liquidated damages, which is where an ISO can claw back a negotiated discount.",
      },
      {
        name: "Adyen",
        effectiveRateRange: "2.56% online (interchange++ + 0.60% + 13¢)",
        pricingModel: "Enterprise interchange-plus",
        bestFor: "International and cross-border merchants where Adyen's unified processing across regions is unique.",
        watchOut: "Adyen applies a minimum monthly invoice it does not publish, and setup needs developer work. At its published rate it costs $6,400 online at $250K, more than Stax ($5,200) and Helcim ($6,125).",
      },
    ],
    pricingTiers: [
      {
        name: "Custom IC++ (quote)",
        label: "Negotiated through 3 ISOs",
        monthlyCost: "Quote-based. No published rates. Ask for no monthly fee.",
        bestFor: "$100K to $250K monthly with a stable processing history. Worth it only if the quote beats Stax's published price.",
        includes: [
          "Price every quote against Stax's and Helcim's published rates",
          "Negotiable contract terms (push: no ETF, no auto-renewal, capped reserve)",
          "Ask whether PCI, statement and regulatory fees can be waived",
          "Get the full fee schedule in writing",
          "Run the 3-quote process every 24 months at minimum",
        ],
      },
      {
        name: "Subscription, interchange at cost",
        label: "Stax",
        monthlyCost: "$199+ monthly + interchange + 8¢ in person, 15¢ online (no percentage markup)",
        bestFor: "The cheapest published price at this tier in our engine: $4,475 in person and $5,200 online at $250K a month.",
        includes: [
          "No percentage markup over interchange",
          "Next business day funding",
          "Predictable monthly subscription",
          "Contract length not published: ask in writing",
          "Hardware sold separately (SwipeSimple reader $125, Dejavoo QD4 $310)",
        ],
      },
      {
        name: "Enterprise IC++",
        label: "Adyen / Worldpay (negotiated)",
        monthlyCost: "Adyen: interchange++ + 0.60% + 13¢ (Visa and Mastercard), minimum invoice not published. Worldpay: no published rates",
        bestFor: "$200K to $250K monthly with international or cross-border volume or complex use cases.",
        includes: [
          "Unified cross-border processing (Adyen)",
          "Worldpay is part of Global Payments since January 2026",
          "Ask for the minimum invoice and contract terms in writing",
          "Engineering-heavy onboarding",
          "Best for mid-market with developer resources",
        ],
      },
    ],
    marketContext: "At $250,000 a month (the top of this tier and a point in our engine, at a $50 average sale and 60% credit, 40% debit), the monthly cost in person runs: Stax $4,475, Helcim $4,850, PayPal POS $6,175, Clover $6,325, Square $6,900 (Premium plan), Stripe Terminal $7,000. Online: Stax $5,200, Helcim $6,125, Adyen $6,400, PayPal Advanced card $8,675, Stripe and Square $8,750. Stax saves $375 a month in person and $925 online over Helcim, and $1,700 to $2,525 in person and $3,475 to $3,550 online over flat rate. At $50,000, the point below this tier, Helcim was still cheaper in person ($1,020 vs $1,055), so check where your volume sits. Independent ISO quotes publish no rates, so we cannot put them in this math. Interchange-plus figures rest on our interchange estimate (1.55% in person, 1.70% online).",
    relatedSlugs: [
      "best-payment-processors-50k-100k-monthly-2026",
      "best-payment-processors-500k-1m-monthly-2026",
      "payment-processor-negotiation-playbook",
    ],
  },
  {
    slug: "best-payment-processors-500k-1m-monthly-2026",
    monthlyRange: "$500,000 to $1,000,000",
    shortLabel: "$500K to $1M monthly",
    rangeMin: 500000,
    rangeMax: 1000000,
    intent: "Upper-mid-market merchants where interchange at cost is the cheapest published price and direct acquirer or enterprise contracts are worth quoting against it.",
    metaTitle: "Best Payment Processors for $500K-$1M Monthly Volume (2026)",
    metaDescription: "At $500K to $1M a month, Stax is the cheapest published price in our 2026 engine (1.73% in person at $1M). Enterprise and direct acquirer quotes compared.",
    heroH1: "Best Payment Processors for $500K to $1M Monthly Volume",
    heroSubhead: "At this volume the published prices that hold up are interchange at cost: at $1M a month in person, Stax costs $17,300 and Helcim $18,200 in our engine, against $24,700 to $28,000 for PayPal, Square and Stripe. Enterprise and direct acquirer contracts publish no rates, so get quotes and price them against these numbers.",
    speakableLead: "Merchants processing $500,000 to $1,000,000 a month pay about 1.73% in person and 2.02% online with Stax and 1.82% and 2.15% with Helcim at $1M in our engine (1.79% and 2.08%, 1.94% and 2.45% at $250K), against 2.47% to 2.80% in person and 3.47% to 3.50% online on flat rate. Direct acquirers such as Global Payments (which owns Worldpay), Fiserv and Chase quote custom rates they do not publish. The four contract clauses to negotiate hard at this tier are early termination, reserve cap, fallback rate and contract length.",
    picks: [
      {
        name: "Stax",
        effectiveRateRange: "1.73% in person, 2.02% online at $1M",
        pricingModel: "Subscription IC-plus",
        bestFor: "The cheapest published price in our engine at $250K and $1M a month, in person and online: interchange at cost plus 8¢ or 15¢ per sale and a $199+ subscription.",
        watchOut: "Stax publishes its fee at this volume only as $199+ and does not publish contract length; get both in writing. A higher subscription barely moves the rate at $1M.",
      },
      {
        name: "Direct acquirer (Global Payments/Worldpay, Fiserv, Chase)",
        effectiveRateRange: "Not published (quote only)",
        pricingModel: "Direct enterprise IC++",
        bestFor: "Merchants with an established processing history who want a direct relationship with the acquirer. Worth signing only if the quote beats Stax's published price.",
        watchOut: "Contract terms are not published. Ask for the length, early termination fee and reserve cap in writing before you sign.",
      },
      {
        name: "Adyen",
        effectiveRateRange: "2.56% online at its published rate (interchange++ + 0.60% + 13¢)",
        pricingModel: "Unified enterprise IC-plus",
        bestFor: "International and cross-border merchants and tech-forward operators with developer resources for the integration.",
        watchOut: "Setup is engineering-heavy and its minimum monthly invoice is not published. At the published rate it costs $25,600 online at $1M, against $20,200 for Stax and $21,500 for Helcim.",
      },
      {
        name: "Stripe",
        effectiveRateRange: "3.50% online, 2.80% in person at standard rates",
        pricingModel: "Flat-rate, custom pricing by quote",
        bestFor: "Online-only operators committed to Stripe's API ecosystem who do not want to manage multiple vendors.",
        watchOut: "Standard rates cost $35,000 a month online at $1M in our engine, against $20,200 for Stax. Stripe offers custom pricing for large volumes, so ask for a quote and compare.",
      },
    ],
    pricingTiers: [
      {
        name: "Direct acquirer",
        label: "Global Payments (Worldpay) / Fiserv / Chase",
        monthlyCost: "Quote-based. No published rates",
        bestFor: "$500K to $1M monthly with an established processing history. Sign only if the quote beats Stax's published price.",
        includes: [
          "Direct underwriting relationship",
          "Negotiated reserve structure",
          "Worldpay is part of Global Payments since January 2026",
          "Ask whether a dedicated account manager is included",
          "Contract terms not published: negotiate length, ETF and fallback rate",
        ],
      },
      {
        name: "Enterprise IC-plus",
        label: "Adyen / Stripe (custom)",
        monthlyCost: "Adyen published: interchange++ + 0.60% + 13¢. Stripe: custom pricing by quote",
        bestFor: "$500K+ monthly with international scope or tech-forward integration needs.",
        includes: [
          "Unified cross-border processing (Adyen)",
          "Developer-focused API ecosystem (Stripe)",
          "Custom contract terms",
          "Engineering-heavy onboarding",
          "Adyen minimum invoice not published",
        ],
      },
      {
        name: "Subscription, interchange at cost",
        label: "Stax",
        monthlyCost: "$199+ monthly + interchange + 8¢ in person, 15¢ online",
        bestFor: "The cheapest published price at this tier in our engine: $17,300 in person and $20,200 online at $1M a month.",
        includes: [
          "No percentage markup over interchange",
          "Predictable monthly cost",
          "Next business day funding",
          "Contract length not published: ask in writing",
          "Hardware sold separately",
        ],
      },
    ],
    marketContext: "At $1,000,000 a month (the top of this tier and a point in our engine, at a $50 average sale and 60% credit, 40% debit), the monthly cost in person runs: Stax $17,300, Helcim $18,200, PayPal POS $24,700, Clover $25,100, Square $27,100 (Premium plan), Stripe Terminal $28,000. Online: Stax $20,200, Helcim $21,500, Adyen $25,600, PayPal Advanced card $34,700, Stripe and Square $35,000. At $250,000, the point below this tier, Stax was also cheapest ($4,475 in person, $5,200 online). Direct acquirers and enterprise contracts publish no rates, so we cannot place them in this math: a quote is worth signing only if it beats these numbers after every monthly, PCI and statement fee. Interchange-plus figures rest on our interchange estimate (1.55% in person, 1.70% online), and at a larger average sale the fixed per-sale fees weigh less than at $50.",
    relatedSlugs: [
      "best-payment-processors-100k-250k-monthly-2026",
      "best-payment-processors-2026",
      "payment-processor-negotiation-playbook",
    ],
  },
];

export const VOLUME_TIERS_BY_SLUG = new Map(VOLUME_TIERS.map((t) => [t.slug, t]));

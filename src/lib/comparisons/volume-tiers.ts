// Configuration for the volume-tier comparison series.
// Each entry powers a /comparisons/best-payment-processors-<slug> page.
// Built from the baseline AEO probe finding (Q35/Q36 already cited in both
// Google + ChatGPT for volume-tier queries) — expanding the proven format.

export interface ProcessorPick {
  name: string;
  effectiveRateRange: string; // e.g. "1.95–2.30%"
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
    monthlyRange: "$10,000–$25,000",
    shortLabel: "$10K–$25K monthly",
    rangeMin: 10000,
    rangeMax: 25000,
    intent: "Solo operators, small e-commerce, single-location retail crossing the $10K monthly bar but not yet at the threshold where interchange-plus saves money.",
    metaTitle: "Best Payment Processors for $10K–$25K Monthly Volume (2026)",
    metaDescription: "Flat-rate vs interchange-plus at $10K–$25K monthly: real 2026 effective rates for Stripe, Square, Helcim, PayPal, Stax. Which wins on $15K monthly volume.",
    heroH1: "Best Payment Processors for $10,000–$25,000 Monthly Volume",
    heroSubhead: "At $10K–$25K monthly, flat-rate processors are still cheaper than most interchange-plus options. The break-even sits around $25K–$30K. Here is how the four pricing models actually compare.",
    speakableLead: "Merchants processing $10,000–$25,000 in monthly card volume pay an average effective rate of 2.65–2.95% on flat-rate processors and 2.30–2.55% on interchange-plus. Flat-rate is usually cheaper at this tier because the monthly fees on subscription models like Stax ($99/mo) and Payment Depot ($79/mo) exceed the rate savings until volume crosses roughly $30,000 monthly.",
    picks: [
      {
        name: "Square",
        effectiveRateRange: "2.65–2.95% blended",
        pricingModel: "Flat-rate",
        bestFor: "Brick-and-mortar retail, restaurants, salons — anywhere card-present transactions dominate.",
        watchOut: "Account holds and 30-day stabilization windows on new accounts. Online rate (2.9% + $0.30) is fine; in-person is the value play.",
      },
      {
        name: "Stripe",
        effectiveRateRange: "2.88–2.97% online",
        pricingModel: "Flat-rate",
        bestFor: "Online-only operators, SaaS, marketplaces, subscription billing under $25K monthly.",
        watchOut: "Rolling reserves on subscription / high-risk verticals. Lacks integrated POS.",
      },
      {
        name: "Helcim",
        effectiveRateRange: "2.41–2.51% (interchange + 0.40–0.50%)",
        pricingModel: "Interchange-plus",
        bestFor: "Mixed channel businesses on the high end of this tier ($20K+ monthly) where IC+ already beats flat-rate.",
        watchOut: "No same-day deposit. Onboarding asks for balance sheet + P&L, which slows time-to-live.",
      },
      {
        name: "PayPal",
        effectiveRateRange: "2.97–3.07% online + $0.49 fixed",
        pricingModel: "Flat-rate",
        bestFor: "Adding PayPal as a secondary checkout option on an existing site to capture buyers who prefer PayPal-balance payment. Not as a primary.",
        watchOut: "The $0.49 fixed fee dominates effective rate on tickets under $30 — micropayment-heavy businesses overpay.",
      },
    ],
    pricingTiers: [
      {
        name: "Entry flat-rate",
        label: "Square / Stripe / PayPal",
        monthlyCost: "$0 monthly fee · 2.6–2.9% + $0.10–$0.30 per transaction",
        bestFor: "$10K–$20K monthly. Predictable simple pricing.",
        includes: [
          "No monthly fee",
          "No PCI fee on basic plan",
          "Free reader (Square)",
          "Standard fraud screening",
          "Next-business-day funding",
        ],
      },
      {
        name: "Mid-tier interchange-plus",
        label: "Helcim",
        monthlyCost: "$0 monthly fee · Interchange + 0.40–0.50% + $0.08–$0.25 per transaction",
        bestFor: "$20K–$25K+ monthly with stable card mix. Begins to beat flat-rate on math.",
        includes: [
          "No monthly fee or contract",
          "Auto-applied volume discounts above $25K",
          "Free virtual terminal",
          "Real interchange pass-through",
          "Next-business-day deposit",
        ],
      },
      {
        name: "Subscription IC-plus",
        label: "Stax / Payment Depot",
        monthlyCost: "$79–$199 monthly + Interchange + ~0%–0.20% markup",
        bestFor: "Not yet — wait until $30K+ monthly to justify subscription cost.",
        includes: [
          "Lowest per-transaction markup",
          "Interchange-plus pricing",
          "Premium support",
          "Often free or discounted hardware",
          "Not cost-effective at this tier",
        ],
      },
    ],
    marketContext: "At $15,000 monthly volume on a typical SMB card mix (60% credit, 40% debit, 30% rewards, $74 average ticket), the math runs: Square at 2.75% effective ≈ $412/month. Helcim at 2.51% effective ≈ $377/month. Stax at $99/mo subscription + 2.21% effective ≈ $431/month. Helcim wins by ~$35/month at this volume — but only if the merchant is at the upper end of the tier. Below $15K monthly, Square's simplicity wins on total cost including time spent reconciling.",
    relatedSlugs: [
      "best-payment-processors-25k-50k-monthly-2026",
      "best-payment-processors-2026",
      "small-business-credit-card-processing-guide",
    ],
  },
  {
    slug: "best-payment-processors-25k-50k-monthly-2026",
    monthlyRange: "$25,000–$50,000",
    shortLabel: "$25K–$50K monthly",
    rangeMin: 25000,
    rangeMax: 50000,
    intent: "Growing SMBs at the inflection point where flat-rate stops being cheapest and interchange-plus begins to dominate.",
    metaTitle: "Best Payment Processors for $25K–$50K Monthly Volume (2026)",
    metaDescription: "At $25K–$50K monthly, interchange-plus (Helcim, Stax) starts beating flat-rate (Stripe, Square) by 0.30–0.45% on effective rate. Here is the real math.",
    heroH1: "Best Payment Processors for $25,000–$50,000 Monthly Volume",
    heroSubhead: "The $25K–$50K range is where interchange-plus pulls ahead of flat-rate on every card mix. The savings run $90–$220 per month. This is the tier where Helcim and Stax start making sense.",
    speakableLead: "Merchants processing $25,000–$50,000 in monthly card volume should be on interchange-plus by 2026. The median effective-rate gap between Helcim and Stripe at $35,000 monthly runs 0.40–0.55%, which translates to $140–$190 per month in unnecessary fees on flat-rate. Subscription processors (Stax, Payment Depot) become cost-effective above $35K monthly.",
    picks: [
      {
        name: "Helcim",
        effectiveRateRange: "2.31–2.43% (interchange + 0.40–0.50%)",
        pricingModel: "Interchange-plus",
        bestFor: "Primary recommendation at this tier. No monthly fee + automatic volume discounts above $25K = consistent winner.",
        watchOut: "No same-day deposit option. Underwriting requires balance sheet + P&L (1–2 week onboarding).",
      },
      {
        name: "Stax (Fattmerchant)",
        effectiveRateRange: "2.21–2.45% (interchange + 0%–0.10%) + $99–$199/mo",
        pricingModel: "Subscription IC-plus",
        bestFor: "Above $35K monthly where the subscription fee amortizes out. Predictable subscription pricing for forecast-driven operators.",
        watchOut: "Below $35K monthly, the subscription kills the savings. Run the math at your actual volume before committing.",
      },
      {
        name: "Stripe",
        effectiveRateRange: "2.88–2.95% online",
        pricingModel: "Flat-rate (negotiable above $80K)",
        bestFor: "Custom checkout, marketplaces, subscription billing where Stripe's API ecosystem outweighs the 0.40%+ rate premium.",
        watchOut: "Pure cost-wise you are paying $140–$200/month more than Helcim at this tier. Justify via developer tooling, not rate.",
      },
      {
        name: "Square",
        effectiveRateRange: "2.60–2.93%",
        pricingModel: "Flat-rate",
        bestFor: "Card-present retail / restaurant where Square's free POS hardware ecosystem still beats the alternative cost of building one.",
        watchOut: "Online rate (2.93%) is uncompetitive at this volume. Move online traffic to Helcim or Stripe.",
      },
    ],
    pricingTiers: [
      {
        name: "Interchange-plus (no monthly)",
        label: "Helcim",
        monthlyCost: "$0 monthly fee · Interchange + 0.40–0.50% + $0.08–$0.25 per transaction",
        bestFor: "$25K–$35K monthly. Best entry point to IC+.",
        includes: [
          "No monthly fee or contract",
          "Auto-applied volume discounts",
          "Free virtual terminal",
          "Real interchange pass-through statements",
          "Best on math for the lower half of this tier",
        ],
      },
      {
        name: "Subscription IC-plus",
        label: "Stax / Payment Depot",
        monthlyCost: "$79–$199 monthly + Interchange + 0%–0.20% markup",
        bestFor: "$35K–$50K monthly. Subscription fee gets diluted at higher volumes.",
        includes: [
          "Lowest per-transaction markup at this tier",
          "Premium support included",
          "Often free or discounted hardware",
          "Predictable monthly subscription",
          "Becomes the lowest-cost option above $35K",
        ],
      },
      {
        name: "Custom IC++",
        label: "Negotiated with an ISO",
        monthlyCost: "Varies — typically interchange + ~0.20–0.30% + $0.10 per transaction",
        bestFor: "$45K+ monthly with stable processing history and good chargeback ratio.",
        includes: [
          "Lowest published-or-negotiated rate at this volume",
          "Custom contract terms (no auto-renewal, no ETF)",
          "Direct relationship with the underwriter",
          "Worth negotiating only if you process consistently",
          "Get quotes from 3 ISOs before signing",
        ],
      },
    ],
    marketContext: "At $35,000 monthly with a 60/40 credit/debit mix and $80 average ticket, the comparison is: Stripe ≈ $1,030/month (2.94% effective). Helcim ≈ $830/month (2.37% effective). Stax ≈ $99/mo + $805 processing ≈ $904/month. Helcim wins by $130–$200/month over flat-rate. The break-even for Stax over Helcim sits around $50,000 monthly.",
    relatedSlugs: [
      "best-payment-processors-10k-25k-monthly-2026",
      "best-payment-processors-50k-100k-monthly-2026",
      "payment-processor-negotiation-playbook",
    ],
  },
  {
    slug: "best-payment-processors-50k-100k-monthly-2026",
    monthlyRange: "$50,000–$100,000",
    shortLabel: "$50K–$100K monthly",
    rangeMin: 50000,
    rangeMax: 100000,
    intent: "Established SMBs and growing mid-market merchants where every basis point matters and rate negotiation becomes worth doing.",
    metaTitle: "Best Payment Processors for $50K–$100K Monthly Volume (2026)",
    metaDescription: "$50K–$100K monthly: Helcim, Stax, Payment Depot, and negotiated IC++ from independent ISOs. Real 2026 rates, the four hidden fees to push on, and when to negotiate.",
    heroH1: "Best Payment Processors for $50,000–$100,000 Monthly Volume",
    heroSubhead: "At $50K–$100K monthly, the difference between a good processor and a great one is roughly $400–$700 per month. Every basis point counts. Here is what each processor actually charges and where the negotiation leverage sits.",
    speakableLead: "Merchants processing $50,000–$100,000 in monthly card volume pay an average effective rate of 2.18–2.45% on interchange-plus and 2.55–2.80% on flat-rate. The 30–50 basis point gap translates to $180–$500 per month in avoidable cost. At this tier, subscription processors (Stax, Payment Depot) and negotiated IC++ from independent ISOs consistently beat advertised retail rates.",
    picks: [
      {
        name: "Helcim",
        effectiveRateRange: "2.21–2.33% (interchange + 0.40% + auto volume discounts)",
        pricingModel: "Interchange-plus with automatic volume discounts",
        bestFor: "Lower half of this tier ($50K–$70K). The auto-applied volume discount is the clean choice with no negotiation needed.",
        watchOut: "Above $80K monthly, a Stax subscription or negotiated IC++ usually edges Helcim by 5–15 bp.",
      },
      {
        name: "Stax (Fattmerchant)",
        effectiveRateRange: "2.21–2.45% (interchange + 0%) + $99–$199/mo",
        pricingModel: "Subscription interchange-plus",
        bestFor: "Upper half of this tier ($70K–$100K) with predictable monthly volume.",
        watchOut: "The subscription is fixed regardless of volume — slow months cost relatively more.",
      },
      {
        name: "Payment Depot",
        effectiveRateRange: "2.18–2.41% (interchange + 0.05–0.15% + $0.05–$0.10) + $79–$199/mo",
        pricingModel: "Membership IC-plus",
        bestFor: "Operators on subscription model who prefer Payment Depot's per-transaction transparency.",
        watchOut: "Membership tiers structure means cost-effectiveness drops between tier boundaries.",
      },
      {
        name: "Negotiated IC++ from an independent ISO",
        effectiveRateRange: "1.95–2.30% (interchange + 0.15–0.30% + $0.08–$0.10)",
        pricingModel: "Custom interchange-plus-plus",
        bestFor: "Operators willing to get 3 ISO quotes and run a competitive process. Lowest cost path at this tier.",
        watchOut: "Hidden fees (PCI, regulatory, statement) can erase rate savings if you do not push back on them in contract.",
      },
    ],
    pricingTiers: [
      {
        name: "Auto-discount IC+",
        label: "Helcim",
        monthlyCost: "$0 monthly fee · Interchange + 0.30–0.40% (auto-tiered) + $0.08 per transaction",
        bestFor: "$50K–$70K monthly. Clean, no negotiation required.",
        includes: [
          "No monthly fee or contract",
          "Auto-tier discounts already applied",
          "No early termination fee",
          "Predictable statements",
          "Best for operators who do not want to negotiate",
        ],
      },
      {
        name: "Subscription IC-plus",
        label: "Stax / Payment Depot",
        monthlyCost: "$99–$199 monthly + Interchange + 0%–0.15% markup",
        bestFor: "$70K–$100K monthly. Lowest cost on consistent volume above $70K.",
        includes: [
          "Lowest published per-transaction markup",
          "Premium support",
          "Discounted hardware",
          "Predictable monthly cost",
          "Locks in interchange pass-through",
        ],
      },
      {
        name: "Custom IC++ (3-ISO process)",
        label: "Independent ISO contracts",
        monthlyCost: "Negotiated — typically Interchange + 0.15–0.25% + $0.08–$0.10 per transaction",
        bestFor: "Mature operators with stable history, good chargeback ratio, willing to negotiate.",
        includes: [
          "Lowest available pricing at this tier",
          "Custom contract terms (push for no ETF, no auto-renewal)",
          "Often includes premium service tier",
          "Negotiable PCI / regulatory / statement fees",
          "Run a 3-quote competitive process, then come back to your incumbent",
        ],
      },
    ],
    marketContext: "At $75,000 monthly with a typical SMB card mix and $90 average ticket, the comparison runs: Helcim ≈ $1,750/month (2.33% effective). Stax ≈ $99/mo + $1,650 ≈ $1,749/month (basically tied). Negotiated IC++ from an independent ISO ≈ $1,500/month (2.00% effective). The negotiated route saves $250/month over Helcim/Stax — $3,000/year — but requires 3–5 hours of work to run the quote process.",
    relatedSlugs: [
      "best-payment-processors-25k-50k-monthly-2026",
      "best-payment-processors-100k-250k-monthly-2026",
      "payment-processor-negotiation-playbook",
    ],
  },
  {
    slug: "best-payment-processors-100k-250k-monthly-2026",
    monthlyRange: "$100,000–$250,000",
    shortLabel: "$100K–$250K monthly",
    rangeMin: 100000,
    rangeMax: 250000,
    intent: "Mid-market merchants where custom IC++ from independent ISOs consistently beats every retail processor — and negotiation is mandatory, not optional.",
    metaTitle: "Best Payment Processors for $100K–$250K Monthly Volume (2026)",
    metaDescription: "At $100K–$250K monthly, every basis point is $100–$250/month. Real 2026 IC++ rates, the negotiation leverage you have at this tier, and the four contract clauses to push on.",
    heroH1: "Best Payment Processors for $100,000–$250,000 Monthly Volume",
    heroSubhead: "At $100K–$250K monthly, custom interchange-plus-plus pricing from independent ISOs consistently beats published retail rates by 30–60 basis points. The savings are $300–$1,500 per month. Anyone selling you a flat-rate or subscription product at this volume is leaving money on the table.",
    speakableLead: "Merchants processing $100,000–$250,000 in monthly card volume should be on custom interchange-plus-plus (IC++) contracts negotiated through an independent ISO. The median effective rate at this tier runs 1.85–2.15% — 40–70 basis points below published retail. The four hidden fees most merchants miss (PCI, statement, regulatory, monthly minimum) are all negotiable at this volume.",
    picks: [
      {
        name: "Negotiated IC++ from an independent ISO",
        effectiveRateRange: "1.85–2.15% (interchange + 0.10–0.20% + $0.08–$0.10)",
        pricingModel: "Custom interchange-plus-plus",
        bestFor: "Default recommendation at this tier. The 3-ISO quote process pays for itself within the first 30 days.",
        watchOut: "Read the contract carefully — early termination clauses + liquidated damages are where ISOs claw back the negotiation discount.",
      },
      {
        name: "Stax",
        effectiveRateRange: "2.13–2.21% + $199/mo",
        pricingModel: "Subscription IC-plus",
        bestFor: "Operators who value the subscription's premium support tier and do not want to negotiate.",
        watchOut: "At this volume, the subscription saves nothing over auto-discounted Helcim. Justify by support quality, not cost.",
      },
      {
        name: "Payment Depot",
        effectiveRateRange: "2.09–2.18% + $199/mo",
        pricingModel: "Membership IC-plus",
        bestFor: "Operators on the membership-tier ladder who fit cleanly into a published bucket.",
        watchOut: "Between-tier costs do not amortize cleanly. Stax or Helcim usually edge it.",
      },
      {
        name: "Adyen",
        effectiveRateRange: "1.91–2.04% + minimum ~$120K monthly + setup work",
        pricingModel: "Enterprise interchange-plus",
        bestFor: "International / cross-border merchants where Adyen's unified processing across regions is unique.",
        watchOut: "Setup is engineering-heavy. Best for tech-forward operators with developer resources.",
      },
    ],
    pricingTiers: [
      {
        name: "Custom IC++ (default)",
        label: "Negotiated through 3 ISOs",
        monthlyCost: "Interchange + 0.15–0.25% + $0.08–$0.10 per transaction. No monthly fee in most contracts.",
        bestFor: "$100K–$200K monthly. Best math at this volume.",
        includes: [
          "Lowest available rate",
          "Negotiable contract terms (push: no ETF, no auto-renewal, capped reserve)",
          "Direct relationship with the underwriter",
          "PCI / statement / regulatory fees waivable",
          "Run the 3-quote process every 24 months at minimum",
        ],
      },
      {
        name: "Subscription premium",
        label: "Stax / Payment Depot",
        monthlyCost: "$199 monthly + Interchange + 0%–0.10% markup",
        bestFor: "$100K–$200K monthly with stable card mix and operators who value subscription predictability.",
        includes: [
          "Premium support included",
          "Often free hardware",
          "Predictable monthly subscription",
          "Lowest published per-transaction markup",
          "Better fit for forecast-driven operators",
        ],
      },
      {
        name: "Enterprise IC++",
        label: "Adyen / Worldpay (negotiated)",
        monthlyCost: "Negotiated. Typically interchange + 0.10–0.15% + custom per-transaction fees",
        bestFor: "$200K–$250K monthly with international / cross-border volume or complex use cases.",
        includes: [
          "Lowest rate available in U.S.",
          "Unified cross-border processing (Adyen)",
          "Direct acquirer relationship",
          "Engineering-heavy onboarding",
          "Best for mid-market with developer resources",
        ],
      },
    ],
    marketContext: "At $175,000 monthly with a typical mid-market card mix (70% credit, 30% debit, 35% rewards) and $120 average ticket, the comparison runs: Negotiated IC++ ≈ $3,300/month (1.89% effective). Stax ≈ $199/mo + $3,710 ≈ $3,909/month (2.23% effective). Helcim with auto-discounts ≈ $3,640/month (2.08% effective). The custom IC++ route saves $300–$600/month over the next-best option, which is $3,600–$7,200/year. At this tier, not running a 3-quote process is leaving real money on the table.",
    relatedSlugs: [
      "best-payment-processors-50k-100k-monthly-2026",
      "best-payment-processors-500k-1m-monthly-2026",
      "payment-processor-negotiation-playbook",
    ],
  },
  {
    slug: "best-payment-processors-500k-1m-monthly-2026",
    monthlyRange: "$500,000–$1,000,000",
    shortLabel: "$500K–$1M monthly",
    rangeMin: 500000,
    rangeMax: 1000000,
    intent: "Upper-mid-market merchants where direct acquirer relationships and custom enterprise contracts beat every retail or subscription processor.",
    metaTitle: "Best Payment Processors for $500K–$1M Monthly Volume (2026)",
    metaDescription: "$500K–$1M monthly merchants belong on direct acquirer contracts or enterprise IC++ from Adyen, Worldpay, or Global Payments. Real 2026 rates and negotiation leverage.",
    heroH1: "Best Payment Processors for $500,000–$1,000,000 Monthly Volume",
    heroSubhead: "Above $500K monthly, you should not be on a retail processor. Direct acquirer relationships, enterprise contracts with Adyen, Worldpay, or Global Payments, and custom IC++ from established ISOs are where the rate floor lives. Anyone advertising flat-rate at this volume is targeting customers who do not run the math.",
    speakableLead: "Merchants processing $500,000–$1,000,000 in monthly card volume operate at the edge of the SMB pricing band. Effective rates at this tier should run 1.65–1.95% on interchange-plus-plus and 1.80–2.10% on subscription. Direct acquirer relationships (Worldpay, Fiserv, Global Payments) often beat both, with custom rates negotiated quarterly. The four contract clauses to negotiate hard at this tier are early termination, reserve cap, fallback rate, and contract length.",
    picks: [
      {
        name: "Direct acquirer (Worldpay, Fiserv, Global Payments, Chase Paymentech)",
        effectiveRateRange: "1.65–1.95% (interchange + 0.05–0.15% + $0.05–$0.08)",
        pricingModel: "Direct enterprise IC++",
        bestFor: "Default at this tier. Direct relationship with the underwriting bank cuts out the ISO margin.",
        watchOut: "Contract length is typically 3 years minimum. Reserve requirements get aggressive — push hard on cap structure.",
      },
      {
        name: "Adyen",
        effectiveRateRange: "1.71–1.91% (interchange + 0.10% + custom)",
        pricingModel: "Unified enterprise IC-plus",
        bestFor: "International / cross-border merchants and tech-forward operators with developer resources for the integration.",
        watchOut: "Setup is engineering-heavy. Not turnkey.",
      },
      {
        name: "Stripe Enterprise",
        effectiveRateRange: "1.85–2.10% (negotiated, opaque published rates)",
        pricingModel: "Negotiated flat-rate or interchange-plus",
        bestFor: "Online-only operators committed to Stripe's API ecosystem who do not want to manage multiple vendors.",
        watchOut: "Stripe's enterprise pricing is rarely the cheapest. Justify with ecosystem value, not rate.",
      },
      {
        name: "Stax Enterprise",
        effectiveRateRange: "1.95–2.13% + $499/mo",
        pricingModel: "Enterprise subscription IC-plus",
        bestFor: "Operators wanting subscription predictability at enterprise volume with a single account manager.",
        watchOut: "At $500K+ monthly, the $499 subscription is rounding error. Math is fine but rarely the lowest cost.",
      },
    ],
    pricingTiers: [
      {
        name: "Direct acquirer",
        label: "Worldpay / Fiserv / Global Payments / Chase Paymentech",
        monthlyCost: "Custom — typically interchange + 0.05–0.15% + $0.05–$0.08 per transaction",
        bestFor: "$500K–$1M monthly with established processing history. Lowest cost path.",
        includes: [
          "Lowest available U.S. rate",
          "Direct underwriting relationship",
          "Negotiated reserve structure",
          "Premium support / dedicated account manager",
          "3-year contracts — negotiate ETF and fallback rate carefully",
        ],
      },
      {
        name: "Enterprise IC-plus",
        label: "Adyen / Stripe Enterprise",
        monthlyCost: "Negotiated — typically interchange + 0.10–0.15% + custom per-transaction",
        bestFor: "$500K+ monthly with international scope or tech-forward integration needs.",
        includes: [
          "Unified cross-border processing (Adyen)",
          "Best-in-class API ecosystem (Stripe)",
          "Custom contract terms",
          "Engineering-heavy onboarding",
          "Premium support",
        ],
      },
      {
        name: "Enterprise subscription",
        label: "Stax Enterprise",
        monthlyCost: "$499 monthly + Interchange + 0%–0.10% markup",
        bestFor: "Operators wanting single-vendor subscription predictability.",
        includes: [
          "Predictable monthly cost",
          "Dedicated account manager",
          "Premium hardware tier",
          "Single point of contact",
          "Not the lowest cost — chose for service, not rate",
        ],
      },
    ],
    marketContext: "At $750,000 monthly with a typical mid-market card mix and $150 average ticket, the math runs: Direct acquirer (Worldpay) ≈ $12,750/month (1.70% effective). Adyen ≈ $13,800/month (1.84% effective). Stax Enterprise ≈ $499/mo + $14,250 ≈ $14,749/month (1.97% effective). Stripe Enterprise (negotiated, illustrative) ≈ $14,250/month (1.90% effective). The direct acquirer route saves $1,000–$2,000/month over alternatives — $12K–$24K/year — but requires direct underwriting and longer onboarding (4–8 weeks).",
    relatedSlugs: [
      "best-payment-processors-100k-250k-monthly-2026",
      "best-payment-processors-2026",
      "payment-processor-negotiation-playbook",
    ],
  },
];

export const VOLUME_TIERS_BY_SLUG = new Map(VOLUME_TIERS.map((t) => [t.slug, t]));

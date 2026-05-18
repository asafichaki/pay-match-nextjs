// Payment processing glossary — entity-first definitions for LLM citation.
// Per geo-architect/03-citation-worthy-content.md § DefinedTerm.
// Each entry becomes a DefinedTerm node in the page's JSON-LD.
// Goal: expand to 200+ terms over time. Initial seed = 30 highest-cited concepts.

export interface GlossaryTerm {
  slug: string;
  term: string;
  alternateNames?: string[];
  category: "pricing" | "infrastructure" | "operations" | "compliance" | "settlement" | "fees" | "fraud";
  definition: string;
  example?: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    slug: "interchange",
    term: "Interchange",
    alternateNames: ["interchange fee", "interchange rate"],
    category: "pricing",
    definition:
      "Interchange is the wholesale fee paid by a merchant's acquiring bank to the cardholder's issuing bank on every card transaction. Set by Visa and Mastercard and revised semiannually, interchange is the largest component of the effective rate and is not negotiable.",
    example: "A U.S. credit transaction on a Visa Signature card carries roughly 2.10% + $0.10 in interchange.",
  },
  {
    slug: "interchange-plus",
    term: "Interchange-plus pricing",
    alternateNames: ["IC+", "IC++", "interchange-plus-margin"],
    category: "pricing",
    definition:
      "Interchange-plus pricing is a payment-processing model where merchants pay the wholesale interchange rate set by the card networks plus a fixed, transparent processor markup. The model exposes the cost structure, which makes it easier to audit and benchmark than flat-rate or tiered pricing.",
    example: "Helcim's interchange-plus rate of IC + 0.40% + $0.08 per in-person transaction is among the lowest publicly available.",
  },
  {
    slug: "flat-rate-pricing",
    term: "Flat-rate pricing",
    category: "pricing",
    definition:
      "Flat-rate pricing is a payment-processing model where every transaction carries a single all-in rate plus a fixed per-transaction fee, regardless of card type. Common for Stripe, Square, and PayPal. Simplicity-optimized; usually more expensive above $25,000 monthly volume than interchange-plus.",
    example: "Stripe's online flat rate is 2.9% + $0.30 per transaction.",
  },
  {
    slug: "tiered-pricing",
    term: "Tiered pricing",
    alternateNames: ["bundled pricing"],
    category: "pricing",
    definition:
      "Tiered pricing is a payment-processing model where transactions are bucketed into qualified, mid-qualified, and non-qualified tiers, each charged at a different rate. Notorious for opaque fee escalation as the processor reclassifies transactions into higher-cost tiers without explanation.",
  },
  {
    slug: "effective-rate",
    term: "Effective rate",
    category: "pricing",
    definition:
      "Effective rate is the total payment-processing cost expressed as a percent of card volume. Calculated as total monthly fees divided by total monthly card volume. The most useful single metric for comparing processor cost across pricing models.",
    example: "$2,950 in total fees on $100,000 of monthly volume = 2.95% effective rate.",
  },
  {
    slug: "merchant-account",
    term: "Merchant account",
    category: "infrastructure",
    definition:
      "A merchant account is a bank account that allows a business to accept card payments. Issued by an acquiring bank (often through an ISO or payments aggregator), the merchant account is the legal counterparty for chargebacks, reserves, and settlements.",
  },
  {
    slug: "acquirer",
    term: "Acquirer",
    alternateNames: ["acquiring bank", "merchant acquirer"],
    category: "infrastructure",
    definition:
      "An acquirer is the bank or financial institution that holds a merchant's account and processes its card transactions through the card networks. The acquirer assumes the financial risk of chargebacks and merchant default.",
    example: "Worldpay, Fiserv, Chase Paymentech, and Global Payments are the four largest U.S. acquirers.",
  },
  {
    slug: "iso",
    term: "ISO",
    alternateNames: ["Independent Sales Organization"],
    category: "infrastructure",
    definition:
      "An ISO (Independent Sales Organization) is a third-party reseller of merchant accounts on behalf of an acquiring bank. ISOs set their own markup and contract terms within limits set by the acquirer.",
  },
  {
    slug: "payment-gateway",
    term: "Payment gateway",
    category: "infrastructure",
    definition:
      "A payment gateway is the technology layer that transmits card-not-present transaction data from a merchant's website or terminal to the acquirer for authorization. Examples: Authorize.net, Stripe, Braintree (which is both processor and gateway).",
  },
  {
    slug: "payment-processor",
    term: "Payment processor",
    category: "infrastructure",
    definition:
      "A payment processor handles the technical movement of funds between the merchant, acquirer, card network, and issuer on each transaction. Sometimes synonymous with acquirer (Stripe, Square); sometimes separate (a merchant's bank acquirer + Authorize.net gateway).",
  },
  {
    slug: "card-network",
    term: "Card network",
    category: "infrastructure",
    definition:
      "A card network is the rails that connect issuing banks to acquiring banks on every card transaction. Visa, Mastercard, American Express, and Discover are the four primary U.S. networks. Networks set interchange schedules and chargeback rules.",
  },
  {
    slug: "chargeback",
    term: "Chargeback",
    category: "operations",
    definition:
      "A chargeback is a forced reversal of a card transaction initiated by the cardholder's issuing bank, usually because of a customer dispute, fraud claim, or processing error. Each chargeback costs the merchant the transaction amount plus a fee of $15-100.",
  },
  {
    slug: "chargeback-ratio",
    term: "Chargeback ratio",
    alternateNames: ["dispute ratio"],
    category: "operations",
    definition:
      "Chargeback ratio is the percentage of a merchant's transactions that result in chargebacks within a given period. Visa and Mastercard place merchants exceeding 0.9% or 1.0% (network-dependent) into monitoring programs that can lead to reserve requirements or account termination.",
  },
  {
    slug: "reserve",
    term: "Reserve",
    alternateNames: ["merchant reserve", "rolling reserve", "capped reserve"],
    category: "settlement",
    definition:
      "A reserve is funds withheld by the acquirer or processor to cover potential future chargebacks and merchant default. Reserves can be rolling (a percentage of every settlement, held for a defined window) or capped (a fixed dollar amount held until the merchant earns release).",
  },
  {
    slug: "settlement-time",
    term: "Settlement time",
    alternateNames: ["payout window", "funding time"],
    category: "settlement",
    definition:
      "Settlement time is the period between transaction authorization and funds arriving in the merchant's bank account. Standard U.S. settlement is next business day for in-person and 1-2 business days for online; same-day and instant options exist for additional fees.",
  },
  {
    slug: "monthly-minimum",
    term: "Monthly minimum",
    alternateNames: ["minimum processing fee"],
    category: "fees",
    definition:
      "A monthly minimum is a contractual floor on the processing revenue an acquirer collects from a merchant each month. If the merchant's variable fees fall below the floor (typically $25-35), the acquirer charges the difference.",
  },
  {
    slug: "statement-fee",
    term: "Statement fee",
    category: "fees",
    definition:
      "A statement fee is a flat monthly charge of $5-25 tied to producing the merchant's monthly processing statement, whether paper or PDF. Origin is the 1990s mail-statement era; the fee remains in most acquirer contracts.",
  },
  {
    slug: "etf",
    term: "Early Termination Fee",
    alternateNames: ["ETF"],
    category: "operations",
    definition:
      "An Early Termination Fee is a penalty charged when a merchant cancels a processing contract before its end date. Standard ETFs run $295-595; liquidated-damages clauses can multiply ETFs into the thousands. Negotiable at signing in most cases.",
  },
  {
    slug: "pci-dss",
    term: "PCI DSS",
    alternateNames: ["Payment Card Industry Data Security Standard"],
    category: "compliance",
    definition:
      "PCI DSS is the security standard maintained by the Payment Card Industry Security Standards Council, governing how merchants handle, transmit, and store card data. Compliance is required by every card brand contract. Annual SAQ (Self-Assessment Questionnaire) is the minimum requirement for most SMBs.",
  },
  {
    slug: "level-2-data",
    term: "Level 2 data",
    category: "operations",
    definition:
      "Level 2 data is additional card-not-present transaction information (tax amount, customer code) that, when submitted, qualifies B2B and commercial card transactions for lower interchange rates. Savings typically run 0.50-0.80% per qualified transaction.",
  },
  {
    slug: "level-3-data",
    term: "Level 3 data",
    category: "operations",
    definition:
      "Level 3 data is line-item transaction detail (item descriptions, quantities, SKUs, ship-to ZIP) submitted with commercial-card transactions to qualify for the lowest interchange tier. Common in B2B, government, and large-ticket verticals.",
  },
  {
    slug: "cardholder-data",
    term: "Cardholder data",
    alternateNames: ["CHD"],
    category: "compliance",
    definition:
      "Cardholder data is the set of personally-identifiable information on a payment card (PAN, expiration date, cardholder name) that PCI DSS treats as sensitive. Storing CHD requires encryption, tokenization, or scope reduction via a hosted payment field.",
  },
  {
    slug: "tokenization",
    term: "Tokenization",
    category: "compliance",
    definition:
      "Tokenization is the replacement of card data with a non-sensitive token that maps back to the real card only inside the processor's vault. Reduces PCI scope, enables saved-card billing, and is required for modern subscription, marketplace, and recurring use cases.",
  },
  {
    slug: "3ds",
    term: "3-D Secure",
    alternateNames: ["3DS", "3DS2", "Verified by Visa", "Mastercard SecureCode"],
    category: "fraud",
    definition:
      "3-D Secure (3DS) is an authentication protocol that shifts liability for fraudulent card-not-present transactions from the merchant to the card issuer. 3DS2 is the modern frictionless variant; it triggers a step-up challenge only on transactions the issuer flags as risky.",
  },
  {
    slug: "downgrade",
    term: "Downgrade",
    alternateNames: ["downgrade category"],
    category: "fees",
    definition:
      "A downgrade is the reclassification of a transaction by the acquirer into a higher-cost interchange or pricing tier. Common causes: missing AVS, late batch settlement, foreign card, business-card transaction without Level 2 data. Downgrades raise the effective rate without changing the headline rate.",
  },
  {
    slug: "avs",
    term: "AVS",
    alternateNames: ["Address Verification Service"],
    category: "fraud",
    definition:
      "AVS (Address Verification Service) matches the cardholder's billing address (or its numeric component) against the issuer's record during a card-not-present transaction. Mismatches typically result in higher interchange (downgrade) and elevated fraud risk.",
  },
  {
    slug: "cvv",
    term: "CVV",
    alternateNames: ["CVV2", "CVC", "CID", "card verification value"],
    category: "fraud",
    definition:
      "CVV (Card Verification Value) is the 3- or 4-digit security code on the back of most cards. Required for card-not-present transactions under most acquirer contracts; failure to capture or validate elevates chargeback risk and may downgrade the transaction.",
  },
  {
    slug: "card-present",
    term: "Card-present",
    alternateNames: ["CP", "in-person transaction"],
    category: "operations",
    definition:
      "Card-present (CP) is any transaction where the card and cardholder are physically at the point of sale and the card is dipped, tapped, or swiped. CP transactions carry lower interchange than card-not-present because fraud risk is lower.",
  },
  {
    slug: "card-not-present",
    term: "Card-not-present",
    alternateNames: ["CNP", "online transaction"],
    category: "operations",
    definition:
      "Card-not-present (CNP) is any transaction where the card is keyed, entered online, or captured through a phone order. CNP transactions carry interchange 0.50-1.20% higher than card-present because fraud risk is higher.",
  },
  {
    slug: "mcc",
    term: "MCC",
    alternateNames: ["Merchant Category Code"],
    category: "infrastructure",
    definition:
      "An MCC (Merchant Category Code) is a 4-digit number assigned by the acquirer that classifies a merchant's business type. The MCC governs interchange rates, reserve requirements, surcharge eligibility, and whether the merchant qualifies for certain card programs (e.g. Visa Business).",
  },
  {
    slug: "settlement-batch",
    term: "Settlement batch",
    alternateNames: ["batch"],
    category: "settlement",
    definition:
      "A settlement batch is the daily bundle of authorized transactions a merchant submits to the acquirer for funding. Late or missing batches downgrade the transactions to a higher interchange tier and delay payout.",
  },
];

export const GLOSSARY_BY_SLUG = new Map(GLOSSARY.map((t) => [t.slug, t]));

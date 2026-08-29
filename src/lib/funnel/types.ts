// Funnel v4.1 types

export type Track = "A" | "B" | "C" | "MANUAL";

export type TrackVariant = "default" | "subscriptions";

export type VolumeTier =
  | "under_50k"
  | "50k_to_250k"
  | "250k_to_1m"
  | "over_1m"
  | "pre_launch";

export type BusinessType =
  | "physical_goods"
  | "saas_digital"
  | "subscription"
  | "retail_inperson"
  | "restaurant_hospitality"
  | "field_services"
  | "financial_services"
  | "health_wellness"
  | "gaming_entertainment"
  | "other";

export type PainPoint =
  | "funds_frozen"
  | "approval_rates"
  | "long_onboarding"
  | "new_markets"
  | "failed_recurring"
  | "in_person_costs"
  | "needs_approval";

export type FunnelState =
  | "day0"
  | "day1"
  | "day4"
  | "day9"
  | "day13"
  | "day17"
  | "complete"
  | "booked"
  | "unsubscribed";

export interface SortingHatPayload {
  fullName: string;
  email: string;
  /** Required since 2026-08-29. See the schema in actions/sorting-hat.ts. */
  phone: string;
  businessType: BusinessType;
  volumeTier: VolumeTier;
  painPoint: PainPoint;
  honeypot?: string;
}

/**
 * Optional step 5. Sent only after the lead row already exists, so every field
 * here is nice-to-have and abandoning the step costs us nothing.
 */
export interface SortingHatEnrichPayload {
  leadId: string;
  phone?: string;
  companyName?: string;
  currentProvider?: string;
}

/** Datalist suggestions for "who processes for you today". Free text is still
 *  accepted — these just save typing and keep the common answers spelled the
 *  same way in the sheet. */
export const COMMON_PROVIDERS = [
  "Stripe",
  "PayPal",
  "Square",
  "Adyen",
  "Authorize.net",
  "Braintree",
  "Clover",
  "Toast",
  "Shopify Payments",
  "Worldpay",
  "Fiserv / First Data",
  "Global Payments",
  "Elavon",
  "Chase Payment Solutions",
  "Helcim",
  "PaymentCloud",
  "Durango",
  "Not processing yet",
] as const;

export interface RouteResult {
  track: Track;
  trackVariant: TrackVariant;
  thankYouSlug: "a" | "b" | "c";
}

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  physical_goods: "Physical goods / E-commerce",
  saas_digital: "SaaS or digital product",
  subscription: "Membership or subscription",
  retail_inperson: "Retail with in-person payments",
  restaurant_hospitality: "Restaurant or hospitality",
  field_services: "Field services or mobile payments",
  financial_services: "Financial services or money transfers",
  health_wellness: "Health, wellness or lifestyle products",
  gaming_entertainment: "Gaming or entertainment",
  other: "Other / Not sure",
};

export const VOLUME_TIER_LABELS: Record<VolumeTier, string> = {
  under_50k: "Under $50K monthly",
  "50k_to_250k": "$50K to $250K monthly",
  "250k_to_1m": "$250K to $1M monthly",
  over_1m: "Over $1M monthly",
  pre_launch: "Pre-launch / not yet live",
};

export const PAIN_POINT_LABELS: Record<PainPoint, string> = {
  funds_frozen: "My provider is freezing funds or applying reserves I never agreed to",
  approval_rates: "My approval rates are underperforming and I'm losing revenue at checkout",
  long_onboarding: "Last onboarding took months. I can't go through that again",
  new_markets: "I need to expand into new markets and my current setup won't support it",
  failed_recurring: "Too many failed recurring payments and I'm churning revenue I already earned",
  in_person_costs: "In-person transaction costs are too high and don't scale with my locations",
  needs_approval: "I'm launching and need a provider that will actually approve my model",
};

export const PAIN_POINT_SHORT: Record<PainPoint, string> = {
  funds_frozen: "frozen funds and reserves",
  approval_rates: "low approval rates",
  long_onboarding: "slow onboarding",
  new_markets: "expanding into new markets",
  failed_recurring: "failed recurring payments",
  in_person_costs: "in-person transaction costs",
  needs_approval: "getting approved as a new merchant",
};

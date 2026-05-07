// Funnel v4.1 routing logic — verbatim from spec
//
// Field 1 IN [Restaurant, Hospitality, Retail in-person, Field services] -> Track B
// Field 1 IN [Financial, Health, Gaming] OR Field 3 IN [Funds frozen, Approval rates, Onboarding] -> Track C
// "Failed recurring payments" in Field 3 -> Track A, Subscriptions variant
// All other -> Track A
// Conflicting signals -> Track C wins

import type { BusinessType, PainPoint, RouteResult } from "./types";

const TRACK_B_BUSINESS: BusinessType[] = [
  "retail_inperson",
  "restaurant_hospitality",
  "field_services",
];

const TRACK_C_BUSINESS: BusinessType[] = [
  "financial_services",
  "health_wellness",
  "gaming_entertainment",
];

const TRACK_C_PAIN: PainPoint[] = [
  "funds_frozen",
  "approval_rates",
  "long_onboarding",
  "needs_approval",
];

export function routeTrack(
  businessType: BusinessType,
  painPoint: PainPoint
): RouteResult {
  // Track C wins on conflict — check first
  const isComplexBusiness = TRACK_C_BUSINESS.includes(businessType);
  const isComplexPain = TRACK_C_PAIN.includes(painPoint);

  if (isComplexBusiness || isComplexPain) {
    return { track: "C", trackVariant: "default", thankYouSlug: "c" };
  }

  // Track B for in-person verticals
  if (TRACK_B_BUSINESS.includes(businessType)) {
    return { track: "B", trackVariant: "default", thankYouSlug: "b" };
  }

  // Subscriptions variant of Track A
  if (
    businessType === "subscription" ||
    painPoint === "failed_recurring"
  ) {
    return { track: "A", trackVariant: "subscriptions", thankYouSlug: "a" };
  }

  // Default — Track A
  return { track: "A", trackVariant: "default", thankYouSlug: "a" };
}

// Email dispatch — maps (track, funnel_state, pain_point, track_variant) -> email module
import {
  PAIN_POINT_SHORT,
  VOLUME_TIER_LABELS,
  BUSINESS_TYPE_LABELS,
  type Track,
  type TrackVariant,
  type PainPoint,
  type FunnelState,
  type VolumeTier,
  type BusinessType,
} from "./types";

interface DispatchInput {
  track: Track;
  trackVariant: TrackVariant;
  painPoint: PainPoint;
  volumeTier: VolumeTier;
  businessType: BusinessType;
  funnelState: FunnelState;
  name: string;
  shortlistUrl: string;
  calendlyUrl: string;
  affiliateUrl: string;
}

interface DispatchResult {
  emailKey: string | null;
  nextState: FunnelState;
  props: Record<string, unknown>;
}

// Maps the (track, state, pain) tuple to the email module path.
// Returns null importPath if no email should fire (lead already past final).
export function chooseEmail(input: DispatchInput): DispatchResult {
  const sharedProps: Record<string, unknown> = {
    name: input.name,
    businessType: BUSINESS_TYPE_LABELS[input.businessType],
    volumeTier: VOLUME_TIER_LABELS[input.volumeTier],
    painPoint: PAIN_POINT_SHORT[input.painPoint],
    shortlistUrl: input.shortlistUrl,
    calendlyUrl: input.calendlyUrl,
    affiliateUrl: input.affiliateUrl,
  };

  const trackDir =
    input.track === "B" ? "track-b" : input.track === "C" ? "track-c" : "track-a";

  // Day 0
  if (input.funnelState === "day0") {
    return { emailKey: `${trackDir}/Day0_Confirmation`, nextState: "day1", props: sharedProps };
  }

  // Day 1
  if (input.funnelState === "day1") {
    return { emailKey: `${trackDir}/Day1_Shortlist`, nextState: "day4", props: sharedProps };
  }

  // Day 4 — pain-point-specific
  if (input.funnelState === "day4") {
    if (input.track === "A") {
      if (input.trackVariant === "subscriptions" || input.painPoint === "failed_recurring") {
        return { emailKey: "track-a/Day4_Subscriptions", nextState: "day9", props: sharedProps };
      }
      if (input.painPoint === "new_markets") {
        return { emailKey: "track-a/Day4_NewMarkets", nextState: "day9", props: sharedProps };
      }
      return { emailKey: "track-a/Day4_ApprovalRates", nextState: "day9", props: sharedProps };
    }
    if (input.track === "B") {
      if (input.businessType === "restaurant_hospitality" || input.painPoint === "in_person_costs") {
        return { emailKey: "track-b/Day4_RestaurantsHospitality", nextState: "day9", props: sharedProps };
      }
      return { emailKey: "track-b/Day4_RetailInPerson", nextState: "day9", props: sharedProps };
    }
    if (input.track === "C") {
      if (input.painPoint === "funds_frozen") {
        return { emailKey: "track-c/Day4_Reserves", nextState: "day9", props: sharedProps };
      }
      if (input.painPoint === "approval_rates") {
        return { emailKey: "track-c/Day4_ApprovalRates", nextState: "day9", props: sharedProps };
      }
      if (input.painPoint === "long_onboarding" || input.painPoint === "needs_approval") {
        return { emailKey: "track-c/Day4_Onboarding", nextState: "day9", props: sharedProps };
      }
      return { emailKey: "track-c/Day4_Reserves", nextState: "day9", props: sharedProps };
    }
  }

  // Day 9
  if (input.funnelState === "day9") {
    if (input.track === "B") {
      return { emailKey: "track-b/Day9_HiddenCosts", nextState: "day13", props: sharedProps };
    }
    if (input.track === "C") {
      return { emailKey: "track-c/Day9_Underwriting", nextState: "day13", props: sharedProps };
    }
    return { emailKey: "track-a/Day9_DemoQuestions", nextState: "day13", props: sharedProps };
  }

  // Day 13
  if (input.funnelState === "day13") {
    return { emailKey: `${trackDir}/Day13_Followup`, nextState: "day17", props: sharedProps };
  }

  // Day 17
  if (input.funnelState === "day17") {
    const fileName =
      input.track === "B"
        ? "Day17_ContractExit"
        : input.track === "C"
          ? "Day17_StayingCost"
          : "Day17_Decision";
    return { emailKey: `${trackDir}/${fileName}`, nextState: "complete", props: sharedProps };
  }

  return { emailKey: null, nextState: input.funnelState, props: sharedProps };
}

// Days since lead created -> what state should we be in
export function expectedStateForAge(daysSinceCreated: number): FunnelState | null {
  if (daysSinceCreated < 1) return "day0";
  if (daysSinceCreated < 4) return "day1";
  if (daysSinceCreated < 9) return "day4";
  if (daysSinceCreated < 13) return "day9";
  if (daysSinceCreated < 17) return "day13";
  if (daysSinceCreated < 30) return "day17";
  return "complete";
}

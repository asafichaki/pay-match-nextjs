// Static registry of all funnel email modules. Bundlers can statically
// analyze these imports, unlike runtime dynamic-string imports which were
// failing at the Vercel function boundary.

import * as TrackADay0 from "@/emails/track-a/Day0_Confirmation";
import * as TrackADay1 from "@/emails/track-a/Day1_Shortlist";
import * as TrackADay4Approval from "@/emails/track-a/Day4_ApprovalRates";
import * as TrackADay4Subs from "@/emails/track-a/Day4_Subscriptions";
import * as TrackADay4Markets from "@/emails/track-a/Day4_NewMarkets";
import * as TrackADay9 from "@/emails/track-a/Day9_DemoQuestions";
import * as TrackADay13 from "@/emails/track-a/Day13_Followup";
import * as TrackADay17 from "@/emails/track-a/Day17_Decision";

import * as TrackBDay0 from "@/emails/track-b/Day0_Confirmation";
import * as TrackBDay1 from "@/emails/track-b/Day1_Shortlist";
import * as TrackBDay4Hosp from "@/emails/track-b/Day4_RestaurantsHospitality";
import * as TrackBDay4Retail from "@/emails/track-b/Day4_RetailInPerson";
import * as TrackBDay9 from "@/emails/track-b/Day9_HiddenCosts";
import * as TrackBDay13 from "@/emails/track-b/Day13_Followup";
import * as TrackBDay17 from "@/emails/track-b/Day17_ContractExit";

import * as TrackCDay0 from "@/emails/track-c/Day0_Confirmation";
import * as TrackCDay1 from "@/emails/track-c/Day1_Shortlist";
import * as TrackCDay4Reserves from "@/emails/track-c/Day4_Reserves";
import * as TrackCDay4Approval from "@/emails/track-c/Day4_ApprovalRates";
import * as TrackCDay4Onboard from "@/emails/track-c/Day4_Onboarding";
import * as TrackCDay9 from "@/emails/track-c/Day9_Underwriting";
import * as TrackCDay13 from "@/emails/track-c/Day13_Followup";
import * as TrackCDay17 from "@/emails/track-c/Day17_StayingCost";

export interface EmailModule {
  default: (props: Record<string, unknown>) => React.ReactElement;
  subject: (props: Record<string, unknown>) => string;
}

export type EmailKey =
  | "track-a/Day0_Confirmation"
  | "track-a/Day1_Shortlist"
  | "track-a/Day4_ApprovalRates"
  | "track-a/Day4_Subscriptions"
  | "track-a/Day4_NewMarkets"
  | "track-a/Day9_DemoQuestions"
  | "track-a/Day13_Followup"
  | "track-a/Day17_Decision"
  | "track-b/Day0_Confirmation"
  | "track-b/Day1_Shortlist"
  | "track-b/Day4_RestaurantsHospitality"
  | "track-b/Day4_RetailInPerson"
  | "track-b/Day9_HiddenCosts"
  | "track-b/Day13_Followup"
  | "track-b/Day17_ContractExit"
  | "track-c/Day0_Confirmation"
  | "track-c/Day1_Shortlist"
  | "track-c/Day4_Reserves"
  | "track-c/Day4_ApprovalRates"
  | "track-c/Day4_Onboarding"
  | "track-c/Day9_Underwriting"
  | "track-c/Day13_Followup"
  | "track-c/Day17_StayingCost";

export const EMAIL_REGISTRY: Record<EmailKey, EmailModule> = {
  "track-a/Day0_Confirmation": TrackADay0 as unknown as EmailModule,
  "track-a/Day1_Shortlist": TrackADay1 as unknown as EmailModule,
  "track-a/Day4_ApprovalRates": TrackADay4Approval as unknown as EmailModule,
  "track-a/Day4_Subscriptions": TrackADay4Subs as unknown as EmailModule,
  "track-a/Day4_NewMarkets": TrackADay4Markets as unknown as EmailModule,
  "track-a/Day9_DemoQuestions": TrackADay9 as unknown as EmailModule,
  "track-a/Day13_Followup": TrackADay13 as unknown as EmailModule,
  "track-a/Day17_Decision": TrackADay17 as unknown as EmailModule,

  "track-b/Day0_Confirmation": TrackBDay0 as unknown as EmailModule,
  "track-b/Day1_Shortlist": TrackBDay1 as unknown as EmailModule,
  "track-b/Day4_RestaurantsHospitality": TrackBDay4Hosp as unknown as EmailModule,
  "track-b/Day4_RetailInPerson": TrackBDay4Retail as unknown as EmailModule,
  "track-b/Day9_HiddenCosts": TrackBDay9 as unknown as EmailModule,
  "track-b/Day13_Followup": TrackBDay13 as unknown as EmailModule,
  "track-b/Day17_ContractExit": TrackBDay17 as unknown as EmailModule,

  "track-c/Day0_Confirmation": TrackCDay0 as unknown as EmailModule,
  "track-c/Day1_Shortlist": TrackCDay1 as unknown as EmailModule,
  "track-c/Day4_Reserves": TrackCDay4Reserves as unknown as EmailModule,
  "track-c/Day4_ApprovalRates": TrackCDay4Approval as unknown as EmailModule,
  "track-c/Day4_Onboarding": TrackCDay4Onboard as unknown as EmailModule,
  "track-c/Day9_Underwriting": TrackCDay9 as unknown as EmailModule,
  "track-c/Day13_Followup": TrackCDay13 as unknown as EmailModule,
  "track-c/Day17_StayingCost": TrackCDay17 as unknown as EmailModule,
};

export function getEmail(key: string): EmailModule | null {
  return EMAIL_REGISTRY[key as EmailKey] || null;
}

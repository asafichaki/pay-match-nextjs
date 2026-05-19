/**
 * Static descriptors for triggers and actions exposed in the admin UI.
 * Keep in sync with `triggers.ts` and `actions/*`.
 */

export interface FieldDescriptor {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  help?: string;
}

export interface TriggerDescriptor {
  type: string;
  label: string;
  description: string;
  fields: FieldDescriptor[];
}

export interface ActionDescriptor {
  type: string;
  label: string;
  description: string;
  fields: FieldDescriptor[];
}

export const TRIGGERS: TriggerDescriptor[] = [
  {
    type: "lead_inserted",
    label: "New lead created",
    description:
      "Fires whenever a new lead is inserted (quiz_leads). Filter by source/volume in config.",
    fields: [
      {
        key: "source",
        label: "Lead source (optional)",
        type: "select",
        options: [
          { value: "", label: "Any source" },
          { value: "quiz", label: "Quiz" },
          { value: "sorting-hat", label: "Sorting Hat" },
          { value: "newsletter", label: "Newsletter" },
          { value: "manual", label: "Manual" },
        ],
      },
    ],
  },
  {
    type: "funnel_state_changed",
    label: "Funnel state changed",
    description: "Fires when a lead transitions from one funnel state to another.",
    fields: [
      {
        key: "to_state",
        label: "Target state",
        type: "text",
        placeholder: "qualified",
        help: "Only fire when the new state matches this (leave blank for any).",
      },
    ],
  },
  {
    type: "volume_tier_above",
    label: "Volume tier above threshold",
    description: "Fires on lead insert when monthly_volume tier is above a threshold.",
    fields: [
      {
        key: "min_tier",
        label: "Minimum tier",
        type: "select",
        required: true,
        options: [
          { value: "10k", label: "10k+" },
          { value: "25k", label: "25k+" },
          { value: "50k", label: "50k+" },
          { value: "100k", label: "100k+" },
          { value: "250k", label: "250k+" },
        ],
      },
    ],
  },
];

export const ACTIONS: ActionDescriptor[] = [
  {
    type: "send_email",
    label: "Send email",
    description: "Send an email via Resend to a fixed address or the lead's own email.",
    fields: [
      {
        key: "to",
        label: "Recipient",
        type: "text",
        required: true,
        placeholder: "barak@mypayadvisor.com or {{lead.email}}",
        help: "Use {{lead.email}} to email the lead. Otherwise a literal address.",
      },
      { key: "subject", label: "Subject", type: "text", required: true },
      {
        key: "body",
        label: "Body (plain text, supports {{lead.full_name}}, {{lead.email}}, {{lead.monthly_volume}})",
        type: "textarea",
        required: true,
      },
    ],
  },
  {
    type: "set_lead_field",
    label: "Set lead field",
    description: "Update a column on the triggering lead row (quiz_leads).",
    fields: [
      {
        key: "field",
        label: "Field",
        type: "select",
        required: true,
        options: [
          { value: "priority", label: "priority" },
          { value: "status", label: "status" },
          { value: "assigned_to", label: "assigned_to" },
          { value: "funnel_state", label: "funnel_state" },
          { value: "deal_value", label: "deal_value" },
        ],
      },
      {
        key: "value",
        label: "New value",
        type: "text",
        required: true,
        placeholder: "high",
      },
    ],
  },
  {
    type: "webhook",
    label: "POST webhook",
    description: "Fire an HTTP POST to an external URL with the trigger payload.",
    fields: [
      { key: "url", label: "URL", type: "text", required: true, placeholder: "https://..." },
      {
        key: "headers_json",
        label: "Extra headers (JSON, optional)",
        type: "textarea",
        placeholder: '{"X-Token":"abc"}',
      },
    ],
  },
];

export const TRIGGER_TYPES = new Set(TRIGGERS.map((t) => t.type));
export const ACTION_TYPES = new Set(ACTIONS.map((a) => a.type));

const TIER_RANK: Record<string, number> = {
  "0_5k": 1,
  "5k_25k": 2,
  "25k_50k": 3,
  "50k_100k": 4,
  "100k_plus": 5,
  // common synonyms used by sorting-hat / quiz
  "5k": 2,
  "10k": 2,
  "25k": 3,
  "50k": 4,
  "100k": 5,
  "250k": 6,
};

export function tierRank(tier: string | null | undefined): number {
  if (!tier) return 0;
  const k = String(tier).toLowerCase();
  return TIER_RANK[k] ?? 0;
}

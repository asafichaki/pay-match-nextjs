import type { RateChannel } from "./ranking-2026";

/**
 * Where the "what will it cost at your volume" widget renders, by comparisons
 * slug. Started 2026-11-01 as a one-page experiment on the page Google's AI
 * Overview cites most and that already earns steady clicks: the widget gives
 * a reader something a summary cannot (their own number). To add a page, add
 * its slug here; render-blog-article.tsx needs no change.
 */
export interface CostWidgetPlacement {
  defaultVolume: number;
  defaultChannel: RateChannel;
}

export const COST_WIDGET_PLACEMENTS: Record<string, CostWidgetPlacement> = {
  "best-payment-processors-with-same-day-deposit-2026": { defaultVolume: 25_000, defaultChannel: "In-person" },
};

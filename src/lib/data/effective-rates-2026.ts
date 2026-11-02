/**
 * The open dataset behind /data/effective-rates-2026 and its .csv and .json
 * downloads.
 *
 * Nothing in here is a number typed by hand. Until November 2026 this file
 * held a May 2026 table that disagreed with the site's own ranking (it had
 * Stripe online at 2.97% and Braintree below its own published price). Every
 * row is now derived from src/lib/data/ranking-2026.ts, the one engine the
 * best-of ranking uses, so the page, the CSV, the JSON and the ranking cannot
 * drift apart.
 */
import {
  ASSUMPTIONS,
  NOT_RANKED,
  PRICES_CHECKED_ISO,
  PROVIDER_META,
  RATES_CHECKED,
  TIER_LABELS,
  TIER_VOLUMES,
  mainTable,
  quoteAtVolume,
  type RateChannel,
} from "./ranking-2026";

const SITE = "https://www.mypayadvisor.com";

export const DATASET = {
  name: "US Payment Processor Effective Rates by Monthly Volume (2026)",
  shortName: "myPayAdvisor Effective Rate Dataset",
  url: `${SITE}/data/effective-rates-2026`,
  csvUrl: `${SITE}/data/effective-rates-2026.csv`,
  jsonUrl: `${SITE}/data/effective-rates-2026.json`,
  license: "https://creativecommons.org/licenses/by/4.0/",
  licenseName: "CC BY 4.0",
  publisher: "myPayAdvisor",
  dateModified: PRICES_CHECKED_ISO,
  datePublished: "2026-05-15",
  checkedLabel: RATES_CHECKED,
} as const;

export const CHANNELS: RateChannel[] = ["In-person", "Online"];
export { TIER_LABELS, TIER_VOLUMES, ASSUMPTIONS, NOT_RANKED };

export interface DatasetCell {
  /** Effective rate in percent, rounded to 2 decimals. */
  rate: number;
  /** Rate x volume, rounded to whole dollars. */
  monthlyFee: number;
  /** The provider's plan that is cheapest at this volume. */
  plan: string;
}

export interface DatasetRow {
  processor: string;
  name: string;
  channel: RateChannel;
  pricingModel: string;
  pricingUrl: string;
  caveat?: string;
  /** One cell per volume in TIER_VOLUMES order. */
  cells: DatasetCell[];
}

/** Provider order of the best-of table, so the two pages read the same way. */
function rankedMeta() {
  const order = mainTable().map((r) => r.processor);
  return [...PROVIDER_META].sort((a, b) => order.indexOf(a.processor) - order.indexOf(b.processor));
}

/** Every provider x channel it publishes a price for, at all four volumes. */
export function datasetRows(): DatasetRow[] {
  const rows: DatasetRow[] = [];
  for (const m of rankedMeta()) {
    for (const channel of CHANNELS) {
      const cells = TIER_VOLUMES.map((v) => quoteAtVolume(m, channel, v));
      if (cells.some((c) => c === null)) continue;
      rows.push({
        processor: m.processor,
        name: m.name,
        channel,
        pricingModel: m.pricingModel,
        pricingUrl: m.pricingUrl,
        caveat: m.caveat,
        cells: cells as DatasetCell[],
      });
    }
  }
  return rows;
}

export interface ChannelSpread {
  channel: RateChannel;
  tier: number;
  volume: number;
  /** Providers tied at the lowest rate. */
  cheapest: string[];
  cheapestRate: number;
  cheapestFee: number;
  /** Providers tied at the highest rate. */
  priciest: string[];
  priciestRate: number;
  priciestFee: number;
  /** priciestFee - cheapestFee, dollars per month. */
  gapMonthly: number;
  providers: number;
}

/** Cheapest and most expensive provider for one channel at one volume. */
export function spreadAt(channel: RateChannel, tier: number, rows = datasetRows()): ChannelSpread {
  const inChannel = rows.filter((r) => r.channel === channel);
  const rates = inChannel.map((r) => r.cells[tier].rate);
  const lo = Math.min(...rates);
  const hi = Math.max(...rates);
  const lowRow = inChannel.find((r) => r.cells[tier].rate === lo)!;
  const highRow = inChannel.find((r) => r.cells[tier].rate === hi)!;
  return {
    channel,
    tier,
    volume: TIER_VOLUMES[tier],
    cheapest: inChannel.filter((r) => r.cells[tier].rate === lo).map((r) => r.name),
    cheapestRate: lo,
    cheapestFee: lowRow.cells[tier].monthlyFee,
    priciest: inChannel.filter((r) => r.cells[tier].rate === hi).map((r) => r.name),
    priciestRate: hi,
    priciestFee: highRow.cells[tier].monthlyFee,
    gapMonthly: highRow.cells[tier].monthlyFee - lowRow.cells[tier].monthlyFee,
    providers: inChannel.length,
  };
}

/** All eight (channel x volume) spreads, in-person first. */
export function allSpreads(): ChannelSpread[] {
  const rows = datasetRows();
  return CHANNELS.flatMap((ch) => TIER_VOLUMES.map((_, t) => spreadAt(ch, t, rows)));
}

export const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
export const pct = (n: number) => `${n.toFixed(2)}%`;
export const joinNames = (names: string[]) =>
  names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;

/** Suggested citation, used on the page and in the JSON download. */
export const CITATION = `myPayAdvisor. "${DATASET.name}." Prices checked ${RATES_CHECKED}. ${DATASET.url}`;

export const METHOD_FORMULA = "effective rate = percentage + fixed fee / average sale + monthly fee / monthly volume";

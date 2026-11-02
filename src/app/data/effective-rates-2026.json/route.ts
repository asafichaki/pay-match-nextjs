import {
  ASSUMPTIONS,
  CITATION,
  DATASET,
  METHOD_FORMULA,
  NOT_RANKED,
  TIER_VOLUMES,
  allSpreads,
  datasetRows,
} from "@/lib/data/effective-rates-2026";

export const revalidate = 86400;

/** Same rows as the page, derived from src/lib/data/ranking-2026.ts. */
export async function GET() {
  const payload = {
    name: DATASET.name,
    url: DATASET.url,
    license: DATASET.license,
    publisher: DATASET.publisher,
    citation: CITATION,
    pricesChecked: DATASET.dateModified,
    methodology: {
      url: `${DATASET.url}#methodology`,
      formula: METHOD_FORMULA,
      averageSaleUsd: ASSUMPTIONS.averageSale,
      cardMix: ASSUMPTIONS.cardMix,
      interchangeEstimatePct: {
        inPerson: ASSUMPTIONS.interchangeInPerson,
        online: ASSUMPTIONS.interchangeOnline,
        appliesTo: "interchange-plus and subscription providers only",
      },
      planRule: "for providers with several plans, the cheapest plan at each volume is used",
    },
    monthlyVolumesUsd: TIER_VOLUMES,
    rows: datasetRows().map((r) => ({
      processor: r.name,
      channel: r.channel,
      pricingModel: r.pricingModel,
      pricingUrl: r.pricingUrl,
      caveat: r.caveat ?? null,
      byVolume: r.cells.map((c, i) => ({
        monthlyVolumeUsd: TIER_VOLUMES[i],
        effectiveRatePct: c.rate,
        monthlyCostUsd: c.monthlyFee,
        planUsed: c.plan,
      })),
    })),
    spreads: allSpreads().map((s) => ({
      channel: s.channel,
      monthlyVolumeUsd: s.volume,
      cheapest: s.cheapest,
      cheapestRatePct: s.cheapestRate,
      mostExpensive: s.priciest,
      mostExpensiveRatePct: s.priciestRate,
      monthlyGapUsd: s.gapMonthly,
    })),
    notRanked: NOT_RANKED,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

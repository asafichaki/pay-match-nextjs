import { DATASET, TIER_VOLUMES, datasetRows } from "@/lib/data/effective-rates-2026";

export const revalidate = 86400;

function csvEscape(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const tierKey = (v: number) => (v >= 1_000_000 ? `${v / 1_000_000}m` : `${v / 1_000}k`);

/** Same rows as the page, derived from src/lib/data/ranking-2026.ts. */
export async function GET() {
  const headers = [
    "processor",
    "channel",
    "pricing_model",
    ...TIER_VOLUMES.flatMap((v) => [
      `effective_rate_pct_${tierKey(v)}`,
      `monthly_cost_usd_${tierKey(v)}`,
      `plan_used_${tierKey(v)}`,
    ]),
    "pricing_url",
    "prices_checked",
  ];

  const lines = [headers.join(",")];
  for (const row of datasetRows()) {
    lines.push(
      [
        row.name,
        row.channel,
        row.pricingModel,
        ...row.cells.flatMap((c) => [c.rate.toFixed(2), c.monthlyFee, c.plan]),
        row.pricingUrl,
        DATASET.dateModified,
      ]
        .map(csvEscape)
        .join(","),
    );
  }

  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mypayadvisor-effective-rates-2026.csv"`,
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

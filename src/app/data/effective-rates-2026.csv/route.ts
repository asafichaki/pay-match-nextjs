import { EFFECTIVE_RATES_2026, VOLUME_TIERS } from "@/lib/data/effective-rates-2026";

export const revalidate = 86400;

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const headers = [
    "processor",
    "channel",
    "pricing_model",
    ...VOLUME_TIERS.map((t) => `rate_${t.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`),
    "notes",
  ];

  const lines = [headers.join(",")];
  for (const row of EFFECTIVE_RATES_2026) {
    lines.push(
      [
        csvEscape(row.processor),
        csvEscape(row.channel),
        csvEscape(row.pricingModel),
        ...row.rates.map(csvEscape),
        csvEscape(row.notes),
      ].join(",")
    );
  }

  const body = lines.join("\n") + "\n";

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mypayadvisor-effective-rates-2026.csv"`,
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

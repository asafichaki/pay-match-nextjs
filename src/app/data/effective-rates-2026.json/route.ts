import { EFFECTIVE_RATES_2026, VOLUME_TIERS } from "@/lib/data/effective-rates-2026";

export const revalidate = 86400;

export async function GET() {
  const payload = {
    name: "2026 Payment Processor Effective Rate Database (US)",
    url: "https://www.mypayadvisor.com/data/effective-rates-2026",
    license: "https://creativecommons.org/licenses/by/4.0/",
    publisher: "myPayAdvisor",
    temporalCoverage: "2026",
    methodology: "https://www.mypayadvisor.com/data/effective-rates-2026#methodology",
    cardMixAssumption: { credit: 0.6, debit: 0.4, rewards: 0.3 },
    volumeTiers: VOLUME_TIERS,
    rows: EFFECTIVE_RATES_2026.map((row) => ({
      processor: row.processor,
      channel: row.channel,
      pricingModel: row.pricingModel,
      effectiveRates: Object.fromEntries(
        row.rates.map((rate, i) => [VOLUME_TIERS[i], rate])
      ),
      notes: row.notes,
    })),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

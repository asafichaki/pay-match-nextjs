import Link from "next/link";
import { ASSUMPTIONS, RATES_CHECKED, TIER_LABELS, VS_TIERS, dollarsAt, pct, usd, type TierIndex } from "@/lib/data/vs-pages-2026";

export interface CostOption {
  /** Column heading, e.g. "Square" or "PayPal Checkout button" */
  label: string;
  /** Small line under the heading, e.g. "2.6% + 15¢, Free plan" */
  note?: string;
  /** Effective rate (%) at a tier, or null when the product does not serve this channel. */
  rate: (t: TierIndex) => number | null;
}

export interface CostTableGroup {
  /** Caption above the table, e.g. "In person (card present)" */
  title: string;
  options: CostOption[];
}

/**
 * The answer-first cost table on the vs-pages: effective rate and monthly
 * cost at $10K, $50K and $250K for each channel, with the assumptions printed
 * underneath. Every rate is passed in from lib/data/vs-pages-2026, which reads
 * the ranking engine, so this table and the best-of page share one source.
 *
 * Built as stacked small tables (one per channel, max four columns) so it fits
 * a 430px phone without horizontal scroll.
 */
export function VsCostTable({ groups, footnote }: { groups: CostTableGroup[]; footnote?: React.ReactNode }) {
  return (
    <div className="my-6 rounded-2xl border border-border bg-background p-4 sm:p-5 shadow-sm" data-cost-table>
      <p className="text-sm font-semibold text-foreground">What you would pay a month, fees included</p>
      {groups.map((g) => (
        <div key={g.title} className="mt-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{g.title}</p>
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="w-[22%] py-2 pr-2 text-left font-medium text-muted-foreground">Volume</th>
                {g.options.map((o) => (
                  <th key={o.label} scope="col" className="py-2 px-1 text-left font-semibold text-foreground align-bottom">
                    {o.label}
                    {o.note ? <span className="block text-[11px] font-normal leading-tight text-muted-foreground">{o.note}</span> : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {VS_TIERS.map((t) => {
                const rates = g.options.map((o) => o.rate(t));
                const valid = rates.filter((r): r is number => r !== null);
                const best = valid.length > 1 ? Math.min(...valid) : null;
                return (
                  <tr key={t}>
                    <th scope="row" className="py-2 pr-2 text-left font-medium text-foreground tabular-nums">{TIER_LABELS[t]}/mo</th>
                    {rates.map((r, i) => (
                      <td key={g.options[i].label} className={`py-2 px-1 tabular-nums ${r !== null && r === best ? "font-bold text-primary" : "text-foreground"}`}>
                        {r === null ? (
                          <span className="text-muted-foreground">n/a</span>
                        ) : (
                          <>
                            {usd(dollarsAt(r, t))}
                            <span className="block text-xs font-normal text-muted-foreground">{pct(r)}</span>
                          </>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Cheapest in each row in bold. Prices read from each provider&apos;s own pricing page on {RATES_CHECKED}. Effective rate = percentage + fixed fee ÷ ${ASSUMPTIONS.averageSale} average sale + any monthly plan fee ÷ volume, on a {ASSUMPTIONS.cardMix} card mix. Interchange-plus rates add our published estimate of the card networks&apos; cost ({ASSUMPTIONS.interchangeInPerson.toFixed(2)}% in person, {ASSUMPTIONS.interchangeOnline.toFixed(2)}% online). Same method as our <Link href="/comparisons/best-payment-processors-2026#method" className="underline underline-offset-2 hover:text-primary">payment processor ranking</Link>; every provider at every volume is in the <Link href="/data/effective-rates-2026" className="underline underline-offset-2 hover:text-primary">2026 effective rates data</Link>.
        {footnote ? <> {footnote}</> : null}
      </p>
    </div>
  );
}

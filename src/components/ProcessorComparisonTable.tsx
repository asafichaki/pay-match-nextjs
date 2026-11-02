import Link from "next/link";
import {
  ASSUMPTIONS,
  NOT_RANKED,
  PROVIDER_META,
  RATES_CHECKED,
  channelRates,
  formatRate,
  type ProviderMeta,
  type TierIndex,
} from "@/lib/data/ranking-2026";
import { FEES, feeLabel } from "@/lib/data/vs-pages-2026";

/**
 * The /comparisons hub table: every provider's published price and what it
 * comes to at $10K and $250K a month.
 *
 * Until November 2026 this was a hand-typed list of May prices (Square at
 * 2.6% + 10c, Stax at 18c online, PayPal Advanced at 2.59% + 49c). Every figure
 * now comes from lib/data/ranking-2026.ts, the same source as the ranking, the
 * vs-pages and /data/effective-rates-2026, so the hub cannot drift from them.
 *
 * Cards below md (no sideways scroll on phones), a table from md up.
 */

type Channel = "In-person" | "Online";
const SHOWN: TierIndex[] = [0, 2];
const SHOWN_LABEL: Record<number, string> = { 0: "$10K", 2: "$250K" };

const cents = (n: number) => `${Math.round(n * 100)}¢`;

interface PlanLike {
  label: string;
  pct: number;
  fixed: number;
  monthly: number;
  icPlus?: boolean;
}

function plansAt(m: ProviderMeta, ch: Channel, volume: number): PlanLike[] {
  const p = m.plans[ch];
  if (!p) return [];
  return typeof p === "function" ? p(volume) : p;
}

function priceLabel(plan: PlanLike): string {
  if (plan.icPlus) return plan.pct > 0 ? `Interchange + ${+plan.pct.toFixed(2)}% + ${cents(plan.fixed)}` : `Interchange + ${cents(plan.fixed)}`;
  return `${+plan.pct.toFixed(2)}% + ${cents(plan.fixed)}`;
}

/** Plan names that add nothing next to the price. */
const GENERIC_PLAN = new Set(["Volume tier", "Subscription", "Standard", "Cards and wallets"]);

/**
 * Prices the ranking does not model but a reader comparing Square must see:
 * Square Free charges more online than the Online API rate the ranking uses.
 * Source: provider-facts.json via vs-pages-2026 FEES (checked 2026-10-29).
 */
const EXTRA: Partial<Record<string, Partial<Record<Channel, string>>>> = {
  Square: { Online: `${feeLabel(FEES.square.onlineFree)} on the Free plan` },
};

/** The entry price on a channel: the plan a new merchant at $10K a month starts on. */
function entryPrice(m: ProviderMeta, ch: Channel): string | null {
  const plans = plansAt(m, ch, 10_000);
  if (!plans.length) return null;
  const first = plans[0];
  const named = GENERIC_PLAN.has(first.label) ? "" : ` (${first.label})`;
  const extra = EXTRA[m.processor]?.[ch];
  return `${priceLabel(first)}${named}${extra ? `; ${extra}` : ""}`;
}

/** Monthly fee range across every plan and volume the ranking prices. */
function monthlyFee(m: ProviderMeta): string {
  const fees = new Set<number>();
  for (const ch of ["In-person", "Online"] as Channel[]) {
    for (const v of [10_000, 50_000, 250_000, 1_000_000]) for (const p of plansAt(m, ch, v)) fees.add(p.monthly);
  }
  const list = [...fees].sort((a, b) => a - b);
  const fmt = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;
  if (list.length === 1) return list[0] === 0 ? "$0" : `${fmt(list[0])}/mo`;
  if (m.processor === "Stax (Fattmerchant)") return `${fmt(list[0])} to ${fmt(list[list.length - 1])}+/mo by annual volume`;
  return list[0] === 0 ? `$0, or ${list.slice(1).map(fmt).join(" or ")}/mo on paid plans` : `${fmt(list[0])} to ${fmt(list[list.length - 1])}/mo`;
}

function bestRate(m: ProviderMeta, t: TierIndex): { rate: number; channel: string } | null {
  const r = channelRates(m, t);
  if (r.inPerson === null && r.online === null) return null;
  if (r.online === null || (r.inPerson !== null && r.inPerson <= r.online)) return { rate: r.inPerson as number, channel: "in person" };
  return { rate: r.online, channel: "online" };
}

export interface HubRow {
  meta: ProviderMeta;
  inPerson: string | null;
  online: string | null;
  monthly: string;
  rates: ({ rate: number; channel: string } | null)[];
}

export function hubRows(): HubRow[] {
  return PROVIDER_META.map((meta) => ({
    meta,
    inPerson: entryPrice(meta, "In-person"),
    online: entryPrice(meta, "Online"),
    monthly: meta.processor === "Shopify Payments" ? "Shopify plan required" : monthlyFee(meta),
    rates: SHOWN.map((t) => bestRate(meta, t)),
  })).sort((a, b) => (a.rates[0]?.rate ?? 99) - (b.rates[0]?.rate ?? 99) || a.meta.name.localeCompare(b.meta.name));
}

function Name({ m }: { m: ProviderMeta }) {
  return m.reviewHref ? (
    <Link href={m.reviewHref} className="text-primary hover:underline">{m.name}</Link>
  ) : (
    <span>{m.name}</span>
  );
}

function RateCell({ r, best }: { r: { rate: number; channel: string } | null; best: boolean }) {
  if (!r) return <span className="text-muted-foreground">n/a</span>;
  return (
    <>
      <span className={best ? "font-bold text-primary" : "text-foreground"}>{formatRate(r.rate)}</span>
      <span className="block text-[11px] text-muted-foreground">{r.channel}</span>
    </>
  );
}

export default function ProcessorComparisonTable() {
  const rows = hubRows();
  const cheapest = SHOWN.map((_, i) => Math.min(...rows.map((r) => r.rates[i]?.rate ?? Infinity)));

  return (
    <section aria-labelledby="rates-table-heading" className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-8 sm:py-10">
      <header className="mb-4 sm:mb-6">
        <h2 id="rates-table-heading" className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          {rows.length} payment processors at a glance: published prices and real cost
        </h2>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-3xl">
          Each price below was read from the provider&apos;s own pricing page on {RATES_CHECKED}. The last two columns turn it into an effective rate on a ${ASSUMPTIONS.averageSale} average sale, all fees included, on the cheaper of in person or online. Interchange is the card networks&apos; cost, which interchange-plus providers pass through. To run your own numbers, use the{" "}
          <Link href="/calculator" className="text-primary hover:underline font-medium">fee calculator</Link>.
        </p>
      </header>

      {/* Phones: one card per provider */}
      <ol className="md:hidden grid gap-3 list-none p-0 m-0" data-hub-cards>
        {rows.map((r) => (
          <li key={r.meta.processor} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="font-semibold text-foreground"><Name m={r.meta} /></p>
            <p className="text-xs text-muted-foreground">{r.meta.pricingModel}</p>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              <dt className="text-muted-foreground">In person</dt>
              <dd className="text-foreground">{r.inPerson ?? "Not offered"}</dd>
              <dt className="text-muted-foreground">Online</dt>
              <dd className="text-foreground">{r.online ?? "Not offered"}</dd>
              <dt className="text-muted-foreground">Monthly</dt>
              <dd className="text-foreground">{r.monthly}</dd>
            </dl>
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-2 text-center tabular-nums">
              {SHOWN.map((t, i) => (
                <div key={t}>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">At {SHOWN_LABEL[t]}/mo</p>
                  <p className="mt-0.5 text-sm"><RateCell r={r.rates[i]} best={r.rates[i]?.rate === cheapest[i]} /></p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{r.meta.bestFor}</p>
            {r.meta.caveat ? <p className="mt-1 text-xs text-muted-foreground">{r.meta.caveat}</p> : null}
          </li>
        ))}
      </ol>

      {/* md and up: the table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <caption className="sr-only">Published prices and effective rate at $10K and $250K a month</caption>
          <thead className="bg-muted/50 text-foreground">
            <tr>
              <th scope="col" className="text-left font-semibold px-4 py-3">Processor</th>
              <th scope="col" className="text-left font-semibold px-3 py-3">In person</th>
              <th scope="col" className="text-left font-semibold px-3 py-3">Online</th>
              <th scope="col" className="text-left font-semibold px-3 py-3">Monthly fee</th>
              {SHOWN.map((t) => (
                <th key={t} scope="col" className="text-right font-semibold px-3 py-3 whitespace-nowrap">At {SHOWN_LABEL[t]}/mo</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.meta.processor} className="align-top hover:bg-muted/30 transition-colors">
                <th scope="row" className="text-left font-semibold text-foreground px-4 py-3">
                  <Name m={r.meta} />
                  <span className="block max-w-[16rem] text-xs font-normal text-muted-foreground">{r.meta.bestFor}</span>
                  {r.meta.caveat ? <span className="mt-1 block max-w-[16rem] text-[11px] font-normal text-muted-foreground/80">{r.meta.caveat}</span> : null}
                </th>
                <td className="px-3 py-3 text-muted-foreground">{r.inPerson ?? "Not offered"}</td>
                <td className="px-3 py-3 text-muted-foreground">{r.online ?? "Not offered"}</td>
                <td className="px-3 py-3 text-muted-foreground">{r.monthly}</td>
                {SHOWN.map((t, i) => (
                  <td key={t} className="px-3 py-3 text-right tabular-nums whitespace-nowrap">
                    <RateCell r={r.rates[i]} best={r.rates[i]?.rate === cheapest[i]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Effective rate = percentage + fixed fee ÷ ${ASSUMPTIONS.averageSale} + monthly fee ÷ volume, on a {ASSUMPTIONS.cardMix} card mix, cheapest plan at each volume. Interchange-plus prices add our published interchange estimate ({ASSUMPTIONS.interchangeInPerson.toFixed(2)}% in person, {ASSUMPTIONS.interchangeOnline.toFixed(2)}% online). Lowest in each column in bold. All four volumes for every provider are in the{" "}
        <Link href="/data/effective-rates-2026" className="underline underline-offset-2 hover:text-primary">2026 effective rates data</Link>, and the order with our reasoning is in the{" "}
        <Link href="/comparisons/best-payment-processors-2026" className="underline underline-offset-2 hover:text-primary">payment processor ranking</Link>. Not listed: {NOT_RANKED.map((n) => `${n.name}, because ${n.reason}`).join("; ")}.
      </p>
    </section>
  );
}

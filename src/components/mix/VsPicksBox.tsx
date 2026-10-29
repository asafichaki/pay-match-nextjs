import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PROVIDER_META, formatRate, monthlyCost, rankAt, RATES_CHECKED, TIER_LABELS, type TierIndex } from "@/lib/data/ranking-2026";
import { ProviderButton } from "./ProviderButton";
import { MixDisclosure } from "./MixDisclosure";

/**
 * Both brands a vs-page compares, side by side, above the fold, with a button
 * for each. Until this existed, square-vs-stripe had no Square or Stripe
 * button anywhere: the only commercial links on the page were the sidebar's,
 * which sent readers to Stax, Worldpay, Paysafe and Clover.
 */
export function VsPicksBox({ a, b, from }: { a: string; b: string; from: string }) {
  const tiers: TierIndex[] = [0, 1];
  const rows = [a, b].map((processor) => {
    const meta = PROVIDER_META.find((m) => m.processor === processor);
    if (!meta) throw new Error(`VsPicksBox: unknown processor ${processor}`);
    const at = tiers.map((t) => rankAt(t).find((p) => p.processor === processor));
    return { meta, at };
  });
  const cheaperAt = tiers.map((t) => {
    const [x, y] = rows.map((r) => r.at[t]?.score ?? Infinity);
    return x === y ? null : x < y ? rows[0].meta.name : rows[1].meta.name;
  });

  return (
    <section className="my-4 sm:my-6 rounded-2xl border border-primary/25 bg-accent/60 p-3 sm:p-6" data-top-picks aria-label={`${rows[0].meta.name} vs ${rows[1].meta.name} at a glance`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <p className="text-base sm:text-lg font-bold text-foreground">
          {rows[0].meta.name} vs {rows[1].meta.name}: what you&apos;d pay
        </p>
        <span className="hidden sm:inline text-xs text-muted-foreground">Rates checked {RATES_CHECKED}</span>
      </div>
      <MixDisclosure className="mb-3 !text-xs sm:!text-sm" />
      <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
        {rows.map(({ meta, at }) => (
          <div key={meta.processor} className="flex flex-col rounded-xl border border-border bg-background p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-foreground">{meta.name}</p>
              <a href={meta.pricingUrl} target="_blank" rel="nofollow noopener" className="text-xs text-muted-foreground underline underline-offset-2 hover:text-primary">
                Official pricing
              </a>
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
              {tiers.map((t, i) => (
                <div key={t}>
                  <dt className="text-xs text-muted-foreground">At {TIER_LABELS[t]}/mo</dt>
                  <dd className="font-bold tabular-nums text-foreground">
                    {at[i] ? formatRate(at[i]!.score) : "n/a"}
                    {at[i] && <span className="ml-1 text-[11px] font-normal text-muted-foreground">{at[i]!.scoreChannel.toLowerCase()}</span>}
                    {at[i] && <span className="block text-xs font-normal text-muted-foreground">≈ {monthlyCost(at[i]!.score, t)}/mo</span>}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground flex-1">{meta.bestFor}</p>
            <ProviderButton
              partnerSlug={meta.partnerSlug}
              pricingUrl={meta.pricingUrl}
              from={from}
              label={`Check rates at ${meta.name}`}
              className="mt-2 sm:mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-cta px-4 py-2 sm:py-2.5 text-sm font-semibold text-cta-foreground hover:bg-cta-hover transition-colors"
            >
              Check rates at {meta.name} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </ProviderButton>
          </div>
        ))}
      </div>
      <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground">
        {tiers.map((t, i) => (cheaperAt[i] ? `Cheaper at ${TIER_LABELS[t]}: ${cheaperAt[i]}. ` : `Same cost at ${TIER_LABELS[t]}. `))}
        Effective rate, lowest channel, standard U.S. card mix, published fees included.{" "}
        <Link href="/comparisons/best-payment-processors-2026#ranking" className="underline underline-offset-2 hover:text-primary">See all providers ranked</Link>
      </p>
    </section>
  );
}

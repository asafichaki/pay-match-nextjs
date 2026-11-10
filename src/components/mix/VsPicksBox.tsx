import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PROVIDER_META, formatRate, monthlyCost, rankAt, RATES_CHECKED, TIER_LABELS, type TierIndex } from "@/lib/data/ranking-2026";
import { VS_CHOOSE } from "@/lib/data/article-offers";
import { ProviderButton } from "./ProviderButton";
import { MixDisclosure } from "./MixDisclosure";

/**
 * The verdict block on an A-vs-B page. Rebuilt 2026-11-10: a reader who
 * searched "helcim vs square" already has the shortlist, so two identical
 * buttons hand the decision back. The block now picks: the provider that
 * costs less at $10K a month gets the filled button and the first card, the
 * other gets an outline button and a plain "choose it if" line. The pick
 * comes from ranking-2026.ts only; who pays us is not an input.
 */
export function VsPicksBox({ a, b, from }: { a: string; b: string; from: string }) {
  const tiers: TierIndex[] = [0, 1];
  const sides = [a, b].map((processor) => {
    const meta = PROVIDER_META.find((m) => m.processor === processor);
    if (!meta) throw new Error(`VsPicksBox: unknown processor ${processor}`);
    const at = tiers.map((t) => rankAt(t).find((p) => p.processor === processor));
    return { meta, at };
  });
  const score = (i: number) => sides[i].at[0]?.score ?? Infinity;
  const tie = score(0) === score(1);
  const winnerIdx = tie ? 0 : score(0) < score(1) ? 0 : 1;
  const ordered = tie ? sides : [sides[winnerIdx], sides[1 - winnerIdx]];
  const winner = ordered[0].meta;
  const loser = ordered[1].meta;
  const gap = tie ? null : `${formatRate(ordered[0].at[0]!.score)} vs ${formatRate(ordered[1].at[0]!.score)}`;

  return (
    <section className="my-4 sm:my-6 rounded-2xl border border-primary/25 bg-accent/60 p-3 sm:p-5" data-top-picks aria-label={`${a} vs ${b}: the verdict`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <p className="text-base sm:text-lg font-bold text-foreground">
          {tie ? `${winner.name} and ${loser.name} cost the same at ${TIER_LABELS[0]} a month` : `${winner.name} costs less at ${TIER_LABELS[0]} a month: ${gap}`}
        </p>
        <span className="text-xs text-muted-foreground">Prices checked {RATES_CHECKED}</span>
      </div>
      <MixDisclosure className="mb-3 !text-xs" />
      <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
        {ordered.map(({ meta, at }, i) => {
          const primary = i === 0 && !tie;
          const choose = VS_CHOOSE[meta.processor] ?? meta.bestFor;
          return (
            <div key={meta.processor} className={`flex flex-col rounded-xl border bg-background p-4 shadow-sm ${primary ? "border-primary/40" : "border-border"}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-base font-bold text-foreground">{meta.name}</p>
                {at[0] ? (
                  <p className="text-right tabular-nums">
                    <span className="text-lg font-bold text-foreground">{monthlyCost(at[0].score, 0)}</span>
                    <span className="block text-[11px] text-muted-foreground">{formatRate(at[0].score)} at {TIER_LABELS[0]}/mo</span>
                  </p>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-foreground flex-1">
                <span className="font-semibold">Choose {meta.name} if</span> {choose}.
              </p>
              {at[1] ? (
                <p className="mt-1 text-xs text-muted-foreground">At {TIER_LABELS[1]}/mo: {formatRate(at[1].score)}, about {monthlyCost(at[1].score, 1)}.</p>
              ) : null}
              <ProviderButton
                partnerSlug={meta.partnerSlug}
                pricingUrl={meta.pricingUrl}
                from={from}
                el="verdict"
                pos={i + 1}
                vol="10k"
                label={`Visit ${meta.name}`}
                className={
                  primary
                    ? "mt-3 inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl bg-cta px-4 py-3 text-[15px] font-semibold text-cta-foreground hover:bg-cta-hover transition-colors"
                    : "mt-3 inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-primary/40 bg-background px-4 py-3 text-[15px] font-semibold text-primary hover:bg-accent transition-colors"
                }
              >
                Visit {meta.name} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </ProviderButton>
              <a href={meta.pricingUrl} target="_blank" rel="nofollow noopener" className="mt-2 text-center text-xs text-muted-foreground underline underline-offset-2 hover:text-primary">
                Official pricing
              </a>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Effective rate on the lowest-cost channel, standard U.S. card mix, every published fee included.{" "}
        <Link href="/comparisons/best-payment-processors-2026#ranking" className="underline underline-offset-2 hover:text-primary">See all providers ranked</Link>
      </p>
    </section>
  );
}

import { ArrowUpRight, Info, Trophy } from "lucide-react";
import { ASSUMPTIONS, cheapestPerTier, formatRate, mainTable, RATES_CHECKED, TIER_LABELS, type TableRow } from "@/lib/data/ranking-2026";
import { ProviderButton } from "./ProviderButton";
import { ProviderLogo } from "./ProviderLogo";
import { MixDisclosure } from "./MixDisclosure";

/**
 * The one table the best-of page is built around. Every provider, its
 * effective rate at all four monthly volumes, who it suits, how it prices,
 * and a button. Cards below 1024px (no sideways scroll on phones or tablets),
 * a full table from lg up. The cheapest rate in each volume is highlighted.
 */

function Rate({ v, best }: { v: number | null; best: boolean }) {
  if (v === null) return <span className="text-muted-foreground">n/a</span>;
  return best ? (
    <span className="inline-flex items-center rounded-md bg-success/15 px-1.5 py-0.5 font-bold text-foreground ring-1 ring-success/30">
      {formatRate(v)}
    </span>
  ) : (
    <span className="text-foreground">{formatRate(v)}</span>
  );
}

function Visit({ p, from, className }: { p: TableRow; from: string; className: string }) {
  return (
    <ProviderButton partnerSlug={p.partnerSlug} pricingUrl={p.pricingUrl} from={from} label={`Visit ${p.name}`} className={className}>
      Visit {p.name.replace(" Payments", "")} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
    </ProviderButton>
  );
}

export function MainRankingTable({ from }: { from: string }) {
  const rows = mainTable();
  const cheapest = cheapestPerTier(rows);
  const anchor = (n: string) => `#${n.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <section id="ranking" aria-labelledby="ranking-heading" className="my-8 scroll-mt-24" data-top-picks>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h2 id="ranking-heading" className="text-xl md:text-2xl font-bold text-foreground">
          The ranking: effective rate by monthly volume
        </h2>
        <span className="text-xs text-muted-foreground">Lower is better · prices checked {RATES_CHECKED}</span>
      </div>
      <MixDisclosure className="mb-4 !text-xs sm:!text-sm" />

      {/* Phones and tablets: cards */}
      <ol className="lg:hidden grid gap-3 md:grid-cols-2 list-none p-0 m-0">
        {rows.map((p) => {
          const top = p.rank === 1;
          return (
            <li
              key={p.processor}
              className={`relative flex flex-col rounded-2xl border bg-background p-4 shadow-sm ${top ? "border-primary/50 ring-1 ring-primary/30" : "border-border"}`}
            >
              {top && (
                <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground">
                  <Trophy className="h-3 w-3" aria-hidden="true" /> Lowest cost at $10K
                </span>
              )}
              <div className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-sm font-bold text-muted-foreground tabular-nums">{p.rank}</span>
                <ProviderLogo name={p.name} logo={p.logo} top={top} />
                <div className="min-w-0 flex-1">
                  <a href={anchor(p.name)} className="font-bold text-foreground leading-tight hover:text-primary">{p.name}</a>
                  <p className="text-xs text-muted-foreground">{p.pricingModel}</p>
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-4 gap-1 rounded-xl bg-muted/50 p-2 text-center tabular-nums">
                {p.rates.map((v, t) => (
                  <div key={t}>
                    <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{TIER_LABELS[t]}</dt>
                    <dd className="mt-0.5 text-sm"><Rate v={v} best={v === cheapest[t]} /></dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-sm text-muted-foreground flex-1">{p.bestFor}</p>
              {p.caveat && (
                <p className="mt-1.5 flex gap-1.5 text-xs text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />{p.caveat}
                </p>
              )}
              <Visit
                p={p}
                from={from}
                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-cta px-4 py-2.5 text-sm font-semibold text-cta-foreground hover:bg-cta-hover transition-colors"
              />
            </li>
          );
        })}
      </ol>

      {/* Desktop: the full table */}
      <div className="hidden lg:block overflow-hidden rounded-2xl border border-border shadow-sm">
        <table className="w-full text-sm">
          <caption className="sr-only">Effective rate by monthly card volume, all published fees included</caption>
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="w-12 px-4 py-3 font-semibold">#</th>
              <th scope="col" className="px-3 py-3 font-semibold">Provider</th>
              {TIER_LABELS.map((l) => (
                <th key={l} scope="col" className="px-3 py-3 font-semibold text-right whitespace-nowrap">{l}<span className="normal-case">/mo</span></th>
              ))}
              <th scope="col" className="w-40 px-4 py-3"><span className="sr-only">Visit</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const top = p.rank === 1;
              return (
                <tr key={p.processor} className={`border-t border-border align-middle ${top ? "bg-primary/[0.04]" : "hover:bg-muted/30"}`}>
                  <td className="px-4 py-4 text-base font-bold text-muted-foreground tabular-nums">{p.rank}</td>
                  <td className="px-3 py-4">
                    <div className="flex items-start gap-3">
                      <ProviderLogo name={p.name} logo={p.logo} top={top} />
                      <div className="min-w-0 max-w-[22rem]">
                        <div className="flex flex-wrap items-center gap-2">
                          <a href={anchor(p.name)} className="text-base font-bold text-foreground hover:text-primary">{p.name}</a>
                          {top && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                              <Trophy className="h-3 w-3" aria-hidden="true" /> Lowest cost
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.bestFor}</p>
                        <p className="text-[11px] text-muted-foreground/80 mt-1">
                          {p.pricingModel} ·{" "}
                          <a href={p.pricingUrl} target="_blank" rel="nofollow noopener" className="underline underline-offset-2 hover:text-primary">official pricing</a>
                        </p>
                        {p.caveat && (
                          <p className="mt-1 flex gap-1 text-[11px] text-muted-foreground">
                            <Info className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />{p.caveat}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  {p.rates.map((v, t) => (
                    <td key={t} className="px-3 py-4 text-right tabular-nums whitespace-nowrap text-[15px]">
                      <Rate v={v} best={v === cheapest[t]} />
                    </td>
                  ))}
                  <td className="px-4 py-4 text-right">
                    <Visit
                      p={p}
                      from={from}
                      className="inline-flex w-36 items-center justify-center gap-1 whitespace-nowrap rounded-xl bg-cta px-3 py-2.5 text-sm font-semibold text-cta-foreground hover:bg-cta-hover transition-colors"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Effective rate = percentage + fixed fee / ${ASSUMPTIONS.averageSale} average sale + monthly fee / volume, from each provider&apos;s published prices; cheapest plan and cheaper channel used. Ordered at $10K a month. <span className="rounded bg-success/15 px-1 ring-1 ring-success/30">Green</span> = cheapest at that volume.{" "}
        <a href="#method" className="underline underline-offset-2 hover:text-primary">How we rank</a>
      </p>
    </section>
  );
}

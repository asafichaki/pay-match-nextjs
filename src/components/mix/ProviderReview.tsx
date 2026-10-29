import { ArrowUpRight, Check, CircleDollarSign, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { formatRate, TIER_LABELS, type TableRow } from "@/lib/data/ranking-2026";
import type { ProviderReviewData } from "@/lib/data/provider-reviews-2026";
import { ProviderButton } from "./ProviderButton";
import { ProviderLogo } from "./ProviderLogo";

/**
 * One Forbes-style review card: verdict, the published fees, pros and cons,
 * who it is for and who should skip it, and the button. Every fee line comes
 * from the provider's own pricing page on the date in `checkedLabel`.
 */
export function ProviderReview({ row, review, from, cheapest }: { row: TableRow; review: ProviderReviewData; from: string; cheapest?: (number | null)[] }) {
  const id = row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const top = row.rank === 1;
  const facts: [string, string | null][] = [
    ["In person", review.inPerson],
    ["Online", review.online],
    ["Monthly fee", review.monthlyFee],
    ["Hardware", review.hardware],
    ["Contract", review.contract],
    ["Payouts", review.payouts],
    ["Other fees", review.otherFees],
  ];
  const button = (cls: string) => (
    <ProviderButton partnerSlug={row.partnerSlug} pricingUrl={row.pricingUrl} from={from} label={`Visit ${row.name}`} className={cls}>
      Visit {row.name} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
    </ProviderButton>
  );

  return (
    <article
      id={id}
      aria-labelledby={`${id}-h`}
      className={`scroll-mt-24 mt-6 overflow-hidden rounded-2xl border bg-background shadow-sm ${top ? "border-primary/50 ring-1 ring-primary/20" : "border-border"}`}
    >
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-border bg-muted/30 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <ProviderLogo name={row.name} logo={row.logo} size="lg" top={top} />
          <div className="min-w-0">
            <p className={`text-xs font-semibold ${top ? "text-primary" : "text-muted-foreground"}`}>#{row.rank} at $10K a month</p>
            <h3 id={`${id}-h`} className="text-xl sm:text-2xl font-bold text-foreground leading-tight">{row.name}</h3>
            <p className="text-sm text-muted-foreground">{row.bestFor}</p>
          </div>
        </div>
        <div className="flex flex-col gap-1 sm:items-end">
          {button("inline-flex items-center justify-center gap-1.5 rounded-xl bg-cta px-5 py-2.5 text-sm font-semibold text-cta-foreground hover:bg-cta-hover transition-colors")}
          <a href={review.pricingUrl} target="_blank" rel="nofollow noopener" className="text-xs text-muted-foreground underline underline-offset-2 hover:text-primary sm:text-right">
            Official pricing, checked {review.checkedLabel}
          </a>
        </div>
      </header>

      <div className="p-5 sm:p-6">
        {/* Rate strip */}
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Effective rate by monthly volume</p>
        <dl className="mt-2 grid grid-cols-4 overflow-hidden rounded-xl border border-border text-center tabular-nums">
          {row.rates.map((v, t) => {
            const best = cheapest && v !== null && v === cheapest[t];
            return (
              <div key={t} className={`px-1 py-2.5 ${t > 0 ? "border-l border-border" : ""} ${best ? "bg-success/10" : ""}`}>
                <dt className="text-[10px] sm:text-xs text-muted-foreground">{TIER_LABELS[t]}/mo</dt>
                <dd className="text-base sm:text-lg font-bold text-foreground">{v === null ? "n/a" : formatRate(v)}</dd>
                {best && <dd className="text-[10px] font-semibold text-success">Cheapest</dd>}
              </div>
            );
          })}
        </dl>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Our take */}
          <div>
            <h4 className="text-lg font-semibold text-foreground">Our take</h4>
            {review.take.map((para, i) => (
              <p key={i} className="mt-2 text-[15px] sm:text-base text-muted-foreground leading-relaxed">{para}</p>
            ))}
            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <p className="rounded-xl bg-success/10 p-3"><strong className="block text-foreground">Choose it if</strong><span className="text-muted-foreground">{review.bestFor}</span></p>
              <p className="rounded-xl bg-destructive/5 p-3"><strong className="block text-foreground">Skip it if</strong><span className="text-muted-foreground">{review.skipIf}</span></p>
            </div>
          </div>

          {/* What it costs */}
          <div>
            <h4 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <CircleDollarSign className="h-5 w-5 text-primary" aria-hidden="true" /> What it costs
            </h4>
            <dl className="mt-2 divide-y divide-border rounded-xl border border-border text-sm">
              {facts.filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-2 px-3 py-2.5">
                  <dt className="font-medium text-foreground">{k}</dt>
                  <dd className="text-muted-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Pros and cons */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-success/30 bg-success/[0.06] p-4">
            <h4 className="mb-2 flex items-center gap-2 font-semibold text-foreground"><ThumbsUp className="h-4 w-4 text-success" aria-hidden="true" /> Pros</h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground list-none p-0">
              {review.pros.map((p) => (
                <li key={p} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />{p}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-destructive/20 bg-destructive/[0.04] p-4">
            <h4 className="mb-2 flex items-center gap-2 font-semibold text-foreground"><ThumbsDown className="h-4 w-4 text-destructive" aria-hidden="true" /> Cons</h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground list-none p-0">
              {review.cons.map((c) => (
                <li key={c} className="flex gap-2"><X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />{c}</li>
              ))}
            </ul>
          </div>
        </div>

        {row.caveat && <p className="mt-4 text-xs text-muted-foreground italic">{row.caveat}</p>}

        {/* Footer CTA */}
        <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          {row.reviewHref ? (
            <a href={row.reviewHref} className="text-sm font-medium text-primary hover:underline">Read the full {row.name} comparison</a>
          ) : <span />}
          {button("inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-cta px-5 py-2 text-sm font-semibold text-cta hover:bg-cta hover:text-cta-foreground transition-colors")}
        </div>
      </div>
    </article>
  );
}

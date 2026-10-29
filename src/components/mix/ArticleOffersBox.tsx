import { ArrowUpRight } from "lucide-react";
import { PROVIDER_META } from "@/lib/data/ranking-2026";
import type { ArticleOffers } from "@/lib/data/article-offers";
import { ProviderButton } from "./ProviderButton";
import { MixDisclosure } from "./MixDisclosure";

/** The above-the-fold provider box for a database-rendered article. */
export function ArticleOffersBox({ offers, from }: { offers: ArticleOffers; from: string }) {
  return (
    <section className="mb-8 rounded-2xl border border-primary/25 bg-accent/60 p-3 sm:p-6" data-top-picks aria-labelledby="offers-heading">
      <h2 id="offers-heading" className="text-base sm:text-xl font-bold text-foreground mb-1">{offers.heading}</h2>
      <MixDisclosure className="mb-3 !text-xs sm:!text-sm" />
      <ol className="space-y-2 list-none p-0 m-0">
        {offers.items.map((it, i) => {
          const meta = PROVIDER_META.find((m) => m.processor === it.processor);
          if (!meta) return null;
          return (
            <li key={it.processor} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
              <span className="hidden sm:inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm sm:text-base font-bold text-foreground">{meta.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{it.fact}</p>
              </div>
              <ProviderButton
                partnerSlug={meta.partnerSlug}
                pricingUrl={meta.pricingUrl}
                from={from}
                label={`Check rates at ${meta.name}`}
                className="inline-flex shrink-0 items-center justify-center gap-1 rounded-lg bg-cta px-3 py-2 text-xs sm:px-4 sm:text-sm font-semibold text-cta-foreground hover:bg-cta-hover transition-colors"
              >
                <span className="sm:hidden">Visit</span><span className="hidden sm:inline">Visit {meta.name}</span> <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </ProviderButton>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs text-muted-foreground">{offers.orderNote} Full fee table and sources below.</p>
    </section>
  );
}

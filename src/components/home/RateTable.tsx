// Editorial rate table for the homepage. Reads from Supabase server-side.

import Link from "next/link";
import { ArrowRight, ShieldCheck, Star, ExternalLink } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

interface ProviderRow {
  name: string;
  rating: number | null;
  rating_label: string | null;
  transaction_fees: string | null;
  setup_speed: string | null;
  funding_speed: number | null;
  customer_support: string | null;
  url: string | null;
  is_top_pick: boolean;
  display_order: number;
  source_url: string | null;
  last_verified: string | null;
}

async function fetchProviders(): Promise<ProviderRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("providers")
    .select(
      "name, rating, rating_label, transaction_fees, setup_speed, funding_speed, customer_support, url, is_top_pick, display_order, source_url, last_verified"
    )
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .limit(10);
  return (data || []) as ProviderRow[];
}

const fmtFunding = (n: number | null) => {
  if (n === null || n === undefined) return "—";
  if (n === 1) return "Next-day";
  if (n === 2) return "2 days";
  return `${n} days`;
};

function RatingPill({ rating, label }: { rating: number | null; label: string | null }) {
  if (rating === null || rating === undefined) return <span className="text-muted-foreground">—</span>;
  const tone =
    rating >= 9
      ? "bg-primary/10 text-primary border-primary/20"
      : rating >= 8
        ? "bg-foreground/[0.06] text-foreground border-border"
        : "bg-muted text-muted-foreground border-border";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>
      <Star className="h-3 w-3 fill-current" />
      {Number(rating).toFixed(1)}
      {label && <span className="font-normal opacity-70">· {label}</span>}
    </span>
  );
}

export default async function RateTable() {
  const rows = await fetchProviders();

  return (
    <section
      className="relative bg-gradient-to-b from-background via-background to-accent/30"
      aria-labelledby="rate-table-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-10 sm:py-14 md:py-20">
        {/* Heading row */}
        <div className="flex items-end justify-between flex-wrap gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] font-semibold text-primary mb-3">
              The list
            </p>
            <h2
              id="rate-table-heading"
              className="font-display text-3xl md:text-5xl font-bold text-foreground tracking-tight leading-[1.05]"
            >
              Real 2026 rates,
              <br className="hidden md:block" />{" "}
              <span className="text-primary">side-by-side.</span>
            </h2>
          </div>
          <p className="text-xs text-muted-foreground inline-flex items-center gap-2 bg-background border border-border rounded-full px-3 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Pulled from public pricing pages · Last verified{" "}
            {(() => {
              const dates = rows.map((r) => r.last_verified).filter(Boolean) as string[];
              if (!dates.length) return "May 2026";
              const latest = dates.sort().reverse()[0];
              return new Date(latest).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
            })()}
          </p>
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_60px_-24px_rgba(0,0,0,0.12)]">
          {/* Desktop / tablet table */}
          <div className="hidden md:block">
            <div className="grid grid-cols-[1.6fr_1.1fr_0.9fr_0.9fr_1.2fr_1.1fr] gap-4 px-6 py-3 bg-muted/40 border-b border-border text-[11px] uppercase tracking-[0.14em] font-semibold text-muted-foreground">
              <div>Provider</div>
              <div>Effective rate</div>
              <div>Setup</div>
              <div>Funding</div>
              <div>Support</div>
              <div className="text-right">Rating</div>
            </div>

            {rows.length === 0 ? (
              <div className="py-14 text-center text-sm text-muted-foreground">
                Provider data is loading. Reload in a moment.
              </div>
            ) : (
              rows.map((p, idx) => (
                <div
                  key={p.name}
                  className={`grid grid-cols-[1.6fr_1.1fr_0.9fr_0.9fr_1.2fr_1.1fr] gap-4 px-6 py-5 items-center transition-colors hover:bg-accent/40 ${
                    idx !== rows.length - 1 ? "border-b border-border/70" : ""
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-display text-lg font-semibold text-foreground tracking-tight">
                      {p.name}
                    </span>
                    {p.source_url && (
                      <a
                        href={p.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                      >
                        Source <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                  <div className="font-mono text-sm text-foreground tabular-nums leading-snug">
                    {p.transaction_fees || "—"}
                  </div>
                  <div className="text-sm text-muted-foreground">{p.setup_speed || "—"}</div>
                  <div className="text-sm text-muted-foreground">{fmtFunding(p.funding_speed)}</div>
                  <div className="text-sm text-muted-foreground">{p.customer_support || "—"}</div>
                  <div className="text-right">
                    <RatingPill rating={p.rating ? Number(p.rating) : null} label={p.rating_label} />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-border">
            {rows.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
            ) : (
              rows.map((p) => (
                <div key={p.name} className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex flex-col gap-1">
                      <span className="font-display text-lg font-semibold text-foreground tracking-tight">
                        {p.name}
                      </span>
                      {p.source_url && (
                        <a
                          href={p.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary"
                        >
                          Source <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                    <RatingPill rating={p.rating ? Number(p.rating) : null} label={p.rating_label} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Rate</p>
                      <p className="font-mono text-foreground tabular-nums">{p.transaction_fees || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Funding</p>
                      <p className="text-foreground">{fmtFunding(p.funding_speed)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Setup</p>
                      <p className="text-foreground">{p.setup_speed || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Support</p>
                      <p className="text-foreground text-xs">{p.customer_support || "—"}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-8 grid md:grid-cols-[1fr_auto] gap-6 items-end">
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Sticker rates are not effective rates. Your real cost depends on card mix, ticket size, and contract terms. A personally-vetted shortlist filters this for your business.
          </p>
          <Link
            href="/comparisons"
            className="text-sm font-semibold text-foreground hover:text-primary inline-flex items-center gap-1.5 self-start md:self-end whitespace-nowrap"
          >
            See full comparisons
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Server-rendered editorial rate table for the homepage.
// Reads providers from Supabase via the existing browser client (cached
// at request time on the server). No client interactivity beyond a
// "Talk to Barak" link in the bottom row, which goes through the modal.

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { BARAK_NAME } from "@/data/personas/barak";

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
      "name, rating, rating_label, transaction_fees, setup_speed, funding_speed, customer_support, url, is_top_pick, display_order"
    )
    .eq("is_active", true)
    .order("is_top_pick", { ascending: false })
    .order("display_order", { ascending: true })
    .limit(8);
  return (data || []) as ProviderRow[];
}

const fmtFunding = (n: number | null) => {
  if (n === null || n === undefined) return "—";
  if (n === 1) return "Next-day";
  if (n === 2) return "2 days";
  return `${n} days`;
};

export default async function RateTable() {
  const rows = await fetchProviders();

  return (
    <section className="bg-background" aria-labelledby="rate-table-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-16 md:py-20">
        <div className="flex items-end justify-between mb-3 gap-4 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-wider font-medium text-primary mb-2">
              The list
            </p>
            <h2
              id="rate-table-heading"
              className="font-display text-3xl md:text-4xl font-bold text-foreground"
            >
              Real 2026 rates, side-by-side
            </h2>
          </div>
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Reviewed by {BARAK_NAME} · Updated{" "}
            {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="py-3 px-4 font-medium text-muted-foreground uppercase tracking-wider text-xs">Provider</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground uppercase tracking-wider text-xs">Effective rate</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground uppercase tracking-wider text-xs hidden md:table-cell">Setup</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground uppercase tracking-wider text-xs hidden lg:table-cell">Funding</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground uppercase tracking-wider text-xs hidden lg:table-cell">Support</th>
                  <th className="py-3 px-4 font-medium text-muted-foreground uppercase tracking-wider text-xs">Rating</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      Provider data is loading. Reload in a moment.
                    </td>
                  </tr>
                ) : (
                  rows.map((p) => (
                    <tr
                      key={p.name}
                      className="border-t border-border hover:bg-accent/40 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{p.name}</span>
                          {p.is_top_pick && (
                            <span className="text-[10px] uppercase tracking-wider font-bold text-primary border border-primary rounded px-1.5 py-0.5">
                              Top pick
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-foreground">
                        {p.transaction_fees || "—"}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground hidden md:table-cell">
                        {p.setup_speed || "—"}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground hidden lg:table-cell">
                        {fmtFunding(p.funding_speed)}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground hidden lg:table-cell">
                        {p.customer_support || "—"}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-foreground">
                          {p.rating?.toString() || "—"}
                        </span>
                        {p.rating_label && (
                          <span className="text-xs text-muted-foreground ml-1">
                            · {p.rating_label}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-muted-foreground max-w-xl">
            Sticker rates are not effective rates. Your real cost depends on card mix, ticket size, and contract terms. Get a personally-vetted shortlist that filters this for your business.
          </p>
          <Link
            href="/comparisons"
            className="text-sm font-medium text-foreground hover:text-primary inline-flex items-center gap-1"
          >
            See full comparisons
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

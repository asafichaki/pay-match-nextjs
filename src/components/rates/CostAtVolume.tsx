"use client";

import { useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ASSUMPTIONS, PROVIDER_META, RATES_CHECKED, quoteAtVolume, type RateChannel } from "@/lib/data/ranking-2026";
import { ProviderButton } from "@/components/mix/ProviderButton";
import { DISCLOSURE_TEXT } from "@/components/AffiliateLink";
import { track } from "@/lib/analytics/track";

/**
 * "What will it cost at your volume": type a monthly volume, pick in person or
 * online, see every provider's effective rate and monthly cost.
 *
 * Computed in the browser with quoteAtVolume() from ranking-2026.ts, the same
 * formula and cheapest-plan rule as the ranking and /data/effective-rates-2026,
 * so at $10K/$50K/$250K/$1M it shows exactly the table's numbers and in between
 * it applies each provider's published price at the typed volume (Helcim's
 * volume steps and Stax's subscription bands included). Nothing is
 * interpolated. The first server render uses the defaults, so the box has its
 * final height before any JavaScript runs.
 */

const MIN = 1_000;
const MAX = 1_000_000;
const PRESETS = [10_000, 50_000, 250_000, 1_000_000];
const VISIBLE = 3;

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;
const short = (n: number) => (n >= 1_000_000 ? `$${n / 1_000_000}M` : `$${n / 1_000}K`);

export function CostAtVolume({
  from,
  defaultVolume = 25_000,
  defaultChannel = "In-person",
  className = "",
}: {
  /** Page path, passed to /go/ for click attribution. */
  from: string;
  defaultVolume?: number;
  defaultChannel?: RateChannel;
  className?: string;
}) {
  const id = useId();
  const [raw, setRaw] = useState(defaultVolume.toLocaleString("en-US"));
  const [channel, setChannel] = useState<RateChannel>(defaultChannel);
  const [showAll, setShowAll] = useState(false);
  const touched = useRef(false);

  const firstInteraction = (how: string) => {
    if (touched.current) return;
    touched.current = true;
    track("cost_widget_interact", { placement: "cost-widget", how, page_path: from });
  };

  const volume = Number(raw.replace(/[^0-9]/g, ""));
  const valid = volume >= MIN && volume <= MAX;

  const quotes = useMemo(() => {
    if (!valid) return [];
    return PROVIDER_META.map((m) => ({ m, q: quoteAtVolume(m, channel, volume) }))
      .filter((x): x is { m: (typeof PROVIDER_META)[number]; q: NonNullable<ReturnType<typeof quoteAtVolume>> } => x.q !== null)
      .sort((a, b) => a.q.rate - b.q.rate || a.m.name.localeCompare(b.m.name));
  }, [channel, volume, valid]);

  const low = quotes[0];
  const high = quotes[quotes.length - 1];
  const gap = low && high ? high.q.monthlyFee - low.q.monthlyFee : 0;
  const shown = showAll ? quotes : quotes.slice(0, VISIBLE);
  const where = channel === "Online" ? "online" : "in person";
  const linkCls = "font-semibold text-primary underline underline-offset-2 hover:text-primary/80";

  return (
    <section
      data-cost-widget
      aria-labelledby={`${id}-h`}
      className={`rounded-2xl border border-primary/25 bg-card p-4 text-left shadow-sm sm:p-5 ${className}`}
    >
      <h2 id={`${id}-h`} className="text-base font-bold text-foreground sm:text-lg">
        What will cards cost at your volume?
      </h2>

      <form className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 sm:gap-3" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor={`${id}-v`} className="mb-1 block text-xs font-semibold text-foreground sm:text-sm">
            Monthly card sales
          </label>
          <div className="flex items-center rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
            <span className="pl-3 text-muted-foreground" aria-hidden="true">$</span>
            <input
              id={`${id}-v`}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              aria-describedby={`${id}-hint`}
              aria-invalid={!valid}
              value={raw}
              onFocus={() => firstInteraction("focus")}
              onChange={(e) => {
                firstInteraction("type");
                const digits = e.target.value.replace(/[^0-9]/g, "").slice(0, 7);
                setRaw(digits ? Number(digits).toLocaleString("en-US") : "");
              }}
              className="h-11 w-full min-w-0 bg-transparent px-2 text-base font-semibold tabular-nums text-foreground outline-none"
            />
          </div>
        </div>

        <fieldset>
          <legend className="sr-only">Where you take cards</legend>
          <div className="inline-flex h-11 items-stretch rounded-lg border border-input bg-muted/50 p-1">
            {(["In-person", "Online"] as RateChannel[]).map((ch) => (
              <label
                key={ch}
                className={`flex cursor-pointer items-center rounded-md px-2.5 text-sm font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring sm:px-4 ${
                  channel === ch ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name={`${id}-ch`}
                  value={ch}
                  checked={channel === ch}
                  onChange={() => {
                    firstInteraction("channel");
                    setChannel(ch);
                    setShowAll(false);
                  }}
                  className="sr-only"
                />
                {ch === "In-person" ? "In person" : "Online"}
              </label>
            ))}
          </div>
        </fieldset>

        <div id={`${id}-hint`} className="col-span-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="sr-only">Any amount from $1,000 to $1,000,000 a month.</span>
          <span aria-hidden="true">Try:</span>
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                firstInteraction("preset");
                setRaw(p.toLocaleString("en-US"));
              }}
              className="rounded-full border border-border px-2 py-0.5 font-medium text-foreground hover:border-primary hover:text-primary"
            >
              {short(p)}
            </button>
          ))}
        </div>
      </form>

      <div aria-live="polite" aria-atomic="true" className="mt-3">
        {!valid || !low ? (
          <p className="rounded-lg bg-muted/50 p-3 text-sm text-foreground">Enter a monthly amount between $1,000 and $1,000,000 to see the costs.</p>
        ) : (
          <p className="text-sm leading-relaxed text-foreground">
            At {usd(volume)} a month {where}, the lowest published price is <strong>{low.m.name} at {low.q.rate.toFixed(2)}%</strong>, about{" "}
            <strong>{usd(low.q.monthlyFee)} a month</strong>. The highest of {quotes.length} is {high.m.name} at {high.q.rate.toFixed(2)}%:{" "}
            <strong>{usd(gap)} a month</strong> ({usd(gap * 12)} a year) more.
          </p>
        )}
      </div>

      {valid && low ? (
        <>
          <ol className="mt-2 space-y-1 p-0 text-sm" aria-label={`Effective rate ${where} at ${usd(volume)} a month, lowest first`}>
            {shown.map(({ m, q }, i) => (
              <li
                key={m.name}
                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${i === 0 ? "border-success/40 bg-success/10" : "border-border bg-background"}`}
              >
                <span className="w-4 shrink-0 text-xs font-bold tabular-nums text-muted-foreground">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate">
                  <span className="font-semibold text-foreground">{m.name}</span>{" "}
                  <span className="text-xs text-muted-foreground">{q.plan}</span>
                </span>
                <span className="shrink-0 tabular-nums">
                  <span className="font-bold text-foreground">{q.rate.toFixed(2)}%</span>{" "}
                  <span className="text-xs text-muted-foreground">{usd(q.monthlyFee)}/mo</span>
                </span>
              </li>
            ))}
          </ol>
          {low.m.caveat && <p className="mt-1.5 text-xs text-muted-foreground">{low.m.name}: {low.m.caveat}</p>}
        </>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {valid && low ? (
          <ProviderButton
            partnerSlug={low.m.partnerSlug}
            pricingUrl={low.m.pricingUrl}
            from={from}
            label={`Check rates at ${low.m.name}`}
            className="inline-flex items-center gap-1 rounded-lg bg-cta px-3 py-2 font-semibold text-cta-foreground transition-colors hover:bg-cta-hover"
          >
            {low.m.name.replace(" Payments", "")} pricing <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </ProviderButton>
        ) : null}
        {quotes.length > VISIBLE && (
          <button type="button" onClick={() => setShowAll((s) => !s)} aria-expanded={showAll} className={linkCls}>
            {showAll ? "Show fewer" : `Show all ${quotes.length}`}
          </button>
        )}
        <Link href="/calculator" className={linkCls}>Fee calculator</Link>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
        Prices checked {RATES_CHECKED}, ${ASSUMPTIONS.averageSale} average sale, hardware and payout fees not included.{" "}
        <Link href="/data/effective-rates-2026#methodology" className="underline underline-offset-2 hover:text-primary">Method and full data</Link>.{" "}
        {DISCLOSURE_TEXT}{" "}
        <a href="/how-we-make-money" className="underline underline-offset-2 hover:text-primary">How we make money</a>
      </p>
    </section>
  );
}

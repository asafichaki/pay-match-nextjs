"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, ChevronDown, Minus, Sparkles } from "lucide-react";
import { ASSUMPTIONS, cheapestPerTier, formatRate, mainTable, monthlyCost, rankAt, RATES_CHECKED, TIER_LABELS, type TableRow, type TierIndex } from "@/lib/data/ranking-2026";
import { PROVIDER_REVIEWS } from "@/lib/data/provider-reviews-2026";
import { VOLUME_KEYS, type VolumeKey } from "@/components/AffiliateLink";
import { track } from "@/lib/analytics/track";
import { openSortingHat } from "@/components/sorting-hat/useSortingHatModal";
import { ProviderButton } from "./ProviderButton";
import { ProviderLogo } from "./ProviderLogo";
import { MixDisclosure } from "./MixDisclosure";

/**
 * The one ranking the best-of page is built around: every provider, its real
 * cost at the volume the reader picks, who it suits, and a button.
 *
 * Rebuilt 2026-11-10 after a seven-reviewer pass:
 *   - The ORDER never changes. It is the published $10K order, the same one
 *     the ItemList schema carries. The volume selector rewrites the numbers
 *     and moves the "Lowest cost" badge; it does not shuffle cards under the
 *     reader's thumb.
 *   - One badge per card, always metric-based ("Lowest cost at $10K",
 *     "#3 at $50K"), never "Editor's choice".
 *   - Cards lead with the dollar figure a merchant actually thinks in, then
 *     the effective rate. Two pros and one con from the review data.
 *   - Cards 6+ sit inside <details>, still in the HTML for crawlers and
 *     find-in-page, one tap away for people.
 *   - The sticky bar follows the current #1 at the selected volume, shows
 *     only while the list is in view, and carries one orange button.
 *
 * Desktop (lg+) keeps the full four-column table.
 */

const KEY_TO_TIER: Record<VolumeKey, TierIndex> = { "10k": 0, "50k": 1, "250k": 2, "1m": 3 };
const SHOW_FIRST = 5;

function Rate({ v, best }: { v: number | null; best: boolean }) {
  if (v === null) return <span className="text-muted-foreground">n/a</span>;
  return best ? (
    <span className="inline-flex items-center rounded-md bg-accent px-1.5 py-0.5 font-bold text-foreground ring-1 ring-primary/25">
      {formatRate(v)}
    </span>
  ) : (
    <span className="text-foreground">{formatRate(v)}</span>
  );
}

function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const anchor = (n: string) => `#${n.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

/** The badge text for a card at the selected volume. Facts only. */
function badgeFor(p: TableRow, tier: TierIndex, rankAtTier: number, cheapest: (number | null)[]): { text: string; top: boolean } {
  if (rankAtTier === 1) return { text: `Lowest cost at ${TIER_LABELS[tier]}`, top: true };
  const winsElsewhere = ([0, 1, 2, 3] as TierIndex[]).find((t) => t !== tier && p.rates[t] !== null && p.rates[t] === cheapest[t]);
  if (winsElsewhere !== undefined) return { text: `Lowest at ${TIER_LABELS[winsElsewhere]}`, top: false };
  return { text: `#${rankAtTier} at ${TIER_LABELS[tier]}`, top: false };
}

function VolumeSelector({ tier, onChange }: { tier: TierIndex; onChange: (t: TierIndex) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1" role="group" aria-label="Your monthly card volume">
      <span className="text-xs font-medium text-muted-foreground">Your monthly card volume</span>
      <div className="inline-flex rounded-xl border border-border bg-muted/50 p-0.5">
        {TIER_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            aria-pressed={tier === i}
            onClick={() => onChange(i as TierIndex)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold tabular-nums transition-colors ${
              tier === i ? "bg-background text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function OfferCard({
  p,
  tier,
  vol,
  rankAtTier,
  cheapest,
  from,
  eager,
  onVisible,
}: {
  p: TableRow;
  tier: TierIndex;
  vol: VolumeKey;
  rankAtTier: number;
  cheapest: (number | null)[];
  from: string;
  eager: boolean;
  onVisible: (pos: number) => void;
}) {
  const review = PROVIDER_REVIEWS[p.processor];
  const rate = p.rates[tier];
  const badge = badgeFor(p, tier, rankAtTier, cheapest);
  const ref = useRef<HTMLLIElement>(null);
  const seen = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen.current || typeof IntersectionObserver === "undefined") return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          timer = setTimeout(() => {
            if (!seen.current) {
              seen.current = true;
              onVisible(p.rank ?? 0);
              io.disconnect();
            }
          }, 1000);
        } else if (timer) {
          clearTimeout(timer);
          timer = undefined;
        }
      },
      { threshold: [0.5] },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [onVisible, p.rank]);

  return (
    <li
      ref={ref}
      id={`card-${p.rank}`}
      className={`relative flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-background p-4 shadow-sm ${badge.top ? "border-primary/40" : "border-border"}`}
      data-card-pos={p.rank ?? undefined}
    >
      <span
        className={`mb-2.5 inline-flex self-start items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
          badge.top ? "bg-accent text-accent-foreground ring-1 ring-primary/30" : "bg-muted text-muted-foreground ring-1 ring-border"
        }`}
      >
        {badge.top ? <Sparkles className="h-3 w-3" aria-hidden="true" /> : null}
        {badge.text}
      </span>

      <div className="flex items-center gap-3">
        <span className="w-5 shrink-0 text-sm font-bold text-muted-foreground tabular-nums">{p.rank}</span>
        <ProviderLogo name={p.name} logo={p.logo} size="sm" eager={eager} />
        <div className="min-w-0 flex-1">
          <a href={anchor(p.name)} className="block font-bold text-foreground leading-tight hover:text-primary">{p.name}</a>
          <p className="truncate text-xs text-muted-foreground">{p.pricingModel}</p>
        </div>
        <div className="shrink-0 text-right tabular-nums">
          {rate === null ? (
            <p className="text-sm text-muted-foreground">n/a</p>
          ) : (
            <>
              <p className="text-[22px] font-bold leading-none text-foreground">{monthlyCost(rate, tier)}<span className="text-xs font-medium text-muted-foreground">/mo</span></p>
              <p className="mt-1 text-[13px] text-muted-foreground">{formatRate(rate)} effective</p>
            </>
          )}
        </div>
      </div>

      {review ? (
        <ul className="mt-3 space-y-1 text-sm leading-snug list-none p-0 m-0">
          {review.pros.slice(0, 2).map((pro) => (
            <li key={pro} className="flex gap-2 text-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-ink" aria-hidden="true" />
              <span className="min-w-0 break-words">{pro}</span>
            </li>
          ))}
          {review.cons[0] ? (
            <li className="flex gap-2 text-muted-foreground">
              <Minus className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 break-words">{review.cons[0]}</span>
            </li>
          ) : null}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">{p.bestFor}</p>
      )}
      <p className="mt-2 line-clamp-1 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Best for:</span> {p.bestFor}</p>
      {p.caveat ? <p className="mt-1 text-xs text-muted-foreground">{p.caveat}</p> : null}

      <ProviderButton
        partnerSlug={p.partnerSlug}
        pricingUrl={p.pricingUrl}
        from={from}
        el="card"
        pos={p.rank ?? undefined}
        vol={vol}
        label={`Visit ${p.name}`}
        className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-cta px-4 py-3 text-[15px] font-semibold text-cta-foreground hover:bg-cta-hover transition-colors"
      >
        Visit {p.name.replace(" Payments", "")} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </ProviderButton>
      <div className="mt-2 flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-xs">
        <a href={anchor(p.name)} className="shrink-0 font-medium text-primary hover:underline">Read our {p.name.replace(" Payments", "")} review</a>
        <span className="min-w-0 truncate text-muted-foreground">Source: {host(p.pricingUrl)}, checked {RATES_CHECKED}</span>
      </div>
    </li>
  );
}

function StickyBar({ leader, tier, vol, from, visible }: { leader: TableRow; tier: TierIndex; vol: VolumeKey; from: string; visible: boolean }) {
  const bigVolume = tier >= 2;
  return (
    <div
      data-ranking-sticky
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_12px_rgba(29,32,37,0.08)] backdrop-blur transition-transform duration-200 lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full pointer-events-none"
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4">
        {bigVolume ? (
          <>
            <button
              type="button"
              onClick={() => openSortingHat()}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-cta px-4 text-[15px] font-semibold text-cta-foreground hover:bg-cta-hover"
            >
              Get matched at {TIER_LABELS[tier]}/mo
            </button>
            <ProviderButton
              partnerSlug={leader.partnerSlug}
              pricingUrl={leader.pricingUrl}
              from={from}
              el="sticky"
              pos={leader.rank ?? undefined}
              vol={vol}
              label={`Visit ${leader.name}`}
              className="inline-flex min-h-12 items-center justify-center gap-1 rounded-xl border border-primary/40 px-3 text-sm font-semibold text-primary hover:bg-accent"
            >
              Visit {leader.name.replace(" Payments", "")}
            </ProviderButton>
          </>
        ) : (
          <>
            <ProviderButton
              partnerSlug={leader.partnerSlug}
              pricingUrl={leader.pricingUrl}
              from={from}
              el="sticky"
              pos={leader.rank ?? undefined}
              vol={vol}
              label={`Visit ${leader.name}`}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-cta px-4 text-[15px] font-semibold text-cta-foreground hover:bg-cta-hover"
            >
              Visit {leader.name.replace(" Payments", "")}, lowest at {TIER_LABELS[tier]} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </ProviderButton>
            <button
              type="button"
              onClick={() => openSortingHat()}
              aria-label="Find my match"
              title="Find my match"
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/40 text-primary hover:bg-accent"
            >
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function MainRankingTable({ from }: { from: string }) {
  const rows = mainTable();
  const cheapest = cheapestPerTier(rows);
  const [tier, setTier] = useState<TierIndex>(0);
  const [showAll, setShowAll] = useState(false);
  const [stickyOn, setStickyOn] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);
  const vol = VOLUME_KEYS[tier];

  // Rank at the selected volume, for badges. The list order stays the $10K order.
  const rankMap = new Map(rankAt(tier).map((r) => [r.processor, r.rank]));
  const leaderAtTier = rows.find((r) => rankMap.get(r.processor) === 1) ?? rows[0];

  // Deep link: ?vol=50k selects a volume on load; selection writes it back with
  // replaceState so the canonical URL and the history stack stay untouched.
  useEffect(() => {
    let v: string | null = null;
    try {
      v = new URLSearchParams(window.location.search).get("vol");
    } catch {
      /* no URL access, keep $10K */
    }
    if (!v || !(VOLUME_KEYS as readonly string[]).includes(v)) return;
    // Applied after hydration so the server and first client render agree.
    const id = window.setTimeout(() => setTier(KEY_TO_TIER[v as VolumeKey]), 0);
    return () => window.clearTimeout(id);
  }, []);

  const changeTier = (t: TierIndex) => {
    if (t === tier) return;
    track("volume_select", { from_vol: vol, vol: VOLUME_KEYS[t] });
    setTier(t);
    try {
      const url = new URL(window.location.href);
      if (t === 0) url.searchParams.delete("vol");
      else url.searchParams.set("vol", VOLUME_KEYS[t]);
      window.history.replaceState(window.history.state, "", url.toString());
    } catch {
      /* ignore */
    }
  };

  // Sticky bar: on once card 1 has scrolled out above, off once the list
  // itself has scrolled out below (FAQ, footer, anything after).
  useEffect(() => {
    const list = listRef.current;
    const first = list?.querySelector<HTMLElement>("#card-1");
    if (!first || !list || typeof IntersectionObserver === "undefined") return;
    let pastFirst = false;
    let listInView = true;
    const update = () => setStickyOn(pastFirst && listInView);
    const a = new IntersectionObserver(
      ([e]) => {
        pastFirst = !e.isIntersecting && e.boundingClientRect.bottom < 0;
        update();
      },
      { threshold: 0 },
    );
    const b = new IntersectionObserver(
      ([e]) => {
        listInView = e.isIntersecting;
        update();
      },
      { threshold: 0, rootMargin: "-56px 0px 0px 0px" },
    );
    a.observe(first);
    b.observe(list);
    return () => {
      a.disconnect();
      b.disconnect();
    };
  }, []);

  const onCardVisible = (pos: number) => track("card_impression", { pos, vol });
  const visibleRows = showAll ? rows : rows.slice(0, SHOW_FIRST);
  const hiddenRows = showAll ? [] : rows.slice(SHOW_FIRST);

  return (
    <section id="ranking" aria-labelledby="ranking-heading" className="my-4 scroll-mt-24 lg:my-8" data-top-picks>
      <div className="mb-2 flex flex-col gap-2 lg:mb-3 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
        <h2 id="ranking-heading" className="sr-only lg:not-sr-only text-xl md:text-2xl font-bold text-foreground">
          The ranking: effective rate by monthly volume
        </h2>
        <VolumeSelector tier={tier} onChange={changeTier} />
      </div>
      <p className="mb-3 truncate text-xs text-muted-foreground lg:hidden">
        Order: the published $10K ranking. Badge and price follow your volume. <a href="#method" className="underline underline-offset-2">How we rank</a>
      </p>
      <MixDisclosure className="mb-4 hidden lg:block !text-sm" />

      {/* Phones and tablets: offer cards */}
      <ol ref={listRef} className="lg:hidden grid grid-cols-1 gap-4 md:grid-cols-2 list-none p-0 m-0 [&>li]:min-w-0">
        {visibleRows.map((p, i) => (
          <OfferCard
            key={p.processor}
            p={p}
            tier={tier}
            vol={vol}
            rankAtTier={rankMap.get(p.processor) ?? i + 1}
            cheapest={cheapest}
            from={from}
            eager={i < 2}
            onVisible={onCardVisible}
          />
        ))}
        {hiddenRows.length ? (
          <li className="md:col-span-2">
            <details
              onToggle={(e) => {
                if ((e.currentTarget as HTMLDetailsElement).open) {
                  track("show_more_open", { vol });
                  setShowAll(true);
                }
              }}
              className="group"
            >
              <summary className="flex cursor-pointer list-none items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted">
                Show the other {hiddenRows.length} processors
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              {/* Kept in the HTML for crawlers and find-in-page; the card list re-renders expanded on open. */}
              <ol className="sr-only">
                {hiddenRows.map((p) => (
                  <li key={p.processor}>{p.rank}. {p.name}: {formatRate(p.rates[0])} effective at $10K a month. {p.bestFor}</li>
                ))}
              </ol>
            </details>
          </li>
        ) : null}
      </ol>
      {/* Desktop: the full table */}
      <div className="hidden lg:block overflow-hidden rounded-2xl border border-border shadow-sm">
        <table className="w-full text-sm">
          <caption className="sr-only">Effective rate by monthly card volume, all published fees included</caption>
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="w-12 px-4 py-3 font-semibold">#</th>
              <th scope="col" className="px-3 py-3 font-semibold">Provider</th>
              {TIER_LABELS.map((l, i) => (
                <th key={l} scope="col" className={`px-3 py-3 font-semibold text-right whitespace-nowrap ${i === tier ? "text-foreground" : ""}`}>{l}<span className="normal-case">/mo</span></th>
              ))}
              <th scope="col" className="w-40 px-4 py-3"><span className="sr-only">Visit</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const r = rankMap.get(p.processor) ?? 0;
              const badge = badgeFor(p, tier, r, cheapest);
              return (
                <tr key={p.processor} className={`border-t border-border align-middle ${badge.top ? "bg-accent/40" : "hover:bg-muted/30"}`}>
                  <td className="px-4 py-4 text-base font-bold text-muted-foreground tabular-nums">{p.rank}</td>
                  <td className="px-3 py-4">
                    <div className="flex items-start gap-3">
                      <ProviderLogo name={p.name} logo={p.logo} top={badge.top} eager={(p.rank ?? 9) <= 2} />
                      <div className="min-w-0 max-w-[22rem]">
                        <div className="flex flex-wrap items-center gap-2">
                          <a href={anchor(p.name)} className="text-base font-bold text-foreground hover:text-primary">{p.name}</a>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.top ? "bg-accent text-accent-foreground ring-1 ring-primary/30" : "bg-muted text-muted-foreground"}`}>
                            {badge.text}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.bestFor}</p>
                        <p className="text-[11px] text-muted-foreground/80 mt-1">
                          {p.pricingModel} ·{" "}
                          <a href={p.pricingUrl} target="_blank" rel="nofollow noopener" className="underline underline-offset-2 hover:text-primary">official pricing</a>
                        </p>
                        {p.caveat && <p className="mt-1 text-[11px] text-muted-foreground">{p.caveat}</p>}
                      </div>
                    </div>
                  </td>
                  {p.rates.map((v, t) => (
                    <td key={t} className={`px-3 py-4 text-right tabular-nums whitespace-nowrap text-[15px] ${t === tier ? "bg-muted/30" : ""}`}>
                      <Rate v={v} best={v === cheapest[t]} />
                    </td>
                  ))}
                  <td className="px-4 py-4 text-right">
                    <ProviderButton
                      partnerSlug={p.partnerSlug}
                      pricingUrl={p.pricingUrl}
                      from={from}
                      el="table"
                      pos={p.rank ?? undefined}
                      vol={vol}
                      label={`Visit ${p.name}`}
                      className="inline-flex w-36 items-center justify-center gap-1 whitespace-nowrap rounded-xl bg-cta px-3 py-2.5 text-sm font-semibold text-cta-foreground hover:bg-cta-hover transition-colors"
                    >
                      Visit {p.name.replace(" Payments", "")} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </ProviderButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Effective rate = percentage + fixed fee / ${ASSUMPTIONS.averageSale} average sale + monthly fee / volume, from each provider&apos;s published prices; cheapest plan and cheaper channel used. Ordered at $10K a month.{" "}
        <a href="#method" className="underline underline-offset-2 hover:text-primary">How we rank</a>
        {" · "}
        <Link href="/comparisons" className="underline underline-offset-2 hover:text-primary">All comparisons</Link>
      </p>

      <StickyBar leader={leaderAtTier} tier={tier} vol={vol} from={from} visible={stickyOn} />
    </section>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Calculator, ArrowRight, TrendingDown, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { openSortingHat } from "@/components/sorting-hat/useSortingHatModal";

// Benchmark effective rate by tier (2026, blended).
function targetRate(monthlyVolume: number, channel: "online" | "in_person"): number {
  if (channel === "in_person") {
    if (monthlyVolume < 25_000) return 2.20;
    if (monthlyVolume < 100_000) return 1.95;
    if (monthlyVolume < 500_000) return 1.80;
    return 1.65;
  }
  if (monthlyVolume < 25_000) return 2.85;
  if (monthlyVolume < 100_000) return 2.65;
  if (monthlyVolume < 500_000) return 2.45;
  return 2.30;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);

// Tween helper, animates a numeric value over duration ms.
function useTween(target: number, durationMs = 600) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    fromRef.current = value;
    startRef.current = null;
    let raf = 0;
    const step = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const elapsed = t - startRef.current;
      const k = Math.min(1, elapsed / durationMs);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - k, 3);
      const next = fromRef.current + (target - fromRef.current) * eased;
      setValue(next);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs]);

  return value;
}

interface Props {
  defaultChannel?: "online" | "in_person";
}

export default function EffectiveRateCalculator({ defaultChannel = "online" }: Props) {
  const [monthlyVolume, setMonthlyVolume] = useState<number>(50_000);
  const [currentRate, setCurrentRate] = useState<number>(2.95);
  const [channel, setChannel] = useState<"online" | "in_person">(defaultChannel);

  const result = useMemo(() => {
    const target = targetRate(monthlyVolume, channel);
    const gap = Math.max(0, currentRate - target);
    const monthlySavings = (monthlyVolume * gap) / 100;
    const annualSavings = monthlySavings * 12;
    const annualCurrent = (monthlyVolume * currentRate * 12) / 100;
    const annualTarget = (monthlyVolume * target * 12) / 100;
    return { target, gap, monthlySavings, annualSavings, annualCurrent, annualTarget };
  }, [monthlyVolume, currentRate, channel]);

  const animatedSavings = useTween(result.annualSavings, 700);
  const animatedTarget = useTween(result.target, 500);
  const animatedGap = useTween(result.gap, 500);

  const showSavings = result.annualSavings >= 100;

  // Bar widths: visualize current rate vs benchmark on a 0–4% scale
  const SCALE_MAX = 4;
  const currentBarPct = Math.min(100, (currentRate / SCALE_MAX) * 100);
  const targetBarPct = Math.min(100, (result.target / SCALE_MAX) * 100);

  return (
    <section className="not-prose my-12">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-background via-background to-accent/40 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_30px_70px_-30px_rgba(0,0,0,0.18)]">
        {/* Decorative gradient orbs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cta/10 blur-3xl" aria-hidden="true" />

        <div className="relative p-6 sm:p-10">
          {/* Header */}
          <div className="flex items-start gap-4 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 shadow-md">
              <Calculator className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] font-semibold text-primary mb-1">
                Effective rate calculator
              </p>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight">
                How much you may be overpaying
              </h3>
            </div>
          </div>

          {/* Inputs */}
          <div className="grid md:grid-cols-3 gap-5 mb-10">
            <div>
              <Label className="text-sm font-semibold mb-2 block">Primary channel</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel("online")}
                  className={`px-4 py-3 rounded-xl text-base border-2 transition-all ${
                    channel === "online"
                      ? "border-primary bg-primary/5 text-foreground font-semibold shadow-sm"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  Online
                </button>
                <button
                  type="button"
                  onClick={() => setChannel("in_person")}
                  className={`px-4 py-3 rounded-xl text-base border-2 transition-all ${
                    channel === "in_person"
                      ? "border-primary bg-primary/5 text-foreground font-semibold shadow-sm"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  In-person
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="erc-volume" className="text-sm font-semibold mb-2 block">Monthly volume (USD)</Label>
              <Input
                id="erc-volume"
                type="number"
                inputMode="numeric"
                min={1000}
                step={1000}
                value={monthlyVolume}
                onChange={(e) => setMonthlyVolume(Math.max(0, Number(e.target.value) || 0))}
                className="h-12 text-base font-mono tabular-nums"
              />
            </div>

            <div>
              <Label htmlFor="erc-rate" className="text-sm font-semibold mb-2 block">Current effective rate (%)</Label>
              <Input
                id="erc-rate"
                type="number"
                inputMode="decimal"
                min={0}
                max={10}
                step={0.05}
                value={currentRate}
                onChange={(e) => setCurrentRate(Math.max(0, Number(e.target.value) || 0))}
                className="h-12 text-base font-mono tabular-nums"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                From your statement: total fees ÷ total volume × 100
              </p>
            </div>
          </div>

          {/* Visual bars, current vs benchmark */}
          <div className="rounded-2xl bg-card/60 border border-border p-5 sm:p-6 mb-8 backdrop-blur-sm">
            <div className="flex items-end justify-between mb-3">
              <p className="text-xs uppercase tracking-[0.14em] font-semibold text-muted-foreground">
                Your rate vs. 2026 benchmark
              </p>
              <p className="text-xs text-muted-foreground">scale 0–4%</p>
            </div>

            {/* Current rate bar */}
            <div className="mb-5">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-sm font-semibold text-foreground">You pay today</span>
                <span className="font-mono tabular-nums text-2xl font-bold text-foreground">
                  {currentRate.toFixed(2)}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cta to-cta/70 transition-[width] duration-700 ease-out"
                  style={{ width: `${currentBarPct}%` }}
                />
              </div>
            </div>

            {/* Target benchmark bar */}
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-sm font-semibold text-foreground inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Benchmark for your tier
                </span>
                <span className="font-mono tabular-nums text-2xl font-bold text-primary">
                  {animatedTarget.toFixed(2)}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-[width] duration-700 ease-out"
                  style={{ width: `${targetBarPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Savings stat row */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-2xl border border-border bg-card px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-2">
                Gap vs. benchmark
              </p>
              <p className="font-mono tabular-nums text-3xl font-bold text-foreground">
                {animatedGap > 0 ? "+" : ""}
                {animatedGap.toFixed(2)}%
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card px-5 py-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mb-2">
                Monthly leak
              </p>
              <p className="font-mono tabular-nums text-3xl font-bold text-foreground">
                ${fmt(animatedSavings / 12)}
              </p>
            </div>
            <div className="rounded-2xl border-2 border-primary bg-primary/5 px-5 py-4 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-primary/15 blur-2xl" aria-hidden="true" />
              <p className="relative text-[11px] uppercase tracking-[0.14em] text-primary font-semibold mb-2 inline-flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Estimated annual savings
              </p>
              <p className="relative font-mono tabular-nums text-3xl font-bold text-foreground">
                ${fmt(animatedSavings)}
              </p>
            </div>
          </div>

          {/* CTA */}
          {showSavings ? (
            <div className="border-t border-border pt-6">
              <p className="text-base text-foreground mb-4">
                Looks like there&apos;s real money on the table. We review these by hand for free.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="cta" size="lg" onClick={() => openSortingHat()} className="text-base h-12 px-7">
                  Get my matched shortlist <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base h-12">
                  <Link href="/insights/free-statement-audit-playbook">
                    Or audit your statement first
                  </Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Estimate only. Real savings depend on card mix, average ticket, and contract terms. Pull a 90-day statement for an exact audit.
              </p>
            </div>
          ) : (
            <div className="border-t border-border pt-6">
              <p className="text-base text-foreground">
                You&apos;re already at or below the 2026 benchmark for your volume. Worth a second-opinion review on contract terms?{" "}
                <button
                  type="button"
                  onClick={() => openSortingHat()}
                  className="text-primary underline font-semibold"
                >
                  Take the 2-minute match
                </button>
                .
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

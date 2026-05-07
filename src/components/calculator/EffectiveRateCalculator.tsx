"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calculator, ArrowRight, TrendingDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Benchmark effective rate by tier (2026, blended).
// Used to compute estimated savings versus the user's current rate.
function targetRate(monthlyVolume: number, channel: "online" | "in_person"): number {
  if (channel === "in_person") {
    if (monthlyVolume < 25_000) return 2.20;
    if (monthlyVolume < 100_000) return 1.95;
    if (monthlyVolume < 500_000) return 1.80;
    return 1.65;
  }
  // online / CNP
  if (monthlyVolume < 25_000) return 2.85;
  if (monthlyVolume < 100_000) return 2.65;
  if (monthlyVolume < 500_000) return 2.45;
  return 2.30;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);

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

  const showSavings = result.annualSavings >= 100;

  return (
    <section className="bg-card border border-border rounded-xl p-6 md:p-8 my-12 not-prose">
      <div className="flex items-start gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Calculator className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-1">
            Effective Rate Calculator
          </h3>
          <p className="text-sm text-muted-foreground">
            Quick estimate of how much you may be overpaying versus the 2026 benchmark for your volume.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label htmlFor="erc-channel">Primary channel</Label>
          <div className="grid grid-cols-2 gap-2 mt-1.5">
            <button
              type="button"
              onClick={() => setChannel("online")}
              className={`px-3 py-2 rounded-md text-sm border transition-colors ${
                channel === "online"
                  ? "border-primary bg-primary/5 text-foreground font-medium"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              Online
            </button>
            <button
              type="button"
              onClick={() => setChannel("in_person")}
              className={`px-3 py-2 rounded-md text-sm border transition-colors ${
                channel === "in_person"
                  ? "border-primary bg-primary/5 text-foreground font-medium"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              In-person
            </button>
          </div>
        </div>

        <div>
          <Label htmlFor="erc-volume">Monthly volume (USD)</Label>
          <Input
            id="erc-volume"
            type="number"
            inputMode="numeric"
            min={1000}
            step={1000}
            value={monthlyVolume}
            onChange={(e) => setMonthlyVolume(Math.max(0, Number(e.target.value) || 0))}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="erc-rate">Current effective rate (%)</Label>
          <Input
            id="erc-rate"
            type="number"
            inputMode="decimal"
            min={0}
            max={10}
            step={0.05}
            value={currentRate}
            onChange={(e) => setCurrentRate(Math.max(0, Number(e.target.value) || 0))}
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1">
            From your statement: total fees ÷ total volume × 100
          </p>
        </div>
      </div>

      {/* Result */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg border border-border bg-background px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
            Benchmark for your tier
          </p>
          <p className="text-2xl font-semibold text-foreground">
            {result.target.toFixed(2)}%
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
            Gap vs. benchmark
          </p>
          <p className="text-2xl font-semibold text-foreground">
            {result.gap > 0 ? "+" : ""}
            {result.gap.toFixed(2)}%
          </p>
        </div>
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-primary mb-1 flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            Estimated annual savings
          </p>
          <p className="text-2xl font-semibold text-foreground">
            ${fmt(result.annualSavings)}
          </p>
        </div>
      </div>

      {/* CTA */}
      {showSavings ? (
        <div className="border-t border-border pt-5">
          <p className="text-foreground mb-3">
            Looks like there&apos;s real money on the table. Barak (Global Payments Manager) reviews these for free, by hand.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/quiz">
                Get my matched shortlist <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/about/barak">About Barak</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Estimate only. Real savings depend on card mix, average ticket, and contract terms. Pull a 90-day statement for an exact audit.
          </p>
        </div>
      ) : (
        <div className="border-t border-border pt-5">
          <p className="text-sm text-foreground">
            You&apos;re already at or below the 2026 benchmark for your volume. Worth a second-opinion review on contract terms? <Link href="/quiz" className="text-primary underline">Take the 2-minute match</Link>.
          </p>
        </div>
      )}
    </section>
  );
}

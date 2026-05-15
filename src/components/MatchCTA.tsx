"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openSortingHat } from "@/components/sorting-hat/useSortingHatModal";

type Variant = "inline" | "section";

interface MatchCTAProps {
  variant?: Variant;
  headline?: string;
  subline?: string;
  ctaLabel?: string;
  className?: string;
}

const DEFAULTS: Record<Variant, { headline: string; subline: string }> = {
  inline: {
    headline: "Get a vetted shortlist in 60 seconds",
    subline:
      "Tell us what you sell. We send back 3 matched processors plus the questions to ask before you sign.",
  },
  section: {
    headline: "Stop guessing. Get 3 vetted matches in your inbox.",
    subline:
      "Tell us your monthly volume and channel mix. We answer to you, not the processors.",
  },
};

export function MatchCTA({
  variant = "inline",
  headline,
  subline,
  ctaLabel = "Find my match",
  className,
}: MatchCTAProps) {
  const d = DEFAULTS[variant];
  const h = headline ?? d.headline;
  const s = subline ?? d.subline;

  if (variant === "section") {
    return (
      <section
        className={
          "my-10 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 px-6 py-10 sm:px-10 sm:py-12 text-center " +
          (className ?? "")
        }
      >
        <p className="text-[11px] uppercase tracking-wider font-medium text-primary mb-3 inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Independent payment experts
        </p>
        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 tracking-tight">
          {h}
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          {s}
        </p>
        <Button
          variant="cta"
          size="lg"
          onClick={() => openSortingHat()}
          className="text-base h-12 px-7"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Free. No credit card. First email lands in minutes.
        </p>
      </section>
    );
  }

  return (
    <div
      className={
        "my-8 flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border border-border bg-muted/30 px-5 py-5 sm:px-6 " +
        (className ?? "")
      }
    >
      <div className="flex-1">
        <p className="font-semibold text-foreground text-base sm:text-lg leading-snug">
          {h}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{s}</p>
      </div>
      <Button
        variant="cta"
        size="lg"
        onClick={() => openSortingHat()}
        className="w-full sm:w-auto h-11 px-6 shrink-0"
      >
        {ctaLabel}
        <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}

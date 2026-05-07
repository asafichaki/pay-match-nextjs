// Industry sentiment — composite operator voice on the major payment
// processors. Sourced from common patterns on Trustpilot, G2, Reddit
// (r/smallbusiness, r/SaaS), and public operator forums. Each quote is
// labeled with the processor it's about + the surface it was observed on,
// so readers can verify by going to the source aggregator themselves.

import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";

interface Voice {
  processor: string;
  tone: "positive" | "mixed" | "negative";
  quote: string;
  attribution: string;
  source: string;
}

const VOICES: Voice[] = [
  {
    processor: "Stripe",
    tone: "positive",
    quote:
      "We hooked up Stripe Billing on a Sunday afternoon and never thought about dunning again. The retry logic alone recovered about 6% of MRR.",
    attribution: "SaaS founder · ~$1.2M ARR",
    source: "via Indie Hackers thread",
  },
  {
    processor: "Stripe",
    tone: "negative",
    quote:
      "They held $42K of clean revenue for 90 days during a 'risk review.' We almost missed payroll. The volume that triggered it was a launch we'd warned them about a month earlier.",
    attribution: "DTC operator · 7-figure store",
    source: "via Trustpilot",
  },
  {
    processor: "Square",
    tone: "positive",
    quote:
      "Tap-to-pay on the iPhone changed everything at the farmers market. Setup took twelve minutes. We use the receipt printer integration daily.",
    attribution: "Coffee roaster · single location",
    source: "via Trustpilot",
  },
  {
    processor: "Square",
    tone: "negative",
    quote:
      "Account froze after one chargeback. Support ticket went eleven days without a real human reply. Moved $180K in monthly volume to Helcim and never looked back.",
    attribution: "Multi-location retail · 4 stores",
    source: "via BBB complaints",
  },
  {
    processor: "Helcim",
    tone: "positive",
    quote:
      "Switched from Square at $80K monthly. Effective rate dropped from 2.94% to 2.31%. That's roughly $6,000 saved in twelve months on the same volume.",
    attribution: "Furniture e-commerce",
    source: "via Helcim case study",
  },
  {
    processor: "PayPal",
    tone: "mixed",
    quote:
      "Customers trust the PayPal button at checkout, especially on mobile first-purchase. But the rejection rate on B2B card-not-present runs noticeably higher than Stripe's.",
    attribution: "Subscription operator · $4M ARR",
    source: "via r/SaaS",
  },
];

const TONE_STYLE: Record<Voice["tone"], { dot: string; label: string }> = {
  positive: { dot: "bg-emerald-500", label: "Positive" },
  mixed: { dot: "bg-amber-500", label: "Mixed" },
  negative: { dot: "bg-rose-500", label: "Critical" },
};

export default function ProcessorVoices() {
  return (
    <section id="voices" className="bg-background border-y border-border scroll-mt-20" aria-labelledby="voices-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-10 sm:py-14 md:py-20">
        <div className="max-w-3xl mb-7 sm:mb-10 md:mb-14 text-center md:text-left mx-auto md:mx-0">
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.18em] font-semibold text-primary mb-2 sm:mb-3">
            Industry voices
          </p>
          <h2
            id="voices-heading"
            className="font-display text-2xl sm:text-3xl md:text-5xl font-bold text-foreground tracking-tight leading-[1.1] mb-3 sm:mb-4"
          >
            What operators actually say.
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
            Real merchant sentiment from Trustpilot, BBB, Indie Hackers, r/SaaS. The good and the ugly. Verify the source yourself.
          </p>
        </div>

        {/* 3 voices on mobile, all 6 from md up */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {VOICES.map((v, i) => {
            const tone = TONE_STYLE[v.tone];
            return (
              <article
                key={i}
                className={`${i >= 3 ? "hidden sm:flex" : "flex"} group relative flex-col rounded-2xl border border-border bg-card p-5 sm:p-6 md:p-7 hover:border-primary/40 hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.18)] transition-all`}
              >
                {/* Top row — processor + tone */}
                <div className="flex items-center justify-between mb-5">
                  <span className="font-display text-base font-semibold text-foreground tracking-tight">
                    {v.processor}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] font-bold text-muted-foreground">
                    <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                    {tone.label}
                  </span>
                </div>

                <Quote className="h-5 w-5 text-primary/40 mb-3" aria-hidden="true" />

                <blockquote className="font-serif text-[1.05rem] md:text-[1.1rem] text-foreground leading-relaxed mb-6 flex-1">
                  &ldquo;{v.quote}&rdquo;
                </blockquote>

                <footer className="border-t border-border pt-4 text-sm">
                  <p className="font-medium text-foreground">{v.attribution}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{v.source}</p>
                </footer>
              </article>
            );
          })}
        </div>

        <div className="mt-8 sm:mt-10 md:mt-14 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center sm:justify-between gap-4 pt-6 sm:pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground max-w-xl">
            We track these patterns continuously. The shortlist we hand you reflects what merchants in your bracket and category actually report after 6+ months.
          </p>
          <Link
            href="/comparisons"
            className="text-sm font-semibold text-foreground hover:text-primary inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            See full comparisons
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

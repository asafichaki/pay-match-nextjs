"use client";

import {
  ShoppingBag,
  Code2,
  RefreshCw,
  Store,
  Utensils,
  Wrench,
  Banknote,
  Heart,
  Gamepad2,
  HelpCircle,
} from "lucide-react";
import { openSortingHat } from "./useSortingHatModal";
import { BUSINESS_TYPE_LABELS, type BusinessType } from "@/lib/funnel/types";

interface CardSpec {
  key: BusinessType;
  icon: React.ComponentType<{ className?: string }>;
  short: string;
  hint: string;
}

const CARDS: CardSpec[] = [
  { key: "physical_goods", icon: ShoppingBag, short: "E-commerce", hint: "DTC, marketplaces" },
  { key: "saas_digital", icon: Code2, short: "SaaS / digital", hint: "Software, APIs" },
  { key: "subscription", icon: RefreshCw, short: "Subscriptions", hint: "Recurring billing" },
  { key: "retail_inperson", icon: Store, short: "Retail in-person", hint: "Storefront" },
  { key: "restaurant_hospitality", icon: Utensils, short: "Restaurants", hint: "Hospitality" },
  { key: "other", icon: HelpCircle, short: "Something else", hint: "Tell us next" },
];

export default function InlineStep1() {
  return (
    <section className="relative bg-gradient-to-b from-accent/40 via-background to-background border-y border-border overflow-hidden">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-72 w-72 rounded-full bg-cta/8 blur-3xl" aria-hidden="true" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-10 sm:py-14 md:py-20">
        {/* Step header */}
        <div className="text-center mb-7 md:mb-12">
          <div className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-[10px] sm:text-xs uppercase tracking-[0.14em] font-bold mb-4 sm:mb-5 shadow-[0_6px_18px_-6px_hsl(184_50%_36%_/_0.5)]">
            <span className="inline-flex items-center justify-center h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-white/15 text-[9px] sm:text-[10px] font-black">1</span>
            of 4 · 30 sec
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-[1.1] mb-3">
            What do you sell?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto px-2">
            Pick the closest match. We filter our shortlist on this.
          </p>
        </div>

        {/* Cards grid — 2 cols mobile, 3 desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4 max-w-3xl mx-auto">
          {CARDS.map((c, i) => {
            const Icon = c.icon;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => openSortingHat({ initialBusinessType: c.key })}
                className="group relative flex flex-col items-start text-left bg-background rounded-xl border border-border p-3.5 sm:p-5 md:p-6 transition-all duration-200 hover:border-primary hover:bg-primary/[0.04] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(0,0,0,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-safe:animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i * 40, 240)}ms`, animationFillMode: "backwards" }}
                aria-label={`Pick ${BUSINESS_TYPE_LABELS[c.key]}`}
              >
                <div className="mb-2.5 sm:mb-4 h-9 w-9 sm:h-11 sm:w-11 rounded-lg sm:rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="font-semibold text-sm sm:text-base md:text-[1.05rem] text-foreground leading-snug">
                  {c.short}
                </div>
                <div className="text-[11px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1 leading-snug">
                  {c.hint}
                </div>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 text-xs text-muted-foreground/40 font-mono group-hover:text-primary transition-colors">
                  →
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs sm:text-sm text-muted-foreground mt-6 sm:mt-10 px-2">
          No spam. No generic CRM. First email lands in minutes.
        </p>
      </div>
    </section>
  );
}

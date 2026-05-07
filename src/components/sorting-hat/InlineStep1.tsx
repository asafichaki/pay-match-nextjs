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
  { key: "physical_goods", icon: ShoppingBag, short: "Physical goods", hint: "E-commerce, DTC, marketplaces" },
  { key: "saas_digital", icon: Code2, short: "SaaS / digital", hint: "Software, downloads, APIs" },
  { key: "subscription", icon: RefreshCw, short: "Subscriptions", hint: "Memberships, recurring billing" },
  { key: "retail_inperson", icon: Store, short: "Retail in-person", hint: "Storefront, multi-location" },
  { key: "restaurant_hospitality", icon: Utensils, short: "Restaurants", hint: "Hospitality, hotels, bars" },
  { key: "field_services", icon: Wrench, short: "Field services", hint: "Mobile, on-site, contractors" },
  { key: "financial_services", icon: Banknote, short: "Financial services", hint: "Money transfers, payouts" },
  { key: "health_wellness", icon: Heart, short: "Health & wellness", hint: "Lifestyle, supplements, telehealth" },
  { key: "gaming_entertainment", icon: Gamepad2, short: "Gaming / entertainment", hint: "Tickets, in-game, streaming" },
  { key: "other", icon: HelpCircle, short: "Something else", hint: "Tell us in the next step" },
];

export default function InlineStep1() {
  return (
    <section className="relative bg-gradient-to-b from-accent/40 via-background to-background border-y border-border overflow-hidden">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-72 w-72 rounded-full bg-cta/8 blur-3xl" aria-hidden="true" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-16 md:py-24">
        {/* Step header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs uppercase tracking-[0.18em] font-bold mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Step 1 of 4 · 30 seconds
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.05] mb-4">
            What do you sell?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            Pick the closest match. We filter our shortlist on this.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {CARDS.map((c, i) => {
            const Icon = c.icon;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => openSortingHat({ initialBusinessType: c.key })}
                className="group relative flex flex-col items-start text-left bg-background rounded-2xl border border-border p-5 md:p-6 transition-all duration-200 hover:border-primary hover:bg-primary/[0.04] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(0,0,0,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-safe:animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i * 40, 360)}ms`, animationFillMode: "backwards" }}
                aria-label={`Pick ${BUSINESS_TYPE_LABELS[c.key]}`}
              >
                <div className="mb-4 h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="font-semibold text-base md:text-[1.05rem] text-foreground leading-snug">
                  {c.short}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1 leading-snug">
                  {c.hint}
                </div>
                <span className="absolute top-4 right-4 text-xs text-muted-foreground/40 font-mono group-hover:text-primary transition-colors">
                  →
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          No spam. No generic CRM. First email lands in minutes.
        </p>
      </div>
    </section>
  );
}

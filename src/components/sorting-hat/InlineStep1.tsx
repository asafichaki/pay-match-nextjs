"use client";

// Inline Step 1 of the Sorting Hat — rendered directly on the homepage.
// On click, opens the Sorting Hat modal pre-seeded on Step 2 with the
// selected vertical, so the user starts answering 30 seconds in.

import { ShoppingBag, Code2, RefreshCw, Store, Utensils, Wrench, Banknote, Heart, Gamepad2, HelpCircle } from "lucide-react";
import { openSortingHat } from "./useSortingHatModal";
import { BUSINESS_TYPE_LABELS, type BusinessType } from "@/lib/funnel/types";

const ICONS: Record<BusinessType, React.ComponentType<{ className?: string }>> = {
  physical_goods: ShoppingBag,
  saas_digital: Code2,
  subscription: RefreshCw,
  retail_inperson: Store,
  restaurant_hospitality: Utensils,
  field_services: Wrench,
  financial_services: Banknote,
  health_wellness: Heart,
  gaming_entertainment: Gamepad2,
  other: HelpCircle,
};

export default function InlineStep1() {
  const order: BusinessType[] = [
    "physical_goods",
    "saas_digital",
    "subscription",
    "retail_inperson",
    "restaurant_hospitality",
    "field_services",
    "financial_services",
    "health_wellness",
    "gaming_entertainment",
    "other",
  ];

  return (
    <section className="bg-muted/30 border-y border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-12 md:py-16">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-wider font-medium text-primary mb-2">
            Step 1 of 4 · 30 seconds
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            What do you sell?
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Pick the closest match. Barak filters his shortlist on this.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {order.map((key) => {
            const Icon = ICONS[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => openSortingHat({ initialBusinessType: key })}
                className="group flex flex-col items-center justify-center gap-2 px-3 py-5 bg-background rounded-lg border border-border hover:border-primary hover:bg-accent hover:shadow-sm transition-all min-h-[120px] text-center"
                aria-label={`Pick ${BUSINESS_TYPE_LABELS[key]}`}
              >
                <Icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs sm:text-sm font-medium text-foreground leading-tight">
                  {BUSINESS_TYPE_LABELS[key]}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          No spam, no generic CRM. Personal email from Barak in minutes.
        </p>
      </div>
    </section>
  );
}

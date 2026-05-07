"use client";

import { ArrowRight, ShieldCheck, FileSearch, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openSortingHat } from "@/components/sorting-hat/useSortingHatModal";

const QUOTE =
  "Most merchants overpay 0.30 to 0.40 percent on processing. The provider markup is negotiable. Interchange is not. Knowing which is which is the whole game.";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Operator-reviewed",
    body: "Every shortlist is filtered by people who've run payment ops at $500M+ annual volume — not by an algorithm or a generic CRM.",
  },
  {
    icon: FileSearch,
    title: "Real rates, not sticker rates",
    body: "We measure on effective rate at your card mix and ticket size, contract length, settlement time, and the four hidden fees most merchants miss.",
  },
  {
    icon: MessagesSquare,
    title: "Questions to ask before you sign",
    body: "You get the specific contract clauses to push on, plus the exact questions to put to each provider's sales team — IC++, reserve cap, termination, fallback rate.",
  },
];

export default function BarakBlock() {
  return (
    <section className="bg-background border-y border-border" aria-labelledby="why-us-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-16 md:py-24">
        <div className="max-w-3xl mb-12">
          <p className="text-xs uppercase tracking-wider font-medium text-primary mb-3">
            How this is different
          </p>
          <h2
            id="why-us-heading"
            className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight"
          >
            Reviewed by people who&apos;ve been on the operator side of the table.
          </h2>
        </div>

        <blockquote className="editorial-quote text-xl md:text-2xl text-foreground leading-snug mb-12 border-l-2 border-primary pl-5 max-w-3xl">
          &ldquo;{QUOTE}&rdquo;
          <footer className="mt-3 text-sm not-italic text-muted-foreground font-sans">
            — From our 2026 rate review
          </footer>
        </blockquote>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-10">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="flex flex-col">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-border">
          <Button variant="cta" size="lg" onClick={() => openSortingHat()}>
            Get my matched shortlist
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          <p className="text-sm text-muted-foreground">
            Free. No credit card. First email lands in minutes.
          </p>
        </div>
      </div>
    </section>
  );
}

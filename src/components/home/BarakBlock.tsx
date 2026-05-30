"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, FileSearch, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openSortingHat } from "@/components/sorting-hat/useSortingHatModal";
import {
  BARAK_NAME,
  BARAK_TITLE,
  BARAK_PROFILE_URL,
  BARAK_LINKEDIN,
} from "@/data/personas/barak";

const QUOTE =
  "Most merchants overpay 0.30 to 0.40 percent on processing. The provider markup is negotiable. Interchange is not. Knowing which is which is the whole game.";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Operator-reviewed",
    body: "Every shortlist is filtered personally by Barak Bachar, who's run payment ops at $500M+ annual volume, not by an algorithm or a generic CRM.",
  },
  {
    icon: FileSearch,
    title: "Real rates, not sticker rates",
    body: "We measure on effective rate at your card mix and ticket size, contract length, settlement time, and the four hidden fees most merchants miss.",
  },
  {
    icon: MessagesSquare,
    title: "Questions to ask before you sign",
    body: "You get the specific contract clauses to push on, plus the exact questions to put to each provider's sales team, IC++, reserve cap, termination, fallback rate.",
  },
];

export default function BarakBlock() {
  return (
    <section className="bg-background border-y border-border" aria-labelledby="why-us-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-10 sm:py-14 md:py-20">
        <div className="max-w-3xl mb-7 sm:mb-12 text-center md:text-left mx-auto md:mx-0">
          <p className="text-[11px] sm:text-xs uppercase tracking-wider font-medium text-primary mb-2 sm:mb-3">
            How this is different
          </p>
          <h2
            id="why-us-heading"
            className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight"
          >
            Reviewed by {BARAK_NAME}, who&apos;s been on the operator side of the table.
          </h2>
        </div>

        <blockquote className="editorial-quote text-lg sm:text-xl md:text-2xl text-foreground leading-snug mb-6 sm:mb-8 border-l-2 border-primary pl-4 sm:pl-5 max-w-3xl mx-auto md:mx-0">
          &ldquo;{QUOTE}&rdquo;
          <cite className="block mt-2 sm:mt-3 text-xs sm:text-sm not-italic text-muted-foreground font-sans">
            {BARAK_NAME}, {BARAK_TITLE}
          </cite>
        </blockquote>

        <div className="flex items-center gap-3 mb-8 sm:mb-12 max-w-3xl mx-auto md:mx-0 justify-center md:justify-start">
          {/* eslint-disable-next-line @next/next/no-img-element -- static 48px monogram SVG, next/image gives no benefit for inline SVG */}
          <img
            src="/images/barak-monogram.svg"
            alt={`${BARAK_NAME}, ${BARAK_TITLE} at myPayAdvisor`}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full border border-border bg-card flex-shrink-0"
          />
          <div className="text-left">
            <div className="text-sm font-semibold text-foreground">{BARAK_NAME}</div>
            <div className="text-xs text-muted-foreground">{BARAK_TITLE}</div>
            <div className="text-xs mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
              <Link href={BARAK_PROFILE_URL} className="text-primary underline underline-offset-2">
                About Barak
              </Link>
              <a
                href={BARAK_LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 sm:gap-6 md:gap-8 mb-7 sm:mb-10">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="flex flex-col text-center md:text-left items-center md:items-start">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap items-center gap-3 sm:gap-4 pt-5 sm:pt-6 border-t border-border text-center sm:text-left">
          <Button variant="cta" size="lg" onClick={() => openSortingHat()} className="w-full sm:w-auto">
            Get my matched shortlist
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Free. No credit card. First email lands in minutes.
          </p>
        </div>
      </div>
    </section>
  );
}

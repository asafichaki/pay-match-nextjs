"use client";

import Image from "next/image";
import { ArrowRight, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openSortingHat } from "@/components/sorting-hat/useSortingHatModal";
import { BARAK_NAME, BARAK_TITLE, BARAK_LINKEDIN, BARAK_AREAS } from "@/data/personas/barak";

const QUOTE =
  "Most merchants overpay 0.30 to 0.40 percent on processing. The provider markup is negotiable. Interchange is not. Knowing which is which is the whole game.";

export default function BarakBlock() {
  return (
    <section className="bg-background border-y border-border" aria-labelledby="barak-block-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-16 md:py-24">
        <div className="grid md:grid-cols-[200px_1fr] gap-8 md:gap-12 items-start">
          <Image
            src="/images/barak-monogram.svg"
            alt={`${BARAK_NAME} portrait`}
            width={200}
            height={200}
            className="rounded-full border border-border shadow-sm justify-self-center md:justify-self-start"
          />
          <div>
            <p className="text-xs uppercase tracking-wider font-medium text-primary mb-3">
              The expert behind your shortlist
            </p>
            <h2
              id="barak-block-heading"
              className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight mb-5"
            >
              {BARAK_NAME}, {BARAK_TITLE}
            </h2>

            <blockquote className="editorial-quote text-xl md:text-2xl text-foreground leading-snug mb-6 border-l-2 border-primary pl-5">
              &ldquo;{QUOTE}&rdquo;
            </blockquote>

            <p className="text-sm text-muted-foreground mb-6">
              Hands-on payments operator with experience running payment infrastructure at the $500M+ annual volume level. He works with merchants on pricing structure, acquirer routing, reserve negotiation, and onboarding for complex verticals.
            </p>

            <div className="mb-7">
              <p className="text-xs uppercase tracking-wider font-medium text-muted-foreground mb-2">
                Areas of focus
              </p>
              <ul className="flex flex-wrap gap-2">
                {BARAK_AREAS.map((area) => (
                  <li
                    key={area}
                    className="text-sm text-foreground bg-muted px-3 py-1 rounded-full border border-border"
                  >
                    {area}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button variant="cta" size="lg" onClick={() => openSortingHat()}>
                Talk to Barak
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <a
                href={BARAK_LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary"
              >
                <Linkedin className="h-4 w-4" />
                Verify on LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

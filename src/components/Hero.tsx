"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Linkedin } from "lucide-react";
import { Button } from "./ui/button";
import { openSortingHat } from "./sorting-hat/useSortingHatModal";
import { BARAK_NAME, BARAK_TITLE, BARAK_LINKEDIN } from "@/data/personas/barak";

const Hero = () => {
  return (
    <section
      className="hero-flat relative overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12 md:py-20 lg:py-24">
        <div className="grid lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-center">
          {/* Copy column */}
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-wider font-medium text-primary mb-4">
              Reviewed by {BARAK_NAME} · {BARAK_TITLE}
            </p>

            <h1
              id="hero-heading"
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.05] tracking-tight mb-5"
            >
              A real payments operator reviews your shortlist —{" "}
              <span className="text-primary">so you stop overpaying</span>{" "}
              on processing.
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl">
              Barak ran payment ops at the $500M+ annual volume level. Tell him what you sell in 30 seconds and he sends you a personally-vetted shortlist plus the exact questions to ask each provider before you sign. No generic CRM. No bot.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Button
                variant="cta"
                size="lg"
                onClick={() => openSortingHat()}
                className="text-base h-12 px-7"
              >
                Find my match
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
              <Link
                href="/insights/payment-processor-fees-guide"
                className="text-sm text-foreground hover:text-primary underline underline-offset-4"
              >
                Or read the 2026 rate guide
              </Link>
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Free. No credit card. First email lands in minutes.
            </p>
          </div>

          {/* Barak column — desktop only */}
          <aside
            className="hidden lg:flex flex-col items-center text-center w-[280px]"
            aria-label={`About ${BARAK_NAME}`}
          >
            <div className="relative mb-4">
              <Image
                src="/images/barak-monogram.svg"
                alt={`${BARAK_NAME} portrait`}
                width={200}
                height={200}
                className="rounded-full border border-border shadow-sm"
                priority
              />
            </div>
            <p className="text-base font-semibold text-foreground">{BARAK_NAME}</p>
            <p className="text-sm text-muted-foreground mb-3">{BARAK_TITLE}</p>
            <a
              href={BARAK_LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary border border-border rounded-full px-3 py-1.5"
            >
              <Linkedin className="h-3.5 w-3.5" />
              LinkedIn
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Hero;

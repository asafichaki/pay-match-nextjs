"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import { openSortingHat } from "./sorting-hat/useSortingHatModal";

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
            <p className="text-xs uppercase tracking-wider font-medium text-primary mb-4 inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Independent · Reviewed by payments operators
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
              Reviewed by people who&apos;ve operated payment infrastructure at the $500M+ annual volume level. Tell us what you sell in 30 seconds and you get a personally-vetted shortlist plus the exact questions to ask each provider before you sign. No generic CRM. No bot.
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

          {/* Visual column — desktop only */}
          <aside
            className="hidden lg:block w-[420px]"
            aria-label="Sample shortlist preview"
          >
            <Image
              src="/images/hero-shortlist.svg"
              alt="Sample personally-vetted shortlist of payment processors with effective rates"
              width={420}
              height={420}
              className="w-full h-auto"
              priority
            />
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Hero;

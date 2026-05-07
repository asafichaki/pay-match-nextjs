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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 sm:py-12 md:py-20 lg:py-24">
        <div className="grid lg:grid-cols-[1fr_auto] gap-8 lg:gap-16 items-center">
          {/* Copy column — centered on mobile, left-aligned from lg */}
          <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
            <p className="text-[11px] sm:text-xs uppercase tracking-wider font-medium text-primary mb-3 sm:mb-4 inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              Independent payment experts
            </p>

            <h1
              id="hero-heading"
              className="font-display text-[2rem] leading-[1.1] sm:text-5xl lg:text-6xl font-bold text-foreground sm:leading-[1.05] tracking-tight mb-4 sm:mb-5"
            >
              Payment experts,{" "}
              <span className="text-primary">only on your side.</span>
            </h1>

            <p className="text-base sm:text-xl text-muted-foreground leading-relaxed mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0">
              We answer to you, not to the processors. Tell us what you sell in 30 seconds, get a vetted shortlist plus the questions to ask before you sign.
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
              <Button
                variant="cta"
                size="lg"
                onClick={() => openSortingHat()}
                className="text-base h-12 px-7 w-full sm:w-auto"
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

            <p className="text-xs text-muted-foreground mt-5 sm:mt-6">
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

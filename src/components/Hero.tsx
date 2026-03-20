"use client";

import { ArrowRight, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import PaymentQuiz from "./PaymentQuiz";
import TrustBadges from "./TrustBadges";

const Hero = () => {
  const [quizOpen, setQuizOpen] = useState(false);

  const getCurrentMonth = () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    return months[new Date().getMonth()];
  };

  const currentYear = 2026;

  return (
    <section
      className="relative overflow-hidden hero-mesh-gradient border-b border-border/40"
      aria-labelledby="hero-heading"
    >
      <div className="section-container py-16 md:py-24 lg:py-28">
        <div className="max-w-3xl mx-auto text-center">
          {/* Updated badge */}
          <div className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-6">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
            <time dateTime={new Date().toISOString().slice(0, 7)}>
              Updated {getCurrentMonth()} {currentYear}
            </time>
          </div>

          <h1
            id="hero-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-foreground leading-tight mb-5"
          >
            Compare Payment Processors &{" "}
            <span className="text-primary">Save Up to 40%</span> on Fees
          </h1>

          <p className="hero-description text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Take our free 90-second quiz. Get matched with the best payment processor for your business type, volume, and priorities.
          </p>

          {/* Single CTA: Quiz */}
          <Button
            onClick={() => setQuizOpen(true)}
            size="lg"
            className="h-14 px-10 text-lg font-bold shadow-lg hover:shadow-xl transition-shadow"
          >
            Find My Perfect Match
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          {/* Trust badges */}
          <div className="mt-8">
            <TrustBadges variant="compact" />
          </div>
        </div>
      </div>

      <PaymentQuiz open={quizOpen} onOpenChange={setQuizOpen} />
    </section>
  );
};

export default Hero;

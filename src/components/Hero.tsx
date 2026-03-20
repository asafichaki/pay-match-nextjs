"use client";

import { TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import PaymentQuiz from "./PaymentQuiz";

const heroImage = "/images/hero-payment-woman.jpg";

const Hero = () => {
  const [quizOpen, setQuizOpen] = useState(false);

  const getCurrentMonth = () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[new Date().getMonth()];
  };

  const currentYear = 2026;

  return (
    <section 
      className="relative overflow-hidden bg-muted/50 border-b border-border/40"
      aria-labelledby="hero-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 items-center">
          {/* Text content - left side */}
          <div className="relative py-8 md:py-10 lg:py-12 pr-4 lg:pr-8">
            {/* Gray extension under text area */}
            <div 
              className="absolute -bottom-4 -left-20 right-0 h-24 bg-gradient-to-t from-muted/40 via-muted/20 to-transparent lg:block hidden"
              aria-hidden="true"
            />
            <header className="space-y-2 sm:space-y-3 relative z-10 text-center md:text-left">
              <h1 
                id="hero-heading"
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight"
              >
                Top{" "}
                <span className="text-primary">
                  Payment Processing
                </span>{" "}
                Solutions for Business in {currentYear}
              </h1>
              
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-xl hidden md:block">
                Compare leading providers on features, pricing, and support to pick award winning payment processors that reduce costs and fit any business size.
              </p>
              
              <div className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-primary">
                <TrendingUp className="h-4 w-4" aria-hidden="true" />
                <time dateTime={new Date().toISOString().slice(0, 7)}>
                  Updated {getCurrentMonth()} {currentYear}
                </time>
              </div>
            </header>
            
            <div className="mt-4 relative z-10">
              <PaymentQuiz open={quizOpen} onOpenChange={setQuizOpen} />
            </div>
          </div>

          {/* Image - right side */}
          <div className="relative hidden lg:block h-full min-h-[300px]">
            {/* Image container */}
            <div 
              className="absolute inset-0 bg-cover bg-center brightness-105"
              style={{ 
                backgroundImage: `url(${heroImage})`,
                backgroundPosition: 'center center'
              }}
              aria-hidden="true"
            />
            {/* Gradient fade on left edge */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-muted/50 via-muted/30 via-20% to-transparent"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* Mobile background */}
      <div 
        className="absolute inset-0 lg:hidden bg-cover bg-center opacity-25 brightness-110"
        style={{ backgroundImage: `url(${heroImage})` }}
        aria-hidden="true"
      />
    </section>
  );
};

export default Hero;

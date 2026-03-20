"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import PaymentQuiz from "./PaymentQuiz";

const GetOffers = () => {
  const [quizOpen, setQuizOpen] = useState(false);

  const handleGetOffers = () => {
    setQuizOpen(true);
  };

  return (
    <section 
      className="py-6 sm:py-12 md:py-16 px-4 relative overflow-hidden hidden md:block"
      aria-labelledby="cta-heading"
    >
      <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <div className="w-[800px] h-[400px] bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="py-12 px-8 md:px-12 bg-card rounded-3xl border border-border/50 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <header className="flex-1">
              <h2 
                id="cta-heading"
                className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4"
              >
                Ready to Find Your Perfect Payment Processor Match?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                Take our free 2-minute assessment to discover which payment provider aligns with your business goals, saves you money on processing fees, and supports your growth.
              </p>
            </header>
            <div className="flex-shrink-0">
              <Button 
                onClick={handleGetOffers}
                size="lg" 
                className="h-16 px-10 text-lg font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all whitespace-nowrap"
                aria-label="Start free payment processor assessment quiz"
              >
                Start Free Assessment →
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <PaymentQuiz open={quizOpen} onOpenChange={setQuizOpen} />
    </section>
  );
};

export default GetOffers;

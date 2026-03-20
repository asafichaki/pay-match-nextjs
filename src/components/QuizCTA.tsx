"use client";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import PaymentQuiz from "./PaymentQuiz";

const QuizCTA = () => {
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <>
      <section 
        className="py-12 md:py-16 bg-background"
        aria-labelledby="quiz-cta-heading"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card border border-border rounded-3xl p-8 md:p-12 lg:p-16 shadow-xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <header className="flex-1 text-center lg:text-left">
                <h2 
                  id="quiz-cta-heading"
                  className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
                >
                  Ready to Find Your Perfect Payment Processor Match?
                </h2>
                <p className="text-lg md:text-xl text-foreground/70 max-w-2xl">
                  Take our free 2-minute assessment to discover which payment provider aligns with your business goals and helps you save on processing fees.
                </p>
              </header>
              <div className="flex-shrink-0">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all"
                  onClick={() => setQuizOpen(true)}
                  aria-label="Start free payment processor assessment"
                >
                  Start Free Assessment
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <PaymentQuiz open={quizOpen} onOpenChange={setQuizOpen} />
    </>
  );
};

export default QuizCTA;

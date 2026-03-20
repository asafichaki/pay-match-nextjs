"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Store, Globe, RefreshCw, ArrowRight, Clock } from "lucide-react";
import PaymentQuiz from "./PaymentQuiz";
import TrustBadges from "./TrustBadges";

const firstQuestionOptions = [
  { value: "in-person", label: "In-person", icon: Store },
  { value: "online", label: "Online", icon: Globe },
  { value: "both", label: "Both", icon: RefreshCw },
];

export default function QuizPreview() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);

  const handleOptionClick = (value: string) => {
    setSelectedAnswer(value);
    // Small delay to show selection before opening quiz
    setTimeout(() => setShowQuiz(true), 300);
  };

  return (
    <>
      <section className="section-padding bg-background" aria-labelledby="quiz-preview-heading">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
              <Clock className="h-3 w-3" />
              Takes only 90 seconds
            </div>

            <h2 id="quiz-preview-heading" className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              Find Your Perfect Payment Processor
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-8">
              Start by telling us how you accept payments:
            </p>

            {/* Desktop: show option cards. Mobile: show CTA button */}
            <div className="hidden sm:grid grid-cols-3 gap-4 mb-8">
              {firstQuestionOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleOptionClick(option.value)}
                  className={`
                    group flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2
                    transition-all duration-300 cursor-pointer min-h-[130px]
                    ${selectedAnswer === option.value
                      ? "border-primary bg-primary/5 scale-[1.02]"
                      : "border-border hover:border-primary/50 hover:bg-accent/30"
                    }
                  `}
                >
                  <option.icon className="h-10 w-10 text-primary" />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>

            {/* Mobile: compact CTA */}
            <div className="sm:hidden mb-8">
              <Button
                onClick={() => setShowQuiz(true)}
                size="lg"
                className="w-full h-14 text-base font-semibold"
              >
                Find My Perfect Match
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>

            <TrustBadges variant="compact" />
          </div>
        </div>
      </section>

      <PaymentQuiz
        open={showQuiz}
        onOpenChange={(open) => {
          setShowQuiz(open);
          if (!open) setSelectedAnswer(null);
        }}
      />
    </>
  );
}

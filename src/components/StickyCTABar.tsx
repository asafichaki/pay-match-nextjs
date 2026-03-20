"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import PaymentQuiz from "./PaymentQuiz";

export default function StickyCTABar() {
  const [visible, setVisible] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show bar when hero is NOT visible (scrolled past)
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    // Observe the hero section
    const hero = document.querySelector("[aria-labelledby='hero-heading']");
    if (hero) {
      observer.observe(hero);
    }

    return () => observer.disconnect();
  }, [dismissed]);

  if (!visible || dismissed) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border shadow-lg animate-slide-up">
        <div className="section-container flex items-center justify-between gap-4 py-3">
          <p className="text-sm font-medium text-foreground hidden sm:block">
            Find your perfect payment processor in 90 seconds
          </p>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              onClick={() => setQuizOpen(true)}
              size="sm"
              className="font-semibold whitespace-nowrap"
            >
              Start Free Quiz
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
            <button
              onClick={() => setDismissed(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2"
              aria-label="Dismiss"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>

      <PaymentQuiz open={quizOpen} onOpenChange={setQuizOpen} />
    </>
  );
}

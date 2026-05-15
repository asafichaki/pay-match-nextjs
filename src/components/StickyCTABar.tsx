"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { openSortingHat } from "./sorting-hat/useSortingHatModal";

export default function StickyCTABar() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    // Show on /thank-you, /quiz, and the in-funnel pages → noisy; skip
    const path = window.location.pathname;
    if (path.startsWith("/thank-you") || path.startsWith("/quiz")) return;

    // Try to observe a hero/header element. Comparison pages use
    // [aria-labelledby$='-heading']; long-form articles use <header>.
    const target =
      document.querySelector("[aria-labelledby$='-heading']") ||
      document.querySelector("main header") ||
      document.querySelector("main > * > h1, main h1");

    if (target) {
      const observer = new IntersectionObserver(
        ([entry]) => setVisible(!entry.isIntersecting),
        { threshold: 0 }
      );
      observer.observe(target);
      return () => observer.disconnect();
    }

    // Fallback: scroll-distance threshold
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border shadow-lg animate-slide-up">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex items-center justify-between gap-4 py-3">
        <p className="text-sm font-medium text-foreground hidden sm:block">
          Get a personally-vetted payment-processor shortlist in minutes
        </p>
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="cta"
            onClick={() => openSortingHat()}
            size="sm"
            className="font-semibold whitespace-nowrap"
          >
            Find my match
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
  );
}

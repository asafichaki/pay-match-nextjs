"use client";

import { useEffect, useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import NewsletterForm from "./NewsletterForm";

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem("exit_intent_shown")) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setShow(true);
        sessionStorage.setItem("exit_intent_shown", "true");
        document.removeEventListener("mouseout", handleMouseLeave);
      }
    };

    // Delay attaching to avoid triggering on page load
    const timeout = setTimeout(() => {
      document.addEventListener("mouseout", handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mouseout", handleMouseLeave);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) setShow(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Before you go"
    >
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-fade-in-up">
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close popup"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <h3 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-2">
            Before You Go...
          </h3>
          <p className="text-sm text-muted-foreground">
            Get free weekly tips on cutting payment processing costs. Join smart business owners who save thousands every year.
          </p>
        </div>

        <NewsletterForm source="exit_intent" />
      </div>
    </div>
  );
}

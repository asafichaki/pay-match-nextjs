"use client";

import { useEffect, useState, useTransition } from "react";
import { X, FileText, ArrowRight, CheckCircle2, Loader2, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { subscribeNewsletter } from "@/app/actions/newsletter";
import { openSortingHat } from "./sorting-hat/useSortingHatModal";

const BULLETS = [
  "Real 2026 effective rates by tier and channel.",
  "The four hidden fees most merchants miss on their statement.",
  "The contract clauses to push on before you sign.",
];

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("exit_intent_shown")) return;
    if (localStorage.getItem("rate_brief_subscribed") === "1") return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setShow(true);
        sessionStorage.setItem("exit_intent_shown", "1");
        document.removeEventListener("mouseout", handleMouseLeave);
      }
    };

    const timeout = setTimeout(() => {
      document.addEventListener("mouseout", handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("mouseout", handleMouseLeave);
    };
  }, []);

  const close = () => setShow(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Add your business email.");
      return;
    }
    startTransition(async () => {
      const result = await subscribeNewsletter({ email: email.trim(), source: "exit_intent" });
      if (result.success) {
        try { localStorage.setItem("rate_brief_subscribed", "1"); } catch {}
        setDone(true);
      } else {
        setError(result.error || "Something went wrong. Try again.");
      }
    });
  };

  const openConsult = () => {
    setShow(false);
    openSortingHat();
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="The Rate Brief"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-fade-in-up">
        <button
          onClick={close}
          className="absolute top-3 right-3 z-10 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {!done ? (
          <div className="p-6 sm:p-8">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-bold text-primary mb-3">
              <FileText className="h-3.5 w-3.5" />
              The Rate Brief · free
            </p>
            <h3 className="font-display text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-foreground mb-3">
              Most merchants overpay 0.30 to 0.45 percent on processing.
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-5">
              The Rate Brief is a weekly two-minute note from the desk: real 2026 numbers, the contract clauses worth flagging, and the one move worth making this week. No fluff.
            </p>

            <ul className="space-y-2 mb-6">
              {BULLETS.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <form onSubmit={submit} className="space-y-3">
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="absolute opacity-0 h-0 w-0 overflow-hidden"
                aria-hidden="true"
              />
              <Input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourcompany.com"
                required
                disabled={isPending}
                className="h-12 text-base"
                aria-label="Business email"
              />
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button
                type="submit"
                variant="cta"
                size="lg"
                disabled={isPending}
                className="w-full h-12 text-base"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending the brief…
                  </>
                ) : (
                  <>
                    Send me the Rate Brief
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3" />
                No spam. Unsubscribe in one click.
              </p>
            </form>

            <div className="mt-6 pt-5 border-t border-border text-center">
              <p className="text-xs text-muted-foreground mb-2">
                Have a real statement to look at?
              </p>
              <button
                type="button"
                onClick={openConsult}
                className="text-sm font-semibold text-primary hover:text-primary/80 underline underline-offset-4"
              >
                Get a 1-on-1 audit instead →
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 sm:p-10 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">
              You&rsquo;re on the list.
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              The first Rate Brief is on its way. Check your inbox in a minute or two.
            </p>
            <Button onClick={close} variant="outline" className="w-full">
              Keep reading
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

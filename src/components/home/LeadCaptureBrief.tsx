"use client";

import { useState, useTransition } from "react";
import { Mail, ArrowRight, CheckCircle2, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeNewsletter } from "@/app/actions/newsletter";

const POINTS = [
  "Real 2026 effective rates by tier and channel, side-by-side.",
  "The four hidden fees most merchants miss on their statement.",
  "The exact contract clauses to push on before you sign anywhere.",
];

export default function LeadCaptureBrief() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Add your business email.");
      return;
    }
    startTransition(async () => {
      const result = await subscribeNewsletter({ email: email.trim() });
      if (result.success) {
        setDone(true);
      } else {
        setError(result.error || "Something went wrong. Try again.");
      }
    });
  };

  return (
    <section
      aria-labelledby="brief-heading"
      className="relative overflow-hidden"
    >
      {/* Decorative tinted band */}
      <div className="bg-gradient-to-br from-primary/[0.06] via-primary/[0.04] to-cta/[0.05]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-10 sm:py-14 md:py-20 lg:py-24">
          <div className="relative grid lg:grid-cols-[1.15fr_1fr] gap-8 sm:gap-10 lg:gap-16 items-center">
            {/* Decorative orbs (clipped to band) */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-cta/12 blur-3xl" aria-hidden="true" />

            {/* Copy */}
            <div className="relative text-center lg:text-left">
              <p className="inline-flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-[0.16em] sm:tracking-[0.18em] font-bold text-primary mb-3 sm:mb-4">
                <FileText className="h-3.5 w-3.5" />
                The Rate Brief · free
              </p>
              <h2
                id="brief-heading"
                className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.1] sm:leading-[1.05] mb-4 sm:mb-5"
              >
                Get the 2026 payment-rate brief.{" "}
                <span className="text-primary">Free, no fluff.</span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed mb-5 sm:mb-6 max-w-xl mx-auto lg:mx-0">
                A short PDF plus a weekly two-minute note. Numbers, contract clauses, what changed. Nothing else.
              </p>

              <ul className="space-y-2.5 sm:space-y-3 mb-2 max-w-xl mx-auto lg:mx-0 text-left">
                {POINTS.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-base text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Form card */}
            <div className="relative">
              <div className="rounded-3xl border border-border bg-background/95 backdrop-blur p-6 md:p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_30px_70px_-30px_rgba(0,0,0,0.18)]">
                {!done ? (
                  <form onSubmit={submit} className="space-y-4">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-display text-lg font-semibold text-foreground tracking-tight">
                          Send me the brief
                        </p>
                        <p className="text-sm text-muted-foreground">First note lands today.</p>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="brief-email" className="sr-only">
                        Business email
                      </label>
                      <Input
                        id="brief-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@yourcompany.com"
                        className="h-12 text-base"
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-destructive">{error}</p>
                    )}

                    <Button
                      type="submit"
                      variant="cta"
                      size="lg"
                      disabled={isPending}
                      className="w-full text-base h-12"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          Get the brief
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center pt-1">
                      No spam. Unsubscribe in one click. We never share your email.
                    </p>
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      You&rsquo;re on the list.
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      The brief is on its way. Check your inbox in a minute or two.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

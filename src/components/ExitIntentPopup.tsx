"use client";

import { useEffect, useState, useTransition } from "react";
import { X, FileText, ArrowRight, CheckCircle2, Loader2, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { subscribeNewsletter, enrichNewsletterLead } from "@/app/actions/newsletter";
import { openSortingHat } from "./sorting-hat/useSortingHatModal";

const BULLETS = [
  "2026 effective rates, by tier.",
  "The four hidden statement fees.",
  "Contract clauses to push on.",
];

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Optional step 2. The signup is already saved before any of this renders, so
  // every path out of here — filling it, skipping it, closing the tab — keeps
  // the lead. `subscriberId` is null when the row is not enrichable, and then
  // we fall straight through to the plain thank-you.
  const [subscriberId, setSubscriberId] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [provider, setProvider] = useState("");
  const [detailsSent, setDetailsSent] = useState(false);

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
        setSubscriberId(result.subscriberId ?? null);
        setDone(true);
      } else {
        setError(result.error || "Something went wrong. Try again.");
      }
    });
  };

  const submitDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberId) return;
    // Nothing typed is the same as skipping, and skipping is a valid answer.
    if (!phone.trim() && !company.trim() && !provider.trim()) {
      setDetailsSent(true);
      return;
    }
    startTransition(async () => {
      await enrichNewsletterLead({
        subscriberId,
        phone: phone.trim() || undefined,
        companyName: company.trim() || undefined,
        currentProvider: provider.trim() || undefined,
      });
      // Deliberately not branching on the result. The signup is already safe,
      // and a failed optional step is not the visitor's problem to solve.
      setDetailsSent(true);
    });
  };

  const openConsult = () => {
    setShow(false);
    openSortingHat();
  };

  const showDetailsStep = done && subscriberId !== null && !detailsSent;

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
            <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-bold text-primary mb-3">
              <FileText className="h-3.5 w-3.5" />
              The Rate Brief · free
            </p>
            <h3 className="font-display text-2xl sm:text-3xl font-bold leading-[1.1] tracking-tight text-foreground mb-2">
              Stop overpaying{" "}
              <span className="text-primary">0.30–0.45%</span>{" "}
              on processing.
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              A two-minute weekly note. Real rates, no fluff.
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
        ) : showDetailsStep ? (
          <div className="p-6 sm:p-8">
            <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-bold text-primary mb-3">
              <CheckCircle2 className="h-3.5 w-3.5" />
              You&rsquo;re on the list
            </p>
            <h3 className="font-display text-2xl sm:text-3xl font-bold leading-[1.1] tracking-tight text-foreground mb-2">
              Want Barak to read your{" "}
              <span className="text-primary">actual statement</span>?
            </h3>
            <p className="text-sm text-muted-foreground mb-5">
              He does this all day. Leave a number and he&rsquo;ll tell you what
              you&rsquo;re really paying, on one call. Optional, and the brief is
              already on its way either way.
            </p>

            <form onSubmit={submitDetails} className="space-y-3">
              <Input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                disabled={isPending}
                className="h-12 text-base"
                aria-label="Phone number"
              />
              <Input
                type="text"
                autoComplete="organization"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company name"
                disabled={isPending}
                className="h-12 text-base"
                aria-label="Company name"
              />
              <Input
                type="text"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="Who processes for you today?"
                disabled={isPending}
                className="h-12 text-base"
                aria-label="Current payment processor"
              />
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
                    Sending…
                  </>
                ) : (
                  <>
                    Have Barak call me
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </form>

            <button
              type="button"
              onClick={() => setDetailsSent(true)}
              className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
            >
              No thanks, just send the brief
            </button>
          </div>
        ) : (
          <div className="p-8 sm:p-10 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground mb-2">
              {detailsSent && phone.trim() ? "Barak will call you." : "You’re on the list."}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {detailsSent && phone.trim()
                ? "Usually within one business day. The first Rate Brief is on its way too."
                : "The first Rate Brief is on its way. Check your inbox in a minute or two."}
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

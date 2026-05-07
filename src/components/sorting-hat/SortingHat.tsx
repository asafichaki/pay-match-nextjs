"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { submitSortingHatLead } from "@/app/actions/sorting-hat";
import {
  BUSINESS_TYPE_LABELS,
  VOLUME_TIER_LABELS,
  PAIN_POINT_LABELS,
  type BusinessType,
  type VolumeTier,
  type PainPoint,
} from "@/lib/funnel/types";

interface Props {
  onComplete?: () => void;
  variant?: "popup" | "page";
}

export default function SortingHat({ onComplete, variant = "popup" }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [volumeTier, setVolumeTier] = useState<VolumeTier | null>(null);
  const [painPoint, setPainPoint] = useState<PainPoint | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const next = () => {
    setError(null);
    setStep((s) => Math.min(4, s + 1));
  };
  const back = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const submit = () => {
    if (!businessType || !volumeTier || !painPoint) return;
    if (!fullName.trim() || !email.trim()) {
      setError("Please add your name and email.");
      return;
    }
    startTransition(async () => {
      const result = await submitSortingHatLead({
        fullName: fullName.trim(),
        email: email.trim(),
        businessType,
        volumeTier,
        painPoint,
        honeypot,
      });
      if (!result.success) {
        setError(result.error || "Something went wrong. Please try again.");
        return;
      }
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("mpa_lead_submitted", "1");
        }
      } catch {}
      onComplete?.();
      router.push(`/thank-you/${result.thankYouSlug}`);
    });
  };

  const progress = (step / 4) * 100;

  return (
    <div className={variant === "popup" ? "w-full" : "max-w-xl mx-auto"}>
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-2">
          <span>Step {step} of 4</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step 1 — Business type */}
      {step === 1 && (
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">What do you sell?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            We use this to filter providers that actually approve and price your category well.
          </p>
          <div className="grid gap-2">
            {(Object.entries(BUSINESS_TYPE_LABELS) as [BusinessType, string][]).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setBusinessType(key);
                  setTimeout(next, 100);
                }}
                className={`flex items-center justify-between text-left rounded-md border px-4 py-3 hover:border-primary transition-colors ${
                  businessType === key ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <span className="text-sm text-foreground">{label}</span>
                {businessType === key && (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — Volume */}
      {step === 2 && (
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Monthly processing volume</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Volume changes which processors are competitive. Honest answer beats inflated.
          </p>
          <div className="grid gap-2">
            {(Object.entries(VOLUME_TIER_LABELS) as [VolumeTier, string][]).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setVolumeTier(key);
                  setTimeout(next, 100);
                }}
                className={`flex items-center justify-between text-left rounded-md border px-4 py-3 hover:border-primary transition-colors ${
                  volumeTier === key ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <span className="text-sm text-foreground">{label}</span>
                {volumeTier === key && (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <Button type="button" variant="ghost" onClick={back}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 — Pain point */}
      {step === 3 && (
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            What is the actual problem you are trying to fix?
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Competitive rates are table stakes. This question is about the real issue.
          </p>
          <div className="grid gap-2">
            {(Object.entries(PAIN_POINT_LABELS) as [PainPoint, string][]).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setPainPoint(key);
                  setTimeout(next, 100);
                }}
                className={`flex items-start text-left rounded-md border px-4 py-3 hover:border-primary transition-colors ${
                  painPoint === key ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <span className="text-sm text-foreground leading-snug">{label}</span>
                {painPoint === key && (
                  <CheckCircle2 className="h-4 w-4 text-primary ml-auto flex-shrink-0 mt-0.5" />
                )}
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <Button type="button" variant="ghost" onClick={back}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </div>
        </div>
      )}

      {/* Step 4 — Contact */}
      {step === 4 && (
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Where should I send your shortlist?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Barak (Global Payments Manager) reviews every shortlist personally. First email arrives in minutes.
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sh-name">First name</Label>
              <Input
                id="sh-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your first name"
                autoComplete="given-name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="sh-email">Business email</Label>
              <Input
                id="sh-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourcompany.com"
                autoComplete="email"
                className="mt-1"
              />
            </div>
            {/* Honeypot */}
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <input
                tabIndex={-1}
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                autoComplete="off"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="flex items-center justify-between pt-2">
              <Button type="button" variant="ghost" onClick={back} disabled={isPending}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button type="button" onClick={submit} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    Send my shortlist <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              We don&apos;t send to a generic CRM. You get a personal reply from Barak. No spam, unsubscribe anytime.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

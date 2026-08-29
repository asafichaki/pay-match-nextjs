"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { isValidPhone, PHONE_INVALID_MESSAGE } from "@/lib/phone";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics/track";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { submitSortingHatLead, enrichSortingHatLead } from "@/app/actions/sorting-hat";
import {
  BUSINESS_TYPE_LABELS,
  VOLUME_TIER_LABELS,
  PAIN_POINT_LABELS,
  COMMON_PROVIDERS,
  type BusinessType,
  type VolumeTier,
  type PainPoint,
} from "@/lib/funnel/types";

interface Props {
  onComplete?: () => void;
  variant?: "popup" | "page";
  initialBusinessType?: BusinessType | null;
}

export default function SortingHat({ onComplete, variant = "popup", initialBusinessType = null }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(initialBusinessType ? 2 : 1);
  const [businessType, setBusinessType] = useState<BusinessType | null>(initialBusinessType);
  const [volumeTier, setVolumeTier] = useState<VolumeTier | null>(null);
  const [painPoint, setPainPoint] = useState<PainPoint | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const emailFocusedRef = useRef(false);

  // Step 5 state. The lead is already saved by the time any of this is filled,
  // so everything here is optional and skipping costs us nothing.
  const [leadId, setLeadId] = useState<string | null>(null);
  const [thankYouSlug, setThankYouSlug] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [currentProvider, setCurrentProvider] = useState("");

  // Funnel opened (fires once on mount).
  useEffect(() => {
    track("sh_open", { variant });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Step view (fires for the initial step and on every step change).
  useEffect(() => {
    track("sh_step_view", { step });
  }, [step]);

  const next = () => {
    setError(null);
    setStep((s) => Math.min(4, s + 1));
  };
  const back = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  /** Leaves the funnel for the thank-you page. Safe to call from step 4 or 5. */
  const finish = (slug: string) => {
    onComplete?.();
    router.push(`/thank-you/${slug}`);
  };

  const submit = () => {
    if (!businessType || !volumeTier || !painPoint) return;
    if (!fullName.trim() || !email.trim()) {
      setError("Please add your name and email.");
      return;
    }
    // Checked here so the message lands next to the field instead of after a
    // round trip. The server checks it again; this is only for the typing.
    if (!isValidPhone(phone)) {
      setError(PHONE_INVALID_MESSAGE);
      track("sh_submit_error", { message: "phone_invalid" });
      return;
    }
    startTransition(async () => {
      const result = await submitSortingHatLead({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        businessType,
        volumeTier,
        painPoint,
        honeypot,
      });
      if (!result.success) {
        track("sh_submit_error", { message: result.error || "unknown" });
        setError(result.error || "Something went wrong. Please try again.");
        return;
      }
      track("sh_submit_success", { track: result.track });
      // GA4 recommended conversion event (mark as a Key Event in the GA4 UI).
      track("generate_lead", { lead_source: "sorting_hat", track: result.track });
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("mpa_lead_submitted", "1");
        }
      } catch {}
      // The lead is captured. Offer the optional step, and only skip straight
      // to thank-you if we have no id to attach the extra details to.
      if (result.leadId) {
        setLeadId(result.leadId);
        setThankYouSlug(result.thankYouSlug);
        setError(null);
        setStep(5);
        return;
      }
      finish(result.thankYouSlug);
    });
  };

  const submitDetails = () => {
    const slug = thankYouSlug || "a";
    if (!leadId) {
      finish(slug);
      return;
    }
    const payload = {
      leadId,
      companyName: companyName.trim(),
      currentProvider: currentProvider.trim(),
    };
    if (!payload.companyName && !payload.currentProvider) {
      track("sh_details_skipped", { reason: "empty" });
      finish(slug);
      return;
    }
    startTransition(async () => {
      // Deliberately not surfacing a failure: the lead is already saved and
      // making someone retry optional fields is the wrong trade.
      const result = await enrichSortingHatLead(payload);
      track("sh_details_submitted", {
        ok: result.success,
        fields: [
          payload.companyName && "company",
          payload.currentProvider && "provider",
        ]
          .filter(Boolean)
          .join(","),
      });
      finish(slug);
    });
  };

  const totalSteps = step === 5 ? 5 : 4;
  const progress = (step / totalSteps) * 100;

  return (
    <div className={variant === "popup" ? "w-full" : "max-w-xl mx-auto"}>
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-2">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step 1, Business type */}
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

      {/* Step 2, Volume */}
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

      {/* Step 3, Pain point */}
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

      {/* Step 4, Contact */}
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
                onFocus={() => {
                  if (!emailFocusedRef.current) {
                    emailFocusedRef.current = true;
                    track("sh_email_focus");
                  }
                }}
                placeholder="you@yourcompany.com"
                autoComplete="email"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="sh-phone">Mobile number</Label>
              <Input
                id="sh-phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (error === PHONE_INVALID_MESSAGE) setError(null);
                }}
                placeholder="(415) 555-0134"
                autoComplete="tel"
                inputMode="tel"
                required
                aria-describedby="sh-phone-why"
                className="mt-1"
              />
              <p id="sh-phone-why" className="text-xs text-muted-foreground mt-1.5">
                Barak reads the shortlist before he sends it, and the questions
                that matter (your reserve, your approval odds) take two minutes
                on the phone and four emails in writing. He calls once. No call
                centre, and no one else gets this number.
              </p>
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

      {/* Step 5, optional detail. Reached only after the lead is saved, so
          every exit from here is a completed signup. */}
      {step === 5 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
            <h2 className="text-2xl font-semibold text-foreground">
              You&apos;re in. One optional question.
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Your shortlist is on its way either way. Answer these and Barak can
            skip the discovery questions and come back with something specific.
          </p>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sh-provider">Who processes your payments today?</Label>
              <Input
                id="sh-provider"
                type="text"
                list="sh-provider-options"
                value={currentProvider}
                onChange={(e) => setCurrentProvider(e.target.value)}
                placeholder="Stripe, Square, Clover..."
                autoComplete="off"
                className="mt-1"
              />
              <datalist id="sh-provider-options">
                {COMMON_PROVIDERS.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
            <div>
              <Label htmlFor="sh-company">Business name</Label>
              <Input
                id="sh-company"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your company"
                autoComplete="organization"
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  track("sh_details_skipped", { reason: "clicked_skip" });
                  finish(thankYouSlug || "a");
                }}
                disabled={isPending}
              >
                Skip this
              </Button>
              <Button type="button" onClick={submitDetails} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    Add to my request <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              Both optional. Knowing who you process with today is what lets
              Barak open with a number instead of a question.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

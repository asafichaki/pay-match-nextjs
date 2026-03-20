"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Lock, CheckCircle2, Loader2 } from "lucide-react";
import { subscribeNewsletter } from "@/app/actions/newsletter";

interface NewsletterFormProps {
  source?: "homepage" | "footer" | "exit_intent";
  variant?: "default" | "compact";
  className?: string;
}

export default function NewsletterForm({
  source = "homepage",
  variant = "default",
  className = "",
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const result = await subscribeNewsletter({ email, source });

    if (result.success) {
      setStatus("success");
      setEmail("");
    } else {
      setStatus("error");
      setErrorMessage(result.error || "Something went wrong.");
    }
  };

  if (status === "success") {
    return (
      <div className={`flex items-center gap-2 text-sm text-success ${className}`}>
        <CheckCircle2 className="h-5 w-5" />
        <span className="font-medium">You're in! Check your inbox for a welcome message.</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        {/* Honeypot */}
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="h-10 text-sm flex-1"
          disabled={status === "loading"}
        />
        <Button type="submit" size="sm" className="h-10 px-4 text-sm whitespace-nowrap" disabled={status === "loading"}>
          {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
        </Button>
        {status === "error" && (
          <p className="text-xs text-destructive mt-1">{errorMessage}</p>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute opacity-0 h-0 w-0 overflow-hidden"
        aria-hidden="true"
      />
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
          className="h-12 text-base flex-1"
          disabled={status === "loading"}
        />
        <Button
          type="submit"
          className="h-12 px-8 text-base font-semibold whitespace-nowrap"
          disabled={status === "loading"}
        >
          {status === "loading" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Join Free"
          )}
        </Button>
      </div>
      {status === "error" && (
        <p className="text-sm text-destructive mt-2">{errorMessage}</p>
      )}
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
        <Lock className="h-3 w-3" />
        No spam. Unsubscribe anytime. We'll never share your email.
      </p>
    </form>
  );
}

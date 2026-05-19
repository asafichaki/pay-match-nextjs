"use client";

/**
 * Inline password strength meter — no external dependencies.
 * Score is 0–7. Bucket:
 *   0–2 = weak     (red)
 *   3–4 = fair     (amber)   — minimum to pass
 *   5–6 = strong   (lime)
 *   7   = excellent (green)
 *
 * Server-side Zod policy in actions.ts is the source of truth; this is a UX
 * affordance that mirrors the same rules so the user sees real-time feedback.
 */

export interface PasswordScore {
  score: number; // 0-7
  bucket: "weak" | "fair" | "strong" | "excellent";
  passes: boolean; // score >= 4 AND meets all hard rules
  failures: string[];
}

export function scorePassword(pw: string): PasswordScore {
  let score = 0;
  const failures: string[] = [];

  if (pw.length >= 12) score++;
  else failures.push("At least 12 characters");

  if (pw.length >= 16) score++;
  if (pw.length >= 20) score++;

  if (/[A-Z]/.test(pw)) score++;
  else failures.push("An uppercase letter");

  if (/[a-z]/.test(pw)) score++;
  else failures.push("A lowercase letter");

  if (/[0-9]/.test(pw)) score++;
  else failures.push("A digit");

  if (/[^A-Za-z0-9]/.test(pw)) score++;
  else failures.push("A special character");

  let bucket: PasswordScore["bucket"];
  if (score <= 2) bucket = "weak";
  else if (score <= 4) bucket = "fair";
  else if (score <= 6) bucket = "strong";
  else bucket = "excellent";

  const passes = failures.length === 0 && score >= 4;
  return { score, bucket, passes, failures };
}

const BUCKET_COLOR: Record<PasswordScore["bucket"], string> = {
  weak: "bg-red-500",
  fair: "bg-amber-500",
  strong: "bg-lime-500",
  excellent: "bg-green-600",
};

const BUCKET_LABEL: Record<PasswordScore["bucket"], string> = {
  weak: "Weak",
  fair: "Fair",
  strong: "Strong",
  excellent: "Excellent",
};

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) {
    return (
      <p className="text-xs text-muted-foreground">
        12+ chars, mixed case, digit, special character required.
      </p>
    );
  }

  const result = scorePassword(password);
  const pct = Math.min(100, (result.score / 7) * 100);

  return (
    <div className="space-y-1.5" data-testid="password-strength">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Strength</span>
        <span
          className={
            result.bucket === "weak"
              ? "text-red-600 font-medium"
              : result.bucket === "fair"
                ? "text-amber-600 font-medium"
                : result.bucket === "strong"
                  ? "text-lime-700 font-medium"
                  : "text-green-700 font-medium"
          }
          data-testid="password-strength-label"
        >
          {BUCKET_LABEL[result.bucket]}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded bg-muted">
        <div
          className={`h-full transition-all ${BUCKET_COLOR[result.bucket]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {result.failures.length > 0 && (
        <ul className="text-xs text-muted-foreground space-y-0.5 mt-1">
          {result.failures.map((f) => (
            <li key={f}>• {f}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { Shield, Lock, CreditCard, Clock } from "lucide-react";

interface TrustBadgesProps {
  variant?: "default" | "compact";
  className?: string;
}

const badges = [
  { icon: Shield, label: "Free Forever" },
  { icon: Lock, label: "No Credit Card Required" },
  { icon: CreditCard, label: "Unbiased Reviews" },
  { icon: Clock, label: "Results in 90 Seconds" },
];

export default function TrustBadges({ variant = "default", className = "" }: TrustBadgesProps) {
  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground ${className}`}>
        {badges.slice(0, 3).map((badge) => (
          <span key={badge.label} className="flex items-center gap-1">
            <badge.icon className="h-3 w-3" />
            {badge.label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-2 ${className}`}>
      {badges.map((badge) => (
        <div
          key={badge.label}
          className="flex items-center gap-1.5 text-sm text-muted-foreground"
        >
          <badge.icon className="h-4 w-4 text-primary/60" />
          <span>{badge.label}</span>
        </div>
      ))}
    </div>
  );
}

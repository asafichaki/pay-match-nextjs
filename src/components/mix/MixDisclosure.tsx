import { DISCLOSURE_TEXT } from "@/components/AffiliateLink";

/**
 * The disclosure at body size, placed where the decision is made: under the
 * H1, inside the Top-picks box, above a ranked table. Not a tooltip, not
 * text-xs, per the FTC endorsement guides and Square's above-the-fold rule.
 */
export function MixDisclosure({ className = "" }: { className?: string }) {
  return (
    <p className={`text-sm text-muted-foreground leading-relaxed ${className}`}>
      {DISCLOSURE_TEXT}{" "}
      <a href="/how-we-make-money" className="underline underline-offset-2 hover:text-primary">
        How we make money
      </a>
    </p>
  );
}

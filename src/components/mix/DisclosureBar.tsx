import { DISCLOSURE_TEXT } from "@/components/AffiliateLink";

/**
 * One line, first thing under the header on every money page. The FTC wants
 * the disclosure before the first commercial action, and on a phone the
 * three-line version pushed the first provider button below the fold.
 * The full sentence (DISCLOSURE_TEXT) still renders at the ranking and in
 * the footer; this bar is the "unavoidable" short form that links to it.
 */
export function DisclosureBar({ className = "" }: { className?: string }) {
  return (
    <p
      className={`rounded-lg bg-muted/60 px-3 py-1.5 text-[12px] leading-snug text-muted-foreground ${className}`}
      title={DISCLOSURE_TEXT}
    >
      We earn a commission from some providers. It does not move anyone up the list or change your price.{" "}
      <a href="/how-we-make-money" className="underline underline-offset-2 hover:text-foreground">
        How we make money
      </a>
    </p>
  );
}

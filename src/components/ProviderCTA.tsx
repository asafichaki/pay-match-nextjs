import { ArrowUpRight } from "lucide-react";
import { AffiliateLink, AffiliateDisclosure } from "./AffiliateLink";

/**
 * The commercial exit block.
 *
 * Placed after the verdict and BEFORE the quiz CTA, deliberately. The quiz is
 * still the primary action on every page: it produces an advisory lead worth
 * far more than a referral fee, and it is the only path that puts a human in
 * front of the merchant. So this block is styled as the secondary option,
 * outlined rather than filled, and the quiz keeps the solid primary button
 * directly underneath it.
 *
 * It exists because until now the site had no commercial CTA at all. Every
 * provider link on the site was a brand name inside a sentence, which nobody
 * clicks with intent to buy. A reader who has finished the verdict and already
 * decided had nowhere to go except back to Google.
 *
 * Inline brand mentions in the prose stay plain <a> on purpose. Marking all of
 * them sponsored would read as a thin affiliate page on a YMYL finance site and
 * would undercut the editorial credibility that gets these comparisons quoted
 * by answer engines.
 */

export type ProviderCTAItem = {
  /** `partners.slug` */
  partner: string;
  name: string;
  /** One short reason, six words or so. Not marketing copy. */
  note?: string;
};

export default function ProviderCTA({
  items,
  from,
  heading = "Go direct to a provider",
}: {
  items: ProviderCTAItem[];
  /** Originating path, so the click is attributed to this page. */
  from?: string;
  heading?: string;
}) {
  if (!items.length) return null;

  return (
    <section className="py-8 border-t border-border" aria-labelledby="provider-cta-heading">
      <h2
        id="provider-cta-heading"
        className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4"
      >
        {heading}
      </h2>

      <div className={items.length > 1 ? "grid sm:grid-cols-2 gap-3" : "grid gap-3"}>
        {items.map((it) => (
          <AffiliateLink
            key={it.partner}
            partner={it.partner}
            from={from}
            title={`Visit ${it.name}`}
            className="group flex items-center justify-between gap-3 rounded-md border border-border bg-background px-4 py-3 transition-colors hover:border-primary hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="min-w-0">
              <span className="block font-semibold text-foreground">{it.name}</span>
              {it.note ? (
                <span className="block text-sm text-muted-foreground truncate">{it.note}</span>
              ) : null}
            </span>
            <ArrowUpRight
              className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
              aria-hidden="true"
            />
          </AffiliateLink>
        ))}
      </div>

      <AffiliateDisclosure />
    </section>
  );
}

import { BARAK_LINKEDIN, BARAK_NAME, BARAK_TITLE } from "@/data/personas/barak";

type Props = {
  className?: string;
  /**
   * Link the reviewer name to /about/barak. Default true. Pass false on pages
   * that already carry a contextual byline link near the H1 (ArticleByline or
   * an inline "Reviewed by" line), so each article links /about/barak exactly
   * once and the rest of the internal equity stays on the cornerstones.
   */
  linkProfile?: boolean;
};

export default function ReviewerBioBox({ className, linkProfile = true }: Props) {
  return (
    <aside
      className={
        "mt-12 rounded-2xl border border-border bg-muted/30 p-6 sm:p-8 " +
        (className ?? "")
      }
      aria-labelledby="reviewer-bio-heading"
    >
      <p
        id="reviewer-bio-heading"
        className="text-[11px] uppercase tracking-wider font-semibold text-primary mb-3"
      >
        Reviewed by
      </p>
      <div className="flex items-start gap-4">
        <img
          src="/images/barak-monogram.svg"
          alt={BARAK_NAME}
          className="w-14 h-14 rounded-full bg-card border border-border p-1"
        />
        <div className="flex-1">
          <p className="font-semibold text-foreground text-lg">
            {linkProfile ? (
              <a href="/about/barak" className="hover:underline">
                {BARAK_NAME}
              </a>
            ) : (
              <span>{BARAK_NAME}</span>
            )}{" "}
            <span className="font-normal text-muted-foreground">, {BARAK_TITLE}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Hands-on payments operator with experience at the $500M+ annual volume level. Reviews myPayAdvisor editorial for technical accuracy on pricing, acquirer routing, reserves, and approval-rate optimization.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <a
              href={BARAK_LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}

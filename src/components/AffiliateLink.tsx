import type { ReactNode } from "react";

/**
 * A commercial link to a provider.
 *
 * Use this for anything that sends a reader to a provider to buy, sign up,
 * check pricing or book a demo. Do NOT use it for a citation. A link to a
 * Federal Reserve study, a PCI standards page or a provider's own
 * documentation quoted as evidence must stay a plain <a>: those links are what
 * makes this site quotable by answer engines, and marking a source as
 * sponsored is both wrong and self-defeating.
 *
 * Rule of thumb: if the link is the reader acting on the advice, it is
 * commercial. If it is the reader checking where a number came from, it is a
 * citation.
 *
 * rel="sponsored nofollow" is not decoration. Google asks for `sponsored` on
 * any link placed as part of a commercial arrangement, and without it this
 * site passes ranking signal to Stripe and Square for free.
 */
export function AffiliateLink({
  partner,
  from,
  variant,
  children,
  className,
  title,
}: {
  /** `partners.slug`, e.g. "helcim". Never a URL. */
  partner: string;
  /** Originating path. Optional: the route falls back to the referer header. */
  from?: string;
  /** "quote" sends the reader to the provider's contact/demo page instead. */
  variant?: "visit" | "quote";
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  const qs = new URLSearchParams();
  if (from) qs.set("from", from);
  if (variant === "quote") qs.set("v", "quote");
  const query = qs.toString();
  const href = query ? `/go/${partner}?${query}` : `/go/${partner}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      className={className}
      title={title}
      data-partner={partner}
    >
      {children}
    </a>
  );
}

/**
 * The disclosure that belongs next to a cluster of commercial links.
 *
 * The footer already carries a site-wide affiliate disclosure. The FTC's
 * position is that a disclosure has to be where the reader will actually see
 * it before acting, and a line in the footer of a 4,000 word comparison is
 * not that. This is the same statement placed where the decision is made.
 */
export function AffiliateDisclosure({ className }: { className?: string }) {
  return (
    <p
      className={
        className ??
        "text-xs text-muted-foreground border-l-2 border-border pl-3 my-6"
      }
    >
      <strong className="font-medium">Disclosure:</strong> myPayAdvisor may be
      compensated when you sign up with a provider through links on this page.
      It does not change what we recommend, and it does not change your price.
      Confirm rates and terms with the provider before signing.
    </p>
  );
}

export default AffiliateLink;

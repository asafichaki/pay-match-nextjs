import type { ReactNode } from "react";
import { AffiliateLink, type Placement, type VolumeKey } from "@/components/AffiliateLink";

/**
 * The Visit button for a ranked provider. A provider with a `partners` row
 * goes out through /go/ (counted, rel="sponsored"); one without goes straight
 * to its own pricing page as a plain editorial link. Either way the reader
 * gets a button, so rank and button never depend on who pays.
 */
export function ProviderButton({
  partnerSlug,
  pricingUrl,
  from,
  className,
  children,
  label,
  el,
  pos,
  vol,
  variant,
}: {
  partnerSlug: string | null;
  pricingUrl: string;
  from: string;
  className?: string;
  children: ReactNode;
  label: string;
  el?: Placement;
  pos?: number;
  vol?: VolumeKey;
  variant?: "visit" | "quote";
}) {
  if (partnerSlug) {
    return (
      <AffiliateLink partner={partnerSlug} from={from} className={className} title={label} el={el} pos={pos} vol={vol} variant={variant}>
        {children}
      </AffiliateLink>
    );
  }
  return (
    <a href={pricingUrl} target="_blank" rel="nofollow noopener" className={className} title={label} data-placement={el} data-position={pos} data-partner-direct={label.replace(/^(Visit|Check rates at) /, "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
      {children}
    </a>
  );
}

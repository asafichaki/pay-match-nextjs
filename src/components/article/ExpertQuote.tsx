// Inline sourced quote with a full schema.org Quotation node.
// Per geo-architect/03-citation-worthy-content.md (inline expert quote) and the
// portfolio rule portfolio_no_fictional_credentials: every quote is verbatim from
// a real person or organization with a source URL (isBasedOn). Never generated.
//
// The JSON-LD shape mirrors ComparisonSchema's `quotation` prop so one payload
// type serves both, and scripts/seo/check-quotation-schema.mjs validates the
// literal at build time (text, creator{@type,name}, publisher{@type,name}, isBasedOn URL).
//
// Rendering rules:
// - blockquote cite = the source URL
// - figcaption names the creator; links to the source only when it is external.
//   Internal sources (Barak's /about/barak) are not linked again here: the page
//   already carries the one contextual byline link per article.

import { JsonLd } from "@/components/JsonLd";
import type { QuotationPayload } from "@/components/seo/ComparisonSchema";

const SITE_URL = "https://www.mypayadvisor.com";

interface Props {
  /** Verbatim quote with creator, publisher and source URL. */
  quotation: QuotationPayload;
  /** Absolute URL of the page the quote appears on (used for @id and isPartOf). */
  pageUrl: string;
  /** Optional extra Tailwind classes for the <figure>. */
  className?: string;
}

function creatorLabel(creator: QuotationPayload["creator"]): string {
  if (creator["@type"] === "Person") {
    const parts = [creator.name];
    if (creator.jobTitle) parts.push(creator.jobTitle);
    if (creator.worksFor?.name) parts.push(creator.worksFor.name);
    return parts.join(", ");
  }
  const parts = [creator.name];
  if (creator.parentOrganization?.name && creator.parentOrganization.name !== creator.name) {
    parts.push(creator.parentOrganization.name);
  }
  return parts.join(", ");
}

export function ExpertQuote({ quotation, pageUrl, className = "" }: Props) {
  const anchor = quotation.anchor ?? "expert-quote-1";
  const isInternalSource = quotation.isBasedOn.startsWith(SITE_URL);

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Quotation",
    "@id": `${pageUrl}#${anchor}`,
    text: quotation.text,
    creator: quotation.creator,
    publisher: quotation.publisher,
    isBasedOn: quotation.isBasedOn,
    inLanguage: quotation.inLanguage ?? "en-US",
    isPartOf: { "@id": pageUrl },
  };
  if (quotation.citation) schema.citation = quotation.citation;

  const label = creatorLabel(quotation.creator);

  return (
    <figure
      id={anchor}
      className={`my-8 border-l-4 border-primary bg-muted/40 px-6 py-5 rounded-r-md not-prose ${className}`}
    >
      <JsonLd data={schema} />
      <blockquote cite={quotation.isBasedOn} className="text-foreground italic leading-relaxed">
        <p className="m-0">&ldquo;{quotation.text}&rdquo;</p>
      </blockquote>
      <figcaption className="mt-3 text-sm text-muted-foreground not-italic">
        <span className="font-medium text-foreground">{label}</span>
        {isInternalSource ? null : (
          <>
            {", "}
            <a
              href={quotation.isBasedOn}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {quotation.publisher.name}
            </a>
          </>
        )}
        {quotation.citation ? <span className="block mt-1 text-xs">{quotation.citation}</span> : null}
      </figcaption>
    </figure>
  );
}

export default ExpertQuote;

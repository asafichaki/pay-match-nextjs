// Inline named-expert quote with Quotation JSON-LD.
// Per geo-architect/03-citation-worthy-content.md § Inline expert quote.
//
// Quality bar:
// - Substantive (>20 words), niche-specific, opinion-bearing
// - Person attribution links to /about/<slug> page that has Person schema + LinkedIn sameAs
// - Use 1-2 per cornerstone, not filler

import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";

interface Props {
  /** The quoted opinion. Must be substantive and signed off by the real expert. */
  quote: string;
  /** Expert display name, e.g. "Barak Bachar". */
  authorName: string;
  /** Expert role / title, e.g. "Global Payments Manager, myPayAdvisor". */
  authorRole: string;
  /** Slug under /about/, e.g. "barak". */
  authorSlug: string;
  /** Schema @id of the Person (mirrors PERSON_ID exported from data/personas/<slug>.ts). */
  personId?: string;
  /** Article URL this quote appears on (for isPartOf in schema). */
  articleUrl?: string;
}

export function ExpertQuote({
  quote,
  authorName,
  authorRole,
  authorSlug,
  personId,
  articleUrl,
}: Props) {
  const aboutHref = `/about/${authorSlug}`;
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Quotation",
    text: quote,
    spokenByCharacter: personId
      ? { "@id": personId }
      : { "@type": "Person", name: authorName, jobTitle: authorRole },
  };
  if (articleUrl) {
    (schema as { isPartOf?: unknown }).isPartOf = { "@id": articleUrl };
  }

  return (
    <figure className="my-8 rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
      <JsonLd data={schema} />
      <blockquote cite={aboutHref} className="text-base sm:text-lg font-medium leading-relaxed text-foreground">
        <p className="m-0">&ldquo;{quote}&rdquo;</p>
      </blockquote>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        &mdash;{" "}
        <Link href={aboutHref} rel="author" className="font-semibold text-primary hover:underline">
          {authorName}
        </Link>
        , {authorRole}
      </figcaption>
    </figure>
  );
}

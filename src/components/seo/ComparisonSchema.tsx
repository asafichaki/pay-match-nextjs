import { JsonLd } from "@/components/JsonLd";
import { BARAK_PERSON_ID } from "@/data/personas/barak";

const SITE_URL = "https://www.mypayadvisor.com";
const ORG_ID = `${SITE_URL}/#organization`;
const LOGO_URL = `${SITE_URL}/og-logo.png`;

export type BreadcrumbItem = {
  name: string;
  /** Absolute URL or path beginning with "/". If undefined, the item is treated as the current page. */
  item?: string;
};

export type QuotationCreator =
  | {
      "@type": "Person";
      name: string;
      jobTitle?: string;
      worksFor?: { "@type": "Organization"; name: string };
      url?: string;
    }
  | {
      "@type": "Organization";
      name: string;
      parentOrganization?: { "@type": "Organization"; name: string };
      url?: string;
    };

export type QuotationPayload = {
  /** Verbatim quote text. */
  text: string;
  /** Person or Organization who authored the quote. */
  creator: QuotationCreator;
  /** Publishing organization. */
  publisher: {
    "@type": "Organization" | "GovernmentOrganization";
    name: string;
    url?: string;
  };
  /** Canonical source URL where the quote was published. */
  isBasedOn: string;
  /** Optional legal/regulatory citation string. */
  citation?: string;
  /** Optional anchor suffix on the page (defaults to "expert-quote-1"). */
  anchor?: string;
  /** ISO BCP 47 language tag. Defaults to "en-US". */
  inLanguage?: string;
};

export type ComparisonSchemaProps = {
  /** Page headline / og title. */
  title: string;
  /** Meta description (~150 chars) used for schema description. */
  description: string;
  /** Slug under /comparisons/ (e.g. "stripe-vs-paypal"). */
  slug: string;
  /** ISO date when the article first published. */
  datePublished: string;
  /** ISO date of last meaningful update. Defaults to today. */
  dateModified?: string;
  /** Override breadcrumb trail. Defaults to Home > Comparisons > {title}. */
  breadcrumbItems?: BreadcrumbItem[];
  /** Override hero image absolute URL. Defaults to og-logo.png. */
  image?: string;
  /** Use WebPage @type instead of Article (for hub-style overviews). Default Article. */
  asWebPage?: boolean;
  /** Optional expert Quotation node appended to the JSON-LD @graph. */
  quotation?: QuotationPayload;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function resolveUrl(item: string | undefined, fallback: string): string {
  if (!item) return fallback;
  if (item.startsWith("http")) return item;
  return `${SITE_URL}${item.startsWith("/") ? "" : "/"}${item}`;
}

/**
 * Combined JSON-LD emitter for myPayAdvisor cornerstone comparison pages.
 * Outputs one <script> graph containing Article (or WebPage) + BreadcrumbList,
 * with Barak Bachar wired as reviewedBy via Person @id reference
 * (the canonical Person node lives on /about/barak).
 *
 * Replaces the inline Article/Breadcrumb blocks previously duplicated across
 * /comparisons/* pages. Keep page-local FAQPage / ItemList / Speakable /
 * AudioObject schemas separate — this component does NOT emit those.
 */
export function ComparisonSchema({
  title,
  description,
  slug,
  datePublished,
  dateModified,
  breadcrumbItems,
  image = LOGO_URL,
  asWebPage = false,
  quotation,
}: ComparisonSchemaProps) {
  const url = `${SITE_URL}/comparisons/${slug}`;

  const article: Record<string, unknown> = {
    "@type": asWebPage ? "WebPage" : "Article",
    "@id": `${url}#${asWebPage ? "webpage" : "article"}`,
    name: title,
    headline: title,
    description,
    url,
    inLanguage: "en-US",
    image,
    datePublished,
    dateModified: dateModified ?? todayIso(),
    author: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: "myPayAdvisor",
      url: SITE_URL,
    },
    reviewedBy: {
      "@type": "Person",
      "@id": BARAK_PERSON_ID,
    },
    publisher: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: "myPayAdvisor",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  const trail: BreadcrumbItem[] = breadcrumbItems ?? [
    { name: "Home", item: SITE_URL },
    { name: "Comparisons", item: `${SITE_URL}/comparisons` },
    { name: title, item: url },
  ];

  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      item: resolveUrl(b.item, url),
    })),
  };

  const graphNodes: Record<string, unknown>[] = [article, breadcrumb];

  if (quotation) {
    const anchor = quotation.anchor ?? "expert-quote-1";
    const quotationNode: Record<string, unknown> = {
      "@type": "Quotation",
      "@id": `${url}#${anchor}`,
      text: quotation.text,
      creator: quotation.creator,
      publisher: quotation.publisher,
      isBasedOn: quotation.isBasedOn,
      inLanguage: quotation.inLanguage ?? "en-US",
    };
    if (quotation.citation) {
      quotationNode.citation = quotation.citation;
    }
    graphNodes.push(quotationNode);
  }

  const graph = {
    "@context": "https://schema.org",
    "@graph": graphNodes,
  };

  return <JsonLd data={graph} />;
}

export default ComparisonSchema;

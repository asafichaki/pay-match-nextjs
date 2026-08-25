import Link from "next/link";

export interface ArticleBylineProps {
  /** Author display name. */
  author: string;
  /** Profile URL (e.g. /about/barak). */
  authorUrl: string;
  /**
   * ISO date string of last meaningful update. Required and literal: the old
   * "defaults to today" made every render claim a same-day update (PR 1).
   */
  lastUpdated: string;
  /** Optional extra Tailwind classes for the wrapper. */
  className?: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Visible byline rendered near the H1 on cornerstone comparison pages.
 *
 * Google needs the modified date to be HTML-visible (not just JSON-LD) to
 * surface the "Mar 6, 2026 —" date prefix in the SERP snippet. Pair with
 * the `article:modified_time` and `article:published_time` meta tags on
 * the page's `metadata` export.
 */
export function ArticleByline({
  author,
  authorUrl,
  lastUpdated,
  className = "",
}: ArticleBylineProps) {
  const iso = lastUpdated;
  return (
    <p
      className={`text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 ${className}`}
    >
      <span>
        By{" "}
        <Link
          href={authorUrl}
          className="font-medium text-foreground hover:text-primary underline-offset-4 hover:underline"
        >
          {author}
        </Link>
      </span>
      <span aria-hidden="true">·</span>
      <span>
        Last updated{" "}
        <time dateTime={iso}>{formatDate(iso)}</time>
      </span>
    </p>
  );
}

export default ArticleByline;

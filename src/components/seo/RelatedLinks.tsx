// Related links, read from `seo_overrides.related_links`.
//
// Source order: the override row, then the `fallback` prop (the DB row's own
// `internal_links`, or a hand-written list on a shell), then nothing. An empty
// section is worse than no section, so nothing is rendered when there is
// nothing to say.
//
// Skip rule: a body that already ships its own `id="related-comparisons"`
// block gets no second list. Pass `bodyHtml` and this returns null.
//
// Placement rule (PR 2): this belongs at the END of an article, after the body
// and before the reviewer box. It is never injected into the body HTML, so it
// can never land inside the first 1,200 characters of the article text where
// it would push the answer down the page.

import Link from "next/link";
import { getSeoOverride, type OverrideKind, type RelatedLink } from "@/lib/seo/overrides";

interface Props {
  kind: OverrideKind;
  slug: string;
  /** Used only when the override row has no `related_links`. */
  fallback?: RelatedLink[];
  /** Article body. When it already carries `id="related-comparisons"`, render nothing. */
  bodyHtml?: string | null;
  heading?: string;
  /**
   * Wrap in the page container. True for the static shells, whose slot sits
   * outside any container; false where the parent already provides one
   * (the DB renderer's <article>, VolumeTierPage's <main>).
   */
  contained?: boolean;
}

export const RELATED_MARKER = 'id="related-comparisons"';

export async function RelatedLinks({
  kind,
  slug,
  fallback,
  bodyHtml,
  heading = "Keep reading",
  contained = true,
}: Props) {
  if (bodyHtml && bodyHtml.includes(RELATED_MARKER)) return null;

  const override = await getSeoOverride(kind, slug);
  const links: RelatedLink[] = override?.related_links?.length
    ? override.related_links
    : (fallback ?? []);
  if (!links.length) return null;

  return (
    <section
      aria-labelledby="related-links-heading"
      className={
        contained
          ? "container mx-auto max-w-3xl px-4 mt-12 border-t border-border pt-8 pb-4"
          : "mt-12 border-t border-border pt-8"
      }
      data-seo-related="override"
    >
      <h2
        id="related-links-heading"
        className="mb-5 text-base font-bold uppercase tracking-wider text-muted-foreground"
      >
        {heading}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group block h-full rounded-lg border border-border p-4 transition-colors hover:border-primary"
            >
              <span className="block font-semibold text-foreground group-hover:text-primary">
                {l.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RelatedLinks;

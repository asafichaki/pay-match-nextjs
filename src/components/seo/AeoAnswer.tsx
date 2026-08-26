// The AEO answer block.
//
// One component renders BOTH halves of the pattern: the visible `.aeo-answer`
// paragraph a reader sees under the H1, and the Speakable node that tells an
// answer engine which selector holds the answer. They are emitted together or
// not at all. A Speakable node pointing at a selector that is not on the page
// is a lie to the crawler, and a visible answer with no Speakable node wastes
// the citation surface, so there is deliberately no way to get one without
// the other.
//
// The text comes from `seo_overrides.aeo_answer`, written by the daily loop
// after a Gemini Pro judge has checked every figure against the page and
// `rules.json` has checked the claims. With no row, this renders nothing and
// the page is byte-identical to what it was before PR 2.

import { JsonLd } from "@/components/JsonLd";
import { getSeoOverride, type OverrideKind } from "@/lib/seo/overrides";

const SITE = "https://www.mypayadvisor.com";

interface Props {
  kind: OverrideKind;
  slug: string;
  /** Absolute page URL. Derived from kind + slug when omitted. */
  url?: string;
}

function pathOf(kind: OverrideKind, slug: string): string {
  if (kind === "pages") return slug === "home" ? "/" : `/${slug}`;
  return `/${kind}/${slug}`;
}

export async function AeoAnswer({ kind, slug, url }: Props) {
  const override = await getSeoOverride(kind, slug);
  const answer = override?.aeo_answer?.trim();
  if (!answer) return null;

  const pageUrl = url ?? `${SITE}${pathOf(kind, slug)}`;
  const speakableSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#aeo-answer`,
    url: pageUrl,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".aeo-answer", "h1"],
    },
  };

  return (
    <>
      <div
        className="aeo-answer mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5 text-base leading-relaxed text-foreground sm:p-6 sm:text-lg"
        data-speakable="true"
      >
        {answer}
      </div>
      <JsonLd data={speakableSchema} />
    </>
  );
}

export default AeoAnswer;

// `/llms-full.txt`, the full-content corpus for AI crawlers.
//
// Rewritten in PR 2 onto `src/lib/seo/corpus.ts`. What it used to do, and why
// that had to go:
//
//   - it read every `page.tsx` off the filesystem at request time and pulled
//     the title out with `/export\s+const\s+metadata[\s\S]*?title:/`. The PR 2
//     codemod renamed that declaration to `baseMetadata` on 46 of the 56
//     shells, so the regex would have missed all of them and fallen back to
//     printing the slug. That fallback is already why the loop's health check
//     reports slug-like titles here; after the codemod it would have been
//     every shell.
//   - it could not see `seo_overrides` at all, so a title the loop had
//     rewritten on the live page still read the old way in the file an answer
//     engine ingests.
//
// Both are now read from the build-time manifest and the override table.
//
// Revalidation: hourly ISR, plus an explicit purge from the autopilot
// revalidate route on a publish and on an `aeo_answer` change. Not on a title
// change.

import { buildCorpus, corpusOf, SITE, type CorpusEntry } from "@/lib/seo/corpus";
import { LASTMOD_MANIFEST } from "@/lib/seo/lastmod";
import { SEO_MANIFEST } from "@/lib/seo/manifest";

export const revalidate = 3600;
export const runtime = "nodejs";

function formatEntry(e: CorpusEntry): string {
  const date = e.iso ? e.iso.slice(0, 10) : "";
  const lines: string[] = [];
  lines.push(`## ${e.title}`);
  lines.push(`URL: ${e.url}`);
  if (date) lines.push(`Updated: ${date}`);
  if (e.author) lines.push(`Author: ${e.author}`);
  lines.push("");
  if (e.aeoAnswer) {
    lines.push("### Answer");
    lines.push(e.aeoAnswer);
    lines.push("");
  }
  if (e.description) {
    lines.push(e.description);
    lines.push("");
  }
  if (e.keyFindings.length) {
    lines.push("### Key findings");
    for (const k of e.keyFindings) lines.push(`- ${k}`);
    lines.push("");
  }
  if (e.outline.length) {
    lines.push("### Outline");
    for (const t of e.outline) lines.push(`- ${t}`);
    lines.push("");
  }
  if (e.sources.length) {
    lines.push("### Sources");
    for (const s of e.sources) lines.push(`- ${s}`);
    lines.push("");
  }
  lines.push("---");
  return lines.join("\n");
}

export async function GET() {
  const entries = await buildCorpus(LASTMOD_MANIFEST);
  const insights = corpusOf(entries, "insights");
  const comparisons = corpusOf(entries, "comparisons");
  const pages = corpusOf(entries, "pages");
  const overridden = entries.filter((e) => e.overridden).length;

  const preamble = [
    "# myPayAdvisor, full-content corpus for AI and LLM crawlers",
    "",
    "> Editorial library on U.S. payment processing. Independent analysis of merchant rates, processor comparisons, contracts, and operational playbooks, with a specialism in high-risk merchant accounts.",
    "",
    `Brand: myPayAdvisor (${SITE})`,
    "Entity: Wikidata Q139731888",
    "Expert reviewer: Barak Bachar, Global Payments Manager (https://www.linkedin.com/in/barak-bachar/). A payments professional specialising in merchant acquiring and high-risk underwriting, not the association-football manager of the same name.",
    `Built from the build-time route inventory (rules ${SEO_MANIFEST.rules_version || "unknown"}), the published article table, and the live SEO override table. ${overridden} of ${entries.length} entries currently carry an override.`,
    "",
    "For the curated entry-point index, see /llms.txt.",
    "For dataset downloads (CC-BY-4.0): /data/effective-rates-2026.csv, /data/effective-rates-2026.json.",
    "",
    "---",
    "",
  ].join("\n");

  const body = [
    preamble,
    `# Insights (${insights.length})`,
    "",
    insights.map(formatEntry).join("\n"),
    "",
    `# Comparisons (${comparisons.length})`,
    "",
    comparisons.map(formatEntry).join("\n"),
    "",
    `# Tools and reference (${pages.length})`,
    "",
    pages.map(formatEntry).join("\n"),
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Robots-Tag": "noindex", // file is for ingestion, not indexing
      "X-Seo-Overrides": String(overridden),
    },
  });
}

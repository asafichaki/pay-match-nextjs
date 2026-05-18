// Auto-built /llms-full.txt route per geo-architect § 05-llms-files-automation.md.
// Merges filesystem cornerstones + DB-driven autopilot articles.
// Refreshes hourly via ISR. Manual revalidate via autopilot/revalidate route.

import fs from "node:fs";
import path from "node:path";
import { createSupabaseServerClient } from "@/integrations/supabase/server";
import { REDIRECTED_INSIGHT_SLUGS } from "@/lib/insights/redirected-slugs";

export const revalidate = 3600;
export const runtime = "nodejs";

const SITE = "https://www.mypayadvisor.com";

interface CorpusEntry {
  kind: "insights" | "comparisons";
  slug: string;
  title: string;
  description: string;
  iso: string;
  toc: string[];
  keyFindings: string[];
  sources: string[];
  expert?: string;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function firstMatch(src: string, re: RegExp): string | null {
  const m = src.match(re);
  return m ? m[1] : null;
}

function listMatches(src: string, re: RegExp, limit: number): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const r = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  while ((m = r.exec(src)) && out.length < limit) {
    out.push(m[1]);
  }
  return out;
}

function readFilesystemEntries(kind: "insights" | "comparisons"): CorpusEntry[] {
  const dir = path.join(process.cwd(), "src", "app", "(public)", kind);
  let names: string[] = [];
  try {
    names = fs.readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith("[") && !e.name.startsWith("_"))
      .map((e) => e.name);
  } catch {
    return [];
  }
  if (kind === "insights") {
    names = names.filter((n) => !REDIRECTED_INSIGHT_SLUGS.has(n));
  }

  const entries: CorpusEntry[] = [];
  for (const slug of names) {
    const file = path.join(dir, slug, "page.tsx");
    let src = "";
    try { src = fs.readFileSync(file, "utf8"); } catch { continue; }

    const title = decodeEntities(
      firstMatch(src, /export\s+const\s+metadata[\s\S]*?title:\s*["'`]([^"'`]+)["'`]/) ||
      firstMatch(src, /"headline":"([^"\\]+)"/) ||
      slug
    );
    const description = decodeEntities(
      firstMatch(src, /export\s+const\s+metadata[\s\S]*?description:\s*["'`]([^"'`]+)["'`]/) ||
      firstMatch(src, /"description":"([^"\\]+)"/) ||
      ""
    );
    const iso = firstMatch(src, /"datePublished":"([^"]+)"/) || firstMatch(src, /datetime="([^"]+)"/) || "";
    const toc = listMatches(src, /<h2[^>]*>([^<]+)<\/h2>/, 12).map(decodeEntities);

    entries.push({
      kind,
      slug,
      title,
      description,
      iso,
      toc,
      keyFindings: [],
      sources: [],
    });
  }
  return entries;
}

async function fetchDbEntries(kind: "insights" | "comparisons"): Promise<CorpusEntry[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await (supabase as any)
      .from("blog_articles")
      .select("slug,title,description,meta_description,published_at,updated_at,toc,key_findings,sources_json,author")
      .eq("kind", kind)
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(500);
    if (!data) return [];
    return (data as any[]).map((row): CorpusEntry => ({
      kind,
      slug: row.slug,
      title: row.title || row.slug,
      description: row.description || row.meta_description || "",
      iso: row.published_at || row.updated_at || "",
      toc: Array.isArray(row.toc) ? row.toc.map((t: any) => t.label || t.title || String(t)).slice(0, 12) : [],
      keyFindings: Array.isArray(row.key_findings) ? row.key_findings.slice(0, 8) : [],
      sources: Array.isArray(row.sources_json) ? row.sources_json.map((s: any) => s.name || s.url || String(s)).slice(0, 10) : [],
      expert: row.author || undefined,
    }));
  } catch {
    return [];
  }
}

function formatEntry(e: CorpusEntry): string {
  const url = `${SITE}/${e.kind}/${e.slug}`;
  const date = e.iso ? e.iso.slice(0, 10) : "";
  const lines: string[] = [];
  lines.push(`## ${e.title}`);
  lines.push(`URL: ${url}`);
  if (date) lines.push(`Published: ${date}`);
  if (e.expert) lines.push(`Author: ${e.expert}`);
  lines.push("");
  if (e.description) {
    lines.push(e.description);
    lines.push("");
  }
  if (e.keyFindings.length) {
    lines.push("### Key findings");
    for (const k of e.keyFindings) lines.push(`- ${k}`);
    lines.push("");
  }
  if (e.toc.length) {
    lines.push("### Outline");
    for (const t of e.toc) lines.push(`- ${t}`);
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

const PREAMBLE = `# myPayAdvisor — full-content corpus for AI / LLM crawlers

> Editorial library on U.S. payment processing. Independent analysis of merchant rates, processor comparisons, contracts, and operational playbooks.

Brand: myPayAdvisor (https://www.mypayadvisor.com)
Entity: Wikidata Q139731888
Expert reviewer: Barak Bachar, Global Payments Manager (https://www.linkedin.com/in/barakbachar/)
Auto-generated: refreshed hourly from filesystem + Supabase blog_articles.

For the curated entry-point index, see /llms.txt.
For dataset downloads (CC-BY-4.0): /data/effective-rates-2026.csv, /data/effective-rates-2026.json.

---

`;

export async function GET() {
  const [staticInsights, staticComparisons, dbInsights, dbComparisons] = await Promise.all([
    Promise.resolve(readFilesystemEntries("insights")),
    Promise.resolve(readFilesystemEntries("comparisons")),
    fetchDbEntries("insights"),
    fetchDbEntries("comparisons"),
  ]);

  // Dedupe by (kind, slug) — DB version wins (richer fields).
  const bySlug = new Map<string, CorpusEntry>();
  for (const e of [...staticInsights, ...staticComparisons]) bySlug.set(`${e.kind}/${e.slug}`, e);
  for (const e of [...dbInsights, ...dbComparisons]) bySlug.set(`${e.kind}/${e.slug}`, e);

  const all = [...bySlug.values()];
  all.sort((a, b) => (b.iso || "").localeCompare(a.iso || ""));

  const insightsBlock = all.filter((e) => e.kind === "insights").map(formatEntry).join("\n");
  const comparisonsBlock = all.filter((e) => e.kind === "comparisons").map(formatEntry).join("\n");

  const generatedAt = new Date().toISOString();
  const body = [
    PREAMBLE.replace("Auto-generated:", `Auto-generated ${generatedAt}.`),
    `# Insights (${all.filter((e) => e.kind === "insights").length})`,
    "",
    insightsBlock,
    "",
    `# Comparisons (${all.filter((e) => e.kind === "comparisons").length})`,
    "",
    comparisonsBlock,
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Robots-Tag": "noindex", // file is for ingestion, not indexing
    },
  });
}

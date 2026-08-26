#!/usr/bin/env node
/**
 * Pre-build gate: no render-time dates in SEO surfaces, no future dates.
 *
 * Why: before PR 1 (2026-08-25) ComparisonSchema defaulted dateModified to
 * todayIso(), 8 comparison shells emitted `article:modified_time: new Date()`,
 * ArticleByline defaulted "Last updated" to today, and the high-risk pillar
 * said "Updated December 2026". Every ISR revalidation then re-stamped the
 * page as "modified today" while the sitemap said something else. Google
 * reads that as a freshness lie. This gate keeps the dates literal.
 *
 * Scope (src/app/(public)/** page.tsx + *Content.tsx, src/components/seo/*):
 *   1. `new Date(`, `todayIso(`, `Date.now(` inside `export const metadata`,
 *      `generateMetadata`, any `openGraph` object, any object literal that
 *      carries "@context" / "@type" (JSON-LD), and any `${...}` interpolation.
 *      In src/components/seo/* the whole file is scanned for `new Date()`,
 *      `Date.now(` and `todayIso(` (parsing a literal with new Date(iso) is fine).
 *   2. Any ISO date string (YYYY-MM-DD) later than today (UTC).
 *
 * Failure: process.exit(1) with file:line for every hit.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const PUBLIC_APP = path.join(ROOT, "src", "app", "(public)");
const SEO_COMPONENTS = path.join(ROOT, "src", "components", "seo");
const TODAY = new Date().toISOString().slice(0, 10);

function walk(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of entries) {
    const p = path.join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const pageFiles = walk(PUBLIC_APP).filter((f) => f.endsWith("page.tsx") || f.endsWith("Content.tsx"));
const seoFiles = walk(SEO_COMPONENTS).filter((f) => /\.(ts|tsx)$/.test(f));

const FORBIDDEN_STRICT = [/new Date\(/g, /todayIso\(/g, /Date\.now\(/g];
const FORBIDDEN_LOOSE = [/new Date\(\s*\)/g, /todayIso\(/g, /Date\.now\(/g];

/**
 * Tokenize enough of TS/TSX to find brace pairs while skipping strings,
 * template literals and comments. Returns [{open, close}] index pairs plus the
 * list of template-literal spans.
 */
function braceSpans(src) {
  const pairs = [];
  const templates = [];
  const stack = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    const next = src[i + 1];
    if (c === "/" && next === "/") {
      const end = src.indexOf("\n", i);
      i = end === -1 ? n : end + 1;
      continue;
    }
    if (c === "/" && next === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end === -1 ? n : end + 2;
      continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && src[j] !== c) {
        if (src[j] === "\\") j++;
        if (src[j] === "\n") break;
        j++;
      }
      i = j + 1;
      continue;
    }
    if (c === "`") {
      let j = i + 1;
      while (j < n && src[j] !== "`") {
        if (src[j] === "\\") j++;
        j++;
      }
      templates.push({ start: i, end: j + 1 });
      i = j + 1;
      continue;
    }
    if (c === "{") {
      stack.push(i);
    } else if (c === "}") {
      const open = stack.pop();
      if (open !== undefined) pairs.push({ open, close: i });
    }
    i++;
  }
  return { pairs, templates };
}

function precededBy(src, idx) {
  let k = idx - 1;
  while (k >= 0 && /\s/.test(src[k])) k--;
  return src[k] ?? "";
}

function lineOf(src, idx) {
  return src.slice(0, idx).split("\n").length;
}

function collectRegions(src) {
  const { pairs, templates } = braceSpans(src);
  const regions = [];

  // Object literals only: `{` preceded by = : ( , [ { or the keyword return.
  for (const { open, close } of pairs) {
    const prev = precededBy(src, open);
    const isObjectLiteral =
      ["=", ":", "(", ",", "[", "{"].includes(prev) || /return\s*$/.test(src.slice(Math.max(0, open - 8), open));
    if (!isObjectLiteral) continue;
    const body = src.slice(open, close + 1);
    if (/["']@(context|type)["']/.test(body) || /\bopenGraph\s*:/.test(body)) {
      regions.push({ start: open, end: close + 1, kind: /@(context|type)/.test(body) ? "json-ld" : "openGraph" });
    }
  }

  // export const metadata = {...}
  const metaRe = /export\s+const\s+metadata\b[^=]*=\s*\{/g;
  let m;
  while ((m = metaRe.exec(src)) !== null) {
    const open = m.index + m[0].length - 1;
    const pair = pairs.find((p) => p.open === open);
    if (pair) regions.push({ start: pair.open, end: pair.close + 1, kind: "metadata" });
  }

  // generateMetadata(...) { ... }
  const genRe = /function\s+generateMetadata\s*\([^)]*\)[^{]*\{/g;
  while ((m = genRe.exec(src)) !== null) {
    const open = m.index + m[0].length - 1;
    const pair = pairs.find((p) => p.open === open);
    if (pair) regions.push({ start: pair.open, end: pair.close + 1, kind: "generateMetadata" });
  }

  // `${...}` interpolations inside template literals (e.g. embedded ld+json)
  for (const t of templates) {
    const body = src.slice(t.start, t.end);
    const interp = /\$\{[^}]*\}/g;
    let im;
    while ((im = interp.exec(body)) !== null) {
      regions.push({ start: t.start + im.index, end: t.start + im.index + im[0].length, kind: "template" });
    }
  }
  return regions;
}

const failures = [];

for (const file of pageFiles) {
  const src = readFileSync(file, "utf8");
  const rel = path.relative(ROOT, file);
  for (const region of collectRegions(src)) {
    const body = src.slice(region.start, region.end);
    const rules = region.kind === "template" ? FORBIDDEN_LOOSE : FORBIDDEN_STRICT;
    for (const re of rules) {
      re.lastIndex = 0;
      let h;
      while ((h = re.exec(body)) !== null) {
        failures.push(`${rel}:${lineOf(src, region.start + h.index)}  ${h[0].trim()} inside ${region.kind}`);
      }
    }
  }
}

function stripComments(src) {
  // Replace comment bodies with spaces so indexes (and line numbers) are preserved.
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:"'`])\/\/[^\n]*/g, (m, lead) => lead + m.slice(lead.length).replace(/[^\n]/g, " "));
}

for (const file of seoFiles) {
  const src = stripComments(readFileSync(file, "utf8"));
  const rel = path.relative(ROOT, file);
  for (const re of FORBIDDEN_LOOSE) {
    re.lastIndex = 0;
    let h;
    while ((h = re.exec(src)) !== null) {
      failures.push(`${rel}:${lineOf(src, h.index)}  ${h[0].trim()} in an SEO component`);
    }
  }
}

// Visible "Updated <Month> <Year>" labels must not be in the future (the pillar
// said "Updated December 2026" for months while Google judged it stale).
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const updatedRe = new RegExp(`\\bUpdated\\s+(${MONTHS.join("|")})\\s+(20\\d{2})\\b`, "g");
const todayYm = TODAY.slice(0, 7);
for (const file of pageFiles) {
  const src = readFileSync(file, "utf8");
  const rel = path.relative(ROOT, file);
  let h;
  updatedRe.lastIndex = 0;
  while ((h = updatedRe.exec(src)) !== null) {
    const ym = `${h[2]}-${String(MONTHS.indexOf(h[1]) + 1).padStart(2, "0")}`;
    if (ym > todayYm) failures.push(`${rel}:${lineOf(src, h.index)}  visible "${h[0]}" is in the future (today is ${TODAY})`);
  }
}

// Future ISO dates anywhere in the scanned files.
const isoRe = /\b(20\d{2})-(\d{2})-(\d{2})\b/g;
for (const file of [...pageFiles, ...seoFiles]) {
  const src = readFileSync(file, "utf8");
  const rel = path.relative(ROOT, file);
  let h;
  isoRe.lastIndex = 0;
  while ((h = isoRe.exec(src)) !== null) {
    const iso = h[0];
    const mm = Number(h[2]);
    const dd = Number(h[3]);
    if (mm < 1 || mm > 12 || dd < 1 || dd > 31) continue;
    if (iso > TODAY) failures.push(`${rel}:${lineOf(src, h.index)}  future date ${iso} (today is ${TODAY})`);
  }
}

if (failures.length) {
  console.error(`[check-dates] FAIL: ${failures.length} problem(s)`);
  for (const f of [...new Set(failures)]) console.error(`  ${f}`);
  console.error("");
  console.error("Dates in metadata, openGraph and JSON-LD must be literals from git history, never render time, never in the future.");
  process.exit(1);
}

console.log(`[check-dates] OK: ${pageFiles.length} page/content files + ${seoFiles.length} seo components, no render-time or future dates.`);

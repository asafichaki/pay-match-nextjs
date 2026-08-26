#!/usr/bin/env node
/**
 * Prebuild: write public/seo-manifest.json, the build-time route inventory.
 *
 * Three consumers, one file:
 *
 *  1. `src/app/sitemap.xml/route.ts` reads the static route list from here
 *     instead of walking `src/app/(public)` at request time. A serverless
 *     function that stats the filesystem is guessing at what got bundled; the
 *     manifest is what the build actually saw.
 *
 *  2. `/llms.txt` and `/llms-full.txt` read `base_title` / `base_description`
 *     from here. The old llms-full route regexed `export const metadata` out
 *     of each page.tsx, which the PR 2 codemod renamed to `baseMetadata`, so
 *     every codemodded shell would have fallen back to printing its slug as
 *     its title. That is the "12 slug-like titles" the loop's health check
 *     reports today, and it gets worse, not better, without this file.
 *
 *  3. The Hermes loop fetches `{SITE_BASE}/seo-manifest.json` for its
 *     before-snapshot of the static shells (`titles.current_titles`) and for
 *     the RULES parity check: `rules_version` here must equal the
 *     `rules_version` in the repo checkout's `src/lib/seo/rules.json`, or the
 *     loop turns apply off. That is why the version is read from rules.json
 *     and never retyped.
 *
 * Shape (the loop's field names, see ops/hermes-seo/health.py and titles.py):
 *   { generated_at, rules_version, counts: {...}, routes: [
 *       { route, kind, slug, source: "static"|"db",
 *         title_mode: "absolute"|"template", base_title, base_description } ] }
 *
 * `source: "db"` rows are added only when Supabase answers at build time. They
 * are a convenience for the loop, never a source of truth for the sitemap,
 * which always reads the DB live.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

// Vercel puts the real env in `process.env` for prebuild; `npm run prebuild`
// on a laptop does not load `.env.local` (only `next build` itself does), so
// the DB half of the inventory would be silently empty locally. Fill in only
// what is not already set, so a real environment always wins.
function loadDotEnvLocal() {
  try {
    const text = readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
    for (const line of text.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      if (process.env[m[1]] !== undefined) continue;
      process.env[m[1]] = m[2].replace(/^["'](.*)["']$/, "$1");
    }
  } catch {
    // No .env.local: nothing to do.
  }
}
loadDotEnvLocal();

const ROOT = process.cwd();
const PUBLIC_APP = path.join(ROOT, "src", "app", "(public)");
const OUT = path.join(ROOT, "public", "seo-manifest.json");
const RULES = JSON.parse(readFileSync(path.join(ROOT, "src", "lib", "seo", "rules.json"), "utf8"));

// ---------------------------------------------------------------- redirects
// Slugs that 301/308 today. They are not routes any more, so they are not
// inventory: listing them would put a redirect into the sitemap and the llms
// corpus. Parsed out of the two source-of-truth sets rather than duplicated.
function redirectedSlugs(file) {
  try {
    const src = readFileSync(path.join(ROOT, file), "utf8");
    return new Set([...src.matchAll(/"([a-z0-9][a-z0-9-]*)"/g)].map((m) => m[1]));
  } catch {
    return new Set();
  }
}
const REDIRECTED = {
  insights: redirectedSlugs("src/lib/insights/redirected-slugs.ts"),
  comparisons: redirectedSlugs("src/lib/comparisons/redirected-slugs.ts"),
};

// ------------------------------------------------------------- tiny TS reader
// Not a parser. It finds one object literal by brace matching, then reads the
// value of a top-level key out of it, skipping over nested braces, brackets
// and strings. That is enough for `title` and `description`, which are always
// the first two keys of a metadata object here, and it fails loudly (returns
// null) rather than guessing when a page does something unusual.

/**
 * Blank out comments, keeping offsets and newlines.
 *
 * Required, not cosmetic: half the shells carry a `// absolute: ...` note
 * directly above `title:`, and those notes quote things like "%s |
 * myPayAdvisor". A scanner that does not skip comments reads that quote as
 * the start of a string literal and then walks past the real title.
 */
function stripComments(src) {
  let out = "";
  let quote = null;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      out += c;
      if (c === "\\") { out += src[++i] ?? ""; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; out += c; continue; }
    if (c === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") { out += " "; i++; }
      out += "\n";
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      const stop = end === -1 ? src.length : end + 2;
      for (; i < stop; i++) out += src[i] === "\n" ? "\n" : " ";
      i--;
      continue;
    }
    out += c;
  }
  return out;
}

/** The `{ ... }` text of the first `const <name>... = {` in `src`. */
function objectLiteral(src, names) {
  for (const name of names) {
    const decl = new RegExp(`(?:export\\s+)?const\\s+${name}\\s*(?::[^=]+)?=\\s*\\{`);
    const m = src.match(decl);
    if (!m) continue;
    const start = m.index + m[0].length - 1;
    let depth = 0;
    let quote = null;
    for (let i = start; i < src.length; i++) {
      const c = src[i];
      if (quote) {
        if (c === "\\") i++;
        else if (c === quote) quote = null;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") quote = c;
      else if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) return src.slice(start, i + 1);
      }
    }
  }
  return null;
}

/** Raw text of `key`'s value at depth 1 of an object literal. */
function keyValue(obj, key) {
  let depth = 0;
  let quote = null;
  for (let i = 0; i < obj.length; i++) {
    const c = obj[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") { quote = c; continue; }
    if (c === "{" || c === "[" || c === "(") { depth++; continue; }
    if (c === "}" || c === "]" || c === ")") { depth--; continue; }
    if (depth !== 1) continue;
    const rest = obj.slice(i);
    const km = rest.match(new RegExp(`^["']?${key}["']?\\s*:`));
    if (!km) continue;
    // Only a key if the character before it starts a member position.
    const before = obj.slice(0, i).replace(/\s+$/, "").slice(-1);
    if (before && before !== "{" && before !== ",") continue;
    let j = i + km[0].length;
    while (j < obj.length && /\s/.test(obj[j])) j++;
    let d = 0;
    let q = null;
    for (let k = j; k < obj.length; k++) {
      const ch = obj[k];
      if (q) {
        if (ch === "\\") k++;
        else if (ch === q) q = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") { q = ch; continue; }
      if (ch === "{" || ch === "[" || ch === "(") { d++; continue; }
      if (ch === "}" || ch === "]" || ch === ")") {
        if (d === 0) return obj.slice(j, k).trim();
        d--;
        continue;
      }
      if (ch === "," && d === 0) return obj.slice(j, k).trim();
    }
    return obj.slice(j).trim();
  }
  return null;
}

/** A JS string literal (no interpolation) to its value, else null. */
function stringLiteral(text) {
  if (!text) return null;
  const t = text.trim();
  const q = t[0];
  if (q !== '"' && q !== "'" && q !== "`") return null;
  if (t[t.length - 1] !== q) return null;
  const body = t.slice(1, -1);
  if (q === "`" && body.includes("${")) return null;
  return body
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\(["'`\\])/g, "$1");
}

// --------------------------------------------------- resolving non-literals
// The five volume-tier shells write `title: { absolute: tier.metaTitle }`, so
// their real titles live in one data file. Read it once and key by slug.
function volumeTierStrings() {
  const map = new Map();
  try {
    const src = readFileSync(path.join(ROOT, "src", "lib", "comparisons", "volume-tiers.ts"), "utf8");
    const re = /slug:\s*"([^"]+)"[\s\S]*?metaTitle:\s*"((?:[^"\\]|\\.)*)"[\s\S]*?metaDescription:\s*"((?:[^"\\]|\\.)*)"/g;
    for (const m of src.matchAll(re)) {
      map.set(m[1], { metaTitle: m[2].replace(/\\"/g, '"'), metaDescription: m[3].replace(/\\"/g, '"') });
    }
  } catch {
    // No tiers file: the five shells fall back to null and the check below
    // turns that into a hard build failure, which is the point.
  }
  return map;
}
const TIERS = volumeTierStrings();

/** `const NAME = "literal"` declarations in one file. */
function declaredConstants(src) {
  const out = new Map();
  for (const m of src.matchAll(/const\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*((["'])(?:[^\\\n]|\\.)*?\3)\s*;/g)) {
    const v = stringLiteral(m[2]);
    if (v !== null) out.set(m[1], v);
  }
  return out;
}

/**
 * String constants a page can name in its metadata: its own, plus the ones it
 * imports from `@/...`. `/about/barak` writes its title as
 * `${BARAK_NAME}, ${BARAK_TITLE}`, and those two live in a data module.
 */
function constantsFor(src) {
  const consts = declaredConstants(src);
  for (const m of src.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']@\/([^"']+)["']/g)) {
    const names = m[1].split(",").map((n) => n.trim().split(/\s+as\s+/)[0].trim()).filter(Boolean);
    if (!names.length) continue;
    for (const ext of [".ts", ".tsx"]) {
      const file = path.join(ROOT, "src", m[2] + ext);
      if (!existsSync(file)) continue;
      const imported = declaredConstants(stripComments(readFileSync(file, "utf8")));
      for (const n of names) if (imported.has(n) && !consts.has(n)) consts.set(n, imported.get(n));
      break;
    }
  }
  return consts;
}

function resolve(expr, { consts, slug }) {
  if (!expr) return null;
  const lit = stringLiteral(expr);
  if (lit !== null) return lit;
  const e = expr.trim();
  if (e === "tier.metaTitle") return TIERS.get(slug)?.metaTitle ?? null;
  if (e === "tier.metaDescription") return TIERS.get(slug)?.metaDescription ?? null;
  if (consts.has(e)) return consts.get(e);
  // A template literal whose every `${...}` is a known string constant.
  if (e.startsWith("`") && e.endsWith("`")) {
    const body = e.slice(1, -1);
    let ok = true;
    const filled = body.replace(/\$\{([^}]*)\}/g, (_, ref) => {
      const key = ref.trim();
      if (consts.has(key)) return consts.get(key);
      ok = false;
      return "";
    });
    if (ok) return filled;
  }
  return null;
}

/**
 * The visible H2 headings of a route, for the `/llms-full.txt` outline.
 *
 * Read from every .tsx in the route folder, not just page.tsx: the shells put
 * their prose in a sibling `<Name>Content.tsx`, which is why the old
 * llms-full regex, which looked at page.tsx alone, produced empty outlines.
 */
function headings(dir) {
  const out = [];
  let files = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".tsx")).sort();
  } catch {
    return out;
  }
  for (const f of files) {
    let src = "";
    try { src = readFileSync(path.join(dir, f), "utf8"); } catch { continue; }
    for (const m of src.matchAll(/<h2[^>]*>([^<{]+)<\/h2>/g)) {
      const text = m[1].replace(/\s+/g, " ").trim();
      if (text && text.length > 3 && !out.includes(text) && out.length < 12) out.push(text);
    }
    if (out.length >= 12) break;
  }
  return out.map((t) =>
    t.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " "),
  );
}

/** { title_mode, base_title, base_description } for one page.tsx. */
function readMetadata(file, slug) {
  const raw = readFileSync(file, "utf8");
  const src = stripComments(raw);
  const consts = constantsFor(src);
  let obj = objectLiteral(src, ["baseMetadata", "metadata"]);
  if (!obj) {
    // A client page keeps its metadata in the sibling layout (/quiz does).
    const layout = path.join(path.dirname(file), "layout.tsx");
    if (existsSync(layout)) {
      const lsrc = stripComments(readFileSync(layout, "utf8"));
      obj = objectLiteral(lsrc, ["baseMetadata", "metadata"]);
      if (obj) for (const [k, v] of constantsFor(lsrc)) if (!consts.has(k)) consts.set(k, v);
    }
  }
  if (!obj) return null;

  const rawTitle = keyValue(obj, "title");
  let titleMode = "template";
  let titleExpr = rawTitle;
  if (rawTitle && rawTitle.trim().startsWith("{")) {
    const abs = keyValue(rawTitle, "absolute");
    if (abs) {
      titleMode = "absolute";
      titleExpr = abs;
    } else {
      titleExpr = keyValue(rawTitle, "default");
    }
  }
  return {
    title_mode: titleMode,
    base_title: resolve(titleExpr, { consts, slug }),
    base_description: resolve(keyValue(obj, "description"), { consts, slug }),
  };
}

// ------------------------------------------------------------------ inventory
const routes = [];

function addShellDir(kind) {
  const dir = path.join(PUBLIC_APP, kind);
  const slugs = readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("[") && !e.name.startsWith("_"))
    .map((e) => e.name)
    .filter((s) => !REDIRECTED[kind].has(s))
    .sort();
  for (const slug of slugs) {
    const file = path.join(dir, slug, "page.tsx");
    if (!existsSync(file)) continue;
    const meta = readMetadata(file, slug);
    routes.push({
      route: `/${kind}/${slug}`,
      kind,
      slug,
      source: "static",
      title_mode: meta?.title_mode ?? "template",
      base_title: meta?.base_title ?? null,
      base_description: meta?.base_description ?? null,
      outline: headings(path.join(dir, slug)),
    });
  }
}

// Top-level public pages the loop may override with kind "pages". `slug` is
// the override key: `home` for `/`, otherwise the path without its slash.
const PAGES = [
  ["/", "home", "page.tsx"],
  ["/quiz", "quiz", "quiz/page.tsx"],
  ["/calculator", "calculator", "calculator/page.tsx"],
  ["/insights", "insights", "insights/page.tsx"],
  ["/comparisons", "comparisons", "comparisons/page.tsx"],
  ["/glossary", "glossary", "glossary/page.tsx"],
  ["/research/methodology", "research/methodology", "research/methodology/page.tsx"],
  ["/data/effective-rates-2026", "data/effective-rates-2026", "data/effective-rates-2026/page.tsx"],
  ["/about/barak", "about/barak", "about/barak/page.tsx"],
  ["/pulse", "pulse", "pulse/page.tsx"],
];

for (const [route, slug, rel] of PAGES) {
  const file = path.join(PUBLIC_APP, rel);
  if (!existsSync(file)) continue;
  const meta = readMetadata(file, slug);
  routes.push({
    route,
    kind: "pages",
    slug,
    source: "static",
    title_mode: meta?.title_mode ?? "template",
    base_title: meta?.base_title ?? null,
    base_description: meta?.base_description ?? null,
    outline: headings(path.dirname(file)),
  });
}

addShellDir("comparisons");
addShellDir("insights");

// ------------------------------------------------------------------ DB rows
async function dbRoutes() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/blog_articles?select=kind,slug,title,meta_title,description,meta_description&published=eq.true&limit=2000`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    if (!res.ok) return [];
    const rows = await res.json();
    const known = new Set(routes.map((r) => r.route));
    return rows
      .filter((r) => r.kind === "insights" || r.kind === "comparisons")
      .filter((r) => !REDIRECTED[r.kind].has(r.slug))
      .filter((r) => !known.has(`/${r.kind}/${r.slug}`))
      .map((r) => ({
        route: `/${r.kind}/${r.slug}`,
        kind: r.kind,
        slug: r.slug,
        source: "db",
        title_mode: "template",
        base_title: r.meta_title || r.title || null,
        base_description: r.meta_description || r.description || null,
        outline: [],
      }))
      .sort((a, b) => a.route.localeCompare(b.route));
  } catch {
    return [];
  }
}

const db = await dbRoutes();
const all = [...routes, ...db];

// A static shell with no title is the failure mode this file exists to
// prevent: it would print its slug into llms.txt and hand the loop a wrong
// before-snapshot. Fail the build instead.
const untitled = all.filter((r) => r.source === "static" && !r.base_title);
if (untitled.length) {
  console.error(
    `[seo-manifest] ${untitled.length} static route(s) with no readable base title:\n` +
      untitled.map((r) => `  ${r.route}`).join("\n") +
      "\nAdd a string literal title to the page's metadata, or teach resolve() how to read it.",
  );
  process.exit(1);
}

const manifest = {
  generated_at: new Date().toISOString(),
  rules_version: RULES.rules_version,
  counts: {
    static: all.filter((r) => r.source === "static").length,
    db: all.filter((r) => r.source === "db").length,
    total: all.length,
  },
  routes: all,
};

writeFileSync(OUT, JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `[seo-manifest] rules ${manifest.rules_version}; ${manifest.counts.static} static + ` +
    `${manifest.counts.db} db = ${manifest.counts.total} routes -> public/seo-manifest.json`,
);

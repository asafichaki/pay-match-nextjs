/**
 * Shared logic for the per-route lastmod manifest (public/lastmod-manifest.json).
 *
 * Contract (PR 1, 2026-08-25):
 *   - Every route date is the newest git commit date of the route's source files
 *     (page.tsx plus its sibling *Content.tsx etc.), from FULL history.
 *   - The manifest is committed. Vercel builds from a depth-10 shallow clone, and
 *     `git log -1 -- file` in a shallow clone returns the boundary commit date
 *     for every file not touched inside the window. That produced a 91-URL
 *     block of identical lastmods (2026-08-10) on the live sitemap. So in a
 *     shallow clone (or when VERCEL=1) the prebuild does NOT regenerate from git:
 *     it loads the committed manifest and only bumps routes whose files changed in
 *     the commits the clone can actually see (boundary commits excluded).
 *   - `__generated` = build date, the sitemap's only fallback for a missing route.
 *   - `__source` = "git-full-history" when produced from a full clone; the shallow
 *     path refuses to run without it.
 *
 * Refresh locally with `node scripts/seo/refresh-lastmod-manifest.mjs` and commit.
 */
import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const PUBLIC_APP = path.join(ROOT, "src", "app", "(public)");
export const MANIFEST_PATH = path.join(ROOT, "public", "lastmod-manifest.json");
export const FULL_SOURCE = "git-full-history";

export function git(args) {
  return execSync(`git ${args}`, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
}

export function isShallowRepo() {
  try {
    return git("rev-parse --is-shallow-repository") === "true";
  } catch {
    return false;
  }
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

function walkSubdirSlugs(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !e.name.startsWith("[") && !e.name.startsWith("_"))
      .map((e) => e.name);
  } catch {
    return [];
  }
}

/** [route, [source paths]] for every route the sitemap stamps from the manifest. */
export function routeSources() {
  const routes = [];
  for (const slug of walkSubdirSlugs(path.join(PUBLIC_APP, "insights"))) {
    routes.push([`/insights/${slug}`, [path.join(PUBLIC_APP, "insights", slug)]]);
  }
  for (const slug of walkSubdirSlugs(path.join(PUBLIC_APP, "comparisons"))) {
    routes.push([`/comparisons/${slug}`, [path.join(PUBLIC_APP, "comparisons", slug)]]);
  }
  const fixed = [
    ["/", [path.join(PUBLIC_APP, "page.tsx")]],
    ["/quiz", [path.join(PUBLIC_APP, "quiz")]],
    ["/calculator", [path.join(PUBLIC_APP, "calculator")]],
    ["/insights", [path.join(PUBLIC_APP, "insights", "page.tsx"), path.join(PUBLIC_APP, "insights", "InsightsContent.tsx")]],
    ["/glossary", [path.join(PUBLIC_APP, "glossary", "page.tsx")]],
    ["/research/methodology", [path.join(PUBLIC_APP, "research", "methodology")]],
    ["/comparisons", [path.join(PUBLIC_APP, "comparisons", "page.tsx")]],
    ["/data/effective-rates-2026", [path.join(PUBLIC_APP, "data", "effective-rates-2026")]],
    ["/about/barak", [path.join(PUBLIC_APP, "about", "barak")]],
    ["/pulse", [path.join(PUBLIC_APP, "pulse", "page.tsx")]],
    [
      "/glossary/_terms",
      [
        path.join(PUBLIC_APP, "glossary", "page.tsx"),
        path.join(PUBLIC_APP, "glossary", "[term]", "page.tsx"),
        path.join(ROOT, "src", "lib", "glossary", "terms.ts"),
      ],
    ],
  ];
  return routes.concat(fixed);
}

function gitLastMod(target) {
  try {
    const rel = path.relative(ROOT, target);
    const out = git(`log -1 --format=%ad --date=short -- "${rel}"`);
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) return out;
  } catch {}
  return null;
}

function mtimeDate(target) {
  try {
    return statSync(target).mtime.toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

/** Full-history regeneration. Only meaningful in a non-shallow clone. */
export function generateFullManifest() {
  const manifest = {};
  for (const [route, sources] of routeSources()) {
    const dates = sources.map(gitLastMod).filter(Boolean);
    let date = dates.sort().at(-1) || null;
    if (!date) {
      // Untracked (new) files: file mtime, which is still a build-time literal.
      date = sources.map(mtimeDate).filter(Boolean).sort().at(-1) || today();
    }
    manifest[route] = date;
  }
  manifest.__generated = today();
  manifest.__source = FULL_SOURCE;
  manifest.__head = safeHead();
  return manifest;
}

function safeHead() {
  try {
    return git("rev-parse --short HEAD");
  } catch {
    return "";
  }
}

/** SHAs recorded in .git/shallow: their diffs are against an empty tree, so they list every file. */
function boundaryCommits() {
  try {
    const gitDir = git("rev-parse --git-dir");
    const file = path.isAbsolute(gitDir) ? path.join(gitDir, "shallow") : path.join(ROOT, gitDir, "shallow");
    if (!existsSync(file)) return new Set();
    return new Set(readFileSync(file, "utf8").split("\n").map((s) => s.trim()).filter(Boolean));
  } catch {
    return new Set();
  }
}

export function boundaryDates() {
  const dates = new Set();
  for (const sha of boundaryCommits()) {
    try {
      dates.add(git(`log -1 --format=%ad --date=short ${sha}`));
    } catch {}
  }
  return dates;
}

/** file (repo-relative) -> newest commit date among the commits visible to this clone, boundaries excluded. */
function visibleChanges() {
  const boundaries = boundaryCommits();
  const changed = new Map();
  let log = "";
  try {
    log = git("log --name-only --format=@@%H %ad --date=short");
  } catch {
    return changed;
  }
  let currentDate = null;
  let skip = false;
  for (const line of log.split("\n")) {
    if (line.startsWith("@@")) {
      const [sha, date] = line.slice(2).split(" ");
      skip = boundaries.has(sha);
      currentDate = date;
      continue;
    }
    const file = line.trim();
    if (!file || skip || !currentDate) continue;
    const prev = changed.get(file);
    if (!prev || currentDate > prev) changed.set(file, currentDate);
  }
  return changed;
}

/** Shallow-clone path: committed manifest + bumps for files changed in visible commits. */
export function bumpCommittedManifest() {
  if (!existsSync(MANIFEST_PATH)) {
    throw new Error("public/lastmod-manifest.json is missing. Run scripts/seo/refresh-lastmod-manifest.mjs on a full clone and commit it.");
  }
  const committed = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  if (committed.__source !== FULL_SOURCE) {
    throw new Error(`public/lastmod-manifest.json was not produced from full git history (__source=${committed.__source}). Run scripts/seo/refresh-lastmod-manifest.mjs on a full clone and commit it.`);
  }
  const changed = visibleChanges();
  const manifest = {};
  let bumped = 0;
  for (const [route, sources] of routeSources()) {
    const rels = sources.map((s) => path.relative(ROOT, s));
    let newest = committed[route] || null;
    for (const [file, date] of changed) {
      if (rels.some((rel) => file === rel || file.startsWith(rel + "/"))) {
        if (!newest || date > newest) newest = date;
      }
    }
    if (!newest) newest = committed.__generated || today();
    if (newest !== committed[route]) bumped++;
    manifest[route] = newest;
  }
  manifest.__generated = today();
  manifest.__source = FULL_SOURCE;
  manifest.__head = safeHead();
  manifest.__bumped_in_shallow_build = bumped;
  return manifest;
}

export function distribution(manifest) {
  const counts = new Map();
  for (const [route, date] of Object.entries(manifest)) {
    if (route.startsWith("__")) continue;
    counts.set(date, (counts.get(date) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

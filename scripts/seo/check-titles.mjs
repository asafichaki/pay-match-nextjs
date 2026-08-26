#!/usr/bin/env node
/**
 * Prebuild gate: the titles and descriptions this build would ship.
 *
 * Four checks, run over `public/seo-manifest.json` (which the manifest builder
 * writes just before this runs, so it is exactly what the build will serve):
 *
 *   1. em-dash and the other `forbidden_chars` from rules.json
 *   2. banned bylines (the two fabricated personas removed in PR 1)
 *   3. banned image names (same two, so a filename cannot come back)
 *   4. length regression against `scripts/seo/title-baseline.json`
 *
 * (1) to (3) read their lists from `src/lib/seo/rules.json` through
 * `rules.ts`'s Python twin's contract, never from a copy here. One rules
 * source is the whole point: the loop's `rules.py` reads the same file, and a
 * gate that disagreed with the loop would either block work the loop is
 * allowed to do or wave through work it is not.
 *
 * (4) is the one that needed a baseline. PR 1 cleaned 97 over-length titles
 * down; the risk from here is a slow slide back up, one commit at a time,
 * which no single diff makes obvious. The baseline records the rendered length
 * of every route at the moment it was written. A title may get shorter freely.
 * It may not get longer than the larger of its baseline and the rules cap, so
 * a page that is already over budget cannot get worse while a page inside
 * budget still has room to move.
 *
 * Refresh the baseline deliberately, never to make a red build green:
 *   node scripts/seo/check-titles.mjs --write-baseline
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, "public", "seo-manifest.json");
const BASELINE = path.join(ROOT, "scripts", "seo", "title-baseline.json");
const RULES = JSON.parse(readFileSync(path.join(ROOT, "src", "lib", "seo", "rules.json"), "utf8"));

const WRITE = process.argv.includes("--write-baseline");

if (!existsSync(MANIFEST)) {
  console.error("[check-titles] public/seo-manifest.json is missing. Run build-seo-manifest.mjs first.");
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));

// Static routes only. A DB row's title is the loop's and the editor's to
// change at runtime; blocking a build on it would mean a bad row in Supabase
// could stop every deploy.
const routes = manifest.routes.filter((r) => r.source === "static");

/** Length as a browser tab shows it. Mirrors rules.ts renderedTitleLength. */
function renderedLength(title, mode) {
  const suffix = RULES.title.suffix;
  if (mode === "absolute" || title.endsWith(suffix.trim())) return title.length;
  return title.length + suffix.length;
}

function cap(mode) {
  return mode === "absolute" ? RULES.title.absolute_max : RULES.title.body_max + RULES.title.suffix.length;
}

// ------------------------------------------------------------------ baseline
if (WRITE) {
  const out = {
    __generated: new Date().toISOString().slice(0, 10),
    __note:
      "Rendered title length per route at the moment this was written. check-titles.mjs fails a build whose title grew past max(baseline, rules cap). Regenerate only on a deliberate, reviewed change.",
    routes: Object.fromEntries(
      routes
        .map((r) => [r.route, { title_length: renderedLength(r.base_title || "", r.title_mode), title_mode: r.title_mode }])
        .sort((a, b) => a[0].localeCompare(b[0])),
    ),
  };
  writeFileSync(BASELINE, JSON.stringify(out, null, 2) + "\n");
  console.log(`[check-titles] baseline written: ${Object.keys(out.routes).length} routes -> ${path.relative(ROOT, BASELINE)}`);
  process.exit(0);
}

if (!existsSync(BASELINE)) {
  console.error(
    "[check-titles] scripts/seo/title-baseline.json is missing.\n" +
      "  Create it once with: node scripts/seo/check-titles.mjs --write-baseline",
  );
  process.exit(1);
}
const baseline = JSON.parse(readFileSync(BASELINE, "utf8"));

// -------------------------------------------------------------------- checks
const failures = [];
const warnings = [];

function scan(route, field, text) {
  if (!text) return;
  const low = text.toLowerCase();
  for (const ch of RULES.forbidden_chars) {
    if (ch && text.includes(ch)) {
      failures.push(`${route} ${field}: forbidden character ${JSON.stringify(ch)}`);
    }
  }
  for (const byline of RULES.banned_bylines) {
    if (low.includes(byline.toLowerCase())) {
      failures.push(`${route} ${field}: banned byline ${JSON.stringify(byline)}`);
    }
  }
  for (const name of RULES.banned_image_names || []) {
    if (low.includes(name.toLowerCase())) {
      failures.push(`${route} ${field}: banned image name ${JSON.stringify(name)}`);
    }
  }
}

let regressions = 0;
let overCap = 0;

for (const r of routes) {
  scan(r.route, "title", r.base_title);
  scan(r.route, "description", r.base_description);

  if (!r.base_title) {
    failures.push(`${r.route}: no base title`);
    continue;
  }

  const length = renderedLength(r.base_title, r.title_mode);
  const limit = cap(r.title_mode);
  const prior = baseline.routes?.[r.route]?.title_length;
  const allowed = prior === undefined ? limit : Math.max(prior, limit);

  if (length > allowed) {
    regressions++;
    failures.push(
      `${r.route}: title is ${length} chars, over the allowed ${allowed} ` +
        `(baseline ${prior ?? "none"}, rules cap ${limit}): ${JSON.stringify(r.base_title)}`,
    );
  } else if (length > limit) {
    overCap++;
    warnings.push(`${r.route}: ${length} chars, over the ${limit} cap but not worse than baseline ${prior}`);
  }

  if (r.base_description && r.base_description.length > RULES.meta.max) {
    const priorMeta = baseline.routes?.[r.route]?.meta_length;
    if (priorMeta === undefined || r.base_description.length > priorMeta) {
      warnings.push(`${r.route}: meta ${r.base_description.length} chars, over the ${RULES.meta.max} cap`);
    }
  }
}

const missingFromBaseline = routes.filter((r) => baseline.routes?.[r.route] === undefined).length;

if (warnings.length) {
  console.log(`[check-titles] ${warnings.length} title/meta(s) still over cap but not regressed:`);
  for (const w of warnings.slice(0, 10)) console.log(`  ${w}`);
  if (warnings.length > 10) console.log(`  ... and ${warnings.length - 10} more`);
}

if (failures.length) {
  console.error(`[check-titles] FAILED with ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  ${f}`);
  console.error(
    "\n[check-titles] A length regression is fixed by shortening the title, not by rewriting the\n" +
      "[check-titles] baseline. Only run --write-baseline when the new lengths are the intended state.",
  );
  process.exit(1);
}

console.log(
  `[check-titles] ok: ${routes.length} static routes, 0 forbidden chars, 0 banned bylines, ` +
    `0 regressions (${overCap} over cap and held, ${missingFromBaseline} new since baseline)`,
);

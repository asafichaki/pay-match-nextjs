#!/usr/bin/env node
/**
 * Pre-build gate: every ComparisonSchema quotation prop must carry the fields
 * required by schema.org/Quotation as Google ingests it for Q&A surfaces.
 *
 * Required: text, creator{@type,name}, publisher{@type,name}, isBasedOn (URL).
 * Recommended: inLanguage. creator must be Person or Organization.
 *
 * Why a gate: the GEO master rule (per geo-architect ensureExpertQuote) is
 * "no Quotation without required fields". Without enforcement, a typo or
 * partial refactor silently strips creator/publisher and Google falls back
 * to text-only attribution, costing the named-expert citation.
 *
 * Scope: walks every page.tsx that imports ComparisonSchema and passes a
 * `quotation={...}` prop, then statically inspects the literal object.
 *
 * Failure: process.exit(1) with file + missing-field list.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..", "..");
const SRC = path.join(ROOT, "src");

const REQUIRED_TOP_LEVEL = ["text", "creator", "publisher", "isBasedOn"];

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, acc);
    else if (name.endsWith(".tsx") || name.endsWith(".ts")) acc.push(p);
  }
  return acc;
}

function findEnclosingObject(src, startIdx) {
  // Find the `{` that starts the quotation object after `quotation=`.
  let i = startIdx;
  while (i < src.length && src[i] !== "{") i++;
  if (i >= src.length) return null;
  const start = i;
  let depth = 0;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return { start, end: i + 1, body: src.slice(start, i + 1) };
    }
  }
  return null;
}

const failures = [];

for (const file of walk(SRC)) {
  const src = readFileSync(file, "utf8");
  // ComparisonSchema (comparison shells) and ExpertQuote (insight pages) share
  // the QuotationPayload shape; both are gated.
  if (!src.includes("ComparisonSchema") && !src.includes("ExpertQuote")) continue;
  if (!src.includes("quotation=")) continue;

  const re = /quotation=\s*\{/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const obj = findEnclosingObject(src, m.index + "quotation=".length);
    if (!obj) {
      failures.push({ file, line: lineOf(src, m.index), reason: "could not parse object literal" });
      continue;
    }
    const body = obj.body;
    const missing = [];
    for (const key of REQUIRED_TOP_LEVEL) {
      // Match key at top-level via simple heuristic: `text:` or `text :` anywhere is fine for required-presence
      const keyRe = new RegExp(`\\b${key}\\s*:`);
      if (!keyRe.test(body)) missing.push(key);
    }
    // creator must declare @type Person or Organization
    if (!missing.includes("creator")) {
      const creatorTypeRe = /creator\s*:\s*\{[\s\S]*?["']@type["']\s*:\s*["'](Person|Organization)["']/;
      if (!creatorTypeRe.test(body)) missing.push('creator.@type=Person|Organization');
      const creatorNameRe = /creator\s*:\s*\{[\s\S]*?\bname\s*:\s*["'][^"']+["']/;
      if (!creatorNameRe.test(body)) missing.push("creator.name");
    }
    // publisher must declare name + @type
    if (!missing.includes("publisher")) {
      const pubNameRe = /publisher\s*:\s*\{[\s\S]*?\bname\s*:\s*["'][^"']+["']/;
      if (!pubNameRe.test(body)) missing.push("publisher.name");
      const pubTypeRe = /publisher\s*:\s*\{[\s\S]*?["']@type["']\s*:\s*["'](Organization|GovernmentOrganization)["']/;
      if (!pubTypeRe.test(body)) missing.push("publisher.@type=Organization|GovernmentOrganization");
    }
    // isBasedOn should look like a URL string
    if (!missing.includes("isBasedOn")) {
      const urlRe = /isBasedOn\s*:\s*["']https?:\/\/[^"']+["']/;
      if (!urlRe.test(body)) missing.push("isBasedOn (must be absolute http(s) URL)");
    }

    if (missing.length) {
      failures.push({ file, line: lineOf(src, m.index), missing });
    }
  }
}

function lineOf(src, idx) {
  return src.slice(0, idx).split("\n").length;
}

if (failures.length) {
  console.error("[check-quotation-schema] FAIL — Quotation payloads missing required fields:");
  for (const f of failures) {
    const rel = path.relative(ROOT, f.file);
    if (f.reason) {
      console.error(`  ${rel}:${f.line}  ${f.reason}`);
    } else {
      console.error(`  ${rel}:${f.line}  missing: ${f.missing.join(", ")}`);
    }
  }
  console.error("");
  console.error("Required: text, creator{@type,name}, publisher{@type,name}, isBasedOn(URL).");
  console.error("Reference: src/components/seo/ComparisonSchema.tsx QuotationPayload type.");
  process.exit(1);
}

console.log("[check-quotation-schema] OK — all ComparisonSchema Quotation payloads valid.");

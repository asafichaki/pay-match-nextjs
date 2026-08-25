#!/usr/bin/env node
/**
 * JSON-LD parse gate. Two modes, both wired into package.json:
 *
 *   --source  (prebuild)  Walks src/app/** for JSON-LD embedded as text inside
 *             template literals (`const html = \`<script type="application/ld+json">...\``).
 *             The literal is evaluated exactly the way JS does (so `\"` becomes `"`,
 *             which is the bug that broke the FAQPage on
 *             /insights/chargeback-management-solutions-... until PR 1), then every
 *             <script type="application/ld+json"> inside it is JSON.parse'd.
 *             Objects passed to <JsonLd data={...}> are JS object literals and are
 *             serialised with JSON.stringify at render, so they cannot break; the
 *             built-HTML mode below still covers them.
 *
 *   --built   (postbuild) Walks .next/server/app/** /*.html (every prerendered
 *             route) and JSON.parse's every ld+json block in the real output.
 *
 * Failure: process.exit(1) with file, block index and the parser message.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const mode = process.argv.includes("--built") ? "built" : "source";

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const SCRIPT_RE = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

function checkBlocks(label, text, failures) {
  let m;
  let idx = 0;
  let count = 0;
  SCRIPT_RE.lastIndex = 0;
  while ((m = SCRIPT_RE.exec(text)) !== null) {
    idx++;
    count++;
    const raw = m[1].trim();
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") throw new Error("not an object");
    } catch (e) {
      failures.push(`${label}  block #${idx}: ${e.message}`);
    }
  }
  return count;
}

const failures = [];
let blocks = 0;
let files = 0;

if (mode === "source") {
  const srcFiles = walk(path.join(ROOT, "src", "app")).filter((f) => /\.tsx?$/.test(f));
  // Template literals that contain an ld+json script. Non-greedy match on the
  // backtick pair, then evaluate with the same escape rules as JS.
  const TPL_RE = /`((?:[^`\\]|\\[\s\S])*?application\/ld\+json(?:[^`\\]|\\[\s\S])*?)`/g;
  for (const file of srcFiles) {
    const src = readFileSync(file, "utf8");
    if (!src.includes("application/ld+json")) continue;
    const rel = path.relative(ROOT, file);
    let m;
    TPL_RE.lastIndex = 0;
    while ((m = TPL_RE.exec(src)) !== null) {
      const literal = "`" + m[1] + "`";
      let evaluated;
      try {
        evaluated = vm.runInNewContext(literal, {}, { timeout: 1000 });
      } catch (e) {
        // Interpolations referencing page scope cannot be evaluated here; the
        // built-HTML pass covers them.
        continue;
      }
      files++;
      blocks += checkBlocks(rel, evaluated, failures);
    }
  }
} else {
  const appDir = path.join(ROOT, ".next", "server", "app");
  if (!existsSync(appDir)) {
    console.error("[check-jsonld] FAIL: .next/server/app not found. Run after `next build`.");
    process.exit(1);
  }
  const htmlFiles = walk(appDir).filter((f) => f.endsWith(".html"));
  for (const file of htmlFiles) {
    const html = readFileSync(file, "utf8");
    if (!html.includes("application/ld+json")) continue;
    files++;
    blocks += checkBlocks(path.relative(ROOT, file), html, failures);
  }
}

if (failures.length) {
  console.error(`[check-jsonld:${mode}] FAIL: ${failures.length} JSON-LD block(s) do not parse`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}

console.log(`[check-jsonld:${mode}] OK: ${blocks} JSON-LD blocks parsed across ${files} ${mode === "source" ? "template literals" : "prerendered HTML files"}.`);

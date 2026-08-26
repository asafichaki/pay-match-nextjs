#!/usr/bin/env node
/**
 * Pre-build gate: no file under public/images heavier than 400 KB.
 *
 * Why: on 2026-08-25 /comparisons/stripe-vs-paypal shipped 2,966 KB of images
 * on first load (a 2.7 MB byline photo, plain <img>, preloaded), and
 * public/images held five more files between 0.5 and 2.3 MB. The three hero
 * files were replaced with <= 200 KB versions in PR 1; this gate keeps it so.
 *
 * Override: none. Resize or re-encode the file (sharp is in node_modules).
 */
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIR = path.join(ROOT, "public", "images");
const LIMIT = 400 * 1024;

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, acc);
    else acc.push({ file: p, size: s.size });
  }
  return acc;
}

const files = walk(DIR);
const heavy = files.filter((f) => f.size > LIMIT);

if (heavy.length) {
  console.error(`[check-image-weight] FAIL: ${heavy.length} file(s) over ${LIMIT / 1024} KB in public/images`);
  for (const f of heavy) {
    console.error(`  ${path.relative(ROOT, f.file)}  ${(f.size / 1024).toFixed(0)} KB`);
  }
  process.exit(1);
}

const total = files.reduce((a, f) => a + f.size, 0);
console.log(`[check-image-weight] OK: ${files.length} files, ${(total / 1024).toFixed(0)} KB total, largest ${(Math.max(...files.map((f) => f.size)) / 1024).toFixed(0)} KB.`);

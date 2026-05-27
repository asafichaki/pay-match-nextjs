#!/usr/bin/env node
/**
 * Pre-build gate: VideoObject / AudioObject uploadDate must be ISO 8601 with timezone offset.
 *
 * Why: Google Search Console flagged mypayadvisor.com on 2026-05-27 with
 *   - "Datetime property 'uploadDate' is missing a timezone"
 *   - "Invalid datetime value for 'uploadDate'"
 * Root cause: naked YYYY-MM-DD literals and DB columns serialized without offset
 * leaked into JSON-LD because there was no compile-time check.
 *
 * Policy (per ~/.claude/projects/-Users-user/memory/feedback_policy_needs_pipeline_gate.md):
 *   every "never do X" rule pairs with a pipeline gate. This is that gate.
 *
 * Rule (per VideoObject/AudioObject occurrence in source):
 *   Find the enclosing JSON-LD object literal. It MUST contain an `uploadDate:` whose
 *   RHS resolves to one of:
 *     (a) an ISO 8601 string literal with Z or +/-HH:MM offset,
 *     (b) a const reference that resolves to (a) in the same file,
 *     (c) a `toIsoWithOffset(...)` call, paired with `if (!uploadDate) return null` in
 *         the enclosing closure (so an unparseable value never emits schema).
 *
 * Failure: process.exit(1) with a list of offending files + line numbers.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..", "..");
const SRC = path.join(ROOT, "src");

const ISO_WITH_OFFSET =
  /^['"`]\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})['"`]$/;

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next") continue;
    const full = path.join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walk(full, files);
    else if (/\.(tsx?|jsx?|mjs)$/.test(entry)) files.push(full);
  }
  return files;
}

/** Find the smallest balanced {...} containing position `start` (the `@type` index). */
function findEnclosingObject(text, start) {
  // Walk backward to nearest unmatched `{`.
  let depth = 0;
  let openIdx = -1;
  for (let i = start; i >= 0; i--) {
    const c = text[i];
    if (c === "}") depth++;
    else if (c === "{") {
      if (depth === 0) {
        openIdx = i;
        break;
      }
      depth--;
    }
  }
  if (openIdx === -1) return null;
  // Walk forward to matching `}`.
  let d = 0;
  for (let i = openIdx; i < text.length; i++) {
    const c = text[i];
    if (c === "{") d++;
    else if (c === "}") {
      d--;
      if (d === 0) return { start: openIdx, end: i };
    }
  }
  return null;
}

function lineNumberAt(text, pos) {
  return text.slice(0, pos).split("\n").length;
}

/** Resolve a bare identifier reference to its const string-literal initializer in the same file. */
function resolveConstLiteral(text, ident) {
  const re = new RegExp(`\\bconst\\s+${ident}\\s*=\\s*(['"\`][^'"\`]+['"\`])`);
  const m = text.match(re);
  return m ? m[1] : null;
}

const violations = [];

for (const file of walk(SRC)) {
  const text = readFileSync(file, "utf8");
  if (!/VideoObject|AudioObject/.test(text)) continue;

  const typeRe = /"@type"\s*:\s*"(VideoObject|AudioObject)"/g;
  let match;
  while ((match = typeRe.exec(text)) !== null) {
    const obj = findEnclosingObject(text, match.index);
    if (!obj) {
      violations.push(
        `${file}:${lineNumberAt(text, match.index)}  cannot locate enclosing JSON-LD object`,
      );
      continue;
    }
    const body = text.slice(obj.start, obj.end);
    // Match either explicit `uploadDate: <expr>` or ES6 shorthand `uploadDate,` / `uploadDate}` / `uploadDate\n`.
    const upExplicit = body.match(/uploadDate\s*:\s*([^,\n}]+)/);
    const upShorthand = !upExplicit && /(^|[\s,{])uploadDate\s*[,}\n]/.test(body);
    if (!upExplicit && !upShorthand) {
      violations.push(
        `${file}:${lineNumberAt(text, match.index)}  ${match[1]} has no uploadDate property`,
      );
      continue;
    }
    let rhs = upExplicit ? upExplicit[1].trim() : "uploadDate";
    const upMatchIndex = upExplicit
      ? upExplicit.index
      : body.search(/(^|[\s,{])uploadDate\s*[,}\n]/);
    const isShorthand = rhs === "uploadDate";
    const callsNormalizer = /toIsoWithOffset\s*\(/.test(rhs);

    if (ISO_WITH_OFFSET.test(rhs)) continue;

    // Resolve identifier -> const literal in same file
    if (/^[A-Z_][A-Z0-9_]*$/.test(rhs)) {
      const literal = resolveConstLiteral(text, rhs);
      if (literal && ISO_WITH_OFFSET.test(literal)) continue;
      violations.push(
        `${file}:${lineNumberAt(text, obj.start + upMatchIndex)}  uploadDate references const '${rhs}' which is not ISO 8601 + offset`,
      );
      continue;
    }

    // Shorthand or normalizer call — require the gate pattern in the surrounding closure.
    if (isShorthand || callsNormalizer) {
      // Look for `const uploadDate = toIsoWithOffset(...)` AND `if (!uploadDate) return null` in a generous window.
      const winStart = Math.max(0, obj.start - 800);
      const win = text.slice(winStart, obj.end + 200);
      const hasNormalizerAssign =
        /const\s+uploadDate\s*=\s*toIsoWithOffset\s*\(/.test(win) ||
        callsNormalizer;
      const hasNullGate =
        /if\s*\(\s*!uploadDate\s*\)\s*return\s+null/.test(win);
      if (hasNormalizerAssign && hasNullGate) continue;
      violations.push(
        `${file}:${lineNumberAt(text, obj.start + upMatchIndex)}  uploadDate uses shorthand/normalizer but missing 'const uploadDate = toIsoWithOffset(...)' + 'if (!uploadDate) return null' gate`,
      );
      continue;
    }

    violations.push(
      `${file}:${lineNumberAt(text, obj.start + upMatchIndex)}  uploadDate must be ISO 8601 with offset (or use toIsoWithOffset + null-gate). Got: ${rhs}`,
    );
  }
}

if (violations.length > 0) {
  console.error("\n[check-video-upload-date] FAIL — Google Rich Results requires ISO 8601 + timezone:\n");
  for (const v of violations) console.error("  " + v);
  console.error(
    "\nFix: use a literal like '2025-09-15T12:00:00-07:00' or '2025-09-15T19:00:00Z',",
  );
  console.error("or run the value through toIsoWithOffset() and gate schema emission on a non-null result.");
  console.error("Background: GSC flagged mypayadvisor.com on 2026-05-27 for this exact issue.\n");
  process.exit(1);
}

console.log("[check-video-upload-date] OK — all VideoObject/AudioObject uploadDate values valid.");

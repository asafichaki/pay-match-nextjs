#!/usr/bin/env node
/**
 * One-shot codemod: put the 46 live static shells on the SEO override layer.
 *
 * What it does to every file in the allowlist below:
 *   1. `export const metadata: Metadata = {`  ->  `const baseMetadata: Metadata = {`
 *   2. appends `export const revalidate = 3600;` and an async
 *      `generateMetadata()` that returns `withSeoOverride(kind, slug, baseMetadata)`
 *   3. adds the imports it needs
 *   4. inserts `<AeoAnswer kind slug />` directly under the H1 and
 *      `<RelatedLinks kind slug />` before the closing fragment
 *   5. on comparison and pricing shells, makes `title` absolute
 *      (`title: X` -> `title: { absolute: X }`). Check 1 (2026-08-26) found
 *      Google already drops the " | myPayAdvisor" suffix itself, and brand
 *      queries had 0 named impressions in 28 days, so the 15 characters buy
 *      nothing and cost headline room.
 *
 * THE ALLOWLIST IS EXPLICIT ON PURPOSE. Three hub routes
 * (`insights/page.tsx`, `comparisons/page.tsx`, `pulse/page.tsx`) already
 * export `revalidate` or `dynamic` and a second export would be a build
 * error; the 9 redirected insight folders in
 * `src/lib/insights/redirected-slugs.ts` still exist on disk but 301 away;
 * the 2 redirected comparison slugs in
 * `src/lib/comparisons/redirected-slugs.ts` are DB rows, not folders. None of
 * them are listed here. `--verify` re-derives the list from disk and fails if
 * it has drifted.
 *
 * Two shell shapes need a slot rather than an inline insert, because their H1
 * lives in a child component, not in page.tsx:
 *   - the 5 volume-tier shells render <VolumeTierPage tier=... />
 *   - the 8 other comparison shells render a *Content component
 * For those the codemod adds `aeoAnswer` / `relatedLinks` ReactNode props to
 * the child and passes the nodes down. The child renders the answer under its
 * own H1 and the links before its closing </main>.
 *
 * Usage:
 *   node scripts/seo/codemod-generate-metadata.mjs           # apply
 *   node scripts/seo/codemod-generate-metadata.mjs --dry-run # report only
 *   node scripts/seo/codemod-generate-metadata.mjs --verify  # allowlist parity
 *
 * The codemod is idempotent: a file that already has `generateMetadata` is
 * skipped. It is kept in the repo as the record of what was changed and as
 * the parity check, not because it is meant to run again.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "src", "app", "(public)");

// ---------------------------------------------------------------- allowlist
const COMPARISON_SHELLS = [
  "best-payment-processors-100k-250k-monthly-2026",
  "best-payment-processors-10k-25k-monthly-2026",
  "best-payment-processors-2026",
  "best-payment-processors-25k-50k-monthly-2026",
  "best-payment-processors-500k-1m-monthly-2026",
  "best-payment-processors-50k-100k-monthly-2026",
  "helcim-vs-stripe",
  "paymentcloud-vs-durango",
  "paymentcloud-vs-easy-pay-direct",
  "paypal-vs-square",
  "square-vs-stripe",
  "stripe-high-risk-alternatives",
  "stripe-vs-paypal",
];

const INSIGHT_SHELLS = [
  "approval-rate-recovery-routing-acquirers-3ds",
  "best-payment-gateway-ecommerce",
  "best-pos-systems-for-small-business-2026-niche-comparison-expert-picks",
  "chargeback-management-solutions-a-merchant-s-guide-to-prevention-recovery",
  "cost-of-payment-processing-professional-services",
  "cpacharge-vs-stripe-comparison-2026-choosing-the-right-payment-processor-for-pro",
  "credit-card-processing-fees-explained",
  "firearms-merchant-account",
  "free-statement-audit-playbook",
  "funds-frozen-what-to-do",
  "gaming-merchant-account",
  "helcim-review-2025",
  "high-risk-instant-approval-reality",
  "high-risk-payment-processing-guide",
  "how-to-read-merchant-statement",
  "in-person-payments-hardware-lockin-mdr",
  "level-2-level-3-processing-guide",
  "lowest-transaction-fees-for-merchant-payment-apps-2026-a-mypayadvisor-guide",
  "merchant-account-for-cbd",
  "merchant-contract-cancellation-guide",
  "merchant-services-glossary",
  "merchant-statement-audit-guide",
  "nutra-supplement-merchant-account",
  "online-vs-instore-payments",
  "payment-advisory-solutions-optimizing-your-merchant-operations",
  "payment-gateway-vs-processor-2026-pricing-functions-best-choice",
  "payment-processor-fees-guide",
  "payment-processor-negotiation-playbook",
  "reserves-frozen-funds-capped-vs-rolling",
  "should-customers-see-the-same-payment-options-online-and-in-store-a-2026-merchan",
  "small-business-credit-card-processing-guide",
  "subscription-merchant-account",
  "travel-merchant-account",
];

/** Shells whose H1 is inside a child component: slug -> child file + component. */
const DELEGATED = {
  "best-payment-processors-2026": "BestPaymentProcessors2026Content",
  "helcim-vs-stripe": "HelcimVsStripeContent",
  "paymentcloud-vs-durango": "PaymentCloudVsDurangoContent",
  "paymentcloud-vs-easy-pay-direct": "PaymentCloudVsEasyPayDirectContent",
  "paypal-vs-square": "PayPalVsSquareContent",
  "square-vs-stripe": "SquareVsStripeContent",
  "stripe-high-risk-alternatives": "StripeHighRiskAlternativesContent",
  "stripe-vs-paypal": "StripeVsPayPalContent",
};

const TIER_SHELLS = COMPARISON_SHELLS.filter((s) => /monthly-2026$/.test(s));

// Same token set as the loop's config.PRICING_TOKENS, so "pricing page" means
// the same thing on both sides of the contract.
const PRICING_TOKENS = new Set([
  "fees", "fee", "pricing", "cost", "costs", "rates", "rate", "cheapest", "lowest",
]);

function isPricingSlug(slug) {
  return slug.split("-").some((t) => PRICING_TOKENS.has(t));
}

/** Comparison shells and pricing shells lose the " | myPayAdvisor" suffix. */
function wantsAbsoluteTitle(kind, slug) {
  return kind === "comparisons" || isPricingSlug(slug);
}

// ------------------------------------------------------------------ helpers
const DRY = process.argv.includes("--dry-run");
const VERIFY = process.argv.includes("--verify");

function read(p) {
  return fs.readFileSync(p, "utf8");
}

function write(p, s) {
  if (DRY) return;
  fs.writeFileSync(p, s);
}

/** Index just past the matching `</h1>` of the first `<h1` in `src`. */
function afterFirstH1(src) {
  const open = src.indexOf("<h1");
  if (open === -1) return -1;
  const close = src.indexOf("</h1>", open);
  if (close === -1) return -1;
  return close + "</h1>".length;
}

function indentAt(src, at) {
  // `at` may sit on the newline that ends its own line, so step back one.
  const lineStart = src.lastIndexOf("\n", Math.max(0, at - 1)) + 1;
  return (src.slice(lineStart).match(/^[ \t]*/) || [""])[0];
}

/** Put `text` on its own line after `at`, at the indentation of that line. */
function insertAfter(src, at, text) {
  const indent = indentAt(src, at);
  return `${src.slice(0, at)}\n${indent}${text}${src.slice(at)}`;
}

/** Put `text` on its own line immediately before the token starting at `at`. */
function insertBefore(src, at, text) {
  const indent = indentAt(src, at);
  return `${src.slice(0, at)}${text}\n${indent}${src.slice(at)}`;
}

function addImport(src, statement) {
  if (src.includes(statement)) return src;
  const importRe = /^import .*?;$/gm;
  let last = null;
  let m;
  while ((m = importRe.exec(src)) !== null) last = m;
  if (!last) return `${statement}\n${src}`;
  const at = last.index + last[0].length;
  return `${src.slice(0, at)}\n${statement}${src.slice(at)}`;
}

/**
 * `title: <expr>,` -> `title: { absolute: <expr> },` on the metadata object's
 * own `title` key only (two-space indent inside `const baseMetadata = {`).
 * Already-absolute titles are left alone.
 */
function makeTitleAbsolute(src) {
  const start = src.indexOf("const baseMetadata: Metadata = {");
  if (start === -1) return { src, changed: false };
  const re = /\n  title: (.+),\n/;
  const region = src.slice(start);
  const m = region.match(re);
  if (!m) return { src, changed: false };
  const expr = m[1].trim();
  if (expr.startsWith("{")) return { src, changed: false }; // already a shape
  const replaced = region.replace(re, `\n  title: { absolute: ${expr} },\n`);
  return { src: src.slice(0, start) + replaced, changed: true };
}

const GENERATED = (kind, slug) => `

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return withSeoOverride("${kind}", "${slug}", baseMetadata);
}`;

/** `<Child ... />` with the two slots, laid out over four lines. */
function slotCall(component, extraProp, kind, slug, indent) {
  const inner = `${indent}  `;
  const props = [
    extraProp,
    `aeoAnswer={<AeoAnswer kind="${kind}" slug="${slug}" />}`,
    `relatedLinks={<RelatedLinks kind="${kind}" slug="${slug}" />}`,
  ].filter(Boolean);
  return `<${component}\n${props.map((p) => inner + p).join("\n")}\n${indent}/>`;
}

// ------------------------------------------------------------------ actions
function patchDelegatedChild(dir, component, changes) {
  const file = path.join(dir, `${component}.tsx`);
  if (!fs.existsSync(file)) throw new Error(`missing child component ${file}`);
  let src = read(file);
  if (src.includes("aeoAnswer")) {
    changes.push(`skip (already patched) ${path.relative(ROOT, file)}`);
    return;
  }

  const sig = `export default function ${component}() {`;
  if (!src.includes(sig)) throw new Error(`unexpected signature in ${file}`);
  src = src.replace(
    sig,
    `export default function ${component}({ aeoAnswer, relatedLinks }: ContentSlots) {`,
  );

  // Slot type. Declared above the component so both server and client
  // components in this set compile with the same shape.
  const typeDecl = `
interface ContentSlots {
  /** <AeoAnswer> from page.tsx. Rendered directly under the H1. */
  aeoAnswer?: React.ReactNode;
  /** <RelatedLinks> from page.tsx. Rendered at the end of the article. */
  relatedLinks?: React.ReactNode;
}
`;
  const sigAt = src.indexOf(`export default function ${component}(`);
  src = src.slice(0, sigAt) + typeDecl.trimStart() + "\n" + src.slice(sigAt);

  const h1End = afterFirstH1(src);
  if (h1End === -1) throw new Error(`no H1 in ${file}`);
  src = insertAfter(src, h1End, "{aeoAnswer}");

  const lastMain = src.lastIndexOf("</main>");
  if (lastMain === -1) throw new Error(`no </main> in ${file}`);
  src = insertBefore(src, lastMain, "{relatedLinks}");

  write(file, src);
  changes.push(`patched child ${path.relative(ROOT, file)}`);
}

function patchShell(kind, slug, changes) {
  const dir = path.join(PUBLIC_DIR, kind, slug);
  const file = path.join(dir, "page.tsx");
  let src = read(file);
  if (src.includes("generateMetadata")) {
    changes.push(`skip (already on the layer) ${kind}/${slug}`);
    return;
  }
  if (!src.includes("export const metadata: Metadata = {")) {
    throw new Error(`${kind}/${slug}: no "export const metadata: Metadata = {"`);
  }
  if (/export const (revalidate|dynamic)\b/.test(src)) {
    throw new Error(`${kind}/${slug}: already exports revalidate or dynamic`);
  }

  src = src.replace("export const metadata: Metadata = {", "const baseMetadata: Metadata = {");
  src = addImport(src, 'import { withSeoOverride } from "@/lib/seo/overrides";');

  if (wantsAbsoluteTitle(kind, slug)) {
    const r = makeTitleAbsolute(src);
    src = r.src;
    if (r.changed) changes.push(`  title -> absolute on ${kind}/${slug}`);
  }

  src = addImport(src, 'import { AeoAnswer } from "@/components/seo/AeoAnswer";');
  src = addImport(src, 'import { RelatedLinks } from "@/components/seo/RelatedLinks";');

  if (TIER_SHELLS.includes(slug)) {
    const call = "<VolumeTierPage tier={tier} />";
    if (!src.includes(call)) throw new Error(`${slug}: unexpected VolumeTierPage call`);
    const indent = indentAt(src, src.indexOf(call));
    src = src.replace(call, slotCall("VolumeTierPage", "tier={tier}", kind, slug, indent));
  } else if (DELEGATED[slug]) {
    const component = DELEGATED[slug];
    const call = `<${component} />`;
    if (!src.includes(call)) throw new Error(`${slug}: no ${call} in page.tsx`);
    const indent = indentAt(src, src.indexOf(call));
    src = src.replace(call, slotCall(component, null, kind, slug, indent));
    patchDelegatedChild(dir, component, changes);
  } else {
    const h1End = afterFirstH1(src);
    if (h1End === -1) throw new Error(`${kind}/${slug}: no H1 in page.tsx`);
    src = insertAfter(src, h1End, `<AeoAnswer kind="${kind}" slug="${slug}" />`);
    // Before the closing fragment of the default export.
    const closeFragment = src.lastIndexOf("</>");
    if (closeFragment === -1) throw new Error(`${kind}/${slug}: no closing fragment`);
    src = insertBefore(src, closeFragment, `<RelatedLinks kind="${kind}" slug="${slug}" />`);
  }

  // generateMetadata goes right after the metadata object literal.
  const metaStart = src.indexOf("const baseMetadata: Metadata = {");
  const metaEnd = src.indexOf("\n};", metaStart) + "\n};".length;
  src = src.slice(0, metaEnd) + GENERATED(kind, slug) + src.slice(metaEnd);

  write(file, src);
  changes.push(`patched ${kind}/${slug}`);
}

// ------------------------------------------------------------------- verify
function liveSlugsOnDisk(kind, redirectedFile) {
  const redirected = new Set(
    (read(path.join(ROOT, redirectedFile)).match(/"[^"]+"/g) || []).map((s) => s.slice(1, -1)),
  );
  return fs
    .readdirSync(path.join(PUBLIC_DIR, kind), { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("[") && !e.name.startsWith("_"))
    .map((e) => e.name)
    .filter((s) => !redirected.has(s))
    .filter((s) => fs.existsSync(path.join(PUBLIC_DIR, kind, s, "page.tsx")))
    .sort();
}

function verifyAllowlist() {
  const problems = [];
  const pairs = [
    ["comparisons", COMPARISON_SHELLS, "src/lib/comparisons/redirected-slugs.ts"],
    ["insights", INSIGHT_SHELLS, "src/lib/insights/redirected-slugs.ts"],
  ];
  for (const [kind, list, redirectedFile] of pairs) {
    const disk = liveSlugsOnDisk(kind, redirectedFile);
    const missing = disk.filter((s) => !list.includes(s));
    const extra = list.filter((s) => !disk.includes(s));
    if (missing.length) problems.push(`${kind}: on disk but not in the allowlist: ${missing.join(", ")}`);
    if (extra.length) problems.push(`${kind}: in the allowlist but not live on disk: ${extra.join(", ")}`);
  }
  if (problems.length) {
    console.error("[codemod:verify] allowlist drift:\n  " + problems.join("\n  "));
    process.exit(1);
  }
  console.log(
    `[codemod:verify] OK: ${COMPARISON_SHELLS.length} comparison + ${INSIGHT_SHELLS.length} insight shells match disk.`,
  );
}

// --------------------------------------------------------------------- main
function main() {
  if (VERIFY) {
    verifyAllowlist();
    return;
  }
  const changes = [];
  const failures = [];
  for (const slug of COMPARISON_SHELLS) {
    try {
      patchShell("comparisons", slug, changes);
    } catch (e) {
      failures.push(`comparisons/${slug}: ${e.message}`);
    }
  }
  for (const slug of INSIGHT_SHELLS) {
    try {
      patchShell("insights", slug, changes);
    } catch (e) {
      failures.push(`insights/${slug}: ${e.message}`);
    }
  }
  for (const line of changes) console.log(line);
  if (failures.length) {
    console.error(`\n${failures.length} failures:`);
    for (const f of failures) console.error("  " + f);
    process.exit(1);
  }
  console.log(
    `\n${DRY ? "[dry run] " : ""}${changes.filter((c) => c.startsWith("patched ")).length} shells on the override layer.`,
  );
}

main();

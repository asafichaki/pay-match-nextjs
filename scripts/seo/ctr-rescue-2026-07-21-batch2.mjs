/**
 * CTR & rank rescue — BATCH 2. 10 DB-backed blog_articles rows (comparisons + insights).
 * Direct continuation of scripts/seo/ctr-rescue-2026-07-21.mjs (batch 1, commit 1f7fccc).
 *
 * Root cause (batch 1): src/app/layout.tsx appends "%s | myPayAdvisor" (~15c), so any
 * meta_title > 45c truncates in Google SERPs. Every new meta_title below is budgeted <= 45c
 * AND front-loads the page's real GSC money query (28d, pulled per page).
 *
 * WHAT IT DOES per slug (idempotent):
 *   - meta_title      : SERP title, <= 45c, money-query front-loaded.
 *   - title (H1)      : answer-first, verdict grounded in the page's own body (no fabrication).
 *   - meta_description: only overwritten where flagged; else left as-is (already strong).
 *   - body_html       : appends a "Related comparisons" internal-link block
 *                       (marker id="related-comparisons"); stripped+reinserted on re-run.
 *                       Every body already opens with a TL;DR answer-first paragraph, so the
 *                       AEO answer sentence is already present in-body; not duplicated here.
 *   - updated_at      : bumped to now() on apply (freshness signal).
 *
 * Every H1 verdict below is copied from the row's own body_html / key_findings (grounded).
 * Every "Related comparisons" href is a real, existing page (verified against the app router
 * + GSC top-pages on 2026-07-21).
 *
 * SAFETY: default = DRY RUN (no writes). Pass --apply to write.
 *
 *   node scripts/seo/ctr-rescue-2026-07-21-batch2.mjs            # dry run, prints diff
 *   node scripts/seo/ctr-rescue-2026-07-21-batch2.mjs --apply    # writes to Supabase
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const APPLY = process.argv.includes("--apply");
const BRAND_SUFFIX = 15; // " | myPayAdvisor"
const META_TITLE_BUDGET = 45; // keep full SERP title <= ~60c after brand suffix

function loadEnv() {
  const p = path.join(process.cwd(), ".env.local");
  const raw = fs.readFileSync(p, "utf8");
  const get = (k) => (raw.match(new RegExp("^" + k + '="?([^"\\n]+)"?', "m")) || [])[1];
  return { url: get("NEXT_PUBLIC_SUPABASE_URL"), key: get("SUPABASE_SERVICE_ROLE_KEY") };
}

const RELATED_MARKER_RE = /<section id="related-comparisons">[\s\S]*?<\/section>/i;

function relatedSection(links) {
  const items = links
    .map((l) => `<li><a href="${l.href}">${l.text}</a>: ${l.note}</li>`)
    .join("");
  return `<section id="related-comparisons"><h2>Related comparisons</h2><ul>${items}</ul></section>`;
}

// [kind, slug] -> patch. meta_description omitted = keep current (already strong).
const PLAN = {
  "comparisons/best-pos-systems-for-small-business-2026": {
    meta_title: "Best POS Systems for Small Business 2026",
    title: "Best POS Systems for Small Business 2026: Square Under $50K, Helcim Above",
    related: [
      { href: "/insights/best-pos-systems-for-small-business-2026-niche-comparison-expert-picks", text: "Best POS system by business type", note: "expert picks for retail, restaurant, mobile, and service." },
      { href: "/comparisons/best-no-contract-payment-processors-2026", text: "Best no-contract payment processors 2026", note: "month-to-month POS options with no lock-in." },
      { href: "/comparisons/square-vs-stripe", text: "Square vs Stripe", note: "the retail-first versus online-first POS question." },
    ],
  },
  "comparisons/stripe-vs-stax-2026": {
    meta_title: "Stripe vs Stax 2026: Which Costs Less",
    title: "Stripe vs Stax 2026: Stax Wins Above ~$9K Monthly, Stripe Below $20K",
    related: [
      { href: "/comparisons/stripe-vs-adyen-2026", text: "Stripe vs Adyen 2026", note: "which flat-rate alternative wins above $1M monthly." },
      { href: "/comparisons/square-vs-helcim-2026", text: "Square vs Helcim 2026", note: "interchange-plus for small and mid volume." },
      { href: "/comparisons/best-payment-processors-2026", text: "Best payment processors 2026", note: "15 processors ranked by effective rate." },
    ],
  },
  "comparisons/square-vs-shopify-payments-2026": {
    meta_title: "Square vs Shopify Payments 2026: Real Cost",
    title: "Square vs Shopify Payments 2026: Rates Tie, Square Wins Unless You Run a Shopify Store",
    related: [
      { href: "/comparisons/square-vs-stripe", text: "Square vs Stripe", note: "retail POS versus API-first payments." },
      { href: "/comparisons/paypal-vs-square", text: "PayPal vs Square", note: "checkout-first versus point-of-sale." },
      { href: "/comparisons/best-payment-processors-2026", text: "Best payment processors 2026", note: "15 processors ranked by effective rate." },
    ],
  },
  "comparisons/best-no-contract-payment-processors-2026": {
    meta_title: "Best No-Contract Payment Processors 2026",
    title: "Best No-Contract Payment Processors 2026: Helcim Wins $25K to $500K Monthly",
    related: [
      { href: "/comparisons/helcim-vs-stripe", text: "Helcim vs Stripe", note: "interchange-plus versus flat-rate, no contract either way." },
      { href: "/comparisons/square-vs-helcim-2026", text: "Square vs Helcim 2026", note: "free next-day funding versus lowest effective rate." },
      { href: "/comparisons/best-payment-processors-2026", text: "Best payment processors 2026", note: "15 processors ranked by effective rate." },
    ],
  },
  "comparisons/best-payment-processors-for-nonprofits-2026": {
    meta_title: "Best Payment Processors for Nonprofits 2026",
    title: "Best Payment Processors for Nonprofits 2026: PayPal Under $50K, Helcim Above",
    related: [
      { href: "/comparisons/stripe-vs-paypal", text: "Stripe vs PayPal", note: "donor checkout and recurring giving compared." },
      { href: "/comparisons/helcim-vs-stripe", text: "Helcim vs Stripe", note: "interchange-plus savings above $25K in donations." },
      { href: "/comparisons/best-payment-processors-2026", text: "Best payment processors 2026", note: "15 processors ranked by effective rate." },
    ],
  },
  "comparisons/best-payment-processors-b2b-saas-2026": {
    meta_title: "Best Payment Processors for B2B SaaS 2026",
    title: "Best Payment Processors for B2B SaaS 2026: Stripe Under $1M, Helcim Above $250K",
    related: [
      { href: "/insights/level-2-level-3-processing-guide", text: "Level 2 and Level 3 processing guide", note: "cut commercial-card interchange 0.40% to 0.90%." },
      { href: "/comparisons/stripe-vs-stax-2026", text: "Stripe vs Stax 2026", note: "flat-rate versus subscription on recurring volume." },
      { href: "/comparisons/helcim-vs-stripe", text: "Helcim vs Stripe", note: "interchange-plus above $250K with a commercial mix." },
    ],
  },
  "insights/pin-debit-routing": {
    meta_title: "PIN Debit Routing: Cut Debit Cost in 2026",
    title: "PIN Debit Routing: Cut Debit Cost 0.15% to 0.35% in 2026",
    related: [
      { href: "/insights/level-2-level-3-processing-guide", text: "Level 2 and Level 3 processing guide", note: "another lever to lower commercial-card interchange." },
      { href: "/insights/how-to-read-merchant-statement", text: "How to read a merchant statement", note: "spot the routing and network fees on your bill." },
      { href: "/insights/payment-processor-fees-guide", text: "Credit card processing fees guide", note: "interchange, markup, and average rates explained." },
    ],
  },
  "comparisons/best-payment-processors-mobile-and-on-the-go-2026": {
    meta_title: "Best Mobile Payment Processors 2026",
    title: "Best Mobile Payment Processors 2026: Square Under $30K, Helcim Above $40K",
    related: [
      { href: "/comparisons/square-vs-helcim-2026", text: "Square vs Helcim 2026", note: "the mobile crossover in detail." },
      { href: "/comparisons/best-no-contract-payment-processors-2026", text: "Best no-contract payment processors 2026", note: "portable readers with no lock-in." },
      { href: "/comparisons/best-payment-processors-2026", text: "Best payment processors 2026", note: "15 processors ranked by effective rate." },
    ],
  },
  "comparisons/ai-reconciliation-tools-2026": {
    meta_title: "AI Reconciliation Tools 2026: Compared",
    title: "AI Reconciliation Tools 2026: Stripe Sigma Leads Above $100K Monthly",
    related: [
      { href: "/comparisons/ai-subscription-billing-tools-2026", text: "AI subscription billing tools 2026", note: "recovery and dunning for recurring revenue." },
      { href: "/comparisons/best-payment-processors-b2b-saas-2026", text: "Best payment processors for B2B SaaS 2026", note: "the finance-team billing stack compared." },
      { href: "/insights/how-to-read-merchant-statement", text: "How to read a merchant statement", note: "tie payouts to fees line by line." },
    ],
  },
  "comparisons/ai-subscription-billing-tools-2026": {
    meta_title: "AI Subscription Billing Tools 2026",
    title: "AI Subscription Billing Tools 2026: Stripe Billing Leads $25K to $5M Monthly",
    related: [
      { href: "/comparisons/ai-reconciliation-tools-2026", text: "AI reconciliation tools 2026", note: "the payout-matching side of the stack." },
      { href: "/comparisons/best-payment-processors-b2b-saas-2026", text: "Best payment processors for B2B SaaS 2026", note: "effective rate by volume tier for SaaS." },
      { href: "/comparisons/stripe-vs-stax-2026", text: "Stripe vs Stax 2026", note: "flat-rate versus subscription above $80K recurring." },
    ],
  },
};

// Budget guard: refuse to run if any meta_title busts the SERP budget.
for (const [key, p] of Object.entries(PLAN)) {
  if (p.meta_title.length > META_TITLE_BUDGET) {
    console.error(`FATAL: ${key} meta_title is ${p.meta_title.length}c (> ${META_TITLE_BUDGET}c budget)`);
    process.exit(1);
  }
}

const { url, key } = loadEnv();
const sb = createClient(url, key);

let changed = 0;
const total = Object.keys(PLAN).length;
for (const [pathKey, p] of Object.entries(PLAN)) {
  const [kind, slug] = pathKey.split("/", 2);
  const realSlug = pathKey.slice(kind.length + 1);
  const { data, error } = await sb
    .from("blog_articles")
    .select("slug,kind,title,meta_title,meta_description,body_html,updated_at")
    .eq("kind", kind)
    .eq("slug", realSlug)
    .maybeSingle();
  if (error || !data) {
    console.log(`\n[${pathKey}] SKIP: ${error ? error.message : "not found"}`);
    continue;
  }

  const newBody =
    (data.body_html || "").replace(RELATED_MARKER_RE, "").trimEnd() + relatedSection(p.related);

  const patch = {
    meta_title: p.meta_title,
    title: p.title,
    body_html: newBody,
    updated_at: new Date().toISOString(),
  };
  if (p.meta_description) patch.meta_description = p.meta_description;

  const titleFull = p.meta_title.length + BRAND_SUFFIX;
  console.log(`\n===== ${pathKey} =====`);
  console.log(`  H1:    "${data.title}"`);
  console.log(`     ->  "${p.title}"`);
  console.log(`  meta:  "${data.meta_title}" (${(data.meta_title || "").length}c)`);
  console.log(`     ->  "${p.meta_title}" (${p.meta_title.length}c, ~${titleFull}c with brand)`);
  if (p.meta_description) console.log(`  desc changed -> "${p.meta_description}" (${p.meta_description.length}c)`);
  console.log(`  body:  +${newBody.length - (data.body_html || "").length}c (Related comparisons, ${p.related.length} links)`);

  if (APPLY) {
    const { error: uerr } = await sb.from("blog_articles").update(patch).eq("kind", kind).eq("slug", realSlug);
    if (uerr) {
      console.log(`  APPLY ERROR: ${uerr.message}`);
      continue;
    }
    console.log("  APPLIED.");
    changed++;
  }
}

console.log(`\n${APPLY ? `Applied ${changed}/${total} rows.` : "DRY RUN. Re-run with --apply to write."}`);
console.log("Note: pages are ISR (revalidate 3600). Apply refreshes within the hour, or revalidate the paths.");

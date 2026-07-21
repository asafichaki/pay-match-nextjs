/**
 * CTR & rank rescue for the 5 DB-backed comparison pages (blog_articles rows).
 * Ships alongside the 3 static-page edits committed in the same change.
 *
 * WHAT IT DOES per slug (idempotent):
 *   - meta_title      : SERP title, budgeted <= 45c so "%s | myPayAdvisor"
 *                       (template in src/app/layout.tsx appends ~15c) survives ~60c.
 *   - meta_description: front-loads the answer where changed (else left as-is).
 *   - title (H1)      : rewritten answer-first for AEO extractability.
 *   - body_html       : appends a "Related comparisons" internal-link section
 *                       (marker id="related-comparisons"), stripped+reinserted on
 *                       re-run so it never duplicates.
 *   - updated_at      : bumped to now() on apply (freshness signal).
 *
 * SAFETY: default = DRY RUN (no writes). Pass --apply to write.
 * Run AFTER the attribution deploy lands to avoid concurrent-change collisions.
 *
 *   node scripts/seo/ctr-rescue-2026-07-21.mjs            # dry run, prints diff
 *   node scripts/seo/ctr-rescue-2026-07-21.mjs --apply    # writes to Supabase
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const APPLY = process.argv.includes("--apply");
const BRAND_SUFFIX = 15; // " | myPayAdvisor"

function loadEnv() {
  const p = path.join(process.cwd(), ".env.local");
  const raw = fs.readFileSync(p, "utf8");
  const get = (k) => (raw.match(new RegExp("^" + k + '="?([^"\\n]+)"?', "m")) || [])[1];
  return { url: get("NEXT_PUBLIC_SUPABASE_URL"), key: get("SUPABASE_SERVICE_ROLE_KEY") };
}

const RELATED_MARKER_RE =
  /<section id="related-comparisons">[\s\S]*?<\/section>/i;

function relatedSection(links) {
  const items = links
    .map((l) => `<li><a href="${l.href}">${l.text}</a>: ${l.note}</li>`)
    .join("");
  return `<section id="related-comparisons"><h2>Related comparisons</h2><ul>${items}</ul></section>`;
}

// Every href below is a real, existing page (3 static + 5 DB comparison slugs).
const PLAN = {
  "stripe-vs-payment-depot-2026": {
    meta_title: "Stripe vs Payment Depot 2026: Fees Compared",
    meta_description:
      "Payment Depot beats Stripe above about $30K monthly. Compare 2026 pricing, break-even volume, hidden fees, and effective cost at $50K, $100K, and $250K.",
    title: "Stripe vs Payment Depot 2026: Payment Depot Wins Above $30K",
    related: [
      { href: "/comparisons/stripe-vs-adyen-2026", text: "Stripe vs Adyen 2026", note: "which wins above $1M monthly volume." },
      { href: "/comparisons/best-payment-processors-2026", text: "Best payment processors 2026", note: "15 processors ranked by effective rate." },
      { href: "/insights/payment-processor-fees-guide", text: "Credit card processing fees guide", note: "interchange, markup, and average rates explained." },
    ],
  },
  "stripe-vs-adyen-2026": {
    meta_title: "Stripe vs Adyen 2026: Fees & Pricing Compared",
    meta_description:
      "Adyen vs Stripe fees compared for 2026. Stripe wins below $1M monthly; Adyen's Interchange++ wins above. See break-even math and effective rates by tier.",
    title: "Stripe vs Adyen 2026: Fees, Pricing, and the $1M Break-Even",
    related: [
      { href: "/comparisons/stripe-vs-payment-depot-2026", text: "Stripe vs Payment Depot 2026", note: "a cheaper Stripe alternative above $30K monthly." },
      { href: "/comparisons/best-payment-processors-2026", text: "Best payment processors 2026", note: "15 processors ranked by effective rate." },
      { href: "/comparisons/square-vs-helcim-2026", text: "Square vs Helcim 2026", note: "interchange-plus for small and mid volume." },
    ],
  },
  "square-vs-helcim-2026": {
    meta_title: "Square vs Helcim 2026: Helcim Saves $90-$130",
    meta_description: null, // keep current (already strong at 147c)
    title: "Square vs Helcim 2026: Helcim Wins Above $10K Monthly",
    related: [
      { href: "/comparisons/square-vs-stripe", text: "Square vs Stripe", note: "retail versus online-first channel mix." },
      { href: "/comparisons/square-vs-toast-2026", text: "Square vs Toast 2026", note: "the restaurant POS question." },
      { href: "/comparisons/best-payment-processors-2026", text: "Best payment processors 2026", note: "15 processors ranked by effective rate." },
    ],
  },
  "square-vs-toast-2026": {
    meta_title: "Square vs Toast 2026: Restaurant POS Compared",
    meta_description: null, // keep current (139c)
    title: "Square vs Toast 2026: Toast Wins Above $50K, Square Below",
    related: [
      { href: "/comparisons/square-vs-helcim-2026", text: "Square vs Helcim 2026", note: "a cheaper interchange-plus alternative to Square." },
      { href: "/comparisons/square-vs-stripe", text: "Square vs Stripe", note: "retail versus online-first channel mix." },
      { href: "/comparisons/best-payment-processors-2026", text: "Best payment processors 2026", note: "15 processors ranked by effective rate." },
    ],
  },
  "best-payment-processors-with-same-day-deposit-2026": {
    meta_title: "Same-Day Deposit & Settlement Processors 2026",
    meta_description: null, // keep current (138c)
    title: "Best Payment Processors With Same-Day Deposit and Settlement (2026)",
    related: [
      { href: "/comparisons/best-payment-processors-2026", text: "Best payment processors 2026", note: "15 processors ranked by effective rate." },
      { href: "/comparisons/square-vs-stripe", text: "Square vs Stripe", note: "instant payouts versus API-first payments." },
      { href: "/comparisons/square-vs-helcim-2026", text: "Square vs Helcim 2026", note: "free next-day funding versus paid instant transfers." },
    ],
  },
};

const { url, key } = loadEnv();
const sb = createClient(url, key);

let changed = 0;
for (const [slug, p] of Object.entries(PLAN)) {
  const { data, error } = await sb
    .from("blog_articles")
    .select("slug,title,meta_title,meta_description,body_html,updated_at")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) {
    console.log(`\n[${slug}] SKIP: ${error ? error.message : "not found"}`);
    continue;
  }

  const newBody =
    (data.body_html || "").replace(RELATED_MARKER_RE, "").trimEnd() +
    relatedSection(p.related);

  const patch = {
    meta_title: p.meta_title,
    title: p.title,
    body_html: newBody,
    updated_at: new Date().toISOString(),
  };
  if (p.meta_description) patch.meta_description = p.meta_description;

  const titleFull = (p.meta_title || "").length + BRAND_SUFFIX;
  console.log(`\n===== ${slug} =====`);
  console.log(`  H1:    "${data.title}"`);
  console.log(`     ->  "${p.title}"`);
  console.log(`  meta:  "${data.meta_title}" (${(data.meta_title || "").length}c)`);
  console.log(`     ->  "${p.meta_title}" (${p.meta_title.length}c, ~${titleFull}c with brand)`);
  if (p.meta_description) console.log(`  desc changed -> "${p.meta_description}" (${p.meta_description.length}c)`);
  console.log(`  body:  +${newBody.length - (data.body_html || "").length}c (Related comparisons, ${p.related.length} links)`);

  if (APPLY) {
    const { error: uerr } = await sb.from("blog_articles").update(patch).eq("slug", slug);
    if (uerr) { console.log(`  APPLY ERROR: ${uerr.message}`); continue; }
    console.log("  APPLIED.");
    changed++;
  }
}

console.log(`\n${APPLY ? `Applied ${changed}/5 rows.` : "DRY RUN. Re-run with --apply to write."}`);
console.log("Note: pages are ISR (revalidate 3600). Apply triggers refresh within the hour, or revalidate the paths.");

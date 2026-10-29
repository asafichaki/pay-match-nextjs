// CTR batch 2026-10-28: three titles rewritten to the query each page already
// ranks for (GSC Sep 27 - Oct 26), with the deciding number in the snippet.
//
//   best-pos insight: "best pos system for small business" pos 3.7, 199 impr, 0 clicks;
//                     the old title never said "small business".
//   square-vs-helcim: "helcim vs square" pos 9.0, 175 impr; the reader types Helcim first.
//   same-day deposit: "which payment processors offer same-day deposits?" pos 4.7; old
//                     title rendered at 79 chars and was cut off.
//
// Dry run by default. --apply writes seo_overrides (live within the page's ISR window).
// Rollback: the previous values are printed before any write; seo_overrides_history keeps them too.
import fs from "node:fs";
const env = Object.fromEntries(fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]));
const base = env.NEXT_PUBLIC_SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

const CHANGES = [
  { kind: "insights", slug: "best-pos-systems-for-small-business-2026-niche-comparison-expert-picks",
    meta_title: "Best POS System for Small Business 2026, by Business Type",
    meta_description: "Square, Toast, Shopify POS, Lightspeed and Vagaro compared by business type: retail, restaurant, mobile and appointments. Hardware, monthly fees, card rates." },
  { kind: "comparisons", slug: "square-vs-helcim-2026",
    meta_title: "Helcim vs Square 2026: Which Costs Less at Your Volume",
    meta_description: "Helcim 2.11% vs Square 2.90% effective at $10K a month in person, fees included, from prices checked Oct 2026. The $25K card-mix example and which to pick." },
  { kind: "comparisons", slug: "best-payment-processors-with-same-day-deposit-2026",
    meta_title: "Same-Day Deposit Payment Processors 2026: Fees Compared",
    meta_description: "Stripe 1.5%, PayPal 1.5%, Clover 1.75% and Square 1.95% for instant or same-day payouts, plus Helcim's free next-day deposits. Which one fits your cash flow." },
];

const apply = process.argv.includes("--apply");
for (const c of CHANGES) {
  const q = `${base}/rest/v1/seo_overrides?kind=eq.${c.kind}&slug=eq.${c.slug}`;
  const before = (await (await fetch(`${q}&select=meta_title,meta_description,title_absolute`, { headers: H })).json())[0];
  console.log(`\n${c.kind}/${c.slug}\n  before: ${JSON.stringify(before)}\n  after:  ${c.meta_title} (${c.meta_title.length}c) | ${c.meta_description.length}c`);
  if (c.meta_title.length > 60 || c.meta_description.length > 160) throw new Error("length over limit");
  if (!apply) continue;
  const body = JSON.stringify({ meta_title: c.meta_title, meta_description: c.meta_description, title_absolute: true, updated_by: "claude-ctr-2026-10-28" });
  const r = before
    ? await fetch(q, { method: "PATCH", headers: { ...H, Prefer: "return=minimal" }, body })
    : await fetch(`${base}/rest/v1/seo_overrides`, { method: "POST", headers: { ...H, Prefer: "return=minimal" }, body: JSON.stringify({ kind: c.kind, slug: c.slug, ...JSON.parse(body) }) });
  console.log(`  write: ${r.status}`);
}
console.log(apply ? "\napplied" : "\ndry run (pass --apply to write)");

// Count internal links pointing at a set of target pages, by where they live.
//
//   node scripts/seo/count-inbound-links.mjs                  # the 5 top-5 targets
//   node scripts/seo/count-inbound-links.mjs --json out.json  # also write the rows
//   node scripts/seo/count-inbound-links.mjs --bodies-from data/seo/x.json
//        # count DB bodies from a local JSON (array of {kind,slug,body_html}) instead of
//        # the live table, e.g. to preview a pending --apply
//
// Three sources, reported separately because they are not worth the same:
//   code      hrefs in src/ (static pages, hub, components), excluding the target's own folder
//   body      hrefs inside published blog_articles.body_html (contextual, in-text)
//   related   seo_overrides.related_links (the "Related" block under an article)
// A retired slug that 308s to a target (stripe-vs-square-2026, stripe-vs-helcim-2026)
// counts for the target, because render-blog-article rewrites it at render time.
// Read-only. Needs .env.local with the Supabase service role.
import fs from "node:fs";
import path from "node:path";

const TARGETS = [
  "square-vs-stripe",
  "stripe-vs-paypal",
  "square-vs-helcim-2026",
  "helcim-vs-stripe",
  "stripe-vs-worldpay-2026",
];
const ALIASES = { "stripe-vs-square-2026": "square-vs-stripe", "stripe-vs-helcim-2026": "helcim-vs-stripe" };

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);
const base = env.NEXT_PUBLIC_SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY;
const H = { apikey: key, Authorization: `Bearer ${key}` };

const HREF = /href=\{?\\?["'`](?:https:\/\/www\.mypayadvisor\.com)?\/comparisons\/([a-z0-9-]+)\/?(?:[#?][^"'`\\]*)?\\?["'`]/g;
const ANCHOR = /<a\b[^>]*href=["'](?:https:\/\/www\.mypayadvisor\.com)?\/comparisons\/([a-z0-9-]+)\/?(?:[#?][^"']*)?["'][^>]*>([\s\S]*?)<\/a>/g;

const norm = (s) => ALIASES[s] ?? s;
const counts = Object.fromEntries(TARGETS.map((t) => [t, { code: [], body: [], related: [] }]));

// 1. code
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx?|mjs|json)$/.test(e.name) && !e.name.endsWith(".generated.ts")) {
      const src = fs.readFileSync(p, "utf8");
      for (const m of src.matchAll(HREF)) {
        const t = norm(m[1]);
        if (!counts[t]) continue;
        if (p.includes(`/comparisons/${t}/`)) continue; // self
        counts[t].code.push(p.replace(/^src\//, ""));
      }
    }
  }
}
walk("src");

// 2. DB bodies
const bodiesArg = process.argv.indexOf("--bodies-from");
let rows;
if (bodiesArg > -1) {
  rows = JSON.parse(fs.readFileSync(process.argv[bodiesArg + 1], "utf8"));
  const live = await (await fetch(`${base}/rest/v1/blog_articles?published=eq.true&select=kind,slug,body_html&limit=1000`, { headers: H })).json();
  const local = new Map(rows.map((r) => [`${r.kind}/${r.slug}`, r]));
  rows = live.map((r) => local.get(`${r.kind}/${r.slug}`) ?? r);
} else {
  rows = await (await fetch(`${base}/rest/v1/blog_articles?published=eq.true&select=kind,slug,body_html&limit=1000`, { headers: H })).json();
}
for (const r of rows) {
  for (const m of (r.body_html || "").matchAll(ANCHOR)) {
    const t = norm(m[1]);
    if (!counts[t] || (r.kind === "comparisons" && r.slug === t)) continue;
    counts[t].body.push(`${r.kind}/${r.slug} [${m[2].replace(/<[^>]+>/g, "").trim()}]`);
  }
}

// 3. related_links
const ov = await (await fetch(`${base}/rest/v1/seo_overrides?select=kind,slug,related_links&limit=2000`, { headers: H })).json();
for (const o of ov) {
  for (const l of o.related_links || []) {
    const m = /^\/comparisons\/([a-z0-9-]+)/.exec(l.href || "");
    if (!m) continue;
    const t = norm(m[1]);
    if (!counts[t] || (o.kind === "comparisons" && o.slug === t)) continue;
    counts[t].related.push(`${o.kind}/${o.slug} [${l.title}]`);
  }
}

for (const t of TARGETS) {
  const c = counts[t];
  console.log(`\n/comparisons/${t}: code ${c.code.length}, body ${c.body.length}, related ${c.related.length}`);
  for (const k of ["code", "body", "related"]) for (const x of c[k]) console.log(`  ${k.padEnd(7)} ${x}`);
}
const j = process.argv.indexOf("--json");
if (j > -1) fs.writeFileSync(process.argv[j + 1], JSON.stringify(counts, null, 2));

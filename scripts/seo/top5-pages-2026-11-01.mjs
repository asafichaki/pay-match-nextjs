// Top-5 pages, stages 1 and 2, the database half (plan of 2026-11-01).
//
//   node scripts/seo/top5-pages-2026-11-01.mjs              # dry run (default): gates, diff, snapshot, previews
//   node scripts/seo/top5-pages-2026-11-01.mjs --apply      # write to production (live within the 1h ISR window)
//   node scripts/seo/top5-pages-2026-11-01.mjs --rollback   # restore every field from the snapshot
//
// What it writes (prod Supabase fjzkukalkxfcveattcyg, one REST PATCH per row; the
// Management API silently no-ops multi-statement SQL, so it is never used here):
//
//   blog_articles comparisons/square-vs-helcim-2026
//       full body restore: content-drafts/top5-2026-11-01/square-vs-helcim-2026.html
//       plus title, description, key_findings, faq_json, sources_json, toc, og, schema dateModified
//   blog_articles comparisons/stripe-vs-worldpay-2026
//       price corrections only (Stripe add-on fees, Helcim tiers and payout, Stax fee and payout),
//       the retired-slug link fixed, schema dateModified. No restructure.
//   blog_articles comparisons/best-payment-processors-with-same-day-deposit-2026
//       three contextual links into the target pages. updated_at left as it was.
//   seo_overrides comparisons/square-vs-helcim-2026      aeo_answer (decisive, 40-60 words)
//   seo_overrides stripe-vs-adyen / stripe-vs-worldpay / stripe-vs-stax
//       title_absolute = true, so the layout stops appending " | myPayAdvisor"
//   seo_overrides related_links on every row that points at a target page with a stale title
//
// Every number in the new copy is checked against src/lib/data/ranking-2026.ts (imported
// directly; Node strips the types) before anything is written.
//
// Snapshot: data/seo/top5-before-2026-11-01.json holds the before-value of every field
// this script touches. A dry run writes it from the live rows; --apply refreshes it,
// except for rows that are already in their "after" state (so a second --apply never
// overwrites the real before-state); --rollback writes it back.
// seo_overrides changes are also kept by the table's own seo_overrides_history trigger.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DRAFTS = path.join(ROOT, "content-drafts", "top5-2026-11-01");
const SNAPSHOT = path.join(ROOT, "data", "seo", "top5-before-2026-11-01.json");
const MODE = process.argv.includes("--rollback") ? "rollback" : process.argv.includes("--apply") ? "apply" : "dry-run";
const TODAY = new Date().toISOString().slice(0, 10); // schema dateModified = the day this is applied
const UPDATED_BY = "claude-top5-2026-11-01";

const env = Object.fromEntries(
  fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n").filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);
const BASE = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!BASE?.includes("fjzkukalkxfcveattcyg")) throw new Error(`unexpected Supabase project: ${BASE}`);
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

async function get(table, query) {
  const r = await fetch(`${BASE}/rest/v1/${table}?${query}`, { headers: H });
  if (!r.ok) throw new Error(`GET ${table} ${r.status}: ${await r.text()}`);
  return r.json();
}
async function patch(table, query, body) {
  const r = await fetch(`${BASE}/rest/v1/${table}?${query}`, {
    method: "PATCH",
    headers: { ...H, Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`PATCH ${table} ${query} ${r.status}: ${await r.text()}`);
  const rows = await r.json();
  if (rows.length !== 1) throw new Error(`PATCH ${table} ${query} touched ${rows.length} rows, expected 1`);
  return rows[0];
}

// ---------------------------------------------------------------------------
// 1. Numbers: recompute from the ranking engine and require them in the copy.
// ---------------------------------------------------------------------------
const R = await import(pathToFileURL(path.join(ROOT, "src", "lib", "data", "ranking-2026.ts")).href);
const meta = (p) => R.PROVIDER_META.find((m) => m.processor === p);
const rate = (p, ch, t) => R.channelRates(meta(p), t)[ch === "ip" ? "inPerson" : "online"];
const usd = (n) => `$${Math.round(n).toLocaleString("en-US")}`;
const cost = (r, t) => Math.round((r / 100) * [10_000, 50_000, 250_000][t]);
if (R.PRICES_CHECKED_ISO !== "2026-10-29") throw new Error(`ranking-2026 prices changed (${R.PRICES_CHECKED_ISO}); recheck the copy before applying`);

const E = {
  hIp: [0, 1, 2].map((t) => rate("Helcim", "ip", t)),
  hOn: [0, 1, 2].map((t) => rate("Helcim", "on", t)),
  sIp: [0, 1, 2].map((t) => rate("Square", "ip", t)),
  sOn: [0, 1, 2].map((t) => rate("Square", "on", t)),
  staxIp250: rate("Stax (Fattmerchant)", "ip", 2),
  staxOn250: rate("Stax (Fattmerchant)", "on", 2),
  hOn100k: (() => { const m = meta("Helcim"); const p = m.plans.Online(100_000)[0]; return Math.round((R.ASSUMPTIONS.interchangeOnline + p.pct + (p.fixed / 50) * 100) * 100) / 100; })(),
};
const helcimSquareFigures = [
  ...[0, 1, 2].flatMap((t) => [`${E.hIp[t].toFixed(2)}% · ${usd(cost(E.hIp[t], t))}`, `${E.sIp[t].toFixed(2)}% · ${usd(cost(E.sIp[t], t))}`, `${E.hOn[t].toFixed(2)}% · ${usd(cost(E.hOn[t], t))}`, `${E.sOn[t].toFixed(2)}% · ${usd(cost(E.sOn[t], t))}`]),
  `about ${usd(cost(E.sIp[1], 1) - cost(E.hIp[1], 1))} a month at $50,000`,
  `${usd(cost(E.sIp[2], 2) - cost(E.hIp[2], 2))} at $250,000`,
  `${usd(cost(E.sIp[0], 0) - cost(E.hIp[0], 0))}, ${usd(cost(E.sIp[1], 1) - cost(E.hIp[1], 1))} and ${usd(cost(E.sIp[2], 2) - cost(E.hIp[2], 2))} a month in person`,
  `${R.ASSUMPTIONS.interchangeInPerson.toFixed(2)}% in person and ${R.ASSUMPTIONS.interchangeOnline.toFixed(2)}% online`,
  // break-even wholesale cost vs Square Free in person: 2.90 - 0.40 - 8c/$50
  `${(rate("Square", "ip", 0) - 0.4 - 0.16).toFixed(2)}%`,
];

// ---------------------------------------------------------------------------
// 2. The changes.
// ---------------------------------------------------------------------------
const helcimBody = fs.readFileSync(path.join(DRAFTS, "square-vs-helcim-2026.html"), "utf8").trim();
const helcimFields = JSON.parse(fs.readFileSync(path.join(DRAFTS, "square-vs-helcim-2026.fields.json"), "utf8"));

/** Text replacements on a live body. Each `from` must appear exactly once, or `to` already present. */
const WORLDPAY_OPS = [
  {
    why: "Stripe add-on fees: +0.5% is for manually entered cards, Instant Payouts are 1.5% (stripe.com/pricing, 2026-10-29)",
    from: "Stripe also charges 0.5 percent on stored card data, 1 percent on cross-border currency conversion, 0.4 percent on instant payouts, and platform-specific fees on Connect.",
    to: "Stripe also charges 0.5 percent extra on manually entered cards, 1.5 percent on international cards, 1 percent on currency conversion, 1.5 percent on Instant Payouts, and platform-specific fees on Connect.",
  },
  {
    why: "Helcim deposits next business morning, not T+2",
    from: "<td>Helcim</td><td>IC + 0.40% + $0.08 in-person, IC + 0.50% + $0.25 online</td><td>Month-to-month</td><td>T+2</td>",
    to: "<td>Helcim</td><td>IC + 0.40% + $0.08 in-person, IC + 0.50% + $0.25 online</td><td>Month-to-month</td><td>Next business morning</td>",
  },
  {
    why: "Stax: $99/$139/$199+ by annual volume, 15c online, next business day funding, contract length not published",
    from: "<td>Stax</td><td>$99/mo + IC + $0.08 in-person, $0.18 online</td><td>Month-to-month</td><td>T+2</td>",
    to: "<td>Stax</td><td>$99 to $199+/mo by annual volume + IC + $0.08 in-person, $0.15 online</td><td>No cancellation fee; length not published</td><td>Next business day</td>",
  },
  {
    why: "Helcim online effective rate at $100K on the published method",
    from: "For a $100,000-per-month online merchant, the effective rate runs roughly 2.15 to 2.35 percent depending on card mix, well under Stripe's flat 2.9 percent",
    to: `For a $100,000-per-month online merchant, the effective rate comes to about ${E.hOn100k.toFixed(2)} percent on our published method (estimated interchange plus Helcim's 0.35 percent and 20 cents at that tier), well under Stripe's 3.50 percent effective on a $50 sale`,
  },
  {
    why: "Helcim tier breaks are $50K, $100K, $500K and $1M",
    from: "Helcim's automatic volume discounts kick in at $25,000 and again at $50,000 monthly, dropping the percentage markup by roughly 0.05 percent at each tier.",
    to: "Helcim's automatic volume discounts start at $50,000 a month and step down again at $100,000, $500,000 and $1 million; at the first step the in-person markup falls from 0.40 to 0.35 percent.",
  },
  {
    why: "Stax subscription and per-transaction fee",
    from: "$99 per month plus interchange plus 8 cents per in-person transaction or 18 cents online",
    to: "$99 to $199 or more per month depending on annual volume, plus interchange plus 8 cents per in-person transaction or 15 cents online",
  },
  {
    why: "Stax at $250K: $199 tier is 0.08% of volume; effective rate from ranking-2026",
    from: "At $250,000 monthly, the subscription is amortized at about 0.04 percent of volume, putting the effective rate at roughly 2.10 to 2.30 percent including interchange and per-transaction fees",
    to: `At $250,000 monthly, the $199 subscription is about 0.08 percent of volume, putting the effective rate at about ${E.staxIp250.toFixed(2)} percent in person and ${E.staxOn250.toFixed(2)} percent online on our published method`,
  },
  {
    why: "retired slug /comparisons/stripe-vs-square-2026 with a broken anchor ('Stripe vs')",
    from: 'Stripe wins the <a href="/comparisons/stripe-vs-square-2026">Stripe vs</a> Worldpay matchup',
    to: "Stripe wins the Stripe vs Worldpay matchup",
  },
  {
    why: "the same link, now with a real anchor",
    from: "<strong>Who it fits:</strong> SaaS subscriptions, digital goods, marketplaces, anything that needs a developer-first API.",
    to: '<strong>Who it fits:</strong> SaaS subscriptions, digital goods, marketplaces, anything that needs a developer-first API. If you also sell in person, compare <a href="/comparisons/square-vs-stripe">Stripe vs Square</a>.',
  },
];

const SAMEDAY_OPS = [
  {
    why: "link: square-vs-stripe",
    from: "Check the dashboard's eligible amount before relying on it for payroll.</p>",
    to: 'Check the dashboard\'s eligible amount before relying on it for payroll. Stripe\'s 1.5% is lower than Square\'s 1.95%; the rest of the fee picture is in our <a href="/comparisons/square-vs-stripe">Stripe vs Square</a> comparison.</p>',
  },
  {
    why: "link: stripe-vs-paypal",
    from: "Compare checkout charges, currency conversion and payout costs together.</p>",
    to: 'Compare checkout charges, currency conversion and payout costs together. Our <a href="/comparisons/stripe-vs-paypal">Stripe vs PayPal fees</a> breakdown does that for the two most common online setups.</p>',
  },
  {
    why: "links: square-vs-helcim-2026, helcim-vs-stripe",
    from: "Initial batches, holidays and reviews can delay funding.</p>",
    to: 'Initial batches, holidays and reviews can delay funding. For card rates, see <a href="/comparisons/square-vs-helcim-2026">Helcim vs Square</a> and <a href="/comparisons/helcim-vs-stripe">Helcim vs Stripe</a>.</p>',
  },
];

function applyOps(body, ops, label) {
  let out = body;
  for (const op of ops) {
    // Check `to` first: when `to` contains `from` (an appended sentence), `from`
    // is still present after applying, and replacing again would duplicate it.
    if (out.includes(op.to)) continue; // already applied
    const nFrom = out.split(op.from).length - 1;
    if (nFrom !== 1) throw new Error(`${label}: expected the text once, found ${nFrom}: ${op.from.slice(0, 80)}`);
    out = out.replace(op.from, op.to);
  }
  return out;
}

/** New titles for related_links entries that point at a target page. */
const RELATED_TITLES = {
  "/comparisons/square-vs-stripe": "Square vs Stripe 2026: Fees Compared at $10K to $250K",
  "/comparisons/square-vs-helcim-2026": "Helcim vs Square 2026: Which Costs Less at Your Volume",
  "/comparisons/helcim-vs-stripe": "Helcim vs Stripe 2026: Helcim Is Cheaper From $10K a Month",
};

// ---------------------------------------------------------------------------
// 3. Gates on everything this script would publish.
// ---------------------------------------------------------------------------
const RULES = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "lib", "seo", "rules.json"), "utf8"));
const problems = [];
function gateText(label, text, { forbidBang = true } = {}) {
  if (/[—–]/.test(text)) problems.push(`${label}: em or en dash`);
  if (forbidBang && text.includes("!")) problems.push(`${label}: "!"`);
  const lower = text.toLowerCase();
  for (const w of RULES.banned_words ?? []) if (new RegExp(`\\b${w}\\b`, "i").test(lower)) problems.push(`${label}: banned word "${w}"`);
  for (const c of RULES.forbidden_claims ?? []) if (lower.includes(c)) problems.push(`${label}: forbidden claim "${c}"`);
}
const words = (html) => (html || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

gateText("helcim body", helcimBody);
for (const k of ["title", "description", "meta_title", "meta_description", "og_title", "og_description", "aeo_answer"]) gateText(`helcim ${k}`, helcimFields[k]);
helcimFields.key_findings.forEach((k, i) => gateText(`helcim key_finding ${i}`, k));
helcimFields.faq_json.forEach((f, i) => { gateText(`helcim faq ${i} q`, f.question); gateText(`helcim faq ${i} a`, f.answer); });
if (helcimFields.meta_title.length > RULES.title.absolute_max) problems.push(`meta_title ${helcimFields.meta_title.length} chars`);
if (helcimFields.meta_description.length > RULES.meta.max) problems.push(`meta_description ${helcimFields.meta_description.length} chars`);
if (helcimFields.description.length > RULES.meta.max) problems.push(`description ${helcimFields.description.length} chars`);
const aeoWords = words(helcimFields.aeo_answer);
if (aeoWords < RULES.answer.min_words || aeoWords > RULES.answer.max_words) problems.push(`aeo_answer ${aeoWords} words (rule ${RULES.answer.min_words}-${RULES.answer.max_words})`);
for (const f of helcimSquareFigures) if (!helcimBody.includes(f)) problems.push(`helcim body is missing engine figure "${f}"`);
for (const t of helcimFields.toc) if (t.id !== "faq" && !helcimBody.includes(`id="${t.id}"`)) problems.push(`toc id ${t.id} not in body`);
for (const op of [...WORLDPAY_OPS, ...SAMEDAY_OPS]) gateText(`op "${op.why}"`, op.to);
for (const t of Object.values(RELATED_TITLES)) if (t.length > RULES.title.absolute_max) problems.push(`related title over ${RULES.title.absolute_max}: ${t}`);
// Internal links in the new copy must point at live pages.
const hrefs = [...helcimBody.matchAll(/href="(\/[^"#?]*)/g), ...[...WORLDPAY_OPS, ...SAMEDAY_OPS].flatMap((o) => [...o.to.matchAll(/href="(\/[^"#?]*)/g)])].map((m) => m[1]);
const RETIRED = ["/comparisons/stripe-vs-square-2026", "/comparisons/stripe-vs-helcim-2026"];
for (const h of new Set(hrefs)) {
  if (RETIRED.includes(h)) problems.push(`links a retired slug: ${h}`);
  const [, kind, slug] = h.split("/");
  if ((kind === "comparisons" || kind === "insights") && slug) {
    const staticDir = path.join(ROOT, "src", "app", "(public)", kind, slug);
    if (!fs.existsSync(staticDir)) {
      const rows = await get("blog_articles", `kind=eq.${kind}&slug=eq.${slug}&published=eq.true&select=slug`);
      if (!rows.length) problems.push(`links a page that is not live: ${h}`);
    }
  }
}
if (problems.length) {
  console.error("GATES FAILED:\n  " + problems.join("\n  "));
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 4. Build the plan from live rows.
// ---------------------------------------------------------------------------
const ART_FIELDS = "id,kind,slug,title,description,body_html,content,key_findings,faq_json,sources_json,toc,meta_title,meta_description,og_title,og_description,schema_json,updated_at";
const art = async (slug) => {
  const rows = await get("blog_articles", `kind=eq.comparisons&slug=eq.${slug}&select=${ART_FIELDS}`);
  if (rows.length !== 1) throw new Error(`blog_articles comparisons/${slug}: ${rows.length} rows`);
  return rows[0];
};
const ov = async (slug, kind = "comparisons") => {
  const rows = await get("seo_overrides", `kind=eq.${kind}&slug=eq.${slug}&select=*`);
  return rows[0] ?? null;
};

const plan = []; // { key, table, query, before, after, note }
const now = new Date().toISOString();

{
  const row = await art("square-vs-helcim-2026");
  const schema = { ...(row.schema_json ?? {}), headline: helcimFields.title, description: helcimFields.description, dateModified: TODAY };
  const after = {
    title: helcimFields.title,
    description: helcimFields.description,
    body_html: helcimBody,
    content: helcimBody,
    key_findings: helcimFields.key_findings,
    faq_json: helcimFields.faq_json,
    sources_json: helcimFields.sources_json,
    toc: helcimFields.toc,
    meta_title: helcimFields.meta_title,
    meta_description: helcimFields.meta_description,
    og_title: helcimFields.og_title,
    og_description: helcimFields.og_description,
    schema_json: schema,
  };
  plan.push({ key: "blog_articles:comparisons/square-vs-helcim-2026", table: "blog_articles", query: `id=eq.${row.id}`, row, after, bumpDate: true,
    note: `body ${words(row.body_html)} -> ${words(helcimBody)} words; FAQ ${row.faq_json?.length ?? 0} -> ${helcimFields.faq_json.length}` });
}
{
  const row = await art("stripe-vs-worldpay-2026");
  const body = applyOps(row.body_html, WORLDPAY_OPS, "worldpay");
  const after = { body_html: body, schema_json: { ...(row.schema_json ?? {}), dateModified: TODAY } };
  plan.push({ key: "blog_articles:comparisons/stripe-vs-worldpay-2026", table: "blog_articles", query: `id=eq.${row.id}`, row, after, bumpDate: true,
    note: `${WORLDPAY_OPS.length} price/link corrections; body ${words(row.body_html)} -> ${words(body)} words` });
}
{
  const row = await art("best-payment-processors-with-same-day-deposit-2026");
  const body = applyOps(row.body_html, SAMEDAY_OPS, "same-day");
  plan.push({ key: "blog_articles:comparisons/best-payment-processors-with-same-day-deposit-2026", table: "blog_articles", query: `id=eq.${row.id}`, row, after: { body_html: body }, bumpDate: false,
    note: `${SAMEDAY_OPS.length} contextual links added; updated_at kept` });
}
{
  const o = await ov("square-vs-helcim-2026");
  if (!o) throw new Error("seo_overrides comparisons/square-vs-helcim-2026 missing");
  plan.push({ key: "seo_overrides:comparisons/square-vs-helcim-2026#aeo", table: "seo_overrides", query: `override_id=eq.${o.override_id}`, row: o, after: { aeo_answer: helcimFields.aeo_answer, updated_by: UPDATED_BY }, note: "decisive answer block" });
}
for (const slug of ["stripe-vs-adyen-2026", "stripe-vs-worldpay-2026", "stripe-vs-stax-2026"]) {
  const o = await ov(slug);
  if (!o) throw new Error(`seo_overrides comparisons/${slug} missing`);
  plan.push({ key: `seo_overrides:comparisons/${slug}#title`, table: "seo_overrides", query: `override_id=eq.${o.override_id}`, row: o, after: { title_absolute: true, updated_by: UPDATED_BY }, note: "drop the | myPayAdvisor suffix" });
}
{
  const all = await get("seo_overrides", "select=override_id,kind,slug,related_links,citation_lock,locked_until&limit=2000");
  for (const o of all) {
    if (!Array.isArray(o.related_links)) continue;
    let changed = false;
    const next = o.related_links.map((l) => {
      const t = RELATED_TITLES[l.href];
      if (t && l.title !== t) { changed = true; return { ...l, title: t }; }
      return l;
    });
    if (!changed) continue;
    const key = `seo_overrides:${o.kind}/${o.slug}#related`;
    if (plan.some((p) => p.table === "seo_overrides" && p.query === `override_id=eq.${o.override_id}`)) {
      // same row already in the plan: merge into that entry
      const p = plan.find((x) => x.query === `override_id=eq.${o.override_id}`);
      p.after.related_links = next;
      p.row.related_links = o.related_links;
      continue;
    }
    plan.push({ key, table: "seo_overrides", query: `override_id=eq.${o.override_id}`, row: o, after: { related_links: next, updated_by: UPDATED_BY }, note: "related-link titles that still carried old claims" });
  }
}

// Locks: never write a row the loop has locked.
for (const p of plan) {
  if (p.table !== "seo_overrides") continue;
  const locked = p.row.citation_lock === true || (p.row.locked_until && new Date(p.row.locked_until) > new Date());
  if (locked) throw new Error(`${p.key} is locked (citation_lock or locked_until); not touching it`);
}

// Key order is ignored: Postgres jsonb stores object keys sorted, so a byte compare
// would report an applied faq_json/sources_json as still pending.
const canon = (v) => JSON.stringify(v ?? null, (_k, x) =>
  x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) : x);
const same = (a, b) => canon(a) === canon(b);
const fieldsOf = (p) => Object.keys(p.after).filter((k) => k !== "updated_by");
// schema_json.dateModified carries the apply date, so it is ignored when asking "already applied?";
// otherwise a second --apply on a later day would treat the after-state as a fresh before-state.
const noDate = (v) => (v && typeof v === "object" && !Array.isArray(v) ? { ...v, dateModified: undefined } : v);
const isApplied = (p) => fieldsOf(p).every((k) => (k === "schema_json" ? same(noDate(p.row[k]), noDate(p.after[k])) : same(p.row[k], p.after[k])));

// ---------------------------------------------------------------------------
// 5. Rollback.
// ---------------------------------------------------------------------------
if (MODE === "rollback") {
  if (!fs.existsSync(SNAPSHOT)) throw new Error(`no snapshot at ${SNAPSHOT}`);
  const snap = JSON.parse(fs.readFileSync(SNAPSHOT, "utf8"));
  for (const [key, s] of Object.entries(snap.rows)) {
    const res = await patch(s.table, s.query, s.before);
    console.log(`restored ${key} (${Object.keys(s.before).join(", ")})${res ? "" : ""}`);
  }
  console.log("\nrollback done. ISR serves the restored rows within an hour.");
  process.exit(0);
}

// ---------------------------------------------------------------------------
// 6. Snapshot, previews, diff.
// ---------------------------------------------------------------------------
const prev = fs.existsSync(SNAPSHOT) ? JSON.parse(fs.readFileSync(SNAPSHOT, "utf8")) : { rows: {} };
const snap = { written_at: now, mode: MODE, note: "before-state of every field top5-pages-2026-11-01.mjs touches; --rollback writes these back", rows: { ...(prev.rows || {}) } };
// Rows already applied drop out of `plan` (nothing left to change), so carry every recorded row over.
for (const p of plan) {
  // Never overwrite a recorded before-state: after --apply the live row IS the after-state.
  const keep = Boolean(prev.rows?.[p.key]);
  const fields = [...fieldsOf(p), ...(p.table === "blog_articles" && p.bumpDate ? ["updated_at"] : []), ...(p.table === "seo_overrides" ? ["updated_by"] : [])];
  snap.rows[p.key] = keep ? prev.rows[p.key] : { table: p.table, query: p.query, before: Object.fromEntries(fields.map((f) => [f, p.row[f] ?? null])) };
}
fs.mkdirSync(path.dirname(SNAPSHOT), { recursive: true });
fs.writeFileSync(SNAPSHOT, JSON.stringify(snap, null, 2) + "\n");
fs.writeFileSync(path.join(DRAFTS, "stripe-vs-worldpay-2026.after.html"), plan.find((p) => p.key.endsWith("stripe-vs-worldpay-2026")).after.body_html + "\n");
fs.writeFileSync(path.join(DRAFTS, "best-payment-processors-with-same-day-deposit-2026.after.html"), plan.find((p) => p.key.includes("same-day")).after.body_html + "\n");

console.log(`mode: ${MODE}\n`);
for (const p of plan) {
  const changed = fieldsOf(p).filter((k) => !same(p.row[k], p.after[k]));
  console.log(`${isApplied(p) ? "[already applied] " : ""}${p.key}\n  ${p.note}\n  fields: ${changed.join(", ") || "(none)"}`);
  for (const k of ["title", "meta_title", "meta_description", "aeo_answer", "title_absolute"]) {
    if (changed.includes(k)) console.log(`    ${k}:\n      before: ${JSON.stringify(p.row[k])}\n      after:  ${JSON.stringify(p.after[k])}`);
  }
  if (changed.includes("related_links")) {
    for (const [i, l] of p.after.related_links.entries()) if (!same(l, p.row.related_links[i])) console.log(`    related ${l.href}: "${p.row.related_links[i].title}" -> "${l.title}"`);
  }
}
console.log(`\nsnapshot: ${path.relative(ROOT, SNAPSHOT)}`);

if (MODE !== "apply") {
  console.log("\ndry run: nothing written. Pass --apply to write.");
  process.exit(0);
}

// ---------------------------------------------------------------------------
// 7. Apply.
// ---------------------------------------------------------------------------
for (const p of plan) {
  if (isApplied(p)) { console.log(`skip ${p.key} (already applied)`); continue; }
  const body = { ...p.after };
  if (p.table === "blog_articles" && p.bumpDate) body.updated_at = now;
  const res = await patch(p.table, p.query, body);
  const ok = fieldsOf(p).every((k) => same(res[k], p.after[k]));
  console.log(`${ok ? "wrote" : "WROTE BUT READ-BACK DIFFERS"} ${p.key}`);
  if (!ok) process.exitCode = 1;
}
console.log("\napplied. Pages pick it up within the 1h ISR window (no revalidate route). Rollback: --rollback");

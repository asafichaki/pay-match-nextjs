// Stale processor prices, the database half (plan item 4, approved 2026-11-02).
//
//   node scripts/seo/stale-prices-2026-11-02.mjs              # dry run (default): gates, diff, snapshot, previews
//   node scripts/seo/stale-prices-2026-11-02.mjs --apply      # write to production (live within the 1h ISR window)
//   node scripts/seo/stale-prices-2026-11-02.mjs --rollback   # restore every field from the snapshot
//
// What it writes (prod Supabase fjzkukalkxfcveattcyg, one REST PATCH per row; the
// Management API silently no-ops multi-statement SQL, so it is never used here):
//
//   blog_articles  body_html / faq_json / key_findings / meta fields of the pages listed in
//                  content-drafts/stale-prices-2026-11-02/ops/*.json (one file per page).
//                  Each op is an exact text replacement: `from` must appear exactly once,
//                  or `to` must already be there (then it is skipped).
//   seo_overrides  aeo_answer / meta_description of the same pages, same op format.
//   seo_overrides  related_links titles that still carry the old "3.07% vs 2.65%" style titles,
//                  rewritten to the pages' current titles (RELATED_TITLES below).
//
// Every NEW number an op introduces (a number in `to` that is not already in `from`)
// must be a published price in provider-facts.json, an engine figure from
// src/lib/data/ranking-2026.ts, or a declared calculation that the script re-does.
// That is the "never invent a number" gate.
//
// Snapshot: data/seo/stale-prices-before-2026-11-02.json holds the before-value of every
// field this script touches. Once a row is recorded there it is never overwritten (not by
// a dry run, not by --apply), so a second run can never replace the real before-state with
// an after-state. --rollback writes it back. seo_overrides also keeps seo_overrides_history.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DRAFTS = path.join(ROOT, "content-drafts", "stale-prices-2026-11-02");
const OPS_DIR = path.join(DRAFTS, "ops");
const AFTER_DIR = path.join(DRAFTS, "after");
const SNAPSHOT = path.join(ROOT, "data", "seo", "stale-prices-before-2026-11-02.json");
const FACTS = process.env.PROVIDER_FACTS ||
  path.join(process.env.HOME, "Documents", "Obsidian Vault", "my-ai-lab", "02-projects", "mypayadvisor", "research-2026-10-28", "provider-facts.json");
const MODE = process.argv.includes("--rollback") ? "rollback" : process.argv.includes("--apply") ? "apply" : "dry-run";
// --check <ops-file.json>: gates and in-memory edits for one ops file, writes nothing at all
// (no snapshot, no previews). For drafting ops in parallel without touching shared files.
const CHECK = process.argv.includes("--check") ? process.argv[process.argv.indexOf("--check") + 1] : null;
const TODAY = new Date().toISOString().slice(0, 10);
const UPDATED_BY = "claude-stale-prices-2026-11-02";

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
// 1. The numbers we are allowed to introduce.
// ---------------------------------------------------------------------------
const R = await import(pathToFileURL(path.join(ROOT, "src", "lib", "data", "ranking-2026.ts")).href);
if (R.PRICES_CHECKED_ISO !== "2026-10-29") throw new Error(`ranking-2026 prices changed (${R.PRICES_CHECKED_ISO}); recheck the ops before applying`);
if (!fs.existsSync(FACTS)) throw new Error(`provider-facts.json not found at ${FACTS} (set PROVIDER_FACTS)`);
const factsText = fs.readFileSync(FACTS, "utf8");

const norm = (n) => String(Math.round(Number(n) * 10000) / 10000);
const ALLOW = new Set();
const addNum = (n) => ALLOW.add(norm(n));
for (const m of factsText.matchAll(/\d[\d,]*(?:\.\d+)?/g)) {
  const v = Number(m[0].replace(/,/g, ""));
  addNum(v);
  if (v < 100 && Number.isInteger(v)) addNum(v / 100); // "15c" in the facts -> $0.15 in copy
  if (v < 1) addNum(Math.round(v * 100)); // "$0.08" in the facts -> 8 cents in copy
}
for (const m of R.PROVIDER_META) {
  for (const t of [0, 1, 2, 3]) {
    const r = R.channelRates(m, t);
    for (const v of [r.inPerson, r.online]) if (v !== null) { addNum(v); addNum(Math.round((v / 100) * [10_000, 50_000, 250_000, 1_000_000][t])); }
  }
}
for (const v of [R.ASSUMPTIONS.averageSale, R.ASSUMPTIONS.interchangeInPerson, R.ASSUMPTIONS.interchangeOnline, 60, 40]) addNum(v);
for (let i = 0; i <= 12; i++) addNum(i);
for (const y of [2025, 2026]) addNum(y);
// The facts also write volumes as "$500K" and "$1M"; numbersIn (below) expands those.
const factsVolumes = () => { for (const n of numbersIn(factsText)) addNum(n.v); };

/** Numbers in a string: "2.6%", "$0.15", "15¢", "$1,204", "15 cents". Cents forms are also returned as dollars. */
function numbersIn(text) {
  const out = [];
  for (const m of String(text).matchAll(/\$?\d[\d,]*(?:\.\d+)?/g)) {
    const raw = m[0];
    const v = Number(raw.replace(/[$,]/g, ""));
    if (Number.isNaN(v)) continue;
    const after = String(text).slice(m.index + raw.length, m.index + raw.length + 7);
    const isCents = /^\s?(¢|c\b|cents)/.test(after);
    const mult = /^K\b/.test(after) ? 1_000 : /^M\b/.test(after) ? 1_000_000 : 1; // "$250K", "$1M"
    out.push({ raw, v: v * mult, alt: isCents ? v / 100 : null });
  }
  return out;
}
/** A declared calculation, e.g. { value: "150", calc: "1000*0.15" }. Only digits, operators, parentheses. */
function checkCalc(d) {
  if (!/^[\d.+\-*/() ]+$/.test(d.calc)) return `calc "${d.calc}" has characters other than digits and operators`;
  const got = Function(`"use strict"; return (${d.calc});`)();
  const want = Number(String(d.value).replace(/[$,%]/g, ""));
  const tol = Math.max(0.006, Math.abs(want) * 0.0051);
  return Math.abs(got - want) <= tol ? null : `calc "${d.calc}" = ${got}, not ${d.value}`;
}

factsVolumes();

// ---------------------------------------------------------------------------
// 2. Gates.
// ---------------------------------------------------------------------------
const RULES = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "lib", "seo", "rules.json"), "utf8"));
const problems = [];
const plainOf = (s) => String(s).replace(/<[^>]+>/g, " ");
function gateText(label, text) {
  const t = plainOf(text);
  if (/[—–]/.test(t)) problems.push(`${label}: em or en dash`);
  if (t.includes("!")) problems.push(`${label}: "!"`);
  const lower = t.toLowerCase();
  for (const w of RULES.banned_words ?? []) if (new RegExp(`\\b${w}\\b`, "i").test(lower)) problems.push(`${label}: banned word "${w}"`);
  for (const c of [...(RULES.forbidden_claims ?? []), "unbiased", "$500m", "merchant statements"]) if (lower.includes(c)) problems.push(`${label}: forbidden claim "${c}"`);
}
/** The stale figures this script exists to remove. None may appear in any `to`. */
const STALE = [
  [/\bSquare\b[^.]{0,60}2\.6(0)?\s?(%|percent)\s*(\+|plus)\s*(\$0?\.10|10\s?(¢|c\b|cents))/i, "Square at 2.6% + 10c"],
  [/May 2026/, "May 2026"],
  [/2\.59\s?%\s*(\+|plus)\s*(\$0?\.49|49)/i, "PayPal Advanced 2.59% + 49c"],
  [/Stax[^.]{0,80}(\$0?\.18|18\s?(¢|cents))/i, "Stax 18c"],
  [/Helcim[^.]{0,80}(T\+2|2 business days|two business days)/i, "Helcim T+2"],
  [/Square[^.]{0,60}1\.75\s?%/i, "Square instant 1.75%"],
];
function gateOp(label, op) {
  gateText(label, op.to);
  for (const [re, name] of STALE) if (re.test(plainOf(op.to))) problems.push(`${label}: still carries the stale figure "${name}"`);
  const inherited = new Set(numbersIn(plainOf(op.from)).flatMap((n) => [norm(n.v), n.alt === null ? null : norm(n.alt)]).filter(Boolean));
  const declared = new Set();
  for (const d of op.derived ?? []) {
    const err = checkCalc(d);
    if (err) problems.push(`${label}: ${err}`);
    declared.add(norm(String(d.value).replace(/[$,%]/g, "")));
  }
  for (const n of numbersIn(plainOf(op.to))) {
    const ok = [n.v, n.alt].filter((x) => x !== null).some((x) => inherited.has(norm(x)) || ALLOW.has(norm(x)) || declared.has(norm(x)));
    if (!ok) problems.push(`${label}: new number ${n.raw} is not a published price, an engine figure or a declared calc`);
  }
  for (const m of String(op.to).matchAll(/href="(\/[^"#?]*)/g)) hrefsToCheck.add(m[1]);
}
const hrefsToCheck = new Set();

// ---------------------------------------------------------------------------
// 3. Load the ops.
// ---------------------------------------------------------------------------
const opFiles = CHECK ? [path.basename(CHECK)] : fs.existsSync(OPS_DIR) ? fs.readdirSync(OPS_DIR).filter((f) => f.endsWith(".json")).sort() : [];
const PAGES = opFiles.map((f) => ({ file: f, ...JSON.parse(fs.readFileSync(path.join(OPS_DIR, f), "utf8")) }));
for (const p of PAGES) {
  if (!p.kind || !p.slug) problems.push(`${p.file}: needs kind and slug`);
  for (const [i, op] of (p.article ?? []).entries()) gateOp(`${p.slug} article[${i}] ${op.field}`, op);
  for (const [i, op] of (p.override ?? []).entries()) gateOp(`${p.slug} override[${i}] ${op.field}`, op);
}

/** The providers table, which the homepage rate table renders. */
const PROVIDERS = !CHECK && fs.existsSync(path.join(DRAFTS, "providers.json")) ? JSON.parse(fs.readFileSync(path.join(DRAFTS, "providers.json"), "utf8")).rows : [];
for (const r of PROVIDERS) for (const [i, op] of (r.ops ?? []).entries()) gateOp(`providers ${r.name}[${i}] ${op.field}`, op);

/** New titles for related_links entries whose stored title still quotes the old rates. */
const RELATED_TITLES = {
  "/comparisons/paypal-vs-square": "PayPal vs Square 2026: Fees Compared In Person and Online",
  // The ranking lists 10 providers since PR #8; stored link titles still said "15 Best".
  "/comparisons/best-payment-processors-2026": "Best Payment Processors 2026: 10 Ranked by Real Cost",
};
for (const t of Object.values(RELATED_TITLES)) {
  gateText(`related title "${t}"`, t);
  if (t.length > RULES.title.absolute_max) problems.push(`related title over ${RULES.title.absolute_max}: ${t}`);
}

// ---------------------------------------------------------------------------
// 4. Apply the ops in memory against live rows.
// ---------------------------------------------------------------------------
const JSON_FIELDS = new Set(["faq_json", "key_findings", "related_links", "schema_json", "sources_json"]);

/** Exact-once replacement on a string. Checks `to` first: when `to` contains `from`, `from` is still there after applying. */
function replaceOnce(text, op, label) {
  if (op.to !== "" && text.includes(op.to)) return { text, applied: true };
  const n = text.split(op.from).length - 1;
  if (n === 0 && op.to === "") return { text, applied: true }; // a deletion that already happened
  if (n !== 1) throw new Error(`${label}: expected the text once, found ${n}: ${op.from.slice(0, 100)}`);
  return { text: text.replace(op.from, () => op.to), applied: false };
}
/** Same, across every string inside a jsonb value: `from` must appear exactly once in the whole value. */
function replaceInJson(value, op, label) {
  const strings = [];
  const walk = (v) => (typeof v === "string" ? strings.push(v) : v && typeof v === "object" ? Object.values(v).forEach(walk) : null);
  walk(value);
  const joined = strings.join("\u0000");
  if (op.to !== "" && joined.includes(op.to)) return { value, applied: true };
  const n = joined.split(op.from).length - 1;
  if (n === 0 && op.to === "") return { value, applied: true };
  if (n !== 1) throw new Error(`${label}: expected the text once in the JSON value, found ${n}: ${op.from.slice(0, 100)}`);
  const map = (v) => (typeof v === "string" ? (v.includes(op.from) ? v.replace(op.from, () => op.to) : v) : Array.isArray(v) ? v.map(map) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, map(x)])) : v);
  return { value: map(value), applied: false };
}
function applyOps(row, ops, label) {
  const after = {};
  for (const op of ops) {
    const cur = op.field in after ? after[op.field] : row[op.field];
    if (cur === null || cur === undefined) throw new Error(`${label}: field ${op.field} is empty on the live row`);
    if (JSON_FIELDS.has(op.field)) after[op.field] = replaceInJson(cur, op, `${label} ${op.field}`).value;
    else after[op.field] = replaceOnce(cur, op, `${label} ${op.field}`).text;
  }
  return after;
}

const canon = (v) => JSON.stringify(v ?? null, (_k, x) =>
  x && typeof x === "object" && !Array.isArray(x) ? Object.fromEntries(Object.entries(x).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) : x);
const same = (a, b) => canon(a) === canon(b);
const noDate = (v) => (v && typeof v === "object" && !Array.isArray(v) ? { ...v, dateModified: undefined } : v);

const plan = []; // { key, table, query, row, after, bumpDate, note }
const ART_FIELDS = "id,kind,slug,title,description,body_html,faq_json,key_findings,meta_title,meta_description,og_title,og_description,schema_json,updated_at,published";
for (const p of PAGES) {
  if (p.article?.length) {
    const rows = await get("blog_articles", `kind=eq.${p.kind}&slug=eq.${p.slug}&select=${ART_FIELDS}`);
    if (rows.length !== 1) throw new Error(`blog_articles ${p.kind}/${p.slug}: ${rows.length} rows`);
    const row = rows[0];
    const after = applyOps(row, p.article, `${p.slug} article`);
    if (Object.keys(after).length) after.schema_json = { ...(row.schema_json ?? {}), dateModified: TODAY };
    plan.push({ key: `blog_articles:${p.kind}/${p.slug}`, table: "blog_articles", query: `id=eq.${row.id}`, row, after, bumpDate: true, note: `${p.article.length} op(s)`, ops: p.article });
  }
  if (p.override?.length) {
    const rows = await get("seo_overrides", `kind=eq.${p.kind}&slug=eq.${p.slug}&select=*`);
    if (rows.length !== 1) throw new Error(`seo_overrides ${p.kind}/${p.slug}: ${rows.length} rows`);
    const row = rows[0];
    const after = applyOps(row, p.override, `${p.slug} override`);
    if (after.aeo_answer !== undefined) {
      const w = plainOf(after.aeo_answer).split(/\s+/).filter(Boolean).length;
      if (w < RULES.answer.min_words || w > RULES.answer.max_words) problems.push(`${p.slug} aeo_answer ${w} words after the edit (rule ${RULES.answer.min_words}-${RULES.answer.max_words})`);
    }
    if (after.meta_description !== undefined && after.meta_description.length > RULES.meta.max) problems.push(`${p.slug} override meta_description ${after.meta_description.length} chars`);
    after.updated_by = UPDATED_BY;
    plan.push({ key: `seo_overrides:${p.kind}/${p.slug}`, table: "seo_overrides", query: `override_id=eq.${row.override_id}`, row, after, note: `${p.override.length} op(s)`, ops: p.override });
  }
}
for (const r of PROVIDERS) {
  const rows = await get("providers", `name=eq.${encodeURIComponent(r.name)}&select=*`);
  if (rows.length !== 1) throw new Error(`providers ${r.name}: ${rows.length} rows`);
  const row = rows[0];
  const after = { ...applyOps(row, r.ops ?? [], `providers ${r.name}`), ...(r.set ?? {}) };
  plan.push({ key: `providers:${r.name}`, table: "providers", query: `id=eq.${row.id}`, row, after, note: `${(r.ops ?? []).length} op(s) + ${Object.keys(r.set ?? {}).join(", ")}`, ops: r.ops ?? [] });
}
if (!CHECK) {
  const all = await get("seo_overrides", "select=override_id,kind,slug,related_links,citation_lock,locked_until,updated_by&limit=2000");
  for (const o of all) {
    if (!Array.isArray(o.related_links)) continue;
    let changed = false;
    const next = o.related_links.map((l) => {
      const t = RELATED_TITLES[l.href];
      if (t && l.title !== t) { changed = true; return { ...l, title: t }; }
      return l;
    });
    if (!changed) continue;
    const existing = plan.find((x) => x.table === "seo_overrides" && x.query === `override_id=eq.${o.override_id}`);
    if (existing) { existing.after.related_links = next; existing.row.related_links = o.related_links; existing.note += " + related-link titles"; continue; }
    plan.push({ key: `seo_overrides:${o.kind}/${o.slug}`, table: "seo_overrides", query: `override_id=eq.${o.override_id}`, row: o, after: { related_links: next, updated_by: UPDATED_BY }, note: "related-link titles that still quoted the old rates" });
  }
}

// Every internal link an op adds must point at a live page.
for (const h of hrefsToCheck) {
  const [, kind, slug] = h.split("/");
  if ((kind === "comparisons" || kind === "insights") && slug) {
    if (!fs.existsSync(path.join(ROOT, "src", "app", "(public)", kind, slug))) {
      const rows = await get("blog_articles", `kind=eq.${kind}&slug=eq.${slug}&published=eq.true&select=slug`);
      if (!rows.length) problems.push(`an op links a page that is not live: ${h}`);
    }
  }
}
// Locks: never write a row the loop has locked.
for (const p of plan) {
  if (p.table !== "seo_overrides") continue;
  const locked = p.row.citation_lock === true || (p.row.locked_until && new Date(p.row.locked_until) > new Date());
  if (locked) problems.push(`${p.key} is locked (citation_lock or locked_until); remove its ops`);
}
if (problems.length) {
  console.error("GATES FAILED:\n  " + problems.join("\n  "));
  process.exit(1);
}
if (CHECK) {
  for (const p of plan) {
    console.log(`ok ${p.key}: ${p.note}`);
    for (const op of p.ops ?? []) console.log(`  - ${op.field}: ${plainOf(op.to).replace(/\s+/g, " ").trim().slice(0, 160)}`);
  }
  console.log("\ncheck passed: every op matched once and cleared the gates. Nothing written.");
  process.exit(0);
}

const fieldsOf = (p) => Object.keys(p.after).filter((k) => k !== "updated_by");
const isApplied = (p) => fieldsOf(p).every((k) => (k === "schema_json" ? same(noDate(p.row[k]), noDate(p.after[k])) : same(p.row[k], p.after[k])));

// ---------------------------------------------------------------------------
// 5. Rollback.
// ---------------------------------------------------------------------------
if (MODE === "rollback") {
  if (!fs.existsSync(SNAPSHOT)) throw new Error(`no snapshot at ${SNAPSHOT}`);
  const snap = JSON.parse(fs.readFileSync(SNAPSHOT, "utf8"));
  for (const [key, s] of Object.entries(snap.rows)) {
    await patch(s.table, s.query, s.before);
    console.log(`restored ${key} (${Object.keys(s.before).join(", ")})`);
  }
  console.log("\nrollback done. ISR serves the restored rows within an hour.");
  process.exit(0);
}

// ---------------------------------------------------------------------------
// 6. Snapshot (never overwrites a recorded row), previews, diff.
// ---------------------------------------------------------------------------
const prev = fs.existsSync(SNAPSHOT) ? JSON.parse(fs.readFileSync(SNAPSHOT, "utf8")) : { rows: {} };
const snap = { first_written_at: prev.first_written_at ?? new Date().toISOString(), note: "before-state of every field stale-prices-2026-11-02.mjs touches; recorded once, never overwritten; --rollback writes these back", rows: { ...(prev.rows || {}) } };
let recordedNow = 0;
const fieldDone = (p, k) => (k === "schema_json" ? same(noDate(p.row[k]), noDate(p.after[k])) : same(p.row[k], p.after[k]));
for (const p of plan) {
  const fields = [...fieldsOf(p), ...(p.table === "blog_articles" && p.bumpDate ? ["updated_at"] : []), ...(p.table === "seo_overrides" ? ["updated_by"] : [])];
  const rec = snap.rows[p.key];
  if (rec) {
    // Recorded fields are never overwritten. A field that an op added later is recorded now,
    // but only while the live value is still the before-state.
    for (const f of fields) {
      if (f in rec.before) continue;
      if (fieldsOf(p).includes(f) && fieldDone(p, f)) throw new Error(`${p.key}.${f} is already in its after-state but has no recorded before-state`);
      rec.before[f] = p.row[f] ?? null;
      recordedNow++;
    }
    continue;
  }
  if (isApplied(p)) continue; // already in its after-state and no before was ever captured: nothing true to record
  snap.rows[p.key] = { table: p.table, query: p.query, before: Object.fromEntries(fields.map((f) => [f, p.row[f] ?? null])) };
  recordedNow++;
}
fs.mkdirSync(path.dirname(SNAPSHOT), { recursive: true });
fs.writeFileSync(SNAPSHOT, JSON.stringify(snap, null, 2) + "\n");

fs.mkdirSync(AFTER_DIR, { recursive: true });
const diffLines = [`# Stale prices 2026-11-02: what --apply would change (generated by the dry run)`, ""];
for (const p of plan) {
  const changed = fieldsOf(p).filter((k) => !(k === "schema_json" ? same(noDate(p.row[k]), noDate(p.after[k])) : same(p.row[k], p.after[k])));
  diffLines.push(`## ${p.key}${isApplied(p) ? " (already applied)" : ""}`, "", `${p.note}. Fields: ${changed.join(", ") || "(none)"}`, "");
  for (const op of p.ops ?? []) diffLines.push(`- **${op.field}**: ${op.why}`, `  - before: ${plainOf(op.from).replace(/\s+/g, " ").trim()}`, `  - after: ${plainOf(op.to).replace(/\s+/g, " ").trim()}`);
  if (changed.includes("related_links")) {
    for (const [i, l] of p.after.related_links.entries()) if (!same(l, p.row.related_links[i])) diffLines.push(`- **related_links** ${l.href}: "${p.row.related_links[i].title}" -> "${l.title}"`);
  }
  diffLines.push("");
  if (p.table === "blog_articles" && changed.includes("body_html")) fs.writeFileSync(path.join(AFTER_DIR, `${p.row.slug}.after.html`), p.after.body_html + "\n");
}
fs.writeFileSync(path.join(DRAFTS, "dry-run-diff.md"), diffLines.join("\n") + "\n");

console.log(`mode: ${MODE}\n`);
let pending = 0;
for (const p of plan) {
  const applied = isApplied(p);
  if (!applied) pending++;
  console.log(`${applied ? "[already applied] " : ""}${p.key}  ${p.note}`);
}
console.log(`\n${plan.length} rows in the plan, ${pending} with changes pending.`);
console.log(`snapshot: ${path.relative(ROOT, SNAPSHOT)} (${Object.keys(snap.rows).length} rows recorded, ${recordedNow} new this run)`);
console.log(`diff: ${path.relative(ROOT, path.join(DRAFTS, "dry-run-diff.md"))}`);

if (MODE !== "apply") {
  console.log("\ndry run: nothing written to the database. Pass --apply to write.");
  process.exit(0);
}

// ---------------------------------------------------------------------------
// 7. Apply.
// ---------------------------------------------------------------------------
for (const p of plan) {
  if (isApplied(p)) { console.log(`skip ${p.key} (already applied)`); continue; }
  if (!snap.rows[p.key]) throw new Error(`${p.key}: no before-state recorded; refusing to write`);
  const body = { ...p.after };
  if (p.table === "blog_articles" && p.bumpDate) body.updated_at = new Date().toISOString();
  const res = await patch(p.table, p.query, body);
  const ok = fieldsOf(p).every((k) => same(res[k], p.after[k]));
  console.log(`${ok ? "wrote" : "WROTE BUT READ-BACK DIFFERS"} ${p.key}`);
  if (!ok) process.exitCode = 1;
}
console.log("\napplied. Pages pick it up within the 1h ISR window. Rollback: --rollback");

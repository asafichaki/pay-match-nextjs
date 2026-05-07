// Title + URL hashing for industry_news dedup. Stable, deterministic.
// Both hashes are stored as UNIQUE columns in industry_news; inserts use
// ON CONFLICT DO NOTHING so reruns are idempotent.

import { createHash } from "node:crypto";

export function titleHash(title: string): string {
  const lower = (title || "").toLowerCase();
  // strip punctuation, collapse whitespace
  const stripped = lower.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  // keep words with 5+ chars, sort to ignore reorderings
  const words = stripped.split(" ").filter((w) => w.length >= 5).sort();
  return createHash("sha256").update(words.join(" ")).digest("hex");
}

export function urlHash(rawUrl: string): string {
  let canonical = (rawUrl || "").trim();
  try {
    const u = new URL(canonical);
    u.hash = "";
    u.search = "";
    let path = u.pathname.replace(/\/+$/, "");
    if (!path) path = "/";
    canonical = `${u.protocol}//${u.host.toLowerCase()}${path}`;
  } catch {
    canonical = canonical.toLowerCase();
  }
  return createHash("sha256").update(canonical).digest("hex");
}

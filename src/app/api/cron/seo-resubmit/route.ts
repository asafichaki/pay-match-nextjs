/**
 * Daily SEO resubmit cron.
 *
 * Runs once/day. Two jobs:
 *   1. Ping IndexNow with the 20 most-recently-edited routes (per lastmod-manifest.json
 *      + DB autopilot articles). Keeps Bing/Yandex hot, indirectly improves Google
 *      crawl prioritization by surfacing real freshness deltas.
 *   2. (Best-effort) Pings Google sitemaps endpoint to nudge re-fetch.
 *
 * Fixes Flag #1 (zero-day crawls 51%): when nothing pings Google between deploys,
 * the crawler falls into low-frequency revisits. Daily heartbeat keeps it engaged.
 */
import { NextResponse, type NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { pingIndexNow } from "@/lib/distribution/indexnow";
import { getAdminSupabase } from "@/lib/funnel/admin-supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE = "https://www.mypayadvisor.com";
const TOP_N = 20;

interface Recent {
  url: string;
  lastmod: string;
}

function loadManifestRecent(): Recent[] {
  try {
    const p = path.join(process.cwd(), "public", "lastmod-manifest.json");
    const raw = fs.readFileSync(p, "utf8");
    const m = JSON.parse(raw) as Record<string, string>;
    return Object.entries(m)
      .filter(([route]) => route !== "/")
      .map(([route, lastmod]) => ({ url: `${SITE}${route}`, lastmod }));
  } catch {
    return [];
  }
}

async function loadDbRecent(): Promise<Recent[]> {
  try {
    const sb = getAdminSupabase();
    const sinceIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await (sb as unknown as { from: (t: string) => { select: (c: string) => { eq: (k: string, v: unknown) => { gte: (k: string, v: string) => { order: (c: string, o: unknown) => { limit: (n: number) => Promise<{ data: Array<{ kind: string; slug: string; updated_at: string }> }> } } } } } })
      .from("blog_articles")
      .select("kind,slug,updated_at")
      .eq("published", true)
      .gte("updated_at", sinceIso)
      .order("updated_at", { ascending: false })
      .limit(50);
    return (data || []).map((r) => ({
      url: `${SITE}/${r.kind}/${r.slug}`,
      lastmod: (r.updated_at || "").slice(0, 10),
    }));
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  // Vercel-cron auth: when triggered by Vercel cron, request includes the
  // CRON_SECRET via Authorization. Allow either Vercel cron header or our own.
  const auth = req.headers.get("authorization") || "";
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = !!req.headers.get("x-vercel-cron") || (cronSecret && auth === `Bearer ${cronSecret}`);
  if (!isVercelCron) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const manifest = loadManifestRecent();
  const db = await loadDbRecent();
  const merged = [...db, ...manifest];

  // Dedupe by URL, keep newest lastmod
  const map = new Map<string, string>();
  for (const r of merged) {
    const prev = map.get(r.url);
    if (!prev || r.lastmod > prev) map.set(r.url, r.lastmod);
  }
  const recent = Array.from(map.entries())
    .map(([url, lastmod]) => ({ url, lastmod }))
    .sort((a, b) => b.lastmod.localeCompare(a.lastmod))
    .slice(0, TOP_N);

  const urls = recent.map((r) => r.url);
  const indexnowResults = urls.length ? await pingIndexNow(urls) : [];

  // Best-effort Google sitemap ping (legacy but still acknowledged)
  let googlePing = "skipped";
  try {
    const r = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(`${SITE}/sitemap.xml`)}`, {
      method: "GET",
    });
    googlePing = `status:${r.status}`;
  } catch (e) {
    googlePing = `error:${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json({
    ok: true,
    pinged: urls.length,
    sample: urls.slice(0, 5),
    indexnow: indexnowResults,
    googlePing,
  });
}

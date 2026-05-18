import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { pingIndexNow } from "@/lib/distribution/indexnow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  kind?: "insights" | "comparisons";
  slug?: string;
  paths?: string[];
}

const SITE_HOST = "www.mypayadvisor.com";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  const expected = process.env.AUTOPILOT_SECRET;
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const targets = new Set<string>();
  // Track which URLs are NEW or UPDATED content (worth pinging IndexNow for).
  // Aggregate surfaces (/, /insights, /pulse) don't need IndexNow pings.
  const indexNowUrls = new Set<string>();

  if (body.kind && body.slug) {
    const articlePath = `/${body.kind}/${body.slug}`;
    targets.add(articlePath);
    targets.add(`/${body.kind}`);
    indexNowUrls.add(`https://${SITE_HOST}${articlePath}`);
  }
  if (Array.isArray(body.paths)) {
    for (const p of body.paths) {
      if (typeof p === "string" && p.startsWith("/")) {
        targets.add(p);
        // Only ping IndexNow for individual content URLs, not aggregates.
        if (
          (p.startsWith("/insights/") || p.startsWith("/comparisons/") || p.startsWith("/pulse/") || p.startsWith("/research/") || p.startsWith("/data/")) &&
          p.split("/").length >= 3
        ) {
          indexNowUrls.add(`https://${SITE_HOST}${p}`);
        }
      }
    }
  }
  // Surfaces that always benefit from a fresh autopilot publish.
  targets.add("/sitemap.xml");
  targets.add("/llms-full.txt");
  targets.add("/pulse");
  targets.add("/");

  const revalidated: string[] = [];
  for (const path of targets) {
    try {
      revalidatePath(path);
      revalidated.push(path);
    } catch {
      // intentionally ignored
    }
  }

  // Ping IndexNow for new content URLs. Fire-and-forget at API edge; we want a
  // best-effort hint to Bing/Yandex without blocking the response.
  let indexNowResults: Awaited<ReturnType<typeof pingIndexNow>> = [];
  if (indexNowUrls.size > 0) {
    try {
      indexNowResults = await pingIndexNow([...indexNowUrls]);
    } catch {
      // Don't fail the revalidate response if IndexNow is down.
    }
  }

  return NextResponse.json({
    ok: true,
    revalidated,
    indexNow: {
      pinged: [...indexNowUrls],
      results: indexNowResults,
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  kind?: "insights" | "comparisons";
  slug?: string;
  paths?: string[];
}

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
  if (body.kind && body.slug) {
    targets.add(`/${body.kind}/${body.slug}`);
    targets.add(`/${body.kind}`);
  }
  if (Array.isArray(body.paths)) {
    for (const p of body.paths) if (typeof p === "string" && p.startsWith("/")) targets.add(p);
  }
  // Surfaces that always benefit from a fresh autopilot publish.
  targets.add("/sitemap.xml");
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

  return NextResponse.json({ ok: true, revalidated });
}

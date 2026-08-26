// The one write-side hook the SEO autopilot has into the running site.
//
// Two modes, deliberately different:
//
//   { kind, slug, lean: true }
//     The daily loop's per-change purge. Fires the override cache tag and the
//     one page path. Nothing else. No homepage, no sitemap, no llms files, no
//     IndexNow. The loop changes up to 25 titles a day, and today's route
//     purged `/`, `/sitemap.xml`, `/llms-full.txt` and `/pulse` on every call
//     while pinging IndexNow each time, so 25 changes meant 25 homepage cache
//     drops and 25 Bing pings for the same batch. The loop now pings IndexNow
//     once per run, in its own batch.
//
//   { kind, slug } or { paths: [...] }
//     A publish. Keeps the old behaviour exactly (aggregate surfaces plus the
//     IndexNow ping), and additionally fires the override and article tags,
//     which the old shape had no way to reach.
//
// `kind` is validated against OVERRIDE_KINDS and `slug` against SLUG_RE, both
// imported from the override layer so the route, the DB check constraint and
// the loop cannot drift apart. A bad value is a 400, not a silent no-op that
// makes the loop think a change went live.
//
// Auth is unchanged: Bearer AUTOPILOT_SECRET, fail closed when the env var is
// missing.

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { pingIndexNow } from "@/lib/distribution/indexnow";
import { OVERRIDE_KINDS, SLUG_RE, overrideTag, type OverrideKind } from "@/lib/seo/overrides";
import { articleTag } from "@/app/(public)/_lib/render-blog-article";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  kind?: string;
  slug?: string;
  paths?: string[];
  lean?: boolean;
}

const SITE_HOST = "www.mypayadvisor.com";

/** `pages` overrides address a top-level route; the two article kinds nest. */
function pathFor(kind: OverrideKind, slug: string): string {
  if (kind === "pages") return slug === "home" ? "/" : `/${slug}`;
  return `/${kind}/${slug}`;
}

function isOverrideKind(value: unknown): value is OverrideKind {
  return typeof value === "string" && (OVERRIDE_KINDS as readonly string[]).includes(value);
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

  // Validate before doing anything. A typo in `kind` used to fall through to a
  // purge of the aggregates and a 200, which reads as success to the caller.
  if (body.kind !== undefined && !isOverrideKind(body.kind)) {
    return NextResponse.json(
      { error: "invalid_kind", allowed: OVERRIDE_KINDS },
      { status: 400 },
    );
  }
  if (
    body.slug !== undefined &&
    (typeof body.slug !== "string" || body.slug.length > 200 || !SLUG_RE.test(body.slug))
  ) {
    return NextResponse.json(
      { error: "invalid_slug", pattern: SLUG_RE.source, max_length: 200 },
      { status: 400 },
    );
  }
  if ((body.kind === undefined) !== (body.slug === undefined)) {
    return NextResponse.json({ error: "kind_and_slug_go_together" }, { status: 400 });
  }

  const kind = isOverrideKind(body.kind) ? body.kind : null;
  const slug = typeof body.slug === "string" ? body.slug : null;
  const lean = body.lean === true;

  if (lean && (!kind || !slug)) {
    return NextResponse.json({ error: "lean_requires_kind_and_slug" }, { status: 400 });
  }

  const targets = new Set<string>();
  const tags = new Set<string>();
  // URLs that are NEW or UPDATED content and worth an IndexNow ping. Empty in
  // lean mode by design.
  const indexNowUrls = new Set<string>();

  if (kind && slug) {
    tags.add(overrideTag(kind, slug));
    if (kind !== "pages") tags.add(articleTag(kind, slug));
    targets.add(pathFor(kind, slug));
  }

  if (lean) {
    // A tag purge alone does not reach the full-route cache entry, and a path
    // purge alone does not reach the `unstable_cache` entry the override
    // reader holds. Both, and only both.
    //
    // `paths` is still honoured in lean mode, and it is how the answer-block
    // lane asks for `/llms.txt` and `/llms-full.txt` (aeo.py sends them as
    // extra_revalidate). A title change sends no paths, so the two corpus
    // files are not rebuilt 25 times a day for changes they barely reflect.
    if (Array.isArray(body.paths)) {
      for (const p of body.paths) {
        if (typeof p === "string" && p.startsWith("/")) targets.add(p);
      }
    }
    const revalidated: string[] = [];
    for (const tag of tags) {
      try {
        revalidateTag(tag, "max");
      } catch {
        // A purge that cannot be delivered is not worth a 500 to the loop.
      }
    }
    for (const path of targets) {
      try {
        revalidatePath(path, "page");
        revalidated.push(path);
      } catch {
        // intentionally ignored
      }
    }
    return NextResponse.json({
      ok: true,
      lean: true,
      tags: [...tags],
      revalidated,
      indexNow: { pinged: [], results: [] },
    });
  }

  // ---- publish path: today's behaviour, plus the tags ----
  if (kind && slug) {
    targets.add(`/${kind}`);
    indexNowUrls.add(`https://${SITE_HOST}${pathFor(kind, slug)}`);
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
  targets.add("/llms.txt");
  targets.add("/llms-full.txt");
  targets.add("/pulse");
  targets.add("/");

  for (const tag of tags) {
    try {
      revalidateTag(tag, "max");
    } catch {
      // intentionally ignored
    }
  }

  const revalidated: string[] = [];
  for (const path of targets) {
    try {
      revalidatePath(path);
      revalidated.push(path);
    } catch {
      // intentionally ignored
    }
  }

  // Ping IndexNow for new content URLs. Best-effort hint to Bing/Yandex.
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
    lean: false,
    tags: [...tags],
    revalidated,
    indexNow: {
      pinged: [...indexNowUrls],
      results: indexNowResults,
    },
  });
}

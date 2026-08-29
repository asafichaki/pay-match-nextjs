import { after, NextResponse, type NextRequest } from "next/server";
import { classifyBot } from "@/lib/seo/crawl-log";
import { parseAttributionCookie, ATTRIBUTION_COOKIE } from "@/lib/attribution";
import { classifyChannel } from "@/lib/partners/channel";
import { getPartner } from "@/lib/partners/registry";
import { logOutboundClick } from "@/lib/partners/log-click";

/**
 * The outbound gate: /go/<partner>?from=<path>
 *
 * Every commercial link to a provider goes through here instead of straight to
 * the provider. Three things happen that could not happen with a plain <a>:
 *
 *   1. The destination comes from the `partners` table, so signing a program
 *      or pausing a partner is one UPDATE, not 21 edits across .tsx files.
 *   2. The click is recorded with the channel that sent the visitor, resolved
 *      first-touch. This is the only place on the site that can attribute a
 *      provider click to ChatGPT or Perplexity; neither GSC nor GA4 can.
 *   3. The link carries rel="sponsored nofollow" at the source and this route
 *      is disallowed in robots.txt, so no ranking signal leaks to Stripe.
 *
 * Fails soft everywhere. An unknown partner, a dead database or a missing env
 * var sends the visitor somewhere useful rather than showing them an error on
 * their way out.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FALLBACK = "/comparisons";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ partner: string }> },
) {
  const { partner: rawSlug } = await params;
  const slug = (rawSlug || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60);

  const origin = request.nextUrl.origin;
  const partner = slug ? await getPartner(slug) : null;

  if (!partner || partner.program_status === "paused") {
    // No dead end. A retired or mistyped partner lands on the hub, which is
    // the page most likely to answer what they were about to look for.
    return NextResponse.redirect(new URL(FALLBACK, origin), 302);
  }

  const ua = request.headers.get("user-agent");
  const isBot = classifyBot(ua) !== null;

  const first = parseAttributionCookie(request.cookies.get(ATTRIBUTION_COOKIE)?.value);
  const clickReferrer = request.headers.get("referer");

  const fromParam = request.nextUrl.searchParams.get("from");
  const fromPath = fromParam?.startsWith("/")
    ? fromParam
    : (() => {
        try {
          return clickReferrer ? new URL(clickReferrer).pathname : null;
        } catch {
          return null;
        }
      })();

  const channel = classifyChannel({
    firstUtmSource: first.utm_source,
    firstUtmMedium: first.utm_medium,
    firstReferrer: first.referrer,
    clickReferrer,
    selfHost: request.nextUrl.hostname,
  });

  // `?v=quote` is the contact/demo action, which on a merchant services
  // program is usually the event that actually pays. Counted separately so a
  // quote request is never averaged in with a browse.
  const variant = request.nextUrl.searchParams.get("v") === "quote" ? "quote" : "visit";
  const target =
    variant === "quote" ? (partner.quote_url ?? partner.destination_url) : partner.destination_url;
  const destination = withOurTag(target, partner.program_status);

  // Handed to `after()`, which is the whole reason this is not a bare
  // fire-and-forget call.
  //
  // On Vercel the function can be frozen the instant the 302 is returned, and
  // an un-awaited fetch is killed with it. That is not theoretical: the first
  // production deploy of this route redirected correctly every time and wrote
  // a row only when an instance happened to stay warm, so the log silently
  // under-counted. A measurement layer that quietly loses clicks is worse than
  // none, because it would have made the ChatGPT channel look small, which is
  // the exact conclusion this table exists to prevent.
  //
  // `after()` keeps the runtime alive for the callback without the visitor
  // waiting on it, so the redirect stays as fast as it was.
  try {
    after(() => logOutboundClick({
      partner_slug: partner.slug,
      from_path: fromPath,
      channel,
      click_referrer: clickReferrer,
      first_referrer: first.referrer,
      utm_source: first.utm_source,
      utm_medium: first.utm_medium,
      utm_campaign: first.utm_campaign,
      destination_url: destination,
      variant,
      ua,
      is_bot: isBot,
    }));
  } catch {
    // A logging row is never worth a 500 on the way out.
  }

  const res = NextResponse.redirect(destination, 302);
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

/**
 * Identify ourselves in the partner's own analytics while no program is signed,
 * so the referral is provably ours when it comes time to ask for one.
 *
 * Once a program is `active` the stored URL already carries the network's
 * tracking parameters and is left completely alone: several networks void a
 * commission on a click whose query string was rewritten.
 */
function withOurTag(url: string, status: string): string {
  if (status === "active") return url;
  try {
    const u = new URL(url);
    if (!u.searchParams.has("utm_source")) {
      u.searchParams.set("utm_source", "mypayadvisor.com");
      u.searchParams.set("utm_medium", "referral");
    }
    return u.toString();
  } catch {
    return url;
  }
}

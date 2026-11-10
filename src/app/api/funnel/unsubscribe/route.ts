// One-click unsubscribe for the funnel drip (CAN-SPAM 15 USC 7704(a)(3),
// RFC 8058). GET from the footer link, POST from the mail client's own button.
// Marks every quiz_leads row for that address as unsubscribed; the tick cron
// already skips that state. Never 500s to the person: a bad link shows a
// plain page telling them to email us instead.

import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/funnel/admin-supabase";
import { verifyUnsubscribeToken } from "@/lib/funnel/email-footer";
import { OPERATOR_NAME, OPERATOR_ADDRESS_LINE } from "@/lib/funnel/operator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function page(title: string, body: string, status = 200): NextResponse {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title}</title></head>` +
    `<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1e293b;background:#fff"><main style="max-width:560px;margin:0 auto;padding:48px 24px"><h1 style="font-size:22px;margin:0 0 12px">${title}</h1><p style="font-size:16px;line-height:1.6;margin:0 0 24px">${body}</p>` +
    `<p style="font-size:12px;color:#64748b">myPayAdvisor is operated by ${OPERATOR_NAME}, ${OPERATOR_ADDRESS_LINE}.</p></main></body></html>`;
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}

async function handle(req: NextRequest): Promise<NextResponse> {
  const email = (req.nextUrl.searchParams.get("e") || "").trim().toLowerCase();
  const token = req.nextUrl.searchParams.get("t") || "";
  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return page(
      "This link did not work",
      "Email <a href=\"mailto:info@mypayadvisor.com?subject=Unsubscribe\">info@mypayadvisor.com</a> with the word Unsubscribe and we will stop the emails by hand.",
      400,
    );
  }
  try {
    const supabase = getAdminSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("quiz_leads")
      .update({ funnel_state: "unsubscribed" })
      .ilike("email", email);
    if (error) throw error;
  } catch (err) {
    console.error("[unsubscribe] update failed", err);
    return page(
      "Something went wrong on our side",
      "Email <a href=\"mailto:info@mypayadvisor.com?subject=Unsubscribe\">info@mypayadvisor.com</a> and we will stop the emails by hand.",
      500,
    );
  }
  return page("You're unsubscribed", "No more emails from myPayAdvisor will reach this address. If you still want a shortlist later, run the quiz again.");
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

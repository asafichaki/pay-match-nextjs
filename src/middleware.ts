import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server';
import { logCrawlHit } from '@/lib/seo/crawl-log';

/**
 * Two jobs, deliberately kept apart.
 *
 * `/admin/*` gets the session refresh and the role check, exactly as before.
 * Every other matched path gets nothing but a bot-crawl log line and a pass
 * through. The matcher was widened from `/admin/:path*` to the public pages in
 * PR 2, so the admin path MUST stay the only one that talks to Supabase Auth:
 * running `getUser()` on every public request would put a round trip in front
 * of every page load to log a request that is not even from a human.
 *
 * The crawl log is fire and forget through `event.waitUntil`, so the response
 * is never waiting on it, and `logCrawlHit` resolves on every failure path.
 */
export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith('/admin');

  if (!isAdminRoute) {
    try {
      const hit = logCrawlHit(request.headers.get('user-agent'), request.nextUrl);
      if (hit) event.waitUntil(hit);
    } catch {
      // A crawl log line is never worth a 500 on a public page.
    }
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect admin routes (except login)
  const isLoginRoute = pathname === '/admin/login';

  if (!isLoginRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  // Verify admin role for authenticated users on admin routes (except login)
  if (!isLoginRoute && user) {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role !== 'admin') {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  // If logged in admin visits login page, redirect to dashboard
  if (isLoginRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  // `/admin/:path*` first so the auth path is explicit and obvious. The second
  // entry is every public page: anything that is not an API route, a Next
  // build asset, or a file with an extension. `sitemap.xml`, `robots.txt`,
  // `llms.txt` and `llms-full.txt` are excluded by the extension rule, which
  // is intended: a crawler fetching the sitemap is not a page crawl and would
  // drown the pillar signal the escalation ladder reads.
  matcher: [
    '/admin/:path*',
    '/((?!api/|_next/static|_next/image|.*\\.[^/]+$).*)',
  ],
};

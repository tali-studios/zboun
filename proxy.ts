import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  dashboardHrefForRole,
  isCustomerAppPath,
} from "@/lib/auth-routing";
import { env } from "@/lib/env";
import { getRestaurantSubdomainRedirectUrl } from "@/lib/subdomain-redirect";
import { mergeAuthCookieOptions } from "@/lib/supabase/session";

export async function proxy(request: NextRequest) {
  const subdomainRedirectUrl = getRestaurantSubdomainRedirectUrl(request, env.appUrl);
  if (subdomainRedirectUrl) {
    // 307 (not 308): avoid edge/browser caching of a permanent Location that
    // previously dropped paths like /menu on wildcard subdomains.
    const redirect = NextResponse.redirect(subdomainRedirectUrl, 307);
    redirect.headers.set("Cache-Control", "no-store");
    redirect.headers.set("X-Zboun-Subdomain-Redirect", "path-preserving");
    return redirect;
  }

  let response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }>,
        headers?: Record<string, string>,
      ) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, mergeAuthCookieOptions(options));
        });
        if (headers) {
          for (const [key, value] of Object.entries(headers)) {
            response.headers.set(key, value);
          }
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let dashboardRole: string | null = null;
  if (user) {
    const { data: appUser } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    dashboardRole = appUser?.role ?? null;
  }

  const dashboardHref = dashboardHrefForRole(dashboardRole);
  // Store admins may browse the home page; other dashboard routes still redirect away from login/signup/account.
  if (dashboardHref && isCustomerAppPath(pathname) && pathname !== "/") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = dashboardHref;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

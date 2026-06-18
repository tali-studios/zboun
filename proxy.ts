import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  dashboardHrefForRole,
  isCustomerAppPath,
} from "@/lib/auth-routing";
import { mergeAuthCookieOptions } from "@/lib/supabase/session";

export async function proxy(request: NextRequest) {
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
  if (dashboardHref && isCustomerAppPath(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = dashboardHref;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  // Home page: customers must be signed in
  if (pathname === "/" && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", "/");
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

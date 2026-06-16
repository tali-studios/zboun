/**
 * Long-lived customer auth — stay signed in on this device until sign-out.
 * The proxy refreshes Supabase tokens on each visit; cookie maxAge keeps the
 * refresh token available to the browser for up to one year.
 *
 * In Supabase Dashboard → Authentication → Sessions, leave "Time-box" and
 * "Inactivity timeout" disabled (0) so server-side limits do not sign users out early.
 */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

/** Applied when Supabase SSR writes auth cookies (proxy + server client). */
export const AUTH_COOKIE_OPTIONS = {
  maxAge: SESSION_MAX_AGE_SECONDS,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function mergeAuthCookieOptions(options?: Record<string, unknown>): Record<string, unknown> {
  return {
    ...options,
    ...AUTH_COOKIE_OPTIONS,
    httpOnly: options?.httpOnly ?? true,
  };
}

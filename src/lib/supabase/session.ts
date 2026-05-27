/**
 * Persistent auth cookies — stay signed in on this device until they sign out.
 * Middleware refreshes the session on each visit so the login is effectively one-time.
 */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 10;

/** Applied when Supabase SSR writes auth cookies (middleware + server client). */
export const AUTH_COOKIE_OPTIONS = {
  maxAge: SESSION_MAX_AGE_SECONDS,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

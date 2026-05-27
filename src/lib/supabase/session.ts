/** Keep users signed in on the same device for up to 3 years (cookie + refresh cycle). */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 3;

/** Applied when Supabase SSR writes auth cookies (middleware + server client). */
export const AUTH_COOKIE_OPTIONS = {
  maxAge: SESSION_MAX_AGE_SECONDS,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

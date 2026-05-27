/** Safe post-login path: same-origin relative path only (no open redirects). */
export function getSafeRedirectPath(raw: unknown, fallback = "/"): string {
  const value = String(raw ?? "").trim();
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("\\") || value.includes("@")) return fallback;
  return value;
}

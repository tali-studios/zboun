import type { NextRequest } from "next/server";

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "admin",
  "mail",
  "webmail",
  "smtp",
  "imap",
  "pop",
  "no-reply",
  "noreply",
  "ftp",
  "cpanel",
  "autodiscover",
  "autoconfig",
]);

function getRootHostname(appUrl: string): string | null {
  try {
    return new URL(appUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** e.g. restaurant.zboun.net → "restaurant" */
export function getRestaurantSlugFromHost(
  host: string,
  rootHostname: string,
): string | null {
  const normalizedHost = host.split(":")[0]?.trim().toLowerCase() ?? "";
  const suffix = `.${rootHostname}`;
  if (!normalizedHost.endsWith(suffix) || normalizedHost === rootHostname) {
    return null;
  }

  const subdomain = normalizedHost.slice(0, -suffix.length);
  if (!subdomain || subdomain.includes(".")) return null;
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(subdomain)) return null;
  if (RESERVED_SUBDOMAINS.has(subdomain)) return null;

  return subdomain;
}

export function getRestaurantSubdomainRedirectUrl(
  request: NextRequest,
  appUrl: string,
): URL | null {
  const rootHostname = getRootHostname(appUrl);
  if (!rootHostname) return null;

  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    request.nextUrl.hostname;

  const slug = getRestaurantSlugFromHost(host, rootHostname);
  if (!slug) return null;

  // Keep path so e.g. {slug}.zboun.net/menu → zboun.net/{slug}/menu
  const path = resolveSubdomainRequestPath(request);
  const suffix = path === "/" ? "" : path;
  const redirectUrl = new URL(`/${slug}${suffix}`, `${appUrl.replace(/\/+$/, "")}/`);
  redirectUrl.search = request.nextUrl.search;
  return redirectUrl;
}

function resolveSubdomainRequestPath(request: NextRequest): string {
  const candidates = [
    request.nextUrl.pathname,
    safeUrlPathname(request.url),
    request.headers.get("x-forwarded-uri"),
    request.headers.get("x-invoke-path"),
    request.headers.get("x-vercel-forwarded-path"),
  ];

  for (const candidate of candidates) {
    const path = normalizePathname(candidate);
    if (path) return path;
  }
  return "/";
}

function safeUrlPathname(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value, "https://zboun.net").pathname;
  } catch {
    return null;
  }
}

function normalizePathname(value: string | null | undefined): string | null {
  if (!value) return null;
  const pathOnly = value.split("?")[0]?.split("#")[0]?.trim() ?? "";
  if (!pathOnly.startsWith("/")) return null;
  if (pathOnly.includes("://")) return null;
  return pathOnly.replace(/\/{2,}/g, "/") || "/";
}

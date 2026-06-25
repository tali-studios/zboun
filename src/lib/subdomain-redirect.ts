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

  const redirectUrl = new URL(`/${slug}`, `${appUrl.replace(/\/+$/, "")}/`);
  redirectUrl.search = request.nextUrl.search;
  return redirectUrl;
}

export function getRestaurantMenuUrls(appUrl: string, slug: string) {
  const base = appUrl.replace(/\/+$/, "");
  const cleanSlug = slug.replace(/^\/+|\/+$/g, "");
  return {
    /** Online ordering menu (cart + WhatsApp) */
    order: `${base}/${cleanSlug}`,
    /** In-restaurant view-only menu (no add / order) */
    inStore: `${base}/${cleanSlug}/menu`,
  };
}

/** Shareable storefront URL as `{slug}.zboun.net` (falls back to path on localhost). */
export function getRestaurantSubdomainStoreUrl(appUrl: string, slug: string): string {
  const base = appUrl.replace(/\/+$/, "");
  const cleanSlug = slug.replace(/^\/+|\/+$/g, "");
  if (!cleanSlug) return base;

  try {
    const url = new URL(base);
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost")) {
      return `${base}/${cleanSlug}`;
    }
    return `${url.protocol}//${cleanSlug}.${host}`;
  } catch {
    return `${base}/${cleanSlug}`;
  }
}

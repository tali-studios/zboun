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

/** Shareable storefront host as `{slug}.zboun.net` (no protocol; falls back to path on localhost). */
export function getRestaurantSubdomainStoreUrl(appUrl: string, slug: string): string {
  let base = String(appUrl ?? "").trim();
  // Strip any repeated protocol prefixes (e.g. https://https://zboun.net)
  while (/^https?:\/\//i.test(base)) {
    base = base.replace(/^https?:\/\//i, "");
  }
  base = base.replace(/\/+$/, "");
  const cleanSlug = String(slug ?? "").replace(/^\/+|\/+$/g, "");
  if (!cleanSlug) return base;

  try {
    const url = new URL(`https://${base}`);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost")) {
      return `${host}/${cleanSlug}`;
    }
    return `${cleanSlug}.${host}`;
  } catch {
    return `${base}/${cleanSlug}`;
  }
}

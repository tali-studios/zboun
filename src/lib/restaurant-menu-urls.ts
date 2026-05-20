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

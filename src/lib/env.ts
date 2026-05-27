function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

/** Public site origin — used for canonical URLs, sitemap, and Open Graph. Set in production. */
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    "",
  appUrl: trimTrailingSlash(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  /** Optional: Google Search Console HTML tag verification content value */
  googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || undefined,
  /** Google Maps JavaScript API key (restrict by HTTP referrer in Google Cloud) */
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || "",
  /** Default delivery search radius in km */
  defaultDeliveryRadiusKm: Number(process.env.NEXT_PUBLIC_DEFAULT_DELIVERY_RADIUS_KM ?? 10),
};

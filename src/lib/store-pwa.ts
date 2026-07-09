import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

export type StorePwaRestaurant = {
  name: string;
  slug: string;
  logo_url: string | null;
  banner_url?: string | null;
  description?: string | null;
  menu_theme_color?: string | null;
};

/** Absolute icon URL served by /api/store-icon/[slug] (padded PNG from store logo). */
export function storeIconUrl(slug: string, size: 180 | 192 | 512): string {
  const base = getSiteUrl().replace(/\/+$/, "");
  return `${base}/api/store-icon/${encodeURIComponent(slug)}?size=${size}`;
}

export function storeManifestUrl(slug: string): string {
  return `/${slug}/manifest.webmanifest`;
}

export function shortStoreName(name: string, max = 12): string {
  const trimmed = name.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, Math.max(1, max - 1)).trimEnd()}…`;
}

/** Icons + apple web app + per-store manifest for Add to Home Screen / share. */
export function storePwaMetadata(restaurant: StorePwaRestaurant): Pick<
  Metadata,
  "applicationName" | "appleWebApp" | "icons" | "manifest"
> {
  const hasLogo = Boolean(restaurant.logo_url?.trim());
  const icon180 = storeIconUrl(restaurant.slug, 180);
  const icon192 = storeIconUrl(restaurant.slug, 192);
  const icon512 = storeIconUrl(restaurant.slug, 512);

  return {
    applicationName: restaurant.name,
    appleWebApp: {
      capable: true,
      title: restaurant.name,
      statusBarStyle: "default",
    },
    manifest: storeManifestUrl(restaurant.slug),
    icons: hasLogo
      ? {
          icon: [
            { url: icon192, type: "image/png", sizes: "192x192" },
            { url: icon512, type: "image/png", sizes: "512x512" },
          ],
          apple: [{ url: icon180, sizes: "180x180", type: "image/png" }],
          shortcut: [icon192],
        }
      : undefined,
  };
}

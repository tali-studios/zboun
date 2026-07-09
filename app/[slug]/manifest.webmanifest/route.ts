import { NextResponse } from "next/server";
import { getRestaurantBySlug } from "@/lib/data";
import { getSiteUrl } from "@/lib/site";
import { shortStoreName, storeIconUrl } from "@/lib/store-pwa";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant || !restaurant.is_active) {
    return new NextResponse("Not found", { status: 404 });
  }

  const base = getSiteUrl().replace(/\/+$/, "");
  const startPath = `/${restaurant.slug}`;
  const theme =
    restaurant.menu_theme_color?.trim() &&
    /^#[0-9a-fA-F]{6}$/.test(restaurant.menu_theme_color.trim())
      ? restaurant.menu_theme_color.trim()
      : "#7854ff";

  const hasLogo = Boolean(restaurant.logo_url?.trim());
  const icons = hasLogo
    ? [
        {
          src: storeIconUrl(restaurant.slug, 192),
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: storeIconUrl(restaurant.slug, 512),
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: storeIconUrl(restaurant.slug, 512),
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
        {
          src: storeIconUrl(restaurant.slug, 180),
          sizes: "180x180",
          type: "image/png",
          purpose: "any",
        },
      ]
    : [
        {
          src: `${base}/icon-192.png?v=10`,
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `${base}/icon-512.png?v=10`,
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
      ];

  const manifest = {
    name: restaurant.name,
    short_name: shortStoreName(restaurant.name),
    description:
      restaurant.description?.trim() ||
      `Browse ${restaurant.name} on Zboun and order on WhatsApp.`,
    start_url: startPath,
    scope: startPath,
    id: `${base}${startPath}`,
    display: "standalone",
    background_color: "#f8f8ff",
    theme_color: theme,
    icons,
    categories: ["food", "business", "shopping"],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}

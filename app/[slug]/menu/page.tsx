import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MenuClient } from "@/components/menu-client";
import { RestaurantMenuHero } from "@/components/restaurant-menu-hero";
import { getRestaurantBySlug, getRestaurantMenu } from "@/lib/data";
import { normalizeBrowseSections } from "@/lib/browse-sections";
import { getSiteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant || !restaurant.is_active) {
    return { title: "Menu" };
  }
  const base = getSiteUrl();
  const path = `/${restaurant.slug}/menu`;
  const title = `${restaurant.name} — menu`;
  const description =
    restaurant.description?.trim() ||
    `Browse the ${restaurant.name} menu — items and prices for in-restaurant reference.`;
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${restaurant.name} menu`,
      description,
      url: `${base}${path}`,
      type: "website",
      ...(restaurant.banner_url || restaurant.logo_url
        ? {
            images: [
              {
                url: restaurant.banner_url || restaurant.logo_url!,
                alt: `${restaurant.name} cover`,
              },
            ],
          }
        : {}),
    },
  };
}

export default async function RestaurantInStoreMenuPage({ params }: Props) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant || !restaurant.is_active) {
    notFound();
  }

  const categories = await getRestaurantMenu(restaurant.id);
  const browseSections = normalizeBrowseSections(restaurant.browse_sections ?? []);
  const heroEyebrow = (browseSections[0] ?? "Menu").toUpperCase();

  const tagline =
    restaurant.description?.trim() ||
    "Browse our menu — items and prices for reference while you dine in.";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F9FAFB]">
      <RestaurantMenuHero
        restaurant={restaurant}
        heroEyebrow={heroEyebrow}
        tagline={tagline}
        menuThemeColor={restaurant.menu_theme_color}
        modeBadge="In-restaurant menu · view only"
      />

      <main className="container px-3 pb-10 pt-3 sm:px-6 sm:pb-12 sm:pt-6 lg:pb-8">
        <MenuClient
          viewOnly
          restaurantName={restaurant.name}
          restaurantPhone={restaurant.phone}
          restaurantId={restaurant.id}
          restaurantSlug={restaurant.slug}
          lbpRate={Number(restaurant.lbp_rate ?? 89500)}
          categories={categories}
          menuThemeColor={restaurant.menu_theme_color}
        />
      </main>
    </div>
  );
}

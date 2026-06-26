import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MenuClient } from "@/components/menu-client";
import { RestaurantMenuHero } from "@/components/restaurant-menu-hero";
import { getRestaurantBySlug, getRestaurantMenu } from "@/lib/data";
import { getStorefrontQrLabels, isFoodMenuBusiness } from "@/lib/browse-sections";
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
  const food = isFoodMenuBusiness(restaurant.browse_sections);
  const title = food ? `${restaurant.name} — menu` : `${restaurant.name} — store`;
  const description =
    restaurant.description?.trim() ||
    (food
      ? `Browse the ${restaurant.name} menu — items and prices for in-restaurant reference.`
      : `Browse ${restaurant.name} — products and prices for in-store reference.`);
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
    openGraph: {
      title: food ? `${restaurant.name} menu` : `${restaurant.name} store`,
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

  const viewLabels = getStorefrontQrLabels(restaurant.browse_sections);
  const tagline = restaurant.description?.trim() || viewLabels.inStoreViewTagline;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F9FAFB]">
      <RestaurantMenuHero
        restaurant={restaurant}
        tagline={tagline}
        menuThemeColor={restaurant.menu_theme_color}
        modeBadge={viewLabels.inStoreViewBadge}
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

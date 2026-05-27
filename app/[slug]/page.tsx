import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRestaurantBySlug, getRestaurantMenu } from "@/lib/data";
import { MenuClient } from "@/components/menu-client";
import { RestaurantMenuHero } from "@/components/restaurant-menu-hero";
import { DeliveryLocationProvider } from "@/components/delivery-location-provider";
import { getCustomerOrderContext } from "@/lib/customer-order-context";
import { getSiteUrl } from "@/lib/site";
import { normalizeBrowseSections } from "@/lib/browse-sections";

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
  const path = `/${restaurant.slug}`;
  const title = `${restaurant.name} — menu`;
  const description =
    restaurant.description?.trim() ||
    `View the ${restaurant.name} menu and send your order on WhatsApp with Zboun.`;
  return {
    title,
    description,
    alternates: { canonical: path },
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
    twitter: {
      card: restaurant.banner_url || restaurant.logo_url ? "summary_large_image" : "summary",
      title: `${restaurant.name} menu`,
      description,
    },
  };
}

export default async function RestaurantMenuPage({ params }: Props) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant || !restaurant.is_active) {
    notFound();
  }

  const categories = await getRestaurantMenu(restaurant.id);
  const browseSections = normalizeBrowseSections(restaurant.browse_sections ?? []);
  const heroEyebrow = (browseSections[0] ?? "Menu").toUpperCase();

  const tagline = restaurant.description?.trim() || "Browse the menu and send your order on WhatsApp.";

  const avgRating =
    restaurant.user_avg_rating != null && Number.isFinite(Number(restaurant.user_avg_rating))
      ? Math.round(Number(restaurant.user_avg_rating) * 10) / 10
      : null;
  const ratingCount = restaurant.user_rating_count ?? 0;
  const { isLoggedIn, defaultCustomerName, savedAddresses } = await getCustomerOrderContext();

  return (
    <DeliveryLocationProvider>
      <div className="min-h-screen overflow-x-hidden bg-[#F9FAFB]">
        <RestaurantMenuHero restaurant={restaurant} heroEyebrow={heroEyebrow} tagline={tagline} />

        <main className="container px-3 pb-10 pt-3 sm:px-6 sm:pb-12 sm:pt-6 lg:pb-8">
          <MenuClient
            restaurantName={restaurant.name}
            restaurantPhone={restaurant.phone}
            restaurantId={restaurant.id}
            restaurantSlug={restaurant.slug}
            avgRating={avgRating}
            ratingCount={ratingCount}
            lbpRate={Number(restaurant.lbp_rate ?? 89500)}
            categories={categories}
            defaultCustomerName={defaultCustomerName}
            savedAddresses={savedAddresses}
            isLoggedIn={isLoggedIn}
          />
        </main>
      </div>
    </DeliveryLocationProvider>
  );
}

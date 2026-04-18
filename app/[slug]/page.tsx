import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getRestaurantBySlug, getRestaurantMenu } from "@/lib/data";
import { MenuClient } from "@/components/menu-client";
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
  const path = `/${restaurant.slug}`;
  const title = `${restaurant.name} — menu`;
  const description = `View the ${restaurant.name} menu and send your order on WhatsApp with Zboun.`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${restaurant.name} menu`,
      description,
      url: `${base}${path}`,
      type: "website",
      ...(restaurant.logo_url
        ? { images: [{ url: restaurant.logo_url, alt: `${restaurant.name} logo` }] }
        : {}),
    },
    twitter: {
      card: restaurant.logo_url ? "summary_large_image" : "summary",
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

  return (
    <main className="min-h-screen py-4 sm:py-6">
      <div className="container">
        <header className="mb-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 p-4 text-white shadow-lg md:mb-6 md:p-5">
          <div className="flex items-center gap-3">
            {restaurant.logo_url ? (
              <Image
                src={restaurant.logo_url}
                alt={`${restaurant.name} logo`}
                width={56}
                height={56}
                className="h-12 w-12 rounded-xl bg-white/90 p-1 object-contain md:h-14 md:w-14"
                unoptimized
              />
            ) : null}
            <h1 className="text-xl font-bold md:text-2xl">{restaurant.name}</h1>
          </div>
          <p className="text-sm text-emerald-50">Order directly on WhatsApp</p>
        </header>
        <MenuClient
          restaurantName={restaurant.name}
          restaurantPhone={restaurant.phone}
          categories={categories}
        />
      </div>
    </main>
  );
}

import Image from "next/image";
import { notFound } from "next/navigation";
import { getRestaurantBySlug, getRestaurantMenu } from "@/lib/data";
import { MenuClient } from "@/components/menu-client";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function RestaurantMenuPage({ params }: Props) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);

  if (!restaurant || !restaurant.is_active) {
    notFound();
  }

  const categories = await getRestaurantMenu(restaurant.id);

  return (
    <main className="min-h-screen py-6">
      <div className="container">
        <header className="mb-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 p-4 text-white shadow-lg md:p-5">
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

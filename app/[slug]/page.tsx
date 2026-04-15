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
        <header className="mb-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 p-5 text-white shadow-lg">
          <h1 className="text-2xl font-bold">{restaurant.name}</h1>
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

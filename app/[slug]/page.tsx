import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
    <div className="min-h-screen bg-[#f8f8ff]">
      {/* Minimal sticky top bar */}
      <header className="sticky top-0 z-40 border-b border-violet-100/80 bg-white/85 backdrop-blur-xl">
        <div className="container flex items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            {restaurant.logo_url ? (
              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white">
                <Image
                  src={restaurant.logo_url}
                  alt={`${restaurant.name} logo`}
                  width={36}
                  height={36}
                  className="h-full w-full object-contain p-0.5"
                  unoptimized
                />
              </div>
            ) : null}
            <div>
              <p className="text-sm font-bold leading-tight text-slate-900">{restaurant.name}</p>
              <p className="text-xs text-slate-400">Order via WhatsApp</p>
            </div>
          </div>
          <Link
            href="/"
            className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
          >
            ← All restaurants
          </Link>
        </div>
      </header>

      <main className="container py-4 sm:py-6 pb-24 lg:pb-6">
        <MenuClient
          restaurantName={restaurant.name}
          restaurantPhone={restaurant.phone}
          lbpRate={Number(restaurant.lbp_rate ?? 89500)}
          categories={categories}
        />
      </main>
    </div>
  );
}

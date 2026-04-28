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

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8f8ff]">
      <header className="sticky top-0 z-40 border-b border-violet-100/80 bg-white/90 backdrop-blur-xl">
        <div className="container flex items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-2.5">
            {restaurant.logo_url ? (
              <div className="h-8 w-8 overflow-hidden rounded-lg border border-slate-200 bg-white">
                <Image
                  src={restaurant.logo_url}
                  alt={`${restaurant.name} logo`}
                  width={32}
                  height={32}
                  className="h-full w-full object-contain p-0.5"
                  unoptimized
                />
              </div>
            ) : null}
            <p className="text-sm font-bold leading-tight text-slate-900">{restaurant.name}</p>
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
        <section className="mb-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative h-36 w-full bg-gradient-to-r from-violet-700 via-violet-600 to-fuchsia-600 sm:h-44">
            {restaurant.banner_url ? (
              <>
                <input id="banner-preview-toggle" type="checkbox" className="peer hidden" />
                <label htmlFor="banner-preview-toggle" className="absolute inset-0 z-10 cursor-zoom-in">
                  <span className="sr-only">Open banner image</span>
                </label>
                <Image
                  src={restaurant.banner_url}
                  alt={`${restaurant.name} banner`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="pointer-events-none fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/80 p-4 peer-checked:flex peer-checked:pointer-events-auto">
                  <label htmlFor="banner-preview-toggle" className="absolute inset-0 cursor-pointer" />
                  <div className="relative z-10 max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-black shadow-2xl">
                    <Image
                      src={restaurant.banner_url}
                      alt={`${restaurant.name} banner enlarged`}
                      width={1600}
                      height={900}
                      className="h-auto w-full object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              </>
            ) : null}
          </div>
          <div className="relative px-4 pb-4 pt-16 sm:px-6 sm:pt-20">
            {restaurant.logo_url ? (
              <>
                <input id="logo-preview-toggle" type="checkbox" className="peer hidden" />
                <label
                  htmlFor="logo-preview-toggle"
                  className="absolute -top-10 left-4 z-10 h-20 w-20 cursor-zoom-in overflow-hidden rounded-2xl border-4 border-white bg-white shadow sm:left-6 sm:h-24 sm:w-24"
                >
                  <Image
                    src={restaurant.logo_url}
                    alt={`${restaurant.name} logo`}
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                </label>
                <div className="pointer-events-none fixed inset-0 z-50 hidden items-center justify-center bg-slate-900/80 p-4 peer-checked:flex peer-checked:pointer-events-auto">
                  <label htmlFor="logo-preview-toggle" className="absolute inset-0 cursor-pointer" />
                  <div className="relative z-10 max-h-[90vh] w-full max-w-xl overflow-hidden rounded-2xl bg-white p-4 shadow-2xl">
                    <Image
                      src={restaurant.logo_url}
                      alt={`${restaurant.name} logo enlarged`}
                      width={800}
                      height={800}
                      className="h-auto w-full object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              </>
            ) : null}
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{restaurant.name}</h1>
            <p className="mt-1 text-sm text-slate-500">Order via WhatsApp</p>
            {restaurant.description ? (
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700">{restaurant.description}</p>
            ) : null}
          </div>
        </section>
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

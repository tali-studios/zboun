import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRestaurantBySlug, getRestaurantMenu } from "@/lib/data";
import { MenuClient } from "@/components/menu-client";
import { parseOpeningHours } from "@/lib/opening-hours";
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

  const { isLoggedIn, defaultCustomerName, savedAddresses } = await getCustomerOrderContext();
  const openingHours = parseOpeningHours(restaurant.opening_hours);
  const orderingEnabled = !restaurant.is_temporarily_closed;

  return (
    <DeliveryLocationProvider>
      <div className="min-h-screen overflow-x-hidden bg-[#F9FAFB]">
        {/* Sticky header — all screen sizes */}
        <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/95 backdrop-blur-md shadow-sm">
          <div className="container flex h-14 items-center justify-between px-4 md:h-16">
            {/* Logo */}
            <Link href="/" className="shrink-0 outline-none transition-opacity hover:opacity-85" aria-label="Zboun home">
              <Image
                src="/Logo.svg"
                alt="Zboun"
                width={100}
                height={30}
                className="h-7 w-auto object-contain md:h-8"
                priority
                unoptimized
              />
            </Link>

            {/* Desktop nav actions */}
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <svg className="h-4 w-4 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                My Orders
              </Link>
              <Link
                href={isLoggedIn ? "/account" : "/login"}
                className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-400/30 transition hover:bg-violet-700"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
                {isLoggedIn ? "Account" : "Sign in"}
              </Link>
            </div>
          </div>
        </header>

        {/* Desktop: banner constrained to exact same container+padding as the header above */}
        <div className="hidden md:block">
          <div className="container px-4 pt-3">
            <RestaurantMenuHero restaurant={restaurant} heroEyebrow={heroEyebrow} tagline={tagline} desktop />
          </div>
        </div>
        {/* Mobile: full-bleed */}
        <div className="md:hidden">
          <RestaurantMenuHero restaurant={restaurant} heroEyebrow={heroEyebrow} tagline={tagline} />
        </div>

        <main className="container px-3 pb-10 pt-3 sm:px-6 sm:pb-12 sm:pt-6 lg:pb-8">
          <MenuClient
            restaurantName={restaurant.name}
            restaurantPhone={restaurant.phone}
            restaurantId={restaurant.id}
            restaurantSlug={restaurant.slug}
            lbpRate={Number(restaurant.lbp_rate ?? 89500)}
            categories={categories}
            defaultCustomerName={defaultCustomerName}
            savedAddresses={savedAddresses}
            isLoggedIn={isLoggedIn}
            openingHours={restaurant.opening_hours}
            isTemporarilyClosed={restaurant.is_temporarily_closed}
            etaLabel={restaurant.eta_label}
            freeDelivery={restaurant.free_delivery}
            deliveryFeeUsd={Number(restaurant.delivery_fee_usd ?? 0)}
            orderingEnabled={orderingEnabled}
          />
        </main>
      </div>
    </DeliveryLocationProvider>
  );
}

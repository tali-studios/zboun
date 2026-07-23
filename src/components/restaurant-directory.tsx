"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Heart,
  MapPin,
  Search,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFavorites } from "@/hooks/use-favorites";
import {
  BROWSE_SECTION_ACCENTS,
  BROWSE_SECTION_OPTIONS,
  BROWSE_SUB_FILTER_ACCENTS,
  BROWSE_SUB_FILTER_ICONS,
  HOME_SEARCH_PLACEHOLDER,
  formatBrowseSectionsLabel,
  getSubFiltersForSection,
  matchesBrowseFilter,
  sectionHasSubFilters,
  type BrowseSection,
} from "@/lib/browse-sections";
import { useDeliveryLocation } from "@/components/delivery-location-provider";
import { distanceKm } from "@/lib/geo";
import { effectiveSearchRadiusKm } from "@/lib/delivery-radius";
import { DeliveryLocationSheet } from "@/components/delivery-location-sheet";
import {
  hasConfiguredOpeningHours,
  isRestaurantOpenNow,
  parseOpeningHours,
  RESTAURANT_TIMEZONE,
} from "@/lib/opening-hours";

const CATEGORY_CARD_META: Record<
  BrowseSection,
  { shortLabel: string; pastel: string; image: string }
> = {
  "Food & Restaurants": {
    shortLabel: "Food",
    pastel: "#FFF1E8",
    image: "/categories/category-restaurants.png",
  },
  Groceries: {
    shortLabel: "Market",
    pastel: "#EEF8E9",
    image: "/categories/category-groceries.png",
  },
  "Fashion & Apparel": {
    shortLabel: "Fashion",
    pastel: "#F3E8FF",
    image: "/categories/category-fashion-v2.png",
  },
  "Electronics & Tech": {
    shortLabel: "Electronics",
    pastel: "#E8F1FF",
    image: "/categories/category-electronics.png",
  },
  "Beauty & Pharmacy": {
    shortLabel: "Self-care",
    pastel: "#E6FAF5",
    image: "/categories/category-beauty-pharmacy.png",
  },
  "Home & Living": {
    shortLabel: "Home",
    pastel: "#FFF8E8",
    image: "/categories/category-home.png",
  },
  "Drinks & Beverages": {
    shortLabel: "Drinks",
    pastel: "#E8FBFF",
    image: "/categories/category-drinks-v2.png",
  },
  "Smoke & Tobacco": {
    shortLabel: "Smoke",
    pastel: "#F1F5F9",
    image: "/categories/category-smoke.png",
  },
  // Temporarily hidden — restore with BROWSE_SECTION_OPTIONS "Gas & Fuel":
  // "Gas & Fuel": {
  //   shortLabel: "Fuel",
  //   pastel: "#FFF4E5",
  //   image: "/categories/category-fuel.png",
  // },
  "Pets & Supplies": {
    shortLabel: "Pets",
    pastel: "#EEF2FF",
    image: "/categories/category-pets.png",
  },
  Automotive: {
    shortLabel: "Auto",
    pastel: "#F1F5F9",
    image: "/categories/category-auto.png",
  },
  "Gifts & Lifestyle": {
    shortLabel: "Gifts",
    pastel: "#FFE8F1",
    image: "/categories/category-gifts.png",
  },
  "Sports & Outdoors": {
    shortLabel: "Sports",
    pastel: "#ECFDF5",
    image: "/categories/category-sports-outdoors.png",
  },
};

const HERO_SLIDES = [
  {
    title: "Support local. Shop local.",
    subtitle: "Your favorite stores, now on WhatsApp.",
  },
  {
    title: "Order in one tap.",
    subtitle: "Clear WhatsApp orders — no app needed.",
  },
  {
    title: "Discover nearby.",
    subtitle: "Browse menus from stores around you.",
  },
] as const;

/** Suggested stores list on home when no category is selected. */
const SHOW_POPULAR_STORES = true;

function subFilterAccent(sub: string, parent: BrowseSection): string {
  return BROWSE_SUB_FILTER_ACCENTS[sub] ?? BROWSE_SECTION_ACCENTS[parent];
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbaHex(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

type RestaurantBranch = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  is_main: boolean;
};

type RestaurantCard = {
  id: string;
  name: string;
  slug: string;
  phone?: string | null;
  logo_url: string | null;
  banner_url: string | null;
  description: string | null;
  browse_sections?: string[] | null;
  rating: number | null;
  rating_count?: number;
  location: string | null;
  eta_label: string | null;
  free_delivery?: boolean;
  delivery_fee_usd?: number;
  fast_delivery_enabled?: boolean;
  delivery_radius_km?: number | null;
  opening_hours?: unknown;
  is_temporarily_closed?: boolean;
  latitude: number | null;
  longitude: number | null;
  branches?: RestaurantBranch[] | null;
};

type Props = {
  restaurants: RestaurantCard[];
  savedAddresses?: Array<{
    id: string;
    label: string;
    nickname: string | null;
    latitude: number;
    longitude: number;
    formatted_address: string | null;
    is_default: boolean;
  }>;
  isLoggedIn?: boolean;
  customerName?: string;
  initialQuery?: string;
};

function storeSubtitle(restaurant: RestaurantCard): string {
  const label = formatBrowseSectionsLabel(restaurant.browse_sections);
  if (label && label !== "Uncategorized") return label;
  if (restaurant.location?.trim()) return restaurant.location.trim();
  return "Local store";
}

export function RestaurantDirectory({
  restaurants,
  savedAddresses = [],
  isLoggedIn = false,
  customerName: _customerName = "",
  initialQuery,
}: Props) {
  const [query, setQuery] = useState((initialQuery ?? "").slice(0, 50));
  const [activeSection, setActiveSection] = useState<string>("all");
  const [activeSub, setActiveSub] = useState<string>("all");
  const [heroIndex, setHeroIndex] = useState(0);
  const heroTouchStartX = useRef<number | null>(null);
  const { isFavorite, toggle: toggleFavorite, favorites } = useFavorites();

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent, slug: string) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(slug);
    },
    [toggleFavorite],
  );

  const { location, openSheet, radiusKm, isResolvingLocation } = useDeliveryLocation();

  useEffect(() => {
    const id = window.setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [heroIndex]);

  const goHero = useCallback((dir: -1 | 1) => {
    setHeroIndex((i) => (i + dir + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  const onHeroTouchStart = useCallback((e: React.TouchEvent) => {
    heroTouchStartX.current = e.changedTouches[0]?.clientX ?? null;
  }, []);

  const onHeroTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (heroTouchStartX.current == null) return;
      const endX = e.changedTouches[0]?.clientX ?? heroTouchStartX.current;
      const dx = endX - heroTouchStartX.current;
      heroTouchStartX.current = null;
      if (Math.abs(dx) < 40) return;
      goHero(dx < 0 ? 1 : -1);
    },
    [goHero],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return restaurants
      .map((r) => {
        const points: { lat: number; lng: number }[] = [
          ...(r.branches ?? []).map((b) => ({ lat: b.latitude, lng: b.longitude })),
          ...(r.latitude != null && r.longitude != null ? [{ lat: r.latitude, lng: r.longitude }] : []),
        ];

        let distKm: number | null = null;
        if (location && points.length > 0) {
          const user = { lat: location.lat, lng: location.lng };
          distKm = Math.min(...points.map((p) => distanceKm(user, p)));
        }
        return { ...r, distKm };
      })
      .filter(({ distKm, ...r }) => {
        if (location && distKm !== null) {
          const maxKm = effectiveSearchRadiusKm(radiusKm, r.delivery_radius_km);
          if (distKm > maxKm) return false;
        }

        const matchesQuery =
          !normalized ||
          r.name.toLowerCase().includes(normalized) ||
          r.slug.toLowerCase().includes(normalized) ||
          (r.description ?? "").toLowerCase().includes(normalized) ||
          (r.location ?? "").toLowerCase().includes(normalized) ||
          (r.branches ?? []).some(
            (b) =>
              (b.address ?? "").toLowerCase().includes(normalized) ||
              b.name.toLowerCase().includes(normalized),
          );

        const matchesSection = matchesBrowseFilter(r.browse_sections, activeSection, activeSub);
        return matchesQuery && matchesSection;
      })
      .sort((a, b) => {
        if (a.distKm !== null && b.distKm !== null) return a.distKm - b.distKm;
        if (a.distKm !== null) return -1;
        if (b.distKm !== null) return 1;
        return 0;
      });
  }, [restaurants, query, activeSection, activeSub, location, radiusKm]);

  const categoryCounts = useMemo(() => {
    const counts = {} as Record<BrowseSection, number>;
    for (const section of BROWSE_SECTION_OPTIONS) {
      counts[section] = restaurants.filter((r) =>
        matchesBrowseFilter(r.browse_sections, section, "all"),
      ).length;
    }
    return counts;
  }, [restaurants]);

  const featuredCategories = useMemo(() => {
    const preferred: BrowseSection[] = [
      "Food & Restaurants",
      "Groceries",
      "Fashion & Apparel",
      "Electronics & Tech",
      "Beauty & Pharmacy",
      "Drinks & Beverages",
      "Smoke & Tobacco",
      "Home & Living",
      "Pets & Supplies",
      "Automotive",
      "Gifts & Lifestyle",
      "Sports & Outdoors",
      // "Gas & Fuel", // temporarily hidden
    ];
    return preferred.filter((s) => BROWSE_SECTION_OPTIONS.includes(s));
  }, []);

  const activeSectionKey = activeSection as BrowseSection;
  const showSubFilters = activeSection !== "all" && sectionHasSubFilters(activeSectionKey);
  const subFilterOptions = showSubFilters ? getSubFiltersForSection(activeSectionKey) : [];

  const pickSection = (id: string) => {
    setActiveSection(id);
    setActiveSub("all");
    if (typeof window !== "undefined" && id !== "all") {
      window.setTimeout(() => {
        document.getElementById("category-results")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    }
  };

  const pickSub = (sub: string) => {
    setActiveSub(sub);
  };

  const locationLabel = isResolvingLocation
    ? "Finding location…"
    : (location?.label ?? "Set your location");

  const hero = HERO_SLIDES[heroIndex];

  return (
    <>
      <DeliveryLocationSheet savedAddresses={savedAddresses} isLoggedIn={isLoggedIn} />

      {/* Sticky top bar — logo + location + orders */}
      <div className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 md:gap-3 md:px-6">
          <Link href="/" className="shrink-0" aria-label="Zboun home">
            <Image
              src="/Logo.svg?v=3"
              alt="Zboun"
              width={110}
              height={32}
              priority
              unoptimized
              className="h-8 w-auto object-contain md:h-9"
            />
          </Link>

          <div className="flex min-w-0 shrink items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={openSheet}
              className="inline-flex h-9 max-w-[11rem] min-w-0 items-center gap-1.5 rounded-full bg-slate-50 px-3 text-left transition hover:bg-slate-100 sm:max-w-[16rem] md:h-10 md:max-w-xs md:px-3.5"
              aria-label="Change delivery location"
            >
              <MapPin className="h-4 w-4 shrink-0 text-violet-600" strokeWidth={2.5} />
              <span className="truncate text-xs font-semibold text-slate-800 sm:text-sm">
                {locationLabel}
              </span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2.5} />
            </button>
            {/* Phone: search. Desktop: favorites + orders + account (or sign in). */}
            <Link
              href="/search"
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 md:hidden"
              aria-label="Search"
            >
              <Search className="h-5 w-5" strokeWidth={2} />
            </Link>
            <Link
              href="/favorites"
              className="relative hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 md:flex md:h-10 md:w-10"
              aria-label="Favorite stores"
            >
              <Heart className="h-5 w-5" strokeWidth={2} />
              {favorites.size > 0 ? (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold leading-none text-white">
                  {favorites.size > 9 ? "9+" : favorites.size}
                </span>
              ) : null}
            </Link>
            {isLoggedIn ? (
              <>
                <Link
                  href="/account/orders"
                  className="relative hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 md:flex md:h-10 md:w-10"
                  aria-label="Orders"
                >
                  <ClipboardList className="h-5 w-5" strokeWidth={2} />
                </Link>
                <Link
                  href="/account"
                  className="relative hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 md:flex md:h-10 md:w-10"
                  aria-label="Account"
                >
                  <User className="h-5 w-5" strokeWidth={2} />
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="hidden h-9 shrink-0 items-center rounded-full bg-violet-600 px-3.5 text-xs font-semibold text-white shadow-sm shadow-violet-400/30 transition hover:bg-violet-700 md:inline-flex md:h-10 md:px-4 md:text-sm"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 pb-8 pt-5 md:px-6 md:pb-12 md:pt-8">
        {/* Search — desktop only; phone uses header search icon → /search */}
        <div className="mb-7 hidden md:block">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value.slice(0, 50))}
              placeholder={HOME_SEARCH_PLACEHOLDER}
              maxLength={50}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
              aria-label="Search stores"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Shop by category */}
        <div className="mb-8 md:mb-10">
          {/* <h2 className="mb-3 text-lg font-bold text-slate-900 md:text-xl">Shop by category</h2> */}
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 md:py-0 lg:grid-cols-6">
            {featuredCategories.map((section) => {
              const meta = CATEGORY_CARD_META[section];
              const selected = activeSection === section;
              return (
                <button
                  key={section}
                  type="button"
                  onClick={() => pickSection(selected ? "all" : section)}
                  className={`flex w-[10.5rem] shrink-0 flex-col overflow-hidden rounded-[1.25rem] text-left shadow-sm ring-1 transition md:w-auto ${
                    selected
                      ? "ring-violet-400 ring-offset-2"
                      : "ring-black/[0.05] hover:-translate-y-0.5 hover:shadow-md"
                  }`}
                  style={{ backgroundColor: meta.pastel }}
                >
                  <div className="relative h-32 w-full overflow-hidden md:h-36">
                    <Image
                      src={meta.image}
                      alt=""
                      fill
                      className="object-cover object-center"
                      sizes="(max-width:768px) 168px, 180px"
                    />
                  </div>
                  <div className="bg-white/80 px-3 py-2.5 backdrop-blur-[2px]">
                    <p className="truncate text-sm font-bold text-slate-900">{meta.shortLabel}</p>
                    <p className="mt-0.5 text-xs font-medium text-violet-600">
                      {categoryCounts[section]} {categoryCounts[section] === 1 ? "store" : "stores"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero carousel */}
        <div
          className="relative mb-8 touch-pan-y overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#5B2CFF] via-[#6D3BFF] to-[#8B45F5] px-5 py-7 text-white shadow-lg shadow-violet-500/25 md:mb-10 md:px-10 md:py-10"
          onTouchStart={onHeroTouchStart}
          onTouchEnd={onHeroTouchEnd}
          role="region"
          aria-roledescription="carousel"
          aria-label="Promotions"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl md:h-64 md:w-64"
          />
          <div className="relative flex items-center justify-between gap-3 md:gap-6">
            <div className="min-w-0 flex-1 max-w-xl">
              <p className="text-xl font-bold leading-tight md:text-3xl">{hero.title}</p>
              <p className="mt-2 text-sm text-violet-100 md:text-base">{hero.subtitle}</p>
            </div>
            <div className="relative h-[4.75rem] w-[4.75rem] shrink-0 sm:h-28 sm:w-28 md:h-36 md:w-36" aria-hidden>
              <Image
                src="/hero-bag.png"
                alt=""
                fill
                priority
                unoptimized
                className="object-contain drop-shadow-[0_12px_24px_rgba(40,10,90,0.35)]"
                sizes="(max-width:640px) 76px, (max-width:768px) 112px, 144px"
              />
            </div>
          </div>
          <div className="relative mt-5 flex items-center justify-center gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setHeroIndex(i)}
                aria-label={`Show promo ${i + 1}`}
                className={`h-2 w-2 rounded-full transition ${
                  i === heroIndex ? "bg-white" : "bg-white/35 hover:bg-white/55"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Category results — inline below shop-by-category */}
        {activeSection !== "all" ? (
          <div id="category-results" className="mb-8 scroll-mt-24 md:mb-10">
            <div className="mb-1 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  {CATEGORY_CARD_META[activeSectionKey]?.shortLabel ?? activeSection}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Discover{" "}
                  {(CATEGORY_CARD_META[activeSectionKey]?.shortLabel ?? activeSection).toLowerCase()} near
                  you
                </p>
              </div>
              <button
                type="button"
                onClick={() => pickSection("all")}
                className="text-sm font-semibold text-violet-600 transition hover:text-violet-700"
              >
                Clear
              </button>
            </div>

            {showSubFilters ? (
              <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Refine {CATEGORY_CARD_META[activeSectionKey]?.shortLabel ?? activeSection}
                </p>
                <div className="mt-3 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
                  <button
                    type="button"
                    onClick={() => pickSub("all")}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                      activeSub === "all" ? "text-white" : "text-slate-700"
                    }`}
                    style={{
                      backgroundColor:
                        activeSub === "all"
                          ? BROWSE_SECTION_ACCENTS[activeSectionKey]
                          : rgbaHex(BROWSE_SECTION_ACCENTS[activeSectionKey], 0.14),
                    }}
                  >
                    All
                  </button>
                  {subFilterOptions.map((sub) => {
                    const on = activeSub === sub;
                    const color = subFilterAccent(sub, activeSectionKey);
                    const icon = BROWSE_SUB_FILTER_ICONS[sub];
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => pickSub(sub)}
                        className={`flex shrink-0 items-center gap-1.5 rounded-full py-1.5 pl-2 pr-4 text-xs font-semibold transition ${
                          on ? "text-white" : "text-slate-700"
                        }`}
                        style={{
                          backgroundColor: on ? color : rgbaHex(color, 0.14),
                        }}
                      >
                        {icon ? (
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-sm md:h-7 md:w-7"
                            aria-hidden="true"
                          >
                            {icon}
                          </span>
                        ) : null}
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="mt-5">
              {filtered.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
                  <p className="text-base font-semibold text-slate-700">No stores in this category</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {location
                      ? "Try adjusting your location or refine filters."
                      : "Try another refine filter or set your location."}
                  </p>
                </div>
              ) : (
                <ul className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3">
                  {filtered.map((restaurant) => {
                    const hasHours = hasConfiguredOpeningHours(restaurant.opening_hours);
                    const hours = parseOpeningHours(restaurant.opening_hours, {
                      fallbackToDefault: false,
                    });
                    const isClosed =
                      restaurant.is_temporarily_closed ||
                      (hasHours &&
                        !isRestaurantOpenNow(hours, {
                          isTemporarilyClosed: restaurant.is_temporarily_closed,
                          timeZone: RESTAURANT_TIMEZONE,
                        }));
                    const cuisine = restaurant.description?.trim() || storeSubtitle(restaurant);
                    const deliveryLabel = restaurant.free_delivery
                      ? "$0 Delivery"
                      : restaurant.delivery_fee_usd != null
                        ? `$${restaurant.delivery_fee_usd} Delivery`
                        : "Delivery";
                    // Prefer the square logo here — banner photos are wide and get
                    // cropped awkwardly in this small 4:3 thumbnail.
                    const usingLogo = Boolean(restaurant.logo_url);
                    const cardImageSrc = restaurant.logo_url || restaurant.banner_url;

                    return (
                      <li key={restaurant.id}>
                        <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06]">
                          <Link
                            href={`/${restaurant.slug}`}
                            className={`relative block aspect-[4/3] ${
                              usingLogo ? "bg-white" : "bg-slate-100"
                            }`}
                          >
                            {cardImageSrc ? (
                              <Image
                                src={cardImageSrc}
                                alt=""
                                fill
                                className={`${usingLogo ? "object-contain p-3" : "object-cover"} ${
                                  isClosed ? "opacity-70 grayscale-[0.3]" : ""
                                }`}
                                sizes="(max-width:768px) 50vw, 280px"
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-violet-100 text-lg font-bold text-violet-700">
                                {restaurant.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            {restaurant.rating != null ? (
                              <span className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-bold text-slate-800 shadow-sm">
                                <span className="text-violet-600" aria-hidden>
                                  ★
                                </span>
                                {Number(restaurant.rating).toFixed(1)}
                              </span>
                            ) : null}
                            {isClosed ? (
                              <span className="absolute left-2 top-2 rounded-md bg-rose-500/95 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                Closed
                              </span>
                            ) : null}
                          </Link>

                          <div className="flex flex-1 flex-col px-2.5 pb-3 pt-2.5 md:px-3.5 md:pb-4 md:pt-3">
                            <Link href={`/${restaurant.slug}`} className="min-w-0">
                              <h3 className="truncate text-sm font-bold text-slate-900 md:text-base">
                                {restaurant.name}
                              </h3>
                              <p className="mt-0.5 truncate text-xs font-medium text-violet-600 md:text-sm">
                                {cuisine}
                              </p>
                              {restaurant.location ? (
                                <p className="mt-1.5 flex items-center gap-1 truncate text-[11px] text-slate-500 md:text-xs">
                                  <MapPin
                                    className="h-3 w-3 shrink-0 text-violet-500"
                                    strokeWidth={2.5}
                                    aria-hidden
                                  />
                                  <span className="truncate">{restaurant.location}</span>
                                </p>
                              ) : null}
                              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 md:text-xs">
                                <Clock className="h-3 w-3 shrink-0" strokeWidth={2.25} aria-hidden />
                                <span>{restaurant.eta_label?.trim() || "—"}</span>
                                <span aria-hidden>•</span>
                                <span>{deliveryLabel}</span>
                              </p>
                            </Link>

                            <Link
                              href={`/${restaurant.slug}`}
                              className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-full border-2 border-violet-500 py-2 text-xs font-bold text-violet-600 transition hover:bg-violet-50 md:text-sm"
                            >
                              View menu
                              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                            </Link>
                          </div>
                        </article>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        ) : null}

        {/* Suggested stores — shown until a category is chosen */}
        {SHOW_POPULAR_STORES && activeSection === "all" ? (
          <div id="popular-stores">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900 md:text-xl">
                {query.trim() ? "Stores" : "Suggested stores"}
              </h2>
              {query.trim() ? (
                <button
                  type="button"
                  onClick={() => {
                    pickSection("all");
                    setQuery("");
                  }}
                  className="text-sm font-semibold text-violet-600 transition hover:text-violet-700"
                >
                  Clear
                </button>
              ) : (
                <Link
                  href="/search"
                  className="text-sm font-semibold text-violet-600 transition hover:text-violet-700"
                >
                  View all
                </Link>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
                <p className="text-base font-semibold text-slate-700">No businesses found</p>
                <p className="mt-1 text-sm text-slate-400">
                  {location
                    ? "Try increasing the search radius or choosing a different location."
                    : "Try another search or category."}
                </p>
                <button
                  type="button"
                  onClick={openSheet}
                  className="mt-4 rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
                >
                  {location ? "Adjust location" : "Set location"}
                </button>
              </div>
            ) : (
              <ul className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                {filtered.map((restaurant) => {
                  const hasHours = hasConfiguredOpeningHours(restaurant.opening_hours);
                  const hours = parseOpeningHours(restaurant.opening_hours, {
                    fallbackToDefault: false,
                  });
                  const isClosed =
                    restaurant.is_temporarily_closed ||
                    (hasHours &&
                      !isRestaurantOpenNow(hours, {
                        isTemporarilyClosed: restaurant.is_temporarily_closed,
                        timeZone: RESTAURANT_TIMEZONE,
                      }));

                  return (
                    <li key={restaurant.id}>
                      <article className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm ring-1 ring-black/[0.03] transition hover:shadow-md md:p-4">
                        <Link
                          href={`/${restaurant.slug}`}
                          className="flex min-w-0 flex-1 items-center gap-3"
                        >
                          {restaurant.logo_url ? (
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-slate-100 bg-slate-50 md:h-16 md:w-16">
                              <Image
                                src={restaurant.logo_url}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="64px"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700 md:h-16 md:w-16">
                              {restaurant.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate text-sm font-bold text-slate-900 md:text-base">
                                {restaurant.name}
                              </h3>
                              {isClosed ? (
                                <span className="shrink-0 rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">
                                  Closed
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-0.5 truncate text-xs font-medium text-violet-600 md:text-sm">
                              {storeSubtitle(restaurant)}
                            </p>
                          </div>
                        </Link>

                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            type="button"
                            aria-label={
                              isFavorite(restaurant.slug)
                                ? "Remove from favorites"
                                : "Add to favorites"
                            }
                            onClick={(e) => handleFavoriteClick(e, restaurant.slug)}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-50 hover:text-amber-500"
                          >
                            <svg
                              className={`h-4 w-4 ${
                                isFavorite(restaurant.slug)
                                  ? "fill-amber-500 text-amber-500"
                                  : "fill-none"
                              }`}
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                              aria-hidden
                            >
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </button>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}

        {/* Search results on home (Popular stores is hidden) */}
        {!SHOW_POPULAR_STORES && activeSection === "all" && query.trim() ? (
          <div id="search-stores" className="mt-2">
            <h2 className="mb-3 text-lg font-bold text-slate-900 md:text-xl">Stores</h2>
            {filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center">
                <p className="text-base font-semibold text-slate-700">No businesses found</p>
                <p className="mt-1 text-sm text-slate-400">Try another search.</p>
              </div>
            ) : (
              <ul className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                {filtered.map((restaurant) => {
                  return (
                    <li key={restaurant.id}>
                      <article className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm ring-1 ring-black/[0.03] md:p-4">
                        <Link
                          href={`/${restaurant.slug}`}
                          className="flex min-w-0 flex-1 items-center gap-3"
                        >
                          {restaurant.logo_url ? (
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-slate-100 bg-slate-50">
                              <Image
                                src={restaurant.logo_url}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="64px"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                              {restaurant.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-bold text-slate-900 md:text-base">
                              {restaurant.name}
                            </h3>
                            <p className="mt-0.5 truncate text-xs font-medium text-violet-600">
                              {storeSubtitle(restaurant)}
                            </p>
                          </div>
                        </Link>
                      </article>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}
      </section>

    </>
  );
}

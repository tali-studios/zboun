"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Search as SearchIcon,
  SlidersHorizontal,
  X,
  Heart,
  MapPin,
  Star,
} from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { useDeliveryLocation } from "@/components/delivery-location-provider";
import { formatDistance, distanceKm } from "@/lib/geo";
import {
  BROWSE_SECTION_OPTIONS,
  matchesBrowseFilter,
  type BrowseSection,
} from "@/lib/browse-sections";
import type { SearchMenuItemResult } from "@/lib/data";
import {
  hasConfiguredOpeningHours,
  isRestaurantOpenNow,
  parseOpeningHours,
  RESTAURANT_TIMEZONE,
} from "@/lib/opening-hours";
import {
  DEFAULT_SEARCH_FILTERS,
  SearchFilterSheet,
  type SearchFilterState,
} from "@/components/search-filter-sheet";

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
  activeOffer?: { discount: string; description?: string } | null;
  status?: string;
  branches?: Array<{ name: string; address?: string | null; latitude: number; longitude: number }>;
};

type SearchPageContentProps = {
  restaurants: RestaurantCard[];
  isLoggedIn: boolean;
};

const RECENT_SEARCHES_KEY = "zboun_recent_searches";
const MAX_RECENT_SEARCHES = 5;

const SECTION_SHORT: Record<BrowseSection, string> = {
  "Food & Restaurants": "Food",
  Groceries: "Market",
  "Fashion & Apparel": "Fashion",
  "Electronics & Tech": "Electronics",
  "Beauty & Pharmacy": "Self-care",
  "Home & Living": "Home",
  "Drinks & Beverages": "Drinks",
  "Smoke & Tobacco": "Smoke",
  "Pets & Supplies": "Pets",
  Automotive: "Auto",
  "Gifts & Lifestyle": "Gifts",
  "Sports & Outdoors": "Sports",
};

/** Same category card images / labels as the home page shop-by-category row. */
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

function sectionLabel(sections: string[] | null | undefined): string {
  if (!sections?.length) return "";
  const labels = sections
    .filter((s): s is BrowseSection => (BROWSE_SECTION_OPTIONS as readonly string[]).includes(s))
    .map((s) => SECTION_SHORT[s])
    .slice(0, 2);
  return labels.join(", ");
}

export function SearchPageContent({ restaurants }: SearchPageContentProps) {
  const [query, setQuery] = useState("");
  const [resultTab, setResultTab] = useState<"stores" | "items">("stores");
  const [filters, setFilters] = useState<SearchFilterState>(DEFAULT_SEARCH_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [itemResults, setItemResults] = useState<SearchMenuItemResult[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isFavorite, toggle: toggleFavorite } = useFavorites();
  const { location } = useDeliveryLocation();

  const trimmed = query.trim();
  const isSearching = trimmed.length > 0 || filters.sections.length > 0;
  const sectionKey = filters.sections.join("|");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as unknown;
        if (Array.isArray(parsed)) {
          const trimmedList = parsed
            .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
            .slice(0, MAX_RECENT_SEARCHES);
          setRecentSearches(trimmedList);
          if (trimmedList.length !== parsed.length) {
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(trimmedList));
          }
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Persist recent search after user pauses typing
  useEffect(() => {
    if (!trimmed) return;
    const t = window.setTimeout(() => {
      setRecentSearches((prev) => {
        const updated = [trimmed, ...prev.filter((s) => s !== trimmed)].slice(
          0,
          MAX_RECENT_SEARCHES,
        );
        try {
          localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        } catch {
          /* ignore */
        }
        return updated;
      });
    }, 800);
    return () => window.clearTimeout(t);
  }, [trimmed]);

  // Fetch matching menu items when searching
  useEffect(() => {
    if (!trimmed) {
      setItemResults([]);
      setItemsLoading(false);
      return;
    }

    const controller = new AbortController();
    setItemsLoading(true);
    const t = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: trimmed });
        // Single category can be filtered server-side; multi is filtered client-side
        if (filters.sections.length === 1) {
          params.set("section", filters.sections[0]);
        }
        const res = await fetch(`/api/search/items?${params}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          setItemResults([]);
          return;
        }
        const data = (await res.json()) as { items?: SearchMenuItemResult[] };
        let items = Array.isArray(data.items) ? data.items : [];
        if (filters.sections.length > 1) {
          items = items.filter((item) =>
            filters.sections.some((section) =>
              matchesBrowseFilter(item.restaurant.browse_sections, section, "all"),
            ),
          );
        }
        setItemResults(items);
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        setItemResults([]);
      } finally {
        setItemsLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(t);
    };
  }, [trimmed, sectionKey, filters.sections]);

  const removeSearch = (searchTerm: string) => {
    const updated = recentSearches.filter((s) => s !== searchTerm);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      /* ignore */
    }
  };

  const featuredStores = useMemo(
    () => restaurants.filter((r) => r.activeOffer).slice(0, 10),
    [restaurants],
  );

  const storeResults = useMemo(() => {
    const q = trimmed.toLowerCase();
    const browsingCategoryOnly = !q && filters.sections.length > 0;
    if (!q && !browsingCategoryOnly) return [];

    return restaurants
      .map((r) => {
        let distKm: number | null = null;
        if (location && r.latitude != null && r.longitude != null) {
          distKm = distanceKm(
            { lat: location.lat, lng: location.lng },
            { lat: r.latitude, lng: r.longitude },
          );
        }
        return { ...r, distKm };
      })
      .filter((r) => {
        const matchesQuery =
          browsingCategoryOnly ||
          r.name.toLowerCase().includes(q) ||
          r.slug.toLowerCase().includes(q) ||
          (r.description ?? "").toLowerCase().includes(q) ||
          (r.location ?? "").toLowerCase().includes(q) ||
          (r.browse_sections ?? []).some((s) => s.toLowerCase().includes(q)) ||
          (r.branches ?? []).some(
            (b) =>
              b.name.toLowerCase().includes(q) ||
              (b.address ?? "").toLowerCase().includes(q),
          );

        const matchesSection =
          filters.sections.length === 0 ||
          filters.sections.some((section) =>
            matchesBrowseFilter(r.browse_sections, section, "all"),
          );

        if (!matchesQuery || !matchesSection) return false;

        if (filters.freeDelivery && !r.free_delivery) return false;
        if (filters.fastDelivery && !r.fast_delivery_enabled) return false;
        if (filters.openNow) {
          const hasHours = hasConfiguredOpeningHours(r.opening_hours);
          const hours = parseOpeningHours(r.opening_hours, {
            fallbackToDefault: false,
          });
          const isClosed =
            r.is_temporarily_closed ||
            (hasHours &&
              !isRestaurantOpenNow(hours, {
                isTemporarilyClosed: r.is_temporarily_closed,
                timeZone: RESTAURANT_TIMEZONE,
              }));
          if (isClosed) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "rating" || filters.sortBy === "popular") {
          const ar = a.rating ?? -1;
          const br = b.rating ?? -1;
          if (br !== ar) return br - ar;
          const ac = a.rating_count ?? 0;
          const bc = b.rating_count ?? 0;
          if (bc !== ac) return bc - ac;
        }
        if (a.distKm != null && b.distKm != null) return a.distKm - b.distKm;
        if (a.distKm != null) return -1;
        if (b.distKm != null) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [restaurants, trimmed, filters, location]);

  const resultsLabel = trimmed
    ? `‘${trimmed}’`
    : filters.sections.length === 1
      ? SECTION_SHORT[filters.sections[0]]
      : filters.sections.length > 1
        ? `${filters.sections.length} categories`
        : "your search";

  const clearQuery = () => {
    setQuery("");
    setFilters(DEFAULT_SEARCH_FILTERS);
    setResultTab("stores");
    inputRef.current?.focus();
  };

  const openCategory = (section: BrowseSection) => {
    setFilters({ ...DEFAULT_SEARCH_FILTERS, sections: [section] });
    setResultTab("stores");
  };

  const pickSectionPill = (section: string) => {
    if (section === "all") {
      setFilters((prev) => ({ ...prev, sections: [] }));
      return;
    }
    setFilters((prev) => ({
      ...prev,
      sections:
        prev.sections.length === 1 && prev.sections[0] === section
          ? []
          : [section as BrowseSection],
    }));
  };

  const filtersActive =
    filters.sortBy !== "recommended" ||
    filters.freeDelivery ||
    filters.openNow ||
    filters.fastDelivery ||
    filters.sections.length > 0;

  return (
    <div className="min-h-screen bg-white pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
      {/* Header */}
      <div
        className={`sticky top-0 z-30 bg-white/95 backdrop-blur-md ${
          isSearching ? "" : "border-b border-slate-100"
        }`}
      >
        {isSearching ? (
          <div className="flex items-center gap-2 px-3 py-2.5">
            <button
              type="button"
              onClick={clearQuery}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
              aria-label="Clear search"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="relative min-w-0 flex-1">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value.slice(0, 50))}
                placeholder="Store name or item..."
                maxLength={50}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-4 pr-9 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                aria-label="Search"
                autoFocus
              />
              {query ? (
                <button
                  type="button"
                  onClick={clearQuery}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                  aria-label="Clear"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-slate-100 ${
                filtersActive ? "text-violet-700" : "text-slate-600"
              }`}
              aria-label="Filters"
            >
              <SlidersHorizontal className="h-5 w-5" strokeWidth={2} />
              {filtersActive ? (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-violet-600" aria-hidden />
              ) : null}
            </button>
          </div>
        ) : (
          <div className="relative flex h-14 items-center border-b border-slate-100 bg-white/95 px-4 backdrop-blur-md">
            <Link href="/" className="relative z-10 shrink-0" aria-label="Zboun home">
              <Image
                src="/Logo.svg?v=3"
                alt="Zboun"
                width={110}
                height={32}
                priority
                unoptimized
                className="h-8 w-auto object-contain"
              />
            </Link>
            <h1 className="pointer-events-none absolute inset-x-0 text-center text-[15px] font-semibold text-slate-900">
              Search
            </h1>
          </div>
        )}
      </div>

      {isSearching ? (
        /* ── Results view ── */
        <div>
          {/* Stores / Items tabs */}
          <div className="flex border-b border-slate-100">
            {(
              [
                { id: "stores" as const, label: "Stores" },
                { id: "items" as const, label: "Items" },
              ] as const
            ).map((tab) => {
              const active = resultTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setResultTab(tab.id)}
                  className={`relative flex-1 py-3 text-sm font-semibold transition ${
                    active ? "text-violet-700" : "text-slate-500"
                  }`}
                >
                  {tab.label}
                  {active ? (
                    <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-t-full bg-violet-600" />
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Category pills */}
          <div className="mt-3 flex gap-2 overflow-x-auto px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => pickSectionPill("all")}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                filters.sections.length === 0
                  ? "border border-violet-500 bg-white text-violet-700"
                  : "bg-slate-100 text-slate-800 hover:bg-slate-200"
              }`}
            >
              All
            </button>
            {BROWSE_SECTION_OPTIONS.map((section) => {
              const selected = filters.sections.includes(section);
              return (
                <button
                  key={section}
                  type="button"
                  onClick={() => pickSectionPill(section)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    selected
                      ? "border border-violet-500 bg-white text-violet-700"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                  }`}
                >
                  {SECTION_SHORT[section]}
                </button>
              );
            })}
          </div>

          {resultTab === "stores" ? (
            <div className="px-4 pt-4">
              <p className="mb-3 text-sm text-slate-400">
                {storeResults.length} {storeResults.length === 1 ? "result" : "results"} for{" "}
                {resultsLabel}
              </p>

              {storeResults.length === 0 ? (
                <div className="py-16 text-center">
                  <SearchIcon className="mx-auto h-10 w-10 text-slate-200" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">No stores found</p>
                  <p className="mt-1 text-sm text-slate-400">Try a different name or category.</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {storeResults.map((r) => {
                    const rating =
                      r.rating != null && Number.isFinite(Number(r.rating))
                        ? Math.round(Number(r.rating) * 10) / 10
                        : null;
                    const cats = sectionLabel(r.browse_sections);
                    const isFav = isFavorite(r.slug);

                    return (
                      <li key={r.id}>
                        <Link
                          href={`/${r.slug}`}
                          className="flex items-center gap-3 py-3.5 transition hover:bg-slate-50/80"
                        >
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-black/[0.06]">
                            {r.logo_url ? (
                              <Image
                                src={r.logo_url}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="56px"
                                unoptimized
                              />
                            ) : r.banner_url ? (
                              <Image
                                src={r.banner_url}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="56px"
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-400 to-fuchsia-500 text-lg font-bold text-white">
                                {r.name.charAt(0)}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[15px] font-bold text-slate-900">
                              {r.name}
                              {r.location ? (
                                <span className="font-semibold text-slate-700">
                                  {" "}
                                  - {r.location}
                                </span>
                              ) : null}
                            </p>
                            <p className="mt-0.5 truncate text-sm text-slate-400">
                              {cats || r.description || "Store"}
                            </p>
                          </div>

                          <div className="flex shrink-0 flex-col items-end gap-1.5">
                            {rating != null ? (
                              <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-violet-600">
                                <Star className="h-3.5 w-3.5 fill-violet-600" />
                                {rating}
                              </span>
                            ) : r.distKm != null ? (
                              <span className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-400">
                                <MapPin className="h-3 w-3" />
                                {formatDistance(r.distKm)}
                              </span>
                            ) : null}
                            <button
                              type="button"
                              aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFavorite(r.slug);
                              }}
                              className="rounded-full p-1 text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  isFav ? "fill-amber-500 text-amber-500" : ""
                                }`}
                              />
                            </button>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : (
            <div className="px-4 pt-4">
              <p className="mb-3 text-sm text-slate-400">
                {itemsLoading
                  ? "Searching items…"
                  : `${itemResults.length} ${itemResults.length === 1 ? "result" : "results"} for ${resultsLabel}`}
              </p>

              {itemsLoading && itemResults.length === 0 ? (
                <div className="space-y-3 py-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex animate-pulse items-center gap-3 py-2">
                      <div className="h-14 w-14 rounded-xl bg-slate-100" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-3.5 w-2/3 rounded bg-slate-100" />
                        <div className="h-3 w-1/3 rounded bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : itemResults.length === 0 ? (
                <div className="py-16 text-center">
                  <SearchIcon className="mx-auto h-10 w-10 text-slate-200" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">No items found</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Try another name, or browse stores instead.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {itemResults.map((item) => {
                    const price =
                      item.sale_price != null && item.sale_price < item.price
                        ? item.sale_price
                        : item.price;
                    const hasSale =
                      item.sale_price != null && item.sale_price < item.price;

                    return (
                      <li key={item.id}>
                        <Link
                          href={`/${item.restaurant.slug}`}
                          className="flex items-center gap-3 py-3.5 transition hover:bg-slate-50/80"
                        >
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-black/[0.06]">
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="56px"
                                unoptimized
                              />
                            ) : item.restaurant.logo_url ? (
                              <Image
                                src={item.restaurant.logo_url}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="56px"
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-400 to-fuchsia-500 text-sm font-bold text-white">
                                {item.name.charAt(0)}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[15px] font-bold text-slate-900">
                              {item.name}
                            </p>
                            <p className="mt-0.5 truncate text-sm text-slate-400">
                              {item.restaurant.name}
                              {item.restaurant.location
                                ? ` · ${item.restaurant.location}`
                                : ""}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            {hasSale ? (
                              <>
                                <p className="text-sm font-bold text-violet-700">
                                  ${price.toFixed(2)}
                                </p>
                                <p className="text-xs text-slate-400 line-through">
                                  ${item.price.toFixed(2)}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm font-bold text-slate-800">
                                ${price.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ── Discover view (empty query) ── */
        <div className="px-4 pb-8 pt-5">
          <div className="mb-6">
            <div className="relative">
              <SearchIcon
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value.slice(0, 50))}
                placeholder="Store name or item..."
                maxLength={50}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100"
                aria-label="Search"
              />
            </div>
          </div>

          {featuredStores.length > 0 ? (
            <section className="mb-6">
              <h2 className="mb-3 text-base font-bold text-slate-900">Featured</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {featuredStores.map((r) => (
                  <Link
                    key={r.id}
                    href={`/${r.slug}`}
                    className="group block w-[10.5rem] shrink-0"
                  >
                    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06] transition hover:-translate-y-1 hover:shadow-lg">
                      <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                        {r.banner_url ? (
                          <Image
                            src={r.banner_url}
                            alt={r.name}
                            fill
                            className="object-cover transition duration-300 group-hover:scale-105"
                            sizes="168px"
                            unoptimized
                          />
                        ) : (
                          <div
                            className="absolute inset-0 bg-gradient-to-br from-violet-400 via-fuchsia-500 to-amber-400"
                            aria-hidden
                          />
                        )}
                        {r.activeOffer ? (
                          <span className="absolute bottom-2 left-2 rounded bg-rose-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                            {r.activeOffer.discount}
                          </span>
                        ) : null}
                      </div>
                      <div className="p-2.5">
                        <h3 className="line-clamp-2 text-sm font-bold text-slate-900">{r.name}</h3>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {recentSearches.length > 0 ? (
            <section className="mb-6">
              <h2 className="mb-3 text-base font-bold text-slate-900">Recent Searches</h2>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term.slice(0, 50))}
                    className="group inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                  >
                    <span>{term}</span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSearch(term);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          removeSearch(term);
                        }
                      }}
                      className="rounded-full p-0.5 opacity-50 transition hover:bg-slate-300 hover:opacity-100"
                      aria-label={`Remove ${term}`}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="mb-3 text-base font-bold text-slate-900">Categories</h2>
            <div className="grid grid-cols-2 gap-3">
              {BROWSE_SECTION_OPTIONS.map((section) => {
                const meta = CATEGORY_CARD_META[section];
                return (
                  <button
                    key={section}
                    type="button"
                    onClick={() => openCategory(section)}
                    className="flex flex-col overflow-hidden rounded-[1.25rem] text-left shadow-sm ring-1 ring-black/[0.05] transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]"
                    style={{ backgroundColor: meta.pastel }}
                  >
                    <div className="relative h-28 w-full overflow-hidden sm:h-32">
                      <Image
                        src={meta.image}
                        alt=""
                        fill
                        className="object-cover object-center"
                        sizes="(max-width:768px) 50vw, 200px"
                      />
                    </div>
                    <div className="bg-white/80 px-3 py-2.5 backdrop-blur-[2px]">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {SECTION_SHORT[section]}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      <SearchFilterSheet
        open={filterOpen}
        value={filters}
        onClose={() => setFilterOpen(false)}
        onApply={setFilters}
      />
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  ChevronDown,
  Cookie,
  Croissant,
  CupSoda,
  Flame,
  MapPin,
  Navigation,
  Package,
  SlidersHorizontal,
  Sparkles,
  Utensils,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  BROWSE_FILTER_ALL_ACCENT,
  BROWSE_SECTION_ACCENTS,
  BROWSE_SECTION_OPTIONS,
  BROWSE_CHIP_LABEL_COLOR,
  browseSectionChipBackground,
  normalizeBrowseSections,
  type BrowseSection,
} from "@/lib/browse-sections";
import { useDeliveryLocation } from "@/components/delivery-location-provider";
import { distanceKm, formatDistance } from "@/lib/geo";
import { DeliveryLocationSheet } from "@/components/delivery-location-sheet";

const PAGE = {
  ink: "#111827",
  muted: "#6B7280",
  surface: "#F9FAFB",
  purple: "#5B21B6",
  purpleLight: "#EDE9FE",
} as const;

type QuickFilterKey = "all" | BrowseSection;

const FILTER_STYLES: Record<QuickFilterKey, { Icon: LucideIcon; color: string }> = {
  all: { Icon: Sparkles, color: BROWSE_FILTER_ALL_ACCENT },
  Breakfast: { Icon: Croissant, color: BROWSE_SECTION_ACCENTS.Breakfast },
  Lunch: { Icon: Utensils, color: BROWSE_SECTION_ACCENTS.Lunch },
  Dinner: { Icon: Flame, color: BROWSE_SECTION_ACCENTS.Dinner },
  "Quick Bites": { Icon: Zap, color: BROWSE_SECTION_ACCENTS["Quick Bites"] },
  Drinks: { Icon: CupSoda, color: BROWSE_SECTION_ACCENTS.Drinks },
  Desserts: { Icon: Cookie, color: BROWSE_SECTION_ACCENTS.Desserts },
  Groceries: { Icon: Package, color: BROWSE_SECTION_ACCENTS.Groceries },
};

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
  logo_url: string | null;
  banner_url: string | null;
  description: string | null;
  browse_sections?: string[] | null;
  rating: number | null;
  rating_count?: number;
  location: string | null;
  eta_label: string | null;
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
};

function primarySection(sections: string[]): BrowseSection {
  const normalized = normalizeBrowseSections(sections);
  return normalized[0] ?? "Lunch";
}

export function RestaurantDirectory({ restaurants, savedAddresses = [], isLoggedIn = false }: Props) {
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string>("all");
  const [filterOpen, setFilterOpen] = useState(false);

  const { location, openSheet, clearLocation, radiusKm } = useDeliveryLocation();

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return restaurants
      .map((r) => {
        // Collect all candidate geo-points: explicit branches + legacy single lat/lng
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
        // Only exclude if we KNOW the restaurant is outside radius (has coords but too far)
        if (location && distKm !== null && distKm > radiusKm) return false;

        const matchesQuery =
          !normalized ||
          r.name.toLowerCase().includes(normalized) ||
          r.slug.toLowerCase().includes(normalized) ||
          (r.description ?? "").toLowerCase().includes(normalized) ||
          (r.location ?? "").toLowerCase().includes(normalized) ||
          (r.branches ?? []).some((b) =>
            (b.address ?? "").toLowerCase().includes(normalized) ||
            b.name.toLowerCase().includes(normalized),
          );

        const sections = normalizeBrowseSections(r.browse_sections ?? []);
        const matchesSection = activeSection === "all" || sections.includes(activeSection as BrowseSection);
        return matchesQuery && matchesSection;
      })
      .sort((a, b) => {
        if (a.distKm !== null && b.distKm !== null) return a.distKm - b.distKm;
        if (a.distKm !== null) return -1;
        if (b.distKm !== null) return 1;
        return 0;
      });
  }, [restaurants, query, activeSection, location, radiusKm]);

  const pickSection = (id: string) => {
    setActiveSection(id);
    setFilterOpen(false);
  };

  const filterButtonLabel = activeSection === "all" ? "All" : activeSection;

  const locationLabel = location?.label ?? null;

  return (
    <>
      <DeliveryLocationSheet savedAddresses={savedAddresses} isLoggedIn={isLoggedIn} />

      {/* ── Mobile app-style header (phone only) ── */}
      <div className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Logo */}
          <Link href="/" className="shrink-0" aria-label="Zboun home">
            <Image
              src="/Logo.svg"
              alt="Zboun"
              width={80}
              height={23}
              priority
              unoptimized
              className="h-7 w-auto object-contain"
            />
          </Link>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-200 shrink-0" aria-hidden />

          {/* Location picker */}
          <button
            onClick={openSheet}
            className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
            aria-label="Change delivery location"
          >
            <MapPin className="h-4 w-4 shrink-0 text-violet-600" strokeWidth={2.5} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-0.5">
                <p className="truncate text-[14px] font-bold text-slate-900 leading-tight">
                  {locationLabel ?? "Set location"}
                </p>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" strokeWidth={2.5} />
              </div>
            </div>
          </button>

          {/* Right icons */}
          <div className="flex items-center gap-2 shrink-0">
            {location ? (
              <button
                onClick={clearLocation}
                aria-label="Clear location"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
            {isLoggedIn ? (
              <Link
                href="/account/orders"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-white shadow-sm shadow-violet-400/30 transition hover:bg-violet-700"
                aria-label="My orders"
              >
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </Link>
            ) : null}
            <Link
              href={isLoggedIn ? "/account" : "/login"}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              aria-label="Account"
            >
              <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
            </Link>
          </div>
        </div>

        {/* Search bar row */}
        <div className="flex items-center gap-2 px-4 pb-3">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search restaurants…"
              className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:bg-white transition"
            />
          </div>
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white shadow-md shadow-violet-600/25 transition hover:bg-violet-700"
            aria-label={`Category: ${filterButtonLabel}`}
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      <section className="container pb-10 pt-4 md:pt-6" style={{ color: PAGE.ink }}>
        {/* Desktop header — hidden on mobile (mobile has sticky header above) */}
        <header className="mb-6 hidden md:block md:mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="max-w-3xl text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl md:text-5xl">
                Every menu, one tap away.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed md:text-lg" style={{ color: PAGE.muted }}>
                Discover restaurants, browse clean menus, and place your order online.
              </p>
            </div>
          </div>
        </header>

        {/* ── Desktop: delivery location bar ── */}
        <div className="mb-4 hidden md:block">
          {location ? (
            <div className="flex items-center gap-2">
              <button
                onClick={openSheet}
                className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full border border-violet-200 bg-violet-50 py-2.5 pl-4 pr-5 text-left transition hover:bg-violet-100"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white shadow-sm">
                  <MapPin className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500">Delivering to</p>
                  <p className="truncate text-sm font-semibold text-slate-800">{location.label}</p>
                </div>
                <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-600">
                  {radiusKm} km
                </span>
              </button>
              <button
                onClick={clearLocation}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100"
                aria-label="Clear location"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={openSheet}
              className="flex w-full items-center gap-3 rounded-full border border-dashed border-slate-300 bg-white px-4 py-3 text-left transition hover:border-violet-300 hover:bg-violet-50/50 sm:w-auto sm:min-w-[320px]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <Navigation className="h-4 w-4" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-600">Set delivery location</p>
                <p className="text-xs text-slate-400">See restaurants near you</p>
              </div>
              <MapPin className="h-4 w-4 shrink-0 text-slate-300" />
            </button>
          )}
        </div>

        {/* ── Desktop: search + category ── */}
        <div className="mb-6 hidden md:flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <div className="relative min-w-0 flex-1">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2"
              style={{ color: PAGE.muted }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="ui-input ui-input-search h-12 w-full rounded-full border border-slate-200/90 bg-white text-base shadow-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-violet-600 px-4 text-sm font-semibold text-white shadow-md shadow-violet-600/25 transition hover:bg-violet-700 sm:min-w-[9.5rem] sm:px-5"
            aria-label={`Category: ${filterButtonLabel}. Open filters`}
          >
            <SlidersHorizontal className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            <span className="truncate">{filterButtonLabel}</span>
          </button>
        </div>


        {/* ── Filter sheet ── */}
        {filterOpen ? (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="filter-title">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              aria-label="Close filters"
              onClick={() => setFilterOpen(false)}
            />
            <div className="relative z-10 w-full max-w-lg rounded-t-[28px] bg-white/95 p-6 shadow-2xl sm:rounded-[28px] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: PAGE.purple }}>
                    Discover
                  </p>
                  <h2 id="filter-title" className="mt-1 text-2xl font-bold tracking-tight">
                    Filter restaurants
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-200/80 transition hover:bg-slate-50"
                  aria-label="Close"
                >
                  <X className="h-5 w-5 text-slate-800" />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {(() => {
                  const { Icon: AllIcon, color: allColor } = FILTER_STYLES.all;
                  const allOn = activeSection === "all";
                  return (
                    <button
                      type="button"
                      onClick={() => pickSection("all")}
                      className={`flex items-center gap-2.5 rounded-full px-3 py-3 text-left text-sm font-semibold shadow-sm ring-1 ring-black/[0.04] transition hover:brightness-[0.98] ${
                        allOn ? "text-white" : "text-slate-800"
                      }`}
                      style={{ backgroundColor: allOn ? allColor : rgbaHex(allColor, 0.12) }}
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: allOn ? "rgba(255,255,255,0.22)" : rgbaHex(allColor, 0.22),
                          color: allOn ? "#fff" : allColor,
                        }}
                      >
                        <AllIcon className="h-4 w-4" strokeWidth={2} aria-hidden />
                      </span>
                      All
                    </button>
                  );
                })()}
                {BROWSE_SECTION_OPTIONS.map((section) => {
                  const { Icon, color } = FILTER_STYLES[section];
                  const on = activeSection === section;
                  return (
                    <button
                      key={section}
                      type="button"
                      onClick={() => pickSection(section)}
                      className="flex items-center gap-2.5 rounded-full px-3 py-3 text-left text-sm font-semibold shadow-sm ring-1 ring-black/[0.04] transition hover:brightness-[0.98]"
                      style={{
                        backgroundColor: on ? color : rgbaHex(color, 0.12),
                        color: on ? "#fff" : PAGE.ink,
                      }}
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: on ? "rgba(255,255,255,0.22)" : rgbaHex(color, 0.22),
                          color: on ? "#fff" : color,
                        }}
                      >
                        <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                      </span>
                      {section}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        {/* ── Cards ── */}
        {filtered.length === 0 ? (
          <div
            className="rounded-3xl border border-dashed border-slate-200 py-16 text-center"
            style={{ backgroundColor: PAGE.surface }}
          >
            <p className="text-base font-semibold text-slate-700">No restaurants found</p>
            <p className="mt-1 text-sm text-slate-400">
              {location
                ? "Try increasing the search radius or choosing a different location."
                : "Try another search or category."}
            </p>
            {location ? (
              <button
                onClick={openSheet}
                className="mt-4 rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
              >
                Adjust radius
              </button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
            {filtered.map((restaurant) => {
              const section = primarySection(restaurant.browse_sections ?? []);
              const sectionAccent = BROWSE_SECTION_ACCENTS[section];
              const rating =
                restaurant.rating != null && Number.isFinite(Number(restaurant.rating))
                  ? Math.round(Number(restaurant.rating) * 10) / 10
                  : null;

              return (
                <Link key={restaurant.id} href={`/${restaurant.slug}`} className="group block">
                  <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06] transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                    {/* ── Banner image ── */}
                    <div className="relative h-[42vw] w-full sm:h-44 overflow-hidden bg-slate-100">
                      {restaurant.banner_url ? (
                        <Image
                          src={restaurant.banner_url}
                          alt={restaurant.name}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-[1.04]"
                          sizes="(max-width:640px) 50vw, (max-width:1280px) 33vw, 25vw"
                          unoptimized
                        />
                      ) : (
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-violet-400 via-fuchsia-500 to-amber-400"
                          aria-hidden
                        />
                      )}

                      {/* Category chip — top-left */}
                      <div
                        className="absolute left-2 top-2 z-10 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm"
                        style={{
                          backgroundColor: browseSectionChipBackground(sectionAccent),
                          color: BROWSE_CHIP_LABEL_COLOR,
                        }}
                      >
                        {section}
                      </div>

                      {/* Distance — top-right */}
                      {restaurant.distKm !== null && restaurant.distKm !== undefined ? (
                        <span className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                          <MapPin className="h-2.5 w-2.5" />
                          {formatDistance(restaurant.distKm)}
                        </span>
                      ) : null}
                    </div>

                    {/* ── White info panel ── */}
                    <div className="px-3 pb-3 pt-2.5">
                      {/* Logo + name row */}
                      <div className="flex items-center gap-2">
                        {restaurant.logo_url ? (
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
                            <Image
                              src={restaurant.logo_url}
                              alt=""
                              width={36}
                              height={36}
                              className="h-full w-full object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-violet-50 text-xs font-bold text-violet-700">
                            {restaurant.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <h3 className="min-w-0 flex-1 truncate text-sm font-bold leading-tight text-slate-900">
                          {restaurant.name}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-slate-500">
                        {restaurant.description?.trim() || "Browse the menu and order online."}
                      </p>

                      {/* Meta row */}
                      <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        {rating != null ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-500">
                            <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            {rating.toFixed(1)}
                          </span>
                        ) : null}
                        {restaurant.eta_label?.trim() ? (
                          <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-500">
                            <svg className="h-3 w-3 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                            {restaurant.eta_label.trim()}
                          </span>
                        ) : null}
                        {(restaurant.branches ?? []).length > 1 ? (
                          <span className="inline-flex items-center gap-0.5 text-[11px] text-violet-600">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {restaurant.branches!.length} branches
                          </span>
                        ) : restaurant.location?.trim() ? (
                          <span className="inline-flex min-w-0 items-center gap-0.5 truncate text-[11px] text-slate-400">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{restaurant.location.trim()}</span>
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Cookie,
  Croissant,
  CupSoda,
  Flame,
  Package,
  SlidersHorizontal,
  Sparkles,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  BROWSE_SECTION_OPTIONS,
  normalizeBrowseSections,
  type BrowseSection,
} from "@/lib/browse-sections";

const PAGE = {
  ink: "#111827",
  muted: "#6B7280",
  surface: "#F9FAFB",
  purple: "#5B21B6",
  purpleLight: "#EDE9FE",
} as const;

/** Top card badges: pastel fills so every label can use black type (same rule for all sections). */
const SECTION_BADGE_TEXT = "#111827";
const SECTION_BADGE: Record<BrowseSection, { bg: string; text: string }> = {
  Breakfast: { bg: "#FBBF24", text: SECTION_BADGE_TEXT },
  Lunch: { bg: "#BBF7D0", text: SECTION_BADGE_TEXT },
  Dinner: { bg: "#FF8C69", text: SECTION_BADGE_TEXT },
  "Quick Bites": { bg: "#DDD6FE", text: SECTION_BADGE_TEXT },
  Drinks: { bg: "#BFDBFE", text: SECTION_BADGE_TEXT },
  Desserts: { bg: "#FBCFE8", text: SECTION_BADGE_TEXT },
  Groceries: { bg: "#99F6E4", text: SECTION_BADGE_TEXT },
};

/** Filter sheet: Lucide icons + brand colors (per design spec). */
type QuickFilterKey = "all" | BrowseSection;

const FILTER_STYLES: Record<QuickFilterKey, { Icon: LucideIcon; color: string }> = {
  all: { Icon: Sparkles, color: "#5f4be8" },
  Breakfast: { Icon: Croissant, color: "#ffb238" },
  Lunch: { Icon: Utensils, color: "#22b573" },
  Dinner: { Icon: Flame, color: "#ff6b4a" },
  "Quick Bites": { Icon: Zap, color: "#7c5cff" },
  Drinks: { Icon: CupSoda, color: "#22a7f0" },
  Desserts: { Icon: Cookie, color: "#ff5c8a" },
  Groceries: { Icon: Package, color: "#17a398" },
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
};

type Props = {
  restaurants: RestaurantCard[];
};

function primarySection(sections: string[]): BrowseSection {
  const normalized = normalizeBrowseSections(sections);
  return normalized[0] ?? "Lunch";
}

export function RestaurantDirectory({ restaurants }: Props) {
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string>("all");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    if (!filterOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFilterOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filterOpen]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return restaurants.filter((r) => {
      const matchesQuery =
        !normalized ||
        r.name.toLowerCase().includes(normalized) ||
        r.slug.toLowerCase().includes(normalized) ||
        (r.description ?? "").toLowerCase().includes(normalized) ||
        (r.location ?? "").toLowerCase().includes(normalized);
      const sections = normalizeBrowseSections(r.browse_sections ?? []);
      const matchesSection = activeSection === "all" || sections.includes(activeSection as BrowseSection);
      return matchesQuery && matchesSection;
    });
  }, [restaurants, query, activeSection]);

  const pickSection = (id: string) => {
    setActiveSection(id);
    setFilterOpen(false);
  };

  const filterButtonLabel = activeSection === "all" ? "All" : activeSection;

  return (
    <section className="container pb-10 pt-4 md:pt-6" style={{ color: PAGE.ink }}>
      <header className="mb-8 md:mb-10">
        <h1 className="max-w-3xl text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl md:text-5xl">
          Every menu, one tap away.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed md:text-lg" style={{ color: PAGE.muted }}>
          Discover restaurants, browse clean menus, and send your order straight to WhatsApp.
        </p>
      </header>

      {/* Search + category (opens filter sheet) */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
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

      <p className="mb-4 text-sm" style={{ color: PAGE.muted }}>
        <span className="font-semibold" style={{ color: PAGE.ink }}>
          {filtered.length}
        </span>{" "}
        {filtered.length === 1 ? "place" : "places"}
        {query ? ` for “${query.trim()}”` : ""}
      </p>

      {/* Filter sheet */}
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
                <svg className="h-5 w-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
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
                    style={{
                      backgroundColor: allOn ? allColor : rgbaHex(allColor, 0.12),
                    }}
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

      {/* Cards */}
      {filtered.length === 0 ? (
        <div
          className="rounded-3xl border border-dashed border-slate-200 py-16 text-center"
          style={{ backgroundColor: `${PAGE.surface}` }}
        >
          <p className="text-base font-semibold text-slate-700">No restaurants found</p>
          <p className="mt-1 text-sm text-slate-400">Try another search or category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {filtered.map((restaurant) => {
            const section = primarySection(restaurant.browse_sections ?? []);
            const badge = SECTION_BADGE[section];
            const rating =
              restaurant.rating != null && Number.isFinite(Number(restaurant.rating))
                ? Math.round(Number(restaurant.rating) * 10) / 10
                : null;

            return (
              <Link key={restaurant.id} href={`/${restaurant.slug}`} className="group block">
                <article className="relative h-[min(92vw,400px)] overflow-hidden rounded-[1.75rem] shadow-md ring-1 ring-black/[0.06] transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:h-[380px]">
                  {restaurant.banner_url ? (
                    <Image
                      src={restaurant.banner_url}
                      alt=""
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 25vw"
                      unoptimized
                    />
                  ) : (
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-violet-400 via-fuchsia-500 to-amber-400"
                      aria-hidden
                    />
                  )}
                  {/* Dark wash so white type reads from mid-card through footer (mock) */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/45 to-black/80" />

                  <div
                    className="absolute left-3 top-3 z-10 inline-flex min-h-[1.75rem] items-center justify-center rounded-full px-3 py-1.5 text-[11px] font-bold uppercase leading-none tracking-wide shadow-sm"
                    style={{ backgroundColor: badge.bg, color: badge.text }}
                  >
                    {section}
                  </div>

                  {/* Left stack: squircle logo → name → description → pills (lower half, mock) */}
                  <div className="absolute inset-x-0 bottom-0 top-[30%] z-10 flex flex-col justify-end px-4 pb-6">
                    {restaurant.logo_url ? (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border-2 border-white bg-white shadow-lg">
                        <Image
                          src={restaurant.logo_url}
                          alt=""
                          width={56}
                          height={56}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-white bg-white/95 text-base font-bold text-[#272F54] shadow-lg">
                        {restaurant.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <h3 className="mt-3 text-left text-xl font-bold leading-tight tracking-tight text-white drop-shadow-sm">
                      {restaurant.name}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-left text-sm font-normal leading-snug text-white/95">
                      {restaurant.description?.trim() || "Open the menu to browse dishes and order on WhatsApp."}
                    </p>
                    <div className="mt-3 flex flex-wrap justify-start gap-2">
                      {rating != null ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white">
                          <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                          {rating.toFixed(1)}
                        </span>
                      ) : null}
                      {restaurant.eta_label?.trim() ? (
                        <span className="rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white">
                          {restaurant.eta_label.trim()}
                        </span>
                      ) : null}
                      {restaurant.location?.trim() ? (
                        <span className="max-w-[160px] truncate rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white sm:max-w-[200px]">
                          {restaurant.location.trim()}
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
  );
}

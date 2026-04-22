"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BROWSE_SECTION_OPTIONS, normalizeBrowseSections } from "@/lib/browse-sections";

type RestaurantCard = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  browse_sections?: string[] | null;
};

type Props = {
  restaurants: RestaurantCard[];
  eyebrow?: string;
  title?: string;
  subtitle?: string;
};

export function RestaurantDirectory({
  restaurants,
  eyebrow = "Order here",
  title = "Restaurants on Zboun",
  subtitle = "Search by name, then open a menu and order on WhatsApp.",
}: Props) {
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string>("all");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return restaurants.filter((r) => {
      const matchesQuery =
        !normalized ||
        r.name.toLowerCase().includes(normalized) ||
        r.slug.toLowerCase().includes(normalized);
      const sections = normalizeBrowseSections(r.browse_sections ?? []);
      const matchesSection = activeSection === "all" || sections.includes(activeSection as never);
      return matchesQuery && matchesSection;
    });
  }, [restaurants, query, activeSection]);

  return (
    <section className="container py-4 md:py-6">
      {eyebrow || title || subtitle ? (
        <div className="mb-4">
          <div>
            {eyebrow ? (
              <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600/90">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {title}
              </h2>
            ) : null}
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
        </div>
      ) : null}

      <div className="mb-5 rounded-3xl border border-slate-200/80 bg-white/95 p-3.5 shadow-sm">
        {/* Search */}
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
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
            placeholder="Search restaurants..."
            className="ui-input ui-input-search h-12 rounded-2xl text-base"
          />
        </div>
        <div className="mt-3.5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveSection("all")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeSection === "all"
                ? "bg-violet-600 text-white"
                : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
            }`}
          >
            All
          </button>
          {BROWSE_SECTION_OPTIONS.map((section) => (
            <button
              key={section}
              type="button"
              onClick={() => setActiveSection(section)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeSection === section
                  ? "bg-violet-600 text-white"
                  : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
              }`}
            >
              {section}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="mb-4 text-sm text-slate-500">
        <span className="font-semibold text-slate-800">{filtered.length}</span>{" "}
        {filtered.length === 1 ? "restaurant" : "restaurants"}
        {query ? ` for "${query}"` : ""}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-16 text-center">
          <p className="text-base font-semibold text-slate-700">No restaurants found</p>
          <p className="mt-1 text-sm text-slate-400">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((restaurant) => (
            <article
              key={restaurant.id}
              className="group flex flex-col rounded-3xl border border-slate-200/85 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_10px_28px_rgba(120,84,255,0.12)]"
            >
              {/* Logo + Name */}
              <div className="flex items-center gap-4">
                {restaurant.logo_url ? (
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <Image
                      src={restaurant.logo_url}
                      alt={`${restaurant.name} logo`}
                      width={56}
                      height={56}
                      className="h-full w-full object-contain p-1"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-base font-bold text-violet-700 shadow-sm">
                    {restaurant.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-violet-800">
                    {restaurant.name}
                  </h3>
                  <p className="truncate text-xs text-slate-400">/{restaurant.slug}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {normalizeBrowseSections(restaurant.browse_sections ?? []).slice(0, 2).map((section) => (
                      <span key={`${restaurant.id}-${section}`} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                        {section}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-5">
                <Link
                  href={`/${restaurant.slug}`}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-sm font-semibold text-white shadow-sm shadow-violet-400/20 transition hover:shadow-violet-400/40"
                >
                  Order now
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

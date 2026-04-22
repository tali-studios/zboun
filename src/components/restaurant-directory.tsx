"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type RestaurantCard = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
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

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return restaurants;
    return restaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(normalized) ||
        r.slug.toLowerCase().includes(normalized),
    );
  }, [restaurants, query]);

  return (
    <section className="container py-4 md:py-6">
      {/* Section header */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">
            {eyebrow}
          </p>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>

        {/* Search */}
        <div className="w-full sm:max-w-xs">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
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
              placeholder="Search restaurants…"
              className="ui-input ui-input-search"
            />
          </div>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((restaurant) => (
            <article
              key={restaurant.id}
              className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_8px_30px_rgba(120,84,255,0.12)]"
            >
              {/* Logo + Name */}
              <div className="flex items-center gap-4">
                {restaurant.logo_url ? (
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-white">
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
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-base font-bold text-violet-700">
                    {restaurant.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-violet-800">
                    {restaurant.name}
                  </h3>
                  <p className="truncate text-xs text-slate-400">zboun.com/{restaurant.slug}</p>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-5">
                <Link
                  href={`/${restaurant.slug}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-sm font-semibold text-white shadow-sm shadow-violet-400/20 transition hover:shadow-violet-400/40"
                >
                  Open menu
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

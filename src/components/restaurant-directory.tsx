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
};

export function RestaurantDirectory({ restaurants }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return restaurants;
    return restaurants.filter(
      (restaurant) =>
        restaurant.name.toLowerCase().includes(normalized) ||
        restaurant.slug.toLowerCase().includes(normalized),
    );
  }, [restaurants, query]);

  return (
    <section className="container py-8 md:py-12">
      <div className="panel rounded-3xl p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Discover Restaurants
            </p>
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Browse active stores on Zboun
            </h2>
            <p className="text-sm text-slate-600">
              Pick a restaurant, explore its menu, and order directly on WhatsApp.
            </p>
          </div>

          <label className="w-full max-w-sm">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Search restaurants
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or URL"
              className="ui-input"
            />
          </label>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold">{filtered.length}</span> restaurant(s)
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((restaurant) => (
            <article
              key={restaurant.id}
              className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                {restaurant.logo_url ? (
                  <Image
                    src={restaurant.logo_url}
                    alt={`${restaurant.name} logo`}
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-xl border border-slate-200 object-contain p-1"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
                    {restaurant.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="truncate text-base font-bold text-slate-900">{restaurant.name}</h3>
                  <p className="truncate text-xs text-slate-500">/{restaurant.slug}</p>
                </div>
              </div>

              <div className="mt-4">
                <Link
                  href={`/${restaurant.slug}`}
                  className="btn btn-primary w-full rounded-xl text-center"
                >
                  View menu
                </Link>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="font-semibold text-slate-800">No restaurants found</p>
            <p className="mt-1 text-sm text-slate-500">Try a different name or URL keyword.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

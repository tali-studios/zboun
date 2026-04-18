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
      (restaurant) =>
        restaurant.name.toLowerCase().includes(normalized) ||
        restaurant.slug.toLowerCase().includes(normalized),
    );
  }, [restaurants, query]);

  return (
    <section className="container py-6 md:py-10">
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.18)]">
        <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 via-white to-slate-50/80 px-5 py-5 md:px-8 md:py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
                {eyebrow}
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h2>
              <p className="max-w-xl text-sm text-slate-600">{subtitle}</p>
            </div>
            <label className="w-full md:max-w-sm">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Search
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Restaurant name…"
                className="ui-input shadow-sm"
              />
            </label>
          </div>
        </div>
        <div className="px-5 py-4 md:px-8 md:py-5">

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "restaurant" : "restaurants"}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center">
              <p className="font-semibold text-slate-800">No matches</p>
              <p className="mt-1 text-sm text-slate-500">Try another search term.</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((restaurant) => (
                <article
                  key={restaurant.id}
                  className="group rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:border-emerald-200/80 hover:shadow-md"
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
          )}
        </div>
      </div>
    </section>
  );
}

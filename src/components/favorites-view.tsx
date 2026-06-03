"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { formatDistance, distanceKm } from "@/lib/geo";
import { useDeliveryLocation } from "@/components/delivery-location-provider";

type RestaurantCard = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
  description: string | null;
  rating: number | null;
  location: string | null;
  eta_label: string | null;
  latitude: number | null;
  longitude: number | null;
};

type Props = { restaurants: RestaurantCard[] };

export function FavoritesView({ restaurants }: Props) {
  const { favorites, toggle } = useFavorites();
  const { location } = useDeliveryLocation();

  const favorited = restaurants.filter((r) => favorites.has(r.slug));

  if (favorited.length === 0) {
    return (
      <div className="mt-20 flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <Heart className="h-8 w-8 text-red-300" />
        </div>
        <p className="text-base font-semibold text-slate-800">No favorites yet</p>
        <p className="text-sm text-slate-500">
          Tap the ♥ on any restaurant to save it here.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
        >
          Browse restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
      {favorited.map((r) => {
        const rating =
          r.rating != null && Number.isFinite(Number(r.rating))
            ? Math.round(Number(r.rating) * 10) / 10
            : null;

        let distKm: number | null = null;
        if (location && r.latitude != null && r.longitude != null) {
          distKm = distanceKm({ lat: location.lat, lng: location.lng }, { lat: r.latitude, lng: r.longitude });
        }

        return (
          <Link key={r.id} href={`/${r.slug}`} className="group block">
            <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/[0.06] transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              {/* Banner */}
              <div className="relative h-[42vw] w-full overflow-hidden bg-slate-100 sm:h-44">
                {r.banner_url ? (
                  <Image
                    src={r.banner_url}
                    alt={r.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.04]"
                    sizes="(max-width:640px) 50vw, (max-width:1280px) 33vw, 25vw"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-400 via-fuchsia-500 to-amber-400" aria-hidden />
                )}
                {distKm !== null ? (
                  <span className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                    <MapPin className="h-2.5 w-2.5" />
                    {formatDistance(distKm)}
                  </span>
                ) : null}
                {/* Heart button */}
                <button
                  type="button"
                  aria-label="Remove from favorites"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(r.slug); }}
                  className="absolute bottom-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm transition hover:bg-white"
                >
                  <svg
                    className="h-4 w-4 fill-amber-500 text-amber-500"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>

              {/* Info panel */}
              <div className="px-3 pb-3 pt-2.5">
                <div className="flex items-center gap-2">
                  {r.logo_url ? (
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
                      <Image src={r.logo_url} alt="" width={36} height={36} className="h-full w-full object-cover" unoptimized />
                    </div>
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-violet-50 text-xs font-bold text-violet-700">
                      {r.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <h3 className="min-w-0 flex-1 truncate text-sm font-bold leading-tight text-slate-900">{r.name}</h3>
                  {rating != null ? (
                    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 ring-1 ring-amber-200/60">
                      <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {rating.toFixed(1)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-slate-500">
                  {r.description?.trim() || "Browse the menu and order online."}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  {r.eta_label?.trim() ? (
                    <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-500">
                      <svg className="h-3 w-3 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      {r.eta_label.trim()}
                    </span>
                  ) : null}
                  {r.location?.trim() ? (
                    <span className="inline-flex min-w-0 items-center gap-0.5 truncate text-[11px] text-slate-400">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{r.location.trim()}</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}

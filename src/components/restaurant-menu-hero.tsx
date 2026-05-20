import Image from "next/image";
import Link from "next/link";
import { BRAND_HEX, BRAND_HEX_ACCENT, BRAND_HEX_DEEP } from "@/lib/brand";

const BRAND = BRAND_HEX;
const HERO_CATEGORY_COLOR = "#c4b5fd";

type RestaurantHeroData = {
  name: string;
  slug: string;
  description: string | null;
  banner_url: string | null;
  logo_url: string | null;
  eta_label: string | null;
  location: string | null;
  user_avg_rating: number | null;
  user_rating_count: number | null;
};

type Props = {
  restaurant: RestaurantHeroData;
  heroEyebrow: string;
  tagline: string;
  /** Shown under tagline on in-store menu pages */
  modeBadge?: string;
};

export function RestaurantMenuHero({ restaurant, heroEyebrow, tagline, modeBadge }: Props) {
  const avgRating =
    restaurant.user_avg_rating != null && Number.isFinite(Number(restaurant.user_avg_rating))
      ? Math.round(Number(restaurant.user_avg_rating) * 10) / 10
      : null;
  const ratingCount = restaurant.user_rating_count ?? 0;

  const heroPills = (
    <div className="meta-row mt-3">
      {avgRating != null ? (
        <span>
          <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {avgRating.toFixed(1)}
          {ratingCount > 0 ? ` (${ratingCount})` : ""}
        </span>
      ) : null}
      {restaurant.eta_label?.trim() ? <span>{restaurant.eta_label.trim()}</span> : null}
      {restaurant.location?.trim() ? (
        <span className="max-w-full min-w-0 truncate">{restaurant.location.trim()}</span>
      ) : null}
    </div>
  );

  return (
    <header className="relative z-0 w-full">
      <div
        className="relative h-[min(48vh,360px)] w-full sm:h-[min(44vh,440px)] lg:h-[min(46vh,480px)]"
        style={{
          background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_HEX_ACCENT} 48%, ${BRAND_HEX_DEEP} 100%)`,
        }}
      >
        {restaurant.banner_url ? (
          <>
            <Image
              src={restaurant.banner_url}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority
              unoptimized
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/75 sm:from-black/35 sm:via-black/25 sm:to-black/70" />
          </>
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#7854ff] via-[#9f3bfe] to-[#5b21b6]"
            aria-hidden
          />
        )}

        <Link
          href="/"
          className="absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/5 transition hover:bg-slate-50 sm:left-5 sm:top-5"
          aria-label="Back to restaurants"
        >
          <svg className="h-5 w-5 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className="absolute inset-0 z-20 flex flex-col justify-end">
          <div className="container flex items-end gap-3 pb-6 pt-20 sm:gap-5 sm:pb-8 sm:pt-24 lg:pb-10 lg:pt-28">
            {restaurant.logo_url ? (
              <div className="relative z-30 h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-[3px] border-white bg-white shadow-lg sm:h-[4.75rem] sm:w-[4.75rem] lg:h-20 lg:w-20">
                <Image
                  src={restaurant.logo_url}
                  alt={`${restaurant.name} logo`}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
            ) : null}
            <div className="min-w-0 flex-1 pb-0.5 text-left text-white">
              <p
                className="text-[11px] font-bold uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.2em]"
                style={{ color: HERO_CATEGORY_COLOR }}
              >
                {heroEyebrow}
              </p>
              <h1 className="mt-1.5 text-[1.65rem] font-bold leading-[1.1] tracking-tight text-white sm:mt-2 sm:text-4xl lg:text-5xl">
                {restaurant.name}
              </h1>
              <p className="mt-2 max-w-2xl text-[15px] font-normal leading-relaxed text-white/95 sm:text-lg lg:text-[1.05rem]">
                {tagline}
              </p>
              {modeBadge ? (
                <p className="mt-2 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/25">
                  {modeBadge}
                </p>
              ) : null}
              {heroPills}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

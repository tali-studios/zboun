import Image from "next/image";
import Link from "next/link";
import type { MenuTheme } from "@/lib/menu-theme";
import { resolveMenuTheme } from "@/lib/menu-theme";

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
  tagline: string;
  menuThemeColor?: string | null;
  /** Shown under tagline on in-store menu pages */
  modeBadge?: string;
  /** When true the parent already handles container/padding; apply rounded corners */
  desktop?: boolean;
};

export function RestaurantMenuHero({ restaurant, tagline, menuThemeColor, modeBadge, desktop }: Props) {
  const theme: MenuTheme = resolveMenuTheme(menuThemeColor);
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
          className={`relative h-[46vw] w-full overflow-hidden sm:h-64 md:h-72 lg:h-80 ${desktop ? "rounded-2xl" : ""}`}
          style={{
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 48%, ${theme.deep} 100%)`,
          }}
        >
          {restaurant.banner_url ? (
            <>
              <Image
                src={restaurant.banner_url}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, (max-width:1280px) 90vw, 1200px"
                priority
                unoptimized
              />
              {/* Strong gradient so text is always legible over any banner */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/75" />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom right, ${theme.primary}, ${theme.accent}, ${theme.deep})`,
              }}
              aria-hidden
            />
          )}

          <div className="absolute inset-0 z-20 flex flex-col justify-end">
            <div className="flex items-end gap-3 px-4 pb-5 pt-16 sm:gap-5 sm:px-6 sm:pb-6 sm:pt-20 lg:pb-7">
              {restaurant.logo_url ? (
                <div className="relative z-30 h-14 w-14 shrink-0 overflow-hidden rounded-2xl border-[3px] border-white bg-white shadow-lg sm:h-16 sm:w-16 lg:h-[4.5rem] lg:w-[4.5rem]">
                  <Image
                    src={restaurant.logo_url}
                    alt={`${restaurant.name} logo`}
                    width={72}
                    height={72}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                </div>
              ) : null}
              <div className="min-w-0 flex-1 pb-0.5 text-left text-white drop-shadow-sm">
                <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                  {restaurant.name}
                </h1>
                <p className="mt-1 max-w-2xl text-sm font-normal leading-relaxed text-white/90 sm:text-[15px]">
                  {tagline}
                </p>
                {modeBadge ? (
                  <p className="mt-1.5 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/25">
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

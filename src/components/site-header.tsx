import Image from "next/image";
import Link from "next/link";

type SiteHeaderProps = {
  largeLogo?: boolean;
  showDashboardButton?: boolean;
  showForRestaurantsLink?: boolean;
};

export function SiteHeader({
  largeLogo = false,
  showDashboardButton = true,
  showForRestaurantsLink = false,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-violet-100/80 bg-white/80 backdrop-blur-2xl">
      <div className="container flex items-center justify-between gap-4 py-3 md:py-3.5">

        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center outline-none transition-opacity hover:opacity-85 focus-visible:opacity-85"
        >
          <Image
            src="/Logo.svg"
            alt="Zboun"
            width={largeLogo ? 200 : 160}
            height={largeLogo ? 56 : 44}
            priority
            unoptimized
            className={`w-auto object-contain ${largeLogo ? "h-9 sm:h-10 md:h-11" : "h-8 sm:h-9"}`}
          />
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1 sm:gap-1.5" aria-label="Main">
          {showForRestaurantsLink ? (
            <Link
              href="/for-restaurants"
              className="rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 focus-visible:outline-2 focus-visible:outline-violet-600"
            >
              For restaurants
            </Link>
          ) : null}

          <Link
            href="/contact"
            className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-violet-600"
          >
            Contact
          </Link>

          {showDashboardButton ? (
            <Link
              href="/dashboard/login"
              className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-400/30 transition hover:shadow-violet-400/50 hover:brightness-105 sm:px-5 focus-visible:outline-2 focus-visible:outline-violet-700"
            >
              Dashboard
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

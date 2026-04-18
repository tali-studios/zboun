import Image from "next/image";
import Link from "next/link";

type SiteHeaderProps = {
  /** Larger logo + header height (e.g. home page hero) */
  largeLogo?: boolean;
  showDashboardButton?: boolean;
  /** Link to marketing / pricing for restaurant owners */
  showForRestaurantsLink?: boolean;
};

const navLinkClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";

const navLinkPrimaryClass =
  "rounded-lg px-3 py-2 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600";

export function SiteHeader({
  largeLogo = false,
  showDashboardButton = true,
  showForRestaurantsLink = false,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/85 shadow-[0_1px_0_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] backdrop-blur-xl">
      <div
        aria-hidden
        className="pointer-events-none h-px w-full bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"
      />
      <div
        className={`container flex items-center justify-between gap-3 ${
          largeLogo ? "min-h-[3.75rem] py-2 md:min-h-[4.5rem] md:py-2.5" : "min-h-14 py-1.5 md:min-h-16"
        }`}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-lg outline-offset-4 transition-opacity hover:opacity-90"
        >
          <Image
            src="/zboun_logo.svg"
            alt="Zboun"
            width={largeLogo ? 205 : 168}
            height={largeLogo ? 58 : 48}
            priority
            unoptimized
            className={`w-auto object-contain ${largeLogo ? "h-10 sm:h-11 md:h-12" : "h-9 sm:h-10"}`}
          />
        </Link>
        <nav
          className="flex max-w-[calc(100%-8rem)] flex-wrap items-center justify-end gap-x-1 gap-y-1 sm:gap-x-2"
          aria-label="Main"
        >
          {showForRestaurantsLink ? (
            <Link href="/for-restaurants" className={navLinkPrimaryClass}>
              For restaurants
            </Link>
          ) : null}
          <Link href="/contact" className={navLinkClass}>
            Contact
          </Link>
          {showDashboardButton ? (
            <Link
              href="/dashboard/login"
              className="ml-0.5 rounded-full bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:px-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              Dashboard
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

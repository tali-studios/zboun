import Image from "next/image";
import Link from "next/link";

type SiteHeaderProps = {
  /** Larger logo + header height (e.g. home page hero) */
  largeLogo?: boolean;
  showDashboardButton?: boolean;
  /** Link to marketing / pricing for restaurant owners */
  showForRestaurantsLink?: boolean;
};

export function SiteHeader({
  largeLogo = false,
  showDashboardButton = true,
  showForRestaurantsLink = false,
}: SiteHeaderProps) {
  return (
    <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div
        className={`container flex items-center justify-between gap-3 ${
          largeLogo ? "h-16 md:h-20" : "h-14"
        }`}
      >
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
          <Image
            src="/zboun_logo.svg"
            alt="Zboun"
            width={largeLogo ? 205 : 160}
            height={largeLogo ? 58 : 45}
            priority
            unoptimized
            className="max-h-14 w-auto object-contain"
          />
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-2 text-sm font-medium text-slate-700 sm:gap-3 md:gap-5">
          {showForRestaurantsLink ? (
            <Link href="/for-restaurants" className="hover:text-slate-900">
              For restaurants
            </Link>
          ) : null}
          <Link href="/contact" className="hover:text-slate-900">
            Contact
          </Link>
          {showDashboardButton ? (
            <Link
              href="/dashboard/login"
              className="rounded-full bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
            >
              Dashboard
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

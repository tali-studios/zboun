import Image from "next/image";
import Link from "next/link";
import { SHOW_NUTRITION_AI } from "@/lib/nutrition-analysis";

type Props = {
  /** Breadcrumb label shown after the logo, e.g. "Account Settings" or "My Orders" */
  title: string;
  /** Optional back href — if provided shows a back chevron before the title */
  backHref?: string;
};

export function CustomerDesktopNav({ title, backHref }: Props) {
  return (
    <header className="sticky top-0 z-30 hidden border-b border-slate-100 bg-white/95 backdrop-blur-md shadow-sm md:block">
      <div className="container flex h-16 items-center justify-between gap-6">
        {/* Left: logo + breadcrumb */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="shrink-0 outline-none transition-opacity hover:opacity-85 focus-visible:opacity-85"
            aria-label="Zboun home"
          >
            <Image
              src="/Logo.svg?v=3"
              alt="Zboun"
              width={120}
              height={34}
              className="h-9 w-auto object-contain"
              unoptimized
            />
          </Link>
          <span className="text-slate-300" aria-hidden>/</span>
          {backHref ? (
            <Link
              href={backHref}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              {title}
            </Link>
          ) : (
            <p className="text-sm font-semibold text-slate-600">{title}</p>
          )}
        </div>

        {/* Right: quick nav */}
        <div className="flex items-center gap-2">
          {SHOW_NUTRITION_AI ? (
            <Link
              href="/nutrition"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <svg
                className="h-4 w-4 text-emerald-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              Nutrition
            </Link>
          ) : null}
          <Link
            href="/favorites"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <svg
              className="h-4 w-4 text-amber-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            Favorites
          </Link>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
          >
            <svg className="h-4 w-4 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h4" />
            </svg>
            Orders
          </Link>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-400/30 transition hover:bg-violet-700"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            Account
          </Link>
        </div>
      </div>
    </header>
  );
}

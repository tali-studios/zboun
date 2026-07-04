import Image from "next/image";
import Link from "next/link";

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
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
          >
            <svg className="h-4 w-4 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            My Orders
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

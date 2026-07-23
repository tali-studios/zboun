import Image from "next/image";
import Link from "next/link";

type Props = {
  /** Centered page title, e.g. "Search", "Favorites", "Account" */
  title: string;
  /** Optional back link shown as a chevron next to the logo */
  backHref?: string;
};

/** Mobile sticky header: Zboun logo left + page title centered. Hidden on md+. */
export function CustomerMobileTopBar({ title, backHref }: Props) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-slate-200/60 bg-white/95 px-4 backdrop-blur md:hidden">
      <Link href="/" className="relative z-10 shrink-0" aria-label="Zboun home">
        <Image
          src="/Logo.svg?v=3"
          alt="Zboun"
          width={110}
          height={32}
          priority
          unoptimized
          className="h-8 w-auto object-contain"
        />
      </Link>
      {backHref ? (
        <Link
          href={backHref}
          className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-slate-100"
          aria-label="Go back"
        >
          <svg
            className="h-5 w-5 text-slate-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </Link>
      ) : null}
      <p className="pointer-events-none absolute inset-x-0 text-center text-[15px] font-semibold text-slate-900">
        {title}
      </p>
    </header>
  );
}

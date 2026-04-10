import Image from "next/image";
import Link from "next/link";

type SiteHeaderProps = {
  /** Larger logo + header height (e.g. home page hero) */
  largeLogo?: boolean;
};

export function SiteHeader({ largeLogo = false }: SiteHeaderProps) {
  return (
    <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div
        className={`container flex items-center justify-between ${
          largeLogo ? "min-h-[5.5rem] py-3 md:min-h-[6.5rem] md:py-4" : "h-16"
        }`}
      >
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
          <Image
            src="/zboun_logo.png"
            alt="Zboun"
            width={largeLogo ? 320 : 160}
            height={largeLogo ? 96 : 48}
            priority
            className={
              largeLogo
                ? "h-16 w-auto object-contain sm:h-20 md:h-24"
                : "h-10 w-auto object-contain"
            }
          />
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-slate-700">
          <Link href="/contact" className="hover:text-slate-900">
            Contact
          </Link>
          <Link
            href="/dashboard/login"
            className="rounded-full bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}

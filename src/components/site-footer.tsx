import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  const linkClass =
    "inline-flex py-1 text-[15px] font-medium text-slate-600 transition-colors hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-sm";

  return (
    <footer className="relative mt-16 border-t border-violet-100 bg-gradient-to-b from-[#faf9ff] to-white md:mt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/70 to-transparent"
      />

      <div className="container py-10 sm:py-12 md:py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          {/* Brand — logo scales to same width as tagline */}
          <div className="w-full max-w-md shrink-0">
            <Link
              href="/"
              className="block w-full outline-none transition-opacity hover:opacity-90 focus-visible:opacity-90 focus-visible:ring-2 focus-visible:ring-violet-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf9ff] rounded-md"
              aria-label="Zboun home"
            >
              <Image
                src="/Logo.svg"
                alt="Zboun"
                width={640}
                height={180}
                className="h-auto w-full object-contain object-left"
                sizes="(max-width: 448px) 100vw, 448px"
                unoptimized
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
              Digital menus and WhatsApp ordering — simple for guests, easy for your team.
            </p>
          </div>

          {/* Nav groups */}
          <div className="grid grid-cols-2 gap-8 sm:gap-10 md:grid-cols-2 md:gap-14 lg:flex lg:shrink-0 lg:gap-16 xl:gap-20">
            <nav aria-label="Explore">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-violet-600/90">
                Explore
              </p>
              <ul className="flex flex-col gap-1 sm:gap-0.5">
                <li>
                  <Link href="/" className={linkClass}>
                    Browse
                  </Link>
                </li>
                <li>
                  <Link href="/for-restaurants" className={linkClass}>
                    Join us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className={linkClass}>
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
            <nav aria-label="For restaurants">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-violet-600/90">
                Restaurants
              </p>
              <ul className="flex flex-col gap-1 sm:gap-0.5">
                <li>
                  <Link href="/for-restaurants" className={linkClass}>
                    Plans &amp; pricing
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/login" className={linkClass}>
                    Restaurant login
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* CTA */}
          <div className="w-full lg:max-w-[220px] lg:shrink-0">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-violet-600/90 lg:text-left">
              Get help
            </p>
            <a
              href="https://wa.me/96171212734"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition hover:brightness-105 active:scale-[0.99] sm:py-4"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.124 1.532 5.859L.054 23.285a.75.75 0 00.916.916l5.437-1.478A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.67-.5-5.21-1.374l-.374-.213-3.867 1.051 1.052-3.843-.226-.386A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              WhatsApp us
            </a>
            <p className="mt-2.5 text-center text-xs leading-relaxed text-slate-500 lg:text-left">
              Quick support &amp; onboarding
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 border-t border-slate-200/80 pt-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs text-slate-500">© {year} Zboun. All rights reserved.</p>
          <p className="text-xs text-slate-400">Menus · QR codes · WhatsApp ordering</p>
        </div>
      </div>
    </footer>
  );
}

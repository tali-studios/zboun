import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-slate-100 bg-slate-950">
      {/* Purple accent line */}
      <div
        aria-hidden
        className="h-[2px] w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600/40"
      />

      <div className="container py-12 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-12 md:gap-8">

          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-5">
            <Link
              href="/"
              className="inline-flex rounded-2xl bg-white/90 p-2.5 ring-1 ring-white/20 transition hover:bg-white"
            >
              <Image
                src="/Logo.svg"
                alt="Zboun"
                width={108}
                height={32}
                className="h-7 w-auto object-contain"
                unoptimized
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Digital menus and WhatsApp ordering for restaurants — simple for guests, easy for your team.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 md:col-span-4 md:col-start-7">
            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-600">
                Explore
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/" className="text-slate-400 transition hover:text-violet-300">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-slate-400 transition hover:text-violet-300">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-600">
                Restaurants
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/for-restaurants" className="text-slate-400 transition hover:text-violet-300">
                    Plans &amp; pricing
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/login" className="text-slate-400 transition hover:text-violet-300">
                    Restaurant login
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <div className="sm:col-span-2 md:col-span-3 md:col-start-11 md:flex md:flex-col md:justify-center">
            <a
              href="https://wa.me/96171212734"
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:brightness-110"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.124 1.532 5.859L.054 23.285a.75.75 0 00.916.916l5.437-1.478A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.67-.5-5.21-1.374l-.374-.213-3.867 1.051 1.052-3.843-.226-.386A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              WhatsApp us
            </a>
            <p className="mt-2.5 text-center text-xs text-slate-600">
              Quick support &amp; onboarding
            </p>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-12 flex flex-col items-center gap-2 border-t border-slate-800 pt-8 text-xs text-slate-600 sm:flex-row sm:justify-between">
          <p>© {year} Zboun. All rights reserved.</p>
          <p>Menus · QR codes · WhatsApp ordering</p>
        </div>
      </div>
    </footer>
  );
}

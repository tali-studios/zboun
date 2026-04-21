import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-emerald-500/25 bg-slate-900 text-slate-300 md:mt-20">
      <div
        aria-hidden
        className="h-0.5 w-full bg-gradient-to-r from-emerald-600/80 via-emerald-400/60 to-teal-500/50"
      />
      <div className="container py-10 md:py-14">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8 lg:gap-12">
          <div className="md:col-span-5 lg:col-span-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-xl bg-white/95 p-2.5 shadow-sm ring-1 ring-white/10 outline-offset-4 transition hover:bg-white"
            >
              <Image
                src="/zboun_logo.svg"
                alt="Zboun"
                width={120}
                height={36}
                className="h-8 w-auto object-contain"
                unoptimized
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Digital menus and clear WhatsApp orders for restaurants — simple for guests, easy for
              your team.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:col-span-4 md:col-start-6 lg:col-span-3 lg:col-start-6">
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Explore
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link href="/" className="text-slate-300 transition hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-slate-300 transition hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Restaurants
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link href="/for-restaurants" className="text-slate-300 transition hover:text-white">
                    Plans &amp; pricing
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/login" className="text-slate-300 transition hover:text-white">
                    Restaurant login
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col justify-end md:col-span-3 md:col-start-10 lg:col-span-4 lg:col-start-9">
            <a
              href="https://wa.me/96171212734"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-500 sm:w-auto md:justify-center"
            >
              Message us on WhatsApp
            </a>
            <p className="mt-3 text-center text-xs text-slate-500 md:text-left">
              Quick replies for onboarding and support.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-slate-800/80 pt-8 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {year} Zboun. All rights reserved.</p>
          <p className="md:text-right">Menus · QR · WhatsApp ordering</p>
        </div>
      </div>
    </footer>
  );
}

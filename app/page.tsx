import Link from "next/link";
import { getHomeRestaurants } from "@/lib/data";
import { RestaurantDirectory } from "@/components/restaurant-directory";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default async function HomePage() {
  const restaurants = await getHomeRestaurants();

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f8ff]">
      <SiteHeader largeLogo />

      <main className="flex-1">
        <section className="container pt-6 sm:pt-8">
          <div className="rounded-3xl border border-violet-100/70 bg-white/70 px-4 py-5 shadow-[0_10px_30px_rgba(120,84,255,0.08)] backdrop-blur-sm sm:px-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Discover Restaurants
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 sm:text-base">
              Find your favorite place quickly, browse by category, and order in one tap.
            </p>
          </div>
        </section>

        {/* ── Restaurant directory ─────────────────────────────────────────── */}
        <section id="restaurants" className="pt-4 pb-4 sm:pt-5">
          <RestaurantDirectory
            restaurants={restaurants}
            eyebrow=""
            title=""
            subtitle=""
          />
        </section>

        {/* ── Owners CTA banner ────────────────────────────────────────────── */}
        <section className="container pb-16 pt-4">
          <div className="relative overflow-hidden rounded-3xl border border-violet-400/25 bg-gradient-to-br from-violet-800 via-[#2b3257] to-[#202a4a] px-6 py-8 text-white shadow-[0_14px_38px_rgba(58,40,122,0.35)] sm:px-10 md:py-10">
            {/* Decorative orb */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-300/25 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-fuchsia-400/20 blur-3xl"
            />

            <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-violet-300">
                  For restaurant owners
                </p>
                <h2 className="mt-2 text-xl font-bold text-white md:text-2xl">
                  Your menu. Your WhatsApp. Zero commission.
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  Get your own menu page, QR code, and dashboard from{" "}
                  <span className="font-semibold text-white">$25/month</span>.
                </p>
              </div>
              <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
                <Link
                  href="/for-restaurants"
                  className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-center text-sm font-semibold text-white transition hover:brightness-110"
                >
                  Plans &amp; pricing
                </Link>
                <Link
                  href="/contact"
                  className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}

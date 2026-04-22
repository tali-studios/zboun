import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RestaurantDirectory } from "@/components/restaurant-directory";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name, slug, logo_url")
    .eq("is_active", true)
    .eq("show_on_home", true)
    .order("created_at", { ascending: false });

  const count = restaurants?.length ?? 0;

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f8ff]">
      <SiteHeader largeLogo />

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-14 sm:py-20 md:py-28">
          {/* Background blobs */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-gradient-to-br from-violet-300/30 via-fuchsia-200/20 to-transparent blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 right-0 h-64 w-64 rounded-full bg-fuchsia-300/20 blur-3xl"
          />

          <div className="container relative">
            <div className="mx-auto max-w-2xl text-center">

              {/* Eyebrow pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200/70 bg-white/80 px-4 py-1.5 text-xs font-semibold text-violet-700 shadow-sm backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500" aria-hidden />
                WhatsApp ordering — no app needed
              </div>

              {/* Headline */}
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
                Browse menus.{" "}
                <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Order on WhatsApp.
                </span>
              </h1>

              {/* Sub-headline */}
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
                Pick a restaurant, build your cart, and send your order straight to the restaurant on WhatsApp — simple as that.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/#restaurants"
                  className="w-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-400/30 transition hover:-translate-y-0.5 hover:shadow-violet-400/50 sm:w-auto"
                >
                  Browse Restaurants
                </Link>
                <Link
                  href="/for-restaurants"
                  className="w-full rounded-full border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-300 hover:text-violet-700 sm:w-auto"
                >
                  For Restaurants
                </Link>
              </div>

              {/* Count */}
              {count > 0 ? (
                <p className="mt-6 text-sm text-slate-400">
                  <span className="font-semibold text-slate-700">{count}</span>{" "}
                  {count === 1 ? "restaurant" : "restaurants"} listed right now
                </p>
              ) : (
                <p className="mt-6 text-sm text-slate-400">
                  New restaurants join every week — check back soon.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── Restaurant directory ─────────────────────────────────────────── */}
        <section id="restaurants" className="pb-4">
          <RestaurantDirectory
            restaurants={restaurants ?? []}
            eyebrow="Discover"
            title="Restaurants on Zboun"
            subtitle="Search by name, open the menu, and send your order on WhatsApp."
          />
        </section>

        {/* ── Owners CTA banner ────────────────────────────────────────────── */}
        <section className="container pb-16 pt-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900 via-slate-900 to-slate-950 px-6 py-8 text-white sm:px-10 md:py-10">
            {/* Decorative orb */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-fuchsia-500/15 blur-3xl"
            />

            <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-violet-400">
                  For restaurant owners
                </p>
                <h2 className="mt-2 text-xl font-bold text-white md:text-2xl">
                  Your menu. Your WhatsApp. Zero commission.
                </h2>
                <p className="mt-1 text-sm text-slate-400">
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
                  className="rounded-full border border-white/20 bg-white/8 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/15"
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

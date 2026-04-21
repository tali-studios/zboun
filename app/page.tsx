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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/90 via-white to-slate-50/80">
      <SiteHeader largeLogo showDashboardButton={false} showForRestaurantsLink />
      <main>
        <section className="container pt-6 pb-2 md:pt-10 md:pb-4">
          <div className="relative overflow-hidden rounded-3xl border border-emerald-200/40 bg-white/90 px-5 py-8 shadow-[0_24px_60px_-28px_rgba(15,118,110,0.35)] md:px-10 md:py-10">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-slate-400/10 blur-3xl"
            />
            <div className="relative max-w-2xl space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
                Order on WhatsApp
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                Browse restaurants. Open a menu. Order in seconds.
              </h1>
              <p className="text-base text-slate-600 md:text-lg">
                No app download — pick a place below, build your cart, and send a clear message to
                the restaurant on WhatsApp.
              </p>
              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
                <p className="text-sm text-slate-500">
                  {count > 0 ? (
                    <>
                      <span className="font-semibold text-slate-800">{count}</span> listed
                      {count === 1 ? " restaurant" : " restaurants"} right now.
                    </>
                  ) : (
                    <>New restaurants join every week — check back soon.</>
                  )}
                </p>
                <span className="hidden h-4 w-px bg-slate-200 sm:block" aria-hidden />
                <Link
                  href="/"
                  className="text-sm font-semibold text-emerald-700 underline-offset-4 hover:underline"
                >
                  Browse restaurants →
                </Link>
              </div>
            </div>
          </div>
        </section>

        <RestaurantDirectory
          restaurants={restaurants ?? []}
          eyebrow="Discover"
          title="Restaurants on Zboun"
          subtitle="Search by name, open the customer menu, then send your order on WhatsApp."
        />

        <section className="container pb-12 pt-2 md:pb-16">
          <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-slate-200/90 bg-slate-900 px-5 py-5 text-white shadow-lg sm:flex-row sm:items-center sm:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300/90">
                For restaurant owners
              </p>
              <p className="mt-1 text-sm text-slate-300 md:text-base">
                Get your own menu page, QR tools, and dashboard — from{" "}
                <span className="font-semibold text-white">$25/month</span>.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
              <Link
                href="/for-restaurants"
                className="rounded-xl bg-emerald-500 px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Plans & subscribe
              </Link>
              <Link
                href="/contact"
                className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-white/10"
              >
                Contact
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

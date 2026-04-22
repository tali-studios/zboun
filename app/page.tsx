import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { RestaurantDirectory } from "@/components/restaurant-directory";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name, slug, logo_url, browse_sections")
    .eq("is_active", true)
    .eq("show_on_home", true)
    .order("created_at", { ascending: false });

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f8ff]">
      <SiteHeader largeLogo />

      <main className="flex-1">
        {/* ── Restaurant directory ─────────────────────────────────────────── */}
        <section id="restaurants" className="pt-4 pb-4 sm:pt-6">
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

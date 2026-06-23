import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getHomeRestaurants, getCurrentUserRole } from "@/lib/data";
import { dashboardHrefForRole } from "@/lib/auth-routing";
import { ZBOUN_PRICING } from "@/lib/pricing";
import { RestaurantDirectory } from "@/components/restaurant-directory";
import { SiteFooter } from "@/components/site-footer";
import { DeliveryLocationProvider } from "@/components/delivery-location-provider";
import { getCustomerOrderContext } from "@/lib/customer-order-context";
import { CustomerMobileFooterNav } from "@/components/customer-mobile-footer-nav";
import { BackToTopButton } from "@/components/back-to-top-button";

export default async function HomePage() {
  const [appUser, restaurants, customerCtx] = await Promise.all([
    getCurrentUserRole(),
    getHomeRestaurants(),
    getCustomerOrderContext(),
  ]);

  const dashboardHref = dashboardHrefForRole(appUser?.role);
  if (dashboardHref) {
    redirect(dashboardHref);
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
        {/* Desktop navbar — hidden on mobile (mobile uses sticky header in RestaurantDirectory) */}
        <header className="sticky top-0 z-30 hidden border-b border-slate-100 bg-white/95 backdrop-blur-md shadow-sm md:block">
          <div className="container flex h-16 items-center justify-between gap-6">
            {/* Logo */}
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
                priority
                unoptimized
                className="h-9 w-auto object-contain"
              />
            </Link>

            {/* Right-side actions */}
            <div className="flex items-center gap-2">
              {customerCtx.isLoggedIn ? (
                <>
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
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-400/30 transition hover:bg-violet-700"
                  >
                    Create account
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <DeliveryLocationProvider savedAddresses={customerCtx.savedAddresses}>
          <section id="restaurants" className="pb-2 pt-2 sm:pt-4">
            <RestaurantDirectory
              restaurants={restaurants}
              savedAddresses={customerCtx.savedAddresses}
              isLoggedIn={customerCtx.isLoggedIn}
            />
          </section>
        </DeliveryLocationProvider>

        {/* ── Owners CTA banner ────────────────────────────────────────────── */}
        <section className="container pb-0 pt-4 md:pb-10">
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
                  <span className="font-semibold text-white">
                    {ZBOUN_PRICING.symbol}
                    {ZBOUN_PRICING.monthly}/month
                  </span>
                  .
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

      <SiteFooter padForMobileNav />
      <CustomerMobileFooterNav />
      <BackToTopButton />
    </div>
  );
}

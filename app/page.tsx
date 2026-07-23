// import Link from "next/link";
import { getHomeRestaurants } from "@/lib/data";
// import { formatPricingSummary } from "@/lib/pricing";
// import { FOR_STORE_OWNERS_LABEL } from "@/lib/browse-sections";
import { RestaurantDirectory } from "@/components/restaurant-directory";
import { SiteFooter } from "@/components/site-footer";
import { DeliveryLocationProvider } from "@/components/delivery-location-provider";
import { getCustomerOrderContext } from "@/lib/customer-order-context";
import { CustomerMobileFooterNav } from "@/components/customer-mobile-footer-nav";
import { BackToTopButton } from "@/components/back-to-top-button";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [restaurants, customerCtx, params] = await Promise.all([
    getHomeRestaurants(),
    getCustomerOrderContext(),
    searchParams,
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <DeliveryLocationProvider savedAddresses={customerCtx.savedAddresses}>
          <section id="restaurants">
            <RestaurantDirectory
              restaurants={restaurants}
              savedAddresses={customerCtx.savedAddresses}
              isLoggedIn={customerCtx.isLoggedIn}
              customerName={customerCtx.defaultCustomerName}
              initialQuery={params.q}
            />
          </section>
        </DeliveryLocationProvider>

        {/* Pricing / owners CTA — commented out; uncomment + restore imports above to bring back
        <section className="mx-auto max-w-6xl px-4 pb-2 pt-2 md:px-6 md:pb-10 md:pt-4">
          <div className="relative overflow-hidden rounded-3xl border border-violet-400/25 bg-gradient-to-br from-violet-800 via-[#2b3257] to-[#202a4a] px-6 py-8 text-white shadow-[0_14px_38px_rgba(58,40,122,0.35)] sm:px-10 md:py-10">
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
                  {FOR_STORE_OWNERS_LABEL}
                </p>
                <h2 className="mt-2 text-xl font-bold text-white md:text-2xl">
                  Your storefront. Your WhatsApp. Zero commission.
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  Get your own store page, QR code, and dashboard from{" "}
                  <span className="font-semibold text-white">{formatPricingSummary()}</span>.
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
        */}
      </main>

      <SiteFooter padForMobileNav />
      <CustomerMobileFooterNav />
      <BackToTopButton />
    </div>
  );
}

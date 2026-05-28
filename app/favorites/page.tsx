import { getHomeRestaurants } from "@/lib/data";
import { DeliveryLocationProvider } from "@/components/delivery-location-provider";
import { FavoritesView } from "@/components/favorites-view";
import { CustomerMobileFooterNav } from "@/components/customer-mobile-footer-nav";
import { BackToTopButton } from "@/components/back-to-top-button";
import { CustomerDesktopNav } from "@/components/customer-desktop-nav";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const restaurants = await getHomeRestaurants();

  return (
    <div className="min-h-screen bg-[#f2f2f7]">
      {/* Desktop nav */}
      <CustomerDesktopNav title="Favorites" />

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/60 bg-white/95 px-4 backdrop-blur md:hidden">
        <div className="w-9" aria-hidden />
        <p className="text-[15px] font-semibold text-slate-900">Favorites</p>
        <div className="w-9" aria-hidden />
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5 md:pb-12 md:pt-8">
        <p className="mb-4 hidden text-lg font-bold text-slate-900 md:block">Your favourite restaurants</p>
        <DeliveryLocationProvider>
          <FavoritesView restaurants={restaurants} />
        </DeliveryLocationProvider>
      </main>

      <CustomerMobileFooterNav />
      <BackToTopButton />
    </div>
  );
}

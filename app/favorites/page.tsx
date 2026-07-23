import { getHomeRestaurants } from "@/lib/data";
import { DeliveryLocationProvider } from "@/components/delivery-location-provider";
import { FavoritesView } from "@/components/favorites-view";
import { CustomerMobileFooterNav } from "@/components/customer-mobile-footer-nav";
import { BackToTopButton } from "@/components/back-to-top-button";
import { CustomerDesktopNav } from "@/components/customer-desktop-nav";
import { CustomerMobileTopBar } from "@/components/customer-mobile-top-bar";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const restaurants = await getHomeRestaurants();

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop nav */}
      <CustomerDesktopNav title="Favorites" />

      <CustomerMobileTopBar title="Favorites" />

      <main className="mx-auto max-w-5xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5 md:pb-12 md:pt-8">
        <p className="mb-4 hidden text-lg font-bold text-slate-900 md:block">Your favorite stores</p>
        <DeliveryLocationProvider>
          <FavoritesView restaurants={restaurants} />
        </DeliveryLocationProvider>
      </main>

      <CustomerMobileFooterNav />
      <BackToTopButton />
    </div>
  );
}

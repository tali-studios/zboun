import { redirect } from "next/navigation";
import { getRestaurantDrivers } from "@/app-actions/drivers";
import { getCurrentUserRole, getRestaurantMenu } from "@/lib/data";
import { getRestaurantOrderDefaultEtaLabel, getRestaurantOrders } from "@/app-actions/orders";
import { RestaurantOrdersPanel } from "@/components/restaurant-orders-panel";
import { StoreAdminHeader } from "@/components/store-admin-header";
import { loadStoreAdminHeaderContext } from "@/lib/store-admin-header-context";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function RestaurantOrdersPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const [orders, defaultDeliveryTimeLabel, menuCategories, drivers, header] = await Promise.all([
    getRestaurantOrders(appUser.restaurant_id),
    getRestaurantOrderDefaultEtaLabel(appUser.restaurant_id),
    getRestaurantMenu(appUser.restaurant_id),
    getRestaurantDrivers(appUser.restaurant_id),
    loadStoreAdminHeaderContext(supabase, appUser.restaurant_id),
  ]);

  return (
    <main className="min-h-screen bg-[#f8f8ff] p-3 sm:p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <StoreAdminHeader
          restaurantName={header.restaurantName}
          categoryLabel={header.categoryLabel}
          slug={header.slug}
          browseSections={header.browseSections}
          menuUrl={header.menuUrl}
          driverManagementEnabled={header.driverManagementEnabled}
          currentPage="orders"
          title="Orders"
          subtitle="Real-time order management"
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <RestaurantOrdersPanel
            initialOrders={orders}
            restaurantId={appUser.restaurant_id}
            restaurantName={header.restaurantName}
            defaultDeliveryTimeLabel={defaultDeliveryTimeLabel}
            menuCategories={menuCategories}
            drivers={drivers}
            driverManagementEnabled={header.driverManagementEnabled}
          />
        </div>
      </div>
    </main>
  );
}

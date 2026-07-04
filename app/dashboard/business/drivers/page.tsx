import { redirect } from "next/navigation";
import { getRestaurantDrivers } from "@/app-actions/drivers";
import { getRestaurantOrders } from "@/app-actions/orders";
import { RestaurantDriversPanel } from "@/components/restaurant-drivers-panel";
import { StoreAdminHeader } from "@/components/store-admin-header";
import { getCurrentUserRole } from "@/lib/data";
import { loadStoreAdminHeaderContext } from "@/lib/store-admin-header-context";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function RestaurantDriversPage({ searchParams }: Props) {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }

  const { error } = await searchParams;

  const supabase = await createServerSupabaseClient();
  const [drivers, orders, header] = await Promise.all([
    getRestaurantDrivers(appUser.restaurant_id),
    getRestaurantOrders(appUser.restaurant_id),
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
          currentPage="drivers"
          title="Drivers"
          subtitle={`Create drivers, assign orders, and track delivery counts for ${header.restaurantName}.`}
        />

        <RestaurantDriversPanel
          drivers={drivers}
          orders={orders}
          driverManagementEnabled={header.driverManagementEnabled}
          errorCode={error ?? null}
        />
      </div>
    </main>
  );
}

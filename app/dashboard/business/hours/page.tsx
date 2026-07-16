import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StoreAdminHeader } from "@/components/store-admin-header";
import { loadStoreAdminHeaderContext } from "@/lib/store-admin-header-context";
import { RestaurantDashboardToast } from "@/components/restaurant-dashboard-toast";
import { RestaurantHoursPanel } from "@/components/restaurant-hours-panel";
import { parseOpeningHours } from "@/lib/opening-hours";
import { hasCatalogDashboard, parseBusinessType } from "@/lib/business-types";
import { loadRestaurantForAdminDashboard } from "@/lib/restaurant-profile";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    toast?: string;
  }>;
};

export default async function BusinessHoursPage({ searchParams }: Props) {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }

  const { toast } = await searchParams;
  const supabase = await createServerSupabaseClient();
  const restaurantId = appUser.restaurant_id;

  const [restaurant, header] = await Promise.all([
    loadRestaurantForAdminDashboard(supabase, restaurantId),
    loadStoreAdminHeaderContext(supabase, restaurantId),
  ]);

  const businessType = parseBusinessType(restaurant?.business_type ?? "retail_store");
  if (!hasCatalogDashboard(businessType)) {
    redirect("/dashboard/business");
  }

  return (
    <main className="min-h-screen bg-[#f8f8ff] p-3 sm:p-4 md:p-8">
      <RestaurantDashboardToast toast={toast} />
      <div className="mx-auto max-w-7xl space-y-5">
        <StoreAdminHeader
          restaurantName={header.restaurantName}
          categoryLabel={header.categoryLabel}
          slug={header.slug}
          browseSections={header.browseSections}
          menuUrl={header.menuUrl}
          driverManagementEnabled={header.driverManagementEnabled}
          currentPage="hours"
          title="Opening hours"
          subtitle="Set when customers can schedule delivery, and mark emergency closed days."
        />

        <RestaurantHoursPanel
          openingHours={parseOpeningHours(restaurant?.opening_hours)}
          isTemporarilyClosed={restaurant?.is_temporarily_closed ?? false}
        />
      </div>
    </main>
  );
}

import { redirect } from "next/navigation";
import { MenuFlyerCard } from "@/components/menu-flyer-card";
import { StoreAdminHeader } from "@/components/store-admin-header";
import { getCurrentUserRole } from "@/lib/data";
import { loadStoreAdminHeaderContext } from "@/lib/store-admin-header-context";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function RestaurantFlyerPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const header = await loadStoreAdminHeaderContext(supabase, appUser.restaurant_id);
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("logo_url, menu_theme_color")
    .eq("id", appUser.restaurant_id)
    .single();

  return (
    <main className="flyer-print-page min-h-screen overflow-x-hidden bg-[#f8f8ff] px-3 py-4 sm:p-8">
      <div className="flyer-print-wrap mx-auto w-full min-w-0 max-w-7xl space-y-5">
        <div className="print:hidden">
          <StoreAdminHeader
            restaurantName={header.restaurantName}
            categoryLabel={header.categoryLabel}
            slug={header.slug}
            browseSections={header.browseSections}
            menuUrl={header.menuUrl}
            driverManagementEnabled={header.driverManagementEnabled}
            currentPage="flyer"
            title="Print flyer (A4)"
            subtitle="Download or print a flyer with your store QR code."
          />
        </div>

        <MenuFlyerCard
          menuUrl={header.orderMenuUrl}
          restaurantName={header.restaurantName}
          logoUrl={restaurant?.logo_url ?? null}
          themeColor={restaurant?.menu_theme_color ?? null}
        />
      </div>
    </main>
  );
}

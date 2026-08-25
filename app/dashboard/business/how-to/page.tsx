import { redirect } from "next/navigation";
import { HowToPanel } from "@/components/how-to-panel";
import { StoreAdminHeader } from "@/components/store-admin-header";
import { getStorefrontActionLabels, isFoodMenuBusiness } from "@/lib/browse-sections";
import { getCurrentUserRole } from "@/lib/data";
import { getStoreAdminHowToSections } from "@/lib/store-admin-how-to-content";
import { loadStoreAdminHeaderContext } from "@/lib/store-admin-header-context";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StoreAdminHowToPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const header = await loadStoreAdminHeaderContext(supabase, appUser.restaurant_id);
  const labels = getStorefrontActionLabels(header.browseSections);
  const isFoodMenu = isFoodMenuBusiness(header.browseSections);
  const sections = getStoreAdminHowToSections({
    itemsNav: labels.itemsNav,
    storefrontNoun: isFoodMenu ? "menu" : "store",
  });

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
          currentPage="how-to"
          title="How To"
          subtitle="Video walkthrough and a clear guide to every page in your store admin portal."
        />

        <HowToPanel
          sections={sections}
          showDrivers={header.driverManagementEnabled}
        />
      </div>
    </main>
  );
}

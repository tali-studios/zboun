import { redirect } from "next/navigation";
import { ShareStorePanel } from "@/components/share-store-panel";
import { StoreAdminHeader } from "@/components/store-admin-header";
import { isFoodMenuBusiness } from "@/lib/browse-sections";
import { getCurrentUserRole } from "@/lib/data";
import { loadStoreAdminHeaderContext } from "@/lib/store-admin-header-context";
import { getStoreShareLinks } from "@/lib/store-share";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ShareStorePage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const header = await loadStoreAdminHeaderContext(supabase, appUser.restaurant_id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const share = getStoreShareLinks(appUrl, header.slug ?? "");
  const isFoodMenu = isFoodMenuBusiness(header.browseSections);
  const noun = isFoodMenu ? "menu" : "store";

  return (
    <main className="min-h-screen bg-[#f8f8ff] p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <StoreAdminHeader
          restaurantName={header.restaurantName}
          categoryLabel={header.categoryLabel}
          slug={header.slug}
          browseSections={header.browseSections}
          menuUrl={header.menuUrl}
          driverManagementEnabled={header.driverManagementEnabled}
          currentPage="share"
          title={`Share my ${noun}`}
          subtitle="WhatsApp, Instagram, and your public link — ready to paste."
        />

        <ShareStorePanel
          storeName={header.restaurantName}
          displayUrl={share.displayUrl}
          absoluteUrl={share.absoluteUrl}
          isFoodMenu={isFoodMenu}
        />
      </div>
    </main>
  );
}

import { redirect } from "next/navigation";
import { MenuQrCard } from "@/components/menu-qr-card";
import { StoreAdminHeader } from "@/components/store-admin-header";
import { getStorefrontQrLabels } from "@/lib/browse-sections";
import { getCurrentUserRole } from "@/lib/data";
import { getRestaurantMenuUrls } from "@/lib/restaurant-menu-urls";
import { loadStoreAdminHeaderContext } from "@/lib/store-admin-header-context";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function RestaurantQrPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const header = await loadStoreAdminHeaderContext(supabase, appUser.restaurant_id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const slug = header.slug ?? "";
  const { order: orderMenuUrl, inStore: inStoreMenuUrl } = getRestaurantMenuUrls(appUrl, slug);
  const qrLabels = getStorefrontQrLabels(header.browseSections);

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
          currentPage="qr"
          title={qrLabels.pageTitle}
          subtitle={qrLabels.pageIntro}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <MenuQrCard
            variant="order"
            menuUrl={orderMenuUrl}
            restaurantName={header.restaurantName}
            title={qrLabels.orderTitle}
            description={qrLabels.orderDescription}
            badgeLabel={qrLabels.orderBadge}
            openLinkLabel={qrLabels.openLink}
            downloadSuffix={qrLabels.orderDownloadSuffix}
          />
          <MenuQrCard
            variant="in-store"
            menuUrl={inStoreMenuUrl}
            restaurantName={header.restaurantName}
            title={qrLabels.inStoreTitle}
            description={qrLabels.inStoreDescription}
            badgeLabel={qrLabels.inStoreBadge}
            openLinkLabel={qrLabels.openLink}
            downloadSuffix={qrLabels.inStoreDownloadSuffix}
          />
        </div>
      </div>
    </main>
  );
}

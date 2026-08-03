import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StoreAdminHeader } from "@/components/store-admin-header";
import { loadStoreAdminHeaderContext } from "@/lib/store-admin-header-context";
import { RestaurantDashboardToast } from "@/components/restaurant-dashboard-toast";
import { getOrCreateStockSyncSettings } from "@/lib/stock-sync";
import { StockSyncPanel } from "@/components/stock-sync-panel";
import {
  saveStockSyncSettingsAction,
  regenerateInboundApiKeyAction,
  regenerateOutboundSecretAction,
  updateMenuItemExternalSkuAction,
} from "@/app-actions/stock-sync";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ toast?: string }>;
};

export default async function StockSyncPage({ searchParams }: Props) {
  const { toast } = await searchParams;
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }

  const restaurantId = appUser.restaurant_id;
  const supabase = await createServerSupabaseClient();

  const [header, settings, { data: items }, { data: events }] = await Promise.all([
    loadStoreAdminHeaderContext(supabase, restaurantId),
    getOrCreateStockSyncSettings(supabase, restaurantId),
    supabase
      .from("menu_items")
      .select("id, name, external_sku, track_stock, stock_quantity, is_available")
      .eq("restaurant_id", restaurantId)
      .order("name"),
    supabase
      .from("stock_sync_events")
      .select("id, restaurant_id, menu_item_id, direction, sku, quantity, status, error_message, created_at")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return (
    <main className="min-h-screen bg-[#f8f8ff] p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <StoreAdminHeader
          restaurantName={header.restaurantName}
          categoryLabel={header.categoryLabel}
          slug={header.slug}
          browseSections={header.browseSections}
          menuUrl={header.menuUrl}
          driverManagementEnabled={header.driverManagementEnabled}
          currentPage="stock-sync"
          title="Stock sync"
          subtitle="Keep stock in sync between your own website and Zboun — automatically, both ways."
        />

        <StockSyncPanel
          appUrl={appUrl}
          settings={settings}
          items={items ?? []}
          events={events ?? []}
          saveSettingsAction={saveStockSyncSettingsAction}
          regenerateApiKeyAction={regenerateInboundApiKeyAction}
          regenerateSecretAction={regenerateOutboundSecretAction}
          updateSkuAction={updateMenuItemExternalSkuAction}
        />
      </div>

      <RestaurantDashboardToast toast={toast} />
    </main>
  );
}

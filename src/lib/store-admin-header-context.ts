import type { SupabaseClient } from "@supabase/supabase-js";
import { formatBrowseSectionsLabel } from "@/lib/browse-sections";
import { loadRestaurantForAdminDashboard } from "@/lib/restaurant-profile";

export async function loadStoreAdminHeaderContext(
  supabase: SupabaseClient,
  restaurantId: string,
) {
  const restaurant = await loadRestaurantForAdminDashboard(supabase, restaurantId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const menuUrl = `${appUrl.replace(/\/+$/, "")}/${restaurant?.slug ?? ""}`;

  return {
    restaurant,
    menuUrl,
    categoryLabel: formatBrowseSectionsLabel(restaurant?.browse_sections),
    restaurantName: restaurant?.name ?? "Store",
    slug: restaurant?.slug,
    browseSections: restaurant?.browse_sections,
    driverManagementEnabled: restaurant?.driver_management_enabled ?? false,
  };
}

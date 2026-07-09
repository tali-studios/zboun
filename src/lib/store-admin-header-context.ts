import type { SupabaseClient } from "@supabase/supabase-js";
import { formatBrowseSectionsLabel } from "@/lib/browse-sections";
import {
  getRestaurantMenuUrls,
  getRestaurantSubdomainStoreUrl,
} from "@/lib/restaurant-menu-urls";
import { loadRestaurantForAdminDashboard } from "@/lib/restaurant-profile";

export async function loadStoreAdminHeaderContext(
  supabase: SupabaseClient,
  restaurantId: string,
) {
  const restaurant = await loadRestaurantForAdminDashboard(supabase, restaurantId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const slug = restaurant?.slug ?? "";
  // Host-only for Copy store link (e.g. al-baaklini.zboun.net)
  const menuUrl = getRestaurantSubdomainStoreUrl(appUrl, slug);
  // Absolute path URL for QR/flyer encoding
  const orderMenuUrl = getRestaurantMenuUrls(appUrl, slug).order;

  return {
    restaurant,
    menuUrl,
    orderMenuUrl,
    categoryLabel: formatBrowseSectionsLabel(restaurant?.browse_sections),
    restaurantName: restaurant?.name ?? "Store",
    slug: restaurant?.slug,
    browseSections: restaurant?.browse_sections,
    driverManagementEnabled: restaurant?.driver_management_enabled ?? false,
  };
}

import type { SupabaseClient } from "@supabase/supabase-js";

export type RestaurantBranchLike = {
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  is_main: boolean;
  position: number;
};

const GENERIC_BRANCH_NAMES = new Set(["main branch", "branch", "main"]);

const RESTAURANT_ADMIN_SELECT_FULL =
  "name, slug, phone, logo_url, banner_url, description, lbp_rate, browse_sections, location, eta_label, business_type, latitude, longitude, opening_hours, is_temporarily_closed, free_delivery, delivery_fee_usd, fast_delivery_enabled, fast_delivery_fee_usd, menu_theme_color";

const RESTAURANT_ADMIN_SELECT_CORE =
  "name, slug, phone, logo_url, banner_url, description, lbp_rate, browse_sections, location, eta_label, business_type, latitude, longitude, opening_hours, is_temporarily_closed, free_delivery, delivery_fee_usd, fast_delivery_enabled, fast_delivery_fee_usd";

export type RestaurantAdminProfile = {
  name: string;
  slug: string;
  phone: string;
  logo_url: string | null;
  banner_url: string | null;
  description: string | null;
  lbp_rate: number;
  browse_sections: string[] | null;
  location: string | null;
  eta_label: string | null;
  business_type: string | null;
  latitude: number | null;
  longitude: number | null;
  opening_hours: unknown;
  is_temporarily_closed: boolean;
  free_delivery: boolean;
  delivery_fee_usd: number;
  fast_delivery_enabled: boolean;
  fast_delivery_fee_usd: number;
  menu_theme_color: string | null;
};

export function pickMainBranch<T extends RestaurantBranchLike>(branches: T[]): T | null {
  if (branches.length === 0) return null;
  return branches.find((branch) => branch.is_main) ?? branches[0] ?? null;
}

export function deriveLocationLabelFromBranch(branch: RestaurantBranchLike): string | null {
  const name = branch.name.trim();
  if (name && !GENERIC_BRANCH_NAMES.has(name.toLowerCase())) {
    return name;
  }
  const address = branch.address?.trim();
  return address || (name || null);
}

export function resolveRestaurantLocationLabel(
  restaurantLocation: string | null | undefined,
  branches: RestaurantBranchLike[],
): string {
  const stored = restaurantLocation?.trim();
  if (stored) return stored;
  const main = pickMainBranch(branches);
  if (!main) return "";
  return deriveLocationLabelFromBranch(main) ?? "";
}

export async function loadRestaurantForAdminDashboard(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<RestaurantAdminProfile | null> {
  const full = await supabase
    .from("restaurants")
    .select(RESTAURANT_ADMIN_SELECT_FULL)
    .eq("id", restaurantId)
    .single();

  if (!full.error && full.data) {
    return full.data as RestaurantAdminProfile;
  }

  const core = await supabase
    .from("restaurants")
    .select(RESTAURANT_ADMIN_SELECT_CORE)
    .eq("id", restaurantId)
    .single();

  if (!core.error && core.data) {
    return { ...(core.data as Omit<RestaurantAdminProfile, "menu_theme_color">), menu_theme_color: null };
  }

  return null;
}

export async function syncRestaurantProfileFromMainBranch(
  supabase: SupabaseClient,
  restaurantId: string,
  restaurant: Pick<RestaurantAdminProfile, "location" | "latitude" | "longitude">,
  branches: RestaurantBranchLike[],
): Promise<Pick<RestaurantAdminProfile, "location" | "latitude" | "longitude">> {
  const main = pickMainBranch(branches);
  if (!main) return restaurant;

  const updates: Partial<Pick<RestaurantAdminProfile, "location" | "latitude" | "longitude">> = {};

  if (!restaurant.location?.trim()) {
    const label = deriveLocationLabelFromBranch(main);
    if (label) updates.location = label;
  }
  if (restaurant.latitude == null && Number.isFinite(main.latitude)) {
    updates.latitude = main.latitude;
    updates.longitude = main.longitude;
  }

  if (Object.keys(updates).length === 0) return restaurant;

  const { error } = await supabase.from("restaurants").update(updates).eq("id", restaurantId);
  if (error) return restaurant;
  return { ...restaurant, ...updates };
}

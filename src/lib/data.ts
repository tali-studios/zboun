import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { unstable_cache } from "next/cache";
import { enforceSubscriptionExpiryForRestaurant } from "@/lib/subscription-lifecycle";
import { isNutritionColumnMigrationError } from "@/lib/menu-nutrition";
import { isStockColumnMigrationError } from "@/lib/menu-item-stock";
import {
  attachSalePricingToItem,
  isMenuPromotionsMigrationError,
  type MenuPromotion,
} from "@/lib/menu-promotions";

type RatingAgg = { avgRating: number; ratingCount: number };

export type RestaurantLocationBranch = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  is_main: boolean;
};

export type RestaurantForMenuPage = {
  id: string;
  name: string;
  slug: string;
  phone: string;
  logo_url: string | null;
  banner_url: string | null;
  description: string | null;
  lbp_rate: number;
  is_active: boolean;
  browse_sections?: string[] | null;
  location: string | null;
  eta_label: string | null;
  opening_hours: unknown;
  is_temporarily_closed: boolean;
  free_delivery: boolean;
  delivery_fee_usd: number;
  fast_delivery_enabled: boolean;
  fast_delivery_fee_usd: number;
  delivery_radius_km: number | null;
  latitude: number | null;
  longitude: number | null;
  branches: RestaurantLocationBranch[];
  user_avg_rating: number | null;
  user_rating_count: number;
  menu_theme_color: string | null;
  allow_guest_checkout: boolean;
};

async function loadRatingStatsMap(supabase: SupabaseClient, ids: string[]): Promise<Map<string, RatingAgg>> {
  const out = new Map<string, RatingAgg>();
  if (ids.length === 0) return out;
  const { data, error } = await supabase.rpc("restaurant_rating_stats", { p_ids: ids });
  if (error || !Array.isArray(data)) return out;
  for (const raw of data as { restaurant_id: string; avg_rating: unknown; rating_count: unknown }[]) {
    const id = String(raw.restaurant_id);
    const avg = Number(raw.avg_rating);
    const cnt = Number(raw.rating_count);
    if (Number.isFinite(avg) && Number.isFinite(cnt)) {
      out.set(id, { avgRating: avg, ratingCount: cnt });
    }
  }
  return out;
}

export type CategoryWithItems = {
  id: string;
  name: string;
  position: number;
  menu_items: {
    id: string;
    name: string;
    brand_name: string | null;
    brand_id?: string | null;
    menu_brands?: { id: string; name: string; logo_url: string | null } | null;
    description: string | null;
    contents: string | null;
    grams: number | null;
    display_quantity?: number | null;
    display_unit?: string | null;
    calories?: number | null;
    protein_g?: number | null;
    price: number;
    sold_by_weight?: boolean;
    price_per_kg?: number | null;
    weight_step_kg?: number | null;
    removable_ingredients: Array<{ name: string }>;
    add_ingredients: Array<{ name: string; price: number }>;
    option_label?: string | null;
    option_values?: Array<{ name: string; price: number }>;
    track_stock?: boolean;
    stock_quantity?: number | null;
    sale_price?: number | null;
    sale_price_per_kg?: number | null;
    percent_off?: number | null;
    promotion_label?: string | null;
    image_url: string | null;
    is_available: boolean;
  }[];
};

type MenuBrandEmbed = { id: string; name: string; logo_url: string | null };

function normalizeMenuBrand(
  value: MenuBrandEmbed | MenuBrandEmbed[] | null | undefined,
): MenuBrandEmbed | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

type RestaurantRowCore = {
  id: string;
  name: string;
  slug: string;
  phone: string;
  logo_url: string | null;
  banner_url: string | null;
  description: string | null;
  lbp_rate: number;
  is_active: boolean;
  browse_sections?: string[] | null;
  location: string | null;
  eta_label: string | null;
  opening_hours?: unknown;
  is_temporarily_closed?: boolean;
  free_delivery?: boolean;
  delivery_fee_usd?: number;
  fast_delivery_enabled?: boolean;
  fast_delivery_fee_usd?: number;
  delivery_radius_km?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  menu_theme_color?: string | null;
  allow_guest_checkout?: boolean;
};

export async function getRestaurantBySlug(slug: string): Promise<RestaurantForMenuPage | null> {
  const supabase = await createServerSupabaseClient();
  const fullSelect =
    "id, name, slug, phone, logo_url, banner_url, description, lbp_rate, is_active, browse_sections, location, eta_label, opening_hours, is_temporarily_closed, free_delivery, delivery_fee_usd, fast_delivery_enabled, fast_delivery_fee_usd, delivery_radius_km, latitude, longitude, menu_theme_color, allow_guest_checkout";
  let { data, error } = await supabase.from("restaurants").select(fullSelect).eq("slug", slug).single();

  if (error && /allow_guest_checkout/i.test(error.message ?? "")) {
    const retry = await supabase
      .from("restaurants")
      .select(
        "id, name, slug, phone, logo_url, banner_url, description, lbp_rate, is_active, browse_sections, location, eta_label, opening_hours, is_temporarily_closed, free_delivery, delivery_fee_usd, fast_delivery_enabled, fast_delivery_fee_usd, delivery_radius_km, latitude, longitude, menu_theme_color",
      )
      .eq("slug", slug)
      .single();
    data = retry.data ? { ...retry.data, allow_guest_checkout: false } : null;
    error = retry.error;
  }

  let row: RestaurantRowCore | null = null;

  if (!error && data) {
    row = data as RestaurantRowCore;
  } else if (!data) {
    const legacy = await supabase
      .from("restaurants")
      .select("id, name, slug, phone, logo_url, banner_url, description, lbp_rate, is_active, browse_sections")
      .eq("slug", slug)
      .single();
    if (!legacy.data) return null;
    const base = legacy.data as Omit<RestaurantRowCore, "location" | "eta_label">;
    row = { ...base, location: null, eta_label: null };
  }

  if (!row) return null;

  await enforceSubscriptionExpiryForRestaurant(row.id);
  const { data: statusRow } = await supabase
    .from("restaurants")
    .select("is_active")
    .eq("id", row.id)
    .maybeSingle();
  if (statusRow) {
    row.is_active = statusRow.is_active;
  }

  const stats = await loadRatingStatsMap(supabase, [row.id]);
  const agg = stats.get(row.id);

  const { data: branchRows } = await supabase
    .from("restaurant_locations")
    .select("id, name, latitude, longitude, address, is_main")
    .eq("restaurant_id", row.id)
    .order("position", { ascending: true });

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    phone: row.phone,
    logo_url: row.logo_url,
    banner_url: row.banner_url,
    description: row.description,
    lbp_rate: row.lbp_rate,
    is_active: row.is_active,
    browse_sections: row.browse_sections,
    location: row.location,
    eta_label: row.eta_label,
    opening_hours: row.opening_hours ?? null,
    is_temporarily_closed: row.is_temporarily_closed ?? false,
    free_delivery: row.free_delivery ?? false,
    delivery_fee_usd: Number(row.delivery_fee_usd ?? 0),
    fast_delivery_enabled: row.fast_delivery_enabled ?? false,
    fast_delivery_fee_usd: Number(row.fast_delivery_fee_usd ?? 0),
    delivery_radius_km:
      row.delivery_radius_km != null ? Number(row.delivery_radius_km) : null,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
    branches: (branchRows ?? []) as RestaurantLocationBranch[],
    menu_theme_color: row.menu_theme_color ?? null,
    allow_guest_checkout: row.allow_guest_checkout ?? false,
    user_avg_rating: agg?.avgRating ?? null,
    user_rating_count: agg?.ratingCount ?? 0,
  };
}

function mapRestaurantMenuCategories(data: unknown[] | null | undefined, promotions: MenuPromotion[] = []) {
  return (data ?? []).map((category) => {
    const row = category as Record<string, unknown>;
    const categoryId = row.id as string;
    return {
      id: categoryId,
      name: row.name as string,
      position: row.position as number,
      menu_items: ((row.menu_items ?? []) as Array<Record<string, unknown>>).map((item) => {
        const mapped = {
          id: item.id as string,
          name: item.name as string,
          brand_name: (item.brand_name as string | null) ?? null,
          brand_id: (item.brand_id as string | null) ?? null,
          menu_brands: normalizeMenuBrand(
            item.menu_brands as MenuBrandEmbed | MenuBrandEmbed[] | null | undefined,
          ),
          description: (item.description as string | null) ?? null,
          contents: (item.contents as string | null) ?? null,
          grams: (item.grams as number | null) ?? null,
          display_quantity: (item.display_quantity as number | null) ?? null,
          display_unit: (item.display_unit as string | null) ?? null,
          calories: item.calories != null ? Number(item.calories) : null,
          protein_g: item.protein_g != null ? Number(item.protein_g) : null,
          price: Number(item.price),
          sold_by_weight: item.sold_by_weight as boolean | undefined,
          price_per_kg: (item.price_per_kg as number | null) ?? null,
          weight_step_kg: (item.weight_step_kg as number | null) ?? null,
          removable_ingredients: (item.removable_ingredients as Array<{ name: string }>) ?? [],
          add_ingredients: (item.add_ingredients as Array<{ name: string; price: number }>) ?? [],
          option_label: (item.option_label as string | null) ?? null,
          option_values: Array.isArray(item.option_values)
            ? (item.option_values as Array<{ name: string; price: number }>)
            : [],
          track_stock: Boolean(item.track_stock),
          stock_quantity: item.stock_quantity != null ? Number(item.stock_quantity) : null,
          image_url: (item.image_url as string | null) ?? null,
          is_available: Boolean(item.is_available),
        };
        return attachSalePricingToItem(mapped, categoryId, promotions);
      }),
    };
  });
}

export async function getRestaurantMenuPromotions(restaurantId: string): Promise<MenuPromotion[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("menu_promotions")
    .select(
      "id, restaurant_id, scope_type, scope_id, percent_off, label, starts_at, ends_at, is_active, priority",
    )
    .eq("restaurant_id", restaurantId)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    if (isMenuPromotionsMigrationError(error.message, error.code)) return [];
    console.error("[getRestaurantMenuPromotions]", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    restaurant_id: row.restaurant_id,
    scope_type: row.scope_type as MenuPromotion["scope_type"],
    scope_id: row.scope_id,
    percent_off: Number(row.percent_off),
    label: row.label,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    is_active: Boolean(row.is_active),
    priority: Number(row.priority ?? 0),
  }));
}

export async function getRestaurantMenu(restaurantId: string) {
  const supabase = await createServerSupabaseClient();
  const promotions = await getRestaurantMenuPromotions(restaurantId);
  const menuItemsSelectBase =
    "id, name, brand_id, brand_name, menu_brands(id, name, logo_url), description, contents, grams, display_quantity, display_unit, price, sold_by_weight, price_per_kg, weight_step_kg, removable_ingredients, add_ingredients, option_label, option_values, image_url, is_available";
  const menuItemsSelectWithStock = `${menuItemsSelectBase}, track_stock, stock_quantity`;
  const menuItemsSelectWithNutrition = `${menuItemsSelectWithStock}, calories, protein_g`;
  const menuItemsSelectWithNutritionNoStock = `${menuItemsSelectBase}, calories, protein_g`;
  const categorySelect = (menuItemsSelect: string) =>
    `id, name, position, menu_items(${menuItemsSelect})`;

  async function runQuery(menuItemsSelect: string) {
    return supabase
      .from("categories")
      .select(categorySelect(menuItemsSelect))
      .eq("restaurant_id", restaurantId)
      .order("position", { ascending: true })
      .order("name", { referencedTable: "menu_items", ascending: true });
  }

  let menuItemsSelect = menuItemsSelectWithNutrition;
  let { data, error } = await runQuery(menuItemsSelect);

  if (error && isNutritionColumnMigrationError(error.message, error.code)) {
    menuItemsSelect = menuItemsSelectWithStock;
    ({ data, error } = await runQuery(menuItemsSelect));
  }

  if (error && isStockColumnMigrationError(error.message, error.code)) {
    menuItemsSelect = menuItemsSelect.includes("calories")
      ? menuItemsSelectWithNutritionNoStock
      : menuItemsSelectBase;
    ({ data, error } = await runQuery(menuItemsSelect));
  }

  if (error && isNutritionColumnMigrationError(error.message, error.code)) {
    menuItemsSelect = menuItemsSelectBase;
    ({ data, error } = await runQuery(menuItemsSelect));
  }

  if (error) {
    console.error("[getRestaurantMenu]", error.message, error.code, error.details);
    return [];
  }

  return mapRestaurantMenuCategories(data, promotions);
}

type HomeRestaurantCard = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
  description: string | null;
  browse_sections?: string[] | null;
  /** Average from visitor ratings */
  rating: number | null;
  rating_count: number;
  location: string | null;
  eta_label: string | null;
  opening_hours: unknown;
  is_temporarily_closed: boolean;
  free_delivery: boolean;
  delivery_fee_usd: number;
  fast_delivery_enabled: boolean;
  fast_delivery_fee_usd: number;
  delivery_radius_km: number | null;
  latitude: number | null;
  longitude: number | null;
  /** All physical branches — used for multi-location distance filtering */
  branches: RestaurantLocationBranch[];
};

function mapLegacyHomeRow(r: {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  browse_sections?: string[] | null;
}): HomeRestaurantCard {
  return {
    ...r,
    banner_url: null,
    description: null,
    rating: null,
    rating_count: 0,
    location: null,
    eta_label: null,
    opening_hours: null,
    is_temporarily_closed: false,
    free_delivery: false,
    delivery_fee_usd: 0,
    fast_delivery_enabled: false,
    fast_delivery_fee_usd: 0,
    delivery_radius_km: null,
    latitude: null,
    longitude: null,
    branches: [],
  };
}

async function mapHomeRestaurantRows(
  rows: (Omit<HomeRestaurantCard, "rating" | "rating_count" | "branches"> & {
    restaurant_locations?: RestaurantLocationBranch[] | null;
  })[],
  supabase: SupabaseClient,
): Promise<HomeRestaurantCard[]> {
  const stats = await loadRatingStatsMap(supabase, rows.map((r) => r.id));
  return rows.map((r) => {
    const s = stats.get(r.id);
    return {
      ...r,
      rating: s?.avgRating ?? null,
      rating_count: s?.ratingCount ?? 0,
      opening_hours: (r as { opening_hours?: unknown }).opening_hours ?? null,
      is_temporarily_closed: (r as { is_temporarily_closed?: boolean }).is_temporarily_closed ?? false,
      free_delivery: (r as { free_delivery?: boolean }).free_delivery ?? false,
      delivery_fee_usd: Number((r as { delivery_fee_usd?: number }).delivery_fee_usd ?? 0),
      fast_delivery_enabled: (r as { fast_delivery_enabled?: boolean }).fast_delivery_enabled ?? false,
      fast_delivery_fee_usd: Number((r as { fast_delivery_fee_usd?: number }).fast_delivery_fee_usd ?? 0),
      delivery_radius_km:
        (r as { delivery_radius_km?: number | null }).delivery_radius_km != null
          ? Number((r as { delivery_radius_km?: number | null }).delivery_radius_km)
          : null,
      branches: (r.restaurant_locations ?? []) as RestaurantLocationBranch[],
    };
  });
}

export const getHomeRestaurants = unstable_cache(
  async (): Promise<HomeRestaurantCard[]> => {
    if (!env.supabaseUrl || !env.supabaseAnonKey) return [];
    const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const fullSelect =
      "id, name, slug, logo_url, banner_url, description, browse_sections, location, eta_label, opening_hours, is_temporarily_closed, free_delivery, delivery_fee_usd, fast_delivery_enabled, fast_delivery_fee_usd, delivery_radius_km, latitude, longitude, restaurant_locations(id, name, latitude, longitude, address, is_main)";

    const full = await supabase
      .from("restaurants")
      .select(fullSelect)
      .eq("is_active", true)
      .eq("show_on_home", true)
      .order("created_at", { ascending: false });

    if (!full.error && full.data) {
      return mapHomeRestaurantRows(
        full.data as (Omit<HomeRestaurantCard, "rating" | "rating_count" | "branches"> & {
          restaurant_locations?: RestaurantLocationBranch[] | null;
        })[],
        supabase,
      );
    }

    // Partial fallback when optional columns/joins are missing (still load hours for "Closed now")
    const withHours = await supabase
      .from("restaurants")
      .select(
        "id, name, slug, logo_url, banner_url, description, browse_sections, location, eta_label, opening_hours, is_temporarily_closed, latitude, longitude",
      )
      .eq("is_active", true)
      .eq("show_on_home", true)
      .order("created_at", { ascending: false });

    if (!withHours.error && withHours.data) {
      return mapHomeRestaurantRows(
        withHours.data.map((r) => ({
          ...r,
          restaurant_locations: [],
          free_delivery: false,
          delivery_fee_usd: 0,
          fast_delivery_enabled: false,
          fast_delivery_fee_usd: 0,
          delivery_radius_km: null,
        })),
        supabase,
      );
    }

    // Fallback: new columns may not exist until migration is applied
    const legacy = await supabase
      .from("restaurants")
      .select("id, name, slug, logo_url, browse_sections")
      .eq("is_active", true)
      .eq("show_on_home", true)
      .order("created_at", { ascending: false });

    if (legacy.error || !legacy.data) {
      return [];
    }
    return legacy.data.map(mapLegacyHomeRow);
  },
  ["home-restaurants", "visitor-ratings-v2", "branches-v1", "hours-v2", "delivery-fee-v1", "fast-delivery-v1"],
  { revalidate: 60, tags: ["home-restaurants"] },
);

export const getCurrentUserRole = cache(async function getCurrentUserRole() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: appUserByUserClient } = await supabase
    .from("users")
    .select("id, role, restaurant_id, name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (appUserByUserClient) return appUserByUserClient;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env.supabaseUrl || !serviceRoleKey) return null;

  const adminClient = createClient(env.supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: appUserByAdminClient } = await adminClient
    .from("users")
    .select("id, role, restaurant_id, name, email")
    .eq("id", user.id)
    .maybeSingle();

  return appUserByAdminClient ?? null;
});

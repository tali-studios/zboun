import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { unstable_cache } from "next/cache";
import { enforceSubscriptionExpiryForRestaurant } from "@/lib/subscription-lifecycle";

type RatingAgg = { avgRating: number; ratingCount: number };

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
  user_avg_rating: number | null;
  user_rating_count: number;
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
    price: number;
    sold_by_weight?: boolean;
    price_per_kg?: number | null;
    weight_step_kg?: number | null;
    removable_ingredients: Array<{ name: string }>;
    add_ingredients: Array<{ name: string; price: number }>;
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
};

export async function getRestaurantBySlug(slug: string): Promise<RestaurantForMenuPage | null> {
  const supabase = await createServerSupabaseClient();
  const fullSelect =
    "id, name, slug, phone, logo_url, banner_url, description, lbp_rate, is_active, browse_sections, location, eta_label, opening_hours, is_temporarily_closed, free_delivery, delivery_fee_usd, fast_delivery_enabled, fast_delivery_fee_usd";
  const { data, error } = await supabase.from("restaurants").select(fullSelect).eq("slug", slug).single();

  let row: RestaurantRowCore | null = null;

  if (!error && data) {
    row = data as RestaurantRowCore;
  } else {
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
    user_avg_rating: agg?.avgRating ?? null,
    user_rating_count: agg?.ratingCount ?? 0,
  };
}

export async function getRestaurantMenu(restaurantId: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("categories")
    .select(
      "id, name, position, menu_items(id, name, brand_id, brand_name, menu_brands(id, name, logo_url), description, contents, grams, price, sold_by_weight, price_per_kg, weight_step_kg, removable_ingredients, add_ingredients, image_url, is_available)",
    )
    .eq("restaurant_id", restaurantId)
    .order("position", { ascending: true })
    .order("name", { referencedTable: "menu_items", ascending: true });

  return (data ?? []).map((category) => ({
    id: category.id as string,
    name: category.name as string,
    position: category.position as number,
    menu_items: ((category.menu_items ?? []) as Array<Record<string, unknown>>).map((item) => ({
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
      price: Number(item.price),
      sold_by_weight: item.sold_by_weight as boolean | undefined,
      price_per_kg: (item.price_per_kg as number | null) ?? null,
      weight_step_kg: (item.weight_step_kg as number | null) ?? null,
      removable_ingredients: (item.removable_ingredients as Array<{ name: string }>) ?? [],
      add_ingredients: (item.add_ingredients as Array<{ name: string; price: number }>) ?? [],
      image_url: (item.image_url as string | null) ?? null,
      is_available: Boolean(item.is_available),
    })),
  }));
}

export type RestaurantLocationBranch = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  is_main: boolean;
};

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
      "id, name, slug, logo_url, banner_url, description, browse_sections, location, eta_label, opening_hours, is_temporarily_closed, free_delivery, delivery_fee_usd, fast_delivery_enabled, fast_delivery_fee_usd, latitude, longitude, restaurant_locations(id, name, latitude, longitude, address, is_main)";

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

export async function getCurrentUserRole() {
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
}

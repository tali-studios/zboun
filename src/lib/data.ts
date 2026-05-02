import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { unstable_cache } from "next/cache";

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
    description: string | null;
    contents: string | null;
    grams: number | null;
    price: number;
    removable_ingredients: Array<{ name: string }>;
    add_ingredients: Array<{ name: string; price: number }>;
    image_url: string | null;
    is_available: boolean;
  }[];
};

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
};

export async function getRestaurantBySlug(slug: string): Promise<RestaurantForMenuPage | null> {
  const supabase = await createServerSupabaseClient();
  const fullSelect =
    "id, name, slug, phone, logo_url, banner_url, description, lbp_rate, is_active, browse_sections, location, eta_label";
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
    user_avg_rating: agg?.avgRating ?? null,
    user_rating_count: agg?.ratingCount ?? 0,
  };
}

export async function getRestaurantMenu(restaurantId: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("categories")
    .select(
      "id, name, position, menu_items(id, name, description, contents, grams, price, removable_ingredients, add_ingredients, image_url, is_available)",
    )
    .eq("restaurant_id", restaurantId)
    .order("position", { ascending: true })
    .order("name", { referencedTable: "menu_items", ascending: true });

  return (data ?? []) as CategoryWithItems[];
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
  };
}

export const getHomeRestaurants = unstable_cache(
  async (): Promise<HomeRestaurantCard[]> => {
    if (!env.supabaseUrl || !env.supabaseAnonKey) return [];
    const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const fullSelect =
      "id, name, slug, logo_url, banner_url, description, browse_sections, location, eta_label";

    const full = await supabase
      .from("restaurants")
      .select(fullSelect)
      .eq("is_active", true)
      .eq("show_on_home", true)
      .order("created_at", { ascending: false });

    if (!full.error && full.data) {
      const rows = full.data as Omit<HomeRestaurantCard, "rating" | "rating_count">[];
      const stats = await loadRatingStatsMap(supabase, rows.map((r) => r.id));
      return rows.map((r) => {
        const s = stats.get(r.id);
        return {
          ...r,
          rating: s?.avgRating ?? null,
          rating_count: s?.ratingCount ?? 0,
        };
      });
    }

    // New columns may not exist until you run supabase/schema (or run-all) alters — avoid a silent empty home page.
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
  ["home-restaurants", "visitor-ratings-v1"],
  { revalidate: 60 },
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

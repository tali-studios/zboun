import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { unstable_cache } from "next/cache";

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

export async function getRestaurantBySlug(slug: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("restaurants")
    .select("id, name, slug, phone, logo_url, banner_url, description, lbp_rate, is_active, browse_sections")
    .eq("slug", slug)
    .single();
  return data;
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
  browse_sections?: string[] | null;
};

export const getHomeRestaurants = unstable_cache(
  async (): Promise<HomeRestaurantCard[]> => {
    if (!env.supabaseUrl || !env.supabaseAnonKey) return [];
    const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await supabase
      .from("restaurants")
      .select("id, name, slug, logo_url, browse_sections")
      .eq("is_active", true)
      .eq("show_on_home", true)
      .order("created_at", { ascending: false });
    return (data ?? []) as HomeRestaurantCard[];
  },
  ["home-restaurants"],
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

import { createServerSupabaseClient } from "@/lib/supabase/server";

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
    image_url: string | null;
    is_available: boolean;
  }[];
};

export async function getRestaurantBySlug(slug: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("restaurants")
    .select("id, name, slug, phone, logo_url, is_active")
    .eq("slug", slug)
    .single();
  return data;
}

export async function getRestaurantMenu(restaurantId: string) {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("categories")
    .select(
      "id, name, position, menu_items(id, name, description, contents, grams, price, image_url, is_available)",
    )
    .eq("restaurant_id", restaurantId)
    .order("position", { ascending: true })
    .order("name", { referencedTable: "menu_items", ascending: true });

  return (data ?? []) as CategoryWithItems[];
}

export async function getCurrentUserRole() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: appUser } = await supabase
    .from("users")
    .select("id, role, restaurant_id, name, email")
    .eq("id", user.id)
    .single();

  return appUser;
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function requireRestaurantAdmin() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "restaurant_admin" || !user.restaurant_id) {
    redirect("/dashboard/login");
  }
  return user;
}

export async function createCategoryAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const name = String(formData.get("name") ?? "");
  const supabase = await createServerSupabaseClient();
  await supabase.from("categories").insert({
    name,
    restaurant_id: user.restaurant_id,
    position: 0,
  });
  revalidatePath("/dashboard/restaurant");
}

export async function createMenuItemAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const supabase = await createServerSupabaseClient();
  await supabase.from("menu_items").insert({
    restaurant_id: user.restaurant_id,
    category_id: String(formData.get("category_id")),
    name: String(formData.get("name")),
    description: String(formData.get("description")),
    price: Number(formData.get("price")),
    is_available: true,
  });
  revalidatePath("/dashboard/restaurant");
}

export async function updateRestaurantSettingsAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("restaurants")
    .update({
      name: String(formData.get("name")),
      phone: String(formData.get("phone")),
      logo_url: String(formData.get("logo_url")),
    })
    .eq("id", user.restaurant_id);
  revalidatePath("/dashboard/restaurant");
}

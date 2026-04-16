"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

async function requireRestaurantAdmin() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "restaurant_admin" || !user.restaurant_id) {
    redirect("/dashboard/login");
  }
  return user;
}

function getStorageAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env.supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or Supabase URL.");
  }

  return createClient(env.supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function uploadMenuItemImage(file: File, restaurantId: string) {
  if (!file || file.size === 0) {
    return null;
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image size must be under 5MB.");
  }

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const filePath = `${restaurantId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const bucket = process.env.SUPABASE_MENU_BUCKET ?? "menu-items";
  const adminClient = getStorageAdminClient();

  const { error: uploadError } = await adminClient.storage.from(bucket).upload(filePath, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) {
    throw uploadError;
  }

  const { data } = adminClient.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
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

export async function updateCategoryAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;

  const supabase = await createServerSupabaseClient();
  await supabase
    .from("categories")
    .update({ name })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidatePath("/dashboard/restaurant");
}

export async function deleteCategoryAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createServerSupabaseClient();
  await supabase.from("categories").delete().eq("id", id).eq("restaurant_id", user.restaurant_id);
  revalidatePath("/dashboard/restaurant");
}

export async function createMenuItemAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const supabase = await createServerSupabaseClient();
  const gramsValue = String(formData.get("grams") ?? "").trim();
  const imageFile = formData.get("image_file");
  const imageUrl =
    imageFile instanceof File ? await uploadMenuItemImage(imageFile, user.restaurant_id) : null;
  await supabase.from("menu_items").insert({
    restaurant_id: user.restaurant_id,
    category_id: String(formData.get("category_id")),
    name: String(formData.get("name")),
    description: String(formData.get("description")),
    price: Number(formData.get("price")),
    image_url: imageUrl,
    grams: gramsValue ? Number(gramsValue) : null,
    contents: String(formData.get("contents") ?? "").trim() || null,
    is_available: true,
  });
  revalidatePath("/dashboard/restaurant");
}

export async function updateMenuItemAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const categoryId = String(formData.get("category_id") ?? "");
  const currentImageUrl = String(formData.get("current_image_url") ?? "").trim();
  const imageFile = formData.get("image_file");
  const uploadedImageUrl =
    imageFile instanceof File ? await uploadMenuItemImage(imageFile, user.restaurant_id) : null;
  const gramsValue = String(formData.get("grams") ?? "").trim();
  const contents = String(formData.get("contents") ?? "").trim();

  const supabase = await createServerSupabaseClient();
  await supabase
    .from("menu_items")
    .update({
      name,
      description: description || null,
      price,
      category_id: categoryId || null,
      image_url: uploadedImageUrl ?? (currentImageUrl || null),
      grams: gramsValue ? Number(gramsValue) : null,
      contents: contents || null,
    })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidatePath("/dashboard/restaurant");
}

export async function toggleMenuItemAvailabilityAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const id = String(formData.get("id") ?? "");
  const isAvailable = String(formData.get("is_available")) === "true";
  if (!id) return;

  const supabase = await createServerSupabaseClient();
  await supabase
    .from("menu_items")
    .update({ is_available: !isAvailable })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidatePath("/dashboard/restaurant");
}

export async function deleteMenuItemAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createServerSupabaseClient();
  await supabase.from("menu_items").delete().eq("id", id).eq("restaurant_id", user.restaurant_id);
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

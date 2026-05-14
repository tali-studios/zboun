"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parseBrowseSectionFromForm } from "@/lib/browse-sections";
import { env } from "@/lib/env";

async function requireRestaurantAdmin() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "restaurant_admin" || !user.restaurant_id) {
    redirect("/dashboard/login");
  }
  return user;
}

function parseIngredientJson(raw: FormDataEntryValue | null): Array<{ name: string; price?: number }> {
  const value = String(raw ?? "").trim();
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const name = String((item as { name?: unknown }).name ?? "").trim();
        if (!name) return null;
        const priceRaw = Number((item as { price?: unknown }).price ?? 0);
        const price = Number.isFinite(priceRaw) && priceRaw > 0 ? Math.round(priceRaw * 100) / 100 : 0;
        return { name, price };
      })
      .filter((item): item is { name: string; price: number } => Boolean(item));
  } catch {
    return [];
  }
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

async function ensureBucketExists(bucket: string) {
  const adminClient = getStorageAdminClient();
  const { data: buckets, error: listError } = await adminClient.storage.listBuckets();
  if (listError) {
    throw listError;
  }

  const exists = (buckets ?? []).some((item) => item.name === bucket);
  if (exists) return;

  const { error: createError } = await adminClient.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
  });
  if (createError) {
    throw createError;
  }
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
  await ensureBucketExists(bucket);
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

async function uploadRestaurantLogo(file: File, restaurantId: string) {
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
  const filePath = `${restaurantId}/logo-${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const bucket = process.env.SUPABASE_LOGO_BUCKET ?? "restaurant-logos";
  await ensureBucketExists(bucket);
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

async function uploadRestaurantBanner(file: File, restaurantId: string) {
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
  const filePath = `${restaurantId}/banner-${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const bucket = process.env.SUPABASE_LOGO_BUCKET ?? "restaurant-logos";
  await ensureBucketExists(bucket);
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
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    redirect("/dashboard/business?toast=section_name_required");
  }
  const supabase = await createServerSupabaseClient();
  await supabase.from("categories").insert({
    name,
    restaurant_id: user.restaurant_id,
    position: 0,
  });
  revalidatePath("/dashboard/business");
  redirect(`/dashboard/business?toast=section_created&section_name=${encodeURIComponent(name)}`);
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
  revalidatePath("/dashboard/business");
}

export async function deleteCategoryAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createServerSupabaseClient();
  await supabase.from("categories").delete().eq("id", id).eq("restaurant_id", user.restaurant_id);
  revalidatePath("/dashboard/business");
}

export async function createMenuItemAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const supabase = await createServerSupabaseClient();

  const categoryId = String(formData.get("category_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const price = Number(formData.get("price"));
  const gramsValue = String(formData.get("grams") ?? "").trim();
  const gramsParsed = gramsValue ? Number(gramsValue) : null;

  if (!categoryId || !name) {
    redirect("/dashboard/business?toast=item_create_invalid");
  }
  if (!Number.isFinite(price) || price < 0) {
    redirect("/dashboard/business?toast=item_create_invalid");
  }
  if (gramsParsed !== null && (!Number.isFinite(gramsParsed) || gramsParsed < 0)) {
    redirect("/dashboard/business?toast=item_create_invalid");
  }

  const imageFile = formData.get("image_file");
  const imageUrl =
    imageFile instanceof File && imageFile.size > 0
      ? await uploadMenuItemImage(imageFile, user.restaurant_id)
      : null;

  const removableIngredients = parseIngredientJson(formData.get("removable_ingredients")).map(
    (item) => ({ name: item.name }),
  );
  const addIngredients = parseIngredientJson(formData.get("add_ingredients")).map((item) => ({
    name: item.name,
    price: item.price ?? 0,
  }));
  const optionLabel = String(formData.get("option_label") ?? "").trim();
  const optionValues = parseIngredientJson(formData.get("option_values")).map((item) => ({
    name: item.name,
    price: item.price ?? 0,
  }));

  const description = String(formData.get("description") ?? "").trim() || null;

  const { error } = await supabase.from("menu_items").insert({
    restaurant_id: user.restaurant_id,
    category_id: categoryId,
    name,
    description,
    price,
    image_url: imageUrl,
    grams: gramsParsed,
    contents: String(formData.get("contents") ?? "").trim() || null,
    removable_ingredients: removableIngredients,
    add_ingredients: addIngredients,
    option_label: optionLabel || null,
    option_values: optionValues,
    is_available: true,
  });

  if (error) {
    console.error("[createMenuItemAction]", error.message, error.code, error.details);
    redirect("/dashboard/business?toast=item_create_failed");
  }

  revalidatePath("/dashboard/business");
  redirect(`/dashboard/business?toast=item_created&item_name=${encodeURIComponent(name)}`);
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
  const removableIngredients = parseIngredientJson(formData.get("removable_ingredients")).map(
    (item) => ({ name: item.name }),
  );
  const addIngredients = parseIngredientJson(formData.get("add_ingredients")).map((item) => ({
    name: item.name,
    price: item.price ?? 0,
  }));
  const optionLabel = String(formData.get("option_label") ?? "").trim();
  const optionValues = parseIngredientJson(formData.get("option_values")).map((item) => ({
    name: item.name,
    price: item.price ?? 0,
  }));

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
      removable_ingredients: removableIngredients,
      add_ingredients: addIngredients,
      option_label: optionLabel || null,
      option_values: optionValues,
    })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidatePath("/dashboard/business");
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
  revalidatePath("/dashboard/business");
}

export async function deleteMenuItemAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createServerSupabaseClient();
  await supabase.from("menu_items").delete().eq("id", id).eq("restaurant_id", user.restaurant_id);
  revalidatePath("/dashboard/business");
}

export async function updateRestaurantSettingsAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const logoFile = formData.get("logo_file");
  const bannerFile = formData.get("banner_file");
  const currentLogoUrl = String(formData.get("current_logo_url") ?? "").trim();
  const currentBannerUrl = String(formData.get("current_banner_url") ?? "").trim();
  const lbpRateRaw = String(formData.get("lbp_rate") ?? "").trim();
  const lbpRate = Number(lbpRateRaw);
  if (!Number.isFinite(lbpRate) || lbpRate <= 0) {
    redirect("/dashboard/business?q=invalid_lbp_rate");
  }
  const uploadedLogoUrl =
    logoFile instanceof File ? await uploadRestaurantLogo(logoFile, user.restaurant_id) : null;
  const uploadedBannerUrl =
    bannerFile instanceof File ? await uploadRestaurantBanner(bannerFile, user.restaurant_id) : null;
  const location = String(formData.get("location") ?? "").trim() || null;
  const eta_label = String(formData.get("eta_label") ?? "").trim() || null;

  const supabase = await createServerSupabaseClient();
  await supabase
    .from("restaurants")
    .update({
      name: String(formData.get("name")),
      description: String(formData.get("description") ?? "").trim() || null,
      phone: String(formData.get("phone")),
      lbp_rate: Math.round(lbpRate * 100) / 100,
      browse_sections: [parseBrowseSectionFromForm(formData)],
      logo_url: uploadedLogoUrl ?? (currentLogoUrl || null),
      banner_url: uploadedBannerUrl ?? (currentBannerUrl || null),
      location,
      eta_label,
    })
    .eq("id", user.restaurant_id);
  revalidatePath("/dashboard/business");
  revalidatePath("/");
  redirect("/dashboard/business?toast=settings_saved");
}

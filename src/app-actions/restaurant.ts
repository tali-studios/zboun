"use server";

import crypto from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  inferBusinessTypeFromBrowseSections,
  normalizeBrowseSections,
  validateBrowseSelectionFromForm,
} from "@/lib/browse-sections";
import { parseMenuThemeColor } from "@/lib/menu-theme";
import {
  MAX_RESTAURANT_DELIVERY_RADIUS_KM,
  MIN_RESTAURANT_DELIVERY_RADIUS_KM,
  normalizeRestaurantDeliveryRadiusKm,
} from "@/lib/delivery-radius";
import { deriveLocationLabelFromBranch } from "@/lib/restaurant-profile";
import { parseDisplayQuantityFromForm } from "@/lib/display-quantity";
import { buildMenuItemStockPayload } from "@/lib/menu-item-stock";
import { parseOptionalCalories, parseOptionalProteinGrams, isNutritionColumnMigrationError } from "@/lib/menu-nutrition";
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

const knownBuckets = new Set<string>();

async function ensureBucketExists(bucket: string) {
  if (knownBuckets.has(bucket)) return;

  const adminClient = getStorageAdminClient();
  const { data: buckets, error: listError } = await adminClient.storage.listBuckets();
  if (listError) {
    throw listError;
  }

  const exists = (buckets ?? []).some((item) => item.name === bucket);
  if (exists) {
    knownBuckets.add(bucket);
    return;
  }

  const { error: createError } = await adminClient.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
  });
  if (createError) {
    throw createError;
  }
  knownBuckets.add(bucket);
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

async function uploadBrandLogo(file: File, restaurantId: string) {
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
  const filePath = `${restaurantId}/brand-${Date.now()}-${crypto.randomUUID()}.${extension}`;
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

async function resolveMenuBrandForItem(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  restaurantId: string,
  brandIdRaw: string,
): Promise<{ brandId: string | null; brandName: string | null }> {
  const brandId = brandIdRaw.trim();
  if (!brandId) {
    return { brandId: null, brandName: null };
  }

  const { data: brand } = await supabase
    .from("menu_brands")
    .select("id, name")
    .eq("id", brandId)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  if (!brand?.id) {
    if (brandId) {
      return { brandId, brandName: null };
    }
    return { brandId: null, brandName: null };
  }

  return { brandId: brand.id as string, brandName: brand.name as string };
}

export async function createCategoryAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const names = [
    ...new Set(
      formData
        .getAll("name")
        .map((value) => String(value ?? "").trim())
        .filter(Boolean),
    ),
  ];
  if (names.length === 0) {
    redirect("/dashboard/business?toast=section_name_required");
  }

  const supabase = await createServerSupabaseClient();
  const { data: lastCategory } = await supabase
    .from("categories")
    .select("position")
    .eq("restaurant_id", user.restaurant_id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  let position = Number(lastCategory?.position ?? -1) + 1;
  const inserts = names.map((name) => ({
    name,
    restaurant_id: user.restaurant_id,
    position: position++,
  }));

  await supabase.from("categories").insert(inserts);
  revalidatePath("/dashboard/business");

  if (names.length === 1) {
    redirect(`/dashboard/business?toast=section_created&section_name=${encodeURIComponent(names[0]!)}`);
  }
  redirect(`/dashboard/business?toast=sections_created&sections_count=${names.length}`);
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

export async function createBrandAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    redirect("/dashboard/business?toast=brand_name_required");
  }

  const logoFile = formData.get("logo_file");
  let logoUrl: string | null = null;
  try {
    logoUrl =
      logoFile instanceof File && logoFile.size > 0
        ? await uploadBrandLogo(logoFile, user.restaurant_id)
        : null;
  } catch {
    redirect("/dashboard/business?toast=brand_logo_invalid");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("menu_brands").insert({
    name,
    logo_url: logoUrl,
    restaurant_id: user.restaurant_id,
    position: 0,
  });

  if (error) {
    if (error.code === "23505") {
      redirect("/dashboard/business?toast=brand_name_duplicate");
    }
    redirect("/dashboard/business?toast=brand_create_failed");
  }

  revalidatePath("/dashboard/business");
  redirect(`/dashboard/business?toast=brand_created&brand_name=${encodeURIComponent(name)}`);
}

export async function updateBrandAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;

  const currentLogoUrl = String(formData.get("current_logo_url") ?? "").trim();
  const logoFile = formData.get("logo_file");
  let uploadedLogoUrl: string | null = null;
  if (logoFile instanceof File && logoFile.size > 0) {
    try {
      uploadedLogoUrl = await uploadBrandLogo(logoFile, user.restaurant_id);
    } catch {
      redirect("/dashboard/business?toast=brand_logo_invalid");
    }
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("menu_brands")
    .update({
      name,
      logo_url: uploadedLogoUrl ?? (currentLogoUrl || null),
    })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);

  if (error) {
    if (error.code === "23505") {
      redirect("/dashboard/business?toast=brand_name_duplicate");
    }
    return;
  }

  revalidatePath("/dashboard/business");
}

export async function deleteBrandAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const supabase = await createServerSupabaseClient();
  await supabase.from("menu_brands").delete().eq("id", id).eq("restaurant_id", user.restaurant_id);
  revalidatePath("/dashboard/business");
}

export async function createMenuItemAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const supabase = await createServerSupabaseClient();

  const categoryId = String(formData.get("category_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const soldByWeight = String(formData.get("sold_by_weight") ?? "") === "true";
  const pricePerKgRaw = String(formData.get("price_per_kg") ?? "").trim();
  const weightStepRaw = String(formData.get("weight_step_kg") ?? "").trim();
  const pricePerKg = pricePerKgRaw ? Number(pricePerKgRaw) : null;
  const weightStepKg = weightStepRaw ? Number(weightStepRaw) : 0.1;
  const price = soldByWeight ? 0 : Number(formData.get("price"));
  const displayQty = soldByWeight
    ? { display_quantity: null, display_unit: "g" as const, grams: null }
    : parseDisplayQuantityFromForm(
        formData.get("display_quantity"),
        formData.get("display_unit"),
      );

  if (!categoryId || !name) {
    redirect("/dashboard/business?toast=item_create_invalid");
  }
  if (!Number.isFinite(price) || price < 0) {
    redirect("/dashboard/business?toast=item_create_invalid");
  }
  if (soldByWeight) {
    if (pricePerKg === null || !Number.isFinite(pricePerKg) || pricePerKg < 0) {
      redirect("/dashboard/business?toast=item_create_invalid");
    }
    if (!Number.isFinite(weightStepKg) || weightStepKg < 0.01) {
      redirect("/dashboard/business?toast=item_create_invalid");
    }
  }
  if (displayQty.display_quantity != null && displayQty.display_quantity < 0) {
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
  const stock = buildMenuItemStockPayload(formData);

  const description = String(formData.get("description") ?? "").trim() || null;
  const calories = parseOptionalCalories(formData.get("calories"));
  const proteinG = parseOptionalProteinGrams(formData.get("protein_g"));
  const { brandId, brandName } = await resolveMenuBrandForItem(
    supabase,
    user.restaurant_id,
    String(formData.get("brand_id") ?? ""),
  );

  const { error } = await supabase.from("menu_items").insert({
    restaurant_id: user.restaurant_id,
    category_id: categoryId,
    name,
    brand_id: brandId,
    brand_name: brandName,
    description,
    price,
    image_url: imageUrl,
    grams: displayQty.grams,
    display_quantity: displayQty.display_quantity,
    display_unit: displayQty.display_unit,
    calories,
    protein_g: proteinG,
    contents: String(formData.get("contents") ?? "").trim() || null,
    removable_ingredients: removableIngredients,
    add_ingredients: addIngredients,
    option_label: optionLabel || null,
    option_values: optionValues,
    ...stock,
    is_available: stock.track_stock ? stock.is_available! : true,
    sold_by_weight: soldByWeight,
    price_per_kg: soldByWeight ? pricePerKg : null,
    weight_step_kg: soldByWeight ? weightStepKg : 0.1,
  });

  if (error && isNutritionColumnMigrationError(error.message, error.code)) {
    const { error: retryError } = await supabase.from("menu_items").insert({
      restaurant_id: user.restaurant_id,
      category_id: categoryId,
      name,
      brand_id: brandId,
      brand_name: brandName,
      description,
      price,
      image_url: imageUrl,
      grams: displayQty.grams,
      display_quantity: displayQty.display_quantity,
      display_unit: displayQty.display_unit,
      contents: String(formData.get("contents") ?? "").trim() || null,
      removable_ingredients: removableIngredients,
      add_ingredients: addIngredients,
      option_label: optionLabel || null,
      option_values: optionValues,
      is_available: true,
      sold_by_weight: soldByWeight,
      price_per_kg: soldByWeight ? pricePerKg : null,
      weight_step_kg: soldByWeight ? weightStepKg : 0.1,
    });
    if (!retryError) {
      revalidatePath("/dashboard/business");
      redirect("/dashboard/business?toast=item_create_nutrition_migration");
    }
  }

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
  if (!id) {
    redirect("/dashboard/business?toast=item_update_invalid");
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const soldByWeight = String(formData.get("sold_by_weight") ?? "") === "true";
  const pricePerKgRaw = String(formData.get("price_per_kg") ?? "").trim();
  const weightStepRaw = String(formData.get("weight_step_kg") ?? "").trim();
  const pricePerKg = pricePerKgRaw ? Number(pricePerKgRaw) : null;
  const weightStepKg = weightStepRaw ? Number(weightStepRaw) : 0.1;
  const price = soldByWeight ? 0 : Number(formData.get("price") ?? 0);
  const categoryId = String(formData.get("category_id") ?? "");
  const currentImageUrl = String(formData.get("current_image_url") ?? "").trim();
  const imageFile = formData.get("image_file");
  const displayQty = soldByWeight
    ? { display_quantity: null, display_unit: "g" as const, grams: null }
    : parseDisplayQuantityFromForm(
        formData.get("display_quantity"),
        formData.get("display_unit"),
      );
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
  const stock = buildMenuItemStockPayload(formData);

  if (!name || !categoryId) {
    redirect("/dashboard/business?toast=item_update_invalid");
  }

  if (soldByWeight) {
    if (pricePerKg === null || !Number.isFinite(pricePerKg) || pricePerKg < 0) {
      redirect("/dashboard/business?toast=item_update_invalid");
    }
    if (!Number.isFinite(weightStepKg) || weightStepKg < 0.01) {
      redirect("/dashboard/business?toast=item_update_invalid");
    }
  } else if (!Number.isFinite(price) || price < 0) {
    redirect("/dashboard/business?toast=item_update_invalid");
  }

  let uploadedImageUrl: string | null = null;
  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      uploadedImageUrl = await uploadMenuItemImage(imageFile, user.restaurant_id);
    } catch (error) {
      console.error("[updateMenuItemAction] image upload", error);
      redirect("/dashboard/business?toast=item_update_failed");
    }
  }

  const supabase = await createServerSupabaseClient();
  const { brandId, brandName } = await resolveMenuBrandForItem(
    supabase,
    user.restaurant_id,
    String(formData.get("brand_id") ?? ""),
  );
  const calories = parseOptionalCalories(formData.get("calories"));
  const proteinG = parseOptionalProteinGrams(formData.get("protein_g"));

  const updatePayload = {
    name,
    brand_id: brandId,
    brand_name: brandName,
    description: description || null,
    price,
    category_id: categoryId,
    image_url: uploadedImageUrl ?? (currentImageUrl || null),
    grams: displayQty.grams,
    display_quantity: displayQty.display_quantity,
    display_unit: displayQty.display_unit,
    calories,
    protein_g: proteinG,
    contents: contents || null,
    removable_ingredients: removableIngredients,
    add_ingredients: addIngredients,
    option_label: optionLabel || null,
    option_values: optionValues,
    ...stock,
    ...(stock.track_stock ? { is_available: stock.is_available! } : {}),
    sold_by_weight: soldByWeight,
    price_per_kg: soldByWeight ? pricePerKg : null,
    weight_step_kg: soldByWeight ? weightStepKg : 0.1,
  };

  let { error } = await supabase
    .from("menu_items")
    .update(updatePayload)
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);

  if (error && isNutritionColumnMigrationError(error.message, error.code)) {
    const { calories: _c, protein_g: _p, ...payloadWithoutNutrition } = updatePayload;
    const retry = await supabase
      .from("menu_items")
      .update(payloadWithoutNutrition)
      .eq("id", id)
      .eq("restaurant_id", user.restaurant_id);
    if (!retry.error) {
      revalidatePath("/dashboard/business");
      redirect("/dashboard/business?toast=item_update_nutrition_migration");
    }
    error = retry.error;
  }

  if (error) {
    console.error("[updateMenuItemAction]", error.message, error.code, error.details);
    if (/brand_id|brand_name|menu_brands/i.test(error.message ?? "")) {
      redirect("/dashboard/business?toast=item_update_brand_migration");
    }
    redirect("/dashboard/business?toast=item_update_failed");
  }

  revalidatePath("/dashboard/business");
  redirect(`/dashboard/business?toast=item_updated&item_name=${encodeURIComponent(name)}`);
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

export type UpdateRestaurantSettingsResult =
  | { ok: true }
  | { ok: false; toast: string; message?: string };

export async function updateRestaurantSettingsAction(
  formData: FormData,
): Promise<UpdateRestaurantSettingsResult> {
  const user = await requireRestaurantAdmin();

  const browseValidated = validateBrowseSelectionFromForm(formData);
  if (!browseValidated.ok) {
    return { ok: false, toast: "browse_tags_required", message: browseValidated.error };
  }

  const lbpRateRaw = String(formData.get("lbp_rate") ?? "").trim();
  const lbpRate = Number(lbpRateRaw);
  if (!Number.isFinite(lbpRate) || lbpRate <= 0) {
    return { ok: false, toast: "invalid_lbp_rate" };
  }

  const deliveryFeeRaw = String(formData.get("delivery_fee_usd") ?? "").trim();
  const deliveryFeeUsd = Number(deliveryFeeRaw);
  if (!Number.isFinite(deliveryFeeUsd) || deliveryFeeUsd <= 0) {
    return { ok: false, toast: "invalid_delivery_fee" };
  }

  const fastDeliveryEnabled =
    formData.get("fast_delivery_enabled") === "true" || formData.get("fast_delivery_enabled") === "on";
  const fastDeliveryFeeRaw = String(formData.get("fast_delivery_fee_usd") ?? "").trim();
  let fastDeliveryFeeUsd = Number(fastDeliveryFeeRaw);
  if (fastDeliveryEnabled) {
    if (!Number.isFinite(fastDeliveryFeeUsd) || fastDeliveryFeeUsd <= 0) {
      return { ok: false, toast: "invalid_fast_delivery_fee" };
    }
  } else {
    fastDeliveryFeeUsd = Number.isFinite(fastDeliveryFeeUsd) && fastDeliveryFeeUsd > 0 ? fastDeliveryFeeUsd : 0;
  }

  const deliveryRadiusRaw = String(formData.get("delivery_radius_km") ?? "").trim();
  const deliveryRadiusParsed = Number(deliveryRadiusRaw);
  if (
    !deliveryRadiusRaw ||
    !Number.isFinite(deliveryRadiusParsed) ||
    deliveryRadiusParsed < MIN_RESTAURANT_DELIVERY_RADIUS_KM ||
    deliveryRadiusParsed > MAX_RESTAURANT_DELIVERY_RADIUS_KM
  ) {
    return { ok: false, toast: "invalid_delivery_radius" };
  }
  const deliveryRadiusKm = normalizeRestaurantDeliveryRadiusKm(deliveryRadiusParsed);

  const logoFile = formData.get("logo_file");
  const bannerFile = formData.get("banner_file");
  const currentLogoUrl = String(formData.get("current_logo_url") ?? "").trim();
  const currentBannerUrl = String(formData.get("current_banner_url") ?? "").trim();
  const uploadedLogoUrl =
    logoFile instanceof File && logoFile.size > 0
      ? await uploadRestaurantLogo(logoFile, user.restaurant_id)
      : null;
  const uploadedBannerUrl =
    bannerFile instanceof File && bannerFile.size > 0
      ? await uploadRestaurantBanner(bannerFile, user.restaurant_id)
      : null;
  const location = String(formData.get("location") ?? "").trim() || null;
  const eta_label = String(formData.get("eta_label") ?? "").trim() || null;
  const latRaw = String(formData.get("latitude") ?? "").trim();
  const lngRaw = String(formData.get("longitude") ?? "").trim();
  const latitude = latRaw && Number.isFinite(Number(latRaw)) ? Number(latRaw) : null;
  const longitude = lngRaw && Number.isFinite(Number(lngRaw)) ? Number(lngRaw) : null;
  const freeDelivery = formData.get("free_delivery") === "true" || formData.get("free_delivery") === "on";
  const allowGuestCheckout =
    formData.get("allow_guest_checkout") === "true" || formData.get("allow_guest_checkout") === "on";

  const supabase = await createServerSupabaseClient();
  const menuThemeColor = parseMenuThemeColor(formData.get("menu_theme_color"));
  const browseSelection = browseValidated.selection;
  const browseSections = normalizeBrowseSections(browseSelection);
  const businessType =
    browseSections.length > 0 ? inferBusinessTypeFromBrowseSections(browseSections) : null;

  const { data: restaurantRow, error: updateError } = await supabase
    .from("restaurants")
    .update({
      name: String(formData.get("name")),
      description: String(formData.get("description") ?? "").trim() || null,
      phone: String(formData.get("phone")),
      lbp_rate: Math.round(lbpRate * 100) / 100,
      browse_sections: browseSelection,
      ...(businessType ? { business_type: businessType } : {}),
      logo_url: uploadedLogoUrl ?? (currentLogoUrl || null),
      banner_url: uploadedBannerUrl ?? (currentBannerUrl || null),
      location,
      eta_label,
      latitude,
      longitude,
      free_delivery: freeDelivery,
      delivery_fee_usd: Math.round(deliveryFeeUsd * 100) / 100,
      fast_delivery_enabled: fastDeliveryEnabled,
      fast_delivery_fee_usd: Math.round(fastDeliveryFeeUsd * 100) / 100,
      delivery_radius_km: deliveryRadiusKm,
      menu_theme_color: menuThemeColor,
      allow_guest_checkout: allowGuestCheckout,
    })
    .eq("id", user.restaurant_id)
    .select("slug")
    .maybeSingle();

  if (updateError) {
    return { ok: false, toast: "settings_save_failed", message: updateError.message };
  }

  revalidatePath("/");
  if (restaurantRow?.slug) {
    revalidatePath(`/${restaurantRow.slug}`);
    revalidatePath(`/${restaurantRow.slug}/menu`);
  }
  return { ok: true };
}

function parseOpeningHoursFromForm(raw: string): Array<{ day: number; open: string; close: string; closed: boolean }> {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        const day = Number((row as { day?: unknown }).day);
        const open = String((row as { open?: unknown }).open ?? "").trim();
        const close = String((row as { close?: unknown }).close ?? "").trim();
        const closed = (row as { closed?: unknown }).closed === true;
        if (!Number.isInteger(day) || day < 0 || day > 6 || !open || !close) return null;
        return { day, open, close, closed };
      })
      .filter((row): row is { day: number; open: string; close: string; closed: boolean } => Boolean(row));
  } catch {
    return [];
  }
}

export async function updateRestaurantHoursAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const hours = parseOpeningHoursFromForm(String(formData.get("opening_hours") ?? ""));
  if (hours.length === 0) {
    redirect("/dashboard/business?toast=hours_invalid");
  }

  const supabase = await createServerSupabaseClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("slug")
    .eq("id", user.restaurant_id)
    .maybeSingle();

  await supabase
    .from("restaurants")
    .update({ opening_hours: hours })
    .eq("id", user.restaurant_id);

  revalidatePath("/dashboard/business");
  revalidatePath("/");
  revalidateTag("home-restaurants", "max");
  if (restaurant?.slug) revalidatePath(`/${restaurant.slug}`);
  redirect("/dashboard/business?toast=hours_saved");
}

export async function toggleTemporaryCloseAction(closed: boolean) {
  const user = await requireRestaurantAdmin();
  const supabase = await createServerSupabaseClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("slug")
    .eq("id", user.restaurant_id)
    .maybeSingle();

  await supabase
    .from("restaurants")
    .update({ is_temporarily_closed: closed })
    .eq("id", user.restaurant_id);

  revalidatePath("/dashboard/business");
  revalidatePath("/");
  revalidateTag("home-restaurants", "max");
  if (restaurant?.slug) revalidatePath(`/${restaurant.slug}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Restaurant locations (multi-branch)
// ─────────────────────────────────────────────────────────────────────────────

export type RestaurantLocationRow = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  phone: string | null;
  is_main: boolean;
  position: number;
};

export async function saveRestaurantLocationAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const supabase = await createServerSupabaseClient();

  const lat = Number(formData.get("latitude"));
  const lng = Number(formData.get("longitude"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    redirect("/dashboard/business?toast=location_invalid_coords");
  }

  const payload = {
    restaurant_id: user.restaurant_id,
    name: String(formData.get("name") ?? "Branch").trim() || "Branch",
    latitude: lat,
    longitude: lng,
    address: String(formData.get("address") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    is_main: formData.get("is_main") === "true",
    position: Number(formData.get("position") ?? 0),
  };

  const id = String(formData.get("id") ?? "").trim();

  if (id) {
    await supabase
      .from("restaurant_locations")
      .update(payload)
      .eq("id", id)
      .eq("restaurant_id", user.restaurant_id);
  } else {
    // If this is marked main, clear existing main flag
    if (payload.is_main) {
      await supabase
        .from("restaurant_locations")
        .update({ is_main: false })
        .eq("restaurant_id", user.restaurant_id);
    }
    await supabase.from("restaurant_locations").insert(payload);
  }

  const { data: savedBranches } = await supabase
    .from("restaurant_locations")
    .select("id, name, latitude, longitude, address, is_main, position")
    .eq("restaurant_id", user.restaurant_id)
    .order("position", { ascending: true });

  const branches = savedBranches ?? [];
  const savedBranch = id
    ? branches.find((branch) => branch.id === id)
    : branches.find((branch) => branch.is_main) ?? branches[branches.length - 1];

  if (savedBranch && (savedBranch.is_main || branches.length === 1)) {
    const locationLabel = deriveLocationLabelFromBranch(savedBranch);
    await supabase
      .from("restaurants")
      .update({
        latitude: lat,
        longitude: lng,
        ...(locationLabel ? { location: locationLabel } : {}),
      })
      .eq("id", user.restaurant_id);
  }

  revalidatePath("/dashboard/business");
  revalidatePath("/");
  redirect("/dashboard/business?toast=location_saved&jump=locations");
}

export async function deleteRestaurantLocationAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const supabase = await createServerSupabaseClient();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await supabase
    .from("restaurant_locations")
    .delete()
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);

  revalidatePath("/dashboard/business");
  revalidatePath("/");
  redirect("/dashboard/business?toast=location_deleted&jump=locations");
}

export async function setMainLocationAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const supabase = await createServerSupabaseClient();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await supabase
    .from("restaurant_locations")
    .update({ is_main: false })
    .eq("restaurant_id", user.restaurant_id);

  await supabase
    .from("restaurant_locations")
    .update({ is_main: true })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);

  revalidatePath("/dashboard/business");
  revalidatePath("/");
  redirect("/dashboard/business?jump=locations");
}


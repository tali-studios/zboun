"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PromotionScope } from "@/lib/menu-promotions";

async function requireRestaurantAdmin() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "restaurant_admin" || !user.restaurant_id) {
    redirect("/dashboard/login");
  }
  return user;
}

function parsePercentOff(raw: FormDataEntryValue | null): number | null {
  const value = Number(String(raw ?? "").trim());
  if (!Number.isFinite(value) || value <= 0 || value > 100) return null;
  return Math.round(value * 100) / 100;
}

function parseScopeType(raw: FormDataEntryValue | null): PromotionScope | null {
  const value = String(raw ?? "").trim();
  if (value === "store" || value === "category" || value === "brand" || value === "item") {
    return value;
  }
  return null;
}

function parseOptionalDate(raw: FormDataEntryValue | null): string | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function revalidateStorePaths(slug?: string | null) {
  revalidatePath("/dashboard/business");
  revalidatePath("/");
  if (slug) {
    revalidatePath(`/${slug}`);
    revalidatePath(`/${slug}/menu`);
  }
}

export async function createMenuPromotionAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const supabase = await createServerSupabaseClient();

  const scopeType = parseScopeType(formData.get("scope_type"));
  const percentOff = parsePercentOff(formData.get("percent_off"));
  const scopeIdRaw = String(formData.get("scope_id") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim() || null;
  const startsAt = parseOptionalDate(formData.get("starts_at"));
  const endsAt = parseOptionalDate(formData.get("ends_at"));
  const priority = Number(String(formData.get("priority") ?? "0").trim());
  const isActive = String(formData.get("is_active") ?? "true") !== "false";

  if (!scopeType || percentOff == null) {
    redirect("/dashboard/business?error=invalid_promotion");
  }

  const scopeId = scopeType === "store" ? null : scopeIdRaw || null;
  if (scopeType !== "store" && !scopeId) {
    redirect("/dashboard/business?error=invalid_promotion_scope");
  }

  const { error } = await supabase.from("menu_promotions").insert({
    restaurant_id: user.restaurant_id,
    scope_type: scopeType,
    scope_id: scopeId,
    percent_off: percentOff,
    label,
    starts_at: startsAt,
    ends_at: endsAt,
    priority: Number.isFinite(priority) ? Math.floor(priority) : 0,
    is_active: isActive,
  });

  if (error) {
    redirect("/dashboard/business?error=promotion_save_failed");
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("slug")
    .eq("id", user.restaurant_id)
    .maybeSingle();

  revalidateStorePaths(restaurant?.slug);
  redirect("/dashboard/business?toast=promotion_created&jump=promotions");
}

export async function toggleMenuPromotionAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const supabase = await createServerSupabaseClient();
  const id = String(formData.get("id") ?? "").trim();
  const isActive = String(formData.get("is_active") ?? "") === "true";
  if (!id) return;

  await supabase
    .from("menu_promotions")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("slug")
    .eq("id", user.restaurant_id)
    .maybeSingle();

  revalidateStorePaths(restaurant?.slug);
  redirect("/dashboard/business?toast=promotion_updated&jump=promotions");
}

export async function deleteMenuPromotionAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const supabase = await createServerSupabaseClient();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await supabase.from("menu_promotions").delete().eq("id", id).eq("restaurant_id", user.restaurant_id);

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("slug")
    .eq("id", user.restaurant_id)
    .maybeSingle();

  revalidateStorePaths(restaurant?.slug);
  redirect("/dashboard/business?toast=promotion_deleted&jump=promotions");
}

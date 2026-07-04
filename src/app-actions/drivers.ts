"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { canonicalDriverPhone, normalizeOptionalDriverPhone } from "@/lib/driver-phone";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export type RestaurantDriver = {
  id: string;
  restaurant_id: string;
  full_name: string;
  phone: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

async function requireRestaurantAdmin() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "restaurant_admin" || !user.restaurant_id) {
    redirect("/dashboard/login");
  }
  return user;
}

function revalidateDriverPaths() {
  revalidatePath("/dashboard/business");
  revalidatePath("/dashboard/business/drivers");
  revalidatePath("/dashboard/business/orders");
}

function cleanText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function parseDriverPhoneFromForm(formData: FormData) {
  const countryCode = cleanText(formData.get("country_code")) || "+961";
  return normalizeOptionalDriverPhone(cleanText(formData.get("phone")), countryCode);
}

async function restaurantHasDriverWithPhone(
  supabase: SupabaseClient,
  restaurantId: string,
  phone: string,
  excludeDriverId?: string,
) {
  const canonical = canonicalDriverPhone(phone);
  if (!canonical) return false;

  const { data: drivers } = await supabase
    .from("restaurant_drivers")
    .select("id, phone")
    .eq("restaurant_id", restaurantId)
    .not("phone", "is", null);

  return (drivers ?? []).some((driver) => {
    if (excludeDriverId && driver.id === excludeDriverId) return false;
    return canonicalDriverPhone(driver.phone) === canonical;
  });
}

export async function getRestaurantDrivers(restaurantId: string): Promise<RestaurantDriver[]> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("restaurant_drivers")
    .select("id, restaurant_id, full_name, phone, notes, is_active, created_at, updated_at")
    .eq("restaurant_id", restaurantId)
    .order("is_active", { ascending: false })
    .order("full_name", { ascending: true });

  return (data ?? []) as RestaurantDriver[];
}

export async function createRestaurantDriverAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const fullName = cleanText(formData.get("full_name"));
  if (!fullName) return;

  const phoneResult = parseDriverPhoneFromForm(formData);
  if (!phoneResult.ok) {
    redirect("/dashboard/business/drivers?error=invalid_phone");
  }

  const supabase = await createServerSupabaseClient();

  if (
    phoneResult.phone &&
    (await restaurantHasDriverWithPhone(supabase, user.restaurant_id, phoneResult.phone))
  ) {
    redirect("/dashboard/business/drivers?error=duplicate_phone");
  }

  await supabase.from("restaurant_drivers").insert({
    restaurant_id: user.restaurant_id,
    full_name: fullName,
    phone: phoneResult.phone,
    notes: cleanText(formData.get("notes")) || null,
    is_active: true,
  });

  revalidateDriverPaths();
}

export async function updateRestaurantDriverAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const id = cleanText(formData.get("id"));
  const fullName = cleanText(formData.get("full_name"));
  if (!id || !fullName) return;

  const phoneResult = parseDriverPhoneFromForm(formData);
  if (!phoneResult.ok) {
    redirect("/dashboard/business/drivers?error=invalid_phone");
  }

  const supabase = await createServerSupabaseClient();

  if (
    phoneResult.phone &&
    (await restaurantHasDriverWithPhone(supabase, user.restaurant_id, phoneResult.phone, id))
  ) {
    redirect("/dashboard/business/drivers?error=duplicate_phone");
  }

  const updatePayload: {
    full_name: string;
    phone: string | null;
    is_active: boolean;
    updated_at: string;
    notes?: string | null;
  } = {
    full_name: fullName,
    phone: phoneResult.phone,
    is_active: cleanText(formData.get("is_active")) !== "false",
    updated_at: new Date().toISOString(),
  };

  if (formData.has("notes")) {
    updatePayload.notes = cleanText(formData.get("notes")) || null;
  }

  await supabase
    .from("restaurant_drivers")
    .update(updatePayload)
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);

  revalidateDriverPaths();
}

export async function toggleRestaurantDriverAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const id = cleanText(formData.get("id"));
  const isActive = cleanText(formData.get("is_active")) === "true";
  if (!id) return;

  const supabase = await createServerSupabaseClient();
  await supabase
    .from("restaurant_drivers")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);

  revalidateDriverPaths();
}

export async function deleteRestaurantDriverAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const id = cleanText(formData.get("id"));
  if (!id) return;

  const supabase = await createServerSupabaseClient();
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", user.restaurant_id)
    .eq("driver_id", id);

  if ((count ?? 0) > 0) {
    await supabase
      .from("restaurant_drivers")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("restaurant_id", user.restaurant_id);
  } else {
    await supabase
      .from("restaurant_drivers")
      .delete()
      .eq("id", id)
      .eq("restaurant_id", user.restaurant_id);
  }

  revalidateDriverPaths();
}

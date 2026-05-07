"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseBusinessType } from "@/lib/business-types";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function requireRetailAccess() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "restaurant_admin" || !user.restaurant_id) {
    redirect("/dashboard/login");
  }
  const supabase = await createServerSupabaseClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("business_type")
    .eq("id", user.restaurant_id)
    .maybeSingle();
  if (parseBusinessType(restaurant?.business_type ?? "restaurant") !== "retail_store") {
    redirect("/dashboard/business");
  }
  return user;
}

function toNumber(raw: FormDataEntryValue | null): number {
  const value = Number(String(raw ?? "0"));
  return Number.isFinite(value) ? value : 0;
}

export async function markRetailDailyCloseAction(formData: FormData) {
  const user = await requireRetailAccess();
  const supabase = await createServerSupabaseClient();

  await supabase.from("retail_daily_closes").insert({
    restaurant_id: user.restaurant_id,
    closed_by: user.id,
    closed_by_name: user.name ?? "Admin",
    notes: String(formData.get("notes") ?? "").trim() || null,
    metrics_snapshot: {
      pos_open_orders: toNumber(formData.get("pos_open_orders")),
      ecommerce_active_orders: toNumber(formData.get("ecommerce_active_orders")),
      ecommerce_pending_orders: toNumber(formData.get("ecommerce_pending_orders")),
      inventory_low_stock: toNumber(formData.get("inventory_low_stock")),
      inventory_out_of_stock: toNumber(formData.get("inventory_out_of_stock")),
      revenue_today: toNumber(formData.get("revenue_today")),
      reactivation_pool: toNumber(formData.get("reactivation_pool")),
    },
  });

  revalidatePath("/dashboard/business/retail");
  revalidatePath("/dashboard/business");
}

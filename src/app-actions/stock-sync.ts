"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  generateApiKey,
  generateWebhookSecret,
  getOrCreateStockSyncSettings,
  type StockSyncPlatform,
} from "@/lib/stock-sync";

const STOCK_SYNC_PATH = "/dashboard/business/stock-sync";

async function requireRestaurantAdmin() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "restaurant_admin" || !user.restaurant_id) {
    redirect("/dashboard/login");
  }
  return user;
}

function parsePlatform(value: FormDataEntryValue | null): StockSyncPlatform {
  const raw = String(value ?? "").trim();
  return raw === "shopify" || raw === "woocommerce" ? raw : "custom";
}

export async function saveStockSyncSettingsAction(formData: FormData) {
  const user = await requireRestaurantAdmin();
  const supabase = await createServerSupabaseClient();
  await getOrCreateStockSyncSettings(supabase, user.restaurant_id);

  const platform = parsePlatform(formData.get("platform"));
  const outboundUrl = String(formData.get("outbound_webhook_url") ?? "").trim();
  const isEnabled = String(formData.get("is_enabled") ?? "") === "true";

  if (outboundUrl && !/^https:\/\//i.test(outboundUrl)) {
    redirect(`${STOCK_SYNC_PATH}?toast=stock_sync_invalid_url`);
  }

  const { error } = await supabase
    .from("restaurant_stock_sync")
    .update({
      platform,
      outbound_webhook_url: outboundUrl || null,
      is_enabled: isEnabled,
    })
    .eq("restaurant_id", user.restaurant_id);

  if (error) {
    redirect(`${STOCK_SYNC_PATH}?toast=stock_sync_error`);
  }

  revalidatePath(STOCK_SYNC_PATH);
  redirect(`${STOCK_SYNC_PATH}?toast=stock_sync_saved`);
}

export async function regenerateInboundApiKeyAction() {
  const user = await requireRestaurantAdmin();
  const supabase = await createServerSupabaseClient();
  await getOrCreateStockSyncSettings(supabase, user.restaurant_id);

  await supabase
    .from("restaurant_stock_sync")
    .update({ inbound_api_key: generateApiKey() })
    .eq("restaurant_id", user.restaurant_id);

  revalidatePath(STOCK_SYNC_PATH);
  redirect(`${STOCK_SYNC_PATH}?toast=stock_sync_key_rotated`);
}

export async function regenerateOutboundSecretAction() {
  const user = await requireRestaurantAdmin();
  const supabase = await createServerSupabaseClient();
  await getOrCreateStockSyncSettings(supabase, user.restaurant_id);

  await supabase
    .from("restaurant_stock_sync")
    .update({ outbound_secret: generateWebhookSecret() })
    .eq("restaurant_id", user.restaurant_id);

  revalidatePath(STOCK_SYNC_PATH);
  redirect(`${STOCK_SYNC_PATH}?toast=stock_sync_secret_rotated`);
}

export async function updateMenuItemExternalSkuAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireRestaurantAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const sku = String(formData.get("external_sku") ?? "").trim();
  if (!id) return { ok: false, error: "Item not found." };

  const supabase = await createServerSupabaseClient();

  if (sku) {
    const { data: conflict } = await supabase
      .from("menu_items")
      .select("id")
      .eq("restaurant_id", user.restaurant_id)
      .eq("external_sku", sku)
      .neq("id", id)
      .maybeSingle();
    if (conflict) {
      return { ok: false, error: `SKU "${sku}" is already mapped to another item.` };
    }
  }

  const { error } = await supabase
    .from("menu_items")
    .update({ external_sku: sku || null })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);

  if (error) return { ok: false, error: error.message };

  revalidatePath(STOCK_SYNC_PATH);
  revalidatePath("/dashboard/business/menu-items");
  return { ok: true };
}

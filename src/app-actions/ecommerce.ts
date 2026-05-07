"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function requireEcommerceAccess() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "restaurant_admin" || !user.restaurant_id) redirect("/dashboard/login");
  const supabase = await createServerSupabaseClient();
  const { data: addon } = await supabase
    .from("restaurant_addons").select("is_enabled")
    .eq("restaurant_id", user.restaurant_id).eq("addon_key", "ecommerce").maybeSingle();
  if (!addon?.is_enabled) redirect("/dashboard/business");
  return user;
}

function revalidate() {
  revalidatePath("/dashboard/business/ecommerce");
  revalidatePath("/dashboard/business");
}

async function nextOrderNumber(restaurantId: string) {
  const supabase = await createServerSupabaseClient();
  const year = new Date().getFullYear();
  const { data: existing } = await supabase
    .from("restaurant_receipt_sequences").select("id, last_number")
    .eq("restaurant_id", restaurantId).eq("prefix", "ECO").eq("seq_year", year).maybeSingle();
  if (existing) {
    const next = existing.last_number + 1;
    await supabase.from("restaurant_receipt_sequences")
      .update({ last_number: next, updated_at: new Date().toISOString() }).eq("id", existing.id);
    return `ECO-${year}-${String(next).padStart(6, "0")}`;
  }
  await supabase.from("restaurant_receipt_sequences").insert({
    restaurant_id: restaurantId, prefix: "ECO", seq_year: year, last_number: 1, updated_at: new Date().toISOString(),
  });
  return `ECO-${year}-000001`;
}

// ─── Store settings ───────────────────────────────────────────────────────────

export async function upsertStoreAction(formData: FormData) {
  const user = await requireEcommerceAccess();
  const supabase = await createServerSupabaseClient();
  const payload = {
    restaurant_id: user.restaurant_id,
    store_name: String(formData.get("store_name") ?? "").trim(),
    tagline: String(formData.get("tagline") ?? "").trim() || null,
    is_open: formData.get("is_open") !== "false",
    delivery_enabled: formData.get("delivery_enabled") === "true",
    pickup_enabled: formData.get("pickup_enabled") === "true",
    min_order_amount: parseFloat(String(formData.get("min_order_amount") ?? "0")) || 0,
    base_delivery_fee: parseFloat(String(formData.get("base_delivery_fee") ?? "0")) || 0,
    estimated_delivery_mins: parseInt(String(formData.get("estimated_delivery_mins") ?? "45"), 10) || 45,
    estimated_pickup_mins: parseInt(String(formData.get("estimated_pickup_mins") ?? "20"), 10) || 20,
    accepts_cash: formData.get("accepts_cash") === "true",
    accepts_card: formData.get("accepts_card") === "true",
    accepts_online: formData.get("accepts_online") === "true",
    tax_rate: parseFloat(String(formData.get("tax_rate") ?? "0")) || 0,
    operating_hours: String(formData.get("operating_hours") ?? "").trim() || null,
    closed_message: String(formData.get("closed_message") ?? "").trim() || null,
    updated_at: new Date().toISOString(),
  };
  const { data: existing } = await supabase.from("ecommerce_stores").select("id")
    .eq("restaurant_id", user.restaurant_id).maybeSingle();
  if (existing) {
    await supabase.from("ecommerce_stores").update(payload).eq("restaurant_id", user.restaurant_id);
  } else {
    await supabase.from("ecommerce_stores").insert(payload);
  }
  revalidate();
}

export async function toggleStoreOpenAction(formData: FormData) {
  const user = await requireEcommerceAccess();
  const isOpen = formData.get("is_open") === "true";
  const supabase = await createServerSupabaseClient();
  await supabase.from("ecommerce_stores").update({ is_open: !isOpen, updated_at: new Date().toISOString() })
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

// ─── Delivery zones ───────────────────────────────────────────────────────────

export async function createZoneAction(formData: FormData) {
  const user = await requireEcommerceAccess();
  const supabase = await createServerSupabaseClient();
  await supabase.from("ecommerce_delivery_zones").insert({
    restaurant_id: user.restaurant_id,
    zone_name: String(formData.get("zone_name") ?? "").trim(),
    delivery_fee: parseFloat(String(formData.get("delivery_fee") ?? "0")) || 0,
    min_order: parseFloat(String(formData.get("min_order") ?? "0")) || 0,
    est_mins: parseInt(String(formData.get("est_mins") ?? "45"), 10) || 45,
    is_active: true,
  });
  revalidate();
}

export async function deleteZoneAction(formData: FormData) {
  const user = await requireEcommerceAccess();
  const supabase = await createServerSupabaseClient();
  await supabase.from("ecommerce_delivery_zones").delete()
    .eq("id", String(formData.get("id") ?? "")).eq("restaurant_id", user.restaurant_id);
  revalidate();
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function createOnlineOrderAction(formData: FormData) {
  const user = await requireEcommerceAccess();
  const supabase = await createServerSupabaseClient();

  let items: Array<{ menu_item_id: string; item_name: string; quantity: number; unit_price: number; special_request?: string }> = [];
  try { items = JSON.parse(String(formData.get("items_json") ?? "[]")); } catch { items = []; }

  const store = await supabase.from("ecommerce_stores").select("tax_rate")
    .eq("restaurant_id", user.restaurant_id).maybeSingle();
  const taxRate = Number(store.data?.tax_rate ?? 0);
  const deliveryFee = parseFloat(String(formData.get("delivery_fee") ?? "0")) || 0;
  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const taxAmount = parseFloat((subtotal * taxRate).toFixed(2));
  const totalAmount = parseFloat((subtotal + deliveryFee + taxAmount).toFixed(2));
  const orderNumber = await nextOrderNumber(user.restaurant_id!);

  const { data: order } = await supabase.from("ecommerce_orders").insert({
    restaurant_id: user.restaurant_id,
    order_number: orderNumber,
    customer_name: String(formData.get("customer_name") ?? "").trim(),
    customer_phone: String(formData.get("customer_phone") ?? "").trim(),
    customer_email: String(formData.get("customer_email") ?? "").trim() || null,
    delivery_address: String(formData.get("delivery_address") ?? "").trim() || null,
    delivery_zone_id: String(formData.get("delivery_zone_id") ?? "").trim() || null,
    fulfilment_type: String(formData.get("fulfilment_type") ?? "delivery"),
    payment_method: String(formData.get("payment_method") ?? "cash"),
    subtotal, delivery_fee: deliveryFee, tax_amount: taxAmount, total_amount: totalAmount,
    notes: String(formData.get("notes") ?? "").trim() || null,
    crm_customer_id: String(formData.get("crm_customer_id") ?? "").trim() || null,
  }).select("id").single();

  if (order && items.length > 0) {
    await supabase.from("ecommerce_order_items").insert(
      items.map((i) => ({
        order_id: order.id, restaurant_id: user.restaurant_id,
        menu_item_id: i.menu_item_id || null,
        item_name: i.item_name, quantity: i.quantity,
        unit_price: i.unit_price, line_total: i.unit_price * i.quantity,
        special_request: i.special_request || null,
      }))
    );
  }
  revalidate();
}

export async function updateOrderStatusAction(formData: FormData) {
  const user = await requireEcommerceAccess();
  const supabase = await createServerSupabaseClient();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const extra: Record<string, string | null> = {};
  if (status === "confirmed") extra.confirmed_at = new Date().toISOString();
  if (status === "delivered") extra.delivered_at = new Date().toISOString();
  await supabase.from("ecommerce_orders").update({ status, ...extra, updated_at: new Date().toISOString() })
    .eq("id", id).eq("restaurant_id", user.restaurant_id);
  revalidate();
}

export async function markOrderPaidAction(formData: FormData) {
  const user = await requireEcommerceAccess();
  const supabase = await createServerSupabaseClient();
  await supabase.from("ecommerce_orders")
    .update({ payment_status: "paid", updated_at: new Date().toISOString() })
    .eq("id", String(formData.get("id") ?? "")).eq("restaurant_id", user.restaurant_id);
  revalidate();
}

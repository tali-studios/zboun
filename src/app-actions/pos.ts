"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CartItemInput = {
  menu_item_id: string | null;
  item_name: string;
  qty: number;
  unit_price: number;
};

async function requirePosAccess() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "restaurant_admin" || !user.restaurant_id) {
    redirect("/dashboard/login");
  }
  const supabase = await createServerSupabaseClient();
  const { data: addon } = await supabase
    .from("restaurant_addons")
    .select("is_enabled")
    .eq("restaurant_id", user.restaurant_id)
    .eq("addon_key", "pos")
    .maybeSingle();
  if (!addon?.is_enabled) {
    redirect("/dashboard/business");
  }
  return user;
}

async function nextPosReceiptNumber(restaurantId: string) {
  const supabase = await createServerSupabaseClient();
  const year = new Date().getFullYear();
  const { data: existing } = await supabase
    .from("restaurant_receipt_sequences")
    .select("id, last_number")
    .eq("restaurant_id", restaurantId)
    .eq("prefix", "POS")
    .eq("seq_year", year)
    .maybeSingle();

  if (!existing) {
    const { data: inserted } = await supabase
      .from("restaurant_receipt_sequences")
      .insert({
        restaurant_id: restaurantId,
        prefix: "POS",
        seq_year: year,
        last_number: 1,
        updated_at: new Date().toISOString(),
      })
      .select("last_number")
      .single();
    return `POS-${year}-${String(Number(inserted?.last_number ?? 1)).padStart(6, "0")}`;
  }

  const next = Number(existing.last_number ?? 0) + 1;
  await supabase
    .from("restaurant_receipt_sequences")
    .update({ last_number: next, updated_at: new Date().toISOString() })
    .eq("id", existing.id);
  return `POS-${year}-${String(next).padStart(6, "0")}`;
}

function revalidate() {
  revalidatePath("/dashboard/business/pos");
  revalidatePath("/dashboard/business/pos/receipts");
  revalidatePath("/dashboard/business");
}

export async function createPosOrderAction(formData: FormData) {
  const user = await requirePosAccess();
  const supabase = await createServerSupabaseClient();
  const itemsRaw = String(formData.get("items_json") ?? "[]");
  const orderType = String(formData.get("order_type") ?? "dine_in");
  const paymentMethod = String(formData.get("payment_method") ?? "cash");
  const note = String(formData.get("note") ?? "").trim() || null;

  let items: CartItemInput[] = [];
  try {
    const parsed = JSON.parse(itemsRaw);
    if (Array.isArray(parsed)) {
      items = parsed
        .map((row) => ({
          menu_item_id: row?.menu_item_id ? String(row.menu_item_id) : null,
          item_name: String(row?.item_name ?? "").trim(),
          qty: Number(row?.qty ?? 0),
          unit_price: Number(row?.unit_price ?? 0),
        }))
        .filter((row) => row.item_name && Number.isFinite(row.qty) && row.qty > 0);
    }
  } catch {
    items = [];
  }
  if (!items.length) return;

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.unit_price, 0);
  const taxAmount = subtotal * 0.11;
  const totalAmount = subtotal + taxAmount;
  const paidAmountRaw = Number(formData.get("paid_amount") ?? totalAmount);
  const paidAmount = Number.isFinite(paidAmountRaw) && paidAmountRaw > 0 ? paidAmountRaw : totalAmount;
  const status = paidAmount + 0.0001 >= totalAmount ? "paid" : "open";
  const receiptNumber = await nextPosReceiptNumber(user.restaurant_id);

  const { data: order } = await supabase
    .from("pos_orders")
    .insert({
      restaurant_id: user.restaurant_id,
      order_type: orderType,
      status,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      receipt_number: receiptNumber,
      note,
      created_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (!order) return;

  await supabase.from("pos_order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      restaurant_id: user.restaurant_id,
      menu_item_id: item.menu_item_id,
      item_name: item.item_name,
      qty: item.qty,
      unit_price: item.unit_price,
      line_total: item.qty * item.unit_price,
    })),
  );

  await supabase.from("pos_payments").insert({
    order_id: order.id,
    restaurant_id: user.restaurant_id,
    method: paymentMethod,
    amount: paidAmount,
    recorded_by: user.id,
  });

  revalidate();
}

export async function updatePosOrderStatusAction(formData: FormData) {
  const user = await requirePosAccess();
  const orderId = String(formData.get("order_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!orderId || !["open", "paid", "void"].includes(status)) return;
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("pos_orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

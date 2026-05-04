"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function requireInventoryAccess() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "restaurant_admin" || !user.restaurant_id) {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const { data: addon } = await supabase
    .from("restaurant_addons")
    .select("is_enabled")
    .eq("restaurant_id", user.restaurant_id)
    .eq("addon_key", "inventory")
    .maybeSingle();

  if (!addon?.is_enabled) {
    redirect("/dashboard/restaurant");
  }

  return user;
}

function revalidate() {
  revalidatePath("/dashboard/restaurant/inventory");
}

// ─────────────────────────────────────────────────────────────────────────────
// Suppliers
// ─────────────────────────────────────────────────────────────────────────────

export async function createSupplierAction(formData: FormData) {
  const user = await requireInventoryAccess();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("suppliers").insert({
    restaurant_id: user.restaurant_id,
    name,
    contact_name: String(formData.get("contact_name") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });
  if (error) {
    redirect(`/dashboard/restaurant/inventory?error=${encodeURIComponent(error.message)}`);
  }
  revalidate();
}

export async function updateSupplierAction(formData: FormData) {
  const user = await requireInventoryAccess();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;

  const supabase = await createServerSupabaseClient();
  await supabase
    .from("suppliers")
    .update({
      name,
      contact_name: String(formData.get("contact_name") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

export async function deleteSupplierAction(formData: FormData) {
  const user = await requireInventoryAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const supabase = await createServerSupabaseClient();
  await supabase
    .from("suppliers")
    .delete()
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

// ─────────────────────────────────────────────────────────────────────────────
// Inventory items
// ─────────────────────────────────────────────────────────────────────────────

export async function createInventoryItemAction(formData: FormData) {
  const user = await requireInventoryAccess();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const unit = String(formData.get("unit") ?? "pieces").trim() || "pieces";
  const minQty = Math.max(0, Number(formData.get("min_qty") ?? 0) || 0);
  const costPerUnit = Math.max(0, Number(formData.get("cost_per_unit") ?? 0) || 0);
  const supplierId = String(formData.get("supplier_id") ?? "").trim() || null;
  const initialQty = Number(formData.get("initial_qty") ?? 0) || 0;

  const supabase = await createServerSupabaseClient();
  const { data: item, error } = await supabase
    .from("inventory_items")
    .insert({
      restaurant_id: user.restaurant_id,
      supplier_id: supplierId,
      name,
      sku: String(formData.get("sku") ?? "").trim() || null,
      unit,
      current_qty: 0,
      min_qty: minQty,
      cost_per_unit: costPerUnit,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/dashboard/restaurant/inventory?error=${encodeURIComponent(error.message)}`);
  }

  if (initialQty !== 0 && item) {
    await supabase.from("inventory_movements").insert({
      restaurant_id: user.restaurant_id,
      item_id: item.id,
      movement_type: "purchase",
      qty: initialQty,
      unit_cost: costPerUnit || null,
      reference: "Initial stock",
      created_by: user.id,
    });
  }

  revalidate();
}

export async function updateInventoryItemAction(formData: FormData) {
  const user = await requireInventoryAccess();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;

  const supabase = await createServerSupabaseClient();
  await supabase
    .from("inventory_items")
    .update({
      supplier_id: String(formData.get("supplier_id") ?? "").trim() || null,
      name,
      sku: String(formData.get("sku") ?? "").trim() || null,
      unit: String(formData.get("unit") ?? "pieces").trim() || "pieces",
      min_qty: Math.max(0, Number(formData.get("min_qty") ?? 0) || 0),
      cost_per_unit: Math.max(0, Number(formData.get("cost_per_unit") ?? 0) || 0),
      notes: String(formData.get("notes") ?? "").trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

export async function deleteInventoryItemAction(formData: FormData) {
  const user = await requireInventoryAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const supabase = await createServerSupabaseClient();
  await supabase
    .from("inventory_items")
    .delete()
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

// ─────────────────────────────────────────────────────────────────────────────
// Stock movements
// ─────────────────────────────────────────────────────────────────────────────

export async function recordMovementAction(formData: FormData) {
  const user = await requireInventoryAccess();
  const itemId = String(formData.get("item_id") ?? "").trim();
  const movementType = String(formData.get("movement_type") ?? "").trim();
  const qtyRaw = Number(formData.get("qty") ?? 0);
  const allowed = new Set(["purchase", "consume", "waste", "adjustment"]);

  if (!itemId || !allowed.has(movementType) || !Number.isFinite(qtyRaw) || qtyRaw === 0) {
    redirect("/dashboard/restaurant/inventory?error=invalid_movement");
  }

  // consume and waste are always outgoing (negative)
  const isOutgoing = movementType === "consume" || movementType === "waste";
  const qty = isOutgoing ? -Math.abs(qtyRaw) : qtyRaw;

  const unitCostRaw = Number(formData.get("unit_cost") ?? 0);
  const unitCost = Number.isFinite(unitCostRaw) && unitCostRaw > 0 ? unitCostRaw : null;

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("inventory_movements").insert({
    restaurant_id: user.restaurant_id,
    item_id: itemId,
    movement_type: movementType,
    qty,
    unit_cost: unitCost,
    reference: String(formData.get("reference") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    created_by: user.id,
  });

  if (error) {
    redirect(`/dashboard/restaurant/inventory?error=${encodeURIComponent(error.message)}`);
  }
  revalidate();
}

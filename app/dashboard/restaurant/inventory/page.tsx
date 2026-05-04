import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { InventoryPanel } from "@/components/inventory-panel";
import {
  createInventoryItemAction,
  createSupplierAction,
  deleteInventoryItemAction,
  deleteSupplierAction,
  recordMovementAction,
  updateInventoryItemAction,
  updateSupplierAction,
} from "@/app-actions/inventory";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
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

  const [
    { data: restaurant },
    { data: suppliers },
    { data: items },
    { data: movements },
  ] = await Promise.all([
    supabase
      .from("restaurants")
      .select("name, slug")
      .eq("id", user.restaurant_id)
      .single(),
    supabase
      .from("suppliers")
      .select("id, name, contact_name, phone, email, notes, created_at")
      .eq("restaurant_id", user.restaurant_id)
      .order("name"),
    supabase
      .from("inventory_items")
      .select("id, name, sku, unit, current_qty, min_qty, cost_per_unit, notes, supplier_id, created_at, updated_at")
      .eq("restaurant_id", user.restaurant_id)
      .order("name"),
    supabase
      .from("inventory_movements")
      .select("id, item_id, movement_type, qty, unit_cost, reference, notes, created_at")
      .eq("restaurant_id", user.restaurant_id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  return (
    <InventoryPanel
      restaurantName={restaurant?.name ?? ""}
      restaurantSlug={restaurant?.slug ?? ""}
      suppliers={suppliers ?? []}
      items={items ?? []}
      movements={movements ?? []}
      createSupplierAction={createSupplierAction}
      updateSupplierAction={updateSupplierAction}
      deleteSupplierAction={deleteSupplierAction}
      createInventoryItemAction={createInventoryItemAction}
      updateInventoryItemAction={updateInventoryItemAction}
      deleteInventoryItemAction={deleteInventoryItemAction}
      recordMovementAction={recordMovementAction}
    />
  );
}

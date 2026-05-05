import { redirect } from "next/navigation";
import { createPosOrderAction, updatePosOrderStatusAction } from "@/app-actions/pos";
import { PosPanel } from "@/components/pos-panel";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PosPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const { data: addon } = await supabase
    .from("restaurant_addons")
    .select("is_enabled")
    .eq("restaurant_id", appUser.restaurant_id)
    .eq("addon_key", "pos")
    .maybeSingle();
  if (!addon?.is_enabled) {
    redirect("/dashboard/restaurant");
  }

  const [{ data: restaurant }, { data: menuItems }, { data: orders }, { data: orderItems }] = await Promise.all([
    supabase.from("restaurants").select("name, slug").eq("id", appUser.restaurant_id).single(),
    supabase
      .from("menu_items")
      .select("id, name, price, is_available")
      .eq("restaurant_id", appUser.restaurant_id)
      .eq("is_available", true)
      .order("name"),
    supabase
      .from("pos_orders")
      .select("id, receipt_number, order_type, status, subtotal, tax_amount, total_amount, paid_amount, note, created_at")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("pos_order_items")
      .select("id, order_id, item_name, qty, unit_price, line_total")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  return (
    <PosPanel
      restaurantName={restaurant?.name ?? ""}
      menuItems={menuItems ?? []}
      orders={orders ?? []}
      orderItems={orderItems ?? []}
      createPosOrderAction={createPosOrderAction}
      updatePosOrderStatusAction={updatePosOrderStatusAction}
    />
  );
}

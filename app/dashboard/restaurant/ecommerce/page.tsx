import { redirect } from "next/navigation";
import {
  upsertStoreAction, toggleStoreOpenAction,
  createZoneAction, deleteZoneAction,
  createOnlineOrderAction, updateOrderStatusAction, markOrderPaidAction,
} from "@/app-actions/ecommerce";
import { EcommercePanel } from "@/components/ecommerce-panel";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EcommercePage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) redirect("/dashboard/login");
  const supabase = await createServerSupabaseClient();
  const { data: addon } = await supabase.from("restaurant_addons").select("is_enabled")
    .eq("restaurant_id", appUser.restaurant_id).eq("addon_key", "ecommerce").maybeSingle();
  if (!addon?.is_enabled) redirect("/dashboard/restaurant");

  const [
    { data: restaurant }, { data: store }, { data: zones },
    { data: orders }, { data: orderItems }, { data: menuItems }, { data: crmCustomers },
  ] = await Promise.all([
    supabase.from("restaurants").select("name, slug, logo_url").eq("id", appUser.restaurant_id).single(),
    supabase.from("ecommerce_stores").select("*").eq("restaurant_id", appUser.restaurant_id).maybeSingle(),
    supabase.from("ecommerce_delivery_zones").select("*").eq("restaurant_id", appUser.restaurant_id).order("zone_name"),
    supabase.from("ecommerce_orders")
      .select("id, order_number, customer_name, customer_phone, customer_email, delivery_address, delivery_zone_id, fulfilment_type, status, payment_method, payment_status, subtotal, delivery_fee, tax_amount, total_amount, notes, crm_customer_id, confirmed_at, delivered_at, created_at, updated_at")
      .eq("restaurant_id", appUser.restaurant_id).order("created_at", { ascending: false }).limit(200),
    supabase.from("ecommerce_order_items")
      .select("id, order_id, item_name, quantity, unit_price, line_total, special_request")
      .eq("restaurant_id", appUser.restaurant_id).limit(1000),
    supabase.from("menu_items").select("id, name, price, is_available")
      .eq("restaurant_id", appUser.restaurant_id).eq("is_available", true).order("name"),
    supabase.from("crm_customers").select("id, full_name, phone").eq("restaurant_id", appUser.restaurant_id).order("full_name"),
  ]);

  return (
    <EcommercePanel
      restaurantName={restaurant?.name ?? ""}
      restaurantSlug={restaurant?.slug ?? ""}
      store={store}
      zones={zones ?? []}
      orders={orders ?? []}
      orderItems={orderItems ?? []}
      menuItems={menuItems ?? []}
      crmCustomers={crmCustomers ?? []}
      upsertStoreAction={upsertStoreAction}
      toggleStoreOpenAction={toggleStoreOpenAction}
      createZoneAction={createZoneAction}
      deleteZoneAction={deleteZoneAction}
      createOnlineOrderAction={createOnlineOrderAction}
      updateOrderStatusAction={updateOrderStatusAction}
      markOrderPaidAction={markOrderPaidAction}
    />
  );
}

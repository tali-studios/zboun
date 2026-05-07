import { redirect } from "next/navigation";
import { markRetailDailyCloseAction } from "@/app-actions/retail";
import { RetailOpsPanel } from "@/components/retail-ops-panel";
import { parseBusinessType } from "@/lib/business-types";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function RetailOpsPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const [
    { data: restaurant },
    { data: inventoryAddon },
    { data: posAddon },
    { data: ecommerceAddon },
    { data: crmAddon },
    { data: loyaltyAddon },
    { data: inventoryItems },
    { data: posOrders },
    { data: ecommerceOrders },
    { data: crmCustomers },
    { data: loyaltyMembers },
    { data: dailyCloses },
  ] = await Promise.all([
    supabase.from("restaurants").select("name, business_type").eq("id", appUser.restaurant_id).single(),
    supabase.from("restaurant_addons").select("is_enabled").eq("restaurant_id", appUser.restaurant_id).eq("addon_key", "inventory").maybeSingle(),
    supabase.from("restaurant_addons").select("is_enabled").eq("restaurant_id", appUser.restaurant_id).eq("addon_key", "pos").maybeSingle(),
    supabase.from("restaurant_addons").select("is_enabled").eq("restaurant_id", appUser.restaurant_id).eq("addon_key", "ecommerce").maybeSingle(),
    supabase.from("restaurant_addons").select("is_enabled").eq("restaurant_id", appUser.restaurant_id).eq("addon_key", "crm").maybeSingle(),
    supabase.from("restaurant_addons").select("is_enabled").eq("restaurant_id", appUser.restaurant_id).eq("addon_key", "loyalty").maybeSingle(),
    supabase.from("inventory_items").select("id, name, current_qty, min_qty").eq("restaurant_id", appUser.restaurant_id).order("name"),
    supabase.from("pos_orders").select("id, status, total_amount, created_at").eq("restaurant_id", appUser.restaurant_id).order("created_at", { ascending: false }).limit(400),
    supabase
      .from("ecommerce_orders")
      .select("id, status, total_amount, created_at")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("created_at", { ascending: false })
      .limit(400),
    supabase.from("crm_customers").select("id, is_vip, total_spend, last_visit_at").eq("restaurant_id", appUser.restaurant_id),
    supabase
      .from("loyalty_members")
      .select("id, is_active, tier, points_balance, last_activity_at")
      .eq("restaurant_id", appUser.restaurant_id)
      .limit(1000),
    supabase
      .from("retail_daily_closes")
      .select("id, closed_at, closed_by_name, notes, metrics_snapshot")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("closed_at", { ascending: false })
      .limit(20),
  ]);

  const businessType = parseBusinessType(restaurant?.business_type ?? "restaurant");
  if (businessType !== "retail_store") {
    redirect("/dashboard/business");
  }

  const moduleEnabledCount = [inventoryAddon, posAddon, ecommerceAddon, crmAddon, loyaltyAddon].filter((addon) => addon?.is_enabled).length;
  if (moduleEnabledCount === 0) {
    redirect("/dashboard/business");
  }

  const posOpenOrders = (posAddon?.is_enabled ? posOrders ?? [] : []).filter((order) => order.status === "open");
  const ecommerceActiveOrders = (ecommerceAddon?.is_enabled ? ecommerceOrders ?? [] : []).filter(
    (order) => !["delivered", "cancelled"].includes(order.status),
  );
  const ecommercePendingOrders = ecommerceActiveOrders.filter((order) => order.status === "pending");

  const inventoryRows = inventoryAddon?.is_enabled ? inventoryItems ?? [] : [];
  const inventoryLowStock = inventoryRows.filter((item) => Number(item.current_qty) < Number(item.min_qty));
  const inventoryOutOfStock = inventoryRows.filter((item) => Number(item.current_qty) <= 0);
  const stockRiskItems = inventoryLowStock
    .sort((a, b) => Number(a.current_qty) - Number(b.current_qty))
    .slice(0, 8)
    .map((item) => ({
      id: item.id,
      name: item.name,
      currentQty: Number(item.current_qty),
      minQty: Number(item.min_qty),
    }));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const posTodayRevenue = posOpenOrders
    .filter((order) => new Date(order.created_at) >= today)
    .reduce((sum, order) => sum + Number(order.total_amount), 0);
  const ecommerceTodayRevenue = ecommerceActiveOrders
    .filter((order) => new Date(order.created_at) >= today)
    .reduce((sum, order) => sum + Number(order.total_amount), 0);
  const todayRetailRevenue = posTodayRevenue + ecommerceTodayRevenue;

  const activeOrderCount = posOpenOrders.length + ecommerceActiveOrders.length;
  const avgOrderValue = activeOrderCount > 0 ? (posOpenOrders.reduce((sum, o) => sum + Number(o.total_amount), 0) + ecommerceActiveOrders.reduce((sum, o) => sum + Number(o.total_amount), 0)) / activeOrderCount : 0;
  const channelMixOnlineShare = activeOrderCount > 0 ? Math.round((ecommerceActiveOrders.length / activeOrderCount) * 100) : 0;

  const crmRows = crmAddon?.is_enabled ? crmCustomers ?? [] : [];
  const loyaltyRows = loyaltyAddon?.is_enabled ? loyaltyMembers ?? [] : [];
  const nowMs = Date.now();
  const reactivationPool = crmRows.filter((customer) => {
    if (!customer.last_visit_at) return true;
    const diffDays = Math.floor((nowMs - new Date(customer.last_visit_at).getTime()) / 86400000);
    return diffDays >= 30;
  }).length;
  const vipCustomers = crmRows.filter((customer) => customer.is_vip).length;
  const activeLoyaltyMembers = loyaltyRows.filter((member) => member.is_active).length;
  const premiumTierMembers = loyaltyRows.filter((member) => member.is_active && member.tier !== "standard").length;
  const totalCustomerValue = crmRows.reduce((sum, customer) => sum + Number(customer.total_spend ?? 0), 0);
  const staleLoyaltyMembers = loyaltyRows.filter((member) => {
    if (!member.last_activity_at) return true;
    const diffDays = Math.floor((nowMs - new Date(member.last_activity_at).getTime()) / 86400000);
    return diffDays >= 30;
  }).length;
  const reorderList = stockRiskItems.slice(0, 6).map((item) => {
    const targetQty = Math.max(item.minQty * 2, item.minQty + 5);
    return {
      itemName: item.name,
      currentQty: item.currentQty,
      targetQty,
      suggestedReorderQty: Math.max(0, targetQty - item.currentQty),
    };
  });
  const paymentPendingCount = ecommercePendingOrders.length + posOpenOrders.length;

  return (
    <RetailOpsPanel
      businessName={restaurant?.name ?? ""}
      posOpenOrders={posOpenOrders.length}
      ecommerceActiveOrders={ecommerceActiveOrders.length}
      ecommercePendingOrders={ecommercePendingOrders.length}
      inventoryLowStock={inventoryLowStock.length}
      inventoryOutOfStock={inventoryOutOfStock.length}
      todayRetailRevenue={todayRetailRevenue}
      avgOrderValue={avgOrderValue}
      channelMixOnlineShare={channelMixOnlineShare}
      stockRiskItems={stockRiskItems}
      channelStatus={[
        { label: "POS open baskets", count: posOpenOrders.length, tone: posOpenOrders.length > 20 ? "warn" : "neutral" },
        { label: "Online pending", count: ecommercePendingOrders.length, tone: ecommercePendingOrders.length > 12 ? "danger" : "good" },
        { label: "Online in process", count: ecommerceActiveOrders.length - ecommercePendingOrders.length, tone: "neutral" },
        { label: "Out of stock SKUs", count: inventoryOutOfStock.length, tone: inventoryOutOfStock.length > 0 ? "danger" : "good" },
      ]}
      customerSignals={[
        { label: "CRM customers", value: String(crmRows.length) },
        { label: "VIP customers", value: String(vipCustomers), tone: vipCustomers > 0 ? "good" : "neutral" },
        { label: "Reactivation pool (30d+)", value: String(reactivationPool), tone: reactivationPool > 50 ? "warn" : "neutral" },
        { label: "Active loyalty members", value: String(activeLoyaltyMembers), tone: activeLoyaltyMembers > 0 ? "good" : "neutral" },
        { label: "Premium loyalty tiers", value: String(premiumTierMembers), tone: premiumTierMembers > 0 ? "good" : "neutral" },
        { label: "Lifetime customer value", value: `$${totalCustomerValue.toFixed(0)}` },
      ]}
      dailyCloseChecklist={[
        {
          label: "Order queue closure",
          status: paymentPendingCount > 0 ? "warn" : "good",
          detail: paymentPendingCount > 0 ? `${paymentPendingCount} active orders still open across POS and online.` : "All current orders are settled.",
        },
        {
          label: "Stock risk review",
          status: inventoryOutOfStock.length > 0 || inventoryLowStock.length > 5 ? "warn" : "good",
          detail:
            inventoryOutOfStock.length > 0
              ? `${inventoryOutOfStock.length} SKU(s) out of stock need immediate purchase orders.`
              : `${inventoryLowStock.length} low-stock SKU(s) are tracked for replenishment.`,
        },
        {
          label: "Customer follow-up readiness",
          status: reactivationPool > 30 || staleLoyaltyMembers > 20 ? "warn" : "good",
          detail:
            reactivationPool > 30
              ? `${reactivationPool} inactive CRM customers should be targeted in tomorrow campaigns.`
              : "Customer follow-up backlog is under control.",
        },
      ]}
      purchaseSuggestions={reorderList}
      campaignSuggestions={[
        {
          title: "Win-back inactive customers",
          detail: `Target ${reactivationPool} customers with no recent visits using a limited-time recovery offer.`,
        },
        {
          title: "VIP basket booster",
          detail: vipCustomers > 0 ? `Upsell new arrivals to ${vipCustomers} VIP customers via segmented CRM campaign.` : "Grow VIP segment by tagging top spenders before campaign launch.",
        },
        {
          title: "Loyalty reactivation blast",
          detail: `Re-engage ${staleLoyaltyMembers} dormant loyalty members with bonus points for next purchase.`,
        },
      ]}
      dailyCloseHistory={(dailyCloses ?? []).map((row) => ({
        id: row.id,
        closedAt: row.closed_at,
        closedByName: row.closed_by_name,
        notes: row.notes ?? null,
        queueOpen: Number((row.metrics_snapshot as Record<string, unknown>)?.pos_open_orders ?? 0) +
          Number((row.metrics_snapshot as Record<string, unknown>)?.ecommerce_pending_orders ?? 0),
      }))}
      markRetailDailyCloseAction={markRetailDailyCloseAction}
      closePayload={{
        posOpenOrders: posOpenOrders.length,
        ecommerceActiveOrders: ecommerceActiveOrders.length,
        ecommercePendingOrders: ecommercePendingOrders.length,
        inventoryLowStock: inventoryLowStock.length,
        inventoryOutOfStock: inventoryOutOfStock.length,
        revenueToday: Number(todayRetailRevenue.toFixed(2)),
        reactivationPool,
      }}
    />
  );
}

import { redirect } from "next/navigation";
import { autoDispatchCriticalOrdersAction, autoDispatchEcommerceOrderAction } from "@/app-actions/fleet";
import { CloudKitchenOpsPanel } from "@/components/cloud-kitchen-ops-panel";
import { parseBusinessType } from "@/lib/business-types";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function minutesSince(iso: string, nowMs: number) {
  const createdMs = new Date(iso).getTime();
  if (!Number.isFinite(createdMs)) return 0;
  return Math.max(0, Math.floor((nowMs - createdMs) / 60000));
}

export default async function CloudKitchenOpsPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const [
    { data: restaurant },
    { data: ecommerceAddon },
    { data: fleetAddon },
    { data: ecommerceOrders },
    { data: fleetDeliveries },
    { data: drivers },
    { data: vehicles },
  ] = await Promise.all([
    supabase.from("restaurants").select("name, business_type").eq("id", appUser.restaurant_id).single(),
    supabase.from("restaurant_addons").select("is_enabled").eq("restaurant_id", appUser.restaurant_id).eq("addon_key", "ecommerce").maybeSingle(),
    supabase.from("restaurant_addons").select("is_enabled").eq("restaurant_id", appUser.restaurant_id).eq("addon_key", "fleet").maybeSingle(),
    supabase
      .from("ecommerce_orders")
      .select("id, order_number, customer_name, status, payment_status, fulfilment_type, total_amount, created_at")
      .eq("restaurant_id", appUser.restaurant_id)
      .not("status", "in", '("delivered","cancelled")')
      .order("created_at", { ascending: true })
      .limit(300),
    supabase
      .from("fleet_deliveries")
      .select("id, ecommerce_order_id, customer_name, status, assigned_at, driver_id, vehicle_id")
      .eq("restaurant_id", appUser.restaurant_id)
      .not("status", "in", '("delivered","failed","cancelled")')
      .order("assigned_at", { ascending: false })
      .limit(150),
    supabase.from("fleet_drivers").select("id, full_name, status, is_active").eq("restaurant_id", appUser.restaurant_id),
    supabase.from("fleet_vehicles").select("id, plate_number, status, is_active").eq("restaurant_id", appUser.restaurant_id),
  ]);

  const businessType = parseBusinessType(restaurant?.business_type ?? "restaurant");
  if (businessType !== "cloud_kitchen") {
    redirect("/dashboard/business");
  }
  if (!ecommerceAddon?.is_enabled && !fleetAddon?.is_enabled) {
    redirect("/dashboard/business");
  }

  const nowMs = Date.now();
  const deliveriesByOrder = new Map((fleetDeliveries ?? []).map((d) => [d.ecommerce_order_id, d]));
  const driverMap = new Map((drivers ?? []).map((d) => [d.id, d]));
  const vehicleMap = new Map((vehicles ?? []).map((v) => [v.id, v]));

  const priorityOrders = (ecommerceOrders ?? [])
    .map((order) => {
      const ageMinutes = minutesSince(order.created_at, nowMs);
      const deliveryAssigned = Boolean(deliveriesByOrder.get(order.id));
      let priorityScore = 0;
      if (order.status === "pending") priorityScore += 40;
      else if (order.status === "confirmed") priorityScore += 25;
      else if (order.status === "preparing") priorityScore += 15;
      else if (order.status === "ready") priorityScore += 10;
      if (ageMinutes >= 20) priorityScore += 40;
      else if (ageMinutes >= 10) priorityScore += 20;
      if (order.fulfilment_type === "delivery") priorityScore += 10;
      if (order.payment_status === "unpaid") priorityScore += 5;
      if (!deliveryAssigned && ["preparing", "ready"].includes(order.status)) priorityScore += 20;
      const priorityLevel: "critical" | "high" | "normal" =
        priorityScore >= 80 ? "critical" : priorityScore >= 50 ? "high" : "normal";
      return {
        id: order.id,
        orderNumber: order.order_number ?? order.id.slice(0, 8).toUpperCase(),
        customerName: order.customer_name,
        status: order.status,
        paymentStatus: order.payment_status,
        fulfilmentType: order.fulfilment_type,
        ageMinutes,
        totalAmount: Number(order.total_amount),
        priorityScore,
        priorityLevel,
        deliveryAssigned,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const band0to10 = priorityOrders.filter((order) => order.ageMinutes < 10).length;
  const band10to20 = priorityOrders.filter((order) => order.ageMinutes >= 10 && order.ageMinutes < 20).length;
  const band20plus = priorityOrders.filter((order) => order.ageMinutes >= 20).length;
  const avgAgeMinutes =
    priorityOrders.length > 0 ? Math.round(priorityOrders.reduce((sum, order) => sum + order.ageMinutes, 0) / priorityOrders.length) : 0;

  const dispatchBoard = (fleetDeliveries ?? []).map((trip) => ({
    id: trip.id,
    customerName: trip.customer_name,
    status: trip.status,
    assignedAt: trip.assigned_at ? new Date(trip.assigned_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : null,
    driverName: trip.driver_id ? driverMap.get(trip.driver_id)?.full_name ?? "Unassigned" : "Unassigned",
    vehiclePlate: trip.vehicle_id ? vehicleMap.get(trip.vehicle_id)?.plate_number ?? "Unassigned" : "Unassigned",
  }));

  return (
    <CloudKitchenOpsPanel
      businessName={restaurant?.name ?? ""}
      pendingCount={priorityOrders.filter((order) => order.status === "pending").length}
      activeDispatchCount={(fleetDeliveries ?? []).length}
      avgAgeMinutes={avgAgeMinutes}
      availableDrivers={(drivers ?? []).filter((driver) => driver.is_active && driver.status === "available").length}
      availableVehicles={(vehicles ?? []).filter((vehicle) => vehicle.is_active && vehicle.status === "available").length}
      slaBands={[
        { label: "0-10 mins", count: band0to10, tone: "good" },
        { label: "10-20 mins", count: band10to20, tone: "warn" },
        { label: "20+ mins", count: band20plus, tone: "danger" },
      ]}
      topPriorityOrders={priorityOrders.slice(0, 12)}
      dispatchBoard={dispatchBoard}
      autoDispatchEcommerceOrderAction={autoDispatchEcommerceOrderAction}
      autoDispatchCriticalOrdersAction={autoDispatchCriticalOrdersAction}
    />
  );
}

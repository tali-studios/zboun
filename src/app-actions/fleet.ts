"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function requireFleetAccess() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "restaurant_admin" || !user.restaurant_id) redirect("/dashboard/login");
  const supabase = await createServerSupabaseClient();
  const { data: addon } = await supabase
    .from("restaurant_addons").select("is_enabled")
    .eq("restaurant_id", user.restaurant_id).eq("addon_key", "fleet").maybeSingle();
  if (!addon?.is_enabled) redirect("/dashboard/business");
  return user;
}

function revalidate() {
  revalidatePath("/dashboard/business/fleet");
  revalidatePath("/dashboard/business/cloud-kitchen");
  revalidatePath("/dashboard/business/ecommerce");
  revalidatePath("/dashboard/business");
}

// ─── Vehicles ─────────────────────────────────────────────────────────────────

export async function createVehicleAction(formData: FormData) {
  const user = await requireFleetAccess();
  const supabase = await createServerSupabaseClient();
  await supabase.from("fleet_vehicles").insert({
    restaurant_id: user.restaurant_id,
    plate_number: String(formData.get("plate_number") ?? "").trim().toUpperCase(),
    make: String(formData.get("make") ?? "").trim() || null,
    model: String(formData.get("model") ?? "").trim() || null,
    vehicle_type: String(formData.get("vehicle_type") ?? "motorcycle"),
    year: parseInt(String(formData.get("year") ?? ""), 10) || null,
    color: String(formData.get("color") ?? "").trim() || null,
    insurance_expiry: String(formData.get("insurance_expiry") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    status: "available",
  });
  revalidate();
}

export async function updateVehicleAction(formData: FormData) {
  const user = await requireFleetAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase.from("fleet_vehicles").update({
    plate_number: String(formData.get("plate_number") ?? "").trim().toUpperCase(),
    make: String(formData.get("make") ?? "").trim() || null,
    model: String(formData.get("model") ?? "").trim() || null,
    vehicle_type: String(formData.get("vehicle_type") ?? "motorcycle"),
    year: parseInt(String(formData.get("year") ?? ""), 10) || null,
    color: String(formData.get("color") ?? "").trim() || null,
    insurance_expiry: String(formData.get("insurance_expiry") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    is_active: formData.get("is_active") !== "false",
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("restaurant_id", user.restaurant_id);
  revalidate();
}

export async function updateVehicleStatusAction(formData: FormData) {
  const user = await requireFleetAccess();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!id || !status) return;
  const supabase = await createServerSupabaseClient();
  await supabase.from("fleet_vehicles").update({ status, updated_at: new Date().toISOString() })
    .eq("id", id).eq("restaurant_id", user.restaurant_id);
  revalidate();
}

export async function deleteVehicleAction(formData: FormData) {
  const user = await requireFleetAccess();
  const supabase = await createServerSupabaseClient();
  await supabase.from("fleet_vehicles").delete()
    .eq("id", String(formData.get("id") ?? "")).eq("restaurant_id", user.restaurant_id);
  revalidate();
}

// ─── Drivers ──────────────────────────────────────────────────────────────────

export async function createDriverAction(formData: FormData) {
  const user = await requireFleetAccess();
  const supabase = await createServerSupabaseClient();
  await supabase.from("fleet_drivers").insert({
    restaurant_id: user.restaurant_id,
    full_name: String(formData.get("full_name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    license_number: String(formData.get("license_number") ?? "").trim() || null,
    license_expiry: String(formData.get("license_expiry") ?? "").trim() || null,
    vehicle_id: String(formData.get("vehicle_id") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    status: "available",
  });
  revalidate();
}

export async function updateDriverAction(formData: FormData) {
  const user = await requireFleetAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase.from("fleet_drivers").update({
    full_name: String(formData.get("full_name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    license_number: String(formData.get("license_number") ?? "").trim() || null,
    license_expiry: String(formData.get("license_expiry") ?? "").trim() || null,
    vehicle_id: String(formData.get("vehicle_id") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    is_active: formData.get("is_active") !== "false",
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("restaurant_id", user.restaurant_id);
  revalidate();
}

export async function updateDriverStatusAction(formData: FormData) {
  const user = await requireFleetAccess();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!id || !status) return;
  const supabase = await createServerSupabaseClient();
  await supabase.from("fleet_drivers").update({ status, updated_at: new Date().toISOString() })
    .eq("id", id).eq("restaurant_id", user.restaurant_id);
  revalidate();
}

export async function deleteDriverAction(formData: FormData) {
  const user = await requireFleetAccess();
  const supabase = await createServerSupabaseClient();
  await supabase.from("fleet_drivers").delete()
    .eq("id", String(formData.get("id") ?? "")).eq("restaurant_id", user.restaurant_id);
  revalidate();
}

// ─── Deliveries ───────────────────────────────────────────────────────────────

export async function createDeliveryAction(formData: FormData) {
  const user = await requireFleetAccess();
  const supabase = await createServerSupabaseClient();
  const driverId = String(formData.get("driver_id") ?? "").trim() || null;
  const vehicleId = String(formData.get("vehicle_id") ?? "").trim() || null;
  await supabase.from("fleet_deliveries").insert({
    restaurant_id: user.restaurant_id,
    driver_id: driverId,
    vehicle_id: vehicleId,
    pos_order_id: String(formData.get("pos_order_id") ?? "").trim() || null,
    ecommerce_order_id: String(formData.get("ecommerce_order_id") ?? "").trim() || null,
    customer_name: String(formData.get("customer_name") ?? "").trim(),
    customer_phone: String(formData.get("customer_phone") ?? "").trim() || null,
    delivery_address: String(formData.get("delivery_address") ?? "").trim(),
    delivery_fee: parseFloat(String(formData.get("delivery_fee") ?? "0")) || 0,
    distance_km: parseFloat(String(formData.get("distance_km") ?? "")) || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    created_by: user.id,
  });
  if (driverId) {
    await supabase.from("fleet_drivers").update({ status: "on_delivery", updated_at: new Date().toISOString() }).eq("id", driverId);
  }
  if (vehicleId) {
    await supabase.from("fleet_vehicles").update({ status: "on_delivery", updated_at: new Date().toISOString() }).eq("id", vehicleId);
  }
  revalidate();
}

export async function updateDeliveryStatusAction(formData: FormData) {
  const user = await requireFleetAccess();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!id || !status) return;
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();
  const extra: Record<string, string | null> = {};
  if (status === "picked_up") extra.picked_up_at = now;
  if (status === "delivered" || status === "failed") extra.delivered_at = now;
  const { data: delivery } = await supabase.from("fleet_deliveries")
    .select("driver_id, vehicle_id").eq("id", id).maybeSingle();
  await supabase.from("fleet_deliveries").update({ status, ...extra, updated_at: now }).eq("id", id).eq("restaurant_id", user.restaurant_id);
  if (delivery && ["delivered","failed","cancelled"].includes(status)) {
    if (delivery.driver_id) {
      await supabase.from("fleet_drivers").update({ status: "available", updated_at: now }).eq("id", delivery.driver_id);
    }
    if (delivery.vehicle_id) {
      await supabase.from("fleet_vehicles").update({ status: "available", updated_at: now }).eq("id", delivery.vehicle_id);
    }
  }
  revalidate();
}

// ─── Vehicle Logs ─────────────────────────────────────────────────────────────

export async function addVehicleLogAction(formData: FormData) {
  const user = await requireFleetAccess();
  const supabase = await createServerSupabaseClient();
  await supabase.from("fleet_vehicle_logs").insert({
    restaurant_id: user.restaurant_id,
    vehicle_id: String(formData.get("vehicle_id") ?? "").trim(),
    log_type: String(formData.get("log_type") ?? "fuel"),
    description: String(formData.get("description") ?? "").trim(),
    amount: parseFloat(String(formData.get("amount") ?? "")) || null,
    odometer_km: parseFloat(String(formData.get("odometer_km") ?? "")) || null,
    log_date: String(formData.get("log_date") ?? new Date().toISOString().split("T")[0]),
    created_by: user.id,
  });
  revalidate();
}

export async function autoDispatchEcommerceOrderAction(formData: FormData) {
  const user = await requireFleetAccess();
  const orderId = String(formData.get("order_id") ?? "").trim();
  if (!orderId) return;

  const supabase = await createServerSupabaseClient();

  const { data: order } = await supabase
    .from("ecommerce_orders")
    .select("id, customer_name, customer_phone, delivery_address, delivery_fee, status, fulfilment_type")
    .eq("id", orderId)
    .eq("restaurant_id", user.restaurant_id)
    .maybeSingle();
  if (!order || order.fulfilment_type !== "delivery") return;
  if (["delivered", "cancelled"].includes(order.status)) return;

  const { data: existingActive } = await supabase
    .from("fleet_deliveries")
    .select("id")
    .eq("restaurant_id", user.restaurant_id)
    .eq("ecommerce_order_id", order.id)
    .not("status", "in", '("delivered","failed","cancelled")')
    .maybeSingle();
  if (existingActive) return;

  const { data: drivers } = await supabase
    .from("fleet_drivers")
    .select("id, vehicle_id")
    .eq("restaurant_id", user.restaurant_id)
    .eq("is_active", true)
    .eq("status", "available")
    .limit(20);
  const { data: vehicles } = await supabase
    .from("fleet_vehicles")
    .select("id")
    .eq("restaurant_id", user.restaurant_id)
    .eq("is_active", true)
    .eq("status", "available")
    .limit(20);

  const vehicleIds = new Set((vehicles ?? []).map((vehicle) => vehicle.id));
  if (!drivers?.length || vehicleIds.size === 0) return;

  let selectedDriverId: string | null = null;
  let selectedVehicleId: string | null = null;

  for (const driver of drivers) {
    if (driver.vehicle_id && vehicleIds.has(driver.vehicle_id)) {
      selectedDriverId = driver.id;
      selectedVehicleId = driver.vehicle_id;
      break;
    }
  }

  if (!selectedDriverId) {
    selectedDriverId = drivers[0].id;
    selectedVehicleId = vehicles?.[0]?.id ?? null;
  }
  if (!selectedVehicleId) return;

  await supabase.from("fleet_deliveries").insert({
    restaurant_id: user.restaurant_id,
    driver_id: selectedDriverId,
    vehicle_id: selectedVehicleId,
    ecommerce_order_id: order.id,
    customer_name: order.customer_name,
    customer_phone: order.customer_phone,
    delivery_address: order.delivery_address ?? "Address not provided",
    delivery_fee: Number(order.delivery_fee ?? 0),
    notes: "Auto-dispatched from cloud kitchen control tower",
    created_by: user.id,
  });

  await supabase
    .from("fleet_drivers")
    .update({ status: "on_delivery", updated_at: new Date().toISOString() })
    .eq("id", selectedDriverId)
    .eq("restaurant_id", user.restaurant_id);
  await supabase
    .from("fleet_vehicles")
    .update({ status: "on_delivery", updated_at: new Date().toISOString() })
    .eq("id", selectedVehicleId)
    .eq("restaurant_id", user.restaurant_id);

  await supabase
    .from("ecommerce_orders")
    .update({ status: "out_for_delivery", updated_at: new Date().toISOString() })
    .eq("id", order.id)
    .eq("restaurant_id", user.restaurant_id);

  revalidate();
}

export async function autoDispatchCriticalOrdersAction(formData: FormData) {
  const user = await requireFleetAccess();
  const limit = Math.max(1, Math.min(10, parseInt(String(formData.get("limit") ?? "5"), 10) || 5));
  const supabase = await createServerSupabaseClient();

  const { data: activeDeliveries } = await supabase
    .from("fleet_deliveries")
    .select("ecommerce_order_id")
    .eq("restaurant_id", user.restaurant_id)
    .not("status", "in", '("delivered","failed","cancelled")')
    .not("ecommerce_order_id", "is", null);
  const alreadyAssigned = new Set((activeDeliveries ?? []).map((item) => item.ecommerce_order_id).filter(Boolean));

  const { data: candidates } = await supabase
    .from("ecommerce_orders")
    .select("id, customer_name, customer_phone, delivery_address, delivery_fee, status, fulfilment_type, payment_status, created_at")
    .eq("restaurant_id", user.restaurant_id)
    .in("status", ["pending", "confirmed", "preparing", "ready"])
    .eq("fulfilment_type", "delivery")
    .order("created_at", { ascending: true })
    .limit(300);

  const { data: drivers } = await supabase
    .from("fleet_drivers")
    .select("id, vehicle_id")
    .eq("restaurant_id", user.restaurant_id)
    .eq("is_active", true)
    .eq("status", "available")
    .limit(50);
  const { data: vehicles } = await supabase
    .from("fleet_vehicles")
    .select("id")
    .eq("restaurant_id", user.restaurant_id)
    .eq("is_active", true)
    .eq("status", "available")
    .limit(50);

  const vehiclePool = new Set((vehicles ?? []).map((vehicle) => vehicle.id));
  if (!drivers?.length || vehiclePool.size === 0 || !candidates?.length) return;

  const nowMs = Date.now();
  const scored = candidates
    .filter((order) => !alreadyAssigned.has(order.id))
    .map((order) => {
      const ageMinutes = Math.max(0, Math.floor((nowMs - new Date(order.created_at).getTime()) / 60000));
      let score = 0;
      if (order.status === "pending") score += 40;
      else if (order.status === "confirmed") score += 25;
      else if (order.status === "preparing") score += 15;
      else if (order.status === "ready") score += 10;
      if (ageMinutes >= 20) score += 40;
      else if (ageMinutes >= 10) score += 20;
      if (order.payment_status === "unpaid") score += 5;
      return { order, score };
    })
    .filter((item) => item.score >= 80)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return;

  const availableDrivers = [...drivers];
  let processed = 0;
  for (const candidate of scored) {
    if (processed >= limit) break;
    if (availableDrivers.length === 0 || vehiclePool.size === 0) break;

    let driverIdx = -1;
    let selectedVehicleId: string | null = null;
    for (let i = 0; i < availableDrivers.length; i += 1) {
      const d = availableDrivers[i];
      if (d.vehicle_id && vehiclePool.has(d.vehicle_id)) {
        driverIdx = i;
        selectedVehicleId = d.vehicle_id;
        break;
      }
    }
    if (driverIdx < 0) {
      driverIdx = 0;
      selectedVehicleId = [...vehiclePool][0] ?? null;
    }
    if (!selectedVehicleId) break;

    const selectedDriver = availableDrivers[driverIdx];
    await supabase.from("fleet_deliveries").insert({
      restaurant_id: user.restaurant_id,
      driver_id: selectedDriver.id,
      vehicle_id: selectedVehicleId,
      ecommerce_order_id: candidate.order.id,
      customer_name: candidate.order.customer_name,
      customer_phone: candidate.order.customer_phone,
      delivery_address: candidate.order.delivery_address ?? "Address not provided",
      delivery_fee: Number(candidate.order.delivery_fee ?? 0),
      notes: "Auto-dispatched in bulk from cloud kitchen control tower",
      created_by: user.id,
    });

    await supabase
      .from("fleet_drivers")
      .update({ status: "on_delivery", updated_at: new Date().toISOString() })
      .eq("id", selectedDriver.id)
      .eq("restaurant_id", user.restaurant_id);
    await supabase
      .from("fleet_vehicles")
      .update({ status: "on_delivery", updated_at: new Date().toISOString() })
      .eq("id", selectedVehicleId)
      .eq("restaurant_id", user.restaurant_id);
    await supabase
      .from("ecommerce_orders")
      .update({ status: "out_for_delivery", updated_at: new Date().toISOString() })
      .eq("id", candidate.order.id)
      .eq("restaurant_id", user.restaurant_id);

    availableDrivers.splice(driverIdx, 1);
    vehiclePool.delete(selectedVehicleId);
    processed += 1;
  }

  revalidate();
}

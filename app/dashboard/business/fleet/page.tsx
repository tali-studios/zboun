import { redirect } from "next/navigation";
import {
  createVehicleAction, updateVehicleAction, updateVehicleStatusAction, deleteVehicleAction,
  createDriverAction, updateDriverAction, updateDriverStatusAction, deleteDriverAction,
  createDeliveryAction, updateDeliveryStatusAction,
  addVehicleLogAction,
} from "@/app-actions/fleet";
import { FleetPanel } from "@/components/fleet-panel";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function FleetPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) redirect("/dashboard/login");
  const supabase = await createServerSupabaseClient();
  const { data: addon } = await supabase.from("restaurant_addons").select("is_enabled")
    .eq("restaurant_id", appUser.restaurant_id).eq("addon_key", "fleet").maybeSingle();
  if (!addon?.is_enabled) redirect("/dashboard/business");

  const [
    { data: restaurant }, { data: vehicles }, { data: drivers },
    { data: deliveries }, { data: vehicleLogs },
  ] = await Promise.all([
    supabase.from("restaurants").select("name").eq("id", appUser.restaurant_id).single(),
    supabase.from("fleet_vehicles").select("*").eq("restaurant_id", appUser.restaurant_id).order("plate_number"),
    supabase.from("fleet_drivers").select("*").eq("restaurant_id", appUser.restaurant_id).order("full_name"),
    supabase.from("fleet_deliveries")
      .select("id, driver_id, vehicle_id, customer_name, customer_phone, delivery_address, status, delivery_fee, distance_km, notes, assigned_at, picked_up_at, delivered_at, created_at")
      .eq("restaurant_id", appUser.restaurant_id).order("assigned_at", { ascending: false }).limit(200),
    supabase.from("fleet_vehicle_logs")
      .select("id, vehicle_id, log_type, description, amount, odometer_km, log_date, created_at")
      .eq("restaurant_id", appUser.restaurant_id).order("log_date", { ascending: false }).limit(300),
  ]);

  return (
    <FleetPanel
      restaurantName={restaurant?.name ?? ""}
      vehicles={vehicles ?? []}
      drivers={drivers ?? []}
      deliveries={deliveries ?? []}
      vehicleLogs={vehicleLogs ?? []}
      createVehicleAction={createVehicleAction}
      updateVehicleAction={updateVehicleAction}
      updateVehicleStatusAction={updateVehicleStatusAction}
      deleteVehicleAction={deleteVehicleAction}
      createDriverAction={createDriverAction}
      updateDriverAction={updateDriverAction}
      updateDriverStatusAction={updateDriverStatusAction}
      deleteDriverAction={deleteDriverAction}
      createDeliveryAction={createDeliveryAction}
      updateDeliveryStatusAction={updateDeliveryStatusAction}
      addVehicleLogAction={addVehicleLogAction}
    />
  );
}

import { redirect } from "next/navigation";
import {
  createRoomTypeAction, updateRoomTypeAction, deleteRoomTypeAction,
  createRoomAction, updateRoomAction, updateRoomStatusAction, deleteRoomAction,
  createPmsReservationAction, checkInAction, checkOutAction,
  cancelPmsReservationAction, updateReservationPaymentAction,
  addChargeAction, deleteChargeAction,
  createHousekeepingTaskAction, updateHousekeepingStatusAction,
} from "@/app-actions/pms";
import { PmsPanel } from "@/components/pms-panel";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PmsPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const { data: addon } = await supabase
    .from("restaurant_addons").select("is_enabled")
    .eq("restaurant_id", appUser.restaurant_id).eq("addon_key", "pms").maybeSingle();
  if (!addon?.is_enabled) redirect("/dashboard/business");

  const [
    { data: restaurant },
    { data: roomTypes },
    { data: rooms },
    { data: reservations },
    { data: charges },
    { data: housekeeping },
    { data: crmCustomers },
  ] = await Promise.all([
    supabase.from("restaurants").select("name, logo_url, phone, location")
      .eq("id", appUser.restaurant_id).single(),
    supabase.from("pms_room_types")
      .select("id, name, description, capacity, base_rate, amenities, is_active, created_at")
      .eq("restaurant_id", appUser.restaurant_id).order("name"),
    supabase.from("pms_rooms")
      .select("id, room_number, floor, room_type_id, status, notes, is_active, created_at, updated_at")
      .eq("restaurant_id", appUser.restaurant_id).order("room_number"),
    supabase.from("pms_reservations")
      .select("id, room_id, room_type_id, reference_number, guest_name, guest_phone, guest_email, guest_id_number, nationality, adults, children, check_in_date, check_out_date, actual_check_in, actual_check_out, nights, status, rate_per_night, room_total, charges_total, grand_total, amount_paid, balance_due, booking_source, special_requests, internal_notes, crm_customer_id, created_at, updated_at")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("check_in_date", { ascending: false }).limit(300),
    supabase.from("pms_charges")
      .select("id, reservation_id, category, description, amount, charged_at, created_at")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("charged_at", { ascending: false }).limit(500),
    supabase.from("pms_housekeeping_logs")
      .select("id, room_id, task_type, status, assigned_to, notes, scheduled_date, completed_at, created_at, updated_at")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("scheduled_date", { ascending: false }).limit(200),
    supabase.from("crm_customers")
      .select("id, full_name, phone").eq("restaurant_id", appUser.restaurant_id).order("full_name"),
  ]);

  return (
    <PmsPanel
      restaurantName={restaurant?.name ?? ""}
      roomTypes={roomTypes ?? []}
      rooms={rooms ?? []}
      reservations={reservations ?? []}
      charges={charges ?? []}
      housekeeping={housekeeping ?? []}
      crmCustomers={crmCustomers ?? []}
      createRoomTypeAction={createRoomTypeAction}
      updateRoomTypeAction={updateRoomTypeAction}
      deleteRoomTypeAction={deleteRoomTypeAction}
      createRoomAction={createRoomAction}
      updateRoomAction={updateRoomAction}
      updateRoomStatusAction={updateRoomStatusAction}
      deleteRoomAction={deleteRoomAction}
      createPmsReservationAction={createPmsReservationAction}
      checkInAction={checkInAction}
      checkOutAction={checkOutAction}
      cancelPmsReservationAction={cancelPmsReservationAction}
      updateReservationPaymentAction={updateReservationPaymentAction}
      addChargeAction={addChargeAction}
      deleteChargeAction={deleteChargeAction}
      createHousekeepingTaskAction={createHousekeepingTaskAction}
      updateHousekeepingStatusAction={updateHousekeepingStatusAction}
    />
  );
}

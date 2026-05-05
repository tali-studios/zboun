"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function requirePmsAccess() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "restaurant_admin" || !user.restaurant_id) {
    redirect("/dashboard/login");
  }
  const supabase = await createServerSupabaseClient();
  const { data: addon } = await supabase
    .from("restaurant_addons")
    .select("is_enabled")
    .eq("restaurant_id", user.restaurant_id)
    .eq("addon_key", "pms")
    .maybeSingle();
  if (!addon?.is_enabled) redirect("/dashboard/restaurant");
  return user;
}

function revalidate() {
  revalidatePath("/dashboard/restaurant/pms");
  revalidatePath("/dashboard/restaurant");
}

async function nextPmsRefNumber(restaurantId: string, prefix: string) {
  const supabase = await createServerSupabaseClient();
  const year = new Date().getFullYear();
  const { data: existing } = await supabase
    .from("restaurant_receipt_sequences")
    .select("id, last_number")
    .eq("restaurant_id", restaurantId)
    .eq("prefix", prefix)
    .eq("seq_year", year)
    .maybeSingle();
  if (existing) {
    const next = existing.last_number + 1;
    await supabase
      .from("restaurant_receipt_sequences")
      .update({ last_number: next, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    return `${prefix}-${year}-${String(next).padStart(6, "0")}`;
  }
  await supabase.from("restaurant_receipt_sequences").insert({
    restaurant_id: restaurantId, prefix, seq_year: year, last_number: 1,
    updated_at: new Date().toISOString(),
  });
  return `${prefix}-${year}-000001`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Room Types
// ─────────────────────────────────────────────────────────────────────────────

export async function createRoomTypeAction(formData: FormData) {
  const user = await requirePmsAccess();
  const supabase = await createServerSupabaseClient();
  const amenitiesRaw = String(formData.get("amenities") ?? "").trim();
  const amenities = amenitiesRaw ? amenitiesRaw.split(",").map((a) => a.trim()).filter(Boolean) : [];
  await supabase.from("pms_room_types").insert({
    restaurant_id: user.restaurant_id,
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    capacity: parseInt(String(formData.get("capacity") ?? "2"), 10) || 2,
    base_rate: parseFloat(String(formData.get("base_rate") ?? "0")) || 0,
    amenities: amenities.length > 0 ? amenities : null,
    is_active: true,
  });
  revalidate();
}

export async function updateRoomTypeAction(formData: FormData) {
  const user = await requirePmsAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  const amenitiesRaw = String(formData.get("amenities") ?? "").trim();
  const amenities = amenitiesRaw ? amenitiesRaw.split(",").map((a) => a.trim()).filter(Boolean) : [];
  await supabase.from("pms_room_types").update({
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    capacity: parseInt(String(formData.get("capacity") ?? "2"), 10) || 2,
    base_rate: parseFloat(String(formData.get("base_rate") ?? "0")) || 0,
    amenities: amenities.length > 0 ? amenities : null,
    is_active: formData.get("is_active") !== "false",
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("restaurant_id", user.restaurant_id);
  revalidate();
}

export async function deleteRoomTypeAction(formData: FormData) {
  const user = await requirePmsAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase.from("pms_room_types").delete().eq("id", id).eq("restaurant_id", user.restaurant_id);
  revalidate();
}

// ─────────────────────────────────────────────────────────────────────────────
// Rooms
// ─────────────────────────────────────────────────────────────────────────────

export async function createRoomAction(formData: FormData) {
  const user = await requirePmsAccess();
  const supabase = await createServerSupabaseClient();
  await supabase.from("pms_rooms").insert({
    restaurant_id: user.restaurant_id,
    room_number: String(formData.get("room_number") ?? "").trim(),
    floor: parseInt(String(formData.get("floor") ?? ""), 10) || null,
    room_type_id: String(formData.get("room_type_id") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    status: "available",
    is_active: true,
  });
  revalidate();
}

export async function updateRoomAction(formData: FormData) {
  const user = await requirePmsAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase.from("pms_rooms").update({
    room_number: String(formData.get("room_number") ?? "").trim(),
    floor: parseInt(String(formData.get("floor") ?? ""), 10) || null,
    room_type_id: String(formData.get("room_type_id") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    is_active: formData.get("is_active") !== "false",
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("restaurant_id", user.restaurant_id);
  revalidate();
}

export async function updateRoomStatusAction(formData: FormData) {
  const user = await requirePmsAccess();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!id || !status) return;
  const supabase = await createServerSupabaseClient();
  await supabase.from("pms_rooms").update({ status, updated_at: new Date().toISOString() })
    .eq("id", id).eq("restaurant_id", user.restaurant_id);
  revalidate();
}

export async function deleteRoomAction(formData: FormData) {
  const user = await requirePmsAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase.from("pms_rooms").delete().eq("id", id).eq("restaurant_id", user.restaurant_id);
  revalidate();
}

// ─────────────────────────────────────────────────────────────────────────────
// Reservations
// ─────────────────────────────────────────────────────────────────────────────

export async function createPmsReservationAction(formData: FormData) {
  const user = await requirePmsAccess();
  const supabase = await createServerSupabaseClient();

  const checkIn = String(formData.get("check_in_date") ?? "");
  const checkOut = String(formData.get("check_out_date") ?? "");
  const ratePerNight = parseFloat(String(formData.get("rate_per_night") ?? "0")) || 0;
  const nights = checkIn && checkOut
    ? Math.max(0, (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
    : 0;
  const roomTotal = ratePerNight * nights;
  const refNum = await nextPmsRefNumber(user.restaurant_id!, "RES");

  const { data: res } = await supabase.from("pms_reservations").insert({
    restaurant_id: user.restaurant_id,
    room_id: String(formData.get("room_id") ?? "").trim() || null,
    room_type_id: String(formData.get("room_type_id") ?? "").trim() || null,
    reference_number: refNum,
    guest_name: String(formData.get("guest_name") ?? "").trim(),
    guest_phone: String(formData.get("guest_phone") ?? "").trim() || null,
    guest_email: String(formData.get("guest_email") ?? "").trim() || null,
    guest_id_number: String(formData.get("guest_id_number") ?? "").trim() || null,
    nationality: String(formData.get("nationality") ?? "").trim() || null,
    adults: parseInt(String(formData.get("adults") ?? "1"), 10) || 1,
    children: parseInt(String(formData.get("children") ?? "0"), 10) || 0,
    check_in_date: checkIn,
    check_out_date: checkOut,
    status: "confirmed",
    rate_per_night: ratePerNight,
    room_total: roomTotal,
    charges_total: 0,
    grand_total: roomTotal,
    amount_paid: parseFloat(String(formData.get("amount_paid") ?? "0")) || 0,
    booking_source: String(formData.get("booking_source") ?? "direct"),
    special_requests: String(formData.get("special_requests") ?? "").trim() || null,
    internal_notes: String(formData.get("internal_notes") ?? "").trim() || null,
    crm_customer_id: String(formData.get("crm_customer_id") ?? "").trim() || null,
    created_by: user.id,
  }).select("id").single();

  // Mark room as reserved
  const roomId = String(formData.get("room_id") ?? "").trim();
  if (roomId && res) {
    await supabase.from("pms_rooms")
      .update({ status: "reserved", updated_at: new Date().toISOString() })
      .eq("id", roomId).eq("restaurant_id", user.restaurant_id);
  }

  revalidate();
}

export async function checkInAction(formData: FormData) {
  const user = await requirePmsAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();
  const { data: res } = await supabase
    .from("pms_reservations").select("room_id").eq("id", id).maybeSingle();
  await supabase.from("pms_reservations").update({
    status: "checked_in",
    actual_check_in: now,
    updated_at: now,
  }).eq("id", id).eq("restaurant_id", user.restaurant_id);
  if (res?.room_id) {
    await supabase.from("pms_rooms")
      .update({ status: "occupied", updated_at: now })
      .eq("id", res.room_id);
  }
  revalidate();
}

export async function checkOutAction(formData: FormData) {
  const user = await requirePmsAccess();
  const id = String(formData.get("id") ?? "").trim();
  const amountPaid = parseFloat(String(formData.get("amount_paid") ?? "0")) || 0;
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();
  const { data: res } = await supabase
    .from("pms_reservations").select("room_id").eq("id", id).maybeSingle();
  await supabase.from("pms_reservations").update({
    status: "checked_out",
    actual_check_out: now,
    amount_paid: amountPaid,
    updated_at: now,
  }).eq("id", id).eq("restaurant_id", user.restaurant_id);
  if (res?.room_id) {
    await supabase.from("pms_rooms")
      .update({ status: "housekeeping", updated_at: now })
      .eq("id", res.room_id);
    // Auto-create a housekeeping task
    await supabase.from("pms_housekeeping_logs").insert({
      restaurant_id: user.restaurant_id,
      room_id: res.room_id,
      task_type: "cleaning",
      status: "pending",
      scheduled_date: new Date().toISOString().split("T")[0],
      notes: "Post-checkout cleaning",
      created_by: user.id,
    });
  }
  revalidate();
}

export async function cancelPmsReservationAction(formData: FormData) {
  const user = await requirePmsAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  const { data: res } = await supabase
    .from("pms_reservations").select("room_id").eq("id", id).maybeSingle();
  await supabase.from("pms_reservations").update({
    status: "cancelled", updated_at: new Date().toISOString(),
  }).eq("id", id).eq("restaurant_id", user.restaurant_id);
  if (res?.room_id) {
    await supabase.from("pms_rooms")
      .update({ status: "available", updated_at: new Date().toISOString() })
      .eq("id", res.room_id);
  }
  revalidate();
}

export async function updateReservationPaymentAction(formData: FormData) {
  const user = await requirePmsAccess();
  const id = String(formData.get("id") ?? "").trim();
  const amountPaid = parseFloat(String(formData.get("amount_paid") ?? "0")) || 0;
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase.from("pms_reservations").update({
    amount_paid: amountPaid, updated_at: new Date().toISOString(),
  }).eq("id", id).eq("restaurant_id", user.restaurant_id);
  revalidate();
}

// ─────────────────────────────────────────────────────────────────────────────
// Charges
// ─────────────────────────────────────────────────────────────────────────────

export async function addChargeAction(formData: FormData) {
  const user = await requirePmsAccess();
  const reservationId = String(formData.get("reservation_id") ?? "").trim();
  const amount = parseFloat(String(formData.get("amount") ?? "0"));
  if (!reservationId || amount <= 0) return;
  const supabase = await createServerSupabaseClient();
  await supabase.from("pms_charges").insert({
    restaurant_id: user.restaurant_id,
    reservation_id: reservationId,
    category: String(formData.get("category") ?? "other"),
    description: String(formData.get("description") ?? "").trim(),
    amount,
    charged_at: new Date().toISOString(),
    created_by: user.id,
  });
  revalidate();
}

export async function deleteChargeAction(formData: FormData) {
  const user = await requirePmsAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase.from("pms_charges").delete()
    .eq("id", id).eq("restaurant_id", user.restaurant_id);
  revalidate();
}

// ─────────────────────────────────────────────────────────────────────────────
// Housekeeping
// ─────────────────────────────────────────────────────────────────────────────

export async function createHousekeepingTaskAction(formData: FormData) {
  const user = await requirePmsAccess();
  const supabase = await createServerSupabaseClient();
  await supabase.from("pms_housekeeping_logs").insert({
    restaurant_id: user.restaurant_id,
    room_id: String(formData.get("room_id") ?? "").trim(),
    task_type: String(formData.get("task_type") ?? "cleaning"),
    status: "pending",
    assigned_to: String(formData.get("assigned_to") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    scheduled_date: String(formData.get("scheduled_date") ?? new Date().toISOString().split("T")[0]),
    created_by: user.id,
  });
  revalidate();
}

export async function updateHousekeepingStatusAction(formData: FormData) {
  const user = await requirePmsAccess();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!id || !status) return;
  const supabase = await createServerSupabaseClient();
  const extra: Record<string, string | null> = {};
  if (status === "done") extra.completed_at = new Date().toISOString();
  const { data: task } = await supabase
    .from("pms_housekeeping_logs").select("room_id").eq("id", id).maybeSingle();
  await supabase.from("pms_housekeeping_logs").update({
    status, ...extra, updated_at: new Date().toISOString(),
  }).eq("id", id).eq("restaurant_id", user.restaurant_id);
  // If task done, mark room available
  if (status === "done" && task?.room_id) {
    await supabase.from("pms_rooms")
      .update({ status: "available", updated_at: new Date().toISOString() })
      .eq("id", task.room_id)
      .eq("status", "housekeeping");
  }
  revalidate();
}

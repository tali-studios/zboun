"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function requireEventsAccess() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "restaurant_admin" || !user.restaurant_id) {
    redirect("/dashboard/login");
  }
  const supabase = await createServerSupabaseClient();
  const { data: addon } = await supabase
    .from("restaurant_addons")
    .select("is_enabled")
    .eq("restaurant_id", user.restaurant_id)
    .eq("addon_key", "events")
    .maybeSingle();
  if (!addon?.is_enabled) {
    redirect("/dashboard/restaurant");
  }
  return user;
}

function revalidate() {
  revalidatePath("/dashboard/restaurant/events");
  revalidatePath("/dashboard/restaurant");
}

// ─────────────────────────────────────────────────────────────────────────────
// Reference number generator (reuses restaurant_receipt_sequences)
// ─────────────────────────────────────────────────────────────────────────────

async function nextRefNumber(restaurantId: string, prefix: string): Promise<string> {
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
    restaurant_id: restaurantId,
    prefix,
    seq_year: year,
    last_number: 1,
    updated_at: new Date().toISOString(),
  });
  return `${prefix}-${year}-000001`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Table Reservations
// ─────────────────────────────────────────────────────────────────────────────

export async function createReservationAction(formData: FormData) {
  const user = await requireEventsAccess();
  const supabase = await createServerSupabaseClient();
  await supabase.from("table_reservations").insert({
    restaurant_id: user.restaurant_id,
    guest_name: String(formData.get("guest_name") ?? "").trim(),
    guest_phone: String(formData.get("guest_phone") ?? "").trim(),
    guest_email: String(formData.get("guest_email") ?? "").trim() || null,
    reservation_date: String(formData.get("reservation_date") ?? ""),
    reservation_time: String(formData.get("reservation_time") ?? ""),
    party_size: parseInt(String(formData.get("party_size") ?? "2"), 10),
    table_label: String(formData.get("table_label") ?? "").trim() || null,
    status: "pending",
    special_requests: String(formData.get("special_requests") ?? "").trim() || null,
    internal_notes: String(formData.get("internal_notes") ?? "").trim() || null,
    crm_customer_id: String(formData.get("crm_customer_id") ?? "").trim() || null,
    created_by: user.id,
  });
  revalidate();
}

export async function updateReservationAction(formData: FormData) {
  const user = await requireEventsAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("table_reservations")
    .update({
      guest_name: String(formData.get("guest_name") ?? "").trim(),
      guest_phone: String(formData.get("guest_phone") ?? "").trim(),
      guest_email: String(formData.get("guest_email") ?? "").trim() || null,
      reservation_date: String(formData.get("reservation_date") ?? ""),
      reservation_time: String(formData.get("reservation_time") ?? ""),
      party_size: parseInt(String(formData.get("party_size") ?? "2"), 10),
      table_label: String(formData.get("table_label") ?? "").trim() || null,
      special_requests: String(formData.get("special_requests") ?? "").trim() || null,
      internal_notes: String(formData.get("internal_notes") ?? "").trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

export async function updateReservationStatusAction(formData: FormData) {
  const user = await requireEventsAccess();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!id || !status) return;
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("table_reservations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

export async function deleteReservationAction(formData: FormData) {
  const user = await requireEventsAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("table_reservations")
    .delete()
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

// ─────────────────────────────────────────────────────────────────────────────
// Event Spaces
// ─────────────────────────────────────────────────────────────────────────────

export async function createSpaceAction(formData: FormData) {
  const user = await requireEventsAccess();
  const supabase = await createServerSupabaseClient();
  const amenitiesRaw = String(formData.get("amenities") ?? "").trim();
  const amenities = amenitiesRaw
    ? amenitiesRaw.split(",").map((a) => a.trim()).filter(Boolean)
    : [];
  await supabase.from("event_spaces").insert({
    restaurant_id: user.restaurant_id,
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    capacity_min: parseInt(String(formData.get("capacity_min") ?? "0"), 10) || null,
    capacity_max: parseInt(String(formData.get("capacity_max") ?? "10"), 10),
    pricing_type: String(formData.get("pricing_type") ?? "flat"),
    base_price: parseFloat(String(formData.get("base_price") ?? "0")) || 0,
    amenities: amenities.length > 0 ? amenities : null,
    is_active: true,
  });
  revalidate();
}

export async function updateSpaceAction(formData: FormData) {
  const user = await requireEventsAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  const amenitiesRaw = String(formData.get("amenities") ?? "").trim();
  const amenities = amenitiesRaw
    ? amenitiesRaw.split(",").map((a) => a.trim()).filter(Boolean)
    : [];
  await supabase
    .from("event_spaces")
    .update({
      name: String(formData.get("name") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      capacity_min: parseInt(String(formData.get("capacity_min") ?? "0"), 10) || null,
      capacity_max: parseInt(String(formData.get("capacity_max") ?? "10"), 10),
      pricing_type: String(formData.get("pricing_type") ?? "flat"),
      base_price: parseFloat(String(formData.get("base_price") ?? "0")) || 0,
      amenities: amenities.length > 0 ? amenities : null,
      is_active: formData.get("is_active") !== "false",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

export async function deleteSpaceAction(formData: FormData) {
  const user = await requireEventsAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("event_spaces")
    .delete()
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

// ─────────────────────────────────────────────────────────────────────────────
// Event Packages
// ─────────────────────────────────────────────────────────────────────────────

export async function createPackageAction(formData: FormData) {
  const user = await requireEventsAccess();
  const supabase = await createServerSupabaseClient();
  await supabase.from("event_packages").insert({
    restaurant_id: user.restaurant_id,
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    price: parseFloat(String(formData.get("price") ?? "0")) || 0,
    is_active: true,
  });
  revalidate();
}

export async function deletePackageAction(formData: FormData) {
  const user = await requireEventsAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("event_packages")
    .delete()
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

// ─────────────────────────────────────────────────────────────────────────────
// Event Bookings
// ─────────────────────────────────────────────────────────────────────────────

export async function createEventBookingAction(formData: FormData) {
  const user = await requireEventsAccess();
  const supabase = await createServerSupabaseClient();

  const spaceFee = parseFloat(String(formData.get("space_fee") ?? "0")) || 0;
  const extrasTotal = parseFloat(String(formData.get("extras_total") ?? "0")) || 0;
  const depositAmount = parseFloat(String(formData.get("deposit_amount") ?? "0")) || 0;

  // Parse selected packages from JSON
  let packageItems: Array<{ package_id: string; package_name: string; unit_price: number; quantity: number }> = [];
  try {
    packageItems = JSON.parse(String(formData.get("packages_json") ?? "[]"));
  } catch {
    packageItems = [];
  }
  const packagesTotal = packageItems.reduce((s, p) => s + p.unit_price * p.quantity, 0);
  const totalAmount = spaceFee + packagesTotal + extrasTotal;

  const refNumber = await nextRefNumber(user.restaurant_id!, "EVT");

  const { data: booking } = await supabase
    .from("event_bookings")
    .insert({
      restaurant_id: user.restaurant_id,
      space_id: String(formData.get("space_id") ?? "").trim() || null,
      reference_number: refNumber,
      organiser_name: String(formData.get("organiser_name") ?? "").trim(),
      organiser_phone: String(formData.get("organiser_phone") ?? "").trim(),
      organiser_email: String(formData.get("organiser_email") ?? "").trim() || null,
      organisation: String(formData.get("organisation") ?? "").trim() || null,
      event_name: String(formData.get("event_name") ?? "").trim(),
      event_type: String(formData.get("event_type") ?? "private_party"),
      event_date: String(formData.get("event_date") ?? ""),
      start_time: String(formData.get("start_time") ?? ""),
      end_time: String(formData.get("end_time") ?? "").trim() || null,
      guest_count: parseInt(String(formData.get("guest_count") ?? "1"), 10),
      status: "inquiry",
      space_fee: spaceFee,
      packages_total: packagesTotal,
      extras_total: extrasTotal,
      total_amount: totalAmount,
      deposit_amount: depositAmount,
      special_requests: String(formData.get("special_requests") ?? "").trim() || null,
      internal_notes: String(formData.get("internal_notes") ?? "").trim() || null,
      crm_customer_id: String(formData.get("crm_customer_id") ?? "").trim() || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (booking && packageItems.length > 0) {
    await supabase.from("event_booking_packages").insert(
      packageItems.map((p) => ({
        booking_id: booking.id,
        package_id: p.package_id || null,
        package_name: p.package_name,
        quantity: p.quantity,
        unit_price: p.unit_price,
        line_total: p.unit_price * p.quantity,
      })),
    );
  }

  revalidate();
}

export async function updateEventBookingStatusAction(formData: FormData) {
  const user = await requireEventsAccess();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!id || !status) return;
  const supabase = await createServerSupabaseClient();
  const extra: Record<string, string | null> = {};
  if (status === "deposit_paid") extra.deposit_paid_at = new Date().toISOString();
  await supabase
    .from("event_bookings")
    .update({ status, ...extra, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

export async function updateEventBookingNotesAction(formData: FormData) {
  const user = await requireEventsAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("event_bookings")
    .update({
      internal_notes: String(formData.get("internal_notes") ?? "").trim() || null,
      deposit_amount: parseFloat(String(formData.get("deposit_amount") ?? "0")) || 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

export async function deleteEventBookingAction(formData: FormData) {
  const user = await requireEventsAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("event_bookings")
    .delete()
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

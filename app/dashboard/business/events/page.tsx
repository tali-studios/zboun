import { redirect } from "next/navigation";
import {
  createReservationAction,
  updateReservationAction,
  updateReservationStatusAction,
  deleteReservationAction,
  createSpaceAction,
  updateSpaceAction,
  deleteSpaceAction,
  createPackageAction,
  deletePackageAction,
  createEventBookingAction,
  updateEventBookingStatusAction,
  updateEventBookingNotesAction,
  deleteEventBookingAction,
} from "@/app-actions/events";
import { EventsPanel } from "@/components/events-panel";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const { data: addon } = await supabase
    .from("restaurant_addons")
    .select("is_enabled")
    .eq("restaurant_id", appUser.restaurant_id)
    .eq("addon_key", "events")
    .maybeSingle();
  if (!addon?.is_enabled) {
    redirect("/dashboard/business");
  }

  const [
    { data: restaurant },
    { data: reservations },
    { data: spaces },
    { data: packages },
    { data: bookings },
    { data: bookingPackages },
    { data: crmCustomers },
  ] = await Promise.all([
    supabase
      .from("restaurants")
      .select("name, logo_url, phone, location")
      .eq("id", appUser.restaurant_id)
      .single(),
    supabase
      .from("table_reservations")
      .select(
        "id, guest_name, guest_phone, guest_email, reservation_date, reservation_time, party_size, table_label, status, special_requests, internal_notes, crm_customer_id, created_at, updated_at",
      )
      .eq("restaurant_id", appUser.restaurant_id)
      .order("reservation_date", { ascending: false })
      .order("reservation_time", { ascending: false })
      .limit(300),
    supabase
      .from("event_spaces")
      .select("id, name, description, capacity_min, capacity_max, pricing_type, base_price, amenities, is_active, created_at")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("name"),
    supabase
      .from("event_packages")
      .select("id, name, description, price, is_active, created_at")
      .eq("restaurant_id", appUser.restaurant_id)
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("event_bookings")
      .select(
        "id, reference_number, space_id, organiser_name, organiser_phone, organiser_email, organisation, event_name, event_type, event_date, start_time, end_time, guest_count, status, space_fee, packages_total, extras_total, total_amount, deposit_amount, deposit_paid_at, balance_due, special_requests, internal_notes, crm_customer_id, created_at, updated_at",
      )
      .eq("restaurant_id", appUser.restaurant_id)
      .order("event_date", { ascending: false })
      .limit(200),
    supabase
      .from("event_booking_packages")
      .select("id, booking_id, package_name, quantity, unit_price, line_total")
      .limit(1000),
    supabase
      .from("crm_customers")
      .select("id, full_name, phone")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("full_name"),
  ]);

  return (
    <EventsPanel
      restaurantName={restaurant?.name ?? ""}
      reservations={reservations ?? []}
      spaces={spaces ?? []}
      packages={packages ?? []}
      bookings={bookings ?? []}
      bookingPackages={bookingPackages ?? []}
      crmCustomers={crmCustomers ?? []}
      createReservationAction={createReservationAction}
      updateReservationAction={updateReservationAction}
      updateReservationStatusAction={updateReservationStatusAction}
      deleteReservationAction={deleteReservationAction}
      createSpaceAction={createSpaceAction}
      updateSpaceAction={updateSpaceAction}
      deleteSpaceAction={deleteSpaceAction}
      createPackageAction={createPackageAction}
      deletePackageAction={deletePackageAction}
      createEventBookingAction={createEventBookingAction}
      updateEventBookingStatusAction={updateEventBookingStatusAction}
      updateEventBookingNotesAction={updateEventBookingNotesAction}
      deleteEventBookingAction={deleteEventBookingAction}
    />
  );
}

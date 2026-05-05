import { redirect } from "next/navigation";
import {
  createPlanAction, updatePlanAction, deletePlanAction,
  enrollMemberAction, updateMemberAction, checkInMemberAction,
  createInvoiceAction, markInvoicePaidAction,
} from "@/app-actions/club";
import { ClubPanel } from "@/components/club-panel";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ClubPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) redirect("/dashboard/login");
  const supabase = await createServerSupabaseClient();
  const { data: addon } = await supabase.from("restaurant_addons").select("is_enabled")
    .eq("restaurant_id", appUser.restaurant_id).eq("addon_key", "club").maybeSingle();
  if (!addon?.is_enabled) redirect("/dashboard/restaurant");

  const [
    { data: restaurant }, { data: plans }, { data: members },
    { data: checkIns }, { data: invoices }, { data: crmCustomers }, { data: loyaltyMembers },
  ] = await Promise.all([
    supabase.from("restaurants").select("name, logo_url").eq("id", appUser.restaurant_id).single(),
    supabase.from("club_plans").select("*").eq("restaurant_id", appUser.restaurant_id).order("price"),
    supabase.from("club_members")
      .select("id, plan_id, full_name, phone, email, member_number, joined_at, expiry_date, status, total_visits, total_spent, crm_customer_id, loyalty_member_id, notes, created_at, updated_at")
      .eq("restaurant_id", appUser.restaurant_id).order("full_name"),
    supabase.from("club_check_ins")
      .select("id, member_id, guests_count, notes, checked_in_at")
      .eq("restaurant_id", appUser.restaurant_id).order("checked_in_at", { ascending: false }).limit(300),
    supabase.from("club_invoices")
      .select("id, member_id, invoice_number, period_start, period_end, amount, status, paid_at, notes, created_at")
      .eq("restaurant_id", appUser.restaurant_id).order("created_at", { ascending: false }).limit(200),
    supabase.from("crm_customers").select("id, full_name, phone").eq("restaurant_id", appUser.restaurant_id).order("full_name"),
    supabase.from("loyalty_members").select("id, full_name, phone").eq("restaurant_id", appUser.restaurant_id).order("full_name"),
  ]);

  return (
    <ClubPanel
      restaurantName={restaurant?.name ?? ""}
      plans={plans ?? []}
      members={members ?? []}
      checkIns={checkIns ?? []}
      invoices={invoices ?? []}
      crmCustomers={crmCustomers ?? []}
      loyaltyMembers={loyaltyMembers ?? []}
      createPlanAction={createPlanAction}
      updatePlanAction={updatePlanAction}
      deletePlanAction={deletePlanAction}
      enrollMemberAction={enrollMemberAction}
      updateMemberAction={updateMemberAction}
      checkInMemberAction={checkInMemberAction}
      createInvoiceAction={createInvoiceAction}
      markInvoicePaidAction={markInvoicePaidAction}
    />
  );
}

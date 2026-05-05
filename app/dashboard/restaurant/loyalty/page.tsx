import { redirect } from "next/navigation";
import {
  upsertLoyaltyProgramAction,
  enrollMemberAction,
  updateMemberAction,
  earnPointsAction,
  redeemPointsAction,
  earnStampAction,
  adjustMemberAction,
  applyReferralBonusAction,
} from "@/app-actions/loyalty";
import { LoyaltyPanel } from "@/components/loyalty-panel";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoyaltyPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const { data: addon } = await supabase
    .from("restaurant_addons")
    .select("is_enabled")
    .eq("restaurant_id", appUser.restaurant_id)
    .eq("addon_key", "loyalty")
    .maybeSingle();
  if (!addon?.is_enabled) {
    redirect("/dashboard/restaurant");
  }

  const [
    { data: restaurant },
    { data: program },
    { data: members },
    { data: transactions },
    { data: crmCustomers },
  ] = await Promise.all([
    supabase
      .from("restaurants")
      .select("name, logo_url")
      .eq("id", appUser.restaurant_id)
      .single(),
    supabase
      .from("loyalty_programs")
      .select("*")
      .eq("restaurant_id", appUser.restaurant_id)
      .maybeSingle(),
    supabase
      .from("loyalty_members")
      .select(
        "id, full_name, phone, email, points_balance, stamps_balance, lifetime_points, total_stamps_ever, tier, is_active, enrolled_at, last_activity_at, crm_customer_id",
      )
      .eq("restaurant_id", appUser.restaurant_id)
      .order("lifetime_points", { ascending: false }),
    supabase
      .from("loyalty_transactions")
      .select("id, member_id, type, points_delta, stamps_delta, description, created_at, pos_order_id")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("crm_customers")
      .select("id, full_name, phone")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("full_name"),
  ]);

  return (
    <LoyaltyPanel
      restaurantName={restaurant?.name ?? ""}
      program={program}
      members={members ?? []}
      transactions={transactions ?? []}
      crmCustomers={crmCustomers ?? []}
      upsertLoyaltyProgramAction={upsertLoyaltyProgramAction}
      enrollMemberAction={enrollMemberAction}
      updateMemberAction={updateMemberAction}
      earnPointsAction={earnPointsAction}
      redeemPointsAction={redeemPointsAction}
      earnStampAction={earnStampAction}
      adjustMemberAction={adjustMemberAction}
      applyReferralBonusAction={applyReferralBonusAction}
    />
  );
}

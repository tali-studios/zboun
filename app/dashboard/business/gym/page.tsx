import { redirect } from "next/navigation";
import {
  autoCreateTrainerPayoutAction,
  createMemberPackageAction,
  createPackageAction,
  createPtSessionAction,
  createTrainerAction,
  createTrainerPayoutAction,
  markTrainerPayoutPaidAction,
  updatePtSessionStatusAction,
  updateTrainerAction,
} from "@/app-actions/gym";
import { GymOpsPanel } from "@/components/gym-ops-panel";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function GymPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) redirect("/dashboard/login");

  const supabase = await createServerSupabaseClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, business_type")
    .eq("id", appUser.restaurant_id)
    .maybeSingle();

  if (restaurant?.business_type !== "fitness_club") redirect("/dashboard/business");

  const [{ data: trainers }, { data: packages }, { data: sessions }, { data: payouts }, { data: memberPackages }, { data: clubMembers }] = await Promise.all([
    supabase.from("gym_trainers").select("*").eq("restaurant_id", appUser.restaurant_id).order("full_name"),
    supabase.from("gym_pt_packages").select("*").eq("restaurant_id", appUser.restaurant_id).order("price"),
    supabase.from("gym_pt_sessions").select("*").eq("restaurant_id", appUser.restaurant_id).order("scheduled_at", { ascending: false }).limit(300),
    supabase.from("gym_trainer_payouts").select("*").eq("restaurant_id", appUser.restaurant_id).order("created_at", { ascending: false }).limit(200),
    supabase.from("gym_member_packages").select("*").eq("restaurant_id", appUser.restaurant_id).order("created_at", { ascending: false }).limit(300),
    supabase.from("club_members").select("id, full_name, phone").eq("restaurant_id", appUser.restaurant_id).order("full_name"),
  ]);

  return (
    <GymOpsPanel
      restaurantName={restaurant?.name ?? ""}
      trainers={trainers ?? []}
      ptPackages={packages ?? []}
      ptSessions={sessions ?? []}
      trainerPayouts={payouts ?? []}
      memberPackages={memberPackages ?? []}
      clubMembers={clubMembers ?? []}
      createTrainerAction={createTrainerAction}
      updateTrainerAction={updateTrainerAction}
      createPackageAction={createPackageAction}
      createMemberPackageAction={createMemberPackageAction}
      createPtSessionAction={createPtSessionAction}
      updatePtSessionStatusAction={updatePtSessionStatusAction}
      createTrainerPayoutAction={createTrainerPayoutAction}
      autoCreateTrainerPayoutAction={autoCreateTrainerPayoutAction}
      markTrainerPayoutPaidAction={markTrainerPayoutPaidAction}
    />
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function requireGymAccess() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "restaurant_admin" || !user.restaurant_id) redirect("/dashboard/login");
  const supabase = await createServerSupabaseClient();
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("business_type")
    .eq("id", user.restaurant_id)
    .maybeSingle();
  if (restaurant?.business_type !== "fitness_club") redirect("/dashboard/business");
  return user;
}

function revalidate() {
  revalidatePath("/dashboard/business/gym");
  revalidatePath("/dashboard/business");
}

export async function createTrainerAction(formData: FormData) {
  const user = await requireGymAccess();
  const supabase = await createServerSupabaseClient();
  await supabase.from("gym_trainers").insert({
    restaurant_id: user.restaurant_id,
    full_name: String(formData.get("full_name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    specialty: String(formData.get("specialty") ?? "").trim() || null,
    employment_type: String(formData.get("employment_type") ?? "full_time"),
    salary_type: String(formData.get("salary_type") ?? "base"),
    base_salary: parseFloat(String(formData.get("base_salary") ?? "0")) || 0,
    session_rate: parseFloat(String(formData.get("session_rate") ?? "0")) || 0,
    is_active: formData.get("is_active") !== "false",
    hire_date: String(formData.get("hire_date") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });
  revalidate();
}

export async function updateTrainerAction(formData: FormData) {
  const user = await requireGymAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("gym_trainers")
    .update({
      full_name: String(formData.get("full_name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      specialty: String(formData.get("specialty") ?? "").trim() || null,
      employment_type: String(formData.get("employment_type") ?? "full_time"),
      salary_type: String(formData.get("salary_type") ?? "base"),
      base_salary: parseFloat(String(formData.get("base_salary") ?? "0")) || 0,
      session_rate: parseFloat(String(formData.get("session_rate") ?? "0")) || 0,
      is_active: formData.get("is_active") !== "false",
      hire_date: String(formData.get("hire_date") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

export async function createPackageAction(formData: FormData) {
  const user = await requireGymAccess();
  const supabase = await createServerSupabaseClient();
  await supabase.from("gym_pt_packages").insert({
    restaurant_id: user.restaurant_id,
    name: String(formData.get("name") ?? "").trim(),
    session_count: parseInt(String(formData.get("session_count") ?? "1"), 10) || 1,
    price: parseFloat(String(formData.get("price") ?? "0")) || 0,
    valid_days: parseInt(String(formData.get("valid_days") ?? ""), 10) || null,
    description: String(formData.get("description") ?? "").trim() || null,
    is_active: true,
  });
  revalidate();
}

export async function createPtSessionAction(formData: FormData) {
  const user = await requireGymAccess();
  const supabase = await createServerSupabaseClient();
  await supabase.from("gym_pt_sessions").insert({
    restaurant_id: user.restaurant_id,
    trainer_id: String(formData.get("trainer_id") ?? "").trim(),
    club_member_id: String(formData.get("club_member_id") ?? "").trim() || null,
    member_name: String(formData.get("member_name") ?? "").trim(),
    member_phone: String(formData.get("member_phone") ?? "").trim() || null,
    package_id: String(formData.get("package_id") ?? "").trim() || null,
    session_type: String(formData.get("session_type") ?? "pt"),
    status: "scheduled",
    scheduled_at: String(formData.get("scheduled_at") ?? "").trim(),
    duration_mins: parseInt(String(formData.get("duration_mins") ?? "60"), 10) || 60,
    price: parseFloat(String(formData.get("price") ?? "0")) || 0,
    payment_status: String(formData.get("payment_status") ?? "unpaid"),
    notes: String(formData.get("notes") ?? "").trim() || null,
    created_by: user.id,
  });
  revalidate();
}

export async function updatePtSessionStatusAction(formData: FormData) {
  const user = await requireGymAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  const nextStatus = String(formData.get("status") ?? "scheduled").trim();
  const nextPaymentStatus = String(formData.get("payment_status") ?? "unpaid").trim();
  const { data: existing } = await supabase
    .from("gym_pt_sessions")
    .select("id, status, club_member_id, package_id")
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id)
    .maybeSingle();

  await supabase
    .from("gym_pt_sessions")
    .update({
      status: nextStatus,
      payment_status: nextPaymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);

  const completingNow = existing?.status !== "completed" && nextStatus === "completed";
  if (completingNow && existing?.package_id) {
    const packageQuery = supabase
      .from("gym_member_packages")
      .select("id, used_sessions, remaining_sessions, purchased_sessions")
      .eq("restaurant_id", user.restaurant_id)
      .eq("package_id", existing.package_id)
      .eq("status", "active");
    const { data: activePackage } = existing.club_member_id
      ? await packageQuery.eq("club_member_id", existing.club_member_id).order("created_at", { ascending: false }).limit(1).maybeSingle()
      : await packageQuery.order("created_at", { ascending: false }).limit(1).maybeSingle();

    if (activePackage && activePackage.remaining_sessions > 0) {
      const used = Number(activePackage.used_sessions ?? 0) + 1;
      const remaining = Math.max(0, Number(activePackage.remaining_sessions ?? 0) - 1);
      await supabase
        .from("gym_member_packages")
        .update({
          used_sessions: used,
          remaining_sessions: remaining,
          status: remaining <= 0 ? "completed" : "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", activePackage.id)
        .eq("restaurant_id", user.restaurant_id);
    }
  }
  revalidate();
}

export async function createMemberPackageAction(formData: FormData) {
  const user = await requireGymAccess();
  const supabase = await createServerSupabaseClient();
  const packageId = String(formData.get("package_id") ?? "").trim();
  const purchasedSessions = parseInt(String(formData.get("purchased_sessions") ?? "0"), 10);
  if (!packageId || purchasedSessions <= 0) return;
  await supabase.from("gym_member_packages").insert({
    restaurant_id: user.restaurant_id,
    club_member_id: String(formData.get("club_member_id") ?? "").trim() || null,
    member_name: String(formData.get("member_name") ?? "").trim(),
    member_phone: String(formData.get("member_phone") ?? "").trim() || null,
    package_id: packageId,
    purchased_sessions: purchasedSessions,
    used_sessions: 0,
    remaining_sessions: purchasedSessions,
    purchase_date: String(formData.get("purchase_date") ?? "").trim() || new Date().toISOString().slice(0, 10),
    expiry_date: String(formData.get("expiry_date") ?? "").trim() || null,
    status: "active",
    notes: String(formData.get("notes") ?? "").trim() || null,
    created_by: user.id,
  });
  revalidate();
}

export async function createTrainerPayoutAction(formData: FormData) {
  const user = await requireGymAccess();
  const supabase = await createServerSupabaseClient();
  const baseAmount = parseFloat(String(formData.get("base_amount") ?? "0")) || 0;
  const sessionAmount = parseFloat(String(formData.get("session_amount") ?? "0")) || 0;
  const bonusAmount = parseFloat(String(formData.get("bonus_amount") ?? "0")) || 0;
  await supabase.from("gym_trainer_payouts").insert({
    restaurant_id: user.restaurant_id,
    trainer_id: String(formData.get("trainer_id") ?? "").trim(),
    period_start: String(formData.get("period_start") ?? "").trim(),
    period_end: String(formData.get("period_end") ?? "").trim(),
    base_amount: baseAmount,
    session_amount: sessionAmount,
    bonus_amount: bonusAmount,
    total_amount: baseAmount + sessionAmount + bonusAmount,
    status: "approved",
    notes: String(formData.get("notes") ?? "").trim() || null,
    created_by: user.id,
  });
  revalidate();
}

export async function autoCreateTrainerPayoutAction(formData: FormData) {
  const user = await requireGymAccess();
  const trainerId = String(formData.get("trainer_id") ?? "").trim();
  const periodStart = String(formData.get("period_start") ?? "").trim();
  const periodEnd = String(formData.get("period_end") ?? "").trim();
  if (!trainerId || !periodStart || !periodEnd) return;
  const supabase = await createServerSupabaseClient();

  const { data: trainer } = await supabase
    .from("gym_trainers")
    .select("base_salary, session_rate, salary_type")
    .eq("id", trainerId)
    .eq("restaurant_id", user.restaurant_id)
    .maybeSingle();
  if (!trainer) return;

  const startIso = `${periodStart}T00:00:00.000Z`;
  const endIso = `${periodEnd}T23:59:59.999Z`;
  const { count: completedCount } = await supabase
    .from("gym_pt_sessions")
    .select("id", { count: "exact", head: true })
    .eq("restaurant_id", user.restaurant_id)
    .eq("trainer_id", trainerId)
    .eq("status", "completed")
    .gte("scheduled_at", startIso)
    .lte("scheduled_at", endIso);

  const sessionCount = Number(completedCount ?? 0);
  const baseAmount = trainer.salary_type === "per_session" ? 0 : Number(trainer.base_salary ?? 0);
  const sessionAmount = trainer.salary_type === "base" ? 0 : sessionCount * Number(trainer.session_rate ?? 0);
  const totalAmount = baseAmount + sessionAmount;

  await supabase.from("gym_trainer_payouts").insert({
    restaurant_id: user.restaurant_id,
    trainer_id: trainerId,
    period_start: periodStart,
    period_end: periodEnd,
    base_amount: baseAmount,
    session_amount: sessionAmount,
    bonus_amount: 0,
    total_amount: totalAmount,
    status: "approved",
    notes: `Auto-calculated from ${sessionCount} completed sessions`,
    created_by: user.id,
  });
  revalidate();
}

export async function markTrainerPayoutPaidAction(formData: FormData) {
  const user = await requireGymAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("gym_trainer_payouts")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

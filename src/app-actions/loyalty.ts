"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function requireLoyaltyAccess() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "restaurant_admin" || !user.restaurant_id) {
    redirect("/dashboard/login");
  }
  const supabase = await createServerSupabaseClient();
  const { data: addon } = await supabase
    .from("restaurant_addons")
    .select("is_enabled")
    .eq("restaurant_id", user.restaurant_id)
    .eq("addon_key", "loyalty")
    .maybeSingle();
  if (!addon?.is_enabled) {
    redirect("/dashboard/restaurant");
  }
  return user;
}

function revalidate() {
  revalidatePath("/dashboard/restaurant/loyalty");
  revalidatePath("/dashboard/restaurant");
}

// ─────────────────────────────────────────────────────────────────────────────
// Program configuration
// ─────────────────────────────────────────────────────────────────────────────

export async function upsertLoyaltyProgramAction(formData: FormData) {
  const user = await requireLoyaltyAccess();
  const supabase = await createServerSupabaseClient();

  const pointsEnabled = formData.get("points_enabled") === "true";
  const stampsEnabled = formData.get("stamps_enabled") === "true";
  const referralEnabled = formData.get("referral_enabled") === "true";
  const tiersEnabled = formData.get("tiers_enabled") === "true";

  const payload = {
    restaurant_id: user.restaurant_id,
    points_enabled: pointsEnabled,
    points_per_dollar: parseFloat(String(formData.get("points_per_dollar") ?? "1")) || 1,
    points_redeem_per_dollar: parseFloat(String(formData.get("points_redeem_per_dollar") ?? "100")) || 100,
    stamps_enabled: stampsEnabled,
    stamps_required: parseInt(String(formData.get("stamps_required") ?? "10"), 10) || 10,
    stamp_reward_desc: String(formData.get("stamp_reward_desc") ?? "").trim() || null,
    referral_enabled: referralEnabled,
    referral_bonus_points: parseInt(String(formData.get("referral_bonus_points") ?? "50"), 10) || 50,
    tiers_enabled: tiersEnabled,
    tier_silver_threshold: parseInt(String(formData.get("tier_silver_threshold") ?? "500"), 10) || 500,
    tier_gold_threshold: parseInt(String(formData.get("tier_gold_threshold") ?? "1500"), 10) || 1500,
    tier_platinum_threshold: parseInt(String(formData.get("tier_platinum_threshold") ?? "5000"), 10) || 5000,
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from("loyalty_programs")
    .select("id")
    .eq("restaurant_id", user.restaurant_id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("loyalty_programs")
      .update(payload)
      .eq("restaurant_id", user.restaurant_id);
  } else {
    await supabase.from("loyalty_programs").insert(payload);
  }

  revalidate();
}

// ─────────────────────────────────────────────────────────────────────────────
// Members
// ─────────────────────────────────────────────────────────────────────────────

export async function enrollMemberAction(formData: FormData) {
  const user = await requireLoyaltyAccess();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;

  if (!fullName || (!phone && !email)) return;

  const supabase = await createServerSupabaseClient();

  // Check for duplicate by phone
  if (phone) {
    const { data: existing } = await supabase
      .from("loyalty_members")
      .select("id")
      .eq("restaurant_id", user.restaurant_id)
      .eq("phone", phone)
      .maybeSingle();
    if (existing) {
      redirect("/dashboard/restaurant/loyalty?error=duplicate_phone");
    }
  }

  await supabase.from("loyalty_members").insert({
    restaurant_id: user.restaurant_id,
    full_name: fullName,
    phone,
    email,
    crm_customer_id: String(formData.get("crm_customer_id") ?? "").trim() || null,
    enrolled_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
  });

  revalidate();
}

export async function updateMemberAction(formData: FormData) {
  const user = await requireLoyaltyAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("loyalty_members")
    .update({
      full_name: String(formData.get("full_name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      is_active: formData.get("is_active") !== "false",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

// ─────────────────────────────────────────────────────────────────────────────
// Earn points  (called after a POS sale or manually)
// ─────────────────────────────────────────────────────────────────────────────

export async function earnPointsAction(formData: FormData) {
  const user = await requireLoyaltyAccess();
  const memberId = String(formData.get("member_id") ?? "").trim();
  const orderTotal = parseFloat(String(formData.get("order_total") ?? "0")) || 0;
  const posOrderId = String(formData.get("pos_order_id") ?? "").trim() || null;

  if (!memberId || orderTotal <= 0) return;

  const supabase = await createServerSupabaseClient();

  const { data: program } = await supabase
    .from("loyalty_programs")
    .select("points_per_dollar, tiers_enabled, tier_silver_threshold, tier_gold_threshold, tier_platinum_threshold")
    .eq("restaurant_id", user.restaurant_id)
    .maybeSingle();
  if (!program) return;

  const points = Math.floor(orderTotal * program.points_per_dollar);
  if (points <= 0) return;

  const { data: member } = await supabase
    .from("loyalty_members")
    .select("points_balance, lifetime_points")
    .eq("id", memberId)
    .maybeSingle();
  if (!member) return;

  const newBalance = member.points_balance + points;
  const newLifetime = member.lifetime_points + points;

  await Promise.all([
    supabase
      .from("loyalty_members")
      .update({
        points_balance: newBalance,
        lifetime_points: newLifetime,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", memberId),
    supabase.from("loyalty_transactions").insert({
      restaurant_id: user.restaurant_id,
      member_id: memberId,
      pos_order_id: posOrderId,
      type: "earn_points",
      points_delta: points,
      stamps_delta: 0,
      description: `Earned ${points} pts on $${orderTotal.toFixed(2)} purchase`,
      created_by: user.id,
    }),
  ]);

  revalidate();
}

// ─────────────────────────────────────────────────────────────────────────────
// Redeem points
// ─────────────────────────────────────────────────────────────────────────────

export async function redeemPointsAction(formData: FormData) {
  const user = await requireLoyaltyAccess();
  const memberId = String(formData.get("member_id") ?? "").trim();
  const pointsToRedeem = parseInt(String(formData.get("points") ?? "0"), 10);

  if (!memberId || pointsToRedeem <= 0) return;

  const supabase = await createServerSupabaseClient();

  const { data: member } = await supabase
    .from("loyalty_members")
    .select("points_balance")
    .eq("id", memberId)
    .eq("restaurant_id", user.restaurant_id)
    .maybeSingle();

  if (!member || member.points_balance < pointsToRedeem) {
    redirect("/dashboard/restaurant/loyalty?error=insufficient_points");
  }

  const { data: program } = await supabase
    .from("loyalty_programs")
    .select("points_redeem_per_dollar")
    .eq("restaurant_id", user.restaurant_id)
    .maybeSingle();

  const discountValue = (pointsToRedeem / (program?.points_redeem_per_dollar ?? 100)).toFixed(2);

  await Promise.all([
    supabase
      .from("loyalty_members")
      .update({
        points_balance: member.points_balance - pointsToRedeem,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", memberId),
    supabase.from("loyalty_transactions").insert({
      restaurant_id: user.restaurant_id,
      member_id: memberId,
      type: "redeem_points",
      points_delta: -pointsToRedeem,
      stamps_delta: 0,
      description: `Redeemed ${pointsToRedeem} pts → $${discountValue} discount`,
      created_by: user.id,
    }),
  ]);

  revalidate();
}

// ─────────────────────────────────────────────────────────────────────────────
// Earn stamp
// ─────────────────────────────────────────────────────────────────────────────

export async function earnStampAction(formData: FormData) {
  const user = await requireLoyaltyAccess();
  const memberId = String(formData.get("member_id") ?? "").trim();
  const posOrderId = String(formData.get("pos_order_id") ?? "").trim() || null;
  if (!memberId) return;

  const supabase = await createServerSupabaseClient();

  const { data: program } = await supabase
    .from("loyalty_programs")
    .select("stamps_required, stamp_reward_desc")
    .eq("restaurant_id", user.restaurant_id)
    .maybeSingle();
  if (!program) return;

  const { data: member } = await supabase
    .from("loyalty_members")
    .select("stamps_balance, total_stamps_ever")
    .eq("id", memberId)
    .maybeSingle();
  if (!member) return;

  const newStamps = member.stamps_balance + 1;
  const newTotal = member.total_stamps_ever + 1;
  const rewardEarned = newStamps >= program.stamps_required;
  const finalStamps = rewardEarned ? 0 : newStamps;

  await supabase
    .from("loyalty_members")
    .update({
      stamps_balance: finalStamps,
      total_stamps_ever: newTotal,
      last_activity_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", memberId);

  await supabase.from("loyalty_transactions").insert({
    restaurant_id: user.restaurant_id,
    member_id: memberId,
    pos_order_id: posOrderId,
    type: "earn_stamp",
    points_delta: 0,
    stamps_delta: 1,
    description: `Stamp ${newStamps}/${program.stamps_required}`,
    created_by: user.id,
  });

  if (rewardEarned) {
    await supabase.from("loyalty_transactions").insert({
      restaurant_id: user.restaurant_id,
      member_id: memberId,
      type: "stamp_reward",
      points_delta: 0,
      stamps_delta: -program.stamps_required,
      description: `Stamp card complete — Reward: ${program.stamp_reward_desc ?? "Free item"}`,
      created_by: user.id,
    });
  }
  revalidate();
}

// ─────────────────────────────────────────────────────────────────────────────
// Manual adjustment (correction or bonus)
// ─────────────────────────────────────────────────────────────────────────────

export async function adjustMemberAction(formData: FormData) {
  const user = await requireLoyaltyAccess();
  const memberId = String(formData.get("member_id") ?? "").trim();
  const pointsDelta = parseInt(String(formData.get("points_delta") ?? "0"), 10);
  const stampsDelta = parseInt(String(formData.get("stamps_delta") ?? "0"), 10);
  const description = String(formData.get("description") ?? "").trim() || "Manual adjustment";

  if (!memberId || (pointsDelta === 0 && stampsDelta === 0)) return;

  const supabase = await createServerSupabaseClient();

  const { data: member } = await supabase
    .from("loyalty_members")
    .select("points_balance, stamps_balance, lifetime_points")
    .eq("id", memberId)
    .eq("restaurant_id", user.restaurant_id)
    .maybeSingle();
  if (!member) return;

  const newPoints = Math.max(0, member.points_balance + pointsDelta);
  const newStamps = Math.max(0, member.stamps_balance + stampsDelta);
  const newLifetime = pointsDelta > 0 ? member.lifetime_points + pointsDelta : member.lifetime_points;

  await Promise.all([
    supabase
      .from("loyalty_members")
      .update({
        points_balance: newPoints,
        stamps_balance: newStamps,
        lifetime_points: newLifetime,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", memberId),
    supabase.from("loyalty_transactions").insert({
      restaurant_id: user.restaurant_id,
      member_id: memberId,
      type: "adjustment",
      points_delta: pointsDelta,
      stamps_delta: stampsDelta,
      description,
      created_by: user.id,
    }),
  ]);

  revalidate();
}

// ─────────────────────────────────────────────────────────────────────────────
// Referral bonus
// ─────────────────────────────────────────────────────────────────────────────

export async function applyReferralBonusAction(formData: FormData) {
  const user = await requireLoyaltyAccess();
  const referrerId = String(formData.get("referrer_id") ?? "").trim();
  if (!referrerId) return;

  const supabase = await createServerSupabaseClient();

  const { data: program } = await supabase
    .from("loyalty_programs")
    .select("referral_bonus_points, referral_enabled")
    .eq("restaurant_id", user.restaurant_id)
    .maybeSingle();
  if (!program?.referral_enabled || !program.referral_bonus_points) return;

  const { data: member } = await supabase
    .from("loyalty_members")
    .select("points_balance, lifetime_points")
    .eq("id", referrerId)
    .eq("restaurant_id", user.restaurant_id)
    .maybeSingle();
  if (!member) return;

  await Promise.all([
    supabase
      .from("loyalty_members")
      .update({
        points_balance: member.points_balance + program.referral_bonus_points,
        lifetime_points: member.lifetime_points + program.referral_bonus_points,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", referrerId),
    supabase.from("loyalty_transactions").insert({
      restaurant_id: user.restaurant_id,
      member_id: referrerId,
      type: "referral_bonus",
      points_delta: program.referral_bonus_points,
      stamps_delta: 0,
      description: `Referral bonus: +${program.referral_bonus_points} pts`,
      created_by: user.id,
    }),
  ]);

  revalidate();
}

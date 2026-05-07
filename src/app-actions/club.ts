"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function requireClubAccess() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "restaurant_admin" || !user.restaurant_id) redirect("/dashboard/login");
  const supabase = await createServerSupabaseClient();
  const { data: addon } = await supabase
    .from("restaurant_addons").select("is_enabled")
    .eq("restaurant_id", user.restaurant_id).eq("addon_key", "club").maybeSingle();
  if (!addon?.is_enabled) redirect("/dashboard/business");
  return user;
}

function revalidate() {
  revalidatePath("/dashboard/business/club");
  revalidatePath("/dashboard/business");
}

async function nextMemberNumber(restaurantId: string) {
  const supabase = await createServerSupabaseClient();
  const year = new Date().getFullYear();
  const { data: existing } = await supabase.from("restaurant_receipt_sequences").select("id, last_number")
    .eq("restaurant_id", restaurantId).eq("prefix", "CLB").eq("seq_year", year).maybeSingle();
  if (existing) {
    const next = existing.last_number + 1;
    await supabase.from("restaurant_receipt_sequences")
      .update({ last_number: next, updated_at: new Date().toISOString() }).eq("id", existing.id);
    return `CLB-${String(next).padStart(6, "0")}`;
  }
  await supabase.from("restaurant_receipt_sequences").insert({
    restaurant_id: restaurantId, prefix: "CLB", seq_year: year, last_number: 1, updated_at: new Date().toISOString(),
  });
  return "CLB-000001";
}

async function nextInvoiceNumber(restaurantId: string) {
  const supabase = await createServerSupabaseClient();
  const year = new Date().getFullYear();
  const { data: existing } = await supabase.from("restaurant_receipt_sequences").select("id, last_number")
    .eq("restaurant_id", restaurantId).eq("prefix", "INV").eq("seq_year", year).maybeSingle();
  if (existing) {
    const next = existing.last_number + 1;
    await supabase.from("restaurant_receipt_sequences")
      .update({ last_number: next, updated_at: new Date().toISOString() }).eq("id", existing.id);
    return `INV-${year}-${String(next).padStart(6, "0")}`;
  }
  await supabase.from("restaurant_receipt_sequences").insert({
    restaurant_id: restaurantId, prefix: "INV", seq_year: year, last_number: 1, updated_at: new Date().toISOString(),
  });
  return `INV-${year}-000001`;
}

// ─── Plans ────────────────────────────────────────────────────────────────────

export async function createPlanAction(formData: FormData) {
  const user = await requireClubAccess();
  const supabase = await createServerSupabaseClient();
  const benefitsRaw = String(formData.get("benefits") ?? "").trim();
  const benefits = benefitsRaw ? benefitsRaw.split("\n").map((b) => b.trim()).filter(Boolean) : [];
  await supabase.from("club_plans").insert({
    restaurant_id: user.restaurant_id,
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    price: parseFloat(String(formData.get("price") ?? "0")) || 0,
    billing_cycle: String(formData.get("billing_cycle") ?? "monthly"),
    duration_days: parseInt(String(formData.get("duration_days") ?? ""), 10) || null,
    max_guests: parseInt(String(formData.get("max_guests") ?? "1"), 10) || 1,
    benefits: benefits.length > 0 ? benefits : null,
    color: String(formData.get("color") ?? "#6366f1"),
    is_active: true,
  });
  revalidate();
}

export async function updatePlanAction(formData: FormData) {
  const user = await requireClubAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  const benefitsRaw = String(formData.get("benefits") ?? "").trim();
  const benefits = benefitsRaw ? benefitsRaw.split("\n").map((b) => b.trim()).filter(Boolean) : [];
  await supabase.from("club_plans").update({
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    price: parseFloat(String(formData.get("price") ?? "0")) || 0,
    billing_cycle: String(formData.get("billing_cycle") ?? "monthly"),
    duration_days: parseInt(String(formData.get("duration_days") ?? ""), 10) || null,
    max_guests: parseInt(String(formData.get("max_guests") ?? "1"), 10) || 1,
    benefits: benefits.length > 0 ? benefits : null,
    color: String(formData.get("color") ?? "#6366f1"),
    is_active: formData.get("is_active") !== "false",
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("restaurant_id", user.restaurant_id);
  revalidate();
}

export async function deletePlanAction(formData: FormData) {
  const user = await requireClubAccess();
  const supabase = await createServerSupabaseClient();
  await supabase.from("club_plans").delete()
    .eq("id", String(formData.get("id") ?? "")).eq("restaurant_id", user.restaurant_id);
  revalidate();
}

// ─── Members ──────────────────────────────────────────────────────────────────

export async function enrollMemberAction(formData: FormData) {
  const user = await requireClubAccess();
  const supabase = await createServerSupabaseClient();
  const planId = String(formData.get("plan_id") ?? "").trim() || null;
  const memberNumber = await nextMemberNumber(user.restaurant_id!);

  // Determine expiry from plan duration
  let expiryDate: string | null = null;
  if (planId) {
    const { data: plan } = await supabase.from("club_plans").select("duration_days, price, billing_cycle")
      .eq("id", planId).maybeSingle();
    if (plan?.duration_days) {
      const d = new Date();
      d.setDate(d.getDate() + plan.duration_days);
      expiryDate = d.toISOString().split("T")[0];
    }
  }

  const { data: member } = await supabase.from("club_members").insert({
    restaurant_id: user.restaurant_id,
    plan_id: planId,
    full_name: String(formData.get("full_name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    member_number: memberNumber,
    joined_at: new Date().toISOString().split("T")[0],
    expiry_date: expiryDate,
    status: "active",
    crm_customer_id: String(formData.get("crm_customer_id") ?? "").trim() || null,
    loyalty_member_id: String(formData.get("loyalty_member_id") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  }).select("id").single();

  // Auto-create first invoice
  if (member && planId) {
    const { data: plan } = await supabase.from("club_plans").select("price, billing_cycle")
      .eq("id", planId).maybeSingle();
    if (plan && plan.price > 0) {
      const invNum = await nextInvoiceNumber(user.restaurant_id!);
      await supabase.from("club_invoices").insert({
        restaurant_id: user.restaurant_id,
        member_id: member.id,
        invoice_number: invNum,
        period_start: new Date().toISOString().split("T")[0],
        period_end: expiryDate,
        amount: plan.price,
        status: "unpaid",
        created_by: user.id,
      });
    }
  }
  revalidate();
}

export async function updateMemberAction(formData: FormData) {
  const user = await requireClubAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase.from("club_members").update({
    full_name: String(formData.get("full_name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    plan_id: String(formData.get("plan_id") ?? "").trim() || null,
    expiry_date: String(formData.get("expiry_date") ?? "").trim() || null,
    status: String(formData.get("status") ?? "active"),
    notes: String(formData.get("notes") ?? "").trim() || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id).eq("restaurant_id", user.restaurant_id);
  revalidate();
}

export async function checkInMemberAction(formData: FormData) {
  const user = await requireClubAccess();
  const memberId = String(formData.get("member_id") ?? "").trim();
  if (!memberId) return;
  const supabase = await createServerSupabaseClient();
  const guests = parseInt(String(formData.get("guests_count") ?? "1"), 10) || 1;
  await supabase.from("club_check_ins").insert({
    restaurant_id: user.restaurant_id,
    member_id: memberId,
    guests_count: guests,
    notes: String(formData.get("notes") ?? "").trim() || null,
    checked_in_by: user.id,
  });
  const { data: member } = await supabase.from("club_members").select("total_visits")
    .eq("id", memberId).maybeSingle();
  await supabase.from("club_members").update({
    total_visits: (member?.total_visits ?? 0) + 1,
    updated_at: new Date().toISOString(),
  }).eq("id", memberId);
  revalidate();
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export async function createInvoiceAction(formData: FormData) {
  const user = await requireClubAccess();
  const supabase = await createServerSupabaseClient();
  const invNum = await nextInvoiceNumber(user.restaurant_id!);
  await supabase.from("club_invoices").insert({
    restaurant_id: user.restaurant_id,
    member_id: String(formData.get("member_id") ?? "").trim(),
    invoice_number: invNum,
    period_start: String(formData.get("period_start") ?? "").trim() || null,
    period_end: String(formData.get("period_end") ?? "").trim() || null,
    amount: parseFloat(String(formData.get("amount") ?? "0")) || 0,
    status: "unpaid",
    notes: String(formData.get("notes") ?? "").trim() || null,
    created_by: user.id,
  });
  revalidate();
}

export async function markInvoicePaidAction(formData: FormData) {
  const user = await requireClubAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  const amount = parseFloat(String(formData.get("amount") ?? "0")) || 0;
  await supabase.from("club_invoices").update({
    status: "paid", paid_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }).eq("id", id).eq("restaurant_id", user.restaurant_id);
  // Add to member total_spent
  const { data: inv } = await supabase.from("club_invoices").select("member_id").eq("id", id).maybeSingle();
  if (inv) {
    const { data: member } = await supabase.from("club_members").select("total_spent").eq("id", inv.member_id).maybeSingle();
    await supabase.from("club_members").update({
      total_spent: Number(member?.total_spent ?? 0) + amount,
      updated_at: new Date().toISOString(),
    }).eq("id", inv.member_id);
  }
  revalidate();
}

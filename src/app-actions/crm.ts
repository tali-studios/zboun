"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function requireCrmAccess() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "restaurant_admin" || !user.restaurant_id) {
    redirect("/dashboard/login");
  }
  const supabase = await createServerSupabaseClient();
  const { data: addon } = await supabase
    .from("restaurant_addons")
    .select("is_enabled")
    .eq("restaurant_id", user.restaurant_id)
    .eq("addon_key", "crm")
    .maybeSingle();
  if (!addon?.is_enabled) {
    redirect("/dashboard/business");
  }
  return user;
}

function revalidate() {
  revalidatePath("/dashboard/business/crm");
  revalidatePath("/dashboard/business");
}

// ─────────────────────────────────────────────────────────────────────────────
// Customers
// ─────────────────────────────────────────────────────────────────────────────

export async function createCustomerAction(formData: FormData) {
  const user = await requireCrmAccess();
  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!fullName) return;
  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();
  await supabase.from("crm_customers").insert({
    restaurant_id: user.restaurant_id,
    full_name: fullName,
    phone: String(formData.get("phone") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    birthday: String(formData.get("birthday") ?? "").trim() || null,
    is_vip: String(formData.get("is_vip") ?? "") === "true",
    notes: String(formData.get("notes") ?? "").trim() || null,
    first_visit_at: now,
    last_visit_at: now,
  });
  revalidate();
}

export async function updateCustomerAction(formData: FormData) {
  const user = await requireCrmAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("crm_customers")
    .update({
      full_name: String(formData.get("full_name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      birthday: String(formData.get("birthday") ?? "").trim() || null,
      is_vip: String(formData.get("is_vip") ?? "") === "true",
      notes: String(formData.get("notes") ?? "").trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

export async function toggleVipAction(formData: FormData) {
  const user = await requireCrmAccess();
  const id = String(formData.get("id") ?? "").trim();
  const current = String(formData.get("is_vip") ?? "") === "true";
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("crm_customers")
    .update({ is_vip: !current, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

export async function deleteCustomerAction(formData: FormData) {
  const user = await requireCrmAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("crm_customers")
    .delete()
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

// ─────────────────────────────────────────────────────────────────────────────
// Notes
// ─────────────────────────────────────────────────────────────────────────────

export async function addCustomerNoteAction(formData: FormData) {
  const user = await requireCrmAccess();
  const customerId = String(formData.get("customer_id") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!customerId || !content) return;
  const supabase = await createServerSupabaseClient();
  await supabase.from("crm_customer_notes").insert({
    restaurant_id: user.restaurant_id,
    customer_id: customerId,
    content,
    created_by: user.id,
  });
  revalidate();
}

export async function deleteCustomerNoteAction(formData: FormData) {
  const user = await requireCrmAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("crm_customer_notes")
    .delete()
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

// ─────────────────────────────────────────────────────────────────────────────
// Tags
// ─────────────────────────────────────────────────────────────────────────────

export async function createTagAction(formData: FormData) {
  const user = await requireCrmAccess();
  const name = String(formData.get("name") ?? "").trim();
  const color = String(formData.get("color") ?? "#6366f1").trim();
  if (!name) return;
  const supabase = await createServerSupabaseClient();
  await supabase.from("crm_tags").insert({
    restaurant_id: user.restaurant_id,
    name,
    color,
  });
  revalidate();
}

export async function deleteTagAction(formData: FormData) {
  const user = await requireCrmAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("crm_tags")
    .delete()
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

export async function assignTagAction(formData: FormData) {
  const user = await requireCrmAccess();
  const customerId = String(formData.get("customer_id") ?? "").trim();
  const tagId = String(formData.get("tag_id") ?? "").trim();
  if (!customerId || !tagId) return;
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("crm_customer_tag_assignments")
    .upsert({ customer_id: customerId, tag_id: tagId }, { onConflict: "customer_id,tag_id" });
  revalidate();
}

export async function removeTagAssignmentAction(formData: FormData) {
  const user = await requireCrmAccess();
  const customerId = String(formData.get("customer_id") ?? "").trim();
  const tagId = String(formData.get("tag_id") ?? "").trim();
  if (!customerId || !tagId) return;
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("crm_customer_tag_assignments")
    .delete()
    .eq("customer_id", customerId)
    .eq("tag_id", tagId);
  revalidate();
}

// ─────────────────────────────────────────────────────────────────────────────
// POS linkage — attach a customer profile to a POS order and sync stats
// ─────────────────────────────────────────────────────────────────────────────

export async function linkOrderToCustomerAction(formData: FormData) {
  const user = await requireCrmAccess();
  const orderId = String(formData.get("order_id") ?? "").trim();
  const customerId = String(formData.get("customer_id") ?? "").trim();
  if (!orderId || !customerId) return;

  const supabase = await createServerSupabaseClient();

  const { data: order } = await supabase
    .from("pos_orders")
    .select("id, total_amount, status, created_at")
    .eq("id", orderId)
    .eq("restaurant_id", user.restaurant_id)
    .maybeSingle();
  if (!order) return;

  await supabase
    .from("pos_orders")
    .update({ customer_id: customerId })
    .eq("id", orderId)
    .eq("restaurant_id", user.restaurant_id);

  const { data: customer } = await supabase
    .from("crm_customers")
    .select("id, total_spend, visit_count, first_visit_at, last_visit_at")
    .eq("id", customerId)
    .eq("restaurant_id", user.restaurant_id)
    .maybeSingle();
  if (!customer) return;

  const orderTotal = Number(order.total_amount ?? 0);
  const visitCount = Number(customer.visit_count ?? 0) + 1;
  const totalSpend = Number(customer.total_spend ?? 0) + orderTotal;
  const firstVisit = customer.first_visit_at ?? order.created_at;
  const lastVisit = order.created_at;

  await supabase
    .from("crm_customers")
    .update({
      total_spend: totalSpend,
      visit_count: visitCount,
      first_visit_at: firstVisit,
      last_visit_at: lastVisit,
      updated_at: new Date().toISOString(),
    })
    .eq("id", customerId)
    .eq("restaurant_id", user.restaurant_id);

  revalidate();
}

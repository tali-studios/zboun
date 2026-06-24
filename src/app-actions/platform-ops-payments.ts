"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUserRole } from "@/lib/data";
import { env } from "@/lib/env";

const CATEGORIES = new Set(["domain", "hosting", "saas", "marketing", "other"]);

async function requireSuperAdmin() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "superadmin") {
    redirect("/dashboard/login");
  }
  return user;
}

function getAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!env.supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required.");
  }
  return createClient(env.supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function parseDueAt(raw: FormDataEntryValue | null): string {
  const value = String(raw ?? "").trim();
  if (!value) throw new Error("Due date is required.");
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new Error("Invalid due date.");
  return parsed.toISOString();
}

function parseOptionalAmount(raw: FormDataEntryValue | null): number | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) throw new Error("Invalid amount.");
  return Math.round(amount * 100) / 100;
}

function parseCategory(raw: FormDataEntryValue | null): string {
  const category = String(raw ?? "other").trim().toLowerCase();
  return CATEGORIES.has(category) ? category : "other";
}

export async function createPlatformOpsPaymentAction(formData: FormData) {
  await requireSuperAdmin();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/dashboard/super-admin?error=missing_payment_title");

  const admin = getAdminClient();
  const nowIso = new Date().toISOString();

  const { error } = await admin.from("platform_ops_payments").insert({
    title,
    category: parseCategory(formData.get("category")),
    amount: parseOptionalAmount(formData.get("amount")),
    currency: String(formData.get("currency") ?? "USD").trim() || "USD",
    due_at: parseDueAt(formData.get("due_at")),
    notes: String(formData.get("notes") ?? "").trim() || null,
    reminder_enabled: formData.get("reminder_enabled") === "true",
    updated_at: nowIso,
  });

  if (error) redirect(`/dashboard/super-admin?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard/super-admin");
  redirect("/dashboard/super-admin?success=ops_payment_created");
}

export async function updatePlatformOpsPaymentAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/dashboard/super-admin?error=missing_payment_id");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/dashboard/super-admin?error=missing_payment_title");

  const admin = getAdminClient();
  const { error } = await admin
    .from("platform_ops_payments")
    .update({
      title,
      category: parseCategory(formData.get("category")),
      amount: parseOptionalAmount(formData.get("amount")),
      currency: String(formData.get("currency") ?? "USD").trim() || "USD",
      due_at: parseDueAt(formData.get("due_at")),
      notes: String(formData.get("notes") ?? "").trim() || null,
      reminder_enabled: formData.get("reminder_enabled") === "true",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) redirect(`/dashboard/super-admin?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard/super-admin");
  redirect("/dashboard/super-admin?success=ops_payment_updated");
}

export async function markPlatformOpsPaymentPaidAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/dashboard/super-admin?error=missing_payment_id");

  const nextDueRaw = String(formData.get("next_due_at") ?? "").trim();
  const admin = getAdminClient();
  const nowIso = new Date().toISOString();

  if (nextDueRaw) {
    const nextDue = new Date(nextDueRaw);
    if (Number.isNaN(nextDue.getTime())) {
      redirect("/dashboard/super-admin?error=invalid_next_due_date");
    }
    const { error } = await admin
      .from("platform_ops_payments")
      .update({
        paid_at: null,
        due_at: nextDue.toISOString(),
        updated_at: nowIso,
      })
      .eq("id", id);
    if (error) redirect(`/dashboard/super-admin?error=${encodeURIComponent(error.message)}`);
  } else {
    const { error } = await admin
      .from("platform_ops_payments")
      .update({ paid_at: nowIso, updated_at: nowIso })
      .eq("id", id);
    if (error) redirect(`/dashboard/super-admin?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/super-admin");
  redirect("/dashboard/super-admin?success=ops_payment_paid");
}

export async function reopenPlatformOpsPaymentAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/dashboard/super-admin?error=missing_payment_id");

  const admin = getAdminClient();
  const { error } = await admin
    .from("platform_ops_payments")
    .update({ paid_at: null, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) redirect(`/dashboard/super-admin?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard/super-admin");
  redirect("/dashboard/super-admin?success=ops_payment_reopened");
}

export async function deletePlatformOpsPaymentAction(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/dashboard/super-admin?error=missing_payment_id");

  const admin = getAdminClient();
  const { error } = await admin.from("platform_ops_payments").delete().eq("id", id);
  if (error) redirect(`/dashboard/super-admin?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/dashboard/super-admin");
  redirect("/dashboard/super-admin?success=ops_payment_deleted");
}

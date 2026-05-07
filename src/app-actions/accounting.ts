"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function requireAccountingAccess() {
  const user = await getCurrentUserRole();
  if (!user || user.role !== "restaurant_admin" || !user.restaurant_id) {
    redirect("/dashboard/login");
  }
  const supabase = await createServerSupabaseClient();
  const { data: addon } = await supabase
    .from("restaurant_addons")
    .select("is_enabled")
    .eq("restaurant_id", user.restaurant_id)
    .eq("addon_key", "accounting")
    .maybeSingle();
  if (!addon?.is_enabled) {
    redirect("/dashboard/business");
  }
  return user;
}

function revalidate() {
  revalidatePath("/dashboard/business/accounting");
  revalidatePath("/dashboard/business/accounting/receipts");
  revalidatePath("/dashboard/business");
}

async function getNextReceiptNumber(
  restaurantId: string,
  prefix: "EXP" | "PAY",
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
) {
  const year = new Date().getFullYear();
  const { data: existing } = await supabase
    .from("restaurant_receipt_sequences")
    .select("id, last_number")
    .eq("restaurant_id", restaurantId)
    .eq("prefix", prefix)
    .eq("seq_year", year)
    .maybeSingle();

  if (!existing) {
    const { data: inserted } = await supabase
      .from("restaurant_receipt_sequences")
      .insert({
        restaurant_id: restaurantId,
        prefix,
        seq_year: year,
        last_number: 1,
        updated_at: new Date().toISOString(),
      })
      .select("last_number")
      .single();
    const initial = Number(inserted?.last_number ?? 1);
    return `${prefix}-${year}-${String(initial).padStart(6, "0")}`;
  }

  const nextNumber = Number(existing.last_number ?? 0) + 1;
  await supabase
    .from("restaurant_receipt_sequences")
    .update({ last_number: nextNumber, updated_at: new Date().toISOString() })
    .eq("id", existing.id);
  return `${prefix}-${year}-${String(nextNumber).padStart(6, "0")}`;
}

export async function createEmployeeAction(formData: FormData) {
  const user = await requireAccountingAccess();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const roleTitle = String(formData.get("role_title") ?? "").trim();
  if (!fullName || !roleTitle) return;
  const supabase = await createServerSupabaseClient();
  await supabase.from("restaurant_employees").insert({
    restaurant_id: user.restaurant_id,
    full_name: fullName,
    role_title: roleTitle,
    base_salary: Math.max(0, Number(formData.get("base_salary") ?? 0) || 0),
    salary_type: String(formData.get("salary_type") ?? "monthly"),
    hire_date: String(formData.get("hire_date") ?? "").trim() || null,
  });
  revalidate();
}

export async function updateEmployeeAction(formData: FormData) {
  const user = await requireAccountingAccess();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("restaurant_employees")
    .update({
      full_name: String(formData.get("full_name") ?? "").trim(),
      role_title: String(formData.get("role_title") ?? "").trim(),
      base_salary: Math.max(0, Number(formData.get("base_salary") ?? 0) || 0),
      salary_type: String(formData.get("salary_type") ?? "monthly"),
      hire_date: String(formData.get("hire_date") ?? "").trim() || null,
      is_active: String(formData.get("is_active") ?? "true") === "true",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("restaurant_id", user.restaurant_id);
  revalidate();
}

export async function createExpenseAction(formData: FormData) {
  const user = await requireAccountingAccess();
  const category = String(formData.get("category") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  if (!category || !Number.isFinite(amount) || amount <= 0) return;
  const supabase = await createServerSupabaseClient();
  const receiptNumber = await getNextReceiptNumber(user.restaurant_id, "EXP", supabase);
  await supabase.from("accounting_expenses").insert({
    restaurant_id: user.restaurant_id,
    category,
    amount,
    occurred_at: String(formData.get("occurred_at") ?? "").trim() || new Date().toISOString(),
    vendor: String(formData.get("vendor") ?? "").trim() || null,
    reference: String(formData.get("reference") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    receipt_number: receiptNumber,
    created_by: user.id,
  });
  revalidate();
}

export async function createPayrollRunAction(formData: FormData) {
  const user = await requireAccountingAccess();
  const periodStart = String(formData.get("period_start") ?? "").trim();
  const periodEnd = String(formData.get("period_end") ?? "").trim();
  if (!periodStart || !periodEnd) return;
  const supabase = await createServerSupabaseClient();
  const { data: run } = await supabase
    .from("payroll_runs")
    .insert({
      restaurant_id: user.restaurant_id,
      period_start: periodStart,
      period_end: periodEnd,
      status: "draft",
      notes: String(formData.get("notes") ?? "").trim() || null,
      created_by: user.id,
    })
    .select("id")
    .single();

  const { data: employees } = await supabase
    .from("restaurant_employees")
    .select("id, base_salary")
    .eq("restaurant_id", user.restaurant_id)
    .eq("is_active", true);

  if (run && employees?.length) {
    const rows = [];
    for (const employee of employees) {
      const receiptNumber = await getNextReceiptNumber(user.restaurant_id, "PAY", supabase);
      rows.push({
        payroll_run_id: run.id,
        restaurant_id: user.restaurant_id,
        employee_id: employee.id,
        base_amount: Number(employee.base_salary ?? 0),
        overtime_amount: 0,
        bonus_amount: 0,
        deduction_amount: 0,
        net_amount: Number(employee.base_salary ?? 0),
        receipt_number: receiptNumber,
      });
    }
    await supabase.from("payroll_entries").insert(rows);
  }
  revalidate();
}

export async function markPayrollEntryPaidAction(formData: FormData) {
  const user = await requireAccountingAccess();
  const entryId = String(formData.get("entry_id") ?? "").trim();
  const paidAt = String(formData.get("paid_at") ?? "").trim() || new Date().toISOString();
  if (!entryId) return;

  const supabase = await createServerSupabaseClient();
  const { data: entry } = await supabase
    .from("payroll_entries")
    .select("id, payroll_run_id")
    .eq("id", entryId)
    .eq("restaurant_id", user.restaurant_id)
    .maybeSingle();
  if (!entry) return;

  await supabase
    .from("payroll_entries")
    .update({ paid_at: paidAt })
    .eq("id", entryId)
    .eq("restaurant_id", user.restaurant_id);

  const { data: runEntries } = await supabase
    .from("payroll_entries")
    .select("id, paid_at")
    .eq("restaurant_id", user.restaurant_id)
    .eq("payroll_run_id", entry.payroll_run_id);
  const allPaid = (runEntries ?? []).length > 0 && (runEntries ?? []).every((item) => Boolean(item.paid_at));
  if (allPaid) {
    await supabase
      .from("payroll_runs")
      .update({ status: "paid", updated_at: new Date().toISOString() })
      .eq("id", entry.payroll_run_id)
      .eq("restaurant_id", user.restaurant_id);
  }

  revalidate();
}

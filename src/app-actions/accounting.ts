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
    redirect("/dashboard/restaurant");
  }
  return user;
}

function revalidate() {
  revalidatePath("/dashboard/restaurant/accounting");
  revalidatePath("/dashboard/restaurant");
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
  await supabase.from("accounting_expenses").insert({
    restaurant_id: user.restaurant_id,
    category,
    amount,
    occurred_at: String(formData.get("occurred_at") ?? "").trim() || new Date().toISOString(),
    vendor: String(formData.get("vendor") ?? "").trim() || null,
    reference: String(formData.get("reference") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
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
    await supabase.from("payroll_entries").insert(
      employees.map((employee) => ({
        payroll_run_id: run.id,
        restaurant_id: user.restaurant_id,
        employee_id: employee.id,
        base_amount: Number(employee.base_salary ?? 0),
        overtime_amount: 0,
        bonus_amount: 0,
        deduction_amount: 0,
        net_amount: Number(employee.base_salary ?? 0),
      })),
    );
  }
  revalidate();
}

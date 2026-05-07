import { redirect } from "next/navigation";
import {
  createEmployeeAction,
  createExpenseAction,
  createPayrollRunAction,
  markPayrollEntryPaidAction,
  updateEmployeeAction,
} from "@/app-actions/accounting";
import { AccountingPanel } from "@/components/accounting-panel";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AccountingPage() {
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "restaurant_admin" || !appUser.restaurant_id) {
    redirect("/dashboard/login");
  }
  const supabase = await createServerSupabaseClient();
  const { data: addon } = await supabase
    .from("restaurant_addons")
    .select("is_enabled")
    .eq("restaurant_id", appUser.restaurant_id)
    .eq("addon_key", "accounting")
    .maybeSingle();
  if (!addon?.is_enabled) {
    redirect("/dashboard/business");
  }

  const [{ data: restaurant }, { data: employees }, { data: expenses }, { data: payrollRuns }, { data: payrollEntries }] =
    await Promise.all([
      supabase.from("restaurants").select("name, slug").eq("id", appUser.restaurant_id).single(),
      supabase
        .from("restaurant_employees")
        .select("id, full_name, role_title, base_salary, salary_type, hire_date, is_active, created_at")
        .eq("restaurant_id", appUser.restaurant_id)
        .order("full_name"),
      supabase
        .from("accounting_expenses")
        .select("id, category, amount, occurred_at, vendor, reference, notes, created_at")
        .eq("restaurant_id", appUser.restaurant_id)
        .order("occurred_at", { ascending: false })
        .limit(100),
      supabase
        .from("payroll_runs")
        .select("id, period_start, period_end, status, notes, created_at")
        .eq("restaurant_id", appUser.restaurant_id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("payroll_entries")
        .select("id, payroll_run_id, employee_id, base_amount, overtime_amount, bonus_amount, deduction_amount, net_amount, paid_at")
        .eq("restaurant_id", appUser.restaurant_id)
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

  return (
    <AccountingPanel
      restaurantName={restaurant?.name ?? ""}
      employees={employees ?? []}
      expenses={expenses ?? []}
      payrollRuns={payrollRuns ?? []}
      payrollEntries={payrollEntries ?? []}
      createEmployeeAction={createEmployeeAction}
      updateEmployeeAction={updateEmployeeAction}
      createExpenseAction={createExpenseAction}
      createPayrollRunAction={createPayrollRunAction}
      markPayrollEntryPaidAction={markPayrollEntryPaidAction}
    />
  );
}

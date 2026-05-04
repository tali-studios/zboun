import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AccountingReceiptsPage() {
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
    redirect("/dashboard/restaurant");
  }

  const [{ data: expenses }, { data: payrollEntries }] = await Promise.all([
    supabase
      .from("accounting_expenses")
      .select("id, category, amount, occurred_at, receipt_number")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("occurred_at", { ascending: false })
      .limit(100),
    supabase
      .from("payroll_entries")
      .select("id, employee_id, net_amount, paid_at, created_at, receipt_number")
      .eq("restaurant_id", appUser.restaurant_id)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const { data: employees } = await supabase
    .from("restaurant_employees")
    .select("id, full_name")
    .eq("restaurant_id", appUser.restaurant_id);

  const employeeNameById = new Map((employees ?? []).map((item) => [item.id, item.full_name]));

  return (
    <main className="min-h-screen bg-[#f8f8ff] p-3 sm:p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="panel p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Accounting</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Receipt & Export Center</h1>
          <p className="mt-1 text-sm text-slate-500">Open any receipt and print to PDF using your browser.</p>
          <a href="/dashboard/restaurant/accounting" className="mt-3 inline-flex text-sm font-semibold text-indigo-600 hover:underline">
            Back to Accounting →
          </a>
        </header>

        <section className="panel p-5">
          <h2 className="panel-title">Expense receipts</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-2">Date</th>
                  <th className="py-2">Receipt #</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {(expenses ?? []).map((expense) => (
                  <tr key={expense.id} className="border-b border-slate-100">
                    <td className="py-2">{new Date(expense.occurred_at).toLocaleDateString()}</td>
                    <td className="py-2 text-slate-500">{expense.receipt_number ?? "Pending"}</td>
                    <td className="py-2">{expense.category}</td>
                    <td className="py-2 font-semibold text-red-600">${Number(expense.amount).toFixed(2)}</td>
                    <td className="py-2">
                      <a href={`/dashboard/restaurant/accounting/receipts/expense/${expense.id}`} className="text-indigo-600 hover:underline">
                        Open receipt
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel p-5">
          <h2 className="panel-title">Payroll receipts</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="py-2">Created</th>
                  <th className="py-2">Receipt #</th>
                  <th className="py-2">Employee</th>
                  <th className="py-2">Net amount</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {(payrollEntries ?? []).map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-100">
                    <td className="py-2">{new Date(entry.created_at).toLocaleDateString()}</td>
                    <td className="py-2 text-slate-500">{entry.receipt_number ?? "Pending"}</td>
                    <td className="py-2">{employeeNameById.get(entry.employee_id) ?? "Employee"}</td>
                    <td className="py-2 font-semibold text-indigo-700">${Number(entry.net_amount).toFixed(2)}</td>
                    <td className="py-2">{entry.paid_at ? "Paid" : "Pending"}</td>
                    <td className="py-2">
                      <a href={`/dashboard/restaurant/accounting/receipts/payroll/${entry.id}`} className="text-indigo-600 hover:underline">
                        Open receipt
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

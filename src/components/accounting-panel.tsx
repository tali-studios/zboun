"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Employee = {
  id: string;
  full_name: string;
  role_title: string;
  base_salary: number;
  salary_type: "monthly" | "hourly";
  hire_date: string | null;
  is_active: boolean;
  created_at: string;
};

type Expense = {
  id: string;
  category: string;
  amount: number;
  occurred_at: string;
  vendor: string | null;
  reference: string | null;
  notes: string | null;
  created_at: string;
};

type PayrollRun = {
  id: string;
  period_start: string;
  period_end: string;
  status: "draft" | "approved" | "paid";
  notes: string | null;
  created_at: string;
};

type PayrollEntry = {
  id: string;
  payroll_run_id: string;
  employee_id: string;
  base_amount: number;
  overtime_amount: number;
  bonus_amount: number;
  deduction_amount: number;
  net_amount: number;
  paid_at: string | null;
};

type Props = {
  restaurantName: string;
  employees: Employee[];
  expenses: Expense[];
  payrollRuns: PayrollRun[];
  payrollEntries: PayrollEntry[];
  createEmployeeAction: (fd: FormData) => Promise<void>;
  updateEmployeeAction: (fd: FormData) => Promise<void>;
  createExpenseAction: (fd: FormData) => Promise<void>;
  createPayrollRunAction: (fd: FormData) => Promise<void>;
};

export function AccountingPanel({
  restaurantName,
  employees,
  expenses,
  payrollRuns,
  payrollEntries,
  createEmployeeAction,
  updateEmployeeAction,
  createExpenseAction,
  createPayrollRunAction,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<"overview" | "expenses" | "payroll" | "employees">("overview");
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);

  const employeeNameById = useMemo(
    () =>
      employees.reduce<Record<string, string>>((acc, employee) => {
        acc[employee.id] = employee.full_name;
        return acc;
      }, {}),
    [employees],
  );

  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  thisMonthStart.setHours(0, 0, 0, 0);

  const monthExpenses = expenses
    .filter((expense) => new Date(expense.occurred_at) >= thisMonthStart)
    .reduce((sum, expense) => sum + Number(expense.amount), 0);
  const activeEmployees = employees.filter((employee) => employee.is_active).length;
  const latestPayrollNet = payrollEntries
    .filter((entry) => payrollRuns[0] && entry.payroll_run_id === payrollRuns[0].id)
    .reduce((sum, entry) => sum + Number(entry.net_amount), 0);

  function run(action: (fd: FormData) => Promise<void>, formData: FormData) {
    startTransition(async () => {
      await action(formData);
      router.refresh();
    });
  }

  function handleSubmit(action: (fd: FormData) => Promise<void>) {
    return (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      run(action, new FormData(event.currentTarget));
      event.currentTarget.reset();
    };
  }

  return (
    <main className="min-h-screen bg-[#f8f8ff] p-3 sm:p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 p-5 text-white shadow-lg shadow-indigo-600/30 md:p-6">
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">Accounting & Payroll</p>
              <h1 className="mt-1 text-xl font-bold md:text-2xl">{restaurantName}</h1>
              <p className="mt-0.5 text-xs text-indigo-200">Expenses, payroll, and operational finance in one place.</p>
            </div>
            <a href="/dashboard/restaurant" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">
              Dashboard
            </a>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          {[
            { id: "overview", label: "Overview" },
            { id: "expenses", label: "Expenses" },
            { id: "payroll", label: "Payroll" },
            { id: "employees", label: "Employees" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as typeof tab)}
              className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                tab === item.id ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {tab === "overview" && (
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <article className="panel p-5"><p className="text-xs text-slate-500">Active employees</p><p className="mt-2 text-3xl font-bold text-slate-900">{activeEmployees}</p></article>
            <article className="panel p-5"><p className="text-xs text-slate-500">Expenses this month</p><p className="mt-2 text-3xl font-bold text-red-600">${monthExpenses.toFixed(2)}</p></article>
            <article className="panel p-5"><p className="text-xs text-slate-500">Latest payroll net</p><p className="mt-2 text-3xl font-bold text-indigo-700">${latestPayrollNet.toFixed(2)}</p></article>
            <article className="panel p-5"><p className="text-xs text-slate-500">Payroll runs</p><p className="mt-2 text-3xl font-bold text-slate-900">{payrollRuns.length}</p></article>
          </section>
        )}

        {tab === "expenses" && (
          <div className="space-y-4">
            <section className="panel p-5">
              <h2 className="panel-title">Record expense</h2>
              <form onSubmit={handleSubmit(createExpenseAction)} className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <input name="category" required placeholder="Category (Rent, Utilities...)" className="ui-input" />
                <input name="amount" type="number" step="0.01" min="0.01" required placeholder="Amount" className="ui-input" />
                <input name="occurred_at" type="datetime-local" className="ui-input" />
                <input name="vendor" placeholder="Vendor" className="ui-input" />
                <input name="reference" placeholder="Reference" className="ui-input" />
                <input name="notes" placeholder="Notes" className="ui-input sm:col-span-2" />
                <button disabled={isPending} className="btn btn-primary rounded-xl sm:col-span-2 lg:col-span-4">Save expense</button>
              </form>
            </section>
            <section className="panel p-5">
              <h2 className="panel-title">Expense ledger</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr className="border-b border-slate-200"><th className="py-2">Date</th><th>Category</th><th>Amount</th><th>Vendor</th><th>Reference</th><th>Notes</th></tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="border-b border-slate-100">
                        <td className="py-2">{new Date(expense.occurred_at).toLocaleDateString()}</td>
                        <td>{expense.category}</td>
                        <td className="font-semibold text-red-600">${Number(expense.amount).toFixed(2)}</td>
                        <td>{expense.vendor ?? "—"}</td>
                        <td>{expense.reference ?? "—"}</td>
                        <td className="text-slate-500">{expense.notes ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {tab === "payroll" && (
          <div className="space-y-4">
            <section className="panel p-5">
              <h2 className="panel-title">Create payroll run</h2>
              <form onSubmit={handleSubmit(createPayrollRunAction)} className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <input name="period_start" type="date" required className="ui-input" />
                <input name="period_end" type="date" required className="ui-input" />
                <input name="notes" placeholder="Optional notes" className="ui-input sm:col-span-2" />
                <button disabled={isPending} className="btn btn-success rounded-xl sm:col-span-2 lg:col-span-4">Create payroll run</button>
              </form>
            </section>
            <section className="panel p-5">
              <h2 className="panel-title">Payroll runs</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr className="border-b border-slate-200"><th className="py-2">Period</th><th>Status</th><th>Entries</th><th>Net total</th><th>Created</th></tr>
                  </thead>
                  <tbody>
                    {payrollRuns.map((run) => {
                      const entries = payrollEntries.filter((entry) => entry.payroll_run_id === run.id);
                      const net = entries.reduce((sum, entry) => sum + Number(entry.net_amount), 0);
                      return (
                        <tr key={run.id} className="border-b border-slate-100">
                          <td className="py-2">{new Date(run.period_start).toLocaleDateString()} - {new Date(run.period_end).toLocaleDateString()}</td>
                          <td className="capitalize">{run.status}</td>
                          <td>{entries.length}</td>
                          <td className="font-semibold text-indigo-700">${net.toFixed(2)}</td>
                          <td>{new Date(run.created_at).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {tab === "employees" && (
          <div className="space-y-4">
            <section className="panel p-5">
              <h2 className="panel-title">Add employee</h2>
              <form onSubmit={handleSubmit(createEmployeeAction)} className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <input name="full_name" required placeholder="Full name" className="ui-input" />
                <input name="role_title" required placeholder="Role title" className="ui-input" />
                <input name="base_salary" type="number" step="0.01" min="0" placeholder="Base salary" className="ui-input" />
                <select name="salary_type" className="ui-select"><option value="monthly">Monthly</option><option value="hourly">Hourly</option></select>
                <input name="hire_date" type="date" className="ui-input" />
                <button disabled={isPending} className="btn btn-primary rounded-xl sm:col-span-2 lg:col-span-4">Add employee</button>
              </form>
            </section>
            <section className="panel p-5">
              <h2 className="panel-title">Employees</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr className="border-b border-slate-200"><th className="py-2">Employee</th><th>Role</th><th>Base salary</th><th>Type</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.id} className="border-b border-slate-100">
                        <td className="py-2">{employee.full_name}</td>
                        <td>{employee.role_title}</td>
                        <td>${Number(employee.base_salary).toFixed(2)}</td>
                        <td className="capitalize">{employee.salary_type}</td>
                        <td>{employee.is_active ? "Active" : "Inactive"}</td>
                        <td><button type="button" onClick={() => setEditEmployee(employee)} className="btn btn-secondary rounded-xl">Edit</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>

      {editEmployee && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Edit employee</h3>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                formData.set("id", editEmployee.id);
                run(updateEmployeeAction, formData);
                setEditEmployee(null);
              }}
              className="mt-3 grid gap-2"
            >
              <input name="full_name" defaultValue={editEmployee.full_name} className="ui-input" />
              <input name="role_title" defaultValue={editEmployee.role_title} className="ui-input" />
              <input name="base_salary" type="number" step="0.01" min="0" defaultValue={editEmployee.base_salary} className="ui-input" />
              <select name="salary_type" defaultValue={editEmployee.salary_type} className="ui-select"><option value="monthly">Monthly</option><option value="hourly">Hourly</option></select>
              <input name="hire_date" type="date" defaultValue={editEmployee.hire_date ?? ""} className="ui-input" />
              <select name="is_active" defaultValue={String(editEmployee.is_active)} className="ui-select"><option value="true">Active</option><option value="false">Inactive</option></select>
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditEmployee(null)} className="btn btn-secondary rounded-xl">Cancel</button>
                <button disabled={isPending} className="btn btn-primary rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

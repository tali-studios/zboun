import { notFound, redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PrintReceiptButton } from "@/components/print-receipt-button";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ kind: string; id: string }>;
};

function formatReceiptNo(kind: string, id: string, timestamp: string) {
  const date = new Date(timestamp);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const code = id.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `${kind.toUpperCase()}-${y}${m}${d}-${code}`;
}

const VAT_RATE = 0.11;

export default async function ReceiptPage({ params }: Props) {
  const { kind, id } = await params;
  if (!["expense", "payroll"].includes(kind)) notFound();

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

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("name, logo_url, phone, location")
    .eq("id", appUser.restaurant_id)
    .single();

  if (kind === "expense") {
    const { data: expense } = await supabase
      .from("accounting_expenses")
      .select("id, category, amount, occurred_at, vendor, reference, notes, created_at, receipt_number")
      .eq("id", id)
      .eq("restaurant_id", appUser.restaurant_id)
      .maybeSingle();
    if (!expense) notFound();

    const receiptNo = expense.receipt_number ?? formatReceiptNo("EXP", expense.id, expense.occurred_at);
    const amount = Number(expense.amount);
    const vatAmount = amount * VAT_RATE;
    const total = amount + vatAmount;
    return (
      <main className="min-h-screen bg-[#f8f8ff] p-4 print:bg-white print:p-0">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 print:rounded-none print:shadow-none print:ring-0">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Expense Receipt</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">{restaurant?.name}</h1>
              <p className="mt-1 text-xs text-slate-500">
                {restaurant?.location ?? "Location not set"} · {restaurant?.phone ?? "Phone not set"}
              </p>
            </div>
            {restaurant?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={restaurant.logo_url} alt={`${restaurant.name} logo`} className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-200" />
            ) : null}
            <p className="text-xs text-slate-500">#{receiptNo}</p>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <p><span className="font-semibold text-slate-700">Receipt date:</span> {new Date(expense.occurred_at).toLocaleString()}</p>
            <p><span className="font-semibold text-slate-700">Category:</span> {expense.category}</p>
            <p><span className="font-semibold text-slate-700">Subtotal:</span> <span className="font-bold text-slate-700">${amount.toFixed(2)}</span></p>
            <p><span className="font-semibold text-slate-700">VAT (11%):</span> <span className="font-bold text-amber-600">${vatAmount.toFixed(2)}</span></p>
            <p><span className="font-semibold text-slate-700">Total:</span> <span className="font-bold text-red-600">${total.toFixed(2)}</span></p>
            <p><span className="font-semibold text-slate-700">Vendor:</span> {expense.vendor ?? "—"}</p>
            <p><span className="font-semibold text-slate-700">Reference:</span> {expense.reference ?? "—"}</p>
            <p><span className="font-semibold text-slate-700">Generated:</span> {new Date(expense.created_at).toLocaleString()}</p>
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            <span className="font-semibold text-slate-700">Notes:</span> {expense.notes ?? "No notes"}
          </div>
          <div className="mt-6 flex gap-2 print:hidden">
            <a href="/dashboard/restaurant/accounting/receipts" className="btn btn-secondary rounded-xl">Back</a>
            <PrintReceiptButton />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-3 text-xs text-slate-500">
              <p className="font-semibold text-slate-700">Authorized Signature</p>
              <div className="mt-6 border-t border-dashed border-slate-300" />
            </div>
            <div className="rounded-xl border border-slate-200 p-3 text-xs text-slate-500">
              <p className="font-semibold text-slate-700">Company Stamp</p>
              <div className="mt-6 border-t border-dashed border-slate-300" />
            </div>
          </div>
          <p className="mt-6 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
            Generated by Zboun Accounting · Keep this receipt for your records.
          </p>
        </div>
      </main>
    );
  }

  const { data: entry } = await supabase
    .from("payroll_entries")
    .select("id, employee_id, base_amount, overtime_amount, bonus_amount, deduction_amount, net_amount, paid_at, created_at, receipt_number")
    .eq("id", id)
    .eq("restaurant_id", appUser.restaurant_id)
    .maybeSingle();
  if (!entry) notFound();

  const { data: employee } = await supabase
    .from("restaurant_employees")
    .select("full_name, role_title")
    .eq("id", entry.employee_id)
    .eq("restaurant_id", appUser.restaurant_id)
    .maybeSingle();

  const receiptNo = entry.receipt_number ?? formatReceiptNo("PAY", entry.id, entry.created_at);
  const net = Number(entry.net_amount);
  const vatAmount = net * VAT_RATE;
  const total = net + vatAmount;
  return (
    <main className="min-h-screen bg-[#f8f8ff] p-4 print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 print:rounded-none print:shadow-none print:ring-0">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Payroll Receipt</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{restaurant?.name}</h1>
            <p className="mt-1 text-xs text-slate-500">
              {restaurant?.location ?? "Location not set"} · {restaurant?.phone ?? "Phone not set"}
            </p>
          </div>
          {restaurant?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={restaurant.logo_url} alt={`${restaurant.name} logo`} className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-200" />
          ) : null}
          <p className="text-xs text-slate-500">#{receiptNo}</p>
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <p><span className="font-semibold text-slate-700">Employee:</span> {employee?.full_name ?? "Employee"}</p>
          <p><span className="font-semibold text-slate-700">Role:</span> {employee?.role_title ?? "—"}</p>
          <p><span className="font-semibold text-slate-700">Base:</span> ${Number(entry.base_amount).toFixed(2)}</p>
          <p><span className="font-semibold text-slate-700">Overtime:</span> ${Number(entry.overtime_amount).toFixed(2)}</p>
          <p><span className="font-semibold text-slate-700">Bonus:</span> ${Number(entry.bonus_amount).toFixed(2)}</p>
          <p><span className="font-semibold text-slate-700">Deductions:</span> ${Number(entry.deduction_amount).toFixed(2)}</p>
          <p><span className="font-semibold text-slate-700">Net paid:</span> <span className="font-bold text-indigo-700">${net.toFixed(2)}</span></p>
          <p><span className="font-semibold text-slate-700">VAT (11%):</span> <span className="font-bold text-amber-600">${vatAmount.toFixed(2)}</span></p>
          <p><span className="font-semibold text-slate-700">Total payroll cost:</span> <span className="font-bold text-indigo-700">${total.toFixed(2)}</span></p>
          <p><span className="font-semibold text-slate-700">Status:</span> {entry.paid_at ? `Paid on ${new Date(entry.paid_at).toLocaleDateString()}` : "Pending payment"}</p>
        </div>
        <div className="mt-6 flex gap-2 print:hidden">
          <a href="/dashboard/restaurant/accounting/receipts" className="btn btn-secondary rounded-xl">Back</a>
          <PrintReceiptButton />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-3 text-xs text-slate-500">
            <p className="font-semibold text-slate-700">Authorized Signature</p>
            <div className="mt-6 border-t border-dashed border-slate-300" />
          </div>
          <div className="rounded-xl border border-slate-200 p-3 text-xs text-slate-500">
            <p className="font-semibold text-slate-700">Company Stamp</p>
            <div className="mt-6 border-t border-dashed border-slate-300" />
          </div>
        </div>
        <p className="mt-6 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
          Generated by Zboun Payroll · Keep this receipt for payroll compliance.
        </p>
      </div>
    </main>
  );
}

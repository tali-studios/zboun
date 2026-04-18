"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createInvoiceAction,
  recordCashPaymentAction,
} from "@/app-actions/superadmin";

type RestaurantOption = {
  id: string;
  name: string;
  subscription_id: string | null;
};

type InvoiceRow = {
  id: string;
  restaurant_id: string;
  subscription_id: string | null;
  amount_due: number;
  amount_paid: number;
  status: "unpaid" | "partial" | "paid" | "void";
  due_at: string;
  created_at: string;
};

type PaymentRow = {
  id: string;
  invoice_id: string;
  restaurant_id: string;
  amount_paid: number;
  paid_at: string;
  method: string;
  reference_note: string | null;
  created_at: string;
};

type Props = {
  restaurants: RestaurantOption[];
  invoices: InvoiceRow[];
  payments: PaymentRow[];
};

export function SuperAdminFinancePanel({ restaurants, invoices, payments }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [restaurantFilter, setRestaurantFilter] = useState("all");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<
    "all" | "unpaid" | "partial" | "paid" | "overdue"
  >("all");
  const [paymentDateFilter, setPaymentDateFilter] = useState<"all" | "this_month" | "last_month">(
    "all",
  );

  const restaurantNameById = useMemo(
    () =>
      restaurants.reduce<Record<string, string>>((acc, restaurant) => {
        acc[restaurant.id] = restaurant.name;
        return acc;
      }, {}),
    [restaurants],
  );

  const filteredInvoices = useMemo(() => {
    const now = new Date();
    return invoices.filter((invoice) => {
      if (restaurantFilter !== "all" && invoice.restaurant_id !== restaurantFilter) return false;
      if (invoiceStatusFilter === "all") return true;
      if (invoiceStatusFilter === "overdue") {
        return (invoice.status === "unpaid" || invoice.status === "partial") && new Date(invoice.due_at) < now;
      }
      return invoice.status === invoiceStatusFilter;
    });
  }, [invoices, invoiceStatusFilter, restaurantFilter]);

  const filteredPayments = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return payments.filter((payment) => {
      if (restaurantFilter !== "all" && payment.restaurant_id !== restaurantFilter) return false;
      const paidAt = new Date(payment.paid_at);
      if (paymentDateFilter === "this_month") return paidAt >= thisMonthStart;
      if (paymentDateFilter === "last_month") return paidAt >= lastMonthStart && paidAt < thisMonthStart;
      return true;
    });
  }, [payments, paymentDateFilter, restaurantFilter]);

  function submitInvoice(formData: FormData) {
    startTransition(async () => {
      await createInvoiceAction(formData);
      router.refresh();
    });
  }

  function submitPayment(formData: FormData) {
    startTransition(async () => {
      await recordCashPaymentAction(formData);
      router.refresh();
    });
  }

  return (
    <section className="panel p-5">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">Finance management</h2>
        <p className="text-xs text-slate-500">
          Manual cash workflow: create invoice, collect cash, record payment.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <form action={submitInvoice} className="rounded-2xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900">Create invoice</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <select name="restaurant_id" required className="ui-select sm:col-span-2">
              <option value="">Select restaurant</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
            <select name="subscription_id" className="ui-select sm:col-span-2">
              <option value="">No subscription link</option>
              {restaurants
                .filter((restaurant) => Boolean(restaurant.subscription_id))
                .map((restaurant) => (
                  <option key={`sub-${restaurant.id}`} value={restaurant.subscription_id ?? ""}>
                    {restaurant.name}
                  </option>
                ))}
            </select>
            <input type="number" min="0.01" step="0.01" name="amount_due" required placeholder="Amount due" className="ui-input" />
            <input type="datetime-local" name="due_at" required className="ui-input" />
            <input type="date" name="period_start" className="ui-input" />
            <input type="date" name="period_end" className="ui-input" />
            <textarea name="notes" rows={2} className="ui-textarea sm:col-span-2" placeholder="Notes (optional)" />
            <button disabled={isPending} className="btn btn-success rounded-xl sm:col-span-2 disabled:opacity-70">
              Create invoice
            </button>
          </div>
        </form>

        <form action={submitPayment} className="rounded-2xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900">Record cash payment</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <select name="invoice_id" required className="ui-select sm:col-span-2">
              <option value="">Select invoice</option>
              {invoices
                .filter((invoice) => invoice.status === "unpaid" || invoice.status === "partial")
                .map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>
                    {restaurantNameById[invoice.restaurant_id] ?? "Unknown"} · due ${Number(invoice.amount_due).toFixed(2)}
                  </option>
                ))}
            </select>
            <input type="number" min="0.01" step="0.01" name="amount_paid" required placeholder="Cash received" className="ui-input" />
            <input type="datetime-local" name="paid_at" className="ui-input" />
            <input name="reference_note" placeholder="Receipt note / reference" className="ui-input sm:col-span-2" />
            <button disabled={isPending} className="btn btn-primary rounded-xl sm:col-span-2 disabled:opacity-70">
              Record payment
            </button>
          </div>
        </form>
      </div>

      <div className="mt-5 grid gap-2 md:grid-cols-4">
        <select
          value={restaurantFilter}
          onChange={(event) => setRestaurantFilter(event.target.value)}
          className="ui-select"
        >
          <option value="all">All restaurants</option>
          {restaurants.map((restaurant) => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </option>
          ))}
        </select>
        <select
          value={invoiceStatusFilter}
          onChange={(event) =>
            setInvoiceStatusFilter(
              event.target.value as "all" | "unpaid" | "partial" | "paid" | "overdue",
            )
          }
          className="ui-select"
        >
          <option value="all">All invoices</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
        <select
          value={paymentDateFilter}
          onChange={(event) =>
            setPaymentDateFilter(event.target.value as "all" | "this_month" | "last_month")
          }
          className="ui-select"
        >
          <option value="all">All payment dates</option>
          <option value="this_month">This month</option>
          <option value="last_month">Last month</option>
        </select>
        <button
          type="button"
          className="btn btn-secondary rounded-xl"
          onClick={() => {
            setRestaurantFilter("all");
            setInvoiceStatusFilter("all");
            setPaymentDateFilter("all");
          }}
        >
          Reset filters
        </button>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900">Invoices</h3>
          <div className="mt-3 max-h-80 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2">Restaurant</th>
                  <th className="py-2">Due</th>
                  <th className="py-2">Paid</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Due at</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-100">
                    <td className="py-2">{restaurantNameById[invoice.restaurant_id] ?? "Unknown"}</td>
                    <td className="py-2">${Number(invoice.amount_due).toFixed(2)}</td>
                    <td className="py-2">${Number(invoice.amount_paid).toFixed(2)}</td>
                    <td className="py-2 capitalize">{invoice.status}</td>
                    <td className="py-2">{new Date(invoice.due_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td className="py-3 text-xs text-slate-500" colSpan={5}>
                      No invoices found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900">Payment ledger</h3>
          <div className="mt-3 max-h-80 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2">Restaurant</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Method</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-slate-100">
                    <td className="py-2">{restaurantNameById[payment.restaurant_id] ?? "Unknown"}</td>
                    <td className="py-2">${Number(payment.amount_paid).toFixed(2)}</td>
                    <td className="py-2 capitalize">{payment.method}</td>
                    <td className="py-2">{new Date(payment.paid_at).toLocaleDateString()}</td>
                    <td className="max-w-[160px] truncate py-2 text-slate-600">{payment.reference_note ?? "—"}</td>
                  </tr>
                ))}
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td className="py-3 text-xs text-slate-500" colSpan={5}>
                      No payments found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

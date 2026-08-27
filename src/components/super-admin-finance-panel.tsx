"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createInvoiceAction,
  deleteInvoiceAction,
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

  function deleteInvoice(invoice: InvoiceRow) {
    const restaurant = restaurantNameById[invoice.restaurant_id] ?? "this restaurant";
    const amount = `$${Number(invoice.amount_due).toFixed(2)}`;
    if (
      !window.confirm(
        `Delete this ${amount} invoice for ${restaurant}? Linked payments will also be removed.`,
      )
    ) {
      return;
    }
    const formData = new FormData();
    formData.set("invoice_id", invoice.id);
    startTransition(async () => {
      await deleteInvoiceAction(formData);
      router.refresh();
    });
  }

  return (
    <section id="finance" className="panel min-w-0 scroll-mt-28 overflow-hidden p-4 sm:p-5">
      <div className="mb-4 border-b border-slate-100 pb-3">
        <h2 className="panel-title">Finance management</h2>
        <p className="mt-1 text-xs text-slate-500">
          Manual cash workflow: create invoice, collect cash, record payment.
        </p>
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <form action={submitInvoice} className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900">Create invoice</h3>
          <div className="mt-3 grid min-w-0 grid-cols-1 gap-2 md:grid-cols-2">
            <select name="restaurant_id" required className="ui-select min-w-0 md:col-span-2">
              <option value="">Select restaurant</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
            <select name="subscription_id" className="ui-select min-w-0 md:col-span-2">
              <option value="">No subscription link</option>
              {restaurants
                .filter((restaurant) => Boolean(restaurant.subscription_id))
                .map((restaurant) => (
                  <option key={`sub-${restaurant.id}`} value={restaurant.subscription_id ?? ""}>
                    {restaurant.name}
                  </option>
                ))}
            </select>
            <label className="min-w-0 space-y-1 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Amount due</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                name="amount_due"
                required
                placeholder="0.00"
                className="ui-input min-w-0 w-full max-w-full"
              />
            </label>
            <div className="grid min-w-0 grid-cols-1 gap-2 md:col-span-2 lg:grid-cols-3">
              <label className="min-w-0 space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Due date</span>
                <input
                  type="datetime-local"
                  name="due_at"
                  required
                  className="ui-input min-w-0 w-full max-w-full"
                />
              </label>
              <label className="min-w-0 space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Period start</span>
                <input type="date" name="period_start" className="ui-input min-w-0 w-full max-w-full" />
              </label>
              <label className="min-w-0 space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Period end</span>
                <input type="date" name="period_end" className="ui-input min-w-0 w-full max-w-full" />
              </label>
            </div>
            <textarea name="notes" rows={2} className="ui-textarea min-w-0 md:col-span-2" placeholder="Notes (optional)" />
            <button disabled={isPending} className="btn btn-success rounded-xl md:col-span-2 disabled:opacity-70">
              Create invoice
            </button>
          </div>
        </form>

        <form action={submitPayment} className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900">Record cash payment</h3>
          <div className="mt-3 grid min-w-0 grid-cols-1 gap-2 md:grid-cols-2">
            <select name="invoice_id" required className="ui-select min-w-0 md:col-span-2">
              <option value="">Select invoice</option>
              {invoices
                .filter((invoice) => invoice.status === "unpaid" || invoice.status === "partial")
                .map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>
                    {restaurantNameById[invoice.restaurant_id] ?? "Unknown"} · due ${Number(invoice.amount_due).toFixed(2)}
                  </option>
                ))}
            </select>
            <label className="min-w-0 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cash received</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                name="amount_paid"
                required
                placeholder="0.00"
                className="ui-input min-w-0 w-full max-w-full"
              />
            </label>
            <label className="min-w-0 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paid at</span>
              <input type="datetime-local" name="paid_at" className="ui-input min-w-0 w-full max-w-full" />
            </label>
            <input
              name="reference_note"
              placeholder="Receipt note / reference"
              className="ui-input min-w-0 md:col-span-2"
            />
            <button disabled={isPending} className="btn btn-primary rounded-xl md:col-span-2 disabled:opacity-70">
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

      <div className="mt-5 grid min-w-0 gap-4 xl:grid-cols-2">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900">Invoices</h3>
          <div className="mt-3 max-h-80 space-y-2 overflow-auto md:hidden">
            {filteredInvoices.map((invoice) => (
              <article
                key={invoice.id}
                className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-semibold text-slate-900">
                    {restaurantNameById[invoice.restaurant_id] ?? "Unknown"}
                  </p>
                  <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold capitalize text-slate-600 ring-1 ring-slate-200">
                    {invoice.status}
                  </span>
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                  <div>
                    <dt className="text-slate-400">Due</dt>
                    <dd className="font-medium text-slate-800">${Number(invoice.amount_due).toFixed(2)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Paid</dt>
                    <dd className="font-medium text-slate-800">${Number(invoice.amount_paid).toFixed(2)}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-slate-400">Due at</dt>
                    <dd className="font-medium text-slate-800">
                      {new Date(invoice.due_at).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => deleteInvoice(invoice)}
                  className="mt-2.5 w-full rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                >
                  Delete
                </button>
              </article>
            ))}
            {filteredInvoices.length === 0 ? (
              <p className="py-3 text-xs text-slate-500">No invoices found.</p>
            ) : null}
          </div>
          <div className="mt-3 hidden max-h-80 overflow-auto md:block">
            <table className="w-full min-w-[540px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Restaurant</th>
                  <th className="py-2 pr-3">Due</th>
                  <th className="py-2 pr-3">Paid</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Due at</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3">{restaurantNameById[invoice.restaurant_id] ?? "Unknown"}</td>
                    <td className="py-2 pr-3">${Number(invoice.amount_due).toFixed(2)}</td>
                    <td className="py-2 pr-3">${Number(invoice.amount_paid).toFixed(2)}</td>
                    <td className="py-2 pr-3 capitalize">{invoice.status}</td>
                    <td className="py-2 pr-3">{new Date(invoice.due_at).toLocaleDateString()}</td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => deleteInvoice(invoice)}
                        className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td className="py-3 text-xs text-slate-500" colSpan={6}>
                      No invoices found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 p-4">
          <h3 className="font-semibold text-slate-900">Payment ledger</h3>
          <div className="mt-3 max-h-80 space-y-2 overflow-auto md:hidden">
            {filteredPayments.map((payment) => (
              <article
                key={payment.id}
                className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-semibold text-slate-900">
                    {restaurantNameById[payment.restaurant_id] ?? "Unknown"}
                  </p>
                  <p className="shrink-0 text-sm font-bold text-slate-900">
                    ${Number(payment.amount_paid).toFixed(2)}
                  </p>
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                  <div>
                    <dt className="text-slate-400">Method</dt>
                    <dd className="font-medium capitalize text-slate-800">{payment.method}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Date</dt>
                    <dd className="font-medium text-slate-800">
                      {new Date(payment.paid_at).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-slate-400">Note</dt>
                    <dd className="break-words font-medium text-slate-800">
                      {payment.reference_note ?? "—"}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
            {filteredPayments.length === 0 ? (
              <p className="py-3 text-xs text-slate-500">No payments found.</p>
            ) : null}
          </div>
          <div className="mt-3 hidden max-h-80 overflow-auto md:block">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">Restaurant</th>
                  <th className="py-2 pr-3">Amount</th>
                  <th className="py-2 pr-3">Method</th>
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3">{restaurantNameById[payment.restaurant_id] ?? "Unknown"}</td>
                    <td className="py-2 pr-3">${Number(payment.amount_paid).toFixed(2)}</td>
                    <td className="py-2 pr-3 capitalize">{payment.method}</td>
                    <td className="py-2 pr-3">{new Date(payment.paid_at).toLocaleDateString()}</td>
                    <td className="max-w-[200px] truncate py-2 text-slate-600">
                      {payment.reference_note ?? "—"}
                    </td>
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

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createPlatformOpsPaymentAction,
  deletePlatformOpsPaymentAction,
  markPlatformOpsPaymentPaidAction,
  reopenPlatformOpsPaymentAction,
  updatePlatformOpsPaymentAction,
} from "@/app-actions/platform-ops-payments";
import {
  PLATFORM_OPS_CATEGORY_LABELS,
  PLATFORM_OPS_REMINDER_LABELS,
  type PlatformOpsReminderKind,
} from "@/lib/platform-ops-payments-shared";

export type PlatformOpsPaymentItem = {
  id: string;
  title: string;
  category: string;
  amount: number | null;
  currency: string;
  due_at: string;
  paid_at: string | null;
  notes: string | null;
  reminder_enabled: boolean;
  reminders_sent: PlatformOpsReminderKind[];
};

type Props = {
  payments: PlatformOpsPaymentItem[];
};

type StatusFilter = "all" | "upcoming" | "overdue" | "paid";

function formatMoney(amount: number | null, currency: string) {
  if (amount == null || !Number.isFinite(amount)) return "—";
  return `${currency} ${amount.toFixed(2)}`;
}

function toDateInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function paymentStatus(payment: PlatformOpsPaymentItem): "paid" | "overdue" | "upcoming" {
  if (payment.paid_at) return "paid";
  if (new Date(payment.due_at) < new Date()) return "overdue";
  return "upcoming";
}

export function SuperAdminOpsPaymentsPanel({ payments }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const editing = payments.find((p) => p.id === editingId) ?? null;
  const paying = payments.find((p) => p.id === payingId) ?? null;

  const filtered = useMemo(() => {
    return payments.filter((payment) => {
      const status = paymentStatus(payment);
      if (statusFilter === "all") return true;
      return status === statusFilter;
    });
  }, [payments, statusFilter]);

  const stats = useMemo(() => {
    let upcoming = 0;
    let overdue = 0;
    let paid = 0;
    for (const p of payments) {
      const s = paymentStatus(p);
      if (s === "upcoming") upcoming += 1;
      else if (s === "overdue") overdue += 1;
      else paid += 1;
    }
    return { upcoming, overdue, paid };
  }, [payments]);

  function runAction(action: (formData: FormData) => Promise<void>, formData: FormData) {
    startTransition(async () => {
      await action(formData);
      router.refresh();
    });
  }

  return (
    <section className="panel min-w-0 overflow-hidden p-5">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">Platform payments</h2>
        <p className="mt-1 text-xs text-slate-500">
          Track your own expenses (domain, hosting, etc.). Email reminders go to your ops inbox{" "}
          <strong>30 days</strong>, <strong>7 days</strong>, and <strong>3 days</strong> before each due date.
        </p>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Upcoming</p>
          <p className="text-xl font-bold text-slate-900">{stats.upcoming}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">Overdue</p>
          <p className="text-xl font-bold text-amber-800">{stats.overdue}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">Paid</p>
          <p className="text-xl font-bold text-emerald-800">{stats.paid}</p>
        </div>
      </div>

      <form
        action={(formData) => runAction(createPlatformOpsPaymentAction, formData)}
        className="mb-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
      >
        <h3 className="font-semibold text-slate-900">Add payment / renewal</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <input name="title" required placeholder="e.g. zboun.com domain renewal" className="ui-input lg:col-span-2" />
          <select name="category" className="ui-select" defaultValue="domain">
            {Object.entries(PLATFORM_OPS_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input type="number" name="amount" min="0" step="0.01" placeholder="Amount (optional)" className="ui-input" />
          <input type="datetime-local" name="due_at" required className="ui-input md:col-span-2" />
          <input type="hidden" name="currency" value="USD" />
          <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
            <input type="checkbox" name="reminder_enabled" value="true" defaultChecked className="h-4 w-4 accent-violet-600" />
            Send email reminders (1 mo / 1 wk / 3 days before)
          </label>
          <textarea name="notes" rows={2} placeholder="Notes (optional)" className="ui-textarea md:col-span-2 lg:col-span-4" />
          <button type="submit" disabled={isPending} className="btn btn-success rounded-xl md:col-span-2 lg:col-span-4 disabled:opacity-70">
            Add item
          </button>
        </div>
      </form>

      <div className="mb-3 flex flex-wrap gap-2">
        {(["all", "upcoming", "overdue", "paid"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
              statusFilter === key
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs font-bold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-3 py-2.5">Item</th>
              <th className="px-3 py-2.5">Category</th>
              <th className="px-3 py-2.5">Amount</th>
              <th className="px-3 py-2.5">Due</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Reminders</th>
              <th className="px-3 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                  No items yet. Add your first domain renewal or subscription above.
                </td>
              </tr>
            ) : (
              filtered.map((payment) => {
                const status = paymentStatus(payment);
                return (
                  <tr key={payment.id} className="align-top">
                    <td className="px-3 py-3">
                      <p className="font-semibold text-slate-900">{payment.title}</p>
                      {payment.notes ? <p className="mt-0.5 text-xs text-slate-500">{payment.notes}</p> : null}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-slate-700">
                      {PLATFORM_OPS_CATEGORY_LABELS[payment.category] ?? payment.category}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-slate-700">
                      {formatMoney(payment.amount, payment.currency)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-slate-700">
                      {new Date(payment.due_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          status === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : status === "overdue"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-sky-100 text-sky-800"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {!payment.reminder_enabled ? (
                        <span className="text-xs text-slate-400">Off</span>
                      ) : payment.paid_at ? (
                        <span className="text-xs text-slate-400">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {(Object.keys(PLATFORM_OPS_REMINDER_LABELS) as PlatformOpsReminderKind[]).map((kind) => {
                            const sent = payment.reminders_sent.includes(kind);
                            return (
                              <span
                                key={kind}
                                title={PLATFORM_OPS_REMINDER_LABELS[kind]}
                                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                  sent ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {kind === "one_month" ? "30d" : kind === "one_week" ? "7d" : "3d"}
                                {sent ? " ✓" : ""}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap justify-end gap-1">
                        {status !== "paid" ? (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => setPayingId(payment.id)}
                            className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                          >
                            Mark paid
                          </button>
                        ) : (
                          <form action={(fd) => runAction(reopenPlatformOpsPaymentAction, fd)}>
                            <input type="hidden" name="id" value={payment.id} />
                            <button
                              type="submit"
                              disabled={isPending}
                              className="rounded-lg bg-slate-600 px-2 py-1 text-xs font-semibold text-white hover:bg-slate-500 disabled:opacity-60"
                            >
                              Reopen
                            </button>
                          </form>
                        )}
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => setEditingId(payment.id)}
                          className="rounded-lg bg-violet-600 px-2 py-1 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-60"
                        >
                          Edit
                        </button>
                        <form action={(fd) => runAction(deletePlatformOpsPaymentAction, fd)}>
                          <input type="hidden" name="id" value={payment.id} />
                          <button
                            type="submit"
                            disabled={isPending}
                            className="rounded-lg bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editing ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Edit payment</h3>
            <form action={(fd) => runAction(updatePlatformOpsPaymentAction, fd)} className="mt-4 space-y-3">
              <input type="hidden" name="id" value={editing.id} />
              <input name="title" required defaultValue={editing.title} className="ui-input w-full" />
              <select name="category" defaultValue={editing.category} className="ui-select w-full">
                {Object.entries(PLATFORM_OPS_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="amount"
                min="0"
                step="0.01"
                defaultValue={editing.amount ?? ""}
                placeholder="Amount"
                className="ui-input w-full"
              />
              <input
                type="datetime-local"
                name="due_at"
                required
                defaultValue={toDateInputValue(editing.due_at)}
                className="ui-input w-full"
              />
              <input type="hidden" name="currency" value={editing.currency} />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  name="reminder_enabled"
                  value="true"
                  defaultChecked={editing.reminder_enabled}
                  className="h-4 w-4 accent-violet-600"
                />
                Email reminders enabled
              </label>
              <textarea name="notes" rows={3} defaultValue={editing.notes ?? ""} className="ui-textarea w-full" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditingId(null)} className="btn btn-secondary rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="btn btn-primary rounded-xl disabled:opacity-70">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {paying ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Mark as paid</h3>
            <p className="mt-1 text-sm text-slate-600">
              <span className="font-semibold">{paying.title}</span>
            </p>
            <form action={(fd) => runAction(markPlatformOpsPaymentPaidAction, fd)} className="mt-4 space-y-3">
              <input type="hidden" name="id" value={paying.id} />
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Next due date (optional — for renewals)
                </span>
                <input type="datetime-local" name="next_due_at" className="ui-input w-full" />
                <span className="text-xs text-slate-500">
                  Leave empty to close this item. Set a future date to schedule the next renewal reminders.
                </span>
              </label>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setPayingId(null)} className="btn btn-secondary rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="btn btn-success rounded-xl disabled:opacity-70">
                  Confirm paid
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

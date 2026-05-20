import Link from "next/link";
import { ZbounContactOptions } from "@/components/zboun-contact-options";
import {
  formatNextDueLine,
  formatSubscriptionStatus,
  isSubscriptionPastDue,
  subscriptionStatusBadgeClass,
} from "@/lib/subscription-display";
import { formatDateLong } from "@/lib/subscription-billing";

type SubscriptionInfo = {
  status: string;
  next_due_at: string | null;
  billing_cycle_price: number;
  start_at: string;
  ended_at: string | null;
};

type InvoiceRow = {
  id: string;
  period_start: string | null;
  period_end: string | null;
  amount_due: number;
  amount_paid: number;
  status: string;
  due_at: string;
  created_at: string;
};

type Props = {
  restaurantName: string;
  isActive: boolean;
  subscription: SubscriptionInfo | null;
  invoices: InvoiceRow[];
  opsEmail: string;
};

export function BusinessBillingPanel({
  restaurantName,
  isActive,
  subscription,
  invoices,
  opsEmail,
}: Props) {
  const pastDue = subscription
    ? isSubscriptionPastDue(subscription.next_due_at, subscription.status)
    : false;

  return (
    <div className="space-y-6">
      <header className="panel rounded-2xl bg-gradient-to-br from-violet-700 via-violet-600 to-fuchsia-600 p-6 text-white">
        <p className="text-[11px] font-bold uppercase tracking-widest text-violet-200">Billing</p>
        <h1 className="mt-1 text-2xl font-bold">{restaurantName}</h1>
        <p className="mt-2 text-sm text-violet-100">
          Subscription and invoices for your Zboun account. Contact us to renew or update your plan.
        </p>
        <div className="mt-4">
          <Link href="/dashboard/business" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">
            ← Dashboard
          </Link>
        </div>
      </header>

      <ZbounContactOptions variant="billing" restaurantName={restaurantName} />

      <section className="panel rounded-2xl p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Account status</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
            }`}
          >
            {isActive ? "Active" : "Deactivated"}
          </span>
          {subscription ? (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${subscriptionStatusBadgeClass(
                subscription.status,
                pastDue,
              )}`}
            >
              {formatSubscriptionStatus(subscription.status)}
            </span>
          ) : null}
        </div>
        {!isActive ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Your account is deactivated. Use the contact options above (email or WhatsApp) to renew
            and restore access.
          </p>
        ) : null}
      </section>

      {subscription ? (
        <section className="panel rounded-2xl p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Current subscription</h2>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Monthly fee</dt>
              <dd className="font-semibold text-slate-900">
                USD {Number(subscription.billing_cycle_price).toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Period started</dt>
              <dd className="font-semibold text-slate-900">
                {formatDateLong(new Date(subscription.start_at))}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Next due / period ends</dt>
              <dd className="font-semibold text-slate-900">
                {formatNextDueLine(subscription.next_due_at)}
              </dd>
            </div>
            {subscription.ended_at ? (
              <div>
                <dt className="text-slate-500">Ended</dt>
                <dd className="font-semibold text-slate-900">
                  {formatDateLong(new Date(subscription.ended_at))}
                </dd>
              </div>
            ) : null}
          </dl>
          {pastDue && isActive ? (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Your subscription period has ended. Please contact Zboun to renew before your account is
              deactivated.
            </p>
          ) : null}
        </section>
      ) : (
        <section className="panel rounded-2xl p-5 text-sm text-slate-600">
          No subscription record is linked to this account yet. Contact us by email or WhatsApp if this
          looks wrong.
        </section>
      )}

      <section className="panel overflow-x-auto rounded-2xl p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Invoices</h2>
        {invoices.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No invoices yet.</p>
        ) : (
          <table className="mt-3 w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3">Period</th>
                <th className="py-2 pr-3">Due</th>
                <th className="py-2 pr-3">Amount</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-slate-100">
                  <td className="py-3 pr-3 text-slate-700">
                    {invoice.period_start && invoice.period_end
                      ? `${invoice.period_start} → ${invoice.period_end}`
                      : "—"}
                  </td>
                  <td className="py-3 pr-3 text-slate-700">
                    {new Date(invoice.due_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-3 font-medium text-slate-900">
                    ${Number(invoice.amount_due).toFixed(2)}
                    {Number(invoice.amount_paid) > 0
                      ? ` (paid $${Number(invoice.amount_paid).toFixed(2)})`
                      : ""}
                  </td>
                  <td className="py-3 capitalize text-slate-700">{invoice.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="mt-4 text-xs text-slate-500">
          Payments are recorded by Zboun after renewal. To pay or renew, contact us by email or
          WhatsApp using the section above.
        </p>
      </section>
    </div>
  );
}

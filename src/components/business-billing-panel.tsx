import { ZbounContactOptions } from "@/components/zboun-contact-options";
import {
  formatNextDueLine,
  formatSubscriptionStatus,
  isSubscriptionPastDue,
} from "@/lib/subscription-display";
import { hasComplimentaryAccess } from "@/lib/complimentary-billing";
import {
  billingCycleLabel,
  inferSubscriptionInterval,
  subscriptionPlanLabel,
  type SubscriptionInterval,
} from "@/lib/pricing";
import { formatDateLong } from "@/lib/subscription-billing";

type SubscriptionInfo = {
  status: string;
  next_due_at: string | null;
  billing_cycle_price: number;
  start_at: string;
  ended_at: string | null;
  plan_interval?: SubscriptionInterval | null;
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
  billingExempt: boolean;
  subscription: SubscriptionInfo | null;
  invoices: InvoiceRow[];
  opsEmail: string;
};

export function BusinessBillingPanel({
  restaurantName,
  isActive,
  billingExempt,
  subscription,
  invoices,
  opsEmail,
}: Props) {
  const complimentaryAccess = billingExempt
    || (subscription
      ? hasComplimentaryAccess(
          billingExempt,
          subscription.billing_cycle_price,
          subscription.next_due_at,
        )
      : false);
  const timedComplimentary = complimentaryAccess && !billingExempt;
  const pastDue = subscription
    ? !complimentaryAccess &&
      isSubscriptionPastDue(subscription.next_due_at, subscription.status)
    : false;
  const billingInterval =
    subscription?.plan_interval ?? inferSubscriptionInterval(subscription?.billing_cycle_price);

  return (
    <div className="space-y-6">
      <ZbounContactOptions variant="billing" restaurantName={restaurantName} />

      <section className="panel rounded-2xl p-5 sm:p-6">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Account status</h2>
        <div className={`mt-4 grid gap-3 ${subscription ? "sm:grid-cols-2" : "grid-cols-1"}`}>
          <div
            className={`rounded-2xl border px-5 py-4 ${
              isActive
                ? "border-emerald-200 bg-emerald-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Store</p>
            <p
              className={`mt-1.5 text-lg font-bold sm:text-xl ${
                isActive ? "text-emerald-800" : "text-red-800"
              }`}
            >
              {isActive ? "Active" : "Deactivated"}
            </p>
          </div>
          {subscription ? (
            <div
              className={`rounded-2xl border px-5 py-4 ${
                pastDue || subscription.status === "overdue"
                  ? "border-red-200 bg-red-50"
                  : subscription.status === "active" ||
                      subscription.status === "trial" ||
                      billingExempt ||
                      timedComplimentary
                    ? "border-emerald-200 bg-emerald-50"
                    : subscription.status === "paused"
                      ? "border-amber-200 bg-amber-50"
                      : "border-slate-200 bg-slate-50"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Plan</p>
              <p
                className={`mt-1.5 text-lg font-bold sm:text-xl ${
                  pastDue || subscription.status === "overdue"
                    ? "text-red-800"
                    : subscription.status === "active" ||
                        subscription.status === "trial" ||
                        billingExempt ||
                        timedComplimentary
                      ? "text-emerald-800"
                      : subscription.status === "paused"
                        ? "text-amber-800"
                        : "text-slate-700"
                }`}
              >
                {billingExempt
                  ? "Lifetime free"
                  : timedComplimentary
                    ? "Complimentary"
                    : formatSubscriptionStatus(subscription.status)}
              </p>
            </div>
          ) : null}
        </div>
        {!isActive && !billingExempt ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Your account is deactivated. Use the contact options above (email or WhatsApp) to renew
            and restore access.
          </p>
        ) : null}
      </section>

      {subscription ? (
        <section className="panel rounded-2xl p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Current subscription</h2>
          {billingExempt ? (
            <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              This account is complimentary for life. There is no monthly fee and your dashboard will
              not be locked for non-payment.
            </p>
          ) : timedComplimentary ? (
            <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              This account is complimentary until{" "}
              <strong>{formatDateLong(new Date(subscription.next_due_at as string))}</strong>. After
              that, standard monthly billing applies.
            </p>
          ) : (
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Plan</dt>
                <dd className="font-semibold text-slate-900">
                  {subscriptionPlanLabel(billingInterval)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Subscription fee</dt>
                <dd className="font-semibold text-slate-900">
                  {billingCycleLabel(subscription.billing_cycle_price, billingInterval)}
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
                  {formatNextDueLine(
                    subscription.next_due_at,
                    billingExempt,
                    subscription.billing_cycle_price,
                  )}
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
          )}
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

      {!billingExempt ? (
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
      ) : null}
    </div>
  );
}

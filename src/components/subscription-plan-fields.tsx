"use client";

import {
  formatSubscriptionPriceLabel,
  subscriptionPlanLabel,
  yearlySavings,
  ZBOUN_PRICING,
  type SubscriptionInterval,
} from "@/lib/pricing";

type Props = {
  disabled?: boolean;
  defaultInterval?: SubscriptionInterval;
};

export function SubscriptionPlanFields({
  disabled = false,
  defaultInterval = "monthly",
}: Props) {
  return (
    <div
      className={`space-y-3 rounded-xl border border-violet-200 bg-violet-50 p-3 ${
        disabled ? "opacity-60" : ""
      }`}
    >
      <div>
        <p className="text-sm font-semibold text-violet-900">Subscription plan</p>
        <p className="mt-1 text-xs text-violet-800">
          Choose monthly or yearly billing for this business. Hidden when complimentary free access is
          enabled.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {(["monthly", "yearly"] as const).map((interval) => (
          <label
            key={interval}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border bg-white p-3 transition ${
              disabled ? "cursor-not-allowed" : "hover:border-violet-300"
            }`}
          >
            <input
              type="radio"
              name={disabled ? undefined : "subscription_interval"}
              value={interval}
              defaultChecked={defaultInterval === interval}
              disabled={disabled}
              className="mt-0.5 h-4 w-4 accent-violet-600"
            />
            <span className="space-y-1">
              <span className="block text-sm font-semibold text-slate-900">
                {subscriptionPlanLabel(interval)}
              </span>
              <span className="block text-xs text-slate-600">
                {formatSubscriptionPriceLabel(interval)}
                {interval === "yearly"
                  ? ` — save ${ZBOUN_PRICING.symbol}${yearlySavings()} vs monthly`
                  : " — flexible, cancel anytime"}
              </span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  createMenuCouponCodeAction,
  deleteMenuCouponCodeAction,
  toggleMenuCouponCodeAction,
} from "@/app-actions/menu-coupon-codes";
import {
  formatCouponUsage,
  isCouponCodeActive,
  type MenuCouponCode,
} from "@/lib/menu-coupon-codes";
import { OptionalDateTimeField } from "@/components/optional-datetime-field";

type Props = {
  coupons: MenuCouponCode[];
};

function formatDateRange(coupon: MenuCouponCode) {
  if (!coupon.starts_at && !coupon.ends_at) return "Always on (until disabled)";
  const start = coupon.starts_at ? new Date(coupon.starts_at).toLocaleString() : "Now";
  const end = coupon.ends_at ? new Date(coupon.ends_at).toLocaleString() : "No end date";
  return `${start} → ${end}`;
}

export function MenuCouponCodesPanel({ coupons }: Props) {
  const [codeInput, setCodeInput] = useState("");

  return (
    <section id="coupons" className="panel overflow-x-hidden p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="panel-title">Coupon codes</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {coupons.length} {coupons.length === 1 ? "code" : "codes"}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Create shareable promo codes for a percentage off the full order (items + delivery). Customers enter the code at
        checkout.
      </p>

      <form action={createMenuCouponCodeAction} className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-sm font-semibold text-slate-900">New coupon code</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Code</span>
            <input
              name="code"
              required
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="SUMMER20"
              maxLength={32}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono uppercase tracking-wide text-slate-900 outline-none ring-violet-200 focus:ring-2"
            />
            <span className="mt-1 block text-[11px] text-slate-500">3–32 characters: letters, numbers, - or _</span>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">% off full order</span>
            <input
              name="percent_off"
              type="number"
              required
              min={1}
              max={100}
              step={0.01}
              placeholder="15"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-violet-200 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Max uses <span className="font-normal normal-case">(optional)</span>
            </span>
            <input
              name="max_uses"
              type="number"
              min={1}
              step={1}
              placeholder="Unlimited"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-violet-200 focus:ring-2"
            />
          </label>
          <OptionalDateTimeField name="starts_at" label="Starts (optional)" defaultTime="00:00" />
          <OptionalDateTimeField name="ends_at" label="Ends (optional)" defaultTime="23:59" />
        </div>
        <input type="hidden" name="is_active" value="true" />
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 active:scale-[0.99]"
        >
          Create coupon
        </button>
      </form>

      {coupons.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">No coupon codes yet. Create one above to share with customers.</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {coupons.map((coupon) => {
            const active = isCouponCodeActive(coupon);
            return (
              <li
                key={coupon.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-base font-bold tracking-wide text-slate-900">{coupon.code}</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      {coupon.percent_off}% off
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{formatDateRange(coupon)}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{formatCouponUsage(coupon)}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <form action={toggleMenuCouponCodeAction}>
                    <input type="hidden" name="id" value={coupon.id} />
                    <input type="hidden" name="is_active" value={coupon.is_active ? "false" : "true"} />
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {coupon.is_active ? "Pause" : "Resume"}
                    </button>
                  </form>
                  <form action={deleteMenuCouponCodeAction}>
                    <input type="hidden" name="id" value={coupon.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

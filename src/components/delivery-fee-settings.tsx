"use client";

import { Bike } from "lucide-react";
import { useState } from "react";

type Props = {
  freeDeliveryDefault?: boolean;
  deliveryFeeDefault?: number;
};

export function DeliveryFeeSettings({
  freeDeliveryDefault = false,
  deliveryFeeDefault = 0,
}: Props) {
  const [freeDelivery, setFreeDelivery] = useState(freeDeliveryDefault);

  return (
    <section className="panel p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <Bike className="h-5 w-5" strokeWidth={2} aria-hidden />
        </span>
        <div>
          <h2 className="panel-title">Delivery fee</h2>
          <p className="mt-1 text-sm text-slate-500">
            Control what customers pay for delivery at checkout and what appears on your home page card.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <label
          className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3.5 transition ${
            freeDelivery
              ? "border-emerald-300 bg-emerald-50/80 ring-1 ring-emerald-200/60"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Free delivery</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              Waive delivery charges and show a <span className="font-semibold text-[#E23744]">FREE DELIVERY</span>{" "}
              badge on the home page.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2">
            <input
              type="checkbox"
              name="free_delivery"
              value="true"
              checked={freeDelivery}
              onChange={(e) => setFreeDelivery(e.target.checked)}
              className="peer sr-only"
            />
            <span
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                freeDelivery ? "bg-emerald-500" : "bg-slate-200"
              }`}
              aria-hidden
            >
              <span
                className={`block h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  freeDelivery ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </span>
          </span>
        </label>

        <div
          className={`rounded-xl border border-slate-200 bg-slate-50/80 p-4 transition ${
            freeDelivery ? "opacity-60" : ""
          }`}
        >
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Standard delivery fee (USD)
            </span>
            <div className="relative max-w-xs">
              <span
                className="pointer-events-none absolute left-3.5 top-1/2 z-[1] -translate-y-1/2 text-sm font-medium text-slate-400"
                aria-hidden
              >
                $
              </span>
              <input
                name="delivery_fee_usd"
                type="number"
                step="0.01"
                min={0.01}
                required
                defaultValue={deliveryFeeDefault > 0 ? String(deliveryFeeDefault) : ""}
                placeholder="2.50"
                className="ui-input ui-input-currency w-full"
              />
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              {freeDelivery
                ? "This fee is saved but not charged while free delivery is on. Minimum $0.01."
                : "Added to the order total at checkout. Minimum $0.01."}
            </p>
          </label>
        </div>
      </div>
    </section>
  );
}

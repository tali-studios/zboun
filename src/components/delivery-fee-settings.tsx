"use client";

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
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Delivery fee</p>
      <p className="mt-1 text-xs text-slate-500">
        Set your standard delivery charge. Turn on free delivery to waive it for customers and show a
        badge on the home page.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            name="free_delivery"
            value="true"
            checked={freeDelivery}
            onChange={(e) => setFreeDelivery(e.target.checked)}
            className="h-4 w-4 accent-violet-600"
          />
          <span className="font-medium">Free delivery (promo)</span>
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Standard delivery fee (USD)
          </span>
          <input
            name="delivery_fee_usd"
            type="number"
            step="0.01"
            min={0}
            defaultValue={String(deliveryFeeDefault)}
            placeholder="e.g. 2.50"
            className="ui-input"
          />
          <p className="text-xs text-slate-500">
            {freeDelivery
              ? "Saved for later — customers pay $0 while free delivery is on."
              : "Added to every order at checkout."}
          </p>
        </label>
      </div>
    </div>
  );
}

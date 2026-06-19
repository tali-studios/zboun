"use client";

import { Bike, MapPin, Zap } from "lucide-react";
import { useState } from "react";
import {
  MAX_RESTAURANT_DELIVERY_RADIUS_KM,
  MIN_RESTAURANT_DELIVERY_RADIUS_KM,
} from "@/lib/delivery-radius";
import { env } from "@/lib/env";

type Props = {
  freeDeliveryDefault?: boolean;
  deliveryFeeDefault?: number;
  fastDeliveryEnabledDefault?: boolean;
  fastDeliveryFeeDefault?: number;
  deliveryRadiusDefault?: number | null;
};

export function DeliveryFeeSettings({
  freeDeliveryDefault = false,
  deliveryFeeDefault = 0,
  fastDeliveryEnabledDefault = false,
  fastDeliveryFeeDefault = 0,
  deliveryRadiusDefault = null,
}: Props) {
  const [freeDelivery, setFreeDelivery] = useState(freeDeliveryDefault);
  const [fastDeliveryEnabled, setFastDeliveryEnabled] = useState(fastDeliveryEnabledDefault);

  return (
    <section className="panel p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <Bike className="h-5 w-5" strokeWidth={2} aria-hidden />
        </span>
        <div>
          <h2 className="panel-title">Delivery settings</h2>
          <p className="mt-1 text-sm text-slate-500">
            Set how far you deliver, what customers pay at checkout, and what appears on your home page card.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <label className="block space-y-1.5">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <MapPin className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              Maximum delivery distance (km)
            </span>
            <input
              name="delivery_radius_km"
              type="number"
              step="0.5"
              min={MIN_RESTAURANT_DELIVERY_RADIUS_KM}
              max={MAX_RESTAURANT_DELIVERY_RADIUS_KM}
              required
              defaultValue={
                deliveryRadiusDefault != null && deliveryRadiusDefault > 0
                  ? String(deliveryRadiusDefault)
                  : String(env.defaultDeliveryRadiusKm)
              }
              placeholder="5"
              className="ui-input max-w-xs"
            />
            <p className="text-xs leading-relaxed text-slate-500">
              Customers farther than this from your store location won&apos;t see you on the home page and can&apos;t
              place delivery orders. Measured from your branch pin on the map ({MIN_RESTAURANT_DELIVERY_RADIUS_KM}–
              {MAX_RESTAURANT_DELIVERY_RADIUS_KM} km).
            </p>
          </label>
        </div>

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

        <label
          className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3.5 transition ${
            fastDeliveryEnabled
              ? "border-amber-300 bg-amber-50/80 ring-1 ring-amber-200/60"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <Zap className="h-4 w-4 text-amber-500" strokeWidth={2} aria-hidden />
              Fast delivery
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              Let customers choose a priority delivery option. A dedicated driver picks up the order as soon as it is
              ready. Shows a <span className="font-semibold text-amber-600">FAST DELIVERY</span> badge on the home page.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2">
            <input
              type="checkbox"
              name="fast_delivery_enabled"
              value="true"
              checked={fastDeliveryEnabled}
              onChange={(e) => setFastDeliveryEnabled(e.target.checked)}
              className="peer sr-only"
            />
            <span
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                fastDeliveryEnabled ? "bg-amber-500" : "bg-slate-200"
              }`}
              aria-hidden
            >
              <span
                className={`block h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  fastDeliveryEnabled ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </span>
          </span>
        </label>

        <div
          className={`rounded-xl border border-slate-200 bg-slate-50/80 p-4 transition ${
            fastDeliveryEnabled ? "" : "opacity-60"
          }`}
        >
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Fast delivery fee (USD)
            </span>
            <div className="relative max-w-xs">
              <span
                className="pointer-events-none absolute left-3.5 top-1/2 z-[1] -translate-y-1/2 text-sm font-medium text-slate-400"
                aria-hidden
              >
                $
              </span>
              <input
                name="fast_delivery_fee_usd"
                type="number"
                step="0.01"
                min={0.01}
                required={fastDeliveryEnabled}
                defaultValue={fastDeliveryFeeDefault > 0 ? String(fastDeliveryFeeDefault) : ""}
                placeholder="5.00"
                className="ui-input ui-input-currency w-full"
              />
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              {fastDeliveryEnabled
                ? "Required when fast delivery is on. Charged on top of the order when a customer picks fast delivery."
                : "Set a price before enabling fast delivery. Minimum $0.01."}
            </p>
          </label>
        </div>
      </div>
    </section>
  );
}

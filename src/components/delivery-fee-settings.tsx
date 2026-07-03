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

function ToggleSwitch({
  checked,
  onChange,
  name,
  activeClass,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  name: string;
  activeClass: string;
}) {
  return (
    <span className="relative inline-flex shrink-0 items-center">
      <input
        type="checkbox"
        name={name}
        value="true"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
          checked ? activeClass : "bg-slate-200"
        }`}
        aria-hidden
      >
        <span
          className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </span>
  );
}

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
    <div>
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
          <Bike className="h-4 w-4" strokeWidth={2} aria-hidden />
        </span>
        <div>
          <h2 className="panel-title">Delivery settings</h2>
          <p className="text-xs text-slate-500">How far you deliver and what customers pay.</p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2">
          <label
            htmlFor="delivery_radius_km"
            className="flex min-w-[13rem] flex-1 items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            Max delivery distance (km)
          </label>
          <input
            id="delivery_radius_km"
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
            className="ui-input h-9 w-24 shrink-0 py-1.5"
          />
        </div>

        <div
          className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border px-3 py-2 transition ${
            freeDelivery
              ? "border-emerald-300 bg-emerald-50/80"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="min-w-[11rem] flex-1">
            <p className="text-sm font-semibold text-slate-900">Free delivery</p>
            <p className="text-xs leading-snug text-slate-500">
              Shows a <span className="font-semibold text-[#E23744]">FREE DELIVERY</span> badge on the home page.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="relative w-24">
              <span
                className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-sm font-medium text-slate-400"
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
                aria-label="Standard delivery fee (USD)"
                title={freeDelivery ? "Saved but not charged while free delivery is on." : "Standard delivery fee (USD)"}
                className="ui-input ui-input-currency h-9 w-full py-1.5"
              />
            </div>
            <ToggleSwitch
              name="free_delivery"
              checked={freeDelivery}
              onChange={setFreeDelivery}
              activeClass="bg-emerald-500"
            />
          </div>
        </div>

        <div
          className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border px-3 py-2 transition ${
            fastDeliveryEnabled
              ? "border-amber-300 bg-amber-50/80"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="min-w-[11rem] flex-1">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <Zap className="h-3.5 w-3.5 text-amber-500" strokeWidth={2} aria-hidden />
              Fast delivery
            </p>
            <p className="text-xs leading-snug text-slate-500">
              Priority option with a <span className="font-semibold text-amber-600">FAST DELIVERY</span> badge.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="relative w-24">
              <span
                className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-sm font-medium text-slate-400"
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
                aria-label="Fast delivery fee (USD)"
                title="Fast delivery fee (USD)"
                className="ui-input ui-input-currency h-9 w-full py-1.5"
              />
            </div>
            <ToggleSwitch
              name="fast_delivery_enabled"
              checked={fastDeliveryEnabled}
              onChange={setFastDeliveryEnabled}
              activeClass="bg-amber-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

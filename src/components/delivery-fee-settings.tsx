"use client";

import { Gift, Globe, MapPin, Users, Zap } from "lucide-react";
import { useState, type ReactNode } from "react";
import { DeliveryTiersPanel } from "@/components/delivery-tiers-panel";
import {
  MAX_RESTAURANT_DELIVERY_RADIUS_KM,
  MIN_RESTAURANT_DELIVERY_RADIUS_KM,
} from "@/lib/delivery-radius";
import { env } from "@/lib/env";

type DeliveryTier = {
  id: string;
  min_distance_km: number;
  max_distance_km: number;
  fee_usd: number;
  position: number;
};

type Props = {
  freeDeliveryDefault?: boolean;
  deliveryFeeDefault?: number;
  fastDeliveryEnabledDefault?: boolean;
  fastDeliveryFeeDefault?: number;
  deliveryRadiusDefault?: number | null;
  deliversNationwideDefault?: boolean;
  driverManagementEnabledDefault?: boolean;
  restaurantId?: string;
  deliveryTiers?: DeliveryTier[];
  fastDeliveryTiers?: DeliveryTier[];
};

const MAX_RESTAURANT_DELIVERY_RADIUS_KM = 100;

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
    <span className="inline-flex shrink-0 items-center">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`inline-flex h-5 w-9 items-center rounded-full border-0 p-0 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${
          checked ? activeClass : "bg-slate-200"
        }`}
      >
        <span className="sr-only">{checked ? "On" : "Off"}</span>
        <span
          className={`block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? "translate-x-[16px]" : "translate-x-0.5"
          }`}
        />
      </button>
      {checked ? <input type="hidden" name={name} value="true" /> : null}
    </span>
  );
}

function SettingTile({
  icon,
  iconClass,
  title,
  toggle,
  children,
}: {
  icon: ReactNode;
  iconClass: string;
  title: string;
  toggle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
          >
            {icon}
          </span>
          <p className="truncate text-sm font-semibold text-slate-800">{title}</p>
        </div>
        {toggle}
      </div>
      {children}
    </div>
  );
}

function FieldShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100">
      {children}
    </div>
  );
}

export function DeliveryFeeSettings({
  freeDeliveryDefault = false,
  deliveryFeeDefault = 0,
  fastDeliveryEnabledDefault = false,
  fastDeliveryFeeDefault = 0,
  deliveryRadiusDefault = null,
  deliversNationwideDefault = false,
  driverManagementEnabledDefault = false,
  restaurantId,
  deliveryTiers = [],
  fastDeliveryTiers = [],
}: Props) {
  const [freeDelivery, setFreeDelivery] = useState(freeDeliveryDefault);
  const [fastDeliveryEnabled, setFastDeliveryEnabled] = useState(fastDeliveryEnabledDefault);
  const [deliversNationwide, setDeliversNationwide] = useState(deliversNationwideDefault);
  const [driverManagementEnabled, setDriverManagementEnabled] = useState(driverManagementEnabledDefault);

  return (
    <div>
      <h2 className="panel-title">Delivery settings</h2>

      <div className="mt-3 grid grid-cols-1 gap-2.5">
        <SettingTile
          icon={<Globe className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />}
          iconClass="bg-blue-100 text-blue-600"
          title="Deliver across all Lebanon"
          toggle={
            <ToggleSwitch
              name="delivers_nationwide"
              checked={deliversNationwide}
              onChange={setDeliversNationwide}
              activeClass="bg-blue-500"
            />
          }
        >
          <div
            className={`flex h-9 items-center justify-center rounded-xl border text-xs font-semibold ${
              deliversNationwide
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-400"
            }`}
          >
            {deliversNationwide
              ? "✓ Your store appears to all customers across Lebanon"
              : "Limited to delivery radius below"}
          </div>
        </SettingTile>

        {deliversNationwide ? (
          // Hidden field when nationwide is enabled - still submit a value for the backend
          <input 
            type="hidden" 
            name="delivery_radius_km" 
            value={String(MAX_RESTAURANT_DELIVERY_RADIUS_KM)} 
          />
        ) : (
        <SettingTile
          icon={<MapPin className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />}
          iconClass="bg-sky-100 text-sky-600"
          title="Max distance"
        >
          <label htmlFor="delivery_radius_km" className="sr-only">
            Max delivery distance (km)
          </label>
          <FieldShell>
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
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-medium text-slate-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              km
            </span>
          </FieldShell>
        </SettingTile>
        )}

        <SettingTile
          icon={<Gift className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />}
          iconClass="bg-emerald-100 text-emerald-600"
          title="Free delivery"
          toggle={
            <ToggleSwitch
              name="free_delivery"
              checked={freeDelivery}
              onChange={setFreeDelivery}
              activeClass="bg-emerald-500"
            />
          }
        >
          <FieldShell>
            <span className="shrink-0 text-sm font-medium text-slate-400" aria-hidden>
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
              title={
                freeDelivery
                  ? "Saved but not charged while free delivery is on."
                  : "Standard delivery fee (USD)"
              }
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-medium text-slate-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </FieldShell>
        </SettingTile>

        <SettingTile
          icon={<Zap className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />}
          iconClass="bg-amber-100 text-amber-600"
          title="Fast delivery"
          toggle={
            <ToggleSwitch
              name="fast_delivery_enabled"
              checked={fastDeliveryEnabled}
              onChange={setFastDeliveryEnabled}
              activeClass="bg-amber-500"
            />
          }
        >
          <FieldShell>
            <span className="shrink-0 text-sm font-medium text-slate-400" aria-hidden>
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
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-medium text-slate-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </FieldShell>
        </SettingTile>

        <SettingTile
          icon={<Users className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />}
          iconClass="bg-violet-100 text-violet-600"
          title="Drivers"
          toggle={
            <ToggleSwitch
              name="driver_management_enabled"
              checked={driverManagementEnabled}
              onChange={setDriverManagementEnabled}
              activeClass="bg-violet-600"
            />
          }
        >
          <div
            className={`flex h-9 items-center justify-center rounded-xl border text-xs font-semibold ${
              driverManagementEnabled
                ? "border-violet-200 bg-violet-50 text-violet-700"
                : "border-slate-200 bg-white text-slate-400"
            }`}
          >
            {driverManagementEnabled ? "Enabled" : "Disabled"}
          </div>
        </SettingTile>
      </div>

      {/* Distance-based delivery tiers */}
      {restaurantId && (
        <div className="mt-5 space-y-5 border-t border-slate-200 pt-5">
          {/* Regular delivery tiers - hidden when free delivery is enabled */}
          {!freeDelivery && (
            <DeliveryTiersPanel 
              restaurantId={restaurantId} 
              initialTiers={deliveryTiers}
              deliveryType="regular"
              maxDeliveryRadius={deliversNationwide ? MAX_RESTAURANT_DELIVERY_RADIUS_KM : (deliveryRadiusDefault ?? MAX_RESTAURANT_DELIVERY_RADIUS_KM)}
            />
          )}
          
          {/* Fast delivery tiers - show when fast delivery is enabled (independent of free delivery) */}
          {fastDeliveryEnabled && (
            <div className={!freeDelivery ? "border-t border-slate-200 pt-5" : ""}>
              <DeliveryTiersPanel 
                restaurantId={restaurantId} 
                initialTiers={fastDeliveryTiers}
                deliveryType="fast"
                maxDeliveryRadius={deliversNationwide ? MAX_RESTAURANT_DELIVERY_RADIUS_KM : (deliveryRadiusDefault ?? MAX_RESTAURANT_DELIVERY_RADIUS_KM)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

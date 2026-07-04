"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_STOCK_ALERT_CRITICAL,
  DEFAULT_STOCK_ALERT_URGENT,
  DEFAULT_STOCK_ALERT_WARNING,
  validateStockAlertThresholds,
} from "@/lib/menu-item-stock";

type Props = {
  idPrefix?: string;
  defaultTrackStock?: boolean;
  defaultStockQuantity?: number | null;
  defaultWarningQty?: number | null;
  defaultUrgentQty?: number | null;
  defaultCriticalQty?: number | null;
};

export function MenuItemStockFields({
  idPrefix = "",
  defaultTrackStock = false,
  defaultStockQuantity = null,
  defaultWarningQty = null,
  defaultUrgentQty = null,
  defaultCriticalQty = null,
}: Props) {
  const [trackStock, setTrackStock] = useState(defaultTrackStock);
  const [warningQty, setWarningQty] = useState(String(defaultWarningQty ?? DEFAULT_STOCK_ALERT_WARNING));
  const [urgentQty, setUrgentQty] = useState(String(defaultUrgentQty ?? DEFAULT_STOCK_ALERT_URGENT));
  const [criticalQty, setCriticalQty] = useState(String(defaultCriticalQty ?? DEFAULT_STOCK_ALERT_CRITICAL));
  const fieldId = (name: string) => `${idPrefix}${name}`;

  const thresholdError = useMemo(() => {
    if (!trackStock) return null;
    const warning = Number(warningQty);
    const urgent = Number(urgentQty);
    const critical = Number(criticalQty);
    if (![warning, urgent, critical].every((n) => Number.isFinite(n) && n >= 1)) {
      return "Each threshold must be a whole number of at least 1.";
    }
    return validateStockAlertThresholds({
      warning_qty: Math.floor(warning),
      urgent_qty: Math.floor(urgent),
      critical_qty: Math.floor(critical),
    });
  }, [trackStock, warningQty, urgentQty, criticalQty]);

  return (
    <div className="space-y-4">
      <input type="hidden" name="track_stock" value={trackStock ? "true" : "false"} />

      {/* Enable / disable row */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">Enable stock tracking</p>
          <p className="text-xs text-slate-500">
            Counts down with every order · shows availability · sends email alerts
          </p>
        </div>
        <button
          type="button"
          onClick={() => setTrackStock((v) => !v)}
          aria-pressed={trackStock}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center overflow-hidden rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 ${
            trackStock ? "bg-violet-600 justify-end" : "bg-slate-300 justify-start"
          }`}
        >
          <span className="sr-only">{trackStock ? "Disable" : "Enable"} stock tracking</span>
          <span className="pointer-events-none h-6 w-6 shrink-0 rounded-full bg-white shadow" />
        </button>
      </div>

      {/* Quantity */}
      <div>
        <label
          htmlFor={fieldId("stock_quantity")}
          className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500"
        >
          Quantity in stock{trackStock && <span className="ml-1 text-red-500">*</span>}
        </label>
        <div className="flex items-center gap-3">
          <input
            id={fieldId("stock_quantity")}
            name="stock_quantity"
            type="number"
            min={0}
            step={1}
            defaultValue={defaultStockQuantity ?? 10}
            disabled={!trackStock}
            className={`ui-input w-28 tabular-nums ${!trackStock ? "opacity-40" : ""}`}
            required={trackStock}
          />
          <p className="text-xs text-slate-400">units currently available</p>
        </div>
      </div>

      {/* Alert thresholds */}
      <div>
        <p className="mb-0.5 text-xs font-bold uppercase tracking-wide text-slate-500">
          Email alert thresholds
        </p>
        <p className="mb-3 text-xs text-slate-400">
          Get notified when stock drops to these levels. Warning → Urgent → Very urgent (e.g. 10 → 5 → 3).
        </p>
        <div className={`grid gap-3 sm:grid-cols-3 ${!trackStock ? "opacity-40 pointer-events-none" : ""}`}>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="text-amber-500">⚠</span>
              <span className="text-xs font-semibold text-amber-700">Warning</span>
            </div>
            <input
              id={fieldId("stock_alert_warning_qty")}
              name="stock_alert_warning_qty"
              type="number"
              min={1}
              step={1}
              value={warningQty}
              onChange={(e) => setWarningQty(e.target.value)}
              className="w-full rounded-lg border border-amber-300 bg-white px-2 py-1.5 text-sm font-semibold tabular-nums text-amber-900 outline-none focus:ring-2 focus:ring-amber-300"
              required={trackStock}
            />
            <p className="mt-1 text-[10px] text-amber-600">e.g. 10 items left</p>
          </div>

          <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="text-orange-500">🔶</span>
              <span className="text-xs font-semibold text-orange-700">Urgent</span>
            </div>
            <input
              id={fieldId("stock_alert_urgent_qty")}
              name="stock_alert_urgent_qty"
              type="number"
              min={1}
              step={1}
              value={urgentQty}
              onChange={(e) => setUrgentQty(e.target.value)}
              className="w-full rounded-lg border border-orange-300 bg-white px-2 py-1.5 text-sm font-semibold tabular-nums text-orange-900 outline-none focus:ring-2 focus:ring-orange-300"
              required={trackStock}
            />
            <p className="mt-1 text-[10px] text-orange-600">e.g. 5 items left</p>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-3">
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="text-red-500">🚨</span>
              <span className="text-xs font-semibold text-red-700">Very urgent</span>
            </div>
            <input
              id={fieldId("stock_alert_critical_qty")}
              name="stock_alert_critical_qty"
              type="number"
              min={1}
              step={1}
              value={criticalQty}
              onChange={(e) => setCriticalQty(e.target.value)}
              className="w-full rounded-lg border border-red-300 bg-white px-2 py-1.5 text-sm font-semibold tabular-nums text-red-900 outline-none focus:ring-2 focus:ring-red-300"
              required={trackStock}
            />
            <p className="mt-1 text-[10px] text-red-600">e.g. 3 items left</p>
          </div>
        </div>

        {thresholdError && (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
            ⚠ {thresholdError}
          </p>
        )}
      </div>
    </div>
  );
}

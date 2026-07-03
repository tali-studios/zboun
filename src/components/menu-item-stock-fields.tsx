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
  const [warningQty, setWarningQty] = useState(
    String(defaultWarningQty ?? DEFAULT_STOCK_ALERT_WARNING),
  );
  const [urgentQty, setUrgentQty] = useState(String(defaultUrgentQty ?? DEFAULT_STOCK_ALERT_URGENT));
  const [criticalQty, setCriticalQty] = useState(
    String(defaultCriticalQty ?? DEFAULT_STOCK_ALERT_CRITICAL),
  );
  const fieldId = (name: string) => `${idPrefix}${name}`;

  const thresholdError = useMemo(() => {
    if (!trackStock) return null;
    const warning = Number(warningQty);
    const urgent = Number(urgentQty);
    const critical = Number(criticalQty);
    if (![warning, urgent, critical].every((n) => Number.isFinite(n) && n >= 1)) {
      return "Each alert threshold must be a whole number of at least 1.";
    }
    return validateStockAlertThresholds({
      warning_qty: Math.floor(warning),
      urgent_qty: Math.floor(urgent),
      critical_qty: Math.floor(critical),
    });
  }, [trackStock, warningQty, urgentQty, criticalQty]);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
      <input type="hidden" name="track_stock" value={trackStock ? "true" : "false"} />
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={trackStock}
          onChange={(event) => setTrackStock(event.target.checked)}
          className="mt-0.5 h-4 w-4 accent-violet-600"
        />
        <span className="space-y-1">
          <span className="block text-sm font-semibold text-slate-800">Track stock quantity</span>
          <span className="block text-xs text-slate-500">
            Show how many are left on your store page. When stock hits your alert levels, you get an email.
            Orders automatically reduce the count.
          </span>
        </span>
      </label>

      {trackStock ? (
        <div className="mt-3 space-y-4 border-t border-slate-200 pt-3">
          <div>
            <label
              htmlFor={fieldId("stock_quantity")}
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              Quantity in stock
            </label>
            <input
              id={fieldId("stock_quantity")}
              name="stock_quantity"
              type="number"
              min={0}
              step={1}
              defaultValue={defaultStockQuantity ?? 10}
              className="ui-input w-full max-w-[10rem]"
              required
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email alerts when stock reaches
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Warning must be highest, then urgent, then very urgent (e.g. 10 → 5 → 3).
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-amber-700">Warning</span>
                <input
                  id={fieldId("stock_alert_warning_qty")}
                  name="stock_alert_warning_qty"
                  type="number"
                  min={1}
                  step={1}
                  value={warningQty}
                  onChange={(e) => setWarningQty(e.target.value)}
                  className="ui-input w-full"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-orange-700">Urgent</span>
                <input
                  id={fieldId("stock_alert_urgent_qty")}
                  name="stock_alert_urgent_qty"
                  type="number"
                  min={1}
                  step={1}
                  value={urgentQty}
                  onChange={(e) => setUrgentQty(e.target.value)}
                  className="ui-input w-full"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-red-700">Very urgent</span>
                <input
                  id={fieldId("stock_alert_critical_qty")}
                  name="stock_alert_critical_qty"
                  type="number"
                  min={1}
                  step={1}
                  value={criticalQty}
                  onChange={(e) => setCriticalQty(e.target.value)}
                  className="ui-input w-full"
                  required
                />
              </label>
            </div>
            {thresholdError ? (
              <p className="mt-2 text-xs font-medium text-red-600">{thresholdError}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

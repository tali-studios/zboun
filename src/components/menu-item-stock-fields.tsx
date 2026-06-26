"use client";

import { useState } from "react";

type Props = {
  idPrefix?: string;
  defaultTrackStock?: boolean;
  defaultStockQuantity?: number | null;
};

export function MenuItemStockFields({
  idPrefix = "",
  defaultTrackStock = false,
  defaultStockQuantity = null,
}: Props) {
  const [trackStock, setTrackStock] = useState(defaultTrackStock);
  const fieldId = (name: string) => `${idPrefix}${name}`;

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
            Show how many are left (e.g. 2 in stock). When it hits 0, the item is marked out of stock.
          </span>
        </span>
      </label>

      {trackStock ? (
        <div className="mt-3 border-t border-slate-200 pt-3">
          <label htmlFor={fieldId("stock_quantity")} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
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
      ) : null}
    </div>
  );
}

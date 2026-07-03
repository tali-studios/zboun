"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { updateMenuItemStockQuickAction } from "@/app-actions/restaurant";
import {
  getMenuItemStockAlertLevel,
  resolveStockAlertThresholds,
  type MenuItemStockFields,
} from "@/lib/menu-item-stock";

type Props = {
  itemId: string;
  itemName: string;
  trackStock: boolean;
  stockQuantity: number | null;
  warningQty?: number | null;
  urgentQty?: number | null;
  criticalQty?: number | null;
};

const LEVEL_COLORS = {
  ok:       { dot: "bg-emerald-400", qty: "text-emerald-700", bar: "bg-emerald-400" },
  warning:  { dot: "bg-amber-400",   qty: "text-amber-700",   bar: "bg-amber-400" },
  urgent:   { dot: "bg-orange-500",  qty: "text-orange-600",  bar: "bg-orange-400" },
  critical: { dot: "bg-red-500",     qty: "text-red-600",     bar: "bg-red-500" },
  out:      { dot: "bg-red-600",     qty: "text-red-700",     bar: "bg-red-600" },
} as const;

const LEVEL_LABELS = {
  ok:       "In stock",
  warning:  "Low",
  urgent:   "Urgent",
  critical: "Very urgent",
  out:      "Out of stock",
} as const;

export function MenuItemStockQuickEdit({
  itemId,
  itemName,
  trackStock,
  stockQuantity,
  warningQty,
  urgentQty,
  criticalQty,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [localQty, setLocalQty] = useState(stockQuantity ?? 0);
  const [editingQty, setEditingQty] = useState<string | null>(null);
  const [trackingLocal, setTrackingLocal] = useState(trackStock);

  // Sync when server re-renders
  useEffect(() => {
    setLocalQty(stockQuantity ?? 0);
    setTrackingLocal(trackStock);
  }, [stockQuantity, trackStock]);

  function submit(track: boolean, quantity: number) {
    const formData = new FormData();
    formData.set("id", itemId);
    formData.set("track_stock", track ? "true" : "false");
    formData.set("stock_quantity", String(Math.max(0, Math.floor(quantity))));
    startTransition(async () => {
      const result = await updateMenuItemStockQuickAction(formData);
      if (result.ok) {
        setEditingQty(null);
        router.refresh();
      }
    });
  }

  function handleEnableTracking() {
    setTrackingLocal(true);
    setLocalQty(10);
    submit(true, 10);
  }

  function handleStopTracking() {
    setTrackingLocal(false);
    setLocalQty(0);
    submit(false, 0);
  }

  function handleDecrement() {
    const next = Math.max(0, localQty - 1);
    setLocalQty(next);
    submit(true, next);
  }

  function handleIncrement() {
    const next = localQty + 1;
    setLocalQty(next);
    submit(true, next);
  }

  function handleEditCommit() {
    if (editingQty === null) return;
    const parsed = Math.max(0, Math.floor(Number(editingQty) || 0));
    setLocalQty(parsed);
    setEditingQty(null);
    if (parsed !== localQty) submit(true, parsed);
  }

  // — NOT TRACKING —
  if (!trackingLocal) {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={handleEnableTracking}
        className="group flex items-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-500 transition hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50"
        title={`Start tracking stock for "${itemName}"`}
      >
        <span className="text-base leading-none opacity-70 group-hover:opacity-100">＋</span>
        Track stock
      </button>
    );
  }

  // Compute alert level for visual feedback
  const fakeItem: MenuItemStockFields = {
    is_available: localQty > 0,
    track_stock: true,
    stock_quantity: localQty,
    stock_alert_warning_qty: warningQty,
    stock_alert_urgent_qty: urgentQty,
    stock_alert_critical_qty: criticalQty,
  };
  const thresholds = resolveStockAlertThresholds(fakeItem);
  const level = getMenuItemStockAlertLevel(fakeItem) ?? "ok";
  const colors = LEVEL_COLORS[level];

  // Bar fill percentage (cap warning threshold as 100%)
  const barMax = thresholds.warning_qty + Math.ceil(thresholds.warning_qty * 0.5);
  const barPct = Math.min(100, Math.round((localQty / barMax) * 100));

  return (
    <div className="flex min-w-[9rem] flex-col gap-2">
      {/* Stepper row */}
      <div className="flex items-center gap-1">
        {/* Decrement */}
        <button
          type="button"
          disabled={pending || localQty <= 0}
          onClick={handleDecrement}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-base font-bold text-slate-500 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Decrease"
        >
          −
        </button>

        {/* Quantity display / input */}
        {editingQty !== null ? (
          <input
            type="number"
            min={0}
            step={1}
            value={editingQty}
            onChange={(e) => setEditingQty(e.target.value)}
            onBlur={handleEditCommit}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); handleEditCommit(); }
              if (e.key === "Escape") { setEditingQty(null); }
            }}
            autoFocus
            className="h-8 w-14 rounded-lg border-2 border-violet-400 bg-white px-1 text-center text-sm font-bold tabular-nums outline-none"
          />
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() => setEditingQty(String(localQty))}
            title="Click to type a quantity"
            className={`h-8 min-w-[3rem] rounded-lg border border-slate-200 px-2 text-center text-sm font-bold tabular-nums transition hover:border-violet-300 hover:bg-violet-50 ${colors.qty} disabled:opacity-60`}
          >
            {pending ? "…" : localQty}
          </button>
        )}

        {/* Increment */}
        <button
          type="button"
          disabled={pending}
          onClick={handleIncrement}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-base font-bold text-slate-500 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-40"
          aria-label="Increase"
        >
          +
        </button>
      </div>

      {/* Mini progress bar */}
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${colors.bar}`}
            style={{ width: `${barPct}%` }}
          />
        </div>
        <span className={`shrink-0 text-[10px] font-semibold ${colors.qty}`}>
          {LEVEL_LABELS[level]}
        </span>
      </div>

      {/* Stop tracking */}
      <button
        type="button"
        disabled={pending}
        onClick={handleStopTracking}
        className="text-left text-[10px] font-medium text-slate-400 underline-offset-2 transition hover:text-red-500 hover:underline disabled:opacity-50"
      >
        Stop tracking
      </button>
    </div>
  );
}

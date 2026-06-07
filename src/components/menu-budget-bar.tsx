"use client";

import { Wallet, X } from "lucide-react";
import type { PaymentCurrency } from "@/lib/payment-note";
import { BUDGET_QUICK_LBP, BUDGET_QUICK_USD } from "@/lib/budget-mode";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: PaymentCurrency;
  onCurrencyChange: (currency: PaymentCurrency) => void;
  amount: number | null;
  onAmountChange: (amount: number | null) => void;
  formatUsd: (amount: number) => string;
  matchingCount: number;
  freeDelivery?: boolean;
  deliveryFeeUsd?: number;
};

export function MenuBudgetBar({
  open,
  onOpenChange,
  currency,
  onCurrencyChange,
  amount,
  onAmountChange,
  formatUsd,
  matchingCount,
  freeDelivery = false,
  deliveryFeeUsd = 0,
}: Props) {
  const quickAmounts = currency === "usd" ? BUDGET_QUICK_USD : BUDGET_QUICK_LBP;
  const isActive = amount != null && amount > 0;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
          isActive
            ? "border-emerald-300 bg-emerald-50 ring-1 ring-emerald-200"
            : open
              ? "border-violet-300 bg-violet-50"
              : "border-slate-200 bg-white hover:border-violet-300"
        }`}
      >
        <span className="inline-flex items-center gap-2.5">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              isActive ? "bg-emerald-500 text-white" : "bg-violet-100 text-violet-700"
            }`}
          >
            <Wallet className="h-4 w-4" strokeWidth={2} aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-bold text-slate-900">I only have…</span>
            <span className="block text-xs text-slate-500">
              {isActive
                ? `Showing ${matchingCount} item${matchingCount === 1 ? "" : "s"} within your budget`
                : "See what you can afford on this menu"}
            </span>
          </span>
        </span>
        <span className="text-xs font-semibold text-violet-600">{open ? "Hide" : "Set budget"}</span>
      </button>

      {open ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">
            Enter how much you want to spend on food. We will highlight items that fit.
            {!freeDelivery && deliveryFeeUsd > 0 ? (
              <span className="mt-1 block text-xs text-slate-500">
                Delivery ({formatUsd(deliveryFeeUsd)}) is not included — add it at checkout.
              </span>
            ) : null}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {(
              [
                { id: "usd" as const, label: "US Dollars" },
                { id: "lbp" as const, label: "Lebanese Lira" },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onCurrencyChange(option.id);
                  onAmountChange(null);
                }}
                className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                  currency === option.id
                    ? "border-violet-400 bg-violet-50 font-semibold text-violet-800"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className="mt-3 block space-y-1.5">
            <span className="text-sm font-semibold text-slate-800">My budget</span>
            <div className="flex min-h-[2.75rem] items-center overflow-hidden rounded-[0.85rem] border-[1.5px] border-[#e2e5f5] bg-white focus-within:border-[var(--brand)] focus-within:shadow-[0_0_0_4px_rgba(120,84,255,0.14)]">
              <span className="shrink-0 pl-3.5 text-sm font-semibold text-slate-400">
                {currency === "usd" ? "$" : "L.L"}
              </span>
              <input
                type="number"
                min={0}
                step={currency === "usd" ? 0.01 : 1000}
                value={amount ?? ""}
                onChange={(e) => {
                  const raw = e.target.value.trim();
                  if (!raw) {
                    onAmountChange(null);
                    return;
                  }
                  const next = Number(raw);
                  if (!Number.isFinite(next) || next <= 0) {
                    onAmountChange(null);
                    return;
                  }
                  onAmountChange(currency === "usd" ? Math.round(next * 100) / 100 : Math.round(next));
                }}
                placeholder={currency === "usd" ? "e.g. 15" : "e.g. 1300000"}
                className="min-w-0 flex-1 border-0 bg-transparent py-3 pl-1.5 pr-3.5 text-sm text-slate-900 outline-none placeholder:text-[#a0a8c4]"
                inputMode="decimal"
              />
            </div>
          </label>

          <div className="mt-3">
            <p className="mb-1.5 text-xs text-slate-500">Quick pick</p>
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onAmountChange(value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    amount === value
                      ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"
                  }`}
                >
                  {currency === "usd" ? formatUsd(value) : `L.L ${value.toLocaleString()}`}
                </button>
              ))}
            </div>
          </div>

          {isActive ? (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-emerald-50 px-3 py-2.5">
              <p className="text-xs font-medium text-emerald-800">
                {matchingCount > 0
                  ? `${matchingCount} item${matchingCount === 1 ? "" : "s"} fit your budget`
                  : "Nothing on this menu fits — try a higher amount"}
              </p>
              <button
                type="button"
                onClick={() => onAmountChange(null)}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
                Clear
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

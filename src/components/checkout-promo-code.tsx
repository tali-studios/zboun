"use client";

import { useState } from "react";
import { validateCouponCodeAction } from "@/app-actions/menu-coupon-codes";

export type AppliedCoupon = {
  code: string;
  couponId: string;
  percentOff: number;
  discountUsd: number;
};

type Theme = {
  primary: string;
  deep: string;
};

type Props = {
  restaurantId: string;
  itemsSubtotalUsd: number;
  deliveryFeeUsd: number;
  applied: AppliedCoupon | null;
  onApplied: (coupon: AppliedCoupon | null) => void;
  theme: Theme;
};

export function CheckoutPromoCode({
  restaurantId,
  itemsSubtotalUsd,
  deliveryFeeUsd,
  applied,
  onApplied,
  theme,
}: Props) {
  const [input, setInput] = useState(applied?.code ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleApply() {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Enter a promo code.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await validateCouponCodeAction({
        restaurantId,
        code: trimmed,
        itemsSubtotalUsd,
        deliveryFeeUsd,
      });
      if (!result.ok) {
        setError(result.error);
        onApplied(null);
        return;
      }
      onApplied({
        code: result.code,
        couponId: result.couponId,
        percentOff: result.percentOff,
        discountUsd: result.discountUsd,
      });
      setInput(result.code);
    } catch {
      setError("Could not validate promo code. Try again.");
      onApplied(null);
    } finally {
      setLoading(false);
    }
  }

  function handleRemove() {
    setInput("");
    setError(null);
    onApplied(null);
  }

  return (
    <section className="mt-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
      <p className="text-sm font-bold text-slate-900">Promo code</p>
      {applied ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-emerald-50 px-3 py-2.5">
          <div>
            <p className="font-mono text-sm font-bold text-emerald-800">{applied.code}</p>
            <p className="text-xs text-emerald-700">{applied.percentOff}% off your order</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="shrink-0 text-xs font-semibold text-emerald-800 underline"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="Enter code"
            maxLength={32}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-sm uppercase tracking-wide text-slate-900 outline-none ring-violet-200 focus:ring-2"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleApply();
              }
            }}
          />
          <button
            type="button"
            onClick={() => void handleApply()}
            disabled={loading}
            className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105 disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.deep} 100%)` }}
          >
            {loading ? "…" : "Apply"}
          </button>
        </div>
      )}
      {error ? <p className="mt-2 text-xs font-medium text-red-600">{error}</p> : null}
    </section>
  );
}

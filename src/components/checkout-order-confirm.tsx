"use client";

import { useEffect, useRef, useState } from "react";
import { BRAND_HEX, BRAND_HEX_DEEP } from "@/lib/brand";

const DEFAULT_SECONDS = 15;

type Props = {
  orderTotal: number;
  itemCount: number;
  formatLbp: (amount: number) => string;
  formatUsd: (amount: number) => string;
  restaurantName: string;
  onCancel: () => void;
  onPlaceOrder: () => void | Promise<void>;
  isPlacingOrder: boolean;
  durationSeconds?: number;
};

export function CheckoutOrderConfirm({
  orderTotal,
  itemCount,
  formatLbp,
  formatUsd,
  restaurantName,
  onCancel,
  onPlaceOrder,
  isPlacingOrder,
  durationSeconds = DEFAULT_SECONDS,
}: Props) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const placedRef = useRef(false);
  const tickRef = useRef<ReturnType<typeof window.setInterval> | null>(null);
  const onPlaceOrderRef = useRef(onPlaceOrder);
  onPlaceOrderRef.current = onPlaceOrder;

  const progress = secondsLeft / durationSeconds;
  const ringRadius = 54;
  const circumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = circumference * (1 - progress);

  function placeOrderNow() {
    if (placedRef.current || isPlacingOrder) return;
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    placedRef.current = true;
    setSecondsLeft(0);
    void onPlaceOrderRef.current();
  }

  useEffect(() => {
    setSecondsLeft(durationSeconds);
    placedRef.current = false;

    tickRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (tickRef.current) {
            window.clearInterval(tickRef.current);
            tickRef.current = null;
          }
          if (!placedRef.current) {
            placedRef.current = true;
            void onPlaceOrderRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (tickRef.current) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [durationSeconds]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="relative overflow-hidden rounded-2xl px-5 py-6 text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${BRAND_HEX} 0%, ${BRAND_HEX_DEEP} 100%)` }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"
        />
        <p className="relative text-center text-xs font-bold uppercase tracking-[0.2em] text-white/70">
          Final step
        </p>
        <h3 className="relative mt-1 text-center text-lg font-bold">Confirm your order</h3>
        <p className="relative mt-1 text-center text-sm text-white/80">
          Sending to <span className="font-semibold text-white">{restaurantName}</span>
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center">
        <div className="relative flex h-[140px] w-[140px] items-center justify-center">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden>
            <circle
              cx="60"
              cy="60"
              r={ringRadius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-100"
            />
            <circle
              cx="60"
              cy="60"
              r={ringRadius}
              fill="none"
              stroke="url(#confirm-ring-gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="confirm-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={BRAND_HEX} />
                <stop offset="100%" stopColor={BRAND_HEX_DEEP} />
              </linearGradient>
            </defs>
          </svg>
          <div className="relative text-center">
            {isPlacingOrder ? (
              <>
                <div
                  className="mx-auto h-8 w-8 animate-spin rounded-full border-[3px] border-violet-200 border-t-violet-600"
                  aria-hidden
                />
                <p className="mt-2 text-xs font-semibold text-slate-500">Placing…</p>
              </>
            ) : (
              <>
                <p className="text-4xl font-bold tabular-nums tracking-tight text-slate-900">{secondsLeft}</p>
                <p className="text-xs font-medium text-slate-400">seconds</p>
              </>
            )}
          </div>
        </div>

        <p className="mt-5 max-w-[18rem] text-center text-sm leading-relaxed text-slate-600">
          {isPlacingOrder
            ? "Hang tight — we’re sending your order to the restaurant."
            : "Tap confirm to place now, or wait for the timer to finish."}
        </p>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total payment</p>
            <p className="mt-0.5 text-xl font-bold tabular-nums text-slate-900">{formatLbp(orderTotal)}</p>
            <p className="text-xs text-slate-500">{formatUsd(orderTotal)}</p>
          </div>
          <div className="rounded-xl bg-violet-50 px-3 py-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wide text-violet-500">Items</p>
            <p className="text-lg font-bold text-violet-700">{itemCount}</p>
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-3 pt-6">
        <button
          type="button"
          onClick={placeOrderNow}
          disabled={isPlacingOrder}
          className="w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-md transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: `linear-gradient(135deg, ${BRAND_HEX} 0%, ${BRAND_HEX_DEEP} 100%)` }}
        >
          {isPlacingOrder ? "Placing order…" : "Confirm order"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPlacingOrder}
          className="w-full rounded-2xl border-2 border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel order
        </button>
        <p className="text-center text-[11px] text-slate-400">
          Cancel returns you to checkout to edit your order.
        </p>
      </div>
    </div>
  );
}

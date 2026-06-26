"use client";

import { useEffect, useRef, useState } from "react";
import type { MenuTheme } from "@/lib/menu-theme";
import { menuPrimaryButtonStyle } from "@/lib/menu-theme";

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
  theme: MenuTheme;
  /** Guest checkout: open WhatsApp instead of placing through Zboun. */
  whatsappOrderUrl?: string | null;
  onWhatsAppOrder?: () => void;
};

function OrderSummaryCard({
  orderTotal,
  itemCount,
  formatLbp,
  formatUsd,
  theme,
}: Pick<Props, "orderTotal" | "itemCount" | "formatLbp" | "formatUsd" | "theme">) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total payment</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-slate-900">{formatLbp(orderTotal)}</p>
          <p className="text-xs text-slate-500">{formatUsd(orderTotal)}</p>
        </div>
        <div
          className="rounded-xl px-3 py-2 text-right"
          style={{ backgroundColor: theme.softBg }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: theme.primary }}>
            Items
          </p>
          <p className="text-lg font-bold" style={{ color: theme.softText }}>
            {itemCount}
          </p>
        </div>
      </div>
    </div>
  );
}

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
  theme,
  whatsappOrderUrl = null,
  onWhatsAppOrder,
}: Props) {
  const isWhatsAppGuest = Boolean(whatsappOrderUrl);
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const placedRef = useRef(false);
  const tickRef = useRef<number | null>(null);
  const onPlaceOrderRef = useRef(onPlaceOrder);
  onPlaceOrderRef.current = onPlaceOrder;

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
    if (isWhatsAppGuest) return;

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
  }, [durationSeconds, isWhatsAppGuest]);

  const whatsappIcon = (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.124 1.532 5.859L.054 23.285a.75.75 0 00.916.916l5.437-1.478A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.67-.5-5.21-1.374l-.374-.213-3.867 1.051 1.052-3.843-.226-.386A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );

  const summary = (
    <OrderSummaryCard
      orderTotal={orderTotal}
      itemCount={itemCount}
      formatLbp={formatLbp}
      formatUsd={formatUsd}
      theme={theme}
    />
  );

  const backButton = (
    <div className="mt-auto space-y-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={isPlacingOrder}
        className="w-full rounded-2xl border-2 border-rose-300 bg-rose-50 py-3.5 text-sm font-bold text-rose-700 transition hover:border-rose-400 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Go back
      </button>
      <p className="pb-1 text-center text-[11px] text-slate-400">
        Returns you to checkout to edit your order.
      </p>
    </div>
  );

  if (isWhatsAppGuest && whatsappOrderUrl) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {summary}

        <div className="rounded-2xl border border-[#25D366]/25 bg-[#25D366]/[0.06] p-4">
          <p className="text-center text-sm font-semibold text-slate-900">Ready to notify {restaurantName}</p>
          <p className="mt-1 text-center text-xs leading-relaxed text-slate-600">
            Open WhatsApp with your order prefilled, then tap Send in the chat.
          </p>
          <a
            href={whatsappOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onWhatsAppOrder?.()}
            className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-base font-bold text-white shadow-md transition hover:brightness-110"
            style={{ backgroundColor: "#25D366" }}
          >
            {whatsappIcon}
            Place order on WhatsApp
          </a>
        </div>

        {backButton}
      </div>
    );
  }

  const timerProgress = secondsLeft / durationSeconds;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {summary}

      <div
        className="rounded-2xl border bg-white p-4 shadow-sm"
        style={{
          borderColor: `color-mix(in srgb, ${theme.primary} 35%, transparent)`,
          backgroundColor: `color-mix(in srgb, ${theme.primary} 6%, white)`,
        }}
      >
        <p className="text-center text-sm font-semibold text-slate-900">
          Sending to {restaurantName}
        </p>

        {isPlacingOrder ? (
          <div className="mt-4 flex flex-col items-center gap-2 py-2">
            <div
              className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200"
              style={{ borderTopColor: theme.primary }}
              aria-hidden
            />
            <p className="text-sm font-medium text-slate-600">Placing your order…</p>
          </div>
        ) : (
          <>
            <div className="mt-3 flex items-center justify-center gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums text-slate-900 ring-4"
                style={{
                  backgroundColor: theme.softBg,
                  boxShadow: `inset 0 0 0 2px color-mix(in srgb, ${theme.primary} 25%, white)`,
                }}
                aria-live="polite"
              >
                {secondsLeft}
              </div>
              <p className="text-left text-xs leading-relaxed text-slate-600">
                Auto-confirms in <span className="font-semibold text-slate-800">{secondsLeft}s</span>
                <br />
                or tap the button below now.
              </p>
            </div>

            <div
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200/80"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={durationSeconds}
              aria-valuenow={secondsLeft}
            >
              <div
                className="h-full rounded-full transition-[width] duration-1000 ease-linear"
                style={{
                  width: `${timerProgress * 100}%`,
                  backgroundColor: theme.primary,
                }}
              />
            </div>

            <button
              type="button"
              onClick={placeOrderNow}
              className="mt-4 w-full rounded-2xl py-4 text-base font-bold text-white shadow-md transition hover:brightness-105"
              style={menuPrimaryButtonStyle(theme)}
            >
              Confirm order
            </button>
          </>
        )}
      </div>

      {backButton}
    </div>
  );
}

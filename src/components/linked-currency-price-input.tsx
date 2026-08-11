"use client";

import { useEffect, useRef, useState } from "react";

function normalizeRate(rate: number) {
  return Number.isFinite(rate) && rate > 0 ? rate : 89500;
}

export function usdToLbpAmount(usd: number, lbpRate: number): number {
  return Math.round(usd * normalizeRate(lbpRate));
}

export function lbpToUsdAmount(lbp: number, lbpRate: number): number {
  const rate = normalizeRate(lbpRate);
  return Math.round((lbp / rate) * 100) / 100;
}

function formatUsdInput(value: number): string {
  if (!Number.isFinite(value)) return "";
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function formatLbpInput(value: number): string {
  if (!Number.isFinite(value)) return "";
  return String(Math.round(value));
}

/** Digits only — strips commas / spaces while typing. */
function sanitizeLbpDigits(raw: string): string {
  return raw.replace(/[^\d]/g, "");
}

type Props = {
  lbpRate: number;
  /** Submitted field name — always USD for the server. */
  name?: string;
  id?: string;
  required?: boolean;
  /** Controlled USD value (optional). */
  value?: string;
  onChange?: (usdValue: string) => void;
  defaultUsd?: number | string | null;
  usdLabel?: string;
  lbpLabel?: string;
  usdPlaceholder?: string;
  lbpPlaceholder?: string;
  hint?: string;
  /** Visual wrapper class (e.g. grid column span). */
  className?: string;
};

/**
 * Dual USD / LBP price inputs synced with the store’s dollar rate.
 * Only the USD value is submitted (`name`); LBP is a convenience field.
 */
export function LinkedCurrencyPriceInput({
  lbpRate,
  name = "price",
  id = "price",
  required = false,
  value,
  onChange,
  defaultUsd = "",
  usdLabel = "Price (USD)",
  lbpLabel = "Price (LBP)",
  usdPlaceholder = "30",
  lbpPlaceholder = "2685000",
  hint,
  className,
}: Props) {
  const rate = normalizeRate(lbpRate);
  const initialUsd =
    value !== undefined
      ? value
      : defaultUsd !== "" && defaultUsd != null
        ? String(defaultUsd)
        : "";
  const initialUsdNum = Number(initialUsd);
  const [usd, setUsd] = useState(initialUsd);
  const [lbp, setLbp] = useState(
    initialUsd.trim() !== "" && Number.isFinite(initialUsdNum)
      ? formatLbpInput(usdToLbpAmount(initialUsdNum, rate))
      : "",
  );
  /** While typing LBP, don't overwrite it when tiny amounts round to $0. */
  const editingLbpRef = useRef(false);

  // Keep in sync when parent controls USD (e.g. sold-by-weight toggle).
  useEffect(() => {
    if (value === undefined) return;
    setUsd(value);
    if (editingLbpRef.current) return;
    const n = Number(value);
    if (value.trim() === "" || !Number.isFinite(n)) {
      setLbp("");
      return;
    }
    setLbp(formatLbpInput(usdToLbpAmount(n, rate)));
  }, [value, rate]);

  function updateUsd(next: string) {
    editingLbpRef.current = false;
    setUsd(next);
    onChange?.(next);
    const n = Number(next);
    if (next.trim() === "" || !Number.isFinite(n)) {
      setLbp("");
      return;
    }
    setLbp(formatLbpInput(usdToLbpAmount(n, rate)));
  }

  function updateLbp(next: string) {
    editingLbpRef.current = true;
    const digits = sanitizeLbpDigits(next);
    setLbp(digits);
    if (digits === "") {
      setUsd("");
      onChange?.("");
      return;
    }
    const n = Number(digits);
    if (!Number.isFinite(n)) {
      setUsd("");
      onChange?.("");
      return;
    }
    // Live preview in USD (may be 0 until LBP is large enough for $0.01).
    const nextUsd = formatUsdInput(lbpToUsdAmount(n, rate));
    setUsd(nextUsd);
    onChange?.(nextUsd);
  }

  function finishLbpEdit() {
    editingLbpRef.current = false;
    const digits = sanitizeLbpDigits(lbp);
    if (digits === "") {
      setLbp("");
      setUsd("");
      onChange?.("");
      return;
    }
    const n = Number(digits);
    if (!Number.isFinite(n)) return;
    const nextUsd = formatUsdInput(lbpToUsdAmount(n, rate));
    setUsd(nextUsd);
    onChange?.(nextUsd);
    // Normalize LBP from the rounded USD so both sides match the saved price.
    const usdNum = Number(nextUsd);
    setLbp(
      Number.isFinite(usdNum) && nextUsd !== ""
        ? formatLbpInput(usdToLbpAmount(usdNum, rate))
        : digits,
    );
  }

  const rateHint =
    hint ??
    `Linked by your store rate: $1 = ${rate.toLocaleString("en-US")} LBP. Only USD is saved.`;

  return (
    <div className={className ?? "space-y-2"}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
            {usdLabel}
            {required ? <span className="text-red-500">*</span> : null}
          </span>
          <div className="flex min-h-[2.75rem] w-full items-center gap-2 rounded-[0.85rem] border-[1.5px] border-[#e2e5f5] bg-white px-3 transition focus-within:border-violet-400 focus-within:shadow-[0_0_0_3px_rgba(120,84,255,0.12)]">
            <span className="shrink-0 text-sm font-semibold text-slate-400" aria-hidden>
              $
            </span>
            <input
              id={id}
              name={name}
              required={required}
              placeholder={usdPlaceholder}
              type="number"
              step="0.01"
              min={0}
              value={usd}
              onChange={(event) => updateUsd(event.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-[0.9375rem] text-slate-900 outline-none placeholder:text-slate-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        </label>

        <label className="space-y-1.5">
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
            {lbpLabel}
            {required ? <span className="text-red-500">*</span> : null}
          </span>
          <div className="flex min-h-[2.75rem] w-full items-center gap-2 rounded-[0.85rem] border-[1.5px] border-[#e2e5f5] bg-white px-3 transition focus-within:border-violet-400 focus-within:shadow-[0_0_0_3px_rgba(120,84,255,0.12)]">
            <span className="shrink-0 text-sm font-semibold text-slate-400" aria-hidden>
              LBP
            </span>
            <input
              id={`${id}-lbp`}
              inputMode="numeric"
              autoComplete="off"
              placeholder={lbpPlaceholder}
              type="text"
              value={lbp}
              onChange={(event) => updateLbp(event.target.value)}
              onBlur={finishLbpEdit}
              className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-[0.9375rem] text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
        </label>
      </div>
      <p className="text-xs text-slate-400">{rateHint}</p>
    </div>
  );
}

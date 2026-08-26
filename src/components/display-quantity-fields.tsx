"use client";

import { DISPLAY_UNIT_OPTIONS, type DisplayUnit } from "@/lib/display-quantity";

type Props = {
  idPrefix?: string;
  defaultQuantity?: number | string | null;
  defaultUnit?: DisplayUnit | string | null;
  quantityName?: string;
  unitName?: string;
};

export function DisplayQuantityFields({
  idPrefix = "display-qty",
  defaultQuantity = "",
  defaultUnit = "g",
  quantityName = "display_quantity",
  unitName = "display_unit",
}: Props) {
  const unit = DISPLAY_UNIT_OPTIONS.some((o) => o.value === defaultUnit)
    ? (defaultUnit as DisplayUnit)
    : "g";

  return (
    <div className="space-y-1.5">
      <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
        Size / amount
        <span className="ml-0.5 text-[10px] font-normal normal-case tracking-normal text-slate-400">
          (optional)
        </span>
      </span>
      <div className="grid grid-cols-[minmax(0,1fr)_5rem] items-stretch gap-2 sm:grid-cols-[minmax(0,1fr)_5.75rem]">
        <input
          id={`${idPrefix}-quantity`}
          name={quantityName}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder={unit === "l" || unit === "kg" ? "1.5" : "330"}
          defaultValue={
            defaultQuantity !== null && defaultQuantity !== "" ? String(defaultQuantity) : undefined
          }
          className="ui-input ui-input-quantity box-border h-11 min-w-0 w-full !py-0 text-[0.9375rem] leading-none"
        />
        <select
          id={`${idPrefix}-unit`}
          name={unitName}
          defaultValue={unit}
          className="ui-select ui-select-unit box-border h-11 min-w-0 w-full !py-0 text-[0.9375rem] leading-none"
          aria-label="Unit"
        >
          {DISPLAY_UNIT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-slate-400">
        Weight: mg, g, kg · Drinks: mL, cL, L · Count: pcs. Shown as a label (e.g. 18 mg, 330 mL, 6 pcs).
      </p>
    </div>
  );
}

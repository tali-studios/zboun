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
    <div className="space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Size / amount{" "}
        <span className="ml-1 font-normal normal-case text-slate-500">(optional)</span>
      </span>
      <div className="grid grid-cols-[minmax(0,1fr)_4.75rem] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_5.5rem]">
        <input
          id={`${idPrefix}-quantity`}
          name={quantityName}
          type="number"
          min={0}
          step="any"
          placeholder={unit === "l" || unit === "kg" ? "1.5" : "330"}
          defaultValue={
            defaultQuantity !== null && defaultQuantity !== "" ? String(defaultQuantity) : undefined
          }
          className="ui-input ui-input-quantity min-w-0 w-full"
        />
        <select
          id={`${idPrefix}-unit`}
          name={unitName}
          defaultValue={unit}
          className="ui-select ui-select-unit min-w-0 w-full"
          aria-label="Unit"
        >
          {DISPLAY_UNIT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-slate-500">
        Weight: g or kg · Drinks: mL or L. Shown on the menu as a label (e.g. 330 mL, 1.5 L, 500 g).
      </p>
    </div>
  );
}

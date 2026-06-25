"use client";

import { useState } from "react";
import type { ComplimentaryUnit } from "@/lib/complimentary-billing";

type Props = {
  idPrefix?: string;
  defaultEnabled?: boolean;
  defaultUnit?: ComplimentaryUnit;
  defaultAmount?: number;
};

export function ComplimentaryBillingFields({
  idPrefix = "",
  defaultEnabled = false,
  defaultUnit = "months",
  defaultAmount = 3,
}: Props) {
  const [enabled, setEnabled] = useState(defaultEnabled);
  const [unit, setUnit] = useState<ComplimentaryUnit>(defaultUnit);
  const [amount, setAmount] = useState(defaultAmount);

  const fieldId = (name: string) => `${idPrefix}${name}`;

  return (
    <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          name="complimentary_free"
          value="true"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-emerald-600"
        />
        <span className="space-y-1">
          <span className="block text-sm font-semibold text-emerald-900">Grant free access</span>
          <span className="block text-xs text-emerald-800">
            Check this to skip billing for a chosen period. After it ends, standard monthly billing
            applies.
          </span>
        </span>
      </label>

      <div
        className={`grid gap-3 border-t border-emerald-200/80 pt-3 sm:grid-cols-2 ${
          enabled ? "" : "opacity-60"
        }`}
      >
        <div>
          <label htmlFor={fieldId("complimentary_unit")} className="mb-1.5 block text-xs font-semibold text-emerald-900">
            Duration type
          </label>
          <select
            id={fieldId("complimentary_unit")}
            name={enabled ? "complimentary_unit" : undefined}
            value={unit}
            disabled={!enabled}
            onChange={(e) => setUnit(e.target.value as ComplimentaryUnit)}
            className="ui-select w-full rounded-md disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="months">Months</option>
            <option value="years">Years</option>
            <option value="lifetime">Lifetime</option>
          </select>
        </div>
        {unit === "lifetime" ? (
          enabled ? <input type="hidden" name="complimentary_amount" value="1" /> : null
        ) : (
          <div>
            <label htmlFor={fieldId("complimentary_amount")} className="mb-1.5 block text-xs font-semibold text-emerald-900">
              {unit === "years" ? "Number of years" : "Number of months"}
            </label>
            <input
              id={fieldId("complimentary_amount")}
              name={enabled ? "complimentary_amount" : undefined}
              type="number"
              min={1}
              max={unit === "years" ? 10 : 60}
              value={amount}
              disabled={!enabled}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="ui-input w-full rounded-md disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>
        )}
      </div>

      {!enabled ? (
        <p className="text-xs text-emerald-800/80">Check &quot;Grant free access&quot; above to apply these settings.</p>
      ) : null}
    </div>
  );
}

type ModalFieldsProps = {
  unit: ComplimentaryUnit;
  amount: number;
  onUnitChange: (unit: ComplimentaryUnit) => void;
  onAmountChange: (amount: number) => void;
};

export function ComplimentaryBillingModalFields({
  unit,
  amount,
  onUnitChange,
  onAmountChange,
}: ModalFieldsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Duration type</label>
        <select
          name="complimentary_unit"
          value={unit}
          onChange={(e) => onUnitChange(e.target.value as ComplimentaryUnit)}
          className="ui-select w-full rounded-md"
        >
          <option value="months">Months</option>
          <option value="years">Years</option>
          <option value="lifetime">Lifetime</option>
        </select>
      </div>
      {unit === "lifetime" ? (
        <input type="hidden" name="complimentary_amount" value="1" />
      ) : (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            {unit === "years" ? "Number of years" : "Number of months"}
          </label>
          <input
            name="complimentary_amount"
            type="number"
            min={1}
            max={unit === "years" ? 10 : 60}
            value={amount}
            onChange={(e) => onAmountChange(Number(e.target.value))}
            className="ui-input w-full rounded-md"
            required
          />
        </div>
      )}
    </div>
  );
}

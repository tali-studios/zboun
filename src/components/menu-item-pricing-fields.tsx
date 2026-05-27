"use client";

import { useState } from "react";

type Props = {
  /** For the edit form — pass existing values */
  defaultPrice?: number | string;
  defaultGrams?: number | string | null;
  defaultSoldByWeight?: boolean;
  defaultPricePerKg?: number | string | null;
  defaultWeightStepKg?: number | string | null;
};

/**
 * Smart pricing fields for menu items.
 * When "Sold by weight" is toggled ON, hides the flat price/grams fields
 * and shows price-per-kg / step fields instead.
 */
export function MenuItemPricingFields({
  defaultPrice = "",
  defaultGrams = "",
  defaultSoldByWeight = false,
  defaultPricePerKg = "",
  defaultWeightStepKg = 0.1,
}: Props) {
  const [soldByWeight, setSoldByWeight] = useState(defaultSoldByWeight);

  return (
    <>
      {/* ── Flat price — hidden when sold by weight ── */}
      {!soldByWeight ? (
        <>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Price ($) <span className="text-red-600" aria-hidden="true">*</span>
            </span>
            <input
              name="price"
              required
              placeholder="e.g. 4.50"
              type="number"
              step="0.01"
              min={0}
              defaultValue={defaultPrice !== "" ? String(defaultPrice) : undefined}
              className="ui-input"
            />
            <p className="text-xs text-slate-500">US dollars ($). Base price before optional add-ons.</p>
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Weight (grams) <span className="ml-1 font-normal normal-case text-slate-500">(optional)</span>
            </span>
            <input
              name="grams"
              placeholder="Optional"
              type="number"
              min={0}
              defaultValue={defaultGrams !== null && defaultGrams !== "" ? String(defaultGrams) : undefined}
              className="ui-input"
            />
            <p className="text-xs text-slate-500">Display weight label (e.g. 500g) — not used for pricing.</p>
          </label>
        </>
      ) : (
        <>
          {/* hidden price=0 so the server action doesn't get an empty value */}
          <input type="hidden" name="price" value="0" />
          <input type="hidden" name="grams" value="" />
        </>
      )}

      {/* ── Weight-based pricing section ── */}
      <div
        className={`rounded-xl border p-3 md:col-span-2 ${
          soldByWeight
            ? "border-violet-300 bg-violet-50"
            : "border-slate-200 bg-slate-50"
        }`}
      >
        <div className="flex items-start gap-3">
          <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm flex-1">
            <input
              type="checkbox"
              name="sold_by_weight"
              value="true"
              checked={soldByWeight}
              onChange={(e) => setSoldByWeight(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-violet-600"
            />
            <div>
              <p className="font-semibold text-slate-800">Sold by weight</p>
              <p className="text-xs text-slate-500">
                {soldByWeight
                  ? "Customers choose kg/grams and price is calculated automatically."
                  : "Enable for groceries: potatoes, meat, cheese, etc."}
              </p>
            </div>
          </label>
        </div>

        {soldByWeight ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Price per KG ($/kg) <span className="text-red-600" aria-hidden="true">*</span>
              </span>
              <input
                name="price_per_kg"
                placeholder="e.g. 2.80"
                type="number"
                step="0.01"
                min={0}
                required={soldByWeight}
                defaultValue={
                  defaultPricePerKg !== null && defaultPricePerKg !== ""
                    ? String(defaultPricePerKg)
                    : undefined
                }
                className="ui-input"
                autoFocus
              />
              <p className="text-xs text-slate-500">
                e.g. $2.80/kg → 750g costs $2.10
              </p>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Weight step (kg) <span className="ml-1 font-normal normal-case text-slate-500">(optional)</span>
              </span>
              <input
                name="weight_step_kg"
                placeholder="0.1"
                type="number"
                step="0.01"
                min={0.01}
                defaultValue={
                  defaultWeightStepKg !== null && defaultWeightStepKg !== ""
                    ? String(defaultWeightStepKg)
                    : "0.1"
                }
                className="ui-input"
              />
              <p className="text-xs text-slate-500">0.1 = 100g steps · 0.05 = 50g steps</p>
            </label>
          </div>
        ) : (
          <>
            {/* hidden fields so the server action doesn't fail on missing values */}
            <input type="hidden" name="price_per_kg" value="" />
            <input type="hidden" name="weight_step_kg" value="0.1" />
          </>
        )}
      </div>
    </>
  );
}

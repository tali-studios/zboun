"use client";

import { useState } from "react";
import { DisplayQuantityFields } from "@/components/display-quantity-fields";
import { LinkedCurrencyPriceInput } from "@/components/linked-currency-price-input";
import { resolveDisplayQuantityFields, type DisplayUnit } from "@/lib/display-quantity";

type Props = {
  /** For the edit form — pass existing values */
  defaultPrice?: number | string;
  defaultGrams?: number | string | null;
  defaultDisplayQuantity?: number | string | null;
  defaultDisplayUnit?: DisplayUnit | string | null;
  defaultSoldByWeight?: boolean;
  defaultPricePerKg?: number | string | null;
  defaultWeightStepKg?: number | string | null;
  idPrefix?: string;
  /** Hide g/kg/mL/L field (e.g. fashion uses Product options for sizes). Default true. */
  showDisplayQuantity?: boolean;
  /** Show the "Sold by weight" toggle. Default true. */
  showWeightPricing?: boolean;
  /** Store dollar rate for USD ↔ LBP sync. */
  lbpRate?: number;
  /**
   * Electronics: this field is only for simple single-SKU items.
   * Combo prices in Options override the catalog "from" price.
   */
  electronicsPricing?: boolean;
};

/**
 * Smart pricing fields for menu items.
 * When "Sold by weight" is toggled ON, hides the flat price/grams fields
 * and shows price-per-kg / step fields instead.
 */
export function MenuItemPricingFields({
  defaultPrice = "",
  defaultGrams = "",
  defaultDisplayQuantity,
  defaultDisplayUnit,
  defaultSoldByWeight = false,
  defaultPricePerKg = "",
  defaultWeightStepKg = 0.1,
  idPrefix = "edit-item-qty",
  showDisplayQuantity = true,
  showWeightPricing = true,
  lbpRate = 89500,
  electronicsPricing = false,
}: Props) {
  const [soldByWeight, setSoldByWeight] = useState(
    showWeightPricing ? defaultSoldByWeight : false,
  );
  const [price, setPrice] = useState(
    defaultPrice !== "" && defaultPrice != null ? String(defaultPrice) : "",
  );
  const [pricePerKg, setPricePerKg] = useState(
    defaultPricePerKg !== null && defaultPricePerKg !== ""
      ? String(defaultPricePerKg)
      : "",
  );
  const resolvedDisplay = resolveDisplayQuantityFields({
    grams: defaultGrams !== "" && defaultGrams != null ? Number(defaultGrams) : null,
    display_quantity:
      defaultDisplayQuantity != null && defaultDisplayQuantity !== ""
        ? Number(defaultDisplayQuantity)
        : null,
    display_unit: defaultDisplayUnit,
  });

  function onSoldByWeightChange(checked: boolean) {
    setSoldByWeight(checked);
    if (checked) {
      setPricePerKg((current) => current.trim() || price.trim());
    } else {
      setPrice((current) => current.trim() || pricePerKg.trim());
    }
  }

  return (
    <>
      {/* ── Flat price — hidden when sold by weight ── */}
      {!soldByWeight ? (
        <>
          <div className="md:col-span-2 space-y-2">
            {electronicsPricing ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">How pricing works</p>
                <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-600">
                  <li>
                    <strong className="font-semibold text-slate-800">Product with options</strong>
                    {" "}(storage, size, color…): set each selling price in{" "}
                    <strong className="font-semibold text-slate-800">Options</strong> below.
                    The catalog shows “from $…” using the lowest combo automatically — you can leave
                    this field blank.
                  </li>
                  <li>
                    <strong className="font-semibold text-slate-800">Simple one-price item</strong>
                    {" "}(no options): enter the price here.
                  </li>
                </ul>
              </div>
            ) : null}
            <LinkedCurrencyPriceInput
              lbpRate={lbpRate}
              id={`${idPrefix}-price`}
              name="price"
              required={!electronicsPricing}
              value={price}
              onChange={setPrice}
              usdLabel={
                electronicsPricing
                  ? "Price for simple items (USD)"
                  : "Price (USD)"
              }
              lbpLabel={
                electronicsPricing
                  ? "Price for simple items (LBP)"
                  : "Price (LBP)"
              }
              hint={
                electronicsPricing
                  ? `Linked by your store rate: $1 = ${Number(lbpRate || 89500).toLocaleString("en-US")} LBP. Only USD is saved. Not used when combo prices are set below.`
                  : undefined
              }
            />
          </div>
          {showDisplayQuantity ? (
            <div className="min-w-0">
              <DisplayQuantityFields
                idPrefix={idPrefix}
                defaultQuantity={resolvedDisplay.quantity}
                defaultUnit={resolvedDisplay.unit}
              />
            </div>
          ) : (
            <>
              <input type="hidden" name="display_quantity" value="" />
              <input type="hidden" name="display_unit" value="g" />
            </>
          )}
        </>
      ) : (
        <>
          {/* hidden price=0 so the server action doesn't get an empty value */}
          <input type="hidden" name="price" value="0" />
          <input type="hidden" name="display_quantity" value="" />
          <input type="hidden" name="display_unit" value="g" />
        </>
      )}

      {/* ── Weight-based pricing section ── */}
      {showWeightPricing ? (
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
                onChange={(e) => onSoldByWeightChange(e.target.checked)}
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
              <div className="sm:col-span-2">
                <LinkedCurrencyPriceInput
                  lbpRate={lbpRate}
                  id={`${idPrefix}-price_per_kg`}
                  name="price_per_kg"
                  required={soldByWeight}
                  value={pricePerKg}
                  onChange={setPricePerKg}
                  usdLabel="Price per KG (USD)"
                  lbpLabel="Price per KG (LBP)"
                  usdPlaceholder="2.80"
                  hint={`Linked by your store rate: $1 = ${Number(lbpRate || 89500).toLocaleString("en-US")} LBP. e.g. $2.80/kg → 750g costs $2.10.`}
                />
              </div>
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
      ) : (
        <>
          <input type="hidden" name="sold_by_weight" value="false" />
          <input type="hidden" name="price_per_kg" value="" />
          <input type="hidden" name="weight_step_kg" value="0.1" />
        </>
      )}
    </>
  );
}

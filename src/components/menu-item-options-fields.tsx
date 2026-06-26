"use client";

import { useMemo, useState } from "react";

type OptionItem = { name: string; price?: number };

const CLOTHING_SIZES: OptionItem[] = [
  { name: "XS" },
  { name: "S" },
  { name: "M" },
  { name: "L" },
  { name: "XL" },
  { name: "XXL" },
];

const SHOE_SIZES_EU: OptionItem[] = [
  { name: "36" },
  { name: "37" },
  { name: "38" },
  { name: "39" },
  { name: "40" },
  { name: "41" },
  { name: "42" },
  { name: "43" },
  { name: "44" },
  { name: "45" },
];

const COLOR_OPTIONS: OptionItem[] = [
  { name: "Black" },
  { name: "White" },
  { name: "Navy" },
  { name: "Beige" },
  { name: "Red" },
  { name: "Blue" },
];

type Props = {
  idPrefix?: string;
  defaultLabel?: string | null;
  defaultValues?: OptionItem[];
};

export function MenuItemOptionsFields({
  idPrefix = "",
  defaultLabel = "",
  defaultValues = [],
}: Props) {
  const [optionLabel, setOptionLabel] = useState(defaultLabel ?? "");
  const [presetKey, setPresetKey] = useState<string | null>(null);
  const [optionItems, setOptionItems] = useState<OptionItem[]>(defaultValues);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  const optionValuesJson = useMemo(() => JSON.stringify(optionItems), [optionItems]);
  const fieldId = (name: string) => `${idPrefix}${name}`;

  function applyPreset(kind: "clothing" | "shoes" | "color") {
    if (kind === "clothing") {
      setOptionLabel("Size");
      setOptionItems(CLOTHING_SIZES);
      setPresetKey("clothing");
      return;
    }
    if (kind === "shoes") {
      setOptionLabel("Shoe size (EU)");
      setOptionItems(SHOE_SIZES_EU);
      setPresetKey("shoes");
      return;
    }
    setOptionLabel("Color");
    setOptionItems(COLOR_OPTIONS);
    setPresetKey("color");
  }

  function addItem() {
    const cleanName = itemName.trim();
    if (!cleanName) return;
    const price = Number(itemPrice || 0);
    setOptionItems((prev) => [
      ...prev,
      { name: cleanName, price: Number.isFinite(price) ? price : 0 },
    ]);
    setPresetKey(null);
    setItemName("");
    setItemPrice("");
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Quick presets</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            { id: "clothing" as const, label: "Clothing sizes" },
            { id: "shoes" as const, label: "Shoe sizes (EU)" },
            { id: "color" as const, label: "Colors" },
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                presetKey === preset.id
                  ? "border-violet-300 bg-violet-100 text-violet-800"
                  : "border-slate-200 bg-white text-slate-700 hover:border-violet-200"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor={fieldId("option_label")} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Option type
        </label>
        <input
          id={fieldId("option_label")}
          name="option_label"
          value={optionLabel}
          onChange={(event) => {
            setPresetKey(null);
            setOptionLabel(event.target.value);
          }}
          placeholder="e.g. Size, Color, Shoe size"
          className="ui-input w-full"
        />
        <p className="mt-1 text-xs text-slate-400">
          Customers must pick one when ordering (e.g. size for clothes or shoes).
        </p>
      </div>

      <input type="hidden" name="option_values" value={optionValuesJson} />

      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {optionLabel ? `${optionLabel} values` : "Option values"}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {optionItems.map((item, index) => (
            <span
              key={`${item.name}-${index}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
            >
              {item.name}
              {(item.price ?? 0) > 0 ? ` +$${Number(item.price).toFixed(2)}` : ""}
              <button
                type="button"
                onClick={() => setOptionItems((prev) => prev.filter((_, i) => i !== index))}
                className="text-slate-400 hover:text-slate-700"
                aria-label={`Remove ${item.name}`}
              >
                ×
              </button>
            </span>
          ))}
          {optionItems.length === 0 ? (
            <p className="text-xs text-slate-500">No values yet — use a preset or add below.</p>
          ) : null}
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <input
            value={itemName}
            onChange={(event) => setItemName(event.target.value)}
            placeholder="Value name (e.g. Large, 42)"
            className="ui-input"
          />
          <input
            value={itemPrice}
            onChange={(event) => setItemPrice(event.target.value)}
            type="number"
            min={0}
            step="0.01"
            placeholder="Extra $"
            className="ui-input"
          />
          <button type="button" onClick={addItem} className="btn btn-secondary rounded-xl">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ImageUploadField } from "@/components/image-upload-field";
import {
  buildVariantKey,
  formatSelectedOptionsDisplay,
  listVariantCombinations,
  type MenuOptionGroup,
  type OptionSelections,
} from "@/lib/menu-item-options";

/** Quick-start presets for common electronics — not phone-only. */
const VARIANT_PRESETS: Array<{ label: string; values: readonly string[]; hint: string }> = [
  {
    label: "Storage",
    values: ["64GB", "128GB", "256GB", "512GB", "1TB"],
    hint: "Phones, tablets, SSDs, consoles",
  },
  {
    label: "RAM",
    values: ["8GB", "16GB", "32GB", "64GB"],
    hint: "Laptops, PCs, workstations",
  },
  {
    label: "Screen size",
    values: ['32"', '43"', '55"', '65"', '75"'],
    hint: "TVs, monitors",
  },
  {
    label: "Length",
    values: ["0.5m", "1m", "1.5m", "2m", "3m"],
    hint: "Cables, chargers",
  },
  {
    label: "Size",
    values: ["S", "M", "L", "XL", "One size"],
    hint: "Cases, wearables, bands",
  },
  {
    label: "Wattage",
    values: ["20W", "30W", "45W", "65W", "100W"],
    hint: "Chargers, adapters",
  },
];

const COLOR_SUGGESTIONS = [
  "Black",
  "White",
  "Silver",
  "Grey",
  "Gold",
  "Blue",
  "Green",
  "Red",
  "Space Grey",
  "Midnight",
] as const;

const MAX_OPTION_TYPES = 3;

function PresetChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all ${
        selected
          ? "border-violet-600 bg-violet-600 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-900"
      }`}
    >
      {label}
    </button>
  );
}

type Props = {
  /** Non-color option groups (Storage, RAM, Size, …) — may include empty groups being edited. */
  optionGroups: MenuOptionGroup[];
  colorGroup: MenuOptionGroup | null;
  /** Clean groups used for price keys (values only). */
  groups: MenuOptionGroup[];
  prices: Record<string, number>;
  draftPrimary: string;
  draftColor: string;
  onDraftPrimaryChange: (value: string) => void;
  onDraftColorChange: (value: string) => void;
  onAddOptionType: (label: string) => void;
  onRemoveOptionType: (label: string) => void;
  onClearAllOptionTypes: () => void;
  onToggleOptionValue: (groupLabel: string, name: string) => void;
  onAddCustomOptionValue: (groupLabel: string, name: string) => void;
  onRemoveOptionValue: (groupLabel: string, name: string) => void;
  onToggleColor: (name: string) => void;
  onAddCustomColor: (name: string) => void;
  onRemoveColor: (name: string) => void;
  onEnsureColors: () => void;
  onRemoveColorGroup: () => void;
  onPriceChange: (key: string, price: number) => void;
  catalogFromPrice?: number | null;
};

/**
 * Guided variants editor for electronics stores — phones, laptops, PCs, TVs,
 * cables, chargers, accessories, and simple single-SKU products.
 */
export function ElectronicsOptionsEditor({
  optionGroups,
  colorGroup,
  groups,
  prices,
  draftPrimary,
  draftColor,
  onDraftPrimaryChange,
  onDraftColorChange,
  onAddOptionType,
  onRemoveOptionType,
  onClearAllOptionTypes,
  onToggleOptionValue,
  onAddCustomOptionValue,
  onRemoveOptionValue,
  onToggleColor,
  onAddCustomColor,
  onRemoveColor,
  onEnsureColors,
  onRemoveColorGroup,
  onPriceChange,
  catalogFromPrice = null,
}: Props) {
  const [customTypeInput, setCustomTypeInput] = useState("");
  const [focusedLabel, setFocusedLabel] = useState<string | null>(
    () => optionGroups[0]?.label ?? null,
  );

  useEffect(() => {
    if (optionGroups.length === 0) {
      setFocusedLabel(null);
      return;
    }
    if (!focusedLabel || !optionGroups.some((g) => g.label === focusedLabel)) {
      setFocusedLabel(optionGroups[0]!.label);
    }
  }, [optionGroups, focusedLabel]);

  const focusedGroup =
    optionGroups.find((g) => g.label === focusedLabel) ?? optionGroups[0] ?? null;
  const focusedLabelSafe = focusedGroup?.label?.trim() || "Option";
  const selectedFocused = new Set((focusedGroup?.values ?? []).map((v) => v.name));
  const selectedColors = new Set((colorGroup?.values ?? []).map((v) => v.name));
  const hasMultipleColors = (colorGroup?.values.length ?? 0) >= 2;
  const hasSingleColor = (colorGroup?.values.length ?? 0) === 1;
  const combinations = listVariantCombinations(groups);
  const tooMany = combinations.length > 80;
  const filledOptionGroups = optionGroups.filter((g) => g.values.length > 0);
  const hasOptions = filledOptionGroups.length > 0;
  const hasColors = Boolean(colorGroup && colorGroup.values.length > 0);
  /** 2D grid only when exactly one option type × color; otherwise a combo list. */
  const useMatrix = Boolean(filledOptionGroups.length === 1 && hasColors);
  const matrixPrimary = useMatrix ? filledOptionGroups[0]! : null;
  const showPriceList = combinations.length > 0;
  const activePreset = VARIANT_PRESETS.find((p) => p.label === focusedGroup?.label);
  const customFocusedValues = (focusedGroup?.values ?? []).filter(
    (v) => !activePreset?.values.includes(v.name),
  );
  const customColorValues = (colorGroup?.values ?? []).filter(
    (v) => !COLOR_SUGGESTIONS.includes(v.name as (typeof COLOR_SUGGESTIONS)[number]),
  );
  const atTypeLimit = optionGroups.length >= MAX_OPTION_TYPES;
  const comboAxesLabel = [
    ...filledOptionGroups.map((g) => g.label),
    ...(hasColors ? ["Color"] : []),
  ].join(" × ");

  function addType(label: string) {
    const trimmed = label.trim();
    if (!trimmed) return;
    const existing = optionGroups.find((g) => g.label === trimmed);
    if (existing) {
      setFocusedLabel(trimmed);
      onDraftPrimaryChange("");
      return;
    }
    if (atTypeLimit) return;
    onAddOptionType(trimmed);
    setFocusedLabel(trimmed);
    onDraftPrimaryChange("");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-violet-50 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600">
            <svg className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-violet-900">Product variants</p>
            <p className="mt-1.5 text-xs leading-relaxed text-violet-800">
              Configure options for phones, laptops, PCs, TVs, cables, chargers, consoles, and accessories. For simple single-SKU items, skip this section — just set a base price and main photo above.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs leading-relaxed text-violet-800">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-600/10 text-[10px] font-bold text-violet-700">1</span>
                <span>Add option types you need (Storage, RAM, Size…) — stack up to {MAX_OPTION_TYPES} for PCs and laptops</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-600/10 text-[10px] font-bold text-violet-700">2</span>
                <span>Add colors with product photos for each (optional)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-600/10 text-[10px] font-bold text-violet-700">3</span>
                <span>Set the full selling price for every combination</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-600/10 text-[10px] font-bold text-violet-700">4</span>
                <span>Optional: turn on Inventory tracking and enter stock per combination</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Photos */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Product photos</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
            {hasMultipleColors
              ? "Upload one photo per color. Customers see the matching photo when they pick a color."
              : hasSingleColor
                ? "Upload one main photo for this color (all options share it)."
                : "Upload a main photo. Add colors below if you want a different photo per color."}
          </p>
        </div>

        {!colorGroup || colorGroup.values.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <ImageUploadField name="image_file" label="Main product photo" />
          </div>
        ) : hasSingleColor ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <ImageUploadField name="image_file" label="Product photo" />
            <p className="mt-2 text-xs text-slate-500">
              All options of <strong>{colorGroup.values[0]!.name}</strong> use this photo.
            </p>
            {colorGroup.values.map((colorValue) => {
              const enc = encodeURIComponent(colorValue.name);
              return (
                <input
                  key={colorValue.name}
                  type="hidden"
                  name={`color_image_current__${enc}`}
                  value={colorValue.image_url ?? ""}
                />
              );
            })}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {colorGroup.values.map((colorValue) => {
              const enc = encodeURIComponent(colorValue.name);
              return (
                <div
                  key={colorValue.name}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-slate-700">
                    {colorValue.name}
                  </p>
                  <input
                    type="hidden"
                    name={`color_image_current__${enc}`}
                    value={colorValue.image_url ?? ""}
                  />
                  <ImageUploadField
                    name={`color_image__${enc}`}
                    label=""
                    initialImageUrl={colorValue.image_url}
                    optional
                    inline
                    uploadAriaLabel={`Upload photo for ${colorValue.name}`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product options */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900">Product options</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Add one or more option types (e.g. Storage + RAM for a PC). Leave empty if this product has no variations.
            </p>
          </div>
          {optionGroups.length > 0 ? (
            <button
              type="button"
              onClick={onClearAllOptionTypes}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors"
            >
              Clear all options
            </button>
          ) : null}
        </div>

        {optionGroups.length === 0 ? (
          <button
            type="button"
            onClick={() => addType("Storage")}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-violet-300 bg-violet-50/50 px-4 py-3 text-sm font-semibold text-violet-700 transition-all hover:border-violet-400 hover:bg-violet-50"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add product options
          </button>
        ) : (
          <>
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Quick-start templates
              </p>
              <div className="flex flex-wrap gap-2">
                {VARIANT_PRESETS.map((preset) => {
                  const added = optionGroups.some((g) => g.label === preset.label);
                  const focused = focusedLabel === preset.label;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      title={
                        added
                          ? `Edit ${preset.label} values`
                          : atTypeLimit
                            ? `Limit of ${MAX_OPTION_TYPES} option types — remove one first`
                            : preset.hint
                      }
                      disabled={!added && atTypeLimit}
                      onClick={() => addType(preset.label)}
                      className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                        focused
                          ? "border-violet-600 bg-violet-600 text-white shadow-sm"
                          : added
                            ? "border-violet-300 bg-violet-50 text-violet-900"
                            : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50"
                      }`}
                    >
                      {preset.label}
                      {added && !focused ? " ✓" : ""}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Click to add (or focus) a type. Example: Storage + RAM × Color for a PC.
                {atTypeLimit ? ` Max ${MAX_OPTION_TYPES} option types.` : ""}
              </p>
            </div>

            {optionGroups.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {optionGroups.map((g) => (
                  <span
                    key={g.label}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                      focusedLabel === g.label
                        ? "border-violet-600 bg-violet-600 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-800"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setFocusedLabel(g.label);
                        onDraftPrimaryChange("");
                      }}
                      className="hover:underline"
                    >
                      {g.label}
                      <span className="ml-1 opacity-70">({g.values.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onRemoveOptionType(g.label);
                        onDraftPrimaryChange("");
                      }}
                      className={`ml-0.5 ${
                        focusedLabel === g.label
                          ? "text-violet-200 hover:text-white"
                          : "text-slate-400 hover:text-rose-600"
                      }`}
                      aria-label={`Remove ${g.label}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-700">Custom option type</p>
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  value={customTypeInput}
                  onChange={(e) => setCustomTypeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const name = customTypeInput.trim();
                      if (name) {
                        addType(name);
                        setCustomTypeInput("");
                      }
                    }
                  }}
                  placeholder="e.g. Model, Bundle, Connector type"
                  className="ui-input"
                  disabled={atTypeLimit}
                />
                <button
                  type="button"
                  disabled={atTypeLimit}
                  onClick={() => {
                    const name = customTypeInput.trim();
                    if (name) {
                      addType(name);
                      setCustomTypeInput("");
                    }
                  }}
                  className="btn btn-primary rounded-xl px-6 disabled:opacity-40"
                >
                  Create
                </button>
              </div>
            </div>

            {focusedGroup ? (
              <>
                {activePreset ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold text-slate-700">
                      {focusedLabelSafe} options
                    </p>
                    <p className="mb-2 text-xs text-slate-500">
                      Click to add or remove. Nothing is selected until you choose it.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {activePreset.values.map((value) => (
                        <PresetChip
                          key={value}
                          label={value}
                          selected={selectedFocused.has(value)}
                          onClick={() => onToggleOptionValue(focusedGroup.label, value)}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Add the {focusedLabelSafe.toLowerCase()} values customers can choose.
                  </p>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    {activePreset ? "Or add a custom value" : `${focusedLabelSafe} values`}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <input
                      value={draftPrimary}
                      onChange={(e) => onDraftPrimaryChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const name = draftPrimary.trim();
                          if (name) onAddCustomOptionValue(focusedGroup.label, name);
                        }
                      }}
                      placeholder="e.g. 2TB, Pro Max, USB-C"
                      className="ui-input"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const name = draftPrimary.trim();
                        if (name) onAddCustomOptionValue(focusedGroup.label, name);
                      }}
                      className="btn btn-primary rounded-xl px-6"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {customFocusedValues.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {customFocusedValues.map((value) => (
                      <span
                        key={value.name}
                        className="inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-900"
                      >
                        {value.name}
                        <button
                          type="button"
                          onClick={() => onRemoveOptionValue(focusedGroup.label, value.name)}
                          className="text-violet-400 hover:text-rose-600 transition-colors"
                          aria-label={`Remove ${value.name}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
              </>
            ) : null}
          </>
        )}
      </div>

      {/* Colors */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900">Color options</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Add colors for phones, headphones, cases, or any product with color variations. Each color can have its own photo and pricing.
            </p>
          </div>
          {colorGroup ? (
            <button
              type="button"
              onClick={onRemoveColorGroup}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors"
            >
              Remove all colors
            </button>
          ) : (
            <button
              type="button"
              onClick={onEnsureColors}
              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition-all hover:bg-violet-100"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add colors
            </button>
          )}
        </div>

        {colorGroup ? (
          <>
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-700">Colors</p>
              <p className="mb-2 text-xs text-slate-500">
                Click to add or remove. Highlighted colors are included on this product.
              </p>
              <div className="flex flex-wrap gap-2">
                {COLOR_SUGGESTIONS.map((color) => (
                  <PresetChip
                    key={color}
                    label={color}
                    selected={selectedColors.has(color)}
                    onClick={() => onToggleColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-700">Or add a custom color</p>
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  value={draftColor}
                  onChange={(e) => onDraftColorChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const name = draftColor.trim();
                      if (name) onAddCustomColor(name);
                    }
                  }}
                  placeholder="e.g. Graphite, Deep Blue, Orange"
                  className="ui-input"
                />
                <button
                  type="button"
                  onClick={() => {
                    const name = draftColor.trim();
                    if (name) onAddCustomColor(name);
                  }}
                  className="btn btn-primary rounded-xl px-6"
                >
                  Add
                </button>
              </div>
            </div>

            {customColorValues.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {customColorValues.map((colorValue) => (
                  <span
                    key={colorValue.name}
                    className="inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-900"
                  >
                    {colorValue.name}
                    <button
                      type="button"
                      onClick={() => onRemoveColor(colorValue.name)}
                      className="text-violet-400 hover:text-rose-600 transition-colors"
                      aria-label={`Remove ${colorValue.name}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      {/* Price */}
      {showPriceList ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div>
            <p className="text-sm font-bold text-slate-900">Selling prices</p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              Enter the <strong>full price customers pay</strong> for each{" "}
              <strong>{comboAxesLabel || "combination"}</strong>. This replaces the simple price
              field above.
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              <strong>Don&apos;t sell a combo?</strong> Leave its price empty — customers will not
              be able to choose that combination.
            </p>
            {catalogFromPrice != null ? (
              <p className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                Catalog will show: from ${catalogFromPrice.toFixed(2)}
                <span className="font-medium text-emerald-700"> (lowest combination)</span>
              </p>
            ) : (
              <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Add at least one combination price so the catalog can show a “from” amount.
              </p>
            )}
          </div>

          {tooMany ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-xs font-semibold text-red-800">
                Too many combinations ({combinations.length})
              </p>
              <p className="mt-1 text-xs text-red-700">
                Please reduce the number of options or colors to create a manageable product catalog.
              </p>
            </div>
          ) : null}

          {useMatrix && matrixPrimary && colorGroup ? (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="max-h-[32rem] overflow-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="sticky left-0 z-20 bg-slate-50 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                        {matrixPrimary.label}
                      </th>
                      {colorGroup.values.map((color) => (
                        <th
                          key={color.name}
                          className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-600"
                        >
                          {color.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrixPrimary.values.map((row, rowIndex) => (
                      <tr
                        key={row.name}
                        className={`border-b border-slate-100 last:border-0 ${
                          rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                        }`}
                      >
                        <td className="sticky left-0 z-10 bg-inherit px-4 py-3 text-sm font-semibold text-slate-900 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                          {row.name}
                        </td>
                        {colorGroup.values.map((color) => {
                          const combo: OptionSelections = {
                            [matrixPrimary.label]: row.name,
                            [colorGroup.label]: color.name,
                          };
                          const key = buildVariantKey(groups, combo) ?? "";
                          const hasPrice = prices[key] != null;
                          return (
                            <td key={`${row.name}-${color.name}`} className="px-3 py-3 align-top">
                              <div
                                className={`mx-auto flex w-28 flex-col gap-2 rounded-lg p-1.5 ${
                                  hasPrice
                                    ? ""
                                    : "border border-dashed border-slate-200 bg-slate-50/80"
                                }`}
                              >
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                  {hasPrice ? "Price ($)" : "Not sold"}
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    autoComplete="off"
                                    value={prices[key] != null ? prices[key] : ""}
                                    onChange={(e) => {
                                      const raw = e.target.value.trim().replace(/[^\d.]/g, "");
                                      if (raw === "") {
                                        onPriceChange(key, -1);
                                        return;
                                      }
                                      onPriceChange(key, Number(raw));
                                    }}
                                    placeholder="—"
                                    className="ui-input mt-1 h-10 w-full px-2.5 text-center text-sm font-semibold"
                                    aria-label={
                                      hasPrice
                                        ? `Price for ${row.name} ${color.name}`
                                        : `Not sold: ${row.name} ${color.name} — enter a price to offer`
                                    }
                                  />
                                </label>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto">
              {combinations.slice(0, 80).map((combo, index) => {
                const key = buildVariantKey(groups, combo) ?? "";
                const label = formatSelectedOptionsDisplay(groups, combo);
                const hasPrice = prices[key] != null;
                return (
                  <div
                    key={key}
                    className={`flex flex-wrap items-center gap-4 rounded-lg border px-4 py-3.5 ${
                      hasPrice
                        ? index % 2 === 0
                          ? "border-slate-200 bg-white"
                          : "border-slate-200 bg-slate-50/50"
                        : "border-dashed border-slate-200 bg-slate-50/80"
                    }`}
                  >
                    <div className="flex-1 min-w-[12rem]">
                      <p className="text-sm font-semibold text-slate-900">{label}</p>
                      {!hasPrice ? (
                        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Not sold
                        </p>
                      ) : null}
                    </div>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Price ($)
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        value={prices[key] != null ? prices[key] : ""}
                        onChange={(e) => {
                          const raw = e.target.value.trim().replace(/[^\d.]/g, "");
                          if (raw === "") {
                            onPriceChange(key, -1);
                            return;
                          }
                          onPriceChange(key, Number(raw));
                        }}
                        placeholder="—"
                        className="ui-input h-10 w-28 px-3 text-center text-sm font-semibold"
                        aria-label={`Price for ${label}`}
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : hasOptions || optionGroups.length > 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-4 text-center">
          <p className="text-xs font-medium text-slate-600">Add values to each option type</p>
          <p className="mt-0.5 text-xs text-slate-400">
            Pricing appears once every option type has at least one value
            {colorGroup && colorGroup.values.length === 0
              ? " (and colors, if you enabled them)"
              : ""}
            .
          </p>
        </div>
      ) : null}
    </div>
  );
}

/** Stock editor — matrix for one option × color; list for multi-axis combos. */
export function ElectronicsStockEditor({
  optionGroups,
  colorGroup,
  groups,
  prices,
  stocks,
  onStockChange,
}: {
  optionGroups: MenuOptionGroup[];
  colorGroup: MenuOptionGroup | null;
  groups: MenuOptionGroup[];
  prices: Record<string, number>;
  stocks: Record<string, number>;
  onStockChange: (key: string, qty: number) => void;
}) {
  const filled = optionGroups.filter((g) => g.values.length > 0);
  const combinations = listVariantCombinations(groups);
  const pricedCombos = combinations.filter((combo) => {
    const key = buildVariantKey(groups, combo);
    return key != null && key in prices;
  });
  const useMatrix = Boolean(
    filled.length === 1 && colorGroup && colorGroup.values.length > 0,
  );
  const matrixPrimary = useMatrix ? filled[0]! : null;

  if (pricedCombos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-center">
        <p className="text-xs font-medium text-slate-600">No sellable combinations yet</p>
        <p className="mt-0.5 text-xs text-slate-400">
          Set prices in the Selling prices section above — then enter stock here per combination.
        </p>
      </div>
    );
  }

  if (useMatrix && matrixPrimary && colorGroup) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="max-h-80 overflow-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="sticky left-0 z-20 bg-slate-50 px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                  {matrixPrimary.label}
                </th>
                {colorGroup.values.map((color) => (
                  <th
                    key={color.name}
                    className="px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wide text-slate-600"
                  >
                    {color.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixPrimary.values.map((row, rowIndex) => (
                <tr
                  key={row.name}
                  className={`border-b border-slate-100 last:border-0 ${
                    rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                  }`}
                >
                  <td className="sticky left-0 z-10 bg-inherit px-4 py-2.5 text-sm font-semibold text-slate-900">
                    {row.name}
                  </td>
                  {colorGroup.values.map((color) => {
                    const combo: OptionSelections = {
                      [matrixPrimary.label]: row.name,
                      [colorGroup.label]: color.name,
                    };
                    const key = buildVariantKey(groups, combo) ?? "";
                    const offered = key in prices;
                    return (
                      <td key={`${row.name}-${color.name}`} className="px-3 py-2.5 text-center">
                        {offered ? (
                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            value={stocks[key] ?? 0}
                            onChange={(e) =>
                              onStockChange(
                                key,
                                Math.max(
                                  0,
                                  Math.floor(Number(e.target.value.replace(/[^\d]/g, "")) || 0),
                                ),
                              )
                            }
                            className="ui-input mx-auto h-10 w-20 px-2 text-center text-sm font-semibold tabular-nums"
                            aria-label={`Stock for ${row.name} ${color.name}`}
                          />
                        ) : (
                          <span className="inline-flex rounded-md border border-dashed border-slate-200 bg-slate-50 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            Not sold
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-80 space-y-2 overflow-y-auto">
      {pricedCombos.map((combo, index) => {
        const key = buildVariantKey(groups, combo) ?? "";
        const label = formatSelectedOptionsDisplay(groups, combo);
        return (
          <div
            key={key}
            className={`flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 ${
              index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
            }`}
          >
            <p className="min-w-0 flex-1 text-sm font-semibold text-slate-900">{label}</p>
            <label className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Qty
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={stocks[key] ?? 0}
                onChange={(e) =>
                  onStockChange(
                    key,
                    Math.max(0, Math.floor(Number(e.target.value.replace(/[^\d]/g, "")) || 0)),
                  )
                }
                className="ui-input h-10 w-20 px-2 text-center text-sm font-semibold tabular-nums"
                aria-label={`Stock for ${label}`}
              />
            </label>
          </div>
        );
      })}
    </div>
  );
}

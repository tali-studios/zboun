"use client";

import { useMemo, useState } from "react";
import { ImageUploadField } from "@/components/image-upload-field";
import {
  buildVariantKey,
  formatSelectedOptionsDisplay,
  listVariantCombinations,
  type MenuOptionGroup,
  type MenuOptionValue,
  type OptionSelections,
} from "@/lib/menu-item-options";
import type { ProductOptionHints } from "@/lib/store-item-profile";

type Props = {
  idPrefix?: string;
  defaultGroups?: MenuOptionGroup[];
  defaultVariantStock?: Record<string, number>;
  /** When true, show stock inputs per value (1 group) or per combination (2+ groups). */
  showStock?: boolean;
  /** Category-specific placeholder examples (Size/Color for fashion, etc.). */
  hints?: ProductOptionHints;
};

const DEFAULT_HINTS: ProductOptionHints = {
  typePrimary: "e.g. Size, Color, Style",
  typeSecondary: "e.g. Color",
  value: "Value (e.g. Large, Red)",
  addAnother: "+ Add another option type (e.g. Color)",
};

const FASHION_LETTER_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const FASHION_NUMERIC_SIZES = ["36", "38", "40", "42", "44", "46"] as const;
const FASHION_COLORS = [
  "Black",
  "White",
  "Beige",
  "Navy",
  "Grey",
  "Brown",
  "Red",
  "Green",
  "Blue",
  "Pink",
] as const;

function emptyGroup(label = ""): MenuOptionGroup {
  return { label, values: [] };
}

function fashionInitialGroups(defaultGroups: MenuOptionGroup[]): MenuOptionGroup[] {
  if (defaultGroups.length > 0) return defaultGroups;
  return [emptyGroup("Size")];
}

function setExactValues(group: MenuOptionGroup, names: readonly string[]): MenuOptionGroup {
  return {
    ...group,
    values: names.map((name) => {
      const existing = group.values.find((v) => v.name === name);
      return existing ?? { name, price: 0 };
    }),
  };
}

function toggleValue(group: MenuOptionGroup, name: string): MenuOptionGroup {
  if (group.values.some((v) => v.name === name)) {
    return { ...group, values: group.values.filter((v) => v.name !== name) };
  }
  return { ...group, values: [...group.values, { name, price: 0 }] };
}

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
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        selected
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
      }`}
    >
      {label}
    </button>
  );
}

function StockQtyInput({
  value,
  onChange,
  ariaLabel,
}: {
  value: number;
  onChange: (qty: number) => void;
  ariaLabel: string;
}) {
  return (
    <input
      type="number"
      min={0}
      step={1}
      value={value}
      onChange={(e) => onChange(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
      className="h-9 w-16 shrink-0 rounded-lg border border-slate-200 bg-white px-2 text-center text-sm font-semibold text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
      aria-label={ariaLabel}
    />
  );
}

function FashionStockEditor({
  groups,
  combinations,
  stocks,
  onStockChange,
  tooMany,
  totalCombinations,
}: {
  groups: MenuOptionGroup[];
  combinations: OptionSelections[];
  stocks: Record<string, number>;
  onStockChange: (key: string, qty: number) => void;
  tooMany: boolean;
  totalCombinations: number;
}) {
  const sizeGroup = groups.find((g) => /^size$/i.test(g.label));
  const colorGroup = groups.find((g) => /^colou?r$/i.test(g.label));
  const useMatrix = Boolean(sizeGroup && colorGroup && sizeGroup.values.length && colorGroup.values.length);

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
      <p className="text-sm font-semibold text-amber-950">
        Stock by {sizeGroup && colorGroup ? "size & color" : sizeGroup ? "size" : "option"}
      </p>
      <p className="mt-0.5 text-xs text-amber-900/80">
        Enter quantity for each combination customers can order.
      </p>
      {tooMany ? (
        <p className="mt-2 text-xs font-semibold text-red-700">
          Too many combinations ({totalCombinations}). Reduce sizes or colors.
        </p>
      ) : null}

      {useMatrix ? (
        <div className="mt-3 max-h-80 overflow-auto rounded-xl border border-amber-100 bg-white">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  Size
                </th>
                {colorGroup!.values.map((color) => (
                  <th
                    key={color.name}
                    className="px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500"
                  >
                    {color.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizeGroup!.values.map((size) => (
                <tr key={size.name} className="border-b border-slate-50 last:border-0">
                  <td className="sticky left-0 z-10 bg-white px-3 py-2 text-sm font-semibold text-slate-800">
                    {size.name}
                  </td>
                  {colorGroup!.values.map((color) => {
                    const combo: OptionSelections = {
                      [sizeGroup!.label]: size.name,
                      [colorGroup!.label]: color.name,
                    };
                    const key = buildVariantKey(groups, combo) ?? "";
                    return (
                      <td key={`${size.name}-${color.name}`} className="px-2 py-1.5 text-center">
                        <StockQtyInput
                          value={stocks[key] ?? 0}
                          onChange={(qty) => onStockChange(key, qty)}
                          ariaLabel={`Stock for ${size.name} ${color.name}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
          {combinations.map((combo) => {
            const key = buildVariantKey(groups, combo) ?? "";
            const label = formatSelectedOptionsDisplay(groups, combo);
            return (
              <div
                key={key}
                className="flex items-center gap-3 rounded-xl border border-amber-100 bg-white px-3 py-2"
              >
                <span className="min-w-0 flex-1 text-sm font-medium text-slate-800">{label}</span>
                <StockQtyInput
                  value={stocks[key] ?? 0}
                  onChange={(qty) => onStockChange(key, qty)}
                  ariaLabel={`Stock for ${label}`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MenuItemOptionsFields({
  idPrefix = "",
  defaultGroups = [],
  defaultVariantStock = {},
  showStock = false,
  hints = DEFAULT_HINTS,
}: Props) {
  const isFashion = hints.presetMode === "fashion";
  const [groups, setGroups] = useState<MenuOptionGroup[]>(() =>
    isFashion ? fashionInitialGroups(defaultGroups) : defaultGroups.length > 0 ? defaultGroups : [emptyGroup()],
  );
  const [draftNames, setDraftNames] = useState<Record<number, string>>({});
  const [draftPrices, setDraftPrices] = useState<Record<number, string>>({});
  const [stocks, setStocks] = useState<Record<string, number>>(defaultVariantStock);

  const cleanGroups = useMemo(
    () =>
      groups
        .map((g) => ({
          label: g.label.trim(),
          values: g.values
            .filter((v) => v.name.trim())
            .map((v) => ({
              name: v.name.trim(),
              price: v.price,
              ...(v.image_url?.trim() ? { image_url: v.image_url.trim() } : {}),
            })),
        }))
        .filter((g) => g.label && g.values.length > 0),
    [groups],
  );

  const optionValuesJson = useMemo(() => JSON.stringify(cleanGroups), [cleanGroups]);
  const primaryLabel = cleanGroups[0]?.label ?? "";
  const combinations = useMemo(() => listVariantCombinations(cleanGroups), [cleanGroups]);

  const stockJson = useMemo(() => {
    if (!showStock || cleanGroups.length === 0) return "{}";
    const next: Record<string, number> = {};
    for (const combo of combinations) {
      const key = buildVariantKey(cleanGroups, combo);
      if (!key) continue;
      next[key] = Math.max(0, Math.floor(Number(stocks[key] ?? 0)));
    }
    return JSON.stringify(next);
  }, [showStock, cleanGroups, combinations, stocks]);

  const fieldId = (name: string) => `${idPrefix}${name}`;
  const sizeGroupIndex = groups.findIndex((g) => /^size$/i.test(g.label.trim()));
  const colorGroupIndex = groups.findIndex((g) => /^colou?r$/i.test(g.label.trim()));
  const sizeGroup = sizeGroupIndex >= 0 ? groups[sizeGroupIndex] : null;
  const colorGroup = colorGroupIndex >= 0 ? groups[colorGroupIndex] : null;

  function updateGroupLabel(index: number, label: string) {
    setGroups((prev) => prev.map((g, i) => (i === index ? { ...g, label } : g)));
  }

  function addValue(index: number) {
    const name = (draftNames[index] ?? "").trim();
    if (!name) return;
    const price = Number(draftPrices[index] || 0);
    const value: MenuOptionValue = {
      name,
      price: Number.isFinite(price) && price > 0 ? price : 0,
    };
    setGroups((prev) =>
      prev.map((g, i) =>
        i === index && !g.values.some((v) => v.name === name)
          ? { ...g, values: [...g.values, value] }
          : g,
      ),
    );
    setDraftNames((prev) => ({ ...prev, [index]: "" }));
    setDraftPrices((prev) => ({ ...prev, [index]: "" }));
  }

  function removeValue(groupIndex: number, valueName: string) {
    setGroups((prev) =>
      prev.map((g, i) =>
        i === groupIndex ? { ...g, values: g.values.filter((v) => v.name !== valueName) } : g,
      ),
    );
  }

  function addGroup(prefillLabel = "") {
    if (groups.length >= 4) return;
    setGroups((prev) => [...prev, emptyGroup(prefillLabel)]);
  }

  function removeGroup(index: number) {
    setGroups((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function applySizePreset(names: readonly string[]) {
    setGroups((prev) => {
      const idx = prev.findIndex((g) => /^size$/i.test(g.label.trim()));
      if (idx >= 0) {
        return prev.map((g, i) => (i === idx ? setExactValues({ ...g, label: "Size" }, names) : g));
      }
      if (prev.length === 1 && !prev[0].label.trim() && prev[0].values.length === 0) {
        return [setExactValues(emptyGroup("Size"), names)];
      }
      return [...prev, setExactValues(emptyGroup("Size"), names)];
    });
  }

  function toggleSize(name: string) {
    setGroups((prev) => {
      const idx = prev.findIndex((g) => /^size$/i.test(g.label.trim()));
      if (idx >= 0) {
        return prev.map((g, i) => (i === idx ? toggleValue({ ...g, label: "Size" }, name) : g));
      }
      if (prev.length === 1 && !prev[0].label.trim() && prev[0].values.length === 0) {
        return [toggleValue(emptyGroup("Size"), name)];
      }
      return [...prev, toggleValue(emptyGroup("Size"), name)];
    });
  }

  function ensureColorGroup() {
    setGroups((prev) => {
      if (prev.some((g) => /^colou?r$/i.test(g.label.trim()))) return prev;
      return [...prev, emptyGroup("Color")];
    });
  }

  function toggleColor(name: string) {
    setGroups((prev) => {
      const idx = prev.findIndex((g) => /^colou?r$/i.test(g.label.trim()));
      if (idx >= 0) {
        return prev.map((g, i) => (i === idx ? toggleValue({ ...g, label: "Color" }, name) : g));
      }
      return [...prev, toggleValue(emptyGroup("Color"), name)];
    });
  }

  function removeColorGroup() {
    if (colorGroupIndex < 0) return;
    removeGroup(colorGroupIndex);
  }

  if (isFashion) {
    const selectedSizes = new Set((sizeGroup?.values ?? []).map((v) => v.name));
    const selectedColors = new Set((colorGroup?.values ?? []).map((v) => v.name));
    const sizeIdx = sizeGroupIndex >= 0 ? sizeGroupIndex : 0;

    return (
      <div className="space-y-4">
        <input type="hidden" name="option_label" value={primaryLabel} />
        <input type="hidden" name="option_values" value={optionValuesJson} />
        <input type="hidden" name="option_variant_stock" value={stockJson} />

        {/* Size */}
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Sizes</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Tap to select. Customers pick one size when ordering.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => applySizePreset(FASHION_LETTER_SIZES)}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-400"
              >
                Standard XS–XXL
              </button>
              <button
                type="button"
                onClick={() => applySizePreset(FASHION_NUMERIC_SIZES)}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-400"
              >
                EU 36–46
              </button>
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Letter
            </p>
            <div className="flex flex-wrap gap-2">
              {FASHION_LETTER_SIZES.map((size) => (
                <PresetChip
                  key={size}
                  label={size}
                  selected={selectedSizes.has(size)}
                  onClick={() => toggleSize(size)}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Numeric
            </p>
            <div className="flex flex-wrap gap-2">
              {FASHION_NUMERIC_SIZES.map((size) => (
                <PresetChip
                  key={size}
                  label={size}
                  selected={selectedSizes.has(size)}
                  onClick={() => toggleSize(size)}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              value={draftNames[sizeIdx] ?? ""}
              onChange={(e) =>
                setDraftNames((prev) => ({ ...prev, [sizeIdx]: e.target.value }))
              }
              placeholder="Custom size (e.g. One size, 28)"
              className="ui-input"
            />
            <button
              type="button"
              onClick={() => {
                const name = (draftNames[sizeIdx] ?? "").trim();
                if (!name) return;
                toggleSize(name);
                setDraftNames((prev) => ({ ...prev, [sizeIdx]: "" }));
              }}
              className="btn btn-secondary rounded-xl"
            >
              Add size
            </button>
          </div>
        </div>

        {/* Color */}
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Colors</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Optional. Add any color names you sell — not limited to the suggestions below.
              </p>
            </div>
            {colorGroup ? (
              <button
                type="button"
                onClick={removeColorGroup}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Remove colors
              </button>
            ) : (
              <button
                type="button"
                onClick={ensureColorGroup}
                className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 hover:bg-violet-100"
              >
                + Add colors
              </button>
            )}
          </div>

          {colorGroup ? (
            <>
              <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                <input
                  value={draftNames[colorGroupIndex] ?? ""}
                  onChange={(e) =>
                    setDraftNames((prev) => ({ ...prev, [colorGroupIndex]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addValue(colorGroupIndex);
                    }
                  }}
                  placeholder="Type any color (e.g. Olive, Dusty Rose, Sand…)"
                  className="ui-input"
                />
                <button
                  type="button"
                  onClick={() => addValue(colorGroupIndex)}
                  className="btn btn-secondary rounded-xl"
                >
                  Add color
                </button>
              </div>

              {colorGroup.values.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {colorGroup.values.map((colorValue) => (
                    <span
                      key={colorValue.name}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800"
                    >
                      {colorValue.name}
                      <button
                        type="button"
                        onClick={() => removeValue(colorGroupIndex, colorValue.name)}
                        className="text-slate-400 hover:text-slate-700"
                        aria-label={`Remove ${colorValue.name}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No colors yet — type a name and press Add.</p>
              )}

              <details className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
                <summary className="cursor-pointer text-xs font-semibold text-slate-600">
                  Quick suggestions (optional)
                </summary>
                <div className="mt-2 flex flex-wrap gap-2">
                  {FASHION_COLORS.map((color) => (
                    <PresetChip
                      key={color}
                      label={color}
                      selected={selectedColors.has(color)}
                      onClick={() => toggleColor(color)}
                    />
                  ))}
                </div>
              </details>

              {colorGroup.values.length > 0 ? (
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Photo per color</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Upload one photo for each color. All sizes of that color share the same image.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {colorGroup.values.map((colorValue) => {
                      const enc = encodeURIComponent(colorValue.name);
                      return (
                        <div
                          key={colorValue.name}
                          className="rounded-xl border border-slate-200 bg-slate-50/80 p-3"
                        >
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-600">
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
                </div>
              ) : null}
            </>
          ) : null}
        </div>

        {showStock && cleanGroups.length > 0 ? (
          <FashionStockEditor
            groups={cleanGroups}
            combinations={combinations.slice(0, 80)}
            stocks={stocks}
            onStockChange={(key, qty) =>
              setStocks((prev) => ({ ...prev, [key]: qty }))
            }
            tooMany={combinations.length > 80}
            totalCombinations={combinations.length}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="option_label" value={primaryLabel} />
      <input type="hidden" name="option_values" value={optionValuesJson} />
      <input type="hidden" name="option_variant_stock" value={stockJson} />

      {groups.map((group, groupIndex) => (
        <div
          key={`group-${groupIndex}`}
          className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3"
        >
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <label
                htmlFor={fieldId(`option_group_${groupIndex}_label`)}
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Option type {groupIndex + 1}
              </label>
              <input
                id={fieldId(`option_group_${groupIndex}_label`)}
                value={group.label}
                onChange={(e) => updateGroupLabel(groupIndex, e.target.value)}
                placeholder={groupIndex === 0 ? hints.typePrimary : hints.typeSecondary}
                className="ui-input w-full"
              />
            </div>
            {groups.length > 1 ? (
              <button
                type="button"
                onClick={() => removeGroup(groupIndex)}
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Remove
              </button>
            ) : null}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              {group.label.trim() ? `${group.label.trim()} values` : "Values"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.values.map((item) => (
                <span
                  key={`${groupIndex}-${item.name}`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                >
                  {item.name}
                  {item.price > 0 ? ` +$${item.price.toFixed(2)}` : ""}
                  <button
                    type="button"
                    onClick={() => removeValue(groupIndex, item.name)}
                    className="text-slate-400 hover:text-slate-700"
                    aria-label={`Remove ${item.name}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {group.values.length === 0 ? (
                <p className="text-xs text-slate-500">No values yet — add below.</p>
              ) : null}
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
              <input
                value={draftNames[groupIndex] ?? ""}
                onChange={(e) =>
                  setDraftNames((prev) => ({ ...prev, [groupIndex]: e.target.value }))
                }
                placeholder={hints.value}
                className="ui-input"
              />
              <input
                value={draftPrices[groupIndex] ?? ""}
                onChange={(e) =>
                  setDraftPrices((prev) => ({ ...prev, [groupIndex]: e.target.value }))
                }
                type="number"
                min={0}
                step="0.01"
                placeholder="Extra $"
                className="ui-input"
              />
              <button
                type="button"
                onClick={() => addValue(groupIndex)}
                className="btn btn-secondary rounded-xl"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      ))}

      {groups.length < 4 ? (
        <button
          type="button"
          onClick={() => addGroup()}
          className="rounded-xl border border-dashed border-violet-300 bg-violet-50/50 px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-50"
        >
          {hints.addAnother}
        </button>
      ) : null}

      {showStock && cleanGroups.length > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-900">
            Stock by variant
          </p>
          <p className="mt-1 text-xs text-amber-800">
            Set quantity for each combination customers can order. Item total stock is the sum.
          </p>
          {combinations.length > 80 ? (
            <p className="mt-2 text-xs font-semibold text-red-700">
              Too many combinations ({combinations.length}). Reduce values (max ~80 shown).
            </p>
          ) : null}
          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
            {combinations.slice(0, 80).map((combo) => {
              const key = buildVariantKey(cleanGroups, combo) ?? "";
              const label = formatSelectedOptionsDisplay(cleanGroups, combo);
              return (
                <div
                  key={key}
                  className="flex items-center gap-3 rounded-lg border border-amber-100 bg-white px-3 py-2"
                >
                  <span className="min-w-0 flex-1 text-sm font-medium text-slate-800">{label}</span>
                  <StockQtyInput
                    value={stocks[key] ?? 0}
                    onChange={(qty) => setStocks((prev) => ({ ...prev, [key]: qty }))}
                    ariaLabel={`Stock for ${label}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <p className="text-xs text-slate-400">
        Customers must pick one value from each option type when ordering.
      </p>
    </div>
  );
}

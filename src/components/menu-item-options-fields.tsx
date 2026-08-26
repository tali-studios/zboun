"use client";

import { useMemo, useState } from "react";
import { ElectronicsOptionsEditor, ElectronicsStockEditor } from "@/components/electronics-options-editor";
import { ImageUploadField } from "@/components/image-upload-field";
import { MenuItemStockFields } from "@/components/menu-item-stock-fields";
import {
  buildVariantKey,
  formatSelectedOptionsDisplay,
  isSizeLikeOptionLabel,
  listVariantCombinations,
  minVariantPrice,
  sumVariantStock,
  type MenuOptionGroup,
  type MenuOptionValue,
  type OptionSelections,
} from "@/lib/menu-item-options";
import type { ProductOptionHints } from "@/lib/store-item-profile";

type Props = {
  idPrefix?: string;
  defaultGroups?: MenuOptionGroup[];
  defaultVariantStock?: Record<string, number>;
  /** Absolute USD price per variant key (Storage×Color). */
  defaultVariantPrices?: Record<string, number>;
  /**
   * @deprecated Prefer includeStockPanel — keeps a separate always-on matrix.
   * When includeStockPanel is true, this is ignored.
   */
  showStock?: boolean;
  /** Unified inventory: toggle + matrix (when variants) or simple qty + alerts. */
  includeStockPanel?: boolean;
  defaultTrackStock?: boolean;
  defaultStockQuantity?: number | null;
  defaultWarningQty?: number | null;
  defaultUrgentQty?: number | null;
  defaultCriticalQty?: number | null;
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
const FASHION_VOLUME_SIZES = ["50mL", "75mL", "100mL", "150mL", "200mL"] as const;
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

const MAX_ELECTRONICS_OPTION_TYPES = 3;

/** Keep non-color option types first, Color last (stable variant keys). */
function electronicsOrderGroups(groups: MenuOptionGroup[]): MenuOptionGroup[] {
  const nonColor = groups.filter((g) => !/^colou?r$/i.test(g.label.trim()));
  const color = groups.find((g) => /^colou?r$/i.test(g.label.trim()));
  return color ? [...nonColor, color] : [...nonColor];
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
  onRemoveSize,
  onRemoveColor,
  tooMany,
  totalCombinations,
}: {
  groups: MenuOptionGroup[];
  combinations: OptionSelections[];
  stocks: Record<string, number>;
  onStockChange: (key: string, qty: number) => void;
  onRemoveSize?: (sizeName: string) => void;
  onRemoveColor?: (colorName: string) => void;
  tooMany: boolean;
  totalCombinations: number;
}) {
  const sizeGroup = groups.find((g) => isSizeLikeOptionLabel(g.label));
  const colorGroup = groups.find((g) => /^colou?r$/i.test(g.label));
  const useMatrix = Boolean(sizeGroup && colorGroup && sizeGroup.values.length && colorGroup.values.length);
  const rowLabel = sizeGroup?.label?.trim() || "Size";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-xs text-slate-500">
        Use × to remove a {rowLabel.toLowerCase()} or color added by mistake.
      </p>
      {tooMany ? (
        <p className="mt-2 text-xs font-semibold text-red-700">
          Too many combinations ({totalCombinations}). Reduce {rowLabel.toLowerCase()}s or colors.
        </p>
      ) : null}

      {useMatrix ? (
        <div className="mt-3 max-h-80 overflow-auto rounded-xl border border-slate-100">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  {rowLabel}
                </th>
                {colorGroup!.values.map((color) => (
                  <th
                    key={color.name}
                    className="px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500"
                  >
                    <span className="inline-flex items-center justify-center gap-1">
                      {color.name}
                      {onRemoveColor ? (
                        <button
                          type="button"
                          onClick={() => onRemoveColor(color.name)}
                          className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                          aria-label={`Remove color ${color.name}`}
                          title={`Remove ${color.name}`}
                        >
                          ×
                        </button>
                      ) : null}
                    </span>
                  </th>
                ))}
                {onRemoveSize ? (
                  <th className="w-10 px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    <span className="sr-only">Remove</span>
                  </th>
                ) : null}
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
                  {onRemoveSize ? (
                    <td className="px-2 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveSize(size.name)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        aria-label={`Remove size ${size.name}`}
                        title={`Remove ${size.name}`}
                      >
                        ×
                      </button>
                    </td>
                  ) : null}
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
            const sizeName = sizeGroup ? String(combo[sizeGroup.label] ?? "") : "";
            return (
              <div
                key={key}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2"
              >
                <span className="min-w-0 flex-1 text-sm font-medium text-slate-800">{label}</span>
                <StockQtyInput
                  value={stocks[key] ?? 0}
                  onChange={(qty) => onStockChange(key, qty)}
                  ariaLabel={`Stock for ${label}`}
                />
                {onRemoveSize && sizeName ? (
                  <button
                    type="button"
                    onClick={() => onRemoveSize(sizeName)}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Remove size ${sizeName}`}
                    title={`Remove ${sizeName}`}
                  >
                    ×
                  </button>
                ) : null}
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
  defaultVariantPrices = {},
  showStock = false,
  includeStockPanel = false,
  defaultTrackStock = false,
  defaultStockQuantity = null,
  defaultWarningQty = null,
  defaultUrgentQty = null,
  defaultCriticalQty = null,
  hints = DEFAULT_HINTS,
}: Props) {
  const isFashion = hints.presetMode === "fashion";
  const isElectronics = hints.presetMode === "electronics";
  const [groups, setGroups] = useState<MenuOptionGroup[]>(() => {
    if (isFashion) return fashionInitialGroups(defaultGroups);
    if (isElectronics) {
      // Start empty so simple single-SKU products don't force Storage.
      return defaultGroups.length > 0 ? electronicsOrderGroups(defaultGroups) : [];
    }
    return defaultGroups.length > 0 ? defaultGroups : [emptyGroup()];
  });
  const [draftNames, setDraftNames] = useState<Record<number, string>>({});
  const [draftPrices, setDraftPrices] = useState<Record<number, string>>({});
  const [draftPrimary, setDraftPrimary] = useState("");
  const [draftColor, setDraftColor] = useState("");
  const [stocks, setStocks] = useState<Record<string, number>>(defaultVariantStock);
  const [prices, setPrices] = useState<Record<string, number>>(defaultVariantPrices);
  const [trackStock, setTrackStock] = useState(defaultTrackStock);

  const cleanGroups = useMemo(() => {
    const cleaned = groups
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
      .filter((g) => g.label && g.values.length > 0);
    return isElectronics ? electronicsOrderGroups(cleaned) : cleaned;
  }, [groups, isElectronics]);

  const optionValuesJson = useMemo(() => JSON.stringify(cleanGroups), [cleanGroups]);
  const primaryLabel = cleanGroups[0]?.label ?? "";
  const combinations = useMemo(() => listVariantCombinations(cleanGroups), [cleanGroups]);
  const hasVariants = cleanGroups.length > 0 && combinations.length > 0;
  const variantMode = includeStockPanel && hasVariants;
  const stockEnabled = includeStockPanel ? trackStock : showStock;

  const stockJson = useMemo(() => {
    if (!stockEnabled || !hasVariants) return "{}";
    const next: Record<string, number> = {};
    for (const combo of combinations) {
      const key = buildVariantKey(cleanGroups, combo);
      if (!key) continue;
      // Electronics: only track stock for combos that have a selling price.
      if (isElectronics && !(key in prices)) continue;
      next[key] = Math.max(0, Math.floor(Number(stocks[key] ?? 0)));
    }
    return JSON.stringify(next);
  }, [stockEnabled, hasVariants, cleanGroups, combinations, stocks, isElectronics, prices]);

  const priceJson = useMemo(() => {
    if (!hasVariants || !isElectronics) return "{}";
    const next: Record<string, number> = {};
    for (const combo of combinations) {
      const key = buildVariantKey(cleanGroups, combo);
      if (!key) continue;
      if (!(key in prices)) continue;
      const n = Number(prices[key]);
      if (!Number.isFinite(n) || n < 0) continue;
      next[key] = Math.round(n * 100) / 100;
    }
    return JSON.stringify(next);
  }, [hasVariants, isElectronics, cleanGroups, combinations, prices]);

  const suggestedFromPrice = useMemo(() => {
    if (!isElectronics) return null;
    const map: Record<string, number> = {};
    try {
      Object.assign(map, JSON.parse(priceJson) as Record<string, number>);
    } catch {
      return null;
    }
    return minVariantPrice(map);
  }, [isElectronics, priceJson]);

  const pricedComboCount = useMemo(() => {
    if (!isElectronics) return 0;
    try {
      return Object.keys(JSON.parse(priceJson) as Record<string, number>).length;
    } catch {
      return 0;
    }
  }, [isElectronics, priceJson]);

  const variantTotal = useMemo(() => {
    if (!hasVariants) return 0;
    const next: Record<string, number> = {};
    for (const combo of combinations) {
      const key = buildVariantKey(cleanGroups, combo);
      if (!key) continue;
      if (isElectronics && !(key in prices)) continue;
      next[key] = Math.max(0, Math.floor(Number(stocks[key] ?? 0)));
    }
    return sumVariantStock(next);
  }, [hasVariants, cleanGroups, combinations, stocks, isElectronics, prices]);

  const fieldId = (name: string) => `${idPrefix}${name}`;
  const sizeGroupIndex = groups.findIndex((g) => isSizeLikeOptionLabel(g.label.trim()));
  const colorGroupIndex = groups.findIndex((g) => /^colou?r$/i.test(g.label.trim()));
  const sizeGroup = sizeGroupIndex >= 0 ? groups[sizeGroupIndex] : null;
  const colorGroup = colorGroupIndex >= 0 ? groups[colorGroupIndex] : null;
  const electronicsOptionGroups = isElectronics
    ? groups.filter((g) => !/^colou?r$/i.test(g.label.trim()))
    : [];

  function purgeStockKeys(predicate: (key: string) => boolean) {
    setStocks((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (predicate(key)) delete next[key];
      }
      return next;
    });
  }

  function renderVariantEditor() {
  return (
      <FashionStockEditor
        groups={cleanGroups}
        combinations={combinations.slice(0, 80)}
        stocks={stocks}
        onStockChange={(key, qty) => setStocks((prev) => ({ ...prev, [key]: qty }))}
        onRemoveSize={
          sizeGroupIndex >= 0
            ? (sizeName) => {
                removeValue(sizeGroupIndex, sizeName);
                purgeStockKeys(
                  (key) =>
                    key === sizeName ||
                    key.startsWith(`${sizeName}||`) ||
                    key.endsWith(`||${sizeName}`) ||
                    key.includes(`||${sizeName}||`),
                );
              }
            : undefined
        }
        onRemoveColor={
          colorGroupIndex >= 0
            ? (colorName) => {
                removeValue(colorGroupIndex, colorName);
                purgeStockKeys(
                  (key) =>
                    key === colorName ||
                    key.startsWith(`${colorName}||`) ||
                    key.endsWith(`||${colorName}`) ||
                    key.includes(`||${colorName}||`),
                );
              }
            : undefined
        }
        tooMany={combinations.length > 80}
        totalCombinations={combinations.length}
      />
    );
  }

  function renderStockPanel() {
    if (!includeStockPanel) return null;
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="mb-1 text-sm font-semibold text-slate-900">Inventory</p>
        <p className="mb-3 text-xs text-slate-500">
          {hasVariants
            ? "One place for stock: set units per size & color. Total updates automatically."
            : "Track a single quantity, or add sizes/colors above to manage stock per variant."}
        </p>
        <MenuItemStockFields
          idPrefix={idPrefix}
          defaultTrackStock={defaultTrackStock}
          trackStock={trackStock}
          onTrackStockChange={setTrackStock}
          defaultStockQuantity={defaultStockQuantity}
          defaultWarningQty={defaultWarningQty}
          defaultUrgentQty={defaultUrgentQty}
          defaultCriticalQty={defaultCriticalQty}
          variantMode={variantMode}
          variantTotal={variantTotal}
        >
          {variantMode ? renderVariantEditor() : null}
        </MenuItemStockFields>
      </div>
    );
  }

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

  function updateValuePrice(groupIndex: number, valueName: string, price: number) {
    const nextPrice = Number.isFinite(price) && price > 0 ? price : 0;
    setGroups((prev) =>
      prev.map((g, i) =>
        i === groupIndex
          ? {
              ...g,
              values: g.values.map((v) =>
                v.name === valueName ? { ...v, price: nextPrice } : v,
              ),
            }
          : g,
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
      const idx = prev.findIndex((g) => isSizeLikeOptionLabel(g.label.trim()));
      if (idx >= 0) {
        const label = /^storage$/i.test(prev[idx]!.label.trim()) ? "Storage" : "Size";
        return prev.map((g, i) => (i === idx ? setExactValues({ ...g, label }, names) : g));
      }
      if (prev.length === 1 && !prev[0].label.trim() && prev[0].values.length === 0) {
        return [setExactValues(emptyGroup("Size"), names)];
      }
      return [...prev, setExactValues(emptyGroup("Size"), names)];
    });
  }

  function toggleSize(name: string) {
    setGroups((prev) => {
      const idx = prev.findIndex((g) => isSizeLikeOptionLabel(g.label.trim()));
      if (idx >= 0) {
        const label = /^storage$/i.test(prev[idx]!.label.trim()) ? "Storage" : "Size";
        return prev.map((g, i) => (i === idx ? toggleValue({ ...g, label }, name) : g));
      }
      if (prev.length === 1 && !prev[0].label.trim() && prev[0].values.length === 0) {
        return [toggleValue(emptyGroup("Size"), name)];
      }
      return [...prev, toggleValue(emptyGroup("Size"), name)];
    });
  }

  function addOptionType(label: string) {
    const trimmed = label.trim();
    if (!trimmed) return;
    setGroups((prev) => {
      const ordered = electronicsOrderGroups(prev);
      const nonColor = ordered.filter((g) => !/^colou?r$/i.test(g.label.trim()));
      const color = ordered.find((g) => /^colou?r$/i.test(g.label.trim()));
      if (nonColor.some((g) => g.label === trimmed)) {
        return ordered;
      }
      if (nonColor.length >= MAX_ELECTRONICS_OPTION_TYPES) {
        return ordered;
      }
      const next = [...nonColor, emptyGroup(trimmed)];
      return color ? [...next, color] : next;
    });
    setDraftPrimary("");
  }

  function removeOptionType(label: string) {
    setGroups((prev) =>
      electronicsOrderGroups(prev.filter((g) => g.label !== label)),
    );
    setPrices({});
    setStocks({});
  }

  function clearAllOptionTypes() {
    setGroups((prev) => prev.filter((g) => /^colou?r$/i.test(g.label.trim())));
    setPrices({});
    setStocks({});
  }

  function toggleOptionValue(groupLabel: string, name: string) {
    setGroups((prev) => {
      const idx = prev.findIndex((g) => g.label === groupLabel);
      if (idx >= 0) {
        return electronicsOrderGroups(
          prev.map((g, i) => (i === idx ? toggleValue({ ...g, label: groupLabel }, name) : g)),
        );
      }
      return electronicsOrderGroups([...prev, toggleValue(emptyGroup(groupLabel), name)]);
    });
  }

  function addCustomOptionValue(groupLabel: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed || !groupLabel.trim()) return;
    setGroups((prev) => {
      const idx = prev.findIndex((g) => g.label === groupLabel);
      if (idx >= 0) {
        return electronicsOrderGroups(
          prev.map((g, i) => {
            if (i !== idx) return g;
            if (g.values.some((v) => v.name === trimmed)) return g;
            return { ...g, values: [...g.values, { name: trimmed, price: 0 }] };
          }),
        );
      }
      return electronicsOrderGroups([
        ...prev,
        { label: groupLabel, values: [{ name: trimmed, price: 0 }] },
      ]);
    });
    setDraftPrimary("");
  }

  function removeOptionValue(groupLabel: string, name: string) {
    const idx = groups.findIndex((g) => g.label === groupLabel);
    if (idx < 0) return;
    removeValue(idx, name);
    purgeStockKeys(
      (key) =>
        key === name ||
        key.startsWith(`${name}||`) ||
        key.endsWith(`||${name}`) ||
        key.includes(`||${name}||`),
    );
    purgePriceKeys(
      (key) =>
        key === name ||
        key.startsWith(`${name}||`) ||
        key.endsWith(`||${name}`) ||
        key.includes(`||${name}||`),
    );
  }

  function addCustomColor(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setGroups((prev) => {
      const idx = prev.findIndex((g) => /^colou?r$/i.test(g.label.trim()));
      if (idx >= 0) {
        return prev.map((g, i) => {
          if (i !== idx) return g;
          if (g.values.some((v) => v.name === trimmed)) return g;
          return { ...g, values: [...g.values, { name: trimmed, price: 0 }] };
        });
      }
      return [...prev, { label: "Color", values: [{ name: trimmed, price: 0 }] }];
    });
    setDraftColor("");
  }

  function setVariantPrice(key: string, price: number) {
    setPrices((prev) => {
      const next = { ...prev };
      if (!Number.isFinite(price) || price < 0) {
        delete next[key];
        return next;
      }
      next[key] = Math.round(price * 100) / 100;
      return next;
    });
  }

  function purgePriceKeys(predicate: (key: string) => boolean) {
    setPrices((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (predicate(key)) delete next[key];
      }
      return next;
    });
  }

  function ensureColorGroup() {
    setGroups((prev) => {
      if (prev.some((g) => /^colou?r$/i.test(g.label.trim()))) return electronicsOrderGroups(prev);
      return electronicsOrderGroups([...prev, emptyGroup("Color")]);
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
    setGroups((prev) => prev.filter((_, i) => i !== colorGroupIndex));
  }

  if (isElectronics) {
    return (
      <div className="space-y-4">
        <input type="hidden" name="option_label" value={primaryLabel} />
        <input type="hidden" name="option_values" value={optionValuesJson} />
        <input type="hidden" name="option_variant_stock" value={stockJson} />
        <input type="hidden" name="option_variant_prices" value={priceJson} />
        {suggestedFromPrice != null ? (
          <input type="hidden" name="variant_from_price" value={String(suggestedFromPrice)} />
        ) : null}

        <ElectronicsOptionsEditor
          optionGroups={electronicsOptionGroups}
          colorGroup={colorGroup}
          groups={cleanGroups}
          prices={prices}
          draftPrimary={draftPrimary}
          draftColor={draftColor}
          onDraftPrimaryChange={setDraftPrimary}
          onDraftColorChange={setDraftColor}
          onAddOptionType={addOptionType}
          onRemoveOptionType={removeOptionType}
          onClearAllOptionTypes={clearAllOptionTypes}
          onToggleOptionValue={toggleOptionValue}
          onAddCustomOptionValue={addCustomOptionValue}
          onRemoveOptionValue={removeOptionValue}
          onToggleColor={toggleColor}
          onAddCustomColor={addCustomColor}
          onRemoveColor={(name) => {
            if (colorGroupIndex < 0) return;
            removeValue(colorGroupIndex, name);
            purgeStockKeys(
              (key) =>
                key === name ||
                key.startsWith(`${name}||`) ||
                key.endsWith(`||${name}`) ||
                key.includes(`||${name}||`),
            );
            purgePriceKeys(
              (key) =>
                key === name ||
                key.startsWith(`${name}||`) ||
                key.endsWith(`||${name}`) ||
                key.includes(`||${name}||`),
            );
          }}
          onEnsureColors={ensureColorGroup}
          onRemoveColorGroup={removeColorGroup}
          onPriceChange={setVariantPrice}
          catalogFromPrice={suggestedFromPrice}
        />

        {includeStockPanel ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="mb-1 text-sm font-semibold text-slate-900">Inventory tracking</p>
            <p className="mb-3 text-xs text-slate-500">
              Enter stock for each priced combination below. Combinations left blank in Selling
              prices stay “Not sold” and are not offered.
            </p>
            <MenuItemStockFields
              idPrefix={idPrefix}
              defaultTrackStock={defaultTrackStock}
              trackStock={trackStock}
              onTrackStockChange={setTrackStock}
              defaultStockQuantity={defaultStockQuantity}
              defaultWarningQty={defaultWarningQty}
              defaultUrgentQty={defaultUrgentQty}
              defaultCriticalQty={defaultCriticalQty}
              variantMode={variantMode && trackStock}
              variantTotal={variantTotal}
            >
              {trackStock && hasVariants ? (
                <ElectronicsStockEditor
                  optionGroups={electronicsOptionGroups}
                  colorGroup={colorGroup}
                  groups={cleanGroups}
                  prices={prices}
                  stocks={stocks}
                  onStockChange={(key, qty) => setStocks((prev) => ({ ...prev, [key]: qty }))}
                />
              ) : null}
            </MenuItemStockFields>
          </div>
        ) : null}

        {suggestedFromPrice != null ? (
          <p className="text-xs text-slate-500">
            Catalog shows{" "}
            <span className="font-semibold text-slate-800">
              {pricedComboCount >= 2 ? "From " : ""}
              ${suggestedFromPrice.toFixed(2)}
            </span>{" "}
            (lowest combo price).
          </p>
        ) : null}
      </div>
    );
  }

  if (isFashion) {
    const selectedSizes = new Set((sizeGroup?.values ?? []).map((v) => v.name));
    const selectedColors = new Set((colorGroup?.values ?? []).map((v) => v.name));
    const sizeIdx = sizeGroupIndex >= 0 ? sizeGroupIndex : 0;
    const hasMultipleColors = (colorGroup?.values.length ?? 0) >= 2;
    const hasSingleColor = (colorGroup?.values.length ?? 0) === 1;

    return (
      <div className="space-y-4">
        <input type="hidden" name="option_label" value={primaryLabel} />
        <input type="hidden" name="option_values" value={optionValuesJson} />
        <input type="hidden" name="option_variant_stock" value={stockJson} />
        <input type="hidden" name="option_variant_prices" value="{}" />

        {/* ─── Consolidated Image Management ───────────────────────────────── */}
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Product Photos</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              {hasMultipleColors
                ? "Upload one photo for each color. These will be shown to customers when they select a color."
                : hasSingleColor
                  ? "Upload one main photo — it will be used for all sizes of your single color."
                  : "Upload one main photo for your product. Add colors below to enable per-color photos."}
            </p>
          </div>

          {!colorGroup || (colorGroup.values.length === 0) ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <ImageUploadField name="image_file" label="Main product photo" />
              <p className="mt-2 text-xs text-slate-500">
                This photo will be shown on the product card and detail view.
              </p>
            </div>
          ) : hasSingleColor ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <ImageUploadField name="image_file" label="Product photo" />
              <p className="mt-2 text-xs text-slate-500">
                All sizes of <strong>{colorGroup.values[0].name}</strong> will use this photo.
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
            <div className="space-y-2.5">
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
              <p className="text-[11px] leading-relaxed text-slate-600">
                Optional: Leave any color empty to use a placeholder. Upload only when you have a photo for that specific color.
              </p>
            </div>
          )}
        </div>

        {/* Size */}
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Sizes</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Tap to select. Tap again or use × to remove a mistake.
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

          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Volume (Perfumes & Fragrances)
            </p>
            <div className="flex flex-wrap gap-2">
              {FASHION_VOLUME_SIZES.map((size) => (
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
              Custom size or volume
            </p>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
              <input
                value={draftNames[sizeIdx] ?? ""}
                onChange={(e) =>
                  setDraftNames((prev) => ({ ...prev, [sizeIdx]: e.target.value }))
                }
                placeholder="e.g. One size, 50mL, 100mL"
                className="ui-input"
              />
              <input
                value={draftPrices[sizeIdx] ?? ""}
                onChange={(e) =>
                  setDraftPrices((prev) => ({ ...prev, [sizeIdx]: e.target.value }))
                }
                type="number"
                min={0}
                step="0.01"
                placeholder="Extra $"
                title="Optional: Add extra cost for this size"
                className="ui-input w-24"
              />
              <button
                type="button"
                onClick={() => {
                  const name = (draftNames[sizeIdx] ?? "").trim();
                  if (!name) return;
                  const price = Number(draftPrices[sizeIdx] || 0);
                  const value: MenuOptionValue = {
                    name,
                    price: Number.isFinite(price) && price > 0 ? price : 0,
                  };
                  setGroups((prev) =>
                    prev.map((g, i) =>
                      i === sizeIdx && !g.values.some((v) => v.name === name)
                        ? { ...g, values: [...g.values, value] }
                        : g,
                    ),
                  );
                  setDraftNames((prev) => ({ ...prev, [sizeIdx]: "" }));
                  setDraftPrices((prev) => ({ ...prev, [sizeIdx]: "" }));
                }}
                className="btn btn-secondary rounded-xl"
              >
                Add
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-slate-500">
              Tip: For perfumes or premium items, enter a size and set different prices (e.g. 50mL at base price, 100mL +$15).
            </p>
          </div>

          {sizeGroup && sizeGroup.values.length > 0 ? (
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Selected — set extra price per size
              </p>
              <p className="mb-2 text-[10px] text-slate-500">
                Base item price applies to all. Extra $ is added when the customer picks that size (e.g. 50mL = $0, 100mL = +$15).
              </p>
              <div className="space-y-2">
                {sizeGroup.values.map((sizeValue) => (
                  <div
                    key={sizeValue.name}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2"
                  >
                    <span className="min-w-0 flex-1 text-sm font-semibold text-slate-800">
                      {sizeValue.name}
                    </span>
                    <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Extra $
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={sizeValue.price > 0 ? sizeValue.price : ""}
                        onChange={(e) =>
                          updateValuePrice(sizeIdx, sizeValue.name, Number(e.target.value || 0))
                        }
                        placeholder="0"
                        className="ui-input h-8 w-20 text-sm"
                        aria-label={`Extra price for ${sizeValue.name}`}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeValue(sizeIdx, sizeValue.name)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label={`Remove size ${sizeValue.name}`}
                      title={`Remove ${sizeValue.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Color */}
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Colors</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Optional. Leave empty for one look, or add colors shoppers can pick from.
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
            </>
          ) : null}
        </div>

        {includeStockPanel ? renderStockPanel() : null}

        {!includeStockPanel && showStock && cleanGroups.length > 0 ? renderVariantEditor() : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input type="hidden" name="option_label" value={primaryLabel} />
      <input type="hidden" name="option_values" value={optionValuesJson} />
      <input type="hidden" name="option_variant_stock" value={stockJson} />
      <input type="hidden" name="option_variant_prices" value="{}" />

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

      {includeStockPanel ? renderStockPanel() : null}

      {!includeStockPanel && showStock && cleanGroups.length > 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Stock by variant
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Set quantity for each combination. Item total stock is the sum.
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
                  className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
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

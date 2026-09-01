/**
 * Menu item option groups (Size, Color, Grind, …) + per-variant stock.
 *
 * Storage (backward compatible):
 * - Legacy: option_label + option_values: [{ name, price }]
 * - New:    option_values: [{ label, values: [{ name, price }] }]
 *           option_variant_stock: { "M||Red": 5, "L||Blue": 2 }
 *           (single group keys are just the value name: { "M": 5 })
 */

export type MenuOptionValue = {
  name: string;
  price: number;
  /** Optional image for this option value (used for Color — one photo per color). */
  image_url?: string | null;
};

export type MenuOptionGroup = {
  label: string;
  values: MenuOptionValue[];
};

export type OptionSelections = Record<string, string>; // label -> value name

const VARIANT_SEP = "||";
const DISPLAY_SEP = " / ";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asPrice(raw: unknown): number {
  const n = Number(raw ?? 0);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
}

function isGroupShape(entry: unknown): entry is { label: unknown; values: unknown } {
  return isPlainObject(entry) && Array.isArray(entry.values);
}

/** Normalize legacy or new option_values into groups. */
export function normalizeOptionGroups(
  optionLabel: string | null | undefined,
  optionValues: unknown,
): MenuOptionGroup[] {
  if (!Array.isArray(optionValues) || optionValues.length === 0) return [];

  if (isGroupShape(optionValues[0])) {
    const groups: MenuOptionGroup[] = [];
    for (const raw of optionValues) {
      if (!isGroupShape(raw)) continue;
      const label = String(raw.label ?? "").trim();
      if (!label) continue;
      const values: MenuOptionValue[] = [];
      for (const v of Array.isArray(raw.values) ? raw.values : []) {
        if (!isPlainObject(v)) continue;
        const name = String(v.name ?? "").trim();
        if (!name) continue;
        values.push({
          name,
          price: asPrice(v.price),
          image_url: typeof v.image_url === "string" && v.image_url.trim() ? v.image_url.trim() : null,
        });
      }
      if (values.length === 0) continue;
      groups.push({ label, values });
    }
    return groups;
  }

  // Legacy flat list
  const label = String(optionLabel ?? "").trim() || "Option";
  const values: MenuOptionValue[] = [];
  for (const v of optionValues) {
    if (!isPlainObject(v)) continue;
    const name = String(v.name ?? "").trim();
    if (!name) continue;
    values.push({
      name,
      price: asPrice(v.price),
      image_url: typeof v.image_url === "string" && v.image_url.trim() ? v.image_url.trim() : null,
    });
  }
  return values.length > 0 ? [{ label, values }] : [];
}

export function itemHasOptionGroups(
  optionLabel: string | null | undefined,
  optionValues: unknown,
): boolean {
  return normalizeOptionGroups(optionLabel, optionValues).length > 0;
}

export function primaryOptionLabel(groups: MenuOptionGroup[]): string | null {
  return groups[0]?.label ?? null;
}

/** Serialize groups for DB (always new shape). */
export function serializeOptionGroups(groups: MenuOptionGroup[]): MenuOptionGroup[] {
  return groups
    .map((g) => ({
      label: g.label.trim(),
      values: g.values
        .map((v) => ({
          name: v.name.trim(),
          price: asPrice(v.price),
          ...(v.image_url?.trim() ? { image_url: v.image_url.trim() } : {}),
        }))
        .filter((v) => v.name),
    }))
    .filter((g) => g.label && g.values.length > 0);
}

export function isColorLikeOptionLabel(label: string) {
  return /\b(color|colour|colors|colours|shade|tone)\b/i.test(label.trim());
}

/** Size, storage, capacity, model — primary dimension for fashion & electronics matrices. */
export function isSizeLikeOptionLabel(label: string) {
  return /\b(size|sizes|taille|talla|fit|storage|capacity|memory|ram|model|version|config|configuration|wattage|length|screen|inch|inches|variant|option)\b/i.test(
    label.trim(),
  );
}

export function findColorOptionGroup(groups: MenuOptionGroup[]): MenuOptionGroup | null {
  return groups.find((g) => isColorLikeOptionLabel(g.label)) ?? null;
}

export function findSizeLikeOptionGroup(groups: MenuOptionGroup[]): MenuOptionGroup | null {
  return groups.find((g) => isSizeLikeOptionLabel(g.label)) ?? null;
}

function asAbsolutePrice(raw: unknown): number | null {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

export function parseVariantPriceMap(raw: unknown): Record<string, number> {
  if (!isPlainObject(raw)) return {};
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    const k = String(key).trim();
    if (!k) continue;
    const price = asAbsolutePrice(value);
    if (price == null) continue;
    out[k] = price;
  }
  return out;
}

export function parseVariantPricesFromForm(raw: FormDataEntryValue | null): Record<string, number> {
  const text = String(raw ?? "").trim();
  if (!text) return {};
  try {
    return parseVariantPriceMap(JSON.parse(text));
  } catch {
    return {};
  }
}

export function itemUsesVariantPrices(prices: Record<string, number> | null | undefined): boolean {
  return Boolean(prices && Object.keys(prices).length > 0);
}

export function getVariantAbsolutePrice(
  prices: Record<string, number> | null | undefined,
  variantKey: string | null | undefined,
): number | null {
  if (!variantKey || !prices) return null;
  if (!(variantKey in prices)) return null;
  return asAbsolutePrice(prices[variantKey]);
}

/**
 * When an item has a price matrix, only combos with an entered price are offered.
 * Empty cells = not sold (e.g. Silver 1TB missing while Orange 1TB exists).
 */
export function isVariantComboOffered(
  prices: Record<string, number> | null | undefined,
  groups: MenuOptionGroup[],
  selections: OptionSelections,
): boolean {
  if (!itemUsesVariantPrices(prices)) return true;

  if (selectionsComplete(groups, selections)) {
    return getVariantAbsolutePrice(prices, buildVariantKey(groups, selections)) != null;
  }

  // Partial picks (e.g. color only) — offered if any priced combo matches.
  return resolveVariantListPrice(prices, groups, selections).price != null;
}

export function minVariantPrice(prices: Record<string, number>): number | null {
  const values = Object.values(prices).filter((n) => Number.isFinite(n) && n >= 0);
  if (values.length === 0) return null;
  return Math.min(...values);
}

export type ResolvedVariantListPrice = {
  price: number | null;
  /** False when multiple distinct prices still match (show "From"). */
  exact: boolean;
};

/**
 * Resolve a catalog/list price from the variant matrix.
 * Supports partial selections (e.g. storage picked, color not yet) by matching
 * all combos that fit the current picks.
 */
export function resolveVariantListPrice(
  prices: Record<string, number> | null | undefined,
  groups: MenuOptionGroup[],
  selections: OptionSelections,
): ResolvedVariantListPrice {
  if (!itemUsesVariantPrices(prices)) return { price: null, exact: false };

  const fullKey = buildVariantKey(groups, selections);
  if (fullKey) {
    const exact = getVariantAbsolutePrice(prices, fullKey);
    if (exact != null) return { price: exact, exact: true };
  }

  const hasAnySelection = groups.some((g) =>
    Boolean(String(selections[g.label] ?? "").trim()),
  );
  if (!hasAnySelection) return { price: null, exact: false };

  const matchingPrices: number[] = [];
  for (const combo of listVariantCombinations(groups)) {
    const fits = groups.every((g) => {
      const selected = String(selections[g.label] ?? "").trim();
      return !selected || combo[g.label] === selected;
    });
    if (!fits) continue;
    const key = buildVariantKey(groups, combo);
    const price = getVariantAbsolutePrice(prices, key);
    if (price != null) matchingPrices.push(price);
  }

  if (matchingPrices.length === 0) return { price: null, exact: false };

  const rounded = matchingPrices.map((p) => Math.round(p * 100) / 100);
  const unique = [...new Set(rounded)];
  if (unique.length === 1) return { price: unique[0]!, exact: true };
  return { price: Math.min(...unique), exact: false };
}

/**
 * Auto-fill option groups that only have one value (e.g. a single RAM choice).
 * Repeats until stable so earlier picks can unlock later sole options.
 */
export function applySoleOptionDefaults(
  groups: MenuOptionGroup[],
  selections: OptionSelections,
  variantPrices?: Record<string, number> | null,
): OptionSelections {
  const next: OptionSelections = { ...selections };
  let changed = true;
  while (changed) {
    changed = false;
    for (const group of groups) {
      if (String(next[group.label] ?? "").trim()) continue;
      if (group.values.length !== 1) continue;
      const sole = group.values[0]!.name;
      const preview = { ...next, [group.label]: sole };
      if (
        itemUsesVariantPrices(variantPrices) &&
        !isVariantComboOffered(variantPrices, groups, preview)
      ) {
        continue;
      }
      next[group.label] = sole;
      changed = true;
    }
  }
  return next;
}

/**
 * Unit list price for a selected combo.
 * Prefer absolute variant price when set; otherwise base + additive option extras.
 */
export function resolveOptionListUnitPrice(
  basePrice: number,
  groups: MenuOptionGroup[],
  selections: OptionSelections,
  variantPrices?: Record<string, number> | null,
): number {
  const resolved = resolveVariantListPrice(variantPrices, groups, selections);
  if (resolved.price != null) return resolved.price;
  const base = Math.max(0, Number(basePrice) || 0);
  return Math.round((base + getCombinedOptionExtraPrice(groups, selections)) * 100) / 100;
}

/** Resolve the photo for a selected color (falls back to item default image). */
export function resolveOptionColorImageUrl(
  groups: MenuOptionGroup[],
  selections: OptionSelections,
  fallbackImageUrl?: string | null,
): string | null {
  const colorGroup = findColorOptionGroup(groups);
  if (!colorGroup) return fallbackImageUrl ?? null;
  const selected = String(selections[colorGroup.label] ?? "").trim();
  if (!selected) {
    return fallbackImageUrl || null;
  }
  const match = colorGroup.values.find((v) => v.name === selected);
  return match?.image_url?.trim() || fallbackImageUrl || null;
}

/** First color image found — useful as the product cover when no main image is set. */
export function firstColorOptionImageUrl(groups: MenuOptionGroup[]): string | null {
  const colorGroup = findColorOptionGroup(groups);
  if (!colorGroup) return null;
  for (const value of colorGroup.values) {
    const url = value.image_url?.trim();
    if (url) return url;
  }
  return null;
}

/** Merge uploaded/kept color image URLs into Color group values. */
export function applyColorImagesToGroups(
  groups: MenuOptionGroup[],
  colorImages: Record<string, string>,
): MenuOptionGroup[] {
  if (Object.keys(colorImages).length === 0) return groups;
  return groups.map((group) => {
    if (!isColorLikeOptionLabel(group.label)) return group;
    return {
      ...group,
      values: group.values.map((value) => {
        const next = colorImages[value.name];
        if (!next) return value;
        return { ...value, image_url: next };
      }),
    };
  });
}

export function buildVariantKey(groups: MenuOptionGroup[], selections: OptionSelections): string | null {
  if (groups.length === 0) return null;
  const parts: string[] = [];
  for (const group of groups) {
    const value = String(selections[group.label] ?? "").trim();
    if (!value) return null;
    parts.push(value);
  }
  return parts.join(VARIANT_SEP);
}

export function formatSelectedOptionsDisplay(
  groups: MenuOptionGroup[],
  selections: OptionSelections,
): string {
  return groups
    .map((g) => String(selections[g.label] ?? "").trim())
    .filter(Boolean)
    .join(DISPLAY_SEP);
}

export function formatOptionLabelsDisplay(groups: MenuOptionGroup[]): string {
  return groups.map((g) => g.label).join(DISPLAY_SEP);
}

export function selectionsComplete(groups: MenuOptionGroup[], selections: OptionSelections): boolean {
  if (groups.length === 0) return true;
  return groups.every((g) => Boolean(String(selections[g.label] ?? "").trim()));
}

export function getCombinedOptionExtraPrice(
  groups: MenuOptionGroup[],
  selections: OptionSelections,
): number {
  let total = 0;
  for (const group of groups) {
    const selected = String(selections[group.label] ?? "").trim();
    if (!selected) continue;
    const match = group.values.find((v) => v.name === selected);
    total += asPrice(match?.price);
  }
  return Math.round(total * 100) / 100;
}

/** Cartesian product of group values → list of selection maps. */
export function listVariantCombinations(groups: MenuOptionGroup[]): OptionSelections[] {
  if (groups.length === 0) return [];
  let combos: OptionSelections[] = [{}];
  for (const group of groups) {
    const next: OptionSelections[] = [];
    for (const base of combos) {
      for (const value of group.values) {
        next.push({ ...base, [group.label]: value.name });
      }
    }
    combos = next;
  }
  return combos;
}

export function parseVariantStockMap(raw: unknown): Record<string, number> {
  if (!isPlainObject(raw)) return {};
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    const k = String(key).trim();
    if (!k) continue;
    const n = Math.floor(Number(value));
    if (!Number.isFinite(n) || n < 0) continue;
    out[k] = n;
  }
  return out;
}

export function sumVariantStock(stocks: Record<string, number>): number {
  return Object.values(stocks).reduce((sum, n) => sum + Math.max(0, Math.floor(n)), 0);
}

export function itemUsesVariantStock(stocks: Record<string, number> | null | undefined): boolean {
  return Boolean(stocks && Object.keys(stocks).length > 0);
}

export function getVariantStockQty(
  stocks: Record<string, number> | null | undefined,
  variantKey: string | null | undefined,
): number | null {
  if (!variantKey || !stocks) return null;
  if (!(variantKey in stocks)) return null;
  return Math.max(0, Math.floor(Number(stocks[variantKey] ?? 0)));
}

/**
 * Whether any size×color (etc.) combo that includes this option value still has stock,
 * respecting options already chosen in `currentSelections`.
 */
export function optionHasRemainingStock(
  groups: MenuOptionGroup[],
  stocks: Record<string, number> | null | undefined,
  trackStock: boolean | null | undefined,
  optionLabel: string,
  optionValue: string,
  currentSelections: OptionSelections = {},
): boolean {
  if (!trackStock || !itemUsesVariantStock(stocks)) return true;

  const constrained = listVariantCombinations(groups).filter((combo) => {
    if (combo[optionLabel] !== optionValue) return false;
    for (const group of groups) {
      if (group.label === optionLabel) continue;
      const selected = String(currentSelections[group.label] ?? "").trim();
      if (selected && combo[group.label] !== selected) return false;
    }
    return true;
  });

  if (constrained.length === 0) return false;
  return constrained.some((combo) => {
    const key = buildVariantKey(groups, combo);
    return (getVariantStockQty(stocks, key) ?? 0) > 0;
  });
}

/**
 * Build a cart/order-friendly snapshot from selections.
 * selectedOption stays a single display string for older UIs.
 */
export function snapshotSelectedOptions(
  groups: MenuOptionGroup[],
  selections: OptionSelections,
): {
  selectedOption: string | null;
  optionLabel: string | null;
  selectedOptions: Array<{ label: string; value: string }>;
  variantKey: string | null;
} {
  if (!selectionsComplete(groups, selections)) {
    return { selectedOption: null, optionLabel: null, selectedOptions: [], variantKey: null };
  }
  const selectedOptions = groups.map((g) => ({
    label: g.label,
    value: String(selections[g.label] ?? "").trim(),
  }));
  return {
    selectedOption: formatSelectedOptionsDisplay(groups, selections) || null,
    optionLabel: formatOptionLabelsDisplay(groups) || null,
    selectedOptions,
    variantKey: buildVariantKey(groups, selections),
  };
}

/** Parse admin form JSON for option groups (new preferred) or legacy flat list. */
export function parseOptionGroupsFromForm(
  optionLabelRaw: FormDataEntryValue | null,
  optionValuesRaw: FormDataEntryValue | null,
): MenuOptionGroup[] {
  const label = String(optionLabelRaw ?? "").trim();
  const raw = String(optionValuesRaw ?? "").trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return serializeOptionGroups(normalizeOptionGroups(label || null, parsed));
  } catch {
    return [];
  }
}

export function parseVariantStockFromForm(raw: FormDataEntryValue | null): Record<string, number> {
  const text = String(raw ?? "").trim();
  if (!text) return {};
  try {
    return parseVariantStockMap(JSON.parse(text));
  } catch {
    return {};
  }
}

/** Recover selections from a legacy "M / Red" display string when groups are known. */
export function selectionsFromDisplayString(
  groups: MenuOptionGroup[],
  display: string | null | undefined,
): OptionSelections {
  const parts = String(display ?? "")
    .split(DISPLAY_SEP)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0 || parts.length !== groups.length) return {};
  const out: OptionSelections = {};
  groups.forEach((g, i) => {
    out[g.label] = parts[i]!;
  });
  return out;
}

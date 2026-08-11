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
    return optionValues
      .map((raw) => {
        if (!isGroupShape(raw)) return null;
        const label = String(raw.label ?? "").trim();
        if (!label) return null;
        const values = (Array.isArray(raw.values) ? raw.values : [])
          .map((v) => {
            if (!isPlainObject(v)) return null;
            const name = String(v.name ?? "").trim();
            if (!name) return null;
            return {
              name,
              price: asPrice(v.price),
              image_url: typeof v.image_url === "string" && v.image_url.trim() ? v.image_url.trim() : null,
            };
          })
          .filter((v): v is MenuOptionValue => Boolean(v));
        if (values.length === 0) return null;
        return { label, values };
      })
      .filter((g): g is MenuOptionGroup => Boolean(g));
  }

  // Legacy flat list
  const label = String(optionLabel ?? "").trim() || "Option";
  const values = optionValues
    .map((v) => {
      if (!isPlainObject(v)) return null;
      const name = String(v.name ?? "").trim();
      if (!name) return null;
      return {
        name,
        price: asPrice(v.price),
        image_url: typeof v.image_url === "string" && v.image_url.trim() ? v.image_url.trim() : null,
      };
    })
    .filter((v): v is MenuOptionValue => Boolean(v));
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

export function findColorOptionGroup(groups: MenuOptionGroup[]): MenuOptionGroup | null {
  return groups.find((g) => isColorLikeOptionLabel(g.label)) ?? null;
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
    const firstWithImage = colorGroup.values.find((v) => v.image_url?.trim());
    return firstWithImage?.image_url?.trim() || fallbackImageUrl || null;
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

export type DisplayUnit = "g" | "kg" | "ml" | "l";

export const DISPLAY_UNIT_OPTIONS: { value: DisplayUnit; label: string; hint: string }[] = [
  { value: "g", label: "g", hint: "grams" },
  { value: "kg", label: "kg", hint: "kilograms" },
  { value: "ml", label: "mL", hint: "milliliters" },
  { value: "l", label: "L", hint: "liters" },
];

const UNIT_LABELS: Record<DisplayUnit, string> = {
  g: "g",
  kg: "kg",
  ml: "mL",
  l: "L",
};

export function normalizeDisplayUnit(raw: string | null | undefined): DisplayUnit {
  const unit = String(raw ?? "g")
    .trim()
    .toLowerCase();
  if (unit === "g" || unit === "kg" || unit === "ml" || unit === "l") return unit;
  return "g";
}

export function formatDisplayQuantity(
  quantity: number | null | undefined,
  unit: string | null | undefined,
): string | null {
  if (quantity == null || !Number.isFinite(Number(quantity))) return null;
  const value = Number(quantity);
  const label = UNIT_LABELS[normalizeDisplayUnit(unit)];
  const formatted =
    value % 1 === 0
      ? String(value)
      : value.toFixed(2).replace(/\.?0+$/, "");
  return `${formatted} ${label}`;
}

/** Map display amount + unit to legacy integer grams column (g or mL base). */
export function toLegacyGramsValue(quantity: number, unit: DisplayUnit): number {
  switch (unit) {
    case "kg":
      return Math.round(quantity * 1000);
    case "l":
      return Math.round(quantity * 1000);
    default:
      return Math.round(quantity);
  }
}

export function parseDisplayQuantityFromForm(
  rawQty: FormDataEntryValue | null,
  rawUnit: FormDataEntryValue | null,
): { display_quantity: number | null; display_unit: DisplayUnit; grams: number | null } {
  const qtyStr = String(rawQty ?? "").trim();
  const unit = normalizeDisplayUnit(String(rawUnit ?? "g"));

  if (!qtyStr) {
    return { display_quantity: null, display_unit: unit, grams: null };
  }

  const qty = Number(qtyStr);
  if (!Number.isFinite(qty) || qty < 0) {
    return { display_quantity: null, display_unit: unit, grams: null };
  }

  return {
    display_quantity: qty,
    display_unit: unit,
    grams: toLegacyGramsValue(qty, unit),
  };
}

export function resolveDisplayQuantityFields(item: {
  grams?: number | null;
  display_quantity?: number | null;
  display_unit?: string | null;
}) {
  if (item.display_quantity != null && Number.isFinite(Number(item.display_quantity))) {
    return {
      quantity: Number(item.display_quantity),
      unit: normalizeDisplayUnit(item.display_unit),
    };
  }
  if (item.grams != null && Number.isFinite(Number(item.grams))) {
    return { quantity: Number(item.grams), unit: "g" as DisplayUnit };
  }
  return { quantity: null as number | null, unit: "g" as DisplayUnit };
}

export function parseOptionalCalories(raw: FormDataEntryValue | null): number | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

export function parseOptionalProteinGrams(raw: FormDataEntryValue | null): number | null {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 10) / 10;
}

export function formatMenuNutrition(
  calories: number | null | undefined,
  proteinG: number | null | undefined,
): string | null {
  const parts: string[] = [];
  const caloriesLabel = formatCaloriesValue(calories);
  const proteinLabel = formatProteinValue(proteinG);
  if (caloriesLabel != null) parts.push(`${caloriesLabel} kcal`);
  if (proteinLabel != null) parts.push(`${proteinLabel}g protein`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function hasMenuNutrition(
  calories: number | null | undefined,
  proteinG: number | null | undefined,
): boolean {
  return formatCaloriesValue(calories) != null || formatProteinValue(proteinG) != null;
}

export function formatCaloriesValue(calories: number | null | undefined): number | null {
  if (calories == null || !Number.isFinite(Number(calories))) return null;
  return Math.round(Number(calories));
}

export function formatProteinValue(proteinG: number | null | undefined): string | null {
  if (proteinG == null || !Number.isFinite(Number(proteinG))) return null;
  return Number(proteinG) % 1 === 0
    ? String(Math.round(Number(proteinG)))
    : Number(proteinG).toFixed(1).replace(/\.0$/, "");
}

export function isNutritionColumnMigrationError(
  message: string | null | undefined,
  code?: string | null,
): boolean {
  const msg = message ?? "";
  return (
    /calories|protein_g/i.test(msg) &&
    (code === "PGRST204" || /column|schema cache/i.test(msg))
  );
}

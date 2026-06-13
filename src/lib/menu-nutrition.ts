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
  if (calories != null && Number.isFinite(Number(calories))) {
    parts.push(`${Math.round(Number(calories))} kcal`);
  }
  if (proteinG != null && Number.isFinite(Number(proteinG))) {
    const protein =
      Number(proteinG) % 1 === 0
        ? String(Math.round(Number(proteinG)))
        : Number(proteinG).toFixed(1).replace(/\.0$/, "");
    parts.push(`${protein}g protein`);
  }
  return parts.length > 0 ? parts.join(" · ") : null;
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

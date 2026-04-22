export const BROWSE_SECTION_OPTIONS = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Quick Bites",
  "Desserts",
  "Drinks",
] as const;

export type BrowseSection = (typeof BROWSE_SECTION_OPTIONS)[number];

export function normalizeBrowseSections(input: unknown): BrowseSection[] {
  const values = Array.isArray(input) ? input : [];
  const allowed = new Set(BROWSE_SECTION_OPTIONS);
  return values
    .map((value) => String(value ?? "").trim())
    .filter((value): value is BrowseSection => allowed.has(value as BrowseSection));
}

export function parseBrowseSectionsFromForm(formData: FormData): BrowseSection[] {
  const values = formData.getAll("browse_sections").map((value) => String(value ?? "").trim());
  return normalizeBrowseSections(values);
}

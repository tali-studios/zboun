export const BROWSE_SECTION_OPTIONS = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Quick Bites",
  "Desserts",
  "Drinks",
  "Groceries",
] as const;

export type BrowseSection = (typeof BROWSE_SECTION_OPTIONS)[number];

export function normalizeBrowseSections(input: unknown): BrowseSection[] {
  const values = Array.isArray(input) ? input : [];
  const allowed = new Set(BROWSE_SECTION_OPTIONS);
  return values
    .map((value) => String(value ?? "").trim())
    .filter((value): value is BrowseSection => allowed.has(value as BrowseSection));
}

/**
 * One home-page category per restaurant (stored as a 1-element `browse_sections` array in the DB).
 * Reads `browse_section` (radio/select). Falls back to first legacy `browse_sections` checkbox if present.
 */
export function parseBrowseSectionFromForm(formData: FormData): BrowseSection {
  const single = String(formData.get("browse_section") ?? "").trim();
  if (single) {
    const n = normalizeBrowseSections([single]);
    if (n.length > 0) return n[0]!;
  }
  const legacy = normalizeBrowseSections(
    formData.getAll("browse_sections").map((value) => String(value ?? "").trim()),
  );
  if (legacy.length > 0) return legacy[0]!;
  return "Lunch";
}

export function parseBrowseSectionsFromForm(formData: FormData): BrowseSection[] {
  return [parseBrowseSectionFromForm(formData)];
}

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

/** Primary accent per section — meal-type chips & card category badges. */
export const BROWSE_SECTION_ACCENTS: Record<BrowseSection, string> = {
  Breakfast: "#ffb238",
  Lunch: "#22b573",
  Dinner: "#ff6b4a",
  "Quick Bites": "#7c5cff",
  Drinks: "#22a7f0",
  Desserts: "#ff5c8a",
  Groceries: "#17a398",
};

/** “All” filter chip accent (not stored as a `BrowseSection`). */
export const BROWSE_FILTER_ALL_ACCENT = "#5f4be8";

/** Text on tinted category chips. */
export const BROWSE_CHIP_LABEL_COLOR = "#1d160f";

export function browseSectionChipBackground(accentHex: string): string {
  return `color-mix(in srgb, ${accentHex} 82%, white)`;
}

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

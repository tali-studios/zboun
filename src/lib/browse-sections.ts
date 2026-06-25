export const BROWSE_SECTION_OPTIONS = [
  "Food & Restaurants",
  "Groceries",
  "Home & Living",
  "Drinks & Beverages",
  "Vape & Tobacco",
  "Gas & Fuel",
  "General Shops",
] as const;

export type BrowseSection = (typeof BROWSE_SECTION_OPTIONS)[number];

export const BROWSE_SUB_FILTERS_BY_SECTION = {
  "Food & Restaurants": [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Quick Bites",
    "Desserts",
  ],
  Groceries: [
    "Fresh Produce",
    "Bakery",
    "Frozen Foods",
    "Household Staples",
    "Organic",
  ],
  "Home & Living": [
    "Furniture",
    "Kitchen",
    "Décor",
    "Hardware",
    "Garden",
  ],
  "Drinks & Beverages": [
    "Water Delivery",
    "Coffee",
    "Juice & Smoothies",
    "Alcohol",
  ],
  "Vape & Tobacco": [
    "Devices",
    "E-liquid & Pods",
    "Accessories",
    "Tobacco",
  ],
  "Gas & Fuel": ["LPG & Gas Cylinders", "Fuel Station"],
  "General Shops": ["Electronics", "Fashion", "Gifts", "Other"],
} as const satisfies Record<BrowseSection, readonly string[]>;

export type BrowseSubFilter =
  (typeof BROWSE_SUB_FILTERS_BY_SECTION)[BrowseSection][number];

/** @deprecated Use BROWSE_SUB_FILTERS_BY_SECTION["Food & Restaurants"] */
export const FOOD_SUB_FILTER_OPTIONS = BROWSE_SUB_FILTERS_BY_SECTION["Food & Restaurants"];

export type FoodSubFilter = BrowseSubFilter;

/** Map legacy values to top-level home categories. */
const LEGACY_BROWSE_ALIASES: Record<string, BrowseSection> = {
  Breakfast: "Food & Restaurants",
  Lunch: "Food & Restaurants",
  Dinner: "Food & Restaurants",
  "Quick Bites": "Food & Restaurants",
  Desserts: "Food & Restaurants",
  Drinks: "Drinks & Beverages",
  Groceries: "Groceries",
};

/** Primary accent per top-level section. */
export const BROWSE_SECTION_ACCENTS: Record<BrowseSection, string> = {
  "Food & Restaurants": "#ff6b4a",
  Groceries: "#17a398",
  "Home & Living": "#8b5cf6",
  "Drinks & Beverages": "#22a7f0",
  "Vape & Tobacco": "#64748b",
  "Gas & Fuel": "#f59e0b",
  "General Shops": "#5f4be8",
};

export const BROWSE_SUB_FILTER_ACCENTS: Record<string, string> = {
  Breakfast: "#ffb238",
  Lunch: "#22b573",
  Dinner: "#ff6b4a",
  "Quick Bites": "#7c5cff",
  Desserts: "#ff5c8a",
  "Fresh Produce": "#34d399",
  Bakery: "#fbbf24",
  "Frozen Foods": "#38bdf8",
  "Household Staples": "#14b8a6",
  Organic: "#84cc16",
  Furniture: "#a78bfa",
  Kitchen: "#f472b6",
  Décor: "#c084fc",
  Hardware: "#94a3b8",
  Garden: "#4ade80",
  "Water Delivery": "#0ea5e9",
  Coffee: "#92400e",
  "Juice & Smoothies": "#fb923c",
  Alcohol: "#be123c",
  Devices: "#475569",
  "E-liquid & Pods": "#6366f1",
  Accessories: "#78716c",
  Tobacco: "#57534e",
  "LPG & Gas Cylinders": "#f59e0b",
  "Fuel Station": "#ea580c",
  Electronics: "#3b82f6",
  Fashion: "#ec4899",
  Gifts: "#8b5cf6",
  Other: "#64748b",
};

/** @deprecated Use BROWSE_SUB_FILTER_ACCENTS */
export const FOOD_SUB_FILTER_ACCENTS = BROWSE_SUB_FILTER_ACCENTS;

const SUB_FILTER_PARENT = new Map<string, BrowseSection>();
for (const section of BROWSE_SECTION_OPTIONS) {
  for (const sub of BROWSE_SUB_FILTERS_BY_SECTION[section]) {
    SUB_FILTER_PARENT.set(sub, section);
  }
}
for (const [legacy, parent] of Object.entries(LEGACY_BROWSE_ALIASES)) {
  if (SUB_FILTER_PARENT.has(legacy)) {
    SUB_FILTER_PARENT.set(legacy, parent);
  }
}

const ALL_SUB_FILTER_VALUES = new Set<string>(
  BROWSE_SECTION_OPTIONS.flatMap((section) => [...BROWSE_SUB_FILTERS_BY_SECTION[section]]),
);

/** “All” filter chip accent (not stored as a `BrowseSection`). */
export const BROWSE_FILTER_ALL_ACCENT = "#5f4be8";

export const BROWSE_CHIP_LABEL_COLOR = "#1d160f";

export function browseSectionChipBackground(accentHex: string): string {
  return `color-mix(in srgb, ${accentHex} 82%, white)`;
}

export function getSubFiltersForSection(section: BrowseSection): readonly string[] {
  return BROWSE_SUB_FILTERS_BY_SECTION[section];
}

export function sectionHasSubFilters(section: BrowseSection): boolean {
  return getSubFiltersForSection(section).length > 0;
}

export function getParentSectionForSubFilter(sub: string): BrowseSection | null {
  return SUB_FILTER_PARENT.get(sub) ?? null;
}

function toBrowseSection(value: string): BrowseSection | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (ALL_SUB_FILTER_VALUES.has(trimmed)) return null;
  const mapped = LEGACY_BROWSE_ALIASES[trimmed] ?? trimmed;
  const allowed = new Set<string>(BROWSE_SECTION_OPTIONS);
  return allowed.has(mapped) ? (mapped as BrowseSection) : null;
}

export function normalizeBrowseSections(input: unknown): BrowseSection[] {
  const values = Array.isArray(input) ? input : [];
  const normalized = values
    .map((value) => toBrowseSection(String(value ?? "")))
    .filter((value): value is BrowseSection => value !== null);

  for (const value of values) {
    const trimmed = String(value ?? "").trim();
    if (!trimmed) continue;
    const parent =
      getParentSectionForSubFilter(trimmed) ?? LEGACY_BROWSE_ALIASES[trimmed] ?? null;
    if (parent && !normalized.includes(parent)) {
      normalized.push(parent);
    }
  }

  return [...new Set(normalized)];
}

export function parseFullBrowseSelectionFromForm(formData: FormData): string[] {
  const raw = formData
    .getAll("browse_sections")
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);
  if (raw.length > 0) return [...new Set(raw)];
  return ["General Shops"];
}

export function parseBrowseSectionsFromForm(formData: FormData): BrowseSection[] {
  const topLevel = normalizeBrowseSections(parseFullBrowseSelectionFromForm(formData));
  if (topLevel.length > 0) return topLevel;

  const single = String(formData.get("browse_section") ?? "").trim();
  if (single) {
    const normalized = normalizeBrowseSections([single]);
    if (normalized.length > 0) return normalized;
  }

  return ["General Shops"];
}

export function parseBrowseSectionFromForm(formData: FormData): BrowseSection {
  return parseBrowseSectionsFromForm(formData)[0] ?? "General Shops";
}

export function formatBrowseSectionsLabel(sections: unknown): string {
  const raw = getRawBrowseSectionValues(sections);
  const topLevel = normalizeBrowseSections(raw);
  const subs = getBrowseSubTags(raw);
  const parts = [...topLevel, ...subs];
  return parts.length > 0 ? parts.join(", ") : "General Shops";
}

/** Map home page categories to internal dashboard type (legacy hotel/gym unchanged). */
export function inferBusinessTypeFromBrowseSections(
  sections: BrowseSection[],
): "restaurant" | "retail_store" {
  return sections.includes("Food & Restaurants") ? "restaurant" : "retail_store";
}

export function defaultBrowseSectionsForBusinessType(
  businessType: string | null | undefined,
): BrowseSection[] {
  switch (businessType) {
    case "restaurant":
    case "cloud_kitchen":
      return ["Food & Restaurants"];
    case "retail_store":
      return ["General Shops"];
    default:
      return ["General Shops"];
  }
}

export function defaultBrowseSubTagsForBusinessType(
  businessType: string | null | undefined,
): string[] {
  switch (businessType) {
    case "restaurant":
    case "cloud_kitchen":
      return ["Lunch"];
    default:
      return [];
  }
}

export function getRawBrowseSectionValues(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);
}

export function getBrowseSubTags(input: unknown, parentSection?: BrowseSection): string[] {
  const raw = getRawBrowseSectionValues(input);
  const tags = raw.filter((value) => ALL_SUB_FILTER_VALUES.has(value));
  const unique = [...new Set(tags)];
  if (!parentSection) return unique;
  return unique.filter((tag) => getParentSectionForSubFilter(tag) === parentSection);
}

/** @deprecated Use getBrowseSubTags */
export function getFoodSubFilters(input: unknown): FoodSubFilter[] {
  return getBrowseSubTags(input, "Food & Restaurants") as FoodSubFilter[];
}

export function isBrowseSubFilter(value: string): boolean {
  return ALL_SUB_FILTER_VALUES.has(value);
}

/** @deprecated Use isBrowseSubFilter */
export function isFoodSubFilter(value: string): value is FoodSubFilter {
  return isBrowseSubFilter(value);
}

/** Home-page filter: top-level category + optional sub-filter. */
export function matchesBrowseFilter(
  browseSections: unknown,
  activeSection: string,
  activeSub: string = "all",
): boolean {
  if (activeSection === "all") return true;

  const raw = getRawBrowseSectionValues(browseSections);
  const topLevel = normalizeBrowseSections(raw);

  if (!topLevel.includes(activeSection as BrowseSection)) return false;
  if (activeSub === "all") return true;
  return raw.includes(activeSub);
}

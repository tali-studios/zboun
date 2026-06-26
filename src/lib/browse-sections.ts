export const BROWSE_SECTION_OPTIONS = [
  "Food & Restaurants",
  "Groceries",
  "Fashion & Apparel",
  "Electronics & Tech",
  "Health & Beauty",
  "Home & Living",
  "Drinks & Beverages",
  "Vape & Tobacco",
  "Gas & Fuel",
  "Pets & Supplies",
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
    "Butchery & Meat",
    "Bakery",
    "Frozen Foods",
    "Household Staples",
    "Organic",
  ],
  "Fashion & Apparel": [
    "Clothing",
    "Shoes & Footwear",
    "Bags & Accessories",
    "Sportswear",
    "Kids & Baby",
  ],
  "Electronics & Tech": [
    "Phones & Tablets",
    "Computers",
    "Gaming",
    "Audio & TV",
    "Smart Home",
  ],
  "Health & Beauty": [
    "Pharmacy",
    "Cosmetics",
    "Personal Care",
    "Supplements",
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
  "Pets & Supplies": ["Pet Food", "Pet Accessories", "Grooming"],
  "General Shops": ["Gifts", "Books & Stationery", "Hobbies & Crafts", "Other"],
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
  Fashion: "Fashion & Apparel",
  Electronics: "Electronics & Tech",
};

/** Primary accent per top-level section. */
export const BROWSE_SECTION_ACCENTS: Record<BrowseSection, string> = {
  "Food & Restaurants": "#ff6b4a",
  Groceries: "#17a398",
  "Fashion & Apparel": "#db2777",
  "Electronics & Tech": "#2563eb",
  "Health & Beauty": "#14b8a6",
  "Home & Living": "#8b5cf6",
  "Drinks & Beverages": "#22a7f0",
  "Vape & Tobacco": "#64748b",
  "Gas & Fuel": "#f59e0b",
  "Pets & Supplies": "#ca8a04",
  "General Shops": "#5f4be8",
};

export const BROWSE_SUB_FILTER_ACCENTS: Record<string, string> = {
  Breakfast: "#ffb238",
  Lunch: "#22b573",
  Dinner: "#ff6b4a",
  "Quick Bites": "#7c5cff",
  Desserts: "#ff5c8a",
  "Fresh Produce": "#34d399",
  "Butchery & Meat": "#dc2626",
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
  Clothing: "#f472b6",
  "Shoes & Footwear": "#e11d48",
  "Bags & Accessories": "#a855f7",
  Sportswear: "#0d9488",
  "Kids & Baby": "#fb7185",
  "Phones & Tablets": "#3b82f6",
  Computers: "#6366f1",
  Gaming: "#7c3aed",
  "Audio & TV": "#0284c7",
  "Smart Home": "#0891b2",
  Pharmacy: "#059669",
  Cosmetics: "#ec4899",
  "Personal Care": "#2dd4bf",
  Supplements: "#84cc16",
  "Pet Food": "#d97706",
  "Pet Accessories": "#b45309",
  Grooming: "#f59e0b",
  Gifts: "#8b5cf6",
  "Books & Stationery": "#6366f1",
  "Hobbies & Crafts": "#a78bfa",
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

export type BrowseSelectionValidation =
  | { ok: true; selection: string[] }
  | { ok: false; error: string; section?: BrowseSection };

/** Each selected category with sub-tags must have at least one tag chosen. */
export function validateBrowseSelection(values: string[]): BrowseSelectionValidation {
  const raw = [...new Set(values.map((value) => value.trim()).filter(Boolean))];
  const topLevel = normalizeBrowseSections(raw);

  if (topLevel.length === 0) {
    return { ok: false, error: "Pick at least one business category." };
  }

  const subs = getBrowseSubTags(raw);

  for (const section of topLevel) {
    if (!sectionHasSubFilters(section)) continue;
    const hasTag = subs.some((tag) => getParentSectionForSubFilter(tag) === section);
    if (!hasTag) {
      return {
        ok: false,
        error: `Pick at least one tag for ${section}.`,
        section,
      };
    }
  }

  return { ok: true, selection: [...new Set([...topLevel, ...subs])] };
}

export function validateBrowseSelectionFromForm(formData: FormData): BrowseSelectionValidation {
  return validateBrowseSelection(parseFullBrowseSelectionFromForm(formData));
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

/** Shared dashboard / footer labels (all business types, not only restaurants). */
export const STORE_ADMIN_LABEL = "Store admin";
export const STORE_LOGIN_LABEL = "Store login";

/** Whether this business is primarily food-service (menu wording fits). */
export function isFoodMenuBusiness(browseSections: unknown): boolean {
  return normalizeBrowseSections(getRawBrowseSectionValues(browseSections)).includes("Food & Restaurants");
}

/** Dashboard / QR action labels — "menu" for food businesses, neutral "store" for retail. */
export function getStorefrontActionLabels(browseSections: unknown): {
  open: string;
  copyLink: string;
  slugLabel: string;
} {
  if (isFoodMenuBusiness(browseSections)) {
    return { open: "Open menu", copyLink: "Copy menu link", slugLabel: "Menu" };
  }
  return { open: "Open store", copyLink: "Copy store link", slugLabel: "Store" };
}

/** QR codes page — menu vs store wording. */
export function getStorefrontQrLabels(browseSections: unknown): {
  adminEyebrow: string;
  pageTitle: string;
  pageIntro: string;
  orderTitle: string;
  orderDescription: string;
  orderBadge: string;
  inStoreTitle: string;
  inStoreDescription: string;
  inStoreBadge: string;
  openLink: string;
  orderDownloadSuffix: string;
  inStoreDownloadSuffix: string;
  inStoreViewBadge: string;
  inStoreViewTagline: string;
} {
  if (isFoodMenuBusiness(browseSections)) {
    return {
      adminEyebrow: STORE_ADMIN_LABEL,
      pageTitle: "Menu QR codes",
      pageIntro:
        "Use the online order QR for delivery and WhatsApp orders. Use the in-restaurant QR on tables or at the counter — guests browse items without add-to-cart buttons.",
      orderTitle: "Online order menu",
      orderDescription:
        "Full menu with add-to-cart and WhatsApp ordering — for links, social, and delivery.",
      orderBadge: "Online order",
      inStoreTitle: "In-restaurant menu",
      inStoreDescription:
        "Same look and items, without + buttons or checkout — ideal for QR on tables inside the venue.",
      inStoreBadge: "In-store",
      openLink: "Open menu",
      orderDownloadSuffix: "menu-qr-order",
      inStoreDownloadSuffix: "menu-qr-in-store",
      inStoreViewBadge: "In-restaurant menu · view only",
      inStoreViewTagline: "Browse our menu — items and prices for reference while you dine in.",
    };
  }
  return {
    adminEyebrow: STORE_ADMIN_LABEL,
    pageTitle: "Store QR codes",
    pageIntro:
      "Use the online store QR for delivery and WhatsApp orders. Use the in-store QR on shelves or at the counter — customers browse products without add-to-cart buttons.",
    orderTitle: "Online order store",
    orderDescription:
      "Full storefront with add-to-cart and WhatsApp ordering — for links, social, and delivery.",
    orderBadge: "Online order",
    inStoreTitle: "In-store catalog",
    inStoreDescription:
      "Same products and prices, without + buttons or checkout — ideal for QR inside your shop.",
    inStoreBadge: "In-store browse",
    openLink: "Open store",
    orderDownloadSuffix: "store-qr-order",
    inStoreDownloadSuffix: "store-qr-in-store",
    inStoreViewBadge: "In-store catalog · view only",
    inStoreViewTagline: "Browse our products — items and prices for reference in your shop.",
  };
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

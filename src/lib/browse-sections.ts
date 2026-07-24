export const BROWSE_SECTION_OPTIONS = [
  "Food & Restaurants",
  "Groceries",
  "Fashion & Apparel",
  "Electronics & Tech",
  "Beauty & Pharmacy",
  "Drinks & Beverages",
  "Smoke & Tobacco",
  "Home & Living",
  // "Gas & Fuel", // temporarily hidden — restore with sub-filters / accents / icons below
  "Pets & Supplies",
  "Automotive",
  "Gifts & Lifestyle",
  "Sports & Outdoors",
] as const;

export type BrowseSection = (typeof BROWSE_SECTION_OPTIONS)[number];

/** Short labels shown on home / search / admin pickers (DB still stores full names). */
export const BROWSE_SECTION_SHORT_LABELS: Record<BrowseSection, string> = {
  "Food & Restaurants": "Food",
  Groceries: "Market",
  "Fashion & Apparel": "Fashion",
  "Electronics & Tech": "Electronics",
  "Beauty & Pharmacy": "Self-care",
  "Drinks & Beverages": "Drinks",
  "Smoke & Tobacco": "Smoke",
  "Home & Living": "Home",
  "Pets & Supplies": "Pets",
  Automotive: "Automotive",
  "Gifts & Lifestyle": "Gifts",
  "Sports & Outdoors": "Sports",
};

export function browseSectionShortLabel(section: string): string {
  return (
    BROWSE_SECTION_SHORT_LABELS[section as BrowseSection] ?? section
  );
}

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
    "Kids & Baby",
    "Kids Fashion",
    "Boutiques",
    "Perfumes",
    "Sunglasses",
  ],
  "Electronics & Tech": [
    "Phones & Tablets",
    "Computers",
    "Gaming",
    "Audio & TV",
    "Smart Home",
  ],
  "Beauty & Pharmacy": [
    "Pharmacy",
    "Cosmetics",
    "Personal Care",
    "Supplements",
    "Prescription & OTC",
    "Vitamins & Supplements",
    "Baby Care",
    "First Aid",
    "Personal Hygiene",
    "Baby Food & Formula",
    "Diapers & Wipes",
    "Contact Lenses",
    "Frames & Cases",
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
  "Smoke & Tobacco": [
    "Devices",
    "E-liquid & Pods",
    "Smoke Accessories",
    "Tobacco",
  ],
  // Temporarily hidden with "Gas & Fuel" top-level category:
  // "Gas & Fuel": ["LPG & Gas Cylinders", "Fuel Station"],
  "Pets & Supplies": ["Pet Food", "Pet Accessories"],
  Automotive: [
    "Parts & Accessories",
    "Oils & Fluids",
    "Tires",
    "Car Electronics",
    "Car Care",
  ],
  "Gifts & Lifestyle": [
    "Bouquets & Flowers",
    "Gift Baskets",
    "Party Supplies",
    "Greeting Cards",
    "Seasonal & Holidays",
    "Books & Stationery",
    "Hobbies & Crafts",
    "Toys & Play",
    "Gifts",
    "Strollers & Gear",
  ],
  "Sports & Outdoors": [
    "Cycling",
    "Gym Equipment",
    "Team Sports",
    "Camping",
    "Water Sports",
    "Pool & Beach",
    "Sports Clothing",
    "Sports Footwear",
    "Accessories",
    "Hiking",
  ],
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
  /** Former top-level categories, folded / renamed. */
  "Flowers & Occasions": "Gifts & Lifestyle",
  "Optics & Eyewear": "Beauty & Pharmacy",
  "Sports & Fitness": "Sports & Outdoors",
  "Baby & Kids": "Beauty & Pharmacy",
  "Bakeries & Sweets": "Groceries",
  "Health & Beauty": "Beauty & Pharmacy",
  "Pharmacy & Care": "Beauty & Pharmacy",
  "General Shops": "Sports & Outdoors",
  /** Renamed Sports & Outdoors sub-tags */
  "Bicycles & Cycling": "Sports & Outdoors",
  "Gym & Training": "Sports & Outdoors",
  "Outdoor & Camping": "Sports & Outdoors",
  Sportswear: "Sports & Outdoors",
  "Fitness Nutrition": "Sports & Outdoors",
  /** Temporarily hidden top-level category — map existing tags until restored. */
  "Gas & Fuel": "Automotive",
  /** Former name; renamed to avoid "Vape" in the public label. */
  "Vape & Tobacco": "Smoke & Tobacco",
};

/** Primary accent per top-level section. */
export const BROWSE_SECTION_ACCENTS: Record<BrowseSection, string> = {
  "Food & Restaurants": "#ff6b4a",
  Groceries: "#17a398",
  "Fashion & Apparel": "#db2777",
  "Electronics & Tech": "#2563eb",
  "Beauty & Pharmacy": "#14b8a6",
  "Home & Living": "#8b5cf6",
  "Drinks & Beverages": "#22a7f0",
  "Smoke & Tobacco": "#64748b",
  // "Gas & Fuel": "#f59e0b", // temporarily hidden
  "Pets & Supplies": "#ca8a04",
  Automotive: "#64748b",
  "Gifts & Lifestyle": "#ec4899",
  "Sports & Outdoors": "#16a34a",
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
  // Temporarily hidden with "Gas & Fuel":
  // "LPG & Gas Cylinders": "#f59e0b",
  // "Fuel Station": "#ea580c",
  Devices: "#475569",
  "E-liquid & Pods": "#6366f1",
  "Smoke Accessories": "#78716c",
  Accessories: "#64748b",
  Tobacco: "#57534e",
  Clothing: "#f472b6",
  "Shoes & Footwear": "#e11d48",
  "Bags & Accessories": "#a855f7",
  "Kids & Baby": "#fb7185",
  "Phones & Tablets": "#3b82f6",
  Computers: "#6366f1",
  Gaming: "#7c3aed",
  "Audio & TV": "#0284c7",
  "Smart Home": "#0891b2",
  Cosmetics: "#ec4899",
  "Personal Care": "#2dd4bf",
  Supplements: "#84cc16",
  Pharmacy: "#0d9488",
  "Prescription & OTC": "#0d9488",
  "Vitamins & Supplements": "#22c55e",
  "Baby Care": "#38bdf8",
  "First Aid": "#ef4444",
  "Personal Hygiene": "#14b8a6",
  Perfumes: "#c026d3",
  "Bouquets & Flowers": "#ec4899",
  "Gift Baskets": "#a855f7",
  "Party Supplies": "#f97316",
  "Greeting Cards": "#6366f1",
  "Seasonal & Holidays": "#e11d48",
  "Baby Food & Formula": "#38bdf8",
  "Diapers & Wipes": "#67e8f9",
  "Toys & Play": "#f472b6",
  "Kids Fashion": "#fb7185",
  "Strollers & Gear": "#818cf8",
  Cycling: "#0ea5e9",
  "Gym Equipment": "#16a34a",
  "Team Sports": "#2563eb",
  Camping: "#65a30d",
  "Water Sports": "#0284c7",
  "Pool & Beach": "#06b6d4",
  "Sports Clothing": "#0d9488",
  "Sports Footwear": "#0f766e",
  Hiking: "#84cc16",
  "Parts & Accessories": "#64748b",
  "Car Care": "#475569",
  "Oils & Fluids": "#92400e",
  Tires: "#1e293b",
  "Car Electronics": "#0284c7",
  Sunglasses: "#f59e0b",
  "Contact Lenses": "#22d3ee",
  "Frames & Cases": "#6366f1",
  "Pet Food": "#d97706",
  "Pet Accessories": "#b45309",
  Boutiques: "#d946ef",
  Gifts: "#8b5cf6",
  "Books & Stationery": "#6366f1",
  "Hobbies & Crafts": "#a78bfa",
};

/** @deprecated Use BROWSE_SUB_FILTER_ACCENTS */
export const FOOD_SUB_FILTER_ACCENTS = BROWSE_SUB_FILTER_ACCENTS;

/** Small emoji icon per top-level category — used for store-type badges in dashboards. */
export const BROWSE_SECTION_ICONS: Record<BrowseSection, string> = {
  "Food & Restaurants": "🍽",
  Groceries: "🥦",
  "Fashion & Apparel": "👕",
  "Electronics & Tech": "💻",
  "Beauty & Pharmacy": "💄",
  "Home & Living": "🛋",
  "Drinks & Beverages": "🥤",
  "Smoke & Tobacco": "💨",
  // "Gas & Fuel": "⛽", // temporarily hidden
  "Pets & Supplies": "🐾",
  Automotive: "🚗",
  "Gifts & Lifestyle": "🎁",
  "Sports & Outdoors": "🏕️",
};

/** Small emoji icon per sub-category tag — shown on the "Refine" pill row. */
export const BROWSE_SUB_FILTER_ICONS: Record<string, string> = {
  // Food & Restaurants
  Breakfast: "🍳",
  Lunch: "🍱",
  Dinner: "🍽️",
  "Quick Bites": "🌯",
  Desserts: "🍰",
  // Groceries
  "Fresh Produce": "🥬",
  "Butchery & Meat": "🥩",
  Bakery: "🍞",
  "Frozen Foods": "🧊",
  "Household Staples": "🧴",
  Organic: "🌿",
  // Fashion / sports extras
  Clothing: "👗",
  "Shoes & Footwear": "👟",
  "Bags & Accessories": "👜",
  "Kids & Baby": "🧒",
  Cycling: "🚲",
  "Gym Equipment": "🏋️",
  "Team Sports": "⚽",
  Camping: "⛺",
  "Water Sports": "🛶",
  "Pool & Beach": "🏊",
  "Sports Clothing": "🎽",
  "Sports Footwear": "🥾",
  Accessories: "🧤",
  Hiking: "🏔️",
  // Electronics & Tech
  "Phones & Tablets": "📱",
  Computers: "💻",
  Gaming: "🎮",
  "Audio & TV": "📺",
  "Smart Home": "🏠",
  // Beauty & Pharmacy
  Pharmacy: "💊",
  Cosmetics: "💄",
  "Personal Care": "🧼",
  Supplements: "🧪",
  // Beauty / pharmacy extras
  Sunglasses: "🕶️",
  "Contact Lenses": "👁️",
  "Frames & Cases": "🖼️",
  "Prescription & OTC": "💊",
  "Vitamins & Supplements": "🍊",
  "Baby Care": "🍼",
  "First Aid": "🩹",
  "Personal Hygiene": "🧻",
  Perfumes: "🌸",
  "Baby Food & Formula": "🥣",
  "Diapers & Wipes": "🧷",
  "Toys & Play": "🧸",
  "Kids Fashion": "👕",
  "Strollers & Gear": "🚼",
  // Home & Living
  Furniture: "🛋️",
  Kitchen: "🍳",
  Décor: "🖼️",
  Hardware: "🔧",
  Garden: "🌱",
  // Drinks & Beverages
  "Water Delivery": "💧",
  Coffee: "☕",
  "Juice & Smoothies": "🧃",
  Alcohol: "🍷",
  // Temporarily hidden with "Gas & Fuel":
  // "LPG & Gas Cylinders": "🛢️",
  // "Fuel Station": "⛽",
  // Pets & Supplies
  "Pet Food": "🐶",
  "Pet Accessories": "🐾",
  // Catch-all / shops leftovers now rehomed
  Boutiques: "🎀",
  Gifts: "🎁",
  "Books & Stationery": "📚",
  "Hobbies & Crafts": "🎨",
  "Parts & Accessories": "🔩",
  "Car Care": "🧽",
  "Oils & Fluids": "🛢️",
  Tires: "🛞",
  "Car Electronics": "🔌",
  "Bouquets & Flowers": "💐",
  "Gift Baskets": "🧺",
  "Party Supplies": "🎉",
  "Greeting Cards": "💌",
  "Seasonal & Holidays": "🎄",
  // Smoke & Tobacco
  Devices: "🔋",
  "E-liquid & Pods": "💨",
  "Smoke Accessories": "🎒",
  Tobacco: "🚬",
};

const SUB_FILTER_PARENT = new Map<string, BrowseSection>();
for (const section of BROWSE_SECTION_OPTIONS) {
  for (const sub of BROWSE_SUB_FILTERS_BY_SECTION[section]) {
    SUB_FILTER_PARENT.set(sub, section);
  }
}
for (const [legacy, parent] of Object.entries(LEGACY_BROWSE_ALIASES)) {
  SUB_FILTER_PARENT.set(legacy, parent);
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
  return [...new Set(raw)];
}

export type BrowseSelectionValidation =
  | { ok: true; selection: string[] }
  | { ok: false; error: string; section?: BrowseSection };

export type BrowseSelectionOptions = {
  maxSections?: number;
};

/** Each selected category with sub-tags must have at least one tag chosen. */
export function validateBrowseSelection(
  values: string[],
  options?: BrowseSelectionOptions,
): BrowseSelectionValidation {
  const raw = [...new Set(values.map((value) => value.trim()).filter(Boolean))];
  const topLevel = normalizeBrowseSections(raw);

  if (topLevel.length === 0) {
    return { ok: false, error: "Pick a business category." };
  }

  if (options?.maxSections != null && topLevel.length > options.maxSections) {
    return {
      ok: false,
      error:
        options.maxSections === 1
          ? "Pick only one business category."
          : `Pick at most ${options.maxSections} business categories.`,
    };
  }

  const subs = getBrowseSubTags(raw);

  for (const section of topLevel) {
    if (!sectionHasSubFilters(section)) continue;
    const hasTag = subs.some((tag) => getParentSectionForSubFilter(tag) === section);
    if (!hasTag) {
      return {
        ok: false,
        error: `Pick at least one tag for ${browseSectionShortLabel(section)}.`,
        section,
      };
    }
  }

  return { ok: true, selection: [...new Set([...topLevel, ...subs])] };
}

export function validateBrowseSelectionFromForm(
  formData: FormData,
  options?: BrowseSelectionOptions,
): BrowseSelectionValidation {
  return validateBrowseSelection(parseFullBrowseSelectionFromForm(formData), options);
}

export function parseBrowseSectionsFromForm(formData: FormData): BrowseSection[] {
  const topLevel = normalizeBrowseSections(parseFullBrowseSelectionFromForm(formData));
  if (topLevel.length > 0) return topLevel;

  const single = String(formData.get("browse_section") ?? "").trim();
  if (single) {
    const normalized = normalizeBrowseSections([single]);
    if (normalized.length > 0) return normalized;
  }

  return ["Sports & Outdoors"];
}

export function parseBrowseSectionFromForm(formData: FormData): BrowseSection {
  return parseBrowseSectionsFromForm(formData)[0] ?? "Sports & Outdoors";
}

export function formatBrowseSectionsLabel(sections: unknown): string {
  const raw = getRawBrowseSectionValues(sections);
  const topLevel = normalizeBrowseSections(raw);
  const subs = getBrowseSubTags(raw);
  const parts = [
    ...topLevel.map((section) => browseSectionShortLabel(section)),
    ...subs,
  ];
  return parts.length > 0 ? parts.join(", ") : "Sports";
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
      return ["Sports & Outdoors"];
    default:
      return ["Sports & Outdoors"];
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
      return ["Camping"];
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
export const STORES_NAV_LABEL = "Stores";
export const FOR_STORE_OWNERS_LABEL = "For store owners";
export const SITE_TAGLINE =
  "Digital storefronts and WhatsApp ordering — simple for guests, easy for your team.";
export const HOME_SEARCH_PLACEHOLDER = "Search shops & stores…";
export const HOME_HERO_TITLE = "Every shop & store, one tap away.";
export const HOME_HERO_SUBTITLE =
  "Discover local stores, groceries, and food spots — browse items and order on WhatsApp.";

/** Whether this business is primarily food-service (menu wording fits). */
export function isFoodMenuBusiness(browseSections: unknown): boolean {
  const sections = normalizeBrowseSections(getRawBrowseSectionValues(browseSections));
  return sections.includes("Food & Restaurants");
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
      inStoreTitle: "In-store menu",
      inStoreDescription:
        "Same look and items, without + buttons or checkout — ideal for QR on tables inside the venue.",
      inStoreBadge: "In-store",
      openLink: "Open menu",
      orderDownloadSuffix: "menu-qr-order",
      inStoreDownloadSuffix: "menu-qr-in-store",
      inStoreViewBadge: "In-store menu · view only",
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

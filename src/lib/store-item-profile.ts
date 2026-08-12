import type { BrowseSection } from "@/lib/browse-sections";

/**
 * Which "add item" fields make sense for a store, based on the business
 * categories it operates in (browse_sections). A store can pick multiple
 * categories (e.g. a supermarket = Groceries + Drinks + Beauty & Pharmacy) —
 * in that case we show the union of everything those categories need.
 */
export type ProductOptionHints = {
  typePrimary: string;
  typeSecondary: string;
  value: string;
  addAnother: string;
  /** Enables one-tap Size/Color presets for fashion stores. */
  presetMode?: "fashion";
};

export type StoreItemProfile = {
  /** "Sold by weight" toggle + price-per-kg fields (produce, meat, bulk foods). */
  weightPricing: boolean;
  /** Quantity/volume label like 200g, 1L, 500ml, 12kg cylinder. */
  displayQuantity: boolean;
  /** Calories / protein nutrition facts. */
  nutrition: boolean;
  /** Contains / ingredients / materials free text field (stored in `contents`). */
  contents: boolean;
  /** Dish-level customization: "remove onions", "add cheese (+$1)". */
  ingredientCustomization: boolean;
  /** Product variants: Size, Color, etc. (customers must pick one). */
  productOptions: boolean;
  /** Placeholder copy for the variants UI (tailored to the store category). */
  optionHints: ProductOptionHints;
  /** Copy tone: "menu"/"dish" wording vs generic "product" wording. */
  isFoodLike: boolean;
  /** Fashion stores — materials/fabric labeling + branding emphasis. */
  isFashionLike: boolean;
  /** Require choosing a brand when brands exist (e.g. fashion boutique). */
  brandRequired: boolean;
  /** Men / Women / Kids audience tag + filters. */
  audienceTag: boolean;
  /** Example placeholder for the item name field. */
  namePlaceholder: string;
};

const FASHION_OPTION_HINTS: ProductOptionHints = {
  typePrimary: "Size",
  typeSecondary: "Color",
  value: "Custom size",
  addAnother: "+ Add colors",
  presetMode: "fashion",
};

const ELECTRONICS_OPTION_HINTS: ProductOptionHints = {
  typePrimary: "e.g. Storage, Color",
  typeSecondary: "e.g. Color",
  value: "Value (e.g. 128GB, 256GB, Black)",
  addAnother: "+ Add another option type (e.g. Color)",
};

const SMOKE_OPTION_HINTS: ProductOptionHints = {
  typePrimary: "e.g. Nicotine, Flavor",
  typeSecondary: "e.g. Flavor",
  value: "Value (e.g. 3mg, 6mg, Mint)",
  addAnother: "+ Add another option type (e.g. Flavor)",
};

const GROCERIES_OPTION_HINTS: ProductOptionHints = {
  typePrimary: "e.g. Grind, Roast, Size",
  typeSecondary: "e.g. Roast",
  value: "Value (e.g. Whole bean, Espresso, 250g)",
  addAnother: "+ Add another option type (e.g. Roast)",
};

const DEFAULT_OPTION_HINTS: ProductOptionHints = {
  typePrimary: "e.g. Size, Color, Style",
  typeSecondary: "e.g. Color",
  value: "Value (e.g. Large, Red)",
  addAnother: "+ Add another option type (e.g. Color)",
};

function resolveOptionHints(sections: readonly BrowseSection[]): ProductOptionHints {
  if (sections.includes("Fashion & Apparel")) return FASHION_OPTION_HINTS;
  if (sections.includes("Electronics & Tech")) return ELECTRONICS_OPTION_HINTS;
  if (sections.includes("Smoke & Tobacco")) return SMOKE_OPTION_HINTS;
  if (sections.includes("Groceries")) return GROCERIES_OPTION_HINTS;
  return DEFAULT_OPTION_HINTS;
}

const WEIGHT_PRICING_SECTIONS = new Set<BrowseSection>([
  "Food & Restaurants",
  "Groceries",
  "Pets & Supplies",
]);

const DISPLAY_QUANTITY_SECTIONS = new Set<BrowseSection>([
  "Food & Restaurants",
  "Groceries",
  "Drinks & Beverages",
  "Beauty & Pharmacy",
  // "Gas & Fuel", // temporarily hidden
  "Pets & Supplies",
  "Sports & Outdoors",
  "Smoke & Tobacco",
  // Fashion uses Product options (S/M/L, etc.) — not weight/volume labels.
  "Automotive",
  "Gifts & Lifestyle",
]);

const NUTRITION_SECTIONS = new Set<BrowseSection>([
  "Food & Restaurants",
  "Groceries",
  "Drinks & Beverages",
  "Beauty & Pharmacy",
  "Pets & Supplies",
]);

const CONTENTS_SECTIONS = new Set<BrowseSection>([
  "Food & Restaurants",
  "Groceries",
  "Drinks & Beverages",
  "Beauty & Pharmacy",
  "Pets & Supplies",
  "Sports & Outdoors",
  "Smoke & Tobacco",
  "Fashion & Apparel", // materials / fabric (not food nutrition)
  "Automotive",
  "Gifts & Lifestyle",
]);

const INGREDIENT_CUSTOMIZATION_SECTIONS = new Set<BrowseSection>([
  "Food & Restaurants",
]);

/** Variants customers must pick: sizes, grind, nicotine, storage/color, etc. */
const PRODUCT_OPTIONS_SECTIONS = new Set<BrowseSection>([
  "Fashion & Apparel",
  "Sports & Outdoors",
  "Groceries", // e.g. roastery grind / roast
  "Smoke & Tobacco",
  "Electronics & Tech",
  "Beauty & Pharmacy",
  "Home & Living",
  "Automotive",
]);

const NO_EXTRAS_PROFILE: StoreItemProfile = {
  weightPricing: false,
  displayQuantity: false,
  nutrition: false,
  contents: false,
  ingredientCustomization: false,
  productOptions: false,
  optionHints: DEFAULT_OPTION_HINTS,
  isFoodLike: false,
  isFashionLike: false,
  brandRequired: false,
  audienceTag: false,
  namePlaceholder: "e.g. iPhone 15 Case – Black",
};

function resolveNamePlaceholder(sections: readonly BrowseSection[]): string {
  if (sections.includes("Fashion & Apparel")) return "e.g. Linen Midi Skirt – Blue Stripe";
  if (sections.includes("Food & Restaurants")) return "e.g. Grilled Chicken Burger";
  if (sections.includes("Electronics & Tech")) return "e.g. iPhone 15 Case – Black";
  return "e.g. Product name";
}

export function resolveStoreItemProfile(sections: readonly BrowseSection[]): StoreItemProfile {
  if (!sections || sections.length === 0) return { ...NO_EXTRAS_PROFILE };

  const has = (set: Set<BrowseSection>) => sections.some((section) => set.has(section));
  const isFashionLike = sections.includes("Fashion & Apparel");

  return {
    weightPricing: has(WEIGHT_PRICING_SECTIONS),
    displayQuantity: has(DISPLAY_QUANTITY_SECTIONS),
    nutrition: has(NUTRITION_SECTIONS),
    contents: has(CONTENTS_SECTIONS),
    ingredientCustomization: has(INGREDIENT_CUSTOMIZATION_SECTIONS),
    productOptions: has(PRODUCT_OPTIONS_SECTIONS),
    optionHints: resolveOptionHints(sections),
    isFoodLike: sections.includes("Food & Restaurants"),
    isFashionLike,
    brandRequired: isFashionLike,
    audienceTag:
      isFashionLike || sections.includes("Sports & Outdoors"),
    namePlaceholder: resolveNamePlaceholder(sections),
  };
}

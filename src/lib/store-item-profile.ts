import type { BrowseSection } from "@/lib/browse-sections";

/**
 * Which "add item" fields make sense for a store, based on the business
 * categories it operates in (browse_sections). A store can pick multiple
 * categories (e.g. a supermarket = Groceries + Drinks + Health & Beauty) —
 * in that case we show the union of everything those categories need.
 */
export type StoreItemProfile = {
  /** "Sold by weight" toggle + price-per-kg fields (produce, meat, bulk foods). */
  weightPricing: boolean;
  /** Quantity/volume label like 200g, 1L, 500ml, 12kg cylinder. */
  displayQuantity: boolean;
  /** Calories / protein nutrition facts. */
  nutrition: boolean;
  /** Contains / ingredients / key-contents free text field. */
  contents: boolean;
  /** Dish-level customization: "remove onions", "add cheese (+$1)". */
  ingredientCustomization: boolean;
  /** Copy tone: "menu"/"dish" wording vs generic "product" wording. */
  isFoodLike: boolean;
};

const WEIGHT_PRICING_SECTIONS = new Set<BrowseSection>([
  "Food & Restaurants",
  "Groceries",
  "Pets & Supplies",
]);

const DISPLAY_QUANTITY_SECTIONS = new Set<BrowseSection>([
  "Food & Restaurants",
  "Groceries",
  "Drinks & Beverages",
  "Health & Beauty",
  "Vape & Tobacco",
  "Gas & Fuel",
  "Pets & Supplies",
]);

const NUTRITION_SECTIONS = new Set<BrowseSection>([
  "Food & Restaurants",
  "Groceries",
  "Drinks & Beverages",
  "Health & Beauty",
  "Pets & Supplies",
]);

const CONTENTS_SECTIONS = new Set<BrowseSection>([
  "Food & Restaurants",
  "Groceries",
  "Drinks & Beverages",
  "Health & Beauty",
  "Vape & Tobacco",
  "Pets & Supplies",
]);

const INGREDIENT_CUSTOMIZATION_SECTIONS = new Set<BrowseSection>(["Food & Restaurants"]);

const NO_EXTRAS_PROFILE: StoreItemProfile = {
  weightPricing: false,
  displayQuantity: false,
  nutrition: false,
  contents: false,
  ingredientCustomization: false,
  isFoodLike: false,
};

export function resolveStoreItemProfile(sections: readonly BrowseSection[]): StoreItemProfile {
  if (!sections || sections.length === 0) return { ...NO_EXTRAS_PROFILE };

  const has = (set: Set<BrowseSection>) => sections.some((section) => set.has(section));

  return {
    weightPricing: has(WEIGHT_PRICING_SECTIONS),
    displayQuantity: has(DISPLAY_QUANTITY_SECTIONS),
    nutrition: has(NUTRITION_SECTIONS),
    contents: has(CONTENTS_SECTIONS),
    ingredientCustomization: has(INGREDIENT_CUSTOMIZATION_SECTIONS),
    isFoodLike: sections.includes("Food & Restaurants"),
  };
}

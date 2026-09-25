/** Catalog Excel import — columns mirror each store’s Add Item form (+ batch limits). */

import type { MenuOptionGroup } from "@/lib/menu-item-options";
import type { StoreItemProfile } from "@/lib/store-item-profile";

export const CATALOG_IMPORT_SHEET_NAME = "Items";
export const CATALOG_IMPORT_MAX_ROWS = 50;
/** Insert in small chunks so one upload cannot lock Postgres for long. */
export const CATALOG_IMPORT_INSERT_CHUNK = 10;

/**
 * All columns that can appear depending on store category.
 * Main product photo is omitted — import generates a placeholder (colors get swatches).
 */
export const CATALOG_IMPORT_COLUMNS = [
  "section_name",
  "name",
  "brand_name",
  "audience",
  "contents",
  "price",
  "sold_by_weight",
  "price_per_kg",
  "weight_step_kg",
  "display_quantity",
  "display_unit",
  "description",
  "calories",
  "protein_g",
  // Product options (category-specific)
  "sizes",
  "colors",
  "storage_options",
  "nicotine_options",
  "flavor_options",
  "option1_label",
  "option1_values",
  "option2_label",
  "option2_values",
  // Food customization
  "removable_ingredients",
  "add_on_ingredients",
  // Stock
  "track_stock",
  "stock_quantity",
  "stock_alert_warning_qty",
  "stock_alert_urgent_qty",
  "stock_alert_critical_qty",
  "is_available",
] as const;

export type CatalogImportColumn = (typeof CATALOG_IMPORT_COLUMNS)[number];

export type CatalogImportColumnMeta = {
  key: CatalogImportColumn;
  formLabel: string;
  required?: boolean;
  hint: string;
};

export const CATALOG_IMPORT_COLUMN_META: Record<CatalogImportColumn, CatalogImportColumnMeta> = {
  section_name: {
    key: "section_name",
    formLabel: "Section",
    required: true,
    hint: "Must match a section name (created automatically if new)",
  },
  name: {
    key: "name",
    formLabel: "Item name",
    required: true,
    hint: "Product / dish name",
  },
  brand_name: {
    key: "brand_name",
    formLabel: "Brand",
    hint: "Existing brand name, or a new one to create",
  },
  audience: {
    key: "audience",
    formLabel: "Designed for",
    hint: "men | women | unisex | boys | girls (or blank)",
  },
  contents: {
    key: "contents",
    formLabel: "Contents / materials",
    hint: "Ingredients text or materials / fabric",
  },
  price: {
    key: "price",
    formLabel: "Price (USD)",
    hint: "Base / simple-item price. Use 0 when sold_by_weight=yes",
  },
  sold_by_weight: {
    key: "sold_by_weight",
    formLabel: "Sold by weight",
    hint: "yes / no",
  },
  price_per_kg: {
    key: "price_per_kg",
    formLabel: "Price per kg (USD)",
    hint: "Required when sold_by_weight=yes",
  },
  weight_step_kg: {
    key: "weight_step_kg",
    formLabel: "Weight step (kg)",
    hint: "e.g. 0.1",
  },
  display_quantity: {
    key: "display_quantity",
    formLabel: "Display quantity",
    hint: "e.g. 250",
  },
  display_unit: {
    key: "display_unit",
    formLabel: "Display unit",
    hint: "mg | g | kg | ml | cl | l | pcs",
  },
  description: {
    key: "description",
    formLabel: "Description",
    hint: "Shown on the product page",
  },
  calories: {
    key: "calories",
    formLabel: "Calories",
    hint: "kcal per serving",
  },
  protein_g: {
    key: "protein_g",
    formLabel: "Protein (g)",
    hint: "grams per serving",
  },
  sizes: {
    key: "sizes",
    formLabel: "Sizes",
    hint: "Comma-separated, e.g. XS, S, M, L, XL",
  },
  colors: {
    key: "colors",
    formLabel: "Colors",
    hint: "Comma-separated, e.g. Black, White, Navy",
  },
  storage_options: {
    key: "storage_options",
    formLabel: "Storage / configs",
    hint: "Comma-separated, e.g. 128GB, 256GB, 512GB",
  },
  nicotine_options: {
    key: "nicotine_options",
    formLabel: "Nicotine",
    hint: "Comma-separated, e.g. 0mg, 3mg, 6mg",
  },
  flavor_options: {
    key: "flavor_options",
    formLabel: "Flavors",
    hint: "Comma-separated, e.g. Mint, Mango, Tobacco",
  },
  option1_label: {
    key: "option1_label",
    formLabel: "Option 1 type",
    hint: "e.g. Size, Grind, Roast",
  },
  option1_values: {
    key: "option1_values",
    formLabel: "Option 1 values",
    hint: "Comma-separated values for option 1",
  },
  option2_label: {
    key: "option2_label",
    formLabel: "Option 2 type",
    hint: "e.g. Color",
  },
  option2_values: {
    key: "option2_values",
    formLabel: "Option 2 values",
    hint: "Comma-separated values for option 2",
  },
  removable_ingredients: {
    key: "removable_ingredients",
    formLabel: "Removable ingredients",
    hint: "Comma-separated, e.g. Onions, Pickles",
  },
  add_on_ingredients: {
    key: "add_on_ingredients",
    formLabel: "Add-ons",
    hint: "Name:price pairs, e.g. Cheese:1 | Bacon:2",
  },
  track_stock: {
    key: "track_stock",
    formLabel: "Track stock",
    hint: "yes / no",
  },
  stock_quantity: {
    key: "stock_quantity",
    formLabel: "Stock qty",
    hint: "On-hand quantity when tracking",
  },
  stock_alert_warning_qty: {
    key: "stock_alert_warning_qty",
    formLabel: "Stock alert · warning",
    hint: "Optional threshold",
  },
  stock_alert_urgent_qty: {
    key: "stock_alert_urgent_qty",
    formLabel: "Stock alert · urgent",
    hint: "Optional threshold",
  },
  stock_alert_critical_qty: {
    key: "stock_alert_critical_qty",
    formLabel: "Stock alert · very urgent",
    hint: "Optional threshold",
  },
  is_available: {
    key: "is_available",
    formLabel: "Available",
    hint: "yes / no (ignored when stock tracked and qty is 0)",
  },
};

export type CatalogImportProfile = Pick<
  StoreItemProfile,
  | "weightPricing"
  | "displayQuantity"
  | "nutrition"
  | "contents"
  | "audienceTag"
  | "brandRequired"
  | "isFashionLike"
  | "isElectronicsLike"
  | "isFoodLike"
  | "productOptions"
  | "ingredientCustomization"
  | "optionHints"
>;

/**
 * Pick Excel columns to match THIS store’s add-item form (unique per category).
 */
export function catalogImportColumnsForProfile(
  profile: CatalogImportProfile,
  opts?: { hasBrands?: boolean },
): CatalogImportColumn[] {
  const cols: CatalogImportColumn[] = ["section_name", "name"];
  const preset = profile.optionHints?.presetMode;

  if (profile.brandRequired || profile.isFashionLike || opts?.hasBrands) {
    cols.push("brand_name");
  }
  if (profile.audienceTag) cols.push("audience");
  if (profile.contents) cols.push("contents");

  if (profile.weightPricing) {
    cols.push("sold_by_weight", "price", "price_per_kg", "weight_step_kg");
  } else {
    cols.push("price");
  }

  if (profile.displayQuantity) {
    cols.push("display_quantity", "display_unit");
  }

  cols.push("description");

  if (profile.nutrition) {
    cols.push("calories", "protein_g");
  }

  if (profile.productOptions) {
    if (preset === "fashion" || profile.isFashionLike) {
      cols.push("sizes", "colors");
    } else if (preset === "electronics" || profile.isElectronicsLike) {
      cols.push("storage_options", "colors");
    } else if (
      profile.optionHints?.typePrimary?.toLowerCase().includes("nicotine") ||
      profile.optionHints?.typeSecondary?.toLowerCase().includes("flavor")
    ) {
      cols.push("nicotine_options", "flavor_options");
    } else {
      cols.push("option1_label", "option1_values", "option2_label", "option2_values");
    }
  }

  if (profile.ingredientCustomization) {
    cols.push("removable_ingredients", "add_on_ingredients");
  }

  cols.push(
    "track_stock",
    "stock_quantity",
    "stock_alert_warning_qty",
    "stock_alert_urgent_qty",
    "stock_alert_critical_qty",
    "is_available",
  );

  return [...new Set(cols)];
}

export type CatalogImportRow = {
  rowNumber: number;
  sectionName: string;
  name: string;
  price: number;
  description: string | null;
  brandName: string | null;
  contents: string | null;
  audience: string | null;
  displayQuantity: number | null;
  displayUnit: string;
  soldByWeight: boolean;
  pricePerKg: number | null;
  weightStepKg: number;
  calories: number | null;
  proteinG: number | null;
  sizes: string[];
  colors: string[];
  storageOptions: string[];
  nicotineOptions: string[];
  flavorOptions: string[];
  option1Label: string | null;
  option1Values: string[];
  option2Label: string | null;
  option2Values: string[];
  removableIngredients: string[];
  addOnIngredients: Array<{ name: string; price: number }>;
  trackStock: boolean;
  stockQuantity: number | null;
  stockAlertWarningQty: number | null;
  stockAlertUrgentQty: number | null;
  stockAlertCriticalQty: number | null;
  isAvailable: boolean;
};

export type CatalogImportRowError = {
  rowNumber: number;
  message: string;
};

const HEADER_ALIASES: Record<string, CatalogImportColumn> = {
  section_name: "section_name",
  section: "section_name",
  category: "section_name",
  category_name: "section_name",
  name: "name",
  item_name: "name",
  product_name: "name",
  title: "name",
  brand_name: "brand_name",
  brand: "brand_name",
  audience: "audience",
  designed_for: "audience",
  contents: "contents",
  materials: "contents",
  fabric: "contents",
  ingredients: "contents",
  price: "price",
  price_usd: "price",
  sold_by_weight: "sold_by_weight",
  by_weight: "sold_by_weight",
  price_per_kg: "price_per_kg",
  weight_step_kg: "weight_step_kg",
  weight_step: "weight_step_kg",
  display_quantity: "display_quantity",
  quantity: "display_quantity",
  display_unit: "display_unit",
  unit: "display_unit",
  description: "description",
  calories: "calories",
  protein_g: "protein_g",
  protein: "protein_g",
  sizes: "sizes",
  size: "sizes",
  size_options: "sizes",
  colors: "colors",
  colour: "colors",
  colours: "colors",
  color: "colors",
  color_options: "colors",
  storage_options: "storage_options",
  storage: "storage_options",
  storages: "storage_options",
  nicotine_options: "nicotine_options",
  nicotine: "nicotine_options",
  flavor_options: "flavor_options",
  flavours: "flavor_options",
  flavors: "flavor_options",
  option1_label: "option1_label",
  option_1_label: "option1_label",
  option1_values: "option1_values",
  option_1_values: "option1_values",
  option2_label: "option2_label",
  option_2_label: "option2_label",
  option2_values: "option2_values",
  option_2_values: "option2_values",
  removable_ingredients: "removable_ingredients",
  removable: "removable_ingredients",
  add_on_ingredients: "add_on_ingredients",
  addons: "add_on_ingredients",
  add_ons: "add_on_ingredients",
  track_stock: "track_stock",
  stock: "track_stock",
  stock_quantity: "stock_quantity",
  qty: "stock_quantity",
  stock_alert_warning_qty: "stock_alert_warning_qty",
  stock_alert_urgent_qty: "stock_alert_urgent_qty",
  stock_alert_critical_qty: "stock_alert_critical_qty",
  is_available: "is_available",
  available: "is_available",
};

export function normalizeImportHeader(raw: unknown): CatalogImportColumn | null {
  const key = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  return HEADER_ALIASES[key] ?? null;
}

function cellToString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "object" && value !== null && "text" in value) {
    return String((value as { text: unknown }).text ?? "").trim();
  }
  if (typeof value === "object" && value !== null && "result" in value) {
    return String((value as { result: unknown }).result ?? "").trim();
  }
  return String(value).trim();
}

function parseYesNo(raw: string, defaultValue: boolean): boolean {
  if (!raw) return defaultValue;
  const v = raw.toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(v)) return true;
  if (["0", "false", "no", "n", "off"].includes(v)) return false;
  return defaultValue;
}

function parseOptionalNumber(raw: string): number | null {
  if (!raw) return null;
  const n = Number(String(raw).replace(/,/g, ""));
  if (!Number.isFinite(n)) return null;
  return n;
}

/** Split "S, M, L" or "S | M | L" into unique trimmed values. */
export function parseCommaList(raw: string): string[] {
  if (!raw.trim()) return [];
  const parts = raw.split(/[,|;/]+/).map((p) => p.trim()).filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) {
    const key = part.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(part);
  }
  return out;
}

/** Parse "Cheese:1 | Bacon:2" or "Cheese=1, Bacon=2". */
export function parseAddOnList(raw: string): Array<{ name: string; price: number }> {
  if (!raw.trim()) return [];
  const chunks = raw.split(/[|,;]+/).map((c) => c.trim()).filter(Boolean);
  const out: Array<{ name: string; price: number }> = [];
  for (const chunk of chunks) {
    const match = chunk.match(/^(.+?)\s*[:=]\s*(\d+(?:\.\d+)?)\s*$/);
    if (match) {
      const name = match[1]!.trim();
      const price = Number(match[2]);
      if (name && Number.isFinite(price) && price >= 0) {
        out.push({ name, price: Math.round(price * 100) / 100 });
      }
      continue;
    }
    if (chunk) out.push({ name: chunk, price: 0 });
  }
  return out;
}

function optionGroup(label: string, values: string[]): MenuOptionGroup | null {
  const cleaned = values.map((v) => v.trim()).filter(Boolean);
  if (!label.trim() || cleaned.length === 0) return null;
  return {
    label: label.trim(),
    values: cleaned.map((name) => ({ name, price: 0 })),
  };
}

/** Build option groups from Excel columns (fashion sizes/colors, electronics, etc.). */
export function buildOptionGroupsFromImportRow(row: CatalogImportRow): MenuOptionGroup[] {
  const groups: MenuOptionGroup[] = [];

  const sizeGroup = optionGroup("Size", row.sizes);
  if (sizeGroup) groups.push(sizeGroup);

  const storageGroup = optionGroup("Storage", row.storageOptions);
  if (storageGroup) groups.push(storageGroup);

  const nicotineGroup = optionGroup("Nicotine", row.nicotineOptions);
  if (nicotineGroup) groups.push(nicotineGroup);

  const flavorGroup = optionGroup("Flavor", row.flavorOptions);
  if (flavorGroup) groups.push(flavorGroup);

  const colorGroup = optionGroup("Color", row.colors);
  if (colorGroup) groups.push(colorGroup);

  const opt1 = optionGroup(row.option1Label ?? "", row.option1Values);
  if (opt1) groups.push(opt1);

  const opt2 = optionGroup(row.option2Label ?? "", row.option2Values);
  if (opt2) groups.push(opt2);

  return groups;
}

export function parseCatalogImportRecords(
  records: Array<Record<string, unknown>>,
): { rows: CatalogImportRow[]; errors: CatalogImportRowError[] } {
  const rows: CatalogImportRow[] = [];
  const errors: CatalogImportRowError[] = [];

  records.forEach((record, index) => {
    const rowNumber = index + 2;
    const sectionName = cellToString(record.section_name);
    const name = cellToString(record.name);
    const soldByWeight = parseYesNo(cellToString(record.sold_by_weight), false);
    const priceRaw = cellToString(record.price);
    const pricePerKgRaw = cellToString(record.price_per_kg);
    const price = parseOptionalNumber(priceRaw);
    const pricePerKg = parseOptionalNumber(pricePerKgRaw);

    if (!sectionName && !name && !priceRaw && !pricePerKgRaw) {
      return;
    }

    if (!sectionName) {
      errors.push({ rowNumber, message: "section_name is required (Section on the add form)" });
      return;
    }
    if (!name) {
      errors.push({ rowNumber, message: "name is required (Item name on the add form)" });
      return;
    }

    if (soldByWeight) {
      if (pricePerKg == null || pricePerKg < 0) {
        errors.push({
          rowNumber,
          message: "price_per_kg is required when sold_by_weight=yes",
        });
        return;
      }
    } else if (price == null || price < 0) {
      errors.push({ rowNumber, message: "price must be 0 or more (Price on the add form)" });
      return;
    }

    const displayQty = parseOptionalNumber(cellToString(record.display_quantity));
    const stockQty = parseOptionalNumber(cellToString(record.stock_quantity));
    const trackStock = parseYesNo(cellToString(record.track_stock), false);
    const isAvailable = parseYesNo(cellToString(record.is_available), true);
    const weightStep = parseOptionalNumber(cellToString(record.weight_step_kg));
    const calories = parseOptionalNumber(cellToString(record.calories));
    const proteinG = parseOptionalNumber(cellToString(record.protein_g));
    const warnQty = parseOptionalNumber(cellToString(record.stock_alert_warning_qty));
    const urgentQty = parseOptionalNumber(cellToString(record.stock_alert_urgent_qty));
    const criticalQty = parseOptionalNumber(cellToString(record.stock_alert_critical_qty));

    rows.push({
      rowNumber,
      sectionName,
      name,
      price: soldByWeight ? 0 : Math.round((price ?? 0) * 100) / 100,
      description: cellToString(record.description) || null,
      brandName: cellToString(record.brand_name) || null,
      contents: cellToString(record.contents) || null,
      audience: cellToString(record.audience).toLowerCase() || null,
      displayQuantity: displayQty != null && displayQty >= 0 ? displayQty : null,
      displayUnit: cellToString(record.display_unit) || "g",
      soldByWeight,
      pricePerKg:
        soldByWeight && pricePerKg != null ? Math.round(pricePerKg * 100) / 100 : null,
      weightStepKg: weightStep != null && weightStep > 0 ? weightStep : 0.1,
      calories: calories != null && calories >= 0 ? Math.round(calories) : null,
      proteinG: proteinG != null && proteinG >= 0 ? proteinG : null,
      sizes: parseCommaList(cellToString(record.sizes)),
      colors: parseCommaList(cellToString(record.colors)),
      storageOptions: parseCommaList(cellToString(record.storage_options)),
      nicotineOptions: parseCommaList(cellToString(record.nicotine_options)),
      flavorOptions: parseCommaList(cellToString(record.flavor_options)),
      option1Label: cellToString(record.option1_label) || null,
      option1Values: parseCommaList(cellToString(record.option1_values)),
      option2Label: cellToString(record.option2_label) || null,
      option2Values: parseCommaList(cellToString(record.option2_values)),
      removableIngredients: parseCommaList(cellToString(record.removable_ingredients)),
      addOnIngredients: parseAddOnList(cellToString(record.add_on_ingredients)),
      trackStock,
      stockQuantity: stockQty != null && stockQty >= 0 ? stockQty : trackStock ? 0 : null,
      stockAlertWarningQty: warnQty != null && warnQty >= 1 ? Math.floor(warnQty) : null,
      stockAlertUrgentQty: urgentQty != null && urgentQty >= 1 ? Math.floor(urgentQty) : null,
      stockAlertCriticalQty:
        criticalQty != null && criticalQty >= 1 ? Math.floor(criticalQty) : null,
      isAvailable: trackStock ? (stockQty ?? 0) > 0 && isAvailable : isAvailable,
    });
  });

  return { rows, errors };
}

/** Sample values keyed by column — only keys present in the template are written. */
export function catalogImportSampleRows(
  columns: CatalogImportColumn[],
): Array<Partial<Record<CatalogImportColumn, string | number>>> {
  const foodish = columns.includes("calories") || columns.includes("sold_by_weight");
  const fashion = columns.includes("sizes") && columns.includes("colors");
  const electronics = columns.includes("storage_options");

  const samples: Array<Partial<Record<CatalogImportColumn, string | number>>> = [
    {
      section_name: foodish ? "Mains" : fashion ? "Dresses" : electronics ? "Phones" : "Bestsellers",
      name: foodish
        ? "Grilled Chicken Plate"
        : fashion
          ? "Linen Midi Skirt"
          : electronics
            ? "Wireless Earbuds Pro"
            : "Sample Product",
      brand_name: fashion || electronics ? "Demo Brand" : "",
      audience: columns.includes("audience") ? (fashion ? "women" : "unisex") : "",
      contents: columns.includes("contents")
        ? foodish
          ? "Chicken, rice, salad"
          : fashion
            ? "100% linen"
            : ""
        : "",
      price: foodish ? 12 : fashion ? 49 : electronics ? 79 : 25,
      sold_by_weight: "no",
      price_per_kg: "",
      weight_step_kg: "0.1",
      display_quantity: columns.includes("display_quantity") ? (foodish ? 350 : "") : "",
      display_unit: columns.includes("display_unit") ? (foodish ? "g" : "pcs") : "",
      description: "Sample row — edit or delete before importing",
      calories: columns.includes("calories") ? 520 : "",
      protein_g: columns.includes("protein_g") ? 38 : "",
      sizes: fashion ? "XS, S, M, L, XL" : "",
      colors: fashion || electronics ? "Black, White, Navy" : "",
      storage_options: electronics ? "128GB, 256GB, 512GB" : "",
      nicotine_options: columns.includes("nicotine_options") ? "0mg, 3mg, 6mg" : "",
      flavor_options: columns.includes("flavor_options") ? "Mint, Mango" : "",
      option1_label: columns.includes("option1_label") ? "Grind" : "",
      option1_values: columns.includes("option1_values") ? "Whole bean, Espresso" : "",
      option2_label: columns.includes("option2_label") ? "Roast" : "",
      option2_values: columns.includes("option2_values") ? "Light, Medium, Dark" : "",
      removable_ingredients: columns.includes("removable_ingredients") ? "Onions, Pickles" : "",
      add_on_ingredients: columns.includes("add_on_ingredients") ? "Cheese:1 | Bacon:2" : "",
      track_stock: "yes",
      stock_quantity: 10,
      stock_alert_warning_qty: 10,
      stock_alert_urgent_qty: 5,
      stock_alert_critical_qty: 3,
      is_available: "yes",
    },
    {
      section_name: foodish ? "Mains" : fashion ? "Tops" : "Bestsellers",
      name: foodish ? "Bulk Olive Oil" : fashion ? "Cotton Tee" : "Second sample",
      brand_name: "",
      audience: columns.includes("audience") ? (fashion ? "unisex" : "") : "",
      contents: fashion ? "100% cotton" : "",
      price: columns.includes("sold_by_weight") ? 0 : fashion ? 19 : 45,
      sold_by_weight: columns.includes("sold_by_weight") ? "yes" : "no",
      price_per_kg: columns.includes("price_per_kg") ? 8.5 : "",
      weight_step_kg: "0.25",
      display_quantity: "",
      display_unit: columns.includes("display_unit") ? "pcs" : "",
      description: "Second sample — delete if unused",
      calories: "",
      protein_g: "",
      sizes: fashion ? "S, M, L" : "",
      colors: fashion ? "White, Black" : "",
      storage_options: "",
      nicotine_options: "",
      flavor_options: "",
      option1_label: "",
      option1_values: "",
      option2_label: "",
      option2_values: "",
      removable_ingredients: "",
      add_on_ingredients: "",
      track_stock: "no",
      stock_quantity: "",
      stock_alert_warning_qty: "",
      stock_alert_urgent_qty: "",
      stock_alert_critical_qty: "",
      is_available: "yes",
    },
  ];

  return samples.map((sample) => {
    const trimmed: Partial<Record<CatalogImportColumn, string | number>> = {};
    for (const col of columns) {
      trimmed[col] = sample[col] ?? "";
    }
    return trimmed;
  });
}

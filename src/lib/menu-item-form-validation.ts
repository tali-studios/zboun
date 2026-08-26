import { buildMenuItemStockPayload } from "@/lib/menu-item-stock";

export function formHasProductImage(formData: FormData): boolean {
  const main = formData.get("image_file");
  if (main instanceof File && main.size > 0) return true;

  const current = String(formData.get("current_image_url") ?? "").trim();
  if (current) return true;

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("color_image__")) continue;
    if (key.startsWith("color_image_current__")) continue;
    if (value instanceof File && value.size > 0) return true;
  }

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("color_image_current__")) continue;
    if (String(value ?? "").trim()) return true;
  }

  return false;
}

function hasElectronicsComboPrices(formData: FormData): boolean {
  const raw = String(formData.get("option_variant_prices") ?? "").trim();
  if (!raw || raw === "{}") return false;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.values(parsed).some((v) => Number.isFinite(Number(v)) && Number(v) >= 0);
  } catch {
    return false;
  }
}

export type MenuItemFormValidationOpts = {
  brandRequired: boolean;
  isElectronics: boolean;
  photosInOptions: boolean;
};

/** Client-side checks before create/update menu item. Returns a user-facing message or null. */
export function validateMenuItemFormClient(
  formData: FormData,
  opts: MenuItemFormValidationOpts,
): string | null {
  const categoryId = String(formData.get("category_id") ?? "").trim();
  if (!categoryId) return "Choose a section for this item before saving.";

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return "Enter an item name before saving.";

  if (opts.brandRequired) {
    const brandId = String(formData.get("brand_id") ?? "").trim();
    if (!brandId) return "Choose a brand before saving.";
  }

  const soldByWeight = String(formData.get("sold_by_weight") ?? "") === "true";
  if (soldByWeight) {
    const pricePerKg = Number(formData.get("price_per_kg") ?? "");
    if (!Number.isFinite(pricePerKg) || pricePerKg < 0) {
      return "Enter a valid price per kg before saving.";
    }
  } else if (opts.isElectronics) {
    const priceRaw = String(formData.get("price") ?? "").trim();
    const price = Number(priceRaw);
    const hasComboPrices = hasElectronicsComboPrices(formData);
    if (!hasComboPrices && (!priceRaw || !Number.isFinite(price) || price < 0)) {
      return "Enter a starting price, or fill the storage × color price grid, before saving.";
    }
  } else {
    const priceRaw = String(formData.get("price") ?? "").trim();
    const price = Number(priceRaw);
    if (!priceRaw || !Number.isFinite(price) || price < 0) {
      return "Enter a valid price before saving.";
    }
  }

  if (!formHasProductImage(formData)) {
    return opts.photosInOptions
      ? "Add a product photo before saving — upload a main photo, or one photo per color."
      : "Add a product photo before saving. The catalog needs an image for every item.";
  }

  const stock = buildMenuItemStockPayload(formData);
  if ("error" in stock) {
    return "Check stock alerts: warning must be greater than urgent, and urgent greater than very urgent.";
  }

  return null;
}

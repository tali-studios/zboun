import type { SupabaseClient } from "@supabase/supabase-js";
import { isNutritionColumnMigrationError } from "@/lib/menu-nutrition";
import { resolveMenuItemBrandId } from "@/lib/menu-brands";

export const MENU_ITEMS_ADMIN_PATH = "/dashboard/business/menu-items";

export function buildMenuItemsListHref(opts: {
  q?: string;
  category?: string;
  stock?: string;
  sort?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (opts.q?.trim()) params.set("q", opts.q.trim());
  if (opts.category?.trim()) params.set("category", opts.category.trim());
  if (opts.stock?.trim()) params.set("stock", opts.stock.trim());
  if (opts.sort?.trim() && opts.sort !== "name_asc") params.set("sort", opts.sort.trim());
  if (opts.page && opts.page > 1) params.set("page", String(opts.page));
  const qs = params.toString();
  return qs ? `${MENU_ITEMS_ADMIN_PATH}?${qs}#items-toolbar` : `${MENU_ITEMS_ADMIN_PATH}#items-toolbar`;
}

export type AdminMenuItemRow = {
  id: string;
  name: string;
  brand_name?: string | null;
  brand_id?: string | null;
  menu_brands?: { id: string; name: string; logo_url: string | null } | null;
  description: string | null;
  price: number;
  image_url: string | null;
  grams: number | null;
  display_quantity?: number | null;
  display_unit?: string | null;
  calories?: number | null;
  protein_g?: number | null;
  contents: string | null;
  sold_by_weight?: boolean;
  price_per_kg?: number | null;
  weight_step_kg?: number | null;
  removable_ingredients: Array<{ name?: string }>;
  add_ingredients: Array<{ name?: string; price?: number }>;
  option_label?: string | null;
  option_values?: Array<{ name?: string; price?: number }>;
  track_stock?: boolean;
  stock_quantity?: number | null;
  stock_alert_warning_qty?: number | null;
  stock_alert_urgent_qty?: number | null;
  stock_alert_critical_qty?: number | null;
  is_available: boolean;
  category_id: string | null;
  categories?: { name?: string } | null;
};

export type AdminMenuBrand = {
  id: string;
  name: string;
  logo_url: string | null;
};

export async function loadMenuItemsAdminData(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<{ items: AdminMenuItemRow[]; brands: AdminMenuBrand[] }> {
  const itemsSelectBase =
    "id, name, brand_id, brand_name, description, price, image_url, grams, display_quantity, display_unit, contents, sold_by_weight, price_per_kg, weight_step_kg, removable_ingredients, add_ingredients, option_label, option_values, is_available, category_id, menu_brands(id, name, logo_url), categories(name)";
  const itemsSelectWithStock = `${itemsSelectBase}, track_stock, stock_quantity`;
  const itemsSelectWithStockAlerts = `${itemsSelectWithStock}, stock_alert_warning_qty, stock_alert_urgent_qty, stock_alert_critical_qty`;
  const itemsSelectWithNutrition = `${itemsSelectWithStockAlerts}, calories, protein_g`;
  const itemsSelectLegacy =
    "id, name, brand_id, brand_name, description, price, image_url, grams, contents, sold_by_weight, price_per_kg, weight_step_kg, removable_ingredients, add_ingredients, is_available, category_id, categories(name)";

  const { data: itemsWithOptions, error: itemsWithOptionsError } = await supabase
    .from("menu_items")
    .select(itemsSelectWithNutrition)
    .eq("restaurant_id", restaurantId)
    .order("name");

  let itemsRows: unknown[] | null = itemsWithOptions;
  let itemsQueryError = itemsWithOptionsError;

  if (itemsQueryError && isNutritionColumnMigrationError(itemsQueryError.message, itemsQueryError.code)) {
    const retry = await supabase
      .from("menu_items")
      .select(itemsSelectWithStockAlerts)
      .eq("restaurant_id", restaurantId)
      .order("name");
    itemsRows = retry.data;
    itemsQueryError = retry.error;
  }

  if (itemsQueryError && /stock_alert_/i.test(itemsQueryError.message ?? "")) {
    const retry = await supabase
      .from("menu_items")
      .select(itemsSelectWithStock)
      .eq("restaurant_id", restaurantId)
      .order("name");
    itemsRows = retry.data;
    itemsQueryError = retry.error;
  }

  if (itemsQueryError && /track_stock|stock_quantity/i.test(itemsQueryError.message ?? "")) {
    const retry = await supabase
      .from("menu_items")
      .select(itemsSelectBase)
      .eq("restaurant_id", restaurantId)
      .order("name");
    itemsRows = retry.data;
    itemsQueryError = retry.error;
  }

  const { data: legacyItems } =
    itemsQueryError &&
    /option_label|option_values|brand_name|brand_id|menu_brands|display_quantity|display_unit/i.test(
      itemsQueryError.message ?? "",
    )
      ? await supabase
          .from("menu_items")
          .select(itemsSelectLegacy)
          .eq("restaurant_id", restaurantId)
          .order("name")
      : { data: null };

  const rawItems = (itemsRows ?? legacyItems ?? []) as AdminMenuItemRow[];

  const { data: menuBrandsRaw } = await supabase
    .from("menu_brands")
    .select("id, name, logo_url")
    .eq("restaurant_id", restaurantId)
    .order("name");

  const brands = (menuBrandsRaw ?? []) as AdminMenuBrand[];

  const items = rawItems.map((item) => {
    const menuBrand = Array.isArray(item.menu_brands)
      ? (item.menu_brands[0] ?? null)
      : (item.menu_brands ?? null);
    const resolvedBrandId = resolveMenuItemBrandId(
      {
        brand_id: item.brand_id,
        brand_name: item.brand_name,
        menu_brands: menuBrand,
      },
      brands,
    );

    return {
      ...item,
      menu_brands: menuBrand,
      brand_id: resolvedBrandId || null,
      brand_name: menuBrand?.name ?? item.brand_name ?? null,
      option_label: item.option_label ?? null,
      option_values: Array.isArray(item.option_values) ? item.option_values : [],
    };
  });

  return { items, brands };
}

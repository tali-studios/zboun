import type { CategoryWithItems } from "@/lib/data";

export type PromotionScope = "store" | "category" | "brand" | "item";

export type MenuPromotion = {
  id: string;
  restaurant_id: string;
  scope_type: PromotionScope;
  scope_id: string | null;
  percent_off: number;
  label: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  priority: number;
};

export type MenuItemPricingFields = {
  id: string;
  category_id?: string;
  brand_id?: string | null;
  price: number;
  sold_by_weight?: boolean;
  price_per_kg?: number | null;
  sale_price?: number | null;
  sale_price_per_kg?: number | null;
  percent_off?: number | null;
  promotion_label?: string | null;
  option_values?: Array<{ name: string; price: number }>;
  add_ingredients?: Array<{ name: string; price: number }>;
};

const SCOPE_RANK: Record<PromotionScope, number> = {
  item: 4,
  brand: 3,
  category: 2,
  store: 1,
};

export function isMenuPromotionsMigrationError(
  message: string | null | undefined,
  code?: string | null,
): boolean {
  const msg = (message ?? "").toLowerCase();
  if (code === "42P01" || code === "PGRST205") return true;
  return msg.includes("menu_promotions") && (msg.includes("does not exist") || msg.includes("could not find"));
}

export function isPromotionActive(promotion: MenuPromotion, now = new Date()): boolean {
  if (!promotion.is_active) return false;
  if (promotion.starts_at && new Date(promotion.starts_at) > now) return false;
  if (promotion.ends_at && new Date(promotion.ends_at) < now) return false;
  return true;
}

export function applyPercentOff(baseUsd: number, percentOff: number): number {
  if (!Number.isFinite(baseUsd) || baseUsd <= 0) return 0;
  const discounted = baseUsd * (1 - percentOff / 100);
  return Math.max(0, Math.round(discounted * 100) / 100);
}

function promotionMatchesItem(
  promotion: MenuPromotion,
  item: { id: string; category_id: string },
  brandId: string | null,
): boolean {
  switch (promotion.scope_type) {
    case "store":
      return true;
    case "category":
      return promotion.scope_id === item.category_id;
    case "brand":
      return brandId != null && promotion.scope_id === brandId;
    case "item":
      return promotion.scope_id === item.id;
    default:
      return false;
  }
}

export function findBestPromotionForItem(
  promotions: MenuPromotion[],
  item: { id: string; category_id: string },
  brandId: string | null,
  now = new Date(),
): MenuPromotion | null {
  let best: MenuPromotion | null = null;

  for (const promotion of promotions) {
    if (!isPromotionActive(promotion, now)) continue;
    if (!promotionMatchesItem(promotion, item, brandId)) continue;
    if (!best) {
      best = promotion;
      continue;
    }

    const rankDiff = SCOPE_RANK[promotion.scope_type] - SCOPE_RANK[best.scope_type];
    if (rankDiff > 0) {
      best = promotion;
      continue;
    }
    if (rankDiff < 0) continue;

    if (promotion.priority > best.priority) {
      best = promotion;
      continue;
    }
    if (promotion.priority === best.priority && promotion.percent_off > best.percent_off) {
      best = promotion;
    }
  }

  return best;
}

export function attachSalePricingToItem<T extends Record<string, unknown>>(
  item: T,
  categoryId: string,
  promotions: MenuPromotion[],
): T & {
  sale_price: number | null;
  sale_price_per_kg: number | null;
  percent_off: number | null;
  promotion_label: string | null;
} {
  const brandId = (item.brand_id as string | null | undefined) ?? null;
  const promotion = findBestPromotionForItem(promotions, { id: String(item.id), category_id: categoryId }, brandId);

  if (!promotion) {
    return {
      ...item,
      sale_price: null,
      sale_price_per_kg: null,
      percent_off: null,
      promotion_label: null,
    };
  }

  const soldByWeight = Boolean(item.sold_by_weight);
  const listPrice = Number(item.price ?? 0);
  const listPerKg = Number(item.price_per_kg ?? 0);

  return {
    ...item,
    sale_price: soldByWeight ? null : applyPercentOff(listPrice, promotion.percent_off),
    sale_price_per_kg: soldByWeight ? applyPercentOff(listPerKg, promotion.percent_off) : null,
    percent_off: promotion.percent_off,
    promotion_label: promotion.label?.trim() || `-${Math.round(promotion.percent_off)}%`,
  };
}

export function getEffectiveFlatPrice(item: MenuItemPricingFields): number {
  const sale = item.sale_price;
  if (sale != null && Number.isFinite(sale)) return sale;
  return Math.max(0, Number(item.price ?? 0));
}

export function getEffectivePricePerKg(item: MenuItemPricingFields): number {
  const sale = item.sale_price_per_kg;
  if (sale != null && Number.isFinite(sale)) return sale;
  return Math.max(0, Number(item.price_per_kg ?? item.price ?? 0));
}

export function getListFlatPrice(item: MenuItemPricingFields): number {
  return Math.max(0, Number(item.price ?? 0));
}

export function getListPricePerKg(item: MenuItemPricingFields): number {
  return Math.max(0, Number(item.price_per_kg ?? item.price ?? 0));
}

export function itemHasActiveSale(item: MenuItemPricingFields): boolean {
  return item.percent_off != null && item.percent_off > 0;
}

type OrderLineInput = {
  menuItemId?: string | null;
  name: string;
  qty: number;
  unit: "each" | "kg";
  unitPrice: number;
  selectedOption?: string | null;
  addedIngredients?: Array<{ name: string; qty: number; price: number }>;
};

function getOptionExtraPrice(
  item: MenuItemPricingFields,
  selectedOption: string | null | undefined,
): number {
  const option = String(selectedOption ?? "").trim();
  if (!option) return 0;
  const match = (item.option_values ?? []).find((value) => value.name === option);
  return Math.max(0, Number(match?.price ?? 0));
}

function getAddOnCost(
  item: MenuItemPricingFields,
  addedIngredients: OrderLineInput["addedIngredients"],
): number {
  return (addedIngredients ?? []).reduce(
    (sum, ingredient) => sum + Math.max(0, Number(ingredient.price ?? 0)) * Math.max(0, Number(ingredient.qty ?? 0)),
    0,
  );
}

export function computeExpectedLineUnitPrice(
  item: MenuItemPricingFields,
  line: Pick<OrderLineInput, "unit" | "selectedOption" | "addedIngredients">,
): number {
  const base =
    line.unit === "kg" || item.sold_by_weight
      ? getEffectivePricePerKg(item)
      : getEffectiveFlatPrice(item);
  const total = base + getOptionExtraPrice(item, line.selectedOption) + getAddOnCost(item, line.addedIngredients);
  return Math.max(0, Math.round(total * 100) / 100);
}

export function buildMenuItemPricingMap(categories: CategoryWithItems[]): Map<string, MenuItemPricingFields & { name: string }> {
  const map = new Map<string, MenuItemPricingFields & { name: string }>();
  for (const category of categories) {
    for (const item of category.menu_items) {
      map.set(item.id, {
        ...item,
        category_id: category.id,
        name: item.name,
      });
    }
  }
  return map;
}

export function validateOrderLinesPricing(
  lines: OrderLineInput[],
  menuById: Map<string, MenuItemPricingFields & { name: string }>,
): { ok: true; subtotal: number } | { ok: false; error: string } {
  let subtotal = 0;

  for (const line of lines) {
    const menuItemId = line.menuItemId?.trim();
    let item: (MenuItemPricingFields & { name: string }) | undefined;

    if (menuItemId) {
      item = menuById.get(menuItemId);
    }
    if (!item) {
      item = [...menuById.values()].find((candidate) => candidate.name === line.name);
    }
    if (!item) {
      return { ok: false, error: "One or more items are no longer available. Please refresh and try again." };
    }

    const expected = computeExpectedLineUnitPrice(item, line);
    if (Math.abs(expected - Number(line.unitPrice)) > 0.02) {
      return { ok: false, error: "Item prices changed. Please refresh your cart and try again." };
    }

    subtotal += Number(line.qty) * expected;
  }

  return { ok: true, subtotal: Math.round(subtotal * 100) / 100 };
}

export const PROMOTION_SCOPE_LABELS: Record<PromotionScope, string> = {
  store: "Whole store",
  category: "Section",
  brand: "Brand",
  item: "Item",
};

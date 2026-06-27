import type { CategoryWithItems } from "@/lib/data";
import type { PaymentCurrency } from "@/lib/payment-note";
import {
  getEffectiveFlatPrice,
  getEffectivePricePerKg,
  getListFlatPrice,
  getListPricePerKg,
  type MenuItemPricingFields,
} from "@/lib/menu-promotions";

type MenuItem = CategoryWithItems["menu_items"][number] & MenuItemPricingFields;

export function isSoldByWeightItem(item: MenuItem): boolean {
  return Boolean(item.sold_by_weight);
}

/** Lowest typical order cost in USD (base item, no add-ons). */
export function getItemBudgetPriceUsd(item: MenuItem): number {
  if (isSoldByWeightItem(item)) {
    const perKg = getEffectivePricePerKg(item);
    const step = Number(item.weight_step_kg ?? 0.25);
    return Math.max(0, perKg * (step > 0 ? step : 0.25));
  }
  return getEffectiveFlatPrice(item);
}

export function getItemListBudgetPriceUsd(item: MenuItem): number {
  if (isSoldByWeightItem(item)) {
    const perKg = getListPricePerKg(item);
    const step = Number(item.weight_step_kg ?? 0.25);
    return Math.max(0, perKg * (step > 0 ? step : 0.25));
  }
  return getListFlatPrice(item);
}
export function budgetAmountToUsd(
  amount: number | null,
  currency: PaymentCurrency,
  lbpRate: number,
): number | null {
  if (amount == null || !Number.isFinite(amount) || amount <= 0) return null;
  if (currency === "usd") return amount;
  if (!lbpRate || lbpRate <= 0) return null;
  return Math.round((amount / lbpRate) * 100) / 100;
}

export function itemFitsBudget(item: MenuItem, budgetUsd: number): boolean {
  return getItemBudgetPriceUsd(item) <= budgetUsd;
}

export function filterCategoriesByBudget(
  categories: CategoryWithItems[],
  budgetUsd: number | null,
): CategoryWithItems[] {
  if (budgetUsd == null) return categories;
  return categories
    .map((category) => ({
      ...category,
      menu_items: category.menu_items.filter((item) => itemFitsBudget(item, budgetUsd)),
    }))
    .filter((category) => category.menu_items.length > 0);
}

export const BUDGET_QUICK_USD = [5, 10, 15, 20, 30] as const;
export const BUDGET_QUICK_LBP = [500_000, 1_000_000, 1_300_000, 2_000_000, 3_000_000] as const;

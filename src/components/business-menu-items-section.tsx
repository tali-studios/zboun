import type { ReactNode } from "react";
import Link from "next/link";
import {
  deleteMenuItemAction,
  toggleMenuItemAvailabilityAction,
  updateMenuItemAction,
} from "@/app-actions/restaurant";
import { AddMenuItemForm } from "@/components/add-menu-item-form";
import { BusinessMenuItemsToolbar } from "@/components/business-menu-items-toolbar";
import { ConfirmDeleteForm } from "@/components/confirm-delete-form";
import { ImageUploadField } from "@/components/image-upload-field";
import { IngredientListField } from "@/components/ingredient-list-field";
import { MenuItemEditForm } from "@/components/menu-item-edit-form";
import { MenuItemOptionsFields } from "@/components/menu-item-options-fields";
import { MenuItemPricingFields } from "@/components/menu-item-pricing-fields";
import { MenuItemStockFields } from "@/components/menu-item-stock-fields";
import { MenuItemStockQuickEdit } from "@/components/menu-item-stock-quick-edit";
import { MenuNutritionFields } from "@/components/menu-nutrition-fields";
import { BROWSE_SECTION_ICONS, type BrowseSection } from "@/lib/browse-sections";
import { MENU_ITEMS_ADMIN_PAGE_SIZE } from "@/lib/dashboard-admin";
import {
  buildMenuItemsListHref,
  type AdminMenuBrand,
  type AdminMenuItemRow,
} from "@/lib/menu-items-admin-data";
import { resolveMenuItemBrandId } from "@/lib/menu-brands";
import { getMenuItemStockAlertLevel, isMenuItemLowStock } from "@/lib/menu-item-stock";
import { stockAlertBadgeClass, stockAlertBadgeLabel } from "@/lib/menu-item-stock-alerts";
import { normalizeOptionGroups, parseVariantStockMap, buildVariantKey, listVariantCombinations, formatSelectedOptionsDisplay, resolveOptionColorImageUrl } from "@/lib/menu-item-options";
import { resolveColorSwatch } from "@/lib/color-swatches";
import { ITEM_AUDIENCES, ITEM_AUDIENCE_LABELS, itemAudienceLabel } from "@/lib/item-audience";
import type { MenuItemsSort } from "@/lib/menu-items-admin";
import type { StoreItemProfile } from "@/lib/store-item-profile";

function FormFieldLabel({
  children,
  required,
  optional,
}: {
  children: ReactNode;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
      {required ? (
        <>
          {" "}
          <span className="text-red-600" aria-hidden="true">*</span>
          <span className="sr-only">Required.</span>
        </>
      ) : null}
      {optional ? <span className="ml-1 font-normal normal-case text-slate-500">(optional)</span> : null}
    </span>
  );
}

type Category = { id: string; name: string };

type StockTableRow =
  | { kind: "simple"; item: AdminMenuItemRow }
  | {
      kind: "variant";
      item: AdminMenuItemRow;
      variantKey: string;
      variantLabel: string;
      qty: number;
      imageUrl: string | null;
      colorSwatch: string | null;
    };

function isColorLikeOptionLabel(label: string) {
  return /\b(color|colour|colors|colours|shade|tone)\b/i.test(label.trim());
}

function buildStockTableRows(item: AdminMenuItemRow): StockTableRow[] {
  const groups = normalizeOptionGroups(item.option_label, item.option_values);
  const combos = listVariantCombinations(groups);
  if (!item.track_stock || groups.length === 0 || combos.length === 0) {
    return [{ kind: "simple", item }];
  }
  const stocks = parseVariantStockMap(item.option_variant_stock);
  const colorGroup = groups.find((g) => isColorLikeOptionLabel(g.label));
  return combos.map((combo, index) => {
    const variantKey = buildVariantKey(groups, combo) ?? `${index}`;
    const colorName = colorGroup ? String(combo[colorGroup.label] ?? "").trim() : "";
    return {
      kind: "variant" as const,
      item,
      variantKey,
      variantLabel: formatSelectedOptionsDisplay(groups, combo) || variantKey,
      qty: Math.max(0, Math.floor(Number(stocks[variantKey] ?? 0))),
      imageUrl: resolveOptionColorImageUrl(groups, combo, item.image_url) ?? item.image_url ?? null,
      colorSwatch: colorName ? resolveColorSwatch(colorName).background : null,
    };
  });
}

function stockRowQuantity(row: StockTableRow): number {
  if (row.kind === "variant") return row.qty;
  if (!row.item.track_stock) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.floor(Number(row.item.stock_quantity ?? 0)));
}

/** Flatten size×color rows; when sorting by stock, order by each row's qty (not product total). */
function buildDisplayStockRows(items: AdminMenuItemRow[], sort: MenuItemsSort): StockTableRow[] {
  const rows = items.flatMap((item) => buildStockTableRows(item));
  if (sort === "stock_asc" || sort === "stock_desc") {
    rows.sort((a, b) => {
      const aQty = a.item.track_stock ? stockRowQuantity(a) : sort === "stock_asc" ? Number.POSITIVE_INFINITY : -1;
      const bQty = b.item.track_stock ? stockRowQuantity(b) : sort === "stock_asc" ? Number.POSITIVE_INFINITY : -1;
      if (sort === "stock_asc") {
        if (!a.item.is_available && b.item.is_available) return -1;
        if (a.item.is_available && !b.item.is_available) return 1;
        return aQty - bQty || a.item.name.localeCompare(b.item.name);
      }
      return bQty - aQty || a.item.name.localeCompare(b.item.name);
    });
  }
  return rows;
}

type Props = {
  categories: Category[];
  menuBrands: AdminMenuBrand[];
  itemProfile: StoreItemProfile;
  itemProfileBadgeSections: BrowseSection[];
  sortedItems: AdminMenuItemRow[];
  pagedItems: AdminMenuItemRow[];
  menuItemsLowStockCount: number;
  categoryNameById: Map<string, string>;
  initialQ: string;
  selectedCategory: string;
  selectedStock: string;
  selectedAudience?: string;
  selectedBrand?: string;
  selectedSort: MenuItemsSort;
  normalizedItemsCount: number;
  itemsSafePage: number;
  itemsTotalPages: number;
  listHrefBase: {
    q: string;
    category: string;
    stock: string;
    audience?: string;
    brand?: string;
    sort: MenuItemsSort;
  };
  lbpRate?: number;
};

export function BusinessMenuItemsSection({
  categories,
  menuBrands,
  itemProfile,
  itemProfileBadgeSections,
  sortedItems,
  pagedItems,
  menuItemsLowStockCount,
  categoryNameById,
  initialQ,
  selectedCategory,
  selectedStock,
  selectedAudience = "",
  selectedBrand = "",
  selectedSort,
  normalizedItemsCount,
  itemsSafePage,
  itemsTotalPages,
  listHrefBase,
  lbpRate = 89500,
}: Props) {
  return (
    <>
        <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-[#faf9ff] to-white p-5 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Add {itemProfile.isFoodLike ? "menu item" : "catalog item"}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Fill in the essentials, then expand optional sections for more detail — fields below match your store&apos;s categories.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
              {itemProfileBadgeSections.map((section) => (
                <span
                  key={section}
                  className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-bold text-violet-700"
                >
                  {BROWSE_SECTION_ICONS[section]} {section}
                </span>
              ))}
            </div>
          </div>
          <AddMenuItemForm
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            brands={menuBrands}
            profile={itemProfile}
            lbpRate={lbpRate}
          />
        </section>

        <section className="panel overflow-hidden p-0 md:p-0">
          <div className="border-b border-slate-200 px-4 py-4 md:px-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2.5 text-2xl font-bold text-slate-900" id="items-toolbar">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                      <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
                    </svg>
                  </span>
                  {itemProfile.isFoodLike ? "Menu items" : "Catalog"}
                </h2>
                <p className="mt-1.5 text-sm text-slate-500">
                  Search, filter, and update stock directly — each size & color appears on its own row.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                  {normalizedItemsCount} item{normalizedItemsCount !== 1 ? "s" : ""}
                </span>
                {menuItemsLowStockCount > 0 && (
                  <Link
                    href={buildMenuItemsListHref({ stock: "low" })}
                    className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-100"
                  >
                    ⚠ {menuItemsLowStockCount} low stock
                  </Link>
                )}
              </div>
            </div>
          </div>

          <BusinessMenuItemsToolbar
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            brands={menuBrands.map((b) => ({ id: b.id, name: b.name }))}
            initialQ={initialQ}
            initialCategory={selectedCategory}
            initialStock={selectedStock}
            initialAudience={selectedAudience}
            initialBrand={selectedBrand}
            initialSort={selectedSort}
            totalCount={normalizedItemsCount}
            filteredCount={sortedItems.length}
            showAudienceFilter={itemProfile.audienceTag}
          />

          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-sm md:min-w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Item</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Section</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Price</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    Stock qty
                    <span className="ml-1.5 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 normal-case tracking-normal">
                      editable
                    </span>
                  </th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {buildDisplayStockRows(pagedItems, selectedSort).map((stockRow, rowIdx) => {
                  const item = stockRow.item;
                  const alertLevel = getMenuItemStockAlertLevel(item);
                  const rowBg = rowIdx % 2 === 0 ? "bg-white" : "bg-slate-50/40";
                  const isVariant = stockRow.kind === "variant";
                  const rowKey = isVariant ? `${item.id}__${stockRow.variantKey}` : item.id;
                  const actionId = rowKey.replace(/[^a-zA-Z0-9_-]/g, "_");
                  const thumbUrl = isVariant ? stockRow.imageUrl : item.image_url;
                  return (
                  <tr key={rowKey} className={`${rowBg} transition-colors hover:bg-violet-50/30`}>
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="relative h-10 w-10 shrink-0">
                          {thumbUrl ? (
                            <img
                              src={thumbUrl}
                              alt=""
                              className="h-10 w-10 rounded-xl object-cover shadow-sm ring-1 ring-slate-200"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">
                              🍽️
                            </div>
                          )}
                          {isVariant && stockRow.colorSwatch ? (
                            <span
                              className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-md border border-white shadow-sm ring-1 ring-slate-200"
                              style={{ background: stockRow.colorSwatch }}
                              title={stockRow.variantLabel}
                              aria-hidden
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 leading-snug">{item.name}</p>
                          {isVariant ? (
                            <span className="mt-0.5 inline-block rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                              {stockRow.variantLabel}
                            </span>
                          ) : null}
                          {itemAudienceLabel(item.audience) ? (
                            <span className="ml-1 mt-0.5 inline-block rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                              {itemAudienceLabel(item.audience)}
                            </span>
                          ) : null}
                          {item.brand_name ? (
                            <span className="ml-1 mt-0.5 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                              {item.brand_name}
                            </span>
                          ) : null}
                          {!item.is_available ? (
                            <span className="ml-1 mt-0.5 inline-block rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                              Out of stock
                            </span>
                          ) : alertLevel && alertLevel !== "ok" ? (
                            <span className={`ml-1 mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${stockAlertBadgeClass(alertLevel)}`}>
                              {stockAlertBadgeLabel(item)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {categoryNameById.get(item.category_id ?? "") ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-900">${item.price.toFixed(2)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <MenuItemStockQuickEdit
                        itemId={item.id}
                        itemName={isVariant ? `${item.name} · ${stockRow.variantLabel}` : item.name}
                        trackStock={Boolean(item.track_stock)}
                        stockQuantity={isVariant ? stockRow.qty : (item.stock_quantity ?? null)}
                        warningQty={item.stock_alert_warning_qty}
                        urgentQty={item.stock_alert_urgent_qty}
                        criticalQty={item.stock_alert_critical_qty}
                        variantKey={isVariant ? stockRow.variantKey : null}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-nowrap items-center gap-1.5">

                        {/* EDIT */}
                        <div className="relative">
                          <input id={`edit-${actionId}`} type="checkbox" className="peer hidden" />
                          <label
                            htmlFor={`edit-${actionId}`}
                            aria-label="Edit item"
                            title="Edit this item"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-violet-600 transition hover:bg-violet-100 hover:text-violet-800"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </label>
                          <div className="pointer-events-none fixed inset-0 z-40 hidden items-center justify-center bg-slate-900/50 p-4 peer-checked:flex peer-checked:pointer-events-auto">
                            <label htmlFor={`edit-${actionId}`} className="absolute inset-0 cursor-pointer" />
                            <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-4 shadow-xl sm:p-5">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1 pr-2">
                                  <h3 className="text-lg font-bold text-slate-900">Edit: {item.name}</h3>
                                  <p className="mt-1 text-sm text-slate-600">
                                    Section: {categoryNameById.get(item.category_id ?? "") ?? "Uncategorized"}
                                  </p>
                                </div>
                                <label
                                  htmlFor={`edit-${actionId}`}
                                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-800"
                                  aria-label="Close"
                                  title="Close"
                                >
                                  <span className="text-2xl leading-none" aria-hidden>
                                    ×
                                  </span>
                                </label>
                              </div>
                              <MenuItemEditForm
                                action={updateMenuItemAction}
                                className="mt-4 grid gap-3 md:grid-cols-2"
                                itemProfile={itemProfile}
                                brandRequired={itemProfile.brandRequired && menuBrands.length > 0}
                              >
                                <input type="hidden" name="id" value={item.id} />
                                <input type="hidden" name="current_image_url" value={item.image_url ?? ""} />

                                {/* — Identity — */}
                                <label className="space-y-1">
                                  <FormFieldLabel required>Section</FormFieldLabel>
                                  <select name="category_id" required defaultValue={item.category_id ?? ""} className="ui-select">
                                    {categories.map((category) => (
                                      <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                  </select>
                                </label>
                                <label className="space-y-1">
                                  <FormFieldLabel required>Item name</FormFieldLabel>
                                  <input name="name" required defaultValue={item.name} placeholder="Item name" className="ui-input" />
                                </label>
                                <label className="space-y-1">
                                  <FormFieldLabel required={itemProfile.brandRequired && menuBrands.length > 0} optional={!(itemProfile.brandRequired && menuBrands.length > 0)}>
                                    Brand
                                  </FormFieldLabel>
                                  <select
                                    name="brand_id"
                                    required={itemProfile.brandRequired && menuBrands.length > 0}
                                    defaultValue={resolveMenuItemBrandId(item, menuBrands)}
                                    className="ui-select"
                                  >
                                    <option value="">
                                      {itemProfile.brandRequired && menuBrands.length > 0 ? "Choose brand…" : "No brand"}
                                    </option>
                                    {menuBrands.map((brand) => (
                                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                                    ))}
                                  </select>
                                </label>
                                {itemProfile.audienceTag ? (
                                  <label className="space-y-1">
                                    <FormFieldLabel optional>Designed for</FormFieldLabel>
                                    <select
                                      name="audience"
                                      defaultValue={item.audience ?? ""}
                                      className="ui-select"
                                    >
                                      <option value="">Anyone</option>
                                      {ITEM_AUDIENCES.map((value) => (
                                        <option key={value} value={value}>
                                          {ITEM_AUDIENCE_LABELS[value]}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                ) : (
                                  <input type="hidden" name="audience" value="" />
                                )}
                                <label className="space-y-1 md:col-span-2">
                                  <FormFieldLabel optional>Description</FormFieldLabel>
                                  <input name="description" defaultValue={item.description ?? ""} placeholder="Description" className="ui-input" />
                                </label>

                                {/* — Pricing — */}
                                <div className="md:col-span-2">
                                  <MenuItemPricingFields
                                    idPrefix={`edit-${actionId}-qty`}
                                    defaultPrice={item.price}
                                    defaultGrams={item.grams}
                                    defaultDisplayQuantity={item.display_quantity}
                                    defaultDisplayUnit={item.display_unit}
                                    defaultSoldByWeight={Boolean((item as { sold_by_weight?: boolean }).sold_by_weight)}
                                    defaultPricePerKg={(item as { price_per_kg?: number | null }).price_per_kg}
                                    defaultWeightStepKg={(item as { weight_step_kg?: number | null }).weight_step_kg}
                                    showDisplayQuantity={itemProfile.displayQuantity}
                                    showWeightPricing={itemProfile.weightPricing}
                                    lbpRate={lbpRate}
                                    electronicsPricing={itemProfile.isElectronicsLike}
                                  />
                                </div>

                                {/* — Contents / materials / nutrition — */}
                                {(itemProfile.contents || itemProfile.nutrition) ? (
                                  <>
                                    {itemProfile.contents ? (
                                      <label className="space-y-1 md:col-span-2">
                                        <FormFieldLabel optional>
                                          {itemProfile.isFashionLike
                                            ? "Materials / fabric"
                                            : itemProfile.isFoodLike
                                              ? "Contains / ingredients"
                                              : "Ingredients / contents"}
                                        </FormFieldLabel>
                                        <input
                                          name="contents"
                                          defaultValue={item.contents ?? ""}
                                          placeholder={
                                            itemProfile.isFashionLike
                                              ? "e.g. 100% cotton, Linen blend"
                                              : "e.g. wheat, milk, sesame"
                                          }
                                          className="ui-input"
                                        />
                                      </label>
                                    ) : (
                                      <input type="hidden" name="contents" value={item.contents ?? ""} />
                                    )}
                                    {itemProfile.nutrition && (
                                      <div className="md:col-span-2">
                                        <MenuNutritionFields
                                          idPrefix={`edit-${actionId}-nutrition`}
                                          defaultCalories={item.calories}
                                          defaultProteinG={item.protein_g}
                                        />
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <input type="hidden" name="contents" value={item.contents ?? ""} />
                                )}

                                {/* — Product options + inventory — */}
                                {itemProfile.productOptions ? (
                                  <div className="md:col-span-2 space-y-3">
                                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
                                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden>
                                          <path d="M4 7h16M4 12h10M4 17h7" />
                                        </svg>
                                      </span>
                                      {itemProfile.isFashionLike
                                        ? "Sizes, colors & inventory"
                                        : itemProfile.isElectronicsLike
                                          ? "Options, colors, prices & photos"
                                          : "Variants & inventory"}
                                    </p>
                                    <MenuItemOptionsFields
                                      idPrefix={`edit-${actionId}-`}
                                      includeStockPanel
                                      hints={itemProfile.optionHints}
                                      defaultGroups={normalizeOptionGroups(
                                        item.option_label,
                                        item.option_values,
                                      )}
                                      defaultVariantStock={parseVariantStockMap(
                                        item.option_variant_stock,
                                      )}
                                      defaultVariantPrices={
                                        item.option_variant_prices &&
                                        typeof item.option_variant_prices === "object"
                                          ? item.option_variant_prices
                                          : {}
                                      }
                                      defaultTrackStock={Boolean(item.track_stock)}
                                      defaultStockQuantity={item.stock_quantity}
                                      defaultWarningQty={item.stock_alert_warning_qty}
                                      defaultUrgentQty={item.stock_alert_urgent_qty}
                                      defaultCriticalQty={item.stock_alert_critical_qty}
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <div className="md:col-span-2">
                                      <MenuItemStockFields
                                        idPrefix={`edit-stock-${actionId}-`}
                                        defaultTrackStock={Boolean(item.track_stock)}
                                        defaultStockQuantity={item.stock_quantity}
                                        defaultWarningQty={item.stock_alert_warning_qty}
                                        defaultUrgentQty={item.stock_alert_urgent_qty}
                                        defaultCriticalQty={item.stock_alert_critical_qty}
                                      />
                                    </div>
                                    <input type="hidden" name="option_label" value={item.option_label ?? ""} />
                                    <input
                                      type="hidden"
                                      name="option_values"
                                      value={JSON.stringify(
                                        normalizeOptionGroups(item.option_label, item.option_values),
                                      )}
                                    />
                                    <input
                                      type="hidden"
                                      name="option_variant_stock"
                                      value={JSON.stringify(
                                        parseVariantStockMap(item.option_variant_stock),
                                      )}
                                    />
                                  </>
                                )}

                                {/* — Ingredient customization — only for categories where dish-style customization applies — */}
                                {itemProfile.ingredientCustomization ? (
                                  <>
                                    <IngredientListField
                                      name="removable_ingredients"
                                      label={`Remove (${categoryNameById.get(item.category_id ?? "") ?? "section"})`}
                                      defaultItems={(item.removable_ingredients ?? [])
                                        .filter((entry): entry is { name: string } =>
                                          Boolean(entry && typeof entry.name === "string" && entry.name.trim()))
                                        .map((entry) => ({ name: entry.name }))}
                                    />
                                    <IngredientListField
                                      name="add_ingredients"
                                      label="Add-ons (extra price per line)"
                                      withPrice
                                      defaultItems={(item.add_ingredients ?? [])
                                        .filter((entry): entry is { name: string; price?: number } =>
                                          Boolean(entry && typeof entry.name === "string" && entry.name.trim()))
                                        .map((entry) => ({
                                          name: entry.name,
                                          price: Number.isFinite(Number(entry.price)) ? Number(entry.price) : 0,
                                        }))}
                                    />
                                  </>
                                ) : (
                                  <>
                                    <input type="hidden" name="removable_ingredients" value="[]" />
                                    <input type="hidden" name="add_ingredients" value="[]" />
                                  </>
                                )}

                                {/* — Image — */}
                                {!itemProfile.productOptions ||
                                !(itemProfile.isFashionLike || itemProfile.isElectronicsLike) ? (
                                  <div className="md:col-span-2">
                                    <ImageUploadField
                                      name="image_file"
                                      initialImageUrl={item.image_url}
                                      label="Item image"
                                    />
                                  </div>
                                ) : null}
                                <div className="md:col-span-2 space-y-2 border-t border-slate-100 pt-3">
                                  <button type="submit" className="btn btn-primary w-full rounded-xl py-3">
                                    Save changes
                                  </button>
                                  <label
                                    htmlFor={`edit-${actionId}`}
                                    title="Close"
                                    className="btn btn-danger w-full cursor-pointer"
                                  >
                                    Close
                                  </label>
                                </div>
                              </MenuItemEditForm>
                            </div>
                          </div>
                        </div>

                        <ConfirmDeleteForm
                          action={deleteMenuItemAction}
                          heading="Delete item?"
                          message={`Please confirm deleting “${item.name}”. This cannot be undone.`}
                          confirmLabel="Yes, delete"
                          triggerTitle="Delete this item"
                          triggerAriaLabel="Delete item"
                          triggerClassName="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-700"
                          hiddenFields={<input type="hidden" name="id" value={item.id} />}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </ConfirmDeleteForm>

                        <div className="relative">
                          <input id={`stock-${actionId}`} type="checkbox" className="peer hidden" />
                          <label
                            htmlFor={`stock-${actionId}`}
                            aria-label={item.is_available ? "Mark out of stock" : "Mark in stock"}
                            title={item.is_available ? "Mark as out of stock" : "Mark as in stock"}
                            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition ${
                              item.is_available
                                ? "border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-800"
                                : "border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-800"
                            }`}
                          >
                            {item.is_available ? (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            ) : (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </label>
                          <div className="pointer-events-none fixed inset-0 z-40 hidden items-center justify-center bg-slate-900/50 p-4 peer-checked:flex peer-checked:pointer-events-auto">
                            <label htmlFor={`stock-${actionId}`} className="absolute inset-0 cursor-pointer" />
                            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-4 shadow-xl sm:p-5">
                              <h3 className="text-lg font-bold text-slate-900">Confirm stock change</h3>
                              <p className="mt-2 text-sm text-slate-600">
                                {item.is_available
                                  ? `Mark ${item.name} as out of stock?`
                                  : `Mark ${item.name} as in stock?`}
                              </p>
                              <div className="mt-4 flex justify-end gap-2">
                                <label htmlFor={`stock-${actionId}`} className="inline-flex cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                  Cancel
                                </label>
                                <form action={toggleMenuItemAvailabilityAction}>
                                  <input type="hidden" name="id" value={item.id} />
                                  <input type="hidden" name="is_available" value={String(item.is_available)} />
                                  <button className="inline-flex rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
                                    Confirm
                                  </button>
                                </form>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            {sortedItems.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <span className="text-4xl">📦</span>
                <p className="text-sm font-medium text-slate-500">No items match your current filters.</p>
              </div>
            ) : null}
          </div>
          {sortedItems.length > MENU_ITEMS_ADMIN_PAGE_SIZE ? (
            <div className="mt-0 flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 md:px-5">
              {itemsSafePage > 1 ? (
                <Link
                  href={buildMenuItemsListHref({ ...listHrefBase, page: itemsSafePage - 1 })}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-300">
                  Previous
                </span>
              )}
              <span className="text-xs font-medium text-slate-500">
                Page {itemsSafePage} of {itemsTotalPages}
              </span>
              {itemsSafePage < itemsTotalPages ? (
                <Link
                  href={buildMenuItemsListHref({ ...listHrefBase, page: itemsSafePage + 1 })}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Next
                </Link>
              ) : (
                <span className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-300">
                  Next
                </span>
              )}
            </div>
          ) : null}
        </section>

    </>
  );
}

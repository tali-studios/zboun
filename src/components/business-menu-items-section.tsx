import type { ReactNode } from "react";
import Link from "next/link";
import {
  deleteMenuItemAction,
  toggleMenuItemAvailabilityAction,
  updateMenuItemAction,
} from "@/app-actions/restaurant";
import { AddMenuItemForm } from "@/components/add-menu-item-form";
import { BusinessMenuItemsToolbar } from "@/components/business-menu-items-toolbar";
import { ImageUploadField } from "@/components/image-upload-field";
import { IngredientListField } from "@/components/ingredient-list-field";
// Temporarily hidden — option type / values UI
// import { MenuItemOptionsFields } from "@/components/menu-item-options-fields";
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
  selectedSort: MenuItemsSort;
  normalizedItemsCount: number;
  itemsSafePage: number;
  itemsTotalPages: number;
  listHrefBase: { q: string; category: string; stock: string; sort: MenuItemsSort };
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
  selectedSort,
  normalizedItemsCount,
  itemsSafePage,
  itemsTotalPages,
  listHrefBase,
}: Props) {
  return (
    <>
        <section className="rounded-2xl border border-violet-100 bg-gradient-to-br from-[#faf9ff] to-white p-5 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Add {itemProfile.isFoodLike ? "menu item" : "store item"}
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
          />
        </section>

        <section className="panel overflow-hidden p-0 md:p-0">
          <div className="border-b border-slate-200 px-4 py-4 md:px-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="panel-title" id="items-toolbar">
                  {itemProfile.isFoodLike ? "Menu items" : "Store items"}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Search, filter, and update stock directly in the table — click any quantity to edit it.
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
            initialQ={initialQ}
            initialCategory={selectedCategory}
            initialStock={selectedStock}
            initialSort={selectedSort}
            totalCount={normalizedItemsCount}
            filteredCount={sortedItems.length}
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
                {pagedItems.map((item, idx) => {
                  const alertLevel = getMenuItemStockAlertLevel(item);
                  const rowBg = idx % 2 === 0 ? "bg-white" : "bg-slate-50/40";
                  return (
                  <tr key={item.id} className={`${rowBg} transition-colors hover:bg-violet-50/30`}>
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg">
                            🍽️
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 leading-snug">{item.name}</p>
                          {item.brand_name ? (
                            <span className="mt-0.5 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
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
                        itemName={item.name}
                        trackStock={Boolean(item.track_stock)}
                        stockQuantity={item.stock_quantity ?? null}
                        warningQty={item.stock_alert_warning_qty}
                        urgentQty={item.stock_alert_urgent_qty}
                        criticalQty={item.stock_alert_critical_qty}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-nowrap items-center gap-1.5">

                        {/* EDIT */}
                        <div className="relative">
                          <input id={`edit-${item.id}`} type="checkbox" className="peer hidden" />
                          <label
                            htmlFor={`edit-${item.id}`}
                            aria-label="Edit item"
                            title="Edit this item"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-violet-200 bg-violet-50 text-violet-600 transition hover:bg-violet-100 hover:text-violet-800"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </label>
                          <div className="pointer-events-none fixed inset-0 z-40 hidden items-center justify-center bg-slate-900/50 p-4 peer-checked:flex peer-checked:pointer-events-auto">
                            <label htmlFor={`edit-${item.id}`} className="absolute inset-0 cursor-pointer" />
                            <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-4 shadow-xl sm:p-5">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1 pr-2">
                                  <h3 className="text-lg font-bold text-slate-900">Edit: {item.name}</h3>
                                  <p className="mt-1 text-sm text-slate-600">
                                    Section: {categoryNameById.get(item.category_id ?? "") ?? "Uncategorized"}
                                  </p>
                                </div>
                                <label
                                  htmlFor={`edit-${item.id}`}
                                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-800"
                                  aria-label="Close"
                                  title="Close"
                                >
                                  <span className="text-2xl leading-none" aria-hidden>
                                    ×
                                  </span>
                                </label>
                              </div>
                              <form action={updateMenuItemAction} className="mt-4 grid gap-3 md:grid-cols-2">
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
                                  <FormFieldLabel optional>Brand</FormFieldLabel>
                                  <select name="brand_id" defaultValue={resolveMenuItemBrandId(item, menuBrands)} className="ui-select">
                                    <option value="">No brand</option>
                                    {menuBrands.map((brand) => (
                                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                                    ))}
                                  </select>
                                </label>
                                <label className="space-y-1 md:col-span-2">
                                  <FormFieldLabel optional>Description</FormFieldLabel>
                                  <input name="description" defaultValue={item.description ?? ""} placeholder="Description" className="ui-input" />
                                </label>

                                {/* — Pricing — */}
                                <div className="md:col-span-2">
                                  <MenuItemPricingFields
                                    idPrefix={`edit-${item.id}-qty`}
                                    defaultPrice={item.price}
                                    defaultGrams={item.grams}
                                    defaultDisplayQuantity={item.display_quantity}
                                    defaultDisplayUnit={item.display_unit}
                                    defaultSoldByWeight={Boolean((item as { sold_by_weight?: boolean }).sold_by_weight)}
                                    defaultPricePerKg={(item as { price_per_kg?: number | null }).price_per_kg}
                                    defaultWeightStepKg={(item as { weight_step_kg?: number | null }).weight_step_kg}
                                  />
                                </div>

                                {/* — Contents & nutrition — only for categories where it applies — */}
                                {(itemProfile.contents || itemProfile.nutrition) ? (
                                  <>
                                    {itemProfile.contents ? (
                                      <label className="space-y-1 md:col-span-2">
                                        <FormFieldLabel optional>
                                          {itemProfile.isFoodLike ? "Contains / ingredients" : "Ingredients / contents"}
                                        </FormFieldLabel>
                                        <input name="contents" defaultValue={item.contents ?? ""} placeholder="e.g. wheat, milk, sesame" className="ui-input" />
                                      </label>
                                    ) : (
                                      <input type="hidden" name="contents" value={item.contents ?? ""} />
                                    )}
                                    {itemProfile.nutrition && (
                                      <div className="md:col-span-2">
                                        <MenuNutritionFields
                                          idPrefix={`edit-${item.id}-nutrition`}
                                          defaultCalories={item.calories}
                                          defaultProteinG={item.protein_g}
                                        />
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <input type="hidden" name="contents" value={item.contents ?? ""} />
                                )}

                                {/* — Stock — */}
                                <div className="md:col-span-2">
                                  <MenuItemStockFields
                                    idPrefix={`edit-stock-${item.id}-`}
                                    defaultTrackStock={Boolean(item.track_stock)}
                                    defaultStockQuantity={item.stock_quantity}
                                    defaultWarningQty={item.stock_alert_warning_qty}
                                    defaultUrgentQty={item.stock_alert_urgent_qty}
                                    defaultCriticalQty={item.stock_alert_critical_qty}
                                  />
                                </div>

                                {/* Option type / values UI temporarily hidden — keep existing values on save */}
                                <input type="hidden" name="option_label" value={item.option_label ?? ""} />
                                <input
                                  type="hidden"
                                  name="option_values"
                                  value={JSON.stringify(
                                    (item.option_values ?? [])
                                      .filter((entry): entry is { name: string; price?: number } =>
                                        Boolean(entry && typeof entry.name === "string" && entry.name.trim()))
                                      .map((entry) => ({
                                        name: entry.name,
                                        price: Number.isFinite(Number(entry.price)) ? Number(entry.price) : 0,
                                      })),
                                  )}
                                />

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
                                <div className="md:col-span-2">
                                  <ImageUploadField name="image_file" initialImageUrl={item.image_url} label="Update image" optional />
                                </div>
                                <div className="md:col-span-2 space-y-2 border-t border-slate-100 pt-3">
                                  <button type="submit" className="btn btn-primary w-full rounded-xl py-3">
                                    Save changes
                                  </button>
                                  <label
                                    htmlFor={`edit-${item.id}`}
                                    title="Close"
                                    className="btn btn-danger w-full cursor-pointer"
                                  >
                                    Close
                                  </label>
                                </div>
                              </form>
                            </div>
                          </div>
                        </div>

                        <div className="relative">
                          <input id={`delete-${item.id}`} type="checkbox" className="peer hidden" />
                          <label
                            htmlFor={`delete-${item.id}`}
                            aria-label="Delete item"
                            title="Delete this item"
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-700"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </label>
                          <div className="pointer-events-none fixed inset-0 z-40 hidden items-center justify-center bg-slate-900/50 p-4 peer-checked:flex peer-checked:pointer-events-auto">
                            <label htmlFor={`delete-${item.id}`} className="absolute inset-0 cursor-pointer" />
                            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-4 shadow-xl sm:p-5">
                              <h3 className="text-lg font-bold text-slate-900">Delete item?</h3>
                              <p className="mt-2 text-sm text-slate-600">
                                Please confirm deleting <span className="font-semibold">{item.name}</span>. This cannot be undone.
                              </p>
                              <div className="mt-4 flex justify-end gap-2">
                                <label htmlFor={`delete-${item.id}`} className="inline-flex cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                  Cancel
                                </label>
                                <form action={deleteMenuItemAction}>
                                  <input type="hidden" name="id" value={item.id} />
                                  <button className="inline-flex rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                                    Yes, delete
                                  </button>
                                </form>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="relative">
                          <input id={`stock-${item.id}`} type="checkbox" className="peer hidden" />
                          <label
                            htmlFor={`stock-${item.id}`}
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
                            <label htmlFor={`stock-${item.id}`} className="absolute inset-0 cursor-pointer" />
                            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-4 shadow-xl sm:p-5">
                              <h3 className="text-lg font-bold text-slate-900">Confirm stock change</h3>
                              <p className="mt-2 text-sm text-slate-600">
                                {item.is_available
                                  ? `Mark ${item.name} as out of stock?`
                                  : `Mark ${item.name} as in stock?`}
                              </p>
                              <div className="mt-4 flex justify-end gap-2">
                                <label htmlFor={`stock-${item.id}`} className="inline-flex cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
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

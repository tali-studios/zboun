"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import {
  createMenuPromotionAction,
  deleteMenuPromotionAction,
  toggleMenuPromotionAction,
} from "@/app-actions/menu-promotions";
import {
  isPromotionActive,
  PROMOTION_SCOPE_LABELS,
  type MenuPromotion,
  type PromotionScope,
} from "@/lib/menu-promotions";

type Section = { id: string; name: string };
type Brand = { id: string; name: string };
type MenuItem = { id: string; name: string; category_id: string | null };

type Props = {
  promotions: MenuPromotion[];
  sections: Section[];
  brands: Brand[];
  menuItems: MenuItem[];
};

function formatScopeLabel(
  promotion: MenuPromotion,
  sectionById: Map<string, string>,
  brandById: Map<string, string>,
  itemById: Map<string, string>,
) {
  switch (promotion.scope_type) {
    case "store":
      return "Whole store";
    case "category":
      return `Section: ${sectionById.get(promotion.scope_id ?? "") ?? "Unknown"}`;
    case "brand":
      return `Brand: ${brandById.get(promotion.scope_id ?? "") ?? "Unknown"}`;
    case "item":
      return `Item: ${itemById.get(promotion.scope_id ?? "") ?? "Unknown"}`;
    default:
      return PROMOTION_SCOPE_LABELS[promotion.scope_type];
  }
}

function formatDateRange(promotion: MenuPromotion) {
  if (!promotion.starts_at && !promotion.ends_at) return "Always on (until disabled)";
  const start = promotion.starts_at ? new Date(promotion.starts_at).toLocaleString() : "Now";
  const end = promotion.ends_at ? new Date(promotion.ends_at).toLocaleString() : "No end date";
  return `${start} → ${end}`;
}

export function MenuPromotionsPanel({ promotions, sections, brands, menuItems }: Props) {
  const [scopeType, setScopeType] = useState<PromotionScope>("store");
  const [activeNow, setActiveNow] = useState(true);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [itemSearch, setItemSearch] = useState("");

  const sectionById = useMemo(() => new Map(sections.map((s) => [s.id, s.name])), [sections]);
  const brandById = useMemo(() => new Map(brands.map((b) => [b.id, b.name])), [brands]);
  const itemById = useMemo(() => new Map(menuItems.map((i) => [i.id, i.name])), [menuItems]);

  const scopeOptions = useMemo(() => {
    if (scopeType === "category") return sections;
    if (scopeType === "brand") return brands;
    return [];
  }, [scopeType, sections, brands]);

  const filteredMenuItems = useMemo(() => {
    const query = itemSearch.trim().toLowerCase();
    const sorted = [...menuItems].sort((a, b) => a.name.localeCompare(b.name));
    if (!query) return sorted;
    return sorted.filter((item) => item.name.toLowerCase().includes(query));
  }, [itemSearch, menuItems]);

  function toggleItemSelection(itemId: string) {
    setSelectedItemIds((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId],
    );
  }

  return (
    <section id="promotions" className="panel overflow-x-hidden p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="panel-title">Sales &amp; discounts</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {promotions.length} {promotions.length === 1 ? "sale" : "sales"}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Run percentage-off sales on your whole store, a section, a brand, or one or more items. Customers see
        the sale price on your store page; original prices stay in your admin for when the sale ends.
      </p>

      <form
        action={createMenuPromotionAction}
        className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/40 p-4 sm:p-5"
      >
        <h3 className="text-sm font-bold text-slate-900">Create sale</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label
            className={`block space-y-1 ${scopeType === "item" ? "md:col-span-2" : ""}`}
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Applies to</span>
            <select
              name="scope_type"
              className="ui-select w-full"
              value={scopeType}
              onChange={(e) => {
                setScopeType(e.target.value as PromotionScope);
                setSelectedItemIds([]);
                setItemSearch("");
              }}
              required
            >
              <option value="store">Whole store</option>
              <option value="category">Whole section</option>
              <option value="brand">Whole brand</option>
              <option value="item">Specific items</option>
            </select>
          </label>

          {scopeType === "item" ? (
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Items</span>
                {selectedItemIds.length > 0 ? (
                  <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700">
                    {selectedItemIds.length} selected
                  </span>
                ) : null}
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50/80 p-3">
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      aria-hidden
                    />
                    <input
                      id="promotion-item-search"
                      type="search"
                      value={itemSearch}
                      onChange={(event) => setItemSearch(event.target.value)}
                      placeholder="Search items…"
                      className="ui-input ui-input-search h-10 w-full !min-h-0 rounded-lg border-slate-200 bg-white text-sm shadow-none"
                    />
                  </div>
                </div>

                {selectedItemIds.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 border-b border-violet-100 bg-violet-50/50 px-3 py-2">
                    {selectedItemIds.map((itemId) => (
                      <button
                        key={itemId}
                        type="button"
                        onClick={() => toggleItemSelection(itemId)}
                        className="inline-flex max-w-full items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-violet-800 shadow-sm ring-1 ring-violet-200 transition hover:bg-violet-100"
                      >
                        <span className="truncate">{itemById.get(itemId) ?? "Item"}</span>
                        <span aria-hidden className="text-violet-400">
                          ×
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}

                <ul className="max-h-60 divide-y divide-slate-100 overflow-y-auto">
                  {filteredMenuItems.length ? (
                    filteredMenuItems.map((item) => {
                      const checked = selectedItemIds.includes(item.id);
                      const sectionName = item.category_id
                        ? sectionById.get(item.category_id)
                        : null;
                      return (
                        <li key={item.id}>
                          <label
                            className={`flex cursor-pointer items-center gap-3 px-3 py-3 transition ${
                              checked ? "bg-violet-50/70" : "hover:bg-slate-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              name="scope_id"
                              value={item.id}
                              checked={checked}
                              onChange={() => toggleItemSelection(item.id)}
                              className="sr-only"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-slate-900">{item.name}</p>
                              {sectionName ? (
                                <p className="truncate text-xs text-slate-400">{sectionName}</p>
                              ) : null}
                            </div>
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                                checked
                                  ? "border-violet-600 bg-violet-600 text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                              aria-hidden
                            >
                              {checked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                            </span>
                          </label>
                        </li>
                      );
                    })
                  ) : (
                    <li className="px-4 py-10 text-center text-sm text-slate-400">
                      No items match this search.
                    </li>
                  )}
                </ul>
              </div>
            </div>
          ) : scopeType !== "store" ? (
            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {scopeType === "category" ? "Section" : "Brand"}
              </span>
              <select name="scope_id" className="ui-select w-full" required>
                <option value="">Select…</option>
                {scopeOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <input type="hidden" name="scope_id" value="" />
          )}

          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Discount %</span>
            <input
              name="percent_off"
              type="number"
              min={1}
              max={100}
              step={0.01}
              required
              placeholder="e.g. 15"
              className="ui-input"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Label (optional)</span>
            <input name="label" placeholder="Summer sale" className="ui-input" />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Starts (optional)</span>
            <input name="starts_at" type="datetime-local" className="ui-input" />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ends (optional)</span>
            <input name="ends_at" type="datetime-local" className="ui-input" />
          </label>

          <div
            className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-3 md:col-span-2 transition ${
              activeNow ? "border-emerald-300 bg-emerald-50/80" : "border-slate-200 bg-white"
            }`}
          >
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
              <p className="text-sm font-semibold text-slate-900">Active now</p>
              <p className="text-xs text-slate-500">
                {activeNow
                  ? "Sale applies immediately after you create it."
                  : "Saved as paused — you can enable it later from the list."}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center">
              <button
                type="button"
                role="switch"
                aria-checked={activeNow}
                onClick={() => setActiveNow((value) => !value)}
                className={`inline-flex h-6 w-10 items-center rounded-full border-0 p-0 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${
                  activeNow ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span className="sr-only">{activeNow ? "Active" : "Paused"}</span>
                <span
                  className={`block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    activeNow ? "translate-x-[18px]" : "translate-x-0.5"
                  }`}
                />
              </button>
            </span>
            <input type="hidden" name="is_active" value={activeNow ? "true" : "false"} />
          </div>
        </div>

        <button
          type="submit"
          disabled={scopeType === "item" && selectedItemIds.length === 0}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Create sale{scopeType === "item" && selectedItemIds.length > 1 ? ` (${selectedItemIds.length} items)` : ""}
        </button>
      </form>

      {promotions.length > 0 ? (
        <div className="mt-5 space-y-3">
          {promotions.map((promotion) => {
            const live = isPromotionActive(promotion);
            return (
              <article
                key={promotion.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
                        −{promotion.percent_off}%
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          live ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {live ? "Live" : promotion.is_active ? "Scheduled / ended" : "Paused"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-bold text-slate-900">
                      {promotion.label?.trim() || formatScopeLabel(promotion, sectionById, brandById, itemById)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatScopeLabel(promotion, sectionById, brandById, itemById)}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{formatDateRange(promotion)}</p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <form action={toggleMenuPromotionAction}>
                      <input type="hidden" name="id" value={promotion.id} />
                      <input type="hidden" name="is_active" value={promotion.is_active ? "false" : "true"} />
                      <button
                        type="submit"
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {promotion.is_active ? "Pause" : "Activate"}
                      </button>
                    </form>
                    <form action={deleteMenuPromotionAction}>
                      <input type="hidden" name="id" value={promotion.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          No sales yet. Create one above to show discounted prices to customers.
        </p>
      )}
    </section>
  );
}

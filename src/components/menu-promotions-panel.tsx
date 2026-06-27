"use client";

import { useMemo, useState } from "react";
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

  const sectionById = useMemo(() => new Map(sections.map((s) => [s.id, s.name])), [sections]);
  const brandById = useMemo(() => new Map(brands.map((b) => [b.id, b.name])), [brands]);
  const itemById = useMemo(() => new Map(menuItems.map((i) => [i.id, i.name])), [menuItems]);

  const scopeOptions = useMemo(() => {
    if (scopeType === "category") return sections;
    if (scopeType === "brand") return brands;
    if (scopeType === "item") return menuItems.map((item) => ({ id: item.id, name: item.name }));
    return [];
  }, [scopeType, sections, brands, menuItems]);

  return (
    <section id="promotions" className="panel overflow-x-hidden p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="panel-title">Sales &amp; discounts</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {promotions.length} {promotions.length === 1 ? "sale" : "sales"}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Run percentage-off sales on your whole store, a section, a brand, or a single item. Customers see the sale
        price on your store page; original prices stay in your admin for when the sale ends.
      </p>

      <form
        action={createMenuPromotionAction}
        className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/40 p-4 sm:p-5"
      >
        <h3 className="text-sm font-bold text-slate-900">Create sale</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Applies to</span>
            <select
              name="scope_type"
              className="ui-select"
              value={scopeType}
              onChange={(e) => setScopeType(e.target.value as PromotionScope)}
              required
            >
              <option value="store">Whole store</option>
              <option value="category">Whole section</option>
              <option value="brand">Whole brand</option>
              <option value="item">Single item</option>
            </select>
          </label>

          {scopeType !== "store" ? (
            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {scopeType === "category" ? "Section" : scopeType === "brand" ? "Brand" : "Item"}
              </span>
              <select name="scope_id" className="ui-select" required>
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

          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</span>
            <input name="priority" type="number" defaultValue={0} className="ui-input" />
            <span className="text-[11px] text-slate-500">Higher wins when multiple sales overlap.</span>
          </label>

          <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium text-slate-700">
            <input type="checkbox" name="is_active" value="true" defaultChecked className="h-4 w-4 rounded" />
            Active now
          </label>
        </div>

        <button type="submit" className="btn btn-success mt-4 rounded-xl">
          Create sale
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

                  <div className="flex flex-wrap gap-2">
                    <form action={toggleMenuPromotionAction}>
                      <input type="hidden" name="id" value={promotion.id} />
                      <input type="hidden" name="is_active" value={promotion.is_active ? "false" : "true"} />
                      <button type="submit" className="btn btn-secondary rounded-xl text-xs">
                        {promotion.is_active ? "Pause" : "Activate"}
                      </button>
                    </form>
                    <form action={deleteMenuPromotionAction}>
                      <input type="hidden" name="id" value={promotion.id} />
                      <button type="submit" className="btn btn-secondary rounded-xl text-xs text-rose-700">
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

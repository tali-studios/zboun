"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { resolveColorSwatch } from "@/lib/color-swatches";
import { getItemBudgetPriceUsd } from "@/lib/budget-mode";
import {
  findColorOptionGroup,
  findSizeLikeOptionGroup,
  normalizeOptionGroups,
  type MenuOptionGroup,
} from "@/lib/menu-item-options";

export type CatalogFilterState = {
  brands: string[];
  sizes: string[];
  colors: string[];
  /** Inclusive USD bounds. Null = use the catalog min/max (no price filter). */
  priceMinUsd: number | null;
  priceMaxUsd: number | null;
};

export const DEFAULT_CATALOG_FILTERS: CatalogFilterState = {
  brands: [],
  sizes: [],
  colors: [],
  priceMinUsd: null,
  priceMaxUsd: null,
};

export type CatalogFacets = {
  brands: string[];
  sizes: string[];
  colors: string[];
  minPriceUsd: number;
  maxPriceUsd: number;
};

type CatalogBrandEmbed = { id?: string; name?: string | null; logo_url?: string | null };

type CatalogItem = {
  option_label?: string | null;
  option_values?: unknown;
  sold_by_weight?: boolean | null;
  price?: number | null;
  price_per_kg?: number | null;
  weight_step_kg?: number | null;
  percent_off?: number | null;
  promotion_label?: string | null;
  brand_id?: string | null;
  brand_name?: string | null;
  menu_brands?: CatalogBrandEmbed | CatalogBrandEmbed[] | null;
};

const LETTER_SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "3XL", "4XL"];
const PREVIEW_COUNT = 7;

function findSizeOptionGroup(groups: MenuOptionGroup[]): MenuOptionGroup | null {
  return findSizeLikeOptionGroup(groups);
}

function itemGroups(item: CatalogItem): MenuOptionGroup[] {
  return normalizeOptionGroups(item.option_label, item.option_values);
}

function getCatalogBrandName(item: CatalogItem): string | null {
  const nested = Array.isArray(item.menu_brands) ? item.menu_brands[0] : item.menu_brands;
  const name = nested?.name?.trim() || item.brand_name?.trim() || "";
  return name || null;
}

function itemPriceSpan(item: CatalogItem): { min: number; max: number } {
  const base = getItemBudgetPriceUsd(item as Parameters<typeof getItemBudgetPriceUsd>[0]);
  const groups = itemGroups(item);
  const extraMax = groups.reduce((sum, group) => {
    const highest = group.values.reduce((m, v) => Math.max(m, Number(v.price) || 0), 0);
    return sum + highest;
  }, 0);
  return { min: base, max: base + extraMax };
}

function sizeSortKey(name: string): [number, number, string] {
  const upper = name.trim().toUpperCase();
  const letterIdx = LETTER_SIZE_ORDER.indexOf(upper);
  if (letterIdx >= 0) return [0, letterIdx, upper];
  const numeric = Number(name.replace(/[^\d.]/g, ""));
  if (Number.isFinite(numeric) && numeric > 0) return [1, numeric, upper];
  return [2, 0, upper];
}

export function collectCatalogFacets(items: CatalogItem[]): CatalogFacets {
  const sizes = new Set<string>();
  const colors = new Set<string>();
  const brands = new Map<string, string>();
  let minPriceUsd = Number.POSITIVE_INFINITY;
  let maxPriceUsd = 0;

  for (const item of items) {
    const groups = itemGroups(item);
    const sizeGroup = findSizeOptionGroup(groups);
    const colorGroup = findColorOptionGroup(groups);
    for (const value of sizeGroup?.values ?? []) {
      if (value.name.trim()) sizes.add(value.name.trim());
    }
    for (const value of colorGroup?.values ?? []) {
      if (value.name.trim()) colors.add(value.name.trim());
    }
    const brandName = getCatalogBrandName(item);
    if (brandName) {
      const key = brandName.toLowerCase();
      if (!brands.has(key)) brands.set(key, brandName);
    }
    const span = itemPriceSpan(item);
    minPriceUsd = Math.min(minPriceUsd, span.min);
    maxPriceUsd = Math.max(maxPriceUsd, span.max);
  }

  if (!Number.isFinite(minPriceUsd)) minPriceUsd = 0;
  if (maxPriceUsd < minPriceUsd) maxPriceUsd = minPriceUsd;

  return {
    brands: [...brands.values()].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    ),
    sizes: [...sizes].sort((a, b) => {
      const [ag, av, al] = sizeSortKey(a);
      const [bg, bv, bl] = sizeSortKey(b);
      return ag - bg || av - bv || al.localeCompare(bl);
    }),
    colors: [...colors].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })),
    minPriceUsd: Math.floor(minPriceUsd),
    maxPriceUsd: Math.ceil(maxPriceUsd),
  };
}

export function catalogFiltersAreActive(
  filters: CatalogFilterState,
  facets: CatalogFacets,
): boolean {
  if (filters.brands.length > 0 || filters.sizes.length > 0 || filters.colors.length > 0) return true;
  const min = filters.priceMinUsd ?? facets.minPriceUsd;
  const max = filters.priceMaxUsd ?? facets.maxPriceUsd;
  return min > facets.minPriceUsd || max < facets.maxPriceUsd;
}

export function catalogFilterCount(filters: CatalogFilterState, facets: CatalogFacets): number {
  let n = filters.brands.length + filters.sizes.length + filters.colors.length;
  const min = filters.priceMinUsd ?? facets.minPriceUsd;
  const max = filters.priceMaxUsd ?? facets.maxPriceUsd;
  if (min > facets.minPriceUsd || max < facets.maxPriceUsd) n += 1;
  return n;
}

export function itemMatchesCatalogFilters(
  item: CatalogItem,
  filters: CatalogFilterState,
  facets: CatalogFacets,
): boolean {
  if (filters.brands.length > 0) {
    const brandName = getCatalogBrandName(item);
    const selected = new Set(filters.brands.map((name) => name.toLowerCase()));
    if (!brandName || !selected.has(brandName.toLowerCase())) return false;
  }
  const groups = itemGroups(item);
  if (filters.sizes.length > 0) {
    const sizeGroup = findSizeOptionGroup(groups);
    const names = new Set((sizeGroup?.values ?? []).map((v) => v.name.trim()));
    if (!filters.sizes.some((size) => names.has(size))) return false;
  }
  if (filters.colors.length > 0) {
    const colorGroup = findColorOptionGroup(groups);
    const names = new Set((colorGroup?.values ?? []).map((v) => v.name.trim()));
    if (!filters.colors.some((color) => names.has(color))) return false;
  }
  const min = filters.priceMinUsd ?? facets.minPriceUsd;
  const max = filters.priceMaxUsd ?? facets.maxPriceUsd;
  const span = itemPriceSpan(item);
  return span.min <= max && span.max >= min;
}

type Props = {
  open: boolean;
  value: CatalogFilterState;
  facets: CatalogFacets;
  lbpRate: number;
  resultCount: number;
  onClose: () => void;
  onApply: (next: CatalogFilterState) => void;
  onDraftChange?: (next: CatalogFilterState) => void;
};

function formatLbpAmount(usd: number, lbpRate: number) {
  const lbp = Math.round(usd * lbpRate);
  return `${lbp.toLocaleString()} LBP`;
}

function toggleValue(list: string[], name: string) {
  return list.includes(name) ? list.filter((v) => v !== name) : [...list, name];
}

function FilterSection({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid grid-cols-[88px_1fr] gap-4 sm:grid-cols-[104px_1fr] sm:gap-8">
      <h3 className="pt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-800">
        <span className="text-slate-400">|{String(index).padStart(2, "0")}|</span> {title}
      </h3>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function ExpandableList({
  items,
  renderItem,
}: {
  items: string[];
  renderItem: (name: string) => React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, PREVIEW_COUNT);
  const canToggle = items.length > PREVIEW_COUNT;

  return (
    <div>
      <ul className="space-y-3">
        {visible.map((name) => (
          <li key={name}>{renderItem(name)}</li>
        ))}
      </ul>
      {canToggle ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] ${
            expanded
              ? "border border-slate-300 px-3 py-1.5 text-slate-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {expanded ? "View less" : "View more"}
        </button>
      ) : null}
    </div>
  );
}

export function CatalogFilterSheet({
  open,
  value,
  facets,
  lbpRate,
  resultCount,
  onClose,
  onApply,
  onDraftChange,
}: Props) {
  const [draft, setDraft] = useState<CatalogFilterState>(value);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startYRef = useRef(0);
  const dragYRef = useRef(0);

  useEffect(() => {
    if (open) {
      setDraft(value);
      setDragY(0);
      dragYRef.current = 0;
    }
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function updateDraft(next: CatalogFilterState) {
    setDraft(next);
    onDraftChange?.(next);
  }

  const priceFloor = facets.minPriceUsd;
  const priceCeil = Math.max(facets.maxPriceUsd, priceFloor);
  const draftMin = draft.priceMinUsd ?? priceFloor;
  const draftMax = draft.priceMaxUsd ?? priceCeil;
  const span = Math.max(1, priceCeil - priceFloor);
  const leftPct = ((draftMin - priceFloor) / span) * 100;
  const rightPct = ((draftMax - priceFloor) / span) * 100;

  const sections = useMemo(() => {
    const list: Array<"brand" | "size" | "colour" | "price"> = [];
    if (facets.brands.length >= 2) list.push("brand");
    if (facets.sizes.length > 0) list.push("size");
    if (facets.colors.length > 0) list.push("colour");
    if (priceCeil > priceFloor) list.push("price");
    return list;
  }, [facets.brands.length, facets.sizes.length, facets.colors.length, priceCeil, priceFloor]);

  if (!open) return null;

  function onTouchStart(e: React.TouchEvent) {
    startYRef.current = e.touches[0].clientY;
    dragYRef.current = 0;
    setDragging(true);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!dragging) return;
    const dy = e.touches[0].clientY - startYRef.current;
    const next = Math.max(0, dy);
    dragYRef.current = next;
    setDragY(next);
  }

  function onTouchEnd() {
    if (!dragging) return;
    setDragging(false);
    if (dragYRef.current >= 110) {
      setDragY(0);
      dragYRef.current = 0;
      onClose();
      return;
    }
    setDragY(0);
    dragYRef.current = 0;
  }

  function applyAndClose(next: CatalogFilterState) {
    const normalized: CatalogFilterState = {
      brands: next.brands,
      sizes: next.sizes,
      colors: next.colors,
      priceMinUsd: (next.priceMinUsd ?? priceFloor) <= priceFloor ? null : next.priceMinUsd,
      priceMaxUsd: (next.priceMaxUsd ?? priceCeil) >= priceCeil ? null : next.priceMaxUsd,
    };
    onApply(normalized);
    onClose();
  }

  const backdropOpacity = Math.max(0.15, 0.45 * (1 - dragY / 320));

  return (
    <>
      <div
        className="fixed inset-0 z-[60] backdrop-blur-[2px]"
        style={{ backgroundColor: `rgba(15, 23, 42, ${backdropOpacity})` }}
        onClick={onClose}
        aria-hidden
      />

      <div
        className="fixed inset-x-0 bottom-0 z-[70] flex max-h-[90dvh] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[min(420px,100%)] sm:rounded-none sm:border-l sm:border-slate-200"
        style={{
          transform: `translateY(${dragY}px)`,
          transition: dragging ? "none" : "transform 200ms ease-out",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Product filters"
      >
        <div
          className="h-3 shrink-0 touch-none sm:hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          aria-hidden
        />

        <div className="flex items-center justify-between px-6 pb-3 pt-1 sm:px-8 sm:pt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-800">
            Filter
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => updateDraft(DEFAULT_CATALOG_FILTERS)}
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 hover:text-slate-700"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xl leading-none text-slate-400 hover:text-slate-700"
              aria-label="Close filters"
            >
              ×
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4 sm:px-8">
          <div className="space-y-10">
            {sections.map((section, i) => {
              const index = i + 1;
              if (section === "brand") {
                return (
                  <FilterSection key="brand" index={index} title="Brand">
                    <ExpandableList
                      items={facets.brands}
                      renderItem={(name) => {
                        const selected = draft.brands.includes(name);
                        return (
                          <button
                            type="button"
                            onClick={() =>
                              updateDraft({ ...draft, brands: toggleValue(draft.brands, name) })
                            }
                            className={`block text-left text-[13px] tracking-[0.04em] transition ${
                              selected
                                ? "font-semibold text-slate-900 underline decoration-slate-900 underline-offset-4"
                                : "font-normal text-slate-600 hover:text-slate-900"
                            }`}
                            aria-pressed={selected}
                          >
                            {name}
                          </button>
                        );
                      }}
                    />
                  </FilterSection>
                );
              }
              if (section === "size") {
                return (
                  <FilterSection key="size" index={index} title="Size">
                    <ExpandableList
                      items={facets.sizes}
                      renderItem={(name) => {
                        const selected = draft.sizes.includes(name);
                        return (
                          <button
                            type="button"
                            onClick={() =>
                              updateDraft({ ...draft, sizes: toggleValue(draft.sizes, name) })
                            }
                            className={`block text-left text-[13px] uppercase tracking-[0.08em] transition ${
                              selected
                                ? "font-semibold text-slate-900 underline decoration-slate-900 underline-offset-4"
                                : "font-normal text-slate-600 hover:text-slate-900"
                            }`}
                            aria-pressed={selected}
                          >
                            {name}
                          </button>
                        );
                      }}
                    />
                  </FilterSection>
                );
              }
              if (section === "colour") {
                return (
                  <FilterSection key="colour" index={index} title="Colour">
                    <ExpandableList
                      items={facets.colors}
                      renderItem={(name) => {
                        const selected = draft.colors.includes(name);
                        const swatch = resolveColorSwatch(name);
                        return (
                          <button
                            type="button"
                            onClick={() =>
                              updateDraft({ ...draft, colors: toggleValue(draft.colors, name) })
                            }
                            className="flex items-center gap-3 text-left"
                            aria-pressed={selected}
                          >
                            <span
                              className={`h-3.5 w-3.5 shrink-0 border ${
                                swatch.isLight ? "border-slate-300" : "border-transparent"
                              }`}
                              style={{ background: swatch.background }}
                              aria-hidden
                            />
                            <span
                              className={`text-[13px] uppercase tracking-[0.08em] ${
                                selected
                                  ? "font-semibold text-slate-900 underline decoration-slate-900 underline-offset-4"
                                  : "text-slate-600"
                              }`}
                            >
                              {name}
                            </span>
                          </button>
                        );
                      }}
                    />
                  </FilterSection>
                );
              }
              return (
                <FilterSection key="price" index={index} title="Price">
                  <div className="pt-2">
                    <div className="relative h-8">
                      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-slate-200" />
                      <div
                        className="absolute top-1/2 h-px -translate-y-1/2 bg-slate-900"
                        style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
                      />
                      <input
                        type="range"
                        min={priceFloor}
                        max={priceCeil}
                        step={1}
                        value={draftMin}
                        onChange={(e) => {
                          const next = Math.min(Number(e.target.value), draftMax);
                          updateDraft({ ...draft, priceMinUsd: next, priceMaxUsd: draftMax });
                        }}
                        className="catalog-price-range absolute inset-0 w-full appearance-none bg-transparent"
                        aria-label="Minimum price"
                      />
                      <input
                        type="range"
                        min={priceFloor}
                        max={priceCeil}
                        step={1}
                        value={draftMax}
                        onChange={(e) => {
                          const next = Math.max(Number(e.target.value), draftMin);
                          updateDraft({ ...draft, priceMinUsd: draftMin, priceMaxUsd: next });
                        }}
                        className="catalog-price-range absolute inset-0 w-full appearance-none bg-transparent"
                        aria-label="Maximum price"
                      />
                    </div>
                    <p className="mt-3 text-[12px] tracking-wide text-slate-600">
                      {formatLbpAmount(draftMin, lbpRate)} – {formatLbpAmount(draftMax, lbpRate)}
                    </p>
                  </div>
                </FilterSection>
              );
            })}
          </div>
        </div>

        <div className="shrink-0 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 sm:px-8 sm:pb-8">
          <button
            type="button"
            onClick={() => applyAndClose(draft)}
            className="w-full border border-slate-900 py-3.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-900 transition hover:bg-slate-900 hover:text-white"
          >
            View results{resultCount >= 0 ? ` · ${resultCount}` : ""}
          </button>
        </div>
      </div>

      <style>{`
        .catalog-price-range {
          pointer-events: none;
        }
        .catalog-price-range::-webkit-slider-thumb {
          pointer-events: auto;
          -webkit-appearance: none;
          appearance: none;
          height: 14px;
          width: 14px;
          border-radius: 999px;
          background: #0f172a;
          border: 0;
          cursor: pointer;
          margin-top: -6px;
        }
        .catalog-price-range::-moz-range-thumb {
          pointer-events: auto;
          height: 14px;
          width: 14px;
          border-radius: 999px;
          background: #0f172a;
          border: 0;
          cursor: pointer;
        }
        .catalog-price-range::-webkit-slider-runnable-track {
          height: 2px;
          background: transparent;
        }
        .catalog-price-range::-moz-range-track {
          height: 2px;
          background: transparent;
        }
      `}</style>
    </>
  );
}

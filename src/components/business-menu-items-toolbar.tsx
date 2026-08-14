"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MenuItemsSort } from "@/lib/menu-items-admin";

type Category = { id: string; name: string };

type Brand = { id: string; name: string };

type ToolbarState = {
  q: string;
  category: string;
  stock: string;
  audience: string;
  brand: string;
  sort: MenuItemsSort;
};

type Props = {
  categories: Category[];
  brands?: Brand[];
  initialQ: string;
  initialCategory: string;
  initialStock: string;
  initialAudience?: string;
  initialBrand?: string;
  initialSort: MenuItemsSort;
  totalCount: number;
  filteredCount: number;
  showAudienceFilter?: boolean;
};

function buildHref(
  pathname: string,
  q: string,
  category: string,
  stock: string,
  sort: MenuItemsSort,
  audience = "",
  brand = "",
) {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (category.trim()) params.set("category", category.trim());
  if (stock.trim()) params.set("stock", stock.trim());
  if (audience.trim()) params.set("audience", audience.trim());
  if (brand.trim()) params.set("brand", brand.trim());
  if (sort !== "name_asc") params.set("sort", sort);
  const qs = params.toString();
  return qs ? `${pathname}?${qs}#items-toolbar` : `${pathname}#items-toolbar`;
}

export function BusinessMenuItemsToolbar({
  categories,
  brands = [],
  initialQ,
  initialCategory,
  initialStock,
  initialAudience = "",
  initialBrand = "",
  initialSort,
  totalCount,
  filteredCount,
  showAudienceFilter = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [stock, setStock] = useState(initialStock);
  const [audience, setAudience] = useState(initialAudience);
  const [brand, setBrand] = useState(initialBrand);
  const [sort, setSort] = useState<MenuItemsSort>(initialSort);
  const latest = useRef<ToolbarState>({
    q: initialQ,
    category: initialCategory,
    stock: initialStock,
    audience: initialAudience,
    brand: initialBrand,
    sort: initialSort,
  });
  const debounceId = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setQ(initialQ);
    setCategory(initialCategory);
    setStock(initialStock);
    setAudience(initialAudience);
    setBrand(initialBrand);
    setSort(initialSort);
    latest.current = {
      q: initialQ,
      category: initialCategory,
      stock: initialStock,
      audience: initialAudience,
      brand: initialBrand,
      sort: initialSort,
    };
  }, [initialQ, initialCategory, initialStock, initialAudience, initialBrand, initialSort]);

  const apply = useCallback(
    (next: ToolbarState) => {
      latest.current = next;
      router.replace(
        buildHref(pathname, next.q, next.category, next.stock, next.sort, next.audience, next.brand),
        { scroll: false },
      );
    },
    [pathname, router],
  );

  useEffect(() => {
    return () => {
      if (debounceId.current) clearTimeout(debounceId.current);
    };
  }, []);

  function scheduleSearchPush(nextQ: string) {
    if (debounceId.current) clearTimeout(debounceId.current);
    debounceId.current = setTimeout(() => {
      apply({ ...latest.current, q: nextQ });
    }, 300);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (debounceId.current) clearTimeout(debounceId.current);
    apply({ q, category, stock, audience, brand, sort });
  }

  return (
    <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-sm md:px-5">
      <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="min-w-0 flex-1 lg:min-w-[14rem] lg:flex-[2]">
          <label htmlFor="menu-items-q" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Search items
          </label>
          <div className="flex gap-2">
            <input
              id="menu-items-q"
              name="q"
              value={q}
              onChange={(e) => {
                const v = e.target.value;
                setQ(v);
                latest.current = { ...latest.current, q: v };
                scheduleSearchPush(v);
              }}
              placeholder="Name, brand, section, ingredient…"
              className="ui-input min-w-0 flex-1"
              autoComplete="off"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              Search
            </button>
          </div>
        </div>

        <label className="space-y-1 lg:w-44 lg:shrink-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Section</span>
          <select
            name="category"
            value={category}
            onChange={(e) => {
              const v = e.target.value;
              setCategory(v);
              if (debounceId.current) clearTimeout(debounceId.current);
              apply({ ...latest.current, category: v });
            }}
            className="ui-select w-full"
          >
            <option value="">All sections</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 lg:w-36 lg:shrink-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stock filter</span>
          <select
            name="stock"
            value={stock}
            onChange={(e) => {
              const v = e.target.value;
              setStock(v);
              if (debounceId.current) clearTimeout(debounceId.current);
              apply({ ...latest.current, stock: v });
            }}
            className="ui-select w-full"
          >
            <option value="">All</option>
            <option value="in">In stock</option>
            <option value="low">Low / alert</option>
            <option value="out">Out of stock</option>
            <option value="tracked">Tracked quantity</option>
          </select>
        </label>

        {showAudienceFilter ? (
          <label className="space-y-1 lg:w-36 lg:shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Designed for</span>
            <select
              name="audience"
              value={audience}
              onChange={(e) => {
                const v = e.target.value;
                setAudience(v);
                if (debounceId.current) clearTimeout(debounceId.current);
                apply({ ...latest.current, audience: v });
              }}
              className="ui-select w-full"
            >
              <option value="">Everyone</option>
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="unisex">Unisex</option>
              <option value="kids">Kids</option>
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
            </select>
          </label>
        ) : null}

        {brands.length > 0 ? (
          <label className="space-y-1 lg:w-44 lg:shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Brand</span>
            <select
              name="brand"
              value={brand}
              onChange={(e) => {
                const v = e.target.value;
                setBrand(v);
                if (debounceId.current) clearTimeout(debounceId.current);
                apply({ ...latest.current, brand: v });
              }}
              className="ui-select w-full"
            >
              <option value="">All brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="space-y-1 lg:w-44 lg:shrink-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sort by</span>
          <select
            name="sort"
            value={sort}
            onChange={(e) => {
              const v = e.target.value as MenuItemsSort;
              setSort(v);
              if (debounceId.current) clearTimeout(debounceId.current);
              apply({ ...latest.current, sort: v });
            }}
            className="ui-select w-full"
          >
            <option value="name_asc">Name A → Z</option>
            <option value="name_desc">Name Z → A</option>
            <option value="section_asc">Section A → Z</option>
            <option value="section_desc">Section Z → A</option>
            <option value="price_asc">Price low → high</option>
            <option value="price_desc">Price high → low</option>
            <option value="stock_asc">Stock low → high</option>
            <option value="stock_desc">Stock high → low</option>
          </select>
        </label>
      </form>

      <p className="mt-2 text-xs text-slate-500">
        {filteredCount === totalCount
          ? `${totalCount} item${totalCount === 1 ? "" : "s"}`
          : `${filteredCount} of ${totalCount} items`}
        {initialQ.trim() ? (
          <>
            {" "}
            matching &ldquo;<span className="font-semibold text-slate-700">{initialQ.trim()}</span>&rdquo;
          </>
        ) : null}
      </p>
    </div>
  );
}

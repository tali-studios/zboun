"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MenuItemsSort } from "@/lib/menu-items-admin";

type Category = { id: string; name: string };

type Props = {
  categories: Category[];
  initialQ: string;
  initialCategory: string;
  initialStock: string;
  initialSort: MenuItemsSort;
  totalCount: number;
  filteredCount: number;
};

function buildHref(
  pathname: string,
  q: string,
  category: string,
  stock: string,
  sort: MenuItemsSort,
) {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (category.trim()) params.set("category", category.trim());
  if (stock.trim()) params.set("stock", stock.trim());
  if (sort !== "name_asc") params.set("sort", sort);
  const qs = params.toString();
  return qs ? `${pathname}?${qs}#items-toolbar` : `${pathname}#items-toolbar`;
}

export function BusinessMenuItemsToolbar({
  categories,
  initialQ,
  initialCategory,
  initialStock,
  initialSort,
  totalCount,
  filteredCount,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [stock, setStock] = useState(initialStock);
  const [sort, setSort] = useState<MenuItemsSort>(initialSort);
  const latest = useRef({
    q: initialQ,
    category: initialCategory,
    stock: initialStock,
    sort: initialSort,
  });
  const debounceId = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setQ(initialQ);
    setCategory(initialCategory);
    setStock(initialStock);
    setSort(initialSort);
    latest.current = {
      q: initialQ,
      category: initialCategory,
      stock: initialStock,
      sort: initialSort,
    };
  }, [initialQ, initialCategory, initialStock, initialSort]);

  const apply = useCallback(
    (next: { q: string; category: string; stock: string; sort: MenuItemsSort }) => {
      latest.current = next;
      router.replace(buildHref(pathname, next.q, next.category, next.stock, next.sort), {
        scroll: false,
      });
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
      const { category: c, stock: s, sort: so } = latest.current;
      apply({ q: nextQ, category: c, stock: s, sort: so });
    }, 300);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (debounceId.current) clearTimeout(debounceId.current);
    apply({ q, category, stock, sort });
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
              apply({ q: latest.current.q, category: v, stock: latest.current.stock, sort: latest.current.sort });
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
              apply({ q: latest.current.q, category: latest.current.category, stock: v, sort: latest.current.sort });
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

        <label className="space-y-1 lg:w-44 lg:shrink-0">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sort by</span>
          <select
            name="sort"
            value={sort}
            onChange={(e) => {
              const v = e.target.value as MenuItemsSort;
              setSort(v);
              if (debounceId.current) clearTimeout(debounceId.current);
              apply({ q: latest.current.q, category: latest.current.category, stock: latest.current.stock, sort: v });
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

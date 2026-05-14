"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type Category = { id: string; name: string };

type Props = {
  categories: Category[];
  initialQ: string;
  initialCategory: string;
  initialStock: string;
};

function buildHref(pathname: string, q: string, category: string, stock: string) {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (category.trim()) params.set("category", category.trim());
  if (stock.trim()) params.set("stock", stock.trim());
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function BusinessMenuItemsFilter({
  categories,
  initialQ,
  initialCategory,
  initialStock,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [stock, setStock] = useState(initialStock);
  const latest = useRef({ q: initialQ, category: initialCategory, stock: initialStock });
  const debounceId = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setQ(initialQ);
    setCategory(initialCategory);
    setStock(initialStock);
    latest.current = { q: initialQ, category: initialCategory, stock: initialStock };
  }, [initialQ, initialCategory, initialStock]);

  const push = useCallback(
    (next: { q: string; category: string; stock: string }) => {
      latest.current = next;
      router.push(buildHref(pathname, next.q, next.category, next.stock), { scroll: false });
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
      const { category: c, stock: s } = latest.current;
      push({ q: nextQ, category: c, stock: s });
    }, 350);
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end md:gap-x-3 md:gap-y-2">
      <div className="min-w-0 flex-1 md:min-w-[min(100%,12rem)] md:flex-[2]">
        <label htmlFor="menu-items-q" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Search
        </label>
        <input
          id="menu-items-q"
          value={q}
          onChange={(e) => {
            const v = e.target.value;
            setQ(v);
            latest.current = { ...latest.current, q: v };
            scheduleSearchPush(v);
          }}
          placeholder="Search by item, section, ingredient, option"
          className="ui-input"
        />
        <p className="mt-1 text-xs text-slate-500">Search item names, descriptions, ingredients, and options.</p>
      </div>
      <label className="space-y-1 md:w-[min(100%,11rem)] md:shrink-0 lg:w-52">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Section</span>
        <select
          name="category"
          value={category}
          onChange={(e) => {
            const v = e.target.value;
            setCategory(v);
            latest.current = { ...latest.current, category: v };
            if (debounceId.current) clearTimeout(debounceId.current);
            push({ q: latest.current.q, category: v, stock: latest.current.stock });
          }}
          className="ui-select"
        >
          <option value="">All sections</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500">Filter items by one section.</p>
      </label>
      <label className="space-y-1 md:w-36 md:shrink-0">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Stock</span>
        <select
          name="stock"
          value={stock}
          onChange={(e) => {
            const v = e.target.value;
            setStock(v);
            latest.current = { ...latest.current, stock: v };
            if (debounceId.current) clearTimeout(debounceId.current);
            push({ q: latest.current.q, category: latest.current.category, stock: v });
          }}
          className="ui-select"
        >
          <option value="">All</option>
          <option value="in">In stock</option>
          <option value="out">Out of stock</option>
        </select>
        <p className="text-xs text-slate-500">Show items.</p>
      </label>
    </div>
  );
}

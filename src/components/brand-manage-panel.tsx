"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrandAction } from "@/app-actions/restaurant";
import { BrandManageRow } from "@/components/brand-manage-row";
import { ImageUploadField } from "@/components/image-upload-field";
import { BRANDS_ADMIN_PAGE_SIZE } from "@/lib/menu-brands";

type Brand = {
  id: string;
  name: string;
  logo_url: string | null;
};

type SortKey = "name-asc" | "name-desc";

type Props = {
  brands: Brand[];
};

export function BrandManagePanel({ brands }: Props) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("name-asc");
  const [page, setPage] = useState(0);

  const filteredBrands = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    let list = brands;
    if (normalized) {
      list = list.filter((brand) => brand.name.toLowerCase().includes(normalized));
    }
    return [...list].sort((a, b) => {
      const cmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      return sort === "name-desc" ? -cmp : cmp;
    });
  }, [brands, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredBrands.length / BRANDS_ADMIN_PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageStart = safePage * BRANDS_ADMIN_PAGE_SIZE;
  const pagedBrands = filteredBrands.slice(pageStart, pageStart + BRANDS_ADMIN_PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [query, sort]);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const rangeStart = filteredBrands.length === 0 ? 0 : pageStart + 1;
  const rangeEnd = Math.min(pageStart + BRANDS_ADMIN_PAGE_SIZE, filteredBrands.length);

  return (
    <section className="panel overflow-x-hidden p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="panel-title">Manage brands</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {brands.length} {brands.length === 1 ? "brand" : "brands"}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Brands appear when adding menu items. Customers see the brand name and logo on each item. The list below shows{" "}
        {BRANDS_ADMIN_PAGE_SIZE} at a time so the page stays fast — use search to find others.
      </p>

      <form action={createBrandAction} className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
        <h3 className="text-sm font-bold text-slate-900">Add brand</h3>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Brand name</span>
              <input name="name" required placeholder="Brand name" className="ui-input" />
            </label>
            <p className="text-xs text-slate-500">
              Examples: Häagen-Dazs, Nestlé, Cadbury. Use brands to group packaged grocery items.
            </p>
            <button type="submit" className="btn btn-success w-full rounded-xl sm:w-auto sm:min-w-[10rem]">
              Add brand
            </button>
          </div>
          <ImageUploadField name="logo_file" label="Brand logo" optional />
        </div>
      </form>

      {brands.length > 0 ? (
        <>
          <div className="mt-4 space-y-3">
            <div className="max-w-md">
              <label htmlFor="brand-search" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Search brands
              </label>
              <input
                id="brand-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by brand name…"
                className="ui-input w-full max-w-full"
              />
            </div>
            <div>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Sort</span>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { id: "name-asc" as const, label: "A–Z" },
                    { id: "name-desc" as const, label: "Z–A" },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSort(option.id)}
                    className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                      sort === option.id
                        ? "border-violet-500 bg-violet-50 text-violet-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {query.trim() && filteredBrands.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              No brands match &ldquo;{query.trim()}&rdquo;.
            </p>
          ) : (
            <>
              {filteredBrands.length > BRANDS_ADMIN_PAGE_SIZE ? (
                <p className="mt-3 text-xs text-slate-500">
                  Showing {rangeStart}–{rangeEnd} of {filteredBrands.length}
                  {query.trim() ? " matching brands" : " brands"}
                </p>
              ) : null}

              <div className="mt-4 overflow-x-auto sm:rounded-2xl sm:border sm:border-slate-200 sm:bg-white sm:shadow-sm">
                <table className="min-w-[640px] text-sm md:min-w-full">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="w-[9.5rem] px-4 py-3">Logo</th>
                      <th className="px-4 py-3">Brand name</th>
                      <th className="w-[1%] whitespace-nowrap px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedBrands.map((brand) => (
                      <BrandManageRow key={brand.id} brand={brand} />
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredBrands.length > BRANDS_ADMIN_PAGE_SIZE ? (
                <div className="mt-3 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={safePage === 0}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-medium text-slate-500">
                    Page {safePage + 1} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={safePage >= totalPages - 1}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </>
          )}
        </>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          No brands yet. Add your first brand above, then pick it when creating grocery or packaged items.
        </p>
      )}
    </section>
  );
}

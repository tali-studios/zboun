"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionManageRow } from "@/components/section-manage-row";
import { SECTIONS_ADMIN_PAGE_SIZE } from "@/lib/dashboard-admin";

type Category = {
  id: string;
  name: string;
  position: number;
};

type SortKey = "menu-order" | "name-asc" | "name-desc";

type Props = {
  categories: Category[];
};

export function SectionManagePanel({ categories }: Props) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("menu-order");
  const [page, setPage] = useState(0);

  const filteredCategories = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    let list = categories;
    if (normalized) {
      list = list.filter((category) => category.name.toLowerCase().includes(normalized));
    }
    return [...list].sort((a, b) => {
      if (sort === "menu-order") {
        return a.position - b.position || a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      }
      const cmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      return sort === "name-desc" ? -cmp : cmp;
    });
  }, [categories, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / SECTIONS_ADMIN_PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageStart = safePage * SECTIONS_ADMIN_PAGE_SIZE;
  const pagedCategories = filteredCategories.slice(pageStart, pageStart + SECTIONS_ADMIN_PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [query, sort]);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const rangeStart = filteredCategories.length === 0 ? 0 : pageStart + 1;
  const rangeEnd = Math.min(pageStart + SECTIONS_ADMIN_PAGE_SIZE, filteredCategories.length);

  return (
    <section className="panel overflow-x-hidden p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="panel-title">Manage sections</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {categories.length} {categories.length === 1 ? "section" : "sections"}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        The list shows {SECTIONS_ADMIN_PAGE_SIZE} sections at a time. Use search to find a section quickly.
      </p>

      {categories.length > 0 ? (
        <>
          <div className="mt-4 space-y-3">
            <div className="max-w-md">
              <label htmlFor="section-search" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Search sections
              </label>
              <input
                id="section-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by section name…"
                className="ui-input w-full max-w-full"
              />
            </div>
            <div>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Sort</span>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { id: "menu-order" as const, label: "Menu order" },
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

          {query.trim() && filteredCategories.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              No sections match &ldquo;{query.trim()}&rdquo;.
            </p>
          ) : (
            <>
              {filteredCategories.length > SECTIONS_ADMIN_PAGE_SIZE ? (
                <p className="mt-3 text-xs text-slate-500">
                  Showing {rangeStart}–{rangeEnd} of {filteredCategories.length}
                  {query.trim() ? " matching sections" : " sections"}
                </p>
              ) : null}

              <div className="mt-4 overflow-x-auto sm:mx-0 sm:rounded-2xl sm:border sm:border-slate-200 sm:bg-white sm:shadow-sm">
                <table className="min-w-[560px] text-sm md:min-w-full">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Section name</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedCategories.map((category) => (
                      <SectionManageRow key={category.id} category={category} />
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredCategories.length > SECTIONS_ADMIN_PAGE_SIZE ? (
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
          No sections yet. Add your first section above.
        </p>
      )}
    </section>
  );
}

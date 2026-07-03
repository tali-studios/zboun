"use client";

import { useEffect, useMemo, useState } from "react";
import { SectionManageRow } from "@/components/section-manage-row";
import { AddSectionsForm } from "@/components/add-sections-form";
import { SortableTh } from "@/components/sortable-th";
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

  function toggleNameSort() {
    setSort((prev) => (prev === "name-asc" ? "name-desc" : prev === "name-desc" ? "menu-order" : "name-asc"));
  }

  return (
    <section className="panel overflow-x-hidden p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="panel-title">Sections</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Sections organize your menu — customers see them as tabs (Burgers, Drinks, Dairy…).
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {categories.length} {categories.length === 1 ? "section" : "sections"}
        </span>
      </div>

      <div className="mt-4">
        <AddSectionsForm />
      </div>

      {categories.length > 0 ? (
        <>
          <div className="mt-6 mb-1 flex items-center gap-3">
            <h3 className="shrink-0 text-xs font-bold uppercase tracking-widest text-slate-400">Your sections</h3>
            <div className="h-px flex-1 bg-slate-100" />
          </div>
          <div className="mt-3 max-w-md">
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

              <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-[560px] w-full text-sm md:min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <SortableTh
                        direction={sort === "name-asc" ? "asc" : sort === "name-desc" ? "desc" : null}
                        onClick={toggleNameSort}
                      >
                        Section name
                      </SortableTh>
                      <th className="w-[1%] whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedCategories.map((category, idx) => (
                      <SectionManageRow
                        key={category.id}
                        category={category}
                        rowBg={idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}
                      />
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

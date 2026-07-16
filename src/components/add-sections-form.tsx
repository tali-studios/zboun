"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { createCategoryAction } from "@/app-actions/restaurant";

type Row = { id: number };

export function AddSectionsForm() {
  const [rows, setRows] = useState<Row[]>([{ id: 0 }]);
  const [nextId, setNextId] = useState(1);

  function addRow() {
    setRows((prev) => [...prev, { id: nextId }]);
    setNextId((id) => id + 1);
  }

  function removeRow(id: number) {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((row) => row.id !== id)));
  }

  return (
    <form action={createCategoryAction} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
      <h3 className="text-sm font-bold text-slate-900">Add section</h3>
      <p className="text-xs text-slate-500">
        Examples: Burgers, Drinks, Desserts, Dairy &amp; Eggs, Grocery.
      </p>

      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={row.id} className="flex items-center gap-2">
            <label className="min-w-0 flex-1 space-y-1">
              {index === 0 ? (
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Section name
                </span>
              ) : null}
              <input
                name="name"
                placeholder={index === 0 ? "Section name" : `Section name ${index + 1}`}
                className="ui-input w-full bg-white"
                aria-label={index === 0 ? "Section name" : `Section name ${index + 1}`}
              />
            </label>
            {rows.length > 1 ? (
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 ${
                  index === 0 ? "mt-5" : ""
                }`}
                aria-label="Remove section row"
              >
                <Minus className="h-4 w-4" strokeWidth={2.5} />
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={addRow}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white py-3 text-sm font-semibold text-slate-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Add another section
        </button>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 active:scale-[0.99]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          {rows.length > 1 ? `Add ${rows.length} sections` : "Add section"}
        </button>
      </div>
    </form>
  );
}

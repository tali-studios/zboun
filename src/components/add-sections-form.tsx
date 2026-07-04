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
    <form action={createCategoryAction} className="rounded-2xl border border-violet-200 bg-violet-50/50 p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <h3 className="text-sm font-bold text-slate-900">Add a new section</h3>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Examples: Burgers, Drinks, Desserts, Dairy &amp; Eggs, Grocery.
      </p>

      <div className="mt-3 space-y-2">
        {rows.map((row, index) => (
          <div key={row.id} className="flex items-center gap-2">
            <input
              name="name"
              placeholder={index === 0 ? "Section name" : `Section name ${index + 1}`}
              className="ui-input min-w-0 flex-1 bg-white"
              aria-label={index === 0 ? "Section name" : `Section name ${index + 1}`}
            />
            {rows.length > 1 ? (
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                aria-label="Remove section row"
              >
                <Minus className="h-4 w-4" strokeWidth={2.5} />
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <button
          type="button"
          onClick={addRow}
          className="btn btn-secondary w-full border-dashed border-violet-300 py-3 text-violet-700 hover:border-violet-400 hover:bg-violet-50"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Add another section
        </button>

        <button type="submit" className="btn btn-primary w-full py-3">
          {rows.length > 1 ? `Add ${rows.length} sections` : "Add section"}
        </button>
      </div>
    </form>
  );
}

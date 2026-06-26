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
    <form action={createCategoryAction} className="panel p-5">
      <h2 className="panel-title">Add section</h2>
      <div className="mt-3 space-y-3">
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div key={row.id} className="flex items-center gap-2">
              <input
                name="name"
                placeholder={index === 0 ? "Section name" : `Section name ${index + 1}`}
                className="ui-input min-w-0 flex-1"
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

        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-violet-300 bg-violet-50/60 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:border-violet-400 hover:bg-violet-50"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          Add another section
        </button>

        <p className="text-xs text-slate-500">Examples: Burgers, Drinks, Desserts, Grocery.</p>

        <button type="submit" className="btn btn-success w-full rounded-xl">
          {rows.length > 1 ? `Add ${rows.length} sections` : "Add section"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  importCatalogFromExcelAction,
  type CatalogImportActionResult,
} from "@/app-actions/catalog-import";
import { CATALOG_IMPORT_MAX_ROWS } from "@/lib/catalog-import";

type Props = {
  itemsLabel?: "menu" | "catalog";
};

export function CatalogExcelImportPanel({ itemsLabel = "catalog" }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<CatalogImportActionResult | null>(null);
  const [open, setOpen] = useState(false);
  const noun = itemsLabel === "menu" ? "menu items" : "catalog items";

  function onFileChange(file: File | null) {
    if (!file) return;
    setResult(null);
    const formData = new FormData();
    formData.set("file", file);
    startTransition(async () => {
      const next = await importCatalogFromExcelAction(formData);
      setResult(next);
      if (inputRef.current) inputRef.current.value = "";
      if (next.ok) {
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-2xl border-2 border-teal-400 bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 p-4 shadow-md shadow-teal-200/50 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-teal-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Bulk import
            </span>
            <h3 className="text-base font-bold text-teal-950">Import from Excel</h3>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-teal-900/80">
            Download a template that matches <strong className="font-semibold text-teal-950">your</strong>{" "}
            Add item fields, fill up to {CATALOG_IMPORT_MAX_ROWS} rows, then upload. Placeholder photos
            are generated — replace them later in {noun}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 rounded-xl bg-teal-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-teal-500"
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>

      {open ? (
        <div className="mt-4 space-y-3 rounded-xl border border-teal-200/80 bg-white/80 p-3.5 sm:p-4">
          <div className="flex flex-wrap gap-2">
            <a
              href="/dashboard/business/menu-items/import-template"
              className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-500"
            >
              Download template
            </a>
            <button
              type="button"
              disabled={isPending}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center justify-center rounded-xl border-2 border-teal-600 bg-white px-4 py-2.5 text-sm font-bold text-teal-800 transition hover:bg-teal-50 disabled:opacity-60"
            >
              {isPending ? "Importing…" : "Upload filled Excel"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
          </div>

          <ul className="list-disc space-y-1 pl-5 text-xs text-teal-900/70">
            <li>Columns match your Add item form for this store type (fashion gets sizes + colors, food gets extras, etc.).</li>
            <li>Keep column headers exactly as in the template (row 1).</li>
            <li>Lists use commas — e.g. <code>XS, S, M, L</code> or <code>Black, White, Navy</code>.</li>
            <li>Missing sections / brands are created automatically.</li>
            <li>Max {CATALOG_IMPORT_MAX_ROWS} items per upload (avoids long database locks).</li>
            <li>Placeholder product photos + color swatches are generated — replace later.</li>
          </ul>

          {result ? (
            <div
              className={`rounded-xl border px-3 py-2.5 text-sm ${
                result.ok
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {result.ok ? (
                <p>
                  Imported <strong>{result.imported}</strong> item
                  {result.imported === 1 ? "" : "s"}
                  {result.createdSections > 0
                    ? ` · ${result.createdSections} new section${result.createdSections === 1 ? "" : "s"}`
                    : ""}
                  {result.skipped > 0 ? ` · ${result.skipped} skipped` : ""}.
                </p>
              ) : (
                <p>{result.error}</p>
              )}
              {result.errors && result.errors.length > 0 ? (
                <ul className="mt-2 max-h-36 space-y-1 overflow-y-auto text-xs opacity-90">
                  {result.errors.map((err) => (
                    <li key={`${err.rowNumber}-${err.message}`}>
                      Row {err.rowNumber}: {err.message}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

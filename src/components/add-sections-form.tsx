"use client";

import { Minus, Plus } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { createCategoryAction } from "@/app-actions/restaurant";
import { DashboardAlertModal } from "@/components/dashboard-alert-modal";

type Row = { id: number };

type Props = {
  existingNames?: string[];
};

export function AddSectionsForm({ existingNames = [] }: Props) {
  const [rows, setRows] = useState<Row[]>([{ id: 0 }]);
  const [nextId, setNextId] = useState(1);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const submittingRef = useRef(false);

  function addRow() {
    if (pending) return;
    setRows((prev) => [...prev, { id: nextId }]);
    setNextId((id) => id + 1);
  }

  function removeRow(id: number) {
    if (pending) return;
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((row) => row.id !== id)));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submittingRef.current || pending) return;

    const form = e.currentTarget;
    const values = [...form.querySelectorAll<HTMLInputElement>('input[name="name"]')]
      .map((input) => input.value.trim())
      .filter(Boolean);
    if (values.length === 0) {
      setAlertMessage("Enter a section name before adding.");
      return;
    }

    const seen = new Set<string>();
    for (const name of values) {
      const key = name.toLowerCase();
      if (seen.has(key)) {
        setAlertMessage(`You listed “${name}” more than once. Each section needs a unique name.`);
        return;
      }
      seen.add(key);
      if (existingNames.some((other) => other.trim().toLowerCase() === key)) {
        setAlertMessage(`You already have a section named “${name}”. Use a different name.`);
        return;
      }
    }

    submittingRef.current = true;
    flushSync(() => setPending(true));

    const formData = new FormData(form);
    try {
      await createCategoryAction(formData);
    } catch (err) {
      if (isRedirectError(err)) {
        // Soft navigation keeps this tree mounted — clear pending before rethrow.
        submittingRef.current = false;
        flushSync(() => setPending(false));
        throw err;
      }
      submittingRef.current = false;
      flushSync(() => setPending(false));
      setAlertMessage("Something went wrong while saving. Try again.");
    }
  }

  const submitLabel =
    pending
      ? rows.length > 1
        ? "Adding sections…"
        : "Adding section…"
      : rows.length > 1
        ? `Add ${rows.length} sections`
        : "Add section";

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
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
                  className="ui-input w-full bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label={index === 0 ? "Section name" : `Section name ${index + 1}`}
                  disabled={pending}
                />
              </label>
              {rows.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={pending}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 ${
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
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white py-3 text-sm font-semibold text-slate-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Add another section
          </button>

          <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 active:scale-[0.99] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending ? (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                aria-hidden
              />
            ) : (
              <Plus className="h-4 w-4" strokeWidth={2.5} />
            )}
            {submitLabel}
          </button>
        </div>
      </form>
      <DashboardAlertModal
        open={Boolean(alertMessage)}
        heading={
          alertMessage?.startsWith("Enter a section")
            ? "Name required"
            : alertMessage?.startsWith("Something went wrong")
              ? "Couldn’t add section"
              : "Section already exists"
        }
        message={alertMessage ?? ""}
        variant="warning"
        onClose={() => setAlertMessage(null)}
      />
    </>
  );
}

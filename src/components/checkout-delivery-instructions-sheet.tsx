"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { BRAND_HEX, BRAND_HEX_DEEP } from "@/lib/brand";

type Props = {
  open: boolean;
  onClose: () => void;
  value: string;
  onSave: (value: string) => void;
};

export function CheckoutDeliveryInstructionsSheet({ open, onClose, value, onSave }: Props) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleSave() {
    onSave(draft.trim());
    onClose();
  }

  function handleClear() {
    setDraft("");
  }

  const sheet = (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delivery-instructions-title"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 id="delivery-instructions-title" className="text-lg font-bold text-slate-900">
            Add Delivery Instructions
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="px-5 py-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Note for the entire order"
            rows={5}
            className="ui-textarea min-h-[8.5rem] w-full resize-none rounded-xl border-slate-200 text-sm text-slate-900 placeholder:text-slate-400"
            autoFocus
          />
        </div>

        <div className="flex gap-3 border-t border-slate-100 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 rounded-full border border-slate-200 bg-slate-100 py-3.5 text-sm font-bold text-slate-800 transition hover:bg-slate-200"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 rounded-full py-3.5 text-sm font-bold text-white shadow-md transition hover:brightness-105"
            style={{ background: `linear-gradient(135deg, ${BRAND_HEX} 0%, ${BRAND_HEX_DEEP} 100%)` }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(sheet, document.body);
}

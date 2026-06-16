"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { MenuTheme } from "@/lib/menu-theme";
import { menuPrimaryButtonStyle, menuThemeStyle } from "@/lib/menu-theme";

type Props = {
  open: boolean;
  onClose: () => void;
  value: string;
  onSave: (value: string) => void;
  theme: MenuTheme;
};

export function CheckoutDeliveryInstructionsSheet({ open, onClose, value, onSave, theme }: Props) {
  const [draft, setDraft] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(min-width: 768px)");
    if (!mq.matches) return;
    const id = requestAnimationFrame(() => textareaRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  if (!open) return null;

  function handleSave() {
    onSave(draft.trim());
    onClose();
  }

  function handleClear() {
    setDraft("");
  }

  const sheet = (
    <div style={menuThemeStyle(theme)}>
      <div
        className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed inset-x-0 bottom-0 z-[71] mx-auto flex w-full max-w-md max-h-[min(92dvh,100%)] flex-col overflow-y-auto rounded-t-3xl bg-white shadow-2xl md:inset-x-auto md:left-1/2 md:top-1/2 md:bottom-auto md:max-h-[min(90vh,640px)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delivery-instructions-title"
      >
        <div className="flex items-center justify-between gap-3 px-5 pb-1 pt-3">
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

        <div className="px-5 pt-3 pb-4">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Note for the entire order"
            rows={4}
            className="ui-textarea min-h-[6.5rem] w-full resize-none rounded-xl border-slate-200 text-sm text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="flex shrink-0 gap-3 border-t border-slate-100 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
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
            style={menuPrimaryButtonStyle(theme)}
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

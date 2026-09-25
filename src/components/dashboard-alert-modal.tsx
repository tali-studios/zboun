"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  heading: string;
  message: string;
  variant?: "success" | "warning";
  onClose: () => void;
  /** When set, shows Cancel + confirm instead of a single OK. */
  confirmLabel?: string;
  onConfirm?: () => void;
  confirmTone?: "primary" | "danger";
  busy?: boolean;
};

export function DashboardAlertModal({
  open,
  heading,
  message,
  variant = "warning",
  onClose,
  confirmLabel,
  onConfirm,
  confirmTone = "primary",
  busy = false,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  const isWarning = variant === "warning";
  const isConfirm = typeof onConfirm === "function";

  // Portal to body so table cells with whitespace-nowrap (etc.) cannot break wrapping.
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[3px]"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="dashboard-alert-title"
      aria-describedby="dashboard-alert-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl text-white shadow-md"
            style={{
              background: isConfirm && confirmTone === "danger"
                ? "linear-gradient(135deg,#f43f5e,#e11d48)"
                : isWarning
                  ? "linear-gradient(135deg,#f59e0b,#d97706)"
                  : "linear-gradient(135deg,#7854ff,#9f3bfe)",
            }}
            aria-hidden
          >
            {isConfirm && confirmTone === "danger" ? "!" : isWarning ? "!" : "✓"}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 id="dashboard-alert-title" className="text-lg font-bold tracking-tight text-slate-900">
              {heading}
            </h2>
            <p
              id="dashboard-alert-desc"
              className="mt-1.5 whitespace-normal break-words text-sm leading-relaxed text-slate-600"
            >
              {message}
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          {isConfirm ? (
            <>
              <button
                type="button"
                className="btn btn-secondary rounded-xl px-5"
                onClick={onClose}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="button"
                className={
                  confirmTone === "danger"
                    ? "inline-flex rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                    : "btn btn-primary rounded-xl px-5"
                }
                onClick={onConfirm}
                disabled={busy}
              >
                {busy ? "Working…" : confirmLabel || "Confirm"}
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-primary rounded-xl px-6" onClick={onClose}>
              OK
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

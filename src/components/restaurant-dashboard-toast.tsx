"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";

type Props = {
  toast: string | undefined | null;
  sectionName?: string | undefined | null;
};

export function RestaurantDashboardToast({ toast, sectionName }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(Boolean(toast));

  const clearToastParams = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete("toast");
    params.delete("section_name");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, router]);

  useEffect(() => {
    if (!toast) return;
    setOpen(true);
    const done = window.setTimeout(() => {
      setOpen(false);
      clearToastParams();
    }, 4200);
    return () => window.clearTimeout(done);
  }, [toast, clearToastParams]);

  if (!toast || !open) return null;

  let heading = "";
  let message: ReactNode = null;

  if (toast === "settings_saved") {
    heading = "All set";
    message = "Your settings were saved.";
  } else if (toast === "section_created") {
    heading = "Section created";
    message = sectionName ? (
      <>
        Section <span className="font-semibold text-slate-900">“{sectionName}”</span> is ready.
      </>
    ) : (
      "Your new menu section is ready."
    );
  } else if (toast === "section_name_required") {
    heading = "Name required";
    message = "Enter a section name before adding.";
  } else {
    return null;
  }

  function dismiss() {
    setOpen(false);
    clearToastParams();
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[3px]"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="dashboard-toast-title"
      aria-describedby="dashboard-toast-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div
        className="w-full max-w-[min(22rem,calc(100vw-2rem))] rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl text-white shadow-md"
            style={{
              background:
                toast === "section_name_required"
                  ? "linear-gradient(135deg,#f59e0b,#d97706)"
                  : "linear-gradient(135deg,#7854ff,#9f3bfe)",
            }}
            aria-hidden
          >
            {toast === "section_name_required" ? "!" : "✓"}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 id="dashboard-toast-title" className="text-lg font-bold tracking-tight text-slate-900">
              {heading}
            </h2>
            <p id="dashboard-toast-desc" className="mt-1.5 text-sm leading-relaxed text-slate-600">
              {message}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button type="button" className="btn btn-primary rounded-xl px-6" onClick={dismiss}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

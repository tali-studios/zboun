"use client";

type Props = {
  open: boolean;
  heading: string;
  message: string;
  variant?: "success" | "warning";
  onClose: () => void;
};

export function DashboardAlertModal({
  open,
  heading,
  message,
  variant = "warning",
  onClose,
}: Props) {
  if (!open) return null;

  const isWarning = variant === "warning";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[3px]"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="dashboard-alert-title"
      aria-describedby="dashboard-alert-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
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
              background: isWarning
                ? "linear-gradient(135deg,#f59e0b,#d97706)"
                : "linear-gradient(135deg,#7854ff,#9f3bfe)",
            }}
            aria-hidden
          >
            {isWarning ? "!" : "✓"}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 id="dashboard-alert-title" className="text-lg font-bold tracking-tight text-slate-900">
              {heading}
            </h2>
            <p id="dashboard-alert-desc" className="mt-1.5 text-sm leading-relaxed text-slate-600">
              {message}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button type="button" className="btn btn-primary rounded-xl px-6" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

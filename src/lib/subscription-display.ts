export function formatSubscriptionStatus(status: string | null | undefined) {
  if (!status) return "No subscription";
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function isSubscriptionPastDue(
  nextDueAt: string | null | undefined,
  status: string | null | undefined,
) {
  if (!nextDueAt) return false;
  if (status === "cancelled" || status === "paused") return false;
  return new Date(nextDueAt).getTime() < Date.now();
}

export function subscriptionStatusBadgeClass(status: string | null | undefined, pastDue: boolean) {
  if (!status) return "bg-slate-100 text-slate-600";
  if (pastDue || status === "overdue") return "bg-red-100 text-red-800";
  if (status === "active" || status === "trial") return "bg-emerald-100 text-emerald-800";
  if (status === "paused") return "bg-amber-100 text-amber-800";
  if (status === "cancelled") return "bg-slate-200 text-slate-700";
  return "bg-slate-100 text-slate-700";
}

export function formatNextDueDate(nextDueAt: string | null | undefined) {
  if (!nextDueAt) return "—";
  return new Date(nextDueAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDaysUntilDue(nextDueAt: string | null | undefined) {
  if (!nextDueAt) return null;
  const due = new Date(nextDueAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 0) return `${diffDays}d left`;
  if (diffDays === 0) return "Due today";
  return `${Math.abs(diffDays)}d overdue`;
}

/** Single-line due date for table cells (avoids stacked layout). */
export function formatNextDueLine(nextDueAt: string | null | undefined) {
  if (!nextDueAt) return "—";
  const date = formatNextDueDate(nextDueAt);
  const days = formatDaysUntilDue(nextDueAt);
  return days ? `${date} · ${days}` : date;
}

import { addMonths, formatDateLong, LIFETIME_FREE_NEXT_DUE_AT } from "@/lib/subscription-billing";

export type ComplimentaryPeriod =
  | { kind: "lifetime" }
  | { kind: "months"; count: number }
  | { kind: "years"; count: number };

export type ComplimentaryUnit = "months" | "years" | "lifetime";

export function complimentaryPeriodLabel(period: ComplimentaryPeriod): string {
  if (period.kind === "lifetime") return "Lifetime";
  if (period.kind === "years") {
    return `${period.count} year${period.count === 1 ? "" : "s"}`;
  }
  return `${period.count} month${period.count === 1 ? "" : "s"}`;
}

export function complimentaryEndDate(period: ComplimentaryPeriod, from = new Date()): Date {
  if (period.kind === "lifetime") return new Date(LIFETIME_FREE_NEXT_DUE_AT);
  if (period.kind === "years") return addMonths(from, period.count * 12);
  return addMonths(from, period.count);
}

export function complimentaryNotes(period: ComplimentaryPeriod, end: Date): string {
  if (period.kind === "lifetime") {
    return "Lifetime complimentary account — no billing.";
  }
  return `Complimentary ${complimentaryPeriodLabel(period)} — free until ${formatDateLong(end)}.`;
}

export function parseComplimentaryPeriodFromForm(formData: FormData): ComplimentaryPeriod {
  const unit = String(formData.get("complimentary_unit") ?? "lifetime").trim() as ComplimentaryUnit;
  const rawAmount = Number(formData.get("complimentary_amount") ?? "1");

  if (unit === "lifetime") return { kind: "lifetime" };
  if (unit === "years") {
    return { kind: "years", count: Math.max(1, Math.min(10, Math.round(rawAmount))) };
  }
  return { kind: "months", count: Math.max(1, Math.min(60, Math.round(rawAmount))) };
}

export function isComplimentaryGrantRequested(formData: FormData): boolean {
  return formData.get("complimentary_free") === "true";
}

export function isTimedComplimentarySubscription(
  billingExempt: boolean,
  billingCyclePrice: number,
  nextDueAt: string | null | undefined,
): boolean {
  if (billingExempt || !nextDueAt) return false;
  if (billingCyclePrice !== 0) return false;
  return new Date(nextDueAt).getTime() < new Date(LIFETIME_FREE_NEXT_DUE_AT).getTime();
}

export function hasComplimentaryAccess(
  billingExempt: boolean,
  billingCyclePrice: number,
  nextDueAt: string | null | undefined,
): boolean {
  if (billingExempt) return true;
  if (!isTimedComplimentarySubscription(billingExempt, billingCyclePrice, nextDueAt)) {
    return false;
  }
  return new Date(nextDueAt as string).getTime() >= Date.now();
}

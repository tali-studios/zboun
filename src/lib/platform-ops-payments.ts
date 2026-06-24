import type { SupabaseClient } from "@supabase/supabase-js";
import { startOfUtcDay } from "@/lib/subscription-billing";
import { sendPlatformOpsPaymentReminderEmail } from "@/lib/platform-ops-payment-emails";
import {
  PLATFORM_OPS_REMINDER_DAYS,
  type PlatformOpsReminderKind,
} from "@/lib/platform-ops-payments-shared";

export type { PlatformOpsReminderKind } from "@/lib/platform-ops-payments-shared";
export {
  PLATFORM_OPS_REMINDER_DAYS,
  PLATFORM_OPS_CATEGORY_LABELS,
  PLATFORM_OPS_REMINDER_LABELS,
} from "@/lib/platform-ops-payments-shared";

export type PlatformOpsPaymentRow = {
  id: string;
  title: string;
  category: string;
  amount: number | null;
  currency: string;
  due_at: string;
  paid_at: string | null;
  notes: string | null;
  reminder_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type PlatformOpsReminderRunResult = {
  checked: number;
  sent: number;
  skipped: number;
  errors: string[];
};

function addUtcDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function toUtcDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function wasReminderSent(
  supabase: SupabaseClient,
  paymentId: string,
  kind: PlatformOpsReminderKind,
  dueDate: string,
) {
  const { data } = await supabase
    .from("platform_ops_payment_reminder_log")
    .select("id")
    .eq("payment_id", paymentId)
    .eq("reminder_kind", kind)
    .eq("due_at", dueDate)
    .maybeSingle();
  return Boolean(data?.id);
}

async function logReminder(
  supabase: SupabaseClient,
  paymentId: string,
  kind: PlatformOpsReminderKind,
  dueDate: string,
) {
  return supabase.from("platform_ops_payment_reminder_log").insert({
    payment_id: paymentId,
    reminder_kind: kind,
    due_at: dueDate,
  });
}

async function fetchPaymentsDueInDays(supabase: SupabaseClient, daysBefore: number) {
  const today = startOfUtcDay(new Date());
  const targetDueDay = addUtcDays(today, daysBefore);
  const targetDate = toUtcDateString(targetDueDay);
  const windowStart = new Date(`${targetDate}T00:00:00.000Z`);
  const windowEnd = addUtcDays(windowStart, 1);

  const { data, error } = await supabase
    .from("platform_ops_payments")
    .select("id, title, category, amount, currency, due_at, paid_at, notes, reminder_enabled")
    .is("paid_at", null)
    .eq("reminder_enabled", true)
    .gte("due_at", windowStart.toISOString())
    .lt("due_at", windowEnd.toISOString());

  if (error) throw new Error(error.message);
  return data ?? [];
}

async function runRemindersForLead(
  supabase: SupabaseClient,
  daysBefore: number,
  reminderKind: PlatformOpsReminderKind,
): Promise<PlatformOpsReminderRunResult> {
  const payments = await fetchPaymentsDueInDays(supabase, daysBefore);
  const result: PlatformOpsReminderRunResult = {
    checked: payments.length,
    sent: 0,
    skipped: 0,
    errors: [],
  };

  for (const payment of payments) {
    const dueAt = new Date(payment.due_at);
    const dueDate = toUtcDateString(dueAt);

    try {
      if (await wasReminderSent(supabase, payment.id, reminderKind, dueDate)) {
        result.skipped += 1;
        continue;
      }

      const sent = await sendPlatformOpsPaymentReminderEmail({
        title: payment.title,
        category: payment.category,
        amount: payment.amount != null ? Number(payment.amount) : null,
        currency: payment.currency ?? "USD",
        dueAt,
        notes: payment.notes,
        reminderKind,
      });

      if (!sent) {
        result.errors.push(`${payment.title}: SMTP not configured`);
        continue;
      }

      const { error: logError } = await logReminder(supabase, payment.id, reminderKind, dueDate);
      if (logError) {
        result.errors.push(`${payment.title}: ${logError.message}`);
        continue;
      }

      result.sent += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown_error";
      result.errors.push(`${payment.title}: ${message}`);
    }
  }

  return result;
}

/** Daily cron: 30-day, 7-day, and 3-day reminders for unpaid platform expenses. */
export async function runPlatformOpsPaymentReminders(
  supabase: SupabaseClient,
): Promise<Record<PlatformOpsReminderKind, PlatformOpsReminderRunResult>> {
  const [oneMonth, oneWeek, threeDays] = await Promise.all([
    runRemindersForLead(supabase, PLATFORM_OPS_REMINDER_DAYS.one_month, "one_month"),
    runRemindersForLead(supabase, PLATFORM_OPS_REMINDER_DAYS.one_week, "one_week"),
    runRemindersForLead(supabase, PLATFORM_OPS_REMINDER_DAYS.three_days, "three_days"),
  ]);

  return {
    one_month: oneMonth,
    one_week: oneWeek,
    three_days: threeDays,
  };
}

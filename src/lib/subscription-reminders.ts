import type { SupabaseClient } from "@supabase/supabase-js";
import {
  REMINDER_DAYS_BEFORE_DUE,
  REMINDER_DAYS_FINAL,
  startOfUtcDay,
  getLatestSubscription,
  getRestaurantAdminEmail,
  isSubscriptionAccessValid,
  type SubscriptionReminderKind,
} from "@/lib/subscription-billing";
import { ZBOUN_PRICING } from "@/lib/pricing";
import { sendSubscriptionExpiryReminderEmail } from "@/lib/subscription-emails";
import {
  deactivateRestaurantForSubscription,
  revalidateRestaurantPublicCaches,
} from "@/lib/subscription-lifecycle";

function addUtcDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function toUtcDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

export type ReminderRunResult = {
  checked: number;
  sent: number;
  skipped: number;
  errors: string[];
};

export type SubscriptionCronResult = {
  tenDay: ReminderRunResult;
  threeDay: ReminderRunResult;
  expirations: ExpirationRunResult;
};

export type ExpirationRunResult = {
  checked: number;
  deactivated: number;
  emailsSent: number;
  skipped: number;
  errors: string[];
};

type SubscriptionRow = {
  id: string;
  restaurant_id: string;
  next_due_at: string;
  billing_cycle_price: number | string;
  status: string;
  restaurants: { name?: string; is_active?: boolean; billing_exempt?: boolean } | null;
};

async function wasReminderSent(
  supabase: SupabaseClient,
  subscriptionId: string,
  kind: SubscriptionReminderKind,
  dueDate: string,
) {
  const { data } = await supabase
    .from("subscription_reminder_log")
    .select("id")
    .eq("subscription_id", subscriptionId)
    .eq("reminder_kind", kind)
    .eq("due_at", dueDate)
    .maybeSingle();
  return Boolean(data?.id);
}

async function logReminder(
  supabase: SupabaseClient,
  subscriptionId: string,
  kind: SubscriptionReminderKind,
  dueDate: string,
) {
  return supabase.from("subscription_reminder_log").insert({
    subscription_id: subscriptionId,
    reminder_kind: kind,
    due_at: dueDate,
  });
}

async function fetchSubscriptionsDueInDays(
  supabase: SupabaseClient,
  daysBefore: number,
) {
  const today = startOfUtcDay(new Date());
  const targetDueDay = addUtcDays(today, daysBefore);
  const targetDate = toUtcDateString(targetDueDay);
  const windowStart = new Date(`${targetDate}T00:00:00.000Z`);
  const windowEnd = addUtcDays(windowStart, 1);

  const { data, error } = await supabase
    .from("restaurant_subscriptions")
    .select(
      "id, restaurant_id, next_due_at, billing_cycle_price, status, restaurants(name, is_active, billing_exempt)",
    )
    .in("status", ["active", "trial"])
    .not("next_due_at", "is", null)
    .gte("next_due_at", windowStart.toISOString())
    .lt("next_due_at", windowEnd.toISOString());

  if (error) throw new Error(error.message);
  return (data ?? []) as SubscriptionRow[];
}

async function runDayBeforeReminders(
  supabase: SupabaseClient,
  daysBefore: number,
  reminderKind: Extract<SubscriptionReminderKind, "ten_day_expiry" | "three_day_expiry">,
): Promise<ReminderRunResult> {
  const subscriptions = await fetchSubscriptionsDueInDays(supabase, daysBefore);
  const result: ReminderRunResult = {
    checked: subscriptions.length,
    sent: 0,
    skipped: 0,
    errors: [],
  };

  for (const row of subscriptions) {
    const subscriptionId = row.id;
    const restaurantId = row.restaurant_id;
    const dueAt = new Date(row.next_due_at);
    const dueDate = toUtcDateString(dueAt);
    const restaurantName = row.restaurants?.name ?? "Restaurant";

    if (row.restaurants?.billing_exempt) {
      result.skipped += 1;
      continue;
    }

    if (await wasReminderSent(supabase, subscriptionId, reminderKind, dueDate)) {
      result.skipped += 1;
      continue;
    }

    const adminEmail = await getRestaurantAdminEmail(supabase, restaurantId);
    if (!adminEmail) {
      result.errors.push(`No admin email for restaurant ${restaurantId}`);
      result.skipped += 1;
      continue;
    }

    try {
      await sendSubscriptionExpiryReminderEmail({
        restaurantName,
        adminEmail,
        dueAt,
        monthlyPrice: Number(row.billing_cycle_price ?? ZBOUN_PRICING.monthly),
        daysBefore,
      });

      const { error: logError } = await logReminder(
        supabase,
        subscriptionId,
        reminderKind,
        dueDate,
      );
      if (logError) {
        result.errors.push(
          `Reminder sent but log failed for ${subscriptionId}: ${logError.message}`,
        );
      } else {
        result.sent += 1;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown_error";
      result.errors.push(`Subscription ${subscriptionId}: ${message}`);
    }
  }

  return result;
}

/** 10-day-before-due reminders (restaurant admin + ops). */
export async function runTenDayExpiryReminders(supabase: SupabaseClient) {
  return runDayBeforeReminders(supabase, REMINDER_DAYS_BEFORE_DUE, "ten_day_expiry");
}

/** 3-day-before-due reminders (restaurant admin + ops). */
export async function runThreeDayExpiryReminders(supabase: SupabaseClient) {
  return runDayBeforeReminders(supabase, REMINDER_DAYS_FINAL, "three_day_expiry");
}

/** Deactivate expired subscriptions, mark overdue, email admin + ops. */
export async function runExpiredSubscriptionDeactivations(
  supabase: SupabaseClient,
): Promise<ExpirationRunResult> {
  const nowIso = new Date().toISOString();

  const { data: subscriptions, error } = await supabase
    .from("restaurant_subscriptions")
    .select(
      "id, restaurant_id, next_due_at, billing_cycle_price, status, restaurants(name, is_active, billing_exempt)",
    )
    .in("status", ["active", "trial", "overdue"])
    .not("next_due_at", "is", null)
    .lt("next_due_at", nowIso);

  if (error) throw new Error(error.message);

  const result: ExpirationRunResult = {
    checked: subscriptions?.length ?? 0,
    deactivated: 0,
    emailsSent: 0,
    skipped: 0,
    errors: [],
  };

  for (const row of (subscriptions ?? []) as SubscriptionRow[]) {
    const subscriptionId = row.id;
    const restaurantId = row.restaurant_id;
    const dueAt = new Date(row.next_due_at);
    const dueDate = toUtcDateString(dueAt);
    const restaurantName = row.restaurants?.name ?? "Restaurant";
    const wasActive = row.restaurants?.is_active !== false;

    if (row.restaurants?.billing_exempt) {
      result.skipped += 1;
      continue;
    }

    const latest = await getLatestSubscription(supabase, restaurantId);
    if (!latest || latest.id !== subscriptionId || isSubscriptionAccessValid(latest)) {
      result.skipped += 1;
      continue;
    }

    const alreadyHandled = await wasReminderSent(
      supabase,
      subscriptionId,
      "expired_deactivated",
      dueDate,
    );

    if (alreadyHandled && !wasActive && row.status === "overdue") {
      result.skipped += 1;
      continue;
    }

    try {
      const outcome = await deactivateRestaurantForSubscription(supabase, {
        restaurantId,
        subscriptionId,
        restaurantName,
        dueAt,
        billingPrice: Number(row.billing_cycle_price ?? ZBOUN_PRICING.monthly),
        reason: "expired",
        sendEmail: !alreadyHandled,
        subscriptionStatus: "overdue",
      });

      if (outcome.deactivated) {
        result.deactivated += 1;
        if (outcome.emailSent) result.emailsSent += 1;
        if (!alreadyHandled && !outcome.emailSent) {
          result.errors.push(`Deactivated ${restaurantId} but deactivation email was not sent`);
        }
      } else if (outcome.error) {
        result.errors.push(`Subscription ${subscriptionId}: ${outcome.error}`);
      } else {
        result.skipped += 1;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown_error";
      result.errors.push(`Subscription ${subscriptionId}: ${message}`);
    }
  }

  if (result.deactivated > 0) {
    revalidateRestaurantPublicCaches();
  }

  return result;
}

/** All subscription cron tasks (10d + 3d reminders, expiry deactivation). */
export async function runAllSubscriptionCronJobs(
  supabase: SupabaseClient,
): Promise<SubscriptionCronResult> {
  const tenDay = await runTenDayExpiryReminders(supabase);
  const threeDay = await runThreeDayExpiryReminders(supabase);
  const expirations = await runExpiredSubscriptionDeactivations(supabase);
  return { tenDay, threeDay, expirations };
}

/** @deprecated Use runAllSubscriptionCronJobs */
export async function runSubscriptionExpiryReminders(supabase: SupabaseClient) {
  return runTenDayExpiryReminders(supabase);
}

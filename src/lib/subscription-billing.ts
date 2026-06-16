import type { SupabaseClient } from "@supabase/supabase-js";
import { ZBOUN_PRICING } from "@/lib/pricing";

function toPeriodDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** Idempotent invoice for a subscription billing period. */
export async function createSubscriptionPeriodInvoice(
  supabase: SupabaseClient,
  params: {
    restaurantId: string;
    subscriptionId: string;
    periodStart: Date;
    periodEnd: Date;
    amountDue: number;
    notes?: string;
  },
) {
  const periodStart = toPeriodDate(params.periodStart);
  const periodEnd = toPeriodDate(params.periodEnd);

  const { data: existing } = await supabase
    .from("invoices")
    .select("id")
    .eq("subscription_id", params.subscriptionId)
    .eq("period_start", periodStart)
    .eq("period_end", periodEnd)
    .maybeSingle();

  if (existing?.id) return { invoiceId: existing.id as string, created: false as const };

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      restaurant_id: params.restaurantId,
      subscription_id: params.subscriptionId,
      period_start: periodStart,
      period_end: periodEnd,
      amount_due: params.amountDue,
      amount_paid: 0,
      status: "unpaid",
      due_at: params.periodEnd.toISOString(),
      notes: params.notes ?? "Subscription period invoice (auto-generated).",
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create subscription invoice.");
  }

  return { invoiceId: data.id as string, created: true as const };
}

export const SUBSCRIPTION_PERIOD_MONTHS = 1;
export const REMINDER_DAYS_BEFORE_DUE = 10;
export const REMINDER_DAYS_FINAL = 3;
/** Far-future due date for lifetime complimentary accounts. */
export const LIFETIME_FREE_NEXT_DUE_AT = "2099-12-31T23:59:59.999Z";

export type SubscriptionReminderKind =
  | "ten_day_expiry"
  | "three_day_expiry"
  | "expired_deactivated";

export function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function formatDateLong(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function getOrCreateMonthlyPlanId(supabase: SupabaseClient) {
  const { data: existing } = await supabase
    .from("subscription_plans")
    .select("id, price")
    .eq("interval", "monthly")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existing?.id) return { planId: existing.id, price: Number(existing.price) };

  const { data: created, error } = await supabase
    .from("subscription_plans")
    .insert({
      name: "Monthly",
      interval: "monthly",
      price: ZBOUN_PRICING.monthly,
      is_active: true,
    })
    .select("id, price")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "Could not create monthly subscription plan.");
  }
  return { planId: created.id, price: Number(created.price) };
}

export async function createInitialSubscription(
  supabase: SupabaseClient,
  restaurantId: string,
) {
  const { planId, price } = await getOrCreateMonthlyPlanId(supabase);
  const startAt = new Date();
  const nextDueAt = addMonths(startAt, SUBSCRIPTION_PERIOD_MONTHS);

  const { data, error } = await supabase
    .from("restaurant_subscriptions")
    .insert({
      restaurant_id: restaurantId,
      plan_id: planId,
      status: "active",
      start_at: startAt.toISOString(),
      next_due_at: nextDueAt.toISOString(),
      billing_cycle_price: price,
      notes: "Initial subscription created with restaurant account.",
    })
    .select("id, next_due_at, billing_cycle_price")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create subscription.");
  }

  const subscriptionId = data.id as string;
  const billingPrice = Number(data.billing_cycle_price);

  await createSubscriptionPeriodInvoice(supabase, {
    restaurantId,
    subscriptionId,
    periodStart: startAt,
    periodEnd: nextDueAt,
    amountDue: billingPrice,
    notes: "Initial subscription period invoice.",
  });

  return {
    subscriptionId,
    nextDueAt: new Date(data.next_due_at as string),
    billingPrice,
    periodStart: startAt,
    periodEnd: nextDueAt,
  };
}

export async function isRestaurantBillingExempt(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("restaurants")
    .select("billing_exempt")
    .eq("id", restaurantId)
    .maybeSingle();

  return Boolean(data?.billing_exempt);
}

/** Subscription with no invoices, no expiry enforcement, and no payment reminders. */
export async function createComplimentarySubscription(
  supabase: SupabaseClient,
  restaurantId: string,
) {
  const { planId } = await getOrCreateMonthlyPlanId(supabase);
  const startAt = new Date();
  const nextDueAt = new Date(LIFETIME_FREE_NEXT_DUE_AT);

  const { data, error } = await supabase
    .from("restaurant_subscriptions")
    .insert({
      restaurant_id: restaurantId,
      plan_id: planId,
      status: "active",
      start_at: startAt.toISOString(),
      next_due_at: nextDueAt.toISOString(),
      billing_cycle_price: 0,
      notes: "Lifetime complimentary account — no billing.",
    })
    .select("id, next_due_at, billing_cycle_price")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create complimentary subscription.");
  }

  return {
    subscriptionId: data.id as string,
    nextDueAt,
    billingPrice: 0,
    periodStart: startAt,
    periodEnd: nextDueAt,
  };
}

/** Mark a restaurant as lifetime free and align its subscription row. */
export async function applyComplimentaryBilling(
  supabase: SupabaseClient,
  restaurantId: string,
) {
  const nowIso = new Date().toISOString();
  const sub = await getLatestSubscription(supabase, restaurantId);

  const { error: restaurantError } = await supabase
    .from("restaurants")
    .update({ billing_exempt: true, is_active: true })
    .eq("id", restaurantId);

  if (restaurantError) {
    throw new Error(restaurantError.message);
  }

  if (sub?.id) {
    const { error } = await supabase
      .from("restaurant_subscriptions")
      .update({
        status: "active",
        ended_at: null,
        next_due_at: LIFETIME_FREE_NEXT_DUE_AT,
        billing_cycle_price: 0,
        notes: "Lifetime complimentary account — no billing.",
        updated_at: nowIso,
      })
      .eq("id", sub.id);

    if (error) {
      throw new Error(error.message);
    }

    return {
      subscriptionId: sub.id as string,
      nextDueAt: new Date(LIFETIME_FREE_NEXT_DUE_AT),
      billingPrice: 0,
    };
  }

  return createComplimentarySubscription(supabase, restaurantId);
}

export type SubscriptionAccessRow = {
  id: string;
  status: string;
  next_due_at: string | null;
};

export async function getLatestSubscription(
  supabase: SupabaseClient,
  restaurantId: string,
) {
  const { data } = await supabase
    .from("restaurant_subscriptions")
    .select("id, status, next_due_at, billing_cycle_price, start_at")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

/** True when the latest subscription period has not ended and access is allowed. */
export function isSubscriptionAccessValid(
  sub: Pick<SubscriptionAccessRow, "status" | "next_due_at"> | null | undefined,
): boolean {
  if (!sub?.next_due_at) return false;
  if (sub.status === "paused" || sub.status === "cancelled") return false;
  return new Date(sub.next_due_at).getTime() >= Date.now();
}

export async function renewRestaurantSubscription(
  supabase: SupabaseClient,
  restaurantId: string,
) {
  if (await isRestaurantBillingExempt(supabase, restaurantId)) {
    const existing = await getLatestSubscription(supabase, restaurantId);
    const now = new Date();
    if (existing?.id) {
      await supabase
        .from("restaurants")
        .update({ is_active: true })
        .eq("id", restaurantId);
      return {
        subscriptionId: existing.id as string,
        nextDueAt: new Date(existing.next_due_at ?? LIFETIME_FREE_NEXT_DUE_AT),
        billingPrice: 0,
        periodStart: existing.start_at ? new Date(existing.start_at) : now,
        periodEnd: new Date(existing.next_due_at ?? LIFETIME_FREE_NEXT_DUE_AT),
        renewed: true as const,
      };
    }
    const created = await createComplimentarySubscription(supabase, restaurantId);
    return { ...created, renewed: true as const };
  }

  const existing = await getLatestSubscription(supabase, restaurantId);
  const now = new Date();

  if (!existing) {
    const created = await createInitialSubscription(supabase, restaurantId);
    return { ...created, renewed: true as const };
  }

  const currentDue = existing.next_due_at ? new Date(existing.next_due_at) : now;
  const base = currentDue.getTime() > now.getTime() ? currentDue : now;
  const periodStart = new Date(base);
  const nextDueAt = addMonths(periodStart, SUBSCRIPTION_PERIOD_MONTHS);

  const { error } = await supabase
    .from("restaurant_subscriptions")
    .update({
      status: "active",
      ended_at: null,
      next_due_at: nextDueAt.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", existing.id);

  if (error) {
    throw new Error(error.message);
  }

  const billingPrice = Number(existing.billing_cycle_price ?? ZBOUN_PRICING.monthly);

  await createSubscriptionPeriodInvoice(supabase, {
    restaurantId,
    subscriptionId: existing.id as string,
    periodStart,
    periodEnd: nextDueAt,
    amountDue: billingPrice,
    notes: "Renewed subscription period invoice.",
  });

  return {
    subscriptionId: existing.id as string,
    nextDueAt,
    billingPrice,
    periodStart,
    periodEnd: nextDueAt,
    renewed: true as const,
  };
}

/** Create subscription rows for restaurants that pre-date billing (idempotent). */
export async function backfillMissingSubscriptions(
  supabase: SupabaseClient,
  restaurants: { id: string; created_at: string; is_active: boolean; billing_exempt?: boolean }[],
) {
  if (restaurants.length === 0) return 0;

  const { planId, price } = await getOrCreateMonthlyPlanId(supabase);
  const restaurantIds = restaurants.map((r) => r.id);

  const { data: existing, error: listError } = await supabase
    .from("restaurant_subscriptions")
    .select("restaurant_id")
    .in("restaurant_id", restaurantIds);

  if (listError) {
    throw new Error(listError.message);
  }

  const hasSubscription = new Set((existing ?? []).map((row) => row.restaurant_id));
  const missing = restaurants.filter((r) => !hasSubscription.has(r.id));
  if (missing.length === 0) return 0;

  const now = new Date();
  const rows = missing.map((restaurant) => {
    if (restaurant.billing_exempt) {
      return {
        restaurant_id: restaurant.id,
        plan_id: planId,
        status: "active",
        start_at: new Date(restaurant.created_at).toISOString(),
        next_due_at: LIFETIME_FREE_NEXT_DUE_AT,
        billing_cycle_price: 0,
        ended_at: null,
        notes: "Lifetime complimentary account — no billing.",
      };
    }

    const startAt = new Date(restaurant.created_at);
    const nextDueAt = addMonths(startAt, SUBSCRIPTION_PERIOD_MONTHS);
    const expired = nextDueAt.getTime() < now.getTime();
    const status = expired ? "overdue" : restaurant.is_active ? "active" : "overdue";

    return {
      restaurant_id: restaurant.id,
      plan_id: planId,
      status,
      start_at: startAt.toISOString(),
      next_due_at: nextDueAt.toISOString(),
      billing_cycle_price: price,
      ended_at: expired ? nextDueAt.toISOString() : null,
      notes: "Backfilled subscription for existing business.",
    };
  });

  const { error: insertError } = await supabase.from("restaurant_subscriptions").insert(rows);
  if (insertError) {
    throw new Error(insertError.message);
  }

  return missing.length;
}

export async function getRestaurantAdminEmail(
  supabase: SupabaseClient,
  restaurantId: string,
) {
  const { data } = await supabase
    .from("users")
    .select("email, name")
    .eq("restaurant_id", restaurantId)
    .eq("role", "restaurant_admin")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data?.email ?? null;
}

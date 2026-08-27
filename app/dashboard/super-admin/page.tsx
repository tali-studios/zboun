import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { SuperAdminContractGenerator } from "@/components/super-admin-contract-generator";
import { SuperAdminCreateRestaurantForm } from "@/components/super-admin-create-restaurant-form";
import { SuperAdminFinancePanel } from "@/components/super-admin-finance-panel";
import { SuperAdminOpsPaymentsPanel } from "@/components/super-admin-ops-payments-panel";
import { SuperAdminRestaurantsPanel } from "@/components/super-admin-restaurants-panel";
import { SuperAdminUsersPanel } from "@/components/super-admin-users-panel";
import {
  SuperAdminHeader,
  SuperAdminMetric,
  SuperAdminMetricsBlock,
  SuperAdminSection,
  SuperAdminShell,
} from "@/components/super-admin-chrome";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { backfillMissingSubscriptions } from "@/lib/subscription-billing";
import type { PlatformOpsReminderKind } from "@/lib/platform-ops-payments-shared";
import type { PlatformOpsPaymentItem } from "@/components/super-admin-ops-payments-panel";

import { getPublicAppUrl } from "@/lib/public-app-url";
import { CopyableInviteLink } from "@/components/copyable-invite-link";

export const dynamic = "force-dynamic";

type PlatformUserRole = "superadmin" | "restaurant_admin" | "customer" | "unknown";

type Props = {
  searchParams: Promise<{ success?: string; error?: string; invite_link?: string; email?: string }>;
};

export default async function SuperAdminPage({ searchParams }: Props) {
  const { success, error, invite_link, email } = await searchParams;
  const appUser = await getCurrentUserRole();
  if (!appUser || appUser.role !== "superadmin") {
    redirect("/dashboard/login");
  }

  const supabase = await createServerSupabaseClient();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dataClient =
    env.supabaseUrl && serviceRoleKey
      ? createClient(env.supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : supabase;
  const { data: restaurants } = await dataClient
    .from("restaurants")
    .select("id, name, slug, phone, business_type, is_active, billing_exempt, show_on_home, browse_sections, created_at")
    .order("created_at", { ascending: false });

  if (restaurants?.length) {
    try {
      await backfillMissingSubscriptions(dataClient, restaurants);
    } catch {
      // Dashboard still loads if backfill fails (e.g. plans table missing).
    }
  }

  const [
    { data: categories },
    { data: items },
    { data: admins },
    { data: plans },
    { data: subscriptions },
    { data: invoices },
    { data: payments },
    { data: addons },
    { data: authUsersPage, error: authUsersError },
    { data: appUsers },
    { data: customerProfiles },
  ] =
    await Promise.all([
      dataClient.from("categories").select("id, restaurant_id"),
      dataClient.from("menu_items").select("id, restaurant_id"),
      dataClient
        .from("users")
        .select("restaurant_id, email")
        .eq("role", "restaurant_admin"),
      dataClient
        .from("subscription_plans")
        .select("id, name, interval, price, is_active")
        .eq("is_active", true)
        .order("price", { ascending: true }),
      dataClient
        .from("restaurant_subscriptions")
        .select("id, restaurant_id, plan_id, status, start_at, next_due_at, billing_cycle_price, created_at"),
      dataClient
        .from("invoices")
        .select("id, restaurant_id, subscription_id, amount_due, amount_paid, status, due_at, created_at"),
      dataClient
        .from("payments")
        .select("id, invoice_id, restaurant_id, amount_paid, paid_at, method, reference_note, created_at")
        .order("paid_at", { ascending: false }),
      dataClient
        .from("restaurant_addons")
        .select("restaurant_id, addon_key, is_enabled"),
      dataClient.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      dataClient.from("users").select("id, role, name, email"),
      dataClient.from("customer_profiles").select("id, name, email"),
    ]);

  if (authUsersError) {
    redirect(`/dashboard/super-admin?error=${encodeURIComponent(authUsersError.message)}`);
  }
  const authUsers = authUsersPage?.users ?? [];

  let opsPayments: PlatformOpsPaymentItem[] = [];
  const { data: opsPaymentsRaw, error: opsPaymentsError } = await dataClient
    .from("platform_ops_payments")
    .select("id, title, category, amount, currency, due_at, paid_at, notes, reminder_enabled")
    .order("due_at", { ascending: true });

  if (!opsPaymentsError && opsPaymentsRaw) {
    const { data: opsReminderLog } = await dataClient
      .from("platform_ops_payment_reminder_log")
      .select("payment_id, reminder_kind, due_at");

    opsPayments = opsPaymentsRaw.map((row) => {
      const dueKey = String(row.due_at).slice(0, 10);
      const reminders_sent = (opsReminderLog ?? [])
        .filter(
          (log) =>
            log.payment_id === row.id &&
            String(log.due_at).slice(0, 10) === dueKey,
        )
        .map((log) => log.reminder_kind as PlatformOpsReminderKind);

      return {
        id: row.id as string,
        title: row.title as string,
        category: row.category as string,
        amount: row.amount != null ? Number(row.amount) : null,
        currency: (row.currency as string) ?? "USD",
        due_at: row.due_at as string,
        paid_at: (row.paid_at as string | null) ?? null,
        notes: (row.notes as string | null) ?? null,
        reminder_enabled: Boolean(row.reminder_enabled),
        reminders_sent,
      };
    });
  }

  const appUsersById = new Map((appUsers ?? []).map((u) => [u.id, u]));
  const customersById = new Map((customerProfiles ?? []).map((u) => [u.id, u]));

  const platformUsers = authUsers.map((u) => {
    const appRow = appUsersById.get(u.id);
    const customerRow = customersById.get(u.id);
    const role: PlatformUserRole =
      appRow?.role === "superadmin"
        ? "superadmin"
        : appRow?.role === "restaurant_admin"
          ? "restaurant_admin"
          : customerRow
            ? "customer"
            : "unknown";
    return {
      id: u.id,
      email: u.email ?? appRow?.email ?? customerRow?.email ?? "unknown",
      role,
      name: appRow?.name ?? customerRow?.name ?? "",
      created_at: u.created_at ?? null,
      last_sign_in_at: u.last_sign_in_at ?? null,
      is_blocked: Boolean(u.banned_until && new Date(u.banned_until) > new Date()),
    };
  });

  const categoryCountByRestaurant = (categories ?? []).reduce<Record<string, number>>(
    (acc, category) => {
      acc[category.restaurant_id] = (acc[category.restaurant_id] ?? 0) + 1;
      return acc;
    },
    {},
  );

  const itemCountByRestaurant = (items ?? []).reduce<Record<string, number>>((acc, item) => {
    acc[item.restaurant_id] = (acc[item.restaurant_id] ?? 0) + 1;
    return acc;
  }, {});

  const adminEmailByRestaurant = (admins ?? []).reduce<Record<string, string>>((acc, admin) => {
    if (admin.restaurant_id && admin.email) {
      acc[admin.restaurant_id] = admin.email;
    }
    return acc;
  }, {});

  const planById = (plans ?? []).reduce<Record<string, { name: string }>>((acc, plan) => {
    acc[plan.id] = { name: plan.name };
    return acc;
  }, {});

  const latestSubscriptionByRestaurant = (subscriptions ?? []).reduce<
    Record<
      string,
      {
        id: string;
        status: string;
        start_at: string | null;
        next_due_at: string | null;
        billing_cycle_price: number;
        created_at: string;
        plan_name: string | null;
      }
    >
  >((acc, sub) => {
    const existing = acc[sub.restaurant_id];
    const next = {
      id: sub.id,
      status: sub.status,
      start_at: sub.start_at ?? null,
      next_due_at: sub.next_due_at,
      billing_cycle_price: Number(sub.billing_cycle_price ?? 0),
      created_at: sub.created_at,
      plan_name: sub.plan_id ? planById[sub.plan_id]?.name ?? null : null,
    };
    if (!existing || new Date(next.created_at) > new Date(existing.created_at)) {
      acc[sub.restaurant_id] = next;
    }
    return acc;
  }, {});

  const lastPaymentByRestaurant = (payments ?? []).reduce<Record<string, string>>((acc, payment) => {
    if (!acc[payment.restaurant_id]) {
      acc[payment.restaurant_id] = payment.paid_at;
    }
    return acc;
  }, {});

  const outstandingByRestaurant = (invoices ?? []).reduce<Record<string, number>>((acc, invoice) => {
    const due = Number(invoice.amount_due ?? 0);
    const paid = Number(invoice.amount_paid ?? 0);
    const outstanding = Math.max(0, due - paid);
    if (invoice.status === "unpaid" || invoice.status === "partial") {
      acc[invoice.restaurant_id] = (acc[invoice.restaurant_id] ?? 0) + outstanding;
    }
    return acc;
  }, {});

  const addonsByRestaurant = (addons ?? []).reduce<Record<string, Record<string, boolean>>>(
    (acc, row) => {
      if (!acc[row.restaurant_id]) acc[row.restaurant_id] = {};
      acc[row.restaurant_id][row.addon_key] = row.is_enabled;
      return acc;
    },
    {},
  );

  const restaurantsWithDetails = (restaurants ?? []).map((restaurant) => ({
    ...restaurant,
    category_count: categoryCountByRestaurant[restaurant.id] ?? 0,
    item_count: itemCountByRestaurant[restaurant.id] ?? 0,
    admin_email: adminEmailByRestaurant[restaurant.id] ?? "No admin linked",
    subscription_id: latestSubscriptionByRestaurant[restaurant.id]?.id ?? null,
    plan_name: latestSubscriptionByRestaurant[restaurant.id]?.plan_name ?? null,
    subscription_status: latestSubscriptionByRestaurant[restaurant.id]?.status ?? null,
    next_due_at: latestSubscriptionByRestaurant[restaurant.id]?.next_due_at ?? null,
    billing_cycle_price: latestSubscriptionByRestaurant[restaurant.id]?.billing_cycle_price ?? 0,
    last_payment_at: lastPaymentByRestaurant[restaurant.id] ?? null,
    outstanding_balance: outstandingByRestaurant[restaurant.id] ?? 0,
    addons: addonsByRestaurant[restaurant.id] ?? {},
  }));

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const now = new Date();

  const billingExemptRestaurantIds = new Set(
    (restaurants ?? []).filter((restaurant) => restaurant.billing_exempt).map((restaurant) => restaurant.id),
  );

  const expectedMonthlyRevenue = (subscriptions ?? [])
    .filter(
      (sub) =>
        (sub.status === "active" || sub.status === "trial" || sub.status === "overdue") &&
        !billingExemptRestaurantIds.has(sub.restaurant_id),
    )
    .reduce((sum, sub) => sum + Number(sub.billing_cycle_price ?? 0), 0);

  const collectedThisMonth = (payments ?? [])
    .filter((payment) => new Date(payment.paid_at) >= monthStart)
    .reduce((sum, payment) => sum + Number(payment.amount_paid ?? 0), 0);

  const overdueInvoices = (invoices ?? []).filter(
    (invoice) =>
      (invoice.status === "unpaid" || invoice.status === "partial") &&
      new Date(invoice.due_at) < now,
  );
  const overdueAmount = overdueInvoices.reduce(
    (sum, invoice) => sum + Math.max(0, Number(invoice.amount_due ?? 0) - Number(invoice.amount_paid ?? 0)),
    0,
  );
  const outstandingAmount = (invoices ?? []).reduce((sum, invoice) => {
    if (invoice.status === "unpaid" || invoice.status === "partial") {
      return sum + Math.max(0, Number(invoice.amount_due ?? 0) - Number(invoice.amount_paid ?? 0));
    }
    return sum;
  }, 0);

  const contractPresets = restaurantsWithDetails.map((restaurant) => {
    const sub = latestSubscriptionByRestaurant[restaurant.id];
    return {
      id: restaurant.id,
      name: restaurant.name,
      adminEmail:
        restaurant.admin_email && restaurant.admin_email !== "No admin linked"
          ? restaurant.admin_email
          : "",
      effectiveDate: sub?.start_at ?? restaurant.created_at ?? null,
      subscriptionEndDate: restaurant.next_due_at ?? null,
    };
  });

  const stats = {
    totalRestaurants: restaurantsWithDetails.length,
    activeRestaurants: restaurantsWithDetails.filter((restaurant) => restaurant.is_active).length,
    totalSections: restaurantsWithDetails.reduce((sum, restaurant) => sum + restaurant.category_count, 0),
    totalItems: restaurantsWithDetails.reduce((sum, restaurant) => sum + restaurant.item_count, 0),
    expectedMonthlyRevenue,
    collectedThisMonth,
    overdueAmount,
    overdueInvoicesCount: overdueInvoices.length,
    outstandingAmount,
  };

  return (
    <SuperAdminShell>
        <SuperAdminHeader />

        <SuperAdminMetricsBlock
          id="overview"
          title="Platform overview"
          description="Stores and accounts across zboun.net"
        >
          <SuperAdminMetric
            label="Businesses"
            value={stats.totalRestaurants}
            tone="neutral"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            }
          />
          <SuperAdminMetric
            label="Active stores"
            value={stats.activeRestaurants}
            hint={`${stats.totalRestaurants - stats.activeRestaurants} inactive`}
            tone="accent"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <SuperAdminMetric
            label="Total users"
            value={platformUsers.length}
            tone="neutral"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            }
          />
          <SuperAdminMetric
            label="Active users"
            value={platformUsers.filter((u) => !u.is_blocked).length}
            tone="success"
            icon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            }
          />
        </SuperAdminMetricsBlock>

        <SuperAdminMetricsBlock
          id="billing"
          title="Billing health"
          description="Subscription revenue and collections this month"
          columns={5}
        >
          <SuperAdminMetric
            label="Expected monthly"
            value={`$${stats.expectedMonthlyRevenue.toFixed(2)}`}
            tone="neutral"
          />
          <SuperAdminMetric
            label="Collected this month"
            value={`$${stats.collectedThisMonth.toFixed(2)}`}
            tone="accent"
          />
          <SuperAdminMetric
            label="Overdue amount"
            value={`$${stats.overdueAmount.toFixed(2)}`}
            tone={stats.overdueAmount > 0 ? "danger" : "success"}
          />
          <SuperAdminMetric
            label="Overdue invoices"
            value={stats.overdueInvoicesCount}
            tone={stats.overdueInvoicesCount > 0 ? "warning" : "success"}
          />
          <SuperAdminMetric
            label="Outstanding total"
            value={`$${stats.outstandingAmount.toFixed(2)}`}
            tone={stats.outstandingAmount > 0 ? "warning" : "neutral"}
          />
        </SuperAdminMetricsBlock>

        {success === "restaurant_created" && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
            Business created successfully. Admin invite email has been sent.
          </p>
        )}
        {success === "restaurant_created_invite_email_failed" && invite_link && email && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
            <p className="text-sm font-medium text-amber-700">
              Business was created, but the invite email failed to send.
            </p>
            <div className="rounded-lg border border-amber-300 bg-white p-3 text-sm">
              <p className="font-semibold text-amber-900">Share this invite link manually:</p>
              <p className="mt-2"><strong>Email:</strong> {email}</p>
              <p className="mt-2"><strong>Invite Link:</strong></p>
              <CopyableInviteLink link={invite_link} tone="amber" />
              <p className="mt-2 text-xs text-amber-700">⚠️ Admin will set their own password via this link. It expires soon (~1 hour by default) — use “Resend invite” from the list below if it dies.</p>
            </div>
          </div>
        )}
        {success === "restaurant_created_emails_failed" && invite_link && email && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-2">
            <p className="text-sm font-medium text-red-700">
              Business was created, but both emails failed to send.
            </p>
            <div className="rounded-lg border border-red-300 bg-white p-3 text-sm">
              <p className="font-semibold text-red-900">Share this invite link manually:</p>
              <p className="mt-2"><strong>Email:</strong> {email}</p>
              <p className="mt-2"><strong>Invite Link:</strong></p>
              <CopyableInviteLink link={invite_link} tone="red" />
              <p className="mt-2"><strong>Login:</strong> {getPublicAppUrl()}/login</p>
              <p className="mt-2 text-xs text-red-700">⚠️ Admin will set their own password via this link. It expires soon (~1 hour by default) — use “Resend invite” from the list below if it dies.</p>
            </div>
          </div>
        )}
        {success === "invite_resent" && email && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
            A fresh invite link was emailed to {email}.
          </p>
        )}
        {success === "invite_resent_email_failed" && invite_link && email && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
            <p className="text-sm font-medium text-amber-700">
              A new invite link was generated, but the email failed to send.
            </p>
            <div className="rounded-lg border border-amber-300 bg-white p-3 text-sm">
              <p className="font-semibold text-amber-900">Share this invite link manually:</p>
              <p className="mt-2"><strong>Email:</strong> {email}</p>
              <p className="mt-2"><strong>Invite Link:</strong></p>
              <CopyableInviteLink link={invite_link} tone="amber" />
              <p className="mt-2 text-xs text-amber-700">⚠️ It expires soon (~1 hour by default).</p>
            </div>
          </div>
        )}
        {success === "restaurant_created_email_failed" && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-700">
            Business was created, but the onboarding email could not be sent. Share the login details
            manually.
          </p>
        )}
        {success === "subscription_renewed" && (
          <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm font-medium text-violet-700">
            Subscription renewed. The store received a confirmation email with the service
            agreement PDF attached.
          </p>
        )}
        {success === "subscription_renewed_email_failed" && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-700">
            Subscription was extended, but the renewal email could not be sent. Check SMTP settings
            and try again, or share the contract manually.
          </p>
        )}
        {success === "invoice_created" && (
          <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm font-medium text-violet-700">
            Invoice created successfully.
          </p>
        )}
        {success === "invoice_deleted" && (
          <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm font-medium text-violet-700">
            Invoice deleted successfully.
          </p>
        )}
        {success === "payment_recorded" && (
          <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm font-medium text-violet-700">
            Cash payment recorded successfully.
          </p>
        )}
        {success === "ops_payment_created" && (
          <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm font-medium text-violet-700">
            Platform payment added. Reminders will email your ops inbox at 30 days, 7 days, and 3 days before the due date.
          </p>
        )}
        {success === "ops_payment_updated" && (
          <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm font-medium text-violet-700">
            Platform payment updated.
          </p>
        )}
        {success === "ops_payment_paid" && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
            Payment marked as paid.
          </p>
        )}
        {success === "ops_payment_reopened" && (
          <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm font-medium text-violet-700">
            Payment reopened for tracking.
          </p>
        )}
        {success === "ops_payment_deleted" && (
          <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm font-medium text-violet-700">
            Platform payment deleted.
          </p>
        )}
        {success === "restaurant_deleted" && (
          <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm font-medium text-violet-700">
            Business deleted successfully.
          </p>
        )}
        {success === "user_blocked" && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-700">
            User blocked successfully.
          </p>
        )}
        {success === "user_unblocked" && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
            User unblocked successfully.
          </p>
        )}
        {success === "user_deleted" && (
          <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm font-medium text-violet-700">
            User account deleted successfully.
          </p>
        )}
        {success === "password_changed" && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
            Password changed successfully.
          </p>
        )}
        {success === "user_password_updated" && (
          <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm font-medium text-violet-700">
            User password updated successfully.
          </p>
        )}
        {success === "restaurant_password_updated" && (
          <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm font-medium text-violet-700">
            Store admin password updated successfully.
          </p>
        )}
        {error === "duplicate_business_name" && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            A business with this name already exists. Choose a different name.
          </p>
        )}
        {error === "duplicate_business_email" && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            This email is already in use. Choose a different admin email.
          </p>
        )}
        {error === "missing_browse_categories" && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            Pick at least one business category when creating a business.
          </p>
        )}
        {error === "no_restaurant_admin" && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            No store admin account is linked to this business.
          </p>
        )}
        {error &&
          error !== "no_restaurant_admin" &&
          error !== "missing_restaurant_id" &&
          error !== "missing_browse_categories" &&
          error !== "duplicate_business_name" &&
          error !== "duplicate_business_email" && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {decodeURIComponent(error)}
          </p>
        )}

        <SuperAdminSection
          title="Create business + admin invite"
          description="Create a store account and email the admin a secure set-password link."
        >
          <SuperAdminCreateRestaurantForm />
        </SuperAdminSection>

        <SuperAdminRestaurantsPanel restaurants={restaurantsWithDetails} />
        <SuperAdminUsersPanel users={platformUsers} currentUserId={appUser.id} />
        <SuperAdminOpsPaymentsPanel payments={opsPayments} />
        <SuperAdminFinancePanel
          restaurants={restaurantsWithDetails.map((restaurant) => ({
            id: restaurant.id,
            name: restaurant.name,
            subscription_id: restaurant.subscription_id,
          }))}
          invoices={invoices ?? []}
          payments={payments ?? []}
        />

        <SuperAdminSection
          title="Generate contract"
          description="Fill in the agreement details and download a signed-ready PDF for any store."
        >
          <SuperAdminContractGenerator restaurants={contractPresets} />
        </SuperAdminSection>
    </SuperAdminShell>
  );
}

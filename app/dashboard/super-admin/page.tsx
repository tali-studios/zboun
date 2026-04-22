import { redirect } from "next/navigation";
import { signOutAction } from "@/app-actions/auth";
import {
  createRestaurantAction,
} from "@/app-actions/superadmin";
import { createClient } from "@supabase/supabase-js";
import { SuperAdminFinancePanel } from "@/components/super-admin-finance-panel";
import { SuperAdminRestaurantsPanel } from "@/components/super-admin-restaurants-panel";
import { getCurrentUserRole } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function SuperAdminPage({ searchParams }: Props) {
  const { success, error } = await searchParams;
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
  const query = dataClient
    .from("restaurants")
    .select("id, name, slug, phone, is_active, show_on_home, created_at")
    .order("created_at", { ascending: false });

  const [
    { data: restaurants },
    { data: categories },
    { data: items },
    { data: admins },
    { data: plans },
    { data: subscriptions },
    { data: invoices },
    { data: payments },
  ] =
    await Promise.all([
      query,
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
        .select("id, restaurant_id, plan_id, status, next_due_at, billing_cycle_price, created_at"),
      dataClient
        .from("invoices")
        .select("id, restaurant_id, subscription_id, amount_due, amount_paid, status, due_at, created_at"),
      dataClient
        .from("payments")
        .select("id, invoice_id, restaurant_id, amount_paid, paid_at, method, reference_note, created_at")
        .order("paid_at", { ascending: false }),
    ]);

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
  }));

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const now = new Date();

  const expectedMonthlyRevenue = (subscriptions ?? [])
    .filter((sub) => sub.status === "active" || sub.status === "trial" || sub.status === "overdue")
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
    <main className="min-h-screen bg-[#f8f8ff] p-3 sm:p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="panel p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-violet-600">Platform control</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">Super admin</h1>
            </div>
            <form action={signOutAction}>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <a href="/dashboard/change-password" className="btn btn-secondary">
                  Change password
                </a>
                <button className="btn btn-secondary">Sign out</button>
              </div>
            </form>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="panel p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Restaurants
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stats.totalRestaurants}</p>
          </div>
          <div className="panel p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Active stores
            </p>
            <p className="mt-1 text-2xl font-bold text-violet-700">{stats.activeRestaurants}</p>
          </div>
          <div className="panel p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total sections
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stats.totalSections}</p>
          </div>
          <div className="panel p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total menu items
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stats.totalItems}</p>
          </div>
        </section>

        {(success === "restaurant_created_and_invited" ||
          success === "restaurant_created_with_fallback") && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-700">
            Restaurant created successfully. Admin onboarding email has been sent.
          </p>
        )}
        {success === "restaurant_created_email_failed" && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-700">
            Restaurant and admin account were created, but sending email failed. You can create
            another test account or share login details manually.
          </p>
        )}
        {success === "subscription_renewed" && (
          <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm font-medium text-violet-700">
            Subscription renewed successfully.
          </p>
        )}
        {success === "invoice_created" && (
          <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm font-medium text-violet-700">
            Invoice created successfully.
          </p>
        )}
        {success === "payment_recorded" && (
          <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm font-medium text-violet-700">
            Cash payment recorded successfully.
          </p>
        )}
        {success === "restaurant_deleted" && (
          <p className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm font-medium text-violet-700">
            Restaurant deleted successfully.
          </p>
        )}
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {decodeURIComponent(error)}
          </p>
        )}

        <section className="panel p-4 md:p-5">
          <h2 className="panel-title">Create restaurant + admin invite</h2>
          <form action={createRestaurantAction} className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            <input
              name="name"
              required
              placeholder="Restaurant name"
              className="ui-input"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="Admin email"
              className="ui-input"
            />
            <input
              name="phone"
              type="tel"
              required
              placeholder="WhatsApp number"
              className="ui-input"
            />
            <button className="btn btn-success rounded-xl">
              Create restaurant
            </button>
          </form>
          <p className="mt-3 text-xs text-slate-500">
            An invitation email is sent to the admin with a secure set-password link and dashboard
            access URL.
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="panel p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Expected monthly
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">${stats.expectedMonthlyRevenue.toFixed(2)}</p>
          </div>
          <div className="panel p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Collected this month
            </p>
            <p className="mt-1 text-2xl font-bold text-violet-700">${stats.collectedThisMonth.toFixed(2)}</p>
          </div>
          <div className="panel p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Overdue amount
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-700">${stats.overdueAmount.toFixed(2)}</p>
          </div>
          <div className="panel p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Overdue invoices
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-700">{stats.overdueInvoicesCount}</p>
          </div>
          <div className="panel p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Outstanding total
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">${stats.outstandingAmount.toFixed(2)}</p>
          </div>
        </section>

        <SuperAdminRestaurantsPanel restaurants={restaurantsWithDetails} />
        <SuperAdminFinancePanel
          restaurants={restaurantsWithDetails.map((restaurant) => ({
            id: restaurant.id,
            name: restaurant.name,
            subscription_id: restaurant.subscription_id,
          }))}
          invoices={invoices ?? []}
          payments={payments ?? []}
        />
      </div>
    </main>
  );
}

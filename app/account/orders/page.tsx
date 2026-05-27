import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCustomerOrders } from "@/app-actions/orders";

export const dynamic = "force-dynamic";

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-400" },
  confirmed: { label: "Confirmed", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-500" },
  preparing: { label: "Preparing", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200", dot: "bg-violet-500" },
  ready: { label: "Ready", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" },
  out_for_delivery: { label: "Out for Delivery", color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200", dot: "bg-indigo-500" },
  delivered: { label: "Delivered ✓", color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200", dot: "bg-slate-400" },
  cancelled: { label: "Cancelled", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-400" },
};

export default async function CustomerOrdersPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/orders");

  const orders = await getCustomerOrders();

  function shortId(id: string) {
    return id.slice(0, 8).toUpperCase();
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <main className="min-h-screen bg-[#f8f8ff]">
      <div className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:underline"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to account
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">My Orders</h1>
          <p className="mt-1 text-sm text-slate-500">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-violet-200 bg-white py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-violet-50">
              <svg className="h-8 w-8 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-slate-700">No orders yet</p>
            <p className="mt-1 text-sm text-slate-400">Browse restaurants and place your first order!</p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
            >
              Browse restaurants
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const meta = STATUS_META[order.status] ?? STATUS_META.pending;
              const items = order.items as unknown as Array<{ name: string; qty: number; unit: string; unitPrice: number }>;
              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  {/* Order header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">
                          {order.restaurant_name}
                        </p>
                        <span className="text-xs text-slate-400">·</span>
                        <p className="text-xs text-slate-500">#{shortId(order.id)}</p>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-base font-bold text-slate-900">${order.total_usd.toFixed(2)}</p>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${meta.bg} ${meta.border} ${meta.color}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot} ${order.status === "pending" || order.status === "preparing" ? "animate-pulse" : ""}`} />
                        {meta.label}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-5 py-4">
                    <ul className="space-y-1.5">
                      {items.map((item, idx) => (
                        <li key={idx} className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-slate-700">
                            <span className="font-semibold">{item.unit === "kg" ? `${item.qty} kg` : `${item.qty}×`}</span>{" "}
                            {item.name}
                          </span>
                          <span className="shrink-0 font-semibold text-violet-700">
                            ${(item.qty * item.unitPrice).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {order.delivery_address ? (
                      <div className="mt-3 flex items-start gap-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
                        <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{order.delivery_address}</span>
                      </div>
                    ) : null}

                    {order.notes ? (
                      <p className="mt-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
                        Note: {order.notes}
                      </p>
                    ) : null}

                    <div className="mt-3 flex gap-2">
                      <Link
                        href={`/${order.restaurant_slug}`}
                        className="rounded-full border border-violet-200 px-3 py-1.5 text-xs font-semibold text-violet-600 transition hover:bg-violet-50"
                      >
                        Order again
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

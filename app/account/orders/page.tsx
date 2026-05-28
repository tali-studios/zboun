import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCustomerOrders } from "@/app-actions/orders";
import { CustomerMobileFooterNav } from "@/components/customer-mobile-footer-nav";
import { BackToTopButton } from "@/components/back-to-top-button";
import { CustomerDesktopNav } from "@/components/customer-desktop-nav";

export const dynamic = "force-dynamic";

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:          { label: "Pending",          color: "text-amber-700",  bg: "bg-amber-50" },
  confirmed:        { label: "Confirmed",         color: "text-blue-700",   bg: "bg-blue-50" },
  preparing:        { label: "Preparing",         color: "text-violet-700", bg: "bg-violet-50" },
  ready:            { label: "Ready",             color: "text-emerald-700",bg: "bg-emerald-50" },
  out_for_delivery: { label: "Out for Delivery",  color: "text-indigo-700", bg: "bg-indigo-50" },
  delivered:        { label: "Delivered",         color: "text-slate-600",  bg: "bg-slate-100" },
  cancelled:        { label: "Cancelled",         color: "text-red-600",    bg: "bg-red-50" },
};

export default async function CustomerOrdersPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account/orders");

  const orders = await getCustomerOrders();

  function formatDate(iso: string) {
    const d = new Date(iso);
    const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
    const rest = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return `${dayName}, ${rest}, ${time}`;
  }

  return (
    <>
      <div className="min-h-screen bg-[#f2f2f7] pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0">

        {/* Desktop nav */}
        <CustomerDesktopNav title="My Orders" />

        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-center border-b border-slate-200/60 bg-white/95 px-4 backdrop-blur md:hidden">
          <p className="text-[15px] font-semibold text-slate-900">Orders</p>
        </header>

        <div className="mx-auto max-w-2xl px-4 py-5">

          {orders.length === 0 ? (
            <div className="mt-16 flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
                <svg className="h-8 w-8 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-base font-semibold text-slate-800">No orders yet</p>
              <p className="text-sm text-slate-500">Browse restaurants and place your first order!</p>
              <Link href="/" className="mt-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700">
                Browse restaurants
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-3 text-lg font-bold text-slate-900">Past orders</p>
              <div className="space-y-3">
                {orders.map((order) => {
                  const meta = STATUS_META[order.status] ?? STATUS_META.pending;
                  type OrderItem = { name: string; qty: number; unit: string; unitPrice: number };
                  const items = order.items as unknown as OrderItem[];
                  const preview = items.slice(0, 2);
                  const extra = items.length - 2;

                  return (
                    <Link
                      key={order.id}
                      href={`/account/orders/${order.id}`}
                      className="block overflow-hidden rounded-2xl bg-white shadow-sm transition active:scale-[0.99]"
                    >
                      {/* Restaurant header row */}
                      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Restaurant initial avatar */}
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white shadow-sm">
                            {order.restaurant_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">{order.restaurant_name}</p>
                            <p className="text-xs text-slate-400">{formatDate(order.created_at)}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                      </div>

                      {/* Items preview */}
                      <div className="border-t border-slate-100 px-4 pb-3 pt-2.5">
                        {preview.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 py-0.5">
                            <span className="text-xs font-bold text-violet-600">{item.unit === "kg" ? `${item.qty}kg` : item.qty}</span>
                            <span className="text-sm text-slate-700">{item.name}</span>
                          </div>
                        ))}
                        {extra > 0 && (
                          <p className="mt-0.5 text-xs text-slate-400">{extra} other item{extra > 1 ? "s" : ""}…</p>
                        )}
                        <div className="mt-2.5 flex items-center justify-between">
                          <p className="text-sm font-bold text-slate-900">
                            Total: <span className="text-violet-700">${order.total_usd.toFixed(2)}</span>
                          </p>
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.bg} ${meta.color}`}>
                            {meta.label}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <CustomerMobileFooterNav />
      <BackToTopButton />
    </>
  );
}

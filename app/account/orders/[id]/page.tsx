import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCustomerOrder } from "@/app-actions/orders";
import { CustomerMobileFooterNav } from "@/components/customer-mobile-footer-nav";
import { CustomerDesktopNav } from "@/components/customer-desktop-nav";
import { MenuRestaurantRating } from "@/components/menu-restaurant-rating";

export const dynamic = "force-dynamic";

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:          { label: "Pending",          color: "text-amber-700",  bg: "bg-amber-100" },
  confirmed:        { label: "Confirmed",         color: "text-blue-700",   bg: "bg-blue-100" },
  preparing:        { label: "Preparing",         color: "text-violet-700", bg: "bg-violet-100" },
  ready:            { label: "Ready",             color: "text-emerald-700",bg: "bg-emerald-100" },
  out_for_delivery: { label: "Out for Delivery",  color: "text-indigo-700", bg: "bg-indigo-100" },
  delivered:        { label: "Delivered",         color: "text-violet-700", bg: "bg-violet-100" },
  cancelled:        { label: "Cancelled",         color: "text-red-600",    bg: "bg-red-100" },
};

type Params = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: Params) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/account/orders/${id}`);

  const order = await getCustomerOrder(id);
  if (!order) notFound();

  const meta = STATUS_META[order.status] ?? STATUS_META.pending;

  type OrderItem = {
    name: string; qty: number; unit: string; unitPrice: number;
    removedIngredients?: string[]; addedIngredients?: Array<{ name: string; qty: number }>;
    specialInstructions?: string;
  };
  const items = order.items as unknown as OrderItem[];

  function formatDate(iso: string) {
    const d = new Date(iso);
    const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
    const rest = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    return `${dayName}, ${rest}, ${time}`;
  }

  function mapsUrl(lat: number | null, lng: number | null) {
    if (!lat || !lng) return null;
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }

  return (
    <>
      <div className="min-h-screen bg-[#f2f2f7] pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0">

        {/* Desktop nav */}
        <CustomerDesktopNav title="Order Details" backHref="/account/orders" />

        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/60 bg-white/95 px-4 backdrop-blur md:hidden">
          <Link href="/account/orders" className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-slate-100">
            <svg className="h-5 w-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <p className="text-[15px] font-semibold text-slate-900">Order Details</p>
          <div className="w-9" aria-hidden />
        </header>

        <div className="mx-auto max-w-2xl space-y-3 px-4 py-4">

          {/* ── Restaurant + actions card ── */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {/* Restaurant row */}
            <Link href={`/${order.restaurant_slug}`} className="flex items-center justify-between gap-3 px-4 py-4 transition hover:bg-slate-50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white shadow-sm">
                  {order.restaurant_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{order.restaurant_name}</p>
                  <p className="text-xs text-slate-400">{formatDate(order.created_at)}</p>
                </div>
              </div>
              <svg className="h-4 w-4 shrink-0 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>

            {/* Delivery address */}
            {order.delivery_address ? (
              <div className="flex items-start gap-3 border-t border-slate-100 px-4 py-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700">{order.delivery_address}</p>
                  {mapsUrl(order.delivery_lat, order.delivery_lng) ? (
                    <a href={mapsUrl(order.delivery_lat, order.delivery_lng)!} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-violet-600 hover:underline">
                      Open in Maps
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* Action buttons */}
            <div className="space-y-2 border-t border-slate-100 px-4 pb-4 pt-3">
              <Link
                href={`/${order.restaurant_slug}`}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.5" />
                </svg>
                Reorder
              </Link>
            </div>
          </div>

          {/* ── Order items card ── */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">Your Order</p>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${meta.bg} ${meta.color}`}>
                  {meta.label}
                </span>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {items.map((item, idx) => {
                const lineTotal = item.qty * item.unitPrice;
                const mods: string[] = [];
                if (item.removedIngredients?.length) mods.push(`−${item.removedIngredients.join(", ")}`);
                if (item.addedIngredients?.length) mods.push(`+${item.addedIngredients.map((a) => `${a.qty}x ${a.name}`).join(", ")}`);
                if (item.specialInstructions) mods.push(item.specialInstructions);
                return (
                  <div key={idx} className="flex items-start gap-3 px-4 py-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-xs font-bold text-violet-700">
                      {item.unit === "kg" ? `${item.qty}kg` : item.qty}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                      {mods.length > 0 ? (
                        <p className="mt-0.5 text-xs text-slate-400">"{mods.join(" · ")}"</p>
                      ) : null}
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-slate-700">${lineTotal.toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Total card ── */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
              <p className="text-sm text-slate-500">Subtotal</p>
              <p className="text-sm text-slate-700">${order.total_usd.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <p className="text-base font-bold text-slate-900">Total</p>
              <p className="text-base font-bold text-violet-700">${order.total_usd.toFixed(2)}</p>
            </div>
          </div>

          {/* ── Notes ── */}
          {order.notes ? (
            <div className="overflow-hidden rounded-2xl bg-white px-4 py-3.5 shadow-sm">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Note</p>
              <p className="text-sm text-slate-700">{order.notes}</p>
            </div>
          ) : null}

          {order.status === "delivered" && order.restaurant_id ? (
            <MenuRestaurantRating
              variant="order"
              restaurantId={order.restaurant_id}
              slug={order.restaurant_slug}
              raterId={user.id}
              avgRating={order.restaurant_avg_rating}
              ratingCount={order.restaurant_rating_count}
              title="Rate your experience"
              hint="Your order was delivered. How was it? Tap a star to rate."
            />
          ) : null}

        </div>
      </div>
      <CustomerMobileFooterNav />
    </>
  );
}

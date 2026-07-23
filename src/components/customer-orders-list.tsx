"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { CustomerOrderRow } from "@/app-actions/orders";

const VISIBLE_ORDER_LIMIT = 10;
const ITEM_PREVIEW_LIMIT = 2;

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50" },
  confirmed: { label: "Confirmed", color: "text-blue-700", bg: "bg-blue-50" },
  preparing: { label: "Preparing", color: "text-violet-700", bg: "bg-violet-50" },
  ready: { label: "Ready", color: "text-emerald-700", bg: "bg-emerald-50" },
  out_for_delivery: { label: "Out for Delivery", color: "text-indigo-700", bg: "bg-indigo-50" },
  delivered: { label: "Delivered", color: "text-slate-600", bg: "bg-slate-100" },
  cancelled: { label: "Cancelled", color: "text-red-600", bg: "bg-red-50" },
};

type OrderItem = { name: string; qty: number; unit: string; unitPrice: number };

type Props = {
  orders: CustomerOrderRow[];
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
  const rest = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return `${dayName}, ${rest}, ${time}`;
}

function formatUsd(amount: number) {
  return `USD ${amount.toFixed(2)}`;
}

function formatLbp(amountUsd: number, lbpRate: number) {
  const lbp = Math.round(amountUsd * lbpRate);
  return `LBP ${lbp.toLocaleString("en-US")}`;
}

function orderSearchHaystack(order: CustomerOrderRow): string {
  const items = order.items as unknown as OrderItem[];
  const statusLabel = STATUS_META[order.status]?.label ?? order.status;
  return [
    order.restaurant_name,
    order.restaurant_slug,
    statusLabel,
    order.status,
    formatDate(order.created_at),
    order.total_usd.toFixed(2),
    ...items.map((item) => item.name),
  ]
    .join(" ")
    .toLowerCase();
}

export function CustomerOrdersList({ orders }: Props) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalizedQuery) return orders;
    return orders.filter((order) => orderSearchHaystack(order).includes(normalizedQuery));
  }, [orders, normalizedQuery]);

  const visibleOrders = normalizedQuery ? filtered : filtered.slice(0, VISIBLE_ORDER_LIMIT);
  const hiddenCount = normalizedQuery ? 0 : Math.max(0, orders.length - VISIBLE_ORDER_LIMIT);

  return (
    <>
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-lg font-bold text-slate-900">Past orders</p>
          {!normalizedQuery && orders.length > 0 ? (
            <span className="shrink-0 text-xs font-medium text-slate-400">
              {Math.min(orders.length, VISIBLE_ORDER_LIMIT)} of {orders.length}
            </span>
          ) : null}
        </div>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by store, item, or status…"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            aria-label="Search past orders"
          />
        </div>
        {hiddenCount > 0 ? (
          <p className="text-xs text-slate-500">
            Showing your {VISIBLE_ORDER_LIMIT} most recent orders. Search to find older ones.
          </p>
        ) : null}
      </div>

      {visibleOrders.length === 0 ? (
        <div className="rounded-2xl bg-white px-4 py-10 text-center shadow-sm">
          <p className="text-sm font-semibold text-slate-800">No orders match your search</p>
          <p className="mt-1 text-xs text-slate-500">Try a store name, menu item, or order status.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleOrders.map((order) => {
            const meta = STATUS_META[order.status] ?? STATUS_META.pending;
            const items = order.items as unknown as OrderItem[];
            const preview = items.slice(0, ITEM_PREVIEW_LIMIT);
            const extra = items.length - ITEM_PREVIEW_LIMIT;
            const canReorder = order.status !== "cancelled" && order.restaurant_is_active;

            return (
              <div key={order.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <Link href={`/account/orders/${order.id}`} className="block transition active:scale-[0.99]">
                  <div className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-violet-100 ring-1 ring-black/[0.06]">
                        {order.restaurant_logo_url ? (
                          <Image
                            src={order.restaurant_logo_url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="44px"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-violet-600 text-sm font-bold text-white">
                            {order.restaurant_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">{order.restaurant_name}</p>
                        <p className="text-xs text-slate-400">{formatDate(order.created_at)}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-violet-500" />
                  </div>

                  <div className="border-t border-slate-100 px-4 pb-3 pt-2.5">
                    {preview.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 py-0.5">
                        <span className="text-xs font-bold text-violet-600">
                          {item.unit === "kg" ? `${item.qty}kg` : item.qty}
                        </span>
                        <span className="text-sm text-slate-800">{item.name}</span>
                      </div>
                    ))}
                    {extra > 0 ? (
                      <p className="mt-0.5 text-xs italic text-slate-400">
                        {extra} other item{extra === 1 ? "" : "s"}…
                      </p>
                    ) : null}
                    <div className="mt-2.5 flex items-end justify-between gap-3">
                      <p className="min-w-0 text-sm font-bold text-slate-900">
                        Total:{" "}
                        <span className="text-slate-900">
                          {formatLbp(order.total_usd, order.restaurant_lbp_rate)}
                        </span>{" "}
                        <span className="font-semibold text-slate-400">
                          {formatUsd(order.total_usd)}
                        </span>
                      </p>
                      <span
                        className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.bg} ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                  </div>
                </Link>

                {order.status !== "cancelled" ? (
                  <div className="border-t border-slate-100 px-4 py-3">
                    {canReorder ? (
                      <Link
                        href={`/${order.restaurant_slug}?reorder=${order.id}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700"
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <polyline points="1 4 1 10 7 10" />
                          <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
                        </svg>
                        Reorder
                      </Link>
                    ) : (
                      <div className="space-y-1">
                        <button
                          type="button"
                          disabled
                          className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-400"
                        >
                          Reorder unavailable
                        </button>
                        <p className="text-center text-[11px] text-slate-400">
                          This store is no longer accepting orders.
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

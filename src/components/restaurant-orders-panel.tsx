"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";
import { updateOrderStatusAction, type OrderRow } from "@/app-actions/orders";

const STATUS_META: Record<
  string,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  preparing: {
    label: "Preparing",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    dot: "bg-violet-500",
  },
  ready: {
    label: "Ready",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    dot: "bg-indigo-500",
  },
  delivered: {
    label: "Delivered",
    color: "text-slate-600",
    bg: "bg-slate-100",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-400",
  },
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["out_for_delivery", "delivered", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

const STATUS_TRANSITION_LABELS: Record<string, string> = {
  confirmed: "Confirm",
  preparing: "Start Preparing",
  ready: "Mark Ready",
  out_for_delivery: "Out for Delivery",
  delivered: "Mark Delivered",
  cancelled: "Cancel",
};

type Props = {
  initialOrders: OrderRow[];
  restaurantId: string;
};

export function RestaurantOrdersPanel({ initialOrders, restaurantId }: Props) {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialOrders.find((o) => o.status === "pending")?.id ?? initialOrders[0]?.id ?? null,
  );
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [updating, startUpdate] = useTransition();
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let client: ReturnType<typeof createBrowserSupabaseClient> | null = null;
    try {
      client = createBrowserSupabaseClient();
    } catch {
      return;
    }

    const channel = client
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newOrder = payload.new as OrderRow;
            setOrders((prev) => [newOrder, ...prev]);
            setNewOrderIds((prev) => new Set([...prev, newOrder.id]));
            // Clear highlight after 10s
            setTimeout(() => {
              setNewOrderIds((prev) => {
                const next = new Set(prev);
                next.delete(newOrder.id);
                return next;
              });
            }, 10_000);
            // Try to play a notification sound
            try {
              audioRef.current?.play().catch(() => {});
            } catch {}
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((o) => (o.id === payload.new.id ? (payload.new as OrderRow) : o)),
            );
          } else if (payload.eventType === "DELETE") {
            setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    return () => {
      if (client) void client.removeChannel(channel);
    };
  }, [restaurantId]);

  function handleStatusUpdate(orderId: string, status: string) {
    startUpdate(async () => {
      await updateOrderStatusAction({
        orderId,
        status: status as Parameters<typeof updateOrderStatusAction>[0]["status"],
      });
      router.refresh();
    });
  }

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === "active") {
      return !["delivered", "cancelled"].includes(o.status);
    }
    if (statusFilter === "done") {
      return ["delivered", "cancelled"].includes(o.status);
    }
    return o.status === statusFilter;
  });

  const selected = orders.find((o) => o.id === selectedId) ?? null;
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function mapsLink(lat: number | null, lng: number | null) {
    if (!lat || !lng) return null;
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }

  function shortId(id: string) {
    return id.slice(0, 8).toUpperCase();
  }

  return (
    <div className="flex min-h-[70vh] flex-col gap-4">
      {/* Hidden audio for notification */}
      <audio ref={audioRef} preload="none" aria-hidden>
        <source src="/notification.mp3" type="audio/mpeg" />
      </audio>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900">Orders</h2>
          {pendingCount > 0 ? (
            <span className="animate-pulse rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-white">
              {pendingCount} new
            </span>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-1">
          {[
            { key: "active", label: "Active" },
            { key: "pending", label: "Pending" },
            { key: "preparing", label: "Preparing" },
            { key: "done", label: "Done" },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === f.key
                  ? "bg-violet-600 text-white shadow"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-violet-300 hover:text-violet-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        {/* Order list */}
        <div className="flex flex-col gap-2 overflow-y-auto lg:max-h-[75vh]">
          {filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
              <p className="text-sm text-slate-400">No orders here yet.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const meta = STATUS_META[order.status] ?? STATUS_META.pending;
              const isNew = newOrderIds.has(order.id);
              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSelectedId(order.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedId === order.id
                      ? "border-violet-400 bg-violet-50 shadow-sm"
                      : isNew
                        ? "border-amber-300 bg-amber-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-violet-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {order.customer_name}
                        {isNew ? (
                          <span className="ml-2 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            NEW
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        #{shortId(order.id)} · {formatDate(order.created_at)} {formatTime(order.created_at)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${meta.bg} ${meta.border} ${meta.color}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                      <p className="mt-1 text-sm font-bold text-slate-900">${order.total_usd.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="mt-1.5 line-clamp-1 text-xs text-slate-400">
                    {(order.items as unknown as Array<{ name: string; qty: number; unit: string }>)
                      .map((i) => `${i.unit === "kg" ? `${i.qty}kg` : `${i.qty}×`} ${i.name}`)
                      .join(", ")}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Order detail */}
        {selected ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-violet-600">Order Details</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">#{shortId(selected.id)}</h3>
                <p className="text-xs text-slate-400">
                  {formatDate(selected.created_at)} at {formatTime(selected.created_at)}
                </p>
              </div>
              {(() => {
                const meta = STATUS_META[selected.status] ?? STATUS_META.pending;
                return (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold ${meta.bg} ${meta.border} ${meta.color}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </span>
                );
              })()}
            </div>

            {/* Customer */}
            <div className="mb-5 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Customer</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{selected.customer_name}</p>
              {selected.customer_phone ? (
                <a
                  href={`tel:${selected.customer_phone}`}
                  className="mt-0.5 text-sm text-violet-600 hover:underline"
                >
                  {selected.customer_phone}
                </a>
              ) : null}
            </div>

            {/* Delivery */}
            {selected.delivery_address || selected.delivery_lat ? (
              <div className="mb-5 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Delivery Address</p>
                {selected.delivery_address ? (
                  <p className="mt-1 text-sm text-slate-800">{selected.delivery_address}</p>
                ) : null}
                {mapsLink(selected.delivery_lat, selected.delivery_lng) ? (
                  <a
                    href={mapsLink(selected.delivery_lat, selected.delivery_lng)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:underline"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Open in Google Maps
                  </a>
                ) : null}
              </div>
            ) : null}

            {/* Items */}
            <div className="mb-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Items</p>
              <div className="space-y-2">
                {(selected.items as unknown as Array<{
                  name: string;
                  qty: number;
                  unit: string;
                  unitPrice: number;
                  removedIngredients?: string[];
                  addedIngredients?: Array<{ name: string; qty: number }>;
                  specialInstructions?: string;
                }>).map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">
                        {item.unit === "kg" ? `${item.qty} kg` : `${item.qty}×`} {item.name}
                      </p>
                      <p className="shrink-0 text-sm font-bold text-violet-700">
                        ${(item.qty * item.unitPrice).toFixed(2)}
                      </p>
                    </div>
                    {item.removedIngredients?.length ? (
                      <p className="mt-0.5 text-xs text-red-500">Remove: {item.removedIngredients.join(", ")}</p>
                    ) : null}
                    {item.addedIngredients?.length ? (
                      <p className="mt-0.5 text-xs text-emerald-600">
                        Add: {item.addedIngredients.map((a) => `${a.name} ×${a.qty}`).join(", ")}
                      </p>
                    ) : null}
                    {item.specialInstructions ? (
                      <p className="mt-0.5 text-xs text-slate-400">Note: {item.specialInstructions}</p>
                    ) : null}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <p className="text-sm font-bold text-slate-900">Total</p>
                <p className="text-lg font-bold text-violet-700">${selected.total_usd.toFixed(2)}</p>
              </div>
            </div>

            {/* Notes */}
            {selected.notes ? (
              <div className="mb-5 rounded-xl border border-amber-100 bg-amber-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-600">Customer Note</p>
                <p className="mt-1 text-sm text-amber-800">{selected.notes}</p>
              </div>
            ) : null}

            {/* Actions */}
            {STATUS_TRANSITIONS[selected.status]?.length ? (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_TRANSITIONS[selected.status].map((nextStatus) => (
                    <button
                      key={nextStatus}
                      type="button"
                      disabled={updating}
                      onClick={() => handleStatusUpdate(selected.id, nextStatus)}
                      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                        nextStatus === "cancelled"
                          ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-violet-600 text-white shadow-sm shadow-violet-400/30 hover:bg-violet-700"
                      }`}
                    >
                      {updating ? "…" : STATUS_TRANSITION_LABELS[nextStatus] ?? nextStatus}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16">
            <p className="text-sm text-slate-400">Select an order to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

type PriorityOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  paymentStatus: string;
  fulfilmentType: string;
  ageMinutes: number;
  totalAmount: number;
  priorityScore: number;
  priorityLevel: "critical" | "high" | "normal";
  deliveryAssigned: boolean;
};

type DispatchItem = {
  id: string;
  customerName: string;
  status: string;
  assignedAt: string | null;
  driverName: string;
  vehiclePlate: string;
};

type SlaBand = {
  label: string;
  count: number;
  tone: "good" | "warn" | "danger";
};

type Props = {
  businessName: string;
  pendingCount: number;
  activeDispatchCount: number;
  avgAgeMinutes: number;
  availableDrivers: number;
  availableVehicles: number;
  slaBands: SlaBand[];
  topPriorityOrders: PriorityOrder[];
  dispatchBoard: DispatchItem[];
  autoDispatchEcommerceOrderAction: (fd: FormData) => Promise<void>;
  autoDispatchCriticalOrdersAction: (fd: FormData) => Promise<void>;
};

function fmtMoney(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function CloudKitchenOpsPanel({
  businessName,
  pendingCount,
  activeDispatchCount,
  avgAgeMinutes,
  availableDrivers,
  availableVehicles,
  slaBands,
  topPriorityOrders,
  dispatchBoard,
  autoDispatchEcommerceOrderAction,
  autoDispatchCriticalOrdersAction,
}: Props) {
  const [showBulkPreview, setShowBulkPreview] = useState(false);
  const criticalCount = topPriorityOrders.filter((order) => order.priorityLevel === "critical" && !order.deliveryAssigned).length;
  const bulkCandidates = topPriorityOrders
    .filter((order) => order.priorityLevel === "critical" && !order.deliveryAssigned)
    .slice(0, 5);
  return (
    <main className="min-h-screen bg-[#f8f8ff] p-3 sm:p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-violet-600 to-fuchsia-600 p-5 text-white shadow-lg shadow-violet-600/30 md:p-6">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-200">Cloud kitchen ops</p>
              <h1 className="mt-1 text-xl font-bold md:text-2xl">{businessName}</h1>
              <p className="mt-0.5 text-xs text-violet-200 md:text-sm">SLA queue, priority engine, and dispatch control tower.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="/dashboard/business/ecommerce" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">Orders</a>
              <a href="/dashboard/business/fleet" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">Fleet</a>
              <a href="/dashboard/business" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">Dashboard</a>
            </div>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <article className="panel p-5"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Pending orders</p><p className="mt-2 text-3xl font-bold tracking-tight text-violet-700">{pendingCount}</p></article>
          <article className="panel p-5"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Active dispatch</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{activeDispatchCount}</p></article>
          <article className="panel p-5"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Avg queue age</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{avgAgeMinutes}m</p></article>
          <article className="panel p-5"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Drivers ready</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{availableDrivers}</p></article>
          <article className="panel p-5"><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Vehicles ready</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{availableVehicles}</p></article>
        </section>

        <section className="panel p-5">
          <h2 className="panel-title">SLA queue bands</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {slaBands.map((band) => (
              <article
                key={band.label}
                className={`rounded-2xl border p-4 ${
                  band.tone === "danger"
                    ? "border-red-200 bg-red-50"
                    : band.tone === "warn"
                      ? "border-amber-200 bg-amber-50"
                      : "border-emerald-200 bg-emerald-50"
                }`}
              >
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{band.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{band.count}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="panel p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="panel-title">Auto-priority queue</h2>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold text-violet-700">Top urgency first</span>
                {criticalCount > 0 && (
                  <button
                    onClick={() => setShowBulkPreview(true)}
                    className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-red-700"
                  >
                      Auto-dispatch critical (max 5)
                  </button>
                )}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {topPriorityOrders.length === 0 ? (
                <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">No active orders in queue.</p>
              ) : (
                topPriorityOrders.map((order) => (
                  <article key={order.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{order.orderNumber} · {order.customerName}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {order.status.replaceAll("_", " ")} · {order.fulfilmentType} · {order.paymentStatus}
                        </p>
                        <p className="text-xs text-slate-400">{order.ageMinutes}m in queue · {order.deliveryAssigned ? "Dispatch linked" : "Dispatch unassigned"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">{fmtMoney(order.totalAmount)}</p>
                        <p
                          className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            order.priorityLevel === "critical"
                              ? "bg-red-100 text-red-700"
                              : order.priorityLevel === "high"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {order.priorityLevel} · {order.priorityScore}
                        </p>
                        {order.fulfilmentType === "delivery" && !order.deliveryAssigned && !["out_for_delivery"].includes(order.status) && (
                          <form action={autoDispatchEcommerceOrderAction} className="mt-2">
                            <input type="hidden" name="order_id" value={order.id} />
                            <button className="rounded-lg bg-violet-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-violet-700">
                              Auto-dispatch
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="panel p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="panel-title">Dispatch board</h2>
              <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-[11px] font-semibold text-cyan-700">Live trips</span>
            </div>
            <div className="mt-4 space-y-2">
              {dispatchBoard.length === 0 ? (
                <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">No active dispatch trips.</p>
              ) : (
                dispatchBoard.map((trip) => (
                  <article key={trip.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm font-semibold text-slate-900">{trip.customerName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{trip.driverName} · {trip.vehiclePlate}</p>
                    <p className="text-xs text-slate-400">{trip.status.replaceAll("_", " ")} · {trip.assignedAt ?? "Not assigned yet"}</p>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {showBulkPreview && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Bulk auto-dispatch preview</h3>
                <p className="text-sm text-slate-500">These orders will be dispatched in this run (max 5).</p>
              </div>
              <button onClick={() => setShowBulkPreview(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {bulkCandidates.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">No critical unassigned orders right now.</p>
            ) : (
              <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                {bulkCandidates.map((order) => (
                  <article key={order.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{order.orderNumber} · {order.customerName}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{order.status.replaceAll("_", " ")} · {order.ageMinutes}m queued</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">{fmtMoney(order.totalAmount)}</p>
                        <p className="mt-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700">
                          critical · {order.priorityScore}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button onClick={() => setShowBulkPreview(false)} className="btn btn-secondary rounded-xl text-sm">Cancel</button>
              <form action={autoDispatchCriticalOrdersAction} onSubmit={() => setShowBulkPreview(false)}>
                <input type="hidden" name="limit" value="5" />
                <button disabled={bulkCandidates.length === 0} className="btn btn-primary rounded-xl text-sm disabled:opacity-60">
                  Confirm auto-dispatch
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

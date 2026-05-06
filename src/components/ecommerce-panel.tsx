"use client";

import { useState, useTransition, useMemo } from "react";

type Store = {
  id: string; store_name: string; tagline: string | null; is_open: boolean;
  delivery_enabled: boolean; pickup_enabled: boolean;
  min_order_amount: number; base_delivery_fee: number;
  estimated_delivery_mins: number; estimated_pickup_mins: number;
  accepts_cash: boolean; accepts_card: boolean; accepts_online: boolean;
  tax_rate: number; operating_hours: string | null; closed_message: string | null;
} | null;
type Zone = { id: string; zone_name: string; delivery_fee: number; min_order: number; est_mins: number; is_active: boolean };
type Order = {
  id: string; order_number: string | null; customer_name: string; customer_phone: string;
  customer_email: string | null; delivery_address: string | null; delivery_zone_id: string | null;
  fulfilment_type: string; status: string; payment_method: string; payment_status: string;
  subtotal: number; delivery_fee: number; tax_amount: number; total_amount: number;
  notes: string | null; crm_customer_id: string | null; confirmed_at: string | null;
  delivered_at: string | null; created_at: string; updated_at: string;
};
type OrderItem = { id: string; order_id: string; item_name: string; quantity: number; unit_price: number; line_total: number; special_request: string | null };
type MenuItem = { id: string; name: string; price: number; is_available: boolean };
type CrmCustomer = { id: string; full_name: string; phone: string | null };

type Props = {
  restaurantName: string; restaurantSlug: string;
  store: Store; zones: Zone[]; orders: Order[]; orderItems: OrderItem[];
  menuItems: MenuItem[]; crmCustomers: CrmCustomer[];
  upsertStoreAction: (fd: FormData) => Promise<void>;
  toggleStoreOpenAction: (fd: FormData) => Promise<void>;
  createZoneAction: (fd: FormData) => Promise<void>;
  deleteZoneAction: (fd: FormData) => Promise<void>;
  createOnlineOrderAction: (fd: FormData) => Promise<void>;
  updateOrderStatusAction: (fd: FormData) => Promise<void>;
  markOrderPaidAction: (fd: FormData) => Promise<void>;
};

const STATUS_FLOW = ["pending","confirmed","preparing","ready","out_for_delivery","delivered","cancelled"];
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700", confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-violet-100 text-violet-700", ready: "bg-teal-100 text-teal-700",
  out_for_delivery: "bg-sky-100 text-sky-700", delivered: "bg-green-100 text-green-700",
  cancelled: "bg-slate-100 text-slate-500",
};

function fmtMoney(n: number) { return `$${n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`; }
function fmtDT(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function EcommercePanel({
  restaurantName, restaurantSlug, store, zones, orders, orderItems, menuItems, crmCustomers,
  upsertStoreAction, toggleStoreOpenAction, createZoneAction, deleteZoneAction,
  createOnlineOrderAction, updateOrderStatusAction, markOrderPaidAction,
}: Props) {
  const [tab, setTab] = useState<"overview"|"orders"|"new_order"|"settings">("overview");
  const [isPending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [storeDeliveryEnabled, setStoreDeliveryEnabled] = useState(store?.delivery_enabled ?? true);
  const [storePickupEnabled, setStorePickupEnabled] = useState(store?.pickup_enabled ?? true);

  const itemsByOrder = useMemo(() => {
    const m: Record<string, OrderItem[]> = {};
    for (const i of orderItems) (m[i.order_id] ??= []).push(i);
    return m;
  }, [orderItems]);
  const zoneMap = useMemo(() => Object.fromEntries(zones.map((z) => [z.id, z])), [zones]);

  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const todayOrders = orders.filter((o) => new Date(o.created_at) >= todayStart);
  const pending = orders.filter((o) => o.status === "pending").length;
  const todayRevenue = todayOrders.filter((o) => o.status !== "cancelled").reduce((s,o) => s + Number(o.total_amount), 0);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const viewOrder = viewOrderId ? orders.find((o) => o.id === viewOrderId) : null;

  function run(action: (fd: FormData) => Promise<void>, fd: FormData) {
    startTransition(async () => { await action(fd); });
  }
  function nextStatus(current: string) {
    const i = STATUS_FLOW.indexOf(current);
    return i >= 0 && i < STATUS_FLOW.length - 2 ? STATUS_FLOW[i + 1] : null;
  }
  function cartTotal() { return Array.from(cart.entries()).reduce((s,[id,qty]) => s + (menuItems.find(m=>m.id===id)?.price??0)*qty, 0); }

  return (
    <>
      <main className="min-h-screen bg-[#f8f8ff] p-3 sm:p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-violet-600 to-fuchsia-600 p-5 text-white shadow-lg shadow-violet-600/30 md:p-6">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-200">E-commerce</p>
              <h1 className="mt-1 text-xl font-bold md:text-2xl">{restaurantName} — Online Store</h1>
              <p className="mt-0.5 text-xs text-violet-200 md:text-sm">Online ordering, delivery zones, and order management.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {store && (
                <button
                  onClick={() => { const fd = new FormData(); fd.set("is_open", String(store.is_open)); run(toggleStoreOpenAction, fd); }}
                  className={`btn rounded-full border border-white/30 font-semibold text-white ${store.is_open ? "bg-teal-500/60 hover:bg-teal-500/80" : "bg-red-500/60 hover:bg-red-500/80"}`}
                >
                  {store.is_open ? "🟢 Open" : "🔴 Closed"}
                </button>
              )}
              <a href="/dashboard/restaurant" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">← Dashboard</a>
            </div>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          {(["overview","orders","new_order","settings"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold capitalize transition ${tab===t?"bg-violet-600 text-white":"text-slate-600 hover:bg-slate-100"}`}>
              {t === "new_order" ? "Manual Order" : t === "settings" ? "Store Settings" : t}
            </button>
          ))}
        </nav>

        {/* Overview */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Pending Orders", value: String(pending) },
                { label: "Orders Today", value: String(todayOrders.length) },
                { label: "Revenue Today", value: fmtMoney(todayRevenue) },
                { label: "Delivery Zones", value: String(zones.filter(z=>z.is_active).length) },
              ].map((k) => (
                <div key={k.label} className="panel p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{k.label}</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">{k.value}</p>
                </div>
              ))}
            </div>
            {pending > 0 && (
              <div className="panel p-5">
                <p className="mb-3 text-sm font-bold text-amber-700">⚡ {pending} Pending Order{pending!==1?"s":""}</p>
                <div className="space-y-2">
                  {orders.filter(o=>o.status==="pending").map((o) => (
                    <div key={o.id} className="flex items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-800">{o.customer_name} · {o.customer_phone}</p>
                        <p className="text-xs text-slate-500">{o.order_number ?? o.id.slice(0,8)} · {o.fulfilment_type} · {fmtMoney(o.total_amount)}</p>
                        {o.delivery_address && <p className="text-xs text-slate-400">{o.delivery_address}</p>}
                      </div>
                      <button onClick={() => { const fd=new FormData();fd.set("id",o.id);fd.set("status","confirmed"); run(updateOrderStatusAction,fd); }}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700">
                        Confirm
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orders */}
        {tab === "orders" && (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {["all","pending","confirmed","preparing","ready","out_for_delivery","delivered","cancelled"].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${statusFilter===s?"bg-slate-800 text-white":"bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {s.replace(/_/g," ")}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {filteredOrders.length === 0
                ? <div className="panel p-8 text-center text-sm text-slate-400">No orders found.</div>
                : filteredOrders.map((o) => {
                  const next = nextStatus(o.status);
                  const zone = zoneMap[o.delivery_zone_id ?? ""];
                  return (
                    <div key={o.id} className={`panel p-4 ${o.status==="cancelled"?"opacity-60":""}`}>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-slate-900">{o.customer_name}</p>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_COLORS[o.status]??"bg-slate-100 text-slate-500"}`}>{o.status.replace(/_/g," ")}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${o.payment_status==="paid"?"bg-teal-100 text-teal-700":"bg-amber-100 text-amber-700"}`}>{o.payment_status}</span>
                            {o.order_number && <span className="font-mono text-xs text-slate-400">{o.order_number}</span>}
                          </div>
                          <p className="text-sm text-slate-500">{o.customer_phone}{o.customer_email?` · ${o.customer_email}`:""}</p>
                          <p className="text-xs text-slate-400">{o.fulfilment_type === "delivery" ? `🚚 ${o.delivery_address ?? "No address"}${zone?` (${zone.zone_name})`:""}` : "🏪 Pickup"}</p>
                        </div>
                        <p className="text-lg font-bold text-slate-900">{fmtMoney(o.total_amount)}</p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5 border-t border-slate-100 pt-2">
                        {next && (
                          <button onClick={() => { const fd=new FormData();fd.set("id",o.id);fd.set("status",next);run(updateOrderStatusAction,fd); }}
                            className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-200 capitalize">
                            → {next.replace(/_/g," ")}
                          </button>
                        )}
                        {o.status !== "cancelled" && o.payment_status === "unpaid" && (
                          <button onClick={() => { const fd=new FormData();fd.set("id",o.id);run(markOrderPaidAction,fd); }}
                            className="rounded-lg bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-200">
                            Mark Paid
                          </button>
                        )}
                        {!["cancelled","delivered"].includes(o.status) && (
                          <button onClick={() => { const fd=new FormData();fd.set("id",o.id);fd.set("status","cancelled");run(updateOrderStatusAction,fd); }}
                            className="rounded-lg bg-red-100 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-200">
                            Cancel
                          </button>
                        )}
                        <button onClick={() => setViewOrderId(o.id)}
                          className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200">
                          Details
                        </button>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          </div>
        )}

        {/* Manual Order */}
        {tab === "new_order" && (
          <div className="panel p-5">
            <p className="mb-4 text-sm font-bold text-slate-700">Create Order Manually (phone-in / walk-in)</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const items = Array.from(cart.entries()).filter(([,qty])=>qty>0).map(([id,qty]) => {
                const m = menuItems.find(x=>x.id===id)!;
                return { menu_item_id: id, item_name: m.name, quantity: qty, unit_price: m.price };
              });
              if (items.length === 0) return;
              fd.set("items_json", JSON.stringify(items));
              run(createOnlineOrderAction, fd);
              setCart(new Map());
              setTab("orders");
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="ui-label">Customer Name *</label><input name="customer_name" className="ui-input w-full" required /></div>
                <div><label className="ui-label">Phone *</label><input name="customer_phone" className="ui-input w-full" required type="tel" /></div>
                <div><label className="ui-label">Fulfilment</label>
                  <select name="fulfilment_type" className="ui-input w-full">
                    <option value="delivery">Delivery</option>
                    <option value="pickup">Pickup</option>
                  </select>
                </div>
                <div><label className="ui-label">Payment</label>
                  <select name="payment_method" className="ui-input w-full">
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <div className="col-span-2"><label className="ui-label">Delivery Address</label><input name="delivery_address" className="ui-input w-full" /></div>
                <div><label className="ui-label">Zone</label>
                  <select name="delivery_zone_id" className="ui-input w-full">
                    <option value="">— No zone —</option>
                    {zones.filter(z=>z.is_active).map(z=><option key={z.id} value={z.id}>{z.zone_name} — {fmtMoney(z.delivery_fee)}</option>)}
                  </select>
                </div>
                <div><label className="ui-label">Delivery Fee ($)</label><input name="delivery_fee" className="ui-input w-full" type="number" step="0.01" min="0" defaultValue={0} /></div>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Items</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {menuItems.map((m) => {
                  const qty = cart.get(m.id) ?? 0;
                  return (
                    <div key={m.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <div><p className="text-sm font-semibold text-slate-800">{m.name}</p><p className="text-xs text-slate-400">{fmtMoney(m.price)}</p></div>
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => setCart(p=>{const m2=new Map(p);const n=(m2.get(m.id)??0)-1;n<=0?m2.delete(m.id):m2.set(m.id,n);return m2;})}
                          disabled={qty===0} className="h-6 w-6 rounded-full border text-slate-500 hover:bg-slate-100 disabled:opacity-30">−</button>
                        <span className="w-4 text-center text-sm font-semibold">{qty}</span>
                        <button type="button" onClick={() => setCart(p=>{const m2=new Map(p);m2.set(m.id,(m2.get(m.id)??0)+1);return m2;})}
                          className="h-6 w-6 rounded-full border text-slate-500 hover:bg-slate-100">+</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {cart.size > 0 && <p className="text-sm font-semibold text-orange-700">Subtotal: {fmtMoney(cartTotal())}</p>}
              <div className="flex justify-end border-t border-slate-100 pt-3">
                <button type="submit" disabled={isPending||cart.size===0} className="btn btn-primary rounded-xl disabled:opacity-60">
                  {isPending ? "Creating…" : "Create Order"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Store Settings */}
        {tab === "settings" && (
          <div className="space-y-6">
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              fd.set("delivery_enabled", String(storeDeliveryEnabled));
              fd.set("pickup_enabled", String(storePickupEnabled));
              fd.set("is_open", String(store?.is_open ?? true));
              run(upsertStoreAction, fd);
            }} className="space-y-4">
              <div className="panel p-5 space-y-4">
                <p className="font-bold text-slate-800">Store Identity</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><label className="ui-label">Store Name *</label><input name="store_name" className="ui-input w-full" required defaultValue={store?.store_name ?? restaurantName} /></div>
                  <div><label className="ui-label">Tagline</label><input name="tagline" className="ui-input w-full" defaultValue={store?.tagline ?? ""} /></div>
                  <div><label className="ui-label">Operating Hours</label><input name="operating_hours" className="ui-input w-full" defaultValue={store?.operating_hours ?? ""} placeholder="e.g. Mon–Sat 11am–10pm" /></div>
                  <div><label className="ui-label">Closed Message</label><input name="closed_message" className="ui-input w-full" defaultValue={store?.closed_message ?? ""} /></div>
                </div>
              </div>
              <div className="panel p-5 space-y-4">
                <p className="font-bold text-slate-800">Fulfilment</p>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <input type="checkbox" checked={storeDeliveryEnabled} onChange={e=>setStoreDeliveryEnabled(e.target.checked)} className="h-4 w-4 accent-orange-600" />Delivery
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <input type="checkbox" checked={storePickupEnabled} onChange={e=>setStorePickupEnabled(e.target.checked)} className="h-4 w-4 accent-orange-600" />Pickup
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div><label className="ui-label">Min Order ($)</label><input name="min_order_amount" type="number" step="0.01" min="0" className="ui-input w-full" defaultValue={store?.min_order_amount??0} /></div>
                  <div><label className="ui-label">Base Delivery Fee ($)</label><input name="base_delivery_fee" type="number" step="0.01" min="0" className="ui-input w-full" defaultValue={store?.base_delivery_fee??0} /></div>
                  <div><label className="ui-label">Delivery ETA (min)</label><input name="estimated_delivery_mins" type="number" min="1" className="ui-input w-full" defaultValue={store?.estimated_delivery_mins??45} /></div>
                  <div><label className="ui-label">Pickup ETA (min)</label><input name="estimated_pickup_mins" type="number" min="1" className="ui-input w-full" defaultValue={store?.estimated_pickup_mins??20} /></div>
                </div>
              </div>
              <div className="panel p-5 space-y-4">
                <p className="font-bold text-slate-800">Payment & Tax</p>
                <div className="flex flex-wrap gap-4">
                  {(["accepts_cash","accepts_card","accepts_online"] as const).map((k) => (
                    <label key={k} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input type="checkbox" name={k} value="true" defaultChecked={store?.[k]??k==="accepts_cash"} className="h-4 w-4 accent-orange-600" />
                      {k.replace("accepts_","").replace("_"," ")}
                    </label>
                  ))}
                </div>
                <div><label className="ui-label">Tax Rate (e.g. 0.11 for 11%)</label><input name="tax_rate" type="number" step="0.001" min="0" max="1" className="ui-input w-full sm:w-40" defaultValue={store?.tax_rate??0} /></div>
              </div>
              <div className="flex justify-end"><button type="submit" disabled={isPending} className="btn btn-primary rounded-xl disabled:opacity-60">{isPending?"Saving…":"Save Settings"}</button></div>
            </form>

            {/* Delivery zones */}
            <div className="panel p-5">
              <p className="mb-3 font-bold text-slate-800">Delivery Zones</p>
              <div className="grid gap-2 sm:grid-cols-2 mb-3">
                {zones.map((z) => (
                  <div key={z.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                    <div><p className="font-semibold text-slate-800">{z.zone_name}</p><p className="text-xs text-slate-400">{fmtMoney(z.delivery_fee)} · min {fmtMoney(z.min_order)} · ~{z.est_mins}min</p></div>
                    <button onClick={() => { const fd=new FormData();fd.set("id",z.id);run(deleteZoneAction,fd); }} className="text-xs text-red-400 hover:text-red-600">Del</button>
                  </div>
                ))}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); run(createZoneAction, new FormData(e.currentTarget)); e.currentTarget.reset(); }} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <input name="zone_name" className="ui-input" required placeholder="Zone name" />
                <input name="delivery_fee" className="ui-input" type="number" step="0.01" min="0" placeholder="Fee ($)" required />
                <input name="min_order" className="ui-input" type="number" step="0.01" min="0" placeholder="Min order ($)" defaultValue={0} />
                <button type="submit" disabled={isPending} className="btn btn-primary rounded-xl text-sm disabled:opacity-60">Add Zone</button>
              </form>
            </div>
          </div>
        )}
      </div>
      </main>

      {/* Order Details Modal */}
      {viewOrder && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-xs text-slate-400">{viewOrder.order_number ?? viewOrder.id.slice(0,8)}</p>
                <h3 className="text-lg font-bold text-slate-900">{viewOrder.customer_name}</h3>
              </div>
              <button onClick={() => setViewOrderId(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Phone</span><span>{viewOrder.customer_phone}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Type</span><span className="capitalize">{viewOrder.fulfilment_type}</span></div>
              {viewOrder.delivery_address && <div className="flex justify-between"><span className="text-slate-400">Address</span><span className="text-right max-w-[200px]">{viewOrder.delivery_address}</span></div>}
              <div className="flex justify-between"><span className="text-slate-400">Payment</span><span className="capitalize">{viewOrder.payment_method} · <span className={viewOrder.payment_status==="paid"?"text-teal-600":"text-amber-600"}>{viewOrder.payment_status}</span></span></div>
            </div>
            <div className="mt-3 border-t border-slate-100 pt-3">
              <p className="mb-1 text-xs font-semibold text-slate-400">Items</p>
              {(itemsByOrder[viewOrder.id]??[]).map((i) => (
                <div key={i.id} className="flex justify-between text-sm">
                  <span className="text-slate-700">{i.item_name} ×{i.quantity}</span>
                  <span className="text-slate-600">{fmtMoney(i.line_total)}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 border-t border-slate-100 pt-2 space-y-0.5">
              <div className="flex justify-between text-sm"><span className="text-slate-400">Subtotal</span><span>{fmtMoney(viewOrder.subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Delivery</span><span>{fmtMoney(viewOrder.delivery_fee)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Tax</span><span>{fmtMoney(viewOrder.tax_amount)}</span></div>
              <div className="flex justify-between text-sm font-bold"><span>Total</span><span>{fmtMoney(viewOrder.total_amount)}</span></div>
            </div>
            {viewOrder.notes && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-700">📝 {viewOrder.notes}</p>}
            <div className="mt-4 flex justify-end"><button onClick={() => setViewOrderId(null)} className="btn btn-secondary rounded-xl text-sm">Close</button></div>
          </div>
        </div>
      )}
    </>
  );
}

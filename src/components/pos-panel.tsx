"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type MenuItem = { id: string; name: string; price: number; is_available: boolean };
type PosOrder = {
  id: string;
  receipt_number: string | null;
  order_type: "dine_in" | "takeaway" | "delivery";
  status: "open" | "paid" | "void";
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  note: string | null;
  created_at: string;
};
type PosOrderItem = {
  id: string;
  order_id: string;
  item_name: string;
  qty: number;
  unit_price: number;
  line_total: number;
};

type Props = {
  restaurantName: string;
  menuItems: MenuItem[];
  orders: PosOrder[];
  orderItems: PosOrderItem[];
  createPosOrderAction: (fd: FormData) => Promise<void>;
  updatePosOrderStatusAction: (fd: FormData) => Promise<void>;
};

export function PosPanel({
  restaurantName,
  menuItems,
  orders,
  orderItems,
  createPosOrderAction,
  updatePosOrderStatusAction,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<"sale" | "orders">("sale");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [orderType, setOrderType] = useState<"dine_in" | "takeaway" | "delivery">("dine_in");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer">("cash");
  const [note, setNote] = useState("");

  const cartRows = useMemo(
    () =>
      menuItems
        .filter((item) => (cart[item.id] ?? 0) > 0)
        .map((item) => ({
          ...item,
          qty: cart[item.id],
          lineTotal: item.price * (cart[item.id] ?? 0),
        })),
    [cart, menuItems],
  );
  const subtotal = cartRows.reduce((sum, row) => sum + row.lineTotal, 0);
  const tax = subtotal * 0.11;
  const total = subtotal + tax;

  const itemsByOrder = useMemo(() => {
    return orderItems.reduce<Record<string, PosOrderItem[]>>((acc, item) => {
      if (!acc[item.order_id]) acc[item.order_id] = [];
      acc[item.order_id].push(item);
      return acc;
    }, {});
  }, [orderItems]);

  function submitSale() {
    if (!cartRows.length) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set(
        "items_json",
        JSON.stringify(
          cartRows.map((row) => ({
            menu_item_id: row.id,
            item_name: row.name,
            qty: row.qty,
            unit_price: row.price,
          })),
        ),
      );
      fd.set("order_type", orderType);
      fd.set("payment_method", paymentMethod);
      fd.set("paid_amount", String(total));
      fd.set("note", note);
      await createPosOrderAction(fd);
      setCart({});
      setNote("");
      router.refresh();
      setTab("orders");
    });
  }

  function setStatus(orderId: string, status: "open" | "paid" | "void") {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("order_id", orderId);
      fd.set("status", status);
      await updatePosOrderStatusAction(fd);
      router.refresh();
    });
  }

  return (
    <main className="min-h-screen bg-[#f8f8ff] p-3 sm:p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-700 via-cyan-600 to-blue-600 p-5 text-white shadow-lg shadow-cyan-600/30 md:p-6">
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">Cloud POS</p>
              <h1 className="mt-1 text-xl font-bold md:text-2xl">{restaurantName}</h1>
              <p className="mt-0.5 text-xs text-cyan-200">Create sales, collect payments, and print customer receipts.</p>
            </div>
            <div className="flex gap-2">
              <a href="/dashboard/restaurant/pos/receipts" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">Receipts</a>
              <a href="/dashboard/restaurant" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">Dashboard</a>
            </div>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          {[
            { id: "sale", label: "New Sale" },
            { id: "orders", label: `Orders (${orders.length})` },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as "sale" | "orders")}
              className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                tab === item.id ? "bg-cyan-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {tab === "sale" && (
          <div className="grid gap-4 lg:grid-cols-3">
            <section className="panel p-5 lg:col-span-2">
              <h2 className="panel-title">Menu items</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {menuItems.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">${Number(item.price).toFixed(2)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCart((prev) => ({
                            ...prev,
                            [item.id]: Math.max(0, (prev[item.id] ?? 0) - 1),
                          }))
                        }
                        className="rounded-full border border-slate-200 px-2 py-0.5 text-sm"
                      >
                        −
                      </button>
                      <span className="min-w-6 text-center text-sm font-semibold">{cart[item.id] ?? 0}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCart((prev) => ({
                            ...prev,
                            [item.id]: (prev[item.id] ?? 0) + 1,
                          }))
                        }
                        className="rounded-full border border-slate-200 px-2 py-0.5 text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel p-5">
              <h2 className="panel-title">Current cart</h2>
              <div className="mt-3 space-y-2">
                {cartRows.length === 0 ? (
                  <p className="text-sm text-slate-500">No items added yet.</p>
                ) : (
                  cartRows.map((row) => (
                    <div key={row.id} className="flex items-center justify-between text-sm">
                      <p>{row.name} × {row.qty}</p>
                      <p className="font-semibold">${row.lineTotal.toFixed(2)}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>VAT (11%)</span><span>${tax.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-slate-900"><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>

              <div className="mt-3 grid gap-2">
                <select value={orderType} onChange={(e) => setOrderType(e.target.value as typeof orderType)} className="ui-select">
                  <option value="dine_in">Dine in</option>
                  <option value="takeaway">Takeaway</option>
                  <option value="delivery">Delivery</option>
                </select>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)} className="ui-select">
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="transfer">Transfer</option>
                </select>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Order note (optional)" className="ui-input" />
                <button disabled={isPending || cartRows.length === 0} onClick={submitSale} className="btn btn-primary rounded-xl disabled:opacity-70">
                  Create Sale
                </button>
              </div>
            </section>
          </div>
        )}

        {tab === "orders" && (
          <section className="panel p-5">
            <h2 className="panel-title">Recent orders</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[920px] text-sm">
                <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-2">Receipt #</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Total</th>
                    <th className="py-2">Created</th>
                    <th className="py-2">Receipt</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100 align-top">
                      <td className="py-2 font-semibold text-slate-700">{order.receipt_number ?? "Pending"}</td>
                      <td className="py-2 capitalize">{order.order_type.replace("_", " ")}</td>
                      <td className="py-2 capitalize">{order.status}</td>
                      <td className="py-2 font-semibold">${Number(order.total_amount).toFixed(2)}</td>
                      <td className="py-2">{new Date(order.created_at).toLocaleString()}</td>
                      <td className="py-2">
                        <a href={`/dashboard/restaurant/pos/receipts/${order.id}`} className="text-cyan-700 hover:underline">Open receipt</a>
                      </td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          <button onClick={() => setStatus(order.id, "paid")} disabled={isPending} className="btn btn-secondary rounded-xl">Paid</button>
                          <button onClick={() => setStatus(order.id, "void")} disabled={isPending} className="btn btn-secondary rounded-xl">Void</button>
                        </div>
                        {(itemsByOrder[order.id] ?? []).length > 0 && (
                          <p className="mt-1 text-xs text-slate-500">
                            {(itemsByOrder[order.id] ?? []).map((item) => `${item.item_name} × ${Number(item.qty)}`).join(", ")}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

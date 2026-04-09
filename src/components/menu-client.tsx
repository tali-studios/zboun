"use client";

import { useMemo, useState } from "react";
import type { CategoryWithItems } from "@/lib/data";

type Props = {
  restaurantName: string;
  restaurantPhone: string;
  categories: CategoryWithItems[];
};

type CartState = Record<string, { id: string; name: string; price: number; qty: number }>;

export function MenuClient({ restaurantName, restaurantPhone, categories }: Props) {
  const [cart, setCart] = useState<CartState>({});
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const items = useMemo(() => Object.values(cart), [cart]);
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.qty * item.price, 0),
    [items],
  );

  function addItem(id: string, name: string, price: number) {
    setCart((prev) => ({
      ...prev,
      [id]: {
        id,
        name,
        price,
        qty: (prev[id]?.qty ?? 0) + 1,
      },
    }));
  }

  function createWhatsAppMessage() {
    const lines = [
      "Hello 👋",
      `I'd like to order from ${restaurantName}:`,
      "",
      ...items.map((item) => `- ${item.qty}x ${item.name}`),
      "",
      `Total: $${total.toFixed(2)}`,
      "",
      `Name: ${customerName}`,
      `Address: ${address}`,
      notes ? `Notes: ${notes}` : "",
    ].filter(Boolean);

    return encodeURIComponent(lines.join("\n"));
  }

  const orderLink = `https://wa.me/${restaurantPhone.replace(/\D/g, "")}?text=${createWhatsAppMessage()}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="space-y-6">
        {categories.map((category) => (
          <div key={category.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-slate-900">{category.name}</h2>
            <div className="mt-4 grid gap-3">
              {category.menu_items.map((item) => (
                <article
                  key={item.id}
                  className="flex items-start justify-between rounded-xl border border-slate-200 p-3"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-slate-600">{item.description}</p>
                    )}
                    <p className="mt-1 text-sm font-semibold text-green-700">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <button
                    disabled={!item.is_available}
                    onClick={() => addItem(item.id, item.name, item.price)}
                    className="rounded-full bg-green-600 px-3 py-1 text-sm font-semibold text-white disabled:bg-slate-300"
                  >
                    {item.is_available ? "Add" : "Out"}
                  </button>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>

      <aside className="h-fit rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 lg:sticky lg:top-4">
        <h2 className="text-lg font-bold text-slate-900">Your cart</h2>
        <div className="mt-3 space-y-2 text-sm">
          {items.length === 0 ? (
            <p className="text-slate-500">No items yet.</p>
          ) : (
            items.map((item) => (
              <p key={item.id} className="text-slate-700">
                {item.qty}x {item.name}
              </p>
            ))
          )}
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-900">Total: ${total.toFixed(2)}</p>
        <div className="mt-4 space-y-2">
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={3}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <a
          href={orderLink}
          className="mt-4 inline-flex w-full justify-center rounded-xl bg-green-600 px-4 py-3 font-semibold text-white disabled:pointer-events-none"
        >
          Order via WhatsApp
        </a>
      </aside>
    </div>
  );
}

"use client";

import Image from "next/image";
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
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <section className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">{category.name}</h2>
            <div className="mt-3 space-y-2.5">
              {category.menu_items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-start gap-3">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        width={68}
                        height={68}
                        className="h-[68px] w-[68px] rounded-lg object-cover"
                        unoptimized
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold leading-tight text-slate-900">{item.name}</h3>
                      {item.description ? (
                        <p className="mt-0.5 text-sm text-slate-600">{item.description}</p>
                      ) : null}
                      {item.contents ? (
                        <p className="mt-1 text-xs text-slate-500">Contains: {item.contents}</p>
                      ) : null}
                      {item.grams ? (
                        <p className="mt-0.5 text-xs text-slate-500">{item.grams}g</p>
                      ) : null}
                      <p className="mt-1.5 text-lg font-bold text-emerald-700">${item.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="mt-2.5 flex justify-end">
                    <button
                      disabled={!item.is_available}
                      onClick={() => addItem(item.id, item.name, item.price)}
                      className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {item.is_available ? "Add" : "Out of stock"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-4">
        <h2 className="text-lg font-bold text-slate-900">Your cart</h2>
        <div className="mt-3 max-h-44 space-y-1.5 overflow-y-auto text-sm">
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
            className="ui-input"
          />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
            className="ui-input"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            rows={3}
            className="ui-textarea"
          />
        </div>
        <a
          href={orderLink}
          className="mt-4 inline-flex w-full justify-center rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
        >
          Order via WhatsApp
        </a>
      </aside>
    </div>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Supplier = {
  id: string;
  name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
};

type InventoryItem = {
  id: string;
  name: string;
  sku: string | null;
  unit: string;
  current_qty: number;
  min_qty: number;
  cost_per_unit: number;
  notes: string | null;
  supplier_id: string | null;
  created_at: string;
  updated_at: string;
};

type Movement = {
  id: string;
  item_id: string;
  movement_type: string;
  qty: number;
  unit_cost: number | null;
  reference: string | null;
  notes: string | null;
  created_at: string;
};

type Props = {
  restaurantName: string;
  restaurantSlug: string;
  suppliers: Supplier[];
  items: InventoryItem[];
  movements: Movement[];
  createSupplierAction: (fd: FormData) => Promise<void>;
  updateSupplierAction: (fd: FormData) => Promise<void>;
  deleteSupplierAction: (fd: FormData) => Promise<void>;
  createInventoryItemAction: (fd: FormData) => Promise<void>;
  updateInventoryItemAction: (fd: FormData) => Promise<void>;
  deleteInventoryItemAction: (fd: FormData) => Promise<void>;
  recordMovementAction: (fd: FormData) => Promise<void>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  purchase: "Purchase",
  consume: "Consume",
  waste: "Waste",
  adjustment: "Adjustment",
};

const MOVEMENT_TYPE_COLORS: Record<string, string> = {
  purchase: "bg-emerald-100 text-emerald-700",
  consume: "bg-blue-100 text-blue-700",
  waste: "bg-red-100 text-red-700",
  adjustment: "bg-amber-100 text-amber-700",
};

const UNITS = ["pieces", "kg", "g", "liters", "ml", "boxes", "cans", "bottles", "bags", "trays", "portions", "other"];

function qtyColor(item: InventoryItem): string {
  if (item.current_qty <= 0) return "text-red-600 font-bold";
  if (item.current_qty < item.min_qty) return "text-amber-600 font-semibold";
  return "text-emerald-700 font-semibold";
}

function qtyBadge(item: InventoryItem): string {
  if (item.current_qty <= 0) return "bg-red-100 text-red-700";
  if (item.current_qty < item.min_qty) return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export function InventoryPanel({
  restaurantName,
  restaurantSlug,
  suppliers,
  items,
  movements,
  createSupplierAction,
  updateSupplierAction,
  deleteSupplierAction,
  createInventoryItemAction,
  updateInventoryItemAction,
  deleteInventoryItemAction,
  recordMovementAction,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<"overview" | "items" | "movements" | "suppliers">("overview");
  const [itemSearch, setItemSearch] = useState("");
  const [movementItemFilter, setMovementItemFilter] = useState("all");
  const [movementTypeFilter, setMovementTypeFilter] = useState("all");
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);

  // ── Derived KPIs ──────────────────────────────────────────────────────────
  const totalItems = items.length;
  const outOfStock = items.filter((i) => i.current_qty <= 0).length;
  const lowStock = items.filter((i) => i.current_qty > 0 && i.current_qty < i.min_qty).length;
  const totalValue = items.reduce((sum, i) => sum + Number(i.current_qty) * Number(i.cost_per_unit), 0);

  const supplierNameById = useMemo(
    () =>
      suppliers.reduce<Record<string, string>>((acc, s) => {
        acc[s.id] = s.name;
        return acc;
      }, {}),
    [suppliers],
  );

  const itemNameById = useMemo(
    () =>
      items.reduce<Record<string, string>>((acc, i) => {
        acc[i.id] = i.name;
        return acc;
      }, {}),
    [items],
  );

  const filteredItems = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    return items.filter(
      (i) =>
        !q ||
        i.name.toLowerCase().includes(q) ||
        (i.sku ?? "").toLowerCase().includes(q) ||
        (supplierNameById[i.supplier_id ?? ""] ?? "").toLowerCase().includes(q),
    );
  }, [items, itemSearch, supplierNameById]);

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      if (movementItemFilter !== "all" && m.item_id !== movementItemFilter) return false;
      if (movementTypeFilter !== "all" && m.movement_type !== movementTypeFilter) return false;
      return true;
    });
  }, [movements, movementItemFilter, movementTypeFilter]);

  // ── Action wrappers ───────────────────────────────────────────────────────

  function run(action: (fd: FormData) => Promise<void>, formData: FormData) {
    startTransition(async () => {
      await action(formData);
      router.refresh();
    });
  }

  function submitForm(action: (fd: FormData) => Promise<void>) {
    return (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      run(action, new FormData(e.currentTarget));
      (e.currentTarget as HTMLFormElement).reset();
    };
  }

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const tabs = [
    { id: "overview" as const, label: "Overview" },
    { id: "items" as const, label: `Stock Items (${totalItems})` },
    { id: "movements" as const, label: "Movements" },
    { id: "suppliers" as const, label: `Suppliers (${suppliers.length})` },
  ];

  return (
    <main className="min-h-screen bg-[#f8f8ff] p-3 sm:p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-5">

        {/* Header */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-violet-600 to-fuchsia-600 p-5 text-white shadow-lg shadow-violet-600/30 md:p-6">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-200">Inventory Management</p>
              <h1 className="mt-1 text-xl font-bold md:text-2xl">{restaurantName}</h1>
              <p className="mt-0.5 text-xs text-teal-200">
                Track stock, suppliers, and movements for your operation.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="/dashboard/restaurant"
                className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20"
              >
                Dashboard
              </a>
            </div>
          </div>
        </header>

        {/* Tab bar */}
        <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                tab === t.id
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* ── Overview tab ──────────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <article className="panel p-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Total items</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{totalItems}</p>
                <p className="mt-1 text-xs text-slate-400">unique stock items tracked</p>
              </article>
              <article className="panel p-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Low stock</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-amber-600">{lowStock}</p>
                <p className="mt-1 text-xs text-slate-400">below minimum threshold</p>
              </article>
              <article className="panel p-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Out of stock</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-red-600">{outOfStock}</p>
                <p className="mt-1 text-xs text-slate-400">zero quantity remaining</p>
              </article>
              <article className="panel p-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Total inventory value</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-teal-700">${totalValue.toFixed(2)}</p>
                <p className="mt-1 text-xs text-slate-400">based on cost per unit</p>
              </article>
            </div>

            {(lowStock > 0 || outOfStock > 0) && (
              <section className="panel p-5">
                <h2 className="panel-title text-amber-700">Attention required</h2>
                <div className="mt-3 divide-y divide-slate-100">
                  {items
                    .filter((i) => i.current_qty < i.min_qty)
                    .sort((a, b) => Number(a.current_qty) - Number(b.current_qty))
                    .map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 py-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">
                            {supplierNameById[item.supplier_id ?? ""] ? `Supplier: ${supplierNameById[item.supplier_id ?? ""]}` : "No supplier"}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${qtyBadge(item)}`}>
                            {Number(item.current_qty).toFixed(2)} {item.unit}
                          </span>
                          <p className="mt-1 text-xs text-slate-400">
                            Min: {Number(item.min_qty).toFixed(2)} {item.unit}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )}

            <section className="panel p-5">
              <h2 className="panel-title">Quick movement</h2>
              <p className="mt-1 text-xs text-slate-500">Record a stock change without leaving the overview.</p>
              <form onSubmit={submitForm(recordMovementAction)} className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <select name="item_id" required className="ui-select">
                  <option value="">Select item</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>{i.name} ({Number(i.current_qty).toFixed(2)} {i.unit})</option>
                  ))}
                </select>
                <select name="movement_type" required className="ui-select">
                  <option value="purchase">Purchase (stock in)</option>
                  <option value="consume">Consume (stock out)</option>
                  <option value="waste">Waste (stock out)</option>
                  <option value="adjustment">Adjustment</option>
                </select>
                <input type="number" name="qty" required step="0.001" min="0.001" placeholder="Quantity" className="ui-input" />
                <button disabled={isPending} className="btn btn-primary rounded-xl disabled:opacity-70">
                  Record
                </button>
              </form>
            </section>
          </div>
        )}

        {/* ── Stock Items tab ────────────────────────────────────────────────── */}
        {tab === "items" && (
          <div className="space-y-4">
            <section className="panel p-5">
              <h2 className="panel-title">Add stock item</h2>
              <form onSubmit={submitForm(createInventoryItemAction)} className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Item name *</span>
                  <input name="name" required placeholder="e.g. Chicken Breast" className="ui-input" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">SKU / code</span>
                  <input name="sku" placeholder="Optional" className="ui-input" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Unit</span>
                  <select name="unit" className="ui-select">
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Initial qty</span>
                  <input name="initial_qty" type="number" step="0.001" min="0" defaultValue="0" placeholder="0" className="ui-input" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Min qty (alert threshold)</span>
                  <input name="min_qty" type="number" step="0.001" min="0" defaultValue="0" placeholder="0" className="ui-input" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cost per unit ($)</span>
                  <input name="cost_per_unit" type="number" step="0.01" min="0" defaultValue="0" placeholder="0.00" className="ui-input" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Supplier</span>
                  <select name="supplier_id" className="ui-select">
                    <option value="">No supplier</option>
                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</span>
                  <input name="notes" placeholder="Optional" className="ui-input" />
                </label>
                <button disabled={isPending} className="btn btn-success rounded-xl sm:col-span-2 lg:col-span-4 disabled:opacity-70">
                  Add item
                </button>
              </form>
            </section>

            <section className="panel p-4 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="panel-title">Stock items ({filteredItems.length})</h2>
                <input
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  placeholder="Search by name, SKU, supplier"
                  className="ui-input w-full max-w-sm"
                />
              </div>
              <div className="-mx-4 mt-4 overflow-x-auto sm:mx-0 sm:rounded-2xl sm:border sm:border-slate-200 sm:bg-white sm:shadow-sm">
                <table className="min-w-[720px] text-sm md:min-w-full">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3">Current qty</th>
                      <th className="px-4 py-3">Min qty</th>
                      <th className="px-4 py-3">Cost / unit</th>
                      <th className="px-4 py-3">Value</th>
                      <th className="px-4 py-3">Supplier</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                        <td className="px-4 py-3 text-slate-500">{item.sku ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${qtyBadge(item)}`}>
                            {Number(item.current_qty).toFixed(2)} {item.unit}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-sm ${qtyColor(item)}`}>
                          {Number(item.min_qty).toFixed(2)} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-slate-700">${Number(item.cost_per_unit).toFixed(2)}</td>
                        <td className="px-4 py-3 font-medium text-teal-700">
                          ${(Number(item.current_qty) * Number(item.cost_per_unit)).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {supplierNameById[item.supplier_id ?? ""] ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setEditItem(item)}
                              className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-100"
                            >
                              Edit
                            </button>

                            {/* Quick stock-in */}
                            <div className="relative">
                              <input id={`stock-in-${item.id}`} type="checkbox" className="peer hidden" />
                              <label
                                htmlFor={`stock-in-${item.id}`}
                                className="block cursor-pointer rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                              >
                                + Stock in
                              </label>
                              <div className="pointer-events-none fixed inset-0 z-40 hidden items-center justify-center bg-slate-900/50 p-4 peer-checked:flex peer-checked:pointer-events-auto">
                                <label htmlFor={`stock-in-${item.id}`} className="absolute inset-0 cursor-pointer" />
                                <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
                                  <h3 className="text-base font-bold text-slate-900">Stock in: {item.name}</h3>
                                  <form
                                    onSubmit={(e) => {
                                      e.preventDefault();
                                      const fd = new FormData(e.currentTarget);
                                      fd.set("item_id", item.id);
                                      fd.set("movement_type", "purchase");
                                      run(recordMovementAction, fd);
                                      (document.getElementById(`stock-in-${item.id}`) as HTMLInputElement).checked = false;
                                    }}
                                    className="mt-3 space-y-2"
                                  >
                                    <input name="qty" type="number" step="0.001" min="0.001" required placeholder={`Quantity (${item.unit})`} className="ui-input" />
                                    <input name="unit_cost" type="number" step="0.01" min="0" defaultValue={item.cost_per_unit} placeholder="Unit cost ($)" className="ui-input" />
                                    <input name="reference" placeholder="Reference / invoice #" className="ui-input" />
                                    <div className="flex justify-end gap-2">
                                      <label htmlFor={`stock-in-${item.id}`} className="btn btn-secondary rounded-xl cursor-pointer">Cancel</label>
                                      <button disabled={isPending} className="btn btn-primary rounded-xl disabled:opacity-70">Confirm</button>
                                    </div>
                                  </form>
                                </div>
                              </div>
                            </div>

                            {/* Delete */}
                            <div className="relative">
                              <input id={`del-item-${item.id}`} type="checkbox" className="peer hidden" />
                              <label
                                htmlFor={`del-item-${item.id}`}
                                className="block cursor-pointer rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                              >
                                Delete
                              </label>
                              <div className="pointer-events-none fixed inset-0 z-40 hidden items-center justify-center bg-slate-900/50 p-4 peer-checked:flex peer-checked:pointer-events-auto">
                                <label htmlFor={`del-item-${item.id}`} className="absolute inset-0 cursor-pointer" />
                                <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
                                  <h3 className="text-base font-bold text-slate-900">Delete {item.name}?</h3>
                                  <p className="mt-1 text-sm text-slate-600">This will also delete all movement history for this item. Cannot be undone.</p>
                                  <div className="mt-4 flex justify-end gap-2">
                                    <label htmlFor={`del-item-${item.id}`} className="btn btn-secondary rounded-xl cursor-pointer">Cancel</label>
                                    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(); fd.set("id", item.id); run(deleteInventoryItemAction, fd); }}>
                                      <button disabled={isPending} className="btn btn-danger rounded-xl disabled:opacity-70">Delete</button>
                                    </form>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredItems.length === 0 && (
                  <p className="p-4 text-sm text-slate-500">No items found.</p>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ── Movements tab ─────────────────────────────────────────────────── */}
        {tab === "movements" && (
          <div className="space-y-4">
            <section className="panel p-5">
              <h2 className="panel-title">Record movement</h2>
              <form onSubmit={submitForm(recordMovementAction)} className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Item *</span>
                  <select name="item_id" required className="ui-select">
                    <option value="">Select item</option>
                    {items.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({Number(i.current_qty).toFixed(2)} {i.unit})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Type *</span>
                  <select name="movement_type" required className="ui-select">
                    <option value="purchase">Purchase (stock in +)</option>
                    <option value="consume">Consume (stock out −)</option>
                    <option value="waste">Waste (stock out −)</option>
                    <option value="adjustment">Adjustment (±)</option>
                  </select>
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quantity *</span>
                  <input name="qty" type="number" step="0.001" min="0.001" required placeholder="e.g. 5" className="ui-input" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Unit cost ($)</span>
                  <input name="unit_cost" type="number" step="0.01" min="0" placeholder="Optional" className="ui-input" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reference</span>
                  <input name="reference" placeholder="Invoice #, PO #, etc." className="ui-input" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</span>
                  <input name="notes" placeholder="Optional notes" className="ui-input" />
                </label>
                <button disabled={isPending} className="btn btn-primary rounded-xl sm:col-span-2 lg:col-span-3 disabled:opacity-70">
                  Record movement
                </button>
              </form>
            </section>

            <section className="panel p-4 md:p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h2 className="panel-title flex-1">Movement log ({filteredMovements.length})</h2>
                <select
                  value={movementItemFilter}
                  onChange={(e) => setMovementItemFilter(e.target.value)}
                  className="ui-select w-auto"
                >
                  <option value="all">All items</option>
                  {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
                <select
                  value={movementTypeFilter}
                  onChange={(e) => setMovementTypeFilter(e.target.value)}
                  className="ui-select w-auto"
                >
                  <option value="all">All types</option>
                  {Object.entries(MOVEMENT_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="-mx-4 overflow-x-auto sm:mx-0 sm:rounded-2xl sm:border sm:border-slate-200 sm:bg-white sm:shadow-sm">
                <table className="min-w-[640px] text-sm md:min-w-full">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Qty</th>
                      <th className="px-4 py-3">Unit cost</th>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMovements.map((m) => (
                      <tr key={m.id}>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                          {new Date(m.created_at).toLocaleDateString()}{" "}
                          <span className="text-xs">{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">{itemNameById[m.item_id] ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${MOVEMENT_TYPE_COLORS[m.movement_type] ?? "bg-slate-100 text-slate-700"}`}>
                            {MOVEMENT_TYPE_LABELS[m.movement_type] ?? m.movement_type}
                          </span>
                        </td>
                        <td className={`px-4 py-3 font-semibold ${Number(m.qty) > 0 ? "text-emerald-700" : "text-red-600"}`}>
                          {Number(m.qty) > 0 ? "+" : ""}{Number(m.qty).toFixed(3)}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {m.unit_cost != null ? `$${Number(m.unit_cost).toFixed(2)}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{m.reference ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-500 max-w-[160px] truncate">{m.notes ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredMovements.length === 0 && (
                  <p className="p-4 text-sm text-slate-500">No movements recorded yet.</p>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ── Suppliers tab ─────────────────────────────────────────────────── */}
        {tab === "suppliers" && (
          <div className="space-y-4">
            <section className="panel p-5">
              <h2 className="panel-title">Add supplier</h2>
              <form onSubmit={submitForm(createSupplierAction)} className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Supplier name *</span>
                  <input name="name" required placeholder="e.g. Fresh Foods Co." className="ui-input" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contact name</span>
                  <input name="contact_name" placeholder="Optional" className="ui-input" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</span>
                  <input name="phone" placeholder="Optional" className="ui-input" />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
                  <input name="email" type="email" placeholder="Optional" className="ui-input" />
                </label>
                <label className="space-y-1 sm:col-span-2 lg:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</span>
                  <input name="notes" placeholder="Optional" className="ui-input" />
                </label>
                <button disabled={isPending} className="btn btn-success rounded-xl sm:col-span-2 lg:col-span-3 disabled:opacity-70">
                  Add supplier
                </button>
              </form>
            </section>

            <section className="panel p-4 md:p-5">
              <h2 className="panel-title">Suppliers ({suppliers.length})</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {suppliers.map((s) => (
                  <article key={s.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{s.name}</p>
                        {s.contact_name && <p className="text-xs text-slate-500">{s.contact_name}</p>}
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditSupplier(s)}
                          className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-100"
                        >
                          Edit
                        </button>
                        <div className="relative">
                          <input id={`del-sup-${s.id}`} type="checkbox" className="peer hidden" />
                          <label
                            htmlFor={`del-sup-${s.id}`}
                            className="block cursor-pointer rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </label>
                          <div className="pointer-events-none fixed inset-0 z-40 hidden items-center justify-center bg-slate-900/50 p-4 peer-checked:flex peer-checked:pointer-events-auto">
                            <label htmlFor={`del-sup-${s.id}`} className="absolute inset-0 cursor-pointer" />
                            <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
                              <h3 className="text-base font-bold text-slate-900">Delete {s.name}?</h3>
                              <p className="mt-1 text-sm text-slate-600">Items linked to this supplier will remain but lose the supplier link.</p>
                              <div className="mt-4 flex justify-end gap-2">
                                <label htmlFor={`del-sup-${s.id}`} className="btn btn-secondary rounded-xl cursor-pointer">Cancel</label>
                                <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(); fd.set("id", s.id); run(deleteSupplierAction, fd); }}>
                                  <button disabled={isPending} className="btn btn-danger rounded-xl disabled:opacity-70">Delete</button>
                                </form>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                      {s.phone && <p>Phone: {s.phone}</p>}
                      {s.email && <p>Email: {s.email}</p>}
                      {s.notes && <p className="text-slate-400 italic">{s.notes}</p>}
                    </div>
                    <p className="mt-2 text-[10px] text-slate-300">
                      Added {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </article>
                ))}
                {suppliers.length === 0 && (
                  <p className="text-sm text-slate-500">No suppliers added yet.</p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* ── Edit item modal ────────────────────────────────────────────────── */}
      {editItem && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Edit: {editItem.name}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                fd.set("id", editItem.id);
                run(updateInventoryItemAction, fd);
                setEditItem(null);
              }}
              className="mt-4 grid gap-2 sm:grid-cols-2"
            >
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Item name *</span>
                <input name="name" required defaultValue={editItem.name} className="ui-input" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">SKU</span>
                <input name="sku" defaultValue={editItem.sku ?? ""} className="ui-input" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Unit</span>
                <select name="unit" defaultValue={editItem.unit} className="ui-select">
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Min qty</span>
                <input name="min_qty" type="number" step="0.001" min="0" defaultValue={editItem.min_qty} className="ui-input" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cost per unit ($)</span>
                <input name="cost_per_unit" type="number" step="0.01" min="0" defaultValue={editItem.cost_per_unit} className="ui-input" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Supplier</span>
                <select name="supplier_id" defaultValue={editItem.supplier_id ?? ""} className="ui-select">
                  <option value="">No supplier</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>
              <label className="space-y-1 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</span>
                <input name="notes" defaultValue={editItem.notes ?? ""} className="ui-input" />
              </label>
              <div className="flex justify-end gap-2 sm:col-span-2">
                <button type="button" onClick={() => setEditItem(null)} className="btn btn-secondary rounded-xl">Cancel</button>
                <button disabled={isPending} className="btn btn-primary rounded-xl disabled:opacity-70">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit supplier modal ────────────────────────────────────────────── */}
      {editSupplier && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Edit: {editSupplier.name}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                fd.set("id", editSupplier.id);
                run(updateSupplierAction, fd);
                setEditSupplier(null);
              }}
              className="mt-4 grid gap-2 sm:grid-cols-2"
            >
              <label className="space-y-1 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name *</span>
                <input name="name" required defaultValue={editSupplier.name} className="ui-input" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contact name</span>
                <input name="contact_name" defaultValue={editSupplier.contact_name ?? ""} className="ui-input" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</span>
                <input name="phone" defaultValue={editSupplier.phone ?? ""} className="ui-input" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
                <input name="email" type="email" defaultValue={editSupplier.email ?? ""} className="ui-input" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</span>
                <input name="notes" defaultValue={editSupplier.notes ?? ""} className="ui-input" />
              </label>
              <div className="flex justify-end gap-2 sm:col-span-2">
                <button type="button" onClick={() => setEditSupplier(null)} className="btn btn-secondary rounded-xl">Cancel</button>
                <button disabled={isPending} className="btn btn-primary rounded-xl disabled:opacity-70">Save changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

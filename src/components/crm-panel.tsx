"use client";

import { useState, useTransition, useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Customer = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  birthday: string | null;
  is_vip: boolean;
  total_spend: number;
  visit_count: number;
  first_visit_at: string | null;
  last_visit_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type CustomerNote = {
  id: string;
  customer_id: string;
  content: string;
  created_at: string;
};

type Tag = {
  id: string;
  name: string;
  color: string;
  created_at: string;
};

type TagAssignment = {
  id: string;
  customer_id: string;
  tag_id: string;
  assigned_at: string;
};

type PosOrder = {
  id: string;
  receipt_number: string | null;
  total_amount: number;
  status: string;
  order_type: string | null;
  created_at: string;
  customer_id: string | null;
};

type Props = {
  restaurantName: string;
  customers: Customer[];
  notes: CustomerNote[];
  tags: Tag[];
  tagAssignments: TagAssignment[];
  posOrders: PosOrder[];
  createCustomerAction: (fd: FormData) => Promise<void>;
  updateCustomerAction: (fd: FormData) => Promise<void>;
  deleteCustomerAction: (fd: FormData) => Promise<void>;
  toggleVipAction: (fd: FormData) => Promise<void>;
  addCustomerNoteAction: (fd: FormData) => Promise<void>;
  deleteCustomerNoteAction: (fd: FormData) => Promise<void>;
  createTagAction: (fd: FormData) => Promise<void>;
  deleteTagAction: (fd: FormData) => Promise<void>;
  assignTagAction: (fd: FormData) => Promise<void>;
  removeTagAssignmentAction: (fd: FormData) => Promise<void>;
  linkOrderToCustomerAction: (fd: FormData) => Promise<void>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 2) {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDateTime(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#64748b",
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function CrmPanel({
  restaurantName,
  customers,
  notes,
  tags,
  tagAssignments,
  posOrders,
  createCustomerAction,
  updateCustomerAction,
  deleteCustomerAction,
  toggleVipAction,
  addCustomerNoteAction,
  deleteCustomerNoteAction,
  createTagAction,
  deleteTagAction,
  assignTagAction,
  removeTagAssignmentAction,
  linkOrderToCustomerAction,
}: Props) {
  const [tab, setTab] = useState<"overview" | "customers" | "tags">("overview");
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "vip" | "recent">("all");

  // Profile modal
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileTab, setProfileTab] = useState<"info" | "notes" | "orders" | "tags">("info");

  // Add/edit customer modal
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);

  // New note
  const [noteContent, setNoteContent] = useState("");

  // New tag
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);

  // Delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteTagConfirmId, setDeleteTagConfirmId] = useState<string | null>(null);

  // ── Derived data ──────────────────────────────────────────────────────────
  const tagMap = useMemo(() => Object.fromEntries(tags.map((t) => [t.id, t])), [tags]);
  const assignmentsByCustomer = useMemo(() => {
    const m: Record<string, string[]> = {};
    for (const a of tagAssignments) {
      (m[a.customer_id] ??= []).push(a.tag_id);
    }
    return m;
  }, [tagAssignments]);
  const notesByCustomer = useMemo(() => {
    const m: Record<string, CustomerNote[]> = {};
    for (const n of notes) (m[n.customer_id] ??= []).push(n);
    return m;
  }, [notes]);
  const ordersByCustomer = useMemo(() => {
    const m: Record<string, PosOrder[]> = {};
    for (const o of posOrders) if (o.customer_id) (m[o.customer_id] ??= []).push(o);
    return m;
  }, [posOrders]);
  const unlinkedOrders = useMemo(
    () => posOrders.filter((o) => !o.customer_id && o.status !== "void"),
    [posOrders],
  );

  const filteredCustomers = useMemo(() => {
    let list = customers;
    if (filter === "vip") list = list.filter((c) => c.is_vip);
    if (filter === "recent") {
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      list = list.filter((c) => c.last_visit_at && new Date(c.last_visit_at).getTime() > cutoff);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          (c.phone ?? "").includes(q) ||
          (c.email ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [customers, search, filter]);

  const profileCustomer = profileId ? customers.find((c) => c.id === profileId) ?? null : null;

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const totalCustomers = customers.length;
  const vipCount = customers.filter((c) => c.is_vip).length;
  const cutoff30 = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const newThisMonth = customers.filter(
    (c) => c.created_at && new Date(c.created_at).getTime() > cutoff30,
  ).length;
  const topSpender =
    customers.length > 0
      ? customers.reduce((best, c) => (c.total_spend > best.total_spend ? c : best), customers[0])
      : null;

  // ── Server action wrappers ────────────────────────────────────────────────
  function run(action: (fd: FormData) => Promise<void>, fd: FormData) {
    startTransition(async () => {
      await action(fd);
    });
  }

  function submitNote() {
    if (!profileId || !noteContent.trim()) return;
    const fd = new FormData();
    fd.set("customer_id", profileId);
    fd.set("content", noteContent.trim());
    run(addCustomerNoteAction, fd);
    setNoteContent("");
  }

  function handleToggleVip(customer: Customer) {
    const fd = new FormData();
    fd.set("id", customer.id);
    fd.set("is_vip", String(customer.is_vip));
    run(toggleVipAction, fd);
  }

  function handleTagAssign(customerId: string, tagId: string, assigned: boolean) {
    const fd = new FormData();
    fd.set("customer_id", customerId);
    fd.set("tag_id", tagId);
    run(assigned ? removeTagAssignmentAction : assignTagAction, fd);
  }

  function handleLinkOrder(orderId: string) {
    if (!profileId) return;
    const fd = new FormData();
    fd.set("order_id", orderId);
    fd.set("customer_id", profileId);
    run(linkOrderToCustomerAction, fd);
  }

  function handleDeleteNote(noteId: string) {
    const fd = new FormData();
    fd.set("id", noteId);
    run(deleteCustomerNoteAction, fd);
  }

  function handleDeleteCustomer() {
    if (!deleteConfirmId) return;
    const fd = new FormData();
    fd.set("id", deleteConfirmId);
    run(deleteCustomerAction, fd);
    setDeleteConfirmId(null);
    if (profileId === deleteConfirmId) setProfileId(null);
  }

  function handleDeleteTag() {
    if (!deleteTagConfirmId) return;
    const fd = new FormData();
    fd.set("id", deleteTagConfirmId);
    run(deleteTagAction, fd);
    setDeleteTagConfirmId(null);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <main className="container max-w-7xl space-y-6 py-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-rose-600">CRM</p>
            <h1 className="text-2xl font-bold text-slate-900">{restaurantName} — Customers</h1>
            <p className="text-sm text-slate-500">Manage customer profiles, notes, tags, and order history.</p>
          </div>
          <a
            href="/dashboard/restaurant"
            className="btn btn-secondary rounded-xl text-sm"
          >
            ← Dashboard
          </a>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
          {(["overview", "customers", "tags"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold capitalize transition ${
                tab === t
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Overview ──────────────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard label="Total Customers" value={totalCustomers.toString()} color="rose" />
              <KpiCard label="VIP Customers" value={vipCount.toString()} color="amber" />
              <KpiCard label="New This Month" value={newThisMonth.toString()} color="teal" />
              <KpiCard
                label="Top Spender"
                value={topSpender ? `$${fmt(topSpender.total_spend)}` : "—"}
                sub={topSpender?.full_name}
                color="indigo"
              />
            </div>

            {/* Recent customers */}
            <div className="panel p-5">
              <p className="mb-3 text-sm font-bold text-slate-700">Recently Added Customers</p>
              {customers.length === 0 ? (
                <p className="text-sm text-slate-400">No customers yet. Add your first customer in the Customers tab.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <th className="pb-2 pr-4">Name</th>
                        <th className="pb-2 pr-4">Phone</th>
                        <th className="pb-2 pr-4">Visits</th>
                        <th className="pb-2 pr-4">Total Spend</th>
                        <th className="pb-2 pr-4">Last Visit</th>
                        <th className="pb-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[...customers]
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .slice(0, 8)
                        .map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50">
                            <td className="py-2 pr-4 font-medium text-slate-800">
                              {c.is_vip && <span className="mr-1 text-amber-500">★</span>}
                              {c.full_name}
                            </td>
                            <td className="py-2 pr-4 text-slate-500">{c.phone ?? "—"}</td>
                            <td className="py-2 pr-4 text-slate-500">{c.visit_count}</td>
                            <td className="py-2 pr-4 text-slate-500">${fmt(c.total_spend)}</td>
                            <td className="py-2 pr-4 text-slate-500">{fmtDate(c.last_visit_at)}</td>
                            <td className="py-2">
                              <button
                                onClick={() => {
                                  setProfileId(c.id);
                                  setProfileTab("info");
                                }}
                                className="text-xs font-semibold text-rose-600 hover:underline"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Unlinked POS orders */}
            {unlinkedOrders.length > 0 && (
              <div className="panel p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-700">Unlinked POS Orders</p>
                    <p className="text-xs text-slate-400">
                      {unlinkedOrders.length} order{unlinkedOrders.length !== 1 ? "s" : ""} have no customer profile attached.
                      Open a customer profile and link orders from the Orders tab.
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <th className="pb-2 pr-4">Receipt #</th>
                        <th className="pb-2 pr-4">Type</th>
                        <th className="pb-2 pr-4">Total</th>
                        <th className="pb-2 pr-4">Date</th>
                        <th className="pb-2 pr-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {unlinkedOrders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50">
                          <td className="py-2 pr-4 font-mono text-xs text-slate-600">
                            {o.receipt_number ?? o.id.slice(0, 8)}
                          </td>
                          <td className="py-2 pr-4 capitalize text-slate-500">{o.order_type ?? "—"}</td>
                          <td className="py-2 pr-4 text-slate-700">${fmt(o.total_amount)}</td>
                          <td className="py-2 pr-4 text-slate-500">{fmtDate(o.created_at)}</td>
                          <td className="py-2 pr-4">
                            <StatusBadge status={o.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Customers ─────────────────────────────────────────────────────── */}
        {tab === "customers" && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 gap-2">
                <input
                  type="search"
                  placeholder="Search by name, phone, or email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="ui-input flex-1"
                />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as typeof filter)}
                  className="ui-input w-36"
                >
                  <option value="all">All</option>
                  <option value="vip">VIP only</option>
                  <option value="recent">Active (30d)</option>
                </select>
              </div>
              <button
                onClick={() => { setEditCustomer(null); setShowAddCustomer(true); }}
                className="btn btn-primary rounded-xl text-sm"
              >
                + Add Customer
              </button>
            </div>

            <div className="panel overflow-hidden p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Tags</th>
                    <th className="px-4 py-3">Visits</th>
                    <th className="px-4 py-3">Total Spend</th>
                    <th className="px-4 py-3">Last Visit</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">
                        {search || filter !== "all" ? "No customers match your search." : "No customers yet."}
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c) => {
                      const customerTags = (assignmentsByCustomer[c.id] ?? [])
                        .map((tid) => tagMap[tid])
                        .filter(Boolean);
                      return (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {c.is_vip && <span className="text-amber-400">★</span>}
                              <div>
                                <p className="font-semibold text-slate-800">{c.full_name}</p>
                                {c.birthday && (
                                  <p className="text-[11px] text-slate-400">🎂 {fmtDate(c.birthday)}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            <div>{c.phone ?? "—"}</div>
                            <div className="text-xs text-slate-400">{c.email ?? ""}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {customerTags.slice(0, 3).map((t) => (
                                <TagChip key={t.id} tag={t} />
                              ))}
                              {customerTags.length > 3 && (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                  +{customerTags.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{c.visit_count}</td>
                          <td className="px-4 py-3 font-semibold text-slate-700">${fmt(c.total_spend)}</td>
                          <td className="px-4 py-3 text-slate-500">{fmtDate(c.last_visit_at)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => { setProfileId(c.id); setProfileTab("info"); }}
                              className="text-xs font-semibold text-rose-600 hover:underline"
                            >
                              Profile
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tags ──────────────────────────────────────────────────────────── */}
        {tab === "tags" && (
          <div className="space-y-4">
            <div className="panel p-5">
              <p className="mb-4 text-sm font-bold text-slate-700">Create New Tag</p>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-0">
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Tag Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Regular, Corporate, Allergy…"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    className="ui-input w-full"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-500">Color</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setNewTagColor(c)}
                        className="h-6 w-6 rounded-full border-2 transition"
                        style={{
                          backgroundColor: c,
                          borderColor: newTagColor === c ? "#1e293b" : "transparent",
                        }}
                      />
                    ))}
                    <input
                      type="color"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      className="h-6 w-6 cursor-pointer rounded-full border border-slate-200"
                      title="Custom color"
                    />
                  </div>
                </div>
                <button
                  disabled={isPending || !newTagName.trim()}
                  onClick={() => {
                    if (!newTagName.trim()) return;
                    const fd = new FormData();
                    fd.set("name", newTagName.trim());
                    fd.set("color", newTagColor);
                    run(createTagAction, fd);
                    setNewTagName("");
                  }}
                  className="btn btn-primary rounded-xl text-sm disabled:opacity-60"
                >
                  Create Tag
                </button>
              </div>

              {/* Preview */}
              {newTagName.trim() && (
                <div className="mt-3">
                  <p className="text-xs text-slate-400">Preview:</p>
                  <TagChip tag={{ id: "preview", name: newTagName, color: newTagColor }} />
                </div>
              )}
            </div>

            <div className="panel p-5">
              <p className="mb-3 text-sm font-bold text-slate-700">Your Tags</p>
              {tags.length === 0 ? (
                <p className="text-sm text-slate-400">No tags yet. Create your first tag above.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {tags.map((t) => {
                    const useCount = tagAssignments.filter((a) => a.tag_id === t.id).length;
                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: t.color }} />
                          <span className="font-semibold text-slate-800">{t.name}</span>
                          <span className="text-xs text-slate-400">({useCount} customer{useCount !== 1 ? "s" : ""})</span>
                        </div>
                        <button
                          onClick={() => setDeleteTagConfirmId(t.id)}
                          className="ml-2 shrink-0 text-xs text-red-400 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── Customer Profile Modal ─────────────────────────────────────────── */}
      {profileCustomer && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
            {/* Modal header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{profileCustomer.full_name}</h2>
                  {profileCustomer.is_vip && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      VIP ★
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Customer since {fmtDate(profileCustomer.created_at)} · {profileCustomer.visit_count} visit{profileCustomer.visit_count !== 1 ? "s" : ""} ·{" "}
                  ${fmt(profileCustomer.total_spend)} total spend
                </p>
              </div>
              <button
                onClick={() => setProfileId(null)}
                className="shrink-0 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Profile tabs */}
            <div className="flex border-b border-slate-100 px-4">
              {(["info", "notes", "orders", "tags"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setProfileTab(t)}
                  className={`border-b-2 px-4 py-2.5 text-sm font-semibold capitalize transition ${
                    profileTab === t
                      ? "border-rose-600 text-rose-600"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {t}
                  {t === "notes" && (notesByCustomer[profileCustomer.id] ?? []).length > 0 && (
                    <span className="ml-1 rounded-full bg-slate-100 px-1.5 text-[10px] font-bold text-slate-500">
                      {(notesByCustomer[profileCustomer.id] ?? []).length}
                    </span>
                  )}
                  {t === "orders" && (ordersByCustomer[profileCustomer.id] ?? []).length > 0 && (
                    <span className="ml-1 rounded-full bg-slate-100 px-1.5 text-[10px] font-bold text-slate-500">
                      {(ordersByCustomer[profileCustomer.id] ?? []).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Profile content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">

              {/* Info tab */}
              {profileTab === "info" && (
                <form
                  action={updateCustomerAction}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    run(updateCustomerAction, fd);
                  }}
                  className="space-y-4"
                >
                  <input type="hidden" name="id" value={profileCustomer.id} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="ui-label">Full Name *</label>
                      <input name="full_name" className="ui-input w-full" defaultValue={profileCustomer.full_name} required />
                    </div>
                    <div>
                      <label className="ui-label">Phone</label>
                      <input name="phone" className="ui-input w-full" defaultValue={profileCustomer.phone ?? ""} type="tel" />
                    </div>
                    <div>
                      <label className="ui-label">Email</label>
                      <input name="email" className="ui-input w-full" defaultValue={profileCustomer.email ?? ""} type="email" />
                    </div>
                    <div>
                      <label className="ui-label">Birthday</label>
                      <input name="birthday" className="ui-input w-full" defaultValue={profileCustomer.birthday ?? ""} type="date" />
                    </div>
                  </div>
                  <div>
                    <label className="ui-label">Internal Notes (private)</label>
                    <textarea
                      name="notes"
                      rows={2}
                      className="ui-input w-full"
                      defaultValue={profileCustomer.notes ?? ""}
                      placeholder="Dietary preferences, preferences, allergies…"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        name="is_vip"
                        value="true"
                        defaultChecked={profileCustomer.is_vip}
                        className="h-4 w-4 accent-amber-500"
                      />
                      Mark as VIP customer
                    </label>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(profileCustomer.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Delete customer
                    </button>
                    <button type="submit" disabled={isPending} className="btn btn-primary rounded-xl text-sm disabled:opacity-60">
                      {isPending ? "Saving…" : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}

              {/* Notes tab */}
              {profileTab === "notes" && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a note…"
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className="ui-input flex-1"
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitNote(); } }}
                    />
                    <button
                      onClick={submitNote}
                      disabled={isPending || !noteContent.trim()}
                      className="btn btn-primary rounded-xl text-sm disabled:opacity-60"
                    >
                      Add
                    </button>
                  </div>
                  {(notesByCustomer[profileCustomer.id] ?? []).length === 0 ? (
                    <p className="text-sm text-slate-400">No notes yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {(notesByCustomer[profileCustomer.id] ?? []).map((n) => (
                        <div
                          key={n.id}
                          className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3"
                        >
                          <div>
                            <p className="text-sm text-slate-700">{n.content}</p>
                            <p className="text-xs text-slate-400">{fmtDateTime(n.created_at)}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteNote(n.id)}
                            className="shrink-0 text-xs text-red-400 hover:text-red-600"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Orders tab */}
              {profileTab === "orders" && (
                <div className="space-y-4">
                  {(ordersByCustomer[profileCustomer.id] ?? []).length === 0 ? (
                    <p className="text-sm text-slate-400">No linked POS orders yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            <th className="pb-2 pr-4">Receipt #</th>
                            <th className="pb-2 pr-4">Type</th>
                            <th className="pb-2 pr-4">Total</th>
                            <th className="pb-2 pr-4">Status</th>
                            <th className="pb-2">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {(ordersByCustomer[profileCustomer.id] ?? []).map((o) => (
                            <tr key={o.id} className="hover:bg-slate-50">
                              <td className="py-2 pr-4 font-mono text-xs text-slate-600">
                                <a
                                  href={`/dashboard/restaurant/pos/receipts/${o.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-rose-600 hover:underline"
                                >
                                  {o.receipt_number ?? o.id.slice(0, 8)}
                                </a>
                              </td>
                              <td className="py-2 pr-4 capitalize text-slate-500">{o.order_type ?? "—"}</td>
                              <td className="py-2 pr-4 font-semibold text-slate-700">${fmt(o.total_amount)}</td>
                              <td className="py-2 pr-4">
                                <StatusBadge status={o.status} />
                              </td>
                              <td className="py-2 text-slate-500">{fmtDate(o.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Link unlinked orders */}
                  {unlinkedOrders.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold text-slate-500">Link an existing order to this customer:</p>
                      <select
                        className="ui-input w-full"
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) handleLinkOrder(e.target.value);
                          e.target.value = "";
                        }}
                      >
                        <option value="" disabled>Select an order to link…</option>
                        {unlinkedOrders.slice(0, 20).map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.receipt_number ?? o.id.slice(0, 8)} — ${fmt(o.total_amount)} — {fmtDate(o.created_at)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Tags tab */}
              {profileTab === "tags" && (
                <div className="space-y-3">
                  {tags.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      No tags defined. Go to the Tags tab to create tags first.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((t) => {
                        const assigned = (assignmentsByCustomer[profileCustomer.id] ?? []).includes(t.id);
                        return (
                          <button
                            key={t.id}
                            onClick={() => handleTagAssign(profileCustomer.id, t.id, assigned)}
                            disabled={isPending}
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                              assigned
                                ? "border-transparent text-white shadow-sm"
                                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                            }`}
                            style={assigned ? { backgroundColor: t.color } : {}}
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: assigned ? "rgba(255,255,255,0.6)" : t.color }}
                            />
                            {t.name}
                            {assigned && <span className="ml-0.5 opacity-70">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-xs text-slate-400">Click a tag to toggle assignment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Customer Modal ──────────────────────────────────────── */}
      {(showAddCustomer || editCustomer) && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              {editCustomer ? "Edit Customer" : "New Customer"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                if (editCustomer) {
                  fd.set("id", editCustomer.id);
                  run(updateCustomerAction, fd);
                } else {
                  run(createCustomerAction, fd);
                }
                setShowAddCustomer(false);
                setEditCustomer(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="ui-label">Full Name *</label>
                <input name="full_name" className="ui-input w-full" defaultValue={editCustomer?.full_name ?? ""} required placeholder="Jane Doe" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">Phone</label>
                  <input name="phone" className="ui-input w-full" defaultValue={editCustomer?.phone ?? ""} type="tel" placeholder="+961…" />
                </div>
                <div>
                  <label className="ui-label">Email</label>
                  <input name="email" className="ui-input w-full" defaultValue={editCustomer?.email ?? ""} type="email" placeholder="jane@…" />
                </div>
              </div>
              <div>
                <label className="ui-label">Birthday</label>
                <input name="birthday" className="ui-input w-full" defaultValue={editCustomer?.birthday ?? ""} type="date" />
              </div>
              <div>
                <label className="ui-label">Notes</label>
                <textarea
                  name="notes"
                  className="ui-input w-full"
                  rows={2}
                  defaultValue={editCustomer?.notes ?? ""}
                  placeholder="Allergies, preferences…"
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  name="is_vip"
                  value="true"
                  defaultChecked={editCustomer?.is_vip ?? false}
                  className="h-4 w-4 accent-amber-500"
                />
                Mark as VIP
              </label>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => { setShowAddCustomer(false); setEditCustomer(null); }}
                  className="btn btn-secondary rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="btn btn-primary rounded-xl text-sm disabled:opacity-60">
                  {isPending ? "Saving…" : editCustomer ? "Save Changes" : "Add Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Customer Confirm ────────────────────────────────────────── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <h3 className="text-base font-bold text-slate-900">Delete customer?</h3>
            <p className="mt-1 text-sm text-slate-500">
              This will permanently remove the customer profile, notes, and tag assignments. POS orders will be unlinked but not deleted.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setDeleteConfirmId(null)} className="btn btn-secondary rounded-xl text-sm">
                Cancel
              </button>
              <button onClick={handleDeleteCustomer} disabled={isPending} className="btn rounded-xl bg-red-600 text-sm text-white hover:bg-red-700 disabled:opacity-60">
                {isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Tag Confirm ─────────────────────────────────────────────── */}
      {deleteTagConfirmId && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <h3 className="text-base font-bold text-slate-900">Delete tag?</h3>
            <p className="mt-1 text-sm text-slate-500">
              This tag will be removed from all customers. This cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setDeleteTagConfirmId(null)} className="btn btn-secondary rounded-xl text-sm">
                Cancel
              </button>
              <button onClick={handleDeleteTag} disabled={isPending} className="btn rounded-xl bg-red-600 text-sm text-white hover:bg-red-700 disabled:opacity-60">
                {isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub?: string;
  color: "rose" | "amber" | "teal" | "indigo";
}) {
  const colors = {
    rose: "border-rose-100 bg-rose-50 text-rose-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    teal: "border-teal-100 bg-teal-50 text-teal-700",
    indigo: "border-indigo-100 bg-indigo-50 text-indigo-700",
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      {sub && <p className="mt-0.5 text-xs opacity-70 truncate">{sub}</p>}
    </div>
  );
}

function TagChip({ tag }: { tag: { id: string; name: string; color: string } }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
      style={{ backgroundColor: tag.color }}
    >
      {tag.name}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: "bg-blue-100 text-blue-700",
    paid: "bg-teal-100 text-teal-700",
    void: "bg-slate-100 text-slate-500",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${map[status] ?? "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
}

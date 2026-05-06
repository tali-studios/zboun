"use client";

import { useState, useTransition, useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Reservation = {
  id: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  table_label: string | null;
  status: string;
  special_requests: string | null;
  internal_notes: string | null;
  crm_customer_id: string | null;
  created_at: string;
  updated_at: string;
};

type EventSpace = {
  id: string;
  name: string;
  description: string | null;
  capacity_min: number | null;
  capacity_max: number;
  pricing_type: string;
  base_price: number;
  amenities: string[] | null;
  is_active: boolean;
  created_at: string;
};

type EventPackage = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
  created_at: string;
};

type EventBooking = {
  id: string;
  reference_number: string | null;
  space_id: string | null;
  organiser_name: string;
  organiser_phone: string;
  organiser_email: string | null;
  organisation: string | null;
  event_name: string;
  event_type: string;
  event_date: string;
  start_time: string;
  end_time: string | null;
  guest_count: number;
  status: string;
  space_fee: number;
  packages_total: number;
  extras_total: number;
  total_amount: number;
  deposit_amount: number;
  deposit_paid_at: string | null;
  balance_due: number;
  special_requests: string | null;
  internal_notes: string | null;
  crm_customer_id: string | null;
  created_at: string;
  updated_at: string;
};

type BookingPackage = {
  id: string;
  booking_id: string;
  package_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

type CrmCustomer = {
  id: string;
  full_name: string;
  phone: string | null;
};

type Props = {
  restaurantName: string;
  reservations: Reservation[];
  spaces: EventSpace[];
  packages: EventPackage[];
  bookings: EventBooking[];
  bookingPackages: BookingPackage[];
  crmCustomers: CrmCustomer[];
  createReservationAction: (fd: FormData) => Promise<void>;
  updateReservationAction: (fd: FormData) => Promise<void>;
  updateReservationStatusAction: (fd: FormData) => Promise<void>;
  deleteReservationAction: (fd: FormData) => Promise<void>;
  createSpaceAction: (fd: FormData) => Promise<void>;
  updateSpaceAction: (fd: FormData) => Promise<void>;
  deleteSpaceAction: (fd: FormData) => Promise<void>;
  createPackageAction: (fd: FormData) => Promise<void>;
  deletePackageAction: (fd: FormData) => Promise<void>;
  createEventBookingAction: (fd: FormData) => Promise<void>;
  updateEventBookingStatusAction: (fd: FormData) => Promise<void>;
  updateEventBookingNotesAction: (fd: FormData) => Promise<void>;
  deleteEventBookingAction: (fd: FormData) => Promise<void>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  });
}

function fmtTime(t: string | null) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const d = new Date();
  d.setHours(parseInt(h), parseInt(m));
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function fmtMoney(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const TODAY = new Date().toISOString().split("T")[0];

const RES_STATUS_STYLES: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  seated:    "bg-teal-100 text-teal-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-slate-100 text-slate-500",
  no_show:   "bg-red-100 text-red-600",
};

const EVT_STATUS_STYLES: Record<string, string> = {
  inquiry:      "bg-amber-100 text-amber-700",
  confirmed:    "bg-blue-100 text-blue-700",
  deposit_paid: "bg-teal-100 text-teal-700",
  completed:    "bg-green-100 text-green-700",
  cancelled:    "bg-slate-100 text-slate-500",
};

const EVENT_TYPES = [
  { value: "private_party", label: "Private Party" },
  { value: "corporate",     label: "Corporate" },
  { value: "wedding",       label: "Wedding" },
  { value: "birthday",      label: "Birthday" },
  { value: "graduation",    label: "Graduation" },
  { value: "meeting",       label: "Meeting" },
  { value: "other",         label: "Other" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function EventsPanel({
  restaurantName,
  reservations,
  spaces,
  packages,
  bookings,
  bookingPackages,
  crmCustomers,
  createReservationAction,
  updateReservationAction,
  updateReservationStatusAction,
  deleteReservationAction,
  createSpaceAction,
  updateSpaceAction,
  deleteSpaceAction,
  createPackageAction,
  deletePackageAction,
  createEventBookingAction,
  updateEventBookingStatusAction,
  updateEventBookingNotesAction,
  deleteEventBookingAction,
}: Props) {
  const [tab, setTab] = useState<"overview" | "reservations" | "events" | "setup">("overview");
  const [isPending, startTransition] = useTransition();

  // Reservations
  const [resDateFilter, setResDateFilter] = useState(TODAY);
  const [resStatusFilter, setResStatusFilter] = useState("all");
  const [showAddRes, setShowAddRes] = useState(false);
  const [editRes, setEditRes] = useState<Reservation | null>(null);
  const [deleteResId, setDeleteResId] = useState<string | null>(null);

  // Events
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [viewBookingId, setViewBookingId] = useState<string | null>(null);
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  // Cart for package selection in booking form
  const [pkgCart, setPkgCart] = useState<Map<string, number>>(new Map());

  // Setup
  const [showAddSpace, setShowAddSpace] = useState(false);
  const [editSpace, setEditSpace] = useState<EventSpace | null>(null);
  const [showAddPackage, setShowAddPackage] = useState(false);

  // ── Derived ───────────────────────────────────────────────────────────────
  const spaceMap = useMemo(() => Object.fromEntries(spaces.map((s) => [s.id, s])), [spaces]);
  const bpByBooking = useMemo(() => {
    const m: Record<string, BookingPackage[]> = {};
    for (const bp of bookingPackages) (m[bp.booking_id] ??= []).push(bp);
    return m;
  }, [bookingPackages]);

  const todayReservations = reservations.filter((r) => r.reservation_date === TODAY);
  const upcomingReservations = reservations.filter(
    (r) => r.reservation_date > TODAY && !["cancelled", "completed", "no_show"].includes(r.status),
  );
  const upcomingBookings = bookings.filter(
    (b) => b.event_date >= TODAY && !["cancelled", "completed"].includes(b.status),
  );
  const pendingDeposits = bookings.filter(
    (b) => b.status === "confirmed" && !b.deposit_paid_at,
  ).length;

  const filteredReservations = useMemo(() => {
    let list = reservations;
    if (resDateFilter) list = list.filter((r) => r.reservation_date === resDateFilter);
    if (resStatusFilter !== "all") list = list.filter((r) => r.status === resStatusFilter);
    return [...list].sort((a, b) => a.reservation_time.localeCompare(b.reservation_time));
  }, [reservations, resDateFilter, resStatusFilter]);

  const filteredBookings = useMemo(() => {
    let list = bookings;
    if (bookingStatusFilter !== "all") list = list.filter((b) => b.status === bookingStatusFilter);
    return list;
  }, [bookings, bookingStatusFilter]);

  const viewBooking = viewBookingId ? bookings.find((b) => b.id === viewBookingId) ?? null : null;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function run(action: (fd: FormData) => Promise<void>, fd: FormData) {
    startTransition(async () => { await action(fd); });
  }

  function statusAction(action: (fd: FormData) => Promise<void>, id: string, status: string) {
    const fd = new FormData();
    fd.set("id", id);
    fd.set("status", status);
    run(action, fd);
  }

  function pkgCartTotal() {
    let total = 0;
    for (const [pkgId, qty] of pkgCart.entries()) {
      const pkg = packages.find((p) => p.id === pkgId);
      if (pkg) total += pkg.price * qty;
    }
    return total;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <main className="min-h-screen bg-[#f8f8ff] p-3 sm:p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-700 via-violet-600 to-fuchsia-600 p-5 text-white shadow-lg shadow-violet-600/30 md:p-6">
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-200">Events & Reservations</p>
              <h1 className="mt-1 text-xl font-bold md:text-2xl">{restaurantName}</h1>
              <p className="mt-0.5 text-xs text-violet-200 md:text-sm">Table reservations, private events, and venue bookings.</p>
            </div>
            <a href="/dashboard/restaurant" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">← Dashboard</a>
          </div>
        </header>

        {/* Tab bar */}
        <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          {(["overview", "reservations", "events", "setup"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold capitalize transition ${
                tab === t ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t === "setup" ? "Spaces & Packages" : t}
            </button>
          ))}
        </nav>

        {/* ── Overview ──────────────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard label="Today's Reservations" value={todayReservations.length.toString()} color="emerald" />
              <KpiCard label="Upcoming Reservations" value={upcomingReservations.length.toString()} color="blue" />
              <KpiCard label="Active Event Bookings" value={upcomingBookings.length.toString()} color="violet" />
              <KpiCard label="Pending Deposits" value={pendingDeposits.toString()} color="amber" />
            </div>

            {/* Today's schedule */}
            <div className="panel p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-700">Today — {fmtDate(TODAY)}</p>
                <button
                  onClick={() => { setTab("reservations"); setResDateFilter(TODAY); }}
                  className="text-xs font-semibold text-emerald-600 hover:underline"
                >
                  View all →
                </button>
              </div>
              {todayReservations.length === 0 ? (
                <p className="text-sm text-slate-400">No reservations today.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {[...todayReservations]
                    .sort((a, b) => a.reservation_time.localeCompare(b.reservation_time))
                    .map((r) => (
                      <div
                        key={r.id}
                        className={`rounded-xl border px-4 py-3 ${
                          r.status === "cancelled" ? "opacity-50" : ""
                        } border-slate-200 bg-white`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-slate-800">{r.guest_name}</p>
                            <p className="text-xs text-slate-400">
                              {fmtTime(r.reservation_time)} · {r.party_size} pax
                              {r.table_label ? ` · ${r.table_label}` : ""}
                            </p>
                          </div>
                          <ResBadge status={r.status} />
                        </div>
                        {r.special_requests && (
                          <p className="mt-1 text-xs italic text-slate-400">"{r.special_requests}"</p>
                        )}
                        <div className="mt-2 flex gap-1 flex-wrap">
                          {r.status === "pending" && (
                            <QuickBtn
                              color="blue"
                              onClick={() => statusAction(updateReservationStatusAction, r.id, "confirmed")}
                            >Confirm</QuickBtn>
                          )}
                          {r.status === "confirmed" && (
                            <QuickBtn
                              color="teal"
                              onClick={() => statusAction(updateReservationStatusAction, r.id, "seated")}
                            >Seat</QuickBtn>
                          )}
                          {r.status === "seated" && (
                            <QuickBtn
                              color="green"
                              onClick={() => statusAction(updateReservationStatusAction, r.id, "completed")}
                            >Complete</QuickBtn>
                          )}
                          {!["cancelled", "completed", "no_show"].includes(r.status) && (
                            <QuickBtn
                              color="red"
                              onClick={() => statusAction(updateReservationStatusAction, r.id, "cancelled")}
                            >Cancel</QuickBtn>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Upcoming events */}
            {upcomingBookings.length > 0 && (
              <div className="panel p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-700">Upcoming Private Events</p>
                  <button onClick={() => setTab("events")} className="text-xs font-semibold text-violet-600 hover:underline">
                    View all →
                  </button>
                </div>
                <div className="space-y-2">
                  {upcomingBookings.slice(0, 5).map((b) => (
                    <div key={b.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-800">{b.event_name}</p>
                        <p className="text-xs text-slate-500">
                          {fmtDate(b.event_date)} · {fmtTime(b.start_time)} · {b.guest_count} guests ·{" "}
                          {spaceMap[b.space_id ?? ""]?.name ?? "No space"}
                        </p>
                        <p className="text-xs text-slate-400">{b.organiser_name} · {b.organiser_phone}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <EvtBadge status={b.status} />
                        <p className="text-xs font-semibold text-slate-600">{fmtMoney(b.total_amount)}</p>
                        <button
                          onClick={() => { setViewBookingId(b.id); setTab("events"); }}
                          className="text-xs font-semibold text-violet-600 hover:underline"
                        >
                          Details →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Reservations ──────────────────────────────────────────────────── */}
        {tab === "reservations" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <input
                  type="date"
                  value={resDateFilter}
                  onChange={(e) => setResDateFilter(e.target.value)}
                  className="ui-input"
                />
                <select
                  value={resStatusFilter}
                  onChange={(e) => setResStatusFilter(e.target.value)}
                  className="ui-input"
                >
                  <option value="all">All statuses</option>
                  {["pending", "confirmed", "seated", "completed", "cancelled", "no_show"].map((s) => (
                    <option key={s} value={s} className="capitalize">{s.replace("_", " ")}</option>
                  ))}
                </select>
                <button
                  onClick={() => setResDateFilter("")}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Clear date
                </button>
              </div>
              <button onClick={() => { setEditRes(null); setShowAddRes(true); }} className="btn btn-primary rounded-xl text-sm">
                + New Reservation
              </button>
            </div>

            <div className="panel overflow-hidden p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">Guest</th>
                    <th className="px-4 py-3">Date & Time</th>
                    <th className="px-4 py-3">Party</th>
                    <th className="px-4 py-3">Table</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                        No reservations found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map((r) => (
                      <tr key={r.id} className={`hover:bg-slate-50 ${r.status === "cancelled" ? "opacity-50" : ""}`}>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800">{r.guest_name}</p>
                          <p className="text-xs text-slate-400">{r.guest_phone}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <p>{fmtDate(r.reservation_date)}</p>
                          <p className="text-xs text-slate-400">{fmtTime(r.reservation_time)}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{r.party_size} pax</td>
                        <td className="px-4 py-3 text-slate-500">{r.table_label ?? "—"}</td>
                        <td className="px-4 py-3"><ResBadge status={r.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {r.status === "pending" && (
                              <QuickBtn color="blue" onClick={() => statusAction(updateReservationStatusAction, r.id, "confirmed")}>Confirm</QuickBtn>
                            )}
                            {r.status === "confirmed" && (
                              <QuickBtn color="teal" onClick={() => statusAction(updateReservationStatusAction, r.id, "seated")}>Seat</QuickBtn>
                            )}
                            {r.status === "seated" && (
                              <QuickBtn color="green" onClick={() => statusAction(updateReservationStatusAction, r.id, "completed")}>Complete</QuickBtn>
                            )}
                            {!["cancelled","completed","no_show"].includes(r.status) && (
                              <QuickBtn color="red" onClick={() => statusAction(updateReservationStatusAction, r.id, "no_show")}>No-show</QuickBtn>
                            )}
                            <QuickBtn color="slate" onClick={() => { setEditRes(r); setShowAddRes(true); }}>Edit</QuickBtn>
                            <QuickBtn color="red" onClick={() => setDeleteResId(r.id)}>Del</QuickBtn>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Events ────────────────────────────────────────────────────────── */}
        {tab === "events" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="ui-input w-44"
              >
                <option value="all">All statuses</option>
                {["inquiry","confirmed","deposit_paid","completed","cancelled"].map((s) => (
                  <option key={s} value={s}>{s.replace("_"," ")}</option>
                ))}
              </select>
              <button onClick={() => setShowAddBooking(true)} className="btn btn-primary rounded-xl text-sm">
                + New Event Booking
              </button>
            </div>

            <div className="space-y-3">
              {filteredBookings.length === 0 ? (
                <div className="panel p-8 text-center text-sm text-slate-400">No event bookings found.</div>
              ) : (
                filteredBookings.map((b) => {
                  const space = spaceMap[b.space_id ?? ""];
                  const bps = bpByBooking[b.id] ?? [];
                  return (
                    <div key={b.id} className="panel p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-slate-900">{b.event_name}</p>
                            <EvtBadge status={b.status} />
                            {b.reference_number && (
                              <span className="font-mono text-xs text-slate-400">{b.reference_number}</span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            {EVENT_TYPES.find((t) => t.value === b.event_type)?.label ?? b.event_type} ·{" "}
                            {fmtDate(b.event_date)} · {fmtTime(b.start_time)}
                            {b.end_time ? ` – ${fmtTime(b.end_time)}` : ""} · {b.guest_count} guests
                          </p>
                          <p className="text-sm text-slate-500">
                            {b.organiser_name}
                            {b.organisation ? ` (${b.organisation})` : ""} · {b.organiser_phone}
                            {b.organiser_email ? ` · ${b.organiser_email}` : ""}
                          </p>
                          {space && (
                            <p className="mt-0.5 text-xs text-slate-400">📍 {space.name}</p>
                          )}
                          {bps.length > 0 && (
                            <p className="mt-0.5 text-xs text-slate-400">
                              Packages: {bps.map((p) => `${p.package_name} ×${p.quantity}`).join(" · ")}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 text-right">
                          <p className="text-lg font-bold text-slate-900">{fmtMoney(b.total_amount)}</p>
                          <p className="text-xs text-slate-400">
                            Deposit: {fmtMoney(b.deposit_amount)}
                            {b.deposit_paid_at ? " ✓ paid" : " (pending)"}
                          </p>
                          <p className="text-xs text-slate-500">Balance: {fmtMoney(b.balance_due)}</p>
                        </div>
                      </div>
                      {b.special_requests && (
                        <p className="mt-2 text-xs italic text-slate-400">"{b.special_requests}"</p>
                      )}
                      {b.internal_notes && (
                        <p className="mt-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
                          📋 {b.internal_notes}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
                        {b.status === "inquiry" && (
                          <QuickBtn color="blue" onClick={() => statusAction(updateEventBookingStatusAction, b.id, "confirmed")}>Confirm</QuickBtn>
                        )}
                        {b.status === "confirmed" && (
                          <QuickBtn color="teal" onClick={() => statusAction(updateEventBookingStatusAction, b.id, "deposit_paid")}>Mark Deposit Paid</QuickBtn>
                        )}
                        {["confirmed","deposit_paid"].includes(b.status) && (
                          <QuickBtn color="green" onClick={() => statusAction(updateEventBookingStatusAction, b.id, "completed")}>Complete</QuickBtn>
                        )}
                        {!["cancelled","completed"].includes(b.status) && (
                          <QuickBtn color="red" onClick={() => statusAction(updateEventBookingStatusAction, b.id, "cancelled")}>Cancel</QuickBtn>
                        )}
                        <QuickBtn color="slate" onClick={() => setViewBookingId(b.id)}>View Details</QuickBtn>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── Setup ─────────────────────────────────────────────────────────── */}
        {tab === "setup" && (
          <div className="space-y-6">
            {/* Spaces */}
            <div className="panel p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Event Spaces</p>
                  <p className="text-xs text-slate-500">Configurable venue areas available for private bookings.</p>
                </div>
                <button onClick={() => { setEditSpace(null); setShowAddSpace(true); }} className="btn btn-primary rounded-xl text-sm">
                  + Add Space
                </button>
              </div>
              {spaces.length === 0 ? (
                <p className="text-sm text-slate-400">No spaces defined yet.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {spaces.map((s) => (
                    <div
                      key={s.id}
                      className={`rounded-xl border p-4 ${s.is_active ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50 opacity-60"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-800">{s.name}</p>
                        <div className="flex gap-1.5">
                          <button onClick={() => { setEditSpace(s); setShowAddSpace(true); }} className="text-xs text-violet-600 hover:underline">Edit</button>
                          <button onClick={() => {
                            const fd = new FormData(); fd.set("id", s.id);
                            run(deleteSpaceAction, fd);
                          }} className="text-xs text-red-400 hover:text-red-600">Del</button>
                        </div>
                      </div>
                      {s.description && <p className="mt-1 text-xs text-slate-500">{s.description}</p>}
                      <p className="mt-1.5 text-xs text-slate-600">
                        👥 {s.capacity_min ? `${s.capacity_min}–` : ""}{s.capacity_max} guests ·{" "}
                        {s.pricing_type === "flat" ? "Flat fee" : "Hourly"}: {fmtMoney(s.base_price)}
                      </p>
                      {s.amenities && s.amenities.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {s.amenities.map((a) => (
                            <span key={a} className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-600">{a}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Packages */}
            <div className="panel p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Event Packages & Extras</p>
                  <p className="text-xs text-slate-500">Add-ons selectable when creating an event booking.</p>
                </div>
                <button onClick={() => setShowAddPackage(true)} className="btn btn-primary rounded-xl text-sm">
                  + Add Package
                </button>
              </div>
              {packages.length === 0 ? (
                <p className="text-sm text-slate-400">No packages defined yet.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {packages.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-800">{p.name}</p>
                        {p.description && <p className="text-xs text-slate-400">{p.description}</p>}
                        <p className="mt-0.5 text-sm font-bold text-emerald-700">{fmtMoney(p.price)}</p>
                      </div>
                      <button onClick={() => {
                        const fd = new FormData(); fd.set("id", p.id);
                        run(deletePackageAction, fd);
                      }} className="ml-3 text-xs text-red-400 hover:text-red-600">Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </main>

      {/* ── Add / Edit Reservation Modal ────────────────────────────────────── */}
      {showAddRes && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              {editRes ? "Edit Reservation" : "New Table Reservation"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                if (editRes) {
                  fd.set("id", editRes.id);
                  run(updateReservationAction, fd);
                } else {
                  run(createReservationAction, fd);
                }
                setShowAddRes(false);
                setEditRes(null);
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="ui-label">Guest Name *</label>
                  <input name="guest_name" className="ui-input w-full" required defaultValue={editRes?.guest_name ?? ""} />
                </div>
                <div>
                  <label className="ui-label">Phone *</label>
                  <input name="guest_phone" className="ui-input w-full" required type="tel" defaultValue={editRes?.guest_phone ?? ""} />
                </div>
                <div>
                  <label className="ui-label">Email</label>
                  <input name="guest_email" className="ui-input w-full" type="email" defaultValue={editRes?.guest_email ?? ""} />
                </div>
                <div>
                  <label className="ui-label">Date *</label>
                  <input name="reservation_date" className="ui-input w-full" required type="date" defaultValue={editRes?.reservation_date ?? TODAY} />
                </div>
                <div>
                  <label className="ui-label">Time *</label>
                  <input name="reservation_time" className="ui-input w-full" required type="time" defaultValue={editRes?.reservation_time ?? "19:00"} />
                </div>
                <div>
                  <label className="ui-label">Party Size *</label>
                  <input name="party_size" className="ui-input w-full" required type="number" min="1" max="500" defaultValue={editRes?.party_size ?? 2} />
                </div>
                <div>
                  <label className="ui-label">Table / Area</label>
                  <input name="table_label" className="ui-input w-full" placeholder="e.g. Table 7" defaultValue={editRes?.table_label ?? ""} />
                </div>
              </div>
              <div>
                <label className="ui-label">Special Requests</label>
                <textarea name="special_requests" className="ui-input w-full" rows={2} defaultValue={editRes?.special_requests ?? ""} />
              </div>
              <div>
                <label className="ui-label">Internal Notes (private)</label>
                <textarea name="internal_notes" className="ui-input w-full" rows={2} defaultValue={editRes?.internal_notes ?? ""} />
              </div>
              {crmCustomers.length > 0 && (
                <div>
                  <label className="ui-label">Link to CRM Customer</label>
                  <select name="crm_customer_id" className="ui-input w-full" defaultValue={editRes?.crm_customer_id ?? ""}>
                    <option value="">— None —</option>
                    {crmCustomers.map((c) => (
                      <option key={c.id} value={c.id}>{c.full_name}{c.phone ? ` · ${c.phone}` : ""}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button type="button" onClick={() => { setShowAddRes(false); setEditRes(null); }} className="btn btn-secondary rounded-xl text-sm">Cancel</button>
                <button type="submit" disabled={isPending} className="btn btn-primary rounded-xl text-sm disabled:opacity-60">
                  {isPending ? "Saving…" : editRes ? "Save Changes" : "Create Reservation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Event Booking Modal ──────────────────────────────────────────── */}
      {showAddBooking && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <h3 className="mb-4 text-lg font-bold text-slate-900">New Event Booking</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                // Attach package cart
                const pkgItems = Array.from(pkgCart.entries())
                  .filter(([, qty]) => qty > 0)
                  .map(([pkgId, qty]) => {
                    const pkg = packages.find((p) => p.id === pkgId)!;
                    return { package_id: pkgId, package_name: pkg.name, unit_price: pkg.price, quantity: qty };
                  });
                fd.set("packages_json", JSON.stringify(pkgItems));
                const spaceFee = parseFloat(String(fd.get("space_fee") ?? "0")) || 0;
                const extrasTotal = parseFloat(String(fd.get("extras_total") ?? "0")) || 0;
                fd.set("space_fee", String(spaceFee));
                fd.set("extras_total", String(extrasTotal));
                run(createEventBookingAction, fd);
                setShowAddBooking(false);
                setPkgCart(new Map());
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="ui-label">Event Name *</label>
                  <input name="event_name" className="ui-input w-full" required placeholder="e.g. Smith Wedding Reception" />
                </div>
                <div>
                  <label className="ui-label">Event Type</label>
                  <select name="event_type" className="ui-input w-full">
                    {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="ui-label">Space</label>
                  <select name="space_id" className="ui-input w-full">
                    <option value="">— No specific space —</option>
                    {spaces.filter((s) => s.is_active).map((s) => (
                      <option key={s.id} value={s.id}>{s.name} (max {s.capacity_max})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="ui-label">Date *</label>
                  <input name="event_date" className="ui-input w-full" required type="date" defaultValue={TODAY} />
                </div>
                <div>
                  <label className="ui-label">Start Time *</label>
                  <input name="start_time" className="ui-input w-full" required type="time" defaultValue="18:00" />
                </div>
                <div>
                  <label className="ui-label">End Time</label>
                  <input name="end_time" className="ui-input w-full" type="time" />
                </div>
                <div>
                  <label className="ui-label">Guest Count *</label>
                  <input name="guest_count" className="ui-input w-full" required type="number" min="1" defaultValue={20} />
                </div>
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Organiser</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">Name *</label>
                  <input name="organiser_name" className="ui-input w-full" required />
                </div>
                <div>
                  <label className="ui-label">Phone *</label>
                  <input name="organiser_phone" className="ui-input w-full" required type="tel" />
                </div>
                <div>
                  <label className="ui-label">Email</label>
                  <input name="organiser_email" className="ui-input w-full" type="email" />
                </div>
                <div>
                  <label className="ui-label">Company / Group</label>
                  <input name="organisation" className="ui-input w-full" />
                </div>
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Financials</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="ui-label">Space Fee ($)</label>
                  <input name="space_fee" className="ui-input w-full" type="number" step="0.01" min="0" defaultValue={0} />
                </div>
                <div>
                  <label className="ui-label">Extras Total ($)</label>
                  <input name="extras_total" className="ui-input w-full" type="number" step="0.01" min="0" defaultValue={0} />
                </div>
                <div>
                  <label className="ui-label">Deposit ($)</label>
                  <input name="deposit_amount" className="ui-input w-full" type="number" step="0.01" min="0" defaultValue={0} />
                </div>
              </div>

              {packages.length > 0 && (
                <>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Packages</p>
                  <div className="space-y-2">
                    {packages.map((p) => {
                      const qty = pkgCart.get(p.id) ?? 0;
                      return (
                        <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
                          <div>
                            <p className="font-semibold text-slate-800">{p.name}</p>
                            <p className="text-xs text-slate-400">{fmtMoney(p.price)} each</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setPkgCart((prev) => { const m = new Map(prev); const n = (m.get(p.id) ?? 0) - 1; n <= 0 ? m.delete(p.id) : m.set(p.id, n); return m; })}
                              className="h-7 w-7 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100"
                              disabled={qty === 0}
                            >−</button>
                            <span className="w-5 text-center text-sm font-semibold">{qty}</span>
                            <button
                              type="button"
                              onClick={() => setPkgCart((prev) => { const m = new Map(prev); m.set(p.id, (m.get(p.id) ?? 0) + 1); return m; })}
                              className="h-7 w-7 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100"
                            >+</button>
                          </div>
                        </div>
                      );
                    })}
                    {pkgCart.size > 0 && (
                      <p className="text-xs font-semibold text-emerald-700">
                        Packages subtotal: {fmtMoney(pkgCartTotal())}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="ui-label">Special Requests</label>
                <textarea name="special_requests" className="ui-input w-full" rows={2} />
              </div>
              <div>
                <label className="ui-label">Internal Notes</label>
                <textarea name="internal_notes" className="ui-input w-full" rows={2} />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button type="button" onClick={() => { setShowAddBooking(false); setPkgCart(new Map()); }} className="btn btn-secondary rounded-xl text-sm">Cancel</button>
                <button type="submit" disabled={isPending} className="btn btn-primary rounded-xl text-sm disabled:opacity-60">
                  {isPending ? "Creating…" : "Create Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── View Booking Details Modal ───────────────────────────────────────── */}
      {viewBooking && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  {viewBooking.reference_number ?? "Event"}
                </p>
                <h3 className="text-lg font-bold text-slate-900">{viewBooking.event_name}</h3>
              </div>
              <button onClick={() => setViewBookingId(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-sm">
              <InfoRow label="Type" value={EVENT_TYPES.find((t) => t.value === viewBooking.event_type)?.label ?? viewBooking.event_type} />
              <InfoRow label="Date" value={`${fmtDate(viewBooking.event_date)} · ${fmtTime(viewBooking.start_time)}${viewBooking.end_time ? ` – ${fmtTime(viewBooking.end_time)}` : ""}`} />
              <InfoRow label="Guests" value={`${viewBooking.guest_count}`} />
              <InfoRow label="Space" value={spaceMap[viewBooking.space_id ?? ""]?.name ?? "—"} />
              <InfoRow label="Organiser" value={`${viewBooking.organiser_name}${viewBooking.organisation ? ` · ${viewBooking.organisation}` : ""}`} />
              <InfoRow label="Contact" value={`${viewBooking.organiser_phone}${viewBooking.organiser_email ? ` · ${viewBooking.organiser_email}` : ""}`} />
              <div className="border-t border-slate-100 pt-3">
                <InfoRow label="Space Fee" value={fmtMoney(viewBooking.space_fee)} />
                <InfoRow label="Packages" value={fmtMoney(viewBooking.packages_total)} />
                <InfoRow label="Extras" value={fmtMoney(viewBooking.extras_total)} />
                <InfoRow label="Total" value={fmtMoney(viewBooking.total_amount)} bold />
                <InfoRow label="Deposit" value={`${fmtMoney(viewBooking.deposit_amount)}${viewBooking.deposit_paid_at ? " ✓ paid" : " (pending)"}`} />
                <InfoRow label="Balance Due" value={fmtMoney(viewBooking.balance_due)} bold />
              </div>
              {(bpByBooking[viewBooking.id] ?? []).length > 0 && (
                <div className="border-t border-slate-100 pt-3">
                  <p className="mb-1 text-xs font-semibold text-slate-400">Packages</p>
                  {(bpByBooking[viewBooking.id] ?? []).map((bp) => (
                    <div key={bp.id} className="flex justify-between text-xs text-slate-600">
                      <span>{bp.package_name} ×{bp.quantity}</span>
                      <span>{fmtMoney(bp.line_total)}</span>
                    </div>
                  ))}
                </div>
              )}
              {viewBooking.special_requests && (
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold text-slate-400">Special Requests</p>
                  <p className="text-slate-600">{viewBooking.special_requests}</p>
                </div>
              )}
              <div className="border-t border-slate-100 pt-3">
                <p className="mb-1 text-xs font-semibold text-slate-400">Status</p>
                <EvtBadge status={viewBooking.status} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3">
              {viewBooking.status === "inquiry" && (
                <QuickBtn color="blue" onClick={() => { statusAction(updateEventBookingStatusAction, viewBooking.id, "confirmed"); setViewBookingId(null); }}>Confirm</QuickBtn>
              )}
              {viewBooking.status === "confirmed" && (
                <QuickBtn color="teal" onClick={() => { statusAction(updateEventBookingStatusAction, viewBooking.id, "deposit_paid"); setViewBookingId(null); }}>Mark Deposit Paid</QuickBtn>
              )}
              {["confirmed","deposit_paid"].includes(viewBooking.status) && (
                <QuickBtn color="green" onClick={() => { statusAction(updateEventBookingStatusAction, viewBooking.id, "completed"); setViewBookingId(null); }}>Complete</QuickBtn>
              )}
              {!["cancelled","completed"].includes(viewBooking.status) && (
                <QuickBtn color="red" onClick={() => { statusAction(updateEventBookingStatusAction, viewBooking.id, "cancelled"); setViewBookingId(null); }}>Cancel</QuickBtn>
              )}
              <button onClick={() => setViewBookingId(null)} className="btn btn-secondary rounded-xl text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Space Modal ──────────────────────────────────────────────────── */}
      {showAddSpace && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <h3 className="mb-4 text-lg font-bold text-slate-900">{editSpace ? "Edit Space" : "New Event Space"}</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                if (editSpace) { fd.set("id", editSpace.id); run(updateSpaceAction, fd); }
                else { run(createSpaceAction, fd); }
                setShowAddSpace(false); setEditSpace(null);
              }}
              className="space-y-3"
            >
              <div>
                <label className="ui-label">Space Name *</label>
                <input name="name" className="ui-input w-full" required defaultValue={editSpace?.name ?? ""} placeholder="e.g. Rooftop Terrace" />
              </div>
              <div>
                <label className="ui-label">Description</label>
                <textarea name="description" className="ui-input w-full" rows={2} defaultValue={editSpace?.description ?? ""} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">Min Capacity</label>
                  <input name="capacity_min" className="ui-input w-full" type="number" min="1" defaultValue={editSpace?.capacity_min ?? ""} />
                </div>
                <div>
                  <label className="ui-label">Max Capacity *</label>
                  <input name="capacity_max" className="ui-input w-full" required type="number" min="1" defaultValue={editSpace?.capacity_max ?? 50} />
                </div>
                <div>
                  <label className="ui-label">Pricing Type</label>
                  <select name="pricing_type" className="ui-input w-full" defaultValue={editSpace?.pricing_type ?? "flat"}>
                    <option value="flat">Flat fee</option>
                    <option value="hourly">Hourly rate</option>
                  </select>
                </div>
                <div>
                  <label className="ui-label">Base Price ($)</label>
                  <input name="base_price" className="ui-input w-full" type="number" step="0.01" min="0" defaultValue={editSpace?.base_price ?? 0} />
                </div>
              </div>
              <div>
                <label className="ui-label">Amenities (comma-separated)</label>
                <input name="amenities" className="ui-input w-full" defaultValue={(editSpace?.amenities ?? []).join(", ")} placeholder="Projector, AV System, Private Bar" />
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button type="button" onClick={() => { setShowAddSpace(false); setEditSpace(null); }} className="btn btn-secondary rounded-xl text-sm">Cancel</button>
                <button type="submit" disabled={isPending} className="btn btn-primary rounded-xl text-sm disabled:opacity-60">
                  {isPending ? "Saving…" : editSpace ? "Save" : "Create Space"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Package Modal ────────────────────────────────────────────────── */}
      {showAddPackage && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <h3 className="mb-4 text-lg font-bold text-slate-900">New Package</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                run(createPackageAction, fd);
                setShowAddPackage(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="ui-label">Package Name *</label>
                <input name="name" className="ui-input w-full" required placeholder="e.g. Cocktail Reception" />
              </div>
              <div>
                <label className="ui-label">Description</label>
                <input name="description" className="ui-input w-full" placeholder="What's included" />
              </div>
              <div>
                <label className="ui-label">Price ($) *</label>
                <input name="price" className="ui-input w-full" required type="number" step="0.01" min="0" defaultValue={0} />
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button type="button" onClick={() => setShowAddPackage(false)} className="btn btn-secondary rounded-xl text-sm">Cancel</button>
                <button type="submit" disabled={isPending} className="btn btn-primary rounded-xl text-sm disabled:opacity-60">
                  {isPending ? "Saving…" : "Create Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Reservation Confirm ───────────────────────────────────────── */}
      {deleteResId && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <h3 className="text-base font-bold text-slate-900">Delete reservation?</h3>
            <p className="mt-1 text-sm text-slate-500">This cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setDeleteResId(null)} className="btn btn-secondary rounded-xl text-sm">Cancel</button>
              <button
                disabled={isPending}
                onClick={() => {
                  const fd = new FormData(); fd.set("id", deleteResId);
                  run(deleteReservationAction, fd);
                  setDeleteResId(null);
                }}
                className="btn rounded-xl bg-red-600 text-sm text-white hover:bg-red-700 disabled:opacity-60"
              >
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

function KpiCard({ label, value, color }: { label: string; value: string; color: "emerald" | "blue" | "violet" | "amber" }) {
  const colors = {
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    blue:    "border-blue-100 bg-blue-50 text-blue-700",
    violet:  "border-violet-100 bg-violet-50 text-violet-700",
    amber:   "border-amber-100 bg-amber-50 text-amber-700",
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}

function ResBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${RES_STATUS_STYLES[status] ?? "bg-slate-100 text-slate-500"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function EvtBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${EVT_STATUS_STYLES[status] ?? "bg-slate-100 text-slate-500"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function QuickBtn({
  color, onClick, children,
}: {
  color: "blue" | "teal" | "green" | "red" | "slate";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const c = {
    blue:  "bg-blue-100 text-blue-700 hover:bg-blue-200",
    teal:  "bg-teal-100 text-teal-700 hover:bg-teal-200",
    green: "bg-green-100 text-green-700 hover:bg-green-200",
    red:   "bg-red-100 text-red-600 hover:bg-red-200",
    slate: "bg-slate-100 text-slate-600 hover:bg-slate-200",
  };
  return (
    <button onClick={onClick} className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition ${c[color]}`}>
      {children}
    </button>
  );
}

function InfoRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5">
      <span className="shrink-0 text-xs text-slate-400">{label}</span>
      <span className={`text-right text-sm ${bold ? "font-bold text-slate-900" : "text-slate-600"}`}>{value}</span>
    </div>
  );
}

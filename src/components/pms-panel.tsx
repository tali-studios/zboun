"use client";

import { useState, useTransition, useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type RoomType = {
  id: string; name: string; description: string | null;
  capacity: number; base_rate: number; amenities: string[] | null;
  is_active: boolean; created_at: string;
};
type Room = {
  id: string; room_number: string; floor: number | null;
  room_type_id: string | null; status: string;
  notes: string | null; is_active: boolean;
  created_at: string; updated_at: string;
};
type Reservation = {
  id: string; room_id: string | null; room_type_id: string | null;
  reference_number: string | null; guest_name: string;
  guest_phone: string | null; guest_email: string | null;
  guest_id_number: string | null; nationality: string | null;
  adults: number; children: number;
  check_in_date: string; check_out_date: string;
  actual_check_in: string | null; actual_check_out: string | null;
  nights: number | null; status: string;
  rate_per_night: number; room_total: number;
  charges_total: number; grand_total: number;
  amount_paid: number; balance_due: number;
  booking_source: string | null;
  special_requests: string | null; internal_notes: string | null;
  crm_customer_id: string | null;
  created_at: string; updated_at: string;
};
type Charge = {
  id: string; reservation_id: string; category: string;
  description: string; amount: number;
  charged_at: string; created_at: string;
};
type HousekeepingLog = {
  id: string; room_id: string; task_type: string; status: string;
  assigned_to: string | null; notes: string | null;
  scheduled_date: string; completed_at: string | null;
  created_at: string; updated_at: string;
};
type CrmCustomer = { id: string; full_name: string; phone: string | null };

type Props = {
  restaurantName: string;
  roomTypes: RoomType[]; rooms: Room[]; reservations: Reservation[];
  charges: Charge[]; housekeeping: HousekeepingLog[];
  crmCustomers: CrmCustomer[];
  createRoomTypeAction: (fd: FormData) => Promise<void>;
  updateRoomTypeAction: (fd: FormData) => Promise<void>;
  deleteRoomTypeAction: (fd: FormData) => Promise<void>;
  createRoomAction: (fd: FormData) => Promise<void>;
  updateRoomAction: (fd: FormData) => Promise<void>;
  updateRoomStatusAction: (fd: FormData) => Promise<void>;
  deleteRoomAction: (fd: FormData) => Promise<void>;
  createPmsReservationAction: (fd: FormData) => Promise<void>;
  checkInAction: (fd: FormData) => Promise<void>;
  checkOutAction: (fd: FormData) => Promise<void>;
  cancelPmsReservationAction: (fd: FormData) => Promise<void>;
  updateReservationPaymentAction: (fd: FormData) => Promise<void>;
  extendReservationStayAction: (fd: FormData) => Promise<void>;
  autoMarkNoShowsAction: () => Promise<void>;
  runNightAuditAction: () => Promise<void>;
  moveReservationRoomAction: (fd: FormData) => Promise<void>;
  addChargeAction: (fd: FormData) => Promise<void>;
  deleteChargeAction: (fd: FormData) => Promise<void>;
  createHousekeepingTaskAction: (fd: FormData) => Promise<void>;
  updateHousekeepingStatusAction: (fd: FormData) => Promise<void>;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().split("T")[0];

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtMoney(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const ROOM_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  available:    { label: "Available",    color: "text-teal-700",   bg: "bg-teal-50",   border: "border-teal-200" },
  occupied:     { label: "Occupied",     color: "text-rose-700",   bg: "bg-rose-50",   border: "border-rose-200" },
  reserved:     { label: "Reserved",     color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200" },
  maintenance:  { label: "Maintenance",  color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200" },
  housekeeping: { label: "Housekeeping", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200" },
};

const RES_STATUS_STYLES: Record<string, string> = {
  inquiry:     "bg-amber-100 text-amber-700",
  confirmed:   "bg-blue-100 text-blue-700",
  checked_in:  "bg-teal-100 text-teal-700",
  checked_out: "bg-slate-100 text-slate-600",
  cancelled:   "bg-slate-100 text-slate-400",
  no_show:     "bg-red-100 text-red-600",
};

const HK_STATUS_STYLES: Record<string, string> = {
  pending:     "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  done:        "bg-teal-100 text-teal-700",
};

const CHARGE_CATEGORIES = ["restaurant","minibar","room_service","laundry","spa","phone","other"];
const BOOKING_SOURCES = ["direct","phone","walk_in","online","ota","corporate"];
const TASK_TYPES = ["cleaning","turndown","inspection","maintenance","deep_clean"];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function PmsPanel({
  restaurantName, roomTypes, rooms, reservations, charges, housekeeping, crmCustomers,
  createRoomTypeAction, updateRoomTypeAction, deleteRoomTypeAction,
  createRoomAction, updateRoomAction, updateRoomStatusAction, deleteRoomAction,
  createPmsReservationAction, checkInAction, checkOutAction,
  cancelPmsReservationAction, updateReservationPaymentAction,
  extendReservationStayAction, autoMarkNoShowsAction,
  runNightAuditAction, moveReservationRoomAction,
  addChargeAction, deleteChargeAction,
  createHousekeepingTaskAction, updateHousekeepingStatusAction,
}: Props) {
  const [tab, setTab] = useState<"overview" | "rooms" | "reservations" | "housekeeping" | "setup">("overview");
  const [isPending, startTransition] = useTransition();

  // Modals
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [showAddRoomType, setShowAddRoomType] = useState(false);
  const [editRoomType, setEditRoomType] = useState<RoomType | null>(null);
  const [showAddRes, setShowAddRes] = useState(false);
  const [viewResId, setViewResId] = useState<string | null>(null);
  const [checkoutResId, setCheckoutResId] = useState<string | null>(null);
  const [checkoutPaid, setCheckoutPaid] = useState("");
  const [resStatusFilter, setResStatusFilter] = useState("all");
  const [showAddTask, setShowAddTask] = useState(false);
  const [extendResId, setExtendResId] = useState<string | null>(null);
  const [extendCheckOutDate, setExtendCheckOutDate] = useState("");
  const [extendRatePerNight, setExtendRatePerNight] = useState("");
  const [moveResId, setMoveResId] = useState<string | null>(null);
  const [moveTargetRoomId, setMoveTargetRoomId] = useState("");

  // ── Derived ───────────────────────────────────────────────────────────────
  const typeMap = useMemo(() => Object.fromEntries(roomTypes.map((t) => [t.id, t])), [roomTypes]);
  const roomMap = useMemo(() => Object.fromEntries(rooms.map((r) => [r.id, r])), [rooms]);
  const chargesByRes = useMemo(() => {
    const m: Record<string, Charge[]> = {};
    for (const c of charges) (m[c.reservation_id] ??= []).push(c);
    return m;
  }, [charges]);

  const activeRooms = rooms.filter((r) => r.is_active);
  const occupiedCount = activeRooms.filter((r) => r.status === "occupied").length;
  const occupancyRate = activeRooms.length > 0 ? Math.round((occupiedCount / activeRooms.length) * 100) : 0;
  const todayArrivals = reservations.filter((r) => r.check_in_date === TODAY && r.status === "confirmed").length;
  const todayDepartures = reservations.filter((r) => r.check_out_date === TODAY && r.status === "checked_in").length;
  const housekeepingPending = housekeeping.filter((h) => h.status !== "done" && h.scheduled_date === TODAY).length;
  const monthStart = TODAY.slice(0, 7) + "-01";
  const monthRevenue = reservations
    .filter((r) => r.status === "checked_out" && r.check_out_date >= monthStart)
    .reduce((s, r) => s + Number(r.amount_paid), 0);
  const noShowCandidates = reservations.filter((r) => r.status === "confirmed" && r.check_in_date < TODAY).length;
  const departuresStillOpen = reservations.filter((r) => r.status === "checked_in" && r.check_out_date === TODAY).length;

  const frontDeskDays = useMemo(() => {
    const start = new Date(TODAY + "T00:00:00");
    return Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(start);
      d.setDate(start.getDate() + idx);
      const iso = d.toISOString().split("T")[0];
      const arrivals = reservations.filter((r) => r.check_in_date === iso && r.status === "confirmed").length;
      const departures = reservations.filter((r) => r.check_out_date === iso && r.status === "checked_in").length;
      return { iso, label: d.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" }), arrivals, departures };
    });
  }, [reservations]);
  const hkStaffBoard = useMemo(() => {
    const done = housekeeping.filter((task) => task.status === "done" && task.assigned_to?.trim());
    const map = new Map<string, { doneCount: number; pendingCount: number }>();
    for (const task of housekeeping) {
      const staff = task.assigned_to?.trim();
      if (!staff) continue;
      const current = map.get(staff) ?? { doneCount: 0, pendingCount: 0 };
      if (task.status === "done") current.doneCount += 1;
      else current.pendingCount += 1;
      map.set(staff, current);
    }
    return Array.from(map.entries())
      .map(([staff, data]) => ({ staff, ...data }))
      .sort((a, b) => b.doneCount - a.doneCount);
  }, [housekeeping]);

  const filteredReservations = useMemo(() => {
    let list = reservations;
    if (resStatusFilter !== "all") list = list.filter((r) => r.status === resStatusFilter);
    return list;
  }, [reservations, resStatusFilter]);

  const viewRes = viewResId ? reservations.find((r) => r.id === viewResId) ?? null : null;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function run(action: (fd: FormData) => Promise<void>, fd: FormData) {
    startTransition(async () => { await action(fd); });
  }
  function statusFd(action: (fd: FormData) => Promise<void>, id: string, status?: string) {
    const fd = new FormData(); fd.set("id", id);
    if (status) fd.set("status", status);
    run(action, fd);
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
              <p className="text-xs font-bold uppercase tracking-widest text-violet-200">Property Management</p>
              <h1 className="mt-1 text-xl font-bold md:text-2xl">{restaurantName}</h1>
              <p className="mt-0.5 text-xs text-violet-200 md:text-sm">Rooms, reservations, check-in/out, charges, and housekeeping.</p>
            </div>
            <a href="/dashboard/business" className="btn rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20">← Dashboard</a>
          </div>
        </header>

        {/* Tab bar */}
        <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          {(["overview","rooms","reservations","housekeeping","setup"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-semibold capitalize transition ${
                tab === t ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t === "setup" ? "Room Types" : t}
            </button>
          ))}
        </nav>

        {/* ── Overview ──────────────────────────────────────────────────────── */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard label="Occupancy Rate" value={`${occupancyRate}%`}
                sub={`${occupiedCount} / ${activeRooms.length} rooms`} color="sky" />
              <KpiCard label="Arrivals Today" value={todayArrivals.toString()} color="teal" />
              <KpiCard label="Departures Today" value={todayDepartures.toString()} color="amber" />
              <KpiCard label="Month Revenue" value={fmtMoney(monthRevenue)} color="indigo" />
            </div>

            {/* Room status grid */}
            <div className="panel p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-700">Room Status</p>
                <button onClick={() => setTab("rooms")} className="text-xs font-semibold text-sky-600 hover:underline">
                  Manage rooms →
                </button>
              </div>
              {activeRooms.length === 0 ? (
                <p className="text-sm text-slate-400">No rooms configured. Go to Room Types tab to add room types, then add rooms.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                  {activeRooms.map((room) => {
                    const cfg = ROOM_STATUS_CONFIG[room.status] ?? ROOM_STATUS_CONFIG.available;
                    const type = typeMap[room.room_type_id ?? ""];
                    return (
                      <div
                        key={room.id}
                        className={`rounded-xl border ${cfg.border} ${cfg.bg} p-3 text-center cursor-pointer transition hover:shadow-sm`}
                        onClick={() => { setTab("rooms"); }}
                        title={`${room.room_number} — ${cfg.label}${type ? ` · ${type.name}` : ""}`}
                      >
                        <p className={`text-sm font-bold ${cfg.color}`}>{room.room_number}</p>
                        <p className={`text-[10px] font-semibold uppercase tracking-wide ${cfg.color} opacity-70`}>
                          {cfg.label}
                        </p>
                        {type && <p className="mt-0.5 text-[9px] text-slate-400 truncate">{type.name}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Legend */}
              <div className="mt-3 flex flex-wrap gap-3">
                {Object.entries(ROOM_STATUS_CONFIG).map(([k, v]) => (
                  <span key={k} className="flex items-center gap-1 text-[11px] text-slate-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${v.bg} border ${v.border}`} />
                    {v.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Today's activity */}
            {(todayArrivals > 0 || todayDepartures > 0) && (
              <div className="grid gap-4 sm:grid-cols-2">
                {todayArrivals > 0 && (
                  <div className="panel p-4">
                    <p className="mb-2 text-sm font-bold text-teal-700">Today's Arrivals ({todayArrivals})</p>
                    {reservations
                      .filter((r) => r.check_in_date === TODAY && r.status === "confirmed")
                      .map((r) => (
                        <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{r.guest_name}</p>
                            <p className="text-xs text-slate-400">
                              {roomMap[r.room_id ?? ""]?.room_number ?? "Room TBD"} · {r.nights ?? "?"} night{(r.nights ?? 0) !== 1 ? "s" : ""}
                            </p>
                          </div>
                          <button
                            onClick={() => { const fd = new FormData(); fd.set("id", r.id); run(checkInAction, fd); }}
                            disabled={isPending}
                            className="rounded-lg bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-200 disabled:opacity-50"
                          >
                            Check In
                          </button>
                        </div>
                      ))}
                  </div>
                )}
                {todayDepartures > 0 && (
                  <div className="panel p-4">
                    <p className="mb-2 text-sm font-bold text-amber-700">Today's Departures ({todayDepartures})</p>
                    {reservations
                      .filter((r) => r.check_out_date === TODAY && r.status === "checked_in")
                      .map((r) => (
                        <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{r.guest_name}</p>
                            <p className="text-xs text-slate-400">
                              {roomMap[r.room_id ?? ""]?.room_number ?? "?"} · Balance: {fmtMoney(r.balance_due)}
                            </p>
                          </div>
                          <button
                            onClick={() => { setCheckoutResId(r.id); setCheckoutPaid(String(r.grand_total)); }}
                            className="rounded-lg bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-200"
                          >
                            Check Out
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Housekeeping pending */}
            {housekeepingPending > 0 && (
              <div className="panel border-violet-200 bg-violet-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-violet-800">
                    {housekeepingPending} housekeeping task{housekeepingPending !== 1 ? "s" : ""} pending today
                  </p>
                  <button onClick={() => setTab("housekeeping")} className="text-xs font-semibold text-violet-600 hover:underline">
                    View tasks →
                  </button>
                </div>
              </div>
            )}

            <div className="panel p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-700">Front desk 7-day board</p>
                {noShowCandidates > 0 && (
                  <button
                    onClick={() => {
                      startTransition(async () => {
                        await autoMarkNoShowsAction();
                      });
                    }}
                    className="rounded-lg bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200"
                  >
                    Sweep no-shows ({noShowCandidates})
                  </button>
                )}
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-7">
                {frontDeskDays.map((day) => (
                  <div key={day.iso} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-600">{day.label}</p>
                    <p className="mt-2 text-xs text-teal-700">Arrivals: <span className="font-bold">{day.arrivals}</span></p>
                    <p className="text-xs text-amber-700">Departures: <span className="font-bold">{day.departures}</span></p>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel p-5">
              <p className="text-sm font-bold text-slate-700">Night audit checklist</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <ChecklistItem label="No-show candidates" value={noShowCandidates} tone={noShowCandidates > 0 ? "warn" : "ok"} />
                <ChecklistItem label="Departures to close" value={departuresStillOpen} tone={departuresStillOpen > 0 ? "warn" : "ok"} />
                <ChecklistItem label="Housekeeping pending" value={housekeepingPending} tone={housekeepingPending > 0 ? "warn" : "ok"} />
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => {
                    startTransition(async () => {
                      await runNightAuditAction();
                    });
                  }}
                  className="btn btn-primary rounded-xl text-sm"
                >
                  Run night audit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Rooms ─────────────────────────────────────────────────────────── */}
        {tab === "rooms" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => { setEditRoom(null); setShowAddRoom(true); }} className="btn btn-primary rounded-xl text-sm">
                + Add Room
              </button>
            </div>
            <div className="panel overflow-hidden p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">Room</th>
                    <th className="px-4 py-3">Floor</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rooms.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">No rooms yet. Add your first room.</td></tr>
                  ) : (
                    rooms.map((room) => {
                      const cfg = ROOM_STATUS_CONFIG[room.status] ?? ROOM_STATUS_CONFIG.available;
                      const type = typeMap[room.room_type_id ?? ""];
                      return (
                        <tr key={room.id} className={`hover:bg-slate-50 ${!room.is_active ? "opacity-50" : ""}`}>
                          <td className="px-4 py-3 font-bold text-slate-800">{room.room_number}</td>
                          <td className="px-4 py-3 text-slate-500">{room.floor ?? "—"}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {type ? (
                              <div>
                                <p>{type.name}</p>
                                <p className="text-xs text-slate-400">{fmtMoney(type.base_rate)}/night</p>
                              </div>
                            ) : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              defaultValue={room.status}
                              onChange={(e) => {
                                const fd = new FormData(); fd.set("id", room.id); fd.set("status", e.target.value);
                                run(updateRoomStatusAction, fd);
                              }}
                              className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${cfg.border} ${cfg.bg} ${cfg.color}`}
                            >
                              {Object.entries(ROOM_STATUS_CONFIG).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5">
                              <button onClick={() => { setEditRoom(room); setShowAddRoom(true); }}
                                className="text-xs font-semibold text-violet-600 hover:underline">Edit</button>
                              <button onClick={() => { const fd = new FormData(); fd.set("id", room.id); run(deleteRoomAction, fd); }}
                                className="text-xs font-semibold text-red-400 hover:text-red-600">Delete</button>
                            </div>
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

        {/* ── Reservations ──────────────────────────────────────────────────── */}
        {tab === "reservations" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <select value={resStatusFilter} onChange={(e) => setResStatusFilter(e.target.value)} className="ui-input w-44">
                <option value="all">All statuses</option>
                {["inquiry","confirmed","checked_in","checked_out","cancelled","no_show"].map((s) => (
                  <option key={s} value={s}>{s.replace("_"," ")}</option>
                ))}
              </select>
              <button onClick={() => setShowAddRes(true)} className="btn btn-primary rounded-xl text-sm">
                + New Reservation
              </button>
            </div>
            <div className="space-y-3">
              {filteredReservations.length === 0 ? (
                <div className="panel p-8 text-center text-sm text-slate-400">No reservations found.</div>
              ) : (
                filteredReservations.map((r) => {
                  const room = roomMap[r.room_id ?? ""];
                  const type = typeMap[r.room_type_id ?? ""];
                  return (
                    <div key={r.id} className={`panel p-5 ${r.status === "cancelled" ? "opacity-60" : ""}`}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-slate-900">{r.guest_name}</p>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${RES_STATUS_STYLES[r.status] ?? "bg-slate-100 text-slate-500"}`}>
                              {r.status.replace("_"," ")}
                            </span>
                            {r.reference_number && (
                              <span className="font-mono text-xs text-slate-400">{r.reference_number}</span>
                            )}
                          </div>
                          <p className="mt-0.5 text-sm text-slate-600">
                            {room ? `Room ${room.room_number}` : type ? type.name : "No room assigned"} ·{" "}
                            {fmtDate(r.check_in_date)} → {fmtDate(r.check_out_date)} · {r.nights ?? "?"} night{(r.nights ?? 0) !== 1 ? "s" : ""}
                          </p>
                          <p className="text-xs text-slate-400">
                            {r.adults} adult{r.adults !== 1 ? "s" : ""}
                            {r.children > 0 ? `, ${r.children} child${r.children !== 1 ? "ren" : ""}` : ""} ·{" "}
                            {r.guest_phone ?? r.guest_email ?? "No contact"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900">{fmtMoney(r.grand_total)}</p>
                          <p className="text-xs text-slate-400">Room: {fmtMoney(r.room_total)} + Charges: {fmtMoney(r.charges_total)}</p>
                          <p className={`text-xs font-semibold ${r.balance_due > 0 ? "text-red-600" : "text-teal-600"}`}>
                            {r.balance_due > 0 ? `Balance due: ${fmtMoney(r.balance_due)}` : "Fully paid"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3">
                        {r.status === "confirmed" && (
                          <Qbtn color="teal" onClick={() => { const fd = new FormData(); fd.set("id", r.id); run(checkInAction, fd); }}>
                            Check In
                          </Qbtn>
                        )}
                        {r.status === "checked_in" && (
                          <Qbtn color="amber" onClick={() => { setCheckoutResId(r.id); setCheckoutPaid(String(r.grand_total)); }}>
                            Check Out
                          </Qbtn>
                        )}
                        {!["cancelled","checked_out","no_show"].includes(r.status) && (
                          <Qbtn color="red" onClick={() => { const fd = new FormData(); fd.set("id", r.id); run(cancelPmsReservationAction, fd); }}>
                            Cancel
                          </Qbtn>
                        )}
                        {r.status === "confirmed" && (
                          <Qbtn
                            color="blue"
                            onClick={() => {
                              setExtendResId(r.id);
                              setExtendCheckOutDate(r.check_out_date);
                              setExtendRatePerNight(String(r.rate_per_night));
                            }}
                          >
                            Extend stay
                          </Qbtn>
                        )}
                        {["confirmed", "checked_in"].includes(r.status) && (
                          <Qbtn
                            color="indigo"
                            onClick={() => {
                              setMoveResId(r.id);
                              setMoveTargetRoomId("");
                            }}
                          >
                            Move / upgrade room
                          </Qbtn>
                        )}
                        <Qbtn color="slate" onClick={() => setViewResId(r.id)}>View / Charges</Qbtn>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── Housekeeping ──────────────────────────────────────────────────── */}
        {tab === "housekeeping" && (
          <div className="space-y-4">
            {hkStaffBoard.length > 0 && (
              <div className="panel p-5">
                <p className="mb-3 text-sm font-bold text-slate-700">Housekeeping staff performance</p>
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {hkStaffBoard.map((staff) => (
                    <div key={staff.staff} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-sm font-semibold text-slate-800">{staff.staff}</p>
                      <p className="mt-1 text-xs text-teal-700">Completed: <span className="font-bold">{staff.doneCount}</span></p>
                      <p className="text-xs text-amber-700">Open tasks: <span className="font-bold">{staff.pendingCount}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <button onClick={() => setShowAddTask(true)} className="btn btn-primary rounded-xl text-sm">
                + Add Task
              </button>
            </div>
            {["pending","in_progress","done"].map((statusGroup) => {
              const tasks = housekeeping.filter((h) => h.status === statusGroup);
              if (tasks.length === 0) return null;
              return (
                <div key={statusGroup} className="panel p-5">
                  <p className="mb-3 text-sm font-bold text-slate-700 capitalize">{statusGroup.replace("_"," ")} ({tasks.length})</p>
                  <div className="space-y-2">
                    {tasks.map((h) => {
                      const room = roomMap[h.room_id];
                      return (
                        <div key={h.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-800">
                                Room {room?.room_number ?? "?"} — {h.task_type.replace("_"," ")}
                              </p>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${HK_STATUS_STYLES[h.status]}`}>
                                {h.status.replace("_"," ")}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">
                              {fmtDate(h.scheduled_date)}
                              {h.assigned_to ? ` · Assigned to: ${h.assigned_to}` : ""}
                            </p>
                            {h.notes && <p className="text-xs italic text-slate-400">"{h.notes}"</p>}
                          </div>
                          <div className="flex gap-1.5">
                            {h.status === "pending" && (
                              <Qbtn color="blue" onClick={() => statusFd(updateHousekeepingStatusAction, h.id, "in_progress")}>Start</Qbtn>
                            )}
                            {h.status === "in_progress" && (
                              <Qbtn color="teal" onClick={() => statusFd(updateHousekeepingStatusAction, h.id, "done")}>Done</Qbtn>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {housekeeping.length === 0 && (
              <div className="panel p-8 text-center text-sm text-slate-400">No housekeeping tasks. They are created automatically on checkout.</div>
            )}
          </div>
        )}

        {/* ── Room Types (Setup) ─────────────────────────────────────────────── */}
        {tab === "setup" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => { setEditRoomType(null); setShowAddRoomType(true); }} className="btn btn-primary rounded-xl text-sm">
                + Add Room Type
              </button>
            </div>
            {roomTypes.length === 0 ? (
              <div className="panel p-8 text-center text-sm text-slate-400">
                No room types yet. Create room types first, then add individual rooms.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {roomTypes.map((rt) => {
                  const roomsOfType = rooms.filter((r) => r.room_type_id === rt.id && r.is_active);
                  const available = roomsOfType.filter((r) => r.status === "available").length;
                  return (
                    <div key={rt.id} className={`panel p-5 ${!rt.is_active ? "opacity-60" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-slate-900">{rt.name}</p>
                        <div className="flex gap-1.5">
                          <button onClick={() => { setEditRoomType(rt); setShowAddRoomType(true); }}
                            className="text-xs text-violet-600 hover:underline">Edit</button>
                          <button onClick={() => { const fd = new FormData(); fd.set("id", rt.id); run(deleteRoomTypeAction, fd); }}
                            className="text-xs text-red-400 hover:text-red-600">Del</button>
                        </div>
                      </div>
                      {rt.description && <p className="mt-1 text-xs text-slate-500">{rt.description}</p>}
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                        <span>👥 Max {rt.capacity}</span>
                        <span className="font-bold text-sky-700">{fmtMoney(rt.base_rate)}/night</span>
                        <span>{roomsOfType.length} room{roomsOfType.length !== 1 ? "s" : ""} · {available} available</span>
                      </div>
                      {rt.amenities && rt.amenities.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {rt.amenities.map((a) => (
                            <span key={a} className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] text-sky-700">{a}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      </main>

      {/* ── View Reservation / Charges Modal ───────────────────────────────── */}
      {viewRes && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-sky-600">{viewRes.reference_number ?? "Reservation"}</p>
                <h3 className="text-lg font-bold text-slate-900">{viewRes.guest_name}</h3>
              </div>
              <button onClick={() => setViewResId(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-1 text-sm">
              <InfoRow label="Room" value={roomMap[viewRes.room_id ?? ""]?.room_number ?? "TBD"} />
              <InfoRow label="Dates" value={`${fmtDate(viewRes.check_in_date)} → ${fmtDate(viewRes.check_out_date)}`} />
              <InfoRow label="Nights" value={String(viewRes.nights ?? "?")} />
              <InfoRow label="Guests" value={`${viewRes.adults} adults${viewRes.children > 0 ? `, ${viewRes.children} children` : ""}`} />
              <InfoRow label="ID / Passport" value={viewRes.guest_id_number ?? "—"} />
              <InfoRow label="Nationality" value={viewRes.nationality ?? "—"} />
              <InfoRow label="Source" value={viewRes.booking_source ?? "direct"} />
              <div className="border-t border-slate-100 pt-2">
                <InfoRow label="Room Total" value={fmtMoney(viewRes.room_total)} />
                <InfoRow label="Charges" value={fmtMoney(viewRes.charges_total)} />
                <InfoRow label="Grand Total" value={fmtMoney(viewRes.grand_total)} bold />
                <InfoRow label="Paid" value={fmtMoney(viewRes.amount_paid)} />
                <InfoRow label="Balance Due" value={fmtMoney(viewRes.balance_due)} bold />
              </div>
            </div>

            {/* Charges */}
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="mb-2 text-sm font-bold text-slate-700">Room Charges</p>
              {(chargesByRes[viewRes.id] ?? []).length === 0 ? (
                <p className="text-xs text-slate-400">No charges added.</p>
              ) : (
                <div className="space-y-1">
                  {(chargesByRes[viewRes.id] ?? []).map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium text-slate-700">{c.description}</span>
                        <span className="ml-1 text-xs text-slate-400 capitalize">({c.category})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{fmtMoney(c.amount)}</span>
                        <button onClick={() => { const fd = new FormData(); fd.set("id", c.id); run(deleteChargeAction, fd); }}
                          className="text-xs text-red-400 hover:text-red-600">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  fd.set("reservation_id", viewRes.id);
                  run(addChargeAction, fd);
                  e.currentTarget.reset();
                }}
                className="mt-3 grid grid-cols-3 gap-2"
              >
                <div className="col-span-3">
                  <input name="description" className="ui-input w-full" required placeholder="Charge description" />
                </div>
                <div>
                  <select name="category" className="ui-input w-full">
                    {CHARGE_CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c.replace("_"," ")}</option>)}
                  </select>
                </div>
                <div>
                  <input name="amount" className="ui-input w-full" required type="number" step="0.01" min="0.01" placeholder="Amount" />
                </div>
                <button type="submit" disabled={isPending} className="btn btn-primary rounded-xl text-sm disabled:opacity-60">Add</button>
              </form>
            </div>

            <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button onClick={() => setViewResId(null)} className="btn btn-secondary rounded-xl text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Checkout Modal ──────────────────────────────────────────────────── */}
      {checkoutResId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            {(() => {
              const r = reservations.find((x) => x.id === checkoutResId);
              return (
                <>
                  <h3 className="text-lg font-bold text-slate-900">Check Out</h3>
                  <p className="mt-1 text-sm text-slate-500">{r?.guest_name}</p>
                  <div className="mt-4 space-y-3">
                    <InfoRow label="Grand Total" value={fmtMoney(r?.grand_total ?? 0)} bold />
                    <InfoRow label="Previously Paid" value={fmtMoney(r?.amount_paid ?? 0)} />
                    <div>
                      <label className="ui-label">Total Amount Paid ($)</label>
                      <input
                        type="number" step="0.01" min="0"
                        className="ui-input w-full"
                        value={checkoutPaid}
                        onChange={(e) => setCheckoutPaid(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      A housekeeping cleaning task will be created automatically.
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
                    <button onClick={() => setCheckoutResId(null)} className="btn btn-secondary rounded-xl text-sm">Cancel</button>
                    <button
                      disabled={isPending}
                      onClick={() => {
                        const fd = new FormData();
                        fd.set("id", checkoutResId);
                        fd.set("amount_paid", checkoutPaid);
                        run(checkOutAction, fd);
                        setCheckoutResId(null);
                      }}
                      className="btn btn-primary rounded-xl text-sm disabled:opacity-60"
                    >
                      {isPending ? "Processing…" : "Confirm Check Out"}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── Add / Edit Room Modal ────────────────────────────────────────────── */}
      {showAddRoom && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <h3 className="mb-4 text-lg font-bold text-slate-900">{editRoom ? "Edit Room" : "Add Room"}</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              if (editRoom) { fd.set("id", editRoom.id); run(updateRoomAction, fd); }
              else run(createRoomAction, fd);
              setShowAddRoom(false); setEditRoom(null);
            }} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">Room Number *</label>
                  <input name="room_number" className="ui-input w-full" required defaultValue={editRoom?.room_number ?? ""} placeholder="e.g. 101" />
                </div>
                <div>
                  <label className="ui-label">Floor</label>
                  <input name="floor" className="ui-input w-full" type="number" defaultValue={editRoom?.floor ?? ""} />
                </div>
              </div>
              <div>
                <label className="ui-label">Room Type</label>
                <select name="room_type_id" className="ui-input w-full" defaultValue={editRoom?.room_type_id ?? ""}>
                  <option value="">— No type —</option>
                  {roomTypes.map((rt) => <option key={rt.id} value={rt.id}>{rt.name} — {fmtMoney(rt.base_rate)}/night</option>)}
                </select>
              </div>
              <div>
                <label className="ui-label">Notes</label>
                <input name="notes" className="ui-input w-full" defaultValue={editRoom?.notes ?? ""} />
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button type="button" onClick={() => { setShowAddRoom(false); setEditRoom(null); }} className="btn btn-secondary rounded-xl text-sm">Cancel</button>
                <button type="submit" disabled={isPending} className="btn btn-primary rounded-xl text-sm disabled:opacity-60">
                  {isPending ? "Saving…" : editRoom ? "Save" : "Add Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add / Edit Room Type Modal ───────────────────────────────────────── */}
      {showAddRoomType && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <h3 className="mb-4 text-lg font-bold text-slate-900">{editRoomType ? "Edit Room Type" : "New Room Type"}</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              if (editRoomType) { fd.set("id", editRoomType.id); run(updateRoomTypeAction, fd); }
              else run(createRoomTypeAction, fd);
              setShowAddRoomType(false); setEditRoomType(null);
            }} className="space-y-3">
              <div>
                <label className="ui-label">Name *</label>
                <input name="name" className="ui-input w-full" required defaultValue={editRoomType?.name ?? ""} placeholder="e.g. Deluxe Double" />
              </div>
              <div>
                <label className="ui-label">Description</label>
                <textarea name="description" className="ui-input w-full" rows={2} defaultValue={editRoomType?.description ?? ""} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="ui-label">Max Capacity *</label>
                  <input name="capacity" className="ui-input w-full" required type="number" min="1" defaultValue={editRoomType?.capacity ?? 2} />
                </div>
                <div>
                  <label className="ui-label">Base Rate / night ($) *</label>
                  <input name="base_rate" className="ui-input w-full" required type="number" step="0.01" min="0" defaultValue={editRoomType?.base_rate ?? 0} />
                </div>
              </div>
              <div>
                <label className="ui-label">Amenities (comma-separated)</label>
                <input name="amenities" className="ui-input w-full" defaultValue={(editRoomType?.amenities ?? []).join(", ")} placeholder="Sea view, King bed, Jacuzzi" />
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button type="button" onClick={() => { setShowAddRoomType(false); setEditRoomType(null); }} className="btn btn-secondary rounded-xl text-sm">Cancel</button>
                <button type="submit" disabled={isPending} className="btn btn-primary rounded-xl text-sm disabled:opacity-60">
                  {isPending ? "Saving…" : editRoomType ? "Save" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Reservation Modal ────────────────────────────────────────────── */}
      {showAddRes && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <h3 className="mb-4 text-lg font-bold text-slate-900">New Reservation</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              // Auto-fill rate from room type if not set
              const roomTypeId = String(fd.get("room_type_id") ?? "").trim();
              const type = roomTypes.find((t) => t.id === roomTypeId);
              if (type && !fd.get("rate_per_night")) fd.set("rate_per_night", String(type.base_rate));
              run(createPmsReservationAction, fd);
              setShowAddRes(false);
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="ui-label">Guest Name *</label>
                  <input name="guest_name" className="ui-input w-full" required />
                </div>
                <div>
                  <label className="ui-label">Phone</label>
                  <input name="guest_phone" className="ui-input w-full" type="tel" />
                </div>
                <div>
                  <label className="ui-label">Email</label>
                  <input name="guest_email" className="ui-input w-full" type="email" />
                </div>
                <div>
                  <label className="ui-label">ID / Passport Number</label>
                  <input name="guest_id_number" className="ui-input w-full" />
                </div>
                <div>
                  <label className="ui-label">Nationality</label>
                  <input name="nationality" className="ui-input w-full" />
                </div>
                <div>
                  <label className="ui-label">Adults *</label>
                  <input name="adults" className="ui-input w-full" type="number" min="1" defaultValue={1} required />
                </div>
                <div>
                  <label className="ui-label">Children</label>
                  <input name="children" className="ui-input w-full" type="number" min="0" defaultValue={0} />
                </div>
                <div>
                  <label className="ui-label">Check-in Date *</label>
                  <input name="check_in_date" className="ui-input w-full" type="date" required defaultValue={TODAY} />
                </div>
                <div>
                  <label className="ui-label">Check-out Date *</label>
                  <input name="check_out_date" className="ui-input w-full" type="date" required />
                </div>
                <div>
                  <label className="ui-label">Room</label>
                  <select name="room_id" className="ui-input w-full">
                    <option value="">— TBD —</option>
                    {rooms.filter((r) => r.is_active && r.status === "available").map((r) => {
                      const t = typeMap[r.room_type_id ?? ""];
                      return <option key={r.id} value={r.id}>Room {r.room_number}{t ? ` (${t.name})` : ""}</option>;
                    })}
                  </select>
                </div>
                <div>
                  <label className="ui-label">Room Type</label>
                  <select name="room_type_id" className="ui-input w-full">
                    <option value="">— Select —</option>
                    {roomTypes.filter((t) => t.is_active).map((t) => (
                      <option key={t.id} value={t.id}>{t.name} — {fmtMoney(t.base_rate)}/night</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="ui-label">Rate / Night ($) *</label>
                  <input name="rate_per_night" className="ui-input w-full" type="number" step="0.01" min="0" required defaultValue={0} />
                </div>
                <div>
                  <label className="ui-label">Amount Paid ($)</label>
                  <input name="amount_paid" className="ui-input w-full" type="number" step="0.01" min="0" defaultValue={0} />
                </div>
                <div>
                  <label className="ui-label">Booking Source</label>
                  <select name="booking_source" className="ui-input w-full">
                    {BOOKING_SOURCES.map((s) => <option key={s} value={s} className="capitalize">{s.replace("_"," ")}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="ui-label">Special Requests</label>
                <textarea name="special_requests" className="ui-input w-full" rows={2} />
              </div>
              <div>
                <label className="ui-label">Internal Notes</label>
                <textarea name="internal_notes" className="ui-input w-full" rows={2} />
              </div>
              {crmCustomers.length > 0 && (
                <div>
                  <label className="ui-label">Link to CRM Customer</label>
                  <select name="crm_customer_id" className="ui-input w-full">
                    <option value="">— None —</option>
                    {crmCustomers.map((c) => <option key={c.id} value={c.id}>{c.full_name}{c.phone ? ` · ${c.phone}` : ""}</option>)}
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button type="button" onClick={() => setShowAddRes(false)} className="btn btn-secondary rounded-xl text-sm">Cancel</button>
                <button type="submit" disabled={isPending} className="btn btn-primary rounded-xl text-sm disabled:opacity-60">
                  {isPending ? "Creating…" : "Create Reservation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Housekeeping Task Modal ──────────────────────────────────────── */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Add Housekeeping Task</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              run(createHousekeepingTaskAction, fd);
              setShowAddTask(false);
            }} className="space-y-3">
              <div>
                <label className="ui-label">Room *</label>
                <select name="room_id" className="ui-input w-full" required>
                  <option value="">— Select room —</option>
                  {rooms.filter((r) => r.is_active).map((r) => <option key={r.id} value={r.id}>Room {r.room_number}</option>)}
                </select>
              </div>
              <div>
                <label className="ui-label">Task Type</label>
                <select name="task_type" className="ui-input w-full">
                  {TASK_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.replace("_"," ")}</option>)}
                </select>
              </div>
              <div>
                <label className="ui-label">Scheduled Date</label>
                <input name="scheduled_date" className="ui-input w-full" type="date" defaultValue={TODAY} />
              </div>
              <div>
                <label className="ui-label">Assign To</label>
                <input name="assigned_to" className="ui-input w-full" placeholder="Staff name" />
              </div>
              <div>
                <label className="ui-label">Notes</label>
                <input name="notes" className="ui-input w-full" />
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button type="button" onClick={() => setShowAddTask(false)} className="btn btn-secondary rounded-xl text-sm">Cancel</button>
                <button type="submit" disabled={isPending} className="btn btn-primary rounded-xl text-sm disabled:opacity-60">
                  {isPending ? "Saving…" : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {extendResId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Extend stay</h3>
            <p className="mt-1 text-sm text-slate-500">
              {reservations.find((r) => r.id === extendResId)?.guest_name ?? "Reservation"}
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="ui-label">New check-out date</label>
                <input
                  type="date"
                  className="ui-input w-full"
                  value={extendCheckOutDate}
                  onChange={(e) => setExtendCheckOutDate(e.target.value)}
                />
              </div>
              <div>
                <label className="ui-label">Rate per night ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="ui-input w-full"
                  value={extendRatePerNight}
                  onChange={(e) => setExtendRatePerNight(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button onClick={() => setExtendResId(null)} className="btn btn-secondary rounded-xl text-sm">Cancel</button>
              <button
                disabled={isPending}
                onClick={() => {
                  const fd = new FormData();
                  fd.set("id", extendResId);
                  fd.set("check_out_date", extendCheckOutDate);
                  fd.set("rate_per_night", extendRatePerNight);
                  run(extendReservationStayAction, fd);
                  setExtendResId(null);
                }}
                className="btn btn-primary rounded-xl text-sm disabled:opacity-60"
              >
                Save extension
              </button>
            </div>
          </div>
        </div>
      )}

      {moveResId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Move / upgrade room</h3>
            <p className="mt-1 text-sm text-slate-500">
              {reservations.find((r) => r.id === moveResId)?.guest_name ?? "Reservation"}
            </p>
            <div className="mt-4">
              <label className="ui-label">Target available room</label>
              <select className="ui-input w-full" value={moveTargetRoomId} onChange={(e) => setMoveTargetRoomId(e.target.value)}>
                <option value="">— Select room —</option>
                {rooms
                  .filter((room) => room.is_active && room.status === "available")
                  .map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.room_number}
                    </option>
                  ))}
              </select>
            </div>
            <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button onClick={() => setMoveResId(null)} className="btn btn-secondary rounded-xl text-sm">Cancel</button>
              <button
                disabled={isPending || !moveTargetRoomId}
                onClick={() => {
                  const fd = new FormData();
                  fd.set("id", moveResId);
                  fd.set("target_room_id", moveTargetRoomId);
                  run(moveReservationRoomAction, fd);
                  setMoveResId(null);
                }}
                className="btn btn-primary rounded-xl text-sm disabled:opacity-60"
              >
                Confirm move
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

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: "sky" | "teal" | "amber" | "indigo" }) {
  const colors = {
    sky:    "border-sky-100 bg-sky-50 text-sky-700",
    teal:   "border-teal-100 bg-teal-50 text-teal-700",
    amber:  "border-amber-100 bg-amber-50 text-amber-700",
    indigo: "border-indigo-100 bg-indigo-50 text-indigo-700",
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      {sub && <p className="mt-0.5 text-xs opacity-60 truncate">{sub}</p>}
    </div>
  );
}

function Qbtn({ color, onClick, children }: { color: "teal"|"amber"|"blue"|"red"|"indigo"|"slate"; onClick: () => void; children: React.ReactNode }) {
  const c = {
    teal:  "bg-teal-100 text-teal-700 hover:bg-teal-200",
    amber: "bg-amber-100 text-amber-700 hover:bg-amber-200",
    blue:  "bg-blue-100 text-blue-700 hover:bg-blue-200",
    red:   "bg-red-100 text-red-600 hover:bg-red-200",
    indigo:"bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
    slate: "bg-slate-100 text-slate-600 hover:bg-slate-200",
  };
  return <button onClick={onClick} className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${c[color]}`}>{children}</button>;
}

function ChecklistItem({ label, value, tone }: { label: string; value: number; tone: "ok" | "warn" }) {
  return (
    <div className={`rounded-xl border p-3 ${tone === "warn" ? "border-amber-200 bg-amber-50" : "border-teal-200 bg-teal-50"}`}>
      <p className="text-xs text-slate-600">{label}</p>
      <p className={`mt-1 text-xl font-bold ${tone === "warn" ? "text-amber-700" : "text-teal-700"}`}>{value}</p>
    </div>
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

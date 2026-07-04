"use client";

import { useMemo, useState } from "react";
import { Check, Pencil, Power, PowerOff, Trash2, X } from "lucide-react";
import {
  createRestaurantDriverAction,
  deleteRestaurantDriverAction,
  toggleRestaurantDriverAction,
  updateRestaurantDriverAction,
  type RestaurantDriver,
} from "@/app-actions/drivers";
import type { OrderRow } from "@/app-actions/orders";
import { PhoneNumberField } from "@/components/phone-number-field";
import { parseStoredPhone } from "@/lib/driver-phone";

const DATE_PRESETS = [
  { key: "all", label: "All loaded" },
  { key: "today", label: "Today" },
  { key: "7d", label: "This week" },
  { key: "30d", label: "Last 30 days" },
  { key: "month", label: "This month" },
] as const;

type DatePresetKey = (typeof DATE_PRESETS)[number]["key"] | "custom";

type DateRange = {
  label: string;
  start: Date | null;
  end: Date | null;
};

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function parseDateInput(value: string, boundary: "start" | "end") {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return boundary === "start" ? startOfDay(date) : endOfDay(date);
}

function getDateRange(preset: DatePresetKey, customStart: string, customEnd: string): DateRange {
  if (preset === "custom") {
    const start = parseDateInput(customStart, "start");
    const end = parseDateInput(customEnd, "end");
    if (start && end) return { label: `${customStart} to ${customEnd}`, start, end };
    if (start) return { label: `Since ${customStart}`, start, end: null };
    if (end) return { label: `Until ${customEnd}`, start: null, end };
    return { label: "Custom period", start: null, end: null };
  }

  const now = new Date();
  if (preset === "today") return { label: "Today", start: startOfDay(now), end: endOfDay(now) };
  if (preset === "7d") {
    const start = startOfDay(now);
    start.setDate(start.getDate() - 6);
    return { label: "This week", start, end: endOfDay(now) };
  }
  if (preset === "30d") {
    const start = startOfDay(now);
    start.setDate(start.getDate() - 29);
    return { label: "Last 30 days", start, end: endOfDay(now) };
  }
  if (preset === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { label: "This month", start, end: endOfDay(now) };
  }
  return { label: "All loaded orders", start: null, end: null };
}

function orderIsInRange(order: OrderRow, range: DateRange) {
  if (!range.start && !range.end) return true;
  const createdAt = new Date(order.created_at).getTime();
  if (Number.isNaN(createdAt)) return false;
  if (range.start && createdAt < range.start.getTime()) return false;
  if (range.end && createdAt > range.end.getTime()) return false;
  return true;
}

type Props = {
  drivers: RestaurantDriver[];
  orders: OrderRow[];
  driverManagementEnabled: boolean;
  errorCode?: string | null;
};

const FIELD_LABEL_CLASS = "text-xs font-semibold uppercase tracking-wide text-slate-500";

const PRIMARY_BUTTON_CLASS =
  "inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-500/20 transition hover:brightness-105 active:scale-[0.99]";

const ICON_BTN =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition active:scale-95";

const ICON_EDIT_CLASS = `${ICON_BTN} bg-violet-100 text-violet-700 hover:bg-violet-200`;
const ICON_DISABLE_CLASS = `${ICON_BTN} bg-amber-100 text-amber-700 hover:bg-amber-200`;
const ICON_ENABLE_CLASS = `${ICON_BTN} bg-emerald-100 text-emerald-700 hover:bg-emerald-200`;
const ICON_DELETE_CLASS = `${ICON_BTN} bg-red-100 text-red-600 hover:bg-red-200`;
const ICON_SAVE_CLASS = `${ICON_BTN} bg-violet-600 text-white hover:bg-violet-700`;
const ICON_CANCEL_CLASS = `${ICON_BTN} bg-slate-100 text-slate-600 hover:bg-slate-200`;

const DRIVER_ERROR_MESSAGES: Record<string, string> = {
  invalid_phone:
    "Phone must be digits only. For Lebanon, enter the local number (e.g. 03123456 or 71234567) — not letters, and without typing +961.",
  duplicate_phone: "Another driver in your store already uses this phone number. Each driver must have a unique phone.",
};

function DriverStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

const DRIVER_EDIT_FORM_ID = "driver-edit-form";

type DriverTableRowProps = {
  driver: RestaurantDriver;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
};

function DriverTableRow({ driver, isEditing, onEdit, onCancel }: DriverTableRowProps) {
  const storedPhone = parseStoredPhone(driver.phone);

  if (isEditing) {
    return (
      <tr className="bg-violet-50/50">
        <td className="px-3 py-2.5">
          <input
            form={DRIVER_EDIT_FORM_ID}
            name="full_name"
            required
            defaultValue={driver.full_name}
            className="ui-input min-w-[8rem] py-1.5 text-sm"
            aria-label="Driver name"
          />
        </td>
        <td className="px-3 py-2.5">
          <PhoneNumberField
            name="phone"
            form={DRIVER_EDIT_FORM_ID}
            defaultPhone={storedPhone.localPhone}
            defaultCountryCode={storedPhone.countryCode}
            showLabel={false}
            className="min-w-[12rem]"
          />
        </td>
        <td className="px-3 py-2.5">
          <DriverStatusBadge active={driver.is_active} />
        </td>
        <td className="px-3 py-2.5">
          <div className="flex flex-nowrap items-center justify-end gap-1.5">
            <button type="submit" form={DRIVER_EDIT_FORM_ID} className={ICON_SAVE_CLASS} title="Save" aria-label="Save">
              <Check className="h-4 w-4" strokeWidth={2.5} />
            </button>
            <button type="button" onClick={onCancel} className={ICON_CANCEL_CLASS} title="Cancel" aria-label="Cancel">
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-slate-50/60">
      <td className="px-3 py-2.5 font-medium text-slate-900">{driver.full_name}</td>
      <td className="px-3 py-2.5 text-slate-600">{driver.phone || "—"}</td>
      <td className="px-3 py-2.5">
        <DriverStatusBadge active={driver.is_active} />
      </td>
      <td className="px-3 py-2.5">
        <div className="flex flex-nowrap items-center justify-end gap-1.5">
          <button type="button" onClick={onEdit} className={ICON_EDIT_CLASS} title="Edit" aria-label="Edit">
            <Pencil className="h-4 w-4" />
          </button>
          <form action={toggleRestaurantDriverAction} className="inline">
            <input type="hidden" name="id" value={driver.id} />
            <input type="hidden" name="is_active" value={driver.is_active ? "false" : "true"} />
            <button
              type="submit"
              className={driver.is_active ? ICON_DISABLE_CLASS : ICON_ENABLE_CLASS}
              title={driver.is_active ? "Disable" : "Enable"}
              aria-label={driver.is_active ? "Disable" : "Enable"}
            >
              {driver.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
            </button>
          </form>
          <form action={deleteRestaurantDriverAction} className="inline">
            <input type="hidden" name="id" value={driver.id} />
            <button type="submit" className={ICON_DELETE_CLASS} title="Delete" aria-label="Delete">
              <Trash2 className="h-4 w-4" />
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}

export function RestaurantDriversPanel({
  drivers,
  orders,
  driverManagementEnabled,
  errorCode,
}: Props) {
  const [preset, setPreset] = useState<DatePresetKey>("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function saveDriverAction(formData: FormData) {
    await updateRestaurantDriverAction(formData);
    setEditingId(null);
  }
  const range = useMemo(() => getDateRange(preset, customStart, customEnd), [preset, customStart, customEnd]);
  const periodOrders = useMemo(() => orders.filter((order) => orderIsInRange(order, range)), [orders, range]);

  const statsByDriver = useMemo(() => {
    const map = new Map<string, { orders: number; delivered: number; active: number; revenue: number }>();
    for (const driver of drivers) {
      map.set(driver.id, { orders: 0, delivered: 0, active: 0, revenue: 0 });
    }
    for (const order of periodOrders) {
      if (!order.driver_id) continue;
      const stat = map.get(order.driver_id) ?? { orders: 0, delivered: 0, active: 0, revenue: 0 };
      stat.orders += 1;
      if (order.status === "delivered") stat.delivered += 1;
      if (!["delivered", "cancelled"].includes(order.status)) stat.active += 1;
      if (order.status !== "cancelled") stat.revenue += Number(order.total_usd) || 0;
      map.set(order.driver_id, stat);
    }
    return map;
  }, [drivers, periodOrders]);

  const unassignedOrders = periodOrders.filter((order) => !order.driver_id && order.status !== "cancelled").length;
  const editingDriver = editingId ? drivers.find((driver) => driver.id === editingId) : null;

  return (
    <div className="space-y-5">
      {!driverManagementEnabled ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Driver management is currently disabled. Enable it in Store settings to assign drivers to orders.
        </div>
      ) : null}

      {errorCode && DRIVER_ERROR_MESSAGES[errorCode] ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {DRIVER_ERROR_MESSAGES[errorCode]}
        </div>
      ) : null}

      <section className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Driver performance</h2>
            <p className="mt-1 text-xs text-slate-500">{range.label} from the latest loaded menu orders.</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
            {unassignedOrders} unassigned
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {DATE_PRESETS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setPreset(option.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                preset === option.key
                  ? "bg-violet-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {option.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPreset("custom")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              preset === "custom"
                ? "bg-violet-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Custom
          </button>
        </div>
        {preset === "custom" ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <input type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} className="ui-input" />
            <input type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} className="ui-input" />
          </div>
        ) : null}
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {drivers.map((driver) => {
            const stat = statsByDriver.get(driver.id) ?? { orders: 0, delivered: 0, active: 0, revenue: 0 };
            return (
              <div key={driver.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{driver.full_name}</p>
                    <p className="text-xs text-slate-500">{driver.phone || "No phone"}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      driver.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {driver.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <p className="rounded-lg bg-slate-50 px-2 py-1.5">
                    <span className="block font-bold text-slate-900">{stat.orders}</span>
                    assigned
                  </p>
                  <p className="rounded-lg bg-slate-50 px-2 py-1.5">
                    <span className="block font-bold text-slate-900">{stat.delivered}</span>
                    delivered
                  </p>
                  <p className="rounded-lg bg-slate-50 px-2 py-1.5">
                    <span className="block font-bold text-slate-900">{stat.active}</span>
                    active
                  </p>
                  <p className="rounded-lg bg-slate-50 px-2 py-1.5">
                    <span className="block font-bold text-slate-900">${stat.revenue.toFixed(2)}</span>
                    revenue
                  </p>
                </div>
              </div>
            );
          })}
          {drivers.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
              No drivers yet. Add your first driver below.
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-bold text-slate-900">Drivers</h2>
          <p className="mt-0.5 text-xs text-slate-500">Add drivers and manage name &amp; phone from the table.</p>
        </div>

        <form
          action={createRestaurantDriverAction}
          className="flex flex-col gap-2 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-end sm:gap-3 sm:px-5"
        >
          <label className="block min-w-0 flex-1 space-y-1">
            <span className={FIELD_LABEL_CLASS}>Driver name</span>
            <input name="full_name" required placeholder="Driver name" className="ui-input py-2 text-sm" />
          </label>
          <div className="min-w-0 flex-1">
            <span className={FIELD_LABEL_CLASS}>Phone number</span>
            <PhoneNumberField name="phone" showLabel={false} className="mt-1" />
          </div>
          <button type="submit" className={`${PRIMARY_BUTTON_CLASS} w-full sm:w-auto`}>
            Add driver
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-[520px] w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Driver name
                </th>
                <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Phone
                </th>
                <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Status
                </th>
                <th className="w-[1%] whitespace-nowrap px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drivers.map((driver) => (
                <DriverTableRow
                  key={driver.id}
                  driver={driver}
                  isEditing={editingId === driver.id}
                  onEdit={() => setEditingId(driver.id)}
                  onCancel={() => setEditingId(null)}
                />
              ))}
            </tbody>
          </table>
          {drivers.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500 sm:px-5">
              No drivers yet. Add your first driver above.
            </p>
          ) : null}
        </div>

        {editingDriver ? (
          <form id={DRIVER_EDIT_FORM_ID} action={saveDriverAction} className="hidden">
            <input type="hidden" name="id" value={editingDriver.id} />
            <input type="hidden" name="is_active" value={editingDriver.is_active ? "true" : "false"} />
          </form>
        ) : null}
      </section>
    </div>
  );
}

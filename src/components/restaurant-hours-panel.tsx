"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_OPENING_HOURS,
  isRestaurantOpenNow,
  parseOpeningHours,
  serializeOpeningHoursForForm,
  WEEKDAY_LABELS,
  type DayHours,
} from "@/lib/opening-hours";
import {
  updateRestaurantHoursAction,
} from "@/app-actions/restaurant";
import { ValidatedActionForm } from "@/components/validated-action-form";

type Props = {
  openingHours: DayHours[];
  isTemporarilyClosed: boolean;
};

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

function parseTimeValue(value: string): { hour: string; minute: string } {
  const [hour = "09", minute = "00"] = value.split(":");
  return {
    hour: HOUR_OPTIONS.includes(hour) ? hour : "09",
    minute: MINUTE_OPTIONS.includes(minute) ? minute : "00",
  };
}

/** Native time inputs overflow on mobile; dropdowns stay within the card. */
function MobileTimeSelect({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const { hour, minute } = parseTimeValue(value);

  return (
    <div className="min-w-0">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="grid min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-1.5">
        <select
          value={hour}
          onChange={(e) => onChange(`${e.target.value}:${minute}`)}
          className="ui-select min-w-0 py-2 text-sm"
          aria-label={`${label} hour`}
        >
          {HOUR_OPTIONS.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span className="text-sm font-semibold text-slate-400" aria-hidden>
          :
        </span>
        <select
          value={minute}
          onChange={(e) => onChange(`${hour}:${e.target.value}`)}
          className="ui-select min-w-0 py-2 text-sm"
          aria-label={`${label} minute`}
        >
          {MINUTE_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function HoursDayTableCells({
  row,
  onUpdate,
}: {
  row: DayHours;
  onUpdate: (patch: Partial<DayHours>) => void;
}) {
  return (
    <>
      <td className="px-3 py-2.5">
        <input
          type="time"
          value={row.open}
          disabled={row.closed}
          onChange={(e) => onUpdate({ open: e.target.value })}
          className="ui-input w-full min-w-0 py-1.5 text-sm disabled:opacity-50"
        />
      </td>
      <td className="px-3 py-2.5">
        <input
          type="time"
          value={row.close}
          disabled={row.closed}
          onChange={(e) => onUpdate({ close: e.target.value })}
          className="ui-input w-full min-w-0 py-1.5 text-sm disabled:opacity-50"
        />
      </td>
      <td className="px-3 py-2.5">
        <label className="inline-flex items-center gap-2 text-slate-600">
          <input
            type="checkbox"
            checked={row.closed}
            onChange={(e) => onUpdate({ closed: e.target.checked })}
            className="h-4 w-4 accent-rose-600"
          />
          Closed
        </label>
      </td>
    </>
  );
}

function resolveInitialHours(openingHours: DayHours[]): DayHours[] {
  const parsed = parseOpeningHours(openingHours, { fallbackToDefault: false });
  return parsed.length > 0 ? parsed : DEFAULT_OPENING_HOURS;
}

export function RestaurantHoursPanel({ openingHours, isTemporarilyClosed }: Props) {
  const [hours, setHours] = useState<DayHours[]>(() => resolveInitialHours(openingHours));
  const [tempClosed, setTempClosed] = useState(isTemporarilyClosed);
  const [alwaysOpen, setAlwaysOpen] = useState(() => {
    // Explicit empty array = Always open (24/7)
    if (Array.isArray(openingHours) && openingHours.length === 0) return true;
    return parseOpeningHours(openingHours, { fallbackToDefault: false }).length === 0;
  });

  const serialized = useMemo(() => alwaysOpen ? "[]" : serializeOpeningHoursForForm(hours), [hours, alwaysOpen]);

  const rows = useMemo(
    () =>
      DEFAULT_OPENING_HOURS.map((fallback) => hours.find((h) => h.day === fallback.day) ?? fallback),
    [hours],
  );

  // Calculate current status based on SAVED state (props), not local changes
  const currentStatus = useMemo(() => {
    // Use initial props, not local state
    if (isTemporarilyClosed) return { status: "emergency_closed", label: "Emergency Closed", color: "rose" };
    
    // Check if saved hours are empty (always open)
    if (openingHours.length === 0) return { status: "always_open", label: "Always Open (24/7)", color: "blue" };
    
    // Check if currently open based on saved hours
    const now = new Date();
    const isOpen = openingHours.length > 0 && isRestaurantOpenNow(openingHours, { now });
    
    if (isOpen) return { status: "open", label: "Currently Open", color: "emerald" };
    return { status: "closed", label: "Currently Closed", color: "slate" };
  }, [isTemporarilyClosed, openingHours]);

  function updateDay(day: number, patch: Partial<DayHours>) {
    setHours((prev) => {
      const base = prev.length > 0 ? prev : DEFAULT_OPENING_HOURS;
      return base.map((row) => (row.day === day ? { ...row, ...patch } : row));
    });
  }

  function selectAlwaysOpen() {
    setAlwaysOpen(true);
  }

  function selectWeeklyHours() {
    setAlwaysOpen(false);
    setHours((prev) => (prev.length > 0 ? prev : DEFAULT_OPENING_HOURS));
  }

  function handleEmergencyToggle() {
    setTempClosed(!tempClosed);
  }

  function validateHoursBeforeSave(): string | null {
    if (alwaysOpen) return null;
    for (const row of rows) {
      if (row.closed) continue;
      const [oh, om] = row.open.split(":").map(Number);
      const [ch, cm] = row.close.split(":").map(Number);
      if (![oh, om, ch, cm].every((n) => Number.isFinite(n))) {
        return `Check opening hours for ${WEEKDAY_LABELS[row.day]} — use valid open and close times.`;
      }
      const openMin = oh! * 60 + om!;
      const closeMin = ch! * 60 + cm!;
      if (closeMin < openMin) {
        return `${WEEKDAY_LABELS[row.day]}: close time must be after open time (or mark the day Closed).`;
      }
    }
    return null;
  }

  return (
    <div className="panel min-w-0 overflow-x-hidden p-4 sm:p-5">
      {/* Status indicator */}
      <div className={`mb-4 flex items-center gap-3 rounded-xl border-2 px-4 py-3 ${
        currentStatus.color === "rose" ? "border-rose-300 bg-rose-50" :
        currentStatus.color === "blue" ? "border-blue-300 bg-blue-50" :
        currentStatus.color === "emerald" ? "border-emerald-300 bg-emerald-50" :
        "border-slate-300 bg-slate-50"
      }`}>
        <div className={`flex h-3 w-3 items-center justify-center rounded-full ${
          currentStatus.color === "rose" ? "bg-rose-500" :
          currentStatus.color === "blue" ? "bg-blue-500 animate-pulse" :
          currentStatus.color === "emerald" ? "bg-emerald-500 animate-pulse" :
          "bg-slate-400"
        }`}>
          <div className={`h-2 w-2 rounded-full ${
            currentStatus.color === "rose" ? "bg-rose-600" :
            currentStatus.color === "blue" ? "bg-blue-600" :
            currentStatus.color === "emerald" ? "bg-emerald-600" :
            "bg-slate-500"
          }`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-bold ${
            currentStatus.color === "rose" ? "text-rose-900" :
            currentStatus.color === "blue" ? "text-blue-900" :
            currentStatus.color === "emerald" ? "text-emerald-900" :
            "text-slate-900"
          }`}>
            Store Status: {currentStatus.label}
          </p>
          <p className={`mt-0.5 text-xs ${
            currentStatus.color === "rose" ? "text-rose-700" :
            currentStatus.color === "blue" ? "text-blue-700" :
            currentStatus.color === "emerald" ? "text-emerald-700" :
            "text-slate-600"
          }`}>
            {currentStatus.status === "emergency_closed" && "Customers cannot place orders"}
            {currentStatus.status === "always_open" && "Customers can order anytime"}
            {currentStatus.status === "open" && "Customers can place orders now"}
            {currentStatus.status === "closed" && "Outside of operating hours"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <h2 className="panel-title">Opening hours</h2>
          <p className="mt-1 text-sm text-slate-500">
            {alwaysOpen
              ? "Your store appears as always open. Perfect for online stores that don't have physical hours."
              : "Customers can schedule delivery up to 5 days ahead, only during these hours."}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div
            role="group"
            aria-label="Opening hours mode"
            className="grid w-full gap-2 sm:w-auto sm:grid-cols-2"
          >
            <button
              type="button"
              onClick={selectAlwaysOpen}
              aria-pressed={alwaysOpen}
              className={`rounded-full px-4 py-2.5 text-sm font-bold shadow-sm transition ${
                alwaysOpen
                  ? "bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-600 ring-offset-2"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
              }`}
            >
              Always open (24/7)
            </button>
            <button
              type="button"
              onClick={selectWeeklyHours}
              aria-pressed={!alwaysOpen}
              className={`rounded-full px-4 py-2.5 text-sm font-bold shadow-sm transition ${
                !alwaysOpen
                  ? "bg-violet-600 text-white shadow-violet-500/25 ring-2 ring-violet-600 ring-offset-2"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-800"
              }`}
            >
              Set weekly hours
            </button>
          </div>
          <button
            type="button"
            onClick={handleEmergencyToggle}
            aria-pressed={tempClosed}
            className={`w-full rounded-full px-4 py-2.5 text-sm font-bold transition sm:w-auto ${
              tempClosed
                ? "bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-600 ring-offset-2"
                : "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
            title={tempClosed ? "Click to mark as open (remember to save)" : "Mark store as closed (remember to save)"}
          >
            {tempClosed ? "Re-open store" : "Emergency closed"}
          </button>
        </div>
      </div>

      {tempClosed ? (
        <div className="mt-4 rounded-xl border-2 border-rose-300 bg-rose-50 px-4 py-3">
          <div className="flex items-start gap-2">
            <span className="text-lg">🚫</span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-rose-900">Store is temporarily closed</p>
              <p className="mt-1 text-sm text-rose-700">
                Customers see &quot;Closed now&quot; and cannot place orders. Click &quot;✓ Re-open store&quot; button above to enable ordering again.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {alwaysOpen ? (
        <div className="mt-4 overflow-hidden rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl">
                🕐
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-blue-900">Always Open (24/7)</p>
                <p className="mt-0.5 text-sm text-blue-700">
                  Your store appears as open all the time to customers
                </p>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-blue-300 bg-white px-3 py-2.5">
              <p className="text-xs font-semibold text-blue-900">ℹ️ What this means:</p>
              <ul className="mt-1 space-y-1 text-xs text-blue-800">
                <li>• Customers can order anytime, any day</li>
                <li>• No restrictions on delivery scheduling</li>
                <li>• Perfect for online stores, cloud kitchens & delivery services</li>
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      <ValidatedActionForm
        action={updateRestaurantHoursAction}
        className="mt-4 min-w-0 space-y-3"
        alertHeading="Couldn’t save hours"
        validate={() => validateHoursBeforeSave()}
      >
        <input type="hidden" name="opening_hours" value={serialized} />
        <input type="hidden" name="is_temporarily_closed" value={tempClosed ? "true" : "false"} />

        {/* Save button at the top for quick access */}
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-105 active:scale-[0.99]"
        >
          Save settings
        </button>

        {alwaysOpen ? null : (
        <>
        {/* Mobile: one card per day (dropdown times — native time inputs overflow) */}
        <ul className="min-w-0 space-y-2.5 lg:hidden">
          {rows.map((row) => (
            <li
              key={row.day}
              className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-base font-semibold text-slate-900">{WEEKDAY_LABELS[row.day]}</span>
                <label className="inline-flex shrink-0 items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={row.closed}
                    onChange={(e) => updateDay(row.day, { closed: e.target.checked })}
                    className="h-4 w-4 accent-rose-600"
                  />
                  Closed
                </label>
              </div>
              {row.closed ? (
                <p className="mt-2.5 text-sm text-slate-500">Closed all day</p>
              ) : (
                <div className="mt-3 flex min-w-0 flex-col gap-3">
                  <MobileTimeSelect
                    label="Open"
                    value={row.open}
                    onChange={(open) => updateDay(row.day, { open })}
                  />
                  <MobileTimeSelect
                    label="Close"
                    value={row.close}
                    onChange={(close) => updateDay(row.day, { close })}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Desktop: table */}
        <div className="hidden overflow-x-auto rounded-xl border border-slate-200 lg:block">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2.5">Day</th>
                <th className="px-3 py-2.5">Open</th>
                <th className="px-3 py-2.5">Close</th>
                <th className="px-3 py-2.5">Closed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.day} className="border-t border-slate-100">
                  <td className="px-3 py-2.5 font-medium text-slate-800">{WEEKDAY_LABELS[row.day]}</td>
                  <HoursDayTableCells
                    row={row}
                    onUpdate={(patch) => updateDay(row.day, patch)}
                  />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
        )}
      </ValidatedActionForm>
    </div>
  );
}

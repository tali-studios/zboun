"use client";

import { useMemo, useState, useTransition } from "react";
import {
  DEFAULT_OPENING_HOURS,
  parseOpeningHours,
  serializeOpeningHoursForForm,
  WEEKDAY_LABELS,
  type DayHours,
} from "@/lib/opening-hours";
import {
  toggleTemporaryCloseAction,
  updateRestaurantHoursAction,
} from "@/app-actions/restaurant";

type Props = {
  openingHours: DayHours[];
  isTemporarilyClosed: boolean;
};

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

export function RestaurantHoursPanel({ openingHours, isTemporarilyClosed }: Props) {
  const [hours, setHours] = useState<DayHours[]>(() => parseOpeningHours(openingHours));
  const [tempClosed, setTempClosed] = useState(isTemporarilyClosed);
  const [pendingToggle, startToggle] = useTransition();

  const serialized = useMemo(() => serializeOpeningHoursForForm(hours), [hours]);

  const rows = useMemo(
    () =>
      DEFAULT_OPENING_HOURS.map((fallback) => hours.find((h) => h.day === fallback.day) ?? fallback),
    [hours],
  );

  function updateDay(day: number, patch: Partial<DayHours>) {
    setHours((prev) =>
      prev.map((row) => (row.day === day ? { ...row, ...patch } : row)),
    );
  }

  function handleEmergencyToggle() {
    const next = !tempClosed;
    setTempClosed(next);
    startToggle(async () => {
      await toggleTemporaryCloseAction(next);
    });
  }

  return (
    <div className="panel p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="panel-title">Opening hours</h2>
          <p className="mt-1 text-sm text-slate-500">
            Customers can schedule delivery up to 5 days ahead, only during these hours.
          </p>
        </div>
        <button
          type="button"
          disabled={pendingToggle}
          onClick={handleEmergencyToggle}
          className={`w-full shrink-0 rounded-full px-4 py-2.5 text-sm font-bold transition disabled:opacity-60 sm:w-auto ${
            tempClosed
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
          }`}
        >
          {tempClosed ? "Re-open store" : "Emergency: we're closed"}
        </button>
      </div>

      {tempClosed ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          Your store is marked as <strong>temporarily closed</strong>. Customers will see &quot;Closed now&quot; on the
          home page and cannot place online orders until you re-open.
        </div>
      ) : null}

      <form action={updateRestaurantHoursAction} className="mt-4 space-y-3">
        <input type="hidden" name="opening_hours" value={serialized} />

        {/* Mobile: one card per day */}
        <ul className="space-y-2.5 lg:hidden">
          {rows.map((row) => (
            <li
              key={row.day}
              className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 shadow-sm"
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
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <label className="block min-w-0">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Open
                    </span>
                    <input
                      type="time"
                      value={row.open}
                      onChange={(e) => updateDay(row.day, { open: e.target.value })}
                      className="ui-input w-full min-w-0 py-2.5 text-base"
                    />
                  </label>
                  <label className="block min-w-0">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Close
                    </span>
                    <input
                      type="time"
                      value={row.close}
                      onChange={(e) => updateDay(row.day, { close: e.target.value })}
                      className="ui-input w-full min-w-0 py-2.5 text-base"
                    />
                  </label>
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

        <button type="submit" className="btn btn-primary w-full rounded-full sm:w-auto">
          Save opening hours
        </button>
      </form>
    </div>
  );
}

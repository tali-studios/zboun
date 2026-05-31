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

export function RestaurantHoursPanel({ openingHours, isTemporarilyClosed }: Props) {
  const [hours, setHours] = useState<DayHours[]>(() => parseOpeningHours(openingHours));
  const [tempClosed, setTempClosed] = useState(isTemporarilyClosed);
  const [pendingToggle, startToggle] = useTransition();

  const serialized = useMemo(() => serializeOpeningHoursForForm(hours), [hours]);

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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="panel-title">Opening hours</h2>
          <p className="mt-1 text-sm text-slate-500">
            Customers can schedule delivery up to 5 days ahead, only during these hours.
          </p>
        </div>
        <button
          type="button"
          disabled={pendingToggle}
          onClick={handleEmergencyToggle}
          className={`rounded-full px-4 py-2 text-sm font-bold transition disabled:opacity-60 ${
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

        <div className="overflow-x-auto rounded-xl border border-slate-200">
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
              {DEFAULT_OPENING_HOURS.map((fallback) => {
                const row = hours.find((h) => h.day === fallback.day) ?? fallback;
                return (
                  <tr key={row.day} className="border-t border-slate-100">
                    <td className="px-3 py-2.5 font-medium text-slate-800">{WEEKDAY_LABELS[row.day]}</td>
                    <td className="px-3 py-2.5">
                      <input
                        type="time"
                        value={row.open}
                        disabled={row.closed}
                        onChange={(e) => updateDay(row.day, { open: e.target.value })}
                        className="ui-input py-1.5 text-sm disabled:opacity-50"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="time"
                        value={row.close}
                        disabled={row.closed}
                        onChange={(e) => updateDay(row.day, { close: e.target.value })}
                        className="ui-input py-1.5 text-sm disabled:opacity-50"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <label className="inline-flex items-center gap-2 text-slate-600">
                        <input
                          type="checkbox"
                          checked={row.closed}
                          onChange={(e) => updateDay(row.day, { closed: e.target.checked })}
                          className="h-4 w-4 accent-rose-600"
                        />
                        Closed
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button type="submit" className="btn btn-primary rounded-full">
          Save opening hours
        </button>
      </form>
    </div>
  );
}
